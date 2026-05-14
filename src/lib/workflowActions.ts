import { EdgeRootProps } from './types';

export type WorkflowActionId = 'preview' | 'inventory' | 'checkout' | 'launch' | 'live';

export interface WorkflowBlocker {
  code: string;
  message: string;
  cta?: WorkflowActionId;
}

export function getWorkflowBlockers(params: {
  mobileAck: boolean;
  hasInventory: boolean;
  checkoutConfigured: boolean;
  hasPublishUrl: boolean;
}) {
  const { mobileAck, hasInventory, checkoutConfigured, hasPublishUrl } = params;

  return {
    preview: [] as WorkflowBlocker[],
    inventory: [] as WorkflowBlocker[],
    checkout: [
      ...(!mobileAck ? [{ code: 'RESPONSIVE_UNVERIFIED', message: 'Responsive verification is required before checkout.', cta: 'preview' as WorkflowActionId }] : []),
    ],
    launch: [
      ...(!hasInventory ? [{ code: 'INVENTORY_EMPTY', message: 'Add at least one inventory item before launch.', cta: 'inventory' as WorkflowActionId }] : []),
      ...(!checkoutConfigured ? [{ code: 'CHECKOUT_UNCONFIGURED', message: 'Checkout is not configured for this commerce mode.', cta: 'checkout' as WorkflowActionId }] : []),
      ...(!mobileAck ? [{ code: 'RESPONSIVE_UNVERIFIED', message: 'Responsive verification is required before launch.', cta: 'preview' as WorkflowActionId }] : []),
    ],
    live: [
      ...(!hasPublishUrl ? [{ code: 'LIVE_URL_UNAVAILABLE', message: 'No live storefront URL is available yet. Complete launch first.', cta: 'launch' as WorkflowActionId }] : []),
    ],
  };
}

export function isCheckoutConfigured(rootProps: EdgeRootProps) {
  if (rootProps.commerceMode === 'quote' || rootProps.commerceMode === 'booking') return true;
  return Boolean(rootProps.paymentConfigured);
}
