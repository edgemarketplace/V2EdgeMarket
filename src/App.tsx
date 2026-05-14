import React, { Suspense, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { mapIntakeToPuckConfig } from './lib/ai-mapper';
import { buildSiteHeaders, getSiteDraft, saveSiteDraft, syncSiteDraftToServer, rehydrateSiteDraft } from './lib/siteDrafts';
import { DeploymentRecord, EdgeRootProps, EditorData, LaunchPlan, MarketplaceIntakeData, MarketplaceSiteDraft, TemplateFamily } from './lib/types';
import './index.css';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const Onboarding = React.lazy(() => import('./pages/Onboarding').then((module) => ({ default: module.Onboarding })));
const EditorPage = React.lazy(() => import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })));
const InventoryPage = React.lazy(() => import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const PublishedPage = React.lazy(() => import('./pages/PublishedPage').then((module) => ({ default: module.PublishedPage })));
const TemplateDetailPage = React.lazy(() => import('./pages/TemplateDetailPage').then((module) => ({ default: module.TemplateDetailPage })));
const StorefrontPage = React.lazy(() => import('./pages/StorefrontPage').then((module) => ({ default: module.StorefrontPage })));

const GeneratingScreen = () => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const messages = [
    'Analyzing business context…',
    'Selecting section stack…',
    'Writing editable starter copy…',
    'Preparing inventory-ready flow…',
    'Opening the editor…',
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, messages.length - 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F9F8F6] text-[#1A1A1A]">
      <div className="text-center max-w-md w-full px-6">
        <div className="h-10 w-10 border-2 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-10"></div>
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-serif italic text-2xl tracking-tight text-[#1A1A1A]"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

const RouteLoading = () => (
  <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center text-black/50">Loading…</div>
);

function createDraftFromConfig(
  siteId: string,
  slug: string,
  intakeData: MarketplaceIntakeData,
  editorData: EditorData,
  rootProps: EdgeRootProps,
  siteToken?: string,
  serverPersisted?: boolean,
): MarketplaceSiteDraft {
  const now = new Date().toISOString();
  return {
    siteId,
    slug,
    createdAt: now,
    updatedAt: now,
    status: 'editing',
    intakeData,
    templateFamily: intakeData.businessType,
    rootProps,
    editorData,
    inventoryItems: intakeData.inventory?.items || [],
    inventorySource: intakeData.inventory?.method || 'manual',
    siteToken,
    serverPersisted,
  };
}

function mergeAiData(baseConfig: ReturnType<typeof mapIntakeToPuckConfig>, aiData: any) {
  const merged = { ...baseConfig };

  if (aiData?.content && Array.isArray(aiData.content)) {
    merged.initialData.content = aiData.content.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `${item.type}-${idx}`,
      props: {
        ...item.props,
        id: item.props?.id || item.id || `${item.type}-${idx}`,
      },
    }));
  }

  if (aiData?.root) {
    merged.rootProps = {
      ...merged.rootProps,
      ...aiData.root,
      theme: {
        ...merged.rootProps.theme,
        ...(aiData.root.theme || {}),
      },
    };
    merged.initialData.root = {
      ...merged.initialData.root,
      props: {
        ...merged.initialData.root?.props,
        ...merged.rootProps,
      },
    };
  }

  return merged;
}

export default function App() {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<MarketplaceSiteDraft | null>(null);

  const persistDraft = (draft: MarketplaceSiteDraft) => {
    const saved = saveSiteDraft({ ...draft, updatedAt: new Date().toISOString() });
    setActiveDraft(saved);
    void syncSiteDraftToServer(saved);
    return saved;
  };

  const loadDraft = (siteId: string) => {
    const cached = activeDraft?.siteId === siteId ? activeDraft : getSiteDraft(siteId);
    const siteToken = cached?.siteToken;
    
    // Return cached immediately for UI responsiveness
    if (cached && (!activeDraft || activeDraft.siteId !== siteId)) {
      setActiveDraft(cached);
    }
    
    // Background rehydration from server
    if (siteId && siteToken) {
      rehydrateSiteDraft(siteId, siteToken).then((serverDraft) => {
        if (serverDraft) {
          setActiveDraft(serverDraft);
        }
      });
    }
    
    return cached;
  };

  const handleOnboardingComplete = async (data: MarketplaceIntakeData) => {
    setIsGenerating(true);

    try {
      const draftResponse = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const draftResult = draftResponse.ok
        ? await draftResponse.json()
        : {
            siteId: crypto.randomUUID(),
            slug: data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            siteToken: undefined,
            persisted: false,
          };
      const mappedConfig = mapIntakeToPuckConfig(data);

      try {
        const response = await fetch('/api/generate-page', {
          method: 'POST',
          headers: buildSiteHeaders(draftResult.siteToken),
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const aiData = await response.json();
          const merged = mergeAiData(mappedConfig, aiData);
          const draft = createDraftFromConfig(
            draftResult.siteId,
            draftResult.slug,
            data,
            merged.initialData,
            merged.rootProps,
            draftResult.siteToken,
            draftResult.persisted,
          );
          persistDraft(draft);
          setLocation(`/editor/${draft.siteId}`);
          return;
        }
      } catch (error) {
        console.error('AI generation failed, falling back to local mapping.', error);
      }

      const draft = createDraftFromConfig(
        draftResult.siteId,
        draftResult.slug,
        data,
        mappedConfig.initialData,
        mappedConfig.rootProps,
        draftResult.siteToken,
        draftResult.persisted,
      );
      persistDraft(draft);
      setLocation(`/editor/${draft.siteId}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <GeneratingScreen />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/">
          <LandingPage
            onStart={() => setLocation('/onboarding')}
            onViewTemplate={(template) => setLocation(`/templates/${template}`)}
          />
        </Route>

        <Route path="/onboarding">
          <Onboarding onComplete={handleOnboardingComplete} />
        </Route>

        <Route path="/templates/:templateFamily">
          {(params) => (
            <TemplateDetailPage
              templateFamily={params.templateFamily as TemplateFamily}
              onBack={() => setLocation('/')}
              onUseTemplate={(template) => setLocation(`/onboarding?template=${template}`)}
            />
          )}
        </Route>

        <Route path="/editor/:siteId">
          {(params) => {
            const draft = loadDraft(params.siteId);
            if (!draft) {
              return <div className="p-20 text-center">No draft found. Start from onboarding.</div>;
            }

            return (
              <EditorPage
                initialData={draft.editorData}
                templateFamily={draft.templateFamily}
                rootProps={draft.rootProps}
                onPublish={(data: EditorData) => {
                  const nextDraft = persistDraft({
                    ...draft,
                    editorData: data,
                    rootProps: (data.root?.props as EdgeRootProps) || draft.rootProps,
                    status: 'inventory',
                  });
                  setLocation(`/inventory/${nextDraft.siteId}`);
                }}
              />
            );
          }}
        </Route>

        <Route path="/inventory/:siteId">
          {(params) => {
            const draft = loadDraft(params.siteId);
            if (!draft) return <div className="p-20 text-center">No inventory draft found. Start from onboarding.</div>;
            return (
              <InventoryPage
                draft={draft}
                onBack={() => setLocation(`/editor/${draft.siteId}`)}
                onSaveDraft={(items) => {
                  persistDraft({ ...draft, inventoryItems: items, status: items.length ? 'launch_ready' : 'inventory' });
                }}
                onContinue={(items) => {
                  const nextDraft = persistDraft({ ...draft, inventoryItems: items, status: 'launch_ready' });
                  setLocation(`/launch/${nextDraft.siteId}`);
                }}
              />
            );
          }}
        </Route>

        <Route path="/launch/:siteId">
          {(params) => {
            const draft = loadDraft(params.siteId);
            if (!draft) return <div className="p-20 text-center">No launch draft found. Start from onboarding.</div>;
            return (
              <CheckoutPage
                draft={draft}
                onBack={() => setLocation(`/inventory/${draft.siteId}`)}
                onComplete={(plan: LaunchPlan, deployment: DeploymentRecord) => {
                  const nextDraft = persistDraft({ ...draft, selectedPlan: plan, deployment, status: deployment.status || 'deploy_requested' });
                  setLocation(`/published/${nextDraft.siteId}`);
                }}
              />
            );
          }}
        </Route>

        <Route path="/checkout/:siteId">
          {(params) => {
            setLocation(`/launch/${params.siteId}`);
            return <RouteLoading />;
          }}
        </Route>

        <Route path="/published/:siteId">
          {(params) => {
            const draft = loadDraft(params.siteId);
            if (!draft) return <div className="p-20 text-center">No deployment found. Start from onboarding.</div>;
            return (
              <PublishedPage
                draft={draft}
                onBack={() => setLocation(`/launch/${draft.siteId}`)}
                onDeploymentUpdate={(deployment) => {
                  persistDraft({ ...draft, deployment, status: deployment.status });
                }}
              />
            );
          }}
        </Route>

        <Route path="/storefront/:siteId">
          {(params) => {
            const draft = loadDraft(params.siteId);
            if (!draft) return <div className="p-20 text-center">No storefront draft found.</div>;
            return <StorefrontPage draft={draft} onBack={() => setLocation(`/published/${draft.siteId}`)} />;
          }}
        </Route>

        <Route>
          <div className="p-20 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page not found. <a href="/" className="underline">Return home</a>.</p>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}
