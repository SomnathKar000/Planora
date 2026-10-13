// ────────────────────────────────────────────────────────────────
// Planora API — Configuration
// ────────────────────────────────────────────────────────────────

export const config = {
  port: Number(process.env.API_PORT ?? 3001),
  env: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
  api: {
    prefix: '/api',
    version: '0.1.0',
  },
  layout: {
    defaultCandidateCount: 3,
    maxCandidateCount: 10,
  },
  ai: {
    replicateApiToken: process.env.REPLICATE_API_TOKEN,
    stagingModel: process.env.STAGING_AI_MODEL ?? 'black-forest-labs/flux-fill-pro',
    maxRequestsPerHour: Number(process.env.MAX_STAGING_REQUESTS_PER_HOUR ?? 20),
    maxImageUploadBytes: Number(process.env.MAX_IMAGE_UPLOAD_BYTES ?? 10 * 1024 * 1024),
  },
} as const;

export type Config = typeof config;
