import React from 'react';
import { useCart } from '../../../lib/cart';

export const GridFeaturedProducts = ({ title, items }: { title: string, items?: { name: string, price: string, category: string, image?: string }[] }) => {
  const { addItem } = useCart();
  const defaultItems = [1, 2, 3, 4].map(i => ({ name: `Item Name ${i}`, price: "$99", category: "Category Name", image: "" }));
  const products = items || defaultItems;
  return (
    <div className="py-24 px-10 bg-white border-b border-black/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-serif italic mb-12 text-center text-[#1A1A1A]">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((item, i) => (
            <div 
              key={i} 
              className="group cursor-pointer"
              onClick={() => addItem({ id: `prod-${i}`, name: item.name, price: item.price, image: item.image })}
            >
              <div className="aspect-[3/4] mb-6 bg-[#F9F8F6] border border-black/5 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Product {i+1}</span>
                )}
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:underline">{item.name}</h3>
                <p className="text-sm font-serif italic text-[#1A1A1A]">{item.price}</p>
              </div>
              <p className="text-[11px] text-black/50">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GridCollections = ({ title, items }: { title: string, items?: { title: string, image?: string }[] }) => {
  const collections = items || [1, 2].map(i => ({ title: `Collection ${i}`, image: "" }));
  return (
    <div className="py-20 px-10 bg-[#F9F8F6] border-b border-black/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-serif italic mb-12 text-[#1A1A1A]">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((item, i) => (
            <div key={i} className="relative aspect-[16/9] bg-white border border-black/10 flex items-center justify-center overflow-hidden group cursor-pointer">
              {item.image && <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors z-0"></div>
              <h3 className="relative z-10 text-3xl font-serif italic text-[#1A1A1A] bg-white px-8 py-4 border border-black/10">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GridServiceCards = ({ title, description, items }: { title: string, description: string, items?: { title: string, description: string, image?: string }[] }) => (
  <div className="py-20 px-10 border-b border-black/10 bg-[#F9F8F6]">
    <div className="max-w-6xl mx-auto">
      <div className="mb-16 md:flex md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-serif italic mb-4 leading-tight text-[#1A1A1A]">{title}</h2>
          <p className="text-sm text-black/60">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(items || [1, 2, 3].map(i => ({ title: `Service ${i}`, description: 'Focused on quality and precision.', image: undefined }))).map((item, i) => (
          <div key={i} className="bg-white border border-black/5 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="h-48 bg-black/5 mb-8 border border-black/10 flex items-center justify-center overflow-hidden relative">
               {item.image ? (
                 <img src={item.image} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Asset</span>
               )}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-tight mb-3 text-[#1A1A1A]">{item.title}</h3>
            <p className="text-[12px] leading-relaxed text-black/60">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GridPackages = ({ title, items }: { title: string, items?: { name: string, price: string, features: { label: string }[], ctaText?: string }[] }) => {
  const defaultItems = [
    { name: 'Basic', price: '$99', ctaText: 'Select Basic', features: [{ label: 'Feature 1' }, { label: 'Feature 2' }] },
    { name: 'Pro', price: '$199', ctaText: 'Select Pro', features: [{ label: 'Feature 1' }, { label: 'Feature 2' }, { label: 'Feature 3' }] },
    { name: 'Elite', price: '$299', ctaText: 'Select Elite', features: [{ label: 'Feature 1' }, { label: 'Feature 2' }, { label: 'Feature 3' }, { label: 'Feature 4' }] }
  ];

  const packages = items || defaultItems;
  const { addItem } = useCart();

  return (
    <div className="py-24 px-10 bg-white border-b border-black/10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-serif italic mb-16 text-center text-[#1A1A1A]">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <div key={i} className={`p-10 border ${i === 1 ? 'border-black bg-[#1A1A1A] text-white shadow-lg' : 'border-black/10 bg-white shadow-sm'} relative`}>
              {i === 1 && !items && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-widest border border-black">Popular</div>}
              <h3 className={`text-xl font-serif italic mb-2 ${i === 1 ? 'text-white' : 'text-[#1A1A1A]'}`}>{pkg.name}</h3>
              <div className="text-4xl font-serif mb-8 mt-4">
                {pkg.price}
                <span className={`text-[10px] uppercase tracking-widest ${i === 1 ? 'text-white/50' : 'text-black/40'} font-sans ml-1`}>/mo</span>
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features?.map((feat, featIndex) => (
                  <li key={featIndex} className={`text-[11px] flex items-center gap-3 ${i === 1 ? 'text-white/80' : 'text-black/70'}`}>
                    <span className="w-1 h-1 rounded-full bg-current opacity-50"></span> {feat.label}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => addItem({ id: `pkg-${i}`, name: pkg.name, price: pkg.price })}
                className={`w-full py-4 text-[10px] uppercase font-bold tracking-widest transition-all border ${i === 1 ? 'bg-white text-black hover:bg-white/90 border-white' : 'bg-transparent text-black hover:bg-black/5 border-black/20'}`}
              >
                {pkg.ctaText || 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GridProductDetail = ({ name, price, description, image, features }: { name: string; price: string; description: string; image?: string; features?: { label: string }[] }) => {
  const { addItem } = useCart();
  const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";
  
  return (
    <div className="py-24 px-10 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="aspect-square bg-black/5 overflow-hidden border border-black/5">
          <img src={image || defaultImage} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-6xl font-serif italic mb-4 text-[#1A1A1A]">{name || 'Product Name'}</h1>
          <p className="text-3xl font-serif mb-8 text-black/60">{price || '$0.00'}</p>
          <p className="text-lg text-black/70 mb-10 leading-relaxed">{description || 'Detailed product description goes here. Explain why this item is special.'}</p>
          
          {features && (
            <ul className="space-y-4 mb-12">
              {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-black/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  {feat.label}
                </li>
              ))}
            </ul>
          )}
          
          <button 
            onClick={() => addItem({ id: 'current-product', name: name || 'Product', price: price || '$0.00', image: image || defaultImage })}
            className="px-12 py-5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};
