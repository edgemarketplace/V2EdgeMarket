     1|import { getInventory, replaceInventory } from '../../../src/server/siteStore';
     2|import { InventoryItem } from '../../../src/lib/types';
     3|
     4|export const config = {
     5|  maxDuration: 30,
     6|};
     7|
     8|export default async function handler(req) {
     9|  const urlParts = req.url?.split('/') || [];
    10|  const siteId = urlParts[2]; // /api/sites/:siteId/inventory
    11|  
    12|  if (!siteId) {
    13|    res.status(400).json({ error: 'siteId is required.' });
    14|    return;
    15|  }
    16|
    17|  // TODO: Add proper auth check for requireSiteAccess:
    18|
    19|  if (req.method === 'GET') {
    20|    try {
    21|      const items = await getInventory(siteId);
    22|      res.json({ items });
    23|    } catch (error) {
    24|      res.status(500).json({ error: error?.message || String(error) });
    25|    }
    26|  } else if (req.method === 'PUT') {
    27|    try {
    28|      const items = (req.body.items || []) as InventoryItem[];
    29|      const result = await replaceInventory(siteId, items);
    30|      res.json(result);
    31|    } catch (error) {
    32|      res.status(500).json({ error: error?.message || String(error) });
    33|    }
    34|  } else {
    35|    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    36|  }
    37|}
    38|