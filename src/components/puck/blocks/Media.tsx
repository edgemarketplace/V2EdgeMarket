import React from 'react';

export const MediaGallery = ({ title, images }: { title: string, images?: { image: string }[] }) => (
  <div className="py-16 px-10 bg-white border-b border-black/10">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-serif italic mb-12 text-[#1A1A1A]">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(images && images.length > 0 ? images : [{image: null}, {image: null}, {image: null}, {image: null}]).map((img, i) => (
          <div key={i} className="aspect-[4/5] bg-[#F9F8F6] border border-black/5 flex items-center justify-center overflow-hidden relative group">
            {img?.image ? (
              <img src={img.image} alt={`Gallery ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Image {i+1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const MediaVideo = ({ title }: { title: string }) => (
  <div className="py-24 px-10 bg-[#F9F8F6] border-b border-black/10">
    <div className="max-w-5xl mx-auto">
       <h2 className="text-3xl font-serif italic mb-10 text-center text-[#1A1A1A]">{title}</h2>
       <div className="aspect-video bg-black/5 border border-black/10 flex items-center justify-center relative cursor-pointer group shadow-sm">
         <div className="w-20 h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
           <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-black border-b-[10px] border-b-transparent ml-2"></div>
         </div>
       </div>
    </div>
  </div>
);

export const MediaBeforeAfter = ({ 
  title, 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After",
  beforeDescription,
  afterDescription
}: { 
  title: string, 
  beforeImage?: string, 
  afterImage?: string, 
  beforeLabel?: string, 
  afterLabel?: string,
  beforeDescription?: string,
  afterDescription?: string
}) => (
  <div className="py-24 px-10 bg-white border-b border-black/10">
    <div className="max-w-6xl mx-auto text-center">
       <h2 className="text-4xl font-serif italic mb-16 text-[#1A1A1A]">{title}</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="relative group">
           <div className="aspect-square bg-[#F9F8F6] border border-black/10 flex items-center justify-center mb-6 overflow-hidden">
              {beforeImage ? (
                <img src={beforeImage} alt={beforeLabel} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Before Image</span>
              )}
           </div>
           <p className="text-[11px] font-bold uppercase tracking-widest text-black/90 mb-2">{beforeLabel}</p>
           {beforeDescription && (
             <p className="text-[12px] text-black/50 font-light max-w-[280px] mx-auto">{beforeDescription}</p>
           )}
         </div>
         <div className="relative group">
           <div className="aspect-square bg-black/5 border border-black/10 flex items-center justify-center mb-6 overflow-hidden">
              {afterImage ? (
                <img src={afterImage} alt={afterLabel} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">After Image</span>
              )}
           </div>
           <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">{afterLabel}</p>
           {afterDescription && (
             <p className="text-[12px] text-black/50 font-light max-w-[280px] mx-auto">{afterDescription}</p>
           )}
         </div>
       </div>
    </div>
  </div>
);
