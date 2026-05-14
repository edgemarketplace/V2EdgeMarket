import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 60, // Increase timeout to 60 seconds
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log('Keys diagnostics:', {
    hasOpenAI: !!openaiApiKey,
    hasGemini: !!geminiApiKey,
    openaiPrefix: openaiApiKey ? openaiApiKey.substring(0, 7) : 'none'
  });

  if (!openaiApiKey && !geminiApiKey) {
    return res.status(500).json({ error: 'No AI API keys found in environment variables.' });
  }

  try {
    const intake = req.body;
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
Influence the visual style based on:
- **Minimalist**: minimal stylePreset.
- **Luxury**: milano stylePreset.
- **Bold**: High-impact.
- **Dark Mode**: Dark accents.

---

### **OUTPUT REQUIREMENTS**
Generate a JSON object where keys are "home", "about", "products", "contact" and values are Puck data objects.
Every "Header" component MUST have navLinks pointing to other pages.

{
  "home": { "content": [...], "root": { "props": { "title": "...", "theme": { "stylePreset": "..." } } } },
  "about": { "content": [...], "root": { "props": { "title": "..." } } },
  "products": { "content": [...], "root": { "props": { "title": "..." } } },
  "contact": { "content": [...], "root": { "props": { "title": "..." } } }
}`;

    let data;

    if (geminiApiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      data = JSON.parse(result.text || '{}');
    } else {
      const openai = new OpenAI({ apiKey: openaiApiKey! });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      data = JSON.parse(response.choices[0].message.content || '{}');
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Final Generate Page Error:', error);
    res.status(500).json({ 
      error: error.message || 'Unknown error during generation',
      details: error.toString()
    });
  }
}
