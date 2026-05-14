import { generatePageManifest } from '../src/server/generatePageManifest';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('Generate Page Request Received');
  console.log('Keys check:', {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGemini: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV
  });

  try {
    const data = await generatePageManifest(req.body);
    console.log('Generate Page Success');
    res.status(200).json(data);
  } catch (error) {
    console.error('Generate Page Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
}
