# Planora — Architecture Documentation

## Overview

Planora is an AI-assisted floor-plan and interior design application. It enables users to create spatial projects, define room programs, generate geometrically valid candidate layouts, and visualize them in synchronized 2D/3D views.

## Architecture

### Monorepo Structure

```
planora/
├── apps/web/        Vue 3 + Vite frontend
├── apps/api/        Express + TypeScript API
├── packages/
│   ├── domain/          Core entities and geometry (framework-independent)
│   ├── layout-engine/   Deterministic layout generation and validation
│   └── shared-types/    Zod schemas and API contracts
├── prisma/              Database schema (Phase 6)
└── docs/                This documentation
```

### Design Decisions

1. **Internal Millimeters**: All geometry is stored in integer millimeters. Display units (feet, meters, cm) are purely for UI presentation. This prevents floating-point drift and unit-mixing bugs.

2. **Canonical Data Model**: A single `Layout` type is the source of truth. Both the 2D editor and 3D viewer read from and write to this model. Changes are atomic.

3. **Domain Independence**: The `@planora/domain` and `@planora/layout-engine` packages have zero framework dependencies. They can be used in the API, the frontend, or in tests without importing Vue, Express, or Three.js.

4. **Greedy Strip-Packing**: The MVP layout generator uses a greedy strip-packing heuristic for rectangular rooms. It's deterministic and fast. AI-assisted ranking can be layered on top without bypassing geometric validation.

5. **Command-Based Editor**: The 2D editor will use a command pattern for all geometry changes, enabling undo/redo that restores actual geometry, not just visual state.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `API_PORT` | `3001` | API server port |
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Frontend API endpoint |

## Database Setup

Phase 6 will introduce PostgreSQL via Docker Compose:

```bash
docker-compose up -d postgres
npx prisma migrate dev
```

## Coordinate System

- Origin: top-left corner of the plot boundary
- X-axis: increases rightward (length)
- Y-axis: increases downward (width)
- Z-axis: increases upward (height) — used only in 3D
- Unit: millimeters (integers)

## Phase Plan

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup, types, design system, dashboard, routing | ✅ Complete |
| 2 | Project creation wizard, room configuration, validation, feasibility model | ✅ Complete |
| 3 | Main CAD Studio workspace, 2D SVG canvas, Three.js 3D viewport, variations | ✅ Complete |
| 4 | Layout engine generator, REST API endpoints, Vitest test suites | ✅ Complete |
| 5 | Database persistence, PostgreSQL, Prisma models | ⏳ Next |
| 6 | Export (PDF/PNG), command-based undo/redo, responsive polish | ⏳ Planned |
| 7 | AI inpainting, texture/material staging, integration tests | ⏳ Planned |

> For comprehensive component mappings, file paths, and handover instructions, refer to [`PROJECT_STATUS.md`](../PROJECT_STATUS.md).
