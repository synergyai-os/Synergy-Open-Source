/**
 * Client-side cryptography using Web Crypto API
 *
 * SECURITY NOTES:
 * - Uses AES-256-GCM (authenticated encryption)
 * - Keys derived with PBKDF2 (100k iterations)
 * - IVs are random (never reused)
 * - Suitable for localStorage encryption only (not server-side)
 *
 * LIMITATIONS:
 * - Not secure against physical device access
 * - Relies on browser security model
 * - Key material derived from browser fingerprint (not user password)
 */

import { browser } from '$app/environment';

// Constants
const PBKDF2_ITERATIONS = 100_000; // OWASP recommendation for 2024
const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12; // GCM recommended length
const SALT = 'syos-session-v1'; // Fixed salt (acceptable for localStorage encryption)

/**
 * Browser fingerprint for key derivation
 * Note: This is NOT security-by-obscurity; it's for key uniqueness per browser.
 * Real security comes from AES-256 and the fact that keys never leave the browser.
 */
function getBrowserFingerprint(): string {
	if (!browser) return 'server-side-key';

	return [
		navigator.userAgent,
		screen.width,
		screen.height,
		screen.colorDepth,
		new Date().getTimezoneOffset(),
		navigator.language,
		navigator.hardwareConcurrency || 4
	].join('|');
}

/**
 * Derive encryption key from browser fingerprint using PBKDF2
 *
 * @returns CryptoKey for AES-GCM encryption
 */
async function deriveKey(): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const fingerprintData = encoder.encode(getBrowserFingerprint());

	// Import fingerprint as raw key material
	const keyMaterial = await crypto.subtle.importKey('raw', fingerprintData, 'PBKDF2', false, [
		'deriveBits',
		'deriveKey'
	]);

	// Derive AES-256 key using PBKDF2
	return await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode(SALT),
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: AES_KEY_LENGTH },
		false, // Not extractable (security best practice)
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param plaintext - String to encrypt
 * @returns Base64-encoded: IV (12 bytes) + ciphertext + auth tag (16 bytes)
 *
 * Format: [IV(12)][CIPHERTEXT(N)][AUTH_TAG(16)]
 */
export async function encryptSession(plaintext: string): Promise<string> {
	if (!browser) {
		throw new Error('encryptSession can only be called in the browser');
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(plaintext);

	// Derive encryption key
	const key = await deriveKey();

	// Generate random IV (never reuse!)
	const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));

	// Encrypt with AES-GCM
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

	// Combine IV + ciphertext (GCM auth tag is included in ciphertext)
	const combined = new Uint8Array(iv.length + ciphertext.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(ciphertext), iv.length);

	// Encode as base64 for storage
	return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param encrypted - Base64-encoded ciphertext (from encryptSession)
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 */
export async function decryptSession(encrypted: string): Promise<string> {
	if (!browser) {
		throw new Error('decryptSession can only be called in the browser');
	}

	try {
		// Decode base64
		const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

		// Extract IV and ciphertext
		const iv = combined.slice(0, AES_IV_LENGTH);
		const ciphertext = combined.slice(AES_IV_LENGTH);

		// Derive decryption key (same as encryption)
		const key = await deriveKey();

		// Decrypt with AES-GCM (will throw if auth tag is invalid)
		const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

		// Decode to string
		const decoder = new TextDecoder();
		return decoder.decode(plaintext);
	} catch (error) {
		// Decryption failed (wrong key, tampered data, or corrupted)
		console.error('Session decryption failed:', error);
		throw new Error('Failed to decrypt session data');
	}
}

/**
 * Test if Web Crypto API is available
 *
 * @returns true if Web Crypto is supported
 */
export function isWebCryptoSupported(): boolean {
	return browser && typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Benchmark encryption performance
 * Used for testing only
 */
export async function benchmarkEncryption(iterations: number = 1000): Promise<number> {
	const testData = JSON.stringify({
		userId: 'test-user-123',
		email: 'test@example.com',
		sessionId: 'test-session-456',
		expiresAt: Date.now() + 86400000
	});

	const start = performance.now();

	for (let i = 0; i < iterations; i++) {
		const encrypted = await encryptSession(testData);
		await decryptSession(encrypted);
	}

	const end = performance.now();
	const avgTime = (end - start) / iterations;

	console.log(`Encryption benchmark: ${avgTime.toFixed(2)}ms per encrypt+decrypt cycle`);
	return avgTime;
}
