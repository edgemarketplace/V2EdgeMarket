     1|import { getMarketplaceDraftSnapshot, saveMarketplaceDraftSnapshot } from '../../../src/server/siteStore';
     2|
     3|export const config = { maxDuration: 30 };
     4|
     5|export default async function handler(req) {
     6|  const urlParts = req.url?.split('/') || [];
     7|  const siteId = urlParts[2];
     8|  
     9|  if (!siteId) { res.status(400).json({ error: 'siteId required' }); return; }
    10|  // TODO: requireSiteAccess check
    11|
    12|  if (req.method === 'GET') {
    13|    try {
    14|      const draft = await getMarketplaceDraftSnapshot(siteId);
    15|      if (!draft) { res.status(404).json({ error: 'Draft not found' }); return; }
    16|      res.json({ workflowState: draft.workflowState || null });
    17|    } catch (e) { res.status(500).json({ error: e?.message || String(e) }); }
    18|  } else if (req.method === 'PUT') {
    19|    try {
    20|      const draft = await getMarketplaceDraftSnapshot(siteId);
    21|      if (!draft) { res.status(404).json({ error: 'Draft not found' }); return; }
    22|      const workflowState = req.body?.workflowState;
    23|      if (!workflowState || typeof workflowState !== 'object') {
    24|        res.status(400).json({ error: 'workflowState object required' }); return;
    25|      }
    26|      draft.workflowState = workflowState;
    27|      const result = await saveMarketplaceDraftSnapshot(draft);
    28|      res.json({ workflowState: draft.workflowState, persisted: result.persisted });
    29|    } catch (e) { res.status(500).json({ error: e?.message || String(e) }); }
    30|  } else {
    31|    res.status(405).json({ error: `Method ${req.method} not allowed` });
    32|  }
    33|}
    34|