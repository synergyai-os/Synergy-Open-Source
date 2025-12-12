/**
 * Meeting Presence Module - Real-time presence tracking (SYOS-227)
 *
 * Tracks who's actively present in meetings using recordHeartbeat pattern.
 * - Heartbeat every 30s keeps user "active"
 * - Active threshold: lastSeenAt within 60s
 * - Auto-expires after inactivity
 *
 * Pattern: Context7 validated (Convex Presence Component)
 */

import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import { requireWorkspacePersonFromSession } from './helpers/access';
import { getPersonEmail } from '../../core/people/rules';

const ACTIVE_THRESHOLD_MS = 60_000; // 60 seconds (Convex standard)

type PresenceDeps = {
	requireWorkspacePersonFromSession: typeof requireWorkspacePersonFromSession;
	getMeeting: (
		ctx: MutationCtx | QueryCtx,
		meetingId: Id<'meetings'>
	) => Promise<Doc<'meetings'> | null>;
};

const defaultPresenceDeps: PresenceDeps = {
	requireWorkspacePersonFromSession,
	getMeeting: (ctx, meetingId) => ctx.db.get(meetingId)
};

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
export async function handleRecordHeartbeat(
	ctx: MutationCtx,
	args: { sessionId: string; meetingId: Id<'meetings'> },
	deps: PresenceDeps = defaultPresenceDeps
): Promise<{ success: true }> {
	// Verify meeting exists
	const meeting = await deps.getMeeting(ctx, args.meetingId);
	if (!meeting) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	}

	const { personId } = await deps.requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	// Check if presence record exists
	const existing = await ctx.db
		.query('meetingPresence')
		.withIndex('by_meeting_person', (q) =>
			q.eq('meetingId', args.meetingId).eq('personId', personId)
		)
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
			personId,
			joinedAt: now,
			lastSeenAt: now
		});
	}

	return { success: true };
}

export const recordHeartbeat = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: (ctx, args) => handleRecordHeartbeat(ctx, args)
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
		// Validate session and workspace access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting not found');

		await requireWorkspacePersonFromSession(ctx, args.sessionId, meeting.workspaceId);

		const now = Date.now();
		const activeThreshold = now - ACTIVE_THRESHOLD_MS;

		// Get all presence records for this meeting with recent recordHeartbeats
		const activePresence = await ctx.db
			.query('meetingPresence')
			.withIndex('by_meeting_lastSeen', (q) =>
				q.eq('meetingId', args.meetingId).gte('lastSeenAt', activeThreshold)
			)
			.collect();

		// Resolve person details
		const activePeople = await Promise.all(
			activePresence.map(async (presence) => {
				const person = await ctx.db.get(presence.personId);
				const email = person ? await getPersonEmail(ctx, person) : null;
				return {
					personId: presence.personId,
					name: person?.displayName ?? email ?? 'Unknown',
					joinedAt: presence.joinedAt
				};
			})
		);

		return activePeople;
	}
});

/**
 * Get expected attendees - Who SHOULD be at this meeting
 *
 * Returns list of users who have joined the meeting (attendees are always users now)
 */
export const getExpectedAttendees = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		// Validate session and access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting not found');
		await requireWorkspacePersonFromSession(ctx, args.sessionId, meeting.workspaceId);

		// Get all attendees for this meeting
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Resolve person details
		const resolvedPeople = await Promise.all(
			attendees.map(async (attendee) => {
				const person = await ctx.db.get(attendee.personId);
				return {
					personId: attendee.personId,
					name: person?.displayName ?? person?.email ?? 'Unknown Person',
					joinedAt: attendee.joinedAt
				};
			})
		);

		return resolvedPeople;
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
		// Validate session and access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting not found');
		await requireWorkspacePersonFromSession(ctx, args.sessionId, meeting.workspaceId);

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

		// Resolve expected attendees (people)
		const expectedPersonIds = new Set<Id<'people'>>();
		const expectedPeopleMap = new Map<
			Id<'people'>,
			{
				personId: Id<'people'>;
				name: string;
				isExpected: true;
			}
		>();

		for (const attendee of expectedAttendees) {
			expectedPersonIds.add(attendee.personId);
			const person = await ctx.db.get(attendee.personId);
			if (person && !expectedPeopleMap.has(attendee.personId)) {
				const email = await getPersonEmail(ctx, person);
				expectedPeopleMap.set(attendee.personId, {
					personId: attendee.personId,
					name: person.displayName ?? email ?? 'Unknown Person',
					isExpected: true
				});
			}
		}

		// Get active person IDs
		const activePersonIds = new Set(activePresence.map((p) => p.personId));

		// Build combined list
		const combinedAttendance: Array<{
			personId: Id<'people'>;
			name: string;
			isExpected: boolean;
			isActive: boolean;
		}> = [];

		// Add all expected attendees (with active status)
		for (const expected of expectedPeopleMap.values()) {
			combinedAttendance.push({
				...expected,
				isActive: activePersonIds.has(expected.personId)
			});
		}

		// Add unexpected joiners (guests)
		for (const presence of activePresence) {
			if (!expectedPersonIds.has(presence.personId)) {
				const person = await ctx.db.get(presence.personId);
				const email = person ? await getPersonEmail(ctx, person) : null;
				combinedAttendance.push({
					personId: presence.personId,
					name: person?.displayName ?? email ?? 'Unknown',
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
