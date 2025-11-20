import { redirect, error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import { requireSystemAdmin } from '$lib/infrastructure/auth/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Authentication is already checked by hooks.server.ts requireAuth
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const sessionId = locals.auth.sessionId;

	// Check if user is system admin (throws error(403) if not)
	await requireSystemAdmin(sessionId);

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	// Load system stats for dashboard
	let stats: unknown = null;
	try {
		stats = await client.query(api.admin.analytics.getSystemStats, { sessionId });
	} catch (err) {
		// Re-throw admin access errors so error page can handle them
		const errorMessage = err instanceof Error ? err.message : String(err);
		if (errorMessage.includes('System admin access required') || errorMessage.includes('admin')) {
			throw error(403, 'System admin access required');
		}
		console.warn('Failed to load system stats:', err);
	}

	return {
		user: locals.auth.user,
		sessionId,
		stats: stats as unknown
	};
};
