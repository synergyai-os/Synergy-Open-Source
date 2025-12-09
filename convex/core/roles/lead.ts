/**
 * Lead Role Helpers
 *
 * Pure functions for counting and requiring Lead roles.
 */

import { isLeadTemplate, type RoleTemplate } from './detection';
import type { Id } from '../../_generated/dataModel';

export type RoleCircleType = 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid';

export type LeadRequirementMap = Partial<Record<RoleCircleType, boolean>>;

export type RoleWithTemplate = {
	templateId?: Id<'roleTemplates'> | null;
};

export type TemplateLookup = (templateId: Id<'roleTemplates'>) => RoleTemplate | null | undefined;

const DEFAULT_LEAD_REQUIRED: Record<RoleCircleType, boolean> = {
	hierarchy: true,
	empowered_team: false,
	guild: false,
	hybrid: true
};

/**
 * Determine if at least one Lead role is required for the circle type.
 * Falls back to defaults when no overrides are provided.
 */
export function isLeadRequiredForCircleType(
	circleType: RoleCircleType | null | undefined,
	leadRequirementByCircleType?: LeadRequirementMap
): boolean {
	const effectiveType = circleType ?? 'hierarchy';

	if (leadRequirementByCircleType && leadRequirementByCircleType[effectiveType] !== undefined) {
		return Boolean(leadRequirementByCircleType[effectiveType]);
	}

	return DEFAULT_LEAD_REQUIRED[effectiveType];
}

/**
 * Count Lead roles using a template lookup.
 *
 * @param roles - Roles with optional templateId
 * @param getTemplate - Lookup function for templates
 */
export function countLeadRoles(roles: RoleWithTemplate[], getTemplate: TemplateLookup): number {
	let leadCount = 0;

	for (const role of roles) {
		if (!role.templateId) continue;

		const template = getTemplate(role.templateId);
		if (isLeadTemplate(template)) {
			leadCount++;
		}
	}

	return leadCount;
}
