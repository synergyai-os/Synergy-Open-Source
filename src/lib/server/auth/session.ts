import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	createSessionRecord,
	getSessionRecord,
	invalidateSession,
	touchSession,
	updateSessionSecrets
} from './sessionStore';
import {
	generateRandomToken,
	generateSessionId,
	hashValue,
	signValue,
	verifySignature
} from './crypto';
import { refreshWorkOSSession } from './workos';

export const SESSION_COOKIE_NAME = 'axon_session';
export const CSRF_COOKIE_NAME = 'axon_csrf';
export const LEGACY_SESSION_COOKIE = 'wos-session';
export const LEGACY_USER_COOKIE = 'wos-user';

const SESSION_TTL_DAYS = Number(env.AXON_SESSION_TTL_DAYS ?? '30');
const SESSION_MAX_AGE = Math.max(1, SESSION_TTL_DAYS) * 24 * 60 * 60; // seconds
const COOKIE_BASE_OPTIONS = {
	path: '/',
	sameSite: 'lax' as const,
	secure: env.NODE_ENV === 'production'
};
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const sessionCookieOptions = {
	...COOKIE_BASE_OPTIONS,
	httpOnly: true,
	maxAge: SESSION_MAX_AGE
};

export const csrfCookieOptions = {
	...COOKIE_BASE_OPTIONS,
	httpOnly: false,
	maxAge: SESSION_MAX_AGE
};

export function encodeSessionCookie(sessionId: string): string {
	const signature = signValue(sessionId);
	return `${sessionId}.${signature}`;
}

export function decodeSessionCookie(cookieValue?: string | null): string | null {
	if (!cookieValue) {
		return null;
	}

	const separator = cookieValue.lastIndexOf('.');
	if (separator === -1) {
		return null;
	}

	const sessionId = cookieValue.slice(0, separator);
	const signature = cookieValue.slice(separator + 1);

	if (!sessionId || !signature) {
		return null;
	}

	return verifySignature(sessionId, signature) ? sessionId : null;
}

export async function establishSession(options: {
	event: RequestEvent;
	convexUserId: Parameters<typeof createSessionRecord>[0]['convexUserId'];
	workosUserId: string;
	workosSessionId: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	userSnapshot: Parameters<typeof createSessionRecord>[0]['userSnapshot'];
}) {
	const csrfToken = generateRandomToken(32);

	const sessionId = await createSessionRecord({
		convexUserId: options.convexUserId,
		workosUserId: options.workosUserId,
		workosSessionId: options.workosSessionId,
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		csrfToken,
		expiresAt: options.expiresAt,
		userSnapshot: options.userSnapshot,
		ipAddress: options.event.getClientAddress(),
		userAgent: options.event.request.headers.get('user-agent')
	});

	options.event.cookies.set(
		SESSION_COOKIE_NAME,
		encodeSessionCookie(sessionId),
		sessionCookieOptions
	);
	options.event.cookies.set(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);

	// Clean up legacy cookies if present
	options.event.cookies.delete(LEGACY_SESSION_COOKIE, { path: '/' });
	options.event.cookies.delete(LEGACY_USER_COOKIE, { path: '/' });

	options.event.locals.auth = {
		sessionId,
		user: options.userSnapshot,
		workosSessionId: options.workosSessionId,
		accessToken: options.accessToken,
		expiresAt: options.expiresAt,
		csrfToken
	};

	return sessionId;
}

export async function resolveRequestSession(event: RequestEvent) {
	const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
	const csrfCookie = event.cookies.get(CSRF_COOKIE_NAME);

	// Always clear legacy cookies if encountered
	const legacySession = event.cookies.get(LEGACY_SESSION_COOKIE);
	if (legacySession) {
		event.cookies.delete(LEGACY_SESSION_COOKIE, { path: '/' });
	}
	const legacyUser = event.cookies.get(LEGACY_USER_COOKIE);
	if (legacyUser) {
		event.cookies.delete(LEGACY_USER_COOKIE, { path: '/' });
	}

	if (!sessionCookie) {
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		if (csrfCookie) {
			event.cookies.delete(CSRF_COOKIE_NAME, { path: '/' });
		}
		return;
	}

	const sessionId = decodeSessionCookie(sessionCookie);
	if (!sessionId) {
		clearSessionCookies(event);
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		return;
	}

	const record = await getSessionRecord(sessionId);
	if (!record) {
		clearSessionCookies(event);
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		return;
	}

	const now = Date.now();

	if (record.expiresAt <= now) {
		await invalidateSession(record.sessionId);
		clearSessionCookies(event);
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		return;
	}

	let activeSessionId = record.sessionId;
	let accessToken = record.accessToken;
	let refreshToken = record.refreshToken;
	let expiresAt = record.expiresAt;
	let csrfToken = csrfCookie;

	const csrfMismatch =
		!csrfToken || hashValue(csrfToken) !== record.csrfTokenHash;
	if (csrfMismatch) {
		csrfToken = generateRandomToken(32);
		await updateSessionSecrets({
			sessionId: activeSessionId,
			csrfToken
		});
		event.cookies.set(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);
	}

	const needsRefresh = expiresAt - now <= REFRESH_THRESHOLD_MS;
	if (needsRefresh) {
		try {
			const refreshed = await refreshWorkOSSession({
				workosSessionId: record.workosSessionId,
				refreshToken
			});

			accessToken = refreshed.access_token;
			refreshToken = refreshed.refresh_token;
			const refreshedExpiresAt =
				refreshed.session?.expires_at !== undefined
					? Date.parse(refreshed.session.expires_at)
					: now + refreshed.expires_in * 1000;

			activeSessionId = generateSessionId();
			csrfToken = generateRandomToken(32);

			await updateSessionSecrets({
				sessionId: record.sessionId,
				newSessionId: activeSessionId,
				accessToken,
				refreshToken,
				csrfToken,
				expiresAt: refreshedExpiresAt,
				lastRefreshedAt: now
			});

			event.cookies.set(
				SESSION_COOKIE_NAME,
				encodeSessionCookie(activeSessionId),
				sessionCookieOptions
			);
			event.cookies.set(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);
			expiresAt = refreshedExpiresAt;
		} catch (error) {
			console.error('Failed to refresh WorkOS session', error);
			await invalidateSession(record.sessionId);
			clearSessionCookies(event);
			event.locals.auth = {
				sessionId: undefined,
				user: null
			};
			return;
		}
	} else {
		await touchSession({
			sessionId: record.sessionId,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent'),
			now
		});
	}

	event.locals.auth = {
		sessionId: activeSessionId,
		user: {
			...record.userSnapshot,
			activeWorkspace:
				record.userSnapshot.activeWorkspace ?? {
					type: 'personal',
					id: null,
					name: 'Private workspace'
				}
		},
		workosSessionId: record.workosSessionId,
		accessToken,
		expiresAt,
		csrfToken
	};
}

export function clearSessionCookies(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production'
	});
	event.cookies.delete(CSRF_COOKIE_NAME, { path: '/' });
}
