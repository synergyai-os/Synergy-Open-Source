import type { FeatureFlagKey } from './constants';
import { FlagDescriptions } from './index';

/**
 * Get description for a flag (from DB or fallback to constants)
 */
export function getFlagDescription(flag: string, dbDescription?: string | null): string {
	if (dbDescription) return dbDescription;
	return FlagDescriptions[flag as FeatureFlagKey] || 'No description available';
}

/**
 * Hash function for consistent percentage-based rollouts
 * Same user + same flag = same result every time
 *
 * @param userId - User identifier
 * @param flag - Feature flag name
 * @returns Number between 0 and 99 (for percentage comparison)
 */
export function getUserRolloutBucket(userId: string, flag: string): number {
	let hash = 0;
	const str = `${userId}:${flag}`;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash) % 100;
}

/**
 * Check if user is in rollout percentage
 *
 * @example
 * ```typescript
 * // User will consistently be in or out based on their ID
 * const inRollout = isInRollout(userId, flagName, 10); // 10% rollout
 * ```
 */
export function isInRollout(userId: string, flag: string, percentage: number): boolean {
	if (percentage >= 100) return true;
	if (percentage <= 0) return false;

	const bucket = getUserRolloutBucket(userId, flag);
	return bucket < percentage;
}

/**
 * Check if email matches allowed domains
 *
 * @example
 * ```typescript
 * isAllowedDomain('user@acme.com', ['@acme.com']) // true
 * isAllowedDomain('user@gmail.com', ['@acme.com']) // false
 * ```
 */
export function isAllowedDomain(email: string, allowedDomains: string[]): boolean {
	return allowedDomains.some((domain) => email.endsWith(domain));
}
