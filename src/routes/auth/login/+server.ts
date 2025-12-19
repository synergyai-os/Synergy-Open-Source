import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api, type Id } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { authenticateWithPassword } from '$lib/infrastructure/auth/server/workos';
import { establishSession } from '$lib/infrastructure/auth/server/session';
import {
	generateSessionId,
	generateRandomToken,
	hashValue,
	encryptSecret
} from '$lib/infrastructure/auth/server/crypto';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';
import { resolveWorkspaceRedirect } from '$lib/infrastructure/auth/server/workspaceRedirect';
import { invariant } from '$lib/utils/invariant';
import { logger } from '$lib/utils/logger';

/**
 * Headless password authentication endpoint
 * POST /auth/login
 * Body: { email, password, redirect? }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.login, async ({ event }) => {
	console.log('🔍 POST /auth/login - Headless password authentication');

	try {
		const body = await event.request.json();
		const { email, password, redirect, linkAccount } = body;

		if (!email || !password) {
			console.error('❌ Missing email or password');
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.error('❌ Invalid email format');
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		console.log('🔍 Authenticating user:', email);

		// Authenticate with WorkOS
		const authResponse = await authenticateWithPassword({
			email,
			password,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent')
		});

		console.log('✅ WorkOS authentication successful');

		// Sync user to Convex
		console.log('🔍 Syncing user to Convex...');
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, {
			sessionId: event.locals.auth?.sessionId,
			workosId: authResponse.user.id,
			email: authResponse.user.email,
			firstName: authResponse.user.first_name,
			lastName: authResponse.user.last_name,
			emailVerified: authResponse.user.email_verified ?? true
		});

		console.log('✅ User synced to Convex, userId:', convexUserId);

		// Calculate session expiry (30 days from now, not the WorkOS token expiry!)
		const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const expiresAt = Date.now() + SESSION_TTL_MS;

		// --- ACCOUNT LINKING FLOW ---
		if (linkAccount) {
			console.log('🔗 Account linking flow detected');

			// Get primary user from current session
			const primaryUserId = event.locals.auth?.user?.userId as Id<'users'> | undefined;
			const primarySessionId = event.locals.auth?.sessionId as string | undefined;
			if (!primaryUserId) {
				console.error('❌ No primary user in session for linking');
				return json(
					{ error: 'Session expired. Please log in again to link accounts.' },
					{ status: 401 }
				);
			}
			if (!primarySessionId) {
				console.error('❌ No sessionId in session for linking');
				return json(
					{ error: 'Session expired. Please log in again to link accounts.' },
					{ status: 401 }
				);
			}

			try {
				console.log('🔗 Linking accounts:', { primaryUserId, linkedUserId: convexUserId });

				// Link the accounts in Convex
				await convex.mutation(api.core.users.index.linkAccounts, {
					sessionId: primarySessionId,
					targetUserId: convexUserId
				});

				console.log('✅ Accounts linked successfully');

				// Create session record for the linked account (but don't establish it in cookies)
				const linkedSessionId = generateSessionId();
				const linkedCsrfToken = generateRandomToken(32);
				const accessTokenCiphertext = encryptSecret(authResponse.access_token);
				const refreshTokenCiphertext = encryptSecret(authResponse.refresh_token);
				const csrfTokenHash = hashValue(linkedCsrfToken);

				await convex.mutation(api.infrastructure.authSessions.createSession, {
					sessionId: linkedSessionId,
					convexUserId,
					workosUserId: authResponse.user.id,
					workosSessionId: authResponse.session.id,
					accessTokenCiphertext,
					refreshTokenCiphertext,
					csrfTokenHash,
					expiresAt,
					createdAt: Date.now(),
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
					userAgent: event.request.headers.get('user-agent') ?? undefined
				});

				console.log('✅ Session record created for linked account');

				// AUTO-SWITCH: Establish session for the newly linked account (user wants to use it now!)
				console.log('🔄 Switching to newly linked account...');
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
				console.log('✅ Switched to newly linked account successfully');

				// Redirect with linked=1 flag to show success toast
				return json({
					success: true,
					redirectTo: `${redirect ?? '/auth/redirect'}?linked=1`
				});
			} catch (linkError: unknown) {
				console.error('❌ Account linking failed:', linkError);

				// Handle specific linking errors
				const errorMessage = linkError instanceof Error ? linkError.message : String(linkError);
				if (errorMessage.includes('Cannot link more than')) {
					return json(
						{
							error: 'Too many linked accounts',
							message: `You've reached the maximum of 10 linked accounts. Please unlink an account first.`
						},
						{ status: 400 }
					);
				}

				if (errorMessage.includes('would exceed maximum depth')) {
					return json(
						{
							error: 'Link depth exceeded',
							message:
								'Cannot link these accounts due to complexity limits. Please contact support.'
						},
						{ status: 400 }
					);
				}

				// Generic linking error
				return json({ error: 'Failed to link accounts. Please try again.' }, { status: 500 });
			}
		}

		// --- NORMAL LOGIN FLOW ---
		// Establish session
		console.log('🔍 Establishing session...');
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

		console.log('✅ Session established successfully');

		// Check if user logged in from invite link - accept invite automatically
		let redirectTo: string | undefined = redirect ?? undefined;
		const inviteMatch = redirectTo?.match(/^\/invite\?code=([^&]+)/);

		if (inviteMatch) {
			const inviteCode = inviteMatch[1];
			console.log('🔍 User logged in from invite link, accepting invite:', inviteCode);

			try {
				// Get invite details (workspace invites only)
				const inviteDetails = await convex.query(api.core.workspaces.index.findInviteByCode, {
					sessionId,
					code: inviteCode
				});

				if (!inviteDetails) {
					console.error('❌ Invite not found:', inviteCode);
					redirectTo = undefined;
				} else if (inviteDetails.type === 'workspace') {
					// Accept workspace invite
					const acceptResult = await convex.mutation(
						api.core.workspaces.index.acceptOrganizationInvite,
						{
							sessionId,
							code: inviteCode
						}
					);

					console.log(
						'✅ Workspace invite accepted, redirecting to workspace:',
						acceptResult.workspaceId
					);

					// Get workspace slug from workspaceId
					const workspace = (await convex.query(api.core.workspaces.index.findById, {
						sessionId,
						workspaceId: acceptResult.workspaceId
					})) as { slug?: string } | null;

					if (workspace?.slug) {
						redirectTo = `/w/${workspace.slug}/chart`;
					} else {
						// Fallback: redirect to auth redirect handler
						redirectTo = '/auth/redirect';
					}
				} else {
					// Unknown invite type, redirect to inbox
					console.error('❌ Unknown invite type:', inviteDetails.type);
					redirectTo = undefined;
				}
			} catch (inviteError) {
				console.error('❌ Failed to accept invite:', inviteError);
				// If invite acceptance fails, fall back to default workspace redirect
				redirectTo = undefined;
			}
		}

		// Default to workspace-scoped inbox if no explicit redirect
		if (!redirectTo) {
			try {
				redirectTo = await resolveWorkspaceRedirect({
					client: convex,
					sessionId: event.locals.auth.sessionId!,
					activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null
				});
			} catch (resolveError) {
				logger.warn(
					'auth.login',
					'Failed to resolve workspace redirect after login, sending to onboarding',
					{
						error: String(resolveError),
						userId: event.locals.auth.user?.userId
					}
				);
				redirectTo = '/onboarding?auth_fallback=login_resolve_failed';
			}
		}

		const finalRedirect =
			redirectTo ?? (() => invariant(false, 'Failed to resolve post-login redirect'))();

		return json({
			success: true,
			redirectTo: finalRedirect
		});
	} catch (err) {
		console.error('❌ Login error:', err);

		// Parse WorkOS error if available
		const errorMessage = (err as Error)?.message ?? 'Authentication failed';

		// Invalid credentials (wrong email or password)
		if (errorMessage.includes('401') || errorMessage.includes('invalid_credentials')) {
			return json(
				{ error: 'Incorrect email or password. Please try again or create a new account.' },
				{ status: 401 }
			);
		}

		// Account locked or suspended
		if (
			errorMessage.includes('403') ||
			errorMessage.includes('locked') ||
			errorMessage.includes('suspended')
		) {
			return json(
				{ error: 'Your account has been locked. Please contact support for assistance.' },
				{ status: 403 }
			);
		}

		// Account not found
		if (errorMessage.includes('404') || errorMessage.includes('not found')) {
			return json(
				{
					error:
						'No account found with this email. Please check your email or create a new account.'
				},
				{ status: 404 }
			);
		}

		// Network or server error
		return json(
			{ error: 'Unable to sign in. Please check your connection and try again.' },
			{ status: 500 }
		);
	}
});
