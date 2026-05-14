/**
 * ServiceCard - Commerce-Native Puck Component
 * 
 * Structured service offering for contractors, local businesses, SMBs.
 * Business primitive: "AC Maintenance Plan" or "Web Design Package"
 * NOT a generic card with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface ServiceCardProps {
  serviceId?: string; // Specific service from inventory
  serviceName?: string;
  shortDescription?: string;
  fullDescription?: string;
  startingPrice?: number;
  priceLabel?: string; // "Starting at", "per hour", "fixed price"
  features?: string[]; // List of what's included
  showFeatures?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  layout?: 'compact' | 'detailed' | 'hero';
  accentColor?: string;
  backgroundColor?: string;
}

export const ServiceCard: PuckComponent<ServiceCardProps> = ({
  serviceName = 'Service Name',
  shortDescription = 'Brief description of the service offered.',
  fullDescription = '',
  startingPrice = 199,
  priceLabel = 'Starting at',
  features = ['Feature 1', 'Feature 2', 'Feature 3'],
  showFeatures = true,
  showCTA = true,
  ctaText = 'Book Now',
  layout = 'detailed',
  accentColor = '#3b82f6',
  backgroundColor = '#ffffff',
}) => {
  const layoutClasses = {
    compact: 'p-4 border rounded-lg',
    detailed: 'p-6 border rounded-xl hover:shadow-lg transition',
    hero: 'p-8 bg-gradient-to-br rounded-2xl text-white',
  };

  return (
    <div 
      className={`${layoutClasses[layout]} ${layout === 'hero' ? '' : ''}`}
      style={{ 
        backgroundColor: layout === 'hero' ? accentColor : backgroundColor,
        borderColor: layout === 'hero' ? 'transparent' : '#e5e7eb',
      }}
      data-puck-component="ServiceCard"
    >
      <div className="space-y-4">
        <div>
          <h3 className={`text-xl font-bold ${layout === 'hero' ? 'text-2xl' : ''}`}>
            {serviceName}
          </h3>
          <p className="text-sm opacity-70 mt-1">{shortDescription}</p>
        </div>

        {fullDescription && layout === 'detailed' && (
          <p className="text-sm text-gray-600">{fullDescription}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${startingPrice}</span>
          <span className="text-sm opacity-60">{priceLabel}</span>
        </div>

        {showFeatures && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {showCTA && (
          <button 
            className={`w-full py-3 rounded-lg font-semibold transition ${
              layout === 'hero' 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            onClick={() => alert('Book service: ' + serviceName)}
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
};

export const serviceCardConfig = {
  render: ServiceCard,
  label: 'Service Card',
  description: 'Structured service offering for contractors, SMBs',
  category: 'commerce-services',
  defaultProps: {
    serviceName: 'Service Name',
    shortDescription: 'Brief description of the service offered.',
    fullDescription: '',
    startingPrice: 199,
    priceLabel: 'Starting at',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    showFeatures: true,
    showCTA: true,
    ctaText: 'Book Now',
    layout: 'detailed' as 'compact' | 'detailed' | 'hero',
    accentColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  fields: {
    serviceId: {
      type: 'select',
      label: 'Select Service',
      options: [
        { label: 'AC Maintenance', value: 'svc_001' },
        { label: 'Web Design', value: 'svc_002' },
        { label: 'Consulting', value: 'svc_003' },
      ],
    },
    serviceName: { type: 'text', label: 'Service Name' },
    shortDescription: { type: 'textarea', label: 'Short Description' },
    fullDescription: { type: 'textarea', label: 'Full Description (detailed layout)' },
    startingPrice: { type: 'number', label: 'Starting Price' },
    priceLabel: {
      type: 'select',
      label: 'Price Label',
      options: [
        { label: 'Starting at', value: 'Starting at' },
        { label: 'Per hour', value: 'per hour' },
        { label: 'Fixed price', value: 'fixed price' },
        { label: 'per sq ft', value: 'per sq ft' },
      ],
    },
    features: {
      type: 'array',
      label: 'Features Included',
      arrayFields: {
        item: { type: 'text', label: 'Feature' },
      },
    },
    showFeatures: { type: 'checkbox', label: 'Show Features' },
    showCTA: { type: 'checkbox', label: 'Show CTA Button' },
    ctaText: { type: 'text', label: 'CTA Text' },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Detailed', value: 'detailed' },
        { label: 'Hero', value: 'hero' },
      ],
    },
    accentColor: { type: 'color', label: 'Accent Color (Hero)' },
    backgroundColor: { type: 'color', label: 'Background' },
  },
};
