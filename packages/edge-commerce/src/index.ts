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

// Product-oriented components
export { FeaturedProduct, featuredProductConfig } from './components/products/FeaturedProduct';
export { ProductGrid, productGridConfig } from './components/products/ProductGrid';
export { ProductCarousel, productCarouselConfig } from './components/products/ProductCarousel';
export { ProductComparison, productComparisonConfig } from './components/products/ProductComparison';

// Service-oriented components
export { ServiceCard, serviceCardConfig } from './components/services/ServiceCard';
export { ServicePackages, servicePackagesConfig } from './components/services/ServicePackages';
export { AvailabilitySection, availabilitySectionConfig } from './components/services/AvailabilitySection';
export { BeforeAfterGallery, beforeAfterGalleryConfig } from './components/services/BeforeAfterGallery';

// Booking-oriented components
export { BookingCTA, bookingCTACConfig } from './components/booking/BookingCTA';
export { QuoteEstimator, quoteEstimatorConfig } from './components/booking/QuoteEstimator';

/**
 * Component registry for Puck config
 * Use this to register all commerce-native components at once
 */
import { Config } from '@measured/puck';

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

/**
 * Usage:
 * 
 * 1. Import in your Puck config:
 *    import { commerceComponentConfigs } from '@edge-marketplace/edge-commerce';
 * 
 * 2. Merge with your existing config:
 *    const config = {
 *      components: {
 *        ...commerceComponentConfigs.components,
 *        ...yourOtherComponents,
 *      },
 *    };
 * 
 * 3. Components will appear in Puck editor under their respective categories
 *    (Commerce - Products, Commerce - Services, Commerce - Booking)
 */
