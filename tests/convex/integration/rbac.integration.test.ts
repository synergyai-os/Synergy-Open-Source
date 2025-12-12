/**
 * RBAC Module Integration Tests
 *
 * Tests actual Convex RBAC functions to validate permission checks and role resolution
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from './test.setup';
import {
	createTestSession,
	cleanupTestData,
	createTestRole,
	createTestPermission,
	assignRoleToUser,
	assignPermissionToRole,
	createTestOrganization,
	cleanupTestOrganization
} from './setup';
import { hasPermission, requirePermission } from '../../../convex/rbac/permissions';

describe('RBAC Integration Tests', () => {
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

	it('should get all roles', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push({ userId });
		const roleId = await createTestRole(t, 'test-role', 'Test Role');

		const roles = await t.query(api.rbac.queries.getRoles, { sessionId });

		expect(roles).toBeDefined();
		expect(Array.isArray(roles)).toBe(true);
		expect(roles.some((r) => r._id === roleId)).toBe(true);

		// Cleanup
		await t.run(async (ctx) => {
			await ctx.db.delete(roleId);
		});
	});

	it('should get all permissions', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push({ userId });
		const permId = await createTestPermission(t, 'test-permission', 'Test Permission');

		const permissions = await t.query(api.rbac.queries.getPermissions, { sessionId });

		expect(permissions).toBeDefined();
		expect(Array.isArray(permissions)).toBe(true);
		expect(permissions.some((p) => p._id === permId)).toBe(true);

		// Cleanup
		await t.run(async (ctx) => {
			await ctx.db.delete(permId);
		});
	});

	it('should get permissions for a specific role', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push({ userId });
		const roleId = await createTestRole(t, 'manager', 'Manager');
		const permId = await createTestPermission(t, 'users.view', 'View Users');
		await assignPermissionToRole(t, roleId, permId, 'all');

		const result = await t.query(api.rbac.queries.getPermissionsForRole, {
			sessionId,
			roleSlug: 'manager'
		});

		expect(result).toBeDefined();
		expect(result?.role.slug).toBe('manager');
		expect(result?.permissions.length).toBeGreaterThan(0);
		expect(result?.permissions[0].slug).toBe('users.view');
		expect(result?.permissions[0].scope).toBe('all');

		// Cleanup
		await t.run(async (ctx) => {
			const rolePermissions = await ctx.db
				.query('rolePermissions')
				.withIndex('by_role', (q) => q.eq('roleId', roleId))
				.collect();
			for (const rp of rolePermissions) {
				await ctx.db.delete(rp._id);
			}
			await ctx.db.delete(roleId);
			await ctx.db.delete(permId);
		});
	});

	it('should validate hasPermission with "all" scope (Admin)', async () => {
		const t = convexTest(schema, modules);
		const { userId: adminUserId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');

		// Set up Admin role with users.view permission (scope: "all")
		const adminRole = await createTestRole(t, 'admin', 'Admin');
		const viewPermission = await createTestPermission(t, 'users.view', 'View Users');
		await assignPermissionToRole(t, adminRole, viewPermission, 'all');
		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId });

		cleanupQueue.push({ userId: adminUserId, orgId });

		// Check permission
		const result = await t.run(async (ctx) => {
			return await hasPermission(ctx, adminUserId, 'users.view', { workspaceId: orgId });
		});

		expect(result).toBe(true);
	});

	it('should validate hasPermission with "own" scope (user editing own profile)', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);

		// Set up User role with users.manage-profile permission (scope: "own")
		const userRole = await createTestRole(t, 'user', 'User');
		const profilePermission = await createTestPermission(
			t,
			'users.manage-profile',
			'Manage Profile'
		);
		await assignPermissionToRole(t, userRole, profilePermission, 'own');
		await assignRoleToUser(t, userId, userRole);

		cleanupQueue.push({ userId });

		// User can edit their own profile
		const ownResult = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.manage-profile', {
				resourceOwnerId: userId
			});
		});

		expect(ownResult).toBe(true);

		// User cannot edit someone else's profile
		const { userId: otherUserId } = await createTestSession(t);
		cleanupQueue.push({ userId: otherUserId });

		const otherResult = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.manage-profile', {
				resourceOwnerId: otherUserId
			});
		});

		expect(otherResult).toBe(false);
	});

	it('should validate hasPermission with team scope (Team Lead)', async () => {
		const t = convexTest(schema, modules);
		const { userId: teamLeadUserId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');

		// Create a circle
		const circleId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert('circles', {
				workspaceId: orgId,
				name: 'Test Circle',
				slug: 'test-circle',
				createdAt: now,
				updatedAt: now
			});
		});

		// Set up Circle Lead role with circles.update permission (scope: "own")
		const circleLeadRole = await createTestRole(t, 'circle-lead', 'Circle Lead');
		const updatePermission = await createTestPermission(t, 'circles.update', 'Update Circle');
		await assignPermissionToRole(t, circleLeadRole, updatePermission, 'own');
		await assignRoleToUser(t, teamLeadUserId, circleLeadRole, {
			workspaceId: orgId,
			circleId
		});

		cleanupQueue.push({ userId: teamLeadUserId, orgId });

		// Circle Lead can update their circle
		const result = await t.run(async (ctx) => {
			return await hasPermission(ctx, teamLeadUserId, 'circles.update', { circleId });
		});

		expect(result).toBe(true);

		// Cleanup circle
		await t.run(async (ctx) => {
			await ctx.db.delete(circleId);
		});
	});

	it('should throw when requirePermission fails', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);
		cleanupQueue.push({ userId });

		// User has no permissions - should throw
		await expect(
			t.run(async (ctx) => {
				return await requirePermission(ctx, userId, 'users.view');
			})
		).rejects.toThrow();
	});

	it('should resolve multi-role permissions (User + Team Lead)', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);
		const orgId = await createTestOrganization(t, 'Test Org');

		// Assign base User role (can edit own profile)
		const userRole = await createTestRole(t, 'user', 'User');
		const profilePermission = await createTestPermission(
			t,
			'users.manage-profile',
			'Manage Profile'
		);
		await assignPermissionToRole(t, userRole, profilePermission, 'own');
		await assignRoleToUser(t, userId, userRole);

		// Assign Team Lead role (can view users)
		const teamLeadRole = await createTestRole(t, 'team-lead', 'Team Lead');
		const viewPermission = await createTestPermission(t, 'users.view', 'View Users');
		await assignPermissionToRole(t, teamLeadRole, viewPermission, 'all');
		await assignRoleToUser(t, userId, teamLeadRole, { workspaceId: orgId });

		cleanupQueue.push({ userId, orgId });

		// Should have both permissions
		const canEditProfile = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.manage-profile', {
				resourceOwnerId: userId
			});
		});

		const canViewUsers = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.view', { workspaceId: orgId });
		});

		expect(canEditProfile).toBe(true);
		expect(canViewUsers).toBe(true);
	});

	it('should deny permission when user has no roles', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);
		cleanupQueue.push({ userId });

		const result = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.view');
		});

		expect(result).toBe(false);
	});

	it('should deny permission with wrong scope', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);
		const { userId: otherUserId } = await createTestSession(t);

		// User can only edit their own profile (scope: "own")
		const userRole = await createTestRole(t, 'user', 'User');
		const profilePermission = await createTestPermission(
			t,
			'users.manage-profile',
			'Manage Profile'
		);
		await assignPermissionToRole(t, userRole, profilePermission, 'own');
		await assignRoleToUser(t, userId, userRole);

		cleanupQueue.push({ userId }, { userId: otherUserId });

		// Should deny access to other user's profile
		const result = await t.run(async (ctx) => {
			return await hasPermission(ctx, userId, 'users.manage-profile', {
				resourceOwnerId: otherUserId
			});
		});

		expect(result).toBe(false);
	});
});
