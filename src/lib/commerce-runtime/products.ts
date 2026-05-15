/**
 * Products Runtime Module
 * Handles resolution and hydration of product inventory entities
 */

import { InventoryItem, ProductHydrationResult, MarketplaceSiteDraft } from '../types';

/**
 * Resolve products from inventory items
 * Filters and transforms product-type inventory items
 */
export function resolveProducts(
  inventoryItems: InventoryItem[],
  options?: { limit?: number; category?: string }
): ProductHydrationResult[] {
  const products = inventoryItems.filter(
    (item) => !item.type || item.type === 'product'
  );

  const filtered = options?.category
    ? products.filter((p) => p.category === options.category)
    : products;

  const limited = options?.limit ? filtered.slice(0, options.limit) : filtered;

  return limited.map((item) => ({
    name: item.name,
    price: formatPrice(item.price),
    category: item.category || 'Featured',
    image: item.image,
  }));
}

/**
 * Resolve featured products for GridFeaturedProducts component
 */
export function resolveFeaturedProducts(
  inventoryItems: InventoryItem[],
  draft?: MarketplaceSiteDraft,
  limit: number = 8
): ProductHydrationResult[] {
  const products = resolveProducts(inventoryItems, { limit });
  
  // Enrich with draft context if available
  return products.map((product) => ({
    ...product,
    category: product.category || draft?.intakeData?.businessType || 'Featured',
  }));
}

/**
 * Resolve collections/categories from product inventory
 */
export function resolveCollections(inventoryItems: InventoryItem[]): { title: string; image?: string }[] {
  const categories = Array.from(
    new Set(inventoryItems.filter((item) => !item.type || item.type === 'product').map((item) => item.category).filter(Boolean))
  );

  return categories.slice(0, 4).map((category) => ({
    title: category as string,
    image: inventoryItems.find((item) => item.category === category)?.image,
  }));
}

/**
 * Format price for display
 */
function formatPrice(price?: string | number): string {
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  if (!price) return '$0.00';
  return String(price).startsWith('$') ? String(price) : `$${price}`;
}
