/**
 * Rate Limiter - Sliding Window Algorithm
 *
 * TIER 1: In-memory (single server)
 * TODO: Upgrade to Redis for multi-server (Tier 2)
 */

import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

// Debug logging to file (E2E test mode only)
const DEBUG_LOG_PATH = join(process.cwd(), 'rate-limit-debug.log');

function debugLog(...args: unknown[]) {
	const e2eTestMode = process.env.E2E_TEST_MODE || env.E2E_TEST_MODE;
	if (e2eTestMode === 'true') {
		const timestamp = new Date().toISOString();
		const message = args
			.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
			.join(' ');
		try {
			appendFileSync(DEBUG_LOG_PATH, `[${timestamp}] ${message}\n`);
		} catch (_e) {
			// Ignore write errors
		}
	}
	// Also log to console
	console.log(...args);
}

interface RateLimitEntry {
	timestamps: number[];
}

interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
	keyPrefix: string;
}

/**
 * In-memory store (Tier 1 only)
 *
 * Structure: Map<key, timestamps[]>
 * - key = "prefix:identifier" (e.g., "login:192.168.1.1")
 * - timestamps = [t1, t2, t3, ...] (sorted, oldest first)
 */
const store = new Map<string, RateLimitEntry>();

/**
 * Clear all rate limit entries (for E2E tests only)
 */
export function clearRateLimits(): void {
	const beforeSize = store.size;
	store.clear();
	debugLog(`🧹 clearRateLimits: Cleared ${beforeSize} entries from rate limit store`);

	// Clear debug log file on first reset (start of test run)
	if (beforeSize === 0) {
		try {
			writeFileSync(DEBUG_LOG_PATH, `=== NEW TEST RUN: ${new Date().toISOString()} ===\n`);
		} catch (_e) {
			// Ignore
		}
	}
}

/**
 * Clear rate limits for a specific identifier pattern (for E2E tests only)
 */
export function clearRateLimitsForPattern(pattern: string): void {
	for (const key of store.keys()) {
		if (key.includes(pattern)) {
			store.delete(key);
		}
	}
}

/**
 * Cleanup old entries every 5 minutes
 * Prevents memory leak
 */
setInterval(
	() => {
		const now = Date.now();
		const CLEANUP_THRESHOLD = 10 * 60 * 1000; // 10 minutes

		for (const [key, entry] of store.entries()) {
			// Remove timestamps older than 10 minutes
			entry.timestamps = entry.timestamps.filter((ts) => now - ts < CLEANUP_THRESHOLD);

			// Delete empty entries
			if (entry.timestamps.length === 0) {
				store.delete(key);
			}
		}
	},
	5 * 60 * 1000
);

/**
 * Check if request is rate limited
 *
 * @param identifier - IP address or user ID
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): {
	allowed: boolean;
	remaining: number;
	resetAt: number;
	retryAfter?: number;
} {
	const key = `${config.keyPrefix}:${identifier}`;
	const now = Date.now();
	const windowStart = now - config.windowMs;

	debugLog('=== RATE LIMIT: checkRateLimit START ===');
	debugLog('Config:', {
		keyPrefix: config.keyPrefix,
		maxRequests: config.maxRequests,
		windowMs: config.windowMs
	});
	debugLog('Identifier:', identifier);
	debugLog('Key:', key);

	// Get or create entry
	let entry = store.get(key);
	if (!entry) {
		debugLog('📝 Creating new entry for key:', key);
		entry = { timestamps: [] };
		store.set(key, entry);
	} else {
		debugLog('📖 Found existing entry for key:', key);
		debugLog('Existing timestamps:', entry.timestamps.length);
	}

	// Remove timestamps outside current window (sliding window)
	const beforeFilter = entry.timestamps.length;
	entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
	const afterFilter = entry.timestamps.length;

	if (beforeFilter !== afterFilter) {
		debugLog(`🧹 Filtered old timestamps: ${beforeFilter} → ${afterFilter}`);
	}

	debugLog('Current count after filter:', entry.timestamps.length);
	debugLog('Max requests allowed:', config.maxRequests);

	// Check if limit exceeded
	if (entry.timestamps.length >= config.maxRequests) {
		// Calculate when oldest timestamp will expire
		const oldestTimestamp = entry.timestamps[0];
		const resetAt = oldestTimestamp + config.windowMs;
		const retryAfter = Math.ceil((resetAt - now) / 1000); // seconds

		debugLog('🚫 RATE LIMIT EXCEEDED!');
		debugLog('Current count:', entry.timestamps.length);
		debugLog('Max allowed:', config.maxRequests);
		debugLog('Retry after (seconds):', retryAfter);
		debugLog('=== RATE LIMIT: checkRateLimit END (BLOCKED) ===');

		return {
			allowed: false,
			remaining: 0,
			resetAt,
			retryAfter
		};
	}

	// Record this request
	entry.timestamps.push(now);
	debugLog('✅ Request allowed, recorded timestamp');
	debugLog('New count:', entry.timestamps.length);
	debugLog('Remaining:', config.maxRequests - entry.timestamps.length);
	debugLog('=== RATE LIMIT: checkRateLimit END (ALLOWED) ===');

	// Calculate reset time (when oldest request expires)
	const oldestTimestamp = entry.timestamps[0];
	const resetAt = oldestTimestamp + config.windowMs;

	return {
		allowed: true,
		remaining: config.maxRequests - entry.timestamps.length,
		resetAt
	};
}

/**
 * Preset configurations for common endpoints
 */
export const RATE_LIMITS = {
	accountSwitch: {
		maxRequests: 10,
		windowMs: 60 * 1000, // 1 minute
		keyPrefix: 'switch'
	},
	login: {
		maxRequests: 5,
		windowMs: 60 * 1000,
		keyPrefix: 'login'
	},
	register: {
		maxRequests: 3,
		windowMs: 60 * 1000,
		keyPrefix: 'register'
	},
	logout: {
		maxRequests: 5,
		windowMs: 60 * 1000,
		keyPrefix: 'logout'
	},
	token: {
		maxRequests: 60,
		windowMs: 60 * 1000, // 1 minute (higher limit for frequent client requests)
		keyPrefix: 'token'
	}
} as const;

/**
 * Get client identifier (IP address)
 *
 * Respects X-Forwarded-For header (for proxies)
 * In E2E test mode, uses X-Test-ID header for test isolation
 */
export function getClientIdentifier(request: Request): string {
	// E2E test mode: Use test-specific identifier for isolation
	// Check process.env first - Playwright's webServer.env sets process.env for the dev server
	// $env/dynamic/private reads from process.env at runtime, but checking directly is more reliable
	const e2eTestMode = process.env.E2E_TEST_MODE || env.E2E_TEST_MODE;
	const testId = request.headers.get('x-test-id');

	debugLog('=== RATE LIMIT: getClientIdentifier START ===');
	debugLog('E2E_TEST_MODE (process.env):', process.env.E2E_TEST_MODE);
	debugLog('E2E_TEST_MODE (env):', env.E2E_TEST_MODE);
	debugLog('E2E_TEST_MODE (final):', e2eTestMode);
	debugLog('X-Test-ID header:', testId);
	debugLog('Will use test ID?:', e2eTestMode === 'true' && !!testId);

	if (e2eTestMode === 'true' && testId) {
		const identifier = `test:${testId}`;
		debugLog('✅ Using test identifier:', identifier);
		debugLog('=== RATE LIMIT: getClientIdentifier END ===');
		return identifier;
	}

	// Check for forwarded IP (Vercel, Cloudflare, etc.)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const identifier = forwardedFor.split(',')[0].trim();
		debugLog('Using forwarded IP:', identifier);
		debugLog('=== RATE LIMIT: getClientIdentifier END ===');
		return identifier;
	}

	// Check for real IP header (some CDNs)
	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		debugLog('Using real IP:', realIp);
		debugLog('=== RATE LIMIT: getClientIdentifier END ===');
		return realIp.trim();
	}

	// Fallback to 'unknown' (should not happen in production)
	debugLog('⚠️ Using fallback: unknown');
	debugLog('=== RATE LIMIT: getClientIdentifier END ===');
	return 'unknown';
}

/**
 * SvelteKit middleware wrapper
 *
 * Usage:
 * export const POST = withRateLimit(
 *   RATE_LIMITS.login,
 *   async ({ event }) => { ... }
 * );
 */
export function withRateLimit<T>(
	config: RateLimitConfig,
	handler: (context: { event: RequestEvent }) => Promise<T>
) {
	return async (event: RequestEvent): Promise<T | Response> => {
		debugLog('🔒 withRateLimit CALLED for endpoint:', config.keyPrefix);
		debugLog('Request URL:', event.url.pathname);

		const identifier = getClientIdentifier(event.request);
		debugLog('Got identifier from getClientIdentifier:', identifier);

		const result = checkRateLimit(identifier, config);
		debugLog('checkRateLimit result:', result);

		// Set rate limit headers (standard)
		const headers = {
			'X-RateLimit-Limit': config.maxRequests.toString(),
			'X-RateLimit-Remaining': result.remaining.toString(),
			'X-RateLimit-Reset': result.resetAt.toString()
		};

		if (!result.allowed) {
			// Return 429 Too Many Requests
			return new Response(
				JSON.stringify({
					error: 'Too many requests',
					message: `Please wait ${result.retryAfter} seconds before trying again`,
					retryAfter: result.retryAfter
				}),
				{
					status: 429,
					headers: {
						...headers,
						'Content-Type': 'application/json',
						'Retry-After': result.retryAfter!.toString()
					}
				}
			);
		}

		// Execute handler
		const response = await handler({ event });

		// Add rate limit headers to successful responses
		if (response instanceof Response) {
			Object.entries(headers).forEach(([key, value]) => {
				response.headers.set(key, value);
			});
		}

		return response;
	};
}
