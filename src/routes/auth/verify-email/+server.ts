import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import {
	createUserWithPassword,
	authenticateWithPassword
} from '$lib/infrastructure/auth/server/workos';
import { establishSession } from '$lib/infrastructure/auth/server/session';
import { decryptSecret } from '$lib/infrastructure/auth/server/crypto';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * Email verification endpoint (Step 2: Verify code and create account)
 * POST /auth/verify-email
 * Body: { email, code }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.login, async ({ event }) => {
	console.log('🔍 POST /auth/verify-email - Verify code and create account');

	try {
		const body = await event.request.json();
		const { email, code } = body;

		if (!email || !code) {
			console.error('❌ Missing email or code');
			return json({ error: 'Email and code are required' }, { status: 400 });
		}

		// Verify the code
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const verificationResult = await convex.mutation(api.verification.verifyCode, {
			email,
			code,
			type: 'registration'
		});

		if (!verificationResult.success) {
			console.error('❌ Verification failed:', verificationResult.error);
			return json({ error: verificationResult.error }, { status: 400 });
		}

		console.log('✅ Code verified successfully');

		// Get registration data from session
		const registrationDataStr = event.cookies.get('registration_pending');
		if (!registrationDataStr) {
			console.error('❌ No registration data found');
			return json(
				{ error: 'Registration session expired. Please register again.' },
				{ status: 400 }
			);
		}

		const registrationData = JSON.parse(registrationDataStr);

		// Verify email matches
		if (registrationData.email !== email) {
			console.error('❌ Email mismatch');
			return json({ error: 'Invalid verification session' }, { status: 400 });
		}

		// Decrypt password
		const password = decryptSecret(registrationData.passwordCiphertext);

		console.log('🔍 Creating WorkOS user:', email);

		// Create user in WorkOS
		await createUserWithPassword({
			email,
			password,
			firstName: registrationData.firstName,
			lastName: registrationData.lastName
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

		const convexUserId = await convex.mutation(api.users.syncUserFromWorkOS, {
			workosId: authResponse.user.id,
			email: authResponse.user.email,
			firstName: authResponse.user.first_name,
			lastName: authResponse.user.last_name,
			emailVerified: true // Email is verified via PIN code
		});

		console.log('✅ User synced to Convex, userId:', convexUserId);

		// Calculate session expiry (30 days from now)
		const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const expiresAt = Date.now() + SESSION_TTL_MS;

		// Establish session
		console.log('🔍 Establishing session...');
		const sessionId = await establishSession({
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

		console.log('✅ Registration complete, session established');

		// Clear registration cookie
		event.cookies.delete('registration_pending', { path: '/' });

		// Check if user registered from invite link - accept invite automatically
		let redirectTo = registrationData.redirect ?? '/auth/redirect';
		const inviteMatch = redirectTo.match(/^\/invite\?code=([^&]+)/);

		if (inviteMatch) {
			const inviteCode = inviteMatch[1];
			console.log('🔍 User registered from invite link, accepting invite:', inviteCode);

			try {
				// Get invite details (workspace invites only)
				const inviteDetails = await convex.query(api.workspaces.findInviteByCode, {
					code: inviteCode
				});

				if (!inviteDetails) {
					console.error('❌ Invite not found:', inviteCode);
					redirectTo = '/auth/redirect';
				} else if (inviteDetails.type === 'workspace') {
					// Accept workspace invite
					const acceptResult = await convex.mutation(api.workspaces.acceptOrganizationInvite, {
						sessionId,
						code: inviteCode
					});

					console.log(
						'✅ Organization invite accepted, redirecting to workspace:',
						acceptResult.workspaceId
					);
					redirectTo = `/org/circles?org=${acceptResult.workspaceId}`;
				} else {
					// Unknown invite type, redirect to inbox
					console.error('❌ Unknown invite type:', inviteDetails.type);
					redirectTo = '/auth/redirect';
				}
			} catch (inviteError) {
				console.error('❌ Failed to accept invite:', inviteError);
				// If invite acceptance fails, redirect to inbox instead
				// User can manually accept invite later if needed
				redirectTo = '/auth/redirect';
			}
		}

		return json({
			success: true,
			redirectTo
		});
	} catch (err) {
		console.error('❌ Verification error:', err);

		// Parse WorkOS error if available
		const errorMessage = (err as Error)?.message ?? 'Verification failed';

		// Check for password strength errors
		if (
			errorMessage.includes('password_strength_error') ||
			errorMessage.includes('Password does not meet strength requirements') ||
			errorMessage.includes('password_contains_email')
		) {
			return json(
				{
					error:
						'Password is too weak. Please go back and choose a stronger password that does not contain your email address.',
					requiresPasswordChange: true
				},
				{ status: 400 }
			);
		}

		// Check for duplicate email error
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

		// Network or server error
		return json({ error: 'Unable to complete registration. Please try again.' }, { status: 500 });
	}
});
