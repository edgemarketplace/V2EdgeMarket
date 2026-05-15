import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { siteId } = req.query;
  
  if (!siteId || Array.isArray(siteId)) {
    return res.status(400).json({ error: 'siteId required in query params' });
  }
  
  return res.status(200).json({
    ok: true,
    siteId,
    workflow: { step: 'draft', status: 'pending' },
    message: 'Workflow endpoint (flat route with query param)'
  });
}
