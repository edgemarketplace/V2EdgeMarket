# Vercel Runtime Topology (Incident: API Surface Interception)

Status
- Live production currently shows deployment-surface interception.
- Evidence: `/api/plain.txt`, `/api/probe`, and `/` return identical SPA HTML fallback.
- Current gate verdict: BLOCK, confidence 0.05, rollbackReason ROUTING_SURFACE_INTERCEPTION.

## Fault Domain
Infra-only until resolved. Do not modify app/runtime logic as a primary response.

## Topology Contract (Expected)
1) Request ownership
- `/` and SPA routes -> static frontend output
- `/api/*` -> Vercel serverless functions in `/api`
- `/api/cron/reconcile` -> serverless function + Vercel cron trigger

2) Function discovery must include
- `api/probe.ts`
- `api/health.ts`
- `api/runtime-info.ts`
- `api/cron/reconcile.ts`

3) Verification truth
- `/api/probe` must return JSON and `x-api-probe: true`
- `/api/*` must not return SPA HTML

## Vercel Config Expectations
- Project Root Directory must include both app and `/api` directory.
- Framework preset must not force SPA-only ownership of `/api/*`.
- Build output must coexist with serverless functions.
- Rewrites must preserve API precedence over SPA fallback.

Current repo config (tracked)
- `vercel.json` has API rewrite before SPA fallback.
- `functions` includes `api/**/*.ts` maxDuration.
- Static sentinel exists at `public/api/plain.txt` for route-ownership tests.

## Required Infra Checks (in order)

1) Project linkage and root
- Confirm Vercel project linked to correct repo.
- Confirm Root Directory points to directory containing `/api`.

2) Framework preset
- Inspect preset: Other vs Vite vs React.
- Ensure preset/build behavior does not collapse `/api/*` into SPA fallback.

3) Build & output
- Confirm build command/output directory expected for this repo.
- Confirm deployment artifact includes function outputs/manifests, not static-only.

4) Function discovery logs
- In deployment logs, verify each required API function is discovered and deployed.

5) Runtime headers and ownership
- Compare headers for `/api/probe`, `/api/plain.txt`, `/`.
- If identical SPA headers/body persist, interception is still active.

## Operator Commands

Local/live checks
- `scripts/check-live-routing-surface.sh https://www.edgemarketplacehub.com`
- `scripts/check-live-api-signature.sh https://www.edgemarketplacehub.com`
- `scripts/deploy-gate.sh https://www.edgemarketplacehub.com production <expected_sha>`

Vercel CLI prerequisites
- `vercel login` (interactive), or set `VERCEL_TOKEN`
- `vercel link` in repo if needed

Useful Vercel CLI inspection (after auth)
- `vercel project ls`
- `vercel project inspect <project-name>`
- `vercel ls`
- `vercel inspect <deployment-url-or-id>`

## Decision Rules

A) If `/api/probe` => JSON + `x-api-probe: true`
- Interception resolved. Continue with runtime endpoint debugging (e.g., cron 500).

B) If `/api/probe` => SPA HTML
- Interception unresolved. Continue infra-only debugging.

C) If `/api/probe` => JSON but missing header
- Investigate alternate route ownership/proxy path.

## Baseline Artifacts
- `docs/deploy-baselines/baseline-invalid-runtime-surface.json`
- (local ignored) `docs/deploy-baselines/baseline-invalid-runtime-surface.log`

Use baseline for post-change delta comparison:
- confidence delta
- incidentClass delta
- routing ownership delta
- probe execution delta
