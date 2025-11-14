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

export const seedRBAC = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		console.log('🌱 Seeding RBAC data...');

		// ========================================================================
		// Step 1: Create Roles
		// ========================================================================

		console.log('Creating roles...');

		const adminRole = await ctx.db.insert('roles', {
			slug: 'admin',
			name: 'Admin',
			description: 'Full system access - can manage all users, teams, and settings',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const managerRole = await ctx.db.insert('roles', {
			slug: 'manager',
			name: 'Manager',
			description: 'Can manage teams and invite users',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamLeadRole = await ctx.db.insert('roles', {
			slug: 'team-lead',
			name: 'Team Lead',
			description: 'Can manage their own teams only',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const billingAdminRole = await ctx.db.insert('roles', {
			slug: 'billing-admin',
			name: 'Billing Admin',
			description: 'Can manage billing and subscriptions only',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const memberRole = await ctx.db.insert('roles', {
			slug: 'member',
			name: 'Member',
			description: 'Standard user - view access and own profile management',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const guestRole = await ctx.db.insert('roles', {
			slug: 'guest',
			name: 'Guest',
			description: 'Limited access - specific resources only',
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		console.log(`✅ Created 6 roles`);

		// ========================================================================
		// Step 2: Create Permissions
		// ========================================================================

		console.log('Creating permissions...');

		// --- User Management Permissions (5) ---

		const userViewPerm = await ctx.db.insert('permissions', {
			slug: 'users.view',
			category: 'users',
			action: 'view',
			description: 'View user profiles and details',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const userInvitePerm = await ctx.db.insert('permissions', {
			slug: 'users.invite',
			category: 'users',
			action: 'invite',
			description: 'Invite new users to organization',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const userRemovePerm = await ctx.db.insert('permissions', {
			slug: 'users.remove',
			category: 'users',
			action: 'remove',
			description: 'Remove users from organization',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const userChangeRolesPerm = await ctx.db.insert('permissions', {
			slug: 'users.change-roles',
			category: 'users',
			action: 'change-roles',
			description: 'Change user roles',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const userManageProfilePerm = await ctx.db.insert('permissions', {
			slug: 'users.manage-profile',
			category: 'users',
			action: 'manage-profile',
			description: 'Edit user profiles (own or others)',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		// --- Team Management Permissions (7) ---

		const teamViewPerm = await ctx.db.insert('permissions', {
			slug: 'teams.view',
			category: 'teams',
			action: 'view',
			description: 'View team details and members',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamCreatePerm = await ctx.db.insert('permissions', {
			slug: 'teams.create',
			category: 'teams',
			action: 'create',
			description: 'Create new teams',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamUpdatePerm = await ctx.db.insert('permissions', {
			slug: 'teams.update',
			category: 'teams',
			action: 'update',
			description: 'Edit team settings and details',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamDeletePerm = await ctx.db.insert('permissions', {
			slug: 'teams.delete',
			category: 'teams',
			action: 'delete',
			description: 'Delete teams',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamAddMembersPerm = await ctx.db.insert('permissions', {
			slug: 'teams.add-members',
			category: 'teams',
			action: 'add-members',
			description: 'Add members to teams',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamRemoveMembersPerm = await ctx.db.insert('permissions', {
			slug: 'teams.remove-members',
			category: 'teams',
			action: 'remove-members',
			description: 'Remove members from teams',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const teamChangeRolesPerm = await ctx.db.insert('permissions', {
			slug: 'teams.change-roles',
			category: 'teams',
			action: 'change-roles',
			description: 'Change member roles within teams',
			requiresResource: true,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		// --- Organization Settings Permissions (3) ---

		const orgViewSettingsPerm = await ctx.db.insert('permissions', {
			slug: 'organizations.view-settings',
			category: 'organizations',
			action: 'view-settings',
			description: 'View organization settings',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const orgUpdateSettingsPerm = await ctx.db.insert('permissions', {
			slug: 'organizations.update-settings',
			category: 'organizations',
			action: 'update-settings',
			description: 'Update organization settings',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		const orgManageBillingPerm = await ctx.db.insert('permissions', {
			slug: 'organizations.manage-billing',
			category: 'organizations',
			action: 'manage-billing',
			description: 'Manage billing and subscriptions',
			requiresResource: false,
			isSystem: true,
			createdAt: now,
			updatedAt: now
		});

		console.log(`✅ Created 15 permissions`);

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

		// Insert all mappings
		for (const mapping of mappings) {
			await ctx.db.insert('rolePermissions', {
				roleId: mapping.roleId,
				permissionId: mapping.permissionId,
				scope: mapping.scope,
				createdAt: now
			});
		}

		console.log(`✅ Created ${mappings.length} role-permission mappings`);

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
