import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Authentication is already checked by hooks.server.ts requireAuth
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const sessionId = locals.auth.sessionId;

	// Check if user is system admin (don't throw error here - let page load handle that)
	// This allows layout to hide sidebar while error page is shown
	let isAdmin = false;
	try {
		const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
		isAdmin = await client.query(api.rbac.permissions.isSystemAdmin, {
			sessionId
		});
	} catch (err) {
		// If query fails, assume not admin (fail closed)
		console.error('Failed to check admin status in layout:', err);
		isAdmin = false;
	}

	return {
		isAdmin,
		user: locals.auth.user,
		sessionId
	};
};
