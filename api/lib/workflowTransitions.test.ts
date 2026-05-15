import { describe, it, expect } from 'vitest';
import {
  workflowTransitionMatrix,
  isTransitionAllowed,
  getTransitionPrerequisites,
} from './workflowTransitions';
import { getWorkflowBlockers } from './workflowActions';
import { SiteLifecycleStatus } from './types';

describe('Workflow Transition Matrix', () => {
  it('includes all transitions from existing siteStore.ts transitionAllowed', () => {
    const siteStoreTransitions: Partial<Record<SiteLifecycleStatus, SiteLifecycleStatus[]>> = {
      deploy_requested: ['provisioning', 'syncing_inventory', 'storefront_building', 'failed'],
      provisioning: ['syncing_inventory', 'storefront_building', 'failed'],
      syncing_inventory: ['storefront_building', 'failed'],
      storefront_building: ['dns_pending', 'live', 'failed'],
      dns_pending: ['live', 'failed'],
    };

    for (const [from, toStates] of Object.entries(siteStoreTransitions)) {
      for (const to of toStates!) {
        const exists = workflowTransitionMatrix.some(
          t => t.from === from && t.to === to
        );
        expect(exists).toBe(true);
      }
    }
  });

  it('allows same-state transitions for all lifecycle statuses', () => {
    const allStatuses: SiteLifecycleStatus[] = [
      'draft', 'editing', 'inventory', 'launch_ready', 'deploy_requested',
      'provisioning', 'syncing_inventory', 'storefront_building', 'dns_pending', 'live', 'failed'
    ];

    for (const status of allStatuses) {
      const transition = workflowTransitionMatrix.find(
        t => t.from === status && t.to === status
      );
      expect(transition).toBeDefined();
      expect(transition?.prerequisites).toEqual([]);
      expect(transition?.sideEffects).toEqual(['No state change']);
    }
  });
});

describe('isTransitionAllowed', () => {
  it('returns true for same state transitions', () => {
    expect(isTransitionAllowed('draft', 'draft')).toBe(true);
    expect(isTransitionAllowed('live', 'live')).toBe(true);
    expect(isTransitionAllowed('failed', 'failed')).toBe(true);
  });

  it('matches existing transitionAllowed logic for deployment lifecycle', () => {
    // Valid transitions from siteStore.ts
    expect(isTransitionAllowed('deploy_requested', 'provisioning')).toBe(true);
    expect(isTransitionAllowed('deploy_requested', 'syncing_inventory')).toBe(true);
    expect(isTransitionAllowed('deploy_requested', 'storefront_building')).toBe(true);
    expect(isTransitionAllowed('deploy_requested', 'failed')).toBe(true);

    expect(isTransitionAllowed('provisioning', 'syncing_inventory')).toBe(true);
    expect(isTransitionAllowed('provisioning', 'storefront_building')).toBe(true);
    expect(isTransitionAllowed('provisioning', 'failed')).toBe(true);

    expect(isTransitionAllowed('syncing_inventory', 'storefront_building')).toBe(true);
    expect(isTransitionAllowed('syncing_inventory', 'failed')).toBe(true);

    expect(isTransitionAllowed('storefront_building', 'dns_pending')).toBe(true);
    expect(isTransitionAllowed('storefront_building', 'live')).toBe(true);
    expect(isTransitionAllowed('storefront_building', 'failed')).toBe(true);

    expect(isTransitionAllowed('dns_pending', 'live')).toBe(true);
    expect(isTransitionAllowed('dns_pending', 'failed')).toBe(true);
  });

  it('disallows invalid transitions', () => {
    expect(isTransitionAllowed('draft', 'live')).toBe(false);
    expect(isTransitionAllowed('editing', 'launch_ready')).toBe(false);
    expect(isTransitionAllowed('live', 'draft')).toBe(false);
    expect(isTransitionAllowed('failed', 'provisioning')).toBe(false);
  });
});

describe('Workflow Guard Logic (getWorkflowBlockers)', () => {
  it('blocks launch when inventory is empty', () => {
    const blockers = getWorkflowBlockers({
      mobileAck: true,
      hasInventory: false,
      checkoutConfigured: true,
      hasPublishUrl: false,
    });

    expect(blockers.launch).toContainEqual(
      expect.objectContaining({ code: 'INVENTORY_EMPTY' })
    );
  });

  it('blocks launch when checkout is unconfigured', () => {
    const blockers = getWorkflowBlockers({
      mobileAck: true,
      hasInventory: true,
      checkoutConfigured: false,
      hasPublishUrl: false,
    });

    expect(blockers.launch).toContainEqual(
      expect.objectContaining({ code: 'CHECKOUT_UNCONFIGURED' })
    );
  });

  it('blocks checkout and launch when responsive verification is missing', () => {
    const blockers = getWorkflowBlockers({
      mobileAck: false,
      hasInventory: true,
      checkoutConfigured: true,
      hasPublishUrl: false,
    });

    expect(blockers.checkout).toContainEqual(
      expect.objectContaining({ code: 'RESPONSIVE_UNVERIFIED' })
    );
    expect(blockers.launch).toContainEqual(
      expect.objectContaining({ code: 'RESPONSIVE_UNVERIFIED' })
    );
  });

  it('blocks live state when no publish URL is available', () => {
    const blockers = getWorkflowBlockers({
      mobileAck: true,
      hasInventory: true,
      checkoutConfigured: true,
      hasPublishUrl: false,
    });

    expect(blockers.live).toContainEqual(
      expect.objectContaining({ code: 'LIVE_URL_UNAVAILABLE' })
    );
  });
});

describe('Transition Prerequisites', () => {
  it('requires inventory for inventory -> launch_ready transition', () => {
    const prereqs = getTransitionPrerequisites('inventory', 'launch_ready');
    expect(prereqs).toContain('At least one inventory item added (hasInventory: true)');
  });

  it('requires checkout configuration for launch_ready -> deploy_requested transition', () => {
    const prereqs = getTransitionPrerequisites('launch_ready', 'deploy_requested');
    expect(prereqs).toContain('Checkout configured (checkoutConfigured: true)');
  });

  it('requires provisioning completion for provisioning -> syncing_inventory transition', () => {
    const prereqs = getTransitionPrerequisites('provisioning', 'syncing_inventory');
    expect(prereqs).toContain('Provisioning completed without errors');
  });
});
