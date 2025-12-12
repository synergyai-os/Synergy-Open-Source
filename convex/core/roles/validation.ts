/**
 * Role Validation
 *
 * Pure helpers for validating circle role data.
 */

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
