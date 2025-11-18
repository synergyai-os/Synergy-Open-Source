import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Authentication is already checked by hooks.server.ts requireAuth
	// Admin check is already done by hooks.server.ts requireAdmin
	if (!locals.auth.sessionId) {
		return {
			sessionId: null,
			stats: null,
			errors: []
		};
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load stats and unresolved errors
	let stats: unknown = null;
	let errors: unknown[] = [];

	try {
		stats = await client.query(api.doc404Tracking.getStats, {});
		errors = await client.query(api.doc404Tracking.listUnresolved, {});
	} catch (error) {
		console.warn('Failed to load 404 tracking data:', error);
	}

	return {
		sessionId,
		stats: stats as unknown,
		errors: errors as unknown[]
	};
};
