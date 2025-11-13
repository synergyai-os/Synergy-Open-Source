import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Enforce authentication for all routes in this group
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If user is not authenticated, redirect to login
	if (!locals.auth.sessionId) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	return {
		user: locals.auth.user,
		isAuthenticated: true,
		// Expose sessionId to client for Convex authentication
		// Security: sessionId is already validated by hooks.server.ts middleware
		// and cryptographically signed - safe to expose for auth purposes
		sessionId: locals.auth.sessionId
	};
};
