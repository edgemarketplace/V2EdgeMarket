#!/usr/bin/env bash
set -euo pipefail

DEPLOY_GATE_VERSION="1"
BASE_URL="${1:-https://www.edgemarketplacehub.com}"
ENVIRONMENT="${2:-production}"
EXPECTED_SHA="${3:-}"

API_CHECK_SCRIPT="$(cd "$(dirname "$0")" && pwd)/check-live-api-signature.sh"
ROUTING_CHECK_SCRIPT="$(cd "$(dirname "$0")" && pwd)/check-live-routing-surface.sh"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

API_LOG="$TMP_DIR/api.log"
ROUTING_LOG="$TMP_DIR/routing.log"
RUNTIME_BODY="$TMP_DIR/runtime.body"
INCIDENTS_FILE="$TMP_DIR/incidents.txt"
WARNINGS_FILE="$TMP_DIR/warnings.txt"
INFO_FILE="$TMP_DIR/info.txt"

: > "$INCIDENTS_FILE"
: > "$WARNINGS_FILE"
: > "$INFO_FILE"

probeExecution="PASS"
htmlLeakage="PASS"
runtimeInfo="PASS"
provenance="SKIP"
cronExecution="PASS"
routingSurface="PASS"

add_unique_line() {
  local file="$1"
  local line="$2"
  grep -Fxq "$line" "$file" 2>/dev/null || echo "$line" >> "$file"
}

run_and_capture() {
  local cmd="$1"
  local log="$2"
  set +e
  bash -lc "$cmd" >"$log" 2>&1
  local ec=$?
  set -e
  return $ec
}

if ! run_and_capture "'$ROUTING_CHECK_SCRIPT' '$BASE_URL'" "$ROUTING_LOG"; then
  routingSurface="FAIL"
  add_unique_line "$INCIDENTS_FILE" "ROUTING_SURFACE_FAILURE"
fi

# Even if script exits 0, fail surface if sentinel/probe look like SPA fallback
if grep -q '=== .*\/api\/plain\.txt ===' "$ROUTING_LOG" && grep -q '=== .*\/api\/probe ===' "$ROUTING_LOG"; then
  if grep -q 'content-type: text/html; charset=utf-8' "$ROUTING_LOG"; then
    routingSurface="FAIL"
    add_unique_line "$INCIDENTS_FILE" "ROUTING_SURFACE_INTERCEPTION"
  fi
fi

if ! run_and_capture "'$API_CHECK_SCRIPT' '$BASE_URL'" "$API_LOG"; then
  if grep -q 'FAIL:HTML_LEAKAGE:' "$API_LOG"; then
    htmlLeakage="FAIL"
    add_unique_line "$INCIDENTS_FILE" "HTML_LEAKAGE"
  fi
  if grep -q 'FAIL:ROUTING_FAILURE:' "$API_LOG"; then
    probeExecution="FAIL"
    add_unique_line "$INCIDENTS_FILE" "ROUTING_FAILURE"
  fi
  if grep -q 'FAIL:HEADER_ASSERTION_FAILURE: /api/probe' "$API_LOG"; then
    probeExecution="FAIL"
    add_unique_line "$INCIDENTS_FILE" "PROBE_HEADER_MISSING"
  fi
  if grep -q 'FAIL:JSON_PARSE_FAILURE: /api/probe' "$API_LOG"; then
    probeExecution="FAIL"
    add_unique_line "$INCIDENTS_FILE" "PROBE_NOT_JSON"
  fi
  if grep -q 'FAIL:RUNTIME_EXCEPTION: /api/cron/reconcile' "$API_LOG"; then
    cronExecution="WARN"
    add_unique_line "$WARNINGS_FILE" "cron reconcile runtime exception"
    add_unique_line "$INCIDENTS_FILE" "RUNTIME_EXCEPTION"
  fi
  if grep -q 'FAIL:LATENCY_FAILURE: /api/cron/reconcile' "$API_LOG"; then
    cronExecution="WARN"
    add_unique_line "$WARNINGS_FILE" "cron reconcile latency exceeded threshold"
    add_unique_line "$INCIDENTS_FILE" "LATENCY_FAILURE"
  fi
  if grep -q 'FAIL:CONTENT_TYPE_FAILURE: /api/runtime-info' "$API_LOG" || grep -q 'FAIL:JSON_PARSE_FAILURE: /api/runtime-info' "$API_LOG"; then
    runtimeInfo="FAIL"
    add_unique_line "$INCIDENTS_FILE" "RUNTIME_INFO_FAILURE"
  fi
fi

# runtime-info + provenance
set +e
curl -sS "$BASE_URL/api/runtime-info" -o "$RUNTIME_BODY"
CURL_EC=$?
set -e
if [[ "$CURL_EC" -ne 0 ]]; then
  runtimeInfo="FAIL"
  add_unique_line "$INCIDENTS_FILE" "RUNTIME_INFO_TRANSPORT_FAILURE"
else
  if ! python3 -m json.tool "$RUNTIME_BODY" >/dev/null 2>&1; then
    runtimeInfo="FAIL"
    add_unique_line "$INCIDENTS_FILE" "RUNTIME_INFO_NOT_JSON"
  else
    runtimeInfo="PASS"
    if [[ -n "$EXPECTED_SHA" ]]; then
      set +e
      python3 - <<PY
import json, sys
expected = "${EXPECTED_SHA}".lower()
with open("$RUNTIME_BODY", "r", encoding="utf-8") as f:
    data = json.load(f)
candidates = []
if isinstance(data, dict):
    for key in ("commitSha", "commit", "sha"):
        if isinstance(data.get(key), str):
            candidates.append(data[key])
    b = data.get("build")
    if isinstance(b, dict):
        for key in ("commitSha", "commit", "sha"):
            if isinstance(b.get(key), str):
                candidates.append(b[key])
ok = any(c.lower().startswith(expected) for c in candidates)
sys.exit(0 if ok else 1)
PY
      sha_ec=$?
      set -e
      if [[ "$sha_ec" -eq 0 ]]; then
        provenance="PASS"
      else
        provenance="FAIL"
        add_unique_line "$INCIDENTS_FILE" "PROVENANCE_MISMATCH"
      fi
    else
      add_unique_line "$INFO_FILE" "expected sha not provided; provenance check skipped"
    fi
  fi
fi

verdict="ALLOW"
if [[ "$probeExecution" == "FAIL" || "$htmlLeakage" == "FAIL" || "$runtimeInfo" == "FAIL" || "$routingSurface" == "FAIL" || "$provenance" == "FAIL" ]]; then
  verdict="BLOCK"
fi

if [[ "$verdict" == "BLOCK" && "$probeExecution" == "FAIL" ]]; then
  add_unique_line "$INCIDENTS_FILE" "PROBE_EXECUTION_FAILURE"
fi

GATE_JSON=$(python3 - <<PY
import json
from pathlib import Path

def read_lines(p):
    path = Path(p)
    if not path.exists():
      return []
    return [ln.strip() for ln in path.read_text(encoding='utf-8').splitlines() if ln.strip()]

checks = {
  "probeExecution": "${probeExecution}",
  "htmlLeakage": "${htmlLeakage}",
  "runtimeInfo": "${runtimeInfo}",
  "provenance": "${provenance}",
  "cronExecution": "${cronExecution}",
  "routingSurface": "${routingSurface}"
}

# confidence model v1 (0.00 - 1.00)
weights = {
  "probeExecution": 0.30,
  "routingSurface": 0.25,
  "htmlLeakage": 0.20,
  "runtimeInfo": 0.15,
  "provenance": 0.05,
  "cronExecution": 0.05,
}

score = 0.0
for key, w in weights.items():
  v = checks.get(key, "FAIL")
  if v == "PASS":
    score += w
  elif v == "WARN":
    score += (w * 0.5)
  elif v == "SKIP":
    # neutral partial credit for intentionally skipped checks (e.g., no expected SHA)
    score += (w * 0.5)

confidence = round(score, 2)
if confidence >= 0.90:
  confidence_band = "VERIFIED"
elif confidence >= 0.70:
  confidence_band = "HEALTHY"
elif confidence >= 0.40:
  confidence_band = "DEGRADED"
elif confidence >= 0.10:
  confidence_band = "UNSTABLE"
else:
  confidence_band = "INVALID"

incidents = read_lines("$INCIDENTS_FILE")
critical_incidents = {"ROUTING_SURFACE_INTERCEPTION", "ROUTING_FAILURE", "HTML_LEAKAGE", "PROBE_EXECUTION_FAILURE", "PROVENANCE_MISMATCH"}
if any(i in critical_incidents for i in incidents):
  incident_severity = "critical"
elif incidents:
  incident_severity = "high"
else:
  incident_severity = "none"

rollback_recommended = (confidence < 0.20 and incident_severity == "critical")

rollback_reason = ""
if rollback_recommended:
  priority = [
    "ROUTING_SURFACE_INTERCEPTION",
    "ROUTING_FAILURE",
    "HTML_LEAKAGE",
    "PROVENANCE_MISMATCH",
    "PROBE_EXECUTION_FAILURE",
  ]
  for code in priority:
    if code in incidents:
      rollback_reason = code
      break
  if not rollback_reason:
    rollback_reason = incidents[0] if incidents else "CRITICAL_FAILURE"

out = {
  "schemaVersion": "1.2.0",
  "deployGateVersion": "${DEPLOY_GATE_VERSION}",
  "deploymentVerdict": "${verdict}",
  "deploymentConfidence": confidence,
  "confidenceBand": confidence_band,
  "incidentSeverity": incident_severity,
  "rollbackRecommended": rollback_recommended,
  "rollbackReason": rollback_reason,
  "environment": "${ENVIRONMENT}",
  "baseUrl": "${BASE_URL}",
  "deploymentId": "${DEPLOYMENT_ID:-}",
  "gateRunId": "${GATE_RUN_ID:-}",
  "checks": checks,
  "incidentClass": incidents,
  "warnings": read_lines("$WARNINGS_FILE"),
  "info": read_lines("$INFO_FILE")
}
print(json.dumps(out, indent=2))
PY
)

echo "$GATE_JSON"

if [[ -n "${GATE_JSON_OUT:-}" ]]; then
  printf '%s\n' "$GATE_JSON" > "$GATE_JSON_OUT"
fi

printf '\n--- check-live-routing-surface.sh ---\n'
cat "$ROUTING_LOG" || true
printf '\n--- check-live-api-signature.sh ---\n'
cat "$API_LOG" || true

if [[ "$verdict" == "BLOCK" ]]; then
  exit 1
fi
