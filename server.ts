import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: "ok", database: "connected" });
    } catch (err) {
      res.json({ status: "ok", database: "disconnected", error: String(err) });
    }
  });

  app.post("/api/generate-page", async (req, res) => {
    try {
      const intake = req.body;
      const apiKey = process.env.OPENAI_API_KEY || "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";
      
      const openai = new OpenAI({ apiKey });
      
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
*   **Business Name:** ${intake.businessName}
*   **Category (Template Family):** ${intake.businessType}
*   **The Elevator Pitch:** ${intake.offerings}
*   **Primary Goal (Commerce Mode):** ${intake.primaryGoal}
*   **Contact Email:** ${intake.contactEmail}
*   **Tone & Vibe:** ${intake.tone || "Professional and high quality"}
*   **Brand Color:** ${intake.brandColor || "#000000"}

---

### **DESIGN & STYLING MATRIX**
*Based on the User Intake Variables above, select the exact stylePreset, layout tone, and section blocks:*

**1. Retail Core (Boutiques, shops)**
*   **If Primary Goal is Direct Checkout:** Use the \`modern-commerce\` or \`boutique-luxury\` style preset.
*   **Design Tone:** Minimal luxury, generous whitespace, strong editorial product framing. 
*   **Required Sections:** HeaderPromo, HeaderSimple, HeroProductFirst, GridFeaturedProducts, GridCollections, FooterCommerce.

**2. Service Pro (Landscapers, cleaners, pet grooming)**
*   **If Primary Goal is Booking or Quotes:** Use the \`professional-agency\` or \`service-first\` style preset.
*   **Design Tone:** Trustworthy, functional, high-contrast CTA moments.
*   **Required Sections:** HeaderSimple, HeroServiceFirst, StoryValueIcons, GridServiceCards, GridPackages, ConversionQuoteCTA, FooterService.

**3. Food & Catering (Food trucks, caterers)**
*   **If Primary Goal is Direct Checkout or Booking:** Use the \`organic\` or \`boutique\` style preset.
*   **Design Tone:** Warm, inviting, appetite-focused visuals with clear menu/package pricing.
*   **Required Sections:** HeaderSimple, HeroFullVisual, GridPackages, GridFeaturedProducts, TrustTestimonials, ConversionQuoteCTA, FooterBasic.

**4. Artisan Market (Makers, farmers market vendors)**
*   **If Primary Goal is Direct Checkout or Custom Order:** Use the \`creative-studio\` or \`editorial\` style preset.
*   **Design Tone:** Warm, textured, storytelling-led, highlighting craftsmanship.
*   **Required Sections:** HeaderSimple, HeroImageLeft, StorySplit, GridFeaturedProducts, TrustTestimonials, ConversionNewsletter, FooterBasic.

**5. Event & Floral (Florists, event rentals)**
*   **If Primary Goal is Quote Generation or Booking:** Use the \`boutique-luxury\` or \`editorial\` style preset.
*   **Design Tone:** Elegant, romantic, premium gallery-led selling.
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
        "items": [{ "title": "string", "description": "string", "image": "string" }],
        "images": [{ "image": "string" }],
        "questions": [{ "q": "string", "a": "string" }]
      }
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const data = JSON.parse(response.choices[0].message.content || "{}");
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
