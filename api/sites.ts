export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  
  try {
    // Try dynamic import to see actual error
    const { createMarketplaceDraft } = await import('../src/server/siteStore');
    const draft = await createMarketplaceDraft(req.body);
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ 
      error: 'Import/execution failed', 
      message: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    });
  }
}
