/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { EditorPage } from './pages/EditorPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { mapIntakeToPuckConfig } from './lib/ai-mapper';
import { marketplaceService } from './lib/marketplaceService';
import { EdgeRootProps, TemplateFamily, MarketplaceIntakeData } from './lib/types';

export default function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'editor' | 'checkout'>('landing');
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
      // Save to Supabase
      try {
        await marketplaceService.saveMarketplace(data);
        console.log("Marketplace saved to Supabase successfully");
      } catch (dbError) {
        console.warn("Could not save to Supabase. Check credentials.", dbError);
      }

      const response = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const mappedConfig = mapIntakeToPuckConfig(data);
      if (response.ok) {
        const aiData = await response.json();
        // Override content from AI
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
      } else {
        console.warn("AI generation failed, falling back to local mapper");
      }
      
      setEditorState({
        initialData: mappedConfig.initialData,
        templateFamily: data.businessType,
        rootProps: {
          ...mappedConfig.rootProps,
          paymentConfigured: ['checkout', 'digital', 'catalog'].includes(mappedConfig.rootProps.commerceMode) ? true : undefined
        },
      });
      setView('editor');
    } catch (e) {
      console.error("AI Generation failed:", e);
      const mappedConfig = mapIntakeToPuckConfig(data);
      setEditorState({
        initialData: mappedConfig.initialData,
        templateFamily: data.businessType,
        rootProps: {
          ...mappedConfig.rootProps,
          paymentConfigured: ['checkout', 'digital', 'catalog'].includes(mappedConfig.rootProps.commerceMode) ? true : undefined
        },
      });
      setView('editor');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9F8F6] text-[#1A1A1A]">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-serif italic text-2xl tracking-tight">AI is designing your site...</p>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('onboarding')} />;
  }

  if (view === 'editor' && editorState) {
    return (
      <EditorPage 
        initialData={editorState.initialData} 
        templateFamily={editorState.templateFamily} 
        rootProps={editorState.rootProps} 
        onPublish={() => setView('checkout')}
      />
    );
  }

  if (view === 'checkout' && intakeData) {
    return (
      <CheckoutPage 
        intakeData={intakeData}
        onBack={() => setView('editor')}
        onComplete={(plan) => {
          alert(`Great! You've selected the ${plan} plan. Redirecting to Stripe...`);
          // Here you would integrate Stripe
        }}
      />
    );
  }

  return <Onboarding onComplete={handleOnboardingComplete} />;
}
