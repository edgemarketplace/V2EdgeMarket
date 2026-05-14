/**
 * BeforeAfterGallery - Commerce-Native Puck Component
 * 
 * High-value visual component for trades/services (contractors, landscapers, remodelers).
 * Business primitive: "See our transformation work"
 * NOT a generic image gallery with dataSource toggle.
 */

import React, { useState } from 'react';
import { PuckComponent } from '@measured/puck';

export interface GalleryItem {
  id: string;
  beforeImage: string;
  afterImage: string;
  title: string;
  description?: string;
}

export interface BeforeAfterGalleryProps {
  items?: GalleryItem[];
  title?: string;
  subtitle?: string;
  layout?: 'slider' | 'grid' | 'stacked';
  showDescriptions?: boolean;
  backgroundColor?: string;
}

export const BeforeAfterGallery: PuckComponent<BeforeAfterGalleryProps> = ({
  items = [
    {
      id: '1',
      beforeImage: '/placeholder-before-1.jpg',
      afterImage: '/placeholder-after-1.jpg',
      title: 'Kitchen Remodel',
      description: 'Complete kitchen renovation with modern fixtures.',
    },
    {
      id: '2',
      beforeImage: '/placeholder-before-2.jpg',
      afterImage: '/placeholder-after-2.jpg',
      title: 'Bathroom Upgrade',
      description: 'Transformed outdated bathroom into spa-like retreat.',
    },
    {
      id: '3',
      beforeImage: '/placeholder-before-3.jpg',
      afterImage: '/placeholder-after-3.jpg',
      title: 'Landscaping Project',
      description: 'Front yard transformation with native plants.',
    },
  ],
  title = 'Our Work',
  subtitle = 'See the transformations we\'ve delivered for our clients.',
  layout = 'slider',
  showDescriptions = true,
  backgroundColor = '#f9f8f6',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(true);

  const layoutClasses = {
    slider: 'max-w-4xl mx-auto',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    stacked: 'space-y-8 max-w-2xl mx-auto',
  };

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="BeforeAfterGallery"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      <div className={layoutClasses[layout]}>
        {layout === 'slider' ? (
          <div className="space-y-4">
            <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: showAfter ? 0 : 1 }}
              >
                <span className="text-gray-400">Before Image</span>
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-300"
                style={{ opacity: showAfter ? 1 : 0 }}
              >
                <span className="text-gray-400">After Image</span>
              </div>
              
              <button 
                className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow-lg font-medium"
                onClick={() => setShowAfter(!showAfter)}
              >
                Show {showAfter ? 'Before' : 'After'}
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold">{items[activeIndex]?.title}</h3>
              {showDescriptions && items[activeIndex]?.description && (
                <p className="text-sm opacity-80 mt-2">{items[activeIndex].description}</p>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    idx === activeIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    setActiveIndex(idx);
                    setShowAfter(true);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="grid grid-cols-2">
                <div className="h-48 bg-gray-200 flex items-center justify-center border-r">
                  <span className="text-gray-400 text-sm">Before</span>
                </div>
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">After</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{item.title}</h3>
                {showDescriptions && item.description && (
                  <p className="text-sm opacity-80 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const beforeAfterGalleryConfig = {
  render: BeforeAfterGallery,
  label: 'Before/After Gallery',
  description: 'High-value visual component for trades/services',
  category: 'commerce-services',
  defaultProps: {
    items: [
      {
        id: '1',
        beforeImage: '/placeholder-before-1.jpg',
        afterImage: '/placeholder-after-1.jpg',
        title: 'Project 1',
        description: 'Description here.',
      },
    ],
    title: 'Our Work',
    subtitle: 'See the transformations we\'ve delivered for our clients.',
    layout: 'slider' as 'slider' | 'grid' | 'stacked',
    showDescriptions: true,
    backgroundColor: '#f9f8f6',
  },
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    items: {
      type: 'array',
      label: 'Gallery Items',
      arrayFields: {
        title: { type: 'text', label: 'Project Title' },
        beforeImage: { type: 'text', label: 'Before Image URL' },
        afterImage: { type: 'text', label: 'After Image URL' },
        description: { type: 'textarea', label: 'Description' },
      },
    },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Slider', value: 'slider' },
        { label: 'Grid', value: 'grid' },
        { label: 'Stacked', value: 'stacked' },
      ],
    },
    showDescriptions: { type: 'checkbox', label: 'Show Descriptions' },
    backgroundColor: { type: 'color', label: 'Background' },
  },
};
