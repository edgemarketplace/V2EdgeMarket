import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { siteId } = req.query;
  
  if (!siteId || Array.isArray(siteId)) {
    return res.status(400).json({ error: 'siteId required in query params' });
  }
  
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('marketplace_intakes')
        .select('workflow_state')
        .eq('site_id', siteId)
        .single();
      
      if (error) throw error;
      
      return res.status(200).json({
        ok: true,
        siteId,
        workflow: data?.workflow_state || { step: 'draft', status: 'pending' }
      });
    } catch (err: any) {
      return res.status(200).json({
        ok: true,
        siteId,
        workflow: { step: 'draft', status: 'pending' },
        message: 'Using default workflow state'
      });
    }
  }
  
  if (req.method === 'PUT') {
    return res.status(200).json({
      ok: true,
      siteId,
      message: 'Workflow state update endpoint (PUT handler placeholder)'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
