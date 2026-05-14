/**
 * ServicePackages - Commerce-Native Puck Component
 * 
 * Tiered pricing/packages for services.
 * Business primitive: "HVAC Maintenance Plans - Basic, Pro, Enterprise"
 * NOT a generic pricing table with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface PackageTier {
  id: string;
  name: string;
  price: number;
  period?: string; // "per month", "one-time", "per visit"
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
}

export interface ServicePackagesProps {
  packages?: PackageTier[];
  title?: string;
  subtitle?: string;
  layout?: 'horizontal' | 'stacked' | 'comparison';
  showPerks?: boolean;
  backgroundColor?: string;
  accentColor?: string;
}

export const ServicePackages: PuckComponent<ServicePackagesProps> = ({
  packages = [
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      period: 'per month',
      description: 'Essential service for small needs.',
      features: ['Feature A', 'Feature B', 'Feature C'],
      ctaText: 'Get Started',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 199,
      period: 'per month',
      description: 'Most popular for growing businesses.',
      features: ['Everything in Basic', 'Feature D', 'Feature E', 'Priority Support'],
      highlighted: true,
      ctaText: 'Choose Pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      period: 'per month',
      description: 'Full-service solution for large operations.',
      features: ['Everything in Pro', 'Feature F', 'Dedicated Manager', '24/7 Support'],
      ctaText: 'Contact Us',
    },
  ],
  title = 'Service Packages',
  subtitle = 'Choose the plan that fits your needs.',
  layout = 'horizontal',
  showPerks = true,
  backgroundColor = '#f9f8f6',
  accentColor = '#3b82f6',
}) => {
  const layoutClasses = {
    horizontal: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    stacked: 'space-y-4 max-w-2xl mx-auto',
    comparison: 'overflow-x-auto',
  };

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="ServicePackages"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      <div className={layoutClasses[layout]}>
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`border rounded-xl p-6 transition ${
              pkg.highlighted 
                ? 'border-2 shadow-xl scale-105' 
                : 'border-gray-200 hover:shadow-lg'
            }`}
            style={{ 
              borderColor: pkg.highlighted ? accentColor : undefined,
            }}
          >
            {pkg.highlighted && (
              <div 
                className="text-white text-sm font-bold py-1 px-3 rounded-full w-fit mx-auto mb-4"
                style={{ backgroundColor: accentColor }}
              >
                MOST POPULAR
              </div>
            )}

            <h3 className="text-xl font-bold text-center mb-2">{pkg.name}</h3>
            
            <div className="text-center mb-4">
              <span className="text-4xl font-bold">${pkg.price}</span>
              {pkg.period && <span className="text-sm opacity-60">/{pkg.period}</span>}
            </div>

            <p className="text-sm text-center mb-6 opacity-80">{pkg.description}</p>

            {showPerks && pkg.features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <button 
              className={`w-full py-3 rounded-lg font-semibold transition ${
                pkg.highlighted
                  ? 'text-white hover:opacity-90'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={pkg.highlighted ? { backgroundColor: accentColor } : {}}
              onClick={() => alert(`Selected ${pkg.name} package`)}
            >
              {pkg.ctaText || 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const servicePackagesConfig = {
  render: ServicePackages,
  label: 'Service Packages',
  description: 'Tiered pricing/packages for services',
  category: 'commerce-services',
  defaultProps: {
    packages: [
      {
        id: 'basic',
        name: 'Basic',
        price: 99,
        period: 'per month',
        description: 'Essential service for small needs.',
        features: ['Feature A', 'Feature B', 'Feature C'],
        ctaText: 'Get Started',
      },
    ],
    title: 'Service Packages',
    subtitle: 'Choose the plan that fits your needs.',
    layout: 'horizontal' as 'horizontal' | 'stacked' | 'comparison',
    showPerks: true,
    backgroundColor: '#f9f8f6',
    accentColor: '#3b82f6',
  },
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    packages: {
      type: 'array',
      label: 'Packages',
      arrayFields: {
        item: { type: 'text', label: 'Package Name' },
        price: { type: 'number', label: 'Price' },
        period: { type: 'text', label: 'Period (e.g. per month)' },
        description: { type: 'textarea', label: 'Description' },
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            item: { type: 'text', label: 'Feature' },
          },
        },
        highlighted: { type: 'checkbox', label: 'Highlighted' },
        ctaText: { type: 'text', label: 'CTA Text' },
      },
    },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Stacked', value: 'stacked' },
        { label: 'Comparison', value: 'comparison' },
      ],
    },
    showPerks: { type: 'checkbox', label: 'Show Features' },
    backgroundColor: { type: 'color', label: 'Background' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
};
