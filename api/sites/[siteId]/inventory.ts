import { getInventory, replaceInventory } from '../../../src/server/siteStore';
import { InventoryItem } from '../../../src/lib/types';

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2]; // /api/sites/:siteId/inventory
  
  if (!siteId) {
    res.status(400).json({ error: 'siteId is required.' });
    return;
  }

  // TODO: Add proper auth check for requireSiteAccess:

  if (req.method === 'GET') {
    try {
      const items = await getInventory(siteId);
      res.json({ items });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else if (req.method === 'PUT') {
    try {
      const items = (req.body.items || []) as InventoryItem[];
      const result = await replaceInventory(siteId, items);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
