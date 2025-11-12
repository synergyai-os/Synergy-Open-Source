import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from './rateLimit';

describe('Rate Limiter', () => {
	// Note: We can't easily clear the in-memory store between tests
	// So we use unique identifiers per test

	describe('checkRateLimit', () => {
		it('should allow requests within limit', () => {
			const config = RATE_LIMITS.login;
			const identifier = 'test-allow-' + Date.now();

			// First 5 requests should succeed
			for (let i = 0; i < 5; i++) {
				const result = checkRateLimit(identifier, config);
				expect(result.allowed).toBe(true);
				expect(result.remaining).toBe(5 - i - 1);
			}
		});

		it('should block requests exceeding limit', () => {
			const config = RATE_LIMITS.login;
			const identifier = 'test-block-' + Date.now();

			// Exhaust limit (5 requests)
			for (let i = 0; i < 5; i++) {
				checkRateLimit(identifier, config);
			}

			// 6th request should be blocked
			const result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
			expect(result.retryAfter).toBeGreaterThan(0);
			expect(result.retryAfter).toBeLessThanOrEqual(60); // Within 1 minute window
		});

		it('should reset after window expires', async () => {
			const config = {
				maxRequests: 2,
				windowMs: 100, // 100ms for testing
				keyPrefix: 'test-reset'
			};
			const identifier = 'test-reset-' + Date.now();

			// Exhaust limit
			checkRateLimit(identifier, config);
			checkRateLimit(identifier, config);

			// Should be blocked
			let result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(false);

			// Wait for window to expire
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Should be allowed again
			result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(true);
		});

		it('should handle multiple clients independently', () => {
			const config = RATE_LIMITS.login;
			const timestamp = Date.now();
			const client1 = 'test-multi-1-' + timestamp;
			const client2 = 'test-multi-2-' + timestamp;

			// Client 1 exhausts limit
			for (let i = 0; i < 5; i++) {
				checkRateLimit(client1, config);
			}

			// Client 1 blocked
			let result = checkRateLimit(client1, config);
			expect(result.allowed).toBe(false);

			// Client 2 still allowed
			result = checkRateLimit(client2, config);
			expect(result.allowed).toBe(true);
		});

		it('should use correct preset limits', () => {
			expect(RATE_LIMITS.login.maxRequests).toBe(5);
			expect(RATE_LIMITS.register.maxRequests).toBe(3);
			expect(RATE_LIMITS.accountSwitch.maxRequests).toBe(10);
			expect(RATE_LIMITS.logout.maxRequests).toBe(5);
			expect(RATE_LIMITS.login.windowMs).toBe(60 * 1000);
		});

		it('should calculate correct resetAt time', () => {
			const config = RATE_LIMITS.login;
			const identifier = 'test-reset-time-' + Date.now();
			const beforeRequest = Date.now();

			const result = checkRateLimit(identifier, config);

			expect(result.resetAt).toBeGreaterThan(beforeRequest);
			expect(result.resetAt).toBeLessThanOrEqual(beforeRequest + config.windowMs + 100);
		});
	});

	describe('getClientIdentifier', () => {
		it('should extract IP from X-Forwarded-For header', () => {
			const request = new Request('http://example.com', {
				headers: {
					'x-forwarded-for': '192.168.1.1, 10.0.0.1'
				}
			});

			const identifier = getClientIdentifier(request);
			expect(identifier).toBe('192.168.1.1');
		});

		it('should extract IP from X-Real-IP header', () => {
			const request = new Request('http://example.com', {
				headers: {
					'x-real-ip': '192.168.1.2'
				}
			});

			const identifier = getClientIdentifier(request);
			expect(identifier).toBe('192.168.1.2');
		});

		it('should prefer X-Forwarded-For over X-Real-IP', () => {
			const request = new Request('http://example.com', {
				headers: {
					'x-forwarded-for': '192.168.1.1',
					'x-real-ip': '192.168.1.2'
				}
			});

			const identifier = getClientIdentifier(request);
			expect(identifier).toBe('192.168.1.1');
		});

		it('should return "unknown" when no headers present', () => {
			const request = new Request('http://example.com');

			const identifier = getClientIdentifier(request);
			expect(identifier).toBe('unknown');
		});

		it('should trim whitespace from IP addresses', () => {
			const request = new Request('http://example.com', {
				headers: {
					'x-forwarded-for': '  192.168.1.1  , 10.0.0.1'
				}
			});

			const identifier = getClientIdentifier(request);
			expect(identifier).toBe('192.168.1.1');
		});
	});

	describe('sliding window behavior', () => {
		it('should allow gradual requests within window', async () => {
			const config = {
				maxRequests: 3,
				windowMs: 200, // 200ms window
				keyPrefix: 'test-sliding'
			};
			const identifier = 'test-sliding-' + Date.now();

			// Request 1
			let result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(true);

			// Wait 100ms
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Request 2
			result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(true);

			// Wait 100ms (request 1 should expire now)
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Request 3 (should be allowed since request 1 expired)
			result = checkRateLimit(identifier, config);
			expect(result.allowed).toBe(true);
		});
	});

	describe('rate limit response format', () => {
		it('should return correct structure when allowed', () => {
			const config = RATE_LIMITS.register;
			const identifier = 'test-format-allowed-' + Date.now();

			const result = checkRateLimit(identifier, config);

			expect(result).toHaveProperty('allowed');
			expect(result).toHaveProperty('remaining');
			expect(result).toHaveProperty('resetAt');
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(2); // 3 max - 1 used = 2 remaining
			expect(result.retryAfter).toBeUndefined();
		});

		it('should return correct structure when blocked', () => {
			const config = RATE_LIMITS.register;
			const identifier = 'test-format-blocked-' + Date.now();

			// Exhaust limit
			for (let i = 0; i < 3; i++) {
				checkRateLimit(identifier, config);
			}

			const result = checkRateLimit(identifier, config);

			expect(result).toHaveProperty('allowed');
			expect(result).toHaveProperty('remaining');
			expect(result).toHaveProperty('resetAt');
			expect(result).toHaveProperty('retryAfter');
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
			expect(typeof result.retryAfter).toBe('number');
		});
	});
});

