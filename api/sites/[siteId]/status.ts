import { reconcileDeployment, getDeployment, getInventory, getCapabilities } from '../../../../src/server/siteStore';

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2];
  if (!siteId) { res.status(400).json({ error: 'siteId is required.' }); return; }

  if (req.method !== 'GET') {
    res.status(405).json({ error: `Method ${req.method} not allowed.` }); return;
  }

  try {
    const reconciled = await reconcileDeployment(siteId);
    const deployment = reconciled || await getDeployment(siteId);
    const inventory = await getInventory(siteId);
    res.json({ deployment, inventoryCount: inventory.length, capabilities: await getCapabilities() });
  } catch (error) {
    res.status(500).json({ error: error?.message || String(error) });
  }
}
