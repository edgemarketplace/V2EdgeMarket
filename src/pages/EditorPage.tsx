import React, { useState } from 'react';
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { createPuckConfig } from '../components/puck/config';
import { EdgeRootProps, TemplateFamily } from '../lib/types';
import { validateEditorContent } from '../lib/validation';

interface EditorPageProps {
  initialData: any;
  templateFamily: TemplateFamily;
  rootProps: EdgeRootProps;
  onPublish: (data: any) => void;
}

export function EditorPage({ initialData, templateFamily, rootProps, onPublish }: EditorPageProps) {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [mobileAck, setMobileAck] = useState(false);
  
  const config = createPuckConfig(templateFamily);

  const handlePublish = (data: any) => {
    // Inject root props and ack
    const updatedData = {
      ...data,
      root: {
        ...data.root,
        props: {
          ...rootProps,
          ...data.root?.props,
          mobileResponsiveAck: mobileAck
        }
      }
    };

    if (!mobileAck) {
      alert("Please check mobile responsiveness and acknowledge before publishing.");
      return;
    }

    const result = validateEditorContent(updatedData, updatedData.root.props as EdgeRootProps);
    setValidationResult(result);
    
    if (result.passed) {
      onPublish(updatedData);
    } else {
      const errorMsg = result.errors.map(e => e.message || "Unknown error").join('\n');
      alert(`Validation failed. Please address the following issues:\n\n${errorMsg}`);
      console.error("Validation failed:", JSON.stringify(result.errors, null, 2));
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F9F8F6] font-sans border-8 border-white box-border">
       <header className="p-8 border-b border-black/10 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-4xl font-serif italic tracking-tight leading-none text-[#1A1A1A]">{rootProps.title}</h1>
            <p className="text-xs uppercase tracking-[0.2em] mt-2 font-semibold text-black/50">Template: {templateFamily} / Mode: {rootProps.commerceMode}</p>
          </div>
          <div className="flex items-center gap-10">
            <label className="text-[10px] flex items-center gap-3 cursor-pointer font-bold uppercase tracking-[0.2em] text-[#1A1A1A] bg-black/5 px-4 py-3 rounded-full hover:bg-black/10 transition-colors">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer accent-black"
                checked={mobileAck}
                onChange={(e) => setMobileAck(e.target.checked)}
              />
              Mobile Layout Verified
            </label>
            
            <div className="text-right">
              <span className="px-3 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-black/20">Edge Editor / Live</span>
              {validationResult && !validationResult.passed && (
                <div className="text-red-600 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">
                  ⚠️ Validation Error: {validationResult.errors[0]?.message}
                </div>
              )}
            </div>
          </div>
       </header>
       <div className="flex-1 overflow-hidden relative">
          <Puck
              config={config}
              data={initialData}
              onPublish={handlePublish}
          />
       </div>
    </div>
  );
}
