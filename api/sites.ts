// Self-contained version - no imports from src/
import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

function getSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  
  try {
    const intake = req.body;
    const supabase = getSupabaseClient();
    
    // Simplified createMarketplaceDraft logic
    const siteId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const siteToken = `token_${Math.random().toString(36).substr(2, 16)}`;
    
    const draft = {
      siteId,
      siteToken,
      intakeData: intake,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Try to save to Supabase
    const { data, error } = await supabase
      .from('marketplace_intakes')
      .insert([{ 
        site_id: siteId, 
        business_name: intake.businessName,
        business_type: intake.businessType,
        owner_name: intake.ownerName,
        owner_email: intake.ownerEmail,
        draft_data: draft 
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create draft',
      message: error?.message || String(error) 
    });
  }
}
