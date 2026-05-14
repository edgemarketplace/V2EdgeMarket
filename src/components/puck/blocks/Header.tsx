import React from 'react';

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

export const HeaderPromo = ({ promoText, title, navLinks }: { promoText: string, title: string, navLinks?: { label: string, href: string }[] }) => (
  <div>
    <div className="bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center py-2">
      {promoText}
    </div>
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
  </div>
);

export const HeaderMega = ({ title, navLinks }: { title: string, navLinks?: { label: string, href: string }[] }) => (
  <header className="px-10 py-6 border-b border-black/10 bg-white">
    <div className="flex items-center justify-between mb-6">
      <div className="text-3xl font-serif italic text-[#1A1A1A]">{title}</div>
      <button className="px-6 py-2 bg-black text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black/80 transition-all border border-black">
        Shop Now
      </button>
    </div>
    {navLinks && navLinks.length > 0 && (
      <nav className="flex gap-12 border-t border-black/10 pt-6">
        {navLinks.map((link, i) => (
          <a key={i} href={link.href} className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-black/50 transition-colors">
            {link.label}
          </a>
        ))}
      </nav>
    )}
  </header>
);
