const BUILD_TIME = new Date().toISOString();

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

export default async function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    runtime: {
      node: process.version,
      env: process.env.NODE_ENV || 'unknown',
      vercelRegion: process.env.VERCEL_REGION || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelUrl: process.env.VERCEL_URL || null,
    },
    build: {
      buildTime: BUILD_TIME,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      commitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
      commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
    },
    capabilities: {
      supabaseUrl: envPresent('SUPABASE_URL') || envPresent('VITE_SUPABASE_URL'),
      supabaseServiceRoleKey: envPresent('SUPABASE_SERVICE_ROLE_KEY'),
      medusaBackendUrl: envPresent('MEDUSA_BACKEND_URL'),
      medusaAdminToken: envPresent('MEDUSA_ADMIN_TOKEN'),
      deploymentWebhookSecret: envPresent('DEPLOYMENT_WEBHOOK_SECRET'),
      openaiApiKey: envPresent('OPENAI_API_KEY'),
      geminiApiKey: envPresent('GEMINI_API_KEY'),
    },
  });
}
