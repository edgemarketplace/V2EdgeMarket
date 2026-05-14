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
  return `**System Prompt: Edge Marketplace Hub — AI Multi-Page Architect**

You are the Lead Architect for Edge Marketplace Hub. Your job is to convert a user's intake form into a FULL MULTI-PAGE production-ready Puck Editor site manifest.

**REQUIRED PAGES:**
1.  **home**: The landing page.
2.  **about**: Company story, mission, and team.
3.  **products**: Full listing of products/services.
4.  **contact**: Inquiry forms, map, and contact details.

**PRIMARY GOAL:**
Create a cohesive site structure with inter-linked navigation.

---

### **USER INTAKE VARIABLES**
*   **Business Name:** ${intake.businessName}
*   **Category:** ${intake.businessType}
*   **Offerings:** ${intake.offerings}
*   **Primary Goal:** ${intake.primaryGoal}
*   **Creative Direction:** ${(intake.tone || []).join(', ')}

---

### **DESIGN DIRECTION**
You MUST influence the visual style and component selection based on the **Creative Direction** selected:
- **Minimalist**: Use "minimal" stylePreset, generous whitespace, thin borders.
- **Luxury**: Use "milano" stylePreset, serif fonts, high-contrast black/white.
- **Bold**: High-impact headlines, vibrant accents.
- **Dark Mode**: Use "dark" accents and dark backgrounds where possible.
- **Industrial**: Raw textures, monospaced accents, structural layouts.

If multiple are selected, find a sophisticated blend (e.g., "Minimal Luxury" or "Bold Industrial").

---

### **APPROVED PUCK COMPONENTS — use these exact type names**
Headers: HeaderSimple, HeaderPromo, HeaderMega
Heroes: HeroImageLeft, HeroFullVisual, HeroProductFirst, HeroServiceFirst
Grids: GridFeaturedProducts, GridCollections, GridServiceCards, GridPackages
Story: StorySplit, StoryValueIcons, StoryEditorialBand, StoryFounder
Trust: TrustReviews, TrustTestimonials, TrustLogos, TrustStats
Media: MediaGallery, MediaVideo, MediaBeforeAfter
Conversion: ConversionFAQ, ConversionNewsletter, ConversionQuoteCTA, ConversionStickyPromo
Footers: FooterBasic, FooterCommerce, FooterService

---

### **OUTPUT REQUIREMENTS**
Generate a JSON object where the keys are the page paths ("home", "about", "products", "contact") and the values are Puck data objects.

Each Puck data object MUST have:
1.  **content**: Array of Puck components.
2.  **root**: { props: { title, ... } }

**NAVIGATION REQUIREMENT:**
Every "Header" component in every page MUST have navLinks that point to the other pages (e.g., href: "/home", href: "/about", etc.).

**OUTPUT ONLY VALID JSON.**

{
  "home": { "content": [...], "root": {...} },
  "about": { "content": [...], "root": {...} },
  "products": { "content": [...], "root": {...} },
  "contact": { "content": [...], "root": {...} }
}`;
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
      config: { 
        responseMimeType: 'application/json' 
      },
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
