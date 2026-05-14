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

export type LaunchPlan = 'launch' | 'pro';

export type SiteLifecycleStatus =
  | 'draft'
  | 'editing'
  | 'inventory'
  | 'launch_ready'
  | 'deploy_requested'
  | 'provisioning'
  | 'syncing_inventory'
  | 'storefront_building'
  | 'dns_pending'
  | 'live'
  | 'failed';

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
    stylePreset?: 'milano' | 'standard' | 'minimal';
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
  id: string;
  label: string;
  description?: string;
  category: string;
  requiredFor?: TemplateFamily[];
  allowedIn?: TemplateFamily[];
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
  sectionId?: string;
}

export interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  evaluate: (data: EditorData, rootProps: EdgeRootProps) => boolean;
  errorMessage: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  price?: number | string;
  description?: string;
  category?: string;
  image?: string;
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
  offerings: string;
  primaryGoal: CommerceMode;
  targetAudience?: string;
  brandVibe?: string;
  tone?: string;
  contactEmail?: string;
  contactPhone?: string;
  serviceArea?: string;
  brandColor?: string;
  inventory?: InventoryData;
}

export interface EditorContentBlock<TProps = Record<string, unknown>> {
  id: string;
  type: string;
  props: TProps & { id?: string };
}

export interface EditorData {
  root?: {
    props?: Partial<EdgeRootProps>;
  };
  content: EditorContentBlock[];
}

export interface GridFeaturedProductItem {
  name: string;
  price: string;
  category: string;
  image?: string;
}

export interface GridCollectionItem {
  title: string;
  image?: string;
}

export interface GridServiceCardItem {
  title: string;
  description: string;
  image?: string;
}

export interface GridPackageItem {
  name: string;
  price: string;
  features: { label: string }[];
  ctaText?: string;
}

export interface ReviewItem {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  company: string;
  image?: string;
}

export type GridDataSource = 'manual' | 'inventory';

export interface PuckComponentPropsMap {
  HeaderSimple: { title: string; navLinks?: { label: string; href: string }[] };
  HeaderPromo: { promoText: string; title: string };
  HeaderMega: { title: string };
  HeroImageLeft: { heading: string; subheading: string; ctaText?: string; image?: string };
  HeroFullVisual: {
    heading: string;
    subheading: string;
    ctaText?: string;
    padding?: 'normal' | 'large';
    image?: string;
  };
  HeroProductFirst: { heading: string; price: string; ctaText?: string; image?: string };
  HeroServiceFirst: { heading: string; subheading: string; services?: { label: string }[]; image?: string };
  GridFeaturedProducts: { title: string; items?: GridFeaturedProductItem[]; dataSource?: GridDataSource };
  GridCollections: { title: string; items?: GridCollectionItem[]; dataSource?: GridDataSource };
  GridServiceCards: { title: string; description: string; items?: GridServiceCardItem[]; dataSource?: GridDataSource };
  GridPackages: { title: string; items?: GridPackageItem[]; dataSource?: GridDataSource };
  StorySplit: { headline: string; body: string; image?: string };
  StoryValueIcons: { headline: string };
  StoryEditorialBand: { quote: string; author: string };
  StoryFounder: { name: string; bio: string; image?: string };
  TrustReviews: { title: string; reviews?: ReviewItem[] };
  TrustTestimonials: { title: string; testimonials?: TestimonialItem[] };
  TrustLogos: Record<string, never>;
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
  FooterCommerce: {
    title: string;
    description?: string;
    shopLinks?: { label: string; url: string }[];
    supportLinks?: { label: string; url: string }[];
    socialLinks?: { platform: string; url: string }[];
  };
  FooterService: {
    title: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface WorkflowBlocker {
  code: string;
  message: string;
  cta?: {
    label: string;
    action: 'open_inventory' | 'configure_checkout' | 'resolve_blockers' | 'open_editor';
  };
}

export interface WorkflowState {
  currentStep: 'editor' | 'inventory' | 'checkout' | 'launch' | 'live';
  completedSteps: ('editor' | 'inventory' | 'checkout' | 'launch' | 'live')[];
  blockedReasons: WorkflowBlocker[];
  lastTransitionAt?: string;
  lastTransitionActor?: 'user' | 'system' | 'webhook';
}

export interface MarketplaceSiteDraft {
  siteId: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status: SiteLifecycleStatus;
  workflowState?: WorkflowState;
  selectedPlan?: LaunchPlan;
  intakeData: MarketplaceIntakeData;
  templateFamily: TemplateFamily;
  rootProps: EdgeRootProps;
  editorData: EditorData;
  inventoryItems: InventoryItem[];
  inventorySource?: InventoryData['method'];
  deployment?: DeploymentRecord;
  siteToken?: string;
  serverPersisted?: boolean;
}

export interface MedusaSyncResult {
  attempted: boolean;
  success: boolean;
  message: string;
  productCount?: number;
  httpStatus?: number;
}

export interface DeploymentHistoryEntry {
  status: SiteLifecycleStatus;
  message: string;
  at: string;
  source: 'request' | 'reconciler' | 'webhook' | 'system';
  /** Phase 4: correlation ID at the time of this event */
  correlationId?: string;
  /** Phase 4: reconcile run ID if applied by reconciler */
  reconcileRunId?: string;
  /** Phase 4: lease holder if applied under a lease */
  leaseHolder?: string;
}

export interface DeploymentRecord {
  deploymentId: string;
  siteId: string;
  status: SiteLifecycleStatus;
  plan: LaunchPlan;
  idempotencyKey: string;
  attemptCount: number;
  requestedAt: string;
  updatedAt: string;
  deployedAt?: string;
  publishUrl?: string;
  message?: string;
  medusaSync?: MedusaSyncResult;
  failureStage?: SiteLifecycleStatus;
  failureReason?: string;
  provisioningId?: string;
  vercelDeploymentId?: string;
  history: DeploymentHistoryEntry[];
  /** Phase 4: last correlation ID that touched this deployment */
  correlationId?: string;
  /** Phase 4: lease holder if currently leased */
  leaseHolder?: string;
  /** Phase 4: last reconcile run ID */
  reconcileRunId?: string;
}

export interface LaunchRequest {
  siteId: string;
  selectedPlan: LaunchPlan;
  ownerName: string;
  email: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface CheckoutIntentRecord {
  id: string;
  siteId: string;
  customerName: string;
  email: string;
  phone?: string;
  productInterest?: string;
  notes?: string;
  createdAt: string;
}
