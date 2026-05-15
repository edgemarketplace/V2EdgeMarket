import { getInventory, replaceInventory } from '../../../../src/server/siteStore';

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2];
  if (!siteId) { res.status(400).json({ error: 'siteId is required.' }); return; }

  if (req.method === 'GET') {
    try {
      const items = await getInventory(siteId);
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else if (req.method === 'PUT') {
    try {
      const items = req.body.items || [];
      const result = await replaceInventory(siteId, items);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
