import React from 'react';
import { EditorData, EdgeRootProps, InventoryItem, MarketplaceSiteDraft } from '../lib/types';
import { getStorefrontComponent } from '../lib/storefrontRegistry';

function formatPrice(price?: string | number) {
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  if (!price) return '$0.00';
  return String(price).startsWith('$') ? String(price) : `$${price}`;
}

function hydrateBlockProps(block: any, inventoryItems: InventoryItem[], draft?: MarketplaceSiteDraft) {
  // Check if component has a data source preference
  const dataSource = block.props?.dataSource;
  
  // If manually set to 'manual', don't inject inventory
  if (dataSource === 'manual') {
    return block.props;
  }
  
  // If set to 'inventory' or not set (backward compatibility), inject inventory
  const shouldInjectInventory = dataSource === 'inventory' || !dataSource;
  
  if (!shouldInjectInventory || !inventoryItems.length) return block.props;

  if (block.type === 'GridFeaturedProducts') {
    return {
      ...block.props,
      items: inventoryItems.slice(0, 8).map((item) => ({
        name: item.name,
        price: formatPrice(item.price),
        category: item.category || draft?.intakeData?.businessType || 'Featured',
        image: item.image,
      })),
    };
  }

  if (block.type === 'GridCollections') {
    const categories = Array.from(new Set(inventoryItems.map((item) => item.category).filter(Boolean)));
    if (!categories.length) return block.props;
    return {
      ...block.props,
      items: categories.slice(0, 4).map((category) => ({
        title: category as string,
        image: inventoryItems.find((item) => item.category === category)?.image,
      })),
    };
  }

  if (block.type === 'GridServiceCards' && draft) {
    return {
      ...block.props,
      items: inventoryItems.slice(0, 6).map((item) => ({
        title: item.name,
        description: item.description || draft.intakeData?.offerings || '',
        image: item.image,
      })),
    };
  }

  if (block.type === 'GridPackages') {
    return {
      ...block.props,
      items: inventoryItems.slice(0, 3).map((item) => ({
        name: item.name,
        price: formatPrice(item.price),
        ctaText: draft?.intakeData?.primaryGoal === 'quote' ? 'Request Proposal' : 'Choose Package',
        features: [
          { label: item.category || 'Signature offering' },
          { label: item.description || 'Tailored for your customers' },
        ],
      })),
    };
  }

  return block.props;
}

export function SiteRenderer({
  data,
  rootProps,
  inventoryItems = [],
  draft,
}: {
  data: EditorData;
  rootProps: EdgeRootProps;
  inventoryItems?: InventoryItem[];
  draft?: MarketplaceSiteDraft;
}) {
  const isMilano = rootProps.theme.stylePreset === 'milano';

  return (
    <div
      style={{
        ['--primary-color' as any]: rootProps.theme.primaryColor,
        fontFamily: rootProps.theme.fontFamily,
      }}
      className={`min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col ${isMilano ? 'milano-theme font-serif' : 'font-sans'}`}
    >
      {data.content.map((block) => {
        const Component = getStorefrontComponent(block.type);
        if (!Component) {
          return null;
        }

        return <Component key={block.id} {...hydrateBlockProps(block, inventoryItems, draft)} />;
      })}
    </div>
  );
}
