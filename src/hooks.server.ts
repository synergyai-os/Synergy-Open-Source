import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	'/',              // Homepage
	'/login',         // Login page
	'/register',      // Registration page
	// Note: No need to add '/api/auth' here as handleAuth middleware
	// will process those requests before this middleware runs
]);

// Create auth hooks - convexUrl is automatically detected from environment
const { handleAuth, isAuthenticated } = createConvexAuthHooks();

// Create custom auth handler - auth-first approach (whitelist pattern)
// All routes require auth except those explicitly whitelisted above
const requireAuth: Handle = async ({ event, resolve }) => {
	// Allow public routes
	if (isPublicRoute(event.url.pathname)) {
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

