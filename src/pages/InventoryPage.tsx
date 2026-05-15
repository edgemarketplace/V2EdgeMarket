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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const response = await fetch(`/api/sites/${draft.siteId}/inventory`, {
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8">
          
          {/* LEFT: Inventory Intake */}
          <section className="bg-white border border-black/5 rounded-[32px] p-6 md:p-8">
            <h2 className="text-2xl font-serif italic mb-4">Inventory Intake</h2>
            <p className="text-xs text-black/50 italic mb-6">Import your existing catalog or add items manually.</p>
            
            {/* Intake Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'text' as const, label: 'Quick Text', icon: FileText },
                { id: 'file' as const, label: 'Upload CSV/Doc', icon: Upload },
                { id: 'manual' as const, label: 'Line Items', icon: List },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveIntakeTab(m.id)}
                  className={`flex flex-col items-center gap-2 p-3 border transition-all text-xs font-bold uppercase tracking-widest ${
                    activeIntakeTab === m.id
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Text Import */}
            {activeIntakeTab === 'text' && (
              <div className="space-y-4">
                <p className="text-xs text-black/50 italic">Paste a list of products, descriptions, or just raw notes. Our AI will structure it for your hub.</p>
                <textarea 
                  rows={10}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="block w-full border border-black/10 bg-black/[0.02] p-4 focus:outline-none focus:border-black text-sm transition-colors font-mono"
                  placeholder="Example:
Handmade Blue Vase - $45 - Unique ceramic piece
Organic Cotton Tote - $25 - Locally sourced..."
                />
                <button onClick={importCsv} className="w-full border border-black px-4 py-3 rounded-full font-bold text-sm">
                  Import Text
                </button>
              </div>
            )}

            {/* File Upload */}
            {activeIntakeTab === 'file' && (
              <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-black/10 bg-black/[0.01] rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group">
                <Upload className="w-10 h-10 text-black/20 group-hover:text-black transition-colors mb-4" />
                <p className="text-sm font-bold">Drop CSV, PDF, or Word Document</p>
                <p className="text-[10px] uppercase tracking-widest text-black/30 mt-2">Max file size 10MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.pdf,.doc,.docx"
                />
              </div>
            )}

            {/* Manual Entry */}
            {activeIntakeTab === 'manual' && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {manualItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start bg-black/[0.02] p-4 border border-black/5 rounded-lg">
                    <div className="col-span-6">
                       <input 
                         value={item.name}
                         onChange={(e) => {
                           const newItems = [...manualItems];
                           newItems[index].name = e.target.value;
                           setManualItems(newItems);
                         }}
                         placeholder="Item Name"
                         className="w-full bg-transparent border-b border-black/5 py-2 font-bold focus:outline-none focus:border-black transition-colors"
                       />
                    </div>
                    <div className="col-span-4">
                       <input 
                         value={item.price}
                         onChange={(e) => {
                           const newItems = [...manualItems];
                           newItems[index].price = e.target.value;
                           setManualItems(newItems);
                         }}
                         type="number"
                         placeholder="Price"
                         className="w-full bg-transparent border-b border-black/5 py-2 focus:outline-none focus:border-black transition-colors"
                       />
                    </div>
                    <div className="col-span-2 flex justify-end">
                       <button 
                        type="button" 
                        onClick={() => setManualItems(manualItems.filter((_, i) => i !== index))}
                        className="p-2 text-black/20 hover:text-red-500 transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => setManualItems([...manualItems, { name: '', price: '', description: '' }])}
                  className="w-full py-4 border border-dashed border-black/10 text-black/40 hover:text-black hover:border-black transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
              <button onClick={generateStarterItems} className="w-full border border-black/10 font-bold text-sm inline-flex items-center gap-2 justify-center py-3 rounded-full">
                <Sparkles className="w-4 h-4" />
                Generate Starters
              </button>
            </div>

            {/* Entity Types Reference */}
            <div className="mt-6 bg-black/[0.02] p-4 border border-black/5 rounded-lg">
              <p className="text-[10px] uppercase tracking-widest font-bold text-black/30 mb-3">Inventory Types</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { type: 'Product', fields: 'Price, SKU, Stock' },
                  { type: 'Service', fields: 'Duration, Radius, Pricing' },
                  { type: 'Package', fields: 'Items, Billing, Features' },
                  { type: 'Booking Slot', fields: 'Time, Capacity, Availability' }
                ].map((item) => (
                  <div key={item.type} className="p-2 border border-black/5 rounded">
                    <p className="font-bold">{item.type}</p>
                    <p className="text-black/40 text-[10px]">{item.fields}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: Business Inventory */}
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
