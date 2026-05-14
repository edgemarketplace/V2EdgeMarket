import { InventoryItem, MedusaSyncResult } from '../lib/types';

function productPayload(item: InventoryItem) {
  return {
    title: item.name,
    handle: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    status: 'published',
    description: item.description || '',
    options: [{ title: 'Default', values: ['Default'] }],
    variants: [
      {
        title: 'Default',
        manage_inventory: false,
        prices: item.price
          ? [
              {
                amount: Math.round(Number(String(item.price).replace('$', '')) * 100),
                currency_code: 'usd',
              },
            ]
          : [],
      },
    ],
  };
}

export async function syncInventoryToMedusa(siteId: string, inventoryItems: InventoryItem[]): Promise<MedusaSyncResult> {
  const backendUrl = process.env.MEDUSA_BACKEND_URL;
  const adminToken = process.env.MEDUSA_ADMIN_TOKEN;

  if (!backendUrl || !adminToken) {
    return {
      attempted: false,
      success: false,
      message: 'Medusa credentials are not configured.',
    };
  }

  if (!inventoryItems.length) {
    return {
      attempted: false,
      success: false,
      message: 'No inventory items were available to sync.',
    };
  }

  try {
    let syncedCount = 0;

    for (const item of inventoryItems.slice(0, 25)) {
      const response = await fetch(`${backendUrl.replace(/\/$/, '')}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || '',
          'x-edge-site-id': siteId,
        },
        body: JSON.stringify({ product: productPayload(item) }),
      });

      if (!response.ok) {
        const body = await response.text();
        return {
          attempted: true,
          success: false,
          httpStatus: response.status,
          productCount: syncedCount,
          message: `Medusa sync failed for "${item.name}" with HTTP ${response.status}: ${body || response.statusText}`,
        };
      }

      syncedCount += 1;
    }

    return {
      attempted: true,
      success: true,
      productCount: syncedCount,
      message: 'Inventory synced to Medusa admin products endpoint.',
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
