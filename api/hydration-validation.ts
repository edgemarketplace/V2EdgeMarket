import { getInventory, getMarketplaceDraftSnapshot } from './server/siteStore';

export const config = { maxDuration: 30 };

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:hydration-validation');
  res.setHeader('content-type', 'application/json; charset=utf-8');
}

function readSiteId(req: any) {
  const value = req.query?.siteId;
  return Array.isArray(value) ? undefined : value;
}

function collectBlocks(node: any): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(collectBlocks);
  if (typeof node !== 'object') return [];

  const current = node.type ? [node] : [];
  const childValues = ['content', 'children', 'zones']
    .flatMap((key) => collectBlocks(node[key]));
  return [...current, ...childValues];
}

export default async function handler(req: any, res: any) {
  setApiHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
  }

  const siteId = readSiteId(req);
  if (!siteId) {
    return res.status(400).json({ ok: false, error: 'siteId required in query params' });
  }

  try {
    const [draft, inventory] = await Promise.all([
      getMarketplaceDraftSnapshot(siteId),
      getInventory(siteId),
    ]);

    const manifest = req.body?.manifest || req.body?.puckData || draft?.puckData || draft?.editorData;
    const blocks = collectBlocks(manifest);
    const inventoryBoundBlocks = blocks.filter((block) => block?.props?.dataSource === 'inventory');
    const blockers: string[] = [];

    if (inventoryBoundBlocks.length > 0 && inventory.length === 0) {
      blockers.push('Inventory-bound storefront sections need at least one inventory item before launch.');
    }

    return res.status(200).json({
      ok: true,
      siteId,
      blockers,
      inventoryCount: inventory.length,
      inventoryBoundBlockCount: inventoryBoundBlocks.length,
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, siteId, blockers: [], error: error?.message || String(error) });
  }
}
