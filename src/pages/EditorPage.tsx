import React, { useState, useEffect } from 'react';
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { createPuckConfig } from '../components/puck/config';
import { EdgeRootProps, TemplateFamily } from '../lib/types';
import { validateEditorContent } from '../lib/validation';
import { AiAssistant } from '../components/Editor/AiAssistant';
import { Layout, FileText, ShoppingBag, Mail, Home, ChevronRight } from 'lucide-react';

interface EditorPageProps {
  initialData: any;
  puckContent: { [key: string]: any };
  templateFamily: TemplateFamily;
  rootProps: EdgeRootProps;
  onPublish: (data: any) => void;
}

export function EditorPage({ initialData, puckContent, templateFamily, rootProps, onPublish }: EditorPageProps) {
  const [siteData, setSiteData] = useState(puckContent);
  const [activePage, setActivePage] = useState('home');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [mobileAck, setMobileAck] = useState(false);
  
  const config = createPuckConfig(templateFamily);

  const handlePageChange = (newPage: string) => {
    setActivePage(newPage);
  };

  const updateActivePageData = (newData: any) => {
    setSiteData(prev => ({
      ...prev,
      [activePage]: newData
    }));
  };

  const handlePublish = () => {
    const homePageData = siteData['home'];
    
    const updatedData = {
      ...homePageData,
      siteData: siteData, // Store all pages in the manifest
      root: {
        ...homePageData.root,
        props: {
          ...rootProps,
          ...homePageData.root?.props,
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
    }
  };

  const pages = [
    { id: 'home', label: 'Homepage', icon: Home },
    { id: 'about', label: 'About Us', icon: FileText },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <div className="h-screen w-full flex bg-[#F9F8F6] font-sans border-8 border-white box-border overflow-hidden">
       {/* Sidebar for Page Switching */}
       <aside className="w-64 border-r border-black/10 bg-white flex flex-col">
          <div className="p-8 border-b border-black/10">
            <h2 className="text-xl font-serif italic tracking-tight">Site Structure</h2>
            <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">Multi-Page Editor</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  activePage === page.id 
                  ? 'bg-black text-white shadow-xl shadow-black/10' 
                  : 'hover:bg-black/5 text-black/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <page.icon className={`w-4 h-4 ${activePage === page.id ? 'text-white' : 'text-black/40'}`} />
                  <span className="text-sm font-bold tracking-tight">{page.label}</span>
                </div>
                {activePage === page.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>
          
          <div className="p-6 bg-black/5 m-4 rounded-3xl border border-black/5">
             <p className="text-[10px] uppercase tracking-widest font-bold text-black/30 mb-2">Editor Tip</p>
             <p className="text-[11px] leading-relaxed text-black/60 italic">Navigation links between these pages are automatically synchronized.</p>
          </div>
       </aside>

       <div className="flex-1 flex flex-col overflow-hidden">
          <header className="p-8 border-b border-black/10 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-4xl font-serif italic tracking-tight leading-none text-[#1A1A1A]">
                  {pages.find(p => p.id === activePage)?.label}
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] mt-2 font-semibold text-black/50">Editing: {rootProps.title}</p>
              </div>
              <div className="flex items-center gap-10">
                <label className="text-[10px] flex items-center gap-3 cursor-pointer font-bold uppercase tracking-[0.2em] text-[#1A1A1A] bg-black/5 px-4 py-3 rounded-full hover:bg-black/10 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-black"
                    checked={mobileAck}
                    onChange={(e) => setMobileAck(e.target.checked)}
                  />
                  Verified Responsive
                </label>
                
                <button 
                  onClick={handlePublish}
                  className="px-8 py-3 bg-black text-white text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Publish Site
                </button>
              </div>
          </header>
          
          <div className="flex-1 overflow-hidden relative" key={activePage}>
              <Puck
                  config={config}
                  data={siteData[activePage] || { content: [], root: { props: {} } }}
                  onChange={updateActivePageData}
                  iframe={{ enabled: true }}
              />
              
              <AiAssistant 
                currentData={siteData[activePage]} 
                businessDetails={{
                  name: rootProps.title,
                  businessType: templateFamily,
                  offerings: rootProps.description,
                  activePage: activePage
                }}
                onUpdate={updateActivePageData}
              />
          </div>
       </div>
    </div>
  );
}

