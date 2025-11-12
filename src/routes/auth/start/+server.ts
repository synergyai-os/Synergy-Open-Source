import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { createLoginState, type AuthFlowMode } from '$lib/server/auth/sessionStore';
import { generateRandomToken } from '$lib/server/auth/crypto';
import { createHash } from 'node:crypto';
import type { Id } from '../../../convex/_generated/dataModel';

const WORKOS_AUTHORIZE_URL = 'https://api.workos.com/user_management/authorize';

function computeCodeChallenge(codeVerifier: string) {
	return createHash('sha256').update(codeVerifier).digest('base64url');
}

function sanitizeRedirect(target: string | null, origin: string): string | undefined {
	if (!target) return undefined;

	try {
		const url = new URL(target, origin);
		if (url.origin !== origin) {
			return undefined;
		}

		// Only allow same-origin paths
		if (!url.pathname.startsWith('/')) {
			return undefined;
		}

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return undefined;
	}
}

function parseMode(value: string | null): AuthFlowMode {
	if (!value) return 'sign-in';
	const normalized = value.toLowerCase();
	return normalized === 'sign-up' ? 'sign-up' : 'sign-in';
}

function parseBooleanFlag(value: string | null): boolean {
	if (!value) return false;
	const normalized = value.toLowerCase();
	return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function sanitizeEmail(value: string | null): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (trimmed.length === 0 || trimmed.length > 320) {
		return undefined;
	}

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailPattern.test(trimmed)) {
		return undefined;
	}

	return trimmed.toLowerCase();
}

export const GET: RequestHandler = async (event) => {
	console.log('🔍 Auth start - Initiating WorkOS flow');

	// Validate WorkOS configuration (checked at request time, not import time)
	if (!publicEnv.PUBLIC_WORKOS_CLIENT_ID) {
		console.error('❌ PUBLIC_WORKOS_CLIENT_ID is not configured');
		throw new Error('PUBLIC_WORKOS_CLIENT_ID is not configured.');
	}
	if (!env.WORKOS_REDIRECT_URI) {
		console.error('❌ WORKOS_REDIRECT_URI is not configured');
		throw new Error('WORKOS_REDIRECT_URI is not configured.');
	}

	console.log('✅ WorkOS credentials present');
	console.log('   Client ID:', publicEnv.PUBLIC_WORKOS_CLIENT_ID?.substring(0, 15) + '...');
	console.log('   Redirect URI:', env.WORKOS_REDIRECT_URI);

	const redirectParam =
		event.url.searchParams.get('redirect') ?? event.url.searchParams.get('redirectTo');
	const redirectTo = sanitizeRedirect(redirectParam, event.url.origin) ?? '/inbox';

	const flowMode = parseMode(event.url.searchParams.get('mode'));
	const linkAccount = parseBooleanFlag(
		event.url.searchParams.get('linkAccount') ?? event.url.searchParams.get('link_account')
	);
	const primaryUserId =
		linkAccount && event.locals.auth.user?.userId
			? (event.locals.auth.user.userId as Id<'users'>)
			: undefined;
	const loginHint = sanitizeEmail(
		event.url.searchParams.get('login_hint') ??
			event.url.searchParams.get('loginHint') ??
			event.url.searchParams.get('email')
	);

	console.log('🔍 Auth start params:', { flowMode, linkAccount, loginHint });

	const state = generateRandomToken(32);
	const codeVerifier = generateRandomToken(48);
	const codeChallenge = computeCodeChallenge(codeVerifier);

	console.log('🔍 Creating login state in Convex...');
	await createLoginState({
		state,
		codeVerifier,
		redirectTo,
		flowMode,
		linkAccount,
		primaryUserId,
		ipAddress: event.getClientAddress(),
		userAgent: event.request.headers.get('user-agent')
	});
	console.log('✅ Login state created');

	const authorizeUrl = new URL(WORKOS_AUTHORIZE_URL);
	authorizeUrl.searchParams.set('client_id', publicEnv.PUBLIC_WORKOS_CLIENT_ID);
	authorizeUrl.searchParams.set('redirect_uri', env.WORKOS_REDIRECT_URI);
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('code_challenge', codeChallenge);
	authorizeUrl.searchParams.set('code_challenge_method', 'S256');
	authorizeUrl.searchParams.set('state', state);
	authorizeUrl.searchParams.set('provider', 'authkit');
	const screenHint = linkAccount ? 'sign-in' : flowMode;
	authorizeUrl.searchParams.set('screen_hint', screenHint);
	if (loginHint) {
		authorizeUrl.searchParams.set('login_hint', loginHint);
	}

	console.log('✅ Redirecting to WorkOS:', authorizeUrl.toString().substring(0, 80) + '...');
	throw redirect(302, authorizeUrl.toString());
};
