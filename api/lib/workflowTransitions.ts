import { SiteLifecycleStatus } from './types';

export interface WorkflowTransition {
  from: SiteLifecycleStatus;
  to: SiteLifecycleStatus;
  prerequisites: string[];
  sideEffects: string[];
}

/**
 * Complete workflow transition matrix covering both pre-deployment workflow
 * and deployment lifecycle transitions (aligned with existing transitionAllowed in siteStore.ts)
 */
export const workflowTransitionMatrix: WorkflowTransition[] = [
  // Pre-deployment workflow transitions
  {
    from: 'draft',
    to: 'editing',
    prerequisites: ['Site draft created with basic business details'],
    sideEffects: ['Editor session initialized', 'Template family and commerce mode locked'],
  },
  {
    from: 'editing',
    to: 'inventory',
    prerequisites: ['Mobile responsive verification acknowledged (mobileResponsiveAck: true)'],
    sideEffects: ['Editor locked for further changes', 'Inventory management UI enabled'],
  },
  {
    from: 'inventory',
    to: 'launch_ready',
    prerequisites: ['At least one inventory item added (hasInventory: true)'],
    sideEffects: ['Inventory synced to Medusa backend', 'Checkout configuration step unlocked'],
  },
  {
    from: 'launch_ready',
    to: 'deploy_requested',
    prerequisites: [
      'Checkout configured (checkoutConfigured: true)',
      'Mobile responsive verification acknowledged (mobileResponsiveAck: true)',
    ],
    sideEffects: ['Launch plan selected', 'Deployment request submitted to provisioning pipeline'],
  },

  // Deployment lifecycle transitions (matches existing transitionAllowed in siteStore.ts lines 161-173)
  {
    from: 'deploy_requested',
    to: 'provisioning',
    prerequisites: ['Valid launch plan selected', 'Idempotency key generated'],
    sideEffects: ['Provisioning resources allocated', 'Deployment history entry created'],
  },
  {
    from: 'deploy_requested',
    to: 'syncing_inventory',
    prerequisites: ['Provisioning completed successfully'],
    sideEffects: ['Inventory synced to live Medusa instance', 'Product count updated in deployment record'],
  },
  {
    from: 'deploy_requested',
    to: 'storefront_building',
    prerequisites: ['Inventory sync completed successfully'],
    sideEffects: ['Vercel deployment triggered', 'Storefront build logs initialized'],
  },
  {
    from: 'deploy_requested',
    to: 'failed',
    prerequisites: ['Any deployment stage encountered an unrecoverable error'],
    sideEffects: ['Failure reason recorded', 'Deployment attempt count incremented'],
  },
  {
    from: 'provisioning',
    to: 'syncing_inventory',
    prerequisites: ['Provisioning completed without errors'],
    sideEffects: ['Medusa instance provisioned', 'Inventory sync job queued'],
  },
  {
    from: 'provisioning',
    to: 'storefront_building',
    prerequisites: ['Provisioning and inventory sync completed'],
    sideEffects: ['Storefront build triggered', 'Vercel deployment ID assigned'],
  },
  {
    from: 'provisioning',
    to: 'failed',
    prerequisites: ['Provisioning stage failed'],
    sideEffects: ['Failure stage set to provisioning', 'Error message recorded'],
  },
  {
    from: 'syncing_inventory',
    to: 'storefront_building',
    prerequisites: ['Inventory sync completed successfully (medusaSync.success: true)'],
    sideEffects: ['Product count updated in deployment record', 'Storefront build triggered'],
  },
  {
    from: 'syncing_inventory',
    to: 'failed',
    prerequisites: ['Inventory sync failed'],
    sideEffects: ['Failure stage set to syncing_inventory', 'Medusa sync error message recorded'],
  },
  {
    from: 'storefront_building',
    to: 'dns_pending',
    prerequisites: ['Storefront build completed successfully', 'Vercel deployment ready'],
    sideEffects: ['DNS configuration requested', 'Publish URL assigned (temporary)'],
  },
  {
    from: 'storefront_building',
    to: 'live',
    prerequisites: ['Storefront build completed', 'DNS already configured'],
    sideEffects: ['Site marked as live', 'Publish URL set as permanent'],
  },
  {
    from: 'storefront_building',
    to: 'failed',
    prerequisites: ['Storefront build failed'],
    sideEffects: ['Failure stage set to storefront_building', 'Build error logs recorded'],
  },
  {
    from: 'dns_pending',
    to: 'live',
    prerequisites: ['DNS propagation completed', 'SSL certificate issued'],
    sideEffects: ['Site marked as live', 'Publish URL set as permanent', 'Live status broadcast to webhooks'],
  },
  {
    from: 'dns_pending',
    to: 'failed',
    prerequisites: ['DNS configuration failed or timed out'],
    sideEffects: ['Failure stage set to dns_pending', 'DNS error message recorded'],
  },

  // Explicit same-state no-op transitions
  ...([
    'draft', 'editing', 'inventory', 'launch_ready', 'deploy_requested',
    'provisioning', 'syncing_inventory', 'storefront_building', 'dns_pending', 'live', 'failed'
  ] as SiteLifecycleStatus[]).map(status => ({
    from: status,
    to: status,
    prerequisites: [],
    sideEffects: ['No state change'],
  })),
];

/**
 * Check if a transition between two states is allowed (matches existing transitionAllowed logic)
 */
export function isTransitionAllowed(
  current: SiteLifecycleStatus,
  next: SiteLifecycleStatus
): boolean {
  if (current === next) return true;
  return workflowTransitionMatrix.some(
    transition => transition.from === current && transition.to === next
  );
}

/**
 * Get prerequisites required for a specific transition
 */
export function getTransitionPrerequisites(
  from: SiteLifecycleStatus,
  to: SiteLifecycleStatus
): string[] {
  const transition = workflowTransitionMatrix.find(
    t => t.from === from && t.to === to
  );
  return transition?.prerequisites || [];
}

/**
 * Get expected side effects of a specific transition
 */
export function getTransitionSideEffects(
  from: SiteLifecycleStatus,
  to: SiteLifecycleStatus
): string[] {
  const transition = workflowTransitionMatrix.find(
    t => t.from === from && t.to === to
  );
  return transition?.sideEffects || [];
}
