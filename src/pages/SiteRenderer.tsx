import React, { useEffect, useState } from 'react';
import { Render } from "@measured/puck";
import { createPuckConfig } from '../components/puck/config';
import { TemplateFamily } from '../lib/types';
import { supabase } from '../lib/supabaseClient';

interface SiteRendererProps {
  slug: string;
  subpath?: string;
}

export function SiteRenderer({ slug, subpath = 'home' }: SiteRendererProps) {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchSite = async () => {
        try {
          const { data: marketplace, error } = await supabase
            .from('marketplaces')
            .select('*')
            .eq('id', slug)
            .single();

          if (error) throw error;
          if (marketplace && marketplace.content) {
            setSiteData(marketplace.content.siteData || { home: marketplace.content });
          } else {
            setError("Site not found or has no content.");
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchSite();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9F8F6]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black/5 rounded-full" />
          <div className="h-4 w-32 bg-black/5 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F9F8F6] p-8 text-center">
        <h1 className="text-4xl font-serif italic mb-4">Oops!</h1>
        <p className="text-black/50 max-w-md">{error || "This site hasn't been published yet."}</p>
        <a href="/" className="mt-8 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
          Back to Hub
        </a>
      </div>
    );
  }

  const pageData = siteData[subpath] || siteData['home'];
  const templateFamily = (pageData.root?.props?.templateFamily as TemplateFamily) || 'retail-core';
  const config = createPuckConfig(templateFamily);

  // Transform pageData to update nav links to stay within /s/${slug}
  const transformedData = {
    ...pageData,
    content: pageData.content?.map((item: any) => {
      if (item.props?.navLinks) {
        return {
          ...item,
          props: {
            ...item.props,
            navLinks: item.props.navLinks.map((link: any) => ({
              ...link,
              href: link.href.startsWith('/') ? `/s/${slug}${link.href === '/home' ? '' : link.href}` : link.href
            }))
          }
        };
      }
      return item;
    })
  };

  return <Render config={config} data={transformedData} />;
}
