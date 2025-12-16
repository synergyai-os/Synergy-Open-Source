/**
 * Role Business Rules
 *
 * Pure validation functions for role governance invariants.
 * Implements GOV-02, GOV-03 from governance-design.md
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

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
