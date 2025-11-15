import type { LayoutServerLoad } from './$types';

// Export load function to provide auth state to layout
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.auth.user,
		isAuthenticated: !!locals.auth.sessionId,
		// Expose sessionId to client for Convex authentication (when authenticated)
		// Security: sessionId is already validated by hooks.server.ts middleware
		// and cryptographically signed - safe to expose for auth purposes
		// Only available when user is authenticated (undefined for public routes)
		sessionId: locals.auth.sessionId ?? undefined,
		activeWorkspace: locals.auth.user?.activeWorkspace || {
			type: 'personal',
			id: null,
			name: 'Private workspace'
		}
	};
};
