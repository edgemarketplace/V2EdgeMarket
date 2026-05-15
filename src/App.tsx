/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { EditorPage } from './pages/EditorPage';
import { InventoryPage } from './pages/InventoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PublishedPage } from './pages/PublishedPage';
import { SiteRenderer } from './pages/SiteRenderer';
import { mapIntakeToPuckConfig } from './lib/ai-mapper';
import { marketplaceService } from './lib/marketplaceService';
import { EdgeRootProps, TemplateFamily, MarketplaceIntakeData } from './lib/types';
import { safeFetchJson } from './lib/http';

const VALID_COMPONENT_TYPES = new Set([
  'HeaderSimple', 'HeaderPromo', 'HeaderMega',
  'HeroImageLeft', 'HeroFullVisual', 'HeroProductFirst', 'HeroServiceFirst',
  'GridFeaturedProducts', 'GridCollections', 'GridServiceCards', 'GridPackages', 'GridProductDetail',
  'StorySplit', 'StoryValueIcons', 'StoryEditorialBand', 'StoryFounder',
  'TrustReviews', 'TrustTestimonials', 'TrustLogos', 'TrustStats',
  'MediaGallery', 'MediaVideo', 'MediaBeforeAfter',
  'ConversionFAQ', 'ConversionNewsletter', 'ConversionQuoteCTA', 'ConversionStickyPromo',
  'FooterBasic', 'FooterCommerce', 'FooterService',
]);

import { Router, Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { CartProvider } from './lib/cart';
import { CartDrawer } from './components/CartDrawer';

const GeneratingScreen = () => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const messages = [
    "Analyzing brand identity...",
    "Selecting structural layouts...",
    "Writing high-converting copy...",
    "Applying Milano design tokens...",
    "Finalizing storefront architecture..."
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, messages.length - 1));
    }, 2000);
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
        <div className="w-full bg-black/5 h-1 mt-8 overflow-hidden rounded-full">
           <motion.div 
             className="bg-black h-full"
             initial={{ width: "0%" }}
             animate={{ width: `${((messageIndex + 1) / messages.length) * 100}%` }}
             transition={{ duration: 1.8, ease: "easeInOut" }}
           />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [location, setLocation] = useLocation();
  const [intakeData, setIntakeData] = useState<MarketplaceIntakeData | null>(null);
  const [editorState, setEditorState] = useState<{
    initialData: any;
    puckContent: { [key: string]: any };
    templateFamily: TemplateFamily;
    rootProps: EdgeRootProps;
    siteId: string;
    slug: string;
    inventoryItems: any[];
    publishUrl?: string;
  } | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOnboardingComplete = async (data: MarketplaceIntakeData) => {
    setIsGenerating(true);
    setIntakeData(data);
    
    try {
      // Save to Supabase (optional/background)
      marketplaceService.saveMarketplace(data).catch(err => console.warn("Supabase save failed", err));

      let siteContent: { [key: string]: any } = {};
      const baseConfig = mapIntakeToPuckConfig(data);

      try {
        const aiData = await safeFetchJson<any>('/api/generate-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        // aiData is now { home: {...}, about: {...}, ... }
        siteContent = aiData;

        // Ensure all pages have IDs
        Object.keys(siteContent).forEach(pageKey => {
          if (siteContent[pageKey].content) {
            // Phase 4 fix: filter out unknown component types from AI responses
            const before = siteContent[pageKey].content.length;
            siteContent[pageKey].content = siteContent[pageKey].content
              .filter((item: any) => {
                const valid = VALID_COMPONENT_TYPES.has(item.type);
                if (!valid) console.warn(`[Editor] Stripping unknown component type: ${item.type}`);
                return valid;
              })
              .map((item: any, idx: number) => ({
                ...item,
                id: item.id || `${item.type}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
                props: {
                  ...item.props,
                  id: item.props?.id || item.id || `${item.type}-${idx}`
                }
              }));
            if (before > siteContent[pageKey].content.length) {
              console.warn(`[Editor] Stripped ${before - siteContent[pageKey].content.length} unknown components from ${pageKey}`);
            }
          }
        });
      } catch (apiError) {
        console.warn('AI generate-page unavailable, falling back to local presets', apiError);
        // Use our robust local multi-page presets if AI generation fails
        siteContent = baseConfig.siteData;
      }
      
      const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const siteId = `client-${slug.slice(0, 12)}-${data.businessType}`;

      setEditorState({
        initialData: siteContent['home'] || baseConfig.initialData,
        puckContent: siteContent,
        templateFamily: data.businessType,
        rootProps: {
          ...baseConfig.rootProps,
          paymentConfigured: ['checkout', 'digital', 'catalog'].includes(baseConfig.rootProps.commerceMode) ? true : undefined
        },
        siteId,
        slug,
        inventoryItems: data.inventory?.items || [],
      });
      // Go to inventory FIRST (not editor) - inventory is the first step after onboarding
      setLocation(`/inventory/${siteId}`);
    } catch (e) {
      console.error("AI Generation failed:", e);
      const mappedConfig = mapIntakeToPuckConfig(data);
      const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const siteId = `client-${slug.slice(0, 12)}-${data.businessType}`;
      setEditorState({
        initialData: mappedConfig.initialData,
        puckContent: mappedConfig.siteData,
        templateFamily: data.businessType,
        rootProps: mappedConfig.rootProps,
        siteId,
        slug,
        inventoryItems: data.inventory?.items || [],
      });
      setLocation('/editor');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <GeneratingScreen />;
  }

  return (
    <CartProvider>
      <Router>
        <Switch>
          <Route path="/">
            <LandingPage onStart={() => setLocation('/onboarding')} />
          </Route>
          
          <Route path="/onboarding">
            <Onboarding onComplete={handleOnboardingComplete} />
          </Route>
          
          <Route path="/editor">
            {editorState ? (
              <EditorPage 
                initialData={editorState.initialData} 
                puckContent={editorState.puckContent}
                templateFamily={editorState.templateFamily} 
                rootProps={editorState.rootProps} 
                inventoryCount={editorState.inventoryItems.length}
                publishUrl={editorState.publishUrl}
                onPublish={() => setLocation('/checkout')}
                onOpenInventory={() => setLocation(`/inventory/${editorState?.siteId}`)}
                onOpenCheckout={() => setLocation('/checkout')}
                onOpenLive={() => setLocation('/published')}
              />
            ) : (
              <div className="p-20 text-center">
                <p>No editor state found. Please complete <a href="/onboarding" className="underline">onboarding</a>.</p>
              </div>
            )}
          </Route>
          
          <Route path="/inventory/:siteId?">
            {((params) => {
              const siteId = params.siteId || editorState?.siteId || 'test-site-123';
              // Always render InventoryPage (with fallback props if needed)
              return (
                <InventoryPage 
                  draft={{
                    siteId: siteId,
                    slug: editorState?.slug || 'test-business',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'inventory',
                    selectedPlan: 'launch',
                    intakeData: intakeData || {
                      businessName: 'Test Business',
                      businessType: 'retail',
                      primaryGoal: 'sell',
                    } as any,
                    templateFamily: editorState?.templateFamily || 'retailCore',
                    rootProps: editorState?.rootProps || { commerceMode: 'catalog' } as any,
                    editorData: { content: [] },
                    inventoryItems: editorState?.inventoryItems || [],
                  } as any}
                  onBack={() => setLocation(`/editor`)}
                  onContinue={(items) => {
                    setEditorState((prev) => (prev ? { ...prev, inventoryItems: items } : prev));
                    setLocation('/checkout');
                  }}
                  onSaveDraft={(items) => {
                    setEditorState((prev) => (prev ? { ...prev, inventoryItems: items } : prev));
                  }}
                />
              );
            }) as any}
          </Route>
          
          <Route path="/checkout">
            {intakeData && editorState ? (
              <CheckoutPage 
                draft={{
                  siteId: editorState.siteId,
                  slug: editorState.slug,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: 'launch_ready',
                  selectedPlan: 'launch',
                  intakeData,
                  templateFamily: editorState.templateFamily,
                  rootProps: editorState.rootProps,
                  editorData: { content: [] },
                  inventoryItems: editorState.inventoryItems,
                } as any}
                onBack={() => setLocation('/editor')}
                onComplete={(_plan, deployment) => {
                  setEditorState((prev) => (prev ? { ...prev, publishUrl: deployment.publishUrl } : prev));
                  setLocation('/published');
                }}
              />
            ) : (
              <div className="p-20 text-center">
                <p>No checkout data found. Please complete <a href="/onboarding" className="underline">onboarding</a>.</p>
              </div>
            )}
          </Route>
          
          <Route path="/published">
            {intakeData && editorState ? (
              <PublishedPage 
                draft={{
                  siteId: editorState.siteId,
                  slug: editorState.slug,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: 'launch_ready',
                  selectedPlan: 'launch',
                  intakeData,
                  templateFamily: editorState.templateFamily,
                  rootProps: editorState.rootProps,
                  editorData: { content: [] },
                  inventoryItems: editorState.inventoryItems,
                } as any}
                onBack={() => setLocation('/checkout')}
                onDeploymentUpdate={() => {}}
              />
            ) : (
              <div className="p-20 text-center">
                <p>No deployment data found. Please complete <a href="/onboarding" className="underline">onboarding</a>.</p>
              </div>
            )}
          </Route>

          <Route path="/s/:id">
            {(params) => <SiteRenderer slug={params.id} subpath="home" />}
          </Route>
          <Route path="/s/:id/:subpath*">
            {(params) => <SiteRenderer slug={params.id} subpath={params.subpath} />}
          </Route>
          
          <Route>
            <div className="p-20 text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p>Page not found. <a href="/" className="underline">Return home</a>.</p>
            </div>
          </Route>
        </Switch>
      </Router>
      <CartDrawer />
    </CartProvider>
  );
}

