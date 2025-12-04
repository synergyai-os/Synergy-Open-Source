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
import { logger } from '$lib/utils/logger';

// Debug logging to file (E2E test mode only)
const DEBUG_LOG_PATH = join(process.cwd(), 'rate-limit-debug.log');

/**
 * Debug log function that:
 * 1. Writes to file in E2E test mode (for test debugging)
 * 2. Uses structured logger for production (gated by DEBUG_RATE_LIMIT env var)
 */
function debugLog(message: string, data?: unknown): void {
	const e2eTestMode = process.env.E2E_TEST_MODE || env.E2E_TEST_MODE;

	// File logging for E2E tests (separate concern)
	if (e2eTestMode === 'true') {
		const timestamp = new Date().toISOString();
		const logMessage = data ? `${message}\n${JSON.stringify(data, null, 2)}` : message;
		try {
			appendFileSync(DEBUG_LOG_PATH, `[${timestamp}] ${logMessage}\n`);
		} catch (_e) {
			// Ignore write errors
		}
	}

	// Structured logging (gated by DEBUG_RATE_LIMIT env var)
	logger.debug('rateLimit', message, data);
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
	debugLog('clearRateLimits', { clearedCount: beforeSize });

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

	debugLog('checkRateLimit START', {
		config: {
			keyPrefix: config.keyPrefix,
			maxRequests: config.maxRequests,
			windowMs: config.windowMs
		},
		identifier,
		key
	});

	// Get or create entry
	let entry = store.get(key);
	if (!entry) {
		debugLog('Creating new entry', { key });
		entry = { timestamps: [] };
		store.set(key, entry);
	} else {
		debugLog('Found existing entry', { key, timestampCount: entry.timestamps.length });
	}

	// Remove timestamps outside current window (sliding window)
	const beforeFilter = entry.timestamps.length;
	entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
	const afterFilter = entry.timestamps.length;

	if (beforeFilter !== afterFilter) {
		debugLog('Filtered old timestamps', {
			before: beforeFilter,
			after: afterFilter,
			removed: beforeFilter - afterFilter
		});
	}

	debugLog('Current state', {
		countAfterFilter: entry.timestamps.length,
		maxRequests: config.maxRequests
	});

	// Check if limit exceeded
	if (entry.timestamps.length >= config.maxRequests) {
		// Calculate when oldest timestamp will expire
		const oldestTimestamp = entry.timestamps[0];
		const resetAt = oldestTimestamp + config.windowMs;
		const retryAfter = Math.ceil((resetAt - now) / 1000); // seconds

		logger.warn('rateLimit', 'Rate limit exceeded', {
			key,
			currentCount: entry.timestamps.length,
			maxAllowed: config.maxRequests,
			retryAfterSeconds: retryAfter,
			resetAt: new Date(resetAt).toISOString()
		});

		return {
			allowed: false,
			remaining: 0,
			resetAt,
			retryAfter
		};
	}

	// Record this request
	entry.timestamps.push(now);
	debugLog('Request allowed', {
		newCount: entry.timestamps.length,
		remaining: config.maxRequests - entry.timestamps.length
	});

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

	debugLog('getClientIdentifier START', {
		e2eTestMode: {
			processEnv: process.env.E2E_TEST_MODE,
			envVar: env.E2E_TEST_MODE,
			final: e2eTestMode
		},
		testIdHeader: testId,
		willUseTestId: e2eTestMode === 'true' && !!testId
	});

	if (e2eTestMode === 'true' && testId) {
		const identifier = `test:${testId}`;
		debugLog('Using test identifier', { identifier });
		return identifier;
	}

	// Check for forwarded IP (Vercel, Cloudflare, etc.)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const identifier = forwardedFor.split(',')[0].trim();
		debugLog('Using forwarded IP', { identifier });
		return identifier;
	}

	// Check for real IP header (some CDNs)
	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		debugLog('Using real IP', { identifier: realIp.trim() });
		return realIp.trim();
	}

	// Fallback to 'unknown' (expected in dev/localhost, unexpected in production)
	debugLog('Using fallback identifier', { identifier: 'unknown' });
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
		debugLog('withRateLimit called', {
			endpoint: config.keyPrefix,
			requestUrl: event.url.pathname
		});

		const identifier = getClientIdentifier(event.request);
		const result = checkRateLimit(identifier, config);

		debugLog('Rate limit check result', {
			identifier,
			result: {
				allowed: result.allowed,
				remaining: result.remaining,
				resetAt: new Date(result.resetAt).toISOString()
			}
		});

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
