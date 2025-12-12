/**
 * Circles schema scaffold.
 * SYOS-707: placeholder alias until schema is relocated here.
 */

import type { Doc } from '../../_generated/dataModel';

/**
 * Canonical circle operating modes.
 * Sourced here so all domains share the same union.
 */
export type CircleType = 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid';

export type CircleDoc = Doc<'circles'>;
