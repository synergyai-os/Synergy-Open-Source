import { query, mutation, action, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
// Note: We use dynamic imports for crypto functions to avoid bundler issues
// Mutations have Node.js runtime by default and can use dynamic imports
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';

/**
 * Get user settings for the current authenticated user
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 *
 * Note: We return encrypted keys here and decrypt them client-side, OR
 * we call an internal mutation to decrypt. Actually, queries can't use Node.js crypto.
 * So we'll use an internal action to decrypt.
 */
export const getUserSettings = query({
	args: {
		sessionId: v.string() // Required: passed from authenticated SvelteKit session
	},
	handler: async (ctx, args) => {
		// Validate session and derive userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

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
	args: {
		userId: v.string()
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', args.userId as Id<'users'>)) // userId comes as string from session but is Id<"users"> at runtime
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
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 */
export const updateClaudeApiKey = action({
	args: {
		sessionId: v.string(),
		apiKey: v.string()
	},
	handler: async (ctx, args): Promise<string> => {
		// Get user ID from sessionId (secure)
		const userId: string | null = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
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
			userId: userId as Id<'users'>,
			encryptedKey
		});
	}
});

/**
 * Update Readwise API key
 * Validates, encrypts, and saves the key securely.
 * Uses action to handle validation and encryption (which requires Node.js runtime).
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 */
export const updateReadwiseApiKey = action({
	args: {
		sessionId: v.string(),
		apiKey: v.string()
	},
	handler: async (ctx, args): Promise<string> => {
		// Get user ID from sessionId (secure)
		const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
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
			userId: userId as Id<'users'>,
			encryptedKey
		});
	}
});

/**
 * Internal query to get the current user ID from sessionId
 * Used by actions which need to derive userId from sessionId
 */
export const getUserIdFromSessionId = internalQuery({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		return await getAuthUserId(ctx, args.sessionId);
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
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 */
export const updateTheme = mutation({
	args: {
		sessionId: v.string(),
		theme: v.union(v.literal('light'), v.literal('dark'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
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
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 */
export const deleteClaudeApiKey = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
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
 *
 * SECURITY: Uses sessionId to derive userId server-side (prevents impersonation)
 */
export const deleteReadwiseApiKey = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
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
