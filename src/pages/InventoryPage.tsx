import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { InventoryItem, MarketplaceSiteDraft } from '../lib/types';
import { buildSiteHeaders } from '../lib/siteDrafts';

function parseCsv(raw: string): InventoryItem[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [name, price, category, description] = line.split(',');
      return { name: name?.trim() || '', price: price?.trim() || '', category: category?.trim() || '', description: description?.trim() || '' };
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
  const [csvText, setCsvText] = useState('name,price,category,description');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems(draft.inventoryItems || []);
  }, [draft.siteId]);

  useEffect(() => {
    onSaveDraft(items.filter((item) => item.name.trim()));
    // onSaveDraft is intentionally omitted to avoid re-saving on every parent rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const totalItems = items.filter((item) => item.name.trim()).length;
  const hasProducts = totalItems > 0;

  const summary = useMemo(() => {
    const categories = new Set(items.map((item) => item.category).filter(Boolean));
    return `${totalItems} items${categories.size ? ` across ${categories.size} categories` : ''}`;
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

  function addItem() {
    setItems((current) => [...current, { name: '', price: '', category: '', description: '' }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
    const nextItems = [...items, ...parsed];
    setItems(nextItems);
    await persist(nextItems);
  }

  function generateStarterItems() {
    const generated: InventoryItem[] = draft.intakeData.primaryGoal === 'quote'
      ? [
          { name: 'Signature package', category: 'Packages', price: '2500', description: 'A high-value service package for your best-fit client.' },
          { name: 'Custom project', category: 'Custom', price: '5000', description: 'Tailored work for larger or more specialized requests.' },
        ]
      : [
          { name: 'Best seller', category: 'Featured', price: '95', description: 'A strong starter product with broad appeal.' },
          { name: 'Premium item', category: 'Premium', price: '145', description: 'Higher-ticket offer for your most engaged buyers.' },
          { name: 'Seasonal release', category: 'New', price: '125', description: 'Fresh inventory for launches and campaigns.' },
        ];

    const nextItems = [...items, ...generated];
    setItems(nextItems);
    setStatus('Starter items generated locally. Save to sync them.');
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] px-6 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Step 2 of 3</p>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">Real inventory starts here.</h1>
            <p className="text-black/60 mt-3">This route is where catalog truth lives. Your launch status and optional Medusa sync both depend on what you save here.</p>
          </div>
          <div className="bg-white border border-black/5 rounded-[24px] px-5 py-4 text-sm font-bold">{summary}</div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="bg-white border border-black/5 rounded-[32px] p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-serif italic">Inventory items</h2>
              <div className="flex gap-3 flex-wrap">
                <button onClick={generateStarterItems} className="px-4 py-3 rounded-full border border-black/10 font-bold text-sm inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Add starter items
                </button>
                <button onClick={addItem} className="px-4 py-3 rounded-full bg-black text-white font-bold text-sm inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add item
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.id || 'item'}-${index}`} className="border border-black/5 rounded-[24px] p-4 bg-[#F9F8F6] space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Name"
                      className="col-span-12 md:col-span-3 bg-white border border-black/10 rounded-2xl px-4 py-3"
                    />
                    <input
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, { price: e.target.value })}
                      placeholder="Price"
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
                  <div className="flex justify-end">
                    <button onClick={() => removeItem(index)} className="rounded-2xl border border-black/10 bg-white px-4 py-2 flex items-center gap-2 text-sm">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!items.length && (
                <div className="border border-dashed border-black/10 rounded-[28px] p-10 text-center text-black/45">
                  Add products, services, or packages here. Once saved, this inventory becomes the source for launch readiness and storefront rendering.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white border border-black/5 rounded-[32px] p-6">
              <h2 className="text-2xl font-serif italic mb-4">CSV quick import</h2>
              <p className="text-sm text-black/60 mb-4">Paste comma-separated data with headers: name,price,category,description</p>
              <textarea
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full border border-black/10 rounded-[24px] px-4 py-4 bg-[#F9F8F6] mb-4"
              />
              <button onClick={importCsv} className="w-full border border-black px-4 py-3 rounded-full font-bold">
                Import CSV rows
              </button>
            </div>

            <div className="bg-[#1A1A1A] text-white rounded-[32px] p-6">
              <h2 className="text-2xl font-serif italic mb-4">Launch checklist</h2>
              <ul className="space-y-3 text-sm text-white/75">
                <li>• Add at least one real item before launch.</li>
                <li>• Save inventory to route it through Supabase when available.</li>
                <li>• Commerce templates can also sync inventory to Medusa on deploy.</li>
              </ul>
              <p className="text-xs text-white/50 mt-4">{status || 'Nothing saved yet.'}</p>
            </div>
          </aside>
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
