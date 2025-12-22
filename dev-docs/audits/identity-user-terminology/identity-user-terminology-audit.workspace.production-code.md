---
title: Identity terminology audit (workspace): production code candidates
generatedAt: 2025-12-21T17:28:23.995Z
---

## Totals

| Scope | Count | doc | comment | string | code |
|---|---:|---:|---:|---:|---:|
| system_auth | 0 | 0 | 0 | 0 | 0 |
| workspace | 420 | 0 | 0 | 0 | 420 |
| unknown | 0 | 0 | 0 | 0 | 0 |

## Instances

| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |
|---|---:|---|---:|---|---|---|---|---|
| `convex/admin/analytics.ts` | 36 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, role | 		const activeUserRoles = [...systemRoles, ...workspaceRoles]; // All are active in new model |
| `convex/admin/analytics.ts` | 67 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				total: activeUserRoles.length, |
| `convex/admin/analytics.ts` | 68 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				active: activeUserRoles.length, |
| `convex/admin/archived/syos814TestUtils.ts` | 18 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	findPersonByUserAndWorkspace |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 12 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 13 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | import { getUserWorkspaceIds } from '../../infrastructure/access/permissions'; |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 33 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople: boolean; |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 109 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 		let getUserWorkspaceIdsUsesPeople = false; |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 129 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople = workspaceIdsMatch; |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 164 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople && |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 182 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 					getUserWorkspaceIdsUsesPeople, |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 13 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	listWorkspacesForUser, |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 14 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	findPersonByUserAndWorkspace, |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 17 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | import { getUserWorkspaceIds } from '../../infrastructure/access/permissions'; |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 37 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople: boolean; |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 141 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 		let getUserWorkspaceIdsUsesPeople = false; |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 158 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople = workspaceIdsMatch; |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 200 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			getUserWorkspaceIdsUsesPeople && |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 220 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 					getUserWorkspaceIdsUsesPeople, |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 32 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: person/people, workspace | 		const displayName = (user?.name as string \| undefined) ?? user?.firstName ?? null; |
| `convex/admin/fixInvariantViolations.ts` | 227 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | export const fixCircleItemCategoryUserIds = internalMutation({ |
| `convex/admin/fixInvariantViolations.ts` | 237 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: person/people, people | 		const userToPersonMap = new Map<string, Id<'people'>>(); |
| `convex/admin/fixInvariantViolations.ts` | 266 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people | 				createdByPersonId = userToPersonMap.get(legacyCategory.createdBy.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 354 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: person/people, people | 		const userToPersonMap = new Map<string, Id<'people'>>(); |
| `convex/admin/fixInvariantViolations.ts` | 370 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people | 				let createdByPersonId = userToPersonMap.get(meeting.createdBy.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 400 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | export const fixCircleItemUserIds = internalMutation({ |
| `convex/admin/fixInvariantViolations.ts` | 409 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: person/people, people | 		const userToPersonMap = new Map<string, Id<'people'>>(); |
| `convex/admin/fixInvariantViolations.ts` | 436 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people | 				createdByPersonId = userToPersonMap.get(legacyItem.createdBy.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 618 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | 		const categoryResult = await fixCircleItemCategoryUserIdsHandler(ctx); |
| `convex/admin/fixInvariantViolations.ts` | 622 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | 		const circleItemResult = await fixCircleItemUserIdsHandler(ctx); |
| `convex/admin/fixInvariantViolations.ts` | 736 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | async function fixCircleItemCategoryUserIdsHandler(ctx: MutationCtx) { |
| `convex/admin/fixInvariantViolations.ts` | 740 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: person/people, people | 	const userToPersonMap = new Map<string, Id<'people'>>(); |
| `convex/admin/fixInvariantViolations.ts` | 766 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people | 			createdByPersonId = userToPersonMap.get(legacyCategory.createdBy.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 790 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | async function fixCircleItemUserIdsHandler(ctx: MutationCtx) { |
| `convex/admin/fixInvariantViolations.ts` | 794 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: person/people, people | 	const userToPersonMap = new Map<string, Id<'people'>>(); |
| `convex/admin/fixInvariantViolations.ts` | 820 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people | 			createdByPersonId = userToPersonMap.get(legacyItem.createdBy.toString()); |
| `convex/admin/migrateProposalsToPerson.ts` | 12 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | type WorkspaceUserKey = string; |
| `convex/admin/migrateProposalsToPerson.ts` | 19 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 	const personMap = new Map<WorkspaceUserKey, string>(); |
| `convex/admin/migrateTagsToPersonId.ts` | 39 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people | 		const personByUser = await ctx.db |
| `convex/admin/migrateTagsToPersonId.ts` | 43 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: personId, person/people | 		if (personByUser) return personByUser; |
| `convex/admin/migrateTagsToPersonId.ts` | 80 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people | 					if (!legacyUserId) { |
| `convex/admin/migrateTagsToPersonId.ts` | 83 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, workspace | 					workspaceId = await findWorkspaceForUser(ctx, legacyUserId); |
| `convex/admin/migrateTagsToPersonId.ts` | 87 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, workspace | 				const person = await ensurePersonForWorkspace(ctx, workspaceId, legacyUserId); |
| `convex/admin/migrateVersionHistory.ts` | 101 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, circle | 				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId; |
| `convex/admin/migrateVersionHistory.ts` | 156 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, circle | 				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId; |
| `convex/admin/migrateVersionHistory.ts` | 221 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, circle | 				changedBy = (await getWorkspaceOwner(ctx, circle.workspaceId)) ?? systemUserId; |
| `convex/admin/migrateVersionHistory.ts` | 268 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				changedBy = (await getWorkspaceOwner(ctx, category.workspaceId)) ?? systemUserId; |
| `convex/admin/migrateVersionHistory.ts` | 316 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				changedBy = (await getWorkspaceOwner(ctx, item.workspaceId)) ?? systemUserId; |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 35 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, circle | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 27 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, people, workspace | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 27 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/rbac.ts` | 195 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/admin/rbac.ts` | 204 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/rbac.ts` | 229 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/admin/rbac.ts` | 260 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/admin/rbac.ts` | 281 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const listUserRoles = query({ |
| `convex/admin/rbac.ts` | 289 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/rbac.ts` | 311 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			if (!role \|\| !user) continue; |
| `convex/admin/rbac.ts` | 314 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				userRoleId: systemRole._id, |
| `convex/admin/rbac.ts` | 340 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userRoleId: workspaceRole._id, |
| `convex/admin/rbac.ts` | 813 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const assignRoleToUser = mutation({ |
| `convex/admin/rbac.ts` | 860 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				return { success: true, updated: true, userRoleId: existing._id }; |
| `convex/admin/rbac.ts` | 870 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			const userRoleId = await ctx.db.insert('workspaceRoles', { |
| `convex/admin/rbac.ts` | 878 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			return { success: true, updated: false, userRoleId }; |
| `convex/admin/rbac.ts` | 889 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				return { success: true, updated: true, userRoleId: existing._id }; |
| `convex/admin/rbac.ts` | 892 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			const userRoleId = await ctx.db.insert('systemRoles', { |
| `convex/admin/rbac.ts` | 899 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			return { success: true, updated: false, userRoleId }; |
| `convex/admin/rbac.ts` | 909 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const revokeUserRole = mutation({ |
| `convex/admin/rbac.ts` | 912 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')) |
| `convex/admin/rbac.ts` | 918 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 920 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			await ctx.db.delete(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 925 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/rbac.ts` | 927 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			await ctx.db.delete(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/rbac.ts` | 941 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const updateUserRole = mutation({ |
| `convex/admin/rbac.ts` | 944 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')), |
| `convex/admin/rbac.ts` | 965 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 966 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/reportMissingProposalPersons.ts` | 44 | `code` | 2 | `Users` | `workspace` | `high` | Workspace signals: person/people, proposal | 		{ count: number; legacyUsers: Record<string, number>; processedUsers: Record<string, number> } |
| `convex/admin/reportMissingProposalPersons.ts` | 49 | `code` | 2 | `Users` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 			grouped[row.workspaceId] = { count: 0, legacyUsers: {}, processedUsers: {} }; |
| `convex/admin/reportMissingProposalPersons.ts` | 53 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 			grouped[row.workspaceId].legacyUsers[row.legacyCreatedBy] = |
| `convex/admin/reportMissingProposalPersons.ts` | 54 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 				(grouped[row.workspaceId].legacyUsers[row.legacyCreatedBy] ?? 0) + 1; |
| `convex/admin/reportMissingProposalPersons.ts` | 57 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 			grouped[row.workspaceId].processedUsers[row.legacyProcessedBy] = |
| `convex/admin/reportMissingProposalPersons.ts` | 58 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: person/people, workspace, proposal | 				(grouped[row.workspaceId].processedUsers[row.legacyProcessedBy] ?? 0) + 1; |
| `convex/admin/users.ts` | 62 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/users.ts` | 87 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/admin/users.ts` | 117 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/core/assignments/mutations.ts` | 11 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace | import { getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/assignments/mutations.ts` | 55 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	const targetPerson = await getPersonByUserAndWorkspace( |
| `convex/core/people/mutations.ts` | 87 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | 					ErrorCodes.INVITE_USER_MISMATCH, |
| `convex/core/people/mutations.ts` | 114 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 		const existingByUser = await ctx.db |
| `convex/core/people/mutations.ts` | 121 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 		if (existingByUser && existingByUser.status !== 'archived') { |
| `convex/core/people/mutations.ts` | 238 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, people domain path | export async function linkPersonToUser(ctx: MutationCtx, args: LinkPersonArgs): Promise<PersonDoc> { |
| `convex/core/people/queries.ts` | 7 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from './constants'; |
| `convex/core/people/queries.ts` | 37 | `code` | 2 | `User, USER` | `workspace` | `high` | Workspace signals: person/people, people, people domain path | 	const linkedUser = activePerson[USER_ID_FIELD]; |
| `convex/core/people/queries.ts` | 38 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 	if (!linkedUser) { |
| `convex/core/people/queries.ts` | 41 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | 	return { person: activePerson, workspaceId: resolvedWorkspaceId, linkedUser }; |
| `convex/core/people/queries.ts` | 62 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | export async function getPersonByUserAndWorkspace( |
| `convex/core/people/queries.ts` | 109 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace, people domain path | export async function listWorkspacesForUser( |
| `convex/core/people/queries.ts` | 126 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | export async function findPersonByUserAndWorkspace( |
| `convex/core/people/rules.ts` | 62 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, people domain path | 		return user?.email ?? null; |
| `convex/core/roles/mutations.ts` | 32 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleCreated, |
| `convex/core/roles/mutations.ts` | 33 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleRemoved, |
| `convex/core/roles/mutations.ts` | 34 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleRestored |
| `convex/core/roles/mutations.ts` | 102 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 		await handleUserCircleRoleRemoved(ctx, assignment._id); |
| `convex/core/roles/mutations.ts` | 414 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleRestored(ctx, args.assignmentId); |
| `convex/core/roles/mutations.ts` | 493 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleCreated( |
| `convex/core/roles/mutations.ts` | 546 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleRemoved(ctx, assignment._id); |
| `convex/core/roles/queries.ts` | 249 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | async function listUserRoles( |
| `convex/core/roles/queries.ts` | 499 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/core/roles/queries.ts` | 506 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	handler: async (ctx, args) => listUserRoles(ctx, args) |
| `convex/core/roles/roleRbac.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | export async function handleUserCircleRoleCreated( |
| `convex/core/roles/roleRbac.ts` | 75 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | export async function handleUserCircleRoleRemoved( |
| `convex/core/roles/roleRbac.ts` | 89 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | export async function handleUserCircleRoleRestored( |
| `convex/core/roles/roleRbac.ts` | 109 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleCreated( |
| `convex/core/roles/templates/mutations.ts` | 34 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, args.workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 35 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/roles/templates/mutations.ts` | 94 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 95 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/roles/templates/mutations.ts` | 165 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, template.workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 166 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/workspaces/access.ts` | 5 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, workspaces domain path | import { findPersonByUserAndWorkspace, getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/workspaces/lifecycle.ts` | 135 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 136 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const emailField = (user as Record<string, unknown>).email; |
| `convex/core/workspaces/lifecycle.ts` | 141 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 142 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const nameField = (user as Record<string, unknown>).name; |
| `convex/core/workspaces/lifecycle.ts` | 147 | `code` | 4 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/core/workspaces/lifecycle.ts` | 250 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/lifecycle.ts` | 253 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/lifecycle.ts` | 254 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/lifecycle.ts` | 255 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/core/workspaces/lifecycle.ts` | 261 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, workspace, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/members.ts` | 13 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | import { findUserEmailField, findUserNameField } from './lifecycle'; |
| `convex/core/workspaces/members.ts` | 14 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, member | import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../people/queries'; |
| `convex/core/workspaces/members.ts` | 25 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 		return removeMember(ctx, { ...args, actingUserId }); |
| `convex/core/workspaces/members.ts` | 75 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 		args.actingUserId, |
| `convex/core/workspaces/members.ts` | 79 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, member, workspaces domain path | 	const targetPerson = await findPersonByUserAndWorkspace(ctx, args.memberUserId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 92 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, member, workspaces domain path | 	const actingPerson = await findPersonByUserAndWorkspace(ctx, args.actingUserId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 123 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/members.ts` | 125 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const email = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 126 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const name = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 148 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/members.ts` | 162 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 163 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 164 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/core/workspaces/members.ts` | 170 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, workspace, member, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/mutations.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, workspaces domain path | import { findPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/workspaces/queries.ts` | 10 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	listWorkspacesForUser, |
| `convex/core/workspaces/queries.ts` | 11 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, workspaces domain path | 	findPersonByUserAndWorkspace, |
| `convex/core/workspaces/settings.ts` | 19 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | export const getUserSettings = query({ |
| `convex/core/workspaces/settings.ts` | 352 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | export const getUserSettingsForSync = internalQuery({ |
| `convex/features/customFields/mutations.ts` | 13 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/customFields/queries.ts` | 13 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace as _getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/customFields/rules.ts` | 13 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/flashcards/index.ts` | 120 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people | 		return listUserFlashcards(ctx, personId, args.tagIds ?? undefined); |
| `convex/features/flashcards/repository.ts` | 50 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, people | export async function getUserFlashcards(ctx: QueryCtx, personId: Id<'people'>) { |
| `convex/features/inbox/lifecycle.ts` | 5 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../core/people/constants'; |
| `convex/features/invites/helpers.ts` | 6 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../../core/people/queries'; |
| `convex/features/invites/helpers.ts` | 15 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	ensureUserNotAlreadyMember |
| `convex/features/invites/helpers.ts` | 32 | `code` | 4 | `User, user` | `workspace` | `medium` | Workspace signals: member | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/features/invites/helpers.ts` | 77 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	await ensureNoExistingUserInvite(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 78 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 	await ensureUserNotAlreadyMember(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 176 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: people | 			email: null, // Email comes from user lookup, not stored per people/README.md |
| `convex/features/invites/helpers.ts` | 379 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	const memberUserIds = new Set( |
| `convex/features/invites/helpers.ts` | 387 | `code` | 3 | `User` | `workspace` | `medium` | Workspace signals: member | 				(invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) \|\| |
| `convex/features/invites/rules.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/invites/rules.ts` | 65 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	if (existingUserInvite && existingUserInvite.workspaceId === workspaceId) { |
| `convex/features/invites/rules.ts` | 73 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | export async function ensureUserNotAlreadyMember( |
| `convex/features/invites/rules.ts` | 80 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	const person = await findPersonByUserAndWorkspace(ctx, invitedUserId, workspaceId); |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 14 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers: Array<{ personId: string; name: string }>; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 151 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 		accessible.push({ ...meeting, invitedUsers, viewerPersonId: personId }); |
| `convex/features/notes/index.ts` | 13 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/onboarding/mutations.ts` | 13 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/onboarding/queries.ts` | 12 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/onboarding/queries.ts` | 162 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: person/people | 			userOnboardingComplete: !!person.onboardingCompletedAt |
| `convex/features/readwise/cleanup.ts` | 183 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace | 			(internal as any).core.people.queries.listWorkspacesForUser, |
| `convex/features/readwise/cleanup.ts` | 191 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace | 			(internal as any).core.people.queries.findPersonByUserAndWorkspace, |
| `convex/features/readwise/filters.ts` | 57 | `code` | 1 | `UserS` | `workspace` | `medium` | Workspace signals: workspace | 	const getUserSettingsQuery = internal.core.workspaces.settings |
| `convex/features/readwise/mutations.ts` | 94 | `code` | 1 | `Users` | `workspace` | `medium` | Workspace signals: workspace | 		workspaceId: v.id('workspaces'), // REQUIRED: Users always have at least one workspace |
| `convex/features/readwise/mutations/tags.ts` | 3 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../../core/people/queries'; |
| `convex/features/readwise/orchestrator.ts` | 7 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/readwise/queries/progress.ts` | 3 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../../core/people/constants'; |
| `convex/features/readwise/queries/progress.ts` | 16 | `code` | 2 | `User, USER` | `workspace` | `medium` | Workspace signals: person/people | 	const linkedUser = person[USER_ID_FIELD]; |
| `convex/features/tags/access.ts` | 3 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/tags/access.ts` | 21 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: workspace | 	const workspaces = await listWorkspacesForUser(ctx, user); |
| `convex/features/tags/access.ts` | 38 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const resolvedWorkspaceId = await resolveWorkspace(ctx, actorUser, workspaceId); |
| `convex/features/tags/access.ts` | 39 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	const person = await getPersonByUserAndWorkspace(ctx, actorUser, resolvedWorkspaceId); |
| `convex/features/tasks/access.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/assignments.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/lifecycle.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/queries.ts` | 72 | `code` | 4 | `User` | `workspace` | `medium` | Workspace signals: assignee | 	const assigneeUserId = getTargetUserId(args.targetUserId, args.currentUserId); |
| `convex/features/workspaceBranding/index.ts` | 16 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/workspaceBranding/index.ts` | 68 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | async function collectBrandingForUser( |
| `convex/features/workspaceBranding/index.ts` | 69 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	ctx: Parameters<typeof listWorkspacesForUser>[0], |
| `convex/infrastructure/access/permissions.ts` | 5 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace, people domain path | import { listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/infrastructure/access/permissions.ts` | 12 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | export async function getUserWorkspaceIds( |
| `convex/infrastructure/access/permissions.ts` | 19 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const workspaceIds = await listWorkspacesForUser(ctx, normalizedUserId); |
| `convex/infrastructure/access/permissions.ts` | 44 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | export async function getUserCircleIds( |
| `convex/infrastructure/access/workspaceRoles.ts` | 22 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 	userName: string \| null; |
| `convex/infrastructure/access/workspaceRoles.ts` | 23 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 	userEmail: string; |
| `convex/infrastructure/access/workspaceRoles.ts` | 25 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; // ID from systemRoles or workspaceRoles table (SYOS-862: migrated from userRoles) |
| `convex/infrastructure/access/workspaceRoles.ts` | 70 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			if (!user) continue; |
| `convex/infrastructure/access/workspaceRoles.ts` | 90 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 						userRoleId: systemRole._id, |
| `convex/infrastructure/access/workspaceRoles.ts` | 117 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/infrastructure/access/workspaceRoles.ts` | 133 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userName: user.name ?? null, |
| `convex/infrastructure/access/workspaceRoles.ts` | 134 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userEmail: user.email, |
| `convex/infrastructure/featureFlags/impact.ts` | 68 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: workspace | 		breakdown.byOrgIds = flag.allowedWorkspaceIds.length * 10; // Estimate: 10 users per org |
| `convex/infrastructure/featureFlags/targeting.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace, people domain path | import { listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/infrastructure/featureFlags/targeting.ts` | 6 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | async function userHasWorkspaceAccess( |
| `convex/infrastructure/featureFlags/targeting.ts` | 14 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 	return allowedWorkspaceIds.some((orgId) => userWorkspaceIds.includes(orgId)); |
| `convex/infrastructure/rbac/permissions.ts` | 4 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	listActiveUserRoles, |
| `convex/infrastructure/rbac/permissions.ts` | 5 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	createUserRoleAssignment, |
| `convex/infrastructure/rbac/permissions.ts` | 6 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	updateUserRoleRevocation |
| `convex/infrastructure/rbac/permissions/access.ts` | 5 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | import { listActiveUserRoles } from './lifecycle'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 88 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: role | 	const activeUserRoles = await listActiveUserRoles( |
| `convex/infrastructure/rbac/permissions/access.ts` | 93 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	const permissions = await collectPermissionsForRoles(ctx, activeUserRoles); |
| `convex/infrastructure/rbac/permissions/access.ts` | 102 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 	for (const userRole of roles) { |
| `convex/infrastructure/rbac/permissions/access.ts` | 103 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const role = await ctx.db.get(userRole.roleId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 107 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId)) |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../../core/people/queries'; |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 14 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export async function listActiveUserRoles( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 85 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export async function createUserRoleAssignment( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 111 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export async function updateUserRoleRevocation( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 113 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 	_userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>, |
| `convex/infrastructure/rbac/queries.ts` | 87 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			userRoleId: Id<'systemRoles'>; |
| `convex/infrastructure/rbac/queries.ts` | 104 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userRoleId: Id<'workspaceRoles'>; |
| `convex/infrastructure/rbac/queries.ts` | 156 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				userRoleId: systemRole._id, |
| `convex/infrastructure/rbac/queries.ts` | 213 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 					userRoleId: workspaceRole._id, |
| `convex/infrastructure/rbac/roles.ts` | 21 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, role | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/infrastructure/rbac/roles.ts` | 62 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, role, assignee | 			const person = await findPersonByUserAndWorkspace(ctx, args.assigneeUserId, args.workspaceId); |
| `convex/infrastructure/rbac/roles.ts` | 87 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace, role | 			const actorPerson = await findPersonByUserAndWorkspace(ctx, actingUserId, args.workspaceId); |
| `convex/infrastructure/rbac/roles.ts` | 97 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			return { success: true, userRoleId: workspaceRoleId as any }; // Type cast for backward compatibility |
| `convex/infrastructure/rbac/roles.ts` | 115 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				actingUserId |
| `convex/infrastructure/rbac/roles.ts` | 118 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			return { success: true, userRoleId: systemRoleId as any }; // Type cast for backward compatibility |
| `convex/infrastructure/rbac/roles.ts` | 136 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')) // Accepts either table ID |
| `convex/infrastructure/rbac/roles.ts` | 142 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as any); |
| `convex/infrastructure/rbac/roles.ts` | 152 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as any); |
| `convex/infrastructure/rbac/roles.ts` | 172 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/infrastructure/rbac/roles.ts` | 183 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/infrastructure/rbac/roles.ts` | 206 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/infrastructure/rbac/roles.ts` | 233 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 							userRoleId: workspaceRole._id, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 143 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const userChangeRolesPerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 222 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			userChangeRolesPerm, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 20 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace as _findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/infrastructure/rbac/setupAdmin.ts` | 86 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					userRoleId: existing._id |
| `convex/infrastructure/rbac/setupAdmin.ts` | 90 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			const userRoleId = await ctx.db.insert('workspaceRoles', { |
| `convex/infrastructure/rbac/setupAdmin.ts` | 101 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 106 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				userRoleId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 120 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 				const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 124 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					userRoleId: existing._id, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 130 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			const userRoleId = await ctx.db.insert('systemRoles', { |
| `convex/infrastructure/rbac/setupAdmin.ts` | 140 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 145 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				userRoleId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 152 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 		const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 157 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			userRoleId, |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 16 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 	withUserAndEmailBefore: number; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 19 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 	remainingWithUserAndEmail: number; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 30 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 		let withUserAndEmailBefore = 0; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 37 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 			if (hasUser && hasEmail) { |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 38 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 				withUserAndEmailBefore++; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 43 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 			if (!hasUser && hasEmail) { |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 48 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: people | 		const remainingWithUserAndEmail = withUserAndEmailBefore - cleared; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 55 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 					withUserAndEmailBefore, |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 58 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 					remainingWithUserAndEmail |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 67 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 			withUserAndEmailBefore, |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 70 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: people | 			remainingWithUserAndEmail |
| `scripts/refactor-organizations-to-workspaces.ts` | 254 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		pattern: /\bgetUserOrganizationIds\b/g, |
| `src/hooks.server.ts` | 41 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 18 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 			username: { |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 47 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 58 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 73 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		username: 'Jane Smith', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 84 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 98 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		username: 'test', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 109 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 123 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 135 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 149 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 160 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 185 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 204 | `code` | 2 | `user` | `workspace` | `medium` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/infrastructure/workspaces/components/InviteMemberModal.svelte` | 140 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member | 						Send an invite to a specific user by email. They'll receive a link to join this |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 20 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	getUserId: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 42 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 66 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 67 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			if (!currentUserId) { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 24 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	getUserId: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 47 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 61 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const currentUserId = browser ? getUserId() : undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 62 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 63 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 105 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 249 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 43 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		lastUserId: undefined as string \| undefined, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 61 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 62 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 63 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 127 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			const prevUserId = untrack(() => state.lastUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 142 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				const oldStorageKey = getStorageKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 143 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				const oldStorageDetailsKey = getStorageDetailsKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 245 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 246 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 247 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 34 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 	activeWorkspaceId?: () => string \| null; // Function for reactivity (optional - tags can be user or org-scoped) |
| `src/lib/modules/meetings/api.ts` | 34 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 118 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 	Note: Mock displays populated attendees (3 users + 3 circles) by default. |
| `src/lib/modules/meetings/components/AttendeeSelector.svelte` | 294 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 		<Text variant="label" color="tertiary" as="p">No attendees selected - add users or circles</Text |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 87 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people, people | 				id: user.personId as Id<'people'>, |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 180 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 		(usersQuery?.isLoading ?? false) \|\| (circlesQuery?.isLoading ?? false) |
| `src/lib/modules/meetings/composables/useMeetings.svelte.ts` | 39 | `code` | 2 | `Users, users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; // Invited users for display |
| `src/lib/modules/org-chart/components/AssignUserDialog.svelte` | 93 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 			? `Select a user to assign to the role "${entityName}".` |
| `src/lib/modules/org-chart/components/AssignUserDialog.svelte` | 94 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			: `Select a user to add to the circle "${entityName}".` |
| `src/lib/modules/org-chart/components/AssignUserDialog.svelte` | 131 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 				toast.success(`User assigned to role "${entityName}"`); |
| `src/lib/modules/org-chart/components/AssignUserDialog.svelte` | 138 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 				toast.success(`User added to circle "${entityName}"`); |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 38 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	let showAssignUserDialog = $state(false); |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 104 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 							showAssignUserDialog = true; |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 108 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 						<span>Add User to Circle</span> |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 138 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	<AssignUserDialog |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 139 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		bind:open={showAssignUserDialog} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 108 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		assignUserDialogOpen = $state(false), |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 109 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		assignUserDialogType = $state<'role' \| 'circle'>('role'), |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 110 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		assignUserDialogEntityId = $state<Id<'circleRoles'> \| Id<'circles'> \| null>(null), |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 111 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		assignUserDialogEntityName = $state(''); |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 113 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		openAssignUserDialog = ( |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 118 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			assignUserDialogType = type; |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 119 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			assignUserDialogEntityId = entityId; |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 120 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			assignUserDialogEntityName = entityName; |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 121 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			assignUserDialogOpen = true; |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 123 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		handleAssignUserSuccess = () => { |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 251 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 								onOpenAssignUserDialog={openAssignUserDialog} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 280 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	{#if assignUserDialogEntityId && circle} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 281 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		<AssignUserDialog |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 282 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			bind:open={assignUserDialogOpen} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 283 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			type={assignUserDialogType} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 284 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			entityId={assignUserDialogEntityId} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 285 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			entityName={assignUserDialogEntityName} |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 287 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: org-chart path, circle | 			onSuccess={handleAssignUserSuccess} |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 164 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 169 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.click(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 201 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 206 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.hover(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 207 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.unhover(circleGroup); |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 69 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 	async function handleAssignUser(roleId: string) { |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 79 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 	async function handleRemoveUser(roleId: string, personId: string) { |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 86 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		if (confirm(`Archive role "${roleName}"? All user assignments will be removed.`)) { |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 255 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 											onclick={() => handleAssignUser(role.roleId)} |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 273 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 													onclick={() => handleRemoveUser(role.roleId, filler.personId)} |
| `src/lib/modules/org-chart/components/CircleTabContent.svelte` | 22 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		onOpenAssignUserDialog: (type: 'role' \| 'circle', entityId: any, entityName: string) => void; |
| `src/lib/modules/org-chart/components/CircleTabContent.svelte` | 34 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		onOpenAssignUserDialog |
| `src/lib/modules/org-chart/components/CircleTabContent.svelte` | 47 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		{onOpenAssignUserDialog} |
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | 63 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	let isUserUpdating = $state(false); |
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | 68 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		if (isUserUpdating) { |
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | 106 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		isUserUpdating = true; |
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | 144 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 					isUserUpdating = false; |
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | 151 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 				isUserUpdating = false; |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | 83 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: org-chart path | 	let isUserUpdating = $state(false); |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | 88 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: org-chart path | 		if (isUserUpdating) { |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | 149 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: org-chart path | 		isUserUpdating = true; |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | 164 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: org-chart path | 					isUserUpdating = false; |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | 171 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: org-chart path | 				isUserUpdating = false; |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 49 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: org-chart path | 		const userChildren: DisplayNode[] = node.children.map((c) => ({ ...c, isAutoCreated: false })); |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 52 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		return [...coreRoles, ...userChildren]; |
| `src/lib/modules/org-chart/components/RoleCard.stories.svelte` | 183 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 				The current user's card (Randy Hereman) is highlighted with the brand teal background. |
| `src/lib/modules/org-chart/components/RoleCard.svelte` | 17 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		scope?: string; // User-level scope (displayed on user card) |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 17 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 	let showAssignUserDialog = $state(false); |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 56 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 							showAssignUserDialog = true; |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 60 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 						<span>Assign User to Role</span> |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 67 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 	<AssignUserDialog |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 68 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, role | 		bind:open={showAssignUserDialog} |
| `src/lib/modules/org-chart/components/RoleMemberItem.svelte` | 12 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: org-chart path, role, member | 		scope?: string; // User-level scope (displayed below user name) |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 162 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 167 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		await userEvent.click(roleGroup); |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 197 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 202 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		await userEvent.hover(roleGroup); |
| `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte` | 45 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		onOpenAssignUserDialog?: ( |
| `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte` | 60 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		onOpenAssignUserDialog |
| `src/routes/(authenticated)/+layout.server.ts` | 161 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 						if (!firstWorkspaceState.userOnboardingComplete) { |
| `src/routes/(authenticated)/admin/+page.svelte` | 97 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					Manage roles, permissions, and user-role assignments |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 27 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 		const [rolesResult, permissionsResult, analyticsResult, usersResult] = await Promise.all([ |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 291 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	async function assignRoleToUser() { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 297 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 		if (!assignUserId \|\| !assignRoleId) { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 317 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 			await convexClient.mutation(api.admin.rbac.assignRoleToUser, { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 644 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				Manage roles, permissions, and user-role assignments |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 694 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				<p class="text-label text-secondary mt-fieldGroup">User-role assignments</p> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 707 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				Assign Role to User |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 727 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 							Roles define what users can do in SynergyOS. Each role has permissions that grant |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 734 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 								<li>Assign roles to users to grant permissions</li> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1159 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 							user is assigned to a role template. |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1421 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 					Create a new role that can be assigned to users |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1480 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				<Dialog.Title class="text-h3 text-primary font-semibold">Assign Role to User</Dialog.Title> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1482 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 					Assign a role to a user to grant them permissions |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1618 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 				<Button variant="primary" onclick={assignRoleToUser} disabled={assignRoleLoading}> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 19 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const [userDetailsResult, allRolesResult] = await Promise.all([ |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 18 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				userRoleId: string; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 38 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	<title>User Role Assignment - Admin - SynergyOS</title> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 47 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		<p class="text-secondary mt-1 text-sm">Manage roles for this user</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 56 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				{#if userDetails.roles.length > 0} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 58 | `code` | 4 | `user` | `workspace` | `medium` | Workspace signals: role | 						{#each userDetails.roles as userRole (userRole.userRoleId)} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 63 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 									<p class="text-primary font-medium">{userRole.roleName}</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 65 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 										{userRole.workspaceId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 67 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 											: userRole.teamId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 77 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 											await convexClient.mutation(api.admin.rbac.revokeUserRole, { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 79 | `code` | 3 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 												userRoleId: userRole.userRoleId as Id<'systemRoles'> \| Id<'workspaceRoles'> |
| `src/routes/(authenticated)/w/[slug]/proposals/+page.svelte` | 67 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: proposal | 					limit: 100 // Get all user's proposals |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 591 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: person/people | 												👤 Personal (User-owned) |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 37 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	const membership = membersResult.find((m) => m.email === currentUserEmail); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 45 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	let selectedUserId = $state<string>(''); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 75 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 			selectedUserId = ''; |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 87 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 	async function handleRevokeRole(userRoleId: string) { |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 94 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userRoleId: userRoleId as Id<'systemRoles'> \| Id<'workspaceRoles'> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 125 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 				Roles control what users can do. <strong>System roles</strong> apply globally. |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 137 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: role, member | 								{member.userName \|\| member.userEmail} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 140 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: role, member | 								{member.userEmail} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 146 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: role, member | 									{#each member.roles as role (role.userRoleId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 160 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 												onclick={() => handleRevokeRole(role.userRoleId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 223 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 							User |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 227 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 							bind:value={selectedUserId} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 230 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 							<option value="">Select a user...</option> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 233 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: role, member | 									{member.userName \|\| member.userEmail} |
| `src/routes/+layout.server.ts` | 13 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		activeWorkspace: locals.auth.user?.activeWorkspace |
| `src/routes/settings/+page.svelte` | 759 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: person/people | 												👤 Personal (User-owned) |