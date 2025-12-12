import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authLoginStateTable = defineTable({
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
})
	.index('by_state', ['stateHash'])
	.index('by_expires', ['expiresAt']);

export const authSessionsTable = defineTable({
	sessionId: v.string(),
	convexUserId: v.id('users'),
	workosUserId: v.string(),
	workosSessionId: v.string(),
	accessTokenCiphertext: v.string(),
	refreshTokenCiphertext: v.string(),
	csrfTokenHash: v.string(),
	expiresAt: v.number(),
	createdAt: v.number(),
	lastRefreshedAt: v.optional(v.number()),
	lastSeenAt: v.optional(v.number()),
	ipAddress: v.optional(v.string()),
	userAgent: v.optional(v.string()),
	isValid: v.boolean(),
	revokedAt: v.optional(v.number()),
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
})
	.index('by_session', ['sessionId'])
	.index('by_convex_user', ['convexUserId'])
	.index('by_workos_session', ['workosSessionId']);

export const verificationCodesTable = defineTable({
	email: v.string(),
	code: v.string(),
	type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change')),
	attempts: v.number(),
	verified: v.boolean(),
	verifiedAt: v.optional(v.number()),
	createdAt: v.number(),
	expiresAt: v.number(),
	ipAddress: v.optional(v.string()),
	userAgent: v.optional(v.string())
})
	.index('by_email_type', ['email', 'type'])
	.index('by_code', ['code'])
	.index('by_expires', ['expiresAt']);
