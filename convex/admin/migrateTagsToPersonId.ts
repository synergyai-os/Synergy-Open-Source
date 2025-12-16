/**
 * Migration: Backfill tags.personId and workspaceId from legacy userId tags.
 *
 * Run with:
 *   npx convex run admin/migrateTagsToPersonId:migrateTagsToPersonId
 */

import { internalMutation } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

type TagDoc = Doc<'tags'> & { userId?: Id<'users'> };

async function findWorkspaceForUser(ctx: MutationCtx, userId: Id<'users'>) {
	const people = await ctx.db
		.query('people')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	const active = people.filter((p) => p.status !== 'archived');

	if (active.length === 1) return active[0].workspaceId;

	if (active.length === 0) {
		throw new Error(`No active people for user ${userId}`);
	}

	// Ambiguous active people
	const workspaces = active.map((p) => p.workspaceId).join(', ');
	throw new Error(`Multiple active workspaces for user ${userId}: [${workspaces}]`);
}

async function ensurePersonForWorkspace(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId?: Id<'users'>
) {
	// 1) Person linked to this user/workspace
	if (userId) {
		const personByUser = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
			.first();
		if (personByUser) return personByUser;
	}

	// 2) Any active person in workspace
	const activePerson = await ctx.db
		.query('people')
		.withIndex('by_workspace_status', (q) =>
			q.eq('workspaceId', workspaceId).eq('status', 'active')
		)
		.first();
	if (activePerson) return activePerson;

	throw new Error(`No active person found for workspace ${workspaceId}.`);
}

export const migrateTagsToPersonId = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: tags.userId -> tags.personId');

		const tags = (await ctx.db.query('tags').collect()) as TagDoc[];
		let updated = 0;
		let skipped = 0;
		let errors = 0;

		for (const tag of tags) {
			try {
				if (tag.personId && tag.workspaceId) {
					skipped++;
					continue;
				}

				const legacyUserId = tag.userId;
				let workspaceId = tag.workspaceId;

				// Resolve workspace
				if (!workspaceId) {
					if (!legacyUserId) {
						throw new Error(`Tag ${tag._id} missing workspaceId and legacy userId`);
					}
					workspaceId = await findWorkspaceForUser(ctx, legacyUserId);
				}

				// Resolve person
				const person = await ensurePersonForWorkspace(ctx, workspaceId, legacyUserId);

				// Circle ownership consistency
				if (tag.circleId) {
					const circle = await ctx.db.get(tag.circleId);
					if (!circle) {
						throw new Error(`Circle ${tag.circleId} not found for tag ${tag._id}`);
					}
					if (circle.workspaceId !== workspaceId) {
						throw new Error(
							`Workspace mismatch for tag ${tag._id}: circle.workspaceId=${circle.workspaceId}, tag.workspaceId=${workspaceId}`
						);
					}
				}

				await ctx.db.patch(tag._id, {
					personId: person._id,
					workspaceId
				});

				updated++;
			} catch (error) {
				errors++;
				console.error(`❌ Failed to migrate tag ${tag._id}:`, error);
			}
		}

		console.log('✅ Migration complete.');
		console.log(`- Updated: ${updated}`);
		console.log(`- Skipped (already migrated): ${skipped}`);
		console.log(`- Errors: ${errors}`);
		console.log(`- Total processed: ${tags.length}`);

		return { updated, skipped, errors, total: tags.length };
	}
});
