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

export const SESSION_COOKIE_NAME = 'syos_session';
export const CSRF_COOKIE_NAME = 'syos_csrf';
export const LEGACY_SESSION_COOKIE = 'wos-session';
export const LEGACY_USER_COOKIE = 'wos-user';
const LEGACY_AXON_SESSION_COOKIE = 'axon_session';
const LEGACY_AXON_CSRF_COOKIE = 'axon_csrf';

const SESSION_TTL_DAYS = Number(env.SYOS_SESSION_TTL_DAYS ?? '30');
const SESSION_MAX_AGE = Math.max(1, SESSION_TTL_DAYS) * 24 * 60 * 60; // seconds
const COOKIE_BASE_OPTIONS = {
	path: '/',
	sameSite: 'lax' as const,
	secure: env.NODE_ENV === 'production'
};
const REFRESH_THRESHOLD_MS = 1 * 60 * 1000; // 1 minute - refresh only in last minute before expiry

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

	// Get client address with fallback for test environments (e.g., Playwright)
	let ipAddress: string;
	try {
		ipAddress = options.event.getClientAddress();
	} catch (_error) {
		// Fallback for environments where getClientAddress fails
		ipAddress =
			options.event.request.headers.get('x-forwarded-for') ||
			options.event.request.headers.get('x-real-ip') ||
			'127.0.0.1';

		if (env.E2E_TEST_MODE === 'true') {
			console.log('⚠️ getClientAddress failed in establishSession, using fallback:', ipAddress);
		}
	}

	const sessionId = await createSessionRecord({
		convexUserId: options.convexUserId,
		workosUserId: options.workosUserId,
		workosSessionId: options.workosSessionId,
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		csrfToken,
		expiresAt: options.expiresAt,
		userSnapshot: options.userSnapshot,
		ipAddress,
		userAgent: options.event.request.headers.get('user-agent')
	});

	console.log('🔍 Setting session cookies:', {
		sessionCookieName: SESSION_COOKIE_NAME,
		csrfCookieName: CSRF_COOKIE_NAME,
		cookieOptions: sessionCookieOptions
	});

	options.event.cookies.set(
		SESSION_COOKIE_NAME,
		encodeSessionCookie(sessionId),
		sessionCookieOptions
	);
	options.event.cookies.set(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);

	console.log('✅ Session cookies set successfully');

	// Clean up legacy cookies if present
	options.event.cookies.delete(LEGACY_SESSION_COOKIE, { path: '/' });
	options.event.cookies.delete(LEGACY_USER_COOKIE, { path: '/' });

	// Normalize activeWorkspace to ensure id is string | null (not optional)
	const activeWorkspace = options.userSnapshot.activeWorkspace
		? {
				type: options.userSnapshot.activeWorkspace.type,
				id: options.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string | null, not optional
				name: options.userSnapshot.activeWorkspace.name
			}
		: {
				type: 'personal' as const,
				id: null,
				name: 'Private workspace'
			};

	options.event.locals.auth = {
		sessionId,
		user: {
			userId: options.userSnapshot.userId, // Id<'users'> is compatible with string at runtime
			workosId: options.userSnapshot.workosId,
			email: options.userSnapshot.email,
			firstName: options.userSnapshot.firstName,
			lastName: options.userSnapshot.lastName,
			name: options.userSnapshot.name,
			activeWorkspace
		},
		workosSessionId: options.workosSessionId,
		accessToken: options.accessToken,
		expiresAt: options.expiresAt,
		csrfToken
	};

	console.log('✅ Session established for user:', options.userSnapshot.email);

	return sessionId;
}

export async function resolveRequestSession(event: RequestEvent) {
	console.log('🔍 Resolving session for:', event.url.pathname);

	const primarySessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
	const legacyAxonSessionCookie = event.cookies.get(LEGACY_AXON_SESSION_COOKIE);
	const sessionCookie = primarySessionCookie ?? legacyAxonSessionCookie;

	console.log('🔍 Session cookies:', {
		hasPrimarySession: !!primarySessionCookie,
		hasLegacySession: !!legacyAxonSessionCookie,
		hasAnySession: !!sessionCookie
	});

	const primaryCsrfCookie = event.cookies.get(CSRF_COOKIE_NAME);
	const legacyAxonCsrfCookie = event.cookies.get(LEGACY_AXON_CSRF_COOKIE);
	const csrfCookieValue = primaryCsrfCookie ?? legacyAxonCsrfCookie;

	// Always clear legacy cookies if encountered
	const legacySession = event.cookies.get(LEGACY_SESSION_COOKIE);
	if (legacySession) {
		event.cookies.delete(LEGACY_SESSION_COOKIE, { path: '/' });
	}
	const legacyUser = event.cookies.get(LEGACY_USER_COOKIE);
	if (legacyUser) {
		event.cookies.delete(LEGACY_USER_COOKIE, { path: '/' });
	}
	if (legacyAxonSessionCookie) {
		event.cookies.delete(LEGACY_AXON_SESSION_COOKIE, { path: '/' });
	}
	if (legacyAxonCsrfCookie) {
		event.cookies.delete(LEGACY_AXON_CSRF_COOKIE, { path: '/' });
	}

	if (!sessionCookie) {
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		if (csrfCookieValue) {
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
		console.warn('⚠️  Session record not found in Convex for sessionId:', sessionId);
		clearSessionCookies(event);
		event.locals.auth = {
			sessionId: undefined,
			user: null
		};
		return;
	}

	console.log('✅ Session record found:', {
		sessionId: record.sessionId,
		expiresAt: new Date(record.expiresAt).toISOString(),
		userEmail: record.userSnapshot?.email
	});

	const now = Date.now();

	if (record.expiresAt <= now) {
		console.warn('⚠️  Session expired:', {
			sessionId: record.sessionId,
			expiresAt: new Date(record.expiresAt).toISOString(),
			now: new Date(now).toISOString()
		});
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
	let csrfToken = csrfCookieValue;

	const csrfMismatch = !csrfToken || hashValue(csrfToken) !== record.csrfTokenHash;
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
			console.error('❌ Failed to refresh WorkOS session - logging user out', {
				sessionId: record.sessionId,
				userEmail: record.userSnapshot?.email,
				error: (error as Error)?.message
			});
			await invalidateSession(record.sessionId);
			clearSessionCookies(event);
			event.locals.auth = {
				sessionId: undefined,
				user: null
			};
			return;
		}
	} else {
		// Get client address with fallback for test environments (e.g., Playwright)
		let ipAddress: string;
		try {
			ipAddress = event.getClientAddress();
		} catch (_error) {
			// Fallback for environments where getClientAddress fails
			ipAddress =
				event.request.headers.get('x-forwarded-for') ||
				event.request.headers.get('x-real-ip') ||
				'127.0.0.1';

			if (env.E2E_TEST_MODE === 'true') {
				console.log(
					'⚠️ getClientAddress failed in resolveRequestSession, using fallback:',
					ipAddress
				);
			}
		}

		await touchSession({
			sessionId: record.sessionId,
			ipAddress,
			userAgent: event.request.headers.get('user-agent'),
			now
		});
	}

	// Normalize activeWorkspace to ensure id is string | null (not optional)
	const activeWorkspace = record.userSnapshot.activeWorkspace
		? {
				type: record.userSnapshot.activeWorkspace.type,
				id: record.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string | null, not optional
				name: record.userSnapshot.activeWorkspace.name
			}
		: {
				type: 'personal' as const,
				id: null,
				name: 'Private workspace'
			};

	event.locals.auth = {
		sessionId: activeSessionId,
		user: {
			userId: record.userSnapshot.userId, // Id<'users'> is compatible with string at runtime
			workosId: record.userSnapshot.workosId,
			email: record.userSnapshot.email,
			firstName: record.userSnapshot.firstName,
			lastName: record.userSnapshot.lastName,
			name: record.userSnapshot.name,
			activeWorkspace
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
	event.cookies.delete(LEGACY_AXON_SESSION_COOKIE, { path: '/' });
	event.cookies.delete(LEGACY_AXON_CSRF_COOKIE, { path: '/' });
	event.cookies.delete(LEGACY_SESSION_COOKIE, { path: '/' });
	event.cookies.delete(LEGACY_USER_COOKIE, { path: '/' });
}
