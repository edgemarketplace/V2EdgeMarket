import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { MarketplaceIntakeData } from '../lib/types';

function buildInventoryContext(intake: MarketplaceIntakeData) {
  const inventory = intake.inventory;
  if (!inventory) return 'No structured inventory was supplied yet. Leave space for inventory-first sections that can be populated later.';

  if (inventory.method === 'manual' && inventory.items?.length) {
    return `Structured inventory:\n${JSON.stringify(inventory.items, null, 2)}`;
  }

  if (inventory.method === 'text' && inventory.content) {
    return `Raw inventory notes:\n${inventory.content}`;
  }

  if (inventory.method === 'file' && inventory.fileName) {
    return `An inventory file was uploaded: ${inventory.fileName}. Generate placeholders that match the business until the real inventory is synced.`;
  }

  return 'No inventory details were supplied.';
}

function buildPrompt(intake: MarketplaceIntakeData) {
  return `You are Edge Marketplace Hub's storefront architect.
Return ONLY valid JSON with this shape:
{
  "content": [{ "type": "string", "props": {} }],
  "root": { "title": "string", "theme": { "stylePreset": "milano|standard|minimal" } }
}

Business name: ${intake.businessName}
Template family: ${intake.businessType}
Offerings: ${intake.offerings}
Primary goal: ${intake.primaryGoal}
Tone: ${intake.tone || 'professional'}
Brand color: ${intake.brandColor || 'default'}
Contact email: ${intake.contactEmail || 'unknown'}
Service area: ${intake.serviceArea || 'not provided'}
Inventory context:
${buildInventoryContext(intake)}

Hard rules:
- Use ONLY these component type strings: HeaderSimple, HeaderPromo, HeaderMega, HeroImageLeft, HeroFullVisual, HeroProductFirst, HeroServiceFirst, GridFeaturedProducts, GridCollections, GridServiceCards, GridPackages, StorySplit, StoryValueIcons, StoryEditorialBand, StoryFounder, TrustReviews, TrustTestimonials, TrustLogos, TrustStats, MediaGallery, MediaVideo, MediaBeforeAfter, ConversionFAQ, ConversionNewsletter, ConversionQuoteCTA, ConversionStickyPromo, FooterBasic, FooterCommerce, FooterService.
- Build an inventory-first funnel: establish trust, show products/services, then conversion.
- Use CTA labels that match the primary goal.
- If inventory is present, populate relevant grid/package components with real-looking structured items.
- root.theme.stylePreset must be one of milano, standard, minimal.
- Do not return markdown or commentary.`;
}

export async function generatePageManifest(intake: MarketplaceIntakeData) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!openaiApiKey && !geminiApiKey) {
    throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured.');
  }

  const prompt = buildPrompt(intake);

  if (geminiApiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    return JSON.parse(result.text || '{}');
  }

  const openai = new OpenAI({ apiKey: openaiApiKey! });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
