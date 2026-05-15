import { createMarketplaceDraft } from '../src/server/siteStore';
import { MarketplaceIntakeData } from '../src/lib/types';

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const intake = req.body as MarketplaceIntakeData;
    const draft = await createMarketplaceDraft(intake);
    res.status(201).json(draft);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) });
  }
}
