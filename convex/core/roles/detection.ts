/**
 * Lead Detection
 *
 * Pure functions for identifying Lead roles from template data.
 * A Lead role is any role with roleType: 'circle_lead'.
 */

export type RoleTemplate = {
	roleType?: 'circle_lead' | 'structural' | 'custom' | null;
};

/**
 * Determine if a template marks a Lead role.
 */
export function isLeadTemplate(template: RoleTemplate | null | undefined): boolean {
	return template?.roleType === 'circle_lead';
}
