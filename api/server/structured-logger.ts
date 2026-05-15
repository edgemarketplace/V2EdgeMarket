// Phase 4: Structured Logging
// Replaces console.log with typed event payloads for JSON-based observability.

import * as crypto from 'node:crypto';

// ── Correlation context ────────────────────────────────────────────

export interface CorrelationContext {
  correlationId: string;
  requestId?: string;
  leaseHolder?: string;
  reconcileRunId?: string;
  deploymentId?: string;
  siteId?: string;
}

let currentContext: CorrelationContext | null = null;

export function setCorrelationContext(ctx: CorrelationContext): void {
  currentContext = ctx;
}

export function getCorrelationContext(): CorrelationContext {
  if (currentContext) return currentContext;
  // Auto-generate a correlation ID so nothing is ever untraced
  currentContext = { correlationId: crypto.randomUUID() };
  return currentContext;
}

export function clearCorrelationContext(): void {
  currentContext = null;
}

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Run a block of code with a correlation context.
 * Context is automatically cleared after the block completes
 * (success or failure), so it never leaks between requests.
 */
export async function withCorrelationContext<T>(
  ctx: CorrelationContext,
  fn: () => Promise<T>,
): Promise<T> {
  const previous = currentContext;
  setCorrelationContext(ctx);
  try {
    return await fn();
  } finally {
    if (previous) {
      setCorrelationContext(previous);
    } else {
      clearCorrelationContext();
    }
  }
}

// ── Event types ────────────────────────────────────────────────────

export type LogEvent =
  | 'deployment_requested'
  | 'deployment_reconciled'
  | 'deployment_transition'
  | 'deployment_failed'
  | 'deployment_completed'
  | 'deployment_retry'
  | 'deployment_timeout'
  | 'deployment_lease_acquired'
  | 'deployment_lease_released'
  | 'deployment_lease_expired'
  | 'deployment_replay'
  | 'inventory_synced'
  | 'inventory_save'
  | 'checkout_intent_created'
  | 'webhook_received'
  | 'cron_reconcile_start'
  | 'cron_reconcile_complete'
  | 'cron_reconcile_error'
  | 'state_rebuilt'
  | 'state_rebuild_error';

export interface StructuredLogPayload {
  event: LogEvent;
  timestamp?: string;
  correlationId?: string;
  requestId?: string;
  leaseHolder?: string;
  reconcileRunId?: string;
  siteId?: string;
  deploymentId?: string;
  status?: string;
  previousStatus?: string;
  nextStatus?: string;
  durationMs?: number;
  failureCode?: string;
  failureCategory?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface StructuredLogger {
  log(payload: StructuredLogPayload): void;
  error(payload: StructuredLogPayload & { error?: Error | string }): void;
  warn(payload: StructuredLogPayload & { reason?: string }): void;
}

function basePayload(event: LogEvent, overrides?: Partial<StructuredLogPayload>): StructuredLogPayload {
  const ctx = getCorrelationContext();
  return {
    event,
    timestamp: new Date().toISOString(),
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
    leaseHolder: ctx.leaseHolder,
    reconcileRunId: ctx.reconcileRunId,
    siteId: ctx.siteId,
    deploymentId: ctx.deploymentId,
    ...overrides,
  };
}

export const logger: StructuredLogger = {
  log(payload) {
    const entry = { level: 'INFO', ...basePayload(payload.event, payload) };
    process.stdout.write(JSON.stringify(entry) + '\n');
  },
  error(payload) {
    const entry = {
      level: 'ERROR',
      error: payload.error instanceof Error ? payload.error.stack : String(payload.error || ''),
      ...basePayload(payload.event, payload),
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  },
  warn(payload) {
    const entry = {
      level: 'WARN',
      reason: payload.reason || '',
      ...basePayload(payload.event, payload),
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  },
};
