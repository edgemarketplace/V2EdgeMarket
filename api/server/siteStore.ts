import * as crypto from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CheckoutIntentRecord,
  DeploymentHistoryEntry,
  DeploymentRecord,
  InventoryItem,
  LaunchPlan,
  MarketplaceIntakeData,
  MarketplaceSiteDraft,
  MedusaSyncResult,
  SiteLifecycleStatus,
} from '../lib/types';
import { syncInventoryToMedusa } from './medusa';
import { classifyFailure, FailureCode } from '../lib/failure-classification';
import {
  logger,
  getCorrelationContext,
  generateCorrelationId,
  withCorrelationContext,
  CorrelationContext,
} from './structured-logger';

const memoryInventory = new Map<string, InventoryItem[]>();
const memoryDeployments = new Map<string, DeploymentRecord>();
const memoryCheckout = new Map<string, CheckoutIntentRecord[]>();
const memoryDrafts = new Map<string, MarketplaceSiteDraft>();
const memorySiteTokenHashes = new Map<string, string>();

export interface CapabilitySnapshot {
  supabaseConfigured: boolean;
  medusaConfigured: boolean;
  deploymentWebhookConfigured: boolean;
}

interface ReconcileOptions {
  capabilities?: CapabilitySnapshot;
  syncInventory?: (siteId: string, inventoryItems: InventoryItem[]) => Promise<MedusaSyncResult>;
  now?: () => string;
}

interface DeploymentEventInput {
  status: SiteLifecycleStatus;
  message?: string;
  publishUrl?: string;
  provisioningId?: string;
  vercelDeploymentId?: string;
  failureReason?: string;
}

const ACTIVE_DEPLOYMENT_STATUSES: SiteLifecycleStatus[] = [
  'deploy_requested',
  'provisioning',
  'syncing_inventory',
  'storefront_building',
  'dns_pending',
];

const TERMINAL_DEPLOYMENT_STATUSES: SiteLifecycleStatus[] = ['live', 'failed'];

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildSiteToken() {
  return crypto.randomBytes(24).toString('hex');
}

function nowIso(now?: () => string) {
  return now ? now() : new Date().toISOString();
}

function isActiveDeploymentStatus(status: SiteLifecycleStatus) {
  return ACTIVE_DEPLOYMENT_STATUSES.includes(status);
}

function isTerminalDeploymentStatus(status: SiteLifecycleStatus) {
  return TERMINAL_DEPLOYMENT_STATUSES.includes(status);
}

function historyEntry(
  status: SiteLifecycleStatus,
  message: string,
  source: DeploymentHistoryEntry['source'],
  at = new Date().toISOString(),
): DeploymentHistoryEntry {
  const ctx = getCorrelationContext();
  return {
    status,
    message,
    source,
    at,
    correlationId: ctx.correlationId,
    reconcileRunId: ctx.reconcileRunId,
    leaseHolder: ctx.leaseHolder,
  };
}

function normalizeDraftForStorage(draft: MarketplaceSiteDraft) {
  const { siteToken, ...rest } = draft;
  return rest;
}

function normalizeHistory(history: DeploymentRecord['history'] | undefined, record: Partial<DeploymentRecord>) {
  if (history?.length) return history;
  return [
    historyEntry(
      (record.status as SiteLifecycleStatus) || 'deploy_requested',
      record.message || 'Deployment record created.',
      'system',
      record.requestedAt || new Date().toISOString(),
    ),
  ];
}

function normalizeDeploymentRecord(record: Partial<DeploymentRecord> & Pick<DeploymentRecord, 'siteId' | 'plan' | 'status'>): DeploymentRecord {
  const requestedAt = record.requestedAt || new Date().toISOString();
  const updatedAt = record.updatedAt || requestedAt;
  const deploymentId = record.deploymentId || crypto.randomUUID();
  const ctx = getCorrelationContext();
  return {
    deploymentId,
    siteId: record.siteId,
    status: record.status,
    plan: record.plan,
    idempotencyKey: record.idempotencyKey || `${record.siteId}:${record.plan}:legacy`,
    attemptCount: record.attemptCount || 1,
    requestedAt,
    updatedAt,
    deployedAt: record.deployedAt,
    publishUrl: record.publishUrl,
    message: record.message,
    medusaSync: record.medusaSync,
    failureStage: record.failureStage,
    failureReason: record.failureReason,
    provisioningId: record.provisioningId,
    vercelDeploymentId: record.vercelDeploymentId,
    history: normalizeHistory(record.history, { ...record, requestedAt }),
    correlationId: record.correlationId || ctx.correlationId,
    leaseHolder: record.leaseHolder || ctx.leaseHolder,
    reconcileRunId: record.reconcileRunId || ctx.reconcileRunId,
  };
}

function transitionAllowed(current: SiteLifecycleStatus, next: SiteLifecycleStatus) {
  if (current === next) return true;

  const transitions: Partial<Record<SiteLifecycleStatus, SiteLifecycleStatus[]>> = {
    deploy_requested: ['provisioning', 'syncing_inventory', 'storefront_building', 'failed'],
    provisioning: ['syncing_inventory', 'storefront_building', 'failed'],
    syncing_inventory: ['storefront_building', 'failed'],
    storefront_building: ['dns_pending', 'live', 'failed'],
    dns_pending: ['live', 'failed'],
  };

  return transitions[current]?.includes(next) ?? false;
}

function cloneDeploymentWithTransition(
  deployment: DeploymentRecord,
  nextStatus: SiteLifecycleStatus,
  message: string,
  source: DeploymentHistoryEntry['source'],
  options?: {
    publishUrl?: string;
    medusaSync?: MedusaSyncResult;
    failureStage?: SiteLifecycleStatus;
    failureReason?: string;
    provisioningId?: string;
    vercelDeploymentId?: string;
    correlationId?: string;
    reconcileRunId?: string;
    leaseHolder?: string;
    now?: () => string;
  },
) {
  const at = nowIso(options?.now);
  const ctx = getCorrelationContext();
  return normalizeDeploymentRecord({
    ...deployment,
    status: nextStatus,
    updatedAt: at,
    deployedAt: nextStatus === 'live' ? deployment.deployedAt || at : deployment.deployedAt,
    publishUrl: options?.publishUrl ?? deployment.publishUrl,
    message,
    medusaSync: options?.medusaSync ?? deployment.medusaSync,
    failureStage: options?.failureStage,
    failureReason: options?.failureReason,
    provisioningId: options?.provisioningId ?? deployment.provisioningId,
    vercelDeploymentId: options?.vercelDeploymentId ?? deployment.vercelDeploymentId,
    correlationId: options?.correlationId || ctx.correlationId,
    reconcileRunId: options?.reconcileRunId || ctx.reconcileRunId,
    leaseHolder: options?.leaseHolder || ctx.leaseHolder,
    history: [...deployment.history, historyEntry(nextStatus, message, source, at)],
  });
}

export async function createMarketplaceDraft(intake: MarketplaceIntakeData) {
  const siteId = crypto.randomUUID();
  const slug = slugify(intake.businessName || `site-${siteId.slice(0, 8)}`);
  const siteToken = buildSiteToken();
  const tokenHash = sha256(siteToken);
  const supabase = getSupabaseAdmin();

  memorySiteTokenHashes.set(siteId, tokenHash);

  if (supabase) {
    const { error } = await supabase.from('marketplaces').insert({
      id: siteId,
      business_name: intake.businessName,
      business_type: intake.businessType,
      offerings: intake.offerings,
      primary_goal: intake.primaryGoal,
      tone: intake.tone,
      contact_email: intake.contactEmail || 'hello@example.com',
      contact_phone: intake.contactPhone,
      service_area: intake.serviceArea,
      brand_color: intake.brandColor,
      inventory_method: intake.inventory?.method || 'manual',
      inventory_raw_content: intake.inventory?.content || null,
      inventory_file_name: intake.inventory?.fileName || slug,
      plan: 'launch',
      status: 'draft',
      owner_token_hash: tokenHash,
    });

    if (!error) {
      return { siteId, slug, siteToken, persisted: true };
    }

    console.warn('Supabase draft create failed, falling back to local draft only:', error.message);
  }

  return { siteId, slug, siteToken, persisted: false };
}

export async function verifySiteAccess(siteId: string, siteToken?: string | null) {
  if (!siteToken) return false;

  const tokenHash = sha256(siteToken);
  const memoryHash = memorySiteTokenHashes.get(siteId);
  if (memoryHash && memoryHash === tokenHash) return true;

  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('marketplaces')
    .select('owner_token_hash')
    .eq('id', siteId)
    .maybeSingle();

  if (error || !data?.owner_token_hash) return false;
  const authorized = data.owner_token_hash === tokenHash;
  if (authorized) {
    memorySiteTokenHashes.set(siteId, tokenHash);
  }
  return authorized;
}

export async function saveMarketplaceDraftSnapshot(draft: MarketplaceSiteDraft) {
  memoryDrafts.set(draft.siteId, draft);
  const supabase = getSupabaseAdmin();

  if (!supabase) return { persisted: false };

  const { error } = await supabase
    .from('marketplaces')
    .update({
      draft_snapshot: normalizeDraftForStorage(draft),
      status: draft.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draft.siteId);

  if (error) {
    console.warn('Supabase draft snapshot save failed:', error.message);
    return { persisted: false };
  }

  return { persisted: true };
}

export async function getMarketplaceDraftSnapshot(siteId: string) {
  const memoryDraft = memoryDrafts.get(siteId);
  if (memoryDraft) return memoryDraft;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('marketplaces')
    .select('draft_snapshot')
    .eq('id', siteId)
    .maybeSingle();

  if (error || !data?.draft_snapshot) return null;

  const draft = data.draft_snapshot as MarketplaceSiteDraft;
  memoryDrafts.set(siteId, draft);
  return draft;
}

export async function replaceInventory(siteId: string, items: InventoryItem[]) {
  memoryInventory.set(siteId, items);
  const supabase = getSupabaseAdmin();

  if (!supabase) return { persisted: false, count: items.length };

  const { error: deleteError } = await supabase.from('inventory_items').delete().eq('marketplace_id', siteId);
  if (deleteError) {
    console.warn('Supabase inventory delete failed:', deleteError.message);
    return { persisted: false, count: items.length };
  }

  if (!items.length) {
    await supabase.from('marketplaces').update({ status: 'inventory', updated_at: new Date().toISOString() }).eq('id', siteId);
    return { persisted: true, count: 0 };
  }

  const { error } = await supabase.from('inventory_items').insert(
    items.map((item) => ({
      marketplace_id: siteId,
      name: item.name,
      price: item.price ? String(item.price).replace('$', '') : null,
      description: item.description || null,
      category: item.category || null,
    })),
  );

  if (error) {
    console.warn('Supabase inventory insert failed:', error.message);
    return { persisted: false, count: items.length };
  }

  await supabase.from('marketplaces').update({ status: 'launch_ready', updated_at: new Date().toISOString() }).eq('id', siteId);
  return { persisted: true, count: items.length };
}

export async function getInventory(siteId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id,name,price,description,category')
      .eq('marketplace_id', siteId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const items = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || '',
        category: item.category || '',
      }));
      memoryInventory.set(siteId, items);
      return items;
    }
  }

  return memoryInventory.get(siteId) || [];
}

export async function saveCheckoutIntent(siteId: string, payload: Omit<CheckoutIntentRecord, 'id' | 'createdAt' | 'siteId'>) {
  const record: CheckoutIntentRecord = {
    id: crypto.randomUUID(),
    siteId,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  memoryCheckout.set(siteId, [...(memoryCheckout.get(siteId) || []), record]);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('checkout_intents').insert({
      id: record.id,
      site_id: siteId,
      customer_name: record.customerName,
      email: record.email,
      phone: record.phone || null,
      product_interest: record.productInterest || null,
      notes: record.notes || null,
      created_at: record.createdAt,
    });

    if (error) {
      console.warn('Supabase checkout intent save failed:', error.message);
    }
  }

  return record;
}

export async function saveLaunchPlan(siteId: string, plan: LaunchPlan) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('marketplaces').update({ plan, updated_at: new Date().toISOString() }).eq('id', siteId);
    if (error) console.warn('Supabase plan update failed:', error.message);
  }
}

export async function saveDeployment(record: DeploymentRecord) {
  const normalized = normalizeDeploymentRecord(record);
  memoryDeployments.set(normalized.siteId, normalized);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('deployments').upsert({
      site_id: normalized.siteId,
      deployment_id: normalized.deploymentId,
      status: normalized.status,
      plan: normalized.plan,
      idempotency_key: normalized.idempotencyKey,
      attempt_count: normalized.attemptCount,
      requested_at: normalized.requestedAt,
      updated_at: normalized.updatedAt,
      deployed_at: normalized.deployedAt || null,
      publish_url: normalized.publishUrl || null,
      message: normalized.message || null,
      medusa_sync: normalized.medusaSync || null,
      failure_stage: normalized.failureStage || null,
      failure_reason: normalized.failureReason || null,
      provisioning_id: normalized.provisioningId || null,
      vercel_deployment_id: normalized.vercelDeploymentId || null,
      history: normalized.history,
      correlation_id: normalized.correlationId || null,
      lease_holder: normalized.leaseHolder || null,
      reconcile_run_id: normalized.reconcileRunId || null,
    }, { onConflict: 'site_id' });

    if (error) {
      logger.warn({
        event: 'deployment_transition',
        siteId: normalized.siteId,
        deploymentId: normalized.deploymentId,
        reason: `Supabase deployment save failed: ${error.message}`,
      });
    }

    const { error: marketplaceError } = await supabase
      .from('marketplaces')
      .update({ status: normalized.status, deployment_state: normalized, updated_at: normalized.updatedAt })
      .eq('id', normalized.siteId);

    if (marketplaceError) {
      logger.warn({
        event: 'deployment_transition',
        siteId: normalized.siteId,
        deploymentId: normalized.deploymentId,
        reason: `Supabase marketplace deployment update failed: ${marketplaceError.message}`,
      });
    }
  }

  // Structured log for every deployment state change
  const failed = normalized.status === 'failed';
  const classified = failed ? classifyFailure(normalized.failureReason || normalized.message || '') : undefined;

  logger.log({
    event: failed ? 'deployment_failed' : 'deployment_transition',
    siteId: normalized.siteId,
    deploymentId: normalized.deploymentId,
    status: normalized.status,
    previousStatus: record.history?.length ? record.history[record.history.length - 2]?.status : undefined,
    message: normalized.message || undefined,
    failureCode: classified?.code,
    failureCategory: classified?.category,
  });

  return normalized;
}

export async function getDeployment(siteId: string) {
  const memoryDeployment = memoryDeployments.get(siteId);
  if (memoryDeployment) return memoryDeployment;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('deployments')
    .select('site_id,deployment_id,status,plan,idempotency_key,attempt_count,requested_at,updated_at,deployed_at,publish_url,message,medusa_sync,failure_stage,failure_reason,provisioning_id,vercel_deployment_id,history')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error || !data) return null;

  const deployment = normalizeDeploymentRecord({
    siteId: data.site_id,
    deploymentId: data.deployment_id,
    status: data.status,
    plan: data.plan,
    idempotencyKey: data.idempotency_key,
    attemptCount: data.attempt_count,
    requestedAt: data.requested_at,
    updatedAt: data.updated_at,
    deployedAt: data.deployed_at || undefined,
    publishUrl: data.publish_url || undefined,
    message: data.message || undefined,
    medusaSync: data.medusa_sync || undefined,
    failureStage: data.failure_stage || undefined,
    failureReason: data.failure_reason || undefined,
    provisioningId: data.provisioning_id || undefined,
    vercelDeploymentId: data.vercel_deployment_id || undefined,
    history: (data.history as DeploymentHistoryEntry[] | null) || undefined,
  });

  memoryDeployments.set(siteId, deployment);
  return deployment;
}

export async function getDeploymentByDeploymentId(deploymentId: string) {
  const memoryMatch = Array.from(memoryDeployments.values()).find((record) => record.deploymentId === deploymentId);
  if (memoryMatch) return memoryMatch;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('deployments')
    .select('site_id,deployment_id,status,plan,idempotency_key,attempt_count,requested_at,updated_at,deployed_at,publish_url,message,medusa_sync,failure_stage,failure_reason,provisioning_id,vercel_deployment_id,history')
    .eq('deployment_id', deploymentId)
    .maybeSingle();

  if (error || !data) return null;

  const deployment = normalizeDeploymentRecord({
    siteId: data.site_id,
    deploymentId: data.deployment_id,
    status: data.status,
    plan: data.plan,
    idempotencyKey: data.idempotency_key,
    attemptCount: data.attempt_count,
    requestedAt: data.requested_at,
    updatedAt: data.updated_at,
    deployedAt: data.deployed_at || undefined,
    publishUrl: data.publish_url || undefined,
    message: data.message || undefined,
    medusaSync: data.medusa_sync || undefined,
    failureStage: data.failure_stage || undefined,
    failureReason: data.failure_reason || undefined,
    provisioningId: data.provisioning_id || undefined,
    vercelDeploymentId: data.vercel_deployment_id || undefined,
    history: (data.history as DeploymentHistoryEntry[] | null) || undefined,
  });

  memoryDeployments.set(deployment.siteId, deployment);
  return deployment;
}

export async function requestDeployment(siteId: string, plan: LaunchPlan, idempotencyKey: string, now?: () => string) {
  const existing = await getDeployment(siteId);
  if (existing?.idempotencyKey === idempotencyKey) {
    logger.log({
      event: 'deployment_requested',
      siteId,
      deploymentId: existing.deploymentId,
      status: existing.status,
      message: 'Idempotent request — returning existing deployment.',
    });
    return existing;
  }

  // Retry cooldown: if failed, wait 5 minutes before retry
  if (existing?.status === 'failed') {
    const lastUpdate = new Date(existing.updatedAt).getTime();
    const cooldownMs = 5 * 60 * 1000; // 5 minutes
    if (Date.now() - lastUpdate < cooldownMs) {
      logger.log({
        event: 'deployment_requested',
        siteId,
        deploymentId: existing.deploymentId,
        status: existing.status,
        message: 'Retry blocked — still in cooldown.',
      });
      return existing; // still in cooldown
    }
    logger.log({
      event: 'deployment_retry',
      siteId,
      deploymentId: existing.deploymentId,
      status: 'deploy_requested',
      message: 'Cooldown expired — retrying deployment.',
    });
  }

  if (existing && isActiveDeploymentStatus(existing.status)) {
    logger.log({
      event: 'deployment_requested',
      siteId,
      deploymentId: existing.deploymentId,
      status: existing.status,
      message: 'Deployment already in progress.',
    });
    return existing;
  }

  const inventory = await getInventory(siteId);
  const requestedAt = nowIso(now);
  const attemptCount = existing ? existing.attemptCount + 1 : 1;

  if (!inventory.length) {
    const blocked = normalizeDeploymentRecord({
      deploymentId: crypto.randomUUID(),
      siteId,
      status: 'launch_ready',
      plan,
      idempotencyKey,
      attemptCount,
      requestedAt,
      updatedAt: requestedAt,
      message: 'Launch request was blocked because inventory is empty. Add inventory before provisioning can begin.',
      history: [historyEntry('launch_ready', 'Launch request blocked because inventory is empty.', 'request', requestedAt)],
    });
    logger.log({
      event: 'deployment_requested',
      siteId,
      deploymentId: blocked.deploymentId,
      status: 'launch_ready',
      message: 'Blocked — no inventory.',
    });
    return saveDeployment(blocked);
  }

  const requested = normalizeDeploymentRecord({
    deploymentId: crypto.randomUUID(),
    siteId,
    status: 'deploy_requested',
    plan,
    idempotencyKey,
    attemptCount,
    requestedAt,
    updatedAt: requestedAt,
    message: 'Launch request recorded. Reconciliation will advance the deployment through provisioning states.',
    history: [historyEntry('deploy_requested', 'Launch request recorded.', 'request', requestedAt)],
  });

    logger.log({
      event: 'deployment_requested',
      siteId,
      deploymentId: requested.deploymentId,
      status: 'deploy_requested',
      message: 'Launch request recorded.',
      metadata: { attemptCount },
    });

  return saveDeployment(requested);
}

export async function reconcileDeployment(siteId: string, options: ReconcileOptions = {}) {
  const reconcileStartTime = Date.now();
  let deployment = await getDeployment(siteId);
  if (!deployment) return null;
  if (isTerminalDeploymentStatus(deployment.status) || deployment.status === 'launch_ready') return deployment;

  logger.log({
    event: 'deployment_reconciled',
    siteId,
    deploymentId: deployment.deploymentId,
    status: deployment.status,
    message: 'Reconciliation started.',
  });

  const capabilities = options.capabilities || await getCapabilities();
  const inventory = await getInventory(siteId);

  if (!inventory.length) {
    const failed = cloneDeploymentWithTransition(
      deployment,
      'failed',
      'Deployment failed because inventory was removed before provisioning completed.',
      'reconciler',
      {
        failureStage: deployment.status,
        failureReason: 'inventory_missing',
        now: options.now,
      },
    );
    const classification = classifyFailure('inventory_missing');
    logger.error({
      event: 'deployment_failed',
      siteId,
      deploymentId: deployment.deploymentId,
      status: 'failed',
      failureCode: classification.code,
      failureCategory: classification.category,
      message: 'Inventory missing during reconciliation.',
      durationMs: Date.now() - reconcileStartTime,
    });
    return saveDeployment(failed);
  }

  while (deployment && !isTerminalDeploymentStatus(deployment.status)) {
    if (deployment.status === 'launch_ready' || deployment.status === 'dns_pending' || deployment.status === 'storefront_building') {
      // Timeout detection: if stalled > 30 minutes, mark as failed
      const lastTransition = deployment.history
        ?.filter(entry => entry.status === deployment.status)
        ?.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())?.[0];
      
      if (lastTransition) {
        const stalledMinutes = (Date.now() - new Date(lastTransition.at).getTime()) / 60000;
        if (stalledMinutes > 30) {
          deployment = await saveDeployment(cloneDeploymentWithTransition(
            deployment,
            'failed',
            `Deployment timed out after ${Math.round(stalledMinutes)} minutes in ${deployment.status} state.`,
            'reconciler',
            {
              failureStage: deployment.status,
              failureReason: 'timeout',
              now: options.now,
            },
          ));
          logger.error({
            event: 'deployment_timeout',
            siteId,
            deploymentId: deployment.deploymentId,
            status: 'failed',
            failureCode: 'TIMEOUT',
            failureCategory: 'TRANSIENT',
            durationMs: Date.now() - reconcileStartTime,
            message: `Timed out after ${Math.round(stalledMinutes)}m in ${deployment.status}.`,
            metadata: { stalledMinutes: Math.round(stalledMinutes) },
          });
          return deployment;
        }
      }

      if (deployment.status === 'storefront_building' && !capabilities.deploymentWebhookConfigured && !deployment.message?.includes('DEPLOYMENT_WEBHOOK_SECRET')) {
        deployment = await saveDeployment(cloneDeploymentWithTransition(
          deployment,
          'storefront_building',
          'Awaiting storefront provisioning callback. Configure DEPLOYMENT_WEBHOOK_SECRET to accept external status updates.',
          'system',
          { now: options.now },
        ));
      }

      logger.log({
        event: 'deployment_reconciled',
        siteId,
        deploymentId: deployment.deploymentId,
        status: deployment.status,
        durationMs: Date.now() - reconcileStartTime,
        message: 'Reconciliation paused — waiting for external event.',
      });
      return deployment;
    }

    if (deployment.status === 'deploy_requested') {
      deployment = await saveDeployment(cloneDeploymentWithTransition(
        deployment,
        'provisioning',
        'Reconciliation started. Verifying inventory and downstream provisioning prerequisites.',
        'reconciler',
        { now: options.now },
      ));
      continue;
    }

    if (deployment.status === 'provisioning') {
      if (capabilities.medusaConfigured) {
        deployment = await saveDeployment(cloneDeploymentWithTransition(
          deployment,
          'syncing_inventory',
          'Provisioning is active. Syncing inventory to Medusa before storefront publication.',
          'reconciler',
          { now: options.now },
        ));
        continue;
      }

      deployment = await saveDeployment(cloneDeploymentWithTransition(
        deployment,
        'storefront_building',
        'Inventory verified. Medusa sync was skipped because credentials are not configured. Awaiting storefront provisioning callback.',
        'reconciler',
        {
          medusaSync: deployment.medusaSync || {
            attempted: false,
            success: false,
            message: 'Medusa sync skipped because credentials are not configured.',
          },
          now: options.now,
        },
      ));
      return deployment;
    }

    if (deployment.status === 'syncing_inventory') {
      const syncInventory = options.syncInventory || syncInventoryToMedusa;
      const medusaSync = await syncInventory(siteId, inventory);

      if (!medusaSync.success) {
        deployment = await saveDeployment(cloneDeploymentWithTransition(
          deployment,
          'failed',
          `Deployment failed during Medusa sync. ${medusaSync.message}`,
          'reconciler',
          {
            medusaSync,
            failureStage: 'syncing_inventory',
            failureReason: medusaSync.message,
            now: options.now,
          },
        ));
        const classification = classifyFailure(medusaSync.message);
        logger.error({
          event: 'deployment_failed',
          siteId,
          deploymentId: deployment.deploymentId,
          status: 'failed',
          failureCode: classification.code,
          failureCategory: classification.category,
          durationMs: Date.now() - reconcileStartTime,
          message: `Medusa sync failed: ${medusaSync.message}`,
        });
        return deployment;
      }

      logger.log({
        event: 'inventory_synced',
        siteId,
        deploymentId: deployment.deploymentId,
        message: `Synced ${medusaSync.productCount || 0} products to Medusa.`,
        metadata: { productCount: medusaSync.productCount },
      });

      deployment = await saveDeployment(cloneDeploymentWithTransition(
        deployment,
        'storefront_building',
        'Inventory synced successfully. Awaiting storefront provisioning callback before a public URL is issued.',
        'reconciler',
        { medusaSync, now: options.now },
      ));
      return deployment;
    }

    return deployment;
  }

  logger.log({
    event: 'deployment_reconciled',
    siteId,
    deploymentId: deployment.deploymentId,
    status: deployment.status,
    durationMs: Date.now() - reconcileStartTime,
    message: 'Reconciliation complete.',
  });

  return deployment;
}

export async function applyDeploymentEventByDeploymentId(deploymentId: string, event: DeploymentEventInput, now?: () => string) {
  const deployment = await getDeploymentByDeploymentId(deploymentId);
  if (!deployment) return null;

  // Idempotency: check if this exact transition was already applied
  const alreadyApplied = deployment.history?.some(entry => 
    entry.status === event.status && 
    entry.source === 'webhook'
  ) && deployment.failureReason === event.failureReason;
  if (alreadyApplied) {
    logger.log({
      event: 'webhook_received',
      siteId: deployment.siteId,
      deploymentId,
      status: deployment.status,
      message: `Idempotent webhook — already in ${event.status}.`,
    });
    return deployment;
  }

  if (!transitionAllowed(deployment.status, event.status)) {
    logger.warn({
      event: 'webhook_received',
      siteId: deployment.siteId,
      deploymentId,
      status: event.status,
      reason: `Invalid transition: ${deployment.status} → ${event.status}`,
    });
    return deployment;
  }

  const next = cloneDeploymentWithTransition(
    deployment,
    event.status,
    event.message || deployment.message || `Deployment moved to ${event.status}.`,
    'webhook',
    {
      publishUrl: event.status === 'live' ? event.publishUrl : undefined,
      medusaSync: deployment.medusaSync,
      failureStage: event.status === 'failed' ? deployment.status : undefined,
      failureReason: event.failureReason,
      provisioningId: event.provisioningId,
      vercelDeploymentId: event.vercelDeploymentId,
      now,
    },
  );

  logger.log({
    event: 'webhook_received',
    siteId: deployment.siteId,
    deploymentId,
    status: event.status,
    previousStatus: deployment.status,
    message: `Webhook transition: ${deployment.status} → ${event.status}`,
  });

  return saveDeployment(next);
}

// ═══════════════════════════════════════════════════════════════════
// Phase 4: SiteStore — DeploymentRepository-compatible methods
// ═══════════════════════════════════════════════════════════════════

/**
 * Acquire a lease on a deployment for the given holder.
 * Returns true if the lease was acquired, false if already held.
 * Leases auto-expire after ttlSec seconds (covers crashed workers).
 */
export async function acquireLease(
  deploymentId: string,
  leaseHolder: string,
  ttlSec: number = 120,
): Promise<boolean> {
  const deployment = await getDeploymentByDeploymentId(deploymentId);
  if (!deployment) return false;

  // Check if lease is currently held by someone else and not expired
  if (deployment.leaseHolder && deployment.leaseHolder !== leaseHolder) {
    const leasedAt = new Date(deployment.updatedAt).getTime();
    const leaseAge = (Date.now() - leasedAt) / 1000;
    if (leaseAge < ttlSec) {
      // Lease still valid — held by another worker
      return false;
    }
    // Lease expired — can be acquired
  }

  // Acquire the lease
  const updated = await saveDeployment(normalizeDeploymentRecord({
    ...deployment,
    leaseHolder,
    reconcileRunId: getCorrelationContext().reconcileRunId,
    updatedAt: new Date().toISOString(),
  }));

  logger.log({
    event: 'deployment_lease_acquired',
    siteId: deployment.siteId,
    deploymentId,
    leaseHolder,
    message: 'Lease acquired.',
  });

  return true;
}

/**
 * Release a lease held by the given holder.
 * Only releases if the holder matches (safety check).
 */
export async function releaseLease(
  deploymentId: string,
  leaseHolder: string,
): Promise<boolean> {
  const deployment = await getDeploymentByDeploymentId(deploymentId);
  if (!deployment) return false;
  if (deployment.leaseHolder !== leaseHolder) return false;

  await saveDeployment(normalizeDeploymentRecord({
    ...deployment,
    leaseHolder: undefined,
    reconcileRunId: undefined,
    updatedAt: new Date().toISOString(),
  }));

  logger.log({
    event: 'deployment_lease_released',
    siteId: deployment.siteId,
    deploymentId,
    leaseHolder,
    message: 'Lease released.',
  });

  return true;
}

/**
 * Find deployments that are stalled and need reconciliation.
 * Returns candidates with non-terminal status that haven't been
 * updated in at least `stalledMinutes` minutes.
 */
export async function findReconcilableDeployments(
  stalledMinutes: number = 2,
): Promise<DeploymentRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Fall back to in-memory search
    return Array.from(memoryDeployments.values()).filter((d) => {
      if (isTerminalDeploymentStatus(d.status)) return false;
      const stalledMs = Date.now() - new Date(d.updatedAt).getTime();
      return stalledMs >= stalledMinutes * 60 * 1000;
    });
  }

  const cutoff = new Date(Date.now() - stalledMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('deployments')
    .select('site_id,deployment_id,status,plan,idempotency_key,attempt_count,requested_at,updated_at,deployed_at,publish_url,message,medusa_sync,failure_stage,failure_reason,provisioning_id,vercel_deployment_id,history,correlation_id,lease_holder,reconcile_run_id')
    .not('status', 'in', JSON.stringify(TERMINAL_DEPLOYMENT_STATUSES))
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: true })
    .limit(25);

  if (error || !data?.length) return [];

  return data.map((row) => normalizeDeploymentRecord({
    siteId: row.site_id,
    deploymentId: row.deployment_id,
    status: row.status,
    plan: row.plan,
    idempotencyKey: row.idempotency_key,
    attemptCount: row.attempt_count,
    requestedAt: row.requested_at,
    updatedAt: row.updated_at,
    deployedAt: row.deployed_at || undefined,
    publishUrl: row.publish_url || undefined,
    message: row.message || undefined,
    medusaSync: row.medusa_sync || undefined,
    failureStage: row.failure_stage || undefined,
    failureReason: row.failure_reason || undefined,
    provisioningId: row.provisioning_id || undefined,
    vercelDeploymentId: row.vercel_deployment_id || undefined,
    correlationId: row.correlation_id || undefined,
    leaseHolder: row.lease_holder || undefined,
    reconcileRunId: row.reconcile_run_id || undefined,
    history: (row.history as DeploymentHistoryEntry[] | null) || undefined,
  }));
}

/**
 * Get deployment counts grouped by status.
 */
export async function getDeploymentStatusCounts(): Promise<
  { status: SiteLifecycleStatus; count: number }[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const counts: Record<string, number> = {};
    for (const d of memoryDeployments.values()) {
      counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return Object.entries(counts).map(([status, count]) => ({
      status: status as SiteLifecycleStatus,
      count,
    }));
  }

  const { data, error } = await supabase
    .from('deployments')
    .select('status');
  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.status] = (counts[row.status] || 0) + 1;
  }
  return Object.entries(counts).map(([status, count]) => ({
    status: status as SiteLifecycleStatus,
    count,
  }));
}

/**
 * Mark a deployment as failed with a given reason and classified failure.
 */
export async function markFailed(
  siteId: string,
  reason: string,
  failureStage?: SiteLifecycleStatus,
): Promise<{ success: boolean; status?: SiteLifecycleStatus }> {
  const deployment = await getDeployment(siteId);
  if (!deployment) return { success: false };
  if (isTerminalDeploymentStatus(deployment.status)) {
    return { success: false, status: deployment.status };
  }

  const failed = cloneDeploymentWithTransition(
    deployment,
    'failed',
    reason,
    'system',
    {
      failureStage: failureStage || deployment.status,
      failureReason: reason,
    },
  );

  const result = await saveDeployment(failed);
  return { success: true, status: result.status };
}

/**
 * Retry a failed deployment.
 * Enforces a 5-minute cooldown from the last failure.
 */
export async function retryDeployment(
  siteId: string,
): Promise<{ success: boolean; status?: SiteLifecycleStatus; message: string }> {
  const deployment = await getDeployment(siteId);
  if (!deployment) {
    return { success: false, message: 'No deployment found.' };
  }

  if (deployment.status !== 'failed') {
    return {
      success: false,
      status: deployment.status,
      message: `Cannot retry — deployment is in ${deployment.status} state.`,
    };
  }

  // 5-minute cooldown
  const lastUpdate = new Date(deployment.updatedAt).getTime();
  const cooldownMs = 5 * 60 * 1000;
  if (Date.now() - lastUpdate < cooldownMs) {
    const remainingSec = Math.ceil((cooldownMs - (Date.now() - lastUpdate)) / 1000);
    return {
      success: false,
      status: 'failed',
      message: `Retry blocked — cooldown active. Try again in ${remainingSec}s.`,
    };
  }

  // Reset to deploy_requested for re-reconciliation
  const retried = cloneDeploymentWithTransition(
    deployment,
    'deploy_requested',
    'Retry requested by operator after previous failure.',
    'system',
  );

  const result = await saveDeployment(retried);
  return {
    success: true,
    status: result.status,
    message: 'Deployment retry initiated. Reconciliation will advance it.',
  };
}

/**
 * Reconcile a deployment with lease protection.
 * Safe for multiple concurrent workers — only one acquires the lease.
 */
export async function reconcileWithLease(
  siteId: string,
  leaseHolder: string,
): Promise<{
  handled: boolean;
  status?: SiteLifecycleStatus;
  eventCount: number;
}> {
  const deployment = await getDeployment(siteId);
  if (!deployment) return { handled: false, eventCount: 0 };

  // Try to acquire lease
  const acquired = await acquireLease(deployment.deploymentId, leaseHolder);
  if (!acquired) {
    return {
      handled: false,
      status: deployment.status,
      eventCount: 0,
    };
  }

  try {
    const result = await reconcileDeployment(siteId);
    const historyLength = result?.history?.length || 0;
    return {
      handled: true,
      status: result?.status,
      eventCount: historyLength,
    };
  } finally {
    await releaseLease(deployment.deploymentId, leaseHolder);
  }
}

export function buildDeploymentRecord(
  siteId: string,
  plan: LaunchPlan,
  status: SiteLifecycleStatus,
  message: string,
  publishUrl?: string,
  overrides?: Partial<DeploymentRecord>,
): DeploymentRecord {
  const requestedAt = overrides?.requestedAt || new Date().toISOString();
  return normalizeDeploymentRecord({
    deploymentId: overrides?.deploymentId || crypto.randomUUID(),
    siteId,
    plan,
    status,
    idempotencyKey: overrides?.idempotencyKey || `${siteId}:${plan}:manual`,
    attemptCount: overrides?.attemptCount || 1,
    requestedAt,
    updatedAt: overrides?.updatedAt || requestedAt,
    deployedAt: status === 'live' ? overrides?.deployedAt || requestedAt : overrides?.deployedAt,
    publishUrl,
    message,
    medusaSync: overrides?.medusaSync,
    failureStage: overrides?.failureStage,
    failureReason: overrides?.failureReason,
    provisioningId: overrides?.provisioningId,
    vercelDeploymentId: overrides?.vercelDeploymentId,
    history: overrides?.history || [historyEntry(status, message, 'system', requestedAt)],
  });
}

export function buildPublishUrl(siteId: string, businessName: string, _plan: LaunchPlan) {
  const slug = slugify(businessName || siteId);
  return `https://${slug}.edgemarketplacehub.com`;
}

export async function getCapabilities(): Promise<CapabilitySnapshot> {
  return {
    supabaseConfigured: Boolean(getSupabaseAdmin()),
    medusaConfigured: Boolean(process.env.MEDUSA_BACKEND_URL && process.env.MEDUSA_ADMIN_TOKEN),
    deploymentWebhookConfigured: Boolean(process.env.DEPLOYMENT_WEBHOOK_SECRET),
  };
}

export function resetInMemoryStateForTests() {
  memoryInventory.clear();
  memoryDeployments.clear();
  memoryCheckout.clear();
  memoryDrafts.clear();
  memorySiteTokenHashes.clear();
}
