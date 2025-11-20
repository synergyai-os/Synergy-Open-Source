import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { Id } from '$lib/convex';
import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore';
import { establishSession } from '$lib/infrastructure/auth/server/session';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

function sanitizeRedirect(target: unknown, origin: string): string | undefined {
	if (typeof target !== 'string' || target.length === 0) {
		return undefined;
	}

	try {
		const url = new URL(target, origin);
		if (url.origin !== origin) return undefined;
		if (!url.pathname.startsWith('/')) return undefined;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return undefined;
	}
}

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.accountSwitch, async ({ event }) => {
	if (!event.locals.auth.sessionId || !event.locals.auth.user?.userId) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const csrfHeader = event.request.headers.get('x-csrf-token');
	if (!csrfHeader || csrfHeader !== event.locals.auth.csrfToken) {
		return json({ error: 'Invalid CSRF token' }, { status: 403 });
	}

	let payload: unknown;
	try {
		payload = await event.request.json();
	} catch (_error) {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	if (
		!payload ||
		typeof payload !== 'object' ||
		!(payload as { targetUserId?: unknown }).targetUserId ||
		typeof (payload as { targetUserId: unknown }).targetUserId !== 'string'
	) {
		return json({ error: 'Missing target user' }, { status: 400 });
	}

	const targetUserId = (payload as { targetUserId: string }).targetUserId as Id<'users'>;
	const redirectHint = sanitizeRedirect(
		(payload as { redirect?: unknown }).redirect,
		event.url.origin
	);

	const currentUserId = event.locals.auth.user.userId as Id<'users'>;

	if (targetUserId === currentUserId) {
		return json({ success: true, redirect: redirectHint ?? '/inbox' });
	}

	if (!publicEnv.PUBLIC_CONVEX_URL) {
		throw new Error('PUBLIC_CONVEX_URL must be configured to switch accounts.');
	}

	const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

	const linkStatus = await convex.query(api.users.validateAccountLink, {
		primaryUserId: currentUserId,
		linkedUserId: targetUserId
	});

	if (!linkStatus?.linked) {
		return json(
			{
				error: 'Accounts are not linked',
				code: 'NOT_LINKED',
				message: 'These accounts are not connected. Please link them first.'
			},
			{ status: 403 }
		);
	}

	const targetSession = await getActiveSessionRecordForUser(targetUserId);

	if (!targetSession) {
		return json({ error: 'Linked account requires a fresh sign-in' }, { status: 409 });
	}

	if (targetSession.expiresAt <= Date.now()) {
		return json(
			{ error: 'Linked account session expired. Please sign in again.' },
			{ status: 409 }
		);
	}

	// Establish a new session for the linked account on this device
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

	console.log('✅ Account switch successful');

	// Note: Multi-session support - session is preserved in Convex and client localStorage
	return json({ success: true, redirect: redirectHint ?? '/inbox' });
});
