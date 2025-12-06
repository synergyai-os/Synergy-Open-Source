import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/public';
import { resolveWorkspaceRedirect } from '$lib/infrastructure/auth/server/workspaceRedirect';
import { logger } from '$lib/utils/logger';

/**
 * Returns the post-auth redirect URL for the current session.
 * - 200 with { redirectTo: '/w/{slug}/inbox' }
 * - 401 if not authenticated
 */
export const GET: RequestHandler = async ({ locals, request, url }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	let redirectTo: string;
	try {
		redirectTo = await resolveWorkspaceRedirect({
			client,
			sessionId: locals.auth.sessionId,
			activeWorkspaceId: locals.auth.user?.activeWorkspace?.id ?? null
		});
	} catch (err) {
		logger.warn('auth.redirect', 'Failed to resolve workspace redirect, sending to onboarding', {
			error: String(err),
			userId: locals.auth.user?.userId
		});
		throw redirect(302, '/onboarding?auth_fallback=redirect_resolve_failed');
	}

	const wantsJson =
		url.searchParams.get('format') === 'json' ||
		(request.headers.get('accept') || '').includes('application/json');

	if (wantsJson) {
		return json({ redirectTo });
	}

	// Default browser experience: perform the redirect
	throw redirect(302, redirectTo);
};

