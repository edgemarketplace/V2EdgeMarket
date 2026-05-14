import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe, Rocket, Zap } from 'lucide-react';
import { DeploymentRecord, InventoryItem, LaunchPlan, MarketplaceSiteDraft } from '../lib/types';
import { buildSiteHeaders } from '../lib/siteDrafts';

export function CheckoutPage({
  draft,
  onBack,
  onComplete,
}: {
  draft: MarketplaceSiteDraft;
  onBack: () => void;
  onComplete: (plan: LaunchPlan, deployment: DeploymentRecord) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<LaunchPlan>(draft.selectedPlan || 'launch');
  const [ownerName, setOwnerName] = useState(draft.intakeData.businessName);
  const [email, setEmail] = useState(draft.intakeData.contactEmail || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const inventorySummary = useMemo(() => {
    const total = draft.inventoryItems.length;
    const categories = new Set(draft.inventoryItems.map((item: InventoryItem) => item.category).filter(Boolean));
    return `${total} item${total === 1 ? '' : 's'}${categories.size ? ` / ${categories.size} categor${categories.size === 1 ? 'y' : 'ies'}` : ''}`;
  }, [draft.inventoryItems]);

  async function launch() {
    setSubmitting(true);
    setError('');

    const existingDeployment = draft.deployment;
    const shouldRetry = existingDeployment?.status === 'failed';
    const idempotencyKey = shouldRetry || !existingDeployment?.idempotencyKey
      ? `${draft.siteId}:${selectedPlan}:attempt-${(existingDeployment?.attemptCount || 0) + 1}`
      : existingDeployment.idempotencyKey;

    try {
      // Ensure server-side site exists before deploying
      const siteRes = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.intakeData),
      });

      if (!siteRes.ok) {
        const text = await siteRes.text();
        throw new Error(text || `Site creation failed with ${siteRes.status}`);
      }

      const siteResText = await siteRes.text();
      const serverSite = siteResText ? JSON.parse(siteResText) : {};
      const siteId = serverSite.siteId || draft.siteId;
      const siteToken = serverSite.siteToken || draft.siteToken;

      if (siteToken) {
        await fetch(`/api/sites/${siteId}/checkout-intents`, {
          method: 'POST',
          headers: buildSiteHeaders(siteToken || draft.siteToken),
          body: JSON.stringify({
            customerName: ownerName,
            email,
            notes,
            productInterest: draft.intakeData.offerings,
          }),
        });
      }

      const response = await fetch(`/api/sites/${siteId}/deploy`, {
        method: 'POST',
        headers: {
          ...buildSiteHeaders(siteToken || draft.siteToken),
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          siteId,
          selectedPlan,
          ownerName,
          email,
          notes,
          idempotencyKey,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server returned ${response.status}`);
      }

      const deploymentText = await response.text();
      const deployment = deploymentText ? JSON.parse(deploymentText) : {};
      onComplete(selectedPlan, deployment);
    } catch (launchError) {
      console.error(launchError);
      setError(launchError instanceof Error ? launchError.message : String(launchError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        <main className="bg-white border border-black/5 rounded-[32px] p-8 md:p-10">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/35 mb-4">Step 3 of 3</p>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight mb-4">Launch with a real status, not a fake success screen.</h1>
          <p className="text-black/60 leading-relaxed mb-10">
            This step records the launch request, keeps your selected plan, checks inventory readiness, and attempts a Medusa sync for commerce-oriented storefronts when credentials are available.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedPlan('launch')}
              className={`text-left rounded-[28px] border p-6 transition-all ${selectedPlan === 'launch' ? 'border-black bg-white shadow-sm' : 'border-black/10 bg-[#F9F8F6]'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-5 h-5" />
                <span className="font-bold uppercase tracking-[0.2em] text-xs">Launch</span>
              </div>
              <p className="text-4xl font-serif italic mb-3">$0/mo</p>
              <p className="text-sm text-black/60">Edge subdomain, launch queue, 5% marketplace fee, and verified inventory handoff.</p>
            </button>
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`text-left rounded-[28px] border p-6 transition-all ${selectedPlan === 'pro' ? 'border-black bg-[#1A1A1A] text-white shadow-sm' : 'border-black/10 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5" />
                <span className="font-bold uppercase tracking-[0.2em] text-xs">Pro</span>
              </div>
              <p className="text-4xl font-serif italic mb-3">$99/mo</p>
              <p className={`${selectedPlan === 'pro' ? 'text-white/70' : 'text-black/60'} text-sm`}>
                Priority launch path, custom-domain readiness, and the same inventory pipeline with optional Medusa sync.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="owner-name" className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1 block">Owner Name</label>
              <input
                id="owner-name"
                name="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full border border-black/10 rounded-2xl px-4 py-4"
                placeholder="Owner or operator name"
              />
            </div>
            <div>
              <label htmlFor="launch-email" className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1 block">Contact Email</label>
              <input
                id="launch-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/10 rounded-2xl px-4 py-4"
                placeholder="Launch contact email"
                type="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="launch-notes" className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1 block">Launch Notes (optional)</label>
            <textarea
              id="launch-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full border border-black/10 rounded-[28px] px-4 py-4 mb-8"
              placeholder="Optional launch notes, domain requirements, catalog caveats, or launch timing."
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

          <div className="flex flex-wrap justify-between gap-4">
            <button onClick={onBack} className="px-6 py-4 rounded-full border border-black/10 font-bold inline-flex items-center gap-3 bg-[#F9F8F6]">
              <ArrowLeft className="w-4 h-4" />
              Back to inventory
            </button>
            <button onClick={launch} disabled={submitting} className="px-6 py-4 rounded-full bg-black text-white font-bold inline-flex items-center gap-3 disabled:opacity-40">
              {submitting ? 'Submitting launch…' : 'Request launch'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <aside className="space-y-6">
          <div className="bg-white border border-black/5 rounded-[32px] p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/35 mb-3">Ready state</p>
            <h2 className="text-2xl font-serif italic mb-4">{draft.intakeData.businessName}</h2>
            <div className="space-y-3 text-sm text-black/65">
              <p><strong>Template:</strong> {draft.templateFamily}</p>
              <p><strong>Commerce goal:</strong> {draft.intakeData.primaryGoal}</p>
              <p><strong>Inventory:</strong> {inventorySummary}</p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] text-white rounded-[32px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5" />
              <h2 className="text-2xl font-serif italic">What launch does now</h2>
            </div>
            <ul className="space-y-3 text-sm text-white/75">
              <li>• Records the launch request and selected plan.</li>
              <li>• Checks whether inventory actually exists.</li>
              <li>• Attempts Medusa sync when commerce credentials are configured.</li>
              <li>• Produces a status page with real readiness signals.</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/50">
              <div className="flex items-center gap-2 mb-2"><Check className="w-3 h-3" /> No fake Stripe card collection</div>
              <div className="flex items-center gap-2"><Check className="w-3 h-3" /> No pretend published URL until launch state is ready</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
