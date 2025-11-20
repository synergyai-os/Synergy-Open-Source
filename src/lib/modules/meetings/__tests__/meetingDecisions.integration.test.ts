/**
 * Integration tests for meetingDecisions module (SYOS-220)
 *
 * Tests:
 * - create mutation
 * - update mutation
 * - remove mutation
 * - list query (with filters)
 * - listByMeeting query
 * - listByAgendaItem query
 * - get query
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
	cleanupTestData,
	cleanupTestOrganization
} from '$tests/convex/integration/setup';
import type { Id } from '$convex/_generated/dataModel';

describe('meetingDecisions: create', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'organizations'> }> = [];

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

	it('should successfully create a decision', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		// Create agenda item
		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create decision
		const result = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Approved Budget Increase',
			description: '## Decision\n\nApproved 15% increase in Q1 marketing budget.'
		});

		expect(result.decisionId).toBeDefined();

		// Verify decision was created
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(result.decisionId);
		});

		expect(decision).toBeDefined();
		expect(decision?.title).toBe('Approved Budget Increase');
		expect(decision?.description).toBe(
			'## Decision\n\nApproved 15% increase in Q1 marketing budget.'
		);
		expect(decision?.meetingId).toBe(meetingResult.meetingId);
		expect(decision?.agendaItemId).toBe(agendaResult.itemId);
		expect(decision?.createdBy).toBe(userId);
		expect(decision?.decidedAt).toBeDefined();
	});

	it('should create decision with optional circleId', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create circle
		const circleId = await t.run(async (ctx) => {
			return await ctx.db.insert('circles', {
				organizationId: orgId,
				name: 'Product Circle',
				slug: 'product-circle',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Create meeting
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public',
			circleId
		});

		// Create agenda item
		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create decision with circleId
		const result = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Feature Approval',
			description: 'Approved new feature for Q2.',
			circleId
		});

		expect(result.decisionId).toBeDefined();

		// Verify circleId was stored
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(result.decisionId);
		});

		expect(decision?.circleId).toBe(circleId);
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda item
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Try with invalid session
		await expect(
			t.mutation(api.meetingDecisions.create, {
				sessionId: 'invalid-session',
				meetingId: meetingResult.meetingId,
				agendaItemId: agendaResult.itemId,
				title: 'Test Decision',
				description: 'Test description'
			})
		).rejects.toThrow();
	});

	it('should fail for user not in organization', async () => {
		const t = convexTest(schema, modules);

		// Create first user and meeting
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to create decision as non-member
		await expect(
			t.mutation(api.meetingDecisions.create, {
				sessionId: otherSessionId,
				meetingId: meetingResult.meetingId,
				agendaItemId: agendaResult.itemId,
				title: 'Test Decision',
				description: 'Test description'
			})
		).rejects.toThrow('User is not a member of this organization');
	});

	it('should fail if agenda item does not belong to meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create two meetings
		const meeting1Result = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Meeting 1',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const meeting2Result = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Meeting 2',
			startTime: Date.now() + 7200000,
			duration: 60,
			visibility: 'public'
		});

		// Create agenda item for meeting 1
		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meeting1Result.meetingId,
			title: 'Test Agenda Item'
		});

		// Try to create decision for meeting 2 with agenda item from meeting 1
		await expect(
			t.mutation(api.meetingDecisions.create, {
				sessionId,
				meetingId: meeting2Result.meetingId,
				agendaItemId: agendaResult.itemId,
				title: 'Test Decision',
				description: 'Test description'
			})
		).rejects.toThrow('Agenda item does not belong to this meeting');
	});
});

describe('meetingDecisions: update', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'organizations'> }> = [];

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

	it('should successfully update decision title', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting, agenda item, and decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Original Title',
			description: 'Original description'
		});

		// Update title
		const updateResult = await t.mutation(api.meetingDecisions.update, {
			sessionId,
			decisionId: createResult.decisionId,
			title: 'Updated Title'
		});

		expect(updateResult.success).toBe(true);

		// Verify update
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.decisionId);
		});

		expect(decision?.title).toBe('Updated Title');
		expect(decision?.description).toBe('Original description'); // Unchanged
		expect(decision?.updatedAt).toBeDefined();
	});

	it('should successfully update decision description', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting, agenda item, and decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Original Title',
			description: 'Original description'
		});

		// Update description
		const updateResult = await t.mutation(api.meetingDecisions.update, {
			sessionId,
			decisionId: createResult.decisionId,
			description: '## Updated\n\nNew markdown content.'
		});

		expect(updateResult.success).toBe(true);

		// Verify update
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.decisionId);
		});

		expect(decision?.title).toBe('Original Title'); // Unchanged
		expect(decision?.description).toBe('## Updated\n\nNew markdown content.');
		expect(decision?.updatedAt).toBeDefined();
	});

	it('should successfully update both title and description', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting, agenda item, and decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Original Title',
			description: 'Original description'
		});

		// Update both
		const updateResult = await t.mutation(api.meetingDecisions.update, {
			sessionId,
			decisionId: createResult.decisionId,
			title: 'Updated Title',
			description: 'Updated description'
		});

		expect(updateResult.success).toBe(true);

		// Verify update
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.decisionId);
		});

		expect(decision?.title).toBe('Updated Title');
		expect(decision?.description).toBe('Updated description');
		expect(decision?.updatedAt).toBeDefined();
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Original Title',
			description: 'Original description'
		});

		// Try with invalid session
		await expect(
			t.mutation(api.meetingDecisions.update, {
				sessionId: 'invalid-session',
				decisionId: createResult.decisionId,
				title: 'Updated Title'
			})
		).rejects.toThrow();
	});

	it('should fail for user not in organization', async () => {
		const t = convexTest(schema, modules);

		// Create first user and decision
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Original Title',
			description: 'Original description'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to update as non-member
		await expect(
			t.mutation(api.meetingDecisions.update, {
				sessionId: otherSessionId,
				decisionId: createResult.decisionId,
				title: 'Updated Title'
			})
		).rejects.toThrow('User is not a member of this organization');
	});
});

describe('meetingDecisions: remove', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'organizations'> }> = [];

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

	it('should successfully remove a decision', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting, agenda item, and decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Test Decision',
			description: 'Test description'
		});

		// Remove decision
		const removeResult = await t.mutation(api.meetingDecisions.remove, {
			sessionId,
			decisionId: createResult.decisionId
		});

		expect(removeResult.success).toBe(true);

		// Verify decision was removed
		const decision = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.decisionId);
		});

		expect(decision).toBeNull();
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Test Decision',
			description: 'Test description'
		});

		// Try with invalid session
		await expect(
			t.mutation(api.meetingDecisions.remove, {
				sessionId: 'invalid-session',
				decisionId: createResult.decisionId
			})
		).rejects.toThrow();
	});

	it('should fail for user not in organization', async () => {
		const t = convexTest(schema, modules);

		// Create first user and decision
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Test Decision',
			description: 'Test description'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to remove as non-member
		await expect(
			t.mutation(api.meetingDecisions.remove, {
				sessionId: otherSessionId,
				decisionId: createResult.decisionId
			})
		).rejects.toThrow('User is not a member of this organization');
	});
});

describe('meetingDecisions: queries', () => {
	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'organizations'> }> = [];

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

	it('should list all decisions by meeting', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda items
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agenda1 = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Agenda Item 1'
		});

		const agenda2 = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Agenda Item 2'
		});

		// Create multiple decisions
		await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda1.itemId,
			title: 'Decision 1',
			description: 'Description 1'
		});

		await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda2.itemId,
			title: 'Decision 2',
			description: 'Description 2'
		});

		// Query decisions by meeting
		const decisions = await t.query(api.meetingDecisions.listByMeeting, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(decisions).toHaveLength(2);
		expect(decisions.map((d) => d.title)).toContain('Decision 1');
		expect(decisions.map((d) => d.title)).toContain('Decision 2');
	});

	it('should list decisions by agenda item', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create meeting and agenda items
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agenda1 = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Agenda Item 1'
		});

		const agenda2 = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Agenda Item 2'
		});

		// Create decisions for different agenda items
		await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda1.itemId,
			title: 'Decision 1A',
			description: 'Description 1A'
		});

		await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda1.itemId,
			title: 'Decision 1B',
			description: 'Description 1B'
		});

		await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda2.itemId,
			title: 'Decision 2',
			description: 'Description 2'
		});

		// Query decisions for agenda item 1
		const decisions = await t.query(api.meetingDecisions.listByAgendaItem, {
			sessionId,
			agendaItemId: agenda1.itemId
		});

		expect(decisions).toHaveLength(2);
		expect(decisions.map((d) => d.title)).toContain('Decision 1A');
		expect(decisions.map((d) => d.title)).toContain('Decision 1B');
		expect(decisions.map((d) => d.title)).not.toContain('Decision 2');
	});

	it('should get a single decision by ID', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingDecisions.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			title: 'Test Decision',
			description: '## Test\n\nMarkdown content.'
		});

		// Get decision
		const decision = await t.query(api.meetingDecisions.get, {
			sessionId,
			decisionId: createResult.decisionId
		});

		expect(decision).toBeDefined();
		expect(decision.title).toBe('Test Decision');
		expect(decision.description).toBe('## Test\n\nMarkdown content.');
		expect(decision.meetingId).toBe(meetingResult.meetingId);
		expect(decision.agendaItemId).toBe(agendaResult.itemId);
	});

	it('should fail to query without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create decision
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		// Try with invalid session
		await expect(
			t.query(api.meetingDecisions.listByMeeting, {
				sessionId: 'invalid-session',
				meetingId: meetingResult.meetingId
			})
		).rejects.toThrow();
	});

	it('should fail to query for user not in organization', async () => {
		const t = convexTest(schema, modules);

		// Create first user and decision
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId,
			organizationId: orgId,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		// Create second user (not in org)
		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t);

		cleanupQueue.push({ userId, orgId }, { userId: otherUserId });

		// Try to query as non-member
		await expect(
			t.query(api.meetingDecisions.listByMeeting, {
				sessionId: otherSessionId,
				meetingId: meetingResult.meetingId
			})
		).rejects.toThrow('User is not a member of this organization');
	});
});
