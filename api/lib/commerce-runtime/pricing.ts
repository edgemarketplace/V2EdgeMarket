/**
 * Pricing Runtime Module
 * Handles resolution of pricing packages, subscriptions, and billing models
 */

import { InventoryItem, PackageHydrationResult, MarketplaceSiteDraft } from '../types';

/**
 * Resolve pricing packages from inventory items
 */
export function resolvePricingPackages(
  inventoryItems: InventoryItem[],
  options?: { limit?: number; billingCycle?: 'monthly' | 'yearly' | 'one-time' }
): PackageHydrationResult[] {
  const packages = inventoryItems.filter(
    (item) => item.type === 'package' || item.type === 'subscription'
  );

  let filtered = packages;

  if (options?.billingCycle) {
    filtered = filtered.filter((p) => p.billingCycle === options.billingCycle);
  }

  const limited = options?.limit ? filtered.slice(0, options.limit) : filtered;

  return limited.map((item) => ({
    name: item.name,
    price: formatPrice(item.price),
    ctaText: item.type === 'subscription' ? 'Subscribe' : 'Choose Package',
    features: (item.features || []).map((f) => ({ label: f })),
    billingCycle: item.billingCycle,
  }));
}

/**
 * Resolve packages for GridPackages component
 * Enhanced with business-context-aware CTA text
 */
export function resolveGridPackages(
  inventoryItems: InventoryItem[],
  draft?: MarketplaceSiteDraft,
  limit: number = 3
): PackageHydrationResult[] {
  const packages = resolvePricingPackages(inventoryItems, { limit });

  return packages.map((pkg) => ({
    ...pkg,
    ctaText:
      draft?.intakeData?.primaryGoal === 'quote'
        ? 'Request Proposal'
        : pkg.billingCycle === 'monthly' || pkg.billingCycle === 'yearly'
        ? 'Subscribe'
        : 'Choose Package',
    features:
      pkg.features.length > 0
        ? pkg.features
        : [
            { label: pkg.name || 'Signature offering' },
            { label: 'Tailored for your customers' },
          ],
  }));
}

/**
 * Calculate total package value for a business
 */
export function calculatePackageValue(inventoryItems: InventoryItem[]): {
  totalValue: number;
  packageCount: number;
  avgPrice: number;
} {
  const packages = inventoryItems.filter(
    (item) => item.type === 'package' || item.type === 'subscription'
  );

  const prices = packages
    .map((p) => (typeof p.price === 'string' ? parseFloat(p.price) : p.price || 0))
    .filter((p) => p > 0);

  const totalValue = prices.reduce((sum, p) => sum + p, 0);
  const avgPrice = prices.length > 0 ? totalValue / prices.length : 0;

  return {
    totalValue,
    packageCount: packages.length,
    avgPrice,
  };
}

/**
 * Format price for display
 */
function formatPrice(price?: string | number): string {
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  if (!price) return '$0.00';
  return String(price).startsWith('$') ? String(price) : `$${price}`;
}
