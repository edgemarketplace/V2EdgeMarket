/**
 * SubdomainProvisioningService
 * 
 * State machine for deterministic subdomain lifecycle:
 * RESERVED → PROVISIONING → ACTIVE (or FAILED)
 * 
 * Integrated into Launch workflow state (not ad hoc frontend logic)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

// State machine types
export type SubdomainStatus = 'reserved' | 'provisioning' | 'active' | 'failed' | 'verifying';

export interface SubdomainState {
  siteId: string;
  subdomain: string;
  fullDomain: string;
  status: SubdomainStatus;
  cloudflareRecordId?: string;
  reservedAt: string;
  provisionedAt?: string;
  verifiedAt?: string;
  lastError?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ProvisioningResult {
  success: boolean;
  state?: SubdomainState;
  error?: string;
  recordId?: string;
}

/**
 * Get Cloudflare configuration from environment
 */
function getCloudflareConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const domain = process.env.CLOUDFLARE_DOMAIN || 'edge-marketplace.com';

  if (!apiToken || !zoneId) return null;

  return { apiToken, zoneId, accountId, domain };
}

/**
 * Generate deterministic subdomain from business name + siteId hash
 * Format: {slug}-{hash4}.domain.com
 */
export function generateSubdomain(businessName: string, siteId: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  const hash = crypto.createHash('sha256').update(siteId).digest('hex').slice(0, 4);
  return `${slug}-${hash}`;
}

/**
 * Get Supabase admin client
 */
function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Get current subdomain state for a site
 */
export async function getSubdomainState(siteId: string): Promise<SubdomainState | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subdomain_reservations')
    .select('*')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    siteId: data.site_id,
    subdomain: data.subdomain,
    fullDomain: data.full_domain,
    status: data.status,
    cloudflareRecordId: data.cloudflare_record_id,
    reservedAt: data.reserved_at,
    provisionedAt: data.provisioned_at,
    verifiedAt: data.verified_at,
    lastError: data.last_error,
    retryCount: data.retry_count || 0,
    maxRetries: data.max_retries || 3,
  };
}

/**
 * Step 1: Reserve subdomain (deterministic + collision-safe)
 */
export async function reserveSubdomain(
  siteId: string,
  businessName: string
): Promise<SubdomainState | { error: string }> {
  const config = getCloudflareConfig();
  const domain = config?.domain || 'edge-marketplace.com';

  let subdomain = generateSubdomain(businessName, siteId);
  let fullDomain = `${subdomain}.${domain}`;

  const supabase = getSupabaseAdmin();
  
  // Check availability with retry for collisions
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: existing } = await supabase
      ?.from('subdomain_reservations')
      .select('subdomain')
      .eq('subdomain', subdomain)
      .maybeSingle() || {};

    if (!existing) break; // Available

    // Collision - append extra hash
    const extraHash = crypto.randomBytes(2).toString('hex');
    subdomain = `${subdomain.slice(0, -4)}-${extraHash}`;
    fullDomain = `${subdomain}.${domain}`;
  }

  // Check again after collision handling
  const { data: finalCheck } = await supabase
    ?.from('subdomain_reservations')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle() || {};

  if (finalCheck) {
    return { error: 'Subdomain collision - unable to reserve after retries' };
  }

  // Save reservation
  if (supabase) {
    const { data, error } = await supabase
      .from('subdomain_reservations')
      .insert({
        site_id: siteId,
        subdomain,
        full_domain: fullDomain,
        status: 'reserved',
        reserved_at: new Date().toISOString(),
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to reserve subdomain: ${error.message}` };
    }

    return {
      siteId,
      subdomain,
      fullDomain,
      status: 'reserved',
      reservedAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    };
  }

  // In-memory fallback (shouldn't happen with Supabase configured)
  return {
    siteId,
    subdomain,
    fullDomain,
    status: 'reserved',
    reservedAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
  };
}

/**
 * Step 2: Provision DNS record via Cloudflare API
 */
export async function provisionDnsRecord(
  subdomain: string,
  targetIp: string = '76.76.21.21' // Vercel IP
): Promise<ProvisioningResult> {
  const config = getCloudflareConfig();
  
  if (!config) {
    return { success: false, error: 'Cloudflare not configured (missing API_TOKEN or ZONE_ID)' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CNAME',
          name: subdomain,
          content: targetIp,
          proxied: true, // Orange cloud = true
          ttl: 1, // Auto TTL
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

    const recordId = data.result.id;

    // Update state in DB
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('subdomain_reservations')
        .update({ 
          cloudflare_record_id: recordId,
          status: 'provisioning',
          provisioned_at: new Date().toISOString(),
        })
        .eq('subdomain', subdomain);
    }

    return { 
      success: true, 
      recordId,
      state: {
        siteId: '',
        subdomain,
        fullDomain: `${subdomain}.${config.domain}`,
        status: 'provisioning',
        cloudflareRecordId: recordId,
        reservedAt: new Date().toISOString(),
        provisionedAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Step 3: Verify DNS propagation
 */
export async function verifyDnsPropagation(fullDomain: string): Promise<boolean> {
  // Simple DNS lookup to verify CNAME is active
  // In production, use a proper DNS lookup library or external service
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const { stdout } = await execPromise(`dig +short ${fullDomain} CNAME`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Step 4: Complete provisioning (mark as active)
 */
export async function markAsActive(subdomain: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from('subdomain_reservations')
    .update({ 
      status: 'active',
      verified_at: new Date().toISOString(),
    })
    .eq('subdomain', subdomain);

  return !error;
}

/**
 * Retry failed provisioning
 */
export async function retryProvisioning(siteId: string): Promise<ProvisioningResult> {
  const state = await getSubdomainState(siteId);
  
  if (!state) {
    return { success: false, error: 'No subdomain reservation found' };
  }

  if (state.retryCount >= state.maxRetries) {
    return { success: false, error: 'Max retries exceeded' };
  }

  // Increment retry count
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase
      .from('subdomain_reservations')
      .update({ 
        retry_count: state.retryCount + 1,
        status: 'provisioning',
        last_error: null,
      })
      .eq('site_id', siteId);
  }

  // Retry DNS provisioning
  return provisionDnsRecord(state.subdomain);
}

/**
 * Get full provisioning status for a site (for Launch workflow integration)
 */
export async function getProvisioningStatus(siteId: string): Promise<{
  status: SubdomainStatus;
  fullDomain?: string;
  error?: string;
  canRetry: boolean;
} | null> {
  const state = await getSubdomainState(siteId);
  if (!state) return null;

  return {
    status: state.status,
    fullDomain: state.fullDomain,
    error: state.lastError,
    canRetry: state.status === 'failed' && state.retryCount < state.maxRetries,
  };
}
