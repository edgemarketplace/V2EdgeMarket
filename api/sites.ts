     1|import { createMarketplaceDraft } from '../src/server/siteStore';
     2|import { MarketplaceIntakeData } from '../src/lib/types';
     3|
     4|export const config = {
     5|  maxDuration: 30,
     6|};
     7|
     8|export default async function handler(req) {
     9|  if (req.method !== 'POST') {
    10|    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    11|    return;
    12|  }
    13|
    14|  try {
    15|    const intake = req.body as MarketplaceIntakeData;
    16|    const draft = await createMarketplaceDraft(intake);
    17|    res.status(201).json(draft);
    18|  } catch (error) {
    19|    res.status(500).json({ error: error?.message || String(error) });
    20|  }
    21|}
    22|