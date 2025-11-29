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
 * Helper: Verify user has access to workspace
 */
async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('User is not a member of this workspace');
	}
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all meetings for an workspace
 */
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get all meetings (excluding soft-deleted)
		const meetings = await ctx.db
			.query('meetings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect()
			.then((meetings) => meetings.filter((m) => !m.deletedAt));

		if (meetings.length === 0) {
			return [];
		}

		const meetingIds = meetings.map((m) => m._id);

		// Batch fetch all attendees for all meetings at once
		const allAttendees = await ctx.db.query('meetingAttendees').collect();

		// Group attendees by meeting ID and count
		const attendeesByMeeting = new Map<Id<'meetings'>, number>();
		for (const attendee of allAttendees) {
			if (meetingIds.includes(attendee.meetingId)) {
				attendeesByMeeting.set(
					attendee.meetingId,
					(attendeesByMeeting.get(attendee.meetingId) ?? 0) + 1
				);
			}
		}

		// Map over meetings with pre-computed counts
		const results = meetings.map((meeting) => ({
			...meeting,
			attendeeCount: attendeesByMeeting.get(meeting._id) ?? 0
		}));

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

		// Check if soft-deleted
		if (meeting.deletedAt) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to the workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get attendees
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', meeting._id))
			.collect();

		// Resolve attendee user details
		const resolvedAttendees = await Promise.all(
			attendees.map(async (attendee) => {
				const user = await ctx.db.get(attendee.userId);
				return {
					...attendee,
					userName: user?.name ?? user?.email ?? 'Unknown User'
				};
			})
		);

		return {
			...meeting,
			attendees: resolvedAttendees
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

		// Get circle to verify workspace access
		const circle = await ctx.db.get(args.circleId);

		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		// Get meetings for this circle (excluding soft-deleted)
		const meetings = await ctx.db
			.query('meetings')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect()
			.then((meetings) => meetings.filter((m) => !m.deletedAt));

		return meetings;
	}
});

/**
 * List meetings by template for analytics and reporting
 */
export const listByTemplate = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		templateId: v.id('meetingTemplates'),
		startDate: v.optional(v.number()), // Optional date range start (Unix timestamp)
		endDate: v.optional(v.number()) // Optional date range end (Unix timestamp)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Use range query on by_start_time index if date range is provided
		let meetings;
		if (args.startDate || args.endDate) {
			// Use by_start_time index with range queries for efficient date filtering
			meetings = await ctx.db
				.query('meetings')
				.withIndex('by_start_time', (q) => {
					let query = q.eq('workspaceId', args.workspaceId);
					if (args.startDate) {
						query = query.gte('startTime', args.startDate);
					}
					if (args.endDate) {
						query = query.lte('startTime', args.endDate);
					}
					return query;
				})
				.collect();

			// Filter by template and exclude soft-deleted
			meetings = meetings.filter((m) => m.templateId === args.templateId && !m.deletedAt);
		} else {
			// No date range - use template index
			meetings = await ctx.db
				.query('meetings')
				.withIndex('by_template', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('templateId', args.templateId)
				)
				.collect()
				.then((meetings) => meetings.filter((m) => !m.deletedAt));
		}

		return meetings;
	}
});

/**
 * Helper: Get invited users for a meeting (batched for efficiency)
 * Used internally by listForUser for batch processing
 */
async function getInvitedUsersForMeeting(
	ctx: QueryCtx,
	meetingId: Id<'meetings'>,
	circleId: Id<'circles'> | undefined,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>
): Promise<Array<{ userId: string; name: string }>> {
	const invitedUserIds = new Set<string>();
	const invitations = invitationsByMeeting.get(meetingId) ?? [];

	// Add directly invited users
	for (const invitation of invitations) {
		if (invitation.invitationType === 'user' && invitation.userId) {
			invitedUserIds.add(invitation.userId);
		}
	}

	// Add circle members from circle invitations
	for (const invitation of invitations) {
		if (invitation.invitationType === 'circle' && invitation.circleId) {
			const members = circleMembersByCircle.get(invitation.circleId) ?? [];
			for (const member of members) {
				invitedUserIds.add(member.userId);
			}
		}
	}

	// Also include circle members if meeting is linked to a circle
	if (circleId) {
		const members = circleMembersByCircle.get(circleId) ?? [];
		for (const member of members) {
			invitedUserIds.add(member.userId);
		}
	}

	// Resolve user details (limit to 10 for display)
	const userIdsArray = Array.from(invitedUserIds).slice(0, 10);
	const users = await Promise.all(
		userIdsArray.map(async (userId) => {
			const user = await ctx.db.get(userId as Id<'users'>);
			return {
				userId,
				name: user?.name ?? user?.email ?? 'Unknown User'
			};
		})
	);

	return users;
}

/**
 * Get invited users for a specific meeting
 * Efficient single-meeting query for getting invited users
 */
export const getInvitedUsers = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Check if soft-deleted
		if (meeting.deletedAt) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to the workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get all invitations for this meeting
		const invitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Collect all unique circle IDs we need members for
		const circleIds = new Set<Id<'circles'>>();
		if (meeting.circleId) {
			circleIds.add(meeting.circleId);
		}
		for (const invitation of invitations) {
			if (invitation.invitationType === 'circle' && invitation.circleId) {
				circleIds.add(invitation.circleId);
			}
		}

		// Get circle members for all relevant circles (query each circle individually for efficiency)
		const circleMembersByCircle = new Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>();
		if (circleIds.size > 0) {
			await Promise.all(
				Array.from(circleIds).map(async (circleId) => {
					const members = await ctx.db
						.query('circleMembers')
						.withIndex('by_circle', (q) => q.eq('circleId', circleId))
						.collect();
					circleMembersByCircle.set(
						circleId,
						members.map((m) => ({ userId: m.userId }))
					);
				})
			);
		}

		// Build invitations map (single meeting)
		const invitationsByMeeting = new Map<
			Id<'meetings'>,
			Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
		>();
		invitationsByMeeting.set(
			args.meetingId,
			invitations.map((inv) => ({
				invitationType: inv.invitationType,
				userId: inv.userId,
				circleId: inv.circleId
			}))
		);

		// Get invited users using helper function
		const invitedUsers = await getInvitedUsersForMeeting(
			ctx,
			args.meetingId,
			meeting.circleId,
			invitationsByMeeting,
			circleMembersByCircle
		);

		return invitedUsers;
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
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get all meetings in workspace (excluding soft-deleted)
		const allMeetings = await ctx.db
			.query('meetings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect()
			.then((meetings) => meetings.filter((m) => !m.deletedAt));

		if (allMeetings.length === 0) {
			return [];
		}

		const meetingIds = allMeetings.map((m) => m._id);

		// Batch: Get all invitations for all meetings at once
		// Note: meetingInvitations doesn't have workspaceId, so we fetch all and filter
		// This is efficient for most cases since Convex queries are fast and filtering is in-memory
		const allInvitations = await ctx.db.query('meetingInvitations').collect();

		// Group invitations by meeting ID (filter to only our meetings)
		const invitationsByMeeting = new Map<
			Id<'meetings'>,
			Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
		>();
		for (const invitation of allInvitations) {
			if (!meetingIds.includes(invitation.meetingId)) continue;
			const existing = invitationsByMeeting.get(invitation.meetingId) ?? [];
			existing.push({
				invitationType: invitation.invitationType,
				userId: invitation.userId,
				circleId: invitation.circleId
			});
			invitationsByMeeting.set(invitation.meetingId, existing);
		}

		// Collect all unique circle IDs we need members for
		const circleIds = new Set<Id<'circles'>>();
		for (const meeting of allMeetings) {
			if (meeting.circleId) {
				circleIds.add(meeting.circleId);
			}
		}
		for (const invitations of invitationsByMeeting.values()) {
			for (const invitation of invitations) {
				if (invitation.invitationType === 'circle' && invitation.circleId) {
					circleIds.add(invitation.circleId);
				}
			}
		}

		// Batch: Get circle members only for relevant circles using index queries
		const circleMembersByCircle = new Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>();
		if (circleIds.size > 0) {
			await Promise.all(
				Array.from(circleIds).map(async (circleId) => {
					const members = await ctx.db
						.query('circleMembers')
						.withIndex('by_circle', (q) => q.eq('circleId', circleId))
						.collect();
					circleMembersByCircle.set(
						circleId,
						members.map((m) => ({ userId: m.userId }))
					);
				})
			);
		}

		// Get user's direct meeting invitations (for access check)
		const userInvitations = allInvitations.filter((inv) => inv.userId === userId);
		const directInvitationMeetingIds = new Set(userInvitations.map((inv) => inv.meetingId));

		// Get user's circle memberships (for access check)
		const userCircleMemberships = await ctx.db
			.query('circleMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		const userCircleIds = new Set(userCircleMemberships.map((membership) => membership.circleId));

		// Filter meetings user can access and resolve invited users
		const userMeetings = await Promise.all(
			allMeetings.map(async (meeting) => {
				const invitations = invitationsByMeeting.get(meeting._id) ?? [];

				// Check access permissions
				let hasAccess = false;

				// Creator always sees their own meetings
				if (meeting.createdBy === userId) {
					hasAccess = true;
				}
				// Check if user is directly invited
				else if (directInvitationMeetingIds.has(meeting._id)) {
					hasAccess = true;
				}
				// Check circle invitations - see if user is member of any invited circle
				else {
					for (const invitation of invitations) {
						if (invitation.invitationType === 'circle' && invitation.circleId) {
							if (userCircleIds.has(invitation.circleId)) {
								hasAccess = true;
								break;
							}
						}
					}
				}

				// Also check if meeting is linked to a circle and user is member
				if (!hasAccess && meeting.circleId && userCircleIds.has(meeting.circleId)) {
					hasAccess = true;
				}

				// Check visibility rules
				if (!hasAccess && meeting.visibility === 'public') {
					hasAccess = true; // All workspace members can see public meetings
				}

				if (!hasAccess) {
					return null; // User can't access this meeting
				}

				// Get invited users for this meeting
				const invitedUsers = await getInvitedUsersForMeeting(
					ctx,
					meeting._id,
					meeting.circleId,
					invitationsByMeeting,
					circleMembersByCircle
				);

				return {
					...meeting,
					invitedUsers
				};
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
		workspaceId: v.id('workspaces'),
		circleId: v.optional(v.id('circles')),
		templateId: v.id('meetingTemplates'), // Required: template defines meeting type/structure
		title: v.string(),
		startTime: v.number(),
		duration: v.number(),
		visibility: v.union(v.literal('public'), v.literal('private')),
		recurrence: v.optional(
			v.object({
				frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
				interval: v.number(),
				daysOfWeek: v.optional(v.array(v.number())),
				endDate: v.optional(v.number())
			})
		),
		invitations: v.optional(
			v.array(
				v.object({
					invitationType: v.union(v.literal('user'), v.literal('circle')),
					userId: v.optional(v.id('users')),
					circleId: v.optional(v.id('circles'))
				})
			)
		)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// If circleId provided, verify it exists and belongs to org
		if (args.circleId) {
			const circle = await ctx.db.get(args.circleId);
			if (!circle) {
				throw new Error('Circle not found');
			}
			if (circle.workspaceId !== args.workspaceId) {
				throw new Error('Circle does not belong to this workspace');
			}
		}

		// Verify template exists and belongs to workspace
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw new Error('Template not found');
		}
		if (template.workspaceId !== args.workspaceId) {
			throw new Error('Template does not belong to this workspace');
		}

		// Create meeting
		const meetingId = await ctx.db.insert('meetings', {
			workspaceId: args.workspaceId,
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

		// Create invitations if provided
		if (args.invitations && args.invitations.length > 0) {
			for (const invitation of args.invitations) {
				// Validate invitation
				if (invitation.invitationType === 'user' && !invitation.userId) {
					throw new Error('userId is required when invitationType is "user"');
				}
				if (invitation.invitationType === 'circle' && !invitation.circleId) {
					throw new Error('circleId is required when invitationType is "circle"');
				}

				// Verify invited user/circle belongs to workspace
				if (invitation.invitationType === 'user' && invitation.userId) {
					await ensureWorkspaceMembership(ctx, args.workspaceId, invitation.userId);
				} else if (invitation.invitationType === 'circle' && invitation.circleId) {
					const circle = await ctx.db.get(invitation.circleId);
					if (!circle) {
						throw new Error('Circle not found');
					}
					if (circle.workspaceId !== args.workspaceId) {
						throw new Error('Circle does not belong to this workspace');
					}
				}

				// Create invitation
				await ctx.db.insert('meetingInvitations', {
					meetingId,
					invitationType: invitation.invitationType,
					userId: invitation.userId,
					circleId: invitation.circleId,
					createdAt: Date.now(),
					createdBy: userId
				});

				// TODO: Create inbox items for invited users
				// - If user: create inbox item for that user
				// - If circle: create inbox items for all circle members
				// This will be implemented when inbox item type for meetings is added
			}
		}

		// If meeting is linked to a circle, users in that circle are automatically invited
		// (handled dynamically in access control, no need to create invitation records)

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
		visibility: v.optional(v.union(v.literal('public'), v.literal('private'))),
		templateId: v.optional(v.id('meetingTemplates')),
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Build update object
		const updates: Partial<{
			title: string;
			startTime: number;
			duration: number;
			visibility: 'public' | 'private';
			templateId: Id<'meetingTemplates'>;
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
		if (args.templateId !== undefined) {
			// Verify template exists and belongs to workspace
			const template = await ctx.db.get(args.templateId);
			if (!template) {
				throw new Error('Template not found');
			}
			if (template.workspaceId !== meeting.workspaceId) {
				throw new Error('Template does not belong to this workspace');
			}
			updates.templateId = args.templateId;
		}
		if (args.recurrence !== undefined) updates.recurrence = args.recurrence;

		await ctx.db.patch(args.meetingId, updates);

		return { success: true };
	}
});

/**
 * Soft delete a meeting
 * Sets deletedAt timestamp and soft-deletes linked agenda items
 * Tasks and projects remain (not deleted)
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Check if already deleted
		if (meeting.deletedAt) {
			throw new Error('Meeting already deleted');
		}

		const now = Date.now();

		// Soft delete linked agenda items
		const agendaItems = await ctx.db
			.query('meetingAgendaItems')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Note: Agenda items don't have deletedAt field, so we'll leave them
		// They'll be filtered out when querying by meeting (which will be soft-deleted)
		// If we need to soft delete agenda items, we'd need to add deletedAt to schema

		// Soft delete meeting
		await ctx.db.patch(args.meetingId, {
			deletedAt: now,
			updatedAt: now
		});

		return { success: true };
	}
});

/**
 * Add an attendee to a meeting (user joins the meeting)
 */
export const addAttendee = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		userId: v.id('users') // User joining the meeting
	},
	handler: async (ctx, args) => {
		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify current user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, currentUserId);

		// Verify the user being added belongs to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId);

		// Check if user is already an attendee
		const existingAttendee = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting_user', (q) =>
				q.eq('meetingId', args.meetingId).eq('userId', args.userId)
			)
			.first();

		if (existingAttendee) {
			throw new Error('User is already an attendee');
		}

		// Verify user can join (must be invited for private meetings)
		if (meeting.visibility === 'private') {
			// Check invitations directly (can't call queries from mutations)
			const invitations = await ctx.db
				.query('meetingInvitations')
				.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
				.collect();

			// Check direct invitation
			const directInvitation = invitations.find(
				(inv) => inv.invitationType === 'user' && inv.userId === args.userId
			);

			// Check circle invitations
			const userCircleMemberships = await ctx.db
				.query('circleMembers')
				.withIndex('by_user', (q) => q.eq('userId', args.userId))
				.collect();
			const userCircleIds = new Set(userCircleMemberships.map((m) => m.circleId));

			const circleInvitation = invitations.find(
				(inv) => inv.invitationType === 'circle' && inv.circleId && userCircleIds.has(inv.circleId)
			);

			// Check if meeting is linked to a circle user is member of
			const circleLinked = meeting.circleId && userCircleIds.has(meeting.circleId);

			if (!directInvitation && !circleInvitation && !circleLinked) {
				throw new Error('User is not invited to this private meeting');
			}
		}

		// Add attendee
		const attendeeId = await ctx.db.insert('meetingAttendees', {
			meetingId: args.meetingId,
			userId: args.userId,
			joinedAt: Date.now()
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

		// Get meeting to verify workspace access
		const meeting = await ctx.db.get(attendee.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Check if already started
		if (meeting.startedAt) {
			throw new Error('Meeting already started');
		}

		// Start meeting - set recorder to person who starts it
		await ctx.db.patch(args.meetingId, {
			startedAt: Date.now(),
			currentStep: 'check-in',
			recorderId: userId,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Advance to next step (recorder only)
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Verify user is recorder
		if (meeting.recorderId !== userId) {
			throw new Error('Only the recorder can advance steps');
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
 * Close meeting (recorder only)
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Verify user is recorder
		if (meeting.recorderId !== userId) {
			throw new Error('Only the recorder can close the meeting');
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
 * Set recorder for a meeting
 * Any attendee can change the recorder to themselves or another user (trust-based, no confirmation)
 */
export const setRecorder = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		recorderId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Verify meeting is started
		if (!meeting.startedAt) {
			throw new Error('Meeting must be started before setting recorder');
		}

		// Verify recorder is an attendee
		const recorderAttendee = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting_user', (q) =>
				q.eq('meetingId', args.meetingId).eq('userId', args.recorderId)
			)
			.first();

		if (!recorderAttendee) {
			throw new Error('Recorder must be an attendee of the meeting');
		}

		// Update recorder
		await ctx.db.patch(args.meetingId, {
			recorderId: args.recorderId,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Set active agenda item (recorder only)
 * Controls synchronized screen view - all participants see the same active item
 */
export const setActiveAgendaItem = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		agendaItemId: v.optional(v.id('meetingAgendaItems'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Verify user is recorder
		if (meeting.recorderId !== userId) {
			throw new Error('Only the recorder can set the active agenda item');
		}

		// Verify meeting is started
		if (!meeting.startedAt) {
			throw new Error('Meeting must be started before setting active agenda item');
		}

		// If agendaItemId provided, verify it belongs to this meeting
		if (args.agendaItemId) {
			const agendaItem = await ctx.db.get(args.agendaItemId);
			if (!agendaItem || agendaItem.meetingId !== args.meetingId) {
				throw new Error('Agenda item not found or does not belong to this meeting');
			}
		}

		// Update active agenda item (can be null to clear)
		await ctx.db.patch(args.meetingId, {
			activeAgendaItemId: args.agendaItemId,
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get current max order
		const existingItems = await ctx.db
			.query('meetingAgendaItems')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) : 0;

		// Create agenda item with default status 'todo'
		const itemId = await ctx.db.insert('meetingAgendaItems', {
			meetingId: args.meetingId,
			title: args.title,
			order: maxOrder + 1,
			status: 'todo',
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

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
