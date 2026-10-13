// ────────────────────────────────────────────────────────────────
// Planora API — Server Entry Point
// ────────────────────────────────────────────────────────────────
// This file only boots the server. All app configuration lives
// in app.ts so it can be imported independently for testing.
// ────────────────────────────────────────────────────────────────

import { createApp } from './app.js';
import { config } from './config/index.js';

const { app } = createApp();

app.listen(config.port, () => {
  console.log(`🏗️  Planora API running on http://localhost:${config.port}`);
  console.log(`   Health: http://localhost:${config.port}/api/health`);
  console.log(`   Projects: http://localhost:${config.port}/api/projects`);
});
