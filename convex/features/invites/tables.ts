import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Workspace invites table
 *
 * Stores invitations for users to join workspaces.
 * Invites can be targeted to a specific user (by userId) or by email.
 */
export const workspaceInvitesTable = defineTable({
	workspaceId: v.id('workspaces'),
	invitedUserId: v.optional(v.id('users')),
	email: v.optional(v.string()),
	role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
	invitedByPersonId: v.id('people'),
	code: v.string(),
	createdAt: v.number(),
	expiresAt: v.optional(v.number()),
	acceptedAt: v.optional(v.number()),
	revokedAt: v.optional(v.number())
})
	.index('by_code', ['code'])
	.index('by_workspace', ['workspaceId'])
	.index('by_user', ['invitedUserId'])
	.index('by_email', ['email']);
