import { mapIntakeToPuckConfig } from './ai-mapper';
import { MarketplaceIntakeData, TemplateFamily } from './types';

export const TEMPLATE_EXAMPLES: Record<
  TemplateFamily,
  {
    label: string;
    headline: string;
    summary: string;
    kicker: string;
    intake: MarketplaceIntakeData;
  }
> = {
  'retail-core': {
    label: 'Retail Core',
    kicker: 'Editorial commerce',
    headline: 'Launch a storefront that looks premium from day one.',
    summary: 'Built for shops and product businesses that need strong catalog presentation and fast conversion paths.',
    intake: {
      businessName: 'Northline Supply',
      businessType: 'retail-core',
      offerings: 'Durable home goods and design-forward essentials for modern living.',
      primaryGoal: 'checkout',
      contactEmail: 'hello@northlinesupply.com',
      serviceArea: 'Nationwide',
      tone: 'Confident, premium, minimal',
      brandColor: '#1A1A1A',
    },
  },
  'service-pro': {
    label: 'Service Pro',
    kicker: 'Trust-first services',
    headline: 'Turn expertise into a high-converting service site.',
    summary: 'Optimized for quotes, bookings, before/after proof, and clear service packaging.',
    intake: {
      businessName: 'Summit Studio',
      businessType: 'service-pro',
      offerings: 'Brand strategy, creative direction, and launch support for growth-stage companies.',
      primaryGoal: 'quote',
      contactEmail: 'team@summitstudio.co',
      serviceArea: 'Remote',
      tone: 'Professional, warm, decisive',
      brandColor: '#2563eb',
    },
  },
  'food-catering': {
    label: 'Food & Catering',
    kicker: 'Menus + booking',
    headline: 'Show the menu, prove the quality, and get booked quickly.',
    summary: 'Designed for restaurants, food trucks, catering brands, and event menus.',
    intake: {
      businessName: 'Harvest Table',
      businessType: 'food-catering',
      offerings: 'Seasonal catering menus, private dining, and event packages with locally sourced ingredients.',
      primaryGoal: 'booking',
      contactEmail: 'events@harvesttable.co',
      serviceArea: 'Nashville',
      tone: 'Inviting, elevated, appetite-focused',
      brandColor: '#ea580c',
    },
  },
  'artisan-market': {
    label: 'Artisan Market',
    kicker: 'Maker storytelling',
    headline: 'Sell craft with a story customers can feel.',
    summary: 'For makers, local brands, and handmade businesses where provenance and product detail matter.',
    intake: {
      businessName: 'Cedar & Clay',
      businessType: 'artisan-market',
      offerings: 'Handmade ceramics, textured home decor, and small-batch seasonal collections.',
      primaryGoal: 'catalog',
      contactEmail: 'hello@cedarandclay.com',
      serviceArea: 'Regional + online',
      tone: 'Human, textured, story-rich',
      brandColor: '#b45309',
    },
  },
  'event-floral': {
    label: 'Event & Floral',
    kicker: 'Gallery-led luxury',
    headline: 'Lead with beauty, then turn inspiration into inquiries.',
    summary: 'Ideal for florists, planners, rentals, and event creatives selling premium visual services.',
    intake: {
      businessName: 'Bella Blooms',
      businessType: 'event-floral',
      offerings: 'Luxury floral arrangements for weddings, events, and custom gifting across Nashville.',
      primaryGoal: 'quote',
      contactEmail: 'hello@bellablooms.com',
      serviceArea: 'Nashville',
      tone: 'Elegant, romantic, premium',
      brandColor: '#be185d',
    },
  },
};

export function buildTemplatePreview(templateFamily: TemplateFamily) {
  const config = mapIntakeToPuckConfig(TEMPLATE_EXAMPLES[templateFamily].intake);
  return {
    rootProps: config.rootProps,
    editorData: config.initialData,
  };
}
