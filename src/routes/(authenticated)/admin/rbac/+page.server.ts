import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load RBAC data
	let roles: unknown[] = [];
	let permissions: unknown = {};
	let analytics: unknown = null;

	try {
		const [rolesResult, permissionsResult, analyticsResult] = await Promise.all([
			client.query(api.admin.rbac.listRoles, { sessionId }),
			client.query(api.admin.rbac.listPermissions, { sessionId }),
			client.query(api.admin.rbac.getRBACAnalytics, { sessionId })
		]);
		roles = (rolesResult as unknown[]) ?? [];
		permissions = permissionsResult as unknown;
		analytics = analyticsResult as unknown;
	} catch (error) {
		console.warn('Failed to load RBAC data:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		roles,
		permissions,
		analytics
	};
};
