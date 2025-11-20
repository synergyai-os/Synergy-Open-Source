import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import { requireSystemAdmin } from '$lib/infrastructure/auth/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const sessionId = locals.auth.sessionId;

	// Check if user is system admin (throws error(403) if not)
	await requireSystemAdmin(sessionId);

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	// Load RBAC data
	let roles: unknown[] = [];
	let permissions: unknown = {};
	let analytics: unknown = null;
	let allUsers: unknown[] = [];

	try {
		const [rolesResult, permissionsResult, analyticsResult, usersResult] = await Promise.all([
			client.query(api.admin.rbac.listRoles, { sessionId }),
			client.query(api.admin.rbac.listPermissions, { sessionId }),
			client.query(api.admin.rbac.getRBACAnalytics, { sessionId }),
			client.query(api.admin.users.listAllUsers, { sessionId }).catch(() => [])
		]);
		roles = (rolesResult as unknown[]) ?? [];
		permissions = permissionsResult as unknown;
		analytics = analyticsResult as unknown;
		allUsers = (usersResult as unknown[]) ?? [];
	} catch (error) {
		// Re-throw admin access errors so error page can handle them
		// Only rethrow genuine authorization failures, not unrelated errors
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Check for exact authorization error message (from Convex)
		const isAuthError =
			errorMessage === 'System admin access required' ||
			// Check for structured SvelteKit error with status 403
			(typeof error === 'object' &&
				error !== null &&
				'status' in error &&
				(error as { status: unknown }).status === 403);

		if (isAuthError) {
			throw error;
		}
		console.warn('Failed to load RBAC data:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		roles,
		permissions,
		analytics,
		allUsers
	};
};
