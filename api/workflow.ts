import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

const defaultWorkflowState = {
  currentStep: 'editor',
  completedSteps: [],
  blockedReasons: [],
};

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:workflow');
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

async function readDraftSnapshot(siteId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('marketplaces')
    .select('draft_snapshot')
    .eq('id', siteId)
    .maybeSingle();

  if (error) throw error;
  return data?.draft_snapshot || null;
}

async function writeWorkflowState(siteId: string, workflowState: any) {
  const supabase = getSupabaseClient();
  if (!supabase) return { persisted: false, reason: 'supabase_not_configured' };

  const existingDraft = await readDraftSnapshot(siteId).catch(() => null);
  const nextDraft = {
    ...(existingDraft || { siteId }),
    siteId,
    workflowState,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('marketplaces')
    .update({ draft_snapshot: nextDraft, updated_at: new Date().toISOString() })
    .eq('id', siteId);

  if (error) return { persisted: false, reason: error.message };
  return { persisted: true };
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
      const draft = await readDraftSnapshot(siteId);
      const workflowState = draft?.workflowState || defaultWorkflowState;
      return res.status(200).json({ ok: true, siteId, workflowState, workflow: workflowState });
    } catch (error: any) {
      return res.status(200).json({
        ok: true,
        siteId,
        workflowState: defaultWorkflowState,
        workflow: defaultWorkflowState,
        persisted: false,
        warning: error?.message || String(error),
      });
    }
  }

  if (req.method === 'PUT') {
    const workflowState = req.body?.workflowState || req.body?.workflow;
    if (!workflowState || typeof workflowState !== 'object') {
      return res.status(400).json({ ok: false, siteId, error: 'workflowState object required' });
    }

    const nextWorkflowState = {
      ...workflowState,
      lastTransitionAt: workflowState.lastTransitionAt || new Date().toISOString(),
    };
    const result = await writeWorkflowState(siteId, nextWorkflowState);
    return res.status(200).json({
      ok: true,
      siteId,
      workflowState: nextWorkflowState,
      workflow: nextWorkflowState,
      ...result,
    });
  }

  return res.status(405).json({ ok: false, siteId, error: `Method ${req.method} not allowed` });
}
