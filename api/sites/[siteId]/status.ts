     1|import { reconcileDeployment, getDeployment, getInventory, getCapabilities } from '../../../src/server/siteStore';
     2|
     3|export const config = { maxDuration: 30 };
     4|
     5|export default async function handler(req) {
     6|  const urlParts = req.url?.split('/') || [];
     7|  const siteId = urlParts[2];
     8|  
     9|  if (!siteId) { res.status(400).json({ error: 'siteId required' }); return; }
    10|  // TODO: requireSiteAccess check
    11|
    12|  if (req.method !== 'GET') {
    13|    res.status(405).json({ error: `Method ${req.method} not allowed` }); return;
    14|  }
    15|
    16|  try {
    17|    const reconciled = await reconcileDeployment(siteId);
    18|    const deployment = reconciled || await getDeployment(siteId);
    19|    const inventory = await getInventory(siteId);
    20|    res.json({ deployment, inventoryCount: inventory.length, capabilities: await getCapabilities() });
    21|  } catch (e) { res.status(500).json({ error: e?.message || String(e) }); }
    22|}
    23|