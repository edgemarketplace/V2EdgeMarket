/**
 * Commerce Runtime Module - Main Export
 * 
 * This is the "commerce runtime brain" that provides:
 * - Inventory semantic resolution (products, services, packages)
 * - Service-native field handling (duration, coverage, pricing models)
 * - Hydration for storefront components
 * - Immutable publish-time snapshots
 * - Entity validation
 * 
 * Usage:
 *   import { resolveProducts, resolveServices, createHydratedSnapshot } from '../lib/commerce-runtime';
 */

// Product runtime
export {
  resolveProducts,
  resolveFeaturedProducts,
  resolveCollections,
} from './products';

// Service runtime
export {
  resolveServices,
  resolveServiceCards,
  resolveServicesByPricingModel,
  getServiceTypesSummary,
} from './services';

// Pricing runtime
export {
  resolvePricingPackages,
  resolveGridPackages,
  calculatePackageValue,
} from './pricing';

// Availability runtime
export {
  resolveAvailability,
  getWeeklyAvailability,
  isSlotAvailable,
  formatAvailabilityForDisplay,
} from './availability';

// Snapshots runtime
export {
  createHydratedSnapshot,
  saveSnapshot,
  loadSnapshot,
} from './snapshots';

// Validators
export {
  validateInventoryItem,
  validateProduct,
  validateService,
  validatePackage,
  validateAvailabilityWindow,
  validateInventory,
} from './validators';

// Type re-exports for convenience
export type {
  InventoryEntityType,
  InventoryItem,
  AvailabilityWindow,
  ProductHydrationResult,
  ServiceHydrationResult,
  PackageHydrationResult,
  ValidationError,
  ValidationResult,
} from '../types';

// Snapshot types (defined in snapshots.ts)
export type { HydratedSnapshot, HydratedBlock } from './snapshots';
