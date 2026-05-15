/**
 * Snapshots Runtime Module
 * Handles immutable hydrated storefront snapshots for publish-time rendering
 * This is the operationally correct architecture: snapshots, not live mutable inventory
 */

import {
  InventoryItem,
  EditorData,
  MarketplaceSiteDraft,
  ProductHydrationResult,
  ServiceHydrationResult,
  PackageHydrationResult,
} from '../types';

import { resolveFeaturedProducts } from './products';
import { resolveCollections } from './products';
import { resolveServiceCards } from './services';
import { resolveGridPackages } from './pricing';

export interface HydratedSnapshot {
  timestamp: string;
  siteId: string;
  slug: string;
  blocks: HydratedBlock[];
  metadata: {
    totalInventoryItems: number;
    productCount: number;
    serviceCount: number;
    packageCount: number;
    bookingSlotCount: number;
  };
}

export interface HydratedBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

/**
 * Create immutable hydrated snapshot at publish time
 * This captures the exact state of inventory-integrated blocks
 */
export function createHydratedSnapshot(
  data: EditorData,
  inventoryItems: InventoryItem[],
  draft: MarketplaceSiteDraft
): HydratedSnapshot {
  const blocks: HydratedBlock[] = data.content.map((block) => ({
    id: block.id,
    type: block.type,
    props: hydrateBlockForSnapshot(block, inventoryItems, draft),
  }));

  const productCount = inventoryItems.filter((i) => !i.type || i.type === 'product').length;
  const serviceCount = inventoryItems.filter((i) => i.type === 'service').length;
  const packageCount = inventoryItems.filter(
    (i) => i.type === 'package' || i.type === 'subscription'
  ).length;
  const bookingSlotCount = inventoryItems.filter((i) => i.type === 'booking_slot').length;

  return {
    timestamp: new Date().toISOString(),
    siteId: (draft as any).siteId || (draft as any).id || 'unknown',
    slug: draft.slug || 'unknown',
    blocks,
    metadata: {
      totalInventoryItems: inventoryItems.length,
      productCount,
      serviceCount,
      packageCount,
      bookingSlotCount,
    },
  };
}

/**
 * Hydrate a single block for snapshot
 * Similar to hydrateBlockProps but returns immutable snapshot
 */
function hydrateBlockForSnapshot(
  block: { id: string; type: string; props: Record<string, unknown> },
  inventoryItems: InventoryItem[],
  draft: MarketplaceSiteDraft
): Record<string, unknown> {
  const dataSource = (block.props as any)?.dataSource;

  if (dataSource === 'manual') {
    return block.props;
  }

  const shouldInjectInventory = dataSource === 'inventory' || !dataSource;

  if (!shouldInjectInventory || !inventoryItems.length) return block.props;

  if (block.type === 'GridFeaturedProducts') {
    return {
      ...block.props,
      items: resolveFeaturedProducts(inventoryItems, draft, 8),
    };
  }

  if (block.type === 'GridCollections') {
    return {
      ...block.props,
      items: resolveCollections(inventoryItems),
    };
  }

  if (block.type === 'GridServiceCards') {
    return {
      ...block.props,
      items: resolveServiceCards(inventoryItems, draft, 6),
    };
  }

  if (block.type === 'GridPackages') {
    return {
      ...block.props,
      items: resolveGridPackages(inventoryItems, draft, 3),
    };
  }

  return block.props;
}

/**
 * Save snapshot to server (placeholder for API integration)
 */
export async function saveSnapshot(snapshot: HydratedSnapshot): Promise<void> {
  // TODO: Implement API call to save snapshot
  // POST /api/sites/:id/snapshot
  console.log('Saving snapshot:', snapshot.timestamp);
}

/**
 * Load snapshot from server (placeholder for API integration)
 */
export async function loadSnapshot(siteId: string): Promise<HydratedSnapshot | null> {
  // TODO: Implement API call to load snapshot
  // GET /api/sites/:id/snapshot
  console.log('Loading snapshot for site:', siteId);
  return null;
}
