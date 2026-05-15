// @ts-nocheck
/**
 * Edge Commerce - Commerce-Native Puck Component Library
 * 
 * Business primitives for the commerce launch infrastructure.
 * NOT generic layout blocks with dataSource toggles.
 * 
 * These are semantically meaningful commerce blocks that understand:
 * - Products/services natively
 * - Inventory/pricing natively  
 * - Booking/availability natively
 * - Workflow gating natively
 */

import { Config } from '@measured/puck';

// Import components and configs (makes them available in this scope)
import { FeaturedProduct, featuredProductConfig } from './products/FeaturedProduct';
import { ProductGrid, productGridConfig } from './products/ProductGrid';
import { ProductCarousel, productCarouselConfig } from './products/ProductCarousel';
import { ProductComparison, productComparisonConfig } from './products/ProductComparison';

import { ServiceCard, serviceCardConfig } from './services/ServiceCard';
import { ServicePackages, servicePackagesConfig } from './services/ServicePackages';
import { AvailabilitySection, availabilitySectionConfig } from './services/AvailabilitySection';
import { BeforeAfterGallery, beforeAfterGalleryConfig } from './services/BeforeAfterGallery';

import { BookingCTA, bookingCTACConfig } from './booking/BookingCTA';
import { QuoteEstimator, quoteEstimatorConfig } from './booking/QuoteEstimator';

// Re-export for external use
export {
  FeaturedProduct, featuredProductConfig,
  ProductGrid, productGridConfig,
  ProductCarousel, productCarouselConfig,
  ProductComparison, productComparisonConfig,
  ServiceCard, serviceCardConfig,
  ServicePackages, servicePackagesConfig,
  AvailabilitySection, availabilitySectionConfig,
  BeforeAfterGallery, beforeAfterGalleryConfig,
  BookingCTA, bookingCTACConfig,
  QuoteEstimator, quoteEstimatorConfig,
};

/**
 * Component registry for Puck config
 * Use this to register all commerce-native components at once
 */
export const commerceComponentConfigs: Config = {
  components: {
    FeaturedProduct: featuredProductConfig,
    ProductGrid: productGridConfig,
    ProductCarousel: productCarouselConfig,
    ProductComparison: productComparisonConfig,
    ServiceCard: serviceCardConfig,
    ServicePackages: servicePackagesConfig,
    AvailabilitySection: availabilitySectionConfig,
    BeforeAfterGallery: beforeAfterGalleryConfig,
    BookingCTA: bookingCTACConfig,
    QuoteEstimator: quoteEstimatorConfig,
  },
};

/**
 * Component categories for Puck UI
 * This organizes components in the editor sidebar
 */
export const commerceCategories = {
  'commerce-products': {
    label: 'Commerce - Products',
    components: ['FeaturedProduct', 'ProductGrid', 'ProductCarousel', 'ProductComparison'],
  },
  'commerce-services': {
    label: 'Commerce - Services',
    components: ['ServiceCard', 'ServicePackages', 'AvailabilitySection', 'BeforeAfterGallery'],
  },
  'commerce-booking': {
    label: 'Commerce - Booking',
    components: ['BookingCTA', 'QuoteEstimator'],
  },
};
