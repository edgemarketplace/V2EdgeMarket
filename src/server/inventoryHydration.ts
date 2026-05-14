/**
 * Inventory Hydration Service
 * 
 * Single source of truth for inventory resolution and storefront hydration.
 * Handles featured products, collections, category grids, dynamic inventory sections.
 * 
 * KEY PRINCIPLES:
 * - Hydrate at PUBLISH/SNAPSHOT time (not render time)
 * - Draft manifest: contains dataSource references
 * - Published manifest: contains resolved inventory payloads
 * - This gives deterministic storefront rendering, deploy consistency, rollback safety
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  InventoryItem,
  SiteLifecycleStatus,
} from '../lib/types';
import { getInventory, getMarketplaceDraftSnapshot } from './siteStore';
import { logger } from './structured-logger';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type CollectionType = 
  | 'featured'
  | 'newest'
  | 'category'
  | 'tag-based'
  | 'collection-based';

export interface CollectionFilter {
  type: CollectionType;
  category?: string;
  tags?: string[];
  collectionId?: string;
  limit?: number;
  offset?: number;
}

export interface HydratedProduct {
  id: string;
  name: string;
  price: number | null;
  description: string;
  category: string;
  image?: string;
  featured?: boolean;
  createdAt?: string;
}

export interface HydrationResult {
  success: boolean;
  data?: HydratedProduct[];
  error?: string;
  warning?: string;
}

export interface ManifestHydrationResult {
  success: boolean;
  hydratedManifest?: any; // Puck Data structure with resolved data
  errors: HydrationError[];
  warnings: HydrationError[];
}

export interface HydrationError {
  code: string;
  message: string;
  componentId?: string;
  severity: 'error' | 'warning';
}

export interface StorefrontSnapshot {
  siteId: string;
  snapshotId: string;
  publishedAt: string;
  manifest: any; // Hydrated manifest
  inventorySnapshot: HydratedProduct[];
  metadata: {
    itemCount: number;
    collectionCount: number;
    hydrationVersion: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// Supabase client
// ═══════════════════════════════════════════════════════════════

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ═══════════════════════════════════════════════════════════════
// Collection Resolution
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve a collection of inventory items based on filter criteria.
 * This is the core function that powers all grid components.
 */
export async function resolveCollection(
  siteId: string,
  filter: CollectionFilter
): Promise<HydrationResult> {
  try {
    const inventory = await getInventory(siteId);
    
    if (!inventory || inventory.length === 0) {
      return {
        success: false,
        error: 'No inventory items found',
        warning: 'Collection is empty',
      };
    }

    let filtered = inventory as HydratedProduct[];

    // Apply collection type filter
    switch (filter.type) {
      case 'featured':
        filtered = filtered.filter(item => item.featured === true);
        break;
      
      case 'newest':
        filtered = filtered
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
        break;
      
      case 'category':
        if (filter.category) {
          filtered = filtered.filter(item => 
            item.category?.toLowerCase() === filter.category?.toLowerCase()
          );
        }
        break;
      
      case 'tag-based':
        // Future: implement tag filtering
        break;
      
      case 'collection-based':
        // Future: implement collection filtering
        break;
    }

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      filtered = filtered.slice(filter.offset || 0, (filter.offset || 0) + filter.limit);
    }

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Resolve featured products (convenience wrapper)
 */
export async function resolveFeaturedProducts(
  siteId: string,
  limit: number = 8
): Promise<HydrationResult> {
  return resolveCollection(siteId, { type: 'featured', limit });
}

/**
 * Resolve newest products (convenience wrapper)
 */
export async function resolveNewestProducts(
  siteId: string,
  limit: number = 8
): Promise<HydrationResult> {
  return resolveCollection(siteId, { type: 'newest', limit });
}

/**
 * Resolve products by category (convenience wrapper)
 */
export async function resolveCategoryProducts(
  siteId: string,
  category: string,
  limit: number = 8
): Promise<HydrationResult> {
  return resolveCollection(siteId, { type: 'category', category, limit });
}

// ═══════════════════════════════════════════════════════════════
// Manifest Hydration (Publish-time)
// ═══════════════════════════════════════════════════════════════

/**
 * Hydrate an entire Puck manifest at publish time.
 * Replaces dataSource references with resolved inventory payloads.
 * 
 * This is the CRITICAL function that makes publish deterministic.
 */
export async function hydrateManifest(
  siteId: string,
  draftManifest: any // Puck Data structure
): Promise<ManifestHydrationResult> {
  const errors: HydrationError[] = [];
  const warnings: HydrationError[] = [];

  if (!draftManifest?.content) {
    return {
      success: false,
      errors: [{ code: 'EMPTY_MANIFEST', message: 'Draft manifest is empty', severity: 'error' }],
      warnings: [],
    };
  }

  try {
    // Deep clone the manifest
    const hydratedManifest = JSON.parse(JSON.stringify(draftManifest));

    // Iterate through all components in the manifest
    const content = hydratedManifest.content as Record<string, any>;
    
    for (const [componentId, componentData] of Object.entries(content)) {
      if (!componentData?.props) continue;

      const props = componentData.props as any;

      // Check if this component uses inventory dataSource
      if (props.dataSource === 'inventory') {
        const componentType = componentData.type as string;
        
        // Determine collection filter based on component type
        const filter = getFilterForComponent(componentType, props);
        
        // Resolve the collection
        const result = await resolveCollection(siteId, filter);

        if (!result.success || !result.data) {
          errors.push({
            code: 'HYDRATION_FAILED',
            message: `Failed to hydrate ${componentType}: ${result.error}`,
            componentId,
            severity: 'error',
          });
          continue;
        }

        // Check minimum requirements
        const minRequired = getMinItemsRequired(componentType);
        if (result.data.length < minRequired) {
          warnings.push({
            code: 'INSUFFICIENT_ITEMS',
            message: `${componentType} requires ${minRequired} items, got ${result.data.length}`,
            componentId,
            severity: 'warning',
          });
        }

        // Replace props with hydrated data
        props.hydratedItems = result.data;
        props.dataSource = 'hydrated';
        props.hydratedAt = new Date().toISOString();
      }
    }

    return {
      success: errors.length === 0,
      hydratedManifest,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        code: 'HYDRATION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        severity: 'error',
      }],
      warnings,
    };
  }
}

/**
 * Get collection filter based on component type and props
 */
function getFilterForComponent(componentType: string, props: any): CollectionFilter {
  switch (componentType) {
    case 'GridFeaturedProducts':
      return { type: 'featured', limit: props.limit || 8 };
    
    case 'GridCollections':
      return { type: 'category', limit: props.limit || 8 };
    
    case 'GridServiceCards':
      return { type: 'category', category: 'service', limit: props.limit || 6 };
    
    case 'GridPackages':
      return { type: 'category', category: 'package', limit: props.limit || 4 };
    
    default:
      return { type: 'newest', limit: props.limit || 8 };
  }
}

/**
 * Get minimum items required for a component type
 */
function getMinItemsRequired(componentType: string): number {
  switch (componentType) {
    case 'GridFeaturedProducts':
      return 1; // At least 1 featured item
    case 'GridCollections':
      return 1; // At least 1 category
    case 'GridServiceCards':
      return 1;
    case 'GridPackages':
      return 1;
    default:
      return 0;
  }
}

// ══════════════════════════
// Hydration Validation
// ══════════════════════════

/**
 * Validate hydration requirements for a draft manifest.
 * Used by workflow guards to block publish if requirements not met.
 */
export async function validateHydrationRequirements(
  siteId: string,
  draftManifest: any
): Promise<{ valid: boolean; blockers: string[] }> {
  const blockers: string[] = [];
  const inventory = await getInventory(siteId);

  if (!inventory || inventory.length === 0) {
    blockers.push('No inventory items found. Add inventory before publishing.');
    return { valid: false, blockers };
  }

  if (!draftManifest?.content) {
    return { valid: true, blockers: [] };
  }

  const content = draftManifest.content as Record<string, any>;
  
  for (const [componentId, componentData] of Object.entries(content)) {
    if (!componentData?.props) continue;

    const props = componentData.props as any;

    if (props.dataSource === 'inventory') {
      const componentType = componentData.type as string;
      const minRequired = getMinItemsRequired(componentType);

      if (inventory.length < minRequired) {
        blockers.push(
          `${componentType} requires at least ${minRequired} inventory items. Currently have ${inventory.length}.`
        );
      }

      // Check for featured items if component needs them
      if (componentType === 'GridFeaturedProducts') {
        const featuredCount = inventory.filter(item => (item as any).featured === true).length;
        if (featuredCount === 0) {
          blockers.push(
            'GridFeaturedProducts requires featured items. Mark items as featured in inventory.'
          );
        }
      }
    }
  }

  return { valid: blockers.length === 0, blockers };
}

// ═══════════════════════════════════════════════════════════════
// Storefront Snapshot Persistence
// ═══════════════════════════════════════════════════════════════

/**
 * Persist a storefront snapshot at publish time.
 * Publish = immutable operational event.
 * This enables rollback, deployment reconciliation, storefront stability.
 */
export async function persistStorefrontSnapshot(
  siteId: string,
  hydratedManifest: any,
  inventorySnapshot: HydratedProduct[]
): Promise<{ success: boolean; snapshotId?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  const snapshotId = `${siteId}-${Date.now()}`;

  try {
    if (supabase) {
      const { error } = await supabase
        .from('storefront_snapshots')
        .insert({
          snapshot_id: snapshotId,
          site_id: siteId,
          published_at: new Date().toISOString(),
          manifest: hydratedManifest,
          inventory_snapshot: inventorySnapshot,
          metadata: {
            itemCount: inventorySnapshot.length,
            collectionCount: 0, // TODO: calculate actual collection count
            hydrationVersion: '1.0.0',
          },
        });

      if (error) {
        logger.warn({
          event: 'snapshot_persist_failed',
          siteId,
          snapshotId,
          reason: error.message,
        });
        return { success: false, error: error.message };
      }
    }

    // Also update the marketplace record with the latest snapshot reference
    if (supabase) {
      await supabase
        .from('marketplaces')
        .update({
          latest_snapshot_id: snapshotId,
          published_at: new Date().toISOString(),
          status: 'live',
        })
        .eq('id', siteId);
    }

    logger.log({
      event: 'snapshot_persisted',
      siteId,
      snapshotId,
      itemCount: inventorySnapshot.length,
    });

    return { success: true, snapshotId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Retrieve a storefront snapshot by ID
 */
export async function getStorefrontSnapshot(
  siteId: string,
  snapshotId?: string
): Promise<StorefrontSnapshot | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) return null;

  let query = supabase
    .from('storefront_snapshots')
    .select('*')
    .eq('site_id', siteId);

  if (snapshotId) {
    query = query.eq('snapshot_id', snapshotId);
  } else {
    // Get latest snapshot
    query = query.order('published_at', { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  return {
    siteId: data.site_id,
    snapshotId: data.snapshot_id,
    publishedAt: data.published_at,
    manifest: data.manifest,
    inventorySnapshot: data.inventory_snapshot || [],
    metadata: data.metadata || { itemCount: 0, collectionCount: 0, hydrationVersion: '1.0.0' },
  };
}

// ═══════════════════════════════════════════════════════════════
// Database Schema Helper (for reference)
// ═══════════════════════════════════════════════════════════════
/**
 * Recommended schema for storefront_snapshots table:
 * 
 * CREATE TABLE storefront_snapshots (
 *   id SERIAL PRIMARY KEY,
 *   snapshot_id TEXT UNIQUE NOT NULL,
 *   site_id UUID REFERENCES marketplaces(id) NOT NULL,
 *   published_at TIMESTAMPTZ DEFAULT NOW(),
 *   manifest JSONB NOT NULL,
 *   inventory_snapshot JSONB NOT NULL,
 *   metadata JSONB,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_storefront_snapshots_site_id ON storefront_snapshots(site_id);
 * CREATE INDEX idx_storefront_snapshots_published_at ON storefront_snapshots(published_at DESC);
 */
