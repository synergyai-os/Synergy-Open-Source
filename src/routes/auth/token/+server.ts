import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { decryptSecret } from '$lib/infrastructure/auth/server/crypto';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * GET /auth/token
 *
 * Returns the WorkOS access token for the current session.
 * Used by Convex client to authenticate queries/mutations.
 */
export const GET: RequestHandler = withRateLimit(RATE_LIMITS.token, async ({ event }) => {
	const { locals } = event;
	// Check if user is authenticated
	if (!locals.auth.sessionId || !locals.auth.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		// Fetch session record from Convex to get encrypted access token
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const sessionRecord = await convex.query(api.authSessions.getSessionById, {
			sessionId: locals.auth.sessionId
		});

		if (!sessionRecord) {
			return json({ error: 'Session not found' }, { status: 401 });
		}

		// Decrypt the access token
		const accessToken = decryptSecret(sessionRecord.accessTokenCiphertext);

		// Debug: Decode JWT to inspect claims (without verification) - only in development
		if (import.meta.env.DEV) {
			try {
				const parts = accessToken.split('.');
				if (parts.length === 3) {
					const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
					console.log('🔍 JWT token payload:', {
						iss: payload.iss,
						aud: payload.aud,
						sub: payload.sub,
						sid: payload.sid,
						exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined,
						keys: Object.keys(payload)
					});
				}
			} catch (err) {
				console.error('❌ Failed to decode JWT:', err);
			}
		}

		return json({ token: accessToken });
	} catch (error) {
		console.error('Error fetching access token:', error);
		return json({ error: 'Failed to retrieve access token' }, { status: 500 });
	}
});
