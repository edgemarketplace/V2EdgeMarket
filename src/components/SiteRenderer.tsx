import React from 'react';
import { EditorData, EdgeRootProps, InventoryItem, MarketplaceSiteDraft } from '../lib/types';
import { getStorefrontComponent } from '../lib/storefrontRegistry';
import {
  resolveFeaturedProducts,
  resolveCollections,
  resolveServiceCards,
  resolveGridPackages,
} from '../lib/commerce-runtime';

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
      items: resolveFeaturedProducts(inventoryItems, draft, 8),
    };
  }

  if (block.type === 'GridCollections') {
    return {
      ...block.props,
      items: resolveCollections(inventoryItems),
    };
  }

  if (block.type === 'GridServiceCards' && draft) {
    return {
      ...block.props,
      items: resolveServiceCards(inventoryItems, draft, 6),
    };
  }

  if (block.type === 'GridPackages') {
    return {
      ...block.props,
      items: resolveGridPackages(inventoryItems, draft, 3),
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
