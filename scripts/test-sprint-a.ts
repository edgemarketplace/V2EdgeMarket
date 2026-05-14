import assert from 'node:assert/strict';
import {
  applyDeploymentEventByDeploymentId,
  getDeployment,
  reconcileDeployment,
  replaceInventory,
  requestDeployment,
  resetInMemoryStateForTests,
} from '../src/server/siteStore';
import { InventoryItem } from '../src/lib/types';

async function run() {
  resetInMemoryStateForTests();

  const siteId = 'site-sprint-a';
  const inventory: InventoryItem[] = [
    { name: 'Starter Product', price: '19', category: 'Featured', description: 'Used for deployment tests.' },
  ];

  await replaceInventory(siteId, inventory);

  const first = await requestDeployment(siteId, 'launch', 'site-sprint-a:launch:attempt-1');
  assert.equal(first.status, 'deploy_requested');
  assert.equal(first.attemptCount, 1);
  assert.ok(first.deploymentId);

  const duplicate = await requestDeployment(siteId, 'launch', 'site-sprint-a:launch:attempt-1');
  assert.equal(duplicate.deploymentId, first.deploymentId);
  assert.equal(duplicate.attemptCount, 1);

  const reconciled = await reconcileDeployment(siteId, {
    capabilities: {
      medusaConfigured: true,
      deploymentWebhookConfigured: true,
      supabaseConfigured: false,
    },
    syncInventory: async () => ({
      attempted: true,
      success: true,
      message: 'Inventory synced in test.',
      productCount: 1,
    }),
  });

  assert.ok(reconciled);
  assert.equal(reconciled?.status, 'storefront_building');
  assert.equal(reconciled?.medusaSync?.success, true);
  assert.equal(reconciled?.history.at(-1)?.status, 'storefront_building');

  const dnsPending = await applyDeploymentEventByDeploymentId(first.deploymentId, {
    status: 'dns_pending',
    message: 'Waiting for wildcard DNS verification.',
    provisioningId: 'prov_123',
    vercelDeploymentId: 'dpl_123',
  });

  assert.equal(dnsPending?.status, 'dns_pending');
  assert.equal(dnsPending?.provisioningId, 'prov_123');
  assert.equal(dnsPending?.vercelDeploymentId, 'dpl_123');

  const live = await applyDeploymentEventByDeploymentId(first.deploymentId, {
    status: 'live',
    message: 'Storefront is live.',
    publishUrl: 'https://starter.edgemarketplacehub.com',
  });

  assert.equal(live?.status, 'live');
  assert.equal(live?.publishUrl, 'https://starter.edgemarketplacehub.com');

  const persisted = await getDeployment(siteId);
  assert.equal(persisted?.status, 'live');

  resetInMemoryStateForTests();

  const failedSiteId = 'site-sprint-a-failure';
  await replaceInventory(failedSiteId, inventory);
  const failedFirst = await requestDeployment(failedSiteId, 'launch', 'site-sprint-a-failure:launch:attempt-1');

  const failedResult = await reconcileDeployment(failedSiteId, {
    capabilities: {
      medusaConfigured: true,
      deploymentWebhookConfigured: true,
      supabaseConfigured: false,
    },
    syncInventory: async () => ({
      attempted: true,
      success: false,
      message: 'Boom',
      productCount: 0,
      httpStatus: 500,
    }),
  });

  assert.equal(failedResult?.status, 'failed');
  assert.equal(failedResult?.failureStage, 'syncing_inventory');

  const failedDuplicate = await requestDeployment(failedSiteId, 'launch', 'site-sprint-a-failure:launch:attempt-1');
  assert.equal(failedDuplicate.deploymentId, failedFirst.deploymentId);

  const retry = await requestDeployment(failedSiteId, 'launch', 'site-sprint-a-failure:launch:attempt-2');
  assert.notEqual(retry.deploymentId, failedFirst.deploymentId);
  assert.equal(retry.attemptCount, 2);

  console.log('Sprint A tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
