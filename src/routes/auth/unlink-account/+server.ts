import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';

/**
 * Unlink a linked account
 *
 * Called when user clicks "Log out" on a linked account in the workspace switcher.
 * Removes the bidirectional accountLink record in Convex so the account won't
 * reappear on page reload.
 *
 * SECURITY: Validates CSRF token and session before unlinking
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const { auth } = locals;

	if (!auth?.sessionId || !auth.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	// Validate CSRF token
	const csrfHeader = request.headers.get('x-csrf-token');
	if (!csrfHeader || csrfHeader !== auth.csrfToken) {
		return json({ error: 'Invalid CSRF token' }, { status: 403 });
	}

	const body = (await request.json()) as { targetUserId?: string };
	const { targetUserId } = body;

	if (!targetUserId) {
		return json({ error: 'Target user ID is required' }, { status: 400 });
	}

	if (!publicEnv.PUBLIC_CONVEX_URL) {
		throw new Error('PUBLIC_CONVEX_URL must be configured.');
	}

	const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

	try {
		// Call Convex mutation to remove the link
		await convex.mutation(api.users.unlinkAccounts, {
			sessionId: auth.sessionId,
			targetUserId: targetUserId as Id<'users'>
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to unlink accounts:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to unlink account';
		return json({ error: errorMessage }, { status: 500 });
	}
};
