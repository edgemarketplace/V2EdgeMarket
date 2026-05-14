# Production Routing Test Matrix (Phase 5A)

Run these checks against the live domain after each deploy.

Base URL: `https://www.edgemarketplacehub.com`

## 1) API isolation (must return JSON, never SPA HTML)

### Health
- Request: `GET /api/health`
- Expect:
  - HTTP 200
  - `content-type` includes `application/json`
  - body shape: `{ status: 'ok', capabilities: { ... } }`

### Site creation
- Request: `POST /api/sites`
- Body: valid `MarketplaceIntakeData`
- Expect:
  - HTTP 201
  - body includes `siteId`, `siteToken`, `slug`

### Deploy request
- Request: `POST /api/sites/:siteId/deploy`
- Headers: `x-site-token`, `x-idempotency-key`
- Expect:
  - HTTP 200
  - deployment object with status in lifecycle enum
  - history appended

### Status / reconciliation
- Request: `GET /api/sites/:siteId/status`
- Headers: `x-site-token`
- Expect:
  - HTTP 200
  - `{ deployment, inventoryCount, capabilities }`
  - status reflects reconciled state

### Timeline + replay
- Request: `GET /api/sites/:siteId/timeline`
- Headers: `x-site-token`
- Expect: HTTP 200 + timeline data

- Request: `POST /api/sites/:siteId/replay`
- Headers: `x-site-token`
- Expect: HTTP 200 + replay result

### Cron reconcile endpoint
- Request: `GET /api/cron/reconcile`
- Expect:
  - HTTP 200
  - JSON report (`runId`, `summary`, `statusCounts`, `capabilities`)

## 2) SPA routing still works

- Request: `GET /`
- Expect: HTML app shell

- Request: `GET /onboarding`
- Expect: HTML app shell (client route)

- Request: `GET /editor`
- Expect: HTML app shell (client route)

## 3) HTML leakage guard

For all `/api/*` endpoints above:
- Response body must NOT contain `<html`, `<!doctype`, or `<script type="module"`.

## 4) Smoke command examples

```bash
curl -i https://www.edgemarketplacehub.com/api/health
curl -i https://www.edgemarketplacehub.com/api/cron/reconcile
```

If either returns HTML, treat as production incident and rollback/fix rewrites immediately.
