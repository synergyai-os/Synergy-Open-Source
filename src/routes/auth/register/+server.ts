import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
// TODO: Re-enable when internal is needed
// import { internal } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';
import { encryptSecret } from '$lib/infrastructure/auth/server/crypto';
import { env } from '$env/dynamic/private';

/**
 * Headless user registration endpoint (Step 1: Send verification email)
 * POST /auth/register
 * Body: { email, password, firstName?, lastName?, redirect? }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.register, async ({ event }) => {
	console.log('🔍 POST /auth/register - Start registration with email verification');

	try {
		const body = await event.request.json();
		const { email, password, firstName, lastName, redirect } = body;

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

		// Validate password strength (minimum 8 characters)
		if (password.length < 8) {
			console.error('❌ Password too short');
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		// Validate password doesn't contain email (WorkOS requirement)
		// Strip + aliases (e.g., "user+alias@example.com" -> "user")
		const emailLocalPart = email.split('@')[0].split('+')[0].toLowerCase();
		const passwordLower = password.toLowerCase();

		// Check if password contains email username (minimum 4 chars to avoid false positives)
		if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
			console.error('❌ Password contains email username:', emailLocalPart);
			return json(
				{
					error: 'Password must not contain your email address. Please choose a different password.'
				},
				{ status: 400 }
			);
		}

		// Check if user already exists in WorkOS
		const { getUserByEmail } = await import('$lib/infrastructure/auth/server/workos');
		const existingUser = await getUserByEmail(email);
		if (existingUser) {
			console.error('❌ Email already registered:', email);
			return json(
				{
					error: 'This email is already registered. Please sign in instead.',
					redirectToLogin: true
				},
				{ status: 409 }
			);
		}

		console.log('🔍 Creating verification code and sending email for:', email);

		// Only skip emails when actually running E2E tests (Playwright)
		// E2E tests run with 'npm run dev:test' which sets Vite mode to 'test'
		// Normal dev ('npm run dev') should always send emails for manual testing
		const isTestMode = import.meta.env.MODE === 'test';
		const skipEmail =
			isTestMode && (process.env.E2E_TEST_MODE === 'true' || env.E2E_TEST_MODE === 'true');

		// Create verification code and send email (single public action)
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		await convex.action(api.infrastructure.auth.verification.createAndSendVerificationCode, {
			email,
			type: 'registration',
			firstName: firstName || undefined,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent') ?? undefined,
			skipEmail: skipEmail || undefined // Only pass if true, undefined otherwise
		});

		console.log('✅ Verification code created and email sent');

		// Store registration data in session for verification step
		// Encrypt password before storing
		const passwordCiphertext = encryptSecret(password);

		const shouldUseSecureCookies = event.url.protocol === 'https:';

		event.cookies.set(
			'registration_pending',
			JSON.stringify({
				email,
				passwordCiphertext,
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				redirect: redirect || undefined
			}),
			{
				path: '/',
				httpOnly: true,
				// In dev we often run on http://localhost. Secure cookies would be dropped,
				// breaking the multi-step registration flow ("No registration data found").
				secure: shouldUseSecureCookies,
				sameSite: 'lax',
				maxAge: 60 * 15 // 15 minutes (longer than verification code expiry)
			}
		);

		return json({
			success: true,
			requiresVerification: true,
			email
		});
	} catch (err) {
		console.error('❌ Registration error:', err);
		console.error('❌ Error stack:', (err as Error)?.stack);
		console.error('❌ Error message:', (err as Error)?.message);

		// Parse error message
		const errorMessage = (err as Error)?.message ?? 'Registration failed';

		// Network or server error
		return json({ error: `Unable to start registration: ${errorMessage}` }, { status: 500 });
	}
});
