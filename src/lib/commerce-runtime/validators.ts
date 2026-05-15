/**
 * Validators Runtime Module
 * Validates commerce entities (products, services, packages, booking slots)
 */

import {
  InventoryItem,
  InventoryEntityType,
  AvailabilityWindow,
} from '../types';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a generic inventory item
 */
export function validateInventoryItem(item: Partial<InventoryItem>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!item.name || item.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (item.price !== undefined) {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    if (isNaN(price) || price < 0) {
      errors.push({
        field: 'price',
        message: 'Price must be a valid non-negative number',
        code: 'INVALID_PRICE',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a product entity
 */
export function validateProduct(item: Partial<InventoryItem>): ValidationResult {
  const base = validateInventoryItem(item);
  const errors = [...base.errors];

  if (item.type && item.type !== 'product') {
    errors.push({
      field: 'type',
      message: 'Item type must be "product"',
      code: 'INVALID_TYPE',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a service entity
 */
export function validateService(item: Partial<InventoryItem>): ValidationResult {
  const base = validateInventoryItem(item);
  const errors = [...base.errors];

  if (item.type && item.type !== 'service') {
    errors.push({
      field: 'type',
      message: 'Item type must be "service"',
      code: 'INVALID_TYPE',
    });
  }

  if (item.duration !== undefined && (item.duration < 0 || item.duration > 1440)) {
    errors.push({
      field: 'duration',
      message: 'Duration must be between 0 and 1440 minutes (24 hours)',
      code: 'INVALID_DURATION',
    });
  }

  if (item.serviceRadius !== undefined && item.serviceRadius < 0) {
    errors.push({
      field: 'serviceRadius',
      message: 'Service radius must be non-negative',
      code: 'INVALID_SERVICE_RADIUS',
    });
  }

  if (
    item.pricingModel &&
    !['hourly', 'fixed', 'package', 'subscription'].includes(item.pricingModel)
  ) {
    errors.push({
      field: 'pricingModel',
      message: 'Invalid pricing model',
      code: 'INVALID_PRICING_MODEL',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a package/subscription entity
 */
export function validatePackage(item: Partial<InventoryItem>): ValidationResult {
  const base = validateInventoryItem(item);
  const errors = [...base.errors];

  if (
    item.type &&
    item.type !== 'package' &&
    item.type !== 'subscription'
  ) {
    errors.push({
      field: 'type',
      message: 'Item type must be "package" or "subscription"',
      code: 'INVALID_TYPE',
    });
  }

  if (
    item.billingCycle &&
    !['monthly', 'yearly', 'one-time'].includes(item.billingCycle)
  ) {
    errors.push({
      field: 'billingCycle',
      message: 'Invalid billing cycle',
      code: 'INVALID_BILLING_CYCLE',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate availability window
 */
export function validateAvailabilityWindow(window: Partial<AvailabilityWindow>): ValidationResult {
  const errors: ValidationError[] = [];

  if (window.dayOfWeek === undefined || window.dayOfWeek < 0 || window.dayOfWeek > 6) {
    errors.push({
      field: 'dayOfWeek',
      message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
      code: 'INVALID_DAY',
    });
  }

  if (!window.startTime || !/^\d{2}:\d{2}$/.test(window.startTime)) {
    errors.push({
      field: 'startTime',
      message: 'Start time must be in HH:MM format',
      code: 'INVALID_TIME_FORMAT',
    });
  }

  if (!window.endTime || !/^\d{2}:\d{2}$/.test(window.endTime)) {
    errors.push({
      field: 'endTime',
      message: 'End time must be in HH:MM format',
      code: 'INVALID_TIME_FORMAT',
    });
  }

  if (window.slotDuration !== undefined && window.slotDuration <= 0) {
    errors.push({
      field: 'slotDuration',
      message: 'Slot duration must be positive',
      code: 'INVALID_SLOT_DURATION',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate inventory array
 */
export function validateInventory(inventory: Partial<InventoryItem>[]): {
  valid: boolean;
  results: { item: Partial<InventoryItem>; result: ValidationResult }[];
} {
  const results = inventory.map((item) => {
    let result: ValidationResult;

    switch (item.type) {
      case 'product':
        result = validateProduct(item);
        break;
      case 'service':
        result = validateService(item);
        break;
      case 'package':
      case 'subscription':
        result = validatePackage(item);
        break;
      default:
        result = validateInventoryItem(item);
    }

    return { item, result };
  });

  return {
    valid: results.every((r) => r.result.valid),
    results,
  };
}
