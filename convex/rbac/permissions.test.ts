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

		// Test: Admin can create teams
		const canCreate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'teams.create');
		});

		expect(canCreate).toBe(true);

		// Test: Admin can update any team (scope: all)
		const canUpdate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			const otherUserId = await ctx.db.insert('users', {
				workosId: 'other-user',
				email: 'other@test.com',
				emailVerified: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});

			return await hasPermission(ctx, userId, 'teams.update', {
				resourceOwnerId: otherUserId // Different owner
			});
		});

		expect(canUpdate).toBe(true);
	});

	test('Team Lead can only manage own teams', async () => {
		const t = convexTest(schema, modules);

		// Create team lead user
		const teamLeadId = await t.run(async (ctx) => {
			return await ctx.db.insert('users', {
				workosId: 'team-lead-1',
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

		// Assign Team Lead role
		const roleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'team-lead'))
				.first();
			return role!._id;
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('userRoles', {
				userId: teamLeadId,
				roleId,
				assignedBy: teamLeadId,
				assignedAt: Date.now()
			});
		});

		// Test: Team Lead CAN update their own team
		const canUpdateOwn = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, teamLeadId, 'teams.update', {
				resourceOwnerId: teamLeadId // Same as user
			});
		});

		expect(canUpdateOwn).toBe(true);

		// Test: Team Lead CANNOT update another team
		const canUpdateOther = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, teamLeadId, 'teams.update', {
				resourceOwnerId: otherUserId // Different owner
			});
		});

		expect(canUpdateOther).toBe(false);

		// Test: Team Lead CANNOT create teams
		const canCreate = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, teamLeadId, 'teams.create');
		});

		expect(canCreate).toBe(false);
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

		// Assign Team Lead AND Billing Admin roles
		const teamLeadRoleId = await t.run(async (ctx) => {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', 'team-lead'))
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
				roleId: teamLeadRoleId,
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

		// Test: Has team management permissions (from Team Lead role)
		const canManageTeam = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'teams.update', {
				resourceOwnerId: userId
			});
		});

		expect(canManageTeam).toBe(true);

		// Test: Has billing permissions (from Billing Admin role)
		const canManageBilling = await t.run(async (ctx) => {
			const { hasPermission } = await import('./permissions');
			return await hasPermission(ctx, userId, 'organizations.manage-billing');
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

		// Assign Member role (cannot create teams)
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
				await requirePermission(ctx, userId, 'teams.create');
			});
		}).rejects.toThrow('Permission denied');
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
			await hasPermission(ctx, userId, 'teams.create');
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
		expect(log.permissionSlug).toBe('teams.create');
		expect(log.result).toBe('allowed');
	});
});
