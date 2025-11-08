import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { createRouteMatcher } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { handleAuth, isAuthenticatedHook } from '$lib/server/auth';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	'/',              // Homepage
	'/login',         // Login page
	'/register',      // Registration page
	// Note: No need to add '/api/auth' here as handleAuth middleware
	// will process those requests before this middleware runs
]);

// Check if path is public (including wildcards that createRouteMatcher doesn't support)
function isPublicPath(pathname: string): boolean {
	return isPublicRoute(pathname) || 
	       pathname.startsWith('/dev-docs') || 
	       pathname.startsWith('/docs') ||
	       pathname.startsWith('/marketing-docs');
}

// Redirect .md URLs to dynamic routes (prevents raw markdown files from being served)
const redirectMarkdownUrls: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	
	// If URL ends with .md, redirect to the version without .md
	if (pathname.match(/\.md$/)) {
		const cleanPath = pathname.replace(/\.md$/, '');
		throw redirect(301, cleanPath + event.url.search + event.url.hash);
	}
	
	return resolve(event);
};

// Create custom auth handler - auth-first approach (whitelist pattern)
// Auth configuration is centralized in $lib/server/auth.ts
// All routes require auth except those explicitly whitelisted above
const requireAuth: Handle = async ({ event, resolve }) => {
	// Skip auth checks during build/preview (for static adapter fallback generation)
	// Check if we're in a build context (SvelteKit sets this during prerender)
	const isBuildContext = event.isDataRequest || event.isSubRequest || 
		// During static build, cookies/auth won't work anyway
		process.env.NODE_ENV === 'production' && !event.request.headers.get('cookie');

	// Allow public routes
	if (isPublicPath(event.url.pathname)) {
		// Special handling: if authenticated user visits /login or /register, redirect them
		const isAuthPage = event.url.pathname === '/login' || event.url.pathname === '/register';
		
		// Skip redirect during build context
		if (!isBuildContext && isAuthPage && (await isAuthenticatedHook(event))) {
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
	if (!(await isAuthenticatedHook(event))) {
		// Redirect to login if not authenticated
		// Preserve the intended destination in redirectTo query param
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}

	// User is authenticated, proceed
	return resolve(event);
};

// Apply hooks in sequence
export const handle = sequence(
	redirectMarkdownUrls, // First, redirect any .md URLs to clean URLs
	handleAuth,           // Then handle auth requests
	requireAuth           // Finally enforce authentication for protected routes
);

