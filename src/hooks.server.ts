import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { resolveRequestSession } from '$lib/infrastructure/auth/server/session';
import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/public';
import { resolveWorkspaceRedirect } from '$lib/infrastructure/auth/server/workspaceRedirect';

// Define public routes that don't require authentication
const publicPaths = [
	'/', // Homepage
	'/login', // Login page
	'/register', // Registration page
	'/verify-email', // Email verification page
	'/forgot-password', // Password reset request page
	'/reset-password', // Password reset completion page
	'/auth', // Auth callback routes (login, register, verify, resend, etc.)
	'/invite', // Invite acceptance page (public so users can view invites before signing in)
	'/test' // Test helper endpoints (secured via E2E_TEST_MODE check)
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

async function resolveDefaultAppRedirect(event: Parameters<Handle>[0]['event']): Promise<string> {
	const sessionId = event.locals.auth.sessionId;
	if (!sessionId) {
		throw new Error('Expected authenticated session for redirect');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	return resolveWorkspaceRedirect({
		client,
		sessionId,
		activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null
	});
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
		// Special handling: if authenticated user visits auth pages, redirect them
		const isAuthPage =
			event.url.pathname === '/login' ||
			event.url.pathname === '/register' ||
			event.url.pathname === '/verify-email';

		// Skip redirect during build context
		if (!isBuildContext && isAuthPage && event.locals.auth.sessionId) {
			// Authenticated user trying to access auth page - redirect to app
			const redirectTo =
				event.url.searchParams.get('redirect') || event.url.searchParams.get('redirectTo');

			if (redirectTo) {
				throw redirect(302, redirectTo);
			}

			const defaultRedirect = await resolveDefaultAppRedirect(event);
			throw redirect(302, defaultRedirect);
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
	// Phase 2C: Load active workspace for SSR class injection
	let activeOrgId: string | null = null;
	try {
		const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
		const sessionId = event.locals.auth.sessionId;

		// Load workspaces to determine active org
		const workspaces = (await client.query(api.workspaces.listWorkspaces, {
			sessionId
		})) as Array<{ workspaceId: string }>;

		if (workspaces.length > 0) {
			// Determine active org: URL param (if valid) > first org
			const orgParam = event.url.searchParams.get('org');
			const validOrgParam =
				orgParam && workspaces.some((org) => org.workspaceId === orgParam) ? orgParam : null;
			activeOrgId = validOrgParam || workspaces[0]?.workspaceId || null;
		}
	} catch (error) {
		// Don't block page load if org query fails
		console.warn('Failed to load active workspace in hooks.server.ts:', error);
	}

	// Inject org class on SSR (no FOUC)
	const response = await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done && activeOrgId) {
				// Inject org class into <html> tag (handle existing class attribute)
				return html.replace(/<html([^>]*)>/, (match, attrs) => {
					// Check if class attribute already exists
					if (attrs.includes('class=')) {
						// Remove all existing org-* classes, then add the current org class
						return match.replace(/class="([^"]*)"/, (classMatch, classValue) => {
							// Remove all org-* classes (org- followed by alphanumeric characters)
							const cleanedClasses = classValue
								.split(/\s+/)
								.filter((cls: string) => !cls.startsWith('org-'))
								.join(' ');
							// Add the current org class
							const newClassValue = cleanedClasses
								? `${cleanedClasses} org-${activeOrgId}`
								: `org-${activeOrgId}`;
							return `class="${newClassValue}"`;
						});
					} else {
						// Add new class attribute
						return `<html${attrs} class="org-${activeOrgId}">`;
					}
				});
			}
			return html;
		}
	});

	return response;
};

// Apply hooks in sequence
export const handle = sequence(
	redirectMarkdownUrls, // First, redirect any .md URLs to clean URLs
	sessionHandle, // Resolve server-managed session
	requireAuth // Enforce authentication for protected routes
	// Note: Admin checks are handled in individual page load functions to allow error pages to catch them
);
