import { query, mutation, action, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSession } from './sessionValidation';
// Note: We use dynamic imports for crypto functions to avoid bundler issues
// Mutations have Node.js runtime by default and can use dynamic imports
import { internal } from './_generated/api';

/**
 * Get user settings for the current authenticated user
 * Note: We return encrypted keys here and decrypt them client-side, OR
 * we call an internal mutation to decrypt. Actually, queries can't use Node.js crypto.
 * So we'll use an internal action to decrypt.
 * 
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const getUserSettings = query({
	args: {
		userId: v.id('users') // Required: passed from authenticated SvelteKit session
	},
	handler: async (ctx, args) => {
		// Validate session (prevents impersonation)
		await validateSession(ctx, args.userId);
		const userId = args.userId;

		// Find or create user settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (!settings) {
			// Create default settings if they don't exist
			// Note: In a query, we can only read, so we return null if settings don't exist
			// The mutations will create settings when needed
			return null;
		}

		// SECURITY: Return boolean flags indicating if keys exist, but NEVER return the actual keys
		// Even encrypted keys should never be sent to the client - keys stay encrypted in the database
		return {
			...settings,
			// Return boolean flags only - client never sees encrypted or decrypted keys
			claudeApiKey: undefined, // Never return keys to client
			readwiseApiKey: undefined, // Never return keys to client
			// Use boolean flags to indicate key existence without exposing the keys
			hasClaudeKey: !!settings.claudeApiKey,
			hasReadwiseKey: !!settings.readwiseApiKey
		};
	}
});

/**
 * Internal query to get encrypted API keys for server-side use only
 * This returns the encrypted keys (for use in actions/internal functions)
 */
export const getEncryptedKeysInternal = internalQuery({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (!settings) {
			return null;
		}

		return {
			claudeApiKey: settings.claudeApiKey || null,
			readwiseApiKey: settings.readwiseApiKey || null
		};
	}
});

/**
 * Update Claude API key
 * Validates, encrypts, and saves the key securely.
 * Uses action to handle validation and encryption (which requires Node.js runtime).
 */
export const updateClaudeApiKey = action({
	args: {
		apiKey: v.string()
	},
	handler: async (ctx, args): Promise<string> => {
		// Get user ID
		const userId: string | null = await ctx.runQuery(internal.settings.getUserId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Validate the API key first
		const validationResult = await ctx.runAction(internal.validateApiKeys.validateClaudeApiKey, {
			apiKey: args.apiKey
		});

		if (!validationResult.valid) {
			// Return user-friendly error message
			const errorMsg = validationResult.error || 'Invalid API key';
			// Make error message shorter and more user-friendly
			if (errorMsg.includes('invalid x-api-key')) {
				throw new Error('Invalid API key format');
			}
			if (errorMsg.includes('authentication')) {
				throw new Error('Authentication failed');
			}
			throw new Error(errorMsg.length > 50 ? errorMsg.substring(0, 50) + '...' : errorMsg);
		}

		// Encrypt the API key (required so team can't read user keys)
		const encryptedKey: string = await ctx.runAction(internal.cryptoActions.encryptApiKey, {
			plaintextApiKey: args.apiKey
		});

		// Save encrypted key
		// userId is already an Id<"users"> from getAuthUserId, so we can use it directly
		return await ctx.runMutation(internal.settings.updateClaudeApiKeyInternal, {
			userId: userId as any, // Type assertion needed due to Convex's type system
			encryptedKey
		});
	}
});

/**
 * Update Readwise API key
 * Validates, encrypts, and saves the key securely.
 * Uses action to handle validation and encryption (which requires Node.js runtime).
 */
export const updateReadwiseApiKey = action({
	args: {
		apiKey: v.string()
	},
	handler: async (ctx, args): Promise<string> => {
		// Get user ID
		const userId = await ctx.runQuery(internal.settings.getUserId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Validate the API key first
		const validationResult = await ctx.runAction(internal.validateApiKeys.validateReadwiseApiKey, {
			apiKey: args.apiKey
		});

		if (!validationResult.valid) {
			// Return user-friendly error message
			const errorMsg = validationResult.error || 'Invalid API key';
			throw new Error(errorMsg.length > 50 ? errorMsg.substring(0, 50) + '...' : errorMsg);
		}

		// Encrypt the API key (required so team can't read user keys)
		const encryptedKey: string = await ctx.runAction(internal.cryptoActions.encryptApiKey, {
			plaintextApiKey: args.apiKey
		});

		// Save encrypted key
		// userId is already an Id<"users"> from getAuthUserId, so we can use it directly
		return await ctx.runMutation(internal.settings.updateReadwiseApiKeyInternal, {
			userId: userId as any, // Type assertion needed due to Convex's type system
			encryptedKey
		});
	}
});

/**
 * Internal query to get the current user ID
 * Used by actions which can't directly access getAuthUserId
 */
export const getUserId = internalQuery({
	handler: async (ctx) => {
		return await getAuthUserId(ctx);
	}
});

/**
 * Internal mutation to encrypt and save the Claude API key
 * Called from the action after validation
 * Encryption happens here (mutations can use Node.js crypto)
 */
export const updateClaudeApiKeyInternal = internalMutation({
	args: {
		userId: v.id('users'),
		encryptedKey: v.string() // Already encrypted - just save it
	},
	handler: async (ctx, args) => {
		// No encryption needed here - key is already encrypted from the action

		// Find existing settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.first();

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				claudeApiKey: args.encryptedKey
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert('userSettings', {
				userId: args.userId,
				theme: undefined,
				claudeApiKey: args.encryptedKey,
				readwiseApiKey: undefined
			});
			return settingsId;
		}
	}
});

/**
 * Internal mutation to encrypt and save the Readwise API key
 * Called from the action after validation
 * Encryption happens here (mutations can use Node.js crypto)
 */
export const updateReadwiseApiKeyInternal = internalMutation({
	args: {
		userId: v.id('users'),
		encryptedKey: v.string() // Already encrypted - just save it
	},
	handler: async (ctx, args) => {
		// No encryption needed here - key is already encrypted from the action

		// Find existing settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.first();

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				readwiseApiKey: args.encryptedKey
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert('userSettings', {
				userId: args.userId,
				theme: undefined,
				claudeApiKey: undefined,
				readwiseApiKey: args.encryptedKey
			});
			return settingsId;
		}
	}
});

/**
 * Update theme preference
 */
export const updateTheme = mutation({
	args: {
		theme: v.union(v.literal('light'), v.literal('dark'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Find existing settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				theme: args.theme
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert('userSettings', {
				userId,
				theme: args.theme,
				claudeApiKey: undefined,
				readwiseApiKey: undefined
			});
			return settingsId;
		}
	}
});

/**
 * Delete Claude API key
 */
export const deleteClaudeApiKey = mutation({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Find existing settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (settings) {
			// Remove the key
			await ctx.db.patch(settings._id, {
				claudeApiKey: undefined
			});
			return settings._id;
		}
		return null;
	}
});

/**
 * Delete Readwise API key
 */
export const deleteReadwiseApiKey = mutation({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Find existing settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (settings) {
			// Remove the key
			await ctx.db.patch(settings._id, {
				readwiseApiKey: undefined
			});
			return settings._id;
		}
		return null;
	}
});

/**
 * Internal query to get user settings for sync (returns sync timestamp)
 * Used by sync actions
 */
export const getUserSettingsForSync = internalQuery({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.first();
	}
});
