/**
 * Cleanup Duplicate Roles
 *
 * One-time migration script to remove duplicate roles from the database.
 * This script:
 * 1. Finds all duplicate roles (same slug)
 * 2. Keeps the most recent role (highest createdAt)
 * 3. Migrates all user-role assignments to the kept role
 * 4. Migrates all role-permission mappings to the kept role
 * 5. Deletes the duplicate roles
 *
 * Usage with API key (recommended for CLI):
 *   npx convex run admin/cleanupDuplicateRoles:cleanupDuplicateRolesInternal '{}'
 *
 * Usage with session ID (for browser/admin UI):
 *   npx convex run admin/cleanupDuplicateRoles:cleanupDuplicateRoles '{"sessionId": "your-session-id"}'
 *
 * ⚠️ WARNING: This is a destructive operation. Run in development first!
 */

import { mutation, internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../rbac/permissions';
// Id type not needed - removed unused import
import type { MutationCtx } from '../_generated/server';

/**
 * Internal version - can be called with API key (no session required)
 * Use this when running from CLI with: npx convex run admin/cleanupDuplicateRoles:cleanupDuplicateRolesInternal '{}'
 */
export const cleanupDuplicateRolesInternal = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Internal mutations are only callable with API key, so we're already authenticated
		// No need to check permissions - API key access is sufficient
		return await performCleanup(ctx);
	}
});

/**
 * Public version - requires session ID and system admin check
 * Use this when calling from browser/admin UI
 */
export const cleanupDuplicateRoles = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);
		return await performCleanup(ctx);
	}
});

/**
 * Shared cleanup logic
 */
async function performCleanup(ctx: MutationCtx) {
	console.log('🧹 Starting duplicate roles cleanup...');

	// Step 1: Get all roles and group by slug
	const allRoles = await ctx.db.query('roles').collect();
	const rolesBySlug = new Map<string, typeof allRoles>();

	for (const role of allRoles) {
		const existing = rolesBySlug.get(role.slug) || [];
		existing.push(role);
		rolesBySlug.set(role.slug, existing);
	}

	// Step 2: Identify duplicates (groups with more than 1 role)
	const duplicates: Array<{ slug: string; roles: typeof allRoles }> = [];
	for (const [slug, roles] of rolesBySlug.entries()) {
		if (roles.length > 1) {
			duplicates.push({ slug, roles });
		}
	}

	if (duplicates.length === 0) {
		console.log('✅ No duplicate roles found. Database is clean!');
		return {
			success: true,
			duplicatesFound: 0,
			rolesDeleted: 0,
			assignmentsMigrated: 0,
			mappingsMigrated: 0
		};
	}

	console.log(`Found ${duplicates.length} duplicate role groups:`);
	for (const dup of duplicates) {
		console.log(`  - "${dup.slug}": ${dup.roles.length} duplicates`);
	}

	// Step 3: For each duplicate group, keep the most recent and migrate references
	let totalRolesDeleted = 0;
	let totalAssignmentsMigrated = 0;
	let totalMappingsMigrated = 0;

	for (const { slug, roles } of duplicates) {
		// Sort by createdAt descending - keep the most recent
		const sortedRoles = [...roles].sort((a, b) => b.createdAt - a.createdAt);
		const keepRole = sortedRoles[0];
		const deleteRoles = sortedRoles.slice(1);

		console.log(`\n📋 Processing "${slug}":`);
		console.log(
			`  Keeping: ${keepRole._id} (created: ${new Date(keepRole.createdAt).toISOString()})`
		);
		console.log(`  Deleting: ${deleteRoles.length} duplicate(s)`);

		// Step 4: Migrate user-role assignments
		for (const deleteRole of deleteRoles) {
			// Use by_role index which starts with roleId
			const assignments = await ctx.db
				.query('userRoles')
				.withIndex('by_role', (q) => q.eq('roleId', deleteRole._id))
				.collect();

			for (const assignment of assignments) {
				// Check if assignment already exists for the kept role with same scoping
				const allKeptRoleAssignments = await ctx.db
					.query('userRoles')
					.withIndex('by_user_role', (q) =>
						q.eq('userId', assignment.userId).eq('roleId', keepRole._id)
					)
					.collect();

				// Find matching assignment based on scoping
				const existing = allKeptRoleAssignments.find((ur) => {
					if (assignment.organizationId) {
						return ur.organizationId === assignment.organizationId && !ur.circleId;
					}
					if (assignment.circleId) {
						return ur.circleId === assignment.circleId;
					}
					// Global role - no org/circle
					return !ur.organizationId && !ur.circleId;
				});

				if (existing) {
					// Assignment already exists for kept role, just delete the duplicate
					await ctx.db.delete(assignment._id);
					console.log(
						`    Migrated assignment ${assignment._id} → ${existing._id} (already exists)`
					);
				} else {
					// Migrate assignment to kept role
					await ctx.db.patch(assignment._id, {
						roleId: keepRole._id
					});
					console.log(`    Migrated assignment ${assignment._id} → kept role`);
				}
				totalAssignmentsMigrated++;
			}
		}

		// Step 5: Migrate role-permission mappings
		for (const deleteRole of deleteRoles) {
			const mappings = await ctx.db
				.query('rolePermissions')
				.withIndex('by_role', (q) => q.eq('roleId', deleteRole._id))
				.collect();

			for (const mapping of mappings) {
				// Check if mapping already exists for the kept role
				const existing = await ctx.db
					.query('rolePermissions')
					.withIndex('by_role_permission', (q) =>
						q.eq('roleId', keepRole._id).eq('permissionId', mapping.permissionId)
					)
					.first();

				if (existing) {
					// Mapping already exists for kept role, just delete the duplicate
					await ctx.db.delete(mapping._id);
					console.log(`    Migrated mapping ${mapping._id} → ${existing._id} (already exists)`);
				} else {
					// Migrate mapping to kept role
					await ctx.db.patch(mapping._id, {
						roleId: keepRole._id
					});
					console.log(`    Migrated mapping ${mapping._id} → kept role`);
				}
				totalMappingsMigrated++;
			}
		}

		// Step 6: Delete duplicate roles
		for (const deleteRole of deleteRoles) {
			await ctx.db.delete(deleteRole._id);
			totalRolesDeleted++;
			console.log(`  ✅ Deleted duplicate role: ${deleteRole._id}`);
		}
	}

	console.log('\n🎉 Cleanup complete!');
	console.log(`  Roles deleted: ${totalRolesDeleted}`);
	console.log(`  Assignments migrated: ${totalAssignmentsMigrated}`);
	console.log(`  Mappings migrated: ${totalMappingsMigrated}`);

	return {
		success: true,
		duplicatesFound: duplicates.length,
		rolesDeleted: totalRolesDeleted,
		assignmentsMigrated: totalAssignmentsMigrated,
		mappingsMigrated: totalMappingsMigrated
	};
}
