export const config = {
  maxDuration: 10,
};

export default async function handler(_req: any, res: any) {
  try {
    // Simplified: return basic health without importing siteStore
    // TODO: re-add getCapabilities() once module import is fixed
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      capabilities: {
        hasSupabase: !!process.env.SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error?.message || String(error),
    });
  }
}
