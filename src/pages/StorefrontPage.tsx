import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SiteRenderer } from '../components/SiteRenderer';
import { MarketplaceSiteDraft } from '../lib/types';

export function StorefrontPage({
  draft,
  onBack,
}: {
  draft: MarketplaceSiteDraft;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <div className="px-6 py-4 border-b border-black/5 bg-white flex items-center justify-between gap-4 sticky top-0 z-20">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
          <ArrowLeft className="w-4 h-4" />
          Back to launch status
        </button>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35">Live storefront preview</p>
          <p className="font-bold text-[#1A1A1A]">{draft.intakeData.businessName}</p>
        </div>
      </div>
      <SiteRenderer data={draft.editorData} rootProps={draft.rootProps} inventoryItems={draft.inventoryItems} draft={draft} />
    </div>
  );
}
