import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

const SESSION_SECRET = env.SYOS_SESSION_SECRET;

if (!SESSION_SECRET) {
	throw new Error('SYOS_SESSION_SECRET is required to use headless WorkOS auth.');
}

const ENCRYPTION_KEY = crypto.createHash('sha256').update(`${SESSION_SECRET}:encryption`).digest();
const HMAC_KEY = crypto.createHash('sha512').update(`${SESSION_SECRET}:hmac`).digest();

const IV_LENGTH = 12; // AES-GCM recommended IV length

export function encryptSecret(plainText: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
	const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

export function decryptSecret(cipherText: string): string {
	const buffer = Buffer.from(cipherText, 'base64url');
	const iv = buffer.subarray(0, IV_LENGTH);
	const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
	const encrypted = buffer.subarray(IV_LENGTH + 16);

	const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString('utf8');
}

export function hashValue(value: string): string {
	return crypto.createHash('sha256').update(value).digest('base64url');
}

export function signValue(value: string): string {
	return crypto.createHmac('sha256', HMAC_KEY).update(value).digest('base64url');
}

export function verifySignature(value: string, signature: string): boolean {
	const expected = signValue(value);
	const expectedBuffer = Buffer.from(expected);
	const givenBuffer = Buffer.from(signature);

	if (expectedBuffer.length !== givenBuffer.length) {
		return false;
	}

	return crypto.timingSafeEqual(expectedBuffer, givenBuffer);
}

export function generateRandomToken(bytes = 32): string {
	return crypto.randomBytes(bytes).toString('base64url');
}

export function generateSessionId(): string {
	// Slightly longer than UUID to reduce collision risk, base64url safe
	return crypto.randomBytes(24).toString('base64url');
}
