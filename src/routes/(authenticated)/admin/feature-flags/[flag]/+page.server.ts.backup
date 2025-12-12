import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;
	const flagName = params.flag;

	// Load flag details
	let flag: Awaited<ReturnType<typeof client.query<typeof api.featureFlags.getFlag>>> | null = null;
	try {
		flag = await client.query(api.featureFlags.getFlag, { flag: flagName });
	} catch (error) {
		console.warn('Failed to load flag:', error);
	}

	// Load all organizations for selection
	let organizations: unknown[] = [];
	try {
		organizations = (await client.query(api.featureFlags.listAllOrganizations, {
			sessionId
		})) as unknown[];
	} catch (error) {
		console.warn('Failed to load organizations:', error);
	}

	// Load impact stats for this flag
	let impactStats: { flag: string; estimatedAffected: number; breakdown: unknown } | null = null;
	try {
		const allStats = await client.query(api.featureFlags.getImpactStats, { sessionId });
		if (allStats) {
			const flagImpacts = (
				allStats as {
					flagImpacts: Array<{ flag: string; estimatedAffected: number; breakdown: unknown }>;
				}
			).flagImpacts;
			const flagImpact = flagImpacts.find((impact) => impact.flag === flagName);
			impactStats = flagImpact || null;
		}
	} catch (error) {
		console.warn('Failed to load impact stats:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		flag,
		organizations,
		impactStats
	};
};
