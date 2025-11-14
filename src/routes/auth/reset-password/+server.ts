import { json, type RequestHandler } from '@sveltejs/kit';
import { resetPassword } from '$lib/server/auth/workos';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * Reset password endpoint
 * POST /auth/reset-password
 * Body: { token, newPassword }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.login, async ({ event }) => {
	console.log('🔍 POST /auth/reset-password - Reset password with token');

	try {
		const body = await event.request.json();
		const { token, newPassword } = body;

		if (!token || !newPassword) {
			console.error('❌ Missing token or password');
			return json({ error: 'Token and new password are required' }, { status: 400 });
		}

		// Validate password strength (minimum 8 characters)
		if (newPassword.length < 8) {
			console.error('❌ Password too short');
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		console.log('🔍 Resetting password with token');

		// Reset password with WorkOS
		await resetPassword({
			token,
			newPassword
		});

		console.log('✅ Password reset successful');

		return json({
			success: true,
			message: 'Password reset successfully. You can now log in with your new password.'
		});
	} catch (err) {
		console.error('❌ Reset password error:', err);

		// Parse error message
		const errorMessage = (err as Error)?.message ?? 'Failed to reset password';

		// Check for specific WorkOS errors
		if (
			errorMessage.includes('400') ||
			errorMessage.includes('invalid') ||
			errorMessage.includes('expired')
		) {
			return json(
				{ error: 'Invalid or expired reset link. Please request a new password reset.' },
				{ status: 400 }
			);
		}

		// Weak password error
		if (
			errorMessage.includes('password') &&
			(errorMessage.includes('weak') || errorMessage.includes('too short'))
		) {
			return json(
				{
					error: 'Password must be at least 8 characters long. Please choose a stronger password.'
				},
				{ status: 400 }
			);
		}

		// Generic error
		return json(
			{ error: 'Unable to reset password. Please try again or request a new reset link.' },
			{ status: 500 }
		);
	}
});
