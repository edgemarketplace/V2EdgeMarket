import crypto from 'node:crypto';
import { Router } from 'express';
import { generatePageManifest } from '../../src/server/generatePageManifest';
import {
  applyDeploymentEventByDeploymentId,
  createMarketplaceDraft,
  getCapabilities,
  getDeployment,
  getDeploymentByDeploymentId,
  getInventory,
  getMarketplaceDraftSnapshot,
  reconcileDeployment,
  replaceInventory,
  requestDeployment,
  saveCheckoutIntent,
  saveLaunchPlan,
  saveMarketplaceDraftSnapshot,
  verifySiteAccess,
  markFailed,
  retryDeployment,
  reconcileWithLease,
  findReconcilableDeployments,
  getDeploymentStatusCounts,
} from '../../src/server/siteStore';
import { getDeploymentTimeline, replayDeployment, rebuildStateFromEvents } from '../../src/server/deployment-timeline';
import { setCorrelationContext, clearCorrelationContext, generateCorrelationId } from '../../src/server/structured-logger';
import { InventoryItem, LaunchRequest, MarketplaceIntakeData, MarketplaceSiteDraft } from '../../src/lib/types';

const router = Router();

function readSiteToken(req: any) {
  const headerToken = req.headers['x-site-token'];
  return typeof headerToken === 'string' ? headerToken : undefined;
}

function readIdempotencyKey(req: any, siteId: string, selectedPlan: string) {
  const headerValue = req.headers['x-idempotency-key'];
  if (typeof headerValue === 'string' && headerValue.trim()) return headerValue.trim();

  const bodyValue = req.body?.idempotencyKey;
  if (typeof bodyValue === 'string' && bodyValue.trim()) return bodyValue.trim();

  return `${siteId}:${selectedPlan}:attempt-1`;
}

async function requireSiteAccess(req: any, res: any) {
  const authorized = await verifySiteAccess(req.params.siteId, readSiteToken(req));
  if (!authorized) {
    res.status(403).json({ error: 'Forbidden: valid site token required.' });
    return false;
  }
  return true;
}

function requireWebhookSecret(req: any, res: any) {
  const expectedSecret = process.env.DEPLOYMENT_WEBHOOK_SECRET;
  const suppliedSecret = req.headers['x-deployment-webhook-secret'];

  if (!expectedSecret) {
    res.status(503).json({ error: 'Deployment webhook secret is not configured.' });
    return false;
  }

  if (typeof suppliedSecret !== 'string') {
    res.status(403).json({ error: 'Forbidden: valid deployment webhook secret required.' });
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const suppliedBuffer = Buffer.from(suppliedSecret);
  if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    res.status(403).json({ error: 'Forbidden: valid deployment webhook secret required.' });
    return false;
  }

  return true;
}

// Phase 4: Correlation context middleware — runs on every API request
router.use((req: any, res: any, next: any) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || generateCorrelationId();
  const requestId = (req.headers['x-request-id'] as string) || `req-${correlationId.slice(0, 8)}`;
  res.setHeader('x-runtime-owner', 'express-api-router');
  res.setHeader('x-correlation-id', correlationId);
  setCorrelationContext({
    correlationId,
    requestId,
    siteId: req.params?.siteId,
  });
  // Clear context after response to prevent leaks
  const origEnd = res.end;
  res.end = (...args: any[]) => {
    clearCorrelationContext();
    return origEnd.apply(res, args);
  };
  next();
});

router.get('/health', async (_req, res) => {
  res.json({ status: 'ok', capabilities: await getCapabilities() });
});

router.post('/sites', async (req, res) => {
  try {
    const intake = req.body as MarketplaceIntakeData;
    const draft = await createMarketplaceDraft(intake);
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/sites/:siteId', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }
    res.json({ draft });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.put('/sites/:siteId/draft', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const draft = {
      ...(req.body as MarketplaceSiteDraft),
      siteId: req.params.siteId,
    };
    const result = await saveMarketplaceDraftSnapshot(draft);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/generate-page', async (req, res) => {
  try {
    const intake = req.body as MarketplaceIntakeData;
    const data = await generatePageManifest(intake);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/sites/:siteId/inventory', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const items = await getInventory(req.params.siteId);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.put('/sites/:siteId/inventory', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const items = (req.body.items || []) as InventoryItem[];
    const result = await replaceInventory(req.params.siteId, items);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/sites/:siteId/checkout-intents', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const record = await saveCheckoutIntent(req.params.siteId, req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/sites/:siteId/deploy', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const payload = req.body as LaunchRequest & { idempotencyKey?: string };
    const siteId = req.params.siteId;
    const idempotencyKey = readIdempotencyKey(req, siteId, payload.selectedPlan);

    const deployment = await requestDeployment(siteId, payload.selectedPlan, idempotencyKey);
    await saveLaunchPlan(siteId, deployment.plan);
    const reconciled = await reconcileDeployment(siteId);

    res.json(reconciled || deployment);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/internal/deployments/:deploymentId/events', async (req, res) => {
  try {
    if (!requireWebhookSecret(req, res)) return;

    const requestedStatus = req.body?.status;
    if (typeof requestedStatus !== 'string' || !requestedStatus.trim()) {
      res.status(400).json({ error: 'Webhook payload must include a non-empty status.' });
      return;
    }

    const deployment = await applyDeploymentEventByDeploymentId(req.params.deploymentId, req.body || {});
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found.' });
      return;
    }

    if (deployment.status !== requestedStatus) {
      res.status(409).json({ error: `Invalid deployment transition to ${requestedStatus}.`, deployment });
      return;
    }

    res.json({ deployment });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/sites/:siteId/status', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const reconciled = await reconcileDeployment(req.params.siteId);
    const deployment = reconciled || await getDeployment(req.params.siteId);
    const inventory = await getInventory(req.params.siteId);
    res.json({
      deployment,
      inventoryCount: inventory.length,
      capabilities: await getCapabilities(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Manual reconciliation endpoint for operators
router.post('/internal/reconcile/:siteId', async (req, res) => {
  try {
    // Require webhook secret for operator auth
    if (!requireWebhookSecret(req, res)) return;
    
    const siteId = req.params.siteId;
    const deployment = await reconcileDeployment(siteId);
    
    if (!deployment) {
      res.status(404).json({ error: 'No deployment found for this site.' });
      return;
    }
    
    res.json({ 
      message: 'Reconciliation complete.',
      deployment,
      capabilities: await getCapabilities(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Phase 4: Operational Visibility + Replayability endpoints
// ═══════════════════════════════════════════════════════════════════

// GET /sites/:siteId/timeline — Deployment timeline viewer
router.get('/sites/:siteId/timeline', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const timeline = await getDeploymentTimeline(req.params.siteId);
    if (!timeline) {
      res.status(404).json({ error: 'No deployment found for this site.' });
      return;
    }
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /sites/:siteId/replay — Replay a deployment's lifecycle
router.post('/sites/:siteId/replay', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const result = await replayDeployment(req.params.siteId);
    if (!result) {
      res.status(404).json({ error: 'No deployment found for this site.' });
      return;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /sites/:siteId/rebuild-state — Rebuild canonical state from events
router.get('/sites/:siteId/rebuild-state', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const result = await rebuildStateFromEvents(req.params.siteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /internal/deployments/:deploymentId/fail — Mark deployment as failed
router.post('/internal/deployments/:deploymentId/fail', async (req, res) => {
  try {
    if (!requireWebhookSecret(req, res)) return;
    const { reason, failureStage } = req.body || {};
    if (typeof reason !== 'string' || !reason.trim()) {
      res.status(400).json({ error: 'A non-empty failure reason is required.' });
      return;
    }
    const deployment = await getDeploymentByDeploymentId(req.params.deploymentId);
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found.' });
      return;
    }
    const result = await markFailed(deployment.siteId, reason, failureStage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /sites/:siteId/retry — Retry a failed deployment
router.post('/sites/:siteId/retry', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const result = await retryDeployment(req.params.siteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /internal/deployments/stalled — Find reconcilable deployments
router.get('/internal/deployments/stalled', async (req, res) => {
  try {
    if (!requireWebhookSecret(req, res)) return;
    const stalledMinutes = parseInt(req.query.stalledMinutes as string, 10) || 2;
    const deployments = await findReconcilableDeployments(stalledMinutes);
    res.json({ deployments, count: deployments.length });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /internal/deployments/status-counts — Deployment status distribution
router.get('/internal/deployments/status-counts', async (_req, res) => {
  try {
    const counts = await getDeploymentStatusCounts();
    res.json({ counts });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Workflow state persistence endpoints (Priority 2)
// ═══════════════════════════════════════════════════════════════════

// GET /sites/:siteId/workflow — Get workflow state
router.get('/sites/:siteId/workflow', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }
    res.json({ workflowState: draft.workflowState || null });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// PUT /sites/:siteId/workflow — Update workflow state
router.put('/sites/:siteId/workflow', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }
    const workflowState = req.body?.workflowState;
    if (!workflowState || typeof workflowState !== 'object') {
      res.status(400).json({ error: 'workflowState object is required.' });
      return;
    }
    draft.workflowState = workflowState;
    const result = await saveMarketplaceDraftSnapshot(draft);
    res.json({ workflowState: draft.workflowState, persisted: result.persisted });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Cloudflare Subdomain Automation endpoints (Priority 5)
// ═══════════════════════════════════════════════════════════════════

import { 
  reserveSubdomain as reserveSubdomainLegacy, 
  provisionDnsRecord as provisionDnsRecordLegacy, 
  getSiteSubdomain 
} from '../../src/server/cloudflare';
import { 
  reserveSubdomain, 
  provisionDnsRecord, 
  getProvisioningStatus,
  retryProvisioning,
  markAsActive,
  getSubdomainState 
} from '../../src/server/SubdomainProvisioningService';
import {
  hydrateManifest,
  validateHydrationRequirements,
  persistStorefrontSnapshot,
  getStorefrontSnapshot,
} from '../../src/server/inventoryHydration';

// POST /api/sites/:siteId/reserve-subdomain — Reserve a subdomain (uses new service)
router.post('/sites/:siteId/reserve-subdomain', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }

    const result = await reserveSubdomain(req.params.siteId, draft.intakeData.businessName);
    
    if ('error' in result) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json({ 
      ...result, 
      message: 'Subdomain reserved. Call /provision-dns to create DNS record.' 
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /api/sites/:siteId/subdomain — Get reserved subdomain
router.get('/sites/:siteId/subdomain', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const state = await getSubdomainState(req.params.siteId);
    
    if (!state) {
      res.status(404).json({ error: 'No subdomain reserved for this site.' });
      return;
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /api/sites/:siteId/provision-dns — Provision DNS via Cloudflare (uses new service)
router.post('/sites/:siteId/provision-dns', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const state = await getSubdomainState(req.params.siteId);
    if (!state) {
      res.status(400).json({ error: 'No subdomain reserved. Reserve one first.' });
      return;
    }

    const result = await provisionDnsRecord(state.subdomain);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /api/sites/:siteId/provisioning-status — Get provisioning status (for Launch workflow)
router.get('/sites/:siteId/provisioning-status', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const status = await getProvisioningStatus(req.params.siteId);
    
    if (!status) {
      res.status(404).json({ error: 'No subdomain provisioning in progress.' });
      return;
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /api/sites/:siteId/retry-provisioning — Retry failed DNS provisioning
router.post('/sites/:siteId/retry-provisioning', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const result = await retryProvisioning(req.params.siteId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /api/sites/:siteId/mark-active — Mark provisioning as active (after DNS verification)
router.post('/sites/:siteId/mark-active', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;
    
    const state = await getSubdomainState(req.params.siteId);
    if (!state) {
      res.status(404).json({ error: 'No subdomain found.' });
      return;
    }

    const success = await markAsActive(state.subdomain);
    
    if (!success) {
      res.status(500).json({ error: 'Failed to mark as active.' });
      return;
    }

    res.json({ success: true, status: 'active' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Inventory Hydration endpoints (Priority B)
// ═══════════════════════════════════════════════════════════════════

// GET /api/sites/:siteId/hydration-validation — Validate hydration requirements (for workflow blockers)
router.get('/sites/:siteId/hydration-validation', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }

    const result = await validateHydrationRequirements(req.params.siteId, draft.puckData);
    
    res.json({
      valid: result.valid,
      blockers: result.blockers,
      siteId: req.params.siteId,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /api/sites/:siteId/hydrate-manifest — Hydrate manifest at publish time
router.post('/sites/:siteId/hydrate-manifest', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const draft = await getMarketplaceDraftSnapshot(req.params.siteId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found.' });
      return;
    }

    const result = await hydrateManifest(req.params.siteId, draft.puckData);
    
    res.json({
      success: result.success,
      hydratedManifest: result.hydratedManifest,
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /api/sites/:siteId/snapshots — List storefront snapshots
router.get('/sites/:siteId/snapshots', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({ error: 'Supabase not configured' });
      return;
    }

    const { data, error } = await supabase
      .from('storefront_snapshots')
      .select('snapshot_id, published_at, metadata')
      .eq('site_id', req.params.siteId)
      .order('published_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ snapshots: data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// GET /api/sites/:siteId/snapshots/:snapshotId — Get specific snapshot
router.get('/sites/:siteId/snapshots/:snapshotId', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const snapshot = await getStorefrontSnapshot(req.params.siteId, req.params.snapshotId);
    
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found.' });
      return;
    }

    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// POST /api/sites/:siteId/persist-snapshot — Persist storefront snapshot at publish time
router.post('/sites/:siteId/persist-snapshot', async (req, res) => {
  try {
    if (!(await requireSiteAccess(req, res))) return;

    const { hydratedManifest, inventorySnapshot } = req.body;

    if (!hydratedManifest || !inventorySnapshot) {
      res.status(400).json({ error: 'Missing hydratedManifest or inventorySnapshot in request body.' });
      return;
    }

    const result = await persistStorefrontSnapshot(
      req.params.siteId,
      hydratedManifest,
      inventorySnapshot
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
