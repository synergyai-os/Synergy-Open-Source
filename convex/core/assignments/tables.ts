import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const assignmentsTable = defineTable({
	// Core links
	circleId: v.id('circles'),
	roleId: v.id('circleRoles'),
	personId: v.id('people'),

	// Metadata
	assignedAt: v.number(),
	assignedByPersonId: v.optional(v.id('people')),

	// Optional term limits
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number()),

	// Lifecycle
	status: v.union(v.literal('active'), v.literal('ended')),
	endedAt: v.optional(v.number()),
	endedByPersonId: v.optional(v.id('people')),
	endReason: v.optional(v.string())
})
	.index('by_circle', ['circleId'])
	.index('by_role', ['roleId'])
	.index('by_person', ['personId'])
	.index('by_circle_role', ['circleId', 'roleId'])
	.index('by_circle_person', ['circleId', 'personId'])
	.index('by_role_person', ['roleId', 'personId'])
	.index('by_circle_status', ['circleId', 'status']);
