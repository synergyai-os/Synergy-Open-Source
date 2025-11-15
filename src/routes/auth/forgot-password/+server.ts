import { json, type RequestHandler } from '@sveltejs/kit';
// TODO: Re-enable when Convex client is needed
// import { ConvexHttpClient } from 'convex/browser';
// import { api, internal } from '$lib/convex';
// import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createPasswordReset } from '$lib/server/auth/workos';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * Forgot password endpoint
 * POST /auth/forgot-password
 * Body: { email }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.login, async ({ event }) => {
	console.log('🔍 POST /auth/forgot-password - Password reset request');

	try {
		const body = await event.request.json();
		const { email } = body;

		if (!email) {
			console.error('❌ Missing email');
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.error('❌ Invalid email format');
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		console.log('🔍 Creating password reset for:', email);

		// Create password reset with WorkOS (WorkOS will send the email)
		// Use event.url.origin to get the app URL dynamically
		const resetUrl = `${event.url.origin}/reset-password`;
		await createPasswordReset({
			email,
			passwordResetUrl: resetUrl
		});

		console.log('✅ Password reset email sent');

		// Always return success (don't leak if email exists or not)
		return json({
			success: true,
			message:
				'Check your email. If an account exists with this email, you will receive a password reset link.'
		});
	} catch (err) {
		console.error('❌ Forgot password error:', err);

		// Parse error message (not used but kept for future error handling)
		const _errorMessage = (err as Error)?.message ?? 'Failed to send reset email';

		// Don't leak information about whether user exists
		// Always return success message
		return json({
			success: true,
			message:
				'Check your email. If an account exists with this email, you will receive a password reset link.'
		});
	}
});
