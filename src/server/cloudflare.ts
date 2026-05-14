/**
 * Cloudflare Subdomain Automation Module
 * 
 * Handles deterministic subdomain generation, reservation, and DNS provisioning
 * for Edge Marketplace Hub sites.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  domain: string; // e.g., 'edge-marketplace.com'
}

interface SubdomainReservation {
  subdomain: string;
  fullDomain: string;
  siteId: string;
  reservedAt: string;
  status: 'reserved' | 'provisioning' | 'active' | 'failed';
  cloudflareRecordId?: string;
}

/**
 * Get Cloudflare configuration from environment
 */
function getCloudflareConfig(): CloudflareConfig | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const domain = process.env.CLOUDFLARE_DOMAIN || 'edge-marketplace.com';

  if (!apiToken || !zoneId) return null;

  return { apiToken, zoneId, domain };
}

/**
 * Generate a deterministic subdomain from business name
 * Format: {slug}-{random4chars}.domain.com
 */
export function generateSubdomain(businessName: string, siteId: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  // Deterministic short hash from siteId
  const hash = crypto.createHash('sha256').update(siteId).digest('hex').slice(0, 4);

  return `${slug}-${hash}`;
}

/**
 * Check if subdomain is available (not already reserved)
 */
async function isSubdomainAvailable(subdomain: string, domain: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true; // Assume available if no DB

  const { data, error } = await supabase
    .from('subdomain_reservations')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle();

  return !data;
}

/**
 * Reserve a subdomain for a site
 */
export async function reserveSubdomain(
  siteId: string,
  businessName: string
): Promise<SubdomainReservation | { error: string }> {
  const config = getCloudflareConfig();
  const domain = config?.domain || 'edge-marketplace.com';

  let subdomain = generateSubdomain(businessName, siteId);
  const fullDomain = `${subdomain}.${domain}`;

  // Check availability
  let available = await isSubdomainAvailable(subdomain, domain);
  if (!available) {
    // Collision - append extra hash
    const extraHash = crypto.randomBytes(2).toString('hex');
    subdomain = `${subdomain.slice(0, -4)}-${extraHash}`;
    if (!(await isSubdomainAvailable(subdomain, domain))) {
      return { error: 'Subdomain collision - unable to reserve' };
    }
  }

  // Save reservation
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from('subdomain_reservations')
      .insert({
        site_id: siteId,
        subdomain,
        full_domain: fullDomain,
        status: 'reserved',
        reserved_at: new Date().toISOString(),
      });

    if (error) {
      return { error: `Failed to reserve subdomain: ${error.message}` };
    }
  }

  return {
    subdomain,
    fullDomain,
    siteId,
    reservedAt: new Date().toISOString(),
    status: 'reserved',
  };
}

/**
 * Provision DNS record via Cloudflare API
 */
export async function provisionDnsRecord(
  subdomain: string,
  targetIp: string = '76.76.21.21' // Vercel IP
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  const config = getCloudflareConfig();
  if (!config) {
    return { success: false, error: 'Cloudflare not configured' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CNAME',
          name: subdomain,
          content: targetIp,
          proxied: true, // Orange cloud = true
        }),
      }
    );

    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.errors?.[0]?.message || 'Cloudflare API error' 
      };
    }

    // Update reservation with Cloudflare record ID
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('subdomain_reservations')
        .update({ 
          cloudflare_record_id: data.result.id,
          status: 'active',
          provisioned_at: new Date().toISOString(),
        })
        .eq('subdomain', subdomain);
    }

    return { success: true, recordId: data.result.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Get Supabase admin client (internal helper)
 */
function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Get reserved subdomain for a site
 */
export async function getSiteSubdomain(siteId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subdomain_reservations')
    .select('full_domain')
    .eq('site_id', siteId)
    .maybeSingle();

  return data?.full_domain || null;
}
