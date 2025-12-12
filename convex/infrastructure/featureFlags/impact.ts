import type { Doc } from '../_generated/dataModel';
import { findUserEmail } from './utils';
import type { Ctx, ImpactEntry } from './types';

export async function buildImpactStats(ctx: Ctx): Promise<{
	totalUsers: number;
	usersByDomain: Record<string, number>;
	flagImpacts: ImpactEntry[];
}> {
	const allUsers = await ctx.db.query('users').collect();
	const totalUsers = allUsers.length;

	const usersByDomain = countUsersByDomain(allUsers);
	const flags = await ctx.db.query('featureFlags').collect();
	const flagImpacts = flags.map((flag) => calculateImpact(flag, usersByDomain, totalUsers));

	return {
		totalUsers,
		usersByDomain: Object.fromEntries(usersByDomain),
		flagImpacts
	};
}

function countUsersByDomain(users: Doc<'users'>[]): Map<string, number> {
	const usersByDomain = new Map<string, number>();
	for (const user of users) {
		const email = findUserEmail(user);
		if (email && email.includes('@')) {
			const domain = '@' + email.split('@')[1];
			usersByDomain.set(domain, (usersByDomain.get(domain) || 0) + 1);
		}
	}
	return usersByDomain;
}

function calculateImpact(
	flag: Doc<'featureFlags'>,
	usersByDomain: Map<string, number>,
	totalUsers: number
): ImpactEntry {
	const breakdown = {
		byDomain: 0,
		byRollout: 0,
		byUserIds: 0,
		byOrgIds: 0
	};

	if (!flag.enabled) {
		return {
			flag: flag.flag,
			enabled: false,
			estimatedAffected: 0,
			breakdown
		};
	}

	if (flag.allowedDomains?.length) {
		for (const domain of flag.allowedDomains) {
			breakdown.byDomain += usersByDomain.get(domain) || 0;
		}
	}

	if (flag.allowedUserIds?.length) {
		breakdown.byUserIds = flag.allowedUserIds.length;
	}

	if (flag.allowedWorkspaceIds?.length) {
		breakdown.byOrgIds = flag.allowedWorkspaceIds.length * 10; // Estimate: 10 users per org
	}

	if (flag.rolloutPercentage !== undefined) {
		const alreadyCovered = breakdown.byDomain + breakdown.byUserIds + breakdown.byOrgIds;
		const remainingUsers = Math.max(0, totalUsers - alreadyCovered);
		breakdown.byRollout = Math.round((remainingUsers * flag.rolloutPercentage) / 100);
	}

	const estimatedAffected = Math.max(
		breakdown.byDomain,
		breakdown.byUserIds,
		breakdown.byOrgIds,
		breakdown.byRollout
	);

	return {
		flag: flag.flag,
		enabled: flag.enabled,
		estimatedAffected,
		breakdown
	};
}
