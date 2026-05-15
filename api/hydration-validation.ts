import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:hydration-validation');
  res.setHeader('content-type', 'application/json; charset=utf-8');
}

function readSiteId(req: any) {
  const value = req.query?.siteId;
  return Array.isArray(value) ? undefined : value;
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function collectBlocks(node: any): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(collectBlocks);
  if (typeof node !== 'object') return [];

  const current = node.type ? [node] : [];
  const childValues = ['content', 'children', 'zones'].flatMap((key) => collectBlocks(node[key]));
  return [...current, ...childValues];
}

async function readInventoryCount(siteId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { count: 0, persisted: false, warning: 'supabase_not_configured' };

  const { count, error } = await supabase
    .from('inventory_items')
    .select('id', { count: 'exact', head: true })
    .eq('marketplace_id', siteId);

  if (error) return { count: 0, persisted: false, warning: error.message };
  return { count: count || 0, persisted: true };
}

async function readDraftManifest(siteId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('marketplaces')
    .select('draft_snapshot')
    .eq('id', siteId)
    .maybeSingle();

  if (error) return null;
  return data?.draft_snapshot?.puckData || data?.draft_snapshot?.editorData || null;
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

  const inventory = await readInventoryCount(siteId);
  const manifest = req.body?.manifest || req.body?.puckData || await readDraftManifest(siteId);
  const blocks = collectBlocks(manifest);
  const inventoryBoundBlocks = blocks.filter((block) => block?.props?.dataSource === 'inventory');
  const blockers: string[] = [];

  if (inventoryBoundBlocks.length > 0 && inventory.count === 0) {
    blockers.push('Inventory-bound storefront sections need at least one inventory item before launch.');
  }

  return res.status(200).json({
    ok: true,
    siteId,
    blockers,
    inventoryCount: inventory.count,
    inventoryBoundBlockCount: inventoryBoundBlocks.length,
    persisted: inventory.persisted,
    warning: inventory.warning,
  });
}
