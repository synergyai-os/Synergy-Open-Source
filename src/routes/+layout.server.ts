import { getAuthState } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

// Export load function to provide auth state to layout
// Auth configuration is centralized in $lib/server/auth.ts
export const load: LayoutServerLoad = async (event) => {
	const authState = await getAuthState(event);
	return { authState };
};

