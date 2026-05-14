#!/usr/bin/env tsx
// Phase 4: Standalone Reconcile Worker
// CLI-runnable: npx tsx scripts/reconcile-worker.ts
// Same logic as api/cron/reconcile.ts but local.
// Useful for debugging, manual ops, and testing.

import crypto from 'node:crypto';
import 'dotenv/config';

async function main() {
  // Dynamic imports so path aliases resolve
  const { setCorrelationContext, clearCorrelationContext, logger } =
    await import('../src/server/structured-logger');
  const {
    findReconcilableDeployments,
    reconcileWithLease,
    getDeploymentStatusCounts,
  } = await import('../src/server/siteStore');

  const runId = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  const leaseHolder = `cli-${runId.slice(0, 8)}`;
  const STALLED_MINUTES = 2;

  setCorrelationContext({
    correlationId,
    requestId: `cli-${runId.slice(0, 8)}`,
    leaseHolder,
    reconcileRunId: runId,
  });

  logger.log({
    event: 'cron_reconcile_start',
    reconcileRunId: runId,
    leaseHolder,
    message: `[CLI] Reconciliation worker ${runId} starting.`,
  });

  try {
    const candidates = await findReconcilableDeployments(STALLED_MINUTES);

    console.log(
      `\n  Found ${candidates.length} reconcilable deployment(s).\n`,
    );

    let handled = 0;
    let skipped = 0;
    let errors = 0;

    for (const deployment of candidates) {
      const prevStatus = deployment.status;
      const label = `  ${deployment.siteId.slice(0, 8)} (${prevStatus})`;

      try {
        const result = await reconcileWithLease(
          deployment.siteId,
          leaseHolder,
        );

        if (result.handled) {
          handled++;
          console.log(
            `  ✓ ${label} → ${result.status} (${result.eventCount} events)`,
          );
        } else {
          skipped++;
          console.log(`  — ${label} — lease held by another worker`);
        }
      } catch (error) {
        errors++;
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ ${label} — ${msg}`);
      }
    }

    const statusCounts = await getDeploymentStatusCounts();

    console.log(`\n  Summary: ${handled} handled, ${skipped} skipped, ${errors} errors`);
    console.log(`  Status counts:`);
    for (const { status, count } of statusCounts) {
      console.log(`    ${status.padEnd(22)} ${count}`);
    }
    console.log('');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n  Fatal: ${msg}\n`);
    logger.error({
      event: 'cron_reconcile_error',
      reconcileRunId: runId,
      message: msg,
      error,
    });
  } finally {
    clearCorrelationContext();
  }
}

main();
