import { createMarketplaceDraft } from '../src/server/siteStore';

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  try {
    const draft = await createMarketplaceDraft(req.body);
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ error: error?.message || String(error) });
  }
}
