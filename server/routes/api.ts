import crypto from 'node:crypto';
import { Router } from 'express';
import { generatePageManifest } from '../../src/server/generatePageManifest';
import {
  applyDeploymentEventByDeploymentId,
  createMarketplaceDraft,
  getCapabilities,
  getDeployment,
  getInventory,
  getMarketplaceDraftSnapshot,
  reconcileDeployment,
  replaceInventory,
  requestDeployment,
  saveCheckoutIntent,
  saveLaunchPlan,
  saveMarketplaceDraftSnapshot,
  verifySiteAccess,
} from '../../src/server/siteStore';
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

export default router;
