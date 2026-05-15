import { getMarketplaceDraftSnapshot, saveMarketplaceDraftSnapshot } from '../../../../src/server/siteStore';

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2];
  if (!siteId) { res.status(400).json({ error: 'siteId is required.' }); return; }

  if (req.method === 'GET') {
    try {
      const draft = await getMarketplaceDraftSnapshot(siteId);
      if (!draft) { res.status(404).json({ error: 'Draft not found.' }); return; }
      res.json({ workflowState: draft.workflowState || null });
    } catch (error) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else if (req.method === 'PUT') {
    try {
      const draft = await getMarketplaceDraftSnapshot(siteId);
      if (!draft) { res.status(404).json({ error: 'Draft not found.' }); return; }
      const workflowState = req.body?.workflowState;
      if (!workflowState || typeof workflowState !== 'object') {
        res.status(400).json({ error: 'workflowState object is required.' }); return;
      }
      draft.workflowState = workflowState;
      const result = await saveMarketplaceDraftSnapshot(draft);
      res.json({ workflowState: draft.workflowState, persisted: result.persisted });
    } catch (error) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
