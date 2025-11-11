import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { consumeLoginState } from '$lib/server/auth/sessionStore';
import { exchangeAuthorizationCode } from '$lib/server/auth/workos';
import { establishSession } from '$lib/server/auth/session';

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const error = event.url.searchParams.get('error');
	const errorDescription = event.url.searchParams.get('error_description');

	if (error) {
		console.error('❌ WorkOS returned error:', error, errorDescription);
		throw redirect(302, `/login?error=${encodeURIComponent(error)}`);
	}

	if (!code || !state) {
		console.error('❌ Missing code or state in WorkOS callback');
		throw redirect(302, '/login?error=invalid_callback');
	}

	try {
		const loginState = await consumeLoginState(state);

		if (!loginState) {
			console.error('❌ Invalid or expired login state.');
			throw redirect(302, '/login?error=invalid_state');
		}

		const authResponse = await exchangeAuthorizationCode({
			code,
			codeVerifier: loginState.codeVerifier
		});

		const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

		const convexUserId = await convex.mutation(api.users.syncUserFromWorkOS, {
			workosId: authResponse.user.id,
			email: authResponse.user.email,
			firstName: authResponse.user.first_name,
			lastName: authResponse.user.last_name,
			emailVerified: authResponse.user.email_verified ?? true
		});

		const expiresAt =
			authResponse.session?.expires_at !== undefined
				? Date.parse(authResponse.session.expires_at)
				: Date.now() + authResponse.expires_in * 1000;

		await establishSession({
			event,
			convexUserId,
			workosUserId: authResponse.user.id,
			workosSessionId: authResponse.session.id,
			accessToken: authResponse.access_token,
			refreshToken: authResponse.refresh_token,
			expiresAt,
			userSnapshot: {
				userId: convexUserId,
				workosId: authResponse.user.id,
				email: authResponse.user.email,
				firstName: authResponse.user.first_name ?? undefined,
				lastName: authResponse.user.last_name ?? undefined,
				name:
					authResponse.user.first_name && authResponse.user.last_name
						? `${authResponse.user.first_name} ${authResponse.user.last_name}`
						: authResponse.user.first_name ?? authResponse.user.last_name ?? undefined
			}
		});

		throw redirect(302, loginState.redirectTo ?? '/inbox');
	} catch (err) {
		if (err instanceof Response) {
			throw err;
		}

		console.error('Auth callback error:', err);
		throw redirect(302, '/login?error=callback_failed');
	}
};
