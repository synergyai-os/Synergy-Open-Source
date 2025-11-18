/**
 * RBAC Seed Data
 *
 * Populates initial roles, permissions, and role-permission mappings.
 * Run this once after deploying the schema.
 *
 * Usage: Call seedRBAC() mutation from Convex dashboard or via CLI:
 *   npx convex run rbac/seedRBAC:seedRBAC
 */

import { mutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export const seedRBAC = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		console.log('🌱 Seeding RBAC data...');

		// ========================================================================
		// Step 1: Create Roles (idempotent - check before insert)
		// ========================================================================

		console.log('Creating roles...');

		// Helper function to get or create role
		const getOrCreateRole = async (
			slug: string,
			name: string,
			description: string
		): Promise<Id<'roles'>> => {
			const existing = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', slug))
				.first();

			if (existing) {
				console.log(`  Role "${slug}" already exists, skipping...`);
				return existing._id;
			}

			return await ctx.db.insert('roles', {
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
			'Full system access - can manage all users, teams, and settings'
		);

		const managerRole = await getOrCreateRole(
			'manager',
			'Manager',
			'Can manage teams and invite users'
		);

		const teamLeadRole = await getOrCreateRole(
			'team-lead',
			'Team Lead',
			'Can manage their own teams only'
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

		console.log(`✅ Roles ready (created or already existed)`);

		// ========================================================================
		// Step 2: Create Permissions
		// ========================================================================

		console.log('Creating permissions...');

		// Helper function to get or create permission
		const getOrCreatePermission = async (
			slug: string,
			category: string,
			action: string,
			description: string,
			requiresResource: boolean
		): Promise<Id<'permissions'>> => {
			const existing = await ctx.db
				.query('permissions')
				.withIndex('by_slug', (q) => q.eq('slug', slug))
				.first();

			if (existing) {
				console.log(`  Permission "${slug}" already exists, skipping...`);
				return existing._id;
			}

			return await ctx.db.insert('permissions', {
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

		// --- User Management Permissions (5) ---

		const userViewPerm = await getOrCreatePermission(
			'users.view',
			'users',
			'view',
			'View user profiles and details',
			false
		);

		const userInvitePerm = await getOrCreatePermission(
			'users.invite',
			'users',
			'invite',
			'Invite new users to organization',
			false
		);

		const userRemovePerm = await getOrCreatePermission(
			'users.remove',
			'users',
			'remove',
			'Remove users from organization',
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

		// --- Team Management Permissions (7) ---

		const teamViewPerm = await getOrCreatePermission(
			'teams.view',
			'teams',
			'view',
			'View team details and members',
			true
		);

		const teamCreatePerm = await getOrCreatePermission(
			'teams.create',
			'teams',
			'create',
			'Create new teams',
			false
		);

		const teamUpdatePerm = await getOrCreatePermission(
			'teams.update',
			'teams',
			'update',
			'Edit team settings and details',
			true
		);

		const teamDeletePerm = await getOrCreatePermission(
			'teams.delete',
			'teams',
			'delete',
			'Delete teams',
			true
		);

		const teamAddMembersPerm = await getOrCreatePermission(
			'teams.add-members',
			'teams',
			'add-members',
			'Add members to teams',
			true
		);

		const teamRemoveMembersPerm = await getOrCreatePermission(
			'teams.remove-members',
			'teams',
			'remove-members',
			'Remove members from teams',
			true
		);

		const teamChangeRolesPerm = await getOrCreatePermission(
			'teams.change-roles',
			'teams',
			'change-roles',
			'Change member roles within teams',
			true
		);

		// --- Organization Settings Permissions (3) ---

		const orgViewSettingsPerm = await getOrCreatePermission(
			'organizations.view-settings',
			'organizations',
			'view-settings',
			'View organization settings',
			false
		);

		const orgUpdateSettingsPerm = await getOrCreatePermission(
			'organizations.update-settings',
			'organizations',
			'update-settings',
			'Update organization settings',
			false
		);

		const orgManageBillingPerm = await getOrCreatePermission(
			'organizations.manage-billing',
			'organizations',
			'manage-billing',
			'Manage billing and subscriptions',
			false
		);

		console.log(`✅ Permissions ready (created or already existed)`);

		// ========================================================================
		// Step 3: Create Role-Permission Mappings
		// ========================================================================

		console.log('Creating role-permission mappings...');

		const mappings: Array<{
			roleId: Id<'roles'>;
			permissionId: Id<'permissions'>;
			scope: 'all' | 'own' | 'none';
		}> = [];

		// --- Admin Role: Full access (scope: "all") ---
		const adminPermissions = [
			userViewPerm,
			userInvitePerm,
			userRemovePerm,
			userChangeRolesPerm,
			userManageProfilePerm,
			teamViewPerm,
			teamCreatePerm,
			teamUpdatePerm,
			teamDeletePerm,
			teamAddMembersPerm,
			teamRemoveMembersPerm,
			teamChangeRolesPerm,
			orgViewSettingsPerm,
			orgUpdateSettingsPerm,
			orgManageBillingPerm
		];
		for (const permId of adminPermissions) {
			mappings.push({ roleId: adminRole, permissionId: permId, scope: 'all' });
		}

		// --- Manager Role: Team management + user invites (scope: "all" for most) ---
		const managerPermissions = [
			{ id: userViewPerm, scope: 'all' as const },
			{ id: userInvitePerm, scope: 'all' as const },
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: teamViewPerm, scope: 'all' as const },
			{ id: teamCreatePerm, scope: 'all' as const },
			{ id: teamUpdatePerm, scope: 'all' as const },
			{ id: teamAddMembersPerm, scope: 'all' as const },
			{ id: teamRemoveMembersPerm, scope: 'all' as const },
			{ id: teamChangeRolesPerm, scope: 'all' as const },
			{ id: orgViewSettingsPerm, scope: 'all' as const }
		];
		for (const perm of managerPermissions) {
			mappings.push({ roleId: managerRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Team Lead Role: Manage their own teams only (scope: "own") ---
		const teamLeadPermissions = [
			{ id: userViewPerm, scope: 'all' as const },
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: teamViewPerm, scope: 'own' as const },
			{ id: teamUpdatePerm, scope: 'own' as const },
			{ id: teamAddMembersPerm, scope: 'own' as const },
			{ id: teamRemoveMembersPerm, scope: 'own' as const },
			{ id: orgViewSettingsPerm, scope: 'all' as const }
		];
		for (const perm of teamLeadPermissions) {
			mappings.push({ roleId: teamLeadRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Billing Admin Role: Billing only ---
		const billingAdminPermissions = [
			{ id: userViewPerm, scope: 'all' as const },
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: orgViewSettingsPerm, scope: 'all' as const },
			{ id: orgManageBillingPerm, scope: 'all' as const }
		];
		for (const perm of billingAdminPermissions) {
			mappings.push({ roleId: billingAdminRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Member Role: View only + own profile ---
		const memberPermissions = [
			{ id: userViewPerm, scope: 'all' as const },
			{ id: userManageProfilePerm, scope: 'own' as const },
			{ id: teamViewPerm, scope: 'all' as const },
			{ id: orgViewSettingsPerm, scope: 'all' as const }
		];
		for (const perm of memberPermissions) {
			mappings.push({ roleId: memberRole, permissionId: perm.id, scope: perm.scope });
		}

		// --- Guest Role: Very limited (specific resources only) ---
		const guestPermissions = [{ id: teamViewPerm, scope: 'own' as const }];
		for (const perm of guestPermissions) {
			mappings.push({ roleId: guestRole, permissionId: perm.id, scope: perm.scope });
		}

		// Insert all mappings (idempotent - check before insert)
		let mappingsCreated = 0;
		let mappingsSkipped = 0;
		for (const mapping of mappings) {
			const existing = await ctx.db
				.query('rolePermissions')
				.withIndex('by_role_permission', (q) =>
					q.eq('roleId', mapping.roleId).eq('permissionId', mapping.permissionId)
				)
				.first();

			if (existing) {
				mappingsSkipped++;
				continue;
			}

			await ctx.db.insert('rolePermissions', {
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
				permissions: 15,
				mappings: mappings.length
			}
		};
	}
});
