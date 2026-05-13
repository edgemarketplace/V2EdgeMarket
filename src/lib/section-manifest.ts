import { SectionManifest, TemplateDefinition } from './types';

export const SECTION_INVENTORY: Record<string, SectionManifest> = {
  // HEADERS
  HeaderSimple: { id: "HeaderSimple", label: "Simple Header", category: "Layout" },
  HeaderPromo: { id: "HeaderPromo", label: "Promo Header", category: "Layout" },
  HeaderMega: { id: "HeaderMega", label: "Mega Header", category: "Layout" },

  // HEROES
  HeroImageLeft: { id: "HeroImageLeft", label: "Hero (Image Left)", category: "Layout" },
  HeroFullVisual: { id: "HeroFullVisual", label: "Hero (Full Visual)", category: "Layout" },
  HeroProductFirst: { id: "HeroProductFirst", label: "Hero (Product Focus)", category: "Layout" },
  HeroServiceFirst: { id: "HeroServiceFirst", label: "Hero (Service Focus)", category: "Layout" },

  // GRIDS
  GridFeaturedProducts: { id: "GridFeaturedProducts", label: "Featured Products Grid", category: "Product/Service" },
  GridCollections: { id: "GridCollections", label: "Collections Grid", category: "Product/Service" },
  GridServiceCards: { id: "GridServiceCards", label: "Service Cards Grid", category: "Product/Service" },
  GridPackages: { id: "GridPackages", label: "Packages Grid", category: "Product/Service" },

  // STORY
  StorySplit: { id: "StorySplit", label: "Brand Story Split", category: "Story/Content" },
  StoryValueIcons: { id: "StoryValueIcons", label: "Value Proposition Icons", category: "Story/Content" },
  StoryEditorialBand: { id: "StoryEditorialBand", label: "Editorial Quote Band", category: "Story/Content" },
  StoryFounder: { id: "StoryFounder", label: "Founder Profile", category: "Story/Content" },

  // TRUST
  TrustReviews: { id: "TrustReviews", label: "Featured Reviews", category: "Trust/Proof" },
  TrustTestimonials: { id: "TrustTestimonials", label: "Client Testimonials", category: "Trust/Proof" },
  TrustLogos: { id: "TrustLogos", label: "Trust Logos Bar", category: "Trust/Proof" },
  TrustStats: { id: "TrustStats", label: "Visual Stats", category: "Trust/Proof" },

  // MEDIA
  MediaGallery: { id: "MediaGallery", label: "Image Gallery", category: "Media" },
  MediaVideo: { id: "MediaVideo", label: "Video Spotlight", category: "Media" },
  MediaBeforeAfter: { id: "MediaBeforeAfter", label: "Before & After Transformation", category: "Media" },

  // CONVERSION
  ConversionFAQ: { id: "ConversionFAQ", label: "FAQ Section", category: "Conversion" },
  ConversionNewsletter: { id: "ConversionNewsletter", label: "Newsletter Opt-in", category: "Conversion" },
  ConversionQuoteCTA: { id: "ConversionQuoteCTA", label: "Quote/Inquiry CTA", category: "Conversion" },
  ConversionStickyPromo: { id: "ConversionStickyPromo", label: "Sticky/Highlight Promo", category: "Conversion" },

  // FOOTERS
  FooterBasic: { id: "FooterBasic", label: "Basic Footer", category: "Layout" },
  FooterCommerce: { id: "FooterCommerce", label: "Commerce Footer", category: "Layout" },
  FooterService: { id: "FooterService", label: "Service Footer", category: "Layout" },
};

export const TEMPLATE_MANIFESTS: Record<string, TemplateDefinition> = {
  'retail-core': {
    family: 'retail-core',
    name: 'Retail Core',
    description: 'Minimal luxury focused on catalog discovery and frictionless checkout.',
    allowedSections: Object.keys(SECTION_INVENTORY),
    requiredSections: [],
    recommendedStack: [
      'HeaderPromo', 
      'HeaderSimple', 
      'HeroFullVisual', 
      'GridFeaturedProducts', 
      'GridCollections', 
      'TrustReviews', 
      'ConversionNewsletter', 
      'FooterCommerce'
    ],
    defaultRootProps: {
      theme: { primaryColor: '#1A1A1A', fontFamily: 'Inter', borderRadius: '0px' },
    },
    validationRules: []
  },
  'service-pro': {
    family: 'service-pro',
    name: 'Service Professional',
    description: 'Trustworthy and functional layout emphasizing proof of work and lead gen.',
    allowedSections: Object.keys(SECTION_INVENTORY),
    requiredSections: [],
    recommendedStack: [
      'HeaderSimple', 
      'HeroServiceFirst', 
      'StoryValueIcons', 
      'GridServiceCards', 
      'MediaBeforeAfter', 
      'TrustTestimonials', 
      'ConversionQuoteCTA', 
      'FooterService'
    ],
    defaultRootProps: {
      theme: { primaryColor: '#2563eb', fontFamily: 'Inter', borderRadius: '4px' },
    },
    validationRules: []
  },
  'food-catering': {
    family: 'food-catering',
    name: 'Food & Catering',
    description: 'Appetizing visual hierarchy for menus and event bookings.',
    allowedSections: Object.keys(SECTION_INVENTORY),
    requiredSections: [],
    recommendedStack: [
      'HeaderSimple', 
      'HeroFullVisual', 
      'GridPackages', 
      'GridFeaturedProducts', 
      'ConversionStickyPromo', 
      'TrustTestimonials', 
      'ConversionQuoteCTA', 
      'FooterBasic'
    ],
    defaultRootProps: {
      theme: { primaryColor: '#ea580c', fontFamily: 'Inter', borderRadius: '12px' },
    },
    validationRules: []
  },
  'artisan-market': {
    family: 'artisan-market',
    name: 'Artisan Market',
    description: 'Human-centered storytelling for craftsmanship and community.',
    allowedSections: Object.keys(SECTION_INVENTORY),
    requiredSections: [],
    recommendedStack: [
      'HeaderSimple', 
      'StorySplit', 
      'StoryFounder', 
      'GridFeaturedProducts', 
      'TrustTestimonials', 
      'ConversionNewsletter', 
      'FooterBasic'
    ],
    defaultRootProps: {
      theme: { primaryColor: '#b45309', fontFamily: 'Inter', borderRadius: '0px' },
    },
    validationRules: []
  },
  'event-floral': {
    family: 'event-floral',
    name: 'Event & Floral',
    description: 'Elegant, romantic, and premium for visual inspiration.',
    allowedSections: Object.keys(SECTION_INVENTORY),
    requiredSections: [],
    recommendedStack: [
      'HeaderSimple', 
      'StorySplit', 
      'GridCollections', 
      'MediaGallery', 
      'TrustStats', 
      'ConversionQuoteCTA', 
      'ConversionFAQ', 
      'FooterService'
    ],
    defaultRootProps: {
      theme: { primaryColor: '#be185d', fontFamily: 'Inter', borderRadius: '24px' },
    },
    validationRules: []
  }
};

