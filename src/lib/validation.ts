import { EdgeRootProps, ValidationResult, ValidationRule, TemplateDefinition } from './types';
import { TEMPLATE_MANIFESTS } from './section-manifest';

const GLOBAL_RULES: ValidationRule[] = [
  {
    id: 'missing-header',
    severity: 'warning',
    errorMessage: 'Note: A Header Section is missing but not required for preview.',
    evaluate: (data) => data.content?.some((item: any) => ['HeaderSimple', 'HeaderPromo', 'HeaderMega'].includes(item.type))
  },
  {
    id: 'missing-hero',
    severity: 'warning',
    errorMessage: 'Consider adding a Hero Section for better conversion.',
    evaluate: (data) => data.content?.some((item: any) => ['HeroImageLeft', 'HeroFullVisual', 'HeroProductFirst', 'HeroServiceFirst'].includes(item.type))
  },
  {
    id: 'missing-grid',
    severity: 'warning',
    errorMessage: 'A Product/Service grid is recommended to showcase your offerings.',
    evaluate: (data) => data.content?.some((item: any) => ['GridFeaturedProducts', 'GridCollections', 'GridServiceCards', 'GridPackages'].includes(item.type))
  },
  {
    id: 'missing-conversion',
    severity: 'warning',
    errorMessage: 'Adding a Conversion Section (FAQ, Newsletter, etc.) is recommended.',
    evaluate: (data) => data.content?.some((item: any) => ['ConversionFAQ', 'ConversionNewsletter', 'ConversionQuoteCTA', 'ConversionStickyPromo'].includes(item.type))
  },
  {
    id: 'missing-footer',
    severity: 'warning',
    errorMessage: 'A Footer Section is recommended for site navigation.',
    evaluate: (data) => data.content?.some((item: any) => ['FooterBasic', 'FooterCommerce', 'FooterService'].includes(item.type))
  },
  {
    id: 'incomplete-commerce-config',
    severity: 'warning',
    errorMessage: 'Business contact details should be verified.',
    evaluate: (data, rootProps) => {
      // Relaxed for editor phase; full validation happens at deployment
      return !!rootProps?.businessDetails?.contactEmail;
    }
  },
  {
    id: 'missing-seo-basics',
    severity: 'warning',
    errorMessage: 'Consider adding custom SEO meta title and description.',
    evaluate: (data, rootProps) => !!(rootProps?.seo?.metaTitle && rootProps?.seo?.metaDescription)
  }
];

export function validateEditorContent(data: any, rootProps: EdgeRootProps): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const template = TEMPLATE_MANIFESTS[rootProps.templateFamily];

  if (!template) {
    result.errors.push({
      id: 'invalid-template',
      message: 'The selected template family is invalid.',
      severity: 'error'
    });
    result.passed = false;
    return result;
  }

  // Check Template Required Sections
  const contentTypes = data.content?.map((c: any) => c.type) || [];
  
  template.requiredSections.forEach(req => {
    if (!contentTypes.includes(req)) {
      result.errors.push({
        id: `missing-required-${req}`,
        message: `Template requires section: ${req}`,
        severity: 'error'
      });
    }
  });

  // Run Global Rules
  GLOBAL_RULES.concat(template.validationRules || []).forEach(rule => {
    const passed = rule.evaluate(data, rootProps);
    if (!passed) {
      if (rule.severity === 'error') {
        result.errors.push({ id: rule.id, message: rule.errorMessage, severity: 'error' });
      } else {
        result.warnings.push({ id: rule.id, message: rule.errorMessage, severity: 'warning' });
      }
    }
  });

  if (result.errors.length > 0) {
    result.passed = false;
  }

  return result;
}
