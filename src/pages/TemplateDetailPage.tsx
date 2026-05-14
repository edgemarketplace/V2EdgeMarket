import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { buildTemplatePreview, TEMPLATE_EXAMPLES } from '../lib/templateCatalog';
import { SiteRenderer } from '../components/SiteRenderer';
import { TemplateFamily } from '../lib/types';

export function TemplateDetailPage({
  templateFamily,
  onBack,
  onUseTemplate,
}: {
  templateFamily: TemplateFamily;
  onBack: () => void;
  onUseTemplate: (template: TemplateFamily) => void;
}) {
  const template = TEMPLATE_EXAMPLES[templateFamily];
  const preview = buildTemplatePreview(templateFamily);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] p-6 md:p-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to templates
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 items-start">
        <aside className="bg-white border border-black/5 rounded-[32px] p-8 sticky top-6">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-4">{template.kicker}</p>
          <h1 className="text-4xl font-serif italic mb-4">{template.label}</h1>
          <p className="text-black/60 leading-relaxed mb-6">{template.summary}</p>
          <div className="space-y-3 mb-8">
            {[
              'Use This Template button routes directly into onboarding.',
              'Live preview uses the same render stack as the generated storefront.',
              'Inventory route takes over after editing so catalog becomes a first-class feature.',
            ].map((item) => (
              <div key={item} className="flex gap-3 items-start text-sm text-black/70">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onUseTemplate(templateFamily)}
            className="w-full bg-black text-white px-6 py-4 rounded-full font-bold inline-flex items-center justify-center gap-3"
          >
            Use This Template
            <ArrowRight className="w-4 h-4" />
          </button>
        </aside>

        <div className="bg-white border border-black/5 rounded-[32px] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">Actual site preview</p>
              <p className="font-bold">{preview.rootProps.title}</p>
            </div>
            <span className="text-xs text-black/40 uppercase tracking-[0.2em]">{preview.rootProps.theme.stylePreset}</span>
          </div>
          <div className="max-h-[80vh] overflow-auto">
            <SiteRenderer data={preview.editorData} rootProps={preview.rootProps} inventoryItems={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
