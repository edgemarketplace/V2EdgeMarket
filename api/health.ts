export const config = {
  maxDuration: 10,
};

export default async function handler(_req, res) {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      capabilities: {
        hasSupabase: !!process.env.SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error?.message || String(error),
    });
  }
}
