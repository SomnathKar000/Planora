// ────────────────────────────────────────────────────────────────
// Planora API — Express App Factory
// ────────────────────────────────────────────────────────────────
// Creates and configures the Express application.
// Separated from server entry so the app can be imported
// independently for integration testing.
// ────────────────────────────────────────────────────────────────

import express, { Router } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler, requestLogger } from './middleware/index.js';
import { registerHealthRoutes } from './modules/health/index.js';
import {
  InMemoryProjectRepository,
  ProjectService,
  ProjectController,
  registerProjectRoutes,
} from './modules/projects/index.js';
import { PrismaProjectRepository } from './modules/projects/project.repository.prisma.js';
import { prisma } from './lib/prisma.js';

export function createApp() {
  const app = express();

  // ── Global Middleware ────────────────────────────────────────
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());
  app.use(requestLogger);

  // ── Dependency Wiring ───────────────────────────────────────
  // Use Prisma when DATABASE_URL is set, fallback to in-memory
  const usePrisma = Boolean(config.databaseUrl);
  const projectRepo = usePrisma
    ? new PrismaProjectRepository(prisma)
    : new InMemoryProjectRepository();

  const projectService = new ProjectService(projectRepo);
  const projectController = new ProjectController(projectService);

  if (usePrisma) {
    console.log('📦 Using PostgreSQL (Prisma) storage');
  } else {
    console.log('💾 Using in-memory storage (no DATABASE_URL set)');
  }

  // ── Route Registration ──────────────────────────────────────
  const apiRouter = Router();

  // Health
  registerHealthRoutes(apiRouter);

  // Projects
  const projectRouter = Router();
  registerProjectRoutes(projectRouter, projectController);
  apiRouter.use('/projects', projectRouter);

  // Mount all API routes under /api prefix
  app.use(config.api.prefix, apiRouter);

  // ── Error Handling (must be last) ───────────────────────────
  app.use(errorHandler);

  return { app, projectRepo, projectService };
}
