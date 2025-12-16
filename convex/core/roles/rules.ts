/**
 * Role Business Rules
 *
 * Pure validation functions and business logic for role governance invariants.
 * Implements GOV-02, GOV-03 from governance-design.md
 *
 * Consolidated per architecture.md Principle #27: "Validation logic extracted to rules.ts"
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import type { CircleType } from '../circles';

// ============================================================================
// Governance Validation (GOV-02, GOV-03)
// ============================================================================

/**
 * Validate role purpose (GOV-02)
 *
 * Invariant: Every role has a purpose (non-empty string)
 *
 * @throws ERR_VALIDATION_REQUIRED_FIELD if purpose is empty or whitespace-only
 */
export function validateRolePurpose(purpose: string | undefined): void {
	if (!purpose || purpose.trim().length === 0) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'GOV-02: Role purpose is required and cannot be empty'
		);
	}
}

/**
 * Validate role decision rights (GOV-03)
 *
 * Invariant: Every role has at least one decisionRight
 *
 * @throws ERR_VALIDATION_REQUIRED_FIELD if decisionRights is empty or missing
 */
export function validateRoleDecisionRights(decisionRights: string[] | undefined): void {
	if (!decisionRights || decisionRights.length === 0) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'GOV-03: Role must have at least one decision right'
		);
	}

	// Validate that all decision rights are non-empty strings
	const hasEmptyRight = decisionRights.some((right) => !right || right.trim().length === 0);
	if (hasEmptyRight) {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			'GOV-03: Decision rights cannot be empty strings'
		);
	}
}

// ============================================================================
// Role Name Validation
// ============================================================================

export type RoleNameCarrier = {
	_id?: string;
	name: string;
};

/**
 * Normalize role names for duplicate checks.
 * - Trims whitespace
 * - Lowercases
 */
export function normalizeRoleName(name: string): string {
	return name.trim().toLowerCase();
}

/**
 * Check for duplicate role name within a collection.
 *
 * @param candidateName - Name being validated
 * @param roles - Existing roles to compare against
 * @param currentRoleId - Optional ID to exclude from comparison (for updates)
 */
export function hasDuplicateRoleName(
	candidateName: string,
	roles: RoleNameCarrier[],
	currentRoleId?: string
): boolean {
	const normalizedCandidate = normalizeRoleName(candidateName);

	return roles.some((role) => {
		if (currentRoleId && role._id === currentRoleId) {
			return false;
		}
		return normalizeRoleName(role.name) === normalizedCandidate;
	});
}

// ============================================================================
// Lead Role Detection
// ============================================================================

export type RoleTemplate = {
	roleType?: 'circle_lead' | 'structural' | 'custom' | null;
};

/**
 * Determine if a template marks a Lead role.
 * A Lead role is any role with roleType: 'circle_lead'.
 */
export function isLeadTemplate(template: RoleTemplate | null | undefined): boolean {
	return template?.roleType === 'circle_lead';
}

// ============================================================================
// Lead Role Requirements
// ============================================================================

export type RoleCircleType = CircleType;

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
