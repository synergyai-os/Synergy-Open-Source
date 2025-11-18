import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Authentication is already checked by hooks.server.ts requireAuth
	// Admin check is already done by hooks.server.ts requireAdmin
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load system stats for dashboard
	let stats: unknown = null;
	try {
		stats = await client.query(api.admin.analytics.getSystemStats, { sessionId });
	} catch (error) {
		console.warn('Failed to load system stats:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		stats: stats as unknown
	};
};
