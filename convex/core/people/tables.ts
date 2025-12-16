import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// People table: workspace-scoped organizational identity
export const peopleTable = defineTable({
	// Identity
	workspaceId: v.id('workspaces'),
	userId: v.optional(v.id('users')), // Null = invited but not signed up
	email: v.optional(v.string()), // Provided for invited people without userId

	// Workspace-specific profile
	displayName: v.optional(v.string()), // Workspace-specific name

	// Workspace role (for workspace-level RBAC)
	workspaceRole: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),

	// Lifecycle
	status: v.union(v.literal('invited'), v.literal('active'), v.literal('archived')),

	// Timestamps
	invitedAt: v.number(), // When first invited/created
	invitedBy: v.optional(v.id('people')), // Who invited them (personId, not userId). Can be null for initial owner seeding.
	joinedAt: v.optional(v.number()), // When they accepted/signed up
	archivedAt: v.optional(v.number()), // When archived
	archivedBy: v.optional(v.id('people')), // Who archived them

	// Onboarding: user onboarding completion (SYOS-891)
	onboardingCompletedAt: v.optional(v.number()),

	// Guest access
	isGuest: v.optional(v.boolean()), // true = limited access guest
	guestExpiry: v.optional(v.number()) // When guest access expires (timestamp)
})
	.index('by_workspace', ['workspaceId'])
	.index('by_user', ['userId'])
	.index('by_workspace_user', ['workspaceId', 'userId'])
	.index('by_workspace_email', ['workspaceId', 'email'])
	.index('by_workspace_status', ['workspaceId', 'status']);
