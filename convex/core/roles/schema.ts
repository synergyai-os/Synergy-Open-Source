/**
 * Roles schema scaffold.
 * SYOS-707: placeholder alias until schema is relocated here.
 */

import type { Doc } from '../../_generated/dataModel';

export type CircleRoleDoc = Doc<'circleRoles'>;
export type RoleTemplateDoc = Doc<'roleTemplates'>;

/**
 * Default field value for a role template.
 * Maps a system field key to an array of default values.
 */
export interface DefaultFieldValue {
	systemKey: string;
	values: string[];
}

// Legacy: userCircleRoles migrated to assignments table (SYOS-815)
// export type UserCircleRoleDoc = Doc<'userCircleRoles'>;
