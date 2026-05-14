/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { EditorPage } from './pages/EditorPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PublishedPage } from './pages/PublishedPage';
import { mapIntakeToPuckConfig } from './lib/ai-mapper';
import { marketplaceService } from './lib/marketplaceService';
import { EdgeRootProps, TemplateFamily, MarketplaceIntakeData } from './lib/types';

import { Router, Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';

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
    templateFamily: TemplateFamily;
    rootProps: EdgeRootProps;
  } | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOnboardingComplete = async (data: MarketplaceIntakeData) => {
    setIsGenerating(true);
    setIntakeData(data);
    
    try {
      // Save to Supabase (optional/background)
      marketplaceService.saveMarketplace(data).catch(err => console.warn("Supabase save failed", err));

      const response = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const mappedConfig = mapIntakeToPuckConfig(data);
      if (response.ok) {
        const aiData = await response.json();
        if (aiData.content && Array.isArray(aiData.content)) {
          mappedConfig.initialData.content = aiData.content.map((item: any, idx: number) => ({
            ...item,
            id: item.id || `${item.type}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
            props: {
              ...item.props,
              id: item.props?.id || item.id || `${item.type}-${idx}`
            }
          }));
        }
        
        // Merge the AI's generated root metadata (especially stylePreset) into the config
        if (aiData.root) {
          mappedConfig.rootProps = {
            ...mappedConfig.rootProps,
            ...aiData.root,
            theme: {
              ...mappedConfig.rootProps.theme,
              ...(aiData.root.theme || {})
            }
          };
          mappedConfig.initialData.root = {
            ...mappedConfig.initialData.root,
            ...aiData.root,
          };
        }
      } else {
        console.error("AI Generation failed with status:", response.status);
        console.error("Error details:", await response.text());
      }
      
      setEditorState({
        initialData: mappedConfig.initialData,
        templateFamily: data.businessType,
        rootProps: {
          ...mappedConfig.rootProps,
          paymentConfigured: ['checkout', 'digital', 'catalog'].includes(mappedConfig.rootProps.commerceMode) ? true : undefined
        },
      });
      setLocation('/editor');
    } catch (e) {
      console.error("AI Generation failed:", e);
      const mappedConfig = mapIntakeToPuckConfig(data);
      setEditorState({
        initialData: mappedConfig.initialData,
        templateFamily: data.businessType,
        rootProps: mappedConfig.rootProps,
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
              templateFamily={editorState.templateFamily} 
              rootProps={editorState.rootProps} 
              onPublish={() => setLocation('/checkout')}
            />
          ) : (
            <div className="p-20 text-center">
              <p>No editor state found. Please complete <a href="/onboarding" className="underline">onboarding</a>.</p>
            </div>
          )}
        </Route>
        
        <Route path="/checkout">
          {intakeData ? (
            <CheckoutPage 
              intakeData={intakeData}
              onBack={() => setLocation('/editor')}
              onComplete={(plan) => {
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
          {intakeData ? (
            <PublishedPage intakeData={intakeData} />
          ) : (
            <div className="p-20 text-center">
              <p>No deployment data found. Please complete <a href="/onboarding" className="underline">onboarding</a>.</p>
            </div>
          )}
        </Route>
        
        <Route>
          <div className="p-20 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page not found. <a href="/" className="underline">Return home</a>.</p>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}
