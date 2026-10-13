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
} as const;

export type Config = typeof config;
