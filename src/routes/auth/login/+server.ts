import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { authenticateWithPassword } from '$lib/server/auth/workos';
import { establishSession } from '$lib/server/auth/session';

/**
 * Headless password authentication endpoint
 * POST /auth/login
 * Body: { email, password, redirect? }
 */
export const POST: RequestHandler = async (event) => {
	console.log('🔍 POST /auth/login - Headless password authentication');

	try {
		const body = await event.request.json();
		const { email, password, redirect } = body;

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

		console.log('✅ Session established successfully');

		return json({
			success: true,
			redirectTo: redirect ?? '/inbox'
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
		if (errorMessage.includes('403') || errorMessage.includes('locked') || errorMessage.includes('suspended')) {
			return json(
				{ error: 'Your account has been locked. Please contact support for assistance.' },
				{ status: 403 }
			);
		}

		// Account not found
		if (errorMessage.includes('404') || errorMessage.includes('not found')) {
			return json(
				{ error: 'No account found with this email. Please check your email or create a new account.' },
				{ status: 404 }
			);
		}

		// Network or server error
		return json(
			{ error: 'Unable to sign in. Please check your connection and try again.' },
			{ status: 500 }
		);
	}
};

