import type { Doc, Id } from '../_generated/dataModel';

export function findUserEmail(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const email = (user as Record<string, unknown>).email;
	return typeof email === 'string' ? email : null;
}

export function getUserRolloutBucket(userId: Id<'users'>, flag: string): number {
	let hash = 0;
	const str = `${userId}:${flag}`;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash) % 100;
}

export function hasTargetingRules(flagConfig: Doc<'featureFlags'>): boolean {
	return (
		flagConfig.allowedUserIds !== undefined ||
		flagConfig.allowedWorkspaceIds !== undefined ||
		flagConfig.allowedDomains !== undefined ||
		flagConfig.rolloutPercentage !== undefined
	);
}
