import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const usersTable = defineTable({
	workosId: v.string(),
	email: v.string(),
	emailVerified: v.boolean(),
	firstName: v.optional(v.string()),
	lastName: v.optional(v.string()),
	name: v.optional(v.string()),
	profileImageUrl: v.optional(v.string()),
	createdAt: v.number(),
	updatedAt: v.number(),
	lastLoginAt: v.optional(v.number()),
	deletedAt: v.optional(v.number())
})
	.index('by_workos_id', ['workosId'])
	.index('by_email', ['email']);

export const accountLinksTable = defineTable({
	primaryUserId: v.id('users'),
	linkedUserId: v.id('users'),
	linkType: v.optional(v.string()),
	verifiedAt: v.number(),
	createdAt: v.number()
})
	.index('by_primary', ['primaryUserId'])
	.index('by_linked', ['linkedUserId']);

export const userSettingsTable = defineTable({
	userId: v.id('users'),
	theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
	claudeApiKey: v.optional(v.string()),
	readwiseApiKey: v.optional(v.string()),
	lastReadwiseSyncAt: v.optional(v.number())
}).index('by_user', ['userId']);
