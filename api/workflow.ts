import { getMarketplaceDraftSnapshot, saveMarketplaceDraftSnapshot } from './server/siteStore';
import type { WorkflowState } from './lib/types';

export const config = { maxDuration: 30 };

function setApiHeaders(res: any) {
  res.setHeader('x-runtime-owner', 'vercel-api:workflow');
  res.setHeader('content-type', 'application/json; charset=utf-8');
}

function readSiteId(req: any) {
  const value = req.query?.siteId;
  return Array.isArray(value) ? undefined : value;
}

const defaultWorkflowState: WorkflowState = {
  currentStep: 'editor',
  completedSteps: [],
  blockedReasons: [],
};

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
      const draft = await getMarketplaceDraftSnapshot(siteId);
      const workflowState = draft?.workflowState || defaultWorkflowState;
      return res.status(200).json({ ok: true, siteId, workflowState, workflow: workflowState });
    } catch (error: any) {
      return res.status(200).json({
        ok: true,
        siteId,
        workflowState: defaultWorkflowState,
        workflow: defaultWorkflowState,
        message: 'Using default workflow state',
        warning: error?.message || String(error),
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const workflowState = req.body?.workflowState || req.body?.workflow;
      if (!workflowState || typeof workflowState !== 'object') {
        return res.status(400).json({ ok: false, error: 'workflowState object required' });
      }

      const draft = await getMarketplaceDraftSnapshot(siteId);
      if (!draft) {
        return res.status(404).json({ ok: false, error: 'Draft not found', siteId });
      }

      draft.workflowState = {
        ...workflowState,
        lastTransitionAt: workflowState.lastTransitionAt || new Date().toISOString(),
      };
      const result = await saveMarketplaceDraftSnapshot(draft);
      return res.status(200).json({
        ok: true,
        siteId,
        workflowState: draft.workflowState,
        workflow: draft.workflowState,
        persisted: result.persisted,
      });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error?.message || String(error), siteId });
    }
  }

  return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
}
