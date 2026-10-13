// ────────────────────────────────────────────────────────────────
// Planora CAD — High-Resolution Blueprint & Vector Export Utilities
// ────────────────────────────────────────────────────────────────

import { jsPDF } from 'jspdf';
import type { Project, Layout } from '@planora/domain';
import { MeasurementUnit, fromMillimeters } from '@planora/domain';

export type ExportTheme = 'blueprint' | 'clean';

export interface ExportOptions {
  theme?: ExportTheme;
  includeFurniture?: boolean;
  includeDimensions?: boolean;
  includeSchedule?: boolean;
}

/**
 * Formats millimeter length to display unit string.
 */
function formatDim(mm: number, unit: MeasurementUnit): string {
  const val = Math.round(fromMillimeters(mm, unit) * 10) / 10;
  return `${val} ${unit === MeasurementUnit.Feet ? 'ft' : 'm'}`;
}

/**
 * Calculates display area string from square millimeters.
 */
function formatArea(sqMm: number, unit: MeasurementUnit): string {
  const factor = unit === MeasurementUnit.Feet ? 0.0000107639 : 0.000001;
  const area = Math.round(sqMm * factor);
  return `${area} ${unit === MeasurementUnit.Feet ? 'sq ft' : 'm²'}`;
}

// ────────────────────────────────────────────────────────────────
// 1. Standalone Vector SVG Blueprint Export
// ────────────────────────────────────────────────────────────────

export function generateBlueprintSvg(
  project: Project,
  layout: Layout,
  options: ExportOptions = {}
): string {
  const {
    theme = 'clean',
    includeFurniture = true,
    includeDimensions = true,
  } = options;

  const isBlueprint = theme === 'blueprint';
  const bgColor = isBlueprint ? '#0D1B2A' : '#FFFFFF';
  const wallExterior = isBlueprint ? '#E0E1DD' : '#111827';
  const wallInterior = isBlueprint ? '#778DA9' : '#374151';
  const roomFill = isBlueprint ? '#1B263B' : '#F9FAFB';
  const textColor = isBlueprint ? '#E0E1DD' : '#1F2937';
  const dimColor = isBlueprint ? '#415A77' : '#6B7280';
  const gridColor = isBlueprint ? '#1B263B' : '#E5E7EB';

  const W = layout.boundary.width;
  const H = layout.boundary.height;

  // ViewBox with margin for title block and dimension arrows
  const margin = 1200; // mm
  const vbW = W + margin * 2;
  const vbH = H + margin * 2 + 1000; // extra space for title block

  const roomsSvg = layout.rooms
    .map((r) => {
      const x = r.boundary.x + margin;
      const y = r.boundary.y + margin;
      const w = r.boundary.width;
      const h = r.boundary.height;
      const labelX = x + w / 2;
      const labelY = y + h / 2;

      return `
      <g id="room-${r.id}">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${roomFill}" stroke="${gridColor}" stroke-width="20" />
        <text x="${labelX}" y="${labelY - 50}" fill="${textColor}" font-family="Helvetica, Arial, sans-serif" font-size="160" font-weight="bold" text-anchor="middle">${r.name}</text>
        <text x="${labelX}" y="${labelY + 120}" fill="${dimColor}" font-family="Helvetica, Arial, sans-serif" font-size="110" font-weight="500" text-anchor="middle">${formatDim(w, project.unit)} × ${formatDim(h, project.unit)} (${formatArea(r.areaSqMm, project.unit)})</text>
      </g>`;
    })
    .join('\n');

  const wallsSvg = layout.walls
    .map((w) => {
      const isExt = w.type === 'exterior';
      const stroke = isExt ? wallExterior : wallInterior;
      const sw = isExt ? 180 : 120;
      return `<line x1="${w.start.x + margin}" y1="${w.start.y + margin}" x2="${w.end.x + margin}" y2="${w.end.y + margin}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="square" />`;
    })
    .join('\n');

  const furnitureSvg = includeFurniture
    ? layout.furniture
        .map((f) => {
          const fx = f.position.x + margin;
          const fy = f.position.y + margin;
          const fw = f.width;
          const fd = f.depth;
          const rot = f.rotation || 0;
          return `
      <g transform="rotate(${rot}, ${fx}, ${fy})">
        <rect x="${fx - fw / 2}" y="${fy - fd / 2}" width="${fw}" height="${fd}" rx="40" fill="${isBlueprint ? '#415A77' : '#E5E7EB'}" stroke="${isBlueprint ? '#778DA9' : '#9CA3AF'}" stroke-width="30" />
        <text x="${fx}" y="${fy + 30}" fill="${textColor}" font-family="Helvetica, Arial, sans-serif" font-size="70" text-anchor="middle">${f.name}</text>
      </g>`;
        })
        .join('\n')
    : '';

  // Dimension lines
  const dimsSvg = includeDimensions
    ? `
    <!-- Top Width Dimension -->
    <g id="dims-top" stroke="${dimColor}" stroke-width="20">
      <line x1="${margin}" y1="${margin - 400}" x2="${margin + W}" y2="${margin - 400}" />
      <line x1="${margin}" y1="${margin - 550}" x2="${margin}" y2="${margin - 250}" />
      <line x1="${margin + W}" y1="${margin - 550}" x2="${margin + W}" y2="${margin - 250}" />
      <text x="${margin + W / 2}" y="${margin - 480}" fill="${textColor}" font-family="Helvetica, Arial, sans-serif" font-size="140" font-weight="bold" text-anchor="middle">${formatDim(W, project.unit)}</text>
    </g>
    <!-- Left Height Dimension -->
    <g id="dims-left" stroke="${dimColor}" stroke-width="20">
      <line x1="${margin - 400}" y1="${margin}" x2="${margin - 400}" y2="${margin + H}" />
      <line x1="${margin - 550}" y1="${margin}" x2="${margin - 250}" y2="${margin}" />
      <line x1="${margin - 550}" y1="${margin + H}" x2="${margin - 250}" y2="${margin + H}" />
      <text x="${margin - 480}" y="${margin + H / 2}" fill="${textColor}" font-family="Helvetica, Arial, sans-serif" font-size="140" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${margin - 480}, ${margin + H / 2})">${formatDim(H, project.unit)}</text>
    </g>`
    : '';

  // Title Block in Bottom Right
  const tbX = margin + W - 3200;
  const tbY = margin + H + 250;
  const titleBlockSvg = `
  <g id="title-block" transform="translate(${Math.max(margin, tbX)}, ${tbY})">
    <rect width="3200" height="700" fill="${isBlueprint ? '#1B263B' : '#F3F4F6'}" stroke="${isBlueprint ? '#778DA9' : '#D1D5DB'}" stroke-width="20" rx="30" />
    <text x="120" y="200" fill="${textColor}" font-family="Helvetica, Arial, sans-serif" font-size="140" font-weight="bold">${project.name}</text>
    <text x="120" y="360" fill="${dimColor}" font-family="Helvetica, Arial, sans-serif" font-size="90">TYPE: ${project.type.toUpperCase()}  |  SCALE: 1:50  |  DATE: ${new Date().toISOString().slice(0, 10)}</text>
    <text x="120" y="520" fill="${dimColor}" font-family="Helvetica, Arial, sans-serif" font-size="90">ENGINE: Planora Live CAD Studio v4.3  |  STATUS: ${project.status.toUpperCase()}</text>
  </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" style="background-color: ${bgColor};">
  <defs>
    <style>
      text { user-select: none; }
    </style>
  </defs>
  <!-- Floor plan base -->
  ${roomsSvg}
  ${furnitureSvg}
  ${wallsSvg}
  ${dimsSvg}
  ${titleBlockSvg}
</svg>`;
}

// ────────────────────────────────────────────────────────────────
// 2. Client-Side Printable Architectural PDF Export (jsPDF)
// ────────────────────────────────────────────────────────────────

export async function generateBlueprintPdf(
  project: Project,
  layout: Layout,
  options: ExportOptions = {}
): Promise<void> {
  const { theme = 'clean', includeSchedule = true } = options;
  const isBlueprint = theme === 'blueprint';

  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  // Background
  if (isBlueprint) {
    doc.setFillColor(13, 27, 42); // Dark blueprint blue
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Outer Border Frame
  doc.setLineWidth(0.6);
  doc.setDrawColor(isBlueprint ? 119 : 30, isBlueprint ? 141 : 41, isBlueprint ? 169 : 59);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner Border Frame
  doc.setLineWidth(0.2);
  doc.rect(margin + 2, margin + 2, pageWidth - (margin + 2) * 2, pageHeight - (margin + 2) * 2);

  // Header Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
  doc.text('PLANORA ARCHITECTURAL BLUEPRINT', margin + 6, margin + 9);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(isBlueprint ? 160 : 100, isBlueprint ? 175 : 116, isBlueprint ? 195 : 139);
  doc.text(
    `PROJECT: ${project.name}  |  STATUS: ${project.status.toUpperCase()}  |  PRECISION CAD 1/4"`,
    margin + 6,
    margin + 14
  );

  // North Arrow Symbol (Top Right)
  const naX = pageWidth - margin - 15;
  const naY = margin + 8;
  doc.setLineWidth(0.4);
  doc.setDrawColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
  doc.line(naX, naY + 8, naX, naY);
  doc.line(naX, naY, naX - 2.5, naY + 3.5);
  doc.line(naX, naY, naX + 2.5, naY + 3.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('N', naX - 1.2, naY - 1.5);

  // Drawing Viewport Area
  const drawAreaX = margin + 6;
  const drawAreaY = margin + 20;
  const drawAreaW = 190; // mm
  const drawAreaH = 135; // mm

  const bW = layout.boundary.width || 1;
  const bH = layout.boundary.height || 1;
  const scale = Math.min((drawAreaW - 10) / bW, (drawAreaH - 10) / bH);

  const offsetX = drawAreaX + (drawAreaW - bW * scale) / 2;
  const offsetY = drawAreaY + (drawAreaH - bH * scale) / 2;

  // Draw Rooms
  for (const r of layout.rooms) {
    const rx = offsetX + r.boundary.x * scale;
    const ry = offsetY + r.boundary.y * scale;
    const rw = r.boundary.width * scale;
    const rh = r.boundary.height * scale;

    if (isBlueprint) {
      doc.setFillColor(27, 38, 59);
    } else {
      doc.setFillColor(249, 250, 251);
    }
    doc.setDrawColor(isBlueprint ? 65 : 209, isBlueprint ? 90 : 213, isBlueprint ? 119 : 219);
    doc.setLineWidth(0.2);
    doc.rect(rx, ry, rw, rh, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(isBlueprint ? 224 : 31, isBlueprint ? 225 : 41, isBlueprint ? 221 : 55);
    doc.text(r.name, rx + rw / 2, ry + rh / 2 - 1, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(isBlueprint ? 160 : 107, isBlueprint ? 175 : 114, isBlueprint ? 195 : 128);
    doc.text(
      `${formatDim(r.boundary.width, project.unit)} × ${formatDim(r.boundary.height, project.unit)}`,
      rx + rw / 2,
      ry + rh / 2 + 2.5,
      { align: 'center' }
    );
  }

  // Draw Furniture Outlines
  for (const f of layout.furniture) {
    const fx = offsetX + f.position.x * scale;
    const fy = offsetY + f.position.y * scale;
    const fw = f.width * scale;
    const fd = f.depth * scale;

    doc.setDrawColor(isBlueprint ? 119 : 156, isBlueprint ? 141 : 163, isBlueprint ? 169 : 175);
    doc.setLineWidth(0.2);
    doc.rect(fx - fw / 2, fy - fd / 2, fw, fd);
  }

  // Draw Walls
  for (const w of layout.walls) {
    const isExt = w.type === 'exterior';
    doc.setLineWidth(isExt ? 1.0 : 0.6);
    doc.setDrawColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
    doc.line(
      offsetX + w.start.x * scale,
      offsetY + w.start.y * scale,
      offsetX + w.end.x * scale,
      offsetY + w.end.y * scale
    );
  }

  // Dimension Readout under plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
  doc.text(
    `OVERALL FOOTPRINT: ${formatDim(bW, project.unit)} × ${formatDim(bH, project.unit)} (${formatArea(bW * bH, project.unit)})`,
    drawAreaX,
    drawAreaY + drawAreaH + 4
  );

  // ── Room Schedule Table (Right Column) ──────────────────────────
  if (includeSchedule) {
    const tableX = pageWidth - margin - 78;
    const tableY = margin + 20;
    const tableW = 72;

    doc.setFillColor(isBlueprint ? 27 : 243, isBlueprint ? 38 : 244, isBlueprint ? 59 : 246);
    doc.rect(tableX, tableY, tableW, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
    doc.text('ROOM SCHEDULE', tableX + 3, tableY + 4.2);

    let curY = tableY + 11;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');

    for (const r of layout.rooms.slice(0, 8)) {
      doc.setTextColor(isBlueprint ? 224 : 31, isBlueprint ? 225 : 41, isBlueprint ? 221 : 55);
      doc.text(r.name, tableX + 3, curY);
      doc.setTextColor(isBlueprint ? 160 : 107, isBlueprint ? 175 : 114, isBlueprint ? 195 : 128);
      doc.text(formatArea(r.areaSqMm, project.unit), tableX + tableW - 3, curY, { align: 'right' });

      doc.setDrawColor(isBlueprint ? 65 : 229, isBlueprint ? 90 : 231, isBlueprint ? 119 : 235);
      doc.setLineWidth(0.1);
      doc.line(tableX + 2, curY + 1.5, tableX + tableW - 2, curY + 1.5);
      curY += 6;
    }
  }

  // ── Official Title Block (Bottom Right) ─────────────────────────
  const tbW = 72;
  const tbH = 34;
  const tbX = pageWidth - margin - tbW - 2;
  const tbY = pageHeight - margin - tbH - 2;

  doc.setFillColor(isBlueprint ? 27 : 249, isBlueprint ? 38 : 250, isBlueprint ? 59 : 251);
  doc.setDrawColor(isBlueprint ? 119 : 209, isBlueprint ? 141 : 213, isBlueprint ? 169 : 219);
  doc.setLineWidth(0.3);
  doc.rect(tbX, tbY, tbW, tbH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(isBlueprint ? 224 : 17, isBlueprint ? 225 : 24, isBlueprint ? 221 : 39);
  doc.text(project.name.toUpperCase(), tbX + 3, tbY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(isBlueprint ? 160 : 107, isBlueprint ? 175 : 114, isBlueprint ? 195 : 128);
  doc.text(`ARCHETYPE: ${project.type.toUpperCase()}`, tbX + 3, tbY + 12);
  doc.text(`SCALE: 1:50 (METRIC / IMPERIAL)`, tbX + 3, tbY + 17);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, tbX + 3, tbY + 22);
  doc.text(`SHEET: A-101 (PRELIMINARY)`, tbX + 3, tbY + 27);
  doc.text(`PLANORA AI ARCHITECTURAL ENGINE`, tbX + 3, tbY + 31.5);

  // Save the document
  const fileName = `${project.name.replace(/\s+/g, '_')}_Blueprint.pdf`;
  doc.save(fileName);
}

// ────────────────────────────────────────────────────────────────
// 3. Raw Canonical JSON Export & Import
// ────────────────────────────────────────────────────────────────

export function exportProjectJson(project: Project): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_planora.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadSvgFile(svgContent: string, fileName: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const a = document.createElement('a');
  a.setAttribute('href', dataUrl);
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  a.remove();
}
