/**
 * AvailabilitySection - Commerce-Native Puck Component
 * 
 * Service regions/times for contractors and service businesses.
 * Business primitive: "We serve these areas" or "Available 24/7"
 * NOT a generic section with dataSource toggle.
 */

import React from 'react';
import { PuckComponent } from '@measured/puck';

export interface ServiceArea {
  region: string;
  zipCodes?: string;
  travelFee?: number;
}

export interface AvailabilitySectionProps {
  title?: string;
  subtitle?: string;
  serviceAreas?: ServiceArea[];
  businessHours?: string;
  emergencyAvailable?: boolean;
  showMap?: boolean;
  layout?: 'list' | 'grid' | 'detailed';
  backgroundColor?: string;
  accentColor?: string;
}

export const AvailabilitySection: PuckComponent<AvailabilitySectionProps> = ({
  title = 'Service Areas',
  subtitle = 'We proudly serve the following regions.',
  serviceAreas = [
    { region: 'Downtown', zipCodes: '12345, 12346', travelFee: 0 },
    { region: 'North Side', zipCodes: '12347, 12348', travelFee: 25 },
    { region: 'South Side', zipCodes: '12349, 12350', travelFee: 25 },
  ],
  businessHours = 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed',
  emergencyAvailable = true,
  showMap = false,
  layout = 'grid',
  backgroundColor = '#f9f8f6',
  accentColor = '#3b82f6',
}) => {
  const layoutClasses = {
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    detailed: 'space-y-6',
  };

  return (
    <div 
      className="p-8"
      style={{ backgroundColor }}
      data-puck-component="AvailabilitySection"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      <div className={layoutClasses[layout]}>
        {serviceAreas.map((area, idx) => (
          <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition">
            <h3 className="text-lg font-semibold mb-2">{area.region}</h3>
            {area.zipCodes && (
              <p className="text-sm opacity-60 mb-2">ZIP: {area.zipCodes}</p>
            )}
            {area.travelFee !== undefined && (
              <p className="text-sm">
                {area.travelFee === 0 ? (
                  <span style={{ color: 'green' }}>No travel fee</span>
                ) : (
                  <span>Travel fee: ${area.travelFee}</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {(businessHours || emergencyAvailable) && (
        <div className="mt-8 p-6 bg-white rounded-lg border max-w-2xl mx-auto">
          {businessHours && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Business Hours</h3>
              <p className="text-sm opacity-80">{businessHours}</p>
            </div>
          )}

          {emergencyAvailable && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: 'green' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'green' }}>
                24/7 Emergency Service Available
              </span>
            </div>
          )}
        </div>
      )}

      {showMap && (
        <div className="mt-8 w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Map Placeholder</span>
        </div>
      )}
    </div>
  );
};

export const availabilitySectionConfig = {
  render: AvailabilitySection,
  label: 'Availability Section',
  description: 'Service regions/times for contractors and service businesses',
  category: 'commerce-services',
  defaultProps: {
    title: 'Service Areas',
    subtitle: 'We proudly serve the following regions.',
    serviceAreas: [
      { region: 'Downtown', zipCodes: '12345, 12346', travelFee: 0 },
    ],
    businessHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed',
    emergencyAvailable: true,
    showMap: false,
    layout: 'grid' as 'list' | 'grid' | 'detailed',
    backgroundColor: '#f9f8f6',
    accentColor: '#3b82f6',
  },
  fields: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    serviceAreas: {
      type: 'array',
      label: 'Service Areas',
      arrayFields: {
        region: { type: 'text', label: 'Region Name' },
        zipCodes: { type: 'text', label: 'ZIP Codes' },
        travelFee: { type: 'number', label: 'Travel Fee ($)' },
      },
    },
    businessHours: { type: 'textarea', label: 'Business Hours' },
    emergencyAvailable: { type: 'checkbox', label: '24/7 Emergency Available' },
    showMap: { type: 'checkbox', label: 'Show Map Placeholder' },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Detailed', value: 'detailed' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
};
