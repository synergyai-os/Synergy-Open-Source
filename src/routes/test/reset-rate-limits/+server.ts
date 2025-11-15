import { json, type RequestHandler, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { clearRateLimits, clearRateLimitsForPattern } from '$lib/server/middleware/rateLimit';

/**
 * Test helper endpoint to reset rate limits for E2E tests
 * POST /test/reset-rate-limits
 * POST /test/reset-rate-limits?pattern=test:login-test-123
 *
 * SECURITY:
 * - Only enabled when E2E_TEST_MODE=true
 * - IP restricted to localhost only
 * - Clears all rate limits or specific pattern
 */
export const POST: RequestHandler = async ({ url, getClientAddress }) => {
	// Check if E2E test mode is enabled
	const e2eTestMode = process.env.E2E_TEST_MODE || env.E2E_TEST_MODE;

	if (e2eTestMode !== 'true') {
		console.error('❌ Test helper endpoint called but E2E_TEST_MODE is not enabled', {
			processEnvValue: process.env.E2E_TEST_MODE,
			envValue: env.E2E_TEST_MODE
		});
		throw error(404, 'Not found');
	}

	// IP restriction: only allow localhost
	const clientIp = getClientAddress();
	const isLocalhost =
		clientIp === '127.0.0.1' ||
		clientIp === '::1' ||
		clientIp === 'localhost' ||
		clientIp.startsWith('127.') ||
		clientIp === '::ffff:127.0.0.1';

	if (!isLocalhost) {
		console.error('❌ Test helper endpoint accessed from non-localhost IP:', clientIp);
		throw error(403, 'Forbidden');
	}

	// Get optional pattern parameter
	const pattern = url.searchParams.get('pattern');

	if (pattern) {
		// Clear specific pattern (e.g., "test:login-test-123")
		clearRateLimitsForPattern(pattern);
		console.log('[DEBUG] ✅ Test helper: Cleared rate limits for pattern:', pattern);
		return json({ success: true, cleared: 'pattern', pattern });
	} else {
		// Clear all rate limits
		clearRateLimits();
		console.log('[DEBUG] ✅ Test helper: Cleared ALL rate limits');
		return json({ success: true, cleared: 'all' });
	}
};
