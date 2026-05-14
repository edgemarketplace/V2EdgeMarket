import { generatePageManifest } from '../src/server/generatePageManifest';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = await generatePageManifest(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error('Generate Page Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
