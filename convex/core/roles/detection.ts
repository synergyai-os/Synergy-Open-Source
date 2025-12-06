/**
 * Lead Detection
 *
 * Pure functions for identifying Lead roles from template data.
 * A Lead role is any role whose template is marked isRequired: true.
 */

export type RoleTemplate = {
	isRequired?: boolean | null;
};

/**
 * Determine if a template marks a Lead role.
 */
export function isLeadTemplate(template: RoleTemplate | null | undefined): boolean {
	return template?.isRequired === true;
}

