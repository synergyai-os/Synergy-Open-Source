import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createUserWithPassword, authenticateWithPassword } from '$lib/server/auth/workos';
import { establishSession } from '$lib/server/auth/session';

/**
 * Headless user registration endpoint
 * POST /auth/register
 * Body: { email, password, firstName?, lastName?, redirect? }
 */
export const POST: RequestHandler = async (event) => {
	console.log('🔍 POST /auth/register - Headless user registration');

	try {
		const body = await event.request.json();
		const { email, password, firstName, lastName, redirect } = body;

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

		const expiresAt =
			authResponse.session?.expires_at !== undefined
				? Date.parse(authResponse.session.expires_at)
				: Date.now() + authResponse.expires_in * 1000;

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
};

