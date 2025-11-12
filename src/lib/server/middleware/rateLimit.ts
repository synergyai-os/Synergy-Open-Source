/**
 * Rate Limiter - Sliding Window Algorithm
 * 
 * TIER 1: In-memory (single server)
 * TODO: Upgrade to Redis for multi-server (Tier 2)
 */

import type { RequestEvent } from '@sveltejs/kit';

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
 * Cleanup old entries every 5 minutes
 * Prevents memory leak
 */
setInterval(() => {
	const now = Date.now();
	const CLEANUP_THRESHOLD = 10 * 60 * 1000; // 10 minutes
	
	for (const [key, entry] of store.entries()) {
		// Remove timestamps older than 10 minutes
		entry.timestamps = entry.timestamps.filter(ts => now - ts < CLEANUP_THRESHOLD);
		
		// Delete empty entries
		if (entry.timestamps.length === 0) {
			store.delete(key);
		}
	}
}, 5 * 60 * 1000);

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
	
	// Get or create entry
	let entry = store.get(key);
	if (!entry) {
		entry = { timestamps: [] };
		store.set(key, entry);
	}
	
	// Remove timestamps outside current window (sliding window)
	entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
	
	// Check if limit exceeded
	if (entry.timestamps.length >= config.maxRequests) {
		// Calculate when oldest timestamp will expire
		const oldestTimestamp = entry.timestamps[0];
		const resetAt = oldestTimestamp + config.windowMs;
		const retryAfter = Math.ceil((resetAt - now) / 1000); // seconds
		
		return {
			allowed: false,
			remaining: 0,
			resetAt,
			retryAfter
		};
	}
	
	// Record this request
	entry.timestamps.push(now);
	
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
	}
} as const;

/**
 * Get client identifier (IP address)
 * 
 * Respects X-Forwarded-For header (for proxies)
 */
export function getClientIdentifier(request: Request): string {
	// Check for forwarded IP (Vercel, Cloudflare, etc.)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		// Take first IP (client IP)
		return forwardedFor.split(',')[0].trim();
	}
	
	// Check for real IP header (some CDNs)
	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp.trim();
	}
	
	// Fallback to 'unknown' (should not happen in production)
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
		const identifier = getClientIdentifier(event.request);
		const result = checkRateLimit(identifier, config);
		
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

