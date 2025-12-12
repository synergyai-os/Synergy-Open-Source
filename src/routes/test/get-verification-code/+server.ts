import { json, type RequestHandler, error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

/**
 * Test helper endpoint to retrieve verification codes for E2E tests
 * GET /test/get-verification-code?email=test@example.com&type=registration
 *
 * SECURITY:
 * - Only enabled when E2E_TEST_MODE=true
 * - IP restricted to localhost only
 * - Returns latest non-expired verification code
 */
export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	// Check if E2E test mode is enabled
	// Check process.env first - Playwright's webServer.env sets process.env for the dev server
	// $env/dynamic/private reads from process.env at runtime, but checking directly is more reliable
	const e2eTestMode = process.env.E2E_TEST_MODE || env.E2E_TEST_MODE;

	if (e2eTestMode !== 'true') {
		console.error('❌ Test helper endpoint called but E2E_TEST_MODE is not enabled', {
			processEnvValue: process.env.E2E_TEST_MODE,
			envValue: env.E2E_TEST_MODE,
			allProcessEnvKeys: Object.keys(process.env).filter(
				(key) => key.includes('E2E') || key.includes('TEST')
			)
		});
		throw error(404, 'Not found');
	}

	// Debug log when test mode is enabled (only in test mode to avoid noise)
	console.log('✅ Test helper endpoint: E2E_TEST_MODE enabled', {
		source: process.env.E2E_TEST_MODE ? 'process.env' : 'env',
		value: e2eTestMode
	});

	// IP restriction: only allow localhost
	// In test mode, be more lenient with IP checks (Playwright may use different IPs)
	const clientIp = getClientAddress();
	const isLocalhost =
		clientIp === '127.0.0.1' ||
		clientIp === '::1' ||
		clientIp === 'localhost' ||
		clientIp.startsWith('127.') || // Allow 127.x.x.x range
		clientIp === '::ffff:127.0.0.1'; // IPv4-mapped IPv6 localhost

	if (!isLocalhost) {
		console.error('❌ Test helper endpoint accessed from non-localhost IP:', clientIp);
		throw error(403, 'Forbidden');
	}

	// Get parameters
	const email = url.searchParams.get('email');
	const type = url.searchParams.get('type') as 'registration' | 'login' | 'email_change' | null;

	if (!email || !type) {
		return json({ error: 'email and type are required' }, { status: 400 });
	}

	// Validate type
	if (!['registration', 'login', 'email_change'].includes(type)) {
		return json({ error: 'Invalid type' }, { status: 400 });
	}

	console.log('🔍 Test helper: Getting verification code for:', { email, type });

	try {
		// Query Convex for the actual verification code
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const codeData = await convex.query(api.infrastructure.auth.verification.getCodeForTesting, {
			email,
			type
		});

		if (!codeData) {
			console.log('❌ No verification code found for:', { email, type });
			return json({ error: 'No verification code found' }, { status: 404 });
		}

		if (codeData.isExpired) {
			console.log('❌ Verification code expired for:', { email, type });
			return json(
				{
					error: 'Verification code expired',
					code: codeData.code // Still return the code for debugging
				},
				{ status: 410 }
			);
		}

		console.log('✅ Test helper: Verification code retrieved:', {
			code: codeData.code,
			attempts: codeData.attempts,
			isExpired: codeData.isExpired
		});

		return json({
			code: codeData.code,
			attempts: codeData.attempts,
			expiresAt: codeData.expiresAt
		});
	} catch (err) {
		console.error('❌ Test helper error:', err);
		return json({ error: 'Failed to retrieve verification code' }, { status: 500 });
	}
};
