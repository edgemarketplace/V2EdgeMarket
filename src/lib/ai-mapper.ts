import { TEMPLATE_MANIFESTS } from './section-manifest';
import { EdgeRootProps, EditorContentBlock, MarketplaceIntakeData, TemplateFamily } from './types';

function buildCta(primaryGoal: MarketplaceIntakeData['primaryGoal']) {
  switch (primaryGoal) {
    case 'booking':
      return 'Book your date';
    case 'quote':
      return 'Request a custom quote';
    case 'catalog':
      return 'Browse the catalog';
    case 'digital':
      return 'Get instant access';
    case 'checkout':
    default:
      return 'Shop the collection';
  }
}

function buildStylePreset(template: TemplateFamily): EdgeRootProps['theme']['stylePreset'] {
  if (template === 'event-floral' || template === 'artisan-market') return 'milano';
  if (template === 'service-pro') return 'minimal';
  return 'standard';
}

function buildNavLinks(goal: MarketplaceIntakeData['primaryGoal']) {
  return [
    { label: 'Story', href: '#story' },
    { label: 'Inventory', href: '#inventory' },
    { label: goal === 'quote' || goal === 'booking' ? 'Contact' : 'Checkout', href: '#contact' },
  ];
}

function createSection(sectionId: string, commonId: string, intake: MarketplaceIntakeData): EditorContentBlock {
  const ctaText = buildCta(intake.primaryGoal);
  const baseHeadline = intake.businessName;
  const baseSubheading = intake.offerings;

  switch (sectionId) {
    case 'HeaderSimple':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: intake.businessName,
          navLinks: buildNavLinks(intake.primaryGoal),
        },
      };
    case 'HeaderPromo':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: intake.businessName,
          promoText: `${ctaText} with ${intake.businessName}`,
        },
      };
    case 'HeaderMega':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: intake.businessName,
        },
      };
    case 'HeroImageLeft':
    case 'HeroFullVisual':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          heading: baseHeadline,
          subheading: `${baseSubheading} Built to convert from first visit to first sale.`,
          ctaText,
          padding: sectionId === 'HeroFullVisual' ? 'large' : undefined,
        },
      };
    case 'HeroProductFirst':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          heading: `${intake.businessName} signature drop`,
          price: '$95',
          ctaText,
        },
      };
    case 'HeroServiceFirst':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          heading: intake.businessName,
          subheading: baseSubheading,
          image: undefined,
          services: [
            { label: 'Consultation' },
            { label: 'Delivery' },
            { label: 'Ongoing support' },
          ],
        },
      };
    case 'GridFeaturedProducts':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Featured inventory',
          items: [
            { name: 'Signature offering', price: '$95', category: 'Featured' },
            { name: 'Seasonal highlight', price: '$125', category: 'New arrival' },
            { name: 'Best seller', price: '$145', category: 'Core line' },
            { name: 'Limited release', price: '$185', category: 'Premium' },
          ],
        },
      };
    case 'GridCollections':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Shop by collection',
          items: [
            { title: 'Best sellers' },
            { title: 'New arrivals' },
          ],
        },
      };
    case 'GridServiceCards':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'What clients book us for',
          description: baseSubheading,
          items: [
            { title: 'Core service', description: 'A reliable offer built for most customers.' },
            { title: 'Premium engagement', description: 'More depth, more customization, more white-glove support.' },
            { title: 'Custom project', description: 'Tailored scope for high-touch or complex work.' },
          ],
        },
      };
    case 'GridPackages':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Choose your package',
          items: [
            { name: 'Starter', price: '$99', ctaText, features: [{ label: 'Clear scope' }, { label: 'Fast launch' }] },
            { name: 'Growth', price: '$249', ctaText, features: [{ label: 'Best value' }, { label: 'Most popular' }, { label: 'Priority support' }] },
            { name: 'Signature', price: '$499', ctaText, features: [{ label: 'White-glove setup' }, { label: 'Custom strategy' }] },
          ],
        },
      };
    case 'StorySplit':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          headline: `Why ${intake.businessName} exists`,
          body: `${intake.businessName} helps customers access ${baseSubheading.toLowerCase()} with more clarity, beauty, and confidence.`,
        },
      };
    case 'StoryValueIcons':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, headline: 'Built on trust, speed, and professional execution' },
      };
    case 'StoryEditorialBand':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          quote: `Everything about ${intake.businessName} is designed to feel intentional and easy to trust.`,
          author: intake.businessName,
        },
      };
    case 'StoryFounder':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          name: `${intake.businessName} founder`,
          bio: `We created ${intake.businessName} to raise the standard for ${baseSubheading.toLowerCase()} in ${intake.serviceArea || 'our market'}.`,
        },
      };
    case 'TrustReviews':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'What customers say',
          reviews: [
            { quote: 'Beautiful experience from first click to final delivery.', author: 'A. Customer', location: intake.serviceArea || 'Local', rating: 5 },
            { quote: 'Professional, polished, and easy to work with.', author: 'B. Client', location: intake.serviceArea || 'Regional', rating: 5 },
          ],
        },
      };
    case 'TrustTestimonials':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Trusted by repeat clients',
          testimonials: [
            { quote: 'They made the process feel effortless.', author: 'Jordan Lee', company: 'Northline Co.' },
            { quote: 'The quality and follow-through stood out immediately.', author: 'Taylor Brooks', company: 'Studio Row' },
          ],
        },
      };
    case 'TrustStats':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, title: 'Proof that builds confidence' },
      };
    case 'MediaGallery':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Gallery highlights',
          images: [{ image: '' }, { image: '' }, { image: '' }, { image: '' }],
        },
      };
    case 'MediaVideo':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, title: 'See the brand in motion' },
      };
    case 'MediaBeforeAfter':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: 'Before and after',
          beforeDescription: 'What customers were dealing with before.',
          afterDescription: 'What success looks like after working with us.',
        },
      };
    case 'ConversionFAQ':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          questions: [
            { q: 'How quickly can we get started?', a: 'Most projects can move within a few business days once details are confirmed.' },
            { q: 'How do you handle custom requests?', a: 'We review the scope, recommend the best path, and tailor the work to fit your needs.' },
          ],
        },
      };
    case 'ConversionNewsletter':
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          heading: 'Stay close to new drops and launch updates',
          description: 'Get new inventory, launch windows, and featured releases in your inbox.',
        },
      };
    case 'ConversionQuoteCTA': {
      const ctaByMode: Record<string, { title: string; ctaText: string; description: string }> = {
        quote: {
          title: 'Request a custom quote',
          ctaText: 'Request Quote',
          description: `Tell us about your project and we'll prepare a tailored proposal for ${intake.businessName}.`,
        },
        booking: {
          title: 'Book your appointment',
          ctaText: 'Book Now',
          description: `Schedule time with ${intake.businessName}. Select a date and we'll confirm your booking.`,
        },
        checkout: {
          title: 'Ready for the next step?',
          ctaText: 'Proceed to Checkout',
          description: `Review your selections and complete your purchase with ${intake.businessName}.`,
        },
      };
      const mode = ctaByMode[intake.primaryGoal] || ctaByMode.quote;
      return {
        id: commonId,
        type: sectionId,
        props: {
          id: commonId,
          title: mode.title,
          description: mode.description,
          ctaText: mode.ctaText,
        },
      };
    }
    case 'ConversionStickyPromo':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, text: `Now live: ${ctaText}` },
      };
    case 'FooterCommerce':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, title: intake.businessName },
      };
    case 'FooterService':
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, title: intake.businessName },
      };
    case 'FooterBasic':
    default:
      return {
        id: commonId,
        type: sectionId,
        props: { id: commonId, text: `© ${new Date().getFullYear()} ${intake.businessName}. All rights reserved.` },
      };
  }
}

function getPagePresets(commerceMode: CommerceMode): Record<string, string[]> {
  const base = {
    about: ["HeaderSimple", "StoryFounder", "StoryEditorialBand", "StoryValueIcons", "FooterCommerce"],
  };

  switch (commerceMode) {
    case 'checkout':
      return {
        ...base,
        home: ["HeaderSimple", "HeroProductFirst", "GridFeaturedProducts", "StorySplit", "TrustReviews", "FooterCommerce"],
        products: ["HeaderSimple", "GridFeaturedProducts", "GridCollections", "ConversionFAQ", "FooterCommerce"],
        contact: ["HeaderSimple", "HeroServiceFirst", "ConversionQuoteCTA", "FooterService"],
      };
    case 'quote':
      return {
        ...base,
        home: ["HeaderSimple", "HeroFullVisual", "GridServiceCards", "TrustTestimonials", "ConversionQuoteCTA", "FooterService"],
        "request-quote": ["HeaderSimple", "HeroServiceFirst", "ConversionQuoteCTA", "FooterService"],
        contact: ["HeaderSimple", "ConversionQuoteCTA", "FooterService"],
      };
    case 'booking':
      return {
        ...base,
        home: ["HeaderSimple", "HeroFullVisual", "GridServiceCards", "TrustReviews", "ConversionQuoteCTA", "FooterService"],
        "book-now": ["HeaderSimple", "HeroServiceFirst", "ConversionQuoteCTA", "FooterService"],
        contact: ["HeaderSimple", "ConversionQuoteCTA", "FooterService"],
      };
    case 'catalog':
      return {
        ...base,
        home: ["HeaderSimple", "HeroImageLeft", "GridCollections", "TrustReviews", "FooterCommerce"],
        products: ["HeaderSimple", "GridFeaturedProducts", "GridCollections", "ConversionFAQ", "FooterCommerce"],
        contact: ["HeaderSimple", "HeroServiceFirst", "ConversionQuoteCTA", "FooterService"],
      };
    case 'digital':
      return {
        ...base,
        home: ["HeaderSimple", "HeroProductFirst", "GridFeaturedProducts", "StorySplit", "ConversionNewsletter", "FooterCommerce"],
        products: ["HeaderSimple", "GridFeaturedProducts", "ConversionFAQ", "FooterCommerce"],
        contact: ["HeaderSimple", "ConversionQuoteCTA", "FooterService"],
      };
    default:
      return {
        ...base,
        home: ["HeaderSimple", "HeroFullVisual", "GridFeaturedProducts", "StorySplit", "TrustReviews", "FooterCommerce"],
        products: ["HeaderSimple", "GridFeaturedProducts", "ConversionFAQ", "FooterCommerce"],
        contact: ["HeaderSimple", "HeroServiceFirst", "ConversionQuoteCTA", "FooterService"],
      };
  }
}

export function mapIntakeToPuckConfig(intake: MarketplaceIntakeData) {
  const templateConfig = TEMPLATE_MANIFESTS[intake.businessType];

  if (!templateConfig) {
    throw new Error('Invalid business type specified.');
  }

  const rootProps: EdgeRootProps = {
    title: intake.businessName || 'Edge Marketplace Site',
    description: intake.offerings || '',
    templateFamily: intake.businessType,
    commerceMode: intake.primaryGoal,
    paymentConfigured: intake.primaryGoal === 'checkout' || intake.primaryGoal === 'digital',
    theme: {
      primaryColor: intake.brandColor || templateConfig.defaultRootProps?.theme?.primaryColor || '#1A1A1A',
      fontFamily: templateConfig.defaultRootProps?.theme?.fontFamily || 'Inter',
      borderRadius: templateConfig.defaultRootProps?.theme?.borderRadius || '0px',
      stylePreset: buildStylePreset(intake.businessType),
    },
    seo: {
      metaTitle: `${intake.businessName} | ${templateConfig.name}`,
      metaDescription: `${intake.businessName}: ${intake.offerings}`,
    },
    businessDetails: {
      name: intake.businessName,
      contactEmail: intake.contactEmail || 'hello@example.com',
      phone: intake.contactPhone,
      address: intake.serviceArea,
    },
  };

  const generatePageContent = (stack: string[]) => {
    return stack.map((sectionId, index) =>
      createSection(sectionId, `${sectionId}-${index}-${Math.random().toString(36).substring(2, 7)}`, intake)
    );
  };

  const buildNavLinks = (pageKey: string) => {
    const links = [{ label: 'Home', href: '/home' }];
    
    switch (intake.primaryGoal) {
      case 'quote':
        links.push({ label: 'Request Quote', href: '/request-quote' });
        links.push({ label: 'About', href: '/about' });
        links.push({ label: 'Contact', href: '/contact' });
        break;
      case 'booking':
        links.push({ label: 'Book Now', href: '/book-now' });
        links.push({ label: 'About', href: '/about' });
        links.push({ label: 'Contact', href: '/contact' });
        break;
      case 'checkout':
      case 'catalog':
      case 'digital':
      default:
        links.push({ label: 'Shop', href: '/products' });
        links.push({ label: 'About', href: '/about' });
        links.push({ label: 'Contact', href: '/contact' });
        break;
    }
    return links;
  };

  const siteData: Record<string, any> = {};
  const presets = getPagePresets(intake.primaryGoal);
  
  // Generate content for each preset page
  Object.entries(presets).forEach(([pageKey, stack]) => {
    const pageContent = generatePageContent(stack);
    
    // Inject correct nav links for this page
    const header = pageContent.find(c => c.type.startsWith('Header'));
    if (header) {
      header.props.navLinks = buildNavLinks(pageKey);
    }

    siteData[pageKey] = {
      content: pageContent,
      root: { props: rootProps }
    };
  });

  return {
    rootProps,
    siteData,
    initialData: siteData['home'],
  };
}
