import type { Config } from "@measured/puck";
import { EdgeRootProps, TemplateFamily } from "../../lib/types";
import * as Header from "./blocks/Header";
import * as Hero from "./blocks/Hero";
import * as Grid from "./blocks/Grid";
import * as Story from "./blocks/Story";
import * as Trust from "./blocks/Trust";
import * as Media from "./blocks/Media";
import * as Conversion from "./blocks/Conversion";
import * as Footer from "./blocks/Footer";
import {
  commerceComponentConfigs,
  commerceCategories,
} from "../../components/commerce";

// Combine for easy access if needed, or use specific ones
const Blocks = { ...Header, ...Hero, ...Grid, ...Story, ...Trust, ...Media, ...Conversion, ...Footer };

type Props = {
  HeaderSimple: { title: string; navLinks?: { label: string; href: string }[] };
  HeaderPromo: { promoText: string; title: string; navLinks?: { label: string; href: string }[] };
  HeaderMega: { title: string; navLinks?: { label: string; href: string }[] };
  HeroImageLeft: { heading: string; subheading: string; ctaText?: string; image?: string };
  HeroFullVisual: { heading: string; subheading: string; ctaText?: string; padding?: "normal" | "large"; image?: string };
  HeroProductFirst: { heading: string; price: string; ctaText?: string; image?: string };
  HeroProductDetail?: { name: string; price: string; description: string; image?: string; features?: { label: string }[] };
  HeroServiceFirst: { heading: string; subheading: string; services?: { label: string }[]; image?: string };
  GridFeaturedProducts: { title: string; items?: { name: string; price: string; category: string; image: string }[] };
  GridCollections: { title: string; items?: { title: string; image: string }[] };
  GridServiceCards: { title: string; description: string; items?: { title: string; description: string; image?: string }[] };
  GridPackages: { title: string; items?: { name: string; price: string; features: { label: string }[]; ctaText?: string }[] };
  GridProductDetail: { name: string; price: string; description: string; image?: string; features?: { label: string }[] };
  StorySplit: { headline: string; body: string; image?: string };
  StoryValueIcons: { headline: string };
  StoryEditorialBand: { quote: string; author: string };
  StoryFounder: { name: string; bio: string; image?: string };
  TrustReviews: { title: string; reviews?: { quote: string; author: string; location: string; rating: number }[] };
  TrustTestimonials: { title: string; testimonials?: { quote: string; author: string; company: string; image: string }[] };
  TrustLogos: {};
  TrustStats: { title: string };
  MediaGallery: { title: string; images?: { image: string }[] };
  MediaVideo: { title: string };
  MediaBeforeAfter: { 
    title: string; 
    beforeImage?: string; 
    afterImage?: string; 
    beforeLabel?: string; 
    afterLabel?: string;
    beforeDescription?: string;
    afterDescription?: string;
  };
  ConversionFAQ: { questions?: { q: string; a: string }[] };
  ConversionNewsletter: { heading: string; description: string };
  ConversionQuoteCTA: { title: string; description?: string; ctaText?: string };
  ConversionStickyPromo: { text: string };
  FooterBasic: { text: string };
  FooterCommerce: { title: string; description?: string; shopLinks?: { label: string; url: string }[]; supportLinks?: { label: string; url: string }[]; socialLinks?: { platform: string; url: string }[] };
  FooterService: { title: string; description?: string; email?: string; phone?: string; address?: string };
};

export function createPuckConfig(templateFamily: TemplateFamily): Config<Props, EdgeRootProps> {
  return {
    viewports: [
      {
        width: 1280,
        label: "Desktop",
        icon: <div className="w-4 h-4 border-2 border-current rounded-sm" />
      },
      {
        width: 375,
        label: "Mobile",
        icon: <div className="w-3 h-5 border-2 border-current rounded-md" />
      }
    ],
    // @ts-ignore - commerceCategories type mismatch with Puck's Category type
    categories: {
      headers: { components: ["HeaderSimple", "HeaderPromo", "HeaderMega"], title: "Headers" },
      heroes: { components: ["HeroImageLeft", "HeroFullVisual", "HeroProductFirst", "HeroServiceFirst"], title: "Heroes" },
      grids: { components: ["GridFeaturedProducts", "GridCollections", "GridServiceCards", "GridPackages", "GridProductDetail"], title: "Product/Service grids" },
      story: { components: ["StorySplit", "StoryValueIcons", "StoryEditorialBand", "StoryFounder"], title: "Story/content" },
      trust: { components: ["TrustReviews", "TrustTestimonials", "TrustLogos", "TrustStats"], title: "Trust/proof" },
      media: { components: ["MediaGallery", "MediaVideo", "MediaBeforeAfter"], title: "Media" },
      conversion: { components: ["ConversionFAQ", "ConversionNewsletter", "ConversionQuoteCTA", "ConversionStickyPromo"], title: "Conversion" },
      footers: { components: ["FooterBasic", "FooterCommerce", "FooterService"], title: "Footers" },
      // Commerce-native components
      ...commerceCategories,
    },
    root: {
      // @ts-ignore - We only want to expose specific fields in the root editor, not all of EdgeRootProps
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        theme: {
          type: "object",
          objectFields: {
            stylePreset: {
              type: "select",
              options: [
                { label: "Milano (Luxury)", value: "milano" },
                { label: "Standard (Modern)", value: "standard" },
                { label: "Minimal (Clean)", value: "minimal" }
              ]
            },
            primaryColor: { type: "text" },
            fontFamily: { type: "text" },
            borderRadius: { type: "text" }
          }
        }
      },
      render: ({ children, ...props }) => {
         const isMilano = props?.theme?.stylePreset === 'milano';
         return (
           <div 
            style={{ 
              ['--primary-color' as any]: props?.theme?.primaryColor,
              fontFamily: props?.theme?.fontFamily
            }} 
            className={`min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col ${isMilano ? 'milano-theme font-serif' : 'font-sans'}`}
          >
             {children}
           </div>
         );
      }
    },
    components: {
      // Commerce-native components (Priority C)
      ...commerceComponentConfigs.components,

      // HEADERS
      HeaderSimple: {
        fields: { title: { type: "text" }, navLinks: { type: "array", arrayFields: { label: { type: "text" }, href: { type: "text" } } } },
        defaultProps: { title: "Brand", navLinks: [{ label: "Home", href: "#" }] },
        render: (props: any) => <Blocks.HeaderSimple {...props} />
      },
      HeaderPromo: {
        fields: { 
          promoText: { type: "text" }, 
          title: { type: "text" },
          navLinks: { type: "array", arrayFields: { label: { type: "text" }, href: { type: "text" } } }
        },
        defaultProps: { promoText: "Free shipping on orders over $50", title: "Brand", navLinks: [{ label: "Home", href: "#" }] },
        render: (props: any) => <Blocks.HeaderPromo {...props} />
      },
      HeaderMega: {
        fields: { 
          title: { type: "text" },
          navLinks: { type: "array", arrayFields: { label: { type: "text" }, href: { type: "text" } } }
        },
        defaultProps: { title: "Brand", navLinks: [{ label: "Home", href: "#" }] },
        render: (props: any) => <Blocks.HeaderMega {...props} />
      },
      
      // HEROES
      HeroImageLeft: {
        fields: { heading: { type: "text" }, subheading: { type: "text" }, ctaText: { type: "text" }, image: { type: "text" } },
        defaultProps: { heading: "Welcome", subheading: "We deliver excellence.", ctaText: "Start", image: "" },
        render: (props: any) => <Blocks.HeroImageLeft {...props} />
      },
      HeroFullVisual: {
        fields: { heading: { type: "text" }, subheading: { type: "text" }, ctaText: { type: "text" }, image: { type: "text" }, padding: { type: "select", options: [{ label: "Normal", value: "normal" }, { label: "Large", value: "large" }] } },
        defaultProps: { heading: "Welcome", subheading: "Quality matters.", ctaText: "Start", image: "", padding: "normal" },
        render: (props: any) => <Blocks.HeroFullVisual {...props} />
      },
      HeroProductFirst: {
        fields: { heading: { type: "text" }, price: { type: "text" }, ctaText: { type: "text" }, image: { type: "text" } },
        defaultProps: { heading: "Product Name", price: "$99", ctaText: "Buy Now", image: "" },
        render: (props: any) => <Blocks.HeroProductFirst {...props} />
      },
      HeroServiceFirst: {
        fields: { 
          heading: { type: "text" }, 
          subheading: { type: "text" },
          image: { type: "text" },
          services: { type: "array", arrayFields: { label: { type: "text" } } }
        },
        defaultProps: { 
          heading: "Our Services", 
          subheading: "What we do best",
          image: "",
          services: [{ label: "Consulting" }, { label: "Design" }, { label: "Development" }]
        },
        render: (props: any) => <Blocks.HeroServiceFirst {...props} />
      },
      
      // GRIDS
      GridFeaturedProducts: {
        fields: { 
          title: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              name: { type: "text" },
              price: { type: "text" },
              category: { type: "text" },
              image: { type: "text" }
            }
          }
        },
        defaultProps: { title: "Featured Products" },
        render: (props: any) => <Blocks.GridFeaturedProducts {...props} />
      },
      GridCollections: {
        fields: { 
          title: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              title: { type: "text" },
              image: { type: "text" }
            }
          }
        },
        defaultProps: { title: "Collections" },
        render: (props: any) => <Blocks.GridCollections {...props} />
      },
      GridServiceCards: {
        fields: { title: { type: "text" }, description: { type: "textarea" }, items: { type: "array", arrayFields: { title: { type: "text" }, description: { type: "text" }, image: { type: "text" } } } },
        defaultProps: { title: "Services", description: "What we offer." },
        render: (props: any) => <Blocks.GridServiceCards {...props} />
      },
      GridPackages: { 
        fields: { 
          title: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              name: { type: "text" },
              price: { type: "text" },
              ctaText: { type: "text" },
              features: {
                type: "array",
                arrayFields: {
                  label: { type: "text" }
                }
              }
            }
          }
        },
        defaultProps: { 
          title: "Pricing & Packages",
          items: [
            { name: "Basic", price: "$99", ctaText: "Select Basic", features: [{ label: "Feature 1" }, { label: "Feature 2" }] },
            { name: "Pro", price: "$199", ctaText: "Select Pro", features: [{ label: "Feature 1" }, { label: "Feature 2" }, { label: "Feature 3" }] },
            { name: "Elite", price: "$299", ctaText: "Select Elite", features: [{ label: "Feature 1" }, { label: "Feature 2" }, { label: "Feature 3" }, { label: "Feature 4" }] }
          ]
        },
        render: (props: any) => <Blocks.GridPackages {...props} />
      },
      GridProductDetail: {
        fields: { 
          name: { type: "text" }, 
          price: { type: "text" }, 
          description: { type: "textarea" }, 
          image: { type: "text" },
          features: { type: "array", arrayFields: { label: { type: "text" } } }
        },
        defaultProps: { name: "Product Name", price: "$99", description: "Detailed description." },
        render: (props: any) => <Blocks.GridProductDetail {...props} />
      },
      
      // STORY
      StorySplit: {
        fields: { headline: { type: "text" }, body: { type: "textarea" }, image: { type: "text" } },
        defaultProps: { headline: "Our Story", body: "We believe in better.", image: "" },
        render: (props: any) => <Blocks.StorySplit {...props} />
      },
      StoryValueIcons: {
        fields: { headline: { type: "text" } },
        defaultProps: { headline: "Our Values" },
        render: (props: any) => <Blocks.StoryValueIcons {...props} />
      },
      StoryEditorialBand: {
        fields: { quote: { type: "textarea" }, author: { type: "text" } },
        defaultProps: { quote: "Design is intelligence made visible.", author: "Alina Wheeler" },
        render: (props: any) => <Blocks.StoryEditorialBand {...props} />
      },
      StoryFounder: {
        fields: { name: { type: "text" }, bio: { type: "textarea" }, image: { type: "text" } },
        defaultProps: { name: "Jane Doe", bio: "Founder and CEO", image: "" },
        render: (props: any) => <Blocks.StoryFounder {...props} />
      },
      
      // TRUST
      TrustReviews: {
        fields: { 
          title: { type: "text" },
          reviews: {
            type: "array",
            arrayFields: {
              quote: { type: "textarea" },
              author: { type: "text" },
              location: { type: "text" },
              rating: { type: "number" }
            }
          }
        },
        defaultProps: { title: "Customer Reviews" },
        render: (props: any) => <Blocks.TrustReviews {...props} />
      },
      TrustTestimonials: {
        fields: { 
          title: { type: "text" },
          testimonials: {
            type: "array",
            arrayFields: {
              quote: { type: "textarea" },
              author: { type: "text" },
              company: { type: "text" },
              image: { type: "text" }
            }
          }
        },
        defaultProps: { title: "Client Testimonials" },
        render: (props: any) => <Blocks.TrustTestimonials {...props} />
      },
      TrustLogos: {
        fields: {},
        defaultProps: {},
        render: (props: any) => <Blocks.TrustLogos {...props} />
      },
      TrustStats: {
        fields: { title: { type: "text" } },
        defaultProps: { title: "By the Numbers" },
        render: (props: any) => <Blocks.TrustStats {...props} />
      },
      
      // MEDIA
      MediaGallery: {
        fields: { title: { type: "text" }, images: { type: "array", arrayFields: { image: { type: "text" } } } },
        defaultProps: { title: "Gallery" },
        render: (props: any) => <Blocks.MediaGallery {...props} />
      },
      MediaVideo: {
        fields: { title: { type: "text" } },
        defaultProps: { title: "Watch Video" },
        render: (props: any) => <Blocks.MediaVideo {...props} />
      },
      MediaBeforeAfter: {
        fields: { 
          title: { type: "text" },
          beforeImage: { type: "text" },
          afterImage: { type: "text" },
          beforeLabel: { type: "text" },
          afterLabel: { type: "text" },
          beforeDescription: { type: "textarea" },
          afterDescription: { type: "textarea" }
        },
        defaultProps: { 
          title: "The Transformation", 
          beforeLabel: "Before", 
          afterLabel: "After",
          beforeImage: "",
          afterImage: "",
          beforeDescription: "Our starting point with the project.",
          afterDescription: "The final result after our intervention."
        },
        render: (props: any) => <Blocks.MediaBeforeAfter {...props} />
      },
      
      // CONVERSION
      ConversionFAQ: {
        fields: { questions: { type: "array", arrayFields: { q: { type: "text" }, a: { type: "textarea" } } } },
        defaultProps: { questions: [{ q: "What is your return policy?", a: "30 days." }] },
        render: (props: any) => <Blocks.ConversionFAQ {...props} />
      },
      ConversionNewsletter: {
        fields: { heading: { type: "text" }, description: { type: "text" } },
        defaultProps: { heading: "Join Us", description: "Get our latest news." },
        render: (props: any) => <Blocks.ConversionNewsletter {...props} />
      },
      ConversionQuoteCTA: {
        fields: { 
          title: { type: "text" },
          description: { type: "textarea" },
          ctaText: { type: "text" }
        },
        defaultProps: { title: "Get Started" },
        render: (props: any) => <Blocks.ConversionQuoteCTA {...props} />
      },
      ConversionStickyPromo: {
        fields: { text: { type: "text" } },
        defaultProps: { text: "Limited time offer: 20% off!" },
        render: (props: any) => <Blocks.ConversionStickyPromo {...props} />
      },
      
      // FOOTERS
      FooterBasic: {
        fields: { text: { type: "text" } },
        defaultProps: { text: "© 2026 Brand" },
        render: (props: any) => <Blocks.FooterBasic {...props} />
      },
      FooterCommerce: {
        fields: { 
          title: { type: "text" },
          description: { type: "textarea" },
          shopLinks: { type: "array", arrayFields: { label: { type: "text" }, url: { type: "text" } } },
          supportLinks: { type: "array", arrayFields: { label: { type: "text" }, url: { type: "text" } } },
          socialLinks: { type: "array", arrayFields: { platform: { type: "text" }, url: { type: "text" } } }
        },
        defaultProps: { title: "Brand" },
        render: (props: any) => <Blocks.FooterCommerce {...props} />
      },
      FooterService: {
        fields: { 
          title: { type: "text" },
          description: { type: "textarea" },
          email: { type: "text" },
          phone: { type: "text" },
          address: { type: "textarea" }
        },
        defaultProps: { title: "Brand" },
        render: (props: any) => <Blocks.FooterService {...props} />
      }
    }
  };
}
