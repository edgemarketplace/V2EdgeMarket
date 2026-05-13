import { Router } from "express";
import OpenAI from "openai";
import { db } from "../../src/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.json({ status: "ok", database: "disconnected", error: String(err) });
  }
});

router.post("/generate-page", async (req, res) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      return res.status(500).json({ error: "Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured." });
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

---

### **USER INTAKE VARIABLES**
*   **Business Name:** ${intake.businessName}
*   **Category (Template Family):** ${intake.businessType}
*   **The Elevator Pitch:** ${intake.offerings}
*   **Primary Goal (Commerce Mode):** ${intake.primaryGoal}
*   **Contact Email:** ${intake.contactEmail}
*   **Tone & Vibe:** ${intake.tone || "Professional and high quality"}
*   **Brand Color:** ${intake.brandColor || "#000000"}

${inventoryContext ? `\n### **INVENTORY DATA**\n${inventoryContext}\n\n**CRITICAL INSTRUCTION**: You MUST use the inventory data above to populate the products, services, or packages in the 'GridFeaturedProducts', 'GridPackages', or 'GridServiceCards' components you generate. Do not use generic placeholders if inventory data is provided.` : ''}

---

### **DESIGN & STYLING MATRIX**
*Based on the User Intake Variables above, select the exact stylePreset, layout tone, and section blocks:*

**1. Retail Core (Boutiques, shops)**
*   **Required Sections:** HeaderPromo, HeaderSimple, HeroProductFirst, GridFeaturedProducts, GridCollections, FooterCommerce.

**2. Service Pro (Landscapers, cleaners, pet grooming)**
*   **Required Sections:** HeaderSimple, HeroServiceFirst, StoryValueIcons, GridServiceCards, GridPackages, ConversionQuoteCTA, FooterService.

**3. Food & Catering (Food trucks, caterers)**
*   **Required Sections:** HeaderSimple, HeroFullVisual, GridPackages, GridFeaturedProducts, TrustTestimonials, ConversionQuoteCTA, FooterBasic.

**4. Artisan Market (Makers, farmers market vendors)**
*   **Required Sections:** HeaderSimple, HeroImageLeft, StorySplit, GridFeaturedProducts, TrustTestimonials, ConversionNewsletter, FooterBasic.

**5. Event & Floral (Florists, event rentals)**
*   **Required Sections:** HeaderSimple, HeroFullVisual, MediaGallery, GridCollections, TrustStats, ConversionQuoteCTA, FooterService.

---

### **OUTPUT REQUIREMENTS**
Generate a valid JSON \`EdgeRootProps\` manifest and a Puck starter content array.

1.  **Starter Copy:** Transform the "Elevator Pitch" into a high-converting Hero Headline, subheadline, and at least one "Brand Story" or "About" section block.
2.  **CTA Labels:** Generate context-aware button text (e.g., "Book a Consultation," "Shop the Collection," "Request a Custom Quote"). 
3.  **Section Stack:** Output the strict top-to-bottom array of Puck components.
4.  **Images:** For EVERY image field, provide a specific search keyword. URL format: https://loremflickr.com/1200/800/[KEYWORD]

Return valid JSON adhering exactly to the following structure:
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
  ]
}`;

    let data;

    if (geminiApiKey) {
      const { GoogleGenAI } = await import("@google/genai");
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
    
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
