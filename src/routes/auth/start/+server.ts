import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createLoginState } from '$lib/server/auth/sessionStore';
import { generateRandomToken } from '$lib/server/auth/crypto';
import { createHash } from 'node:crypto';

const WORKOS_AUTHORIZE_URL = 'https://api.workos.com/user_management/authorize';

function computeCodeChallenge(codeVerifier: string) {
	return createHash('sha256').update(codeVerifier).digest('base64url');
}

export const GET: RequestHandler = async (event) => {
	if (!env.WORKOS_CLIENT_ID) {
		throw new Error('WORKOS_CLIENT_ID is not configured.');
	}

	if (!env.WORKOS_REDIRECT_URI) {
		throw new Error('WORKOS_REDIRECT_URI is not configured.');
	}

	const redirectTo =
		event.url.searchParams.get('redirect') ??
		event.url.searchParams.get('redirectTo') ??
		'/inbox';

	const state = generateRandomToken(32);
	const codeVerifier = generateRandomToken(48);
	const codeChallenge = computeCodeChallenge(codeVerifier);

	await createLoginState({
		state,
		codeVerifier,
		redirectTo,
		ipAddress: event.getClientAddress(),
		userAgent: event.request.headers.get('user-agent')
	});

	const authorizeUrl = new URL(WORKOS_AUTHORIZE_URL);
	authorizeUrl.searchParams.set('client_id', env.WORKOS_CLIENT_ID);
	authorizeUrl.searchParams.set('redirect_uri', env.WORKOS_REDIRECT_URI);
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('code_challenge', codeChallenge);
	authorizeUrl.searchParams.set('code_challenge_method', 'S256');
	authorizeUrl.searchParams.set('state', state);
	authorizeUrl.searchParams.set('provider', 'authkit');
	authorizeUrl.searchParams.set('screen_hint', 'sign-in');

	throw redirect(302, authorizeUrl.toString());
};
