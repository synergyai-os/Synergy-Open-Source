/**
 * Meetings Module - Core meeting CRUD operations
 *
 * Supports:
 * - Ad-hoc meetings (no circle) AND circle-based meetings
 * - Recurring meetings (daily, weekly, monthly)
 * - Polymorphic attendees (user/role/circle)
 * - Privacy controls (public, circle-only, private)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

/**
 * Helper: Verify user has access to organization
 */
async function ensureOrganizationMembership(
	ctx: QueryCtx | MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		throw new Error('User is not a member of this organization');
	}
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all meetings for an organization
 */
export const list = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// Get all meetings
		const meetings = await ctx.db
			.query('meetings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.collect();

		// Get attendee counts for each meeting
		const results = await Promise.all(
			meetings.map(async (meeting) => {
				const attendees = await ctx.db
					.query('meetingAttendees')
					.withIndex('by_meeting', (q) => q.eq('meetingId', meeting._id))
					.collect();

				return {
					...meeting,
					attendeeCount: attendees.length
				};
			})
		);

		return results;
	}
});

/**
 * Get a single meeting by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to the organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Get attendees
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', meeting._id))
			.collect();

		// Resolve attendee details
		const resolvedAttendees = await Promise.all(
			attendees.map(async (attendee) => {
				if (attendee.attendeeType === 'user' && attendee.userId) {
					const user = await ctx.db.get(attendee.userId);
					return {
						...attendee,
						userName: user?.name ?? user?.email ?? 'Unknown'
					};
				} else if (attendee.attendeeType === 'role' && attendee.circleRoleId) {
					const role = await ctx.db.get(attendee.circleRoleId);
					return {
						...attendee,
						roleName: role?.name ?? 'Unknown Role'
					};
				} else if (attendee.attendeeType === 'circle' && attendee.circleId) {
					const circle = await ctx.db.get(attendee.circleId);
					return {
						...attendee,
						circleName: circle?.name ?? 'Unknown Circle'
					};
				}
				return attendee;
			})
		);

		// Get secretary info
		const secretaryId = meeting.secretaryId ?? meeting.createdBy;
		const secretary = await ctx.db.get(secretaryId);
		const secretaryName = secretary?.name ?? secretary?.email ?? 'Unknown';

		return {
			...meeting,
			attendees: resolvedAttendees,
			secretaryName
		};
	}
});

/**
 * List meetings for a specific circle
 */
export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get circle to verify organization access
		const circle = await ctx.db.get(args.circleId);

		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, circle.organizationId, userId);

		// Get meetings for this circle
		const meetings = await ctx.db
			.query('meetings')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		return meetings;
	}
});

/**
 * List meetings for current user
 * Includes:
 * - Meetings where user is direct attendee
 * - Meetings where user fills an invited role
 * - Meetings where user is circle member (for public/circle visibility)
 */
export const listForUser = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// Get all meetings in organization
		const allMeetings = await ctx.db
			.query('meetings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.collect();

		// Get user's direct meeting invites
		const userInvites = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		const directMeetingIds = new Set(userInvites.map((inv) => inv.meetingId));

		// Get user's circle roles
		const userRoleAssignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		const userRoleIds = new Set(userRoleAssignments.map((assignment) => assignment.circleRoleId));

		// Get user's circle memberships
		const userCircleMemberships = await ctx.db
			.query('circleMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		const userCircleIds = new Set(userCircleMemberships.map((membership) => membership.circleId));

		// Filter meetings user can access
		const userMeetings = await Promise.all(
			allMeetings.map(async (meeting) => {
				// Creator always sees their own meetings
				if (meeting.createdBy === userId) {
					return meeting;
				}

				// Check if user is directly invited
				if (directMeetingIds.has(meeting._id)) {
					return meeting;
				}

				// Get meeting attendees
				const attendees = await ctx.db
					.query('meetingAttendees')
					.withIndex('by_meeting', (q) => q.eq('meetingId', meeting._id))
					.collect();

				// Check if user fills an invited role
				for (const attendee of attendees) {
					if (attendee.attendeeType === 'role' && attendee.circleRoleId) {
						if (userRoleIds.has(attendee.circleRoleId)) {
							return meeting;
						}
					}
					// Check if user is member of invited circle
					if (attendee.attendeeType === 'circle' && attendee.circleId) {
						if (userCircleIds.has(attendee.circleId)) {
							return meeting;
						}
					}
				}

				// Check visibility rules for circle-based meetings
				if (meeting.circleId) {
					if (meeting.visibility === 'public') {
						return meeting; // All org members can see public meetings
					}
					if (meeting.visibility === 'circle' && userCircleIds.has(meeting.circleId)) {
						return meeting; // Circle members can see circle-visible meetings
					}
				} else {
					// Ad-hoc meetings: only public ones visible to all
					if (meeting.visibility === 'public') {
						return meeting;
					}
				}

				return null; // User can't access this meeting
			})
		);

		return userMeetings.filter((m) => m !== null);
	}
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new meeting
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		circleId: v.optional(v.id('circles')),
		templateId: v.optional(v.id('meetingTemplates')),
		title: v.string(),
		startTime: v.number(),
		duration: v.number(),
		visibility: v.union(v.literal('public'), v.literal('circle'), v.literal('private')),
		recurrence: v.optional(
			v.object({
				frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
				interval: v.number(),
				daysOfWeek: v.optional(v.array(v.number())),
				endDate: v.optional(v.number())
			})
		)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// If circleId provided, verify it exists and belongs to org
		if (args.circleId) {
			const circle = await ctx.db.get(args.circleId);
			if (!circle) {
				throw new Error('Circle not found');
			}
			if (circle.organizationId !== args.organizationId) {
				throw new Error('Circle does not belong to this organization');
			}
		}

		// If templateId provided, verify it exists and belongs to org
		if (args.templateId) {
			const template = await ctx.db.get(args.templateId);
			if (!template) {
				throw new Error('Template not found');
			}
			if (template.organizationId !== args.organizationId) {
				throw new Error('Template does not belong to this organization');
			}
		}

		// Create meeting
		const meetingId = await ctx.db.insert('meetings', {
			organizationId: args.organizationId,
			circleId: args.circleId,
			templateId: args.templateId,
			title: args.title,
			startTime: args.startTime,
			duration: args.duration,
			visibility: args.visibility,
			recurrence: args.recurrence,
			createdAt: Date.now(),
			createdBy: userId,
			updatedAt: Date.now()
		});

		// Auto-add creator as attendee
		await ctx.db.insert('meetingAttendees', {
			meetingId,
			attendeeType: 'user',
			userId,
			addedAt: Date.now()
		});

		return { meetingId };
	}
});

/**
 * Update an existing meeting
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		title: v.optional(v.string()),
		startTime: v.optional(v.number()),
		duration: v.optional(v.number()),
		visibility: v.optional(v.union(v.literal('public'), v.literal('circle'), v.literal('private'))),
		recurrence: v.optional(
			v.object({
				frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
				interval: v.number(),
				daysOfWeek: v.optional(v.array(v.number())),
				endDate: v.optional(v.number())
			})
		)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Build update object
		const updates: Partial<{
			title: string;
			startTime: number;
			duration: number;
			visibility: 'public' | 'circle' | 'private';
			recurrence:
				| {
						frequency: 'daily' | 'weekly' | 'monthly';
						interval: number;
						daysOfWeek?: number[];
						endDate?: number;
				  }
				| undefined;
			updatedAt: number;
		}> = {
			updatedAt: Date.now()
		};

		if (args.title !== undefined) updates.title = args.title;
		if (args.startTime !== undefined) updates.startTime = args.startTime;
		if (args.duration !== undefined) updates.duration = args.duration;
		if (args.visibility !== undefined) updates.visibility = args.visibility;
		if (args.recurrence !== undefined) updates.recurrence = args.recurrence;

		await ctx.db.patch(args.meetingId, updates);

		return { success: true };
	}
});

/**
 * Delete a meeting
 */
export const deleteMeeting = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Delete all attendees first
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		for (const attendee of attendees) {
			await ctx.db.delete(attendee._id);
		}

		// Delete meeting
		await ctx.db.delete(args.meetingId);

		return { success: true };
	}
});

/**
 * Add an attendee to a meeting (user, role, or circle)
 */
export const addAttendee = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		attendeeType: v.union(
			v.literal('user'),
			v.literal('role'),
			v.literal('circle'),
			v.literal('team')
		),
		userId: v.optional(v.id('users')),
		circleRoleId: v.optional(v.id('circleRoles')),
		circleId: v.optional(v.id('circles')),
		teamId: v.optional(v.id('teams'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Validate exactly one attendee ID is provided
		const providedIds = [args.userId, args.circleRoleId, args.circleId, args.teamId].filter(
			(id) => id !== undefined
		);
		if (providedIds.length !== 1) {
			throw new Error('Exactly one of userId, circleRoleId, circleId, or teamId must be provided');
		}

		// Check if attendee already exists
		const existingAttendee = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.filter((q) => {
				if (args.attendeeType === 'user') {
					return q.and(q.eq(q.field('attendeeType'), 'user'), q.eq(q.field('userId'), args.userId));
				} else if (args.attendeeType === 'role') {
					return q.and(
						q.eq(q.field('attendeeType'), 'role'),
						q.eq(q.field('circleRoleId'), args.circleRoleId)
					);
				} else if (args.attendeeType === 'circle') {
					return q.and(
						q.eq(q.field('attendeeType'), 'circle'),
						q.eq(q.field('circleId'), args.circleId)
					);
				} else {
					// team
					return q.and(q.eq(q.field('attendeeType'), 'team'), q.eq(q.field('teamId'), args.teamId));
				}
			})
			.first();

		if (existingAttendee) {
			throw new Error('Attendee already exists');
		}

		// Add attendee
		const attendeeId = await ctx.db.insert('meetingAttendees', {
			meetingId: args.meetingId,
			attendeeType: args.attendeeType,
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			circleId: args.circleId,
			teamId: args.teamId,
			addedAt: Date.now()
		});

		return { attendeeId };
	}
});

/**
 * Remove an attendee from a meeting
 */
export const removeAttendee = mutation({
	args: {
		sessionId: v.string(),
		attendeeId: v.id('meetingAttendees')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const attendee = await ctx.db.get(args.attendeeId);

		if (!attendee) {
			throw new Error('Attendee not found');
		}

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(attendee.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Delete attendee
		await ctx.db.delete(args.attendeeId);

		return { success: true };
	}
});

// ============================================================================
// REAL-TIME MEETING SESSION (SYOS-173)
// ============================================================================

/**
 * Start a meeting session
 * Sets startedAt timestamp and initializes currentStep
 */
export const startMeeting = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Check if already started
		if (meeting.startedAt) {
			throw new Error('Meeting already started');
		}

		// Start meeting
		await ctx.db.patch(args.meetingId, {
			startedAt: Date.now(),
			currentStep: 'check-in',
			secretaryId: meeting.secretaryId ?? meeting.createdBy, // Default to creator
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Advance to next step (secretary only)
 */
export const advanceStep = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		newStep: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Check if user is secretary
		const secretaryId = meeting.secretaryId ?? meeting.createdBy;
		if (secretaryId !== userId) {
			throw new Error('Only the meeting facilitator can advance steps');
		}

		// Validate step
		const validSteps = ['check-in', 'agenda', 'closing'];
		if (!validSteps.includes(args.newStep)) {
			throw new Error('Invalid step');
		}

		// Update step
		await ctx.db.patch(args.meetingId, {
			currentStep: args.newStep,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Close meeting (secretary only)
 */
export const closeMeeting = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Check if user is secretary
		const secretaryId = meeting.secretaryId ?? meeting.createdBy;
		if (secretaryId !== userId) {
			throw new Error('Only the meeting facilitator can close the meeting');
		}

		// Close meeting
		await ctx.db.patch(args.meetingId, {
			closedAt: Date.now(),
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Create agenda item (any participant can add)
 */
export const createAgendaItem = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		title: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Get current max order
		const existingItems = await ctx.db
			.query('meetingAgendaItems')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) : 0;

		// Create agenda item
		const itemId = await ctx.db.insert('meetingAgendaItems', {
			meetingId: args.meetingId,
			title: args.title,
			order: maxOrder + 1,
			createdBy: userId,
			createdAt: Date.now()
		});

		return { itemId };
	}
});

/**
 * Get agenda items for a meeting (real-time query)
 */
export const getAgendaItems = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Get agenda items
		const items = await ctx.db
			.query('meetingAgendaItems')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Get creator names
		const itemsWithCreators = await Promise.all(
			items.map(async (item) => {
				const creator = await ctx.db.get(item.createdBy);
				return {
					...item,
					creatorName: creator?.name ?? creator?.email ?? 'Unknown'
				};
			})
		);

		// Sort by order
		return itemsWithCreators.sort((a, b) => a.order - b.order);
	}
});

/**
 * Update secretary/facilitator for a meeting
 * Requires confirmation from current secretary unless meeting not started or secretary absent
 */
/**
 * Request secretary change - creates a request for current secretary to approve (SYOS-222)
 */
export const requestSecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		requestedForId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Check if requested user is an attendee
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		const isAttendee = attendees.some(
			(a) => a.attendeeType === 'user' && a.userId === args.requestedForId
		);

		if (!isAttendee) {
			throw new Error('Requested secretary must be a meeting attendee');
		}

		// Check if there's already a pending request
		const existingRequest = await ctx.db
			.query('secretaryChangeRequests')
			.withIndex('by_meeting_status', (q) =>
				q.eq('meetingId', args.meetingId).eq('status', 'pending')
			)
			.first();

		if (existingRequest) {
			throw new Error('There is already a pending secretary change request');
		}

		// Create request
		const requestId = await ctx.db.insert('secretaryChangeRequests', {
			meetingId: args.meetingId,
			requestedBy: userId,
			requestedFor: args.requestedForId,
			status: 'pending',
			createdAt: Date.now()
		});

		return { requestId };
	}
});

/**
 * Approve secretary change request (SYOS-222)
 */
export const approveSecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		requestId: v.id('secretaryChangeRequests')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const request = await ctx.db.get(args.requestId);
		if (!request) {
			throw new Error('Request not found');
		}

		if (request.status !== 'pending') {
			throw new Error('Request already resolved');
		}

		const meeting = await ctx.db.get(request.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Only current secretary can approve
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		if (userId !== currentSecretaryId) {
			throw new Error('Only the current secretary can approve this request');
		}

		// Update request status
		await ctx.db.patch(args.requestId, {
			status: 'approved',
			resolvedAt: Date.now(),
			resolvedBy: userId
		});

		// Update meeting secretary
		await ctx.db.patch(request.meetingId, {
			secretaryId: request.requestedFor,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Deny secretary change request (SYOS-222)
 */
export const denySecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		requestId: v.id('secretaryChangeRequests')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const request = await ctx.db.get(args.requestId);
		if (!request) {
			throw new Error('Request not found');
		}

		if (request.status !== 'pending') {
			throw new Error('Request already resolved');
		}

		const meeting = await ctx.db.get(request.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Only current secretary can deny
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		if (userId !== currentSecretaryId) {
			throw new Error('Only the current secretary can deny this request');
		}

		// Update request status
		await ctx.db.patch(args.requestId, {
			status: 'denied',
			resolvedAt: Date.now(),
			resolvedBy: userId
		});

		return { success: true };
	}
});

/**
 * Watch for pending secretary change requests (real-time) (SYOS-222)
 */
export const watchSecretaryRequests = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Only return requests if user is current secretary
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		if (userId !== currentSecretaryId) {
			return [];
		}

		// Get pending requests
		const requests = await ctx.db
			.query('secretaryChangeRequests')
			.withIndex('by_meeting_status', (q) =>
				q.eq('meetingId', args.meetingId).eq('status', 'pending')
			)
			.collect();

		// Resolve user names
		const requestsWithNames = await Promise.all(
			requests.map(async (request) => {
				const requestedBy = await ctx.db.get(request.requestedBy);
				const requestedFor = await ctx.db.get(request.requestedFor);

				return {
					...request,
					requestedByName: requestedBy?.name ?? requestedBy?.email ?? 'Unknown',
					requestedForName: requestedFor?.name ?? requestedFor?.email ?? 'Unknown'
				};
			})
		);

		return requestsWithNames;
	}
});
