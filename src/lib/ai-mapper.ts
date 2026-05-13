import { EdgeRootProps, MarketplaceIntakeData, TemplateDefinition } from './types';
import { TEMPLATE_MANIFESTS } from './section-manifest';

export function mapIntakeToPuckConfig(intake: MarketplaceIntakeData) {
  const templateConfig = TEMPLATE_MANIFESTS[intake.businessType];
  
  if (!templateConfig) {
    throw new Error("Invalid business type specified.");
  }

  // Generate Root Props
  const rootProps: EdgeRootProps = {
    title: intake.businessName || 'My Marketplace',
    description: intake.offerings || '',
    templateFamily: intake.businessType,
    commerceMode: intake.primaryGoal,
    theme: {
      primaryColor: intake.brandColor || templateConfig.defaultRootProps?.theme?.primaryColor || '#000000',
      fontFamily: templateConfig.defaultRootProps?.theme?.fontFamily || 'Inter',
      borderRadius: templateConfig.defaultRootProps?.theme?.borderRadius || '0px'
    },
    seo: {
      metaTitle: `${intake.businessName} - Official Site`,
      metaDescription: `Discover the best ${intake.offerings} from ${intake.businessName}.`
    },
    businessDetails: {
      name: intake.businessName,
      contactEmail: intake.contactEmail || 'contact@example.com',
      phone: intake.contactPhone,
      address: intake.serviceArea
    }
  };

  // Generate Starter Content Array based on Recommended Stack
  const starterContent = templateConfig.recommendedStack.map((sectionId, index) => {
    let item: any;
    const commonId = `${sectionId}-${index}`;
    
    switch(sectionId) {
      case 'HeaderSimple':
      case 'HeaderMega':
        item = {
          type: sectionId,
          props: {
            id: commonId,
            title: intake.businessName,
            navLinks: [
              { label: 'Offerings', href: '#offerings' },
              { label: 'About', href: '#about' },
              { label: 'Contact', href: '#contact' }
            ]
          }
        };
        break;
      case 'HeaderPromo':
        item = {
          type: 'HeaderPromo',
          props: {
            id: commonId,
            title: intake.businessName,
            promoText: `Welcome to ${intake.businessName} - Expert ${intake.offerings}`
          }
        };
        break;
      case 'HeroFullVisual':
      case 'HeroImageLeft':
      case 'HeroServiceFirst':
      case 'HeroProductFirst':
        item = {
          type: sectionId,
          props: {
            id: commonId,
            heading: intake.businessName,
            subheading: `Premium ${intake.offerings} tailored for you.`,
            ctaText: intake.primaryGoal === 'booking' ? 'Book Now' : 'Shop Now',
            price: index === 0 ? '$99' : undefined,
            services: sectionId === 'HeroServiceFirst' ? [
              { label: 'Consulting' },
              { label: 'Custom Projects' },
              { label: 'Support' }
            ] : undefined
          }
        };
        break;
      case 'GridFeaturedProducts':
      case 'GridCollections':
        item = {
          type: sectionId,
          props: {
            id: commonId,
            title: "Featured Offerings"
          }
        };
        break;
      case 'GridServiceCards':
        item = {
          type: 'GridServiceCards',
          props: {
            id: commonId,
            title: "Our Services",
            description: `We specialize in ${intake.offerings}.`,
            items: [
              { title: "Standard Service", description: "High quality results.", image: "" },
              { title: "Premium Service", description: "Above and beyond.", image: "" },
              { title: "Custom Solution", description: "Tailored to your needs.", image: "" }
            ]
          }
        };
        break;
      case 'GridPackages':
        item = {
          type: 'GridPackages',
          props: {
            id: commonId,
            title: "Available Packages",
            items: [
              { name: "Starter", price: "$99", ctaText: "Get Started", features: [{ label: "Basic Access" }, { label: "Email Support" }] },
              { name: "Premium", price: "$199", ctaText: "Go Premium", features: [{ label: "Full Access" }, { label: "24/7 Support" }, { label: "Custom Domain" }] },
              { name: "Enterprise", price: "$299", ctaText: "Contact Sales", features: [{ label: "Unlimited Everything" }, { label: "Dedicated Manager" }] }
            ]
          }
        };
        break;
      case 'StorySplit':
        item = {
          type: 'StorySplit',
          props: {
            id: commonId,
            headline: "The Craftsmanship",
            body: `Discover how we bring ${intake.offerings} to life with passion and precision.`
          }
        };
        break;
      case 'StoryValueIcons':
        item = {
          type: 'StoryValueIcons',
          props: {
            id: commonId,
            headline: "Why Choose Us"
          }
        };
        break;
      case 'StoryFounder':
        item = {
          type: 'StoryFounder',
          props: {
            id: commonId,
            name: "Founder Name",
            bio: `Driven by a mission to provide the best ${intake.offerings} in ${intake.serviceArea || 'the area'}.`
          }
        };
        break;
      case 'TrustReviews':
      case 'TrustTestimonials':
        item = {
          type: sectionId,
          props: {
            id: commonId,
            title: "What People Say"
          }
        };
        break;
      case 'TrustStats':
        item = {
          type: 'TrustStats',
          props: {
            id: commonId,
            title: "By the Numbers"
          }
        };
        break;
      case 'MediaGallery':
        item = {
          type: 'MediaGallery',
          props: {
            id: commonId,
            title: "Our Portfolio",
            images: [{ image: "" }, { image: "" }, { image: "" }]
          }
        };
        break;
      case 'MediaBeforeAfter':
        item = {
          type: 'MediaBeforeAfter',
          props: {
            id: commonId,
            title: "The Transformation"
          }
        };
        break;
      case 'ConversionFAQ':
        item = {
          type: 'ConversionFAQ',
          props: {
            id: commonId,
            questions: [
              { q: `What kind of ${intake.offerings} do you provide?`, a: `We provide professional ${intake.offerings}.` },
              { q: "How can I contact you?", a: `You can reach us at ${intake.contactEmail || 'our email'}.` }
            ]
          }
        };
        break;
      case 'ConversionNewsletter':
        item = {
          type: 'ConversionNewsletter',
          props: {
            id: commonId,
            heading: "Stay Informed",
            description: "Join our list for exclusive updates."
          }
        };
        break;
      case 'ConversionQuoteCTA':
        item = {
          type: 'ConversionQuoteCTA',
          props: {
            id: commonId,
            title: "Start Your Project"
          }
        };
        break;
      case 'ConversionStickyPromo':
        item = {
          type: 'ConversionStickyPromo',
          props: {
            id: commonId,
            text: "Limited Time Offer: 10% Off Your First Order"
          }
        };
        break;
      case 'FooterBasic':
      case 'FooterCommerce':
      case 'FooterService':
        item = {
          type: sectionId,
          props: {
            id: commonId,
            title: intake.businessName,
            text: `© ${new Date().getFullYear()} ${intake.businessName}. All rights reserved.`
          }
        };
        break;
      default:
        item = { type: sectionId, props: { id: commonId } };
    }
    return { ...item, id: item.props.id };
  });

  return {
    rootProps,
    initialData: {
      content: starterContent,
      root: { props: rootProps }
    }
  };
}
