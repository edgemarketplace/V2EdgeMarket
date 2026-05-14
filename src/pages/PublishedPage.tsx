import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Globe, RefreshCcw } from 'lucide-react';
import { DeploymentRecord, MarketplaceSiteDraft, SiteLifecycleStatus } from '../lib/types';
import { buildSiteHeaders } from '../lib/siteDrafts';

function isActiveStatus(status?: SiteLifecycleStatus) {
  return status === 'deploy_requested'
    || status === 'provisioning'
    || status === 'syncing_inventory'
    || status === 'storefront_building'
    || status === 'dns_pending';
}

function humanizeStatus(status?: SiteLifecycleStatus) {
  switch (status) {
    case 'deploy_requested':
      return 'Deploy requested';
    case 'provisioning':
      return 'Provisioning';
    case 'syncing_inventory':
      return 'Syncing inventory';
    case 'storefront_building':
      return 'Building storefront';
    case 'dns_pending':
      return 'DNS pending';
    case 'launch_ready':
      return 'Launch ready';
    case 'live':
      return 'Live';
    case 'failed':
      return 'Failed';
    default:
      return status || 'Waiting for response';
  }
}

export function PublishedPage({
  draft,
  onBack,
  onDeploymentUpdate,
}: {
  draft: MarketplaceSiteDraft;
  onBack: () => void;
  onDeploymentUpdate: (deployment: DeploymentRecord) => void;
}) {
  const [status, setStatus] = useState<DeploymentRecord | null>(draft.deployment || null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch(`/api/sites/${draft.siteId}/status`, {
        headers: buildSiteHeaders(draft),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setStatus(data.deployment || null);
      if (data.deployment) {
        onDeploymentUpdate(data.deployment as DeploymentRecord);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [draft.siteId]);

  useEffect(() => {
    if (!isActiveStatus(status?.status)) return;
    const interval = window.setInterval(() => {
      void refresh();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [status?.status, draft.siteId]);

  const publishUrl = status?.publishUrl;
  const latestHistory = useMemo(() => (status?.history || []).slice().reverse().slice(0, 5), [status?.history]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] px-6 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to launch plan
        </button>

        <div className="bg-white border border-black/5 rounded-[40px] p-8 md:p-12 shadow-sm mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-4">Launch status</p>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight mb-4">{draft.intakeData.businessName}</h1>
          <p className="text-black/60 max-w-2xl leading-relaxed mb-10">
            This screen reports the actual status returned by the launch pipeline. Inventory, plan selection, reconciliation, and provisioning callbacks all influence what you see here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-[28px] bg-[#F9F8F6] border border-black/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Current status</p>
              <p className="text-2xl font-serif italic">{humanizeStatus(status?.status)}</p>
            </div>
            <div className="rounded-[28px] bg-[#F9F8F6] border border-black/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Selected plan</p>
              <p className="text-2xl font-serif italic">{status?.plan || draft.selectedPlan || 'launch'}</p>
            </div>
            <div className="rounded-[28px] bg-[#F9F8F6] border border-black/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Attempt</p>
              <p className="text-2xl font-serif italic">{status?.attemptCount || 1}</p>
            </div>
            <div className="rounded-[28px] bg-[#F9F8F6] border border-black/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Inventory count</p>
              <p className="text-2xl font-serif italic">{draft.inventoryItems.length}</p>
            </div>
          </div>

          <div className="rounded-[32px] bg-[#1A1A1A] text-white p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5" />
              <h2 className="text-2xl font-serif italic">Deployment message</h2>
            </div>
            <p className="text-white/75 leading-relaxed">{status?.message || 'No deployment message has been returned yet.'}</p>
            {status?.medusaSync && (
              <div className="mt-6 border-t border-white/10 pt-6 text-sm text-white/70">
                <p className="font-bold text-white mb-2">Medusa sync</p>
                <p>{status.medusaSync.message}</p>
              </div>
            )}
            {(status?.failureReason || status?.failureStage) && (
              <div className="mt-6 border-t border-white/10 pt-6 text-sm text-white/70">
                <p className="font-bold text-white mb-2">Failure details</p>
                {status.failureStage && <p>Stage: {humanizeStatus(status.failureStage)}</p>}
                {status.failureReason && <p>Reason: {status.failureReason}</p>}
              </div>
            )}
          </div>

          {!!latestHistory.length && (
            <div className="rounded-[32px] border border-black/5 bg-[#F9F8F6] p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-serif italic mb-5">Recent transitions</h2>
              <div className="space-y-4">
                {latestHistory.map((entry, index) => (
                  <div key={`${entry.at}-${entry.status}-${index}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-black/5 pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-bold">{humanizeStatus(entry.status)}</p>
                      <p className="text-sm text-black/60">{entry.message}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/35">{entry.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={refresh} className="px-5 py-3 rounded-full border border-black/10 font-bold inline-flex items-center gap-2 bg-[#F9F8F6]">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {isActiveStatus(status?.status) ? 'Refresh / reconcile' : 'Refresh status'}
            </button>
            {publishUrl && status?.status === 'live' && (
              <a href={publishUrl} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-full bg-black text-white font-bold inline-flex items-center gap-2">
                Open launch URL
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <a href={`/storefront/${draft.siteId}`} className="px-5 py-3 rounded-full border border-black font-bold inline-flex items-center gap-2">
              Open storefront preview
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
