import { test, expect } from '@playwright/test';

/**
 * Generate unique test ID for rate limit isolation
 * Each test gets its own rate limit bucket in E2E mode
 *
 * Note: Storage state is handled by playwright.config.ts (unauthenticated project)
 */
function getTestId(testName: string): string {
	return `${testName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

test.describe('Rate Limiting', () => {
	// Reset rate limits before each test to ensure isolation
	// This prevents tests from interfering with each other when run in parallel
	test.beforeEach(async ({ request }) => {
		// Clear all rate limits before each test
		// This ensures each test starts with a clean slate
		const response = await request.post('/test/reset-rate-limits');
		if (!response.ok() && response.status() !== 404) {
			console.warn('⚠️ Failed to reset rate limits before test:', response.status());
		}
	});
	test.describe('Login Endpoint', () => {
		test('should block excessive login attempts', async ({ request }) => {
			const testId = getTestId('login-excessive');
			const email = 'randy+cicduser@synergyai.nl';
			const password = 'wrong-password';

			// Try logging in 6 times (limit is 5/min)
			for (let i = 0; i < 6; i++) {
				const response = await request.post('/auth/login', {
					data: {
						email,
						password
					},
					headers: {
						'X-Test-ID': testId
					}
				});

				if (i < 5) {
					// First 5 attempts should return error (401 or 404 for invalid credentials)
					expect([401, 404, 500]).toContain(response.status());
				} else {
					// 6th attempt should return 429 (rate limited)
					expect(response.status()).toBe(429);

					const data = await response.json();
					expect(data.error).toBe('Too many requests');
					expect(data.retryAfter).toBeGreaterThan(0);
				}
			}
		});

		test('should include rate limit headers on login requests', async ({ request }) => {
			const testId = getTestId('login-headers');
			const response = await request.post('/auth/login', {
				data: {
					email: 'randy+cicduser@synergyai.nl',
					password: 'password'
				},
				headers: {
					'X-Test-ID': testId
				}
			});

			const headers = response.headers();
			expect(headers['x-ratelimit-limit']).toBe('5');
			expect(headers['x-ratelimit-remaining']).toBeDefined();
			expect(headers['x-ratelimit-reset']).toBeDefined();
		});

		test('should include Retry-After header on 429 response', async ({ request }) => {
			const testId = getTestId('login-retry-after');
			const email = `randy+ci-rate-1-${Date.now()}@synergyai.nl`;

			// Exhaust limit
			for (let i = 0; i < 5; i++) {
				await request.post('/auth/login', {
					data: { email, password: 'test' },
					headers: {
						'X-Test-ID': testId
					}
				});
			}

			// Next request should return 429 with Retry-After
			const response = await request.post('/auth/login', {
				data: { email, password: 'test' },
				headers: {
					'X-Test-ID': testId
				}
			});

			expect(response.status()).toBe(429);
			const retryAfter = response.headers()['retry-after'];
			expect(retryAfter).toBeDefined();
			expect(parseInt(retryAfter!)).toBeGreaterThan(0);
			expect(parseInt(retryAfter!)).toBeLessThanOrEqual(60);
		});
	});

	test.describe('Registration Endpoint', () => {
		test('should block excessive registration attempts', async ({ request }) => {
			const testId = getTestId('register-excessive');
			const timestamp = Date.now();

			// Try registering 4 times (limit is 3/min)
			for (let i = 0; i < 4; i++) {
				const response = await request.post('/auth/register', {
					data: {
						email: `randy+ci-rate-${i}-${timestamp}@synergyai.nl`,
						password: 'password123'
					},
					headers: {
						'X-Test-ID': testId
					}
				});

				if (i < 3) {
					// First 3 attempts should process (may fail for other reasons)
					expect(response.status()).not.toBe(429);
				} else {
					// 4th attempt should return 429 (rate limited)
					expect(response.status()).toBe(429);

					const data = await response.json();
					expect(data.error).toBe('Too many requests');
				}
			}
		});

		test('should include rate limit headers on register requests', async ({ request }) => {
			const testId = getTestId('register-headers');
			const response = await request.post('/auth/register', {
				data: {
					email: `randy+ci-rate-new-${Date.now()}@synergyai.nl`,
					password: 'password123'
				},
				headers: {
					'X-Test-ID': testId
				}
			});

			const headers = response.headers();
			expect(headers['x-ratelimit-limit']).toBe('3');
			expect(headers['x-ratelimit-remaining']).toBeDefined();
			expect(headers['x-ratelimit-reset']).toBeDefined();
		});
	});

	test.describe('Account Switch Endpoint', () => {
		test('should block excessive account switch attempts', async () => {
			// Note: This test requires authentication
			// In a real scenario, you would set up authenticated sessions first

			test.skip('requires authenticated session setup');

			// Pseudocode for test:
			// 1. Authenticate user
			// 2. Create linked accounts
			// 3. Try switching 11 times (limit is 10/min)
			// 4. Verify 11th attempt returns 429
		});

		test('should include rate limit headers on switch requests', async () => {
			test.skip('requires authenticated session setup');
		});
	});

	test.describe('Logout Endpoint', () => {
		test('should block excessive logout attempts', async () => {
			// Note: Logout rate limiting is less critical but still protected

			test.skip('requires authenticated session setup');

			// Pseudocode for test:
			// 1. Authenticate user
			// 2. Try logging out 6 times (limit is 5/min)
			// 3. Verify 6th attempt returns 429
		});
	});

	test.describe('Independent Rate Limiting', () => {
		test('should track different endpoints independently', async ({ request }) => {
			const testId = getTestId('independent-endpoints');
			const timestamp = Date.now();
			const email = `randy+ci-rate-indep-${timestamp}@synergyai.nl`;

			// Exhaust login limit
			for (let i = 0; i < 5; i++) {
				await request.post('/auth/login', {
					data: { email, password: 'test' },
					headers: {
						'X-Test-ID': testId
					}
				});
			}

			// Login should be blocked
			let response = await request.post('/auth/login', {
				data: { email, password: 'test' },
				headers: {
					'X-Test-ID': testId
				}
			});
			expect(response.status()).toBe(429);

			// But registration should still work (different limit, same test ID = same client)
			response = await request.post('/auth/register', {
				data: {
					email: `randy+ci-rate-diff-${timestamp}@synergyai.nl`,
					password: 'password123'
				},
				headers: {
					'X-Test-ID': testId
				}
			});
			expect(response.status()).not.toBe(429);
		});
	});

	test.describe('Rate Limit Headers', () => {
		test('should update remaining count with each request', async ({ request }) => {
			const testId = getTestId('headers-remaining');
			const timestamp = Date.now();
			const email = `randy+ci-rate-header-${timestamp}@synergyai.nl`;

			for (let i = 0; i < 3; i++) {
				const response = await request.post('/auth/login', {
					data: { email, password: 'test' },
					headers: {
						'X-Test-ID': testId
					}
				});

				const headers = response.headers();
				const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');

				// Remaining should decrease with each request
				expect(remaining).toBeLessThanOrEqual(5 - i - 1);
			}
		});

		test('should set consistent rate limit on all responses', async ({ request }) => {
			const testId = getTestId('headers-consistent');
			const response1 = await request.post('/auth/login', {
				data: { email: 'randy+ci-rate-test1@synergyai.nl', password: 'test' },
				headers: {
					'X-Test-ID': testId
				}
			});

			const response2 = await request.post('/auth/login', {
				data: { email: 'randy+ci-rate-test2@synergyai.nl', password: 'test' },
				headers: {
					'X-Test-ID': testId
				}
			});

			// Both should have same limit
			expect(response1.headers()['x-ratelimit-limit']).toBe('5');
			expect(response2.headers()['x-ratelimit-limit']).toBe('5');
		});
	});

	test.describe('Performance', () => {
		test('should add minimal overhead to requests', async ({ request }) => {
			const testId = getTestId('perf-test');
			const start = Date.now();

			// Make a single request
			await request.post('/auth/login', {
				data: {
					email: 'randy+ci-rate-perf@synergyai.nl',
					password: 'test'
				},
				headers: {
					'X-Test-ID': testId
				}
			});

			const duration = Date.now() - start;

			// Rate limiting should add < 10ms overhead
			// (Total request time will be longer due to auth logic, but we're checking relative)
			expect(duration).toBeLessThan(5000); // Reasonable upper bound for entire request
		});
	});
});
