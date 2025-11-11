import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { resolveRequestSession } from '$lib/server/auth/session';

// Define public routes that don't require authentication
const publicPaths = [
	'/', // Homepage
	'/login', // Login page
	'/register', // Registration page
	'/auth' // Auth callback routes
];

// Check if path is public
function isPublicPath(pathname: string): boolean {
	return (
		publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
		pathname.startsWith('/dev-docs') ||
		pathname.startsWith('/docs') ||
		pathname.startsWith('/marketing-docs')
	);
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

// Resolve server-side session for each request
const sessionHandle: Handle = async ({ event, resolve }) => {
	await resolveRequestSession(event);
	return resolve(event);
};

// Require authentication for protected routes
const requireAuth: Handle = async ({ event, resolve }) => {
	// Skip auth checks during build/preview
	const isBuildContext = event.isDataRequest || event.isSubRequest;

	// Allow public routes
	if (isPublicPath(event.url.pathname)) {
		// Special handling: if authenticated user visits /login or /register, redirect them
		const isAuthPage = event.url.pathname === '/login' || event.url.pathname === '/register';

		// Skip redirect during build context
		if (!isBuildContext && isAuthPage && event.locals.auth.sessionId) {
			// Authenticated user trying to access login/register page
			const redirectTo = event.url.searchParams.get('redirectTo') || '/inbox';
			throw redirect(302, redirectTo);
		}

		return resolve(event);
	}

	// Skip auth check during build context
	if (isBuildContext) {
		return resolve(event);
	}

	// Check if user is authenticated
	if (!event.locals.auth.sessionId) {
		// Redirect to login if not authenticated
		throw redirect(
			302,
			`/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`
		);
	}

	// User is authenticated, proceed
	return resolve(event);
};

// Apply hooks in sequence
export const handle = sequence(
	redirectMarkdownUrls, // First, redirect any .md URLs to clean URLs
	sessionHandle, // Resolve server-managed session
	requireAuth // Finally enforce authentication for protected routes
);
