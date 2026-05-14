// Phase 4: Vercel Cron Job — Deployment Reconciliation
// Triggered every 2 minutes via vercel.json crons config.
// Finds stalled deployments, reconciles with lease protection,
// and returns a structured JSON report with correlation IDs.

import * as crypto from 'node:crypto';
import {
  findReconcilableDeployments,
  reconcileWithLease,
  getDeploymentStatusCounts,
  getCapabilities,
} from '../../src/server/siteStore';
import {
  setCorrelationContext,
  clearCorrelationContext,
  logger,
} from '../../src/server/structured-logger';
import { classifyFailure } from '../../src/lib/failure-classification';

// Matches vercel.json crons schedule. 2 minutes is a good
// balance between responsiveness and DB pressure.
// Upgrade path: move to queue-triggered reconciliation
// with cron as a safety sweep only.
const STALLED_MINUTES = 2;
const MAX_DEPLOYMENTS_PER_RUN = 25;

interface ReconcileResult {
  deploymentId: string;
  siteId: string;
  handled: boolean;
  previousStatus: string;
  newStatus: string;
  eventCount: number;
  skippedReason?: string;
}

interface CronReport {
  runId: string;
  correlationId: string;
  timestamp: string;
  durationMs: number;
  candidates: ReconcileResult[];
  summary: {
    total: number;
    handled: number;
    skipped: number;
    errors: number;
  };
  statusCounts: { status: string; count: number }[];
  capabilities: {
    supabaseConfigured: boolean;
    medusaConfigured: boolean;
    deploymentWebhookConfigured: boolean;
  };
}

export default async function handler(
  _req: any,
  res: any,
) {
  const startTime = Date.now();
  const runId = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  const leaseHolder = `cron-${process.env.VERCEL_REGION || 'unknown'}-${runId.slice(0, 8)}`;

  // Set correlation context so all downstream operations are traced
  setCorrelationContext({
    correlationId,
    requestId: `cron-${runId.slice(0, 8)}`,
    leaseHolder,
    reconcileRunId: runId,
  });

  logger.log({
    event: 'cron_reconcile_start',
    reconcileRunId: runId,
    leaseHolder,
    message: `Cron reconciliation run ${runId} starting.`,
  });

  try {
    // 1. Find candidates
    const candidates = await findReconcilableDeployments(STALLED_MINUTES);
    const results: ReconcileResult[] = [];
    let handled = 0;
    let skipped = 0;
    let errors = 0;

    logger.log({
      event: 'cron_reconcile_start',
      reconcileRunId: runId,
      message: `Found ${candidates.length} reconcilable deployments.`,
      metadata: { candidateCount: candidates.length },
    });

    // 2. Process each candidate with lease protection
    for (const deployment of candidates.slice(0, MAX_DEPLOYMENTS_PER_RUN)) {
      const previousStatus = deployment.status;

      try {
        const result = await reconcileWithLease(
          deployment.siteId,
          leaseHolder,
        );

        results.push({
          deploymentId: deployment.deploymentId,
          siteId: deployment.siteId,
          handled: result.handled,
          previousStatus,
          newStatus: result.status || previousStatus,
          eventCount: result.eventCount,
          skippedReason: result.handled ? undefined : 'Lease held by another worker.',
        });

        if (result.handled) {
          handled++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        const classification = classifyFailure(
          error instanceof Error ? error.message : String(error),
        );

        logger.error({
          event: 'cron_reconcile_error',
          reconcileRunId: runId,
          siteId: deployment.siteId,
          deploymentId: deployment.deploymentId,
          failureCode: classification.code,
          failureCategory: classification.category,
          message: `Reconciliation failed: ${error instanceof Error ? error.message : String(error)}`,
          error,
        });

        results.push({
          deploymentId: deployment.deploymentId,
          siteId: deployment.siteId,
          handled: false,
          previousStatus,
          newStatus: previousStatus,
          eventCount: 0,
          skippedReason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    // 3. Get status snapshot
    const statusCounts = await getDeploymentStatusCounts();

    // 4. Build report
    const durationMs = Date.now() - startTime;
    const report: CronReport = {
      runId,
      correlationId,
      timestamp: new Date().toISOString(),
      durationMs,
      candidates: results,
      summary: {
        total: results.length,
        handled,
        skipped,
        errors,
      },
      statusCounts,
      capabilities: await getCapabilities(),
    };

    logger.log({
      event: 'cron_reconcile_complete',
      reconcileRunId: runId,
      durationMs,
      message: `Cron run complete: ${handled} handled, ${skipped} skipped, ${errors} errors.`,
      metadata: { handled, skipped, errors, candidateCount: candidates.length },
    });

    // Strip verbose candidate array if successful and quiet
    if (handled === 0 && skipped > 0) {
      res.status(200).json({
        ...report,
        candidates: report.candidates.filter((c) => c.handled || c.skippedReason?.startsWith('Error')),
        summary: report.summary,
        statusCounts: report.statusCounts,
      });
    } else {
      res.status(200).json(report);
    }
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error({
      event: 'cron_reconcile_error',
      reconcileRunId: runId,
      durationMs,
      message: `Cron run failed: ${error instanceof Error ? error.message : String(error)}`,
      error,
    });

    res.status(500).json({
      error: 'Reconciliation cron failed.',
      message: error instanceof Error ? error.message : String(error),
      runId,
      correlationId,
      durationMs,
    });
  } finally {
    clearCorrelationContext();
  }
}
