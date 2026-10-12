// ────────────────────────────────────────────────────────────────
// Planora Layout Engine — Validator (Phase 3)
// ────────────────────────────────────────────────────────────────

import type { Layout, LayoutIssue } from '@planora/domain';

/**
 * Validate a floor-plan layout for geometric correctness.
 *
 * Phase 3 will check:
 * - Room boundaries within plot boundary
 * - No unintended room overlaps
 * - Wall connectivity
 * - Opening placement validity
 * - Area consistency
 *
 * Current: Returns an empty issues array.
 */
export function validateLayout(_layout: Layout): LayoutIssue[] {
  // TODO: Phase 3 implementation
  return [];
}
