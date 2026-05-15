import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:inventory');
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

async function readInventory(siteId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { items: [], persisted: false, warning: 'supabase_not_configured' };

  const { data, error } = await supabase
    .from('inventory_items')
    .select('id,name,price,description,category')
    .eq('marketplace_id', siteId)
    .order('created_at', { ascending: true });

  if (error) return { items: [], persisted: false, warning: error.message };

  return {
    items: (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || '',
      category: item.category || '',
      type: 'product',
    })),
    persisted: true,
  };
}

async function replaceInventory(siteId: string, items: any[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return { persisted: false, count: items.length, warning: 'supabase_not_configured' };

  const { error: deleteError } = await supabase.from('inventory_items').delete().eq('marketplace_id', siteId);
  if (deleteError) return { persisted: false, count: items.length, warning: deleteError.message };

  const normalized = items
    .filter((item) => item?.name && String(item.name).trim())
    .map((item) => ({
      marketplace_id: siteId,
      name: String(item.name).trim(),
      price: item.price ? String(item.price).replace('$', '') : null,
      description: item.description || null,
      category: item.category || item.type || null,
    }));

  if (normalized.length > 0) {
    const { error } = await supabase.from('inventory_items').insert(normalized);
    if (error) return { persisted: false, count: items.length, warning: error.message };
  }

  await supabase
    .from('marketplaces')
    .update({ status: normalized.length > 0 ? 'launch_ready' : 'inventory', updated_at: new Date().toISOString() })
    .eq('id', siteId);

  return { persisted: true, count: normalized.length };
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
    const result = await readInventory(siteId);
    return res.status(200).json({ ok: true, siteId, ...result, count: result.items.length });
  }

  if (req.method === 'PUT') {
    const items = req.body?.items || [];
    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, siteId, error: 'items array required' });
    }
    const result = await replaceInventory(siteId, items);
    return res.status(200).json({ ok: true, siteId, ...result });
  }

  return res.status(405).json({ ok: false, siteId, error: `Method ${req.method} not allowed` });
}
