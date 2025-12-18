/**
 * RBAC Seed Data - Minimal Set
 *
 * Populates initial roles, permissions, and role-permission mappings.
 * Based on SYOS-970 investigation - only includes actively used permissions.
 *
 * Run this once after deploying the schema:
 *   npx convex run infrastructure/rbac/seedRBAC:seed
 *
 * Changes from previous version (SYOS-971):
 * - Removed 9 unused permissions (see PermissionSlug type for details)
 * - Added docs.view permission (previously created dynamically)
 * - Kept all 6 roles (admin, manager, circle-lead, billing-admin, member, guest)
 * - Updated role-permission mappings to only include kept permissions
 */

import { internalMutation } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

export const seed = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		console.log('🌱 Seeding RBAC data (minimal set)...');

		// ========================================================================
		// Step 1: Create Roles (6 roles - all kept)
		// ========================================================================

		console.log('Creating roles...');

		// Helper function to get or create role
		const getOrCreateRole = async (
			slug: string,
			name: string,
			description: string
		): Promise<Id<'rbacRoles'>> => {
			const existing = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', slug))
				.first();

			if (existing) {
				console.log(`  Role "${slug}" already exists, skipping...`);
				return existing._id;
			}

			return await ctx.db.insert('rbacRoles', {
				slug,
				name,
				description,
				isSystem: true,
				createdAt: now,
				updatedAt: now
			});
		};

		const adminRole = await getOrCreateRole(
			'admin',
			'Admin',
			'Full system access - can manage all users, circles, and settings'
		);

		const managerRole = await getOrCreateRole(
			'manager',
			'Manager',
			'Can manage circles and invite users'
		);

		const circleLeadRole = await getOrCreateRole(
			'circle-lead',
			'Circle Lead',
			'Can manage their own circles only'
		);

		const billingAdminRole = await getOrCreateRole(
			'billing-admin',
			'Billing Admin',
			'Can manage billing and subscriptions only'
		);

		const memberRole = await getOrCreateRole(
			'member',
			'Member',
			'Standard user - view access and own profile management'
		);

		const guestRole = await getOrCreateRole(
			'guest',
			'Guest',
			'Limited access - specific resources only'
		);

		console.log(`✅ Roles ready (6 roles created or already existed)`);

		// ========================================================================
		// Step 2: Create Permissions (8 permissions - minimal set)
		// ========================================================================

		console.log('Creating permissions...');

		// Helper function to get or create permission
		const getOrCreatePermission = async (
			slug: string,
			category: string,
			action: string,
			description: string,
			requiresResource: boolean
		): Promise<Id<'rbacPermissions'>> => {
			const existing = await ctx.db
				.query('rbacPermissions')
				.withIndex('by_slug', (q) => q.eq('slug', slug))
				.first();

			if (existing) {
				console.log(`  Permission "${slug}" already exists, skipping...`);
				return existing._id;
			}

			return await ctx.db.insert('rbacPermissions', {
				slug,
				category,
				action,
				description,
				requiresResource,
				isSystem: true,
				createdAt: now,
				updatedAt: now
			});
		};

		// --- User Management Permissions (3 kept) ---

		const userInvitePerm = await getOrCreatePermission(
			'users.invite',
			'users',
			'invite',
			'Invite new users to workspace',
			false
		);

		const userChangeRolesPerm = await getOrCreatePermission(
			'users.change-roles',
			'users',
			'change-roles',
			'Change user roles',
			false
		);

		const userManageProfilePerm = await getOrCreatePermission(
			'users.manage-profile',
			'users',
			'manage-profile',
			'Edit user profiles (own or others)',
			false
		);

		// --- Circle Management Permissions (3 kept) ---

		const circlesViewPerm = await getOrCreatePermission(
			'circles.view',
			'circles',
			'view',
			'View circle details and members',
			true
		);

		const circlesCreatePerm = await getOrCreatePermission(
			'circles.create',
			'circles',
			'create',
			'Create new circles',
			false
		);

		const circlesUpdatePerm = await getOrCreatePermission(
			'circles.update',
			'circles',
			'update',
			'Edit circle settings and details',
			true
		);

		// --- Workspace Settings Permissions (1 kept) ---

		const workspacesManageBillingPerm = await getOrCreatePermission(
			'workspaces.manage-billing',
			'workspaces',
			'manage-billing',
			'Manage billing and subscriptions',
			false
		);

		// --- Documentation Permissions (1 added) ---

		const docsViewPerm = await getOrCreatePermission(
			'docs.view',
			'docs',
			'view',
			'View documents',
			false
		);

		console.log(`✅ Permissions ready (8 permissions created or already existed)`);

		// ========================================================================
		// Step 3: Create Role-Permission Mappings
		// ========================================================================

		console.log('Creating role-permission mappings...');

		const mappings: Array<{
			roleId: Id<'rbacRoles'>;
			permissionId: Id<'rbacPermissions'>;
			scope: 'all' | 'own' | 'none';
		}> = [];

		// --- Admin Role: Full access to all 8 permissions (scope: "all") ---
		const adminPermissions = [
			userInvitePerm,
			userChangeRolesPerm,
			userManageProfilePerm,
			circlesViewPerm,
			circlesCreatePerm,
			circlesUpdatePerm,
			workspacesManageBillingPerm,
			docsViewPerm
		];
		for (const permId of adminPermissions) {
			mappings.push({ roleId: adminRole, permissionId: permId, scope: 'all' });
		}

		// --- Manager Role: Circle management + user invites ---
		const managerPermissions = [
			{ id: userInvitePerm, scope: 'all' as const },
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: circlesViewPerm, scope: 'all' as const },
			{ id: circlesCreatePerm, scope: 'all' as const },
			{ id: circlesUpdatePerm, scope: 'all' as const }
		];
		for (const perm of managerPermissions) {
			mappings.push({ roleId: managerRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Circle Lead Role: Manage their own circles only (scope: "own") ---
		const circleLeadPermissions = [
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: circlesViewPerm, scope: 'own' as const },
			{ id: circlesUpdatePerm, scope: 'own' as const }
		];
		for (const perm of circleLeadPermissions) {
			mappings.push({ roleId: circleLeadRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Billing Admin Role: Billing only ---
		const billingAdminPermissions = [
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: workspacesManageBillingPerm, scope: 'all' as const }
		];
		for (const perm of billingAdminPermissions) {
			mappings.push({ roleId: billingAdminRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Member Role: View only + own profile ---
		const memberPermissions = [
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: circlesViewPerm, scope: 'all' as const }
		];
		for (const perm of memberPermissions) {
			mappings.push({ roleId: memberRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Guest Role: Very limited (specific resources only) ---
		const guestPermissions = [{ id: circlesViewPerm, scope: 'own' as const }];
		for (const perm of guestPermissions) {
			mappings.push({ roleId: guestRole, permissionId: perm.id, scope: perm.scope });
		}

		// Insert all mappings (idempotent - check before insert)
		let mappingsCreated = 0;
		let mappingsSkipped = 0;
		for (const mapping of mappings) {
			const existing = await ctx.db
				.query('rbacRolePermissions')
				.withIndex('by_role_permission', (q) =>
					q.eq('roleId', mapping.roleId).eq('permissionId', mapping.permissionId)
				)
				.first();

			if (existing) {
				mappingsSkipped++;
				continue;
			}

			await ctx.db.insert('rbacRolePermissions', {
				roleId: mapping.roleId,
				permissionId: mapping.permissionId,
				scope: mapping.scope,
				createdAt: now
			});
			mappingsCreated++;
		}

		console.log(
			`✅ Role-permission mappings ready (${mappingsCreated} created, ${mappingsSkipped} already existed)`
		);

		console.log('🎉 RBAC seed complete!');

		return {
			success: true,
			summary: {
				roles: 6,
				permissions: 8,
				mappings: mappings.length,
				note: 'Minimal permission set based on SYOS-970 investigation'
			}
		};
	}
});

/**
 * Legacy export for backward compatibility
 * @deprecated Use `seed` instead
 */
export const seedRBAC = seed;
