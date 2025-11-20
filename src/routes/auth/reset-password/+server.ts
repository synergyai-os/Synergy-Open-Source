import { json, type RequestHandler } from '@sveltejs/kit';
import { resetPassword, WorkOSError } from '$lib/infrastructure/auth/server/workos';
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

		// Check if it's a WorkOSError with status code
		if (err instanceof WorkOSError) {
			// Use the status code from WorkOS API response
			const statusCode = err.statusCode;

			// 400 Bad Request - invalid/expired token or validation error
			if (statusCode === 400) {
				const errorText = err.originalError?.toLowerCase() ?? '';
				// Check if it's a weak password error
				if (
					errorText.includes('password') &&
					(errorText.includes('weak') || errorText.includes('too short'))
				) {
					return json(
						{
							error:
								'Password must be at least 8 characters long. Please choose a stronger password.'
						},
						{ status: 400 }
					);
				}
				// Default 400 error - invalid/expired token
				return json(
					{ error: 'Invalid or expired reset link. Please request a new password reset.' },
					{ status: 400 }
				);
			}

			// 410 Gone - token expired (if WorkOS uses this)
			if (statusCode === 410) {
				return json(
					{ error: 'Reset link has expired. Please request a new password reset.' },
					{ status: 410 }
				);
			}

			// Other 4xx errors - client errors
			if (statusCode >= 400 && statusCode < 500) {
				return json(
					{ error: 'Invalid or expired reset link. Please request a new password reset.' },
					{ status: 400 }
				);
			}
		}

		// Fallback: Check error message for backward compatibility
		const errorMessage = (err as Error)?.message ?? 'Failed to reset password';

		// Check for specific error patterns in message
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

		// Generic server error (only for unexpected 5xx or unknown errors)
		return json(
			{ error: 'Unable to reset password. Please try again or request a new reset link.' },
			{ status: 500 }
		);
	}
});
