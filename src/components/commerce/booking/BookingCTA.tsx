/**
 * BookingCTA - Commerce-Native Puck Component
 * 
 * Appointment/request action for services.
 * Business primitive: "Book Consultation" or "Request Quote"
 * NOT a generic button with dataSource toggle.
 */

import React, { useState } from 'react';
import { PuckComponent } from '@measured/puck';

export interface BookingCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showMessage?: boolean;
  layout?: 'inline' | 'card' | 'hero';
  backgroundColor?: string;
  accentColor?: string;
}

export const BookingCTA: PuckComponent<BookingCTAProps> = ({
  title = 'Ready to Get Started?',
  subtitle = 'Book your appointment today and experience the difference.',
  buttonText = 'Book Now',
  showPhone = true,
  showEmail = true,
  showMessage = false,
  layout = 'card',
  backgroundColor = '#f9f8f6',
  accentColor = '#3b82f6',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const layoutClasses = {
    inline: 'flex items-center justify-between gap-6',
    card: 'p-8 rounded-xl',
    hero: 'p-12 text-center max-w-4xl mx-auto',
  };

  return (
    <div 
      className={`${layoutClasses[layout]}`}
      style={{ backgroundColor }}
      data-puck-component="BookingCTA"
    >
      <div className={layout === 'inline' ? 'flex-1' : 'space-y-4 mb-6'}>
        <h3 className="text-2xl font-bold">{title}</h3>
        {subtitle && (
          <p className="text-lg opacity-70">{subtitle}</p>
        )}
      </div>

      <button 
        className="px-8 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
        style={{ backgroundColor: accentColor }}
        onClick={() => setIsModalOpen(true)}
      >
        {buttonText}
      </button>

      {/* Simple booking modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <form className="space-y-4">
              {showPhone && (
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full p-3 border rounded-lg"
                />
              )}
              {showEmail && (
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full p-3 border rounded-lg"
                />
              )}
              {showMessage && (
                <textarea 
                  placeholder="Message" 
                  className="w-full p-3 border rounded-lg h-32"
                />
              )}
              <div className="flex gap-3">
                <button 
                  type="button"
                  className="flex-1 py-2 border rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-white rounded-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const bookingCTACConfig = {
  render: BookingCTA,
  label: 'Booking CTA',
  description: 'Appointment/request action for services',
  category: 'commerce-booking',
  defaultProps: {
    title: 'Ready to Get Started?',
    subtitle: 'Book your appointment today and experience the difference.',
    buttonText: 'Book Now',
    showPhone: true,
    showEmail: true,
    showMessage: false,
    layout: 'card' as 'inline' | 'card' | 'hero',
    backgroundColor: '#f9f8f6',
    accentColor: '#3b82f6',
  },
  fields: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'text', label: 'Subtitle' },
    buttonText: { type: 'text', label: 'Button Text' },
    showPhone: { type: 'checkbox', label: 'Show Phone Field' },
    showEmail: { type: 'checkbox', label: 'Show Email Field' },
    showMessage: { type: 'checkbox', label: 'Show Message Field' },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Inline', value: 'inline' },
        { label: 'Card', value: 'card' },
        { label: 'Hero', value: 'hero' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
};
