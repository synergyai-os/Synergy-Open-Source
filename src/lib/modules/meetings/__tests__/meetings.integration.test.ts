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
	createTestMeetingTemplate,
	getPersonIdForUser,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000; // Tomorrow
		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

	// TODO: SYOS-786 - update meetings tests for personId/circleId wiring
	it.skip('should create a circle-based meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestCircle(t, orgId, 'Engineering');
		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;
		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			circleId,
			title: 'Engineering Standup',
			startTime,
			duration: 30,
			visibility: 'public'
		});

		expect(result.meetingId).toBeDefined();

		// Verify meeting
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: result.meetingId
		});

		expect(meeting.title).toBe('Engineering Standup');
		expect(meeting.circleId).toBe(circleId);
		expect(meeting.visibility).toBe('public');
	});

	it('should list meetings in an workspace', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create multiple meetings
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Meeting 1',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;
		const endDate = Date.now() + 86400000 * 30; // 30 days

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const startTime = Date.now() + 86400000;

		const result = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		// Create a second user to add as attendee (creator is already auto-added)
		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, userId2, 'member');

		const creatorPersonId = await getPersonIdForUser(t, orgId, userId);
		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2);

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: userId2 });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Add creator as attendee (not auto-added)
		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId: creatorPersonId
		});

		// Add second user as attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId: attendeePersonId
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
		const addedAttendee = meeting.attendees.find((a) => a.personId === attendeePersonId);
		expect(addedAttendee).toBeDefined();
		expect(addedAttendee?.personId).toBe(attendeePersonId);
	});

	// TODO: SYOS-786 - update meetings tests for personId/circleId wiring
	it.skip('should add a member attendee to a circle meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestCircle(t, orgId, 'Engineering');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, attendeeId, 'member');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: attendeeId });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			circleId,
			title: 'Tech Lead Sync',
			startTime: Date.now() + 86400000,
			duration: 30,
			visibility: 'public'
		});

		// Add creator and a member attendee
		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			userId
		});
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId: attendeeSessionId,
			meetingId: meetingResult.meetingId,
			userId: attendeeId
		});

		expect(attendeeResult.attendeeId).toBeDefined();

		// Verify attendees (creator + role = 2)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees.length).toBe(2);
		// Verify the added attendee is present
		const memberAttendee = meeting.attendees.find((a) => a.userId === attendeeId);
		expect(memberAttendee).toBeDefined();
	});

	it('should add multiple attendees to a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestCircle(t, orgId, 'Engineering');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, attendeeId, 'member');
		const creatorPersonId = await getPersonIdForUser(t, orgId, userId);
		const attendeePersonId = await getPersonIdForUser(t, orgId, attendeeId);
		cleanupQueue.push({ userId: attendeeId });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'All-Hands',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Add creator and another attendee
		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId: creatorPersonId
		});
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId: attendeeSessionId,
			meetingId: meetingResult.meetingId,
			personId: attendeePersonId
		});

		expect(attendeeResult.attendeeId).toBeDefined();

		// Verify attendees (creator + circle = 2)
		const meeting = await t.query(api.modules.meetings.meetings.get, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(meeting.attendees.length).toBe(2);
		// Verify the additional attendee is present
		const attendee = meeting.attendees.find((a) => a.personId === attendeePersonId);
		expect(attendee).toBeDefined();
	});

	it('should remove an attendee from a meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		// Create a second user to add as attendee (creator is already auto-added)
		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t);
		await createTestOrganizationMember(t, orgId, userId2, 'member');

		const creatorPersonId = await getPersonIdForUser(t, orgId, userId);
		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2);

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: userId2 });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Add creator attendee
		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId: creatorPersonId
		});

		// Add second user as attendee
		const attendeeResult = await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId: attendeePersonId
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
		expect(meeting.attendees[0].personId).toBe(creatorPersonId); // Creator remains
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

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create circle meeting
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			circleId,
			title: 'Circle Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		// Create ad-hoc meeting
		await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
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

		const personId = await getPersonIdForUser(t, orgId, userId);

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create private meeting (creator is automatically added as attendee)
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Private Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId
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

		const personId = await getPersonIdForUser(t, orgId, userId);

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create public meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Public Meeting',
			startTime: Date.now() + 86400000,
			duration: 60,
			visibility: 'public'
		});

		await t.mutation(api.modules.meetings.meetings.addAttendee, {
			sessionId,
			meetingId: meetingResult.meetingId,
			personId
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
