import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Globe, Database, Shield, Zap, Layout, Check, ArrowRight, Star } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="bg-[#F9F8F6] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center font-serif italic font-bold text-white text-xl">E</div>
          <span className="font-bold tracking-tight text-xl">Edge Marketplace Hub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-60">
          <a href="#features" className="hover:opacity-100 transition-opacity">Features</a>
          <a href="#templates" className="hover:opacity-100 transition-opacity">Templates</a>
          <a href="#pricing" className="hover:opacity-100 transition-opacity">Pricing</a>
        </div>
        <button 
          onClick={onStart}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10"
        >
          Launch My Store
        </button>
      </nav>

      {/* Hero */}
      <header className="relative pt-20 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-[0.9] mb-8">
              Do you have 15 minutes to <span className="text-black/40">launch your business?</span>
            </h1>
            <p className="text-xl md:text-2xl text-black/60 max-w-2xl mx-auto font-light leading-relaxed mb-12">
              If you have a product or service to sell, Edge Marketplace Hub is the solution you've been looking for. No tech skills required. No stress. Just sales.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform group"
              >
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                Launch My Store
              </button>
              <a 
                href="#templates"
                className="w-full sm:w-auto border border-black/10 bg-white px-10 py-5 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:bg-black/5 transition-colors"
              >
                View Templates
                <ArrowRight className="w-5 h-5 text-black/30" />
              </a>
            </div>
          </motion.div>

          {/* Badges/Status */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-6 border border-black/5 shadow-sm rounded-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Global Nodes</span>
              </div>
              <p className="font-bold text-sm">Edge Infrastructure Active</p>
            </div>
            <div className="bg-white p-6 border border-black/5 shadow-sm rounded-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="w-3 h-3 text-black/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Live Status</span>
              </div>
              <p className="font-bold text-sm">Secure Database Clusters</p>
            </div>
            <div className="bg-white p-6 border border-black/5 shadow-sm rounded-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Performance</span>
              </div>
              <p className="font-bold text-sm">Zero Latency Storefronts</p>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-black/[0.02] rounded-full blur-3xl -z-10"></div>
      </header>

      {/* Features */}
      <section id="features" className="py-32 px-8 bg-white border-y border-black/5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="w-12 h-12 bg-[#F9F8F6] border border-black/10 flex items-center justify-center mb-8 rounded-xl rotate-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif italic mb-4">Zero Technical Effort</h3>
              <p className="text-black/50 leading-relaxed">
                We handle the servers, databases, and deployment. No configurations, no headaches. You just bring the product and we build the world-class storefront.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#F9F8F6] border border-black/10 flex items-center justify-center mb-8 rounded-xl -rotate-3">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif italic mb-4">AI-Powered Catalog</h3>
              <p className="text-black/50 leading-relaxed">
                Send us a list of your products, and our AI builds your store magically. It handles categorization, visual arrangement, and high-converting copy automatically.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#F9F8F6] border border-black/10 flex items-center justify-center mb-8 rounded-xl rotate-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif italic mb-4">Enterprise Ready</h3>
              <p className="text-black/50 leading-relaxed">
                Built on high-performance edge nodes for global speed. Your storefront is replicated across the planet instantly, ensuring your customers never wait for a page load.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy / How it works */}
      <section className="py-32 px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/30 mb-6 block">The Workflow</span>
              <h2 className="text-5xl font-serif italic tracking-tight leading-tight mb-8">
                From Idea to Global Storefront in Minutes
              </h2>
              <p className="text-xl text-black/50 mb-12 font-light">
                We've stripped away the complexity of e-commerce. You don't need to know about hosting, databases, or SSL certificates. We handle the "Edge" so you can focus on your "Market".
              </p>
              
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-bold mb-2">Launch Your Identity</h4>
                    <p className="text-sm text-black/50">Pick a foundation, upload your logo, and choose your brand colors in seconds.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-bold mb-2">Our AI Builds Your Store</h4>
                    <p className="text-sm text-black/50">Our system spins up a secure database and deploys your instance to global edge nodes automatically.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-bold mb-2">Sell Instantly</h4>
                    <p className="text-sm text-black/50">List your products or services and start taking orders immediately. All in under 15 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">Edge Dashboard</span>
                  </div>
                  <h3 className="text-3xl font-serif italic text-white mb-6">Real-time marketplace monitoring across all nodes.</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Sales</p>
                      <p className="text-xl font-bold text-white">$12,482.00</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Active Nodes</p>
                      <p className="text-xl font-bold text-white">42 Global</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-black/5 rotate-12 max-w-[140px]">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-[10px] font-medium leading-tight">"The fastest store launch I've ever seen."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-32 px-8 bg-black text-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-serif italic tracking-tight mb-6">Choose Your Business Identity</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto font-light">
              Pick a foundation that matches your brand. You can customize everything later, or let our AI handle the translation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            {/* Product Templates */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/30 mb-12 flex items-center gap-4">
                Product Templates
                <span className="h-[1px] flex-grow bg-white/10"></span>
              </h3>
              <div className="space-y-12">
                {[
                  { name: "Modern Commerce", desc: "High-performance storefront for physical goods and retail." },
                  { name: "Industrial Supply", desc: "Rugged layout for parts, tools, and B2B supplies." },
                  { name: "Boutique Luxury", desc: "Elegant, visual-heavy design for premium brands." }
                ].map((t, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-end mb-4">
                      <h4 className="text-2xl font-serif italic group-hover:translate-x-2 transition-transform">{t.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Live Preview</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/10 mb-6 transition-colors group-hover:bg-white/40"></div>
                    <p className="text-sm text-white/40 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Templates */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/30 mb-12 flex items-center gap-4">
                Service Templates
                <span className="h-[1px] flex-grow bg-white/10"></span>
              </h3>
              <div className="space-y-12">
                {[
                  { name: "Professional Agency", desc: "Clean, trust-focused layout for consulting and B2B services." },
                  { name: "Tech Consultant", desc: "Modern, dark-themed layout for software and digital services." },
                  { name: "Creative Studio", desc: "Dynamic, animation-rich portfolio for design and creative work." }
                ].map((t, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-end mb-4">
                      <h4 className="text-2xl font-serif italic group-hover:translate-x-2 transition-transform">{t.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Live Preview</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/10 mb-6 transition-colors group-hover:bg-white/40"></div>
                    <p className="text-sm text-white/40 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers */}
      <section id="pricing" className="py-32 px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-24">
             <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/30 mb-6 block">The Comparison</span>
             <h2 className="text-5xl font-serif italic tracking-tight">🚀 Choose how you grow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Launch Plan */}
            <div className="bg-white border border-black/5 p-12 rounded-3xl flex flex-col">
              <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8">🚀 Launch</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-serif italic font-bold leading-none">$0</span>
                  <span className="text-black/30 font-medium">/mo</span>
                </div>
                <p className="text-sm text-black/50 italic mb-8">Perfect for getting your idea off the ground today.</p>
                <button 
                  onClick={onStart}
                  className="w-full py-4 border border-black flex items-center justify-center gap-2 font-bold rounded-xl hover:bg-black hover:text-white transition-colors"
                >
                  Start selling
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-8 flex-grow">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                       <Zap className="w-3 h-3" /> Fees
                    </p>
                    <p className="font-bold mb-1">5% per sale</p>
                    <p className="text-xs text-black/40">Most sellers upgrade once they start seeing consistent sales.</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Branding
                    </p>
                    <p className="font-bold mb-1">Edge Subdomain</p>
                    <p className="text-xs text-black/40 break-all">yourcompany.edgemarketplacehub.com</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                       <Rocket className="w-3 h-3" /> Activation
                    </p>
                    <p className="font-bold mb-1">$5 to go live</p>
                    <p className="text-xs text-black/40">Refunded after your first sale to ensure system integrity.</p>
                 </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1A1A1A] text-white p-12 rounded-3xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <Star className="w-8 h-8 text-white/10" />
              </div>
              <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-white/50">⚡ Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-serif italic font-bold leading-none">$99</span>
                  <span className="text-white/30 font-medium">/mo</span>
                </div>
                <p className="text-sm text-white/50 italic mb-8">For serious businesses ready to scale globally.</p>
                <button 
                  onClick={onStart}
                  className="w-full py-4 bg-white text-black flex items-center justify-center gap-2 font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Upgrade to Pro
                  <Zap className="w-4 h-4 fill-black" />
                </button>
              </div>
              
              <div className="space-y-8 flex-grow">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                       <Check className="w-3 h-3" /> Fees
                    </p>
                    <p className="font-bold mb-1">1% per sale</p>
                    <p className="text-xs text-white/40">Pro pays for itself at ~$2,500/mo in sales volume.</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Custom Branding
                    </p>
                    <p className="font-bold mb-1">Your Own Custom Domain</p>
                    <p className="text-xs text-white/40">Zero platform branding. Just your company and your identity.</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                       <Rocket className="w-3 h-3" /> Zero Friction
                    </p>
                    <p className="font-bold mb-1">Go Live Instantly</p>
                    <p className="text-xs text-white/40">No activation hurdles. Push your marketplace live with one click.</p>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Universal Features */}
          <div className="mt-16 bg-white border border-black/5 p-12 rounded-2xl max-w-6xl mx-auto">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30 mb-8 text-center italic">Core Platform Infrastructure included for everyone</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  "15-minute guided flow",
                  "Marketplace design templates",
                  "Unlimited products",
                  "Global edge-hosting",
                  "Merchant payouts",
                  "Sales dashboard",
                  "Built-in checkout",
                  "Automated SSL"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium">
                    <Check className="w-3 h-3 text-green-500" />
                    {f}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-black/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center font-serif italic font-bold text-white text-2xl">E</div>
          <span className="font-bold tracking-tight text-xl">Edge Marketplace Hub</span>
        </div>
        <p className="text-sm text-black/40 mb-12">Building the infrastructure for the next generation of global storefronts.</p>
        <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-black/30">
          <a href="#" className="hover:text-black">Terms</a>
          <a href="#" className="hover:text-black">Privacy</a>
          <a href="#" className="hover:text-black">Support</a>
        </div>
        <p className="mt-20 text-[10px] uppercase tracking-[0.2em] font-bold text-black/20">© 2026 Edge Marketplace Hub</p>
      </footer>
    </div>
  );
};
