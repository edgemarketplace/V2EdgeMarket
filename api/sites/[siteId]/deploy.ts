import { requestDeployment, saveLaunchPlan, reconcileDeployment } from '../../../src/server/siteStore';

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2];
    
  if (!siteId) { res.status(400).json({ error: 'siteId required' }); return; }
  // TODO: requireSiteAccess check

  if (req.method !== 'POST') {
    res.status(405).json({ error: `Method ${req.method} not allowed` }); return;
  }

  try {
    const payload = req.body;
    const idempotencyKey = `${siteId}:${payload.selectedPlan || 'launch'}:attempt-1`;
    const deployment = await requestDeployment(siteId, payload.selectedPlan, idempotencyKey);
    await saveLaunchPlan(siteId, deployment.plan);
    const reconciled = await reconcileDeployment(siteId);
    res.json(reconciled || deployment);
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
}
