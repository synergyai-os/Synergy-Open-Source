import { describe, it, expect } from 'vitest';
import { encryptSession, decryptSession, isWebCryptoSupported } from './crypto';

describe('Web Crypto Session Encryption', () => {
	it('should support Web Crypto API', () => {
		expect(isWebCryptoSupported()).toBe(true);
	});

	it('should encrypt and decrypt session data', async () => {
		const testData = JSON.stringify({
			userId: 'test-123',
			email: 'test@example.com',
			sessionId: 'session-456',
			expiresAt: Date.now() + 86400000
		});

		const encrypted = await encryptSession(testData);
		const decrypted = await decryptSession(encrypted);

		expect(decrypted).toBe(testData);
	});

	it('should produce different ciphertext for same plaintext', async () => {
		const testData = 'same plaintext';

		const encrypted1 = await encryptSession(testData);
		const encrypted2 = await encryptSession(testData);

		// Different IVs should produce different ciphertext
		expect(encrypted1).not.toBe(encrypted2);

		// But both should decrypt to same plaintext
		expect(await decryptSession(encrypted1)).toBe(testData);
		expect(await decryptSession(encrypted2)).toBe(testData);
	});

	it('should throw on tampered ciphertext', async () => {
		const testData = 'sensitive data';
		const encrypted = await encryptSession(testData);

		// Tamper with ciphertext
		const tampered = encrypted.slice(0, -1) + 'X';

		await expect(decryptSession(tampered)).rejects.toThrow();
	});

	it('should throw on corrupted ciphertext', async () => {
		await expect(decryptSession('invalid-base64!')).rejects.toThrow();
	});

	it('should handle empty string', async () => {
		const encrypted = await encryptSession('');
		const decrypted = await decryptSession(encrypted);
		expect(decrypted).toBe('');
	});

	it('should handle large data', async () => {
		const largeData = 'x'.repeat(100_000);
		const encrypted = await encryptSession(largeData);
		const decrypted = await decryptSession(encrypted);
		expect(decrypted).toBe(largeData);
	});
});
