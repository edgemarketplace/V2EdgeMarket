export type CommerceMode =
  | 'catalog'
  | 'quote'
  | 'checkout'
  | 'booking'
  | 'digital';

export type TemplateFamily =
  | 'retail-core'
  | 'service-pro'
  | 'food-catering'
  | 'artisan-market'
  | 'event-floral';

export interface EdgeRootProps {
  title: string;
  description: string;
  templateFamily: TemplateFamily;
  commerceMode: CommerceMode;
  mobileResponsiveAck?: boolean;
  paymentConfigured?: boolean;
  theme: {
    primaryColor: string;
    fontFamily: string;
    borderRadius: string;
    stylePreset?: "milano" | "standard" | "minimal";
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
  };
  businessDetails: {
    name: string;
    contactEmail: string;
    phone?: string;
    address?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
}

export interface SectionManifest {
  id: string; // The Puck component name
  label: string;
  description?: string;
  category: string;
  requiredFor?: TemplateFamily[]; // Families where this section MUST be present
  allowedIn?: TemplateFamily[]; // Families where this section CAN be used
  maxOccurrences?: number;
}

export interface TemplateDefinition {
  family: TemplateFamily;
  name: string;
  description: string;
  allowedSections: string[];
  requiredSections: string[];
  recommendedStack: string[];
  defaultRootProps: Partial<EdgeRootProps>;
  validationRules: ValidationRule[];
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  id: string;
  message: string;
  severity: ValidationSeverity;
  sectionId?: string; // If the error is specific to a section
}

export interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  evaluate: (data: any, rootProps: EdgeRootProps) => boolean;
  errorMessage: string;
}

export interface InventoryItem {
  name: string;
  price?: number;
  description?: string;
  category?: string;
}

export interface InventoryData {
  method: 'text' | 'file' | 'manual';
  content?: string; 
  items?: InventoryItem[];
  fileName?: string;
}

export interface MarketplaceIntakeData {
  businessName: string;
  businessType: TemplateFamily;
  offerings: string; // Describe what you sell
  primaryGoal: CommerceMode;
  targetAudience?: string;
  brandVibe?: string;
  tone?: string[];
  contactEmail?: string;
  contactPhone?: string;
  serviceArea?: string;
  brandColor?: string;
  inventory?: InventoryData;
  puckContent?: { [key: string]: any }; // Map of path -> puck data
}

export type PageType = 'home' | 'about' | 'products' | 'product-detail' | 'contact';

export interface PagePreset {
  type: PageType;
  path: string;
  recommendedStack: string[];
}

