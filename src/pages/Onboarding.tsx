import React, { useMemo, useState } from 'react';
import { ArrowRight, BrushCleaning, Mail, Palette, Phone, Store } from 'lucide-react';
import { MarketplaceIntakeData, TemplateFamily } from '../lib/types';
import { TEMPLATE_EXAMPLES } from '../lib/templateCatalog';

interface OnboardingProps {
  onComplete: (data: MarketplaceIntakeData) => void;
}

const templates = Object.entries(TEMPLATE_EXAMPLES) as Array<[
  TemplateFamily,
  (typeof TEMPLATE_EXAMPLES)[TemplateFamily],
]>;

export function Onboarding({ onComplete }: OnboardingProps) {
  const queryTemplate = useMemo(() => {
    if (typeof window === 'undefined') return 'retail-core' as TemplateFamily;
    const value = new URLSearchParams(window.location.search).get('template') as TemplateFamily | null;
    return value && TEMPLATE_EXAMPLES[value] ? value : 'retail-core';
  }, []);

  const [form, setForm] = useState<MarketplaceIntakeData>({
    businessName: '',
    businessType: queryTemplate,
    offerings: '',
    primaryGoal: TEMPLATE_EXAMPLES[queryTemplate].intake.primaryGoal,
    contactEmail: '',
    contactPhone: '',
    serviceArea: '',
    tone: '',
    brandColor: TEMPLATE_EXAMPLES[queryTemplate].intake.brandColor,
  });

  const activeTemplate = TEMPLATE_EXAMPLES[form.businessType];

  function update<K extends keyof MarketplaceIntakeData>(key: K, value: MarketplaceIntakeData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    onComplete({
      ...form,
      contactEmail: form.contactEmail || 'hello@example.com',
      inventory: {
        method: 'manual',
        items: [],
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] px-6 py-10 md:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="bg-white border border-black/5 rounded-[32px] p-8 md:p-12 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/30 mb-6">Step 1 of 3</p>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight mb-6">Set the direction for your storefront.</h1>
          <p className="text-black/60 max-w-2xl mb-10">
            We will generate your editable site first, then route you into a dedicated inventory workspace before launch.
          </p>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Business name</span>
                <input
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  required
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 bg-white"
                  placeholder="Bella Blooms"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Contact email</span>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                    className="w-full border border-black/10 rounded-2xl pl-11 pr-4 py-4 bg-white"
                    placeholder="hello@yourbrand.com"
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Template family</span>
                <select
                  value={form.businessType}
                  onChange={(e) => {
                    const template = e.target.value as TemplateFamily;
                    update('businessType', template);
                    update('primaryGoal', TEMPLATE_EXAMPLES[template].intake.primaryGoal);
                    update('brandColor', TEMPLATE_EXAMPLES[template].intake.brandColor);
                  }}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 bg-white"
                >
                  {templates.map(([value, template]) => (
                    <option key={value} value={value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Primary goal</span>
                <select
                  value={form.primaryGoal}
                  onChange={(e) => update('primaryGoal', e.target.value as MarketplaceIntakeData['primaryGoal'])}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 bg-white"
                >
                  <option value="checkout">Sell directly</option>
                  <option value="catalog">Show a catalog</option>
                  <option value="quote">Capture quote requests</option>
                  <option value="booking">Book appointments</option>
                  <option value="digital">Deliver digital products</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">What are you selling?</span>
              <textarea
                value={form.offerings}
                onChange={(e) => update('offerings', e.target.value)}
                required
                rows={5}
                className="w-full border border-black/10 rounded-3xl px-4 py-4 bg-white"
                placeholder="Luxury floral arrangements for weddings, events, and gifting across Nashville."
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Phone</span>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    value={form.contactPhone || ''}
                    onChange={(e) => update('contactPhone', e.target.value)}
                    className="w-full border border-black/10 rounded-2xl pl-11 pr-4 py-4 bg-white"
                    placeholder="Optional"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Service area</span>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    value={form.serviceArea || ''}
                    onChange={(e) => update('serviceArea', e.target.value)}
                    className="w-full border border-black/10 rounded-2xl pl-11 pr-4 py-4 bg-white"
                    placeholder="Nashville"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Brand color</span>
                <div className="relative">
                  <Palette className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    value={form.brandColor || ''}
                    onChange={(e) => update('brandColor', e.target.value)}
                    className="w-full border border-black/10 rounded-2xl pl-11 pr-4 py-4 bg-white"
                    placeholder="#1A1A1A"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-2 block">Tone or creative direction</span>
              <div className="relative">
                <BrushCleaning className="w-4 h-4 absolute left-4 top-5 text-black/30" />
                <textarea
                  value={form.tone || ''}
                  onChange={(e) => update('tone', e.target.value)}
                  rows={3}
                  className="w-full border border-black/10 rounded-3xl pl-11 pr-4 py-4 bg-white"
                  placeholder="Elegant, premium, romantic, highly visual"
                />
              </div>
            </label>

            <button
              type="submit"
              className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-3 hover:scale-[1.02] transition-transform"
            >
              Generate editable storefront
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <aside className="bg-[#1A1A1A] text-white rounded-[32px] p-8 md:p-10">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-white/40 mb-4">Selected template</p>
          <h2 className="text-3xl font-serif italic mb-4">{activeTemplate.label}</h2>
          <p className="text-white/70 leading-relaxed mb-8">{activeTemplate.summary}</p>
          <div className="rounded-[28px] bg-white/5 border border-white/10 p-6 mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-3">What happens next</p>
            <ol className="space-y-4 text-sm text-white/80">
              <li>1. We generate your editable storefront structure and copy.</li>
              <li>2. You refine content in the editor, then move into a real inventory workspace.</li>
              <li>3. Inventory sync powers your launch plan and optional Medusa routing.</li>
            </ol>
          </div>
          <div className="rounded-[28px] bg-white text-black p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30 mb-2">Recommended vibe</p>
            <p className="font-bold mb-2">{activeTemplate.headline}</p>
            <p className="text-sm text-black/60">{activeTemplate.kicker}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
