import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { consumeLoginState } from '$lib/infrastructure/auth/server/sessionStore';
import { exchangeAuthorizationCode } from '$lib/infrastructure/auth/server/workos';
import { establishSession } from '$lib/infrastructure/auth/server/session';

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
		console.log('🔍 Auth callback - Starting flow with state:', state?.substring(0, 10) + '...');

		const loginState = await consumeLoginState(state);

		if (!loginState) {
			console.error('❌ Invalid or expired login state.');
			throw redirect(302, '/login?error=invalid_state');
		}

		console.log('✅ Login state retrieved successfully');

		const {
			codeVerifier,
			redirectTo,
			flowMode: _flowMode,
			linkAccount,
			primaryUserId
		} = loginState;

		console.log('🔍 Exchanging authorization code with WorkOS...');
		const authResponse = await exchangeAuthorizationCode({
			code,
			codeVerifier
		});

		console.log('✅ Authorization code exchanged, user:', authResponse.user.email);

		console.log('🔍 Syncing user to Convex...');
		const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

		const convexUserId = await convex.mutation(api.users.syncUserFromWorkOS, {
			workosId: authResponse.user.id,
			email: authResponse.user.email,
			firstName: authResponse.user.first_name,
			lastName: authResponse.user.last_name,
			emailVerified: authResponse.user.email_verified ?? true
		});

		console.log('✅ User synced to Convex, userId:', convexUserId);

		const expiresAt =
			authResponse.session?.expires_at !== undefined
				? Date.parse(authResponse.session.expires_at)
				: Date.now() + authResponse.expires_in * 1000;

		// Handle account linking flow
		if (linkAccount && primaryUserId && primaryUserId !== convexUserId) {
			try {
				await convex.mutation(api.users.linkAccounts, {
					primaryUserId,
					linkedUserId: convexUserId
				});

				// Create session record for linked account (so they can switch to it later)
				const { createSessionRecord } = await import(
					'$lib/infrastructure/auth/server/sessionStore'
				);
				const { generateRandomToken } = await import('$lib/infrastructure/auth/server/crypto');

				await createSessionRecord({
					convexUserId,
					workosUserId: authResponse.user.id,
					workosSessionId: authResponse.session.id,
					accessToken: authResponse.access_token,
					refreshToken: authResponse.refresh_token,
					csrfToken: generateRandomToken(32),
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
								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined)
					},
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				});

				// Stay on primary account - redirect with success message
				const successUrl = new URL(redirectTo ?? '/inbox', event.url.origin);
				successUrl.searchParams.set('linked', '1');
				throw redirect(302, successUrl.pathname + successUrl.search);
			} catch (linkError) {
				console.error('Failed to link accounts', linkError);
				throw redirect(302, `/login?error=link_failed`);
			}
		}

		// Normal login/signup flow - establish session for the account that just logged in
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
						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined)
			}
		});

		throw redirect(302, redirectTo ?? '/inbox');
	} catch (err) {
		if (err instanceof Response) {
			throw err;
		}

		console.error('❌ Auth callback error:', err);
		console.error('Error details:', {
			name: (err as Error)?.name,
			message: (err as Error)?.message,
			stack: (err as Error)?.stack
		});
		throw redirect(302, '/login?error=callback_failed');
	}
};
