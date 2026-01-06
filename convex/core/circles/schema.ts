/**
 * Circles schema scaffold.
 * SYOS-707: placeholder alias until schema is relocated here.
 */

import type { Doc } from '../../_generated/dataModel';

/**
 * Canonical lead authority values.
 * Re-exported from constants.ts (single source of truth).
 */
export type { LeadAuthority } from './constants';

export type CircleDoc = Doc<'circles'>;
