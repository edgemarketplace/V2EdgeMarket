import React, { useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  List,
  ArrowRight,
  Check
} from 'lucide-react';
import { MarketplaceIntakeData, InventoryItem } from "../lib/types";

export function Onboarding({ onComplete }: { onComplete: (data: MarketplaceIntakeData) => void }) {
  const [activeInventoryTab, setActiveInventoryTab] = useState<'text' | 'file' | 'manual'>('text');
  const { register, handleSubmit, control, watch, trigger, formState: { errors } } = useForm<MarketplaceIntakeData>({
    defaultValues: {
      businessType: 'retail-core',
      primaryGoal: 'checkout',
      businessName: '',
      offerings: '',
      contactEmail: '',
      inventory: {
        method: 'text',
        items: [{ name: '', price: 0, description: '' }]
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inventory.items"
  });

  const onSubmit = (data: MarketplaceIntakeData) => {
    onComplete(data);
  };

  const handleContinue = async () => {
    const isValid = await trigger(['businessName', 'businessType', 'offerings', 'primaryGoal', 'contactEmail']);
    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center p-4 border-8 border-white box-border overflow-x-hidden">
      <div className="max-w-7xl w-full bg-white border border-black/10 shadow-xl">
        
        {/* Header */}
        <div className="border-b border-black/5 p-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-serif italic tracking-tight leading-none mb-2">Business Identity</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">Step 1 of 1 — Configure your business</p>
          </div>
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-serif italic text-2xl">E</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          
          {/* LEFT: Business Details */}
          <div className="p-10 border-r border-black/5">
            <h3 className="text-lg font-serif italic mb-6">Business Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Business Name *</label>
                <input 
                  {...register("businessName", { required: "Business name is required" })}
                  className={`block w-full border-b ${errors.businessName ? 'border-red-500' : 'border-black/10'} bg-transparent py-4 focus:outline-none focus:border-black text-lg transition-colors italic font-serif`}
                  placeholder="e.g. Bella's Blooms"
                />
                {errors.businessName && <span className="text-[10px] text-red-500 mt-1 block">{errors.businessName.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Category *</label>
                  <select 
                    {...register("businessType", { required: "Category is required" })}
                    className={`block w-full border-b ${errors.businessType ? 'border-red-500' : 'border-black/10'} bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors cursor-pointer appearance-none`}
                  >
                    <option value="retail-core">Retail Core</option>
                    <option value="service-pro">Service Pro</option>
                    <option value="food-catering">Food & Catering</option>
                    <option value="artisan-market">Artisan Market</option>
                    <option value="event-floral">Event & Floral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Primary Goal *</label>
                  <select 
                    {...register("primaryGoal", { required: "Primary goal is required" })}
                    className={`block w-full border-b ${errors.primaryGoal ? 'border-red-500' : 'border-black/10'} bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors cursor-pointer appearance-none`}
                  >
                     <option value="checkout">Direct Checkout</option>
                     <option value="catalog">Display Catalog</option>
                     <option value="quote">Request Quote</option>
                     <option value="booking">Book Appointments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">The Elevator Pitch *</label>
                <textarea 
                   {...register("offerings", { required: "Please describe your offerings" })}
                   rows={3}
                   className={`block w-full border ${errors.offerings ? 'border-red-500' : 'border-black/10'} bg-black/[0.02] p-4 focus:outline-none focus:border-black text-sm transition-colors resize-none`}
                   placeholder="Describe what makes your products or services unique..."
                />
                {errors.offerings && <span className="text-[10px] text-red-500 mt-1 block">{errors.offerings.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Contact Email *</label>
                <input 
                  {...register("contactEmail", { 
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                  })}
                  type="email"
                  className={`block w-full border-b ${errors.contactEmail ? 'border-red-500' : 'border-black/10'} bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors`}
                  placeholder="hi@brand.com"
                />
                {errors.contactEmail && <span className="text-[10px] text-red-500 mt-1 block">{errors.contactEmail.message}</span>}
              </div>
            </div>
          </div>

          {/* RIGHT: Inventory Intake + Business Inventory */}
          <div className="p-10 bg-black/[0.02]">
            <h3 className="text-lg font-serif italic mb-6">Business Inventory</h3>
            <p className="text-xs text-black/50 italic mb-6">Add your products, services, packages, and booking slots. Each type has its own business-native fields (duration, pricing model, service radius).</p>
            
            {/* Inventory Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'text' as const, label: 'Quick Text', icon: FileText },
                { id: 'file' as const, label: 'Upload CSV/Doc', icon: Upload },
                { id: 'manual' as const, label: 'Line Items', icon: List },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveInventoryTab(m.id);
                    // This would update the form value in a real implementation
                  }}
                  className={`flex flex-col items-center gap-2 p-3 border transition-all text-xs font-bold uppercase tracking-widest ${
                    activeInventoryTab === m.id
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Inventory Input Area */}
            <div className="min-h-[300px] mb-6">
              {activeInventoryTab === 'text' && (
                <div className="space-y-4">
                  <p className="text-xs text-black/50 italic">Paste a list of products, descriptions, or just raw notes. Our AI will structure it for your hub.</p>
                  <textarea 
                    {...register("inventory.content")}
                    className="block w-full h-[250px] border border-black/10 bg-white p-4 focus:outline-none focus:border-black text-sm transition-colors font-mono"
                    placeholder="Example:
Handmade Blue Vase - $45 - Unique ceramic piece
Organic Cotton Tote - $25 - Locally sourced..."
                  />
                </div>
              )}

              {activeInventoryTab === 'file' && (
                <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-black/10 bg-white rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group">
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

              {activeInventoryTab === 'manual' && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-white p-4 border border-black/5 rounded-lg">
                      <div className="col-span-6">
                         <input 
                           {...register(`inventory.items.${index}.name` as const)}
                           placeholder="Product Name"
                           className="w-full bg-transparent border-b border-black/5 py-2 font-bold focus:outline-none focus:border-black transition-colors"
                         />
                      </div>
                      <div className="col-span-4">
                         <input 
                           {...register(`inventory.items.${index}.price` as const)}
                           type="number"
                           placeholder="Price"
                           className="w-full bg-transparent border-b border-black/5 py-2 focus:outline-none focus:border-black transition-colors"
                         />
                      </div>
                      <div className="col-span-2 flex justify-end">
                         <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="p-2 text-black/20 hover:text-red-500 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => append({ name: '', price: 0, description: '' })}
                    className="w-full py-4 border border-dashed border-black/10 text-black/40 hover:text-black hover:border-black transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Quick Inventory Type Reference */}
            <div className="bg-white p-4 border border-black/5 rounded-lg">
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
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-10 border-t border-black/5">
          <button 
            type="button"
            onClick={handleContinue}
            className="w-full flex justify-between items-center py-5 px-8 border border-black text-[10px] uppercase font-bold tracking-[0.2em] text-white bg-black hover:bg-black/90 transition-all group"
          >
            Continue to Editor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
