/**
 * Shared authentication configuration for Convex Auth in SvelteKit
 * This ensures consistent auth setup between hooks.server.ts and +layout.server.ts
 */
import { 
	createConvexAuthHooks,
	createConvexAuthHandlers
} from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { config } from '$lib/config';

/**
 * Shared configuration options for Convex Auth
 */
const authConfig = {
	// convexUrl is automatically detected from PUBLIC_CONVEX_URL environment variable
	// API route for authentication requests (default: /api/auth)
	apiRoute: '/api/auth',
	// Cookie configuration for persistent sessions
	cookieConfig: {
		maxAge: config.auth.sessionMaxAgeSeconds // 30 days - persistent sessions
	},
	// Enable verbose logging in development
	verbose: false
};

/**
 * Create auth hooks for use in hooks.server.ts
 * Includes handleAuth middleware and authentication utilities
 */
export const { handleAuth, isAuthenticated: isAuthenticatedHook, getAuthState: getAuthStateHook } = 
	createConvexAuthHooks(authConfig);

/**
 * Create auth handlers for use in +layout.server.ts and +page.server.ts
 * Provides utilities for checking auth state and creating authenticated HTTP clients
 */
export const { 
	getAuthState, 
	isAuthenticated, 
	createConvexHttpClient 
} = createConvexAuthHandlers(authConfig);

