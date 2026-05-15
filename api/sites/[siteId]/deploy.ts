     1|import { requestDeployment, saveLaunchPlan, reconcileDeployment } from '../../../src/server/siteStore';
     2|
     3|export const config = { maxDuration: 60 };
     4|
     5|export default async function handler(req) {
     6|  const urlParts = req.url?.split('/') || [];
     7|  const siteId = urlParts[2];
     8|    
     9|  if (!siteId) { res.status(400).json({ error: 'siteId required' }); return; }
    10|  // TODO: requireSiteAccess check
    11|
    12|  if (req.method !== 'POST') {
    13|    res.status(405).json({ error: `Method ${req.method} not allowed` }); return;
    14|  }
    15|
    16|  try {
    17|    const payload = req.body;
    18|    const idempotencyKey = `${siteId}:${payload.selectedPlan || 'launch'}:attempt-1`;
    19|    const deployment = await requestDeployment(siteId, payload.selectedPlan, idempotencyKey);
    20|    await saveLaunchPlan(siteId, deployment.plan);
    21|    const reconciled = await reconcileDeployment(siteId);
    22|    res.json(reconciled || deployment);
    23|  } catch (e) { res.status(500).json({ error: e?.message || String(e) }); }
    24|}
    25|