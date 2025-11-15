/**
 * Circle Roles Module Integration Tests
 *
 * Tests organizational role management within circles
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import schema from '../../../convex/schema';
import { modules } from './test.setup';
import {
	createTestSession,
	createTestOrganization,
	createTestOrganizationMember,
	createTestCircle,
	cleanupTestData,
	cleanupTestOrganization
} from './setup';

describe('Circle Roles Integration Tests', () => {
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

	it('should create a role in a circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		const result = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Circle Lead',
			purpose: 'Leads the circle and facilitates meetings'
		});

		expect(result).toBeDefined();
		expect(result.roleId).toBeDefined();

		// Verify role was created
		const roles = await t.query(api.circleRoles.listByCircle, {
			sessionId,
			circleId
		});

		expect(roles.length).toBe(1);
		expect(roles[0].name).toBe('Circle Lead');
		expect(roles[0].purpose).toBe('Leads the circle and facilitates meetings');
		expect(roles[0].fillerCount).toBe(0);
	});

	it('should list all roles in a circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		// Create multiple roles
		await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Circle Lead'
		});
		await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});
		await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Facilitator'
		});

		const roles = await t.query(api.circleRoles.listByCircle, {
			sessionId,
			circleId
		});

		expect(roles.length).toBe(3);
		expect(roles.map((r) => r.name).sort()).toEqual(['Circle Lead', 'Dev Lead', 'Facilitator']);
	});

	it('should update a role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Old Name'
		});

		// Update role
		const result = await t.mutation(api.circleRoles.update, {
			sessionId,
			circleRoleId: roleId,
			name: 'New Name',
			purpose: 'Updated purpose'
		});

		expect(result.success).toBe(true);

		// Verify update
		const roles = await t.query(api.circleRoles.listByCircle, {
			sessionId,
			circleId
		});

		expect(roles.length).toBe(1);
		expect(roles[0].name).toBe('New Name');
		expect(roles[0].purpose).toBe('Updated purpose');
	});

	it('should delete a role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Temporary Role'
		});

		// Delete role
		const result = await t.mutation(api.circleRoles.deleteRole, {
			sessionId,
			circleRoleId: roleId
		});

		expect(result.success).toBe(true);

		// Verify deletion
		const roles = await t.query(api.circleRoles.listByCircle, {
			sessionId,
			circleId
		});

		expect(roles.length).toBe(0);
	});

	it('should assign a user to a role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});

		// Assign user to role
		const result = await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});

		expect(result.success).toBe(true);

		// Verify assignment
		const fillers = await t.query(api.circleRoles.getRoleFillers, {
			sessionId,
			circleRoleId: roleId
		});

		expect(fillers.length).toBe(1);
		expect(fillers[0].userId).toBe(user2Id);
		expect(fillers[0].assignedBy).toBe(userId);
	});

	it('should remove a user from a role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});

		// Assign user
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});

		// Verify assignment exists
		let fillers = await t.query(api.circleRoles.getRoleFillers, {
			sessionId,
			circleRoleId: roleId
		});
		expect(fillers.length).toBe(1);

		// Remove user from role
		const result = await t.mutation(api.circleRoles.removeUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});

		expect(result.success).toBe(true);

		// Verify removal
		fillers = await t.query(api.circleRoles.getRoleFillers, {
			sessionId,
			circleRoleId: roleId
		});
		expect(fillers.length).toBe(0);
	});

	it('should get all roles assigned to a user', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		// Create multiple roles
		const { roleId: role1 } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});
		const { roleId: role2 } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Circle Lead'
		});

		// Assign user to both roles
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: role1,
			userId: user2Id
		});
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: role2,
			userId: user2Id
		});

		// Get user's roles
		const userRoles = await t.query(api.circleRoles.getUserRoles, {
			sessionId,
			userId: user2Id
		});

		expect(userRoles.length).toBe(2);
		expect(userRoles.map((r) => r.roleName).sort()).toEqual(['Circle Lead', 'Dev Lead']);
	});

	it('should allow multiple users to fill the same role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const { userId: user3Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		await createTestOrganizationMember(t, orgId, user3Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });
		cleanupQueue.push({ userId: user3Id });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Developer'
		});

		// Assign multiple users to same role
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user3Id
		});

		// Verify both users are assigned
		const fillers = await t.query(api.circleRoles.getRoleFillers, {
			sessionId,
			circleRoleId: roleId
		});

		expect(fillers.length).toBe(2);
		expect(fillers.map((f) => f.userId).sort()).toEqual([user2Id, user3Id].sort());
	});

	it('should prevent duplicate role names in same circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });

		// Create first role
		await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Circle Lead'
		});

		// Try to create duplicate
		await expect(
			t.mutation(api.circleRoles.create, {
				sessionId,
				circleId,
				name: 'Circle Lead'
			})
		).rejects.toThrow('A role with this name already exists in this circle');
	});

	it('should prevent assigning user twice to same role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});

		// First assignment succeeds
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});

		// Second assignment fails
		await expect(
			t.mutation(api.circleRoles.assignUser, {
				sessionId,
				circleRoleId: roleId,
				userId: user2Id
			})
		).rejects.toThrow('User is already assigned to this role');
	});

	it('should delete all assignments when role is deleted', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');
		const circleId = await createTestCircle(t, orgId, 'Test Circle');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId,
			name: 'Dev Lead'
		});

		// Assign user to role
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: roleId,
			userId: user2Id
		});

		// Verify assignment exists
		const userRolesBefore = await t.query(api.circleRoles.getUserRoles, {
			sessionId,
			userId: user2Id
		});
		expect(userRolesBefore.length).toBe(1);

		// Delete role
		await t.mutation(api.circleRoles.deleteRole, {
			sessionId,
			circleRoleId: roleId
		});

		// Verify assignments removed
		const userRolesAfter = await t.query(api.circleRoles.getUserRoles, {
			sessionId,
			userId: user2Id
		});
		expect(userRolesAfter.length).toBe(0);
	});

	it('should filter user roles by circle', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		const { userId: user2Id } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');
		await createTestOrganizationMember(t, orgId, userId, 'member');
		await createTestOrganizationMember(t, orgId, user2Id, 'member');

		const circle1 = await createTestCircle(t, orgId, 'Circle 1');
		const circle2 = await createTestCircle(t, orgId, 'Circle 2');

		cleanupQueue.push({ userId, orgId });
		cleanupQueue.push({ userId: user2Id });

		// Create roles in different circles
		const { roleId: role1 } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId: circle1,
			name: 'Circle 1 Lead'
		});
		const { roleId: role2 } = await t.mutation(api.circleRoles.create, {
			sessionId,
			circleId: circle2,
			name: 'Circle 2 Lead'
		});

		// Assign user to both roles
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: role1,
			userId: user2Id
		});
		await t.mutation(api.circleRoles.assignUser, {
			sessionId,
			circleRoleId: role2,
			userId: user2Id
		});

		// Get roles filtered by circle1
		const circle1Roles = await t.query(api.circleRoles.getUserRoles, {
			sessionId,
			userId: user2Id,
			circleId: circle1
		});

		expect(circle1Roles.length).toBe(1);
		expect(circle1Roles[0].roleName).toBe('Circle 1 Lead');
	});

	it('should enforce organization membership - users cannot access other org roles', async () => {
		const t = convexTest(schema, modules);
		const { sessionId: session1, userId: user1 } = await createTestSession(t);
		const { sessionId: session2, userId: user2 } = await createTestSession(t);

		const org1 = await createTestOrganization(t, 'Org 1');
		const org2 = await createTestOrganization(t, 'Org 2');
		await createTestOrganizationMember(t, org1, user1, 'member');
		await createTestOrganizationMember(t, org2, user2, 'member');

		const circle1 = await createTestCircle(t, org1, 'Circle 1');

		cleanupQueue.push({ userId: user1, orgId: org1 });
		cleanupQueue.push({ userId: user2, orgId: org2 });

		const { roleId } = await t.mutation(api.circleRoles.create, {
			sessionId: session1,
			circleId: circle1,
			name: 'Dev Lead'
		});

		// User 2 should not be able to access role from Org 1
		await expect(
			t.query(api.circleRoles.getRoleFillers, {
				sessionId: session2,
				circleRoleId: roleId
			})
		).rejects.toThrow('You do not have access to this organization');
	});
});
