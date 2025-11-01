/**
 * Encryption utilities for API keys
 * 
 * Uses AES-256-GCM for encryption with a key from environment variables.
 * This ensures API keys are never stored in plain text.
 */

import * as crypto from 'crypto';

/**
 * Encrypt an API key using AES-256-GCM
 * @param plaintext - The API key to encrypt
 * @returns Encrypted string (base64 encoded)
 */
export function encryptApiKey(plaintext: string): string {
	const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;
	
	if (!encryptionKey) {
		throw new Error(
			"API_KEY_ENCRYPTION_KEY environment variable is not set. " +
			"Run: npx convex env set API_KEY_ENCRYPTION_KEY your-32-byte-key"
		);
	}

	// Validate key length (AES-256 requires 32 bytes / 64 hex chars)
	if (encryptionKey.length !== 64) {
		throw new Error(
			"API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). " +
			"Generate with: openssl rand -hex 32"
		);
	}

	// Convert hex key to Buffer
	const key = Buffer.from(encryptionKey, 'hex');
	
	// Generate a random IV (initialization vector) - 16 bytes for AES-GCM
	const iv = crypto.randomBytes(16);
	
	// Create cipher
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	
	// Encrypt
	let encrypted = cipher.update(plaintext, 'utf8', 'base64');
	encrypted += cipher.final('base64');
	
	// Get auth tag (for GCM mode)
	const authTag = cipher.getAuthTag();
	
	// Combine IV, auth tag, and encrypted data (all base64)
	// Format: iv:authTag:encryptedData
	return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an API key using AES-256-GCM
 * @param ciphertext - The encrypted string (format: iv:authTag:encryptedData)
 * @returns Decrypted API key
 */
export function decryptApiKey(ciphertext: string): string {
	const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;
	
	if (!encryptionKey) {
		throw new Error(
			"API_KEY_ENCRYPTION_KEY environment variable is not set"
		);
	}

	if (encryptionKey.length !== 64) {
		throw new Error("Invalid encryption key length");
	}

	// Convert hex key to Buffer
	const key = Buffer.from(encryptionKey, 'hex');

	// Parse ciphertext (format: iv:authTag:encryptedData)
	const parts = ciphertext.split(':');
	if (parts.length !== 3) {
		throw new Error("Invalid encrypted data format");
	}

	const [ivBase64, authTagBase64, encrypted] = parts;
	const iv = Buffer.from(ivBase64, 'base64');
	const authTag = Buffer.from(authTagBase64, 'base64');

	// Create decipher
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(authTag);
	
	// Decrypt
	let decrypted = decipher.update(encrypted, 'base64', 'utf8');
	decrypted += decipher.final('utf8');
	
	return decrypted;
}

