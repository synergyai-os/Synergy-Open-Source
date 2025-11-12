# Rate Limiting Implementation

**Priority**: 🔴 Critical  
**Estimated Time**: 1 day  
**Dependencies**: None  
**Assignee**: TBD

---

## Problem Statement

Currently, auth endpoints have **no rate limiting**:

```typescript
// NO PROTECTION against:
POST /auth/switch (account switching)  → Spam = DoS
POST /auth/login (password attempts)   → Brute force attacks
POST /auth/register (account creation) → Spam accounts
```

**Attack Scenarios**:

1. **Account Switch Spam**: User writes script to switch accounts 1000x/second → Convex query exhaustion
2. **Brute Force**: Attacker tries 10,000 passwords → Eventually breaks in
3. **Registration Spam**: Bot creates 1000s of fake accounts → Database pollution

---

## Solution: Sliding Window Rate Limiter

### Strategy

Use **sliding window** algorithm (industry standard):

- More accurate than fixed window
- Prevents burst attacks at window boundaries
- Supported by most Redis libraries

### Limits

| Endpoint         | Limit       | Window   | Rationale                            |
| ---------------- | ----------- | -------- | ------------------------------------ |
| `/auth/switch`   | 10 requests | 1 minute | Normal users switch <5x/min          |
| `/auth/login`    | 5 requests  | 1 minute | Legitimate typos = 2-3 attempts      |
| `/auth/register` | 3 requests  | 1 minute | Should only register once            |
| `/auth/logout`   | 5 requests  | 1 minute | Multiple sessions = multiple logouts |

### Implementation Tiers

**Tier 1 (MVP)**: In-memory (simple, single-server)  
**Tier 2 (Production)**: Redis (distributed, multi-server)  
**Tier 3 (Enterprise)**: Redis + IP reputation (Cloudflare, etc.)

---

## Implementation (Tier 1: In-Memory)

### Step 1: Create Rate Limiter Utility

**New File**: `src/lib/server/middleware/rateLimit.ts`

```typescript
/**
 * Rate Limiter - Sliding Window Algorithm
 *
 * TIER 1: In-memory (single server)
 * TODO: Upgrade to Redis for multi-server (Tier 2)
 */

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

	// Get or create entry
	let entry = store.get(key);
	if (!entry) {
		entry = { timestamps: [] };
		store.set(key, entry);
	}

	// Remove timestamps outside current window (sliding window)
	entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

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
```

---

### Step 2: Apply to Auth Endpoints

**File**: `src/routes/auth/switch/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';
// ... existing imports

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.accountSwitch, async ({ event }) => {
	// Existing logic (unchanged)
	if (!event.locals.auth.sessionId || !event.locals.auth.user?.userId) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	// ... rest of existing code
});
```

**File**: `src/routes/auth/login/+server.ts`

```typescript
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.login, async ({ event }) => {
	// Existing login logic...
});
```

**File**: `src/routes/auth/register/+server.ts`

```typescript
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.register, async ({ event }) => {
	// Existing registration logic...
});
```

**File**: `src/routes/logout/+server.ts`

```typescript
import { withRateLimit, RATE_LIMITS } from '$lib/server/middleware/rateLimit';

export const POST: RequestHandler = withRateLimit(RATE_LIMITS.logout, async ({ event }) => {
	// Existing logout logic...
});
```

---

### Step 3: Add Client-Side Handling

**File**: `src/lib/composables/useAuthSession.svelte.ts`

```typescript
async function switchAccount(targetUserId: string, redirectTo?: string) {
	try {
		const response = await fetch('/auth/switch', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF-Token': state.csrfToken || ''
			},
			credentials: 'include',
			body: JSON.stringify({ targetUserId, redirect: redirectTo })
		});

		// Handle rate limiting
		if (response.status === 429) {
			const data = await response.json();
			const retryAfter = response.headers.get('Retry-After');

			toast.error(`Too many account switches. Please wait ${retryAfter} seconds.`);
			return;
		}

		if (!response.ok) {
			throw new Error('Account switch failed');
		}

		// ... existing success logic
	} catch (error) {
		console.error('Failed to switch account:', error);
		toast.error('Failed to switch accounts');
	}
}
```

---

## Testing

### Unit Tests

**File**: `src/lib/server/middleware/rateLimit.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from './rateLimit';

describe('Rate Limiter', () => {
	beforeEach(() => {
		// Clear store between tests
		// (would need to export store for testing)
	});

	it('should allow requests within limit', () => {
		const config = RATE_LIMITS.login;

		// First 5 requests should succeed
		for (let i = 0; i < 5; i++) {
			const result = checkRateLimit('test-ip', config);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(5 - i - 1);
		}
	});

	it('should block requests exceeding limit', () => {
		const config = RATE_LIMITS.login;

		// Exhaust limit
		for (let i = 0; i < 5; i++) {
			checkRateLimit('test-ip', config);
		}

		// 6th request should be blocked
		const result = checkRateLimit('test-ip', config);
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
		expect(result.retryAfter).toBeGreaterThan(0);
	});

	it('should reset after window expires', async () => {
		const config = {
			maxRequests: 2,
			windowMs: 100, // 100ms for testing
			keyPrefix: 'test'
		};

		// Exhaust limit
		checkRateLimit('test-ip', config);
		checkRateLimit('test-ip', config);

		// Should be blocked
		let result = checkRateLimit('test-ip', config);
		expect(result.allowed).toBe(false);

		// Wait for window to expire
		await new Promise((resolve) => setTimeout(resolve, 150));

		// Should be allowed again
		result = checkRateLimit('test-ip', config);
		expect(result.allowed).toBe(true);
	});

	it('should handle multiple clients independently', () => {
		const config = RATE_LIMITS.login;

		// Client 1 exhausts limit
		for (let i = 0; i < 5; i++) {
			checkRateLimit('client-1', config);
		}

		// Client 1 blocked
		let result = checkRateLimit('client-1', config);
		expect(result.allowed).toBe(false);

		// Client 2 still allowed
		result = checkRateLimit('client-2', config);
		expect(result.allowed).toBe(true);
	});
});
```

### E2E Tests

**File**: `e2e/rate-limiting.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Rate Limiting', () => {
	test('should block excessive login attempts', async ({ page }) => {
		await page.goto('/login');

		// Try logging in 6 times (limit is 5)
		for (let i = 0; i < 6; i++) {
			await page.fill('[name="email"]', 'test@example.com');
			await page.fill('[name="password"]', 'wrong-password');
			await page.click('button[type="submit"]');

			if (i < 5) {
				// First 5 attempts should show "Invalid credentials"
				await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid');
			} else {
				// 6th attempt should show rate limit error
				await expect(page.locator('[data-testid="error-message"]')).toContainText(
					'Too many requests'
				);
			}
		}
	});

	test('should show rate limit headers', async ({ page }) => {
		const response = await page.request.post('/auth/login', {
			data: { email: 'test@example.com', password: 'password' }
		});

		expect(response.headers()['x-ratelimit-limit']).toBe('5');
		expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
		expect(response.headers()['x-ratelimit-reset']).toBeDefined();
	});
});
```

---

## Upgrade Path: Tier 2 (Redis)

For production multi-server deployments:

### Install Redis Client

```bash
npm install ioredis
```

### Update Rate Limiter

**File**: `src/lib/server/middleware/rateLimit.ts`

```typescript
import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

// Initialize Redis (if available)
const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;

export async function checkRateLimitRedis(
	identifier: string,
	config: RateLimitConfig
): Promise<RateLimitResult> {
	if (!redis) {
		// Fallback to in-memory
		return checkRateLimit(identifier, config);
	}

	const key = `ratelimit:${config.keyPrefix}:${identifier}`;
	const now = Date.now();
	const windowStart = now - config.windowMs;

	// Use Redis sorted set (ZSET) for sliding window
	// Score = timestamp, Value = unique ID

	// Remove old timestamps
	await redis.zremrangebyscore(key, 0, windowStart);

	// Count current requests
	const count = await redis.zcard(key);

	if (count >= config.maxRequests) {
		// Get oldest timestamp for reset calculation
		const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
		const resetAt = parseInt(oldest[1]) + config.windowMs;
		const retryAfter = Math.ceil((resetAt - now) / 1000);

		return {
			allowed: false,
			remaining: 0,
			resetAt,
			retryAfter
		};
	}

	// Add current request
	await redis.zadd(key, now, `${now}-${Math.random()}`);

	// Set expiry (cleanup)
	await redis.expire(key, Math.ceil(config.windowMs / 1000) + 60);

	// Calculate remaining
	const remaining = config.maxRequests - count - 1;

	return {
		allowed: true,
		remaining,
		resetAt: now + config.windowMs
	};
}
```

---

## Security Considerations

### What This Protects Against

✅ **Brute force attacks**: Limited password attempts  
✅ **DoS attacks**: Limited requests per endpoint  
✅ **Account spam**: Limited registration attempts  
✅ **Resource exhaustion**: Predictable load

### What This Does NOT Protect Against

❌ **Distributed attacks**: Many IPs attacking simultaneously (need Cloudflare)  
❌ **Slow brute force**: Attacker waits between attempts (need account lockout)  
❌ **API key leaks**: Rate limiting won't help if credentials are stolen  
❌ **Application logic bugs**: Rate limiting is not input validation

### Additional Recommendations

1. **Add account lockout**: After N failed attempts, lock account for M minutes
2. **Add CAPTCHA**: For registration and repeated login failures
3. **Monitor patterns**: Alert on unusual activity (e.g., 100 IPs hitting login)
4. **IP reputation**: Integrate with Cloudflare or similar for DDoS protection

---

## Performance Impact

**Overhead**:

- In-memory: < 1ms per request
- Redis: < 5ms per request (network latency)

**Memory Usage**:

- In-memory: ~100 bytes per client (tracked)
- Cleanup every 5 minutes keeps memory bounded
- For 1000 active users: ~100KB total

**Scalability**:

- In-memory: Single server only
- Redis: Multi-server, distributed

---

## Rollout Plan

### Phase 1: Deploy In-Memory (Day 1)

1. ✅ Implement Tier 1 (in-memory)
2. ✅ Deploy to staging
3. ✅ Test rate limiting behavior
4. ✅ Verify headers returned

### Phase 2: Monitor (Day 2-7)

1. ✅ Deploy to production
2. ✅ Monitor 429 responses (should be rare)
3. ✅ Track false positives (legitimate users blocked)
4. ✅ Adjust limits if needed

### Phase 3: Upgrade to Redis (Week 2-3)

1. ✅ Set up Redis instance
2. ✅ Implement Tier 2 (Redis)
3. ✅ A/B test (in-memory vs Redis)
4. ✅ Full cutover to Redis

---

## Success Criteria

- [ ] All auth endpoints have rate limiting
- [ ] 429 responses for excessive requests
- [ ] Clear error messages with retry-after
- [ ] Rate limit headers on all responses
- [ ] < 5ms overhead per request
- [ ] Zero false positives for normal users
- [ ] Documentation updated

---

## Related Documents

- [Implementation Roadmap](./IMPLEMENTATION-ROADMAP.md)
- [Security Audit Report](./SECURITY-AUDIT-2025-11-12.md)
- [WorkOS Auth Architecture](../../2-areas/architecture/auth/workos-convex-auth-architecture.md)

---

**Next Steps**: Implement Tier 1, test, deploy, then plan Tier 2 upgrade.
