"use node";

import { action, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { getAuthUserId } from '@convex-dev/auth/server';
import { loadPrompt } from './promptUtils';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

/**
 * Internal action to decrypt Claude API key
 */
export const decryptApiKey = internalAction({
	args: {
		encryptedKey: v.string(),
	},
	handler: async (ctx, args) => {
		const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;
		if (!encryptionKey) {
			throw new Error(
				'API_KEY_ENCRYPTION_KEY environment variable is not set. Run: npx convex env set API_KEY_ENCRYPTION_KEY your-32-byte-key'
			);
		}

		// Convert hex key to Buffer
		const keyBuffer = Buffer.from(encryptionKey, 'hex');
		if (keyBuffer.length !== 32) {
			throw new Error('API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
		}

		try {
			// Split encrypted key: format is iv:authTag:encryptedData (all base64)
			const parts = args.encryptedKey.split(':');
			if (parts.length !== 3) {
				throw new Error('Invalid encrypted key format');
			}

			const iv = Buffer.from(parts[0], 'base64');
			const authTag = Buffer.from(parts[1], 'base64');
			const encrypted = Buffer.from(parts[2], 'base64');

			const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
			decipher.setAuthTag(authTag);
			
			const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

			return decrypted.toString('utf8');
		} catch (error) {
			throw new Error(`Failed to decrypt API key: ${error instanceof Error ? error.message : String(error)}`);
		}
	},
});

/**
 * Generate a flashcard from text input using Claude API
 */
export const generateFlashcard = action({
	args: {
		text: v.string(),
		sourceTitle: v.optional(v.string()),
		sourceAuthor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get encrypted API key using internal query from settings
		const keys: { claudeApiKey: string | null; readwiseApiKey: string | null } | null = await ctx.runQuery(
			internal.settings.getEncryptedKeysInternal,
			{}
		);
		
		if (!keys?.claudeApiKey) {
			throw new Error('Claude API key not configured. Please add your API key in Settings.');
		}

		// Decrypt API key
		const apiKey: string = await ctx.runAction(internal.generateFlashcard.decryptApiKey, {
			encryptedKey: keys.claudeApiKey,
		});

		// Load prompt template with variables
		const prompt = loadPrompt('flashcard-generation', {
			text: args.text,
			source: {
				title: args.sourceTitle,
				author: args.sourceAuthor,
			},
		});

		try {
			const response: Response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': apiKey,
					'anthropic-version': '2023-06-01',
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					model: 'claude-3-haiku-20240307',
					max_tokens: 500,
					messages: [
						{
							role: 'user',
							content: prompt,
						},
					],
				}),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
				try {
					const errorJson = JSON.parse(errorBody);
					errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
				} catch {
					if (errorBody) {
						errorMessage = errorBody.length > 200 ? errorBody.substring(0, 200) + '...' : errorBody;
					}
				}
				throw new Error(errorMessage);
			}

			const data: {
				content?: Array<{ text?: string }>;
			} = await response.json();
			const content: string = data.content?.[0]?.text || '';

			// Try to parse JSON from response
			let flashcards: Array<{ question: string; answer: string }>;
			try {
				// Extract JSON from response (might have markdown code blocks)
				const jsonMatch = content.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					flashcards = JSON.parse(jsonMatch[0]);
					// Ensure it's an array
					if (!Array.isArray(flashcards)) {
						flashcards = [flashcards];
					}
				} else {
					// Try single object format
					const objMatch = content.match(/\{[\s\S]*\}/);
					if (objMatch) {
						const singleCard = JSON.parse(objMatch[0]);
						flashcards = [singleCard];
					} else {
						throw new Error('No JSON found in response');
					}
				}
			} catch (parseError) {
				// If parsing fails, return a single flashcard with raw content
				flashcards = [
					{
						question: 'Generated Question',
						answer: content,
					},
				];
			}

			return {
				success: true,
				flashcards,
				rawResponse: content,
			};
		} catch (error) {
			throw new Error(
				`Failed to generate flashcard: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	},
});

