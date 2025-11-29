import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createLoginState = mutation({
	args: {
		stateHash: v.string(),
		codeVerifierCiphertext: v.string(),
		redirectTo: v.optional(v.string()),
		flowMode: v.optional(v.string()),
		linkAccount: v.optional(v.boolean()),
		primaryUserId: v.optional(v.id('users')),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		createdAt: v.number(),
		expiresAt: v.number()
	},
	handler: async (ctx, args) => {
		// Clean up any existing state for the same hash before inserting
		const existing = await ctx.db
			.query('authLoginState')
			.withIndex('by_state', (q) => q.eq('stateHash', args.stateHash))
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}

		const id = await ctx.db.insert('authLoginState', {
			stateHash: args.stateHash,
			codeVerifierCiphertext: args.codeVerifierCiphertext,
			redirectTo: args.redirectTo,
			flowMode: args.flowMode,
			linkAccount: args.linkAccount,
			primaryUserId: args.primaryUserId,
			ipAddress: args.ipAddress,
			userAgent: args.userAgent,
			createdAt: args.createdAt,
			expiresAt: args.expiresAt
		});

		return ctx.db.get(id);
	}
});

export const consumeLoginState = mutation({
	args: {
		stateHash: v.string(),
		now: v.number()
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authLoginState')
			.withIndex('by_state', (q) => q.eq('stateHash', args.stateHash))
			.first();

		if (!record) {
			return null;
		}

		await ctx.db.delete(record._id);

		if (record.expiresAt < args.now) {
			return null;
		}

		return {
			codeVerifierCiphertext: record.codeVerifierCiphertext,
			redirectTo: record.redirectTo,
			flowMode: record.flowMode,
			linkAccount: record.linkAccount ?? false,
			primaryUserId: record.primaryUserId ?? undefined,
			ipAddress: record.ipAddress,
			userAgent: record.userAgent,
			createdAt: record.createdAt
		};
	}
});

export const getActiveSessionForUser = query({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const sessions = await ctx.db
			.query('authSessions')
			.withIndex('by_convex_user', (q) => q.eq('convexUserId', args.userId))
			.collect();

		const now = Date.now();
		const validSessions = sessions.filter((session) => session.isValid && session.expiresAt > now);

		if (validSessions.length === 0) {
			return null;
		}

		const sorted = validSessions.sort((a, b) => {
			const aTimestamp = a.lastSeenAt ?? a.createdAt;
			const bTimestamp = b.lastSeenAt ?? b.createdAt;
			return bTimestamp - aTimestamp;
		});

		const session = sorted[0];

		return {
			sessionId: session.sessionId,
			expiresAt: session.expiresAt
		};
	}
});

export const createSession = mutation({
	args: {
		sessionId: v.string(),
		convexUserId: v.id('users'),
		workosUserId: v.string(),
		workosSessionId: v.string(),
		accessTokenCiphertext: v.string(),
		refreshTokenCiphertext: v.string(),
		csrfTokenHash: v.string(),
		expiresAt: v.number(),
		createdAt: v.number(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		userSnapshot: v.object({
			userId: v.id('users'),
			workosId: v.string(),
			email: v.string(),
			firstName: v.optional(v.string()),
			lastName: v.optional(v.string()),
			name: v.optional(v.string()),
			activeWorkspace: v.optional(
				v.object({
					type: v.union(v.literal('personal'), v.literal('workspace')),
					id: v.optional(v.string()),
					name: v.optional(v.string())
				})
			)
		})
	},
	handler: async (ctx, args) => {
		// Remove any existing session with the same sessionId before inserting
		const existing = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}

		await ctx.db.insert('authSessions', {
			sessionId: args.sessionId,
			convexUserId: args.convexUserId,
			workosUserId: args.workosUserId,
			workosSessionId: args.workosSessionId,
			accessTokenCiphertext: args.accessTokenCiphertext,
			refreshTokenCiphertext: args.refreshTokenCiphertext,
			csrfTokenHash: args.csrfTokenHash,
			expiresAt: args.expiresAt,
			createdAt: args.createdAt,
			lastRefreshedAt: undefined,
			lastSeenAt: args.createdAt,
			ipAddress: args.ipAddress,
			userAgent: args.userAgent,
			isValid: true,
			revokedAt: undefined,
			userSnapshot: args.userSnapshot
		});

		return { sessionId: args.sessionId };
	}
});

export const getSessionById = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record || !record.isValid) {
			return null;
		}

		return record;
	}
});

export const updateSessionSecrets = mutation({
	args: {
		sessionId: v.string(),
		newSessionId: v.optional(v.string()),
		accessTokenCiphertext: v.optional(v.string()),
		refreshTokenCiphertext: v.optional(v.string()),
		csrfTokenHash: v.optional(v.string()),
		expiresAt: v.optional(v.number()),
		lastRefreshedAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		const patch: Record<string, unknown> = {};

		if (args.newSessionId) {
			patch.sessionId = args.newSessionId;
		}

		if (args.accessTokenCiphertext) {
			patch.accessTokenCiphertext = args.accessTokenCiphertext;
		}

		if (args.refreshTokenCiphertext) {
			patch.refreshTokenCiphertext = args.refreshTokenCiphertext;
		}

		if (args.csrfTokenHash) {
			patch.csrfTokenHash = args.csrfTokenHash;
		}

		if (args.expiresAt !== undefined) {
			patch.expiresAt = args.expiresAt;
		}

		if (args.lastRefreshedAt !== undefined) {
			patch.lastRefreshedAt = args.lastRefreshedAt;
		}

		await ctx.db.patch(record._id, patch);

		return {
			sessionId: args.newSessionId ?? args.sessionId
		};
	}
});

export const touchSession = mutation({
	args: {
		sessionId: v.string(),
		lastSeenAt: v.number(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		await ctx.db.patch(record._id, {
			lastSeenAt: args.lastSeenAt,
			ipAddress: args.ipAddress ?? record.ipAddress,
			userAgent: args.userAgent ?? record.userAgent
		});

		return { success: true };
	}
});

export const invalidateSession = mutation({
	args: {
		sessionId: v.string(),
		revokedAt: v.number()
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		await ctx.db.patch(record._id, {
			isValid: false,
			revokedAt: args.revokedAt
		});

		return { success: true };
	}
});
