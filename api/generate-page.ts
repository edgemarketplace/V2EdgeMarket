import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      return res.status(500).json({ error: "Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured in Vercel." });
    }

    const intake = req.body;
    
    let inventoryContext = "";
    if (intake.inventory) {
      if (intake.inventory.method === 'manual' && intake.inventory.items?.length > 0) {
        inventoryContext = `The user provided the following inventory items:\n${JSON.stringify(intake.inventory.items, null, 2)}`;
      } else if (intake.inventory.method === 'text' && intake.inventory.content) {
        inventoryContext = `The user provided the following raw inventory text. Please parse this into structured products/packages:\n${intake.inventory.content}`;
      } else if (intake.inventory.method === 'file') {
        inventoryContext = `The user indicated they uploaded a file named ${intake.inventory.fileName}. Generate realistic placeholder products based on their business type.`;
      }
    }

    const prompt = `**System Prompt: Edge Marketplace Hub — AI Web Designer**

You are the Lead Product Architect and AI Web Designer for Edge Marketplace Hub. Your job is to convert a user's intake form into a fully configured, production-ready Puck Editor website manifest. 

**Primary Goal:**
Create an AI-assisted, constrained marketplace/site builder JSON configuration for a non-technical user. Go from the provided business intake variables to a polished, editable preview structure in one step.

**Non-Goals:**
- Do not build a generic, unrestricted page builder.
- Do not expose raw HTML or arbitrary component nesting.
- Do not invent components outside of the approved section inventory.

---

### **USER INTAKE VARIABLES**
*Read these variables and use them to construct the site's copy, layout, and configuration.*

*   **Business Name:** ${intake.businessName}
*   **Category (Template Family):** ${intake.businessType}
*   **The Elevator Pitch:** ${intake.offerings}
*   **Primary Goal (Commerce Mode):** ${intake.primaryGoal}
*   **Tone of Voice:** ${intake.tone}
*   **Primary Brand Color:** ${intake.brandColor}

${inventoryContext}

### **ALLOWED COMPONENTS LIST**
You MUST use ONLY these exact strings for the "type" property in the content array:
- Headers: "HeaderSimple", "HeaderPromo", "HeaderMega"
- Heroes: "HeroImageLeft", "HeroFullVisual", "HeroProductFirst", "HeroServiceFirst"
- Grids: "GridFeaturedProducts", "GridCollections", "GridServiceCards", "GridPackages"
- Story: "StorySplit", "StoryValueIcons", "StoryEditorialBand", "StoryFounder"
- Trust: "TrustReviews", "TrustTestimonials", "TrustLogos", "TrustStats"
- Media: "MediaGallery", "MediaVideo", "MediaBeforeAfter"
- Conversion: "ConversionFAQ", "ConversionNewsletter", "ConversionQuoteCTA", "ConversionStickyPromo"
- Footers: "FooterBasic", "FooterCommerce", "FooterService"

---

### **REQUIRED INSTRUCTIONS**
Return ONLY a valid JSON object matching the exact structure below. No markdown formatting, no explanations, no code blocks (like \`\`\`json). Just the raw JSON. 

1. Create a logical, high-converting narrative flow for the page based on the business type and elevator pitch.
2. Select appropriate component types from the Allowed Components list above. NEVER invent component types.
3. Write high-converting, professional copy tailored to the Tone of Voice. 
4. The Primary Goal is CRITICAL. You MUST design the site so that the main Call to Actions (in the Hero, the Conversion CTA, and Packages) drive the user towards this goal (e.g., "Request a Quote", "Book Now", "Buy Online").
5. For imagery, source.unsplash.com is completely deprecated. You must use REAL, KNOWN Unsplash photo IDs. Format: "https://images.unsplash.com/photo-{REAL_PHOTO_ID}?q=80&w=1200&auto=format&fit=crop". Do NOT invent fake IDs. If you do not know a real photo ID for the specific niche, use a high-quality, real photo ID of a beautiful architectural space, office, or texture that you know exists. Example: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop".
6. CRITICAL: Based on the business category, select the appropriate \`stylePreset\` from the following exact string values: "milano" (luxury/beauty/boutique), "standard" (retail/services), "minimal" (tech/agency).

---

### **EXPECTED JSON STRUCTURE**
{
  "content": [
    {
      "type": "string",
      "props": {
        "id": "string",
        "title": "string",
        "heading": "string",
        "subheading": "string",
        "ctaText": "string",
        "image": "string",
        "items": [{ "name": "string", "title": "string", "description": "string", "price": "string", "image": "string", "features": [{"label":"string"}] }],
        "images": [{ "image": "string" }],
        "questions": [{ "q": "string", "a": "string" }]
      }
    }
  ],
  "root": {
    "title": "string",
    "theme": {
      "stylePreset": "string"
    }
  }
}`;

    let data;

    if (geminiApiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      const result = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      data = JSON.parse(result.text || "{}");
    } else {
      const openai = new OpenAI({ apiKey: openaiApiKey! });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      data = JSON.parse(response.choices[0].message.content || "{}");
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Generate Page Error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
}
