---
name: Planora Design Studio
colors:
  surface: '#f9f9ff'
  surface-dim: '#d1daf4'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2fc'
  on-surface: '#121b2e'
  on-surface-variant: '#424655'
  inverse-surface: '#273044'
  inverse-on-surface: '#edf0ff'
  outline: '#737687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d8'
  primary: '#0052d6'
  on-primary: '#ffffff'
  primary-container: '#246bfd'
  on-primary-container: '#fffeff'
  inverse-primary: '#b3c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#00638e'
  on-tertiary: '#ffffff'
  tertiary-container: '#007db2'
  on-tertiary-container: '#fffeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00174a'
  on-primary-fixed-variant: '#003ea6'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f9f9ff'
  on-background: '#121b2e'
  surface-variant: '#d9e2fc'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies the precision, clarity, and tactile calm of a modern macOS utility tailored for architectural spatial planning and AI-assisted interior design. The aesthetic bridges technical CAD rigor with the effortless simplicity of consumer creative software. 

The visual style is **Corporate / Modern** inflected with **Subtle Tactility**:
- **Clarity over ornamentation:** Interfaces recede behind high-fidelity 2D plans and photorealistic 3D spatial renders.
- **Precision drafting language:** Hairline dividers, crisp architectural dimension tick marks, and subtle mechanical alignment indicators lend the UI an authentic engineering feel.
- **macOS Native Fluency:** Soft pill-capsules, segmented controls with discrete recess styling, subtle border contrasts, and crisp visual feedback emulate top-tier desktop creative workstations.
- **Target Audience:** Architects, interior designers, real estate staging professionals, and homeowners seeking instant, mathematically grounded spatial layout generation.

## Colors

The palette is tuned for high structural legibility and minimal eye fatigue during extended drafting sessions:

- **Canvas & Surface System:**
  - `Surface Root / Canvas`: `#F8FAFC` (Cool slate-tinted canvas backdrop).
  - `Surface Card / Panel`: `#FFFFFF` (Pure crisp white workspace containers and toolbars).
  - `Surface Subtle`: `#F1F5F9` (Nested secondary blocks, active chips, and input wells).
  - `Surface Highlight`: `#EFF6FF` (Subtle electric blue tint for selected rows and toggles).

- **Brand & Accent:**
  - `Primary Electric Blue`: `#246BFD` (Primary action triggers, active tabs, selected states, and AI generation affordances).
  - `Primary Hover`: `#1D4ED8` (Deepened blue for click states).
  - `Secondary Accent`: `#0EA5E9` (Measurement dimensions, snaps, and spatial guide highlights).

- **Typography & Structural Contrast:**
  - `Content Primary`: `#172033` (Deep rich navy-slate for primary titles, labels, and core dimension figures).
  - `Content Secondary`: `#64748B` (Neutral slate for secondary labels, measurement units, and metadata).
  - `Content Tertiary / Muted`: `#94A3B8` (Placeholders and disabled states).

- **Borders & Dividers:**
  - `Border Hairline`: `#E8EDF4` (Panel dividers, container edges, input borders).
  - `Border Structural`: `#E2E8F0` (Card outlines and segmented toggle containers).
  - `Border Active`: `#246BFD` (Focus rings and active thumbnail selections).

## Typography

The typography scale utilizes **Plus Jakarta Sans** (with fallback to Apple System SF Pro Display/Text in native runtimes). The geometric structure combined with refined humanist curves delivers exceptional clarity across dense CAD parameter panels, step lists, and architectural floor annotations.

- **Drafting Numbers & Measurements:** Numeric coordinates, room square footage (`12 x 16 ft`), and dimension rulers utilize tabular figures (`font-variant-numeric: tabular-nums`) to ensure precision alignment across tables, inspector fields, and canvas overlays.
- **Section Headers:** Set at `headline-md` (18px, 600 weight) with clear numerical prefixes (e.g., `1. Enter Space Details`) for guided workflows.
- **Labels & Micro-Labels:** Kept crisp at 12–13px with medium-to-semibold weights to maintain instant legibility against neutral backgrounds.

## Layout & Spacing

The layout is anchored to a disciplined **8px base grid** (with an auxiliary 4px sub-grid for icons and compact micro-controls).

- **Multi-Pane Workspace Structure:**
  - **Left Rail (Inspector / Generator Controls):** Fixed width of `340px` to `380px` containing step-by-step room configuration inputs, parametric toggles, and primary CTA triggers.
  - **Center Canvas (Active CAD Viewport):** Fluid container stretching to occupy remaining center space. Hosts dynamic 2D drafting views, floating canvas toolbars, and contextual zoom/pan triggers.
  - **Right Rail (Perspective & Inspiration Dock):** Fixed width of `360px` to `420px` presenting real-time synchronized 3D previews, alternate architectural presets, and material style pickers.

- **Responsive Adaptations:**
  - **Desktop (>= 1280px):** 3-column synchronous layout with persistent floating HUD tools.
  - **Tablet (768px - 1279px):** 2-column layout; the right 3D dock transitions into an expandable bottom drawer or tabbed split view.
  - **Mobile (< 768px):** Single-column stacked mode with segmented view controls toggling between "Setup", "2D Plan", and "3D View".

## Elevation & Depth

Visual depth is achieved through refined tonal separation, macOS-style ambient light scattering, and crisp hairline perimeter definition:

- **Level 0 (App Canvas Base):** `#F8FAFC`. Completely flat backdrop providing gentle contrast behind pure white panels.
- **Level 1 (Structural Workspace Panels):** Surface `#FFFFFF`, bounded by a `1px solid #E8EDF4` hairline outline. Shadow: `0 1px 3px rgba(23, 32, 51, 0.04), 0 1px 2px rgba(23, 32, 51, 0.02)`.
- **Level 2 (Floating Canvas Toolbars & Modal Menus):** Floating top toolbars and bottom dock tools use pure white with higher dispersion shadows: `0 8px 24px -4px rgba(23, 32, 51, 0.08), 0 2px 6px -1px rgba(23, 32, 51, 0.04)`, surrounded by `1px solid rgba(232, 237, 244, 0.9)`.
- **Level 3 (Popovers, Modals & Drag Previews):** `0 16px 36px -6px rgba(23, 32, 51, 0.12), 0 4px 12px -2px rgba(23, 32, 51, 0.06)`.
- **Active Focus Rings:** Clean macOS-style dual rings: `0 0 0 2px #FFFFFF, 0 0 0 4px #246BFD`.

## Shapes

The geometric personality features **Level 2 (Rounded)** corners, offering a friendly, modern feel that stays sharp enough for professional architectural software:

- **Standard Cards & Workspace Panes:** `16px` border-radius (`rounded-xl` in this scale).
- **Interactive Buttons & Input Fields:** `8px` to `10px` border-radius (`rounded-md` / `rounded-lg`).
- **Segmented Control Containers:** `10px` outer wrapper radius with `8px` inner pill tabs.
- **Pill Badges & Dimension Markers:** Fully rounded `9999px` caps for tags, room count counters, and measurement badges.
- **Thumbnail Previews & Style Swatches:** `12px` border-radius with nested inner media masks.

## Components

### Buttons & Interactive Controls
- **Primary Action (Generate Design):** Full-width or emphasized `#246BFD` solid fill, white text, 10px corner radius, height 44px, accompanied by leading vector icons (e.g., sparkle AI wand). Subtle inset glow on hover (`#1D4ED8`).
- **Secondary / Action Tool Buttons:** White background with `#E2E8F0` border, text `#172033`. Hover: `#F8FAFC`.
- **Segmented Control (Room / Apartment / House & 2D / 3D / Walkthrough):** Container has `#F1F5F9` background with 4px inner padding. The active segment is pure white (`#FFFFFF`) with a subtle `0 1px 3px rgba(0,0,0,0.06)` shadow and `#246BFD` label tint. Inactive items use `#64748B` with hover color `#172033`.

### Architectural HUD & Canvas Dock
- **Floating Drafting Dock (Add Wall, Door, Window, Furniture, Annotate):** Positioned bottom-center with floating pill styling, 16px radius, background `#FFFFFF`, bordered with `#E8EDF4`. Vertical layout for each tool icon (20px stroke) paired with `caption-xs` labels. Hover state applies an `#EFF6FF` background with `#246BFD` icon tint.
- **Dimension Tick Markers:** Center-aligned numeric label in `#172033` flanked by hairline arrows (`#64748B`) pointing outward to cad guidelines.

### Form Fields & Inputs
- **Measurement Inputs (Length, Width, Height):** Surface `#FFFFFF`, border `1px solid #E2E8F0`, height 40px, rounded 8px. Text `#172033`, font size 14px. Focus state transitions border to `#246BFD` with standard macOS halo.
- **Select / Dropdowns (Unit: Feet/Meters):** Clean chevron-down indicator, `#64748B` secondary text.

### Draggable List Items (Room Manager)
- **Room Rows:** Background `#FFFFFF`, border `1px solid #E8EDF4`, corner radius 12px, padding 10px 14px. Contains a 6-dot reorder drag handle (`#94A3B8`), room category icon (Bed, Bath, Kitchen) inside a soft blue circle, room title (`title-sm`), dimension subtext (`#64748B`), and a dismiss `x` icon.

### Style Cards & Swatches
- **Style Selector Cards (Modern, Minimal, Classic, Industrial):** 4-column thumbnail grid with 10px rounded preview image, active state wrapped in `2px solid #246BFD` border with subtle scaling.
- **Color Theme Palette Swatches:** 24px diameter circles showcasing interior material accents (Cream `#EAE3D2`, Warm Oak `#A88B68`, Sage `#7E9A82`, Slate `#587B95`, Deep Navy `#222933`). Selected swatch features a concentric white spacer and `#246BFD` outer ring.