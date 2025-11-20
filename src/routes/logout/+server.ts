import { json } from '@sveltejs/kit';
// TODO: Re-enable when redirect is needed
// import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	SESSION_COOKIE_NAME,
	clearSessionCookies,
	decodeSessionCookie
} from '$lib/infrastructure/auth/server/session';
import { getSessionRecord, invalidateSession } from '$lib/infrastructure/auth/server/sessionStore';
import { hashValue } from '$lib/infrastructure/auth/server/crypto';
import { revokeWorkOSSession } from '$lib/infrastructure/auth/server/workos';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

const ALLOWED_METHODS = 'POST';

export const GET: RequestHandler = async () => {
	return new Response('Method Not Allowed', {
		status: 405,
		headers: {
			Allow: ALLOWED_METHODS
		}
	});
};

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.logout, async ({ event }) => {
	const sessionCookieValue = event.cookies.get(SESSION_COOKIE_NAME);
	if (!sessionCookieValue) {
		clearSessionCookies(event);
		return json({ success: false, error: 'No session found' }, { status: 401 });
	}

	const sessionId = decodeSessionCookie(sessionCookieValue);
	if (!sessionId) {
		clearSessionCookies(event);
		return json({ success: false, error: 'Invalid session' }, { status: 401 });
	}

	const sessionRecord = await getSessionRecord(sessionId);
	if (!sessionRecord) {
		clearSessionCookies(event);
		return json({ success: false, error: 'Session not found' }, { status: 401 });
	}

	// CSRF validation - must come after session validation to ensure we have sessionRecord.csrfTokenHash
	const csrfHeader = event.request.headers.get('x-csrf-token');
	if (!csrfHeader) {
		return json({ error: 'Missing CSRF token' }, { status: 400 });
	}

	if (hashValue(csrfHeader) !== sessionRecord.csrfTokenHash) {
		return json({ error: 'Invalid CSRF token' }, { status: 403 });
	}

	try {
		await revokeWorkOSSession(sessionRecord.workosSessionId);
		console.log('✅ WorkOS session revoked');
	} catch (error) {
		console.error('⚠️ Failed to revoke WorkOS session (non-fatal):', error);
		// Continue with local logout even if WorkOS call fails
	}

	await invalidateSession(sessionRecord.sessionId);
	clearSessionCookies(event);
	console.log('✅ Session invalidated and cookies cleared');

	// Note: Multi-session support
	// - This only logs out the current active account
	// - Other accounts remain logged in (stored in client localStorage)
	// - Client will handle switching to another account if available

	return json({ success: true });
});
