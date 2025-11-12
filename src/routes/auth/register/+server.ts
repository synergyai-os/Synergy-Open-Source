import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createUserWithPassword, authenticateWithPassword } from '$lib/server/auth/workos';
import { establishSession } from '$lib/server/auth/session';
import { generateSessionId, generateRandomToken, hashValue, encryptSecret } from '$lib/server/auth/crypto';
import type { Id } from '$lib/convex';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * Headless user registration endpoint
 * POST /auth/register
 * Body: { email, password, firstName?, lastName?, redirect? }
 */
export const POST: RequestHandler = withRateLimit(
	RATE_LIMITS.register,
	async ({ event }) => {
		console.log('🔍 POST /auth/register - Headless user registration');

	try {
		const body = await event.request.json();
		const { email, password, firstName, lastName, redirect, linkAccount } = body;

		if (!email || !password) {
			console.error('❌ Missing email or password');
			return json(
				{ error: 'Email and password are required' },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.error('❌ Invalid email format');
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate password strength (minimum 8 characters)
		if (password.length < 8) {
			console.error('❌ Password too short');
			return json(
				{ error: 'Password must be at least 8 characters' },
				{ status: 400 }
			);
		}

		console.log('🔍 Creating user:', email);

		// Create user in WorkOS
		await createUserWithPassword({
			email,
			password,
			firstName,
			lastName
		});

		console.log('✅ User created, now authenticating...');

		// Immediately authenticate the new user
		const authResponse = await authenticateWithPassword({
			email,
			password,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent')
		});

		console.log('✅ User authenticated after registration');

		// Sync user to Convex
		console.log('🔍 Syncing user to Convex...');
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

		const convexUserId = await convex.mutation(api.users.syncUserFromWorkOS, {
			workosId: authResponse.user.id,
			email: authResponse.user.email,
			firstName: authResponse.user.first_name,
			lastName: authResponse.user.last_name,
			emailVerified: authResponse.user.email_verified ?? false
		});

		console.log('✅ User synced to Convex, userId:', convexUserId);

		// Calculate session expiry (30 days from now, not the WorkOS token expiry!)
		const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const expiresAt = Date.now() + SESSION_TTL_MS;

		// --- ACCOUNT LINKING FLOW ---
		if (linkAccount) {
			console.log('🔗 Account linking requested during registration');
			
			try {
				// Get primary user from current session (already resolved by hooks)
				const primaryUserId = event.locals.auth?.user?.userId as Id<'users'> | undefined;
				if (!primaryUserId) {
					console.error('❌ No primary user in session for linking');
					return json(
						{ error: 'Session expired. Please log in again to link accounts.' },
						{ status: 401 }
					);
				}
				console.log('🔗 Linking accounts:', { primaryUserId, newUserId: convexUserId });

				// Link accounts (bidirectional)
				await convex.mutation(api.users.linkAccounts, {
					primaryUserId,
					linkedUserId: convexUserId
				});
				console.log('✅ Accounts linked successfully');

				// Create session record for the newly linked account
				const linkedSessionId = generateSessionId();
				const linkedCsrfToken = generateRandomToken(32);
				const accessTokenCiphertext = encryptSecret(authResponse.access_token);
				const refreshTokenCiphertext = encryptSecret(authResponse.refresh_token);
				const csrfTokenHash = hashValue(linkedCsrfToken);

				await convex.mutation(api.authSessions.createSession, {
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
								: authResponse.user.first_name ?? authResponse.user.last_name ?? undefined
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
								: authResponse.user.first_name ?? authResponse.user.last_name ?? undefined
					}
				});
				console.log('✅ Switched to newly linked account successfully');

				// Redirect with linked=1 flag to show success toast
				return json({
					success: true,
					redirectTo: `${redirect ?? '/inbox'}?linked=1`
				});
			} catch (linkError) {
				console.error('❌ Account linking failed:', linkError);
				return json(
					{ error: 'Failed to link accounts. Please try again.' },
					{ status: 500 }
				);
			}
		}

		// --- NORMAL REGISTRATION FLOW ---
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
						: authResponse.user.first_name ?? authResponse.user.last_name ?? undefined
			}
		});

		console.log('✅ Registration complete, session established');

		return json({
			success: true,
			redirectTo: redirect ?? '/inbox'
		});
	} catch (err) {
		console.error('❌ Registration error:', err);

		// Parse WorkOS error if available
		const errorMessage = (err as Error)?.message ?? 'Registration failed';
		
		// Check for duplicate email error
		// WorkOS returns: "email_not_available", "already exists", or 400/409/422 status codes
		if (
			errorMessage.includes('400') || 
			errorMessage.includes('422') || 
			errorMessage.includes('409') || 
			errorMessage.includes('email_not_available') ||
			errorMessage.includes('already exists') ||
			errorMessage.includes('not available') ||
			errorMessage.includes('duplicate') ||
			(errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('taken'))
		) {
			return json(
				{ 
					error: 'This email is already registered',
					redirectToLogin: true
				},
				{ status: 409 }
			);
		}

		// Invalid email format
		if (errorMessage.includes('invalid_email') || errorMessage.includes('email format')) {
			return json(
				{ error: 'Please enter a valid email address.' },
				{ status: 400 }
			);
		}

		// Weak password
		if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('too short'))) {
			return json(
				{ error: 'Password must be at least 8 characters long. Please choose a stronger password.' },
				{ status: 400 }
			);
		}

		// Network or server error
		return json(
			{ error: 'Unable to create account. Please check your connection and try again.' },
			{ status: 500 }
		);
	}
});

