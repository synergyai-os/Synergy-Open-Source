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

	// Fallback: look at workspace membership records
	const memberships = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	if (memberships.length === 1) return memberships[0].workspaceId;

	if (active.length === 0 && memberships.length > 1) {
		const workspaces = memberships.map((m) => m.workspaceId).join(', ');
		throw new Error(`Ambiguous workspace for user ${userId} from memberships: [${workspaces}]`);
	}

	if (active.length === 0 && memberships.length === 0) {
		throw new Error(`No active people or workspace memberships for user ${userId}`);
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

	// 3) Try to create a person from workspace membership + user record
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.first();
	if (!membership) {
		throw new Error(`No active person found and no workspace members for workspace ${workspaceId}`);
	}
	const memberUserId = membership.userId;
	const user = await ctx.db.get(memberUserId);
	if (!user) {
		throw new Error(`Workspace member user ${memberUserId} not found for workspace ${workspaceId}`);
	}

	const now = Date.now();
	const displayName = (user as any).name ?? (user as any).email ?? `user-${memberUserId}`;
	const email = (user as any).email ?? `user-${memberUserId}@example.invalid`;

	const newPersonId = await ctx.db.insert('people', {
		workspaceId,
		userId: memberUserId,
		email,
		displayName,
		workspaceRole: membership.role ?? 'member',
		status: 'active',
		invitedAt: now,
		invitedBy: undefined,
		joinedAt: now,
		archivedAt: undefined,
		archivedBy: undefined
	});

	const newPerson = await ctx.db.get(newPersonId);
	if (!newPerson) {
		throw new Error(
			`Failed to create person for workspace ${workspaceId} from membership ${membership._id}`
		);
	}
	return newPerson;
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
