/**
 * Roles schema scaffold.
 * SYOS-707: placeholder alias until schema is relocated here.
 */

import type { Doc } from '../../_generated/dataModel';

export type CircleRoleDoc = Doc<'circleRoles'>;
// Legacy: userCircleRoles migrated to assignments table (SYOS-815)
// export type UserCircleRoleDoc = Doc<'userCircleRoles'>;
