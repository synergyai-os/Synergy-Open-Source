/**
 * Circles schema scaffold.
 * SYOS-707: placeholder alias until schema is relocated here.
 */

import type { Doc } from '../../_generated/dataModel';

/**
 * Canonical circle operating modes.
 * Re-exported from constants.ts (single source of truth).
 */
export type { CircleType, DecisionModel } from './constants';

export type CircleDoc = Doc<'circles'>;
