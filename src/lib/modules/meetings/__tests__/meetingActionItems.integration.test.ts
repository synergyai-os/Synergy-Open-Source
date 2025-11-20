/**
 * Integration tests for meetingActionItems module (SYOS-219)
 *
 * Tests:
 * - CRUD operations (create, get, update, updateStatus, updateAssignee, remove)
 * - Query filters (list, listByMeeting, listByAgendaItem, listByAssignee)
 * - Polymorphic assignment (user OR role)
 * - Permission checks (sessionId validation, org membership)
 * - Type field (next-step vs project)
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

describe('meetingActionItems: create', () => {
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

	it('should create action item assigned to user', async () => {
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

		// Create action item assigned to user
		const result = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Follow up on project timeline'
		});

		expect(result.actionItemId).toBeDefined();

		// Verify action item was created
		const actionItem = await t.run(async (ctx) => {
			return await ctx.db.get(result.actionItemId);
		});

		expect(actionItem).toBeDefined();
		expect(actionItem?.description).toBe('Follow up on project timeline');
		expect(actionItem?.type).toBe('next-step');
		expect(actionItem?.assigneeType).toBe('user');
		expect(actionItem?.assigneeUserId).toBe(userId);
		expect(actionItem?.status).toBe('todo'); // Default status
	});

	it('should create action item assigned to role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create circle and role
		const circleId = await t.run(async (ctx) => {
			return await ctx.db.insert('circles', {
				organizationId: orgId,
				name: 'Product Team',
				slug: 'product-team',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		const roleId = await t.run(async (ctx) => {
			return await ctx.db.insert('circleRoles', {
				circleId,
				name: 'Product Lead',
				createdAt: Date.now()
			});
		});

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

		// Create action item assigned to role
		const result = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'project',
			assigneeType: 'role',
			assigneeRoleId: roleId,
			description: 'Review feature roadmap'
		});

		expect(result.actionItemId).toBeDefined();

		// Verify action item
		const actionItem = await t.run(async (ctx) => {
			return await ctx.db.get(result.actionItemId);
		});

		expect(actionItem?.assigneeType).toBe('role');
		expect(actionItem?.assigneeRoleId).toBe(roleId);
		expect(actionItem?.type).toBe('project');
	});

	it('should fail when assigneeUserId missing for user type', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		await expect(
			t.mutation(api.meetingActionItems.create, {
				sessionId,
				meetingId: meetingResult.meetingId,
				agendaItemId: agendaResult.itemId,
				type: 'next-step',
				assigneeType: 'user',
				description: 'Test action'
			})
		).rejects.toThrow('assigneeUserId is required');
	});

	it('should fail without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		await expect(
			t.mutation(api.meetingActionItems.create, {
				sessionId: 'invalid-session',
				meetingId: meetingResult.meetingId,
				agendaItemId: agendaResult.itemId,
				type: 'next-step',
				assigneeType: 'user',
				assigneeUserId: userId,
				description: 'Test action'
			})
		).rejects.toThrow();
	});
});

describe('meetingActionItems: queries', () => {
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

	it('should list action items by meeting', async () => {
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

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		// Create two action items
		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Action 1'
		});

		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'project',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Action 2'
		});

		// Query by meeting
		const items = await t.query(api.meetingActionItems.listByMeeting, {
			sessionId,
			meetingId: meetingResult.meetingId
		});

		expect(items.length).toBe(2);
		expect(items.map((i) => i.description)).toContain('Action 1');
		expect(items.map((i) => i.description)).toContain('Action 2');
	});

	it('should list action items by agenda item', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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
			title: 'Agenda 1'
		});

		const agenda2 = await t.mutation(api.meetings.createAgendaItem, {
			sessionId,
			meetingId: meetingResult.meetingId,
			title: 'Agenda 2'
		});

		// Create action items for different agenda items
		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda1.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Agenda 1 Action'
		});

		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agenda2.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Agenda 2 Action'
		});

		// Query by agenda item 1
		const items = await t.query(api.meetingActionItems.listByAgendaItem, {
			sessionId,
			agendaItemId: agenda1.itemId
		});

		expect(items.length).toBe(1);
		expect(items[0]?.description).toBe('Agenda 1 Action');
	});

	it('should list action items by assignee', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2 } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2, 'member');

		cleanupQueue.push({ userId, orgId }, { userId: user2 });

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

		// Create action items for different users
		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'User 1 Action'
		});

		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: user2,
			description: 'User 2 Action'
		});

		// Query by assignee (user 1)
		const items = await t.query(api.meetingActionItems.listByAssignee, {
			sessionId,
			userId
		});

		expect(items.length).toBe(1);
		expect(items[0]?.description).toBe('User 1 Action');
	});

	it('should filter by status in listByAssignee', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		// Create action items with different statuses
		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Todo action',
			status: 'todo'
		});

		await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'In-progress action',
			status: 'in-progress'
		});

		// Query only 'todo' status
		const todoItems = await t.query(api.meetingActionItems.listByAssignee, {
			sessionId,
			userId,
			status: 'todo'
		});

		expect(todoItems.length).toBe(1);
		expect(todoItems[0]?.status).toBe('todo');

		// Query only 'in-progress' status
		const inProgressItems = await t.query(api.meetingActionItems.listByAssignee, {
			sessionId,
			userId,
			status: 'in-progress'
		});

		expect(inProgressItems.length).toBe(1);
		expect(inProgressItems[0]?.status).toBe('in-progress');
	});

	it('should get single action item', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Test action'
		});

		// Get action item
		const item = await t.query(api.meetingActionItems.get, {
			sessionId,
			actionItemId: createResult.actionItemId
		});

		expect(item).toBeDefined();
		expect(item.description).toBe('Test action');
	});
});

describe('meetingActionItems: mutations', () => {
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

	it('should update action item details', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Original description'
		});

		// Update action item
		await t.mutation(api.meetingActionItems.update, {
			sessionId,
			actionItemId: createResult.actionItemId,
			description: 'Updated description',
			type: 'project'
		});

		// Verify update
		const item = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.actionItemId);
		});

		expect(item?.description).toBe('Updated description');
		expect(item?.type).toBe('project');
		expect(item?.updatedAt).toBeDefined();
	});

	it('should update action item status', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Test action'
		});

		// Update status
		await t.mutation(api.meetingActionItems.updateStatus, {
			sessionId,
			actionItemId: createResult.actionItemId,
			status: 'in-progress'
		});

		// Verify status
		const item = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.actionItemId);
		});

		expect(item?.status).toBe('in-progress');
	});

	it('should update action item assignee', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2 } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Test action'
		});

		// Update assignee to user2
		await t.mutation(api.meetingActionItems.updateAssignee, {
			sessionId,
			actionItemId: createResult.actionItemId,
			assigneeType: 'user',
			assigneeUserId: user2
		});

		// Verify assignee
		const item = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.actionItemId);
		});

		expect(item?.assigneeUserId).toBe(user2);
	});

	it('should remove action item', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Test action'
		});

		// Remove action item
		await t.mutation(api.meetingActionItems.remove, {
			sessionId,
			actionItemId: createResult.actionItemId
		});

		// Verify deletion
		const item = await t.run(async (ctx) => {
			return await ctx.db.get(createResult.actionItemId);
		});

		expect(item).toBeNull();
	});

	it('should fail to update without valid session', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

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

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: userId,
			description: 'Test action'
		});

		// Try to update with invalid session
		await expect(
			t.mutation(api.meetingActionItems.update, {
				sessionId: 'invalid-session',
				actionItemId: createResult.actionItemId,
				description: 'Updated'
			})
		).rejects.toThrow();
	});

	it('should fail to access action item from different org', async () => {
		const t = convexTest(schema, modules);

		// User 1 in Org 1
		const { sessionId: session1, userId: user1 } = await createTestSession(t);
		const org1 = await createTestOrganization(t, 'Org 1');
		await createTestOrganizationMember(t, org1, user1, 'member');

		// User 2 in Org 2
		const { sessionId: session2, userId: user2 } = await createTestSession(t);
		const org2 = await createTestOrganization(t, 'Org 2');
		await createTestOrganizationMember(t, org2, user2, 'member');

		cleanupQueue.push({ userId: user1, orgId: org1 }, { userId: user2, orgId: org2 });

		// Create action item in Org 1
		const meetingResult = await t.mutation(api.meetings.create, {
			sessionId: session1,
			organizationId: org1,
			title: 'Test Meeting',
			startTime: Date.now() + 3600000,
			duration: 60,
			visibility: 'public'
		});

		const agendaResult = await t.mutation(api.meetings.createAgendaItem, {
			sessionId: session1,
			meetingId: meetingResult.meetingId,
			title: 'Test Agenda Item'
		});

		const createResult = await t.mutation(api.meetingActionItems.create, {
			sessionId: session1,
			meetingId: meetingResult.meetingId,
			agendaItemId: agendaResult.itemId,
			type: 'next-step',
			assigneeType: 'user',
			assigneeUserId: user1,
			description: 'Test action'
		});

		// Try to access from Org 2 user
		await expect(
			t.query(api.meetingActionItems.get, {
				sessionId: session2,
				actionItemId: createResult.actionItemId
			})
		).rejects.toThrow('User is not a member of this organization');
	});
});
