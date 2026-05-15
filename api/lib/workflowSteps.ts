export type WorkflowStepId = 'content' | 'inventory' | 'checkout' | 'launch' | 'live';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  helper?: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'content', label: 'Content', helper: 'Edit and structure pages' },
  { id: 'inventory', label: 'Inventory', helper: 'Products/services data' },
  { id: 'checkout', label: 'Checkout', helper: 'Commerce configuration' },
  { id: 'launch', label: 'Launch', helper: 'Deployment and go-live checks' },
  { id: 'live', label: 'Live', helper: 'Verify storefront in production' },
];

export function getNextStep(current: WorkflowStepId): WorkflowStepId | null {
  const idx = WORKFLOW_STEPS.findIndex((step) => step.id === current);
  if (idx === -1 || idx === WORKFLOW_STEPS.length - 1) return null;
  return WORKFLOW_STEPS[idx + 1].id;
}
