import { json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

/**
 * Resend verification code endpoint
 * POST /auth/resend-code
 * Body: { email, type: 'registration' | 'login' | 'email_change' }
 */
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.register, async ({ event }) => {
	console.log('🔍 POST /auth/resend-code - Resend verification code');

	try {
		const body = await event.request.json();
		const { email, type, firstName } = body;

		if (!email || !type) {
			console.error('❌ Missing email or type');
			return json({ error: 'Email and type are required' }, { status: 400 });
		}

		// Validate type
		if (!['registration', 'login', 'email_change'].includes(type)) {
			console.error('❌ Invalid type');
			return json({ error: 'Invalid verification type' }, { status: 400 });
		}

		console.log('🔍 Resending verification code for:', email);

		// Create new verification code and send email
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		await convex.action(api.verification.createAndSendVerificationCode, {
			email,
			type,
			firstName: firstName || undefined,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent') ?? undefined
		});

		console.log('✅ Verification code resent');

		return json({
			success: true,
			message: 'Verification code sent! Check your email.'
		});
	} catch (err) {
		console.error('❌ Resend code error:', err);
		const _errorMessage = (err as Error)?.message ?? 'Failed to resend code';

		return json({ error: 'Unable to resend code. Please try again.' }, { status: 500 });
	}
});
