import React from 'react';

// ==========================================
// HEADERS (3)
// ==========================================

export const HeaderSimple = ({ title, navLinks }: { title: string, navLinks?: { label: string, href: string }[] }) => (
  <header className="h-20 px-10 border-b border-black/10 bg-white flex items-center justify-between">
    <div className="text-2xl font-serif italic text-[#1A1A1A]">{title}</div>
    {navLinks && navLinks.length > 0 && (
      <nav className="flex gap-8">
        {navLinks.map((link, i) => (
          <a key={i} href={link.href} className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-black/50 transition-colors">
            {link.label}
          </a>
        ))}
      </nav>
    )}
  </header>
);

export const HeaderPromo = ({ promoText, title }: { promoText: string, title: string }) => (
  <div>
    <div className="bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center py-2">
      {promoText}
    </div>
    <header className="h-20 px-10 border-b border-black/10 bg-white flex items-center justify-center">
      <div className="text-2xl font-serif italic text-[#1A1A1A]">{title}</div>
    </header>
  </div>
);

export const HeaderMega = ({ title }: { title: string }) => (
  <header className="px-10 py-6 border-b border-black/10 bg-white">
    <div className="flex items-center justify-between mb-6">
      <div className="text-3xl font-serif italic text-[#1A1A1A]">{title}</div>
      <button className="px-6 py-2 bg-black text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black/80 transition-all border border-black">
        Shop Now
      </button>
    </div>
    <nav className="flex gap-12 border-t border-black/10 pt-6">
      {['Category 1', 'Category 2', 'Category 3', 'About', 'Contact'].map((item, i) => (
        <a key={i} href="#" className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-black/50 transition-colors">
          {item}
        </a>
      ))}
    </nav>
  </header>
);

// ==========================================
// HEROES (4)
// ==========================================

export const HeroImageLeft = ({ heading, subheading, ctaText, image }: { heading: string, subheading: string, ctaText?: string, image?: string }) => (
  <div className="flex flex-col md:flex-row bg-[#F9F8F6] border-b border-black/10 min-h-[80vh]">
    <div className="flex-1 relative border-r border-black/10 min-h-[40vh]">
      {image ? (
        <img src={image} alt="Hero" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Image</span>
        </div>
      )}
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
      <h1 className="text-6xl font-serif italic tracking-tight leading-none text-[#1A1A1A] max-w-xl">{heading}</h1>
      <p className="text-sm uppercase tracking-[0.2em] mt-8 font-semibold text-black/50">{subheading}</p>
      {ctaText && (
        <button className="mt-12 px-8 py-4 bg-black text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black/80 transition-all border border-black focus:outline-none">
          {ctaText}
        </button>
      )}
    </div>
  </div>
);

export const HeroFullVisual = ({ heading, subheading, ctaText, padding = 'normal', image }: { heading: string, subheading: string, ctaText?: string, padding?: 'normal' | 'large', image?: string }) => (
  <div className={`relative px-10 text-center border-b border-black/10 ${padding === 'large' ? 'py-48' : 'py-32'} ${image ? 'text-white' : 'bg-[#F9F8F6] text-[#1A1A1A]'}`}>
    {image && (
      <>
        <img src={image} alt="Hero background" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      </>
    )}
    <div className="relative z-10 max-w-4xl mx-auto">
      <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight leading-none">{heading}</h1>
      <p className={`text-sm uppercase tracking-[0.2em] mt-8 font-semibold ${image ? 'text-white/80' : 'text-black/50'}`}>{subheading}</p>
      {ctaText && (
        <button className={`mt-12 px-10 py-5 text-[11px] uppercase font-bold tracking-widest transition-all border focus:outline-none ${image ? 'bg-white text-black hover:bg-white/90 border-white' : 'bg-black text-white hover:bg-black/80 border-black'}`}>
          {ctaText}
        </button>
      )}
    </div>
  </div>
);

export const HeroProductFirst = ({ heading, price, ctaText, image }: { heading: string, price: string, ctaText?: string, image?: string }) => (
  <div className="py-20 px-10 border-b border-black/10 bg-white">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 text-left">
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-none text-[#1A1A1A] mb-8">{heading}</h1>
        <p className="text-2xl font-serif italic text-black/60 mb-10">{price}</p>
        {ctaText && (
          <button className="px-8 py-4 bg-black text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black/80 transition-all border border-black focus:outline-none">
            {ctaText}
          </button>
        )}
      </div>
      <div className="flex-1 w-full aspect-square relative bg-[#F9F8F6] border border-black/10 p-8 flex items-center justify-center">
        {image ? (
          <img src={image} alt="Product" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain mix-blend-multiply" />
        ) : (
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Product Image</span>
        )}
      </div>
    </div>
  </div>
);

export const HeroServiceFirst = ({ heading, subheading, services, image }: { heading: string, subheading: string, services?: { label: string }[], image?: string }) => (
  <div className={`relative py-32 px-10 border-b border-black/10 ${image ? 'text-white' : 'bg-[#1A1A1A] text-white'} text-center overflow-hidden`}>
    {image && (
      <>
        <img src={image} alt="Background" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-black/60 z-0"></div>
      </>
    )}
    <div className="relative z-10 max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-none mb-8">{heading}</h1>
      <p className="text-sm uppercase tracking-[0.2em] font-semibold text-white/60 mb-16">{subheading}</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {(services || [{ label: 'Consulting' }, { label: 'Design' }, { label: 'Development' }]).map((service, i) => (
          <div key={i} className="px-6 py-3 border border-white/20 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer">
            {service.label}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ==========================================
// PRODUCT/SERVICE GRIDS (4)
// ==========================================

export const GridFeaturedProducts = ({ title }: { title: string }) => (
  <div className="py-24 px-10 bg-white border-b border-black/10">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-serif italic mb-12 text-center text-[#1A1A1A]">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-[3/4] mb-6 bg-[#F9F8F6] border border-black/5 flex items-center justify-center overflow-hidden">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Product {i}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:underline">Item Name {i}</h3>
              <p className="text-sm font-serif italic text-[#1A1A1A]">$99</p>
            </div>
            <p className="text-[11px] text-black/50">Category Name</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GridCollections = ({ title }: { title: string }) => (
  <div className="py-20 px-10 bg-[#F9F8F6] border-b border-black/10">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-serif italic mb-12 text-[#1A1A1A]">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map(i => (
          <div key={i} className="relative aspect-[16/9] bg-white border border-black/10 flex items-center justify-center overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors z-0"></div>
            <h3 className="relative z-10 text-3xl font-serif italic text-[#1A1A1A] bg-white px-8 py-4 border border-black/10">Collection {i}</h3>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
              <button className={`w-full py-4 text-[10px] uppercase font-bold tracking-widest transition-all border ${i === 1 ? 'bg-white text-black hover:bg-white/90 border-white' : 'bg-transparent text-black hover:bg-black/5 border-black/20'}`}>
                {pkg.ctaText || 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STORY/CONTENT (4)
// ==========================================

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

// ==========================================
// TRUST/PROOF (4)
// ==========================================

export const TrustReviews = ({ title }: { title: string }) => (
  <div className="py-20 px-10 bg-[#F9F8F6] border-b border-black/10">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
         <h2 className="text-3xl font-serif italic text-[#1A1A1A]">{title}</h2>
         <div className="flex text-lg tracking-widest opacity-80">★★★★★</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-8 border border-black/5 shadow-sm">
            <div className="flex text-sm tracking-widest text-black/60 mb-4">★★★★★</div>
            <p className="text-sm font-light text-black/80 mb-6 leading-relaxed">"An incredible experience from start to finish. The attention to detail is unmatched."</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50">Verified Buyer {i}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TrustTestimonials = ({ title }: { title: string }) => (
  <div className="py-24 px-10 bg-white border-b border-black/10">
    <div className="max-w-5xl mx-auto text-center">
      <h2 className="text-4xl font-serif italic mb-16 text-[#1A1A1A] leading-tight">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        {[1, 2].map(i => (
          <div key={i} className="bg-[#F9F8F6] p-12 border border-black/5 shadow-sm relative">
            <div className="absolute -top-6 -left-2 text-8xl font-serif opacity-10 leading-none">"</div>
            <p className="text-xl font-serif italic text-black/80 mb-8 leading-relaxed relative z-10">"This service transformed how we operate. Highly recommended to everyone seeking excellence."</p>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-black/10"></div>
               <div>
                 <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">Customer Name {i}</p>
                 <p className="text-[10px] text-black/40 uppercase tracking-widest">Company {i}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TrustLogos = () => (
  <div className="py-12 px-10 bg-white border-b border-black/10 text-center">
    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-8">Trusted By Industry Leaders</p>
    <div className="flex justify-center items-center gap-16 opacity-30 flex-wrap grayscale mix-blend-multiply">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="text-xl font-serif font-bold italic">Brand{i}</div>
      ))}
    </div>
  </div>
);

export const TrustStats = ({ title }: { title: string }) => (
  <div className="py-20 px-10 bg-[#1A1A1A] text-white border-b border-black/10">
    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
      {[
        { num: '10k+', label: 'Happy Clients' },
        { num: '99%', label: 'Satisfaction' },
        { num: '5', label: 'Years Active' },
        { num: '24/7', label: 'Support' }
      ].map((stat, i) => (
        <div key={i}>
          <div className="text-5xl font-serif italic mb-4 text-white/90">{stat.num}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// MEDIA (3)
// ==========================================

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

// ==========================================
// CONVERSION (4)
// ==========================================

export const ConversionFAQ = ({ questions }: { questions?: { q: string, a: string }[] }) => (
  <div className="py-24 px-10 bg-[#F9F8F6] border-b border-black/10">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-serif italic mb-12 text-[#1A1A1A]">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {(questions || [{ q: "What is your return policy?", a: "We offer 30-day returns on all items." }]).map((faq, i) => (
          <div key={i} className="border-b border-black/10 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] mb-2">{faq.q}</h3>
            <p className="text-[12px] text-black/60 leading-relaxed font-light">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ConversionNewsletter = ({ heading, description }: { heading: string, description: string }) => (
  <div className="py-24 px-10 bg-white border-b border-black/10">
    <div className="max-w-2xl mx-auto text-center border border-black/10 bg-[#F9F8F6] p-16 shadow-sm">
      <h2 className="text-3xl font-serif italic mb-4 text-[#1A1A1A]">{heading}</h2>
      <p className="text-[11px] text-black/60 uppercase tracking-widest font-bold mb-10">{description}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="email" placeholder="Your email address" className="flex-1 border border-black/20 bg-white py-4 px-5 focus:outline-none focus:border-black text-sm" />
        <button className="px-8 py-4 bg-black text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black/80 transition-all border border-black">Subscribe</button>
      </div>
    </div>
  </div>
);

export const ConversionQuoteCTA = ({ title }: { title: string }) => (
  <div className="py-24 px-10 bg-[#1A1A1A] text-white border-b border-black/10">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-5xl font-serif italic mb-8">{title}</h2>
      <p className="text-sm text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">Ready to elevate your project? Get in touch with our team today to discuss your vision and receive a custom estimate.</p>
      <button className="px-10 py-5 bg-white text-black text-[11px] uppercase font-bold tracking-widest hover:bg-white/90 transition-all border border-white focus:outline-none">
        Request a Quote
      </button>
    </div>
  </div>
);

export const ConversionStickyPromo = ({ text }: { text: string }) => (
  <div className="fixed bottom-0 left-0 w-full bg-[#1A1A1A] text-white py-3 px-6 z-50 border-t border-white/10 flex items-center justify-between shadow-2xl">
    <p className="text-[11px] uppercase tracking-widest font-bold">{text}</p>
    <button className="px-4 py-2 text-[9px] uppercase font-bold tracking-widest border border-white/30 hover:bg-white hover:text-black transition-colors">
      Claim Offer
    </button>
  </div>
);

// ==========================================
// FOOTERS (3)
// ==========================================

export const FooterBasic = ({ text }: { text: string }) => (
  <footer className="h-20 bg-black text-white px-10 flex items-center justify-between border-t border-black">
    <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/80">
      {text}
    </div>
    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest italic opacity-50">
      <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
      <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
    </div>
  </footer>
);

export const FooterCommerce = ({ title }: { title: string }) => (
  <footer className="bg-white px-10 py-16 border-t border-black/10">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-2xl font-serif italic mb-6 text-[#1A1A1A]">{title}</h3>
        <p className="text-[11px] text-black/50 leading-relaxed max-w-sm">Curating the finest goods for the modern lifestyle. Built for longevity and purpose.</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-6">Shop</h4>
        <ul className="space-y-4 text-[12px] text-black/60">
          <li><a href="#" className="hover:text-black transition-colors">New Arrivals</a></li>
          <li><a href="#" className="hover:text-black transition-colors">Best Sellers</a></li>
          <li><a href="#" className="hover:text-black transition-colors">All Products</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-6">Support</h4>
        <ul className="space-y-4 text-[12px] text-black/60">
          <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
          <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
          <li><a href="#" className="hover:text-black transition-colors">Shipping & Returns</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-black/10 max-w-6xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-black/40 font-bold">
      <p>&copy; {new Date().getFullYear()} {title}. All rights reserved.</p>
      <div className="flex gap-4 mt-4 md:mt-0">
         <span>Instagram</span>
         <span>Twitter</span>
         <span>Pinterest</span>
      </div>
    </div>
  </footer>
);

export const FooterService = ({ title }: { title: string }) => (
  <footer className="bg-[#1A1A1A] text-white px-10 py-20 border-t border-black">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
      <div>
        <h3 className="text-3xl font-serif italic mb-6">{title}</h3>
        <p className="text-[12px] text-white/50 leading-relaxed font-light">Delivering excellence in every project. We exist to solve complex problems with elegant solutions.</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Contact</h4>
        <p className="text-[12px] text-white/50 mb-3 font-serif italic">hello@example.com</p>
        <p className="text-[12px] text-white/50 font-sans tracking-widest">+1 (555) 123-4567</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Location</h4>
        <p className="text-[12px] text-white/50 leading-relaxed font-light">123 Design District<br/>New York, NY 10001<br/>United States</p>
      </div>
    </div>
  </footer>
);

