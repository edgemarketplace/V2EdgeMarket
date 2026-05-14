import React from 'react';

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

export const ConversionQuoteCTA = ({ title, description, ctaText }: { title: string, description?: string, ctaText?: string }) => (
  <div className="py-24 px-10 bg-[#1A1A1A] text-white border-b border-black/10">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-5xl font-serif italic mb-8">{title}</h2>
      <p className="text-sm text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
        {description || "Ready to elevate your project? Get in touch with our team today to discuss your vision and receive a custom estimate."}
      </p>
      <button className="px-10 py-5 bg-white text-black text-[11px] uppercase font-bold tracking-widest hover:bg-white/90 transition-all border border-white focus:outline-none">
        {ctaText || "Request a Quote"}
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
