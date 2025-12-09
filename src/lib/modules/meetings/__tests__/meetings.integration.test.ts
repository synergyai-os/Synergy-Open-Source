/**
 * Meetings Module Integration Tests
 *
 * Tests meeting CRUD operations, recurring meetings, and polymorphic attendees
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from '$tests/convex/integration/test.setup';
import {
	createTestSession,
	createTestOrganization,
	createTestOrganizationMember,
	createTestCircle,
	cleanupTestData,
	cleanupTestOrganization
} from '$tests/convex/integration/setup';

describe('Meetings Integration Tests', () => {
	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = [];

	afterEach(async () => {
		const t = convexTest(schema, modules);
		for (const item of cleanupQueue) {
			if (item.userId) {
				await cleanupTestData(t, item.userId);
			}
			if (item.orgId) {
				await cleanupTestOrganization(t, item.orgId);
			}
		}
		cleanupQueue.length = 0;
	});

	// ========================================================================
	// CRUD Operations
	// ========================================================================

	it('should create an ad-hoc meeting (no circle)', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000; // Tomorrow
		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Product Sync',
			startTime,
			duration: 60,
			visibility: 'public'
		});

		expect(result).toBeDefined();
		expect(result.meetingId).toBeDefined();

		// Verify meeting was created
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.title).toBe('Product Sync');
		expect(meeting.startTime).toBe(startTime);
		expect(meeting.duration).toBe(60);
		expect(meeting.visibility).toBe('public');
		expect(meeting.circleId).toBeUndefined();
	});

	it('should create a circle-based meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Engineering');

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;
		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			circleId,
			title: 'Engineering Standup',
			startTime,
			duration: 30,
			visibility: 'circle'
		});

		expect(result.meetingId).toBeDefined();

		// Verify meeting
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.title).toBe('Engineering Standup');
		expect(meeting.circleId).toBe(circleId);
		expect(meeting.visibility).toBe('circle');
	});

	it('should list meetings in an workspace', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create multiple meetings
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Meeting 1',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Meeting 2',
			startTime: Date.now() + 172800000,
			duration: 30,
			visibility: 'public'
		});

		// List meetings
		const meetings = await t.query(api.modules.meetings.meetings.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(meetings).toBeDefined();
		expect(Array.isArray(meetings)).toBe(true);
		expect(meetings.length).toBe(2);
		expect(meetings.map((m) => m.title).sort()).toEqual(['Meeting 1', 'Meeting 2']);
	});

	it('should update a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Old Title',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Update meeting
		await t.mutation(api.modules.meetings.meetings.update, {
			sessionId,
			meetingId: result.meetingId,
			title: 'New Title',
			duration: 90
		});

		// Verify update
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.title).toBe('New Title');
		expect(meeting.duration).toBe(90);
	});

	it('should delete a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'To Delete',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Archive meeting
		await t.mutation(api.modules.meetings.meetings.archiveMeeting, {
			sessionId,
			meetingId: result.meetingId
		});

		// Verify archive
		const meetings = await t.query(api.modules.meetings.meetings.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(meetings.length).toBe(0);
	});

	// ========================================================================
	// Recurring Meetings
	// ========================================================================

	it('should create a daily recurring meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;
		const endDate = Date.now() + 86400000 * 30; // 30 days

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Daily Standup',
			startTime,
			duration: 15,
			visibility: 'public',
			recurrence: {
				frequency: 'daily',
				interval: 1,
				endDate
			}
		});

		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.recurrence).toBeDefined();
		expect(meeting.recurrence?.frequency).toBe('daily');
		expect(meeting.recurrence?.interval).toBe(1);
		expect(meeting.recurrence?.endDate).toBe(endDate);
	});

	it('should create a weekly recurring meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Weekly Review',
			startTime,
			duration: 60,
			visibility: 'public',
			recurrence: {
				frequency: 'weekly',
				interval: 1,
				daysOfWeek: [1, 3, 5] // Mon, Wed, Fri
			}
		});

		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.recurrence?.frequency).toBe('weekly');
		expect(meeting.recurrence?.daysOfWeek).toEqual([1, 3, 5]);
	});

	it('should create a monthly recurring meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Monthly Planning',
			startTime,
			duration: 120,
			visibility: 'public',
			recurrence: {
				frequency: 'monthly',
				interval: 1
			}
		});

		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.recurrence?.frequency).toBe('monthly');
		expect(meeting.recurrence?.interval).toBe(1);
	});

	// ========================================================================
	// Polymorphic Attendees
	// ========================================================================

	it('should add a user attendee to a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		// Create a second user to add as attendee (creator is already auto-added)
		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, userId2, 'member');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: userId2 });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'private'
		});

		// Add second user as attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			attendeeType: 'user',
			userId: userId2
		});

		expect(attendeeResult.attendeeId).toBeDefined();

		// Verify attendees (creator + added user = 2)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees).toBeDefined();
		expect(meeting.attendees.length).toBe(2);
		// Verify the added user is in attendees
		const addedAttendee = meeting.attendees.find((a) => a.userId === userId2);
		expect(addedAttendee).toBeDefined();
		expect(addedAttendee?.attendeeType).toBe('user');
		expect(addedAttendee?.userId).toBe(userId2);
	});

	it('should add a role attendee to a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Engineering');

		cleanupQueue.push({ userId, orgId });

		// Create circle role
		const roleResult = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Tech Lead',
			purpose: 'Technical leadership'
		});

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			circleId,
			title: 'Tech Lead Sync',
			startTime: Date.now() + 86400000,
			duration: 30,
			visibility: 'circle'
		});

		// Add role attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			attendeeType: 'role',
			circleRoleId: roleResult.roleId
		});

		expect(attendeeResult.attendeeId).toBeDefined();

		// Verify attendees (creator + role = 2)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees.length).toBe(2);
		// Verify the role attendee is present
		const roleAttendee = meeting.attendees.find((a) => a.attendeeType === 'role');
		expect(roleAttendee).toBeDefined();
		expect(roleAttendee?.circleRoleId).toBe(roleResult.roleId);
	});

	it('should add a circle attendee to a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Engineering');

		cleanupQueue.push({ userId, orgId });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'All-Hands',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Add circle attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			attendeeType: 'circle',
			circleId
		});

		expect(attendeeResult.attendeeId).toBeDefined();

		// Verify attendees (creator + circle = 2)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees.length).toBe(2);
		// Verify the circle attendee is present
		const circleAttendee = meeting.attendees.find((a) => a.attendeeType === 'circle');
		expect(circleAttendee).toBeDefined();
		expect(circleAttendee?.circleId).toBe(circleId);
	});

	it('should remove an attendee from a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		// Create a second user to add as attendee (creator is already auto-added)
		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, userId2, 'member');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: userId2 });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'private'
		});

		// Add second user as attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			attendeeType: 'user',
			userId: userId2
		});

		// Remove the added attendee
		await t.mutation(api.modules.meetings.meetings.removeAttendee, {
			sessionId,
			attendeeId: attendeeResult.attendeeId
		});

		// Verify removal (only creator should remain)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees.length).toBe(1);
		expect(meeting.attendees[0].userId).toBe(userId); // Creator remains
	});

	// ========================================================================
	// Privacy & Access Control
	// ========================================================================

	it('should list meetings by circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Engineering');

		cleanupQueue.push({ userId, orgId });

		// Create circle meeting
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			circleId,
			title: 'Circle Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'circle'
		});

		// Create ad-hoc meeting
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Ad-hoc Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// List circle meetings
		const circleMeetings = await t.query(api.modules.meetings.meetings.listByCircle, {
			sessionId,
			circleId
		});

		expect(circleMeetings.length).toBe(1);
		expect(circleMeetings[0].title).toBe('Circle Meeting');
	});

	it('should list meetings for current user (direct invite)', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create private meeting (creator is automatically added as attendee)
		const _meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Private Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'private'
		});

		// Creator is already added as attendee, so listForUser should return this meeting
		// List user meetings
		const userMeetings = await t.query(api.modules.meetings.meetings.listForUser, {
			sessionId,
			workspaceId: orgId
		});

		expect(userMeetings.length).toBe(1);
		expect(userMeetings[0].title).toBe('Private Meeting');
	});

	it('should list public meetings for all org members', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create public meeting
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			title: 'Public Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// List user meetings (should see public meeting)
		const userMeetings = await t.query(api.modules.meetings.meetings.listForUser, {
			sessionId,
			workspaceId: orgId
		});

		expect(userMeetings.length).toBe(1);
		expect(userMeetings[0].title).toBe('Public Meeting');
	});
});
