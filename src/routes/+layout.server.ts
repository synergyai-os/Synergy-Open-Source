import type { LayoutServerLoad } from './$types';

// Export load function to provide auth state to layout
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.auth.user,
		isAuthenticated: !!locals.auth.sessionId
	};
};

