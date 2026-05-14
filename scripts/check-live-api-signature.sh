#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://www.edgemarketplacehub.com}"

ENDPOINTS=(
  "/api/probe"
  "/api/health"
  "/api/runtime-info"
  "/api/cron/reconcile"
)

fail=0

allowed_status_for_endpoint() {
  case "$1" in
    "/api/probe") echo "200" ;;
    "/api/health") echo "200" ;;
    "/api/runtime-info") echo "200" ;;
    "/api/cron/reconcile") echo "200,202,401" ;;
    *) echo "200" ;;
  esac
}

shape_expr_for_endpoint() {
  case "$1" in
    "/api/probe") echo "isinstance(data, dict) and data.get('ok') is True" ;;
    "/api/health") echo "isinstance(data, dict) and 'status' in data and 'timestamp' in data" ;;
    "/api/runtime-info") echo "isinstance(data, dict) and 'build' in data and 'runtime' in data" ;;
    "/api/cron/reconcile") echo "isinstance(data, dict)" ;;
    *) echo "isinstance(data, dict)" ;;
  esac
}

expected_header_for_endpoint() {
  case "$1" in
    "/api/probe") echo "x-api-probe:true" ;;
    *) echo "" ;;
  esac
}

print_debug_headers() {
  local ep="$1"
  local headers_file="$2"
  local keys_regex='^(server:|x-powered-by:|x-vercel-cache:|cache-control:|content-length:|age:|via:|x-matched-path:|x-now-route-matches:)'
  echo "DEBUG_HEADERS ${ep}:"
  awk 'BEGIN{IGNORECASE=1} {sub(/\r$/, "", $0); print $0}' "$headers_file" | grep -Ei "$keys_regex" || true
}

max_latency_ms_for_endpoint() {
  case "$1" in
    "/api/probe") echo "1500" ;;
    "/api/health") echo "2500" ;;
    "/api/runtime-info") echo "2500" ;;
    "/api/cron/reconcile") echo "8000" ;;
    *) echo "5000" ;;
  esac
}

contains_status() {
  local status="$1"
  local allowed_csv="$2"
  IFS=',' read -r -a allowed <<< "$allowed_csv"
  for code in "${allowed[@]}"; do
    if [[ "$status" == "$code" ]]; then
      return 0
    fi
  done
  return 1
}

report_fail() {
  local category="$1"
  local endpoint="$2"
  local detail="$3"
  echo "FAIL:${category}: ${endpoint} ${detail}"
}

for ep in "${ENDPOINTS[@]}"; do
  endpoint_fail=0
  url="${BASE_URL}${ep}"
  echo "Checking ${url}"

  headers_file=$(mktemp)
  body_file=$(mktemp)

  curl_exit=0
  latency_sec=$(curl -sS -w '%{time_total}' -D "$headers_file" "$url" -o "$body_file") || curl_exit=$?

  if [[ "$curl_exit" -ne 0 ]]; then
    report_fail "TRANSPORT_FAILURE" "$ep" "curl_exit=${curl_exit}"
    fail=1
    rm -f "$headers_file" "$body_file"
    continue
  fi

  status=$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END{print code}' "$headers_file")
  ctype=$(awk 'BEGIN{IGNORECASE=1} /^content-type:/ {sub(/\r$/, "", $0); print $0}' "$headers_file" | tail -n1)
  print_debug_headers "$ep" "$headers_file"

  latency_ms=$(python3 - <<PY
print(int(float("$latency_sec") * 1000))
PY
)
  max_latency_ms="$(max_latency_ms_for_endpoint "$ep")"

  allowed="$(allowed_status_for_endpoint "$ep")"
  if ! contains_status "$status" "$allowed"; then
    report_fail "STATUS_MISMATCH" "$ep" "status=${status} allowed=${allowed}"
    endpoint_fail=1
    if [[ "$status" == "500" ]]; then
      report_fail "RUNTIME_EXCEPTION" "$ep" "server returned 500"
    fi
  fi

  if ! grep -qi '^content-type:.*application/json' "$headers_file"; then
    report_fail "CONTENT_TYPE_FAILURE" "$ep" "got='${ctype:-<missing>}'"
    endpoint_fail=1
  fi

  expected_header="$(expected_header_for_endpoint "$ep")"
  if [[ -n "$expected_header" ]]; then
    expected_name="${expected_header%%:*}"
    expected_value="${expected_header#*:}"
    if ! awk -v h="$expected_name" -v v="$expected_value" 'BEGIN{IGNORECASE=1;ok=0} {
      line=$0; sub(/\r$/, "", line)
      if (tolower(line) ~ "^" tolower(h) ":[[:space:]]*" tolower(v) "$") ok=1
    } END{exit ok?0:1}' "$headers_file"; then
      report_fail "HEADER_ASSERTION_FAILURE" "$ep" "missing ${expected_name}: ${expected_value}"
      endpoint_fail=1
    fi
  fi

  if grep -qiE '<html|<!doctype|<script type="module"' "$body_file"; then
    report_fail "HTML_LEAKAGE" "$ep" "html markers found in body"
    endpoint_fail=1
    report_fail "ROUTING_FAILURE" "$ep" "likely SPA/static rewrite leakage"
  fi

  if ! python3 -m json.tool "$body_file" >/dev/null 2>&1; then
    report_fail "JSON_PARSE_FAILURE" "$ep" "body is not valid JSON"
    endpoint_fail=1
  else
    shape_expr="$(shape_expr_for_endpoint "$ep")"
    if ! python3 - "$body_file" "$shape_expr" <<'PY'
import json, sys
body_path = sys.argv[1]
expr = sys.argv[2]
with open(body_path, 'r', encoding='utf-8') as f:
    data = json.load(f)
if not eval(expr):
    raise SystemExit(1)
PY
    then
      report_fail "SHAPE_ASSERTION_FAILURE" "$ep" "expression failed"
      endpoint_fail=1
    fi
  fi

  if [[ "$latency_ms" -gt "$max_latency_ms" ]]; then
    report_fail "LATENCY_FAILURE" "$ep" "latency_ms=${latency_ms} threshold_ms=${max_latency_ms}"
    endpoint_fail=1
  else
    echo "LATENCY_OK: ${ep} latency_ms=${latency_ms} threshold_ms=${max_latency_ms}"
  fi

  if [[ "$endpoint_fail" -eq 0 ]]; then
    echo "PASS: ${ep}"
  else
    fail=1
  fi

  rm -f "$headers_file" "$body_file"
  echo

done

if [[ "$fail" -ne 0 ]]; then
  echo "API signature check FAILED"
  exit 1
fi

echo "API signature check PASSED"
