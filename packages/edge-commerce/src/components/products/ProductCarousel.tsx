/**
 * ProductCarousel - Commerce-Native Puck Component
 * 
 * Rotating featured products for retail/ecommerce.
 * Business primitive: "Trending products this week"
 * NOT a generic carousel with dataSource toggle.
 */

import React, { useState } from 'react';
import { PuckComponent } from '@measured/puck';

export interface CarouselProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string; // "New", "Sale", "Popular"
}

export interface ProductCarouselProps {
  products?: CarouselProduct[];
  title?: string;
  subtitle?: string;
  autoRotate?: boolean;
  interval?: number;
  showPrice?: boolean;
  showBadges?: boolean;
  cardsToShow?: 1 | 2 | 3 | 4;
  backgroundColor?: string;
}

export const ProductCarousel: PuckComponent<ProductCarouselProps> = ({
  products = [
    { id: '1', name: 'Product A', price: 199.99, image: '/placeholder-1.jpg', badge: 'Popular' },
    { id: '2', name: 'Product B', price: 249.99, image: '/placeholder-2.jpg', badge: 'New' },
    { id: '3', name: 'Product C', price: 149.99, image: '/placeholder-3.jpg', badge: 'Sale' },
    { id: '4', name: 'Product D', price: 299.99, image: '/placeholder-4.jpg' },
    { id: '5', name: 'Product E', price: 199.99, image: '/placeholder-5.jpg', badge: 'Popular' },
  ],
  title = 'Featured Products',
  subtitle = 'Discover our most popular items this season.',
  autoRotate = true,
  interval = 3000,
  showPrice = true,
  showBadges = true,
  cardsToShow = 3,
  backgroundColor = '#f9f8f6',
}) => {
  const [startIndex, setStartIndex] = useState(0);

  // Auto-rotate logic (simplified)
  // In real impl, would use useEffect with setInterval

  const visibleProducts = products.slice(startIndex, startIndex + cardsToShow);
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + cardsToShow < products.length;

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="ProductCarousel"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Navigation buttons */}
        {canScrollLeft && (
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
            onClick={() => setStartIndex(startIndex - 1)}
          >
            ←
          </button>
        )}
        
        {canScrollRight && (
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
            onClick={() => setStartIndex(startIndex + 1)}
          >
            →
          </button>
        )}

        {/* Product cards */}
        <div className={`grid gap-6 ${
          cardsToShow === 1 ? 'grid-cols-1' :
          cardsToShow === 2 ? 'grid-cols-1 md:grid-cols-2' :
          cardsToShow === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {visibleProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                {showBadges && product.badge && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-xs font-bold rounded">
                    {product.badge}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                {showPrice && (
                  <div className="text-xl font-bold">${product.price}</div>
                )}
                <button 
                  className="mt-3 w-full py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  onClick={() => alert('Add to cart: ' + product.name)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / cardsToShow) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === Math.floor(startIndex / cardsToShow) ? 'bg-black' : 'bg-gray-300'
              }`}
              onClick={() => setStartIndex(idx * cardsToShow)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const productCarouselConfig = {
  render: ProductCarousel,
  label: 'Product Carousel',
  description: 'Rotating featured products for retail/ecommerce',
  category: 'commerce-products',
  defaultProps: {
    products: [
      { id: '1', name: 'Product A', price: 199.99, image: '/placeholder-1.jpg', badge: 'Popular' },
    ],
    title: 'Featured Products',
    subtitle: 'Discover our most popular items this season.',
    autoRotate: true,
    interval: 3000,
    showPrice: true,
    showBadges: true,
    cardsToShow: 3 as 1 | 2 | 3 | 4,
    backgroundColor: '#f9f8f6',
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
        badge: {
          type: 'select',
          label: 'Badge',
          options: [
            { label: 'None', value: '' },
            { label: 'New', value: 'New' },
            { label: 'Sale', value: 'Sale' },
            { label: 'Popular', value: 'Popular' },
          ],
        },
      },
    },
    autoRotate: { type: 'checkbox', label: 'Auto-Rotate' },
    interval: { type: 'number', label: 'Rotation Interval (ms)' },
    showPrice: { type: 'checkbox', label: 'Show Price' },
    showBadges: { type: 'checkbox', label: 'Show Badges' },
    cardsToShow: {
      type: 'radio',
      label: 'Cards to Show',
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
  },
};
