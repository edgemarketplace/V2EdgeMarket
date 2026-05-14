# V2EdgeMarket Production Deploy Gate (Routing/API Truth)

Purpose
- Prevent shipping a deployment where `/api/*` is served by SPA HTML fallback.
- Enforce production truth before feature validation.

Blocking rule
- If `/api/probe` is not JSON with `x-api-probe: true`, deployment is FAILED.

## Preconditions (must pass before deploy)

1) Install/build integrity
- `npm ci`
- `npm run lint` (includes `tsc --noEmit`)

2) Required files present
- `api/probe.ts`
- `api/health.ts`
- `api/runtime-info.ts`
- `api/cron/reconcile.ts`
- `vercel.json`
- `scripts/check-live-api-signature.sh`
- `scripts/check-live-routing-surface.sh`
- `public/api/plain.txt`

## Deploy

1) Push commit and deploy to production.
2) Record deployment URL + commit SHA.

## Post-deploy production verification (blocking)

Run against live domain:
- `scripts/check-live-routing-surface.sh https://www.edgemarketplacehub.com`
- `scripts/check-live-api-signature.sh https://www.edgemarketplacehub.com`

### PASS criteria

A. Probe truth
- `GET /api/probe`
  - status: 200
  - `content-type` contains `application/json`
  - header `x-api-probe: true`
  - body includes `{ "ok": true }`

B. No HTML leakage on API routes
- `/api/probe`, `/api/health`, `/api/runtime-info`, `/api/cron/reconcile`
  - response body must NOT contain `<!doctype`, `<html`, or SPA script markers

C. Runtime info provenance
- `GET /api/runtime-info`
  - JSON parseable
  - includes build/runtime metadata
  - commit/sha field matches deployed commit (if exposed)

D. Health contract
- `GET /api/health`
  - JSON parseable
  - includes `status` and `timestamp`

E. Cron route contract
- `GET /api/cron/reconcile`
  - must not return HTML
  - allowed statuses: `200|202|401`
  - status 500 is deployment FAIL until triaged

F. Routing-surface comparison
- `/api/plain.txt` should behave as static file route (not SPA fallback HTML)
- `/api/probe` should behave as function route (JSON + probe header)
- `/` is SPA route
- If all three return same SPA HTML body/headers, deployment FAIL

## Decision tree

1) If `/api/probe` returns HTML or missing probe header
- classify: deployment-surface interception
- stop app-code changes
- inspect Vercel project config + build logs only

2) If `/api/probe` passes but `/api/cron/reconcile` fails with 500
- classify: runtime/application fault in cron path
- debug function runtime and dependencies

3) If probe passes and health/runtime-info pass
- routing/discovery healthy
- proceed to deeper feature/system tests

## Vercel checks (when interception suspected)

1) Build log function discovery
- verify deployed functions list includes:
  - `api/probe.ts`
  - `api/health.ts`
  - `api/runtime-info.ts`
  - `api/cron/reconcile.ts`

2) Project settings
- correct project root directory
- framework preset correctness (`Other` vs `Vite` vs `React`)
- build command/output directory are expected
- no conflicting platform rewrites overriding `/api/*`

3) Cache and edge behavior
- inspect headers: `x-vercel-cache`, `server`, `x-powered-by`, `cache-control`, `content-length`, optional `x-matched-path`
- identical SPA HTML responses across `/`, `/api/probe`, `/api/plain.txt` => interception confirmed

## Rollback criteria

Immediate rollback if any of:
- `/api/probe` not JSON
- missing `x-api-probe: true`
- HTML leakage on API endpoints
- cron endpoint hard 500 post-deploy with no mitigation

## Evidence to capture for incident ticket

- Full output of both scripts
- `curl -i` for `/api/probe`, `/api/plain.txt`, `/api/health`, `/api/runtime-info`, `/api/cron/reconcile`
- deployment ID + commit SHA
- screenshots/snippets from Vercel build function discovery section
- classification tags from verifier:
  - `ROUTING_FAILURE`
  - `HTML_LEAKAGE`
  - `CONTENT_TYPE_FAILURE`
  - `HEADER_ASSERTION_FAILURE`
  - `RUNTIME_EXCEPTION`

## Exit condition to resume feature work

Resume feature/app code changes only after:
- probe + header assertions pass in production
- API routes are JSON/non-HTML by contract
- runtime-info provenance validated
- cron endpoint no longer returns deployment-surface failures
