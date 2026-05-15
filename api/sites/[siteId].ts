     1|import { getMarketplaceDraftSnapshot, saveMarketplaceDraftSnapshot } from '../../src/server/siteStore';
     2|import { MarketplaceSiteDraft } from '../../src/lib/types';
     3|
     4|export const config = {
     5|  maxDuration: 30,
     6|};
     7|
     8|export default async function handler(req) {
     9|  const urlParts = req.url?.split('/') || [];
    10|  const siteId = urlParts[2]; // /api/sites/:siteId
    11|  
    12|  if (!siteId) {
    13|    res.status(400).json({ error: 'siteId is required.' });
    14|    return;
    15|  }
    16|
    17|  // TODO: Add proper auth check for requireSiteAccess
    18|
    19|  if (req.method === 'GET') {
    20|    try {
    21|      const draft = await getMarketplaceDraftSnapshot(siteId);
    22|      if (!draft) {
    23|        res.status(404).json({ error: 'Draft not found.' });
    24|        return;
    25|      }
    26|      res.json({ draft });
    27|    } catch (error) {
    28|      res.status(500).json({ error: error?.message || String(error) });
    29|    }
    30|  } else if (req.method === 'PUT') {
    31|    try {
    32|      const draft = {
    33|        ...(req.body as MarketplaceSiteDraft),
    34|        siteId,
    35|      };
    36|      const result = await saveMarketplaceDraftSnapshot(draft);
    37|      res.json(result);
    38|    } catch (error) {
    39|      res.status(500).json({ error: error?.message || String(error) });
    40|    }
    41|  } else {
    42|    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    43|  }
    44|}
    45|