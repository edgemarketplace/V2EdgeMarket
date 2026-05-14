// Phase 4: Failure Classification
// Typed failure codes for retries, alerts, UX messaging, and operational handling.

export type FailureCode =
  // Transient — will likely succeed on retry
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'DATABASE_TEMP_UNAVAILABLE'
  | 'SUPABASE_CONNECTION_LIMIT'
  | 'LEASE_EXPIRED'

  // Permanent — will never succeed without intervention
  | 'INVENTORY_MISSING'
  | 'INVENTORY_CORRUPTED'
  | 'INVALID_MANIFEST'
  | 'CONTRACT_MISMATCH'
  | 'BUSINESS_RULE_VIOLATION'

  // User-fixable — the user can resolve it
  | 'MISSING_REQUIRED_FIELD'
  | 'PAYMENT_REQUIRED'
  | 'DOMAIN_UNAVAILABLE'
  | 'EMAIL_NOT_VERIFIED'

  // Infrastructure — platform-side issue
  | 'SUPABASE_PERMANENT_ERROR'
  | 'MEDUSA_DOWN'
  | 'VERCEL_DEPLOY_FAILED'
  | 'DNS_PROPAGATION_TIMEOUT'
  | 'PROVISIONING_QUOTA_EXCEEDED'

  // Third-party — external service failure
  | 'MEDUSA_API_ERROR'
  | 'VERCEL_API_ERROR'
  | 'CLOUDFLARE_API_ERROR'
  | 'PAYMENT_PROCESSOR_ERROR'
  | 'EMAIL_DELIVERY_FAILED'

  // Validation — input/schema issue
  | 'SCHEMA_VALIDATION_FAILED'
  | 'INVALID_TRANSITION'
  | 'IDEMPOTENCY_CONFLICT'
  | 'VERSION_CONFLICT'

  // Catch-all
  | 'UNKNOWN';

export type FailureCategory =
  | 'TRANSIENT'
  | 'PERMANENT'
  | 'USER_FIXABLE'
  | 'INFRASTRUCTURE'
  | 'THIRD_PARTY'
  | 'RATE_LIMIT'
  | 'VALIDATION';

export interface ClassifiedFailure {
  code: FailureCode;
  category: FailureCategory;
  message: string;
  retryable: boolean;
  userVisible: boolean;
  /** Suggested UX message for end users (not operators) */
  userMessage: string;
  /** Minimum recommended cooldown in seconds before retry */
  retryCooldownSec: number;
  /** Should alert on-call? */
  alertOnCall: boolean;
}

const FAILURE_CATALOG: Record<FailureCode, Omit<ClassifiedFailure, 'code' | 'message'>> = {
  // TRANSIENT
  TIMEOUT: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'The operation is taking longer than expected. Please wait.',
    retryCooldownSec: 60,
    alertOnCall: false,
  },
  NETWORK_ERROR: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'A temporary network issue occurred. Retrying automatically.',
    retryCooldownSec: 30,
    alertOnCall: false,
  },
  RATE_LIMITED: {
    category: 'RATE_LIMIT',
    retryable: true,
    userVisible: false,
    userMessage: 'Please wait a moment before trying again.',
    retryCooldownSec: 120,
    alertOnCall: false,
  },
  DATABASE_TEMP_UNAVAILABLE: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'The system is temporarily busy. Please wait.',
    retryCooldownSec: 30,
    alertOnCall: true,
  },
  SUPABASE_CONNECTION_LIMIT: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'The system is at capacity. Please try again shortly.',
    retryCooldownSec: 60,
    alertOnCall: true,
  },
  LEASE_EXPIRED: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'A background task timed out. It will be retried.',
    retryCooldownSec: 10,
    alertOnCall: false,
  },

  // PERMANENT
  INVENTORY_MISSING: {
    category: 'PERMANENT',
    retryable: false,
    userVisible: true,
    userMessage: 'Your store has no products. Add some inventory before publishing.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },
  INVENTORY_CORRUPTED: {
    category: 'PERMANENT',
    retryable: false,
    userVisible: true,
    userMessage: 'Your inventory data is incomplete. Please review and fix your product list.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },
  INVALID_MANIFEST: {
    category: 'PERMANENT',
    retryable: false,
    userVisible: false,
    userMessage: 'The store configuration is invalid. Please contact support.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },
  CONTRACT_MISMATCH: {
    category: 'PERMANENT',
    retryable: false,
    userVisible: false,
    userMessage: 'The store configuration is inconsistent. Please contact support.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },
  BUSINESS_RULE_VIOLATION: {
    category: 'PERMANENT',
    retryable: false,
    userVisible: true,
    userMessage: 'Your store does not meet the requirements for this template. Please adjust your configuration.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },

  // USER_FIXABLE
  MISSING_REQUIRED_FIELD: {
    category: 'USER_FIXABLE',
    retryable: false,
    userVisible: true,
    userMessage: 'Please complete all required fields before publishing.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },
  PAYMENT_REQUIRED: {
    category: 'USER_FIXABLE',
    retryable: false,
    userVisible: true,
    userMessage: 'A payment is required to publish your store.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },
  DOMAIN_UNAVAILABLE: {
    category: 'USER_FIXABLE',
    retryable: false,
    userVisible: true,
    userMessage: 'The domain you selected is not available. Please choose another.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },
  EMAIL_NOT_VERIFIED: {
    category: 'USER_FIXABLE',
    retryable: false,
    userVisible: true,
    userMessage: 'Please verify your email address before publishing.',
    retryCooldownSec: 0,
    alertOnCall: false,
  },

  // INFRASTRUCTURE
  SUPABASE_PERMANENT_ERROR: {
    category: 'INFRASTRUCTURE',
    retryable: false,
    userVisible: false,
    userMessage: 'A system error occurred. Our team has been notified.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },
  MEDUSA_DOWN: {
    category: 'INFRASTRUCTURE',
    retryable: true,
    userVisible: false,
    userMessage: 'The commerce backend is temporarily unavailable. Retrying...',
    retryCooldownSec: 300,
    alertOnCall: true,
  },
  VERCEL_DEPLOY_FAILED: {
    category: 'INFRASTRUCTURE',
    retryable: true,
    userVisible: false,
    userMessage: 'The deployment platform is having issues. Retrying...',
    retryCooldownSec: 120,
    alertOnCall: true,
  },
  DNS_PROPAGATION_TIMEOUT: {
    category: 'INFRASTRUCTURE',
    retryable: true,
    userVisible: true,
    userMessage: 'Your domain is still being configured. This can take up to 48 hours.',
    retryCooldownSec: 3600,
    alertOnCall: false,
  },
  PROVISIONING_QUOTA_EXCEEDED: {
    category: 'INFRASTRUCTURE',
    retryable: false,
    userVisible: false,
    userMessage: 'The platform has reached its provisioning limit. Please contact support.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },

  // THIRD_PARTY
  MEDUSA_API_ERROR: {
    category: 'THIRD_PARTY',
    retryable: true,
    userVisible: false,
    userMessage: 'A commerce service error occurred. Retrying...',
    retryCooldownSec: 60,
    alertOnCall: true,
  },
  VERCEL_API_ERROR: {
    category: 'THIRD_PARTY',
    retryable: true,
    userVisible: false,
    userMessage: 'A deployment service error occurred. Retrying...',
    retryCooldownSec: 60,
    alertOnCall: true,
  },
  CLOUDFLARE_API_ERROR: {
    category: 'THIRD_PARTY',
    retryable: true,
    userVisible: false,
    userMessage: 'A DNS service error occurred. Retrying...',
    retryCooldownSec: 120,
    alertOnCall: true,
  },
  PAYMENT_PROCESSOR_ERROR: {
    category: 'THIRD_PARTY',
    retryable: true,
    userVisible: true,
    userMessage: 'The payment service is temporarily unavailable. Please try again.',
    retryCooldownSec: 60,
    alertOnCall: true,
  },
  EMAIL_DELIVERY_FAILED: {
    category: 'THIRD_PARTY',
    retryable: true,
    userVisible: false,
    userMessage: 'An email notification failed to send.',
    retryCooldownSec: 300,
    alertOnCall: false,
  },

  // VALIDATION
  SCHEMA_VALIDATION_FAILED: {
    category: 'VALIDATION',
    retryable: false,
    userVisible: false,
    userMessage: 'The submitted configuration is invalid.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },
  INVALID_TRANSITION: {
    category: 'VALIDATION',
    retryable: false,
    userVisible: false,
    userMessage: 'An invalid state change was attempted.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },
  IDEMPOTENCY_CONFLICT: {
    category: 'VALIDATION',
    retryable: false,
    userVisible: false,
    userMessage: 'A duplicate request was detected. Please try again.',
    retryCooldownSec: 10,
    alertOnCall: false,
  },
  VERSION_CONFLICT: {
    category: 'VALIDATION',
    retryable: false,
    userVisible: false,
    userMessage: 'Your changes conflict with a recent update. Please refresh and try again.',
    retryCooldownSec: 0,
    alertOnCall: true,
  },

  // UNKNOWN
  UNKNOWN: {
    category: 'TRANSIENT',
    retryable: true,
    userVisible: false,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryCooldownSec: 120,
    alertOnCall: true,
  },
};

/**
 * Classify a failure based on an error or reason string.
 * Falls back to UNKNOWN if no match.
 */
export function classifyFailure(
  reasonOrError: string,
): ClassifiedFailure {
  // Map known reason strings to failure codes
  const code = inferFailureCode(reasonOrError);
  const template = FAILURE_CATALOG[code];
  return {
    code,
    ...template,
    message: reasonOrError || template.userMessage,
  };
}

function inferFailureCode(input: string): FailureCode {
  const lower = input.toLowerCase();

  // Try exact mapping first
  const exactMatch = Object.keys(FAILURE_CATALOG).find(
    (key) => lower === key.toLowerCase(),
  );
  if (exactMatch) return exactMatch as FailureCode;

  // Pattern-based inference
  if (/timeout|timed?\s*out/i.test(lower)) return 'TIMEOUT';
  if (/network|econnrefused|econnreset|enotfound|etimedout/i.test(lower))
    return 'NETWORK_ERROR';
  if (/rate.?limit|429|too many requests/i.test(lower)) return 'RATE_LIMITED';
  if (/database.*(?:temp|unavailable|connection)/i.test(lower))
    return 'DATABASE_TEMP_UNAVAILABLE';
  if (/supabase.*(?:connection|limit|pool)/i.test(lower))
    return 'SUPABASE_CONNECTION_LIMIT';
  if (/lease.*expir/i.test(lower)) return 'LEASE_EXPIRED';
  if (/inventory.*(?:missing|empty|none)/i.test(lower))
    return 'INVENTORY_MISSING';
  if (/inventory.*(?:corrupt|invalid|bad)/i.test(lower))
    return 'INVENTORY_CORRUPTED';
  if (/manifest.*invalid|invalid.*manifest/i.test(lower))
    return 'INVALID_MANIFEST';
  if (/contract.*mismatch|mismatch.*contract/i.test(lower))
    return 'CONTRACT_MISMATCH';
  if (/business.*rule|rule.*violat/i.test(lower))
    return 'BUSINESS_RULE_VIOLATION';
  if (/missing.*(?:field|required)/i.test(lower))
    return 'MISSING_REQUIRED_FIELD';
  if (/payment.*(?:required|needed)/i.test(lower)) return 'PAYMENT_REQUIRED';
  if (/domain.*(?:unavailable|taken|exists)/i.test(lower))
    return 'DOMAIN_UNAVAILABLE';
  if (/email.*(?:not.*verif|unverif|verify.*email)/i.test(lower))
    return 'EMAIL_NOT_VERIFIED';
  if (/supabase.*(?:permanent|fatal|error)/i.test(lower))
    return 'SUPABASE_PERMANENT_ERROR';
  if (/medusa.*(?:down|unreachable|unavailable)/i.test(lower))
    return 'MEDUSA_DOWN';
  if (/vercel.*(?:deploy.*fail|fail.*deploy)/i.test(lower))
    return 'VERCEL_DEPLOY_FAILED';
  if (/dns.*(?:propag|timeout|fail)/i.test(lower))
    return 'DNS_PROPAGATION_TIMEOUT';
  if (/quota.*exceed|exceed.*quota/i.test(lower))
    return 'PROVISIONING_QUOTA_EXCEEDED';
  if (/medusa.*api|medusa.*error/i.test(lower)) return 'MEDUSA_API_ERROR';
  if (/vercel.*api|vercel.*error/i.test(lower)) return 'VERCEL_API_ERROR';
  if (/cloudflare/i.test(lower)) return 'CLOUDFLARE_API_ERROR';
  if (/payment.*processor|stripe.*error/i.test(lower))
    return 'PAYMENT_PROCESSOR_ERROR';
  if (/email.*(?:deliver|send).*fail/i.test(lower))
    return 'EMAIL_DELIVERY_FAILED';
  if (/schema.*valid|valid.*fail|json.*error/i.test(lower))
    return 'SCHEMA_VALIDATION_FAILED';
  if (/invalid.*transition|transition.*invalid/i.test(lower))
    return 'INVALID_TRANSITION';
  if (/idempoten|duplicate.*request/i.test(lower))
    return 'IDEMPOTENCY_CONFLICT';
  if (/version.*conflict|conflict.*version|optimistic.*lock/i.test(lower))
    return 'VERSION_CONFLICT';

  return 'UNKNOWN';
}

/**
 * Given a failure code, return the recommended UX action.
 * Used by the frontend to show appropriate messaging.
 */
export function getFailureUX(code: FailureCode): {
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'retry' | 'fix' | 'wait' | 'contact_support' | 'none';
  headline: string;
} {
  const classified = { code, ...FAILURE_CATALOG[code] };

  switch (classified.category) {
    case 'TRANSIENT':
    case 'RATE_LIMIT':
      return {
        severity: 'info',
        action: 'wait',
        headline: 'Temporary delay — retrying automatically',
      };
    case 'USER_FIXABLE':
      return {
        severity: 'warning',
        action: 'fix',
        headline: 'Action needed',
      };
    case 'PERMANENT':
    case 'VALIDATION':
    case 'INFRASTRUCTURE':
    case 'THIRD_PARTY':
      return {
        severity: classified.alertOnCall ? 'critical' : 'error',
        action: classified.alertOnCall ? 'contact_support' : 'none',
        headline: classified.alertOnCall
          ? 'Our team has been notified'
          : 'Something went wrong',
      };
    default:
      return {
        severity: 'error',
        action: 'retry',
        headline: 'Unexpected error',
      };
  }
}
