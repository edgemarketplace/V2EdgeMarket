import { getInventory, replaceInventory } from './server/siteStore';
import type { InventoryItem } from './lib/types';

export const config = { maxDuration: 30 };

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:inventory');
  res.setHeader('content-type', 'application/json; charset=utf-8');
}

function readSiteId(req: any) {
  const value = req.query?.siteId;
  return Array.isArray(value) ? undefined : value;
}

export default async function handler(req: any, res: any) {
  setApiHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  const siteId = readSiteId(req);
  if (!siteId) {
    return res.status(400).json({ ok: false, error: 'siteId required in query params' });
  }

  if (req.method === 'GET') {
    try {
      const items = await getInventory(siteId);
      return res.status(200).json({ ok: true, siteId, items, count: items.length });
    } catch (error: any) {
      return res.status(500).json({ ok: false, siteId, error: error?.message || String(error) });
    }
  }

  if (req.method === 'PUT') {
    try {
      const items = (req.body?.items || []) as InventoryItem[];
      if (!Array.isArray(items)) {
        return res.status(400).json({ ok: false, siteId, error: 'items array required' });
      }
      const result = await replaceInventory(siteId, items);
      return res.status(200).json({ ok: true, siteId, ...result });
    } catch (error: any) {
      return res.status(500).json({ ok: false, siteId, error: error?.message || String(error) });
    }
  }

  return res.status(405).json({ ok: false, siteId, error: `Method ${req.method} not allowed` });
}
