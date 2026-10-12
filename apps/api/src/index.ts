import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Placeholder routes (Phase 6) ─────────────────────────
app.get('/api/projects', (_req, res) => {
  res.json({ success: true, data: { items: [], total: 0, page: 1, pageSize: 20 } });
});

app.listen(PORT, () => {
  console.log(`🏗️  Planora API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
