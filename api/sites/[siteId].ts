import { getMarketplaceDraftSnapshot, saveMarketplaceDraftSnapshot } from '../../src/server/siteStore';
import { MarketplaceSiteDraft } from '../../src/lib/types';

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  const urlParts = req.url?.split('/') || [];
  const siteId = urlParts[2]; // /api/sites/:siteId
  
  if (!siteId) {
    res.status(400).json({ error: 'siteId is required.' });
    return;
  }

  // TODO: Add proper auth check for requireSiteAccess

  if (req.method === 'GET') {
    try {
      const draft = await getMarketplaceDraftSnapshot(siteId);
      if (!draft) {
        res.status(404).json({ error: 'Draft not found.' });
        return;
      }
      res.json({ draft });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else if (req.method === 'PUT') {
    try {
      const draft = {
        ...(req.body as MarketplaceSiteDraft),
        siteId,
      };
      const result = await saveMarketplaceDraftSnapshot(draft);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
