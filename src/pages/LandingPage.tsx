import React from 'react';
import { ArrowRight, CheckCircle2, Database, Globe, LayoutTemplate, Store } from 'lucide-react';
import { TEMPLATE_EXAMPLES } from '../lib/templateCatalog';
import { TemplateFamily } from '../lib/types';

interface LandingPageProps {
  onStart: () => void;
  onViewTemplate: (template: TemplateFamily) => void;
}

const templateEntries = Object.entries(TEMPLATE_EXAMPLES) as Array<[
  TemplateFamily,
  (typeof TEMPLATE_EXAMPLES)[TemplateFamily],
]>;

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewTemplate }) => {
  return (
    <div className="bg-[#F9F8F6] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      <nav className="flex justify-between items-center py-6 px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center font-serif italic font-bold text-white text-xl">E</div>
          <span className="font-bold tracking-tight text-xl">Edge Marketplace Hub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-60">
          <a href="#features" className="hover:opacity-100 transition-opacity">Features</a>
          <a href="#templates" className="hover:opacity-100 transition-opacity">Templates</a>
          <a href="#funnel" className="hover:opacity-100 transition-opacity">Funnel</a>
        </div>
        <button
          onClick={onStart}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
        >
          Start building
        </button>
      </nav>

      <header className="px-8 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-5">Inventory-first storefront builder</p>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight leading-[0.92] mb-8">
              Build the site, fill the catalog, then launch for real.
            </h1>
            <p className="text-xl text-black/60 leading-relaxed max-w-2xl mb-10">
              Edge Marketplace Hub now pushes every business through an honest funnel: onboarding, editable site generation, real inventory management, then launch with Supabase persistence and optional Medusa sync.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStart}
                className="bg-black text-white px-8 py-4 rounded-full font-bold inline-flex items-center justify-center gap-3"
              >
                Generate my storefront
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#templates"
                className="border border-black/10 bg-white px-8 py-4 rounded-full font-bold inline-flex items-center justify-center gap-3"
              >
                Compare templates
                <LayoutTemplate className="w-4 h-4 text-black/40" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-black/5 p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Database, title: 'Inventory workspace', description: 'Dedicated route for adding, importing, and syncing products/services before launch.' },
                { icon: Globe, title: 'Launch state', description: 'Deployment status now reflects actual readiness instead of mock success messaging.' },
                { icon: Store, title: 'Medusa-aware', description: 'Commerce inventory can route into Medusa when backend credentials are available.' },
                { icon: CheckCircle2, title: 'Supabase-backed', description: 'Marketplace drafts and inventory can persist through server APIs instead of client-only guesses.' },
              ].map((feature) => (
                <div key={feature.title} className="border border-black/5 rounded-[24px] p-5 bg-[#F9F8F6]">
                  <feature.icon className="w-5 h-5 mb-3 text-black/60" />
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-black/55 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            'Generate an editable storefront from a constrained template family.',
            'Save inventory through server APIs and push products to Medusa when commerce is enabled.',
            'Ship to a real launch state instead of fake Stripe or mock published URLs.',
          ].map((item) => (
            <div key={item} className="bg-white border border-black/5 rounded-[28px] p-8 text-black/70 leading-relaxed">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-4">Template library</p>
            <h2 className="text-5xl font-serif italic tracking-tight">Pick a lane, not a blank canvas.</h2>
          </div>
          <button onClick={onStart} className="text-sm font-bold underline underline-offset-4">
            Start with a custom intake
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templateEntries.map(([family, template]) => (
            <article key={family} className="bg-white border border-black/5 rounded-[32px] p-8 flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-4">{template.kicker}</p>
              <h3 className="text-3xl font-serif italic mb-4">{template.label}</h3>
              <p className="text-black/60 leading-relaxed mb-6 flex-1">{template.summary}</p>
              <div className="space-y-3">
                <button
                  onClick={() => onViewTemplate(family)}
                  className="w-full border border-black px-5 py-3 rounded-full font-bold inline-flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewTemplate(family)}
                  className="w-full border border-black/10 px-5 py-3 rounded-full font-bold text-black/70 bg-[#F9F8F6]"
                >
                  View template details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="funnel" className="px-8 pb-24 max-w-7xl mx-auto">
        <div className="bg-[#1A1A1A] text-white rounded-[40px] p-10 md:p-14">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-white/40 mb-4">Launch funnel</p>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-8">Onboarding → Editor → Inventory → Launch → Live storefront</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-white/70">
            {['Capture business context', 'Generate the site structure', 'Add products or services', 'Sync and request launch', 'Route to live URL'].map((step, index) => (
              <div key={step} className="bg-white/5 border border-white/10 rounded-[24px] p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/35 mb-3">0{index + 1}</p>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
