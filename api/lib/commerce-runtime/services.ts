/**
 * Services Runtime Module
 * Handles resolution and hydration of service inventory entities
 * Services are the core differentiator for service commerce (contractors, coaches, agencies, etc.)
 */

import { InventoryItem, ServiceHydrationResult, MarketplaceSiteDraft } from '../types';

/**
 * Resolve services from inventory items
 * Filters and transforms service-type inventory items
 */
export function resolveServices(
  inventoryItems: InventoryItem[],
  options?: {
    limit?: number;
    serviceRadius?: number;
    coverageArea?: string;
  }
): ServiceHydrationResult[] {
  const services = inventoryItems.filter((item) => item.type === 'service');

  let filtered = services;

  if (options?.coverageArea) {
    filtered = filtered.filter((s) => s.coverageArea === options.coverageArea);
  }

  if (options?.serviceRadius) {
    filtered = filtered.filter(
      (s) => !s.serviceRadius || s.serviceRadius <= options.serviceRadius
    );
  }

  const limited = options?.limit ? filtered.slice(0, options.limit) : filtered;

  return limited.map((item) => ({
    title: item.name,
    description: item.description || '',
    image: item.image,
    duration: item.duration,
    pricingModel: item.pricingModel,
    serviceRadius: item.serviceRadius,
    coverageArea: item.coverageArea,
    capacity: item.capacity,
  }));
}

/**
 * Resolve service cards for GridServiceCards component
 * Enhanced with service-native fields
 */
export function resolveServiceCards(
  inventoryItems: InventoryItem[],
  draft?: MarketplaceSiteDraft,
  limit: number = 6
): ServiceHydrationResult[] {
  const services = resolveServices(inventoryItems, { limit });

  return services.map((service) => ({
    ...service,
    description: service.description || draft?.intakeData?.offerings || '',
  }));
}

/**
 * Resolve services by pricing model
 */
export function resolveServicesByPricingModel(
  inventoryItems: InventoryItem[],
  pricingModel: 'hourly' | 'fixed' | 'package' | 'subscription'
): ServiceHydrationResult[] {
  return resolveServices(inventoryItems).filter(
    (service) => service.pricingModel === pricingModel
  );
}

/**
 * Get service types summary for a business
 */
export function getServiceTypesSummary(inventoryItems: InventoryItem[]): {
  total: number;
  byType: Record<string, number>;
  avgDuration: number | null;
} {
  const services = inventoryItems.filter((item) => item.type === 'service');

  const byType = services.reduce(
    (acc, s) => {
      const model = s.pricingModel || 'fixed';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const durationsWithValue = services.filter((s) => s.duration).map((s) => s.duration!);
  const avgDuration =
    durationsWithValue.length > 0
      ? durationsWithValue.reduce((sum, d) => sum + d, 0) / durationsWithValue.length
      : null;

  return {
    total: services.length,
    byType,
    avgDuration,
  };
}
