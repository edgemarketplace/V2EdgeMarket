import { getCapabilities } from '../src/server/siteStore';

export const config = {
  maxDuration: 10,
};

export default async function handler(_req: any, res: any) {
  try {
    const capabilities = await getCapabilities();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      capabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error?.message || String(error),
    });
  }
}
