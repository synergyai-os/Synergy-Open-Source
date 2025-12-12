import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api, type Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load user details and roles
	let userDetails: unknown = null;
	let allRoles: unknown[] = [];
	try {
		const [userDetailsResult, allRolesResult] = await Promise.all([
			client.query(api.admin.users.getUserById, {
				sessionId,
				targetUserId: params.id as Id<'users'>
			}),
			client.query(api.admin.rbac.listRoles, { sessionId })
		]);
		userDetails = userDetailsResult as unknown;
		allRoles = (allRolesResult as unknown[]) ?? [];
	} catch (error) {
		console.warn('Failed to load user details:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		userDetails,
		allRoles
	};
};
