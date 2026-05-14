import { Router } from "express";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
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

    const prompt = `**System Prompt: Edge Marketplace Hub — AI Multi-Page Architect**

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
    
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/edit-page", async (req, res) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      return res.status(500).json({ error: "Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured." });
    }

    const { currentData, instruction, businessDetails } = req.body;
    
    const prompt = `**System Prompt: Edge Marketplace Hub — AI Design Partner**

You are an expert AI Design Partner for the Edge Marketplace Hub. You are helping a user edit their existing website built with the Puck Editor.

**USER INSTRUCTION:**
"${instruction}"

**CURRENT SITE DATA (Puck JSON):**
${JSON.stringify(currentData)}

**BUSINESS CONTEXT:**
- Name: ${businessDetails.name}
- Type: ${businessDetails.businessType}
- Description: ${businessDetails.offerings}

---

**YOUR TASK:**
1. Analyze the user's instruction and the current site data.
2. Modify the Puck JSON content to fulfill the request.
3. You can:
   - Change text/copy (headings, subheadings, labels).
   - Change images (use Unsplash URLs if applicable).
   - Add new components from the approved list (Header, Hero, Grid, Story, Trust, Media, Conversion, Footer).
   - Reorder or remove components.
   - Adjust theme settings in the root (primaryColor, stylePreset).
4. **CRITICAL**: Return the FULL updated Puck JSON object. Do not return partial updates.
5. Maintain the "Milano" design aesthetic unless asked otherwise.

---

**OUTPUT REQUIREMENTS:**
Generate ONLY a valid JSON object. No markdown wrappers.

{
  "content": [ ... ],
  "root": { ... }
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
    
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

