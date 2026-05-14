/**
 * FeaturedProduct - Commerce-Native Puck Component
 * 
 * Renders a single hero product from inventory.
 * Business primitive: "Top-selling HVAC maintenance plan"
 * NOT a generic layout block with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface FeaturedProductProps {
  productId?: string; // Specific product ID from inventory
  productName?: string; // Fallback: manual product name
  showPrice?: boolean;
  showDescription?: boolean;
  showAddToCart?: boolean;
  layout?: 'horizontal' | 'vertical' | 'hero';
  backgroundColor?: string;
  textColor?: string;
}

export const FeaturedProduct: PuckComponent<FeaturedProductProps> = ({
  productId,
  productName = 'Featured Product',
  showPrice = true,
  showDescription = true,
  showAddToCart = true,
  layout = 'hero',
  backgroundColor = '#ffffff',
  textColor = '#000000',
}) => {
  // In real implementation, this would resolve from hydrated inventory
  // For now, render the commerce-native structure
  
  const layoutClasses = {
    horizontal: 'flex flex-row items-center gap-6',
    vertical: 'flex flex-col',
    hero: 'text-center max-w-4xl mx-auto',
  };

  return (
    <div 
      className={`p-8 rounded-lg ${layoutClasses[layout]}`}
      style={{ backgroundColor, color: textColor }}
      data-puck-component="FeaturedProduct"
    >
      <div className="relative">
        {/* Product image placeholder - would come from inventory */}
        <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-gray-400">Product Image</span>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{productName}</h2>
          
          {showDescription && (
            <p className="text-lg opacity-80">
              Premium quality product with exceptional value. Perfect for your needs.
            </p>
          )}
          
          {showPrice && (
            <div className="text-4xl font-bold">$199.99</div>
          )}
          
          {showAddToCart && (
            <button 
              className="mt-4 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              onClick={() => alert('Add to cart: ' + productName)}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const featuredProductConfig = {
  render: FeaturedProduct,
  label: 'Featured Product',
  description: 'Single hero product from inventory',
  category: 'commerce-products',
  defaultProps: {
    productName: 'Featured Product',
    showPrice: true,
    showDescription: true,
    showAddToCart: true,
    layout: 'hero',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  fields: {
    productId: {
      type: 'select',
      label: 'Select Product',
      options: [
        { label: 'Product A', value: 'prod_001' },
        { label: 'Product B', value: 'prod_002' },
        { label: 'Product C', value: 'prod_003' },
      ],
    },
    productName: { type: 'text', label: 'Custom Name (fallback)' },
    showPrice: { type: 'checkbox', label: 'Show Price' },
    showDescription: { type: 'checkbox', label: 'Show Description' },
    showAddToCart: { type: 'checkbox', label: 'Show Add to Cart' },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
    textColor: { type: 'color', label: 'Text Color' },
  },
};
