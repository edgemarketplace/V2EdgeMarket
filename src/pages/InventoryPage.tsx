import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Save, Sparkles, Trash2, Clock, MapPin, DollarSign, Calendar, FileText, Upload, List } from 'lucide-react';
import { InventoryItem, InventoryEntityType, MarketplaceSiteDraft, AvailabilityWindow } from '../lib/types';
import { buildSiteHeaders } from '../lib/siteDrafts';
import { validateInventoryItem, validateService, validatePackage } from '../lib/commerce-runtime';

function parseCsv(raw: string): Partial<InventoryItem>[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [name, price, category, description, type, duration, serviceRadius, pricingModel] = line.split(',');
      return {
        name: name?.trim() || '',
        price: price?.trim() || '',
        category: category?.trim() || '',
        description: description?.trim() || '',
        type: (type?.trim() as InventoryEntityType) || undefined,
        duration: duration ? parseInt(duration) : undefined,
        serviceRadius: serviceRadius ? parseInt(serviceRadius) : undefined,
        pricingModel: pricingModel?.trim() as any || undefined,
      };
    })
    .filter((item) => item.name);
}

export function InventoryPage({
  draft,
  onBack,
  onContinue,
  onSaveDraft,
}: {
  draft: MarketplaceSiteDraft;
  onBack: () => void;
  onContinue: (items: InventoryItem[]) => void;
  onSaveDraft: (items: InventoryItem[]) => void;
}) {
  const [items, setItems] = useState<InventoryItem[]>(draft.inventoryItems || []);
  const [csvText, setCsvText] = useState('name,price,category,description,type,duration,serviceRadius,pricingModel');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [activeIntakeTab, setActiveIntakeTab] = useState<'text' | 'file' | 'manual'>('text');
  const [manualItems, setManualItems] = useState([{ name: '', price: '', description: '' }]);

  useEffect(() => {
    setItems(draft.inventoryItems || []);
  }, [draft.siteId]);

  useEffect(() => {
    onSaveDraft(items.filter((item) => item.name.trim()));
  }, [items]);

  const totalItems = items.filter((item) => item.name.trim()).length;
  const hasProducts = totalItems > 0;

  const summary = useMemo(() => {
    const byType = items.reduce((acc, item) => {
      const t = item.type || 'product';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return `${totalItems} items: ${Object.entries(byType).map(([k, v]) => `${v} ${k}`).join(', ')}`;
  }, [items, totalItems]);

  function updateItem(index: number, patch: Partial<InventoryItem>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function handleImageUpload(index: number, file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      updateItem(index, { image: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function addItem(type: InventoryEntityType = 'product') {
    const base: InventoryItem = {
      name: '',
      price: '',
      category: '',
      description: '',
      type,
    };
    if (type === 'service') {
      base.duration = 60;
      base.pricingModel = 'hourly';
      base.serviceRadius = 25;
    } else if (type === 'package' || type === 'subscription') {
      base.pricingModel = 'fixed';
      base.features = [];
    }
    setItems((current) => [...current, base]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function getValidationErrors(item: InventoryItem): string[] {
    let result;
    if (item.type === 'service') {
      result = validateService(item);
    } else if (item.type === 'package' || item.type === 'subscription') {
      result = validatePackage(item);
    } else {
      result = validateInventoryItem(item);
    }
    return result.errors.map((e) => e.message);
  }

  async function persist(nextItems = items) {
    setSaving(true);
    setStatus('Saving inventory…');
    try {
      const response = await fetch(`/api/inventory?siteId=${encodeURIComponent(draft.siteId)}`, {
        method: 'PUT',
        headers: buildSiteHeaders(draft),
        body: JSON.stringify({ items: nextItems.filter((item) => item.name.trim()) }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      onSaveDraft(nextItems.filter((item) => item.name.trim()));
      setStatus('Inventory saved.');
    } catch (error) {
      console.error(error);
      onSaveDraft(nextItems.filter((item) => item.name.trim()));
      setStatus('Saved locally. Server sync was unavailable.');
    } finally {
      setSaving(false);
    }
  }

  async function importCsv() {
    const parsed = parseCsv(csvText);
    const nextItems = [...items, ...(parsed as InventoryItem[])];
    setItems(nextItems);
    await persist(nextItems);
  }

  function generateStarterItems() {
    const isServiceBusiness = draft.intakeData?.primaryGoal === 'quote';
    const generated: InventoryItem[] = isServiceBusiness
      ? [
          {
            name: 'On-site Consultation',
            type: 'service' as InventoryEntityType,
            price: '150',
            category: 'Consulting',
            description: 'Initial site visit and needs assessment.',
            duration: 90,
            pricingModel: 'hourly' as const,
            serviceRadius: 30,
          },
          {
            name: 'Premium Installation Package',
            type: 'package' as InventoryEntityType,
            price: '2500',
            category: 'Packages',
            description: 'Full service with materials and warranty.',
            features: ['All materials included', '2-year warranty', 'Flexible scheduling'],
            pricingModel: 'fixed' as const,
          },
        ]
      : [
          {
            name: 'Best Seller Package',
            type: 'product' as InventoryEntityType,
            price: '95',
            category: 'Featured',
            description: 'A strong starter product with broad appeal.',
          },
        ];

    const nextItems = [...items, ...generated];
    setItems(nextItems);
    setStatus('Starter items generated locally. Save to sync them.');
  }

  function getEntityIcon(type?: InventoryEntityType) {
    switch (type) {
      case 'service':
        return <Clock className="w-3 h-3" />;
      case 'package':
      case 'subscription':
        return <DollarSign className="w-3 h-3" />;
      case 'booking_slot':
        return <Calendar className="w-3 h-3" />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] px-6 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Step 2 of 3</p>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">Business Inventory</h1>
            <p className="text-black/60 mt-3">
              Add your products, services, packages, and booking slots. Each type has its own business-native fields (duration, pricing model, service radius).
            </p>
          </div>
          <div className="bg-white border border-black/5 rounded-[24px] px-5 py-4 text-sm font-bold">{summary}</div>
        </div>

        {/* MAIN CONTENT: Single column, Business Inventory on top */}
        <div className="space-y-8">
          
          {/* SECTION 1: Business Inventory (TOP) */}
          <section className="bg-white border border-black/5 rounded-[32px] p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-serif italic">Inventory Items</h2>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => addItem('product')} className="px-4 py-3 rounded-full border border-black/10 font-bold text-sm inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add product
                </button>
                <button onClick={() => addItem('service')} className="px-4 py-3 rounded-full border border-blue-200 bg-blue-50 text-blue-800 font-bold text-sm inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Add service
                </button>
                <button onClick={() => addItem('package')} className="px-4 py-3 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-sm inline-flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Add package
                </button>
                <button onClick={generateStarterItems} className="px-4 py-3 rounded-full border border-black/10 font-bold text-sm inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate starters
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const errors = getValidationErrors(item);
                return (
                  <div key={`${item.id || 'item'}-${index}`} className={`border rounded-[24px] p-4 space-y-3 ${errors.length ? 'border-amber-300 bg-amber-50' : 'border-black/5 bg-[#F9F8F6]'}`}>
                    <div className="grid grid-cols-12 gap-3">
                      {/* Type badge */}
                      <div className="col-span-12 flex items-center gap-2">
                        <select
                          value={item.type || 'product'}
                          onChange={(e) => updateItem(index, { type: e.target.value as InventoryEntityType })}
                          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border border-black/10 bg-white"
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                          <option value="package">Package</option>
                          <option value="subscription">Subscription</option>
                          <option value="booking_slot">Booking Slot</option>
                        </select>
                        {getEntityIcon(item.type)}
                        <span className="text-xs text-black/40">{item.type || 'product'}</span>
                      </div>

                      <input
                        value={item.name}
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        placeholder="Name *"
                        className="col-span-12 md:col-span-4 bg-white border border-black/10 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={item.price || ''}
                        onChange={(e) => updateItem(index, { price: e.target.value })}
                        placeholder="Price *"
                        className="col-span-6 md:col-span-2 bg-white border border-black/10 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={item.category || ''}
                        onChange={(e) => updateItem(index, { category: e.target.value })}
                        placeholder="Category"
                        className="col-span-6 md:col-span-3 bg-white border border-black/10 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        placeholder="Description"
                        className="col-span-8 md:col-span-3 bg-white border border-black/10 rounded-2xl px-4 py-3"
                      />

                      {/* Service-native fields */}
                      {item.type === 'service' && (
                        <>
                          <input
                            value={item.duration || ''}
                            onChange={(e) => updateItem(index, { duration: parseInt(e.target.value) || undefined })}
                            placeholder="Duration (min)"
                            type="number"
                            className="col-span-4 md:col-span-2 bg-white border border-blue-200 rounded-2xl px-4 py-3 text-xs"
                          />
                          <input
                            value={item.serviceRadius || ''}
                            onChange={(e) => updateItem(index, { serviceRadius: parseInt(e.target.value) || undefined })}
                            placeholder="Radius (mi)"
                            type="number"
                            className="col-span-4 md:col-span-2 bg-white border border-blue-200 rounded-2xl px-4 py-3 text-xs"
                          />
                          <select
                            value={item.pricingModel || 'hourly'}
                            onChange={(e) => updateItem(index, { pricingModel: e.target.value as any })}
                            className="col-span-4 md:col-span-2 bg-white border border-blue-200 rounded-2xl px-4 py-3 text-xs"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="fixed">Fixed</option>
                            <option value="package">Package</option>
                          </select>
                        </>
                      )}

                      {/* Package/Subscription fields */}
                      {(item.type === 'package' || item.type === 'subscription') && (
                        <>
                          <select
                            value={item.billingCycle || 'one-time'}
                            onChange={(e) => updateItem(index, { billingCycle: e.target.value as any })}
                            className="col-span-4 md:col-span-2 bg-white border border-emerald-200 rounded-2xl px-4 py-3 text-xs"
                          >
                            <option value="one-time">One-time</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <input
                            value={item.features?.join(', ') || ''}
                            onChange={(e) => updateItem(index, { features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean) })}
                            placeholder="Features (comma-separated)"
                            className="col-span-8 md:col-span-4 bg-white border border-emerald-200 rounded-2xl px-4 py-3 text-xs"
                          />
                        </>
                      )}

                      <div className="col-span-4 md:col-span-1 flex items-center justify-center gap-2">
                        {item.image ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-black/10">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <button
                              onClick={() => updateItem(index, { image: undefined })}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label className="w-10 h-10 border-2 border-dashed border-black/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-black/40 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                            />
                            <span className="text-[10px]">📷</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Validation errors */}
                    {errors.length > 0 && (
                      <div className="text-xs text-amber-700 space-y-1">
                        {errors.map((err, i) => (
                          <div key={i}>⚠️ {err}</div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button onClick={() => removeItem(index)} className="rounded-2xl border border-black/10 bg-white px-4 py-2 flex items-center gap-2 text-sm">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              {!items.length && (
                <div className="border border-dashed border-black/10 rounded-[28px] p-10 text-center text-black/45">
                  Add products, services, packages, or booking slots. Each type has business-native fields (duration, pricing model, service radius, features).
                </div>
              )}
            </div>
          </section>

          {/* SECTION 2: CSV Quick Import (BELOW) */}
          <section className="bg-white border border-black/5 rounded-[32px] p-6 md:p-8">
            <h2 className="text-2xl font-serif italic mb-4">CSV Quick Import</h2>
            <p className="text-sm text-black/60 mb-4">Paste comma-separated data with headers: name,price,category,description,type,duration,serviceRadius,pricingModel</p>
            <textarea
              rows={10}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full border border-black/10 rounded-[24px] px-4 py-4 bg-[#F9F8F6] mb-4"
            />
            <button onClick={importCsv} className="w-full border border-black px-4 py-3 rounded-full font-bold">
              Import CSV rows
            </button>
          </section>

          {/* SECTION 3: Entity Types Reference */}
          <section className="bg-[#1A1A1A] text-white rounded-[32px] p-6 md:p-8">
            <h2 className="text-2xl font-serif italic mb-4">Entity Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: 'P', title: 'Product', desc: 'Physical/digital goods with price and category.', color: 'white/10' },
                { icon: <Clock className="w-5 h-5 text-blue-400" />, title: 'Service', desc: 'Duration, service radius, pricing model (hourly/fixed).', color: 'blue-900/30' },
                { icon: <DollarSign className="w-5 h-5 text-emerald-400" />, title: 'Package/Subscription', desc: 'Features list, billing cycle (monthly/yearly/one-time).', color: 'emerald-900/30' },
                { icon: <Calendar className="w-5 h-5 text-purple-400" />, title: 'Booking Slot', desc: 'Availability windows, capacity, recurrence.', color: 'purple-900/30' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl bg-${item.color}`}>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {typeof item.icon === 'string' ? <span className="text-[10px] font-bold">{item.icon}</span> : item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-4">{status || 'Nothing saved yet.'}</p>
          </section>
        </div>

        <div className="flex flex-wrap justify-between gap-4 mt-8">
          <button onClick={onBack} className="px-6 py-4 rounded-full border border-black/10 font-bold inline-flex items-center gap-3 bg-white">
            <ArrowLeft className="w-4 h-4" />
            Back to editor
          </button>
          <div className="flex gap-3 flex-wrap">
            <button disabled={saving} onClick={() => persist()} className="px-6 py-4 rounded-full border border-black/10 font-bold inline-flex items-center gap-3 bg-white disabled:opacity-60">
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save inventory'}
            </button>
            <button
              disabled={!hasProducts}
              onClick={async () => {
                await persist();
                onContinue(items.filter((item) => item.name.trim()));
              }}
              className="px-6 py-4 rounded-full bg-black text-white font-bold inline-flex items-center gap-3 disabled:opacity-40"
            >
              Continue to launch
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
