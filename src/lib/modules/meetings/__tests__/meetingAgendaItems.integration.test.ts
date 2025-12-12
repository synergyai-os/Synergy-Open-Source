/**
 * Integration tests for meetingAgendaItems module (SYOS-218)
 *
 * Tests:
 * - updateNotes mutation
 * - markStatus mutation
 * - Permission checks
 * - Error cases
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
	createTestMeetingTemplate,
	cleanupTestData,
	cleanupTestOrganization
} from '$tests/convex/integration/setup';
import type { Id } from '$convex/_generated/dataModel';

describe('meetingAgendaItems: updateNotes', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = [];

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

	it('should successfully update notes on agenda item', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create meeting
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		// Create agenda item
		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Update notes
		const result = await t.mutation(api.modules.meetings.agendaItems.updateNotes, {
			sessionId,
			agendaItemId: agendaResult.itemId,
			notes: '## Meeting Notes\n\nDiscussed project timeline.'
		});

		expect(result.success).toBe(true);

		// Verify notes were updated
		const updatedItem = await t.run(async (ctx) => {
			return await ctx.db.get(agendaResult.itemId);
		});

		expect(updatedItem?.notes).toBe('## Meeting Notes\n\nDiscussed project timeline.');
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda item
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Try with invalid session
		await expect(
			t.mutation(api.modules.meetings.agendaItems.updateNotes, {
				sessionId: 'invalid-session',
				agendaItemId: agendaResult.itemId,
				notes: 'Test notes'
			})
		).rejects.toThrow();
	});

	it('should fail for user not in workspace', async () => {
		const t = convexTest(schema, modules);

		// Create first user and meeting
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to update notes as non-member
		await expect(
			t.mutation(api.modules.meetings.agendaItems.updateNotes, {
				sessionId: otherSessionId,
				agendaItemId: agendaResult.itemId,
				notes: 'Test notes'
			})
		).rejects.toThrow(/WORKSPACE_MEMBERSHIP_REQUIRED/);
	});
});

describe('meetingAgendaItems: markStatus', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = [];

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

	it('should successfully mark agenda item as processed', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda item
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Mark as processed
		const result = await t.mutation(api.modules.meetings.agendaItems.markStatus, {
			sessionId,
			agendaItemId: agendaResult.itemId,
			status: 'processed'
		});

		expect(result.success).toBe(true);

		// Verify processed state
		const updatedItem = await t.run(async (ctx) => {
			return await ctx.db.get(agendaResult.itemId);
		});

		expect(updatedItem?.status).toBe('processed');
	});

	it('should successfully mark agenda item as rejected', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda item
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Mark as rejected
		const result = await t.mutation(api.modules.meetings.agendaItems.markStatus, {
			sessionId,
			agendaItemId: agendaResult.itemId,
			status: 'rejected'
		});

		expect(result.success).toBe(true);

		// Verify rejected state
		const updatedItem = await t.run(async (ctx) => {
			return await ctx.db.get(agendaResult.itemId);
		});

		expect(updatedItem?.status).toBe('rejected');
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda item
		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Try with invalid session
		await expect(
			t.mutation(api.modules.meetings.agendaItems.markStatus, {
				sessionId: 'invalid-session',
				agendaItemId: agendaResult.itemId,
				status: 'processed'
			})
		).rejects.toThrow();
	});

	it('should fail for user not in workspace', async () => {
		const t = convexTest(schema, modules);

		// Create first user and meeting
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const templateId = await createTestMeetingTemplate(t, orgId, userId);

		const meetingResult = await t.mutation(api.modules.meetings.meetings.create, {
			sessionId,
			workspaceId: orgId,
			templateId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.modules.meetings.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to mark processed as non-member
		await expect(
			t.mutation(api.modules.meetings.agendaItems.markStatus, {
				sessionId: otherSessionId,
				agendaItemId: agendaResult.itemId,
				status: 'processed'
			})
		).rejects.toThrow(/WORKSPACE_MEMBERSHIP_REQUIRED/);
	});
});
