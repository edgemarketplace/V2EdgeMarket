/**
 * ProductGrid - Commerce-Native Puck Component
 * 
 * Inventory-aware product collection.
 * Business primitive: "Top-selling HVAC maintenance plans"
 * NOT a generic grid with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface ProductGridProps {
  collectionType?: 'featured' | 'newest' | 'category' | 'all';
  category?: string;
  limit?: number;
  columns?: 2 | 3 | 4;
  showPrice?: boolean;
  showDescription?: boolean;
  showAddToCart?: boolean;
  cardStyle?: 'minimal' | 'detailed' | 'compact';
  backgroundColor?: string;
}

export const ProductGrid: PuckComponent<ProductGridProps> = ({
  collectionType = 'featured',
  category = '',
  limit = 8,
  columns = 3,
  showPrice = true,
  showDescription = true,
  showAddToCart = true,
  cardStyle = 'detailed',
  backgroundColor = '#f9f8f6',
}) => {
  // In real implementation, this resolves from hydrated inventory
  // For now, render commerce-native structure
  
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const cardClasses = {
    minimal: 'p-4 border border-gray-200 rounded',
    detailed: 'p-6 border border-gray-200 rounded-lg hover:shadow-lg transition',
    compact: 'p-3 border border-gray-100 rounded',
  };

  // Mock products - would come from resolveCollection()
  const mockProducts = Array.from({ length: Math.min(limit, 6) }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Product ${i + 1}`,
    price: 199.99 + i * 50,
    description: 'Premium quality product with exceptional value.',
  }));

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="ProductGrid"
    >
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {mockProducts.map((product) => (
          <div key={product.id} className={cardClasses[cardStyle]}>
            <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
              <span className="text-gray-400">Product Image</span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            
            {showDescription && (
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            )}
            
            {showPrice && (
              <div className="text-xl font-bold mb-3">${product.price}</div>
            )}
            
            {showAddToCart && (
              <button 
                className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                onClick={() => alert('Add to cart: ' + product.name)}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const productGridConfig = {
  render: ProductGrid,
  label: 'Product Grid',
  description: 'Inventory-aware product collection',
  category: 'commerce-products',
  defaultProps: {
    collectionType: 'featured',
    category: '',
    limit: 8,
    columns: 3 as 2 | 3 | 4,
    showPrice: true,
    showDescription: true,
    showAddToCart: true,
    cardStyle: 'detailed' as 'minimal' | 'detailed' | 'compact',
    backgroundColor: '#f9f8f6',
  },
  fields: {
    collectionType: {
      type: 'select',
      label: 'Collection Type',
      options: [
        { label: 'Featured Products', value: 'featured' },
        { label: 'Newest Products', value: 'newest' },
        { label: 'By Category', value: 'category' },
        { label: 'All Products', value: 'all' },
      ],
    },
    category: {
      type: 'text',
      label: 'Category (if category type)',
    },
    limit: {
      type: 'number',
      label: 'Max Products',
    },
    columns: {
      type: 'radio',
      label: 'Columns',
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
      ],
    },
    showPrice: { type: 'checkbox', label: 'Show Price' },
    showDescription: { type: 'checkbox', label: 'Show Description' },
    showAddToCart: { type: 'checkbox', label: 'Show Add to Cart' },
    cardStyle: {
      type: 'radio',
      label: 'Card Style',
      options: [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Detailed', value: 'detailed' },
        { label: 'Compact', value: 'compact' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
  },
};
