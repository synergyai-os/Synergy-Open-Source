/**
 * Fix Invariant Violations (SYOS-806)
 *
 * This migration script fixes all critical invariant violations found during
 * the initial invariants run. Safe to run multiple times (idempotent).
 *
 * Run with: npx convex run admin/fixInvariantViolations:fixAll
 *
 * Individual fixes can be run separately:
 * - fixStatusEnums: Fix ORG-07 (circle status) and ROLE-04 (role status)
 * - fixOrphanedCircleMembers: Fix CMEM-01, CMEM-02
 * - fixProposalTimestamps: Fix PROP-05
 * - fixHistoryPersonIds: Fix HIST-01
 *
 * Note: Legacy UCROLE-* fixes removed after SYOS-815 migration
 */

import { internalMutation, internalQuery } from '../_generated/server';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the first person in a workspace (fallback for missing changedByPersonId)
 */
async function findWorkspaceOwnerPerson(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Id<'people'> | null> {
	// First try to find owner
	const owner = await ctx.db
		.query('people')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('workspaceRole'), 'owner'))
		.first();

	if (owner) return owner._id;

	// Fallback to any active person in the workspace
	const anyPerson = await ctx.db
		.query('people')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	return anyPerson?._id ?? null;
}

// =============================================================================
// FIX: ORG-07 (Circle status) and ROLE-04 (Role status)
// =============================================================================

export const fixStatusEnums = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing status enum violations (ORG-07, ROLE-04)...\n');

		let circlesFixed = 0;
		let rolesFixed = 0;

		// Fix circles with invalid status (null/undefined → 'active')
		const circles = await ctx.db.query('circles').collect();
		for (const circle of circles) {
			const status = circle.status as string | undefined;
			if (status !== 'draft' && status !== 'active') {
				// Archived circles should be 'active' (archival is separate from status)
				// Draft is only for newly created circles that haven't been activated
				const newStatus = circle.archivedAt ? 'active' : 'active';
				await ctx.db.patch(circle._id, { status: newStatus });
				circlesFixed++;
				console.log(`  Fixed circle ${circle._id} (${circle.name}): status → '${newStatus}'`);
			}
		}

		// Fix roles with invalid status (null/undefined → 'active')
		const roles = await ctx.db.query('circleRoles').collect();
		for (const role of roles) {
			const status = role.status as string | undefined;
			if (status !== 'draft' && status !== 'active') {
				const newStatus = role.archivedAt ? 'active' : 'active';
				await ctx.db.patch(role._id, { status: newStatus });
				rolesFixed++;
				console.log(`  Fixed role ${role._id} (${role.name}): status → '${newStatus}'`);
			}
		}

		console.log(`\n✅ Fixed ${circlesFixed} circles and ${rolesFixed} roles`);
		return { circlesFixed, rolesFixed };
	}
});

// =============================================================================
// FIX: CMEM-01, CMEM-02 (Orphaned circle members)
// =============================================================================

export const fixOrphanedCircleMembers = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing orphaned circle members (CMEM-01, CMEM-02)...\n');

		const circleMembers = await ctx.db.query('circleMembers').collect();
		const circles = await ctx.db.query('circles').collect();
		const people = await ctx.db.query('people').collect();

		const circleIds = new Set(circles.map((c) => c._id.toString()));
		const personIds = new Set(people.map((p) => p._id.toString()));

		let deletedForMissingCircle = 0;
		let deletedForMissingPerson = 0;

		for (const member of circleMembers) {
			const hasCircle = member.circleId && circleIds.has(member.circleId.toString());
			const hasPerson = member.personId && personIds.has(member.personId.toString());

			if (!hasCircle || !hasPerson) {
				// Delete orphaned membership record
				await ctx.db.delete(member._id);

				if (!hasCircle) {
					deletedForMissingCircle++;
					console.log(`  Deleted circleMember ${member._id}: missing circle ${member.circleId}`);
				}
				if (!hasPerson) {
					deletedForMissingPerson++;
					console.log(`  Deleted circleMember ${member._id}: missing person ${member.personId}`);
				}
			}
		}

		console.log(
			`\n✅ Deleted ${deletedForMissingCircle} for missing circles, ${deletedForMissingPerson} for missing people`
		);
		return { deletedForMissingCircle, deletedForMissingPerson };
	}
});

// =============================================================================
// REMOVED: UCROLE-01, UCROLE-02 fixes (SYOS-815: userCircleRoles table deleted)
// =============================================================================

// =============================================================================
// FIX: PROP-05 (Proposals missing submittedAt)
// =============================================================================

export const fixProposalTimestamps = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing proposal timestamps (PROP-05)...\n');

		const proposals = await ctx.db.query('circleProposals').collect();
		let fixed = 0;

		for (const proposal of proposals) {
			// Non-draft proposals should have submittedAt
			if (proposal.status !== 'draft' && !proposal.submittedAt) {
				// Use createdAt as fallback for submittedAt
				await ctx.db.patch(proposal._id, {
					submittedAt: proposal._creationTime
				});
				fixed++;
				console.log(
					`  Fixed proposal ${proposal._id} (${proposal.title}): submittedAt → ${proposal._creationTime}`
				);
			}
		}

		console.log(`\n✅ Fixed ${fixed} proposals with missing submittedAt`);
		return { fixed };
	}
});

// =============================================================================
// FIX: HIST-01 (History records missing changedByPersonId)
// =============================================================================

export const fixHistoryPersonIds = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing history records missing changedByPersonId (HIST-01)...\n');

		const history = await ctx.db.query('orgVersionHistory').collect();
		let fixed = 0;
		let skipped = 0;

		// Cache workspace owners for efficiency
		const workspaceOwnerCache = new Map<string, Id<'people'> | null>();

		for (const entry of history) {
			if (entry.changedByPersonId) continue; // Already has personId

			// Try to find a person to attribute this to
			let personId: Id<'people'> | null = null;

			// Check cache first
			const workspaceKey = entry.workspaceId.toString();
			if (workspaceOwnerCache.has(workspaceKey)) {
				personId = workspaceOwnerCache.get(workspaceKey) ?? null;
			} else {
				personId = await findWorkspaceOwnerPerson(ctx, entry.workspaceId);
				workspaceOwnerCache.set(workspaceKey, personId);
			}

			if (personId) {
				await ctx.db.patch(entry._id, { changedByPersonId: personId });
				fixed++;
			} else {
				// No person found for this workspace - skip
				skipped++;
				console.log(
					`  Skipped history ${entry._id}: no person found for workspace ${entry.workspaceId}`
				);
			}
		}

		console.log(`\n✅ Fixed ${fixed} history records, skipped ${skipped}`);
		return { fixed, skipped };
	}
});

// =============================================================================
// FIX: XDOM-01 (circleItemCategories still using userId)
// =============================================================================

export const fixCircleItemCategoryUserIds = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing circleItemCategories userId references (XDOM-01)...\n');

		const categories = await ctx.db.query('circleItemCategories').collect();
		let fixed = 0;

		// Build user → person map
		const people = await ctx.db.query('people').collect();
		const userToPersonMap = new Map<string, Id<'people'>>();
		for (const person of people) {
			if (person.userId) {
				// Prefer active persons
				const existing = userToPersonMap.get(person.userId.toString());
				if (!existing || person.status === 'active') {
					userToPersonMap.set(person.userId.toString(), person._id);
				}
			}
		}

		// Cache workspace owners
		const workspaceOwnerCache = new Map<string, Id<'people'> | null>();

		for (const category of categories) {
			// Cast to any to access legacy fields
			const legacyCategory = category as typeof category & {
				createdBy?: Id<'users'>;
				updatedBy?: Id<'users'>;
				archivedBy?: Id<'users'>;
			};

			if (!legacyCategory.createdBy && !legacyCategory.updatedBy && !legacyCategory.archivedBy) {
				continue; // No legacy fields
			}

			// Migrate createdBy → createdByPersonId
			let createdByPersonId = category.createdByPersonId;
			if (!createdByPersonId && legacyCategory.createdBy) {
				createdByPersonId = userToPersonMap.get(legacyCategory.createdBy.toString());
				if (!createdByPersonId) {
					const wsKey = category.workspaceId.toString();
					if (!workspaceOwnerCache.has(wsKey)) {
						workspaceOwnerCache.set(
							wsKey,
							await findWorkspaceOwnerPerson(ctx, category.workspaceId)
						);
					}
					createdByPersonId = workspaceOwnerCache.get(wsKey) ?? undefined;
				}
			}

			// Clear legacy fields and set new ones
			await ctx.db.patch(category._id, {
				createdByPersonId,
				// Clear legacy fields by setting them to undefined
				createdBy: undefined,
				updatedBy: undefined,
				archivedBy: undefined
			} as Record<string, unknown>);

			fixed++;
			console.log(`  Migrated category ${category._id} (${category.name})`);
		}

		console.log(`\n✅ Fixed ${fixed} circleItemCategories`);
		return { fixed };
	}
});

// =============================================================================
// FIX: WS-02 (Workspaces without owners)
// =============================================================================

export const reportWorkspacesWithoutOwners = internalQuery({
	args: {},
	handler: async (ctx) => {
		console.log('📋 Reporting workspaces without owners (WS-02)...\n');

		const workspaces = await ctx.db.query('workspaces').collect();
		const people = await ctx.db.query('people').collect();

		const workspaceOwners = new Map<string, boolean>();
		for (const person of people) {
			if (person.status === 'active' && person.workspaceRole === 'owner') {
				workspaceOwners.set(person.workspaceId.toString(), true);
			}
		}

		const workspacesWithoutOwners = workspaces.filter(
			(ws) => !workspaceOwners.has(ws._id.toString())
		);

		console.log(`Found ${workspacesWithoutOwners.length} workspaces without owners:\n`);
		for (const ws of workspacesWithoutOwners) {
			const peopleInWs = people.filter((p) => p.workspaceId.toString() === ws._id.toString());
			console.log(`  - ${ws.name} (${ws._id}): ${peopleInWs.length} people`);
		}

		return {
			total: workspacesWithoutOwners.length,
			workspaces: workspacesWithoutOwners.map((ws) => ({
				id: ws._id,
				name: ws.name,
				slug: ws.slug
			}))
		};
	}
});

// =============================================================================
// REMOVED: UCROLE-01 null personId fix (SYOS-815: userCircleRoles table deleted)
// =============================================================================

// =============================================================================
// FIX: XDOM-01 (meetings still using userId)
// =============================================================================

export const fixMeetingUserIds = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing meetings userId references (XDOM-01)...\n');

		const meetings = await ctx.db.query('meetings').collect();
		const people = await ctx.db.query('people').collect();

		// Build user → person map
		const userToPersonMap = new Map<string, Id<'people'>>();
		for (const person of people) {
			if (person.userId) {
				const existing = userToPersonMap.get(person.userId.toString());
				if (!existing || person.status === 'active') {
					userToPersonMap.set(person.userId.toString(), person._id);
				}
			}
		}

		const workspaceOwnerCache = new Map<string, Id<'people'> | null>();
		let fixed = 0;

		for (const meeting of meetings) {
			// Check if meeting has createdBy but not createdByPersonId
			if (meeting.createdBy && !meeting.createdByPersonId) {
				let createdByPersonId = userToPersonMap.get(meeting.createdBy.toString());

				if (!createdByPersonId && meeting.workspaceId) {
					const wsKey = meeting.workspaceId.toString();
					if (!workspaceOwnerCache.has(wsKey)) {
						workspaceOwnerCache.set(
							wsKey,
							await findWorkspaceOwnerPerson(ctx, meeting.workspaceId)
						);
					}
					createdByPersonId = workspaceOwnerCache.get(wsKey) ?? undefined;
				}

				if (createdByPersonId) {
					await ctx.db.patch(meeting._id, { createdByPersonId });
					fixed++;
					console.log(`  Migrated meeting ${meeting._id}`);
				}
			}
		}

		console.log(`\n✅ Fixed ${fixed} meetings`);
		return { fixed };
	}
});

// =============================================================================
// FIX: XDOM-05 (circleItems still using userId)
// =============================================================================

export const fixCircleItemUserIds = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔧 Fixing circleItems userId references (XDOM-05)...\n');

		const items = await ctx.db.query('circleItems').collect();
		const people = await ctx.db.query('people').collect();

		// Build user → person map
		const userToPersonMap = new Map<string, Id<'people'>>();
		for (const person of people) {
			if (person.userId) {
				const existing = userToPersonMap.get(person.userId.toString());
				if (!existing || person.status === 'active') {
					userToPersonMap.set(person.userId.toString(), person._id);
				}
			}
		}

		const workspaceOwnerCache = new Map<string, Id<'people'> | null>();
		let fixed = 0;

		for (const item of items) {
			const legacyItem = item as typeof item & {
				createdBy?: Id<'users'>;
				updatedBy?: Id<'users'>;
				archivedBy?: Id<'users'>;
			};

			if (!legacyItem.createdBy && !legacyItem.updatedBy && !legacyItem.archivedBy) {
				continue;
			}

			// Migrate createdBy → createdByPersonId
			let createdByPersonId = item.createdByPersonId;
			if (!createdByPersonId && legacyItem.createdBy) {
				createdByPersonId = userToPersonMap.get(legacyItem.createdBy.toString());
				if (!createdByPersonId) {
					const wsKey = item.workspaceId.toString();
					if (!workspaceOwnerCache.has(wsKey)) {
						workspaceOwnerCache.set(wsKey, await findWorkspaceOwnerPerson(ctx, item.workspaceId));
					}
					createdByPersonId = workspaceOwnerCache.get(wsKey) ?? undefined;
				}
			}

			await ctx.db.patch(item._id, {
				createdByPersonId,
				createdBy: undefined,
				updatedBy: undefined,
				archivedBy: undefined
			} as Record<string, unknown>);

			fixed++;
			console.log(`  Migrated circleItem ${item._id}`);
		}

		console.log(`\n✅ Fixed ${fixed} circleItems`);
		return { fixed };
	}
});

// =============================================================================
// REPORT/ARCHIVE: Abandoned workspaces (WS-01, WS-02, AUTH-01, AUTH-02, HIST-01)
// =============================================================================

/**
 * These workspaces have no active people and cannot be properly managed.
 * Options:
 * 1. Archive them (soft-delete circles, roles, etc.)
 * 2. Leave them as known violations with documented exceptions
 *
 * This function reports them for manual review.
 */
export const reportAbandonedWorkspaces = internalQuery({
	args: {},
	handler: async (ctx) => {
		console.log('📋 Reporting abandoned workspaces...\n');

		const workspaces = await ctx.db.query('workspaces').collect();
		const people = await ctx.db.query('people').collect();
		const circles = await ctx.db.query('circles').collect();
		const history = await ctx.db.query('orgVersionHistory').collect();

		// Find workspaces without active people
		const workspaceHasActivePeople = new Map<string, boolean>();
		for (const person of people) {
			if (person.status === 'active') {
				workspaceHasActivePeople.set(person.workspaceId.toString(), true);
			}
		}

		const abandonedWorkspaces = workspaces.filter(
			(ws) => !workspaceHasActivePeople.has(ws._id.toString())
		);

		console.log(`Found ${abandonedWorkspaces.length} abandoned workspaces:\n`);

		const report = [];
		for (const ws of abandonedWorkspaces) {
			const wsCircles = circles.filter((c) => c.workspaceId.toString() === ws._id.toString());
			const wsHistory = history.filter((h) => h.workspaceId.toString() === ws._id.toString());
			const wsPeople = people.filter((p) => p.workspaceId.toString() === ws._id.toString());

			const wsInfo = {
				id: ws._id,
				name: ws.name,
				slug: ws.slug,
				circleCount: wsCircles.length,
				historyCount: wsHistory.length,
				peopleCount: wsPeople.length,
				hasAnyPeople: wsPeople.length > 0
			};

			console.log(
				`  - ${ws.name} (${ws.slug}): ${wsCircles.length} circles, ${wsHistory.length} history, ${wsPeople.length} people`
			);
			report.push(wsInfo);
		}

		return {
			abandonedCount: abandonedWorkspaces.length,
			workspaces: report
		};
	}
});

/**
 * Archive abandoned workspaces by setting archivedAt on all their entities.
 * This will remove them from active counts but preserve data.
 */
export const archiveAbandonedWorkspaces = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🗃️ Archiving abandoned workspaces...\n');

		const workspaces = await ctx.db.query('workspaces').collect();
		const people = await ctx.db.query('people').collect();

		// Find workspaces without active people
		const workspaceHasActivePeople = new Map<string, boolean>();
		for (const person of people) {
			if (person.status === 'active' && person.workspaceId) {
				workspaceHasActivePeople.set(person.workspaceId.toString(), true);
			}
		}

		const abandonedWorkspaceIds = new Set(
			workspaces
				.filter((ws) => !workspaceHasActivePeople.has(ws._id.toString()))
				.map((ws) => ws._id.toString())
		);

		const now = Date.now();
		let circlesArchived = 0;
		let rolesArchived = 0;

		// Archive circles in abandoned workspaces
		const circles = await ctx.db.query('circles').collect();
		for (const circle of circles) {
			if (!circle.workspaceId) continue;
			if (abandonedWorkspaceIds.has(circle.workspaceId.toString()) && !circle.archivedAt) {
				await ctx.db.patch(circle._id, { archivedAt: now, status: 'active' });
				circlesArchived++;
			}
		}

		// Archive roles in abandoned workspaces
		const roles = await ctx.db.query('circleRoles').collect();
		for (const role of roles) {
			if (!role.workspaceId) continue;
			if (abandonedWorkspaceIds.has(role.workspaceId.toString()) && !role.archivedAt) {
				await ctx.db.patch(role._id, { archivedAt: now, status: 'active' });
				rolesArchived++;
			}
		}

		console.log(`✅ Archived ${circlesArchived} circles, ${rolesArchived} roles`);
		console.log(`   in ${abandonedWorkspaceIds.size} abandoned workspaces`);

		return {
			workspaceCount: abandonedWorkspaceIds.size,
			circlesArchived,
			rolesArchived
		};
	}
});

// =============================================================================
// FIX ALL
// =============================================================================

export const fixAll = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🚀 Running all invariant violation fixes...\n');
		console.log('═'.repeat(60));

		// 1. Fix status enums first (most important for system stability)
		console.log('\n📌 Step 1: Fixing status enums...');
		const statusResult = await fixStatusEnumsHandler(ctx);

		// 2. Fix orphaned circle members
		console.log('\n📌 Step 2: Fixing orphaned circle members...');
		const circleMemberResult = await fixOrphanedCircleMembersHandler(ctx);

		// Step 3 removed: Legacy assignments (SYOS-815: userCircleRoles table deleted)

		// 3. Fix proposal timestamps
		console.log('\n📌 Step 3: Fixing proposal timestamps...');
		const proposalResult = await fixProposalTimestampsHandler(ctx);

		// 4. Fix history personIds
		console.log('\n📌 Step 4: Fixing history personIds...');
		const historyResult = await fixHistoryPersonIdsHandler(ctx);

		// 5. Fix circleItemCategory userIds
		console.log('\n📌 Step 5: Fixing circleItemCategory userIds...');
		const categoryResult = await fixCircleItemCategoryUserIdsHandler(ctx);

		// 6. Fix circleItem userIds
		console.log('\n📌 Step 6: Fixing circleItem userIds...');
		const circleItemResult = await fixCircleItemUserIdsHandler(ctx);

		// 7. Archive abandoned workspaces (makes AUTH and WS invariants pass)
		console.log('\n📌 Step 7: Archiving abandoned workspaces...');
		const archiveResult = await archiveAbandonedWorkspacesHandler(ctx);

		console.log('\n' + '═'.repeat(60));
		console.log('✅ All fixes complete!\n');

		return {
			statusEnums: statusResult,
			circleMemberOrphans: circleMemberResult,
			proposalTimestamps: proposalResult,
			historyPersonIds: historyResult,
			circleItemCategories: categoryResult,
			circleItems: circleItemResult,
			archivedWorkspaces: archiveResult
		};
	}
});

// Handler functions (extracted for reuse in fixAll)
async function fixStatusEnumsHandler(ctx: MutationCtx) {
	let circlesFixed = 0;
	let rolesFixed = 0;

	const circles = await ctx.db.query('circles').collect();
	for (const circle of circles) {
		const status = circle.status as string | undefined;
		if (status !== 'draft' && status !== 'active') {
			await ctx.db.patch(circle._id, { status: 'active' });
			circlesFixed++;
		}
	}

	const roles = await ctx.db.query('circleRoles').collect();
	for (const role of roles) {
		const status = role.status as string | undefined;
		if (status !== 'draft' && status !== 'active') {
			await ctx.db.patch(role._id, { status: 'active' });
			rolesFixed++;
		}
	}

	console.log(`  Fixed ${circlesFixed} circles, ${rolesFixed} roles`);
	return { circlesFixed, rolesFixed };
}

async function fixOrphanedCircleMembersHandler(ctx: MutationCtx) {
	const circleMembers = await ctx.db.query('circleMembers').collect();
	const circles = await ctx.db.query('circles').collect();
	const people = await ctx.db.query('people').collect();

	const circleIds = new Set(circles.map((c) => c._id.toString()));
	const personIds = new Set(people.map((p) => p._id.toString()));

	let deleted = 0;
	for (const member of circleMembers) {
		const hasCircle = member.circleId && circleIds.has(member.circleId.toString());
		const hasPerson = member.personId && personIds.has(member.personId.toString());
		if (!hasCircle || !hasPerson) {
			await ctx.db.delete(member._id);
			deleted++;
		}
	}

	console.log(`  Deleted ${deleted} orphaned circle members`);
	return { deleted };
}

// fixOrphanedLegacyAssignmentsHandler removed (SYOS-815: userCircleRoles table deleted)

async function fixProposalTimestampsHandler(ctx: MutationCtx) {
	const proposals = await ctx.db.query('circleProposals').collect();
	let fixed = 0;

	for (const proposal of proposals) {
		if (proposal.status !== 'draft' && !proposal.submittedAt) {
			await ctx.db.patch(proposal._id, { submittedAt: proposal._creationTime });
			fixed++;
		}
	}

	console.log(`  Fixed ${fixed} proposals with missing submittedAt`);
	return { fixed };
}

async function fixHistoryPersonIdsHandler(ctx: MutationCtx) {
	const history = await ctx.db.query('orgVersionHistory').collect();
	const workspaceOwnerCache = new Map<string, Id<'people'> | null>();
	let fixed = 0;
	let skipped = 0;

	for (const entry of history) {
		if (entry.changedByPersonId) continue;

		const wsKey = entry.workspaceId.toString();
		if (!workspaceOwnerCache.has(wsKey)) {
			workspaceOwnerCache.set(wsKey, await findWorkspaceOwnerPerson(ctx, entry.workspaceId));
		}

		const personId = workspaceOwnerCache.get(wsKey);
		if (personId) {
			await ctx.db.patch(entry._id, { changedByPersonId: personId });
			fixed++;
		} else {
			skipped++;
		}
	}

	console.log(`  Fixed ${fixed} history records, skipped ${skipped}`);
	return { fixed, skipped };
}

async function fixCircleItemCategoryUserIdsHandler(ctx: MutationCtx) {
	const categories = await ctx.db.query('circleItemCategories').collect();
	const people = await ctx.db.query('people').collect();

	const userToPersonMap = new Map<string, Id<'people'>>();
	for (const person of people) {
		if (person.userId) {
			const existing = userToPersonMap.get(person.userId.toString());
			if (!existing || person.status === 'active') {
				userToPersonMap.set(person.userId.toString(), person._id);
			}
		}
	}

	const workspaceOwnerCache = new Map<string, Id<'people'> | null>();
	let fixed = 0;

	for (const category of categories) {
		const legacyCategory = category as typeof category & {
			createdBy?: Id<'users'>;
			updatedBy?: Id<'users'>;
			archivedBy?: Id<'users'>;
		};

		if (!legacyCategory.createdBy && !legacyCategory.updatedBy && !legacyCategory.archivedBy) {
			continue;
		}

		let createdByPersonId = category.createdByPersonId;
		if (!createdByPersonId && legacyCategory.createdBy) {
			createdByPersonId = userToPersonMap.get(legacyCategory.createdBy.toString());
			if (!createdByPersonId) {
				const wsKey = category.workspaceId.toString();
				if (!workspaceOwnerCache.has(wsKey)) {
					workspaceOwnerCache.set(wsKey, await findWorkspaceOwnerPerson(ctx, category.workspaceId));
				}
				createdByPersonId = workspaceOwnerCache.get(wsKey) ?? undefined;
			}
		}

		await ctx.db.patch(category._id, {
			createdByPersonId,
			createdBy: undefined,
			updatedBy: undefined,
			archivedBy: undefined
		} as Record<string, unknown>);

		fixed++;
	}

	console.log(`  Fixed ${fixed} circleItemCategories`);
	return { fixed };
}

async function fixCircleItemUserIdsHandler(ctx: MutationCtx) {
	const items = await ctx.db.query('circleItems').collect();
	const people = await ctx.db.query('people').collect();

	const userToPersonMap = new Map<string, Id<'people'>>();
	for (const person of people) {
		if (person.userId) {
			const existing = userToPersonMap.get(person.userId.toString());
			if (!existing || person.status === 'active') {
				userToPersonMap.set(person.userId.toString(), person._id);
			}
		}
	}

	const workspaceOwnerCache = new Map<string, Id<'people'> | null>();
	let fixed = 0;

	for (const item of items) {
		const legacyItem = item as typeof item & {
			createdBy?: Id<'users'>;
			updatedBy?: Id<'users'>;
			archivedBy?: Id<'users'>;
		};

		if (!legacyItem.createdBy && !legacyItem.updatedBy && !legacyItem.archivedBy) {
			continue;
		}

		let createdByPersonId = item.createdByPersonId;
		if (!createdByPersonId && legacyItem.createdBy) {
			createdByPersonId = userToPersonMap.get(legacyItem.createdBy.toString());
			if (!createdByPersonId) {
				const wsKey = item.workspaceId.toString();
				if (!workspaceOwnerCache.has(wsKey)) {
					workspaceOwnerCache.set(wsKey, await findWorkspaceOwnerPerson(ctx, item.workspaceId));
				}
				createdByPersonId = workspaceOwnerCache.get(wsKey) ?? undefined;
			}
		}

		await ctx.db.patch(item._id, {
			createdByPersonId,
			createdBy: undefined,
			updatedBy: undefined,
			archivedBy: undefined
		} as Record<string, unknown>);

		fixed++;
	}

	console.log(`  Fixed ${fixed} circleItems`);
	return { fixed };
}

async function archiveAbandonedWorkspacesHandler(ctx: MutationCtx) {
	const workspaces = await ctx.db.query('workspaces').collect();
	const people = await ctx.db.query('people').collect();

	// Find workspaces without active people
	const workspaceHasActivePeople = new Map<string, boolean>();
	for (const person of people) {
		if (person.status === 'active' && person.workspaceId) {
			workspaceHasActivePeople.set(person.workspaceId.toString(), true);
		}
	}

	const abandonedWorkspaceIds = new Set(
		workspaces
			.filter((ws) => !workspaceHasActivePeople.has(ws._id.toString()))
			.map((ws) => ws._id.toString())
	);

	const now = Date.now();
	let circlesArchived = 0;
	let rolesArchived = 0;

	// Archive circles in abandoned workspaces
	const circles = await ctx.db.query('circles').collect();
	for (const circle of circles) {
		if (!circle.workspaceId) continue;
		if (abandonedWorkspaceIds.has(circle.workspaceId.toString()) && !circle.archivedAt) {
			await ctx.db.patch(circle._id, { archivedAt: now, status: 'active' });
			circlesArchived++;
		}
	}

	// Archive roles in abandoned workspaces
	const roles = await ctx.db.query('circleRoles').collect();
	for (const role of roles) {
		if (!role.workspaceId) continue;
		if (abandonedWorkspaceIds.has(role.workspaceId.toString()) && !role.archivedAt) {
			await ctx.db.patch(role._id, { archivedAt: now, status: 'active' });
			rolesArchived++;
		}
	}

	console.log(
		`  Archived ${circlesArchived} circles, ${rolesArchived} roles in ${abandonedWorkspaceIds.size} abandoned workspaces`
	);
	return { workspaceCount: abandonedWorkspaceIds.size, circlesArchived, rolesArchived };
}
