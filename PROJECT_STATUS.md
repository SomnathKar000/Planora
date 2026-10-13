# Planora — Project Status & Context Snapshot

> **Quick Context for AI Agents / New Sessions**:
> Read this file first! It provides an exact snapshot of the codebase architecture, completed phases, verified commands, active ports, and next tasks so you don't need to inspect every file individually.

---

## 1. Project Overview & Tech Stack

Planora is an AI-assisted floor-plan and interior design application enabling users to:
1. Create and configure spatial projects (room, apartment, house, commercial).
2. Enter length, width, ceiling height, and measurement units (feet / meters).
3. Specify room programs with live spatial feasibility and circulation calculations.
4. Select visual interior styles (Modern, Minimal, Classic, Industrial, Nordic) and furniture densities.
5. Generate geometrically valid candidate layouts via a deterministic 2D space partitioner.
6. Draft and inspect floor plans in an interactive 2D SVG canvas.
7. Inspect synchronized 3D layouts in real-time via Three.js (ISO, TOP, POV views, lighting modes).
8. Compare alternative layout variations side-by-side.

### Core Stack
- **Monorepo**: npm workspaces (`packages/*`, `apps/*`).
- **Frontend (`apps/web`)**: Vue 3 (Composition API `<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router, `@lucide/vue`, Three.js.
- **Backend (`apps/api`)**: Node.js, Express, CORS, Zod, tsx — **modular layered architecture** (config → middleware → modules → shared).
- **Domain (`packages/domain`)**: Pure TypeScript entities and geometry utilities (zero external framework dependencies).
- **Layout Engine (`packages/layout-engine`)**: Parametric 2D space partitioner, wall generator, openings, and furniture placement.
- **Shared Contracts (`packages/shared-types`)**: Zod validation schemas and shared API contracts.
- **Test Runner**: Vitest (100% passing across geometry & layout engine).

---

## 2. Implementation Progress & Phase Status

| Phase | Description | Status | Key Components / Endpoints |
|---|---|---|---|
| **Phase 1** | Monorepo setup, design system tokens, routing, dashboard | ✅ **Complete** | `ProjectsView.vue`, `ProjectCard.vue`, `AppNavbar.vue`, `StatsBar.vue` |
| **Phase 2** | Parametric project creation wizard & feasibility model | ✅ **Complete** | `NewProjectView.vue`, `ArchetypeSelector.vue`, `DimensionsInput.vue`, `RoomProgramConfig.vue`, `StylePicker.vue`, `SpatialFeasibilityCard.vue` |
| **Phase 3** | Main CAD Studio workspace (2D SVG + 3D Three.js + Variations) | ✅ **Complete** | `DesignView.vue`, `FloorPlanCanvas.vue`, `ThreeViewport.vue`, `ToolDock.vue`, `CanvasToolbar.vue`, `LayoutVariationsBar.vue`, `CompareModal.vue`, `WorkspaceLeftPanel.vue` |
| **Phase 4** | Layout Engine & REST API Backend | ✅ **Complete** | `@planora/layout-engine` (`generator.ts`), `@planora/api` (modular: routes → controller → service → repository), Vitest unit tests |
| **Phase 4.5** | Backend Modular Refactor | ✅ **Complete** | Refactored monolithic `index.ts` into modular layered architecture (see §3 below) |
| **Phase 5** | Database Persistence (Prisma + PostgreSQL) | ⏳ **Next** | `prisma/schema.prisma`, Docker Compose setup, database migrations |
| **Phase 6** | High-Res Export (PDF, PNG, SVG) & Advanced Undo/Redo commands | ⏳ Planned | Vector PDF export, image renderer, command pattern history |
| **Phase 7** | Staging & AI Inpainting / Style Transfer integration | ⏳ Planned | External AI renderer / image generation pipelines |

---

## 3. Directory Map & Where Things Live

```
planora/
├── apps/
│   ├── web/                               # Vue 3 Frontend (Port: 5173)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/             # ProjectCard.vue, StatsBar.vue, TemplateGallery.vue
│   │   │   │   ├── project/               # ArchetypeSelector.vue, DimensionsInput.vue,
│   │   │   │   │                          # RoomProgramConfig.vue, StylePicker.vue,
│   │   │   │   │                          # SpatialFeasibilityCard.vue
│   │   │   │   ├── editor/                # FloorPlanCanvas.vue, ToolDock.vue, CanvasToolbar.vue,
│   │   │   │   │                          # LayoutVariationsBar.vue, CompareModal.vue,
│   │   │   │   │                          # WorkspaceLeftPanel.vue
│   │   │   │   ├── viewer/                # ThreeViewport.vue (Three.js WebGL canvas)
│   │   │   │   └── layout/                # AppNavbar.vue
│   │   │   ├── views/
│   │   │   │   ├── ProjectsView.vue       # Route: /projects (Dashboard)
│   │   │   │   ├── NewProjectView.vue     # Route: /projects/new (Wizard)
│   │   │   │   ├── DesignView.vue         # Route: /design/:projectId (CAD Studio)
│   │   │   │   ├── SavedView.vue          # Route: /saved
│   │   │   │   └── SettingsView.vue       # Route: /settings
│   │   │   ├── stores/
│   │   │   │   └── projects.ts            # Pinia store with seed data, CRUD, filter/sort
│   │   │   ├── styles/main.css            # Tailwind + Design System variables & fonts
│   │   │   └── router/index.ts            # Vue Router definitions
│   └── api/                               # Express REST API (Port: 3001)
│       └── src/
│           ├── index.ts                   # Server entry point (thin bootstrap)
│           ├── app.ts                     # Express app factory (middleware, route wiring, DI)
│           ├── config/
│           │   └── index.ts               # Centralized runtime config (port, cors, etc.)
│           ├── middleware/
│           │   ├── async-handler.ts       # Promise rejection → error middleware bridge
│           │   ├── error-handler.ts       # Global error handler (AppError → JSON)
│           │   ├── request-logger.ts      # Request method/path/status/duration logger
│           │   ├── validate.ts            # Zod schema validation middleware factory
│           │   └── index.ts               # Barrel export
│           ├── modules/
│           │   ├── health/
│           │   │   └── index.ts           # GET /api/health
│           │   └── projects/
│           │       ├── project.repository.ts  # IProjectRepository interface + InMemoryImpl
│           │       ├── project.service.ts     # Business logic (CRUD, layout generation)
│           │       ├── project.controller.ts  # Thin HTTP→Service bridge
│           │       ├── project.routes.ts      # Route registration with validation middleware
│           │       └── index.ts               # Barrel export
│           ├── seed/
│           │   └── index.ts               # Demo data seeder (dev mode)
│           └── shared/
│               ├── errors.ts              # AppError, NotFoundError, ValidationError, ConflictError
│               ├── response.ts            # sendSuccess, sendPaginated, sendError helpers
│               └── index.ts               # Barrel export
├── packages/
│   ├── domain/                            # Canonical data model
│   │   ├── src/entities.ts                # Project, Layout, Room, Wall, Opening, Furniture
│   │   ├── src/enums.ts                   # ProjectType, RoomType, DesignStyle, WallType, etc.
│   │   ├── src/geometry.ts                # Point2D, Rect, mm conversions, Shoelace formula
│   │   └── src/geometry.test.ts           # Vitest unit test suite (Passing)
│   ├── layout-engine/                     # Geometry generation & validation
│   │   ├── src/generator.ts               # Space partitioner, wall, opening, furniture generator
│   │   └── src/generator.test.ts          # Vitest unit test suite (Passing)
│   └── shared-types/                      # Validation & API contracts
│       └── src/schemas.ts                 # Zod schemas (CreateProject, UpdateProject, etc.)
├── stitch-ui/                             # UI reference source of truth from Stitch
├── docs/
│   └── architecture.md                    # Core architecture design decisions & coordinates
├── PROJECT_STATUS.md                      # THIS FILE
└── README.md
```

---

## 4. Backend Architecture (Post-Refactor)

The API follows a **modular layered architecture** pattern:

```
Request → Middleware (logger, cors, json, validate) → Routes → Controller → Service → Repository
                                                                                        ↕
                                                                              In-Memory Map (swap to DB later)
```

**Key Design Decisions:**
1. **App Factory Pattern** (`app.ts`): Creates and wires everything, returns the Express app. Testable independently without starting a server.
2. **Interface-Based Repository** (`IProjectRepository`): Abstracts storage so swapping InMemory → Prisma/Postgres requires only a new implementation, no service or controller changes.
3. **Typed Error Hierarchy** (`AppError`, `NotFoundError`, `ValidationError`, `ConflictError`): Services throw typed errors; the global error handler renders structured JSON responses.
4. **Reusable Validation Middleware** (`validate(schema)`): Controllers receive pre-validated, pre-parsed data — no manual `safeParse` calls.
5. **Async Handler Wrapper**: Catches Promise rejections from async controllers and forwards them to the error middleware — no try/catch boilerplate.

---

## 5. Key Architectural Rules

1. **Internal Geometry in Millimeters**:
   - All spatial dimensions in memory and backend are integer millimeters.
   - Display values (feet, meters) are strictly formatted at UI boundaries using `toMillimeters` and `fromMillimeters` from `@planora/domain`.
2. **Canonical Data Model**:
   - A single `Layout` object is the source of truth for both 2D SVG canvas and 3D Three.js viewport.
   - Room boundaries, structural walls, doors/windows, and furniture objects are synchronized.
3. **No Framework Dependencies in Core Packages**:
   - `@planora/domain` and `@planora/layout-engine` must never import Vue, React, Express, or Three.js.
4. **Three.js Resource Management**:
   - Any Three.js scene must properly call `renderer.dispose()` and cancel `requestAnimationFrame` on unmount to avoid WebGL context leaks (handled in `ThreeViewport.vue`).

---

## 6. Verified Development Commands

Run from the monorepo root:

```bash
# 1. Start Frontend Dev Server (Vite) -> http://localhost:5173
npm run dev:web

# 2. Start Backend API Dev Server (tsx) -> http://localhost:3001
npm run dev:api

# 3. Build All Packages & Applications (Clean 0-error build)
npm run build

# 4. Run TypeScript Check Across All Workspaces
npm run typecheck

# 5. Run Unit Tests (Vitest)
npm run test
```

---

## 7. Next Steps for Upcoming Sessions

1. **Database Integration**:
   - Add Prisma schema in `prisma/schema.prisma` matching `@planora/domain` entities.
   - Implement `PrismaProjectRepository` that implements `IProjectRepository`.
   - Connect PostgreSQL database in `apps/api` with fallback to in-memory/SQLite.
2. **Advanced 2D Editing Tools**:
   - Implement interactive wall dragging / room dimension resizing on the 2D SVG canvas.
   - Add drag-and-drop furniture placement from a furniture palette.
3. **High-Res Blueprint Export**:
   - Export 2D layout as printable vector SVG / PDF blueprint with title block and scale bar.
   - Export 3D viewport canvas screenshot to high-res PNG.
