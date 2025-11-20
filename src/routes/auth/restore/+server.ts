import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// TODO: Re-enable when Convex client is needed
// import { ConvexHttpClient } from 'convex/browser';
// import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';
import type { Id } from '$lib/convex';
import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore';
import { establishSession } from '$lib/infrastructure/auth/server/session';

/**
 * Restore session for a user from their active session record
 * Used when switching accounts after logout
 */
export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => ({}));
	const targetUserId = body.userId as Id<'users'> | undefined;

	if (!targetUserId) {
		return json({ error: 'Missing userId' }, { status: 400 });
	}

	if (!publicEnv.PUBLIC_CONVEX_URL) {
		return json({ error: 'Server configuration error' }, { status: 500 });
	}

	try {
		// Get active session for target user
		const targetSession = await getActiveSessionRecordForUser(targetUserId);

		if (!targetSession) {
			return json({ error: 'No active session found for this account' }, { status: 404 });
		}

		if (targetSession.expiresAt <= Date.now()) {
			return json({ error: 'Session expired. Please log in again.' }, { status: 410 });
		}

		// Establish session for the target user
		await establishSession({
			event,
			convexUserId: targetSession.convexUserId,
			workosUserId: targetSession.workosUserId,
			workosSessionId: targetSession.workosSessionId,
			accessToken: targetSession.accessToken,
			refreshToken: targetSession.refreshToken,
			expiresAt: targetSession.expiresAt,
			userSnapshot: targetSession.userSnapshot
		});

		console.log('✅ Session restored for user:', targetSession.userSnapshot.email);

		return json({ success: true });
	} catch (error) {
		console.error('❌ Failed to restore session:', error);
		return json({ error: 'Failed to restore session' }, { status: 500 });
	}
};
