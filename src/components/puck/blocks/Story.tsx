import React from 'react';

export const StorySplit = ({ headline, body, image }: { headline: string, body: string, image?: string }) => (
  <div className="py-24 px-10 border-b border-black/10 bg-white">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 w-full relative">
        <div className="aspect-[4/3] bg-[#F9F8F6] border border-black/10 overflow-hidden relative">
          {image ? (
            <img src={image} alt="Story" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Image</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 text-left">
        <h2 className="text-4xl md:text-5xl font-serif italic mb-8 leading-tight text-[#1A1A1A]">{headline}</h2>
        <p className="text-sm text-black/70 leading-relaxed font-light">{body}</p>
        <button className="mt-10 border-b border-black pb-1 text-[10px] uppercase font-bold tracking-widest hover:text-black/60 transition-colors">
          Read Full Story
        </button>
      </div>
    </div>
  </div>
);

export const StoryValueIcons = ({ headline }: { headline: string }) => (
  <div className="py-20 px-10 bg-[#F9F8F6] border-b border-black/10">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl font-serif italic mb-16 text-[#1A1A1A]">{headline}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {['Quality', 'Sustainability', 'Craftsmanship', 'Longevity'].map((val, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-black/10 bg-white flex items-center justify-center mb-6">
              <span className="text-xl font-serif italic opacity-40">{i+1}</span>
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-3">{val}</h3>
            <p className="text-[11px] text-black/50 leading-relaxed max-w-[200px]">Our commitment to the highest standards.</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const StoryEditorialBand = ({ quote, author }: { quote: string, author: string }) => (
  <div className="py-32 px-10 bg-black text-white border-b border-black/10 text-center">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-serif italic leading-tight mb-10 text-white/90">"{quote}"</h2>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">&mdash; {author}</p>
    </div>
  </div>
);

export const StoryFounder = ({ name, bio, image }: { name: string, bio: string, image?: string }) => (
  <div className="py-24 px-10 bg-white border-b border-black/10">
    <div className="max-w-4xl mx-auto text-center">
      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border border-black/10 mb-8 bg-[#F9F8F6]">
        {image ? (
          <img src={image} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center">
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Photo</span>
           </div>
        )}
      </div>
      <h2 className="text-3xl font-serif italic mb-2 text-[#1A1A1A]">{name}</h2>
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-8">Founder & Creator</p>
      <p className="text-sm text-black/70 leading-relaxed font-light mx-auto max-w-2xl">{bio}</p>
    </div>
  </div>
);
