# Edge Marketplace Hub — Chaos Test Plan

## Phase 3: Deterministic Reconciliation + Operational Safety

### 1. Duplicate deploy clicks → idempotency
**Trigger**: Fire POST /sites/:id/deploy twice with same idempotency key  
**Expect**: Second request returns existing deployment unchanged  
**SQL**: `SELECT deployment_id, status, attempt_count FROM deployments WHERE site_id = $1;`  
→ attempt_count must be 1

### 2. Browser refresh mid-deploy → state continuity  
**Trigger**: GET /sites/:id/status during active deployment  
**Expect**: Returns current state without modifying it  
**SQL**: deployment status unchanged after GET

### 3. Stale editor session → server rehydration  
**Trigger**: PUT /sites/:id/draft after deployment requested  
**Expect**: Draft saved, deployment state unaffected  
**SQL**: deployment_state unchanged in marketplaces table

### 4. Concurrent inventory saves → last-write-wins  
**Trigger**: Two parallel PUT /sites/:id/inventory with different items  
**Expect**: Both succeed, final state is one of the two  
**SQL**: `SELECT COUNT(*) FROM inventory_items WHERE marketplace_id = $1;`

### 5. Cold-start timeout → 30-min stall detection  
**Trigger**: Leave deployment in storefront_building with no webhook  
**Expect**: After 30 min, reconcileDeployment marks it failed  
**SQL**: `SELECT status, failure_reason FROM deployments WHERE site_id = $1;`  
→ status = 'failed', failure_reason = 'timeout'

### 6. Failed deployment recovery → retry with cooldown  
**Trigger**: POST /sites/:id/retry after failed  
**Expect**: If < 5 min since failure → blocked with cooldown message  
If > 5 min → reset to deploy_requested  
**SQL**: `SELECT status, attempt_count FROM deployments WHERE site_id = $1;`

### 7. Interrupted autosave → snapshot recovery  
**Trigger**: Simulate crash during draft save, rehydrate  
**Expect**: draft_snapshot loads correctly from Supabase

### 8. Invalid manifest replay → validation guards  
**Trigger**: POST /internal/deployments/:id/events with invalid status transition  
**Expect**: 409 status, "Invalid deployment transition"  
**SQL**: deployment status unchanged

### 9. Concurrent reconciliation → lease exclusion  
**Trigger**: Start two reconcile workers simultaneously for same site  
**Expect**: One acquires lease, other skips with "Lease held by another worker"  
**SQL**: `SELECT lease_holder FROM deployments WHERE site_id = $1;`

### 10. Lease expiry recovery → auto-cleanup  
**Trigger**: Kill a worker mid-reconciliation (simulate crash)  
**Expect**: After 120s TTL, next cron run acquires the lease and reconciles  
**SQL**: deployment_locks table shows expired lock cleaned up

---

## Phase 4: Operational Visibility + Replayability

### 11. Correlation ID propagation  
**Trigger**: POST /sites/:id/deploy → check all events in history  
**Expect**: Every DeploymentHistoryEntry has a correlationId  
**SQL**: `SELECT history FROM deployments WHERE site_id = $1;`  
→ each history entry has correlationId field

### 12. Timeline endpoint  
**Trigger**: GET /sites/:id/timeline  
**Expect**: Returns chronological steps with elapsed/cumulative timestamps  
**Validation**: steps[0].status = 'deploy_requested', last step matches current status

### 13. Replay without side effects  
**Trigger**: POST /sites/:id/replay  
**Expect**: Returns deterministic path, does NOT modify deployment state  
**SQL**: deployment status and history unchanged after replay

### 14. State divergence detection  
**Trigger**: Manually alter deployment status in DB, then GET /sites/:id/rebuild-state  
**Expect**: matchesCurrentState = false, deterministic = false  
**SQL**: status in deployments table differs from last history entry

### 15. Structured log validation  
**Trigger**: Run reconcile-worker.ts → check stdout  
**Expect**: Every line is valid JSON with event, timestamp, correlationId fields  
**Validation**: `jq '.'` succeeds on every line

### 16. Failure classification coverage  
**Trigger**: Cause each failure type (timeout, medusa error, inventory missing, etc.)  
**Expect**: ClassifiedFailure has correct category and retryable flag  
**Validation**: TIMEOUT → TRANSIENT/retryable, INVENTORY_MISSING → PERMANENT/not retryable

### 17. Cron report structure  
**Trigger**: GET /api/cron/reconcile (or local test)  
**Expect**: Valid CronReport JSON with runId, correlationId, summary, statusCounts  
**Validation**: summary.handled + summary.skipped + summary.errors = summary.total

### 18. Lease logging  
**Trigger**: Run two reconcile workers, check structured logs  
**Expect**: One logs "deployment_lease_acquired" + "deployment_lease_released"  
Other logs "lease held by another worker" in skippedReason

### 19. Replay idempotency  
**Trigger**: POST /sites/:id/replay twice  
**Expect**: Both return identical path and failures array  
**SQL**: no state change between calls

### 20. Cross-correlation tracing  
**Trigger**: Complete deployment lifecycle (intake → inventory → deploy → reconcile → live)  
**Expect**: Single correlationId threads through all events  
**Validation**: Search structured logs by correlationId — all events for that deployment share it
