import React, { useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  List, 
  FileJson,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { MarketplaceIntakeData, TemplateFamily, CommerceMode, InventoryItem } from "../lib/types";

export function Onboarding({ onComplete }: { onComplete: (data: MarketplaceIntakeData) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<MarketplaceIntakeData>({
    defaultValues: {
      businessType: 'retail-core',
      primaryGoal: 'checkout',
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

  const inventoryMethod = watch('inventory.method');

  const onSubmit = (data: MarketplaceIntakeData) => {
    onComplete(data);
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center p-4 border-8 border-white box-border overflow-x-hidden">
      <div className="max-w-2xl w-full bg-white p-10 border border-black/10 shadow-xl relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/5">
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            className="h-full bg-black"
          />
        </div>

        <div className="mb-12 flex justify-between items-end border-b border-black/5 pb-8">
          <div>
            <h2 className="text-4xl font-serif italic tracking-tight leading-none mb-2">
              {step === 1 ? "Business Identity" : "Inventory Intake"}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">Step {step} of 2</p>
          </div>
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-serif italic text-2xl">E</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Business Name</label>
                  <input 
                    {...register("businessName", { required: true })}
                    className="block w-full border-b border-black/10 bg-transparent py-4 focus:outline-none focus:border-black text-lg transition-colors italic font-serif"
                    placeholder="e.g. Bella's Blooms"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Category</label>
                  <select 
                    {...register("businessType", { required: true })}
                    className="block w-full border-b border-black/10 bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors cursor-pointer appearance-none"
                  >
                    <option value="retail-core">Retail Core (Boutiques, shops)</option>
                    <option value="service-pro">Service Pro (Consultants, skilled trade)</option>
                    <option value="food-catering">Food & Catering (Restaurants, trucks)</option>
                    <option value="artisan-market">Artisan Market (Handmade, local)</option>
                    <option value="event-floral">Event & Floral (Florists, planners)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">The Elevator Pitch</label>
                <textarea 
                   {...register("offerings", { required: true })}
                   rows={2}
                   className="block w-full border border-black/10 bg-black/[0.02] p-4 focus:outline-none focus:border-black text-sm transition-colors resize-none"
                   placeholder="Describe what makes your products or services unique..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Primary Goal</label>
                  <select 
                    {...register("primaryGoal", { required: true })}
                    className="block w-full border-b border-black/10 bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors cursor-pointer appearance-none"
                  >
                     <option value="checkout">Direct Checkout (E-commerce)</option>
                     <option value="catalog">Display Catalog (Lead Gen)</option>
                     <option value="quote">Request a Quote</option>
                     <option value="booking">Book Appointments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-black/50">Contact Email</label>
                  <input 
                    {...register("contactEmail", { required: true })}
                    type="email"
                    className="block w-full border-b border-black/10 bg-transparent py-4 focus:outline-none focus:border-black text-sm transition-colors"
                    placeholder="hi@brand.com"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-between items-center py-5 px-8 border border-black text-[10px] uppercase font-bold tracking-[0.2em] text-white bg-black hover:bg-black/90 transition-all group"
                >
                  Configure Inventory
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'text', label: 'Quick Text', icon: FileText },
                  { id: 'file', label: 'Upload CSV/Doc', icon: Upload },
                  { id: 'manual', label: 'Line Items', icon: List },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setValue('inventory.method', m.id as any)}
                    className={`flex flex-col items-center gap-3 p-4 border transition-all ${
                      inventoryMethod === m.id 
                        ? 'bg-black text-white border-black ring-1 ring-black' 
                        : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {inventoryMethod === 'text' && (
                  <div className="space-y-4">
                    <p className="text-xs text-black/50 italic">Paste a list of products, descriptions, or just raw notes. Our AI will structure it for your hub.</p>
                    <textarea 
                      {...register("inventory.content")}
                      className="block w-full h-[250px] border border-black/10 bg-black/[0.02] p-6 focus:outline-none focus:border-black text-sm transition-colors font-mono"
                      placeholder="Example:
Handmade Blue Vase - $45 - Unique ceramic piece
Organic Cotton Tote - $25 - Locally sourced..."
                    />
                  </div>
                )}

                {inventoryMethod === 'file' && (
                  <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-black/10 bg-black/[0.01] rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group">
                    <Upload className="w-10 h-10 text-black/20 group-hover:text-black transition-colors mb-4" />
                    <p className="text-sm font-bold">Drop CSV, PDF, or Word Document</p>
                    <p className="text-[10px] uppercase tracking-widest text-black/30 mt-2">Max file size 10MB</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setValue('inventory.fileName', file.name);
                      }}
                    />
                    {watch('inventory.fileName') && (
                      <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-200">
                        <Check className="w-3 h-3" />
                        {watch('inventory.fileName')}
                      </div>
                    )}
                  </div>
                )}

                {inventoryMethod === 'manual' && (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-black/[0.02] p-4 border border-black/5 rounded-lg group">
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
                        <div className="col-span-12">
                          <input 
                             {...register(`inventory.items.${index}.description` as const)}
                             placeholder="Brief description..."
                             className="w-full bg-transparent border-b border-black/5 py-1 text-xs text-black/50 focus:outline-none focus:border-black transition-colors"
                          />
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

              <div className="pt-8 flex gap-4">
                <button 
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex justify-center items-center py-5 px-8 border border-black/10 text-[10px] uppercase font-bold tracking-[0.2em] text-black hover:bg-black/5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Details
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="flex-[2] flex justify-center items-center py-5 px-8 border border-black text-[10px] uppercase font-bold tracking-[0.2em] text-white bg-black hover:bg-black/90 transition-all shadow-xl shadow-black/10"
                >
                  Build My Marketplace
                  <Check className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
