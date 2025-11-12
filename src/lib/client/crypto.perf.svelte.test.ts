import { describe, it, expect } from 'vitest';
import { benchmarkEncryption } from './crypto';

describe('Web Crypto Performance', () => {
	it('should encrypt/decrypt in < 20ms per cycle (test environment)', async () => {
		// Note: PBKDF2 with 100k iterations takes ~50ms for initial key derivation (cached)
		// Test environment adds browser automation overhead
		// Real-world performance is better (~3-5ms after key cached)
		const avgTime = await benchmarkEncryption(100);
		expect(avgTime).toBeLessThan(20);
	}, 30000); // 30s timeout for benchmark
});

