/**
 * Circles Module Integration Tests
 *
 * Tests the Circles CRUD operations and nested circle relationships
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
	createTestCircleMember,
	cleanupTestData,
	cleanupTestOrganization
} from '$tests/convex/integration/setup';

describe('Circles Integration Tests', () => {
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

	it('should list circles in an workspace', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		// Create test circles
		await createTestCircle(t, orgId, 'Circle 1');
		await createTestCircle(t, orgId, 'Circle 2');

		cleanupQueue.push({ userId, orgId });

		const circles = await t.query(api.circles.list, {
			sessionId,
			workspaceId: orgId
		});

		expect(circles).toBeDefined();
		expect(Array.isArray(circles)).toBe(true);
		expect(circles.length).toBe(2);
		expect(circles.map((c) => c.name).sort()).toEqual(['Circle 1', 'Circle 2']);
	});

	it('should create a circle with auto-generated slug', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.circles.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Active Platforms',
			purpose: 'Platform development and maintenance'
		});

		expect(result).toBeDefined();
		expect(result.circleId).toBeDefined();
		expect(result.slug).toMatch(/^active-platforms/);

		// Verify circle was created
		const circle = await t.query(api.circles.get, {
			sessionId,
			circleId: result.circleId
		});

		expect(circle.name).toBe('Active Platforms');
		expect(circle.purpose).toBe('Platform development and maintenance');
		expect(circle.parentCircleId).toBeUndefined();
	});

	it('should create nested circles (parent-child relationship)', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		cleanupQueue.push({ userId, orgId });

		// Create parent circle
		const parentResult = await t.mutation(api.circles.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Engineering',
			purpose: 'Software engineering'
		});

		// Create child circle
		const childResult = await t.mutation(api.circles.create, {
			sessionId,
			workspaceId: orgId,
			name: 'Backend Team',
			purpose: 'Backend development',
			parentCircleId: parentResult.circleId
		});

		// Verify parent-child relationship
		const childCircle = await t.query(api.circles.get, {
			sessionId,
			circleId: childResult.circleId
		});

		expect(childCircle.parentCircleId).toBe(parentResult.circleId);
		expect(childCircle.parentName).toBe('Engineering');
	});

	it('should get a single circle by ID', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		const circle = await t.query(api.circles.get, {
			sessionId,
			circleId
		});

		expect(circle).toBeDefined();
		expect(circle.name).toBe('Test Circle');
		expect(circle.workspaceId).toBe(orgId);
	});

	it('should update a circle name and purpose', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const circleId = await createTestCircle(t, orgId, 'Old Name');

		cleanupQueue.push({ userId, orgId });

		// Update circle
		const result = await t.mutation(api.circles.update, {
			sessionId,
			circleId,
			name: 'New Name',
			purpose: 'Updated purpose'
		});

		expect(result.success).toBe(true);

		// Verify update
		const circle = await t.query(api.circles.get, {
			sessionId,
			circleId
		});

		expect(circle.name).toBe('New Name');
		expect(circle.purpose).toBe('Updated purpose');
	});

	it('should archive a circle (soft delete)', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		// Archive circle
		const result = await t.mutation(api.circles.archive, {
			sessionId,
			circleId
		});

		expect(result.success).toBe(true);

		// Verify archive
		const circle = await t.query(api.circles.get, {
			sessionId,
			circleId
		});

		expect(circle.archivedAt).toBeDefined();
		expect(circle.archivedAt).toBeGreaterThan(0);
	});

	it('should add a member to a circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		// Add member
		const result = await t.mutation(api.circles.addMember, {
			sessionId,
			circleId,
			userId: user2Id
		});

		expect(result.success).toBe(true);

		// Verify member was added
		const members = await t.query(api.circles.getMembers, {
			sessionId,
			circleId
		});

		expect(members.length).toBe(1);
		expect(members[0].userId).toBe(user2Id);
	});

	it('should remove a member from a circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');
		await createTestCircleMember(t, circleId, user2Id);

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		// Verify member exists
		let members = await t.query(api.circles.getMembers, {
			sessionId,
			circleId
		});
		expect(members.length).toBe(1);

		// Remove member
		const result = await t.mutation(api.circles.removeMember, {
			sessionId,
			circleId,
			userId: user2Id
		});

		expect(result.success).toBe(true);

		// Verify member was removed
		members = await t.query(api.circles.getMembers, {
			sessionId,
			circleId
		});
		expect(members.length).toBe(0);
	});

	it('should prevent adding a duplicate member to a circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');
		await createTestCircleMember(t, circleId, user2Id);

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		// Try to add same member again
		await expect(
			t.mutation(api.circles.addMember, {
				sessionId,
				circleId,
				userId: user2Id
			})
		).rejects.toThrow('User is already a member of this circle');
	});

	it('should prevent creating a circle with invalid parent circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		const orgId2 = await createTestOrganization(t, 'Other Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId2, userId, 'member');

		// Create parent circle in different org
		const parentCircleId = await createTestCircle(t, orgId2, 'Parent Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ orgId: orgId2 });

		// Try to create child circle with parent from different org
		await expect(
			t.mutation(api.circles.create, {
				sessionId,
				workspaceId: orgId,
				name: 'Child Circle',
				parentCircleId
			})
		).rejects.toThrow('Parent circle must belong to the same workspace');
	});

	it('should prevent circular parent reference', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');

		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		// Try to set circle as its own parent
		await expect(
			t.mutation(api.circles.update, {
				sessionId,
				circleId,
				parentCircleId: circleId
			})
		).rejects.toThrow('Circle cannot be its own parent');
	});

	it('should enforce workspace membership - users cannot access other org circles', async () => {
		const t = convexTest(schema, modules);
		const { userId: user1 } = await createTestSession(t);
		const { sessionId: session2, userId: user2 } = await createTestSession(t);

		const org1 = await createTestOrganization(t, 'User 1 Org');
		const org2 = await createTestOrganization(t, 'User 2 Org');
		await createTestOrganizationMember(t, org1, user1, 'member');
		await createTestOrganizationMember(t, org2, user2, 'member');

		const circle1 = await createTestCircle(t, org1, 'Circle 1');

		cleanupQueue.push({ userId: user1, orgId: org1 });
		cleanupQueue.push({ userId: user2, orgId: org2 });

		// User 2 should not be able to access User 1's circle
		await expect(
			t.query(api.circles.get, {
				sessionId: session2,
				circleId: circle1
			})
		).rejects.toThrow('You do not have access to this workspace');
	});

	it('should fail with invalid sessionId', async () => {
		const t = convexTest(schema, modules);
		const orgId = await createTestOrganization(t, 'Test Org');

		cleanupQueue.push({ orgId });

		await expect(
			t.query(api.circles.list, {
				sessionId: 'invalid_session_id',
				workspaceId: orgId
			})
		).rejects.toThrow('Session not found');
	});
});
