// Phase 4 diagnostic: minimal cron runtime ownership probe
// Goal: prove function execution in Vercel without external import graph.

export const config = {
  runtime: 'nodejs',
};

export default async function handler(_req: any, res: any) {
  res.setHeader('x-cron-probe', 'true');

  return res.status(200).json({
    ok: true,
    probe: 'cron-minimal',
    timestamp: new Date().toISOString(),
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION || 'unknown',
    },
    envPresence: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    },
  });
}
