/**
 * Migration: Backfill Version History for Existing Entities
 *
 * This migration creates initial version history records for all existing
 * org chart entities (circles, roles, assignments, members, categories, items).
 *
 * Run with: npx convex run admin/migrateVersionHistory:migrateVersionHistory
 */

import { internalMutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

/**
 * Helper function to get workspace owner (first owner/admin member)
 * Used as fallback for changedBy when creator is unknown
 */
async function getWorkspaceOwner(
	ctx: { db: { query: (table: string) => any } },
	workspaceId: Id<'workspaces'>
): Promise<Id<'users'> | null> {
	const members = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	// Find first owner or admin
	const owner = members.find((m) => m.role === 'owner' || m.role === 'admin');
	if (owner) {
		return owner.userId;
	}

	// Fallback to first member
	if (members.length > 0) {
		return members[0].userId;
	}

	return null;
}

/**
 * Helper function to get any user ID (for system operations)
 */
async function getAnyUserId(ctx: {
	db: { query: (table: string) => any };
}): Promise<Id<'users'> | null> {
	const user = await ctx.db.query('users').first();
	return user?._id ?? null;
}

/**
 * Backfill version history for all existing org chart entities
 * This is idempotent - safe to run multiple times (checks for existing history)
 */
export const migrateVersionHistory = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Version History Backfill');
		console.log('  Creating initial version history records for existing entities\n');

		// Get a fallback user ID for system operations
		const systemUserId = await getAnyUserId(ctx);
		if (!systemUserId) {
			throw new Error('No users found in database. Cannot create version history.');
		}

		let circlesCreated = 0;
		let rolesCreated = 0;
		let assignmentsCreated = 0;
		let membersCreated = 0;
		let categoriesCreated = 0;
		let itemsCreated = 0;
		let skipped = 0;

		// ============================================================================
		// STEP 1: Circles
		// ============================================================================
		console.log('🔍 Step 1: Backfilling circles...');
		const circles = await ctx.db.query('circles').collect();

		for (const circle of circles) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) => q.eq('entityType', 'circle').eq('entityId', circle._id))
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get changedBy (use updatedBy, or workspace owner, or system user)
			let changedBy = circle.updatedBy;
			if (!changedBy) {
				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId;
			}

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'circle',
				workspaceId: circle.workspaceId,
				entityId: circle._id,
				changeType: 'create',
				changedBy,
				changedAt: circle.createdAt || Date.now(),
				before: undefined,
				after: {
					name: circle.name,
					slug: circle.slug,
					purpose: circle.purpose,
					parentCircleId: circle.parentCircleId,
					archivedAt: circle.archivedAt
				}
			});

			circlesCreated++;
		}

		console.log(`✅ Created ${circlesCreated} circle history records (${skipped} skipped)`);

		// ============================================================================
		// STEP 2: Circle Roles
		// ============================================================================
		console.log('🔍 Step 2: Backfilling circle roles...');
		const roles = await ctx.db.query('circleRoles').collect();
		skipped = 0;

		for (const role of roles) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) => q.eq('entityType', 'circleRole').eq('entityId', role._id))
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get circle to find workspaceId
			const circle = await ctx.db.get(role.circleId);
			if (!circle) {
				console.log(`⚠️  Circle ${role.circleId} not found for role ${role._id}, skipping...`);
				skipped++;
				continue;
			}

			// Get changedBy
			let changedBy = role.updatedBy;
			if (!changedBy) {
				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId;
			}

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'circleRole',
				workspaceId: circle.workspaceId,
				entityId: role._id,
				changeType: 'create',
				changedBy,
				changedAt: role.createdAt || Date.now(),
				before: undefined,
				after: {
					circleId: role.circleId,
					name: role.name,
					purpose: role.purpose,
					templateId: role.templateId,
					archivedAt: role.archivedAt
				}
			});

			rolesCreated++;
		}

		console.log(`✅ Created ${rolesCreated} role history records (${skipped} skipped)`);

		// ============================================================================
		// STEP 3: User Circle Roles (Assignments)
		// ============================================================================
		console.log('🔍 Step 3: Backfilling user circle role assignments...');
		const assignments = await ctx.db.query('userCircleRoles').collect();
		skipped = 0;

		for (const assignment of assignments) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) =>
					q.eq('entityType', 'userCircleRole').eq('entityId', assignment._id)
				)
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get role to find circle, then workspaceId
			const role = await ctx.db.get(assignment.circleRoleId);
			if (!role) {
				console.log(
					`⚠️  Role ${assignment.circleRoleId} not found for assignment ${assignment._id}, skipping...`
				);
				skipped++;
				continue;
			}

			const circle = await ctx.db.get(role.circleId);
			if (!circle) {
				console.log(`⚠️  Circle ${role.circleId} not found, skipping...`);
				skipped++;
				continue;
			}

			// Get changedBy (use assignedBy)
			const changedBy = assignment.assignedBy;

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'userCircleRole',
				workspaceId: circle.workspaceId,
				entityId: assignment._id,
				changeType: 'create',
				changedBy,
				changedAt: assignment.assignedAt || Date.now(),
				before: undefined,
				after: {
					userId: assignment.userId,
					circleRoleId: assignment.circleRoleId,
					scope: undefined, // Scope field not yet implemented in assignments
					archivedAt: assignment.archivedAt
				}
			});

			assignmentsCreated++;
		}

		console.log(`✅ Created ${assignmentsCreated} assignment history records (${skipped} skipped)`);

		// ============================================================================
		// STEP 4: Circle Members
		// ============================================================================
		console.log('🔍 Step 4: Backfilling circle members...');
		const members = await ctx.db.query('circleMembers').collect();
		skipped = 0;

		for (const member of members) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) =>
					q.eq('entityType', 'circleMember').eq('entityId', member._id)
				)
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get circle to find workspaceId
			const circle = await ctx.db.get(member.circleId);
			if (!circle) {
				console.log(
					`⚠️  Circle ${member.circleId} not found for member ${member._id}, skipping...`
				);
				skipped++;
				continue;
			}

			// Get changedBy (use addedBy, or workspace owner, or system user)
			let changedBy = member.addedBy;
			if (!changedBy) {
				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId;
			}

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'circleMember',
				workspaceId: circle.workspaceId,
				entityId: member._id,
				changeType: 'create',
				changedBy,
				changedAt: member.joinedAt || Date.now(),
				before: undefined,
				after: {
					circleId: member.circleId,
					userId: member.userId,
					archivedAt: member.archivedAt
				}
			});

			membersCreated++;
		}

		console.log(`✅ Created ${membersCreated} member history records (${skipped} skipped)`);

		// ============================================================================
		// STEP 5: Circle Item Categories
		// ============================================================================
		console.log('🔍 Step 5: Backfilling circle item categories...');
		const categories = await ctx.db.query('circleItemCategories').collect();
		skipped = 0;

		for (const category of categories) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) =>
					q.eq('entityType', 'circleItemCategory').eq('entityId', category._id)
				)
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get changedBy (use createdBy, or workspace owner, or system user)
			let changedBy = category.createdBy;
			if (!changedBy) {
				changedBy = (await getWorkspaceOwner(ctx, category.workspaceId)) ?? systemUserId;
			}

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'circleItemCategory',
				workspaceId: category.workspaceId,
				entityId: category._id,
				changeType: 'create',
				changedBy,
				changedAt: category.createdAt || Date.now(),
				before: undefined,
				after: {
					workspaceId: category.workspaceId,
					entityType: category.entityType,
					name: category.name,
					order: category.order,
					isDefault: category.isDefault,
					archivedAt: category.archivedAt
				}
			});

			categoriesCreated++;
		}

		console.log(`✅ Created ${categoriesCreated} category history records (${skipped} skipped)`);

		// ============================================================================
		// STEP 6: Circle Items
		// ============================================================================
		console.log('🔍 Step 6: Backfilling circle items...');
		const items = await ctx.db.query('circleItems').collect();
		skipped = 0;

		for (const item of items) {
			// Check if history already exists
			const existing = await ctx.db
				.query('orgVersionHistory')
				.withIndex('by_entity', (q) => q.eq('entityType', 'circleItem').eq('entityId', item._id))
				.first();

			if (existing) {
				skipped++;
				continue;
			}

			// Get changedBy (use createdBy, or workspace owner, or system user)
			let changedBy = item.createdBy;
			if (!changedBy) {
				changedBy = (await getWorkspaceOwner(ctx, item.workspaceId)) ?? systemUserId;
			}

			await ctx.db.insert('orgVersionHistory', {
				entityType: 'circleItem',
				workspaceId: item.workspaceId,
				entityId: item._id,
				changeType: 'create',
				changedBy,
				changedAt: item.createdAt || Date.now(),
				before: undefined,
				after: {
					categoryId: item.categoryId,
					entityType: item.entityType,
					entityId: item.entityId,
					content: item.content,
					order: item.order,
					archivedAt: item.archivedAt
				}
			});

			itemsCreated++;
		}

		console.log(`✅ Created ${itemsCreated} item history records (${skipped} skipped)`);

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n✅ Migration complete!');
		console.log(`- Circle history records: ${circlesCreated}`);
		console.log(`- Role history records: ${rolesCreated}`);
		console.log(`- Assignment history records: ${assignmentsCreated}`);
		console.log(`- Member history records: ${membersCreated}`);
		console.log(`- Category history records: ${categoriesCreated}`);
		console.log(`- Item history records: ${itemsCreated}`);

		return {
			success: true,
			circlesCreated,
			rolesCreated,
			assignmentsCreated,
			membersCreated,
			categoriesCreated,
			itemsCreated
		};
	}
});
