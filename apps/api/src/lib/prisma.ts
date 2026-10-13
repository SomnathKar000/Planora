// ────────────────────────────────────────────────────────────────
// Planora API — Prisma Client Singleton
// ────────────────────────────────────────────────────────────────
// Ensures a single PrismaClient instance is reused across the app
// and prevents connection pool exhaustion during hot-reloading.
// ────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
