import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const featureFlagsTable = defineTable({
	flag: v.string(),
	description: v.optional(v.string()),
	enabled: v.boolean(),
	rolloutPercentage: v.optional(v.number()),
	allowedUserIds: v.optional(v.array(v.id('users'))),
	allowedWorkspaceIds: v.optional(v.array(v.id('workspaces'))),
	allowedDomains: v.optional(v.array(v.string())),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_flag', ['flag']);

export const waitlistTable = defineTable({
	email: v.string(),
	name: v.optional(v.string()),
	company: v.optional(v.string()),
	role: v.optional(v.string()),
	reason: v.optional(v.string()),
	referralSource: v.optional(v.string()),
	joinedAt: v.number(),
	invitedAt: v.optional(v.number()),
	status: v.union(v.literal('pending'), v.literal('invited'), v.literal('converted'))
})
	.index('by_email', ['email'])
	.index('by_status', ['status'])
	.index('by_joined_at', ['joinedAt']);

export const doc404ErrorsTable = defineTable({
	url: v.string(),
	referrer: v.optional(v.string()),
	userAgent: v.optional(v.string()),
	ipAddress: v.optional(v.string()),
	userId: v.optional(v.id('users')),
	sessionId: v.optional(v.string()),
	count: v.number(),
	firstSeenAt: v.number(),
	lastSeenAt: v.number(),
	resolved: v.boolean(),
	resolvedAt: v.optional(v.number()),
	resolvedBy: v.optional(v.id('users')),
	resolutionNote: v.optional(v.string())
})
	.index('by_url', ['url'])
	.index('by_resolved', ['resolved'])
	.index('by_last_seen', ['lastSeenAt']);
