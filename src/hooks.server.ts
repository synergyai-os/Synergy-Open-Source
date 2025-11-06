import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { config } from '$lib/config';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	'/',              // Homepage
	'/login',         // Login page
	'/register',      // Registration page
	// Note: No need to add '/api/auth' here as handleAuth middleware
	// will process those requests before this middleware runs
]);

// Create auth hooks - convexUrl is automatically detected from environment
// Configure persistent cookies using session duration from config
const { handleAuth, isAuthenticated } = createConvexAuthHooks({
	cookieConfig: {
		maxAge: config.auth.sessionMaxAgeSeconds
	}
});

// Create custom auth handler - auth-first approach (whitelist pattern)
// All routes require auth except those explicitly whitelisted above
const requireAuth: Handle = async ({ event, resolve }) => {
	// Skip auth checks during build/preview (for static adapter fallback generation)
	// Check if we're in a build context (SvelteKit sets this during prerender)
	const isBuildContext = event.isDataRequest || event.isSubRequest || 
		// During static build, cookies/auth won't work anyway
		process.env.NODE_ENV === 'production' && !event.request.headers.get('cookie');

	// Allow public routes
	if (isPublicRoute(event.url.pathname)) {
		// Special handling: if authenticated user visits /login or /register, redirect them
		const isAuthPage = event.url.pathname === '/login' || event.url.pathname === '/register';
		
		// Skip redirect during build context
		if (!isBuildContext && isAuthPage && (await isAuthenticated(event))) {
			// Authenticated user trying to access login/register page
			// Redirect to redirectTo query param or fallback to /inbox
			const redirectTo = event.url.searchParams.get('redirectTo') || '/inbox';
			throw redirect(302, redirectTo);
		}
		
		return resolve(event);
	}

	// Skip auth check during build context (for static adapter)
	if (isBuildContext) {
		return resolve(event);
	}

	// Check if user is authenticated
	if (!(await isAuthenticated(event))) {
		// Redirect to login if not authenticated
		// Preserve the intended destination in redirectTo query param
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}

	// User is authenticated, proceed
	return resolve(event);
};

// Apply hooks in sequence
// handleAuth MUST come first to handle auth requests
export const handle = sequence(
	handleAuth,  // This handles all POST requests to /api/auth automatically
	requireAuth  // Then enforce authentication for protected routes
);

