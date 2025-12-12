'use node';

/**
 * Encryption utilities for API keys
 *
 * This file MUST use "use node" because it uses Node.js crypto.
 * Files with "use node" can ONLY contain actions (not mutations or queries).
 *
 * Uses AES-256-GCM for encryption with a key from environment variables.
 */

import * as crypto from 'crypto';
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from './errors/codes';

/**
 * Encrypt an API key
 * Internal action - called from update mutations
 */
export const encryptApiKey = internalAction({
	args: {
		plaintextApiKey: v.string()
	},
	handler: async (ctx, args) => {
		const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;

		if (!encryptionKey) {
			throw createError(
				ErrorCodes.EXTERNAL_API_KEY_MISSING,
				'API_KEY_ENCRYPTION_KEY environment variable is not set. ' +
					'Run: npx convex env set API_KEY_ENCRYPTION_KEY your-32-byte-key'
			);
		}

		// Validate key length (AES-256 requires 32 bytes / 64 hex chars)
		if (encryptionKey.length !== 64) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
					'Generate with: openssl rand -hex 32'
			);
		}

		// Convert hex key to Buffer
		const key = Buffer.from(encryptionKey, 'hex');

		// Generate a random IV (initialization vector) - 16 bytes for AES-GCM
		const iv = crypto.randomBytes(16);

		// Create cipher
		const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

		// Encrypt
		let encrypted = cipher.update(args.plaintextApiKey, 'utf8', 'base64');
		encrypted += cipher.final('base64');

		// Get auth tag (for GCM mode)
		const authTag = cipher.getAuthTag();

		// Combine IV, auth tag, and encrypted data (all base64)
		// Format: iv:authTag:encryptedData
		return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
	}
});

/**
 * Decrypt an API key (server-side only)
 * Internal action - ONLY for server-side use in sync actions
 * NEVER expose this to the client
 */
export const decryptApiKey = internalAction({
	args: {
		encryptedApiKey: v.string()
	},
	handler: async (ctx, args) => {
		const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;

		if (!encryptionKey) {
			throw createError(
				ErrorCodes.EXTERNAL_API_KEY_MISSING,
				'API_KEY_ENCRYPTION_KEY environment variable is not set. ' +
					'Run: npx convex env set API_KEY_ENCRYPTION_KEY your-32-byte-key'
			);
		}

		// Validate key length
		if (encryptionKey.length !== 64) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
					'Generate with: openssl rand -hex 32'
			);
		}

		// Parse the encrypted string: iv:authTag:encryptedData
		const parts = args.encryptedApiKey.split(':');
		if (parts.length !== 3) {
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Invalid encrypted API key format');
		}

		const [ivBase64, authTagBase64, encryptedData] = parts;

		// Convert hex key to Buffer
		const key = Buffer.from(encryptionKey, 'hex');

		// Convert base64 strings to Buffers
		const iv = Buffer.from(ivBase64, 'base64');
		const authTag = Buffer.from(authTagBase64, 'base64');

		// Create decipher
		const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt
		let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	}
});
