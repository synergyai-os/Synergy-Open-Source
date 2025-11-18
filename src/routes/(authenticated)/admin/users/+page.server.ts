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

	// Load users
	let users: unknown[] = [];
	try {
		const usersResult = await client.query(api.admin.users.listAllUsers, { sessionId });
		users = (usersResult as unknown[]) ?? [];
	} catch (error) {
		console.warn('Failed to load users:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		users
	};
};
