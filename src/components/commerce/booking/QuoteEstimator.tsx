/**
 * QuoteEstimator - Commerce-Native Puck Component
 * 
 * Configurable pricing logic for services.
 * Business primitive: "Get a quote for your HVAC repair"
 * NOT a generic form with dataSource toggle.
 */

import React, { useState } from 'react';
import { PuckComponent } from '@measured/puck';

export interface QuoteField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface QuoteEstimatorProps {
  title?: string;
  subtitle?: string;
  fields?: QuoteField[];
  basePrice?: number;
  pricePerUnit?: number;
  unitLabel?: string;
  showTotal?: boolean;
  ctaText?: string;
  layout?: 'simple' | 'detailed' | 'multi-step';
  backgroundColor?: string;
  accentColor?: string;
}

export const QuoteEstimator: PuckComponent<QuoteEstimatorProps> = ({
  title = 'Get a Quote',
  subtitle = 'Fill out the form below for an instant estimate.',
  fields = [
    { id: 'service-type', label: 'Service Type', type: 'select', options: [
      { label: 'AC Repair', value: 'ac-repair' },
      { label: 'Maintenance', value: 'maintenance' },
      { label: 'Installation', value: 'installation' },
    ]},
    { id: 'square-feet', label: 'Square Footage', type: 'number', placeholder: 'e.g. 2000' },
    { id: 'urgency', label: 'Urgency', type: 'radio', options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Emergency', value: 'emergency' },
    ]},
  ],
  basePrice = 99,
  pricePerUnit = 0.1,
  unitLabel = 'sq ft',
  showTotal = true,
  ctaText = 'Get Quote',
  layout = 'detailed',
  backgroundColor = '#f9f8f6',
  accentColor = '#3b82f6',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [estimatedTotal, setEstimatedTotal] = useState(basePrice);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);

    // Simple price calculation (would be more complex in real impl)
    let total = basePrice;
    if (fieldId === 'square-feet' && value) {
      total += Number(value) * pricePerUnit;
    }
    if (newData['urgency'] === 'emergency') {
      total *= 1.5;
    }
    setEstimatedTotal(total);
  };

  const layoutClasses = {
    simple: 'max-w-lg mx-auto',
    detailed: 'max-w-2xl mx-auto',
    'multi-step': 'max-w-3xl mx-auto',
  };

  return (
    <div 
      className={`p-8 ${layoutClasses[layout]}`}
      style={{ backgroundColor }}
      data-puck-component="QuoteEstimator"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg opacity-70">{subtitle}</p>}
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            
            {field.type === 'text' && (
              <input 
                type="text"
                placeholder={field.placeholder}
                className="w-full p-3 border rounded-lg"
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'number' && (
              <input 
                type="number"
                placeholder={field.placeholder}
                className="w-full p-3 border rounded-lg"
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'select' && field.options && (
              <select 
                className="w-full p-3 border rounded-lg"
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {field.type === 'radio' && field.options && (
              <div className="space-y-2">
                {field.options.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name={field.id}
                      value={opt.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {showTotal && (
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-sm opacity-60">Estimated Total</div>
            <div className="text-4xl font-bold" style={{ color: accentColor }}>
              ${estimatedTotal.toFixed(2)}
            </div>
          </div>
        )}

        <button 
          className="w-full py-3 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition"
          style={{ backgroundColor: accentColor }}
          onClick={() => alert(`Quote requested: $${estimatedTotal.toFixed(2)}`)}
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export const quoteEstimatorConfig = {
  render: QuoteEstimator,
  label: 'Quote Estimator',
  description: 'Configurable pricing logic for services',
  category: 'commerce-booking',
  defaultProps: {
    title: 'Get a Quote',
    subtitle: 'Fill out the form below for an instant estimate.',
    fields: [
      { id: 'service-type', label: 'Service Type', type: 'select' as const, options: [
        { label: 'AC Repair', value: 'ac-repair' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Installation', value: 'installation' },
      ]},
    ],
    basePrice: 99,
    pricePerUnit: 0.1,
    unitLabel: 'sq ft',
    showTotal: true,
    ctaText: 'Get Quote',
    layout: 'detailed' as 'simple' | 'detailed' | 'multi-step',
    backgroundColor: '#f9f8f6',
    accentColor: '#3b82f6',
  },
  fields: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    fields: {
      type: 'array',
      label: 'Form Fields',
      arrayFields: {
        label: { type: 'text', label: 'Field Label' },
        type: {
          type: 'select',
          label: 'Field Type',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Number', value: 'number' },
            { label: 'Select', value: 'select' },
            { label: 'Radio', value: 'radio' },
          ],
        },
      },
    },
    basePrice: { type: 'number', label: 'Base Price' },
    pricePerUnit: { type: 'number', label: 'Price Per Unit' },
    unitLabel: { type: 'text', label: 'Unit Label' },
    showTotal: { type: 'checkbox', label: 'Show Total' },
    ctaText: { type: 'text', label: 'CTA Text' },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Detailed', value: 'detailed' },
        { label: 'Multi-Step', value: 'multi-step' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
};
