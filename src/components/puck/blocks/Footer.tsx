import React from 'react';

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

export const FooterCommerce = ({ title, description, shopLinks, supportLinks, socialLinks }: { 
  title: string, 
  description?: string,
  shopLinks?: { label: string, url: string }[],
  supportLinks?: { label: string, url: string }[],
  socialLinks?: { platform: string, url: string }[]
}) => (
  <footer className="bg-white px-10 py-16 border-t border-black/10">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:col-span-1 lg:grid-cols-4 gap-12 mb-16">
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-2xl font-serif italic mb-6 text-[#1A1A1A]">{title}</h3>
        <p className="text-[11px] text-black/50 leading-relaxed max-w-sm">{description || "Curating the finest goods for the modern lifestyle. Built for longevity and purpose."}</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-6">Shop</h4>
        <ul className="space-y-4 text-[12px] text-black/60">
          {(shopLinks || [{label:"New Arrivals", url:"#"}, {label:"Best Sellers", url:"#"}, {label:"All Products", url:"#"}]).map((link, i) => (
            <li key={i}><a href={link.url} className="hover:text-black transition-colors">{link.label}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-6">Support</h4>
        <ul className="space-y-4 text-[12px] text-black/60">
          {(supportLinks || [{label:"Contact Us", url:"#"}, {label:"FAQ", url:"#"}, {label:"Shipping & Returns", url:"#"}]).map((link, i) => (
            <li key={i}><a href={link.url} className="hover:text-black transition-colors">{link.label}</a></li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-black/10 max-w-6xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-black/40 font-bold">
      <p>&copy; {new Date().getFullYear()} {title}. All rights reserved.</p>
      <div className="flex gap-4 mt-4 md:mt-0">
        {(socialLinks || [{platform:"Instagram", url:"#"}, {platform:"Twitter", url:"#"}, {platform:"Pinterest", url:"#"}]).map((social, i) => (
          <a key={i} href={social.url} className="hover:text-black transition-colors">{social.platform}</a>
        ))}
      </div>
    </div>
  </footer>
);

export const FooterService = ({ title, description, email, phone, address }: { 
  title: string, 
  description?: string, 
  email?: string, 
  phone?: string, 
  address?: string 
}) => (
  <footer className="bg-[#1A1A1A] text-white px-10 py-20 border-t border-black">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
      <div>
        <h3 className="text-3xl font-serif italic mb-6">{title}</h3>
        <p className="text-[12px] text-white/50 leading-relaxed font-light">{description || "Delivering excellence in every project. We exist to solve complex problems with elegant solutions."}</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Contact</h4>
        <p className="text-[12px] text-white/50 mb-3 font-serif italic">{email || "hello@example.com"}</p>
        <p className="text-[12px] text-white/50 font-sans tracking-widest">{phone || "+1 (555) 123-4567"}</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Location</h4>
        <p className="text-[12px] text-white/50 leading-relaxed font-light whitespace-pre-line">{address || "123 Design District\nNew York, NY 10001\nUnited States"}</p>
      </div>
    </div>
  </footer>
);
