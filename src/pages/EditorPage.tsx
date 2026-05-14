import React, { useState, useEffect } from 'react';
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { createPuckConfig } from '../components/puck/config';
import { EdgeRootProps, TemplateFamily } from '../lib/types';
import { validateEditorContent } from '../lib/validation';
import { AiAssistant } from '../components/Editor/AiAssistant';
import { WORKFLOW_STEPS } from '../lib/workflowSteps';
import { getWorkflowBlockers, isCheckoutConfigured, WorkflowActionId, WorkflowBlocker } from '../lib/workflowActions';
import { Layout, FileText, ShoppingBag, Mail, Home, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface EditorPageProps {
  initialData: any;
  puckContent: { [key: string]: any };
  templateFamily: TemplateFamily;
  rootProps: EdgeRootProps;
  inventoryCount: number;
  publishUrl?: string;
  onPublish: (data: any) => void;
  onOpenInventory: () => void;
  onOpenCheckout: () => void;
  onOpenLive: () => void;
}

export function EditorPage({ initialData, puckContent, templateFamily, rootProps, inventoryCount, publishUrl, onPublish, onOpenInventory, onOpenCheckout, onOpenLive }: EditorPageProps) {
  const [siteData, setSiteData] = useState(puckContent);
  const [activePage, setActivePage] = useState('home');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [mobileAck, setMobileAck] = useState(false);
  
  const config = createPuckConfig(templateFamily);

  useEffect(() => {
    const patchAnonymousFormFields = () => {
      const container = document.querySelector('.Puck');
      if (!container) return;

      const fields = container.querySelectorAll('input, select, textarea');
      fields.forEach((field, index) => {
        const input = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (!input.id) input.id = `puck-field-${index}`;
        if (!input.getAttribute('name')) input.setAttribute('name', input.id);
      });
    };

    patchAnonymousFormFields();
    const observer = new MutationObserver(() => patchAnonymousFormFields());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [activePage]);

  const [pageList, setPageList] = useState(
    Object.keys(puckContent).length > 0 
      ? Object.keys(puckContent).map(key => ({
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
          icon: key === 'home' ? Home : key === 'about' ? FileText : key === 'products' ? ShoppingBag : key === 'contact' ? Mail : Layout
        }))
      : [
          { id: 'home', label: 'Homepage', icon: Home },
          { id: 'about', label: 'About Us', icon: FileText },
          { id: 'products', label: 'Products', icon: ShoppingBag },
          { id: 'contact', label: 'Contact', icon: Mail },
        ]
  );

  const handlePageChange = (newPage: string) => {
    setActivePage(newPage);
  };

  const addPage = () => {
    const name = prompt("Enter page name (e.g. Services, FAQ):");
    if (!name) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (pageList.find(p => p.id === id)) {
      alert("A page with this name already exists.");
      return;
    }

    const newPage = { id, label: name, icon: Layout };
    setPageList([...pageList, newPage]);
    setSiteData(prev => ({
      ...prev,
      [id]: { content: [], root: { props: {} } }
    }));
    setActivePage(id);
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'home') {
      alert("The homepage cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${id}" page?`)) return;

    setPageList(prev => prev.filter(p => p.id !== id));
    setSiteData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    if (activePage === id) {
      setActivePage('home');
    }
  };

  const updateActivePageData = (newData: any) => {
    setSiteData(prev => ({
      ...prev,
      [activePage]: newData
    }));
  };

  const handlePublish = () => {
    const homePageData = siteData['home'] || Object.values(siteData)[0];

    const updatedData = {
      ...homePageData,
      siteData: siteData,
      root: {
        ...homePageData.root,
        props: {
          ...rootProps,
          ...homePageData.root?.props,
          mobileResponsiveAck: mobileAck
        }
      }
    };

    const result = validateEditorContent(updatedData, updatedData.root.props as EdgeRootProps);
    setValidationResult(result);

    if (result.passed) {
      onPublish(updatedData);
      return true;
    }

    const errorMsg = result.errors.map(e => e.message || "Unknown error").join('\n');
    alert(`Validation failed. Please address the following issues:\n\n${errorMsg}`);
    return false;
  };

  const checkoutConfigured = isCheckoutConfigured(rootProps);
  const blockers = getWorkflowBlockers({
    mobileAck,
    hasInventory: inventoryCount > 0,
    checkoutConfigured,
    hasPublishUrl: Boolean(publishUrl),
  });

  const [activeBlockers, setActiveBlockers] = useState<WorkflowBlocker[]>([]);

  const executeAction = (action: WorkflowActionId) => {
    const actionBlockers = blockers[action] || [];
    if (actionBlockers.length) {
      setActiveBlockers(actionBlockers);
      return;
    }

    setActiveBlockers([]);

    if (action === 'preview') {
      const ok = handlePublish();
      if (ok) alert('Preview is validated. Continue through Inventory/Checkout/Launch to publish live.');
      return;
    }

    if (action === 'inventory') {
      onOpenInventory();
      return;
    }

    if (action === 'checkout') {
      onOpenCheckout();
      return;
    }

    if (action === 'launch') {
      const ok = handlePublish();
      if (ok) onOpenCheckout();
      return;
    }

    if (action === 'live') {
      onOpenLive();
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#F9F8F6] font-sans box-border overflow-hidden">
       {/* Sidebar for Page Switching */}
       <aside className="w-64 border-r border-black/10 bg-white flex flex-col">
          <div className="p-8 border-b border-black/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif italic tracking-tight">Structure</h2>
              <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">Multi-Page</p>
            </div>
            <button 
              onClick={addPage}
              className="w-8 h-8 rounded border border-black/15 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              title="Add Page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {pageList.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                className={`w-full group flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  activePage === page.id 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black/70 border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <page.icon className={`w-4 h-4 ${activePage === page.id ? 'text-white' : 'text-black/40'}`} />
                  <span className="text-sm font-bold tracking-tight">{page.label}</span>
                </div>
                <div className="flex items-center">
                  {page.id !== 'home' && (
                    <button
                      type="button"
                      aria-label={`Delete ${page.label} page`}
                      title={`Delete ${page.label} page`}
                      onClick={(e) => deletePage(page.id, e)}
                      className={`p-1 rounded border transition-colors ${activePage === page.id ? 'border-white/30 text-white hover:bg-white/10' : 'border-black/20 text-black/50 hover:bg-red-50 hover:border-red-300 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {activePage === page.id && page.id === 'home' && <ChevronRight className="w-4 h-4" />}
                  {activePage === page.id && page.id !== 'home' && <ChevronRight className="w-4 h-4 ml-1" />}
                </div>
              </button>
            ))}
          </nav>
          
          <div className="p-4 bg-black/[0.03] m-4 rounded border border-black/10">
             <p className="text-[10px] uppercase tracking-widest font-bold text-black/30 mb-2">Editor Tip</p>
             <p className="text-[11px] leading-relaxed text-black/60 italic">Navigation links between these pages are automatically synchronized.</p>
          </div>
       </aside>

       <div className="flex-1 flex flex-col overflow-hidden">
          <header className="p-8 border-b border-black/10 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-4xl font-serif italic tracking-tight leading-none text-[#1A1A1A]">
                  {pageList.find(p => p.id === activePage)?.label}
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] mt-2 font-semibold text-black/50">Editing: {rootProps.title}</p>
                <div className="mt-4 flex items-center gap-2">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div
                        className={`px-2.5 py-1 rounded border text-[10px] uppercase tracking-wider font-semibold ${
                          step.id === 'content'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black/55 border-black/15'
                        }`}
                        title={step.helper}
                        aria-label={`Workflow step: ${step.label}`}
                      >
                        {step.label}
                      </div>
                      {index < WORKFLOW_STEPS.length - 1 && <span className="text-black/25 text-xs">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end max-w-[520px]">
                <label htmlFor="verified-responsive" className="text-[10px] flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] bg-black/[0.04] px-3 py-2 rounded border border-black/10 hover:bg-black/[0.07] transition-colors">
                  <input 
                    id="verified-responsive"
                    name="verifiedResponsive"
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-black"
                    checked={mobileAck}
                    onChange={(e) => setMobileAck(e.target.checked)}
                  />
                  Verified Responsive
                </label>

                <button onClick={() => executeAction('preview')} className="px-3 py-2 border border-black/20 text-[10px] uppercase font-semibold tracking-[0.12em] rounded">
                  Preview
                </button>
                <button onClick={() => executeAction('inventory')} className="px-3 py-2 border border-black/20 text-[10px] uppercase font-semibold tracking-[0.12em] rounded">
                  Inventory
                </button>
                <button onClick={() => executeAction('checkout')} className="px-3 py-2 border border-black/20 text-[10px] uppercase font-semibold tracking-[0.12em] rounded">
                  Checkout
                </button>
                <button onClick={() => executeAction('launch')} className="px-3 py-2 bg-black text-white text-[10px] uppercase font-semibold tracking-[0.12em] rounded border border-black">
                  Launch
                </button>
                <button onClick={() => executeAction('live')} className="px-3 py-2 border border-black/20 text-[10px] uppercase font-semibold tracking-[0.12em] rounded">
                  Live
                </button>
              </div>
          </header>
          
          <div className="px-8 py-2 border-b border-black/10 bg-white">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
              <span className="px-2 py-1 rounded border border-black/15 text-black/70">Draft: In progress</span>
              <span className={`px-2 py-1 rounded border ${inventoryCount > 0 ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-amber-300 text-amber-800 bg-amber-50'}`}>Inventory: {inventoryCount > 0 ? `${inventoryCount} items` : 'Pending'}</span>
              <span className={`px-2 py-1 rounded border ${checkoutConfigured ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-black/15 text-black/60'}`}>Checkout: {checkoutConfigured ? 'Configured' : 'Not configured'}</span>
              <span className={`px-2 py-1 rounded border ${blockers.launch.length === 0 ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-black/15 text-black/60'}`}>Launch: {blockers.launch.length === 0 ? 'Ready' : 'Blocked'}</span>
            </div>
            {activeBlockers.length > 0 && (
              <div className="mt-2 p-2 rounded border border-amber-300 bg-amber-50 text-[11px] text-amber-900">
                <p className="font-semibold uppercase tracking-[0.12em] text-[10px] mb-1">Action blocked</p>
                <ul className="list-disc pl-4 space-y-1">
                  {activeBlockers.map((blocker) => (
                    <li key={blocker.code}>{blocker.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
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

