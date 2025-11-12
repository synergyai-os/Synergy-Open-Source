import { redirect, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME, clearSessionCookies, decodeSessionCookie } from '$lib/server/auth/session';
import { getSessionRecord, invalidateSession } from '$lib/server/auth/sessionStore';
import { hashValue } from '$lib/server/auth/crypto';
import { revokeWorkOSSession } from '$lib/server/auth/workos';

const ALLOWED_METHODS = 'POST';

export const GET: RequestHandler = async () => {
	return new Response('Method Not Allowed', {
		status: 405,
		headers: {
			Allow: ALLOWED_METHODS
		}
	});
};

export const POST: RequestHandler = async (event) => {
	const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
	if (!sessionCookie) {
		clearSessionCookies(event);
		throw redirect(303, '/login');
	}

	const sessionId = decodeSessionCookie(sessionCookie);
	if (!sessionId) {
		clearSessionCookies(event);
		throw redirect(303, '/login');
	}

	const sessionRecord = await getSessionRecord(sessionId);
	if (!sessionRecord) {
		clearSessionCookies(event);
		throw redirect(303, '/login');
	}

	const csrfHeader = event.request.headers.get('x-csrf-token');
	if (!csrfHeader) {
		return json({ error: 'Missing CSRF token' }, { status: 400 });
	}

	if (hashValue(csrfHeader) !== sessionRecord.csrfTokenHash) {
		return json({ error: 'Invalid CSRF token' }, { status: 403 });
	}

	try {
		await revokeWorkOSSession(sessionRecord.workosSessionId);
	} catch (error) {
		console.error('Failed to revoke WorkOS session during logout', error);
		// Continue with local logout even if WorkOS call fails
	}

	await invalidateSession(sessionRecord.sessionId);
	clearSessionCookies(event);

	throw redirect(303, '/login');
};
