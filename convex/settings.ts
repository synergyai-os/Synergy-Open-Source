import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { encryptApiKey, decryptApiKey } from "./crypto";

/**
 * Get user settings for the current authenticated user
 */
export const getUserSettings = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		// Find or create user settings
		let settings = await ctx.db
			.query("userSettings")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (!settings) {
			// Create default settings if they don't exist
			// Note: In a query, we can only read, so we return null if settings don't exist
			// The mutations will create settings when needed
			return null;
		}

		// Decrypt API keys before returning (never return encrypted keys to client)
		if (settings) {
			const decryptedSettings = {
				...settings,
				claudeApiKey: settings.claudeApiKey ? decryptApiKey(settings.claudeApiKey) : undefined,
				readwiseApiKey: settings.readwiseApiKey ? decryptApiKey(settings.readwiseApiKey) : undefined,
			};
			return decryptedSettings;
		}

		return null;
	},
});

/**
 * Update Claude API key
 */
export const updateClaudeApiKey = mutation({
	args: {
		apiKey: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Find existing settings
		let settings = await ctx.db
			.query("userSettings")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		// Encrypt API key before storing
		const encryptedKey = encryptApiKey(args.apiKey);

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				claudeApiKey: encryptedKey,
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert("userSettings", {
				userId,
				theme: undefined,
				claudeApiKey: encryptedKey,
				readwiseApiKey: undefined,
			});
			return settingsId;
		}
	},
});

/**
 * Update Readwise API key
 */
export const updateReadwiseApiKey = mutation({
	args: {
		apiKey: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Find existing settings
		let settings = await ctx.db
			.query("userSettings")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		// Encrypt API key before storing
		const encryptedKey = encryptApiKey(args.apiKey);

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				readwiseApiKey: encryptedKey,
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert("userSettings", {
				userId,
				theme: undefined,
				claudeApiKey: undefined,
				readwiseApiKey: encryptedKey,
			});
			return settingsId;
		}
	},
});

/**
 * Update theme preference
 */
export const updateTheme = mutation({
	args: {
		theme: v.union(v.literal("light"), v.literal("dark")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Find existing settings
		let settings = await ctx.db
			.query("userSettings")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				theme: args.theme,
			});
			return settings._id;
		} else {
			// Create new
			const settingsId = await ctx.db.insert("userSettings", {
				userId,
				theme: args.theme,
				claudeApiKey: undefined,
				readwiseApiKey: undefined,
			});
			return settingsId;
		}
	},
});

