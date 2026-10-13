# Planora

**Planora** is an AI-assisted floor-plan and interior design application built with modern web technologies and architectural CAD principles.

> **Status & Handover Note**: See [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the active implementation status, monorepo directory map, completed phases, and verified build commands.

---

## Features

- **Project Dashboard**: Browse recent projects, filter by property type, search tags, and view pre-configured architectural templates.
- **Parametric Project Creation Wizard**:
  - Property archetype selection (Single Room, Apartment, Detached House, Commercial).
  - Length, width, ceiling height, and floor levels configuration in Imperial or Metric.
  - Room program checklist with automatic area targets and quick presets (1B1B, 2B2B, Studio).
  - Interior styles (Modern, Minimal, Classic, Industrial, Nordic) and furniture density controls.
  - Live spatial feasibility calculator with real-time CAD wireframe blueprint and gross area allocation meters.
- **Unified CAD Studio Workspace**:
  - **2D Floor Plan Canvas**: Interactive drafting board with grid snapping, outer dimension indicators, room floor plates, walls, doors with swing arcs, windows, and furniture.
  - **Synchronized 3D Viewport**: Real-time Three.js WebGL visualization with ISO, TOP, and POV camera presets, daylight/golden-hour lighting modes, and 360° orbit controls.
  - **Alternate Layout Variations**: Instant switching between candidate spatial layouts and side-by-side variation comparison dialog.
- **Layout Engine**: Pure TypeScript geometry partitioner producing geometrically valid candidate layouts.
- **Backend API**: REST API with project CRUD endpoints and parametric layout synthesis.

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies across all monorepo workspaces
npm install

# Build all packages and applications
npm run build
```

### Running Locally

```bash
# Start the web app (Vite)
npm run dev:web
# -> Open http://localhost:5173

# Start the API server
npm run dev:api
# -> Running on http://localhost:3001
```

### Verification & Testing

```bash
# Typecheck all packages
npm run typecheck

# Run unit tests
npm run test
```
