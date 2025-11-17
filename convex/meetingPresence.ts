/**
 * Meeting Presence Module - Real-time presence tracking (SYOS-227)
 *
 * Tracks who's actively present in meetings using heartbeat pattern.
 * - Heartbeat every 30s keeps user "active"
 * - Active threshold: lastSeenAt within 60s
 * - Auto-expires after inactivity
 *
 * Pattern: Context7 validated (Convex Presence Component)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';

const ACTIVE_THRESHOLD_MS = 60_000; // 60 seconds (Convex standard)

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Heartbeat - Update user presence in meeting
 *
 * Upsert pattern (Context7 validated):
 * - If presence exists: update lastSeenAt
 * - If new: insert with joinedAt + lastSeenAt
 *
 * Called automatically every 30s from frontend
 */
export const heartbeat = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify meeting exists
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Check if presence record exists
		const existing = await ctx.db
			.query('meetingPresence')
			.withIndex('by_meeting_user', (q) => q.eq('meetingId', args.meetingId).eq('userId', userId))
			.first();

		const now = Date.now();

		if (existing) {
			// Update existing presence
			await ctx.db.patch(existing._id, {
				lastSeenAt: now
			});
		} else {
			// Create new presence record
			await ctx.db.insert('meetingPresence', {
				meetingId: args.meetingId,
				userId,
				joinedAt: now,
				lastSeenAt: now
			});
		}

		return { success: true };
	}
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get active presence - Real-time list of who's currently in the meeting
 *
 * Active = lastSeenAt within 60s (ACTIVE_THRESHOLD_MS)
 * Returns user details for display
 */
export const getActivePresence = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		// Validate session (userId not used but needed for auth)
		const { userId: _userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify meeting exists and user has access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		const now = Date.now();
		const activeThreshold = now - ACTIVE_THRESHOLD_MS;

		// Get all presence records for this meeting with recent heartbeats
		const activePresence = await ctx.db
			.query('meetingPresence')
			.withIndex('by_meeting_lastSeen', (q) =>
				q.eq('meetingId', args.meetingId).gte('lastSeenAt', activeThreshold)
			)
			.collect();

		// Resolve user details
		const activeUsers = await Promise.all(
			activePresence.map(async (presence) => {
				const user = await ctx.db.get(presence.userId);
				return {
					userId: presence.userId,
					name: user?.name ?? user?.email ?? 'Unknown',
					joinedAt: presence.joinedAt
				};
			})
		);

		return activeUsers;
	}
});

/**
 * Get expected attendees - Who SHOULD be at this meeting
 *
 * Resolves polymorphic meetingAttendees:
 * - Direct users
 * - Role assignments → users filling that role
 * - Circle members → all members of circle
 *
 * Returns combined list with attendance status
 */
export const getExpectedAttendees = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		// Validate session (userId not used but needed for auth)
		const { userId: _userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify meeting exists
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Get all attendees for this meeting
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Resolve each attendee type to actual user IDs
		const resolvedUsers = new Map<
			Id<'users'>,
			{
				userId: Id<'users'>;
				name: string;
				attendeeType: 'user' | 'role' | 'circle';
			}
		>();

		for (const attendee of attendees) {
			if (attendee.attendeeType === 'user' && attendee.userId) {
				// Direct user invite
				const user = await ctx.db.get(attendee.userId);
				if (user) {
					resolvedUsers.set(attendee.userId, {
						userId: attendee.userId,
						name: user.name ?? user.email ?? 'Unknown',
						attendeeType: 'user'
					});
				}
			} else if (attendee.attendeeType === 'role' && attendee.circleRoleId) {
				// Role invite - find users filling this role
				const roleId = attendee.circleRoleId;
				if (!roleId) continue; // Type guard

				const roleAssignments = await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
					.collect();

				for (const assignment of roleAssignments) {
					const user = await ctx.db.get(assignment.userId);
					if (user && !resolvedUsers.has(assignment.userId)) {
						resolvedUsers.set(assignment.userId, {
							userId: assignment.userId,
							name: user.name ?? user.email ?? 'Unknown',
							attendeeType: 'role'
						});
					}
				}
			} else if (attendee.attendeeType === 'circle' && attendee.circleId) {
				// Circle invite - all circle members
				const circleId = attendee.circleId;
				if (!circleId) continue; // Type guard

				const circleMembers = await ctx.db
					.query('circleMembers')
					.withIndex('by_circle', (q) => q.eq('circleId', circleId))
					.collect();

				for (const member of circleMembers) {
					const user = await ctx.db.get(member.userId);
					if (user && !resolvedUsers.has(member.userId)) {
						resolvedUsers.set(member.userId, {
							userId: member.userId,
							name: user.name ?? user.email ?? 'Unknown',
							attendeeType: 'circle'
						});
					}
				}
			}
		}

		// Convert map to array
		return Array.from(resolvedUsers.values());
	}
});

/**
 * Get combined attendance - Expected + Active + Guests
 *
 * Combines expected attendees with active presence to show:
 * - Who's expected and present ✅
 * - Who's expected but not present ❌
 * - Who's present but not expected (guests) 👤
 */
export const getCombinedAttendance = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		// Validate session (userId not used but needed for auth)
		const { userId: _userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get expected attendees and active presence in parallel
		const [expectedAttendees, activePresence] = await Promise.all([
			ctx.db
				.query('meetingAttendees')
				.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
				.collect(),
			ctx.db
				.query('meetingPresence')
				.withIndex('by_meeting_lastSeen', (q) =>
					q.eq('meetingId', args.meetingId).gte('lastSeenAt', Date.now() - ACTIVE_THRESHOLD_MS)
				)
				.collect()
		]);

		// Resolve expected attendees (same logic as getExpectedAttendees)
		const expectedUserIds = new Set<Id<'users'>>();
		const expectedUsersMap = new Map<
			Id<'users'>,
			{
				userId: Id<'users'>;
				name: string;
				attendeeType: 'user' | 'role' | 'circle';
				isExpected: true;
			}
		>();

		for (const attendee of expectedAttendees) {
			if (attendee.attendeeType === 'user' && attendee.userId) {
				expectedUserIds.add(attendee.userId);
				const user = await ctx.db.get(attendee.userId);
				if (user) {
					expectedUsersMap.set(attendee.userId, {
						userId: attendee.userId,
						name: user.name ?? user.email ?? 'Unknown',
						attendeeType: 'user',
						isExpected: true
					});
				}
			} else if (attendee.attendeeType === 'role' && attendee.circleRoleId) {
				const roleId = attendee.circleRoleId;
				if (!roleId) continue; // Type guard

				const roleAssignments = await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
					.collect();

				for (const assignment of roleAssignments) {
					expectedUserIds.add(assignment.userId);
					const user = await ctx.db.get(assignment.userId);
					if (user && !expectedUsersMap.has(assignment.userId)) {
						expectedUsersMap.set(assignment.userId, {
							userId: assignment.userId,
							name: user.name ?? user.email ?? 'Unknown',
							attendeeType: 'role',
							isExpected: true
						});
					}
				}
			} else if (attendee.attendeeType === 'circle' && attendee.circleId) {
				const circleId = attendee.circleId;
				if (!circleId) continue; // Type guard

				const circleMembers = await ctx.db
					.query('circleMembers')
					.withIndex('by_circle', (q) => q.eq('circleId', circleId))
					.collect();

				for (const member of circleMembers) {
					expectedUserIds.add(member.userId);
					const user = await ctx.db.get(member.userId);
					if (user && !expectedUsersMap.has(member.userId)) {
						expectedUsersMap.set(member.userId, {
							userId: member.userId,
							name: user.name ?? user.email ?? 'Unknown',
							attendeeType: 'circle',
							isExpected: true
						});
					}
				}
			}
		}

		// Get active user IDs
		const activeUserIds = new Set(activePresence.map((p) => p.userId));

		// Build combined list
		const combinedAttendance: Array<{
			userId: Id<'users'>;
			name: string;
			isExpected: boolean;
			isActive: boolean;
			attendeeType?: 'user' | 'role' | 'circle';
		}> = [];

		// Add all expected attendees (with active status)
		for (const expected of expectedUsersMap.values()) {
			combinedAttendance.push({
				...expected,
				isActive: activeUserIds.has(expected.userId)
			});
		}

		// Add unexpected joiners (guests)
		for (const presence of activePresence) {
			if (!expectedUserIds.has(presence.userId)) {
				const user = await ctx.db.get(presence.userId);
				combinedAttendance.push({
					userId: presence.userId,
					name: user?.name ?? user?.email ?? 'Unknown',
					isExpected: false,
					isActive: true
				});
			}
		}

		// Sort: Expected first, then guests; within each group, sort by name
		combinedAttendance.sort((a, b) => {
			if (a.isExpected !== b.isExpected) {
				return a.isExpected ? -1 : 1; // Expected first
			}
			return a.name.localeCompare(b.name); // Then alphabetically
		});

		return combinedAttendance;
	}
});
