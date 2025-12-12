/**
 * RBAC Permission Tests
 *
 * Test permission checking logic with various scenarios:
 * - Multi-role users
 * - Scope restrictions (all vs own)
 * - Resource ownership
 * - Audit logging
 */

import { convexTest } from 'convex-test';
import { expect, test, describe } from 'vitest';
import schema from '../schema';
import { api } from '../_generated/api';
// Import modules from integration test setup (same pattern used by working tests)
// From convex/rbac/, ../../ goes to root, then tests/convex/integration/test.setup
import { modules } from '../../tests/convex/integration/test.setup';

describe('RBAC Permission System', () => {
	test("Admin has all permissions with 'all' scope", async () => {
		const t = convexTest(schema, modules);

		// Create test user
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'test-admin-1',
				email: 'admin@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Seed RBAC data
		await t.mutation(api['rbac/seedRBAC'].seedRBAC, {});

		// Assign Admin role
		const roleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'admin'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId,
				roleId,
				assignedBy: userId,
				assignedAt: Date.now()
			});
		});

		// Test: Admin can create circles
		const canCreate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'circles.create');
		});

		expect(canCreate).toBe(true);

		// Test: Admin can update any circle (scope: all)
		const canUpdate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			const otherUserId = await ctx.db.insert('users', {
				workosId: 'other-user',
				email: 'other@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});

			return await hasPermission(ctx, userId, 'circles.update', {
				resourceOwnerId: otherUserId // Different owner
			});
		});

		expect(canUpdate).toBe(true);
	});

	test('Circle Lead can only manage own circles', async () => {
		const t = convexTest(schema, modules);

		// Create circle lead user
		const circleLeadId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'circle-lead-1',
				email: 'lead@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Create other user
		const otherUserId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'other-user-1',
				email: 'other@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Seed RBAC data
		await t.mutation(api['rbac/seedRBAC'].seedRBAC, {});

		// Assign Circle Lead role
		const roleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'circle-lead'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId: circleLeadId,
				roleId,
				assignedBy: circleLeadId,
				assignedAt: Date.now()
			});
		});

		// Test: Circle Lead CAN update their own circle
		const canUpdateOwn = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, circleLeadId, 'circles.update', {
				resourceOwnerId: circleLeadId // Same as user
			});
		});

		expect(canUpdateOwn).toBe(true);

		// Test: Circle Lead CANNOT update another circle
		const canUpdateOther = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, circleLeadId, 'circles.update', {
				resourceOwnerId: otherUserId // Different owner
			});
		});

		expect(canUpdateOther).toBe(false);

		// Test: Circle Lead CANNOT create circles
		const canCreate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, circleLeadId, 'circles.create');
		});

		expect(canCreate).toBe(false);

		// Test: Circle-scoped permission using circleId (not resourceOwnerId)
		// Create workspace and circle for circle-scoped role test
		const orgId = await t.run(async (ctx) => {
			return await ctx.db.insert('workspaces', {
				name: 'Test Org',
				slug: `test-org-${Date.now()}`,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				plan: 'starter'
			});
		});

		const circleId = await t.run(async (ctx) => {
			return await ctx.db.insert('circles', {
				workspaceId: orgId,
				name: 'Test Circle',
				slug: `test-circle-${Date.now()}`,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Assign Circle Lead role scoped to the circle
		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId: circleLeadId,
				roleId,
				circleId, // Circle-scoped role
				assignedBy: circleLeadId,
				assignedAt: Date.now()
			});
		});

		// Test: Circle Lead CAN update circle when using circleId context
		const canUpdateWithCircleId = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, circleLeadId, 'circles.update', { circleId });
		});

		expect(canUpdateWithCircleId).toBe(true);
	});

	test('Multi-role user has permissions from all roles', async () => {
		const t = convexTest(schema, modules);

		// Create user with multiple roles
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'multi-role-1',
				email: 'multi@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Seed RBAC data
		await t.mutation(api['rbac/seedRBAC'].seedRBAC, {});

		// Assign Circle Lead AND Billing Admin roles
		const circleLeadRoleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'circle-lead'))
				.first();
			return role!._id;
		});

		const billingRoleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'billing-admin'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId,
				roleId: circleLeadRoleId,
				assignedBy: userId,
				assignedAt: Date.now()
			});

			await ctx.db.insert('userRoles', {
				userId,
				roleId: billingRoleId,
				assignedBy: userId,
				assignedAt: Date.now()
			});
		});

		// Test: Has circle management permissions (from Circle Lead role)
		const canManageCircle = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'circles.update', {
				resourceOwnerId: userId
			});
		});

		expect(canManageCircle).toBe(true);

		// Test: Has billing permissions (from Billing Admin role)
		const canManageBilling = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'workspaces.manage-billing');
		});

		expect(canManageBilling).toBe(true);
	});

	test('requirePermission throws error when permission denied', async () => {
		const t = convexTest(schema, modules);

		// Create member user
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'member-1',
				email: 'member@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Seed RBAC data
		await t.mutation(api['rbac/seedRBAC'].seedRBAC, {});

		// Assign Member role (cannot create circles)
		const roleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'member'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId,
				roleId,
				assignedBy: userId,
				assignedAt: Date.now()
			});
		});

		// Test: requirePermission throws error
		await expect(async () => {
			await t.run(async (ctx) => {
				const { requirePermission } = await import('./permissions');
				await requirePermission(ctx, userId, 'circles.create');
			});
		}).rejects.toThrow(/AUTHZ_INSUFFICIENT_RBAC/);
	});

	test('Permission checks are logged to audit log', async () => {
		const t = convexTest(schema, modules);

		// Create user
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'audit-test-1',
				email: 'audit@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		// Seed RBAC data
		await t.mutation(api['rbac/seedRBAC'].seedRBAC, {});

		// Assign Admin role
		const roleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'admin'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId,
				roleId,
				assignedBy: userId,
				assignedAt: Date.now()
			});
		});

		// Perform permission check
		await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			await hasPermission(ctx, userId, 'circles.create');
		});

		// Verify audit log entry exists
		const auditLogs = await t.run(async (ctx) => {
			return await ctx.db
				.query('permissionAuditLog')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
		});

		expect(auditLogs.length).toBeGreaterThan(0);

		const log = auditLogs[0];
		expect(log.action).toBe('check');
		expect(log.permissionSlug).toBe('circles.create');
		expect(log.result).toBe('allowed');
	});
});
