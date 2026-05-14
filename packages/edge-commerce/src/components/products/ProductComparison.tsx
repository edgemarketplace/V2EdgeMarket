/**
 * ProductComparison - Commerce-Native Puck Component
 * 
 * Commerce comparison block for retail.
 * Business primitive: "Compare these 3 laptops"
 * NOT a generic table with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  features: string[];
  rating?: number;
  highlighted?: boolean;
}

export interface ProductComparisonProps {
  products?: ComparisonProduct[];
  title?: string;
  subtitle?: string;
  features?: string[]; // Common features to compare
  layout?: 'table' | 'cards' | 'slider';
  showRatings?: boolean;
  backgroundColor?: string;
  accentColor?: string;
}

export const ProductComparison: PuckComponent<ProductComparisonProps> = ({
  products = [
    {
      id: '1',
      name: 'Basic Model',
      price: 199.99,
      image: '/placeholder-1.jpg',
      features: ['Feature A', 'Feature B', 'Feature C'],
      rating: 4.2,
    },
    {
      id: '2',
      name: 'Pro Model',
      price: 299.99,
      image: '/placeholder-2.jpg',
      features: ['Everything in Basic', 'Feature D', 'Feature E', 'Feature F'],
      rating: 4.7,
      highlighted: true,
    },
    {
      id: '3',
      name: 'Enterprise Model',
      price: 499.99,
      image: '/placeholder-3.jpg',
      features: ['Everything in Pro', 'Feature G', 'Feature H', 'Priority Support'],
      rating: 4.9,
    },
  ],
  title = 'Compare Products',
  subtitle = 'Find the perfect fit for your needs.',
  features = ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E'],
  layout = 'table',
  showRatings = true,
  backgroundColor = '#f9f8f6',
  accentColor = '#3b82f6',
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="ProductComparison"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      {layout === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Feature</th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-center">
                    <div className="font-bold">{product.name}</div>
                    <div className="text-2xl font-bold mt-2" style={{ color: accentColor }}>
                      ${product.price}
                    </div>
                    {showRatings && product.rating && (
                      <div className="mt-2 text-sm">
                        {renderStars(product.rating)}
                      </div>
                    )}
                    {product.highlighted && (
                      <div className="mt-2 text-xs font-bold px-2 py-1 rounded-full inline-block" style={{ backgroundColor: accentColor, color: 'white' }}>
                        RECOMMENDED
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-b hover:bg-white/50 transition">
                  <td className="p-4 font-medium">{feature}</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.features.includes(feature) ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <button 
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        product.highlighted
                          ? 'text-white hover:opacity-90'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      style={product.highlighted ? { backgroundColor: accentColor } : {}}
                      onClick={() => alert('Add to cart: ' + product.name)}
                    >
                      Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          layout === 'cards' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'flex overflow-x-auto gap-4 pb-4'
        }`}>
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`border rounded-xl p-6 transition ${
                product.highlighted 
                  ? 'border-2 shadow-xl scale-105' 
                  : 'border-gray-200 hover:shadow-lg'
              }`}
              style={{ borderColor: product.highlighted ? accentColor : undefined }}
            >
              {product.highlighted && (
                <div 
                  className="text-white text-xs font-bold py-1 px-3 rounded-full w-fit mx-auto mb-4"
                  style={{ backgroundColor: accentColor }}
                >
                  RECOMMENDED
                </div>
              )}
              
              <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">{product.name}</h3>
              <div className="text-3xl font-bold text-center mb-4" style={{ color: accentColor }}>
                ${product.price}
              </div>
              
              {showRatings && product.rating && (
                <div className="text-center mb-4">
                  {renderStars(product.rating)}
                  <span className="text-sm opacity-60 ml-2">{product.rating}</span>
                </div>
              )}
              
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  product.highlighted
                    ? 'text-white hover:opacity-90'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                style={product.highlighted ? { backgroundColor: accentColor } : {}}
                onClick={() => alert('Add to cart: ' + product.name)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const productComparisonConfig = {
  render: ProductComparison,
  label: 'Product Comparison',
  description: 'Commerce comparison block for retail',
  category: 'commerce-products',
  defaultProps: {
    products: [
      {
        id: '1',
        name: 'Basic Model',
        price: 199.99,
        image: '/placeholder-1.jpg',
        features: ['Feature A', 'Feature B', 'Feature C'],
        rating: 4.2,
      },
    ],
    title: 'Compare Products',
    subtitle: 'Find the perfect fit for your needs.',
    features: ['Feature A', 'Feature B', 'Feature C'],
    layout: 'table' as 'table' | 'cards' | 'slider',
    showRatings: true,
    backgroundColor: '#f9f8f6',
    accentColor: '#3b82f6',
  },
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    products: {
      type: 'array',
      label: 'Products',
      arrayFields: {
        name: { type: 'text', label: 'Product Name' },
        price: { type: 'number', label: 'Price' },
        image: { type: 'text', label: 'Image URL' },
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            item: { type: 'text', label: 'Feature' },
          },
        },
        rating: { type: 'number', label: 'Rating (1-5)' },
        highlighted: { type: 'checkbox', label: 'Highlighted' },
      },
    },
    features: {
      type: 'array',
      label: 'Common Features (Table Layout)',
      arrayFields: {
        item: { type: 'text', label: 'Feature' },
      },
    },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Table', value: 'table' },
        { label: 'Cards', value: 'cards' },
        { label: 'Slider', value: 'slider' },
      ],
    },
    showRatings: { type: 'checkbox', label: 'Show Ratings' },
    backgroundColor: { type: 'color', label: 'Background' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
};
