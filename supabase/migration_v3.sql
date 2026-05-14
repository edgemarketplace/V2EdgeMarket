-- Phase 4: Observability + Correlation IDs
-- Adds correlation columns, deployment_events table, and indexes.
-- Run AFTER migration_v2.sql (or on a fresh schema.sql).

-- ── Add correlation columns to deployments table ──────────────────

ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS correlation_id text,
  ADD COLUMN IF NOT EXISTS lease_holder text,
  ADD COLUMN IF NOT EXISTS reconcile_run_id text;

-- ── Index for finding reconcilable deployments ────────────────────

CREATE INDEX IF NOT EXISTS idx_deployments_status_updated
  ON deployments (status, updated_at)
  WHERE status NOT IN ('live', 'failed');

-- ── Index for correlation ID lookups ─────────────────────────────

CREATE INDEX IF NOT EXISTS idx_deployments_correlation_id
  ON deployments (correlation_id)
  WHERE correlation_id IS NOT NULL;

-- ── deployment_events: append-only event log ─────────────────────
-- Each row is one event in a deployment's lifecycle.
-- This is the canonical source of truth for replay.

CREATE TABLE IF NOT EXISTS deployment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES deployments(deployment_id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES marketplaces(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Event identity
  event text NOT NULL,  -- e.g. 'deploy_requested', 'deployment_failed', etc.
  status text NOT NULL,  -- The SiteLifecycleStatus after this event

  -- Correlation
  correlation_id text,
  request_id text,
  lease_holder text,
  reconcile_run_id text,

  -- Payload
  message text,
  previous_status text,
  duration_ms integer,
  failure_code text,
  failure_category text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ── Indexes for deployment_events ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_deployment_events_deployment
  ON deployment_events (deployment_id, created_at);

CREATE INDEX IF NOT EXISTS idx_deployment_events_site
  ON deployment_events (site_id, created_at);

CREATE INDEX IF NOT EXISTS idx_deployment_events_correlation
  ON deployment_events (correlation_id)
  WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployment_events_reconcile
  ON deployment_events (reconcile_run_id)
  WHERE reconcile_run_id IS NOT NULL;

-- ── Insert event helper ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION insert_deployment_event(
  p_deployment_id uuid,
  p_site_id uuid,
  p_event text,
  p_status text,
  p_correlation_id text DEFAULT NULL,
  p_request_id text DEFAULT NULL,
  p_lease_holder text DEFAULT NULL,
  p_reconcile_run_id text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_previous_status text DEFAULT NULL,
  p_duration_ms integer DEFAULT NULL,
  p_failure_code text DEFAULT NULL,
  p_failure_category text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO deployment_events (
    deployment_id, site_id, event, status,
    correlation_id, request_id, lease_holder, reconcile_run_id,
    message, previous_status, duration_ms, failure_code, failure_category, metadata
  ) VALUES (
    p_deployment_id, p_site_id, p_event, p_status,
    p_correlation_id, p_request_id, p_lease_holder, p_reconcile_run_id,
    p_message, p_previous_status, p_duration_ms, p_failure_code, p_failure_category, p_metadata
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ── V2: deployment_locks table (from Phase 3, included for completeness) ──

CREATE TABLE IF NOT EXISTS deployment_locks (
  deployment_id uuid PRIMARY KEY REFERENCES deployments(deployment_id) ON DELETE CASCADE,
  lease_holder text NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deployment_locks_expires
  ON deployment_locks (expires_at);

CREATE OR REPLACE FUNCTION try_acquire_deployment_lock(
  p_deployment_id uuid,
  p_lease_holder text,
  p_ttl_seconds integer DEFAULT 120
) RETURNS boolean AS $$
DECLARE
  v_expires_at timestamptz;
BEGIN
  v_expires_at := now() + (p_ttl_seconds || ' seconds')::interval;

  -- Clean expired locks
  DELETE FROM deployment_locks WHERE expires_at < now();

  -- Try insert; if it conflicts, lock is held
  INSERT INTO deployment_locks (deployment_id, lease_holder, locked_at, expires_at)
  VALUES (p_deployment_id, p_lease_holder, now(), v_expires_at)
  ON CONFLICT (deployment_id) DO NOTHING;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_deployment_lock(
  p_deployment_id uuid,
  p_lease_holder text
) RETURNS boolean AS $$
BEGIN
  DELETE FROM deployment_locks
  WHERE deployment_id = p_deployment_id
    AND lease_holder = p_lease_holder;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_reconcilable_deployments(
  p_stalled_minutes integer DEFAULT 2
) RETURNS SETOF deployments AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM deployments d
  WHERE d.status NOT IN ('live', 'failed')
    AND d.updated_at < now() - (p_stalled_minutes || ' minutes')::interval
  ORDER BY d.updated_at ASC
  LIMIT 25;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deployment_status_counts()
RETURNS TABLE (status text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT d.status, COUNT(*)::bigint
  FROM deployments d
  GROUP BY d.status
  ORDER BY d.status;
END;
$$ LANGUAGE plpgsql;
