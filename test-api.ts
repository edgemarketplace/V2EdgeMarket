import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function test() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: `You MUST return ONLY a valid JSON object matching this structure:
{ "content": [ { "type": "HeroSection", "props": { "id": "1", "image": "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200&auto=format&fit=crop" } } ] }` }],
    response_format: { type: "json_object" }
  });
  console.log(response.choices[0].message.content);
}
test();
