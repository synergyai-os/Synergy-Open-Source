"use node";

/**
 * Encryption utilities for API keys
 * 
 * This file MUST use "use node" because it uses Node.js crypto.
 * Files with "use node" can ONLY contain actions (not mutations or queries).
 * 
 * Uses AES-256-GCM for encryption with a key from environment variables.
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto");

/**
 * Encrypt an API key
 * Internal action - called from update mutations
 */
export const encryptApiKey = internalAction({
	args: {
		plaintextApiKey: v.string(),
	},
	handler: async (ctx, args) => {
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
		let encrypted = cipher.update(args.plaintextApiKey, 'utf8', 'base64');
		encrypted += cipher.final('base64');
		
		// Get auth tag (for GCM mode)
		const authTag = cipher.getAuthTag();
		
		// Combine IV, auth tag, and encrypted data (all base64)
		// Format: iv:authTag:encryptedData
		return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
	},
});

// SECURITY: Decrypt function removed - we NEVER decrypt API keys on the client
// Keys stay encrypted in the database and are never sent to the client

