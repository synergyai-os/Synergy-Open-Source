/**
 * Circle Validation Utilities
 *
 * Pure validation functions for circle data.
 * These functions have no side effects and are easily testable in isolation.
 *
 * SYOS-696: Extracted from circles.ts to enable isolated testing
 * and clear separation of concerns.
 */

/**
 * Validate circle name
 *
 * @param name - The circle name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCircleName(name: string | undefined | null): string | null {
	if (name === undefined || name === null) {
		return 'Circle name is required';
	}

	const trimmedName = name.trim();
	if (!trimmedName) {
		return 'Circle name cannot be empty';
	}

	return null;
}

/**
 * Validate that a circle name is not empty (for updates)
 *
 * @param name - The circle name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCircleNameUpdate(name: string | undefined): string | null {
	if (name === undefined) {
		// Undefined is allowed for updates (means no change)
		return null;
	}

	const trimmedName = name.trim();
	if (!trimmedName) {
		return 'Circle name cannot be empty';
	}

	return null;
}
