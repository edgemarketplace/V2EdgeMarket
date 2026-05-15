// Phase 4: Deployment Timeline Viewer + Replay Tooling
// Per-deployment timeline with timestamps + state reconstruction from events.

import crypto from 'node:crypto';
import { getDeployment, saveDeployment } from './siteStore';
import {
  DeploymentHistoryEntry,
  DeploymentRecord,
  SiteLifecycleStatus,
} from '../lib/types';
import { ClassifiedFailure, classifyFailure, FailureCode } from '../lib/failure-classification';
import { logger, CorrelationContext, generateCorrelationId, withCorrelationContext } from './structured-logger';

// ── Timeline types ─────────────────────────────────────────────────

export interface TimelineStep {
  seq: number;
  status: SiteLifecycleStatus;
  message: string;
  at: string; // ISO timestamp
  source: 'request' | 'reconciler' | 'webhook' | 'system';
  /** Duration in ms from previous step */
  elapsedFromPreviousMs: number;
  /** Cumulative duration in ms from deploy_requested */
  cumulativeMs: number;
  /** Classified failure, if this step is 'failed' */
  failure?: ClassifiedFailure;
}

export interface DeploymentTimeline {
  deploymentId: string;
  siteId: string;
  plan: string;
  currentStatus: SiteLifecycleStatus;
  /** Total duration from first event to now (or terminal) */
  totalDurationMs: number;
  steps: TimelineStep[];
  correlationIds: string[];
  replayAvailable: boolean;
}

export interface ReplayResult {
  deploymentId: string;
  replayedState: SiteLifecycleStatus;
  /** The deterministic path taken */
  path: TimelineStep[];
  /** Any failures encountered during replay */
  failures: ClassifiedFailure[];
  /** Whether the replayed state matches the current persisted state */
  matchesCurrentState: boolean;
  /** The current persisted state for comparison */
  currentState: SiteLifecycleStatus;
}

// ── Timeline builder ───────────────────────────────────────────────

function buildTimelineSteps(history: DeploymentHistoryEntry[]): TimelineStep[] {
  if (!history?.length) return [];

  // Sort by timestamp
  const sorted = [...history].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  const startTime = new Date(sorted[0].at).getTime();
  const steps: TimelineStep[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const entryTime = new Date(entry.at).getTime();
    const prevTime = i > 0 ? new Date(sorted[i - 1].at).getTime() : entryTime;

    const step: TimelineStep = {
      seq: i + 1,
      status: entry.status,
      message: entry.message,
      at: entry.at,
      source: entry.source,
      elapsedFromPreviousMs: entryTime - prevTime,
      cumulativeMs: entryTime - startTime,
    };

    // Attach failure classification if this step is a failure
    if (entry.status === 'failed') {
      step.failure = classifyFailure(entry.message);
    }

    steps.push(step);
  }

  return steps;
}

// ── Timeline viewer ────────────────────────────────────────────────

export async function getDeploymentTimeline(
  deploymentIdOrSiteId: string,
): Promise<DeploymentTimeline | null> {
  const deployment = await getDeploymentByAnyId(deploymentIdOrSiteId);
  if (!deployment) return null;

  const steps = buildTimelineSteps(deployment.history);
  const totalDurationMs =
    steps.length > 0
      ? Date.now() - new Date(steps[0].at).getTime()
      : 0;

  // Extract unique correlation IDs from history (if stored in metadata)
  const correlationIds: string[] = [];

  return {
    deploymentId: deployment.deploymentId,
    siteId: deployment.siteId,
    plan: deployment.plan,
    currentStatus: deployment.status,
    totalDurationMs,
    steps,
    correlationIds,
    replayAvailable: steps.length >= 2,
  };
}

async function getDeploymentByAnyId(
  deploymentOrSiteId: string,
): Promise<DeploymentRecord | null> {
  // Try as siteId first (most common path)
  const bySite = await getDeployment(deploymentOrSiteId);
  if (bySite) return bySite;

  // Try as deploymentId
  const { getDeploymentByDeploymentId } = await import('./siteStore');
  return getDeploymentByDeploymentId(deploymentOrSiteId);
}

// ── Replay tooling ─────────────────────────────────────────────────

/**
 * Replay a deployment's lifecycle from its event history.
 * Returns every state transition in deterministic order.
 * This is the debugging superpower — see exactly what happened.
 */
export async function replayDeployment(
  siteId: string,
): Promise<ReplayResult | null> {
  const startTime = Date.now();
  const replayCorrelationId = generateCorrelationId();
  const ctx: CorrelationContext = {
    correlationId: replayCorrelationId,
    requestId: `replay-${replayCorrelationId.slice(0, 8)}`,
    siteId,
  };

  return withCorrelationContext(ctx, async () => {
    const deployment = await getDeployment(siteId);
    if (!deployment) return null;

    const history = [...deployment.history].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );

    // Simulate every transition
    const path: TimelineStep[] = [];
    const failures: ClassifiedFailure[] = [];
    let lastStatus: SiteLifecycleStatus | null = null;
    const start = new Date(history[0]?.at || deployment.requestedAt).getTime();

    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const entryTime = new Date(entry.at).getTime();

      path.push({
        seq: i + 1,
        status: entry.status,
        message: entry.message,
        at: entry.at,
        source: entry.source,
        elapsedFromPreviousMs: i > 0 ? entryTime - new Date(history[i - 1].at).getTime() : 0,
        cumulativeMs: entryTime - start,
        failure: entry.status === 'failed' ? classifyFailure(entry.message) : undefined,
      });

      if (entry.status === 'failed' && entry.message) {
        failures.push(classifyFailure(entry.message));
      }

      lastStatus = entry.status;
    }

    const replayedState = lastStatus || deployment.status;
    const matchesCurrentState = replayedState === deployment.status;

    logger.log({
      event: 'deployment_replay',
      siteId: deployment.siteId,
      deploymentId: deployment.deploymentId,
      status: replayedState,
      durationMs: Date.now() - startTime,
      message: `Replay complete: ${path.length} steps, ${failures.length} failures. ${matchesCurrentState ? 'MATCHES current state.' : 'DIVERGES from current state.'}`,
      metadata: {
        pathLength: path.length,
        failureCount: failures.length,
        matchesCurrentState,
        currentPersistedState: deployment.status,
      },
    });

    return {
      deploymentId: deployment.deploymentId,
      replayedState,
      path,
      failures,
      matchesCurrentState,
      currentState: deployment.status,
    };
  });
}

/**
 * Rebuild the canonical state from events alone.
 * This is the ultimate test of event sourcing — if the state
 * can be rebuilt deterministically, the log IS the source of truth.
 */
export async function rebuildStateFromEvents(
  siteId: string,
): Promise<{
  derivedState: SiteLifecycleStatus;
  derivedHistory: DeploymentHistoryEntry[];
  matchesCurrentState: boolean;
  eventCount: number;
  deterministic: boolean;
}> {
  const deployment = await getDeployment(siteId);
  if (!deployment) {
    return {
      derivedState: 'draft',
      derivedHistory: [],
      matchesCurrentState: false,
      eventCount: 0,
      deterministic: true,
    };
  }

  const history = [...deployment.history].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  if (history.length === 0) {
    return {
      derivedState: deployment.status,
      derivedHistory: [],
      matchesCurrentState: true,
      eventCount: 0,
      deterministic: true,
    };
  }

  // The last event's status IS the derived state
  const derivedState = history[history.length - 1].status;
  const matchesCurrentState = derivedState === deployment.status;

  logger.log({
    event: 'state_rebuilt',
    siteId,
    deploymentId: deployment.deploymentId,
    status: derivedState,
    message: `State rebuilt from ${history.length} events. ${matchesCurrentState ? 'MATCHES' : 'DIVERGES'} from persisted state.`,
    metadata: {
      eventCount: history.length,
      matchesCurrentState,
      persistedState: deployment.status,
    },
  });

  return {
    derivedState,
    derivedHistory: history,
    matchesCurrentState,
    eventCount: history.length,
    deterministic: !matchesCurrentState
      ? false // diverged — likely an external mutation
      : true,
  };
}
