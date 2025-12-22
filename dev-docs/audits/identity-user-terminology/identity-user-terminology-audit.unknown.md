---
title: Identity terminology audit (unknown-only): user/users
generatedAt: 2025-12-21T17:28:23.991Z
---

## Totals

| Scope | Count | doc | comment | string | code |
|---|---:|---:|---:|---:|---:|
| system_auth | 0 | 0 | 0 | 0 | 0 |
| workspace | 0 | 0 | 0 | 0 | 0 |
| unknown | 1741 | 0 | 0 | 487 | 1254 |

## Instances

| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |
|---|---:|---|---:|---|---|---|---|---|
| `convex/admin/analytics.ts` | 24 | `code` | 2 | `Users, users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const activeUsers = users.filter((u) => !u.deletedAt); |
| `convex/admin/analytics.ts` | 45 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			users: { |
| `convex/admin/analytics.ts` | 46 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				total: users.length, |
| `convex/admin/analytics.ts` | 47 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 				active: activeUsers.length, |
| `convex/admin/analytics.ts` | 48 | `code` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 				deleted: users.length - activeUsers.length |
| `convex/admin/archived/migrateCirclesToWorkspaces.ts` | 837 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				existingMemberships.map((m) => `${m.workspaceId}_${m.userId}`) |
| `convex/admin/archived/migrateCirclesToWorkspaces.ts` | 850 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 						userId: Id<'users'>; |
| `convex/admin/archived/migrateCirclesToWorkspaces.ts` | 866 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 					const membershipKey = `${workspaceId}_${oldMembershipDoc.userId}`; |
| `convex/admin/archived/migrateCirclesToWorkspaces.ts` | 876 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 							userId: oldMembershipDoc.userId, |
| `convex/admin/archived/syos814TestUtils.ts` | 54 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814TestUtils.ts` | 72 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 						userId: person.userId |
| `convex/admin/archived/syos814TestUtils.ts` | 79 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userIdMatches: person?.userId === userId, |
| `convex/admin/archived/syos814TestUtils.ts` | 105 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const membership = await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814TestUtils.ts` | 112 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const adminPerson = await requireWorkspaceAdminOrOwner(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814TestUtils.ts` | 125 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814TestUtils.ts` | 134 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: membership.userId, |
| `convex/admin/archived/syos814TestUtils.ts` | 176 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814TestUtils.ts` | 184 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 						userId: person.userId, |
| `convex/admin/archived/syos814TestUtils.ts` | 195 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userIdMatches: person?.userId === userId |
| `convex/admin/archived/syos814TestUtils.ts` | 278 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814TestUtils.ts` | 303 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userIdMatches: person?.userId === userId |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 70 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 90 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const membership = await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 99 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const adminMembership = await requireWorkspaceAdminOrOwner(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 116 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const peopleWorkspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 120 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const infraWorkspaceIds = await getUserWorkspaceIds(ctx, userId.toString()); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 82 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 99 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 114 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const membership = await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 131 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const adminPerson = await requireWorkspaceAdminOrOwner(ctx, args.workspaceId, userId); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 147 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const peopleWorkspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 150 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const infraWorkspaceIds = await getUserWorkspaceIds(ctx, userId.toString()); |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 285 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 					'core/users/orgLinks.ts', |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 14 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users') |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 21 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', args.userId) |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 30 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const user = await db.get(args.userId); |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 31 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const email = user?.email ?? `unknown-${args.userId}@example.invalid`; |
| `convex/admin/ensurePersonForUserInWorkspace.ts` | 37 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: args.userId, |
| `convex/admin/fixInvariantViolations.ts` | 230 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		console.log('🔧 Fixing circleItemCategories userId references (XDOM-01)...\n'); |
| `convex/admin/fixInvariantViolations.ts` | 239 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (person.userId) { |
| `convex/admin/fixInvariantViolations.ts` | 241 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				const existing = userToPersonMap.get(person.userId.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 243 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userToPersonMap.set(person.userId.toString(), person._id); |
| `convex/admin/fixInvariantViolations.ts` | 345 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const fixMeetingUserIds = internalMutation({ |
| `convex/admin/fixInvariantViolations.ts` | 356 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (person.userId) { |
| `convex/admin/fixInvariantViolations.ts` | 357 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				const existing = userToPersonMap.get(person.userId.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 359 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userToPersonMap.set(person.userId.toString(), person._id); |
| `convex/admin/fixInvariantViolations.ts` | 403 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		console.log('🔧 Fixing circleItems userId references (XDOM-05)...\n'); |
| `convex/admin/fixInvariantViolations.ts` | 411 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (person.userId) { |
| `convex/admin/fixInvariantViolations.ts` | 412 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				const existing = userToPersonMap.get(person.userId.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 414 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userToPersonMap.set(person.userId.toString(), person._id); |
| `convex/admin/fixInvariantViolations.ts` | 742 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		if (person.userId) { |
| `convex/admin/fixInvariantViolations.ts` | 743 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const existing = userToPersonMap.get(person.userId.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 745 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userToPersonMap.set(person.userId.toString(), person._id); |
| `convex/admin/fixInvariantViolations.ts` | 796 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		if (person.userId) { |
| `convex/admin/fixInvariantViolations.ts` | 797 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const existing = userToPersonMap.get(person.userId.toString()); |
| `convex/admin/fixInvariantViolations.ts` | 799 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userToPersonMap.set(person.userId.toString(), person._id); |
| `convex/admin/invariants/crossDomain.ts` | 59 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 					? 'Core tables use personId instead of userId' |
| `convex/admin/invariants/identity.ts` | 18 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			.filter((person) => !person.userId) |
| `convex/admin/invariants/identity.ts` | 23 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			name: 'Active people must have userId set', |
| `convex/admin/invariants/identity.ts` | 29 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} active people missing userId` |
| `convex/admin/invariants/identity.ts` | 117 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (!person.userId) continue; |
| `convex/admin/invariants/identity.ts` | 118 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(person.userId); |
| `convex/admin/invariants/identity.ts` | 119 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (!user) { |
| `convex/admin/invariants/identity.ts` | 126 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			name: 'Every person.userId points to existing user', |
| `convex/admin/invariants/identity.ts` | 147 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (!person.userId) continue; |
| `convex/admin/invariants/identity.ts` | 148 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const key = `${person.workspaceId}\|${person.userId}`; |
| `convex/admin/invariants/identity.ts` | 158 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			name: 'No duplicate (workspaceId, userId) pairs in active people', |
| `convex/admin/invariants/identity.ts` | 205 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const archivedWithoutUserId = ( |
| `convex/admin/invariants/identity.ts` | 210 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		).filter((person) => !person.userId); |
| `convex/admin/invariants/identity.ts` | 223 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const violations = archivedWithoutUserId |
| `convex/admin/invariants/identity.ts` | 229 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			name: 'Previously-active archived people preserve userId', |
| `convex/admin/invariants/identity.ts` | 234 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					? 'All previously-active archived people retain userId' |
| `convex/admin/invariants/identity.ts` | 235 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} archived people with activity history missing userId` |
| `convex/admin/invariants/identity.ts` | 245 | `code` | 2 | `user, users` | `unknown` | `low` | No strong auth/workspace signals detected | 		for (const user of users) { |
| `convex/admin/invariants/identity.ts` | 246 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (user.deletedAt) continue; |
| `convex/admin/invariants/identity.ts` | 247 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			const email = user.email.toLowerCase(); |
| `convex/admin/invariants/identity.ts` | 257 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Every user.email is unique', |
| `convex/admin/invariants/identity.ts` | 262 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 					? 'All users have unique emails' |
| `convex/admin/invariants/identity.ts` | 263 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 					: `${violations.length} duplicate email(s) detected among active users` |
| `convex/admin/invariants/identity.ts` | 278 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				(person) => !person.displayName \|\| person.email !== undefined \|\| person.userId !== undefined |
| `convex/admin/invariants/identity.ts` | 284 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			name: 'Placeholder people have displayName, no email, no userId', |
| `convex/admin/invariants/identity.ts` | 290 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} placeholder people with invalid fields (missing displayName or have email/userId)` |
| `convex/admin/migrateAddCoreRoles.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/admin/migrateAddCoreRoles.ts` | 26 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/migrateAddCoreRoles.ts` | 31 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/admin/migrateAddCoreRoles.ts` | 113 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 							updatedBy: userId |
| `convex/admin/migrateAddCoreRoles.ts` | 137 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 							updatedBy: userId |
| `convex/admin/migrateAddCoreRoles.ts` | 169 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		userId: v.id('users') |
| `convex/admin/migrateAddCoreRoles.ts` | 236 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 							updatedBy: args.userId |
| `convex/admin/migrateAddCoreRoles.ts` | 260 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 							updatedBy: args.userId |
| `convex/admin/migrateDefaultCategories.ts` | 37 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return members[0].userId; |
| `convex/admin/migrateProposalsToPerson.ts` | 21 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const userId = (person as any).userId; |
| `convex/admin/migrateProposalsToPerson.ts` | 22 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		if (!userId) continue; |
| `convex/admin/migrateProposalsToPerson.ts` | 23 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		personMap.set(makeKey(person.workspaceId, userId), person._id); |
| `convex/admin/migrateProposalsToPerson.ts` | 151 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | function makeKey(workspaceId: string, userId: string): WorkspaceUserKey { |
| `convex/admin/migrateProposalsToPerson.ts` | 152 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	return `${workspaceId}:${userId}`; |
| `convex/admin/migrateRootCircles.ts` | 20 | `string` | 1 | `users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | ): Promise<Id<'users'> \| null> { |
| `convex/admin/migrateRootCircles.ts` | 29 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return owner.userId; |
| `convex/admin/migrateRootCircles.ts` | 34 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		return members[0].userId; |
| `convex/admin/migrateTagsToPersonId.ts` | 12 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | type TagDoc = Doc<'tags'> & { userId?: Id<'users'> }; |
| `convex/admin/migrateTagsToPersonId.ts` | 14 | `string` | 3 | `User, user, users` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | async function findWorkspaceForUser(ctx: MutationCtx, userId: Id<'users'>) { |
| `convex/admin/migrateTagsToPersonId.ts` | 17 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/admin/migrateTagsToPersonId.ts` | 24 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		throw new Error(`No active people for user ${userId}`); |
| `convex/admin/migrateTagsToPersonId.ts` | 29 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	throw new Error(`Multiple active workspaces for user ${userId}: [${workspaces}]`); |
| `convex/admin/migrateTagsToPersonId.ts` | 35 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId?: Id<'users'> |
| `convex/admin/migrateTagsToPersonId.ts` | 38 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	if (userId) { |
| `convex/admin/migrateTagsToPersonId.ts` | 41 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/admin/migrateTagsToPersonId.ts` | 61 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		console.log('🔄 Starting migration: tags.userId -> tags.personId'); |
| `convex/admin/migrateTagsToPersonId.ts` | 75 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				const legacyUserId = tag.userId; |
| `convex/admin/migrateTagsToPersonId.ts` | 81 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 						throw new Error(`Tag ${tag._id} missing workspaceId and legacy userId`); |
| `convex/admin/migrateVersionHistory.ts` | 39 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return members[0].userId; |
| `convex/admin/migrateVersionHistory.ts` | 50 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	return user?._id ?? null; |
| `convex/admin/migrateVersionHistory.ts` | 64 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const systemUserId = await getAnyUserId(ctx); |
| `convex/admin/migrateVersionHistory.ts` | 65 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!systemUserId) { |
| `convex/admin/migrateVersionHistory.ts` | 68 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				'No users found in database. Cannot create version history.' |
| `convex/admin/migrateVersionHistory.ts` | 234 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: member.userId, |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 50 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 53 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 287 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: userId ${category.createdBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 303 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: updatedBy userId ${category.updatedBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 315 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: archivedBy userId ${category.archivedBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 361 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 363 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 365 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * archivedBy userId not found: ${edgeCaseStats.archivedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 448 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 						`⚠️  CircleItem ${item._id}: userId ${item.createdBy} not found in people table for workspace ${item.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 464 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 						`⚠️  CircleItem ${item._id}: updatedBy userId ${item.updatedBy} not found in people table for workspace ${item.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 503 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 505 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 539 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			`     - createdBy userId not found: ${categoryResult.edgeCaseStats.createdByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 543 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			`     - updatedBy userId not found: ${categoryResult.edgeCaseStats.updatedByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 547 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			`     - archivedBy userId not found: ${categoryResult.edgeCaseStats.archivedByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 551 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		console.log(`     - createdBy userId not found: ${itemResult.edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 553 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		console.log(`     - updatedBy userId not found: ${itemResult.edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 562 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			'   2. Verify no userId references remain in circleItems/circleItemCategories tables' |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 39 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 42 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 170 | `string` | 1 | `users` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				const legacyCreatedBy = (project as any).createdBy as Id<'users'> \| undefined; |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 188 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 							`⚠️  Project ${project._id}: userId ${legacyCreatedBy} not found in people table for workspace ${project.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 212 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 42 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 188 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 							`⚠️  Task ${task._id}: userId ${legacyCreatedBy} not found in people table for workspace ${task.workspaceId}, using fallback person` |
| `convex/admin/orgStructureImport.ts` | 45 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/admin/orgStructureImport.ts` | 195 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await ensureWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/admin/rbac.ts` | 291 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userEmail: string; |
| `convex/admin/rbac.ts` | 292 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userName: string; |
| `convex/admin/rbac.ts` | 310 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(systemRole.userId); |
| `convex/admin/rbac.ts` | 316 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userEmail: user.email, |
| `convex/admin/rbac.ts` | 317 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userName: user.name \|\| user.email, |
| `convex/admin/rbac.ts` | 334 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			if (!role \|\| !person \|\| !person.userId) continue; |
| `convex/admin/rbac.ts` | 336 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(person.userId); |
| `convex/admin/rbac.ts` | 337 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (!user) continue; |
| `convex/admin/rbac.ts` | 342 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userEmail: user.email, |
| `convex/admin/rbac.ts` | 343 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userName: user.name \|\| user.email, |
| `convex/admin/rbac.ts` | 392 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: systemRole.userId |
| `convex/admin/rbac.ts` | 399 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (!person \|\| !person.userId) continue; |
| `convex/admin/rbac.ts` | 403 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: person.userId, |
| `convex/admin/rbac.ts` | 501 | `code` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 				users: systemLevelUsers.size |
| `convex/admin/rbac.ts` | 816 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/admin/rbac.ts` | 839 | `string` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/admin/rbac.ts` | 884 | `string` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/admin/rbac.ts` | 893 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: args.assigneeUserId, |
| `convex/admin/rbac.ts` | 896 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				grantedBy: adminUserId |
| `convex/admin/rbac.ts` | 919 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		if (systemRole && 'userId' in systemRole) { |
| `convex/admin/rbac.ts` | 1053 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				grantedBy: adminUserId |
| `convex/admin/users.ts` | 17 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export const listAllUsers = query({ |
| `convex/admin/users.ts` | 26 | `code` | 2 | `users, user` | `unknown` | `low` | No strong auth/workspace signals detected | 		return users.map((user) => ({ |
| `convex/admin/users.ts` | 27 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			_id: user._id, |
| `convex/admin/users.ts` | 29 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			email: user.email, |
| `convex/admin/users.ts` | 30 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			emailVerified: user.emailVerified, |
| `convex/admin/users.ts` | 31 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			firstName: user.firstName, |
| `convex/admin/users.ts` | 32 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			lastName: user.lastName, |
| `convex/admin/users.ts` | 33 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: user.name, |
| `convex/admin/users.ts` | 34 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			profileImageUrl: user.profileImageUrl, |
| `convex/admin/users.ts` | 35 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			createdAt: user.createdAt, |
| `convex/admin/users.ts` | 36 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			updatedAt: user.updatedAt, |
| `convex/admin/users.ts` | 38 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			deletedAt: user.deletedAt |
| `convex/admin/users.ts` | 46 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserById = query({ |
| `convex/admin/users.ts` | 54 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = await ctx.db.get(args.targetUserId); |
| `convex/admin/users.ts` | 55 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!user) { |
| `convex/admin/users.ts` | 56 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			throw createError(ErrorCodes.GENERIC_ERROR, 'User not found'); |
| `convex/admin/users.ts` | 130 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			_id: user._id, |
| `convex/admin/users.ts` | 132 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			email: user.email, |
| `convex/admin/users.ts` | 133 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			emailVerified: user.emailVerified, |
| `convex/admin/users.ts` | 134 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			firstName: user.firstName, |
| `convex/admin/users.ts` | 135 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			lastName: user.lastName, |
| `convex/admin/users.ts` | 136 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: user.name, |
| `convex/admin/users.ts` | 137 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			profileImageUrl: user.profileImageUrl, |
| `convex/admin/users.ts` | 138 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			createdAt: user.createdAt, |
| `convex/admin/users.ts` | 139 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			updatedAt: user.updatedAt, |
| `convex/admin/users.ts` | 141 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			deletedAt: user.deletedAt, |
| `convex/admin/validateRoleTemplates.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/admin/validateRoleTemplates.ts` | 24 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/validateRoleTemplates.ts` | 62 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/validateRoleTemplates.ts` | 133 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/validateRoleTemplates.ts` | 138 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/admin/validateRoleTemplates.ts` | 200 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/validateRoleTemplates.ts` | 210 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				q.eq('workspaceId', circle.workspaceId).eq('userId', userId) |
| `convex/admin/validateRoleTemplates.ts` | 276 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/validateRoleTemplates.ts` | 281 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/core/assignments/mutations.ts` | 25 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId: Id<'users'>; |
| `convex/core/assignments/mutations.ts` | 170 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/core/authority/authority.test.ts` | 216 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				displayName: 'Test User', |
| `convex/core/history/queries.ts` | 67 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserChanges = query({ |
| `convex/core/history/queries.ts` | 82 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userQuery = ctx.db |
| `convex/core/history/queries.ts` | 87 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const results = await userQuery.take(limit * 2); |
| `convex/core/index.ts` | 16 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | export * from './users'; |
| `convex/core/people/constants.ts` | 1 | `string` | 2 | `USER, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | export const USER_ID_FIELD = 'userId' as const; |
| `convex/core/people/mutations.ts` | 21 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId?: Id<'users'> \| null; |
| `convex/core/people/mutations.ts` | 26 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/core/people/mutations.ts` | 43 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/core/people/mutations.ts` | 85 | `code` | 4 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			if (existingByEmail.userId && args.userId && existingByEmail.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 101 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId ?? existingByEmail.userId |
| `convex/core/people/mutations.ts` | 112 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	if (args.userId !== null && args.userId !== undefined) { |
| `convex/core/people/mutations.ts` | 113 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const userId = args.userId; |
| `convex/core/people/mutations.ts` | 117 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/core/people/mutations.ts` | 132 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId ?? undefined, |
| `convex/core/people/mutations.ts` | 153 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	if (person.userId && person.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 157 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	if (person.status === 'active' && person.userId === args.userId) { |
| `convex/core/people/mutations.ts` | 162 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/people/mutations.ts` | 241 | `code` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	if (person.userId && person.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 247 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/people/mutations.ts` | 411 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: undefined |
| `convex/core/people/mutations.ts` | 443 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: undefined, |
| `convex/core/people/people.test.ts` | 15 | `string` | 3 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-session' }) |
| `convex/core/people/people.test.ts` | 56 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: undefined, |
| `convex/core/people/people.test.ts` | 66 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1', joinedAt: 123 }); |
| `convex/core/people/people.test.ts` | 86 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1' as any |
| `convex/core/people/people.test.ts` | 90 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 98 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		expect(updated.userId).toBe('user-1'); |
| `convex/core/people/people.test.ts` | 229 | `string` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	test('linkPersonToUser sets userId and activates non-archived person', async () => { |
| `convex/core/people/people.test.ts` | 242 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1' }); |
| `convex/core/people/people.test.ts` | 261 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1' as any |
| `convex/core/people/people.test.ts` | 265 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 271 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		expect(result.userId).toBe('user-1'); |
| `convex/core/people/people.test.ts` | 283 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 298 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: undefined, |
| `convex/core/people/queries.ts` | 6 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/people/queries.ts` | 24 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/people/queries.ts` | 25 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	return getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 32 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | ): Promise<{ person: PersonDoc; workspaceId: Id<'workspaces'>; linkedUser: Id<'users'> }> { |
| `convex/core/people/queries.ts` | 33 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/people/queries.ts` | 34 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const resolvedWorkspaceId = await resolveWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 35 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId); |
| `convex/core/people/queries.ts` | 46 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 51 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/people/queries.ts` | 64 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 67 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 111 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'> |
| `convex/core/people/queries.ts` | 115 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/people/queries.ts` | 128 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 133 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/core/people/queries.ts` | 178 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/people/queries.ts` | 180 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/people/queries.ts` | 196 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				userId: person.userId |
| `convex/core/people/rules.ts` | 60 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	if (person.userId) { |
| `convex/core/people/rules.ts` | 61 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const user = await ctx.db.get(person.userId); |
| `convex/core/people/tables.ts` | 8 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: v.optional(v.id('users')), // Null = invited but not signed up |
| `convex/core/people/tables.ts` | 9 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	email: v.optional(v.string()), // Provided for invited people without userId |
| `convex/core/people/tables.ts` | 28 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	invitedBy: v.optional(v.id('people')), // Who invited them (personId, not userId). Can be null for initial owner seeding. |
| `convex/core/people/tables.ts` | 41 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	.index('by_user', ['userId']) |
| `convex/core/people/tables.ts` | 42 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	.index('by_workspace_user', ['workspaceId', 'userId']) |
| `convex/core/proposals/proposals.test.ts` | 19 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | const mockConvexUser = 'u1' as Id<'users'>; |
| `convex/core/roles/roles.test.ts` | 381 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 				userId: 'u1' as Id<'users'>, |
| `convex/core/workspaces/access.ts` | 16 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/workspaces/access.ts` | 19 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/access.ts` | 32 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/workspaces/access.ts` | 35 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/access.ts` | 51 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'> |
| `convex/core/workspaces/access.ts` | 53 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	const person = await requireWorkspaceMembership(ctx, workspaceId, userId); |
| `convex/core/workspaces/access.ts` | 58 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await requirePermission(ctx, userId, 'users.invite', { workspaceId }); |
| `convex/core/workspaces/lifecycle.ts` | 7 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/lifecycle.ts` | 156 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 157 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		return createWorkspaceFlow(ctx, { name: args.name, userId }); |
| `convex/core/workspaces/lifecycle.ts` | 169 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 182 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 186 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/lifecycle.ts` | 208 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 212 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/lifecycle.ts` | 226 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	args: { name: string; userId: Id<'users'> } |
| `convex/core/workspaces/lifecycle.ts` | 249 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const user = await ctx.db.get(args.userId); |
| `convex/core/workspaces/lifecycle.ts` | 259 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/workspaces/members.ts` | 6 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/members.ts` | 21 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		memberUserId: v.id('users') |
| `convex/core/workspaces/members.ts` | 24 | `code` | 3 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/members.ts` | 30 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 	userId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 44 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/members.ts` | 45 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/core/workspaces/members.ts` | 54 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/members.ts` | 68 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		memberUserId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 69 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		actingUserId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 120 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(5) signals | 	if (!person.userId) return null; // Skip invited-only people |
| `convex/core/workspaces/members.ts` | 122 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	const user = await ctx.db.get(person.userId); |
| `convex/core/workspaces/members.ts` | 129 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		userId: person.userId, |
| `convex/core/workspaces/members.ts` | 140 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(4) signals | 	args: { workspaceId: Id<'workspaces'>; userId: Id<'users'>; role: 'owner' \| 'admin' \| 'member' } |
| `convex/core/workspaces/members.ts` | 147 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const user = await ctx.db.get(args.userId); |
| `convex/core/workspaces/members.ts` | 155 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	const existingPerson = await findPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 157 | `string` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		console.log(`User ${args.userId} is already a member of org ${args.workspaceId}`); |
| `convex/core/workspaces/members.ts` | 168 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: args.userId, |
| `convex/core/workspaces/members.ts` | 181 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 	console.log(`✅ Added user ${args.userId} to org ${args.workspaceId} with role ${args.role}`); |
| `convex/core/workspaces/mutations.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/mutations.ts` | 33 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/mutations.ts` | 34 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/queries.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/queries.ts` | 37 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 42 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, workspace._id); |
| `convex/core/workspaces/queries.ts` | 55 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 60 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/queries.ts` | 67 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | async function listWorkspaceSummaries(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/core/workspaces/queries.ts` | 68 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/workspaces/queries.ts` | 72 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/queries.ts` | 124 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 125 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const summaries = await listWorkspaceSummaries(ctx, userId); |
| `convex/core/workspaces/queries.ts` | 141 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		sessionId: v.string() // Session validation (derives userId securely) |
| `convex/core/workspaces/queries.ts` | 145 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 158 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, alias.workspaceId); |
| `convex/core/workspaces/queries.ts` | 220 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 221 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/settings.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/settings.ts` | 25 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 30 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 60 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		userId: v.string() |
| `convex/core/workspaces/settings.ts` | 65 | `string` | 6 | `user, users` | `unknown` | `low` | Mixed auth(3) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId as Id<'users'>)) // userId comes as string from session but is Id<"users"> at runtime |
| `convex/core/workspaces/settings.ts` | 92 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 125 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/settings.ts` | 144 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 170 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/settings.ts` | 183 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/settings.ts` | 192 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/settings.ts` | 204 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId, |
| `convex/core/workspaces/settings.ts` | 221 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/settings.ts` | 230 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/settings.ts` | 242 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId, |
| `convex/core/workspaces/settings.ts` | 263 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 268 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 280 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				userId, |
| `convex/core/workspaces/settings.ts` | 300 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 305 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 329 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 334 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 354 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users') |
| `convex/core/workspaces/settings.ts` | 359 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/workspaces.test.ts` | 108 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'u1', |
| `convex/core/workspaces/workspaces.test.ts` | 188 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'owner1', |
| `convex/core/workspaces/workspaces.test.ts` | 195 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			userId: 'admin', |
| `convex/docs/doc404Tracking.ts` | 23 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userAgent: v.optional(v.string()), |
| `convex/docs/doc404Tracking.ts` | 50 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userAgent: args.userAgent \|\| existing.userAgent, |
| `convex/docs/doc404Tracking.ts` | 61 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userAgent: args.userAgent, |
| `convex/features/customFields/mutations.ts` | 63 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, args.workspaceId); |
| `convex/features/customFields/mutations.ts` | 64 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/customFields/mutations.ts` | 106 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 107 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 136 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 137 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 170 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await canSetValue(ctx, userId, definition.workspaceId, args.entityType, args.entityId); |
| `convex/features/customFields/mutations.ts` | 174 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 200 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await canSetValue(ctx, userId, definition.workspaceId, definition.entityType, args.entityId); |
| `convex/features/customFields/queries.ts` | 35 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 63 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, definition.workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 93 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await requireWorkspaceMembership(ctx, values[0].workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 114 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, definition.workspaceId, userId); |
| `convex/features/customFields/rules.ts` | 47 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/customFields/tables.ts` | 57 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	name: v.string(), // Display name (user can customize for system fields) |
| `convex/features/flashcards/flashcards.test.ts` | 9 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	archiveFlashcardForUser, |
| `convex/features/flashcards/flashcards.test.ts` | 10 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	createFlashcardForUser, |
| `convex/features/flashcards/flashcards.test.ts` | 24 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('createFlashcardForUser combines auth and algorithm defaults', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 25 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 30 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const flashcardId = await createFlashcardForUser(ctx, { |
| `convex/features/flashcards/flashcards.test.ts` | 50 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 59 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 72 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('archiveFlashcardForUser deletes after ownership check', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 75 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 85 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('archiveFlashcardForUser surfaces auth errors', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 86 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockRejectedValue( |
| `convex/features/flashcards/flashcards.test.ts` | 109 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/index.ts` | 7 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	createFlashcardForUser, |
| `convex/features/flashcards/index.ts` | 8 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	createFlashcardsForUser, |
| `convex/features/flashcards/index.ts` | 10 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	archiveFlashcardForUser |
| `convex/features/flashcards/index.ts` | 13 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { listDueFlashcards, listUserFlashcards, listCollections } from './queries'; |
| `convex/features/flashcards/index.ts` | 29 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	handler: async (ctx, args): Promise<Id<'flashcards'>> => createFlashcardForUser(ctx, args) |
| `convex/features/flashcards/index.ts` | 49 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		createFlashcardsForUser(ctx, args, args.flashcards) |
| `convex/features/flashcards/index.ts` | 89 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	handler: async (ctx, args) => archiveFlashcardForUser(ctx, args) |
| `convex/features/flashcards/index.ts` | 113 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserFlashcards = query({ |
| `convex/features/flashcards/lifecycle.ts` | 20 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function createFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/lifecycle.ts` | 34 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function createFlashcardsForUser( |
| `convex/features/flashcards/lifecycle.ts` | 57 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function archiveFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/lifecycle.ts` | 67 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function restoreFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/queries.ts` | 49 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function listUserFlashcards( |
| `convex/features/flashcards/settings.ts` | 8 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		.query('userAlgorithmSettings') |
| `convex/features/flashcards/tables.ts` | 54 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | export const userAlgorithmSettingsTable = defineTable({ |
| `convex/features/inbox/access.ts` | 22 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		linkedUser |
| `convex/features/inbox/access.ts` | 29 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		linkedUser |
| `convex/features/inbox/inbox.test.ts` | 167 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			expect.objectContaining({ [USER_ID_FIELD]: actor.linkedUser, question: 'q', answer: 'a' }) |
| `convex/features/inbox/inbox.test.ts` | 211 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/inbox.test.ts` | 252 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 				[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/inbox.test.ts` | 336 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 					[USER_ID_FIELD]: actor.linkedUser |
| `convex/features/inbox/lifecycle.ts` | 69 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 112 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 183 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	actor: { linkedUser: Id<'users'>; workspaceId: Id<'workspaces'> }, |
| `convex/features/inbox/lifecycle.ts` | 189 | `string` | 3 | `user, USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		.withIndex('by_user', (q) => q.eq(USER_ID_FIELD, actor.linkedUser)) |
| `convex/features/inbox/lifecycle.ts` | 196 | `string` | 3 | `user, USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		.withIndex('by_user_name', (q) => q.eq(USER_ID_FIELD, actor.linkedUser).eq('name', 'manual')) |
| `convex/features/inbox/lifecycle.ts` | 200 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 209 | `code` | 2 | `USER, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/tables.ts` | 17 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 40 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 60 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 95 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/invites/helpers.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	ensureInviteEmailMatchesUser, |
| `convex/features/invites/helpers.ts` | 14 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	ensureNoExistingUserInvite, |
| `convex/features/invites/helpers.ts` | 19 | `string` | 3 | `User, user, users` | `unknown` | `low` | No strong auth/workspace signals detected | function findUserNameField(user: Doc<'users'> \| null): string \| null { |
| `convex/features/invites/helpers.ts` | 20 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/features/invites/helpers.ts` | 21 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const nameField = (user as Record<string, unknown>).name; |
| `convex/features/invites/helpers.ts` | 25 | `string` | 3 | `User, user, users` | `unknown` | `low` | No strong auth/workspace signals detected | function findUserEmailField(user: Doc<'users'> \| null): string \| null { |
| `convex/features/invites/helpers.ts` | 26 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/features/invites/helpers.ts` | 27 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const emailField = (user as Record<string, unknown>).email; |
| `convex/features/invites/helpers.ts` | 31 | `string` | 3 | `User, user, users` | `unknown` | `low` | No strong auth/workspace signals detected | function describeUserDisplayName(user: Doc<'users'> \| null): string { |
| `convex/features/invites/helpers.ts` | 66 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!normalizedEmail && !args.invitedUserId) { |
| `convex/features/invites/helpers.ts` | 69 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			'Either email or invitedUserId must be provided' |
| `convex/features/invites/helpers.ts` | 83 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		invitedUserId: args.invitedUserId, |
| `convex/features/invites/helpers.ts` | 122 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 123 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 151 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 			ErrorCodes.INVITE_USER_MISMATCH, |
| `convex/features/invites/helpers.ts` | 152 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			'This invite is addressed to a different user' |
| `convex/features/invites/helpers.ts` | 161 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const existingPerson = await findPersonByUserAndWorkspace(ctx, userId, invite.workspaceId); |
| `convex/features/invites/helpers.ts` | 164 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!user) { |
| `convex/features/invites/helpers.ts` | 167 | `code` | 3 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userName = findUserNameField(user); |
| `convex/features/invites/helpers.ts` | 168 | `code` | 3 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userEmail = findUserEmailField(user); |
| `convex/features/invites/helpers.ts` | 169 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/features/invites/helpers.ts` | 213 | `string` | 2 | `USER, user` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Cannot decline invite for another user'); |
| `convex/features/invites/helpers.ts` | 218 | `code` | 4 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userEmail = user ? findUserEmailField(user) : null; |
| `convex/features/invites/helpers.ts` | 219 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) { |
| `convex/features/invites/helpers.ts` | 242 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await requireCanInviteMembers(ctx, invite.workspaceId, userId); |
| `convex/features/invites/helpers.ts` | 262 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 263 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 294 | `code` | 3 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const email = user ? findUserEmailField(user) : null; |
| `convex/features/invites/helpers.ts` | 296 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const invitesByUser = await ctx.db |
| `convex/features/invites/helpers.ts` | 309 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	for (const invite of invitesByUser) { |
| `convex/features/invites/helpers.ts` | 329 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 330 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 354 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 355 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 364 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		invitedUserId: invite.invitedUserId ?? undefined |
| `convex/features/invites/helpers.ts` | 380 | `string` | 3 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		activePeople.filter((p) => p.userId).map((p) => p.userId as Id<'users'>) |
| `convex/features/invites/helpers.ts` | 391 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 400 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				invitedByName: describeUserDisplayName(inviter) |
| `convex/features/invites/mutations.ts` | 26 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const person = await requireCanInviteMembers(ctx, args.workspaceId, userId); |
| `convex/features/invites/mutations.ts` | 30 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			invitedUserId: args.inviteeUserId, |
| `convex/features/invites/mutations.ts` | 48 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return acceptWorkspaceInvite(ctx, args.code, userId, { markAccepted: false }); |
| `convex/features/invites/mutations.ts` | 61 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return acceptWorkspaceInvite(ctx, args.code, args.userId, { markAccepted: true }); |
| `convex/features/invites/mutations.ts` | 75 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return declineWorkspaceInvite(ctx, args.inviteId, userId); |
| `convex/features/invites/queries.ts` | 35 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await requireCanInviteMembers(ctx, args.workspaceId, userId); |
| `convex/features/invites/rules.ts` | 53 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function ensureNoExistingUserInvite( |
| `convex/features/invites/rules.ts` | 58 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!invitedUserId) return; |
| `convex/features/invites/rules.ts` | 60 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const existingUserInvite = await ctx.db |
| `convex/features/invites/rules.ts` | 62 | `string` | 3 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		.withIndex('by_user', (q) => q.eq('invitedUserId', invitedUserId)) |
| `convex/features/invites/rules.ts` | 66 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.INVITE_ALREADY_EXISTS, 'This user already has an invite'); |
| `convex/features/invites/rules.ts` | 78 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!invitedUserId) return; |
| `convex/features/invites/rules.ts` | 92 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function ensureInviteEmailMatchesUser( |
| `convex/features/invites/rules.ts` | 101 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userEmail = user ? ((user as Record<string, unknown>).email as string \| null) : null; |
| `convex/features/invites/rules.ts` | 103 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (userEmail && inviteEmail !== userEmail.toLowerCase()) { |
| `convex/features/invites/tables.ts` | 24 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	.index('by_user', ['invitedUserId']) |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 124 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (invitation.invitationType !== 'user') { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 125 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be accepted'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 136 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the invited user can accept this invitation'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 182 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (invitation.invitationType !== 'user') { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 183 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be declined'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 196 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			'Only the invited user can decline this invitation' |
| `convex/features/meetings/helpers/invitations/queries.ts` | 85 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			invitation.invitationType === 'user' && |
| `convex/features/meetings/helpers/queries/index.ts` | 5 | `string` | 3 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export { getInvitedUsersQuery, getInvitedUsersArgs } from './invitedUsers'; |
| `convex/features/meetings/helpers/queries/index.ts` | 6 | `string` | 3 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export { listMeetingsForUser, listMeetingsForUserArgs } from './listForUser'; |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 13 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	getInvitedUsersForMeeting |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 14 | `string` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | } from './invitedUsersUtils'; |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 18 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export const getInvitedUsersArgs = { |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 23 | `code` | 2 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export async function getInvitedUsersQuery(ctx: QueryCtx, args: GetInvitedUsersArgs) { |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 51 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	return getInvitedUsersForMeeting( |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 18 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (invitation.invitationType === 'user' && invitation.status === 'declined') { |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 97 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export async function getInvitedUsersForMeeting( |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 9 | `string` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { listMeetingsForUser } from './listForUser'; |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 36 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | describe('helpers/queries/listForUser', () => { |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 41 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await expect(listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' })).rejects.toThrow( |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 63 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					invitationType: 'user', |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 71 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const result = await listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' }); |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 8 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	getInvitedUsersForMeeting, |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 10 | `string` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | } from './invitedUsersUtils'; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | type ListForUserArgs = { sessionId: string; workspaceId: Id<'workspaces'> }; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 13 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | type MeetingWithInvitedUsers = { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 22 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const listMeetingsForUserArgs = { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 27 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function listMeetingsForUser( |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 29 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	args: ListForUserArgs |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 30 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | ): Promise<MeetingWithInvitedUsers[]> { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 121 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	meetings: MeetingWithInvitedUsers[], |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 129 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const accessible: MeetingWithInvitedUsers[] = []; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 143 | `code` | 2 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const invitedUsers = await getInvitedUsersForMeeting( |
| `convex/features/meetings/invitations.test.ts` | 49 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('accept user invitation inserts attendee and marks accepted', async () => { |
| `convex/features/meetings/invitations.test.ts` | 54 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				invitationType: 'user', |
| `convex/features/meetings/invitations.test.ts` | 88 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		).rejects.toThrow(`${ErrorCodes.GENERIC_ERROR}: Only user invitations can be declined`); |
| `convex/features/meetings/meetings.ts` | 34 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	getInvitedUsersQuery, |
| `convex/features/meetings/meetings.ts` | 39 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	listMeetingsForUser, |
| `convex/features/meetings/meetings.ts` | 42 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	getInvitedUsersArgs, |
| `convex/features/meetings/meetings.ts` | 46 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	listMeetingsForUserArgs |
| `convex/features/meetings/meetings.ts` | 81 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | export const getInvitedUsers = query({ |
| `convex/features/meetings/meetings.ts` | 84 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		...getInvitedUsersArgs |
| `convex/features/meetings/meetings.ts` | 86 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	handler: (ctx, args): Promise<unknown[]> => getInvitedUsersQuery(ctx, args) |
| `convex/features/meetings/meetings.ts` | 89 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const listForUser = query({ |
| `convex/features/meetings/meetings.ts` | 92 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		...listMeetingsForUserArgs |
| `convex/features/meetings/meetings.ts` | 94 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	handler: (ctx, args): Promise<unknown[]> => listMeetingsForUser(ctx, args) |
| `convex/features/notes/index.test.ts` | 43 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = { _id: 'p1', workspaceId: 'w1', userId: 'u1', status: 'active' } as any; |
| `convex/features/notes/index.test.ts` | 75 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('updateNote rejects when the note is not owned by the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 99 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('updateNote patches when the note is owned by the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 129 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('findNote returns null when the note does not belong to the user', async () => { |
| `convex/features/notes/index.ts` | 17 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(4) signals | type NoteActor = { personId: Id<'people'>; workspaceId: Id<'workspaces'>; userId: Id<'users'> }; |
| `convex/features/notes/index.ts` | 27 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const workspaces = await listWorkspacesForUser(ctx, userId); |
| `convex/features/notes/index.ts` | 43 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const resolvedWorkspaceId = await resolveWorkspaceId(ctx, userId, workspaceId); |
| `convex/features/notes/index.ts` | 44 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId); |
| `convex/features/onboarding/mutations.ts` | 43 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 125 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 188 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 239 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 294 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const completeUserOnboarding = mutation({ |
| `convex/features/onboarding/mutations.ts` | 302 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 34 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 69 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const _person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 135 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 145 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 155 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 190 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/readwise/access.ts` | 22 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	return runSync(ctx, { userId, workspaceId: args.workspaceId, apiKey, ...filters }); |
| `convex/features/readwise/access.ts` | 66 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	args: { userId: string; workspaceId?: Id<'workspaces'>; apiKey: string } & FetchFilters |
| `convex/features/readwise/cleanup.ts` | 192 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			{ userId, workspaceId } |
| `convex/features/readwise/cleanup.ts` | 432 | `string` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 			.query('userSettings') |
| `convex/features/readwise/filters.ts` | 58 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 		.getUserSettingsForSync as FunctionReference< |
| `convex/features/readwise/filters.ts` | 65 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	const lastSyncAt = userSettings?.lastReadwiseSyncAt; |
| `convex/features/readwise/filters.ts` | 73 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const getUserOrgIdsQuery = internal.infrastructure.access.permissions |
| `convex/features/readwise/filters.ts` | 74 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		.getUserOrganizationIdsQuery as FunctionReference< |
| `convex/features/readwise/filters.ts` | 80 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const workspaceIds = await ctx.runQuery(getUserOrgIdsQuery, { userId }); |
| `convex/features/readwise/mutations/progress.ts` | 56 | `string` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		.query('userSettings') |
| `convex/features/readwise/mutations/progress.ts` | 67 | `string` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	await ctx.db.insert('userSettings', { |
| `convex/features/readwise/mutations/queries.ts` | 59 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/features/readwise/orchestrator.ts` | 20 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const workspaceId = args.workspaceId ?? (await requireWorkspaceId(ctx, userId)); |
| `convex/features/readwise/orchestrator.ts` | 21 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/readwise/progress.ts` | 17 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	if (!person \|\| !person.userId) { |
| `convex/features/readwise/progress.ts` | 18 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		throw new Error('Person not found or missing userId'); |
| `convex/features/readwise/progress.ts` | 21 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		userId: person.userId |
| `convex/features/readwise/queries/progress.ts` | 17 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!linkedUser) return null; |
| `convex/features/readwise/readwise.test.ts` | 28 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			.mockResolvedValueOnce('user-1') // getUserId |
| `convex/features/readwise/readwise.test.ts` | 55 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const result = await parseIncrementalDate(ctx, 'user-1', undefined, undefined, undefined); |
| `convex/features/tags/access.ts` | 18 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | async function resolveWorkspace(ctx: AnyCtx, user: Id<'users'>, workspaceId?: WorkspaceId) { |
| `convex/features/tags/access.ts` | 45 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: actorUser |
| `convex/features/tags/index.ts` | 8 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	listUserTags, |
| `convex/features/tags/lifecycle.test.ts` | 85 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('createTagShare rejects when user does not own tag', async () => { |
| `convex/features/tags/lifecycle.test.ts` | 90 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				ownershipType: 'user', |
| `convex/features/tags/lifecycle.test.ts` | 113 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				ownershipType: 'user', |
| `convex/features/tags/lifecycle.ts` | 93 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	shareWith: Exclude<TagOwnership, 'user'>; |
| `convex/features/tags/lifecycle.ts` | 101 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	shareWith: Exclude<TagOwnership, 'user'>, |
| `convex/features/tags/lifecycle.ts` | 151 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (tag.ownershipType && tag.ownershipType !== 'user') { |
| `convex/features/tags/queries.ts` | 107 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const listUserTags = query({ |
| `convex/features/tags/validation.ts` | 44 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (ownership === 'user') { |
| `convex/features/tags/validation.ts` | 50 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			.filter((q) => q.eq(q.field('ownershipType'), 'user')) |
| `convex/features/tasks/access.ts` | 13 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/tasks/access.ts` | 75 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId); |
| `convex/features/tasks/access.ts` | 79 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, task.workspaceId, userId); |
| `convex/features/tasks/assignments.ts` | 13 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `convex/features/tasks/assignments.ts` | 23 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, args.userId, workspaceId); |
| `convex/features/tasks/index.ts` | 69 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 75 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			currentUserId, |
| `convex/features/tasks/index.ts` | 103 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 148 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 153 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return updateTaskAssignee(ctx, { ...args, userId }); |
| `convex/features/tasks/lifecycle.ts` | 21 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 37 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 59 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId); |
| `convex/features/tasks/lifecycle.ts` | 137 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>, |
| `convex/features/tasks/queries.ts` | 18 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 40 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 57 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 94 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, task.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 100 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	return targetUserId ?? currentUserId; |
| `convex/features/tasks/tables.ts` | 11 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/tasks.test.ts` | 39 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 	vi.useRealTimers(); |
| `convex/features/workspaceBranding/index.ts` | 14 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceBranding/index.ts` | 27 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 28 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/workspaceBranding/index.ts` | 29 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await ensureBrandingUpdatePermissions(ctx, args.workspaceId, userId); |
| `convex/features/workspaceBranding/index.ts` | 41 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 43 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 62 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 63 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		return collectBrandingForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 70 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `convex/features/workspaceBranding/index.ts` | 72 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 98 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `convex/features/workspaceBranding/index.ts` | 103 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		userId, |
| `convex/features/workspaceSettings/index.test.ts` | 6 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceSettings/index.test.ts` | 9 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId: vi.fn() |
| `convex/features/workspaceSettings/index.test.ts` | 12 | `code` | 2 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | const mockValidateSessionAndGetUserId = validateSessionAndGetUserId as vi.MockedFunction< |
| `convex/features/workspaceSettings/index.test.ts` | 13 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	typeof validateSessionAndGetUserId |
| `convex/features/workspaceSettings/index.test.ts` | 23 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any }); |
| `convex/features/workspaceSettings/index.test.ts` | 43 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any }); |
| `convex/features/workspaceSettings/index.ts` | 14 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceSettings/index.ts` | 24 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'>, |
| `convex/features/workspaceSettings/index.ts` | 29 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/features/workspaceSettings/index.ts` | 49 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 55 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/features/workspaceSettings/index.ts` | 100 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 104 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: userId, |
| `convex/features/workspaceSettings/index.ts` | 149 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		userId: v.id('users'), |
| `convex/features/workspaceSettings/index.ts` | 153 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, args.userId, args.workspaceId); |
| `convex/features/workspaceSettings/index.ts` | 204 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 207 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId); |
| `convex/features/workspaceSettings/index.ts` | 242 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 248 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/features/workspaceSettings/index.ts` | 319 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 322 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId); |
| `convex/infrastructure/access/permissions.ts` | 28 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserOrganizationIdsQuery = internalQuery({ |
| `convex/infrastructure/access/permissions.ts` | 34 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const workspaceIds = await listWorkspacesForUser(ctx, args.userId); |
| `convex/infrastructure/access/permissions.ts` | 69 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	content: { userId: string; workspaceId?: string; circleId?: string; ownershipType?: string } |
| `convex/infrastructure/access/permissions.ts` | 76 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		getUserWorkspaceIds(ctx, userId), |
| `convex/infrastructure/access/permissions.ts` | 77 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		getUserCircleIds(ctx, userId) |
| `convex/infrastructure/access/permissions.ts` | 109 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		getUserWorkspaceIds(ctx, userId), |
| `convex/infrastructure/access/permissions.ts` | 110 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		getUserCircleIds(ctx, userId) |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 14 | `string` | 3 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const userId = 'user1' as Id<'users'>; |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 18 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 26 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			async ({ userId: receivedUserId, circle }) => { |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 27 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				expect(receivedUserId).toBe(userId); |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 40 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 58 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 76 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 94 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 112 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/infrastructure/access/withCircleAccess.ts` | 17 | `code` | 2 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId: typeof validateSessionAndGetUserId; |
| `convex/infrastructure/access/withCircleAccess.ts` | 25 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		userId: Id<'users'> |
| `convex/infrastructure/access/withCircleAccess.ts` | 30 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId, |
| `convex/infrastructure/access/withCircleAccess.ts` | 32 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	isWorkspaceMember: async (ctx, workspaceId, userId) => { |
| `convex/infrastructure/access/withCircleAccess.ts` | 35 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/infrastructure/access/withCircleAccess.ts` | 50 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	handler: (input: { userId: Id<'users'>; circle: Doc<'circles'> }) => Promise<T>, |
| `convex/infrastructure/access/withCircleAccess.ts` | 54 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const { userId } = await deps.validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/access/withCircleAccess.ts` | 66 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		const isMember = await deps.isWorkspaceMember(ctx, circle.workspaceId, userId); |
| `convex/infrastructure/access/withCircleAccess.ts` | 75 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	return handler({ userId, circle }); |
| `convex/infrastructure/access/workspaceRoles.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/access/workspaceRoles.ts` | 21 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/infrastructure/access/workspaceRoles.ts` | 52 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/access/workspaceRoles.ts` | 66 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 			if (!person.userId) continue; // Skip invited-only people (no userId yet) |
| `convex/infrastructure/access/workspaceRoles.ts` | 68 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			const userId = person.userId; // TypeScript narrowing after null check |
| `convex/infrastructure/access/workspaceRoles.ts` | 69 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const user = await ctx.db.get(userId); |
| `convex/infrastructure/access/workspaceRoles.ts` | 78 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/access/workspaceRoles.ts` | 132 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				userId: userId, |
| `convex/infrastructure/access/workspaceRoles.ts` | 153 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/email.ts` | 105 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				firstName: args.firstName \|\| 'User' |
| `convex/infrastructure/email.ts` | 247 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				firstName: args.firstName \|\| 'User' |
| `convex/infrastructure/errors/codes.ts` | 10 | `string` | 2 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 	USER_NOT_FOUND: 'USER_NOT_FOUND', |
| `convex/infrastructure/errors/codes.ts` | 137 | `string` | 2 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 	INVITE_USER_MISMATCH: 'INVITE_USER_MISMATCH', |
| `convex/infrastructure/errors/codes.ts` | 187 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userMessage: string; |
| `convex/infrastructure/errors/codes.ts` | 222 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userMessage: string, |
| `convex/infrastructure/errors/codes.ts` | 226 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const serializedMessage = `SYNERGYOS_ERROR\|${code}\|${userMessage}\|${fullDetails}`; |
| `convex/infrastructure/errors/codes.ts` | 234 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	(error as any).userMessage = userMessage; |
| `convex/infrastructure/errors/codes.ts` | 240 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	console.error(`[${code}] ${userMessage}`, { |
| `convex/infrastructure/errors/codes.ts` | 242 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userMessage, |
| `convex/infrastructure/featureFlags.ts` | 5 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	findFlagsForUser, |
| `convex/infrastructure/featureFlags.ts` | 23 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	findFlagsForUser, |
| `convex/infrastructure/featureFlags/access.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import type { UserContext } from './types'; |
| `convex/infrastructure/featureFlags/debug.ts` | 1 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import type { Ctx, FeatureFlagDoc, UserContext } from './types'; |
| `convex/infrastructure/featureFlags/debug.ts` | 9 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	userContext: UserContext |
| `convex/infrastructure/featureFlags/debug.ts` | 13 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userEmail?: string; |
| `convex/infrastructure/featureFlags/debug.ts` | 21 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		{ flagConfig, userContext, flagName: flag }, |
| `convex/infrastructure/featureFlags/debug.ts` | 28 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userEmail: userContext.user?.email ?? undefined, |
| `convex/infrastructure/featureFlags/debug.ts` | 32 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			allowedUserIds: flagConfig.allowedUserIds, |
| `convex/infrastructure/featureFlags/debug.ts` | 43 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | export function buildMissingFlagDebug(flag: string, userContext: UserContext) { |
| `convex/infrastructure/featureFlags/debug.ts` | 47 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userEmail: userContext.user?.email ?? undefined, |
| `convex/infrastructure/featureFlags/impact.ts` | 2 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { findUserEmail } from './utils'; |
| `convex/infrastructure/featureFlags/impact.ts` | 6 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	totalUsers: number; |
| `convex/infrastructure/featureFlags/impact.ts` | 7 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	usersByDomain: Record<string, number>; |
| `convex/infrastructure/featureFlags/impact.ts` | 11 | `code` | 2 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const totalUsers = allUsers.length; |
| `convex/infrastructure/featureFlags/impact.ts` | 13 | `code` | 3 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const usersByDomain = countUsersByDomain(allUsers); |
| `convex/infrastructure/featureFlags/impact.ts` | 15 | `code` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const flagImpacts = flags.map((flag) => calculateImpact(flag, usersByDomain, totalUsers)); |
| `convex/infrastructure/featureFlags/impact.ts` | 18 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		totalUsers, |
| `convex/infrastructure/featureFlags/impact.ts` | 19 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		usersByDomain: Object.fromEntries(usersByDomain), |
| `convex/infrastructure/featureFlags/impact.ts` | 24 | `string` | 3 | `Users, users` | `unknown` | `low` | No strong auth/workspace signals detected | function countUsersByDomain(users: Doc<'users'>[]): Map<string, number> { |
| `convex/infrastructure/featureFlags/impact.ts` | 25 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const usersByDomain = new Map<string, number>(); |
| `convex/infrastructure/featureFlags/impact.ts` | 26 | `code` | 2 | `user, users` | `unknown` | `low` | No strong auth/workspace signals detected | 	for (const user of users) { |
| `convex/infrastructure/featureFlags/impact.ts` | 27 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const email = findUserEmail(user); |
| `convex/infrastructure/featureFlags/impact.ts` | 30 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			usersByDomain.set(domain, (usersByDomain.get(domain) \|\| 0) + 1); |
| `convex/infrastructure/featureFlags/impact.ts` | 33 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	return usersByDomain; |
| `convex/infrastructure/featureFlags/impact.ts` | 38 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	usersByDomain: Map<string, number>, |
| `convex/infrastructure/featureFlags/impact.ts` | 39 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	totalUsers: number |
| `convex/infrastructure/featureFlags/impact.ts` | 44 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		byUserIds: 0, |
| `convex/infrastructure/featureFlags/impact.ts` | 59 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			breakdown.byDomain += usersByDomain.get(domain) \|\| 0; |
| `convex/infrastructure/featureFlags/impact.ts` | 63 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (flag.allowedUserIds?.length) { |
| `convex/infrastructure/featureFlags/impact.ts` | 64 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		breakdown.byUserIds = flag.allowedUserIds.length; |
| `convex/infrastructure/featureFlags/impact.ts` | 72 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const alreadyCovered = breakdown.byDomain + breakdown.byUserIds + breakdown.byOrgIds; |
| `convex/infrastructure/featureFlags/impact.ts` | 73 | `code` | 2 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const remainingUsers = Math.max(0, totalUsers - alreadyCovered); |
| `convex/infrastructure/featureFlags/impact.ts` | 74 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		breakdown.byRollout = Math.round((remainingUsers * flag.rolloutPercentage) / 100); |
| `convex/infrastructure/featureFlags/impact.ts` | 79 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		breakdown.byUserIds, |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 12 | `string` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	allowedUserIds?: FeatureFlagDoc['allowedUserIds']; |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 29 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		allowedUserIds: args.allowedUserIds, |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 44 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		allowedUserIds: args.allowedUserIds, |
| `convex/infrastructure/featureFlags/queries.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import type { Ctx, FeatureFlagDoc, UserContext } from './types'; |
| `convex/infrastructure/featureFlags/queries.ts` | 4 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { requireAdmin, getUserContext } from './access'; |
| `convex/infrastructure/featureFlags/queries.ts` | 17 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | async function buildFlagResultsForUser( |
| `convex/infrastructure/featureFlags/queries.ts` | 20 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	userContext: UserContext |
| `convex/infrastructure/featureFlags/queries.ts` | 25 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				{ flagConfig: flag, userContext, flagName: flag.flag }, |
| `convex/infrastructure/featureFlags/queries.ts` | 43 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!flagConfig \|\| !flagConfig.enabled \|\| !userContext.user) return false; |
| `convex/infrastructure/featureFlags/queries.ts` | 44 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		return evaluateFlag({ flagConfig, userContext, flagName: args.flag }, ctx); |
| `convex/infrastructure/featureFlags/queries.ts` | 52 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = userContext.user; |
| `convex/infrastructure/featureFlags/queries.ts` | 59 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (!flagConfig \|\| !flagConfig.enabled \|\| !user) { |
| `convex/infrastructure/featureFlags/queries.ts` | 63 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			results[flag] = await evaluateFlag({ flagConfig, userContext, flagName: flag }, ctx); |
| `convex/infrastructure/featureFlags/queries.ts` | 99 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const findFlagsForUser = query({ |
| `convex/infrastructure/featureFlags/queries.ts` | 103 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = await ctx.db |
| `convex/infrastructure/featureFlags/queries.ts` | 104 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			.query('users') |
| `convex/infrastructure/featureFlags/queries.ts` | 105 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			.withIndex('by_email', (q) => q.eq('email', args.userEmail.toLowerCase())) |
| `convex/infrastructure/featureFlags/queries.ts` | 107 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!user) return null; |
| `convex/infrastructure/featureFlags/queries.ts` | 111 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const flags = await buildFlagResultsForUser(ctx, allFlags, userContext); |
| `convex/infrastructure/featureFlags/queries.ts` | 114 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userEmail: args.userEmail, |
| `convex/infrastructure/featureFlags/queries.ts` | 134 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (!flagConfig) return buildMissingFlagDebug(flag, userContext); |
| `convex/infrastructure/featureFlags/queries.ts` | 135 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		return buildDebugInfo(ctx, flag, flagConfig, userContext); |
| `convex/infrastructure/featureFlags/targeting.ts` | 3 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { getUserRolloutBucket, hasTargetingRules } from './utils'; |
| `convex/infrastructure/featureFlags/targeting.ts` | 13 | `code` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const userWorkspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/infrastructure/featureFlags/targeting.ts` | 17 | `string` | 2 | `user, users` | `unknown` | `low` | No strong auth/workspace signals detected | function isDomainAllowed(user: Doc<'users'> \| null, allowedDomains: string[] \| undefined): boolean { |
| `convex/infrastructure/featureFlags/targeting.ts` | 18 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!user?.email \|\| !allowedDomains?.length) return false; |
| `convex/infrastructure/featureFlags/targeting.ts` | 19 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const emailDomain = user.email.split('@')[1]; |
| `convex/infrastructure/featureFlags/targeting.ts` | 36 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const { flagConfig, userContext, flagName } = input; |
| `convex/infrastructure/featureFlags/targeting.ts` | 39 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!flagConfig.enabled \|\| !user) return false; |
| `convex/infrastructure/featureFlags/targeting.ts` | 42 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 43 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (isDomainAllowed(user, flagConfig.allowedDomains)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 53 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const { flagConfig, userContext, flagName } = input; |
| `convex/infrastructure/featureFlags/targeting.ts` | 57 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!user) return disabled(flagConfig, 'User not found'); |
| `convex/infrastructure/featureFlags/targeting.ts` | 60 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		return success('User ID explicitly allowed'); |
| `convex/infrastructure/featureFlags/targeting.ts` | 63 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 67 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (isDomainAllowed(user, flagConfig.allowedDomains)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 68 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const domain = user.email?.split('@')[1]; |
| `convex/infrastructure/featureFlags/targeting.ts` | 85 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	return disabled(flagConfig, 'Targeting rules exist but user does not match'); |
| `convex/infrastructure/featureFlags/types.ts` | 8 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export interface UserContext { |
| `convex/infrastructure/featureFlags/types.ts` | 10 | `string` | 2 | `user, users` | `unknown` | `low` | No strong auth/workspace signals detected | 	user: Doc<'users'> \| null; |
| `convex/infrastructure/featureFlags/types.ts` | 15 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	userContext: UserContext; |
| `convex/infrastructure/featureFlags/types.ts` | 27 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	byUserIds: number; |
| `convex/infrastructure/featureFlags/utils.ts` | 3 | `string` | 3 | `User, user, users` | `unknown` | `low` | No strong auth/workspace signals detected | export function findUserEmail(user: Doc<'users'> \| null): string \| null { |
| `convex/infrastructure/featureFlags/utils.ts` | 4 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/infrastructure/featureFlags/utils.ts` | 5 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const email = (user as Record<string, unknown>).email; |
| `convex/infrastructure/featureFlags/utils.ts` | 24 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		flagConfig.allowedUserIds !== undefined \|\| |
| `convex/infrastructure/rbac/permissions.test.ts` | 48 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 53 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 69 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.update', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 70 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId // Different owner |
| `convex/infrastructure/rbac/permissions.test.ts` | 92 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const otherUserId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 131 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId // Different owner |
| `convex/infrastructure/rbac/permissions.test.ts` | 217 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await assignRoleToUser(t, userId, circleLeadRoleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 218 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, billingRoleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 223 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.update', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 233 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'workspaces.manage-billing'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 266 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 272 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				await requirePermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 304 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 309 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			await hasPermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.ts` | 8 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export { isSystemAdmin, getUserPermissionsQuery } from './permissions/queries'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 11 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	UserPermission |
| `convex/infrastructure/rbac/permissions/access.ts` | 17 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | const scopePriority: Record<UserPermission['scope'], number> = { all: 3, own: 2, none: 1 }; |
| `convex/infrastructure/rbac/permissions/access.ts` | 46 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		reason: 'Permission not granted to user', |
| `convex/infrastructure/rbac/permissions/access.ts` | 74 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const roles = await listActiveUserRoles(ctx, userId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 83 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export async function listUserPermissions( |
| `convex/infrastructure/rbac/permissions/access.ts` | 87 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | ): Promise<UserPermission[]> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 100 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | ): Promise<UserPermission[]> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 101 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const permissions: UserPermission[] = []; |
| `convex/infrastructure/rbac/permissions/access.ts` | 123 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | function mergePermissions(permissions: UserPermission[]): UserPermission[] { |
| `convex/infrastructure/rbac/permissions/access.ts` | 124 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const merged = new Map<string, UserPermission>(); |
| `convex/infrastructure/rbac/permissions/access.ts` | 138 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/access.ts` | 174 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/access.ts` | 194 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 47 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, context.workspaceId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 5 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | import { checkIsSystemAdmin, listUserPermissions } from './access'; |
| `convex/infrastructure/rbac/permissions/queries.ts` | 15 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserPermissionsQuery = query({ |
| `convex/infrastructure/rbac/permissions/types.ts` | 28 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	\| 'users.invite' |
| `convex/infrastructure/rbac/permissions/types.ts` | 30 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	\| 'users.manage-profile' |
| `convex/infrastructure/rbac/permissions/types.ts` | 55 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export interface UserPermission { |
| `convex/infrastructure/rbac/queries.ts` | 76 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export const getUserRBACDetails = query({ |
| `convex/infrastructure/rbac/roles.ts` | 12 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/roles.ts` | 31 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		assigneeUserId: v.id('users'), |
| `convex/infrastructure/rbac/roles.ts` | 40 | `code` | 3 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 103 | `string` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/roles.ts` | 139 | `code` | 3 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 143 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		if (systemRole && 'userId' in systemRole) { |
| `convex/infrastructure/rbac/roles.ts` | 147 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			await revokeSystemRole(ctx, systemRole.userId, systemRole.role as SystemRole); |
| `convex/infrastructure/rbac/roles.ts` | 174 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		sessionId: v.string(), // Session validation (derives userId securely) |
| `convex/infrastructure/rbac/roles.ts` | 180 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 195 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/roles.ts` | 217 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 70 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const hasRole = await hasSystemRole(ctx, userId, role); |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 83 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | export async function listSystemRoles(ctx: Ctx, userId: Id<'users'>): Promise<SystemRole[]> { |
| `convex/infrastructure/rbac/seedRBAC.ts` | 86 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			'Standard user - view access and own profile management' |
| `convex/infrastructure/rbac/seedRBAC.ts` | 135 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userInvitePerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 136 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.invite', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 137 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 145 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 151 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userManageProfilePerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 152 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 153 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 155 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			'Edit user profiles (own or others)', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 221 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userInvitePerm, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 223 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userManageProfilePerm, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 236 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{ id: userInvitePerm, scope: 'all' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 237 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 248 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 258 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 267 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 28 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/infrastructure/rbac/setupAdmin.ts` | 59 | `string` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 114 | `string` | 3 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 131 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: args.assigneeUserId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 238 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const permissions = await getUserPermissions(ctx, args.targetUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 258 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | async function getUserPermissions( |
| `convex/infrastructure/tables.ts` | 34 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userAgent: v.optional(v.string()), |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 34 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const hasUser = Boolean(person.userId); |
| `convex/schema.ts` | 46 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userAlgorithmSettingsTable |
| `convex/schema.ts` | 75 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		users: usersTable, |
| `convex/schema.ts` | 104 | `code` | 2 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		userSettings: userSettingsTable, |
| `convex/schema.ts` | 118 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userAlgorithmSettings: userAlgorithmSettingsTable, |
| `e2e/auth-registration.test.ts` | 18 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should register new user with email verification', async ({ page, request }) => { |
| `e2e/auth-registration.test.ts` | 41 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			await lastNameInput.fill('User'); |
| `e2e/auth-registration.test.ts` | 119 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			await lastNameInput.fill('User'); |
| `e2e/auth-registration.test.ts` | 192 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await page.fill('input[type="email"]', 'randy+cicduser@synergyai.nl'); |
| `e2e/auth-security.test.ts` | 41 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should not allow accessing other user data', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 47 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userItemsCount = await inboxItems.count(); |
| `e2e/auth-security.test.ts` | 51 | `string` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log(`User has ${userItemsCount} inbox items`); |
| `e2e/auth-security.test.ts` | 278 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should only show user-owned inbox items', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 300 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log(`User has ${itemCount} inbox items`); |
| `e2e/fixtures.ts` | 62 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			const fileName = path.resolve(__dirname, `.auth/user-worker-${workerIndex}.json`); |
| `e2e/fixtures.ts` | 78 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 				const email = process.env[`WORKER_${workerIndex}_EMAIL`] \|\| process.env.TEST_USER_EMAIL; |
| `e2e/fixtures.ts` | 80 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 					process.env[`WORKER_${workerIndex}_PASSWORD`] \|\| process.env.TEST_USER_PASSWORD; |
| `e2e/flashcard-approval.spec.ts` | 17 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/flashcard-collections.spec.ts` | 16 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/flashcard-collections.spec.ts` | 227 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			console.log('No tag-based collections found - user has no tagged flashcards'); |
| `e2e/inbox-sync.test.ts` | 13 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('user can view inbox page', async ({ page }) => { |
| `e2e/inbox-sync.test.ts` | 26 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('user can open sync configuration', async ({ page }) => { |
| `e2e/inbox-sync.test.ts` | 63 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('user can sync Readwise highlights - import 10 items', async ({ page }) => { |
| `e2e/inbox-workflow.spec.ts` | 17 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/inbox-workflow.spec.ts` | 95 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			console.log('No inbox items found - user inbox is empty'); |
| `e2e/inbox-workflow.spec.ts` | 158 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | test.describe('Inbox Security - User Isolation', () => { |
| `e2e/inbox-workflow.spec.ts` | 159 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should only show user-owned inbox items', async ({ page }) => { |
| `e2e/inbox-workflow.spec.ts` | 170 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log(`User has ${itemCount} inbox items`); |
| `e2e/inbox-workflow.spec.ts` | 179 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should prevent access to other users inbox items', async ({ page }) => { |
| `e2e/quick-create.spec.ts` | 15 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/rate-limiting.test.ts` | 20 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			const email = 'randy+cicduser@synergyai.nl'; |
| `e2e/rate-limiting.test.ts` | 57 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					email: 'randy+cicduser@synergyai.nl', |
| `e2e/settings-security.spec.ts` | 170 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | test.describe('Settings Security - User Isolation', () => { |
| `e2e/settings-security.spec.ts` | 171 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	test('should only show authenticated user settings', async ({ page }) => { |
| `e2e/settings-security.spec.ts` | 196 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('✅ Settings loaded successfully for authenticated user'); |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 37 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 					args: { sessionId: v.string(), assigneeUserId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 83 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			errors: [{ messageId: 'userIdArg' }] |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 94 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					handler: async (ctx, args) => args.targetUserId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 108 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					handler: async (ctx, args) => getAuthUserId(ctx) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 91 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: createdBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 107 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 113 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: updatedBy uses v.optional(v.id("users"))', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 128 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 134 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: archivedBy uses v.optional(v.id("users"))', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 149 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 155 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: deletedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 170 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 176 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: modifiedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 191 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 197 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Invalid: changedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 212 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 234 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 242 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 250 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 10 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	'targetUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 11 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	'inviteeUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 12 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	'ownerUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 13 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	'candidateUserId' |
| `eslint-rules/no-legacy-auth-patterns.js` | 17 | `string` | 2 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | const USER_ID_ARG_CODE = 'USER_ID_ARG_BLOCKED'; |
| `eslint-rules/no-legacy-auth-patterns.js` | 38 | `string` | 2 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 	[USER_ID_ARG_CODE]: ['AUTH_GUARD_USER_ID_ARG'], |
| `eslint-rules/no-legacy-auth-patterns.js` | 100 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			propName === 'userId' \|\| propName === 'personId' \|\| propName.endsWith('UserId'); |
| `eslint-rules/no-legacy-auth-patterns.js` | 149 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userIdArg: |
| `eslint-rules/no-userid-in-audit-fields.js` | 53 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		field: 'invitedUserId', |
| `eslint-rules/no-userid-in-audit-fields.js` | 89 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | function isVIdUsersCall(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 97 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		node.arguments[0].value === 'users' |
| `eslint-rules/no-userid-in-audit-fields.js` | 106 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | function wrapsVIdUsers(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 115 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (node.arguments.length > 0 && isVIdUsersCall(node.arguments[0])) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 119 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		return node.arguments.some((arg) => wrapsVIdUsers(arg)); |
| `eslint-rules/no-userid-in-audit-fields.js` | 129 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | function usesVIdUsers(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 130 | `code` | 2 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	return isVIdUsersCall(node) \|\| wrapsVIdUsers(node); |
| `eslint-rules/no-userid-in-audit-fields.js` | 137 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			description: 'Enforce XDOM-01/XDOM-02: audit fields must use personId, not userId', |
| `eslint-rules/no-userid-in-audit-fields.js` | 142 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			auditFieldUsesUserId: |
| `eslint-rules/no-userid-in-audit-fields.js` | 143 | `string` | 1 | `users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				"Audit field \"{{fieldName}}\" uses v.id('users') instead of v.id('people'). " + |
| `eslint-rules/no-userid-in-audit-fields.js` | 196 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 				if (usesVIdUsers(node.value)) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 209 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 						messageId: 'auditFieldUsesUserId', |
| `scripts/add-users-to-org.ts` | 20 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	console.error('Then run: CONVEX_DEPLOY_KEY=your_key npx tsx scripts/add-users-to-org.ts'); |
| `scripts/add-users-to-org.ts` | 28 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | const USER_IDS = [ |
| `scripts/add-users-to-org.ts` | 35 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | async function addUsersToOrg() { |
| `scripts/add-users-to-org.ts` | 38 | `string` | 2 | `Users, USER` | `unknown` | `low` | No strong auth/workspace signals detected | 	console.log(`Users to add: ${USER_IDS.length}\n`); |
| `scripts/add-users-to-org.ts` | 66 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | addUsersToOrg().catch((error) => { |
| `scripts/audit-core.ts` | 26 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	'users', |
| `scripts/check-auth-guard.js` | 49 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | function hasUserIdProperty(objectExpression) { |
| `scripts/check-auth-guard.js` | 58 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | function hasUserIdArgs(callExpression, serverImports) { |
| `scripts/check-auth-guard.js` | 75 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		return hasUserIdProperty(initializer); |
| `scripts/check-auth-guard.js` | 81 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			return hasUserIdProperty(maybeArgs); |
| `scripts/check-auth-guard.js` | 127 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (ts.isCallExpression(node) && hasUserIdArgs(node, serverImports)) { |
| `scripts/check-auth-guard.js` | 129 | `string` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 				'AUTH_GUARD_USER_ID_ARG', |
| `scripts/create-worker-users.ts` | 44 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | interface WorkerUser { |
| `scripts/create-worker-users.ts` | 51 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | async function createWorkerUser(worker: WorkerUser): Promise<boolean> { |
| `scripts/create-worker-users.ts` | 87 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	console.log('This will create 5 users:'); |
| `scripts/create-worker-users.ts` | 96 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const workers: WorkerUser[] = []; |
| `scripts/create-worker-users.ts` | 107 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const results = await Promise.all(workers.map(createWorkerUser)); |
| `scripts/create-worker-users.ts` | 113 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('\n✅ All 5 worker users created successfully!\n'); |
| `scripts/create-worker-users.ts` | 115 | `string` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('# Worker Pool Users (for parallel execution)'); |
| `scripts/create-worker-users.ts` | 123 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.error('\n❌ Some users failed to create. Check errors above.'); |
| `scripts/enable-meetings-module-flag.ts` | 79 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /meetings'); |
| `scripts/enable-meetings-module-flag.ts` | 80 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /dashboard'); |
| `scripts/enable-meetings-module-flag.ts` | 81 | `string` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.log('   ❌ Users in other orgs cannot access these routes'); |
| `scripts/lint-naming/config.ts` | 65 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	new RegExp('users\\.ts$'), |
| `scripts/lint-naming/config.ts` | 80 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	'listUserTags', |
| `scripts/update-circles-feature-flag.ts` | 53 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const userId = 'jx7b6gcvkmpsppm7sqzst8s3q57v898d'; // randy@synergyai.nl |
| `scripts/update-circles-feature-flag.ts` | 59 | `string` | 3 | `User, user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			allowedUserIds: [userId as Id<'users'>] |
| `scripts/update-circles-feature-flag.ts` | 65 | `string` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		console.log(`   allowedUserIds: [${userId}]`); |
| `src/app.d.ts` | 8 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				user?: { |
| `src/hooks.server.ts` | 19 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	'/invite', // Invite acceptance page (public so users can view invites before signing in) |
| `src/hooks.server.ts` | 68 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			user: null |
| `src/lib/client/crypto.ts` | 38 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		navigator.userAgent, |
| `src/lib/client/crypto.ts` | 40 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		navigator.language, // Usually stable (user preference) |
| `src/lib/components/atoms/Combobox.stories.svelte` | 55 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				description: 'Whether users can deselect a selected option' |
| `src/lib/components/atoms/iconRegistry.ts` | 53 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	\| 'user' |
| `src/lib/components/atoms/iconRegistry.ts` | 54 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	\| 'user-plus'; |
| `src/lib/components/atoms/iconRegistry.ts` | 237 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	user: { |
| `src/lib/components/atoms/iconRegistry.ts` | 244 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	'user-plus': { |
| `src/lib/components/molecules/AccountMenu.svelte` | 10 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		targetUserId: string; |
| `src/lib/components/molecules/AccountMenu.svelte` | 20 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		targetUserId, |
| `src/lib/components/molecules/InfoCard.stories.svelte` | 44 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'This is a warning message. Use this variant to alert users about potential issues or important considerations.' |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 22 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 66 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	{#each workspaces as workspace (`${workspace.workspaceId}-${account.userId}`)} |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 72 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				onSwitchAccount?.(account.userId, `/inbox?org=${workspace.workspaceId}`); |
| `src/lib/components/organisms/ErrorBoundary.svelte` | 68 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					userAgent: navigator.userAgent |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 198 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 			document.body.style.userSelect = 'none'; |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 223 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 						document.body.style.userSelect = ''; |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 252 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 				document.body.style.userSelect = ''; |
| `src/lib/composables/usePersonSelector.svelte.ts` | 290 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId?: Id<'users'>; |
| `src/lib/infrastructure/analytics/events.ts` | 112 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		shared_from: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 123 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 127 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		evaluation_method: 'allowed_user' \| 'allowed_domain' \| 'percentage' \| 'global'; |
| `src/lib/infrastructure/analytics/events.ts` | 131 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 138 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 144 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 154 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 165 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 28 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	getUserId: () => string \| undefined |
| `src/lib/infrastructure/feature-flags/index.ts` | 27 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | export { getFlagDescription, getUserRolloutBucket, isInRollout, isAllowedDomain } from './utils'; |
| `src/lib/infrastructure/feature-flags/types.ts` | 10 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userEmail?: string; |
| `src/lib/infrastructure/feature-flags/types.ts` | 26 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	allowedUserIds?: string[]; |
| `src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts` | 64 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			? useQuery(api.infrastructure.rbac.permissions.getUserPermissionsQuery, () => { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 26 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 31 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (item.userId) { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 32 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 41 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	it('should list user workspaces with sessionId validation', async () => { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 43 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId, workspaceId: defaultWorkspaceId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 46 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 47 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 61 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId, workspaceId: defaultWorkspaceId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 63 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 84 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: adminUserId, sessionId: adminSessionId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 94 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 111 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviterUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 112 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviteeUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 122 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviterUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 123 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviteeUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 140 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: inviteeUserId, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 164 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', orgId).eq('userId', inviteeUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 175 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviterUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 176 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviteeUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 184 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviterUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 185 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviteeUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 196 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', orgId).eq('userId', inviteeUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 207 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { userId: adminUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 208 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId: memberUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 219 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 220 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: memberUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 236 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 					q.eq('workspaceId', orgId).eq('userId', memberUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 248 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: user1, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 253 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: user2, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 266 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 267 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 297 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 299 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 300 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 325 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 327 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 328 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 17 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		userId: string; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 80 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		onLogoutAccount?: (targetUserId: string) => void; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 132 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			(account) => account && account.userId |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 241 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					{#each linkedAccountsWithOrgs as account (account.userId)} |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 8 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 78 | `string` | 3 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 					memberUserId: args.memberUserId as Id<'users'> |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 64 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const userId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 65 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		invariant(userId, 'User ID is required. Please log in again.'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 63 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 87 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 113 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 134 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 141 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 161 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 165 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 187 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 191 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 219 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 223 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 254 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 258 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-1', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 274 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should clear active workspace when userId changes', async () => { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 280 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 284 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-1', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 310 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-2', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 336 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 366 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 48 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 94 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 112 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 152 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 65 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 105 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 132 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 156 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 195 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 215 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 245 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 283 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 51 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	userId?: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 57 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const getUserId = options?.userId \|\| (() => undefined); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 75 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		userId: getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 94 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		userId: getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 16 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	userId?: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 35 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	const getUserId = options.userId \|\| (() => undefined); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 121 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const userId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 125 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		if (userId !== undefined) { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 132 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				state.lastUserId = userId; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 136 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (prevUserId !== undefined && prevUserId !== userId) { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 58 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should return key with userId prefix when userId provided', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 63 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should return base key when userId is undefined', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 68 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should handle empty string userId (treated as falsy)', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 76 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should return key with userId prefix when userId provided', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 81 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should return base key when userId is undefined', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 86 | `string` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		it('should handle empty string userId (treated as falsy)', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 272 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const userId = 'user123'; |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 273 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const storageKey = getStorageKey(userId); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 274 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			const storageDetailsKey = getStorageDetailsKey(userId); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 21 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | export function getStorageKey(userId: string \| undefined): string { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 22 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX; |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 31 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | export function getStorageDetailsKey(userId: string \| undefined): string { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 32 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	return userId ? `${STORAGE_DETAILS_KEY_PREFIX}_${userId}` : STORAGE_DETAILS_KEY_PREFIX; |
| `src/lib/modules/core/api.ts` | 230 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		getUserId: () => string \| undefined, |
| `src/lib/modules/core/components/AppTopBar.svelte` | 13 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		accountEmail = 'user@example.com', |
| `src/lib/modules/core/components/notes/NoteEditor.svelte` | 498 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 68 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					<Icon type="user" size="sm" color="default" class="flex-shrink-0" /> |
| `src/lib/modules/core/components/Sidebar.svelte` | 43 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user?: { email: string; firstName?: string; lastName?: string } \| null; |
| `src/lib/modules/core/components/Sidebar.svelte` | 58 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user = null, |
| `src/lib/modules/core/components/Sidebar.svelte` | 84 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const accountEmail = user?.email ?? 'user@example.com'; |
| `src/lib/modules/core/components/Sidebar.svelte` | 85 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const accountName = user?.firstName |
| `src/lib/modules/core/components/Sidebar.svelte` | 86 | `string` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` |
| `src/lib/modules/core/components/Sidebar.svelte` | 202 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (!currentUserId) return; |
| `src/lib/modules/core/components/Sidebar.svelte` | 206 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${currentUserId}`; |
| `src/lib/modules/core/components/Sidebar.svelte` | 226 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			workspaces: map[account.userId] ?? [] |
| `src/lib/modules/core/components/Sidebar.svelte` | 396 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 	const useResizable = $derived( |
| `src/lib/modules/core/components/Sidebar.svelte` | 458 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | {#if useResizable && onSidebarWidthChange} |
| `src/lib/modules/core/components/Sidebar.svelte` | 548 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 					await authSession.switchAccount(targetUserId, '/auth/redirect?create=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 552 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 					await authSession.switchAccount(targetUserId, '/auth/redirect?join=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 565 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				onSwitchAccount={async (targetUserId, _redirectTo) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 929 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				await authSession.switchAccount(targetUserId, '/inbox?create=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 933 | `code` | 1 | `User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				await authSession.switchAccount(targetUserId, '/inbox?join=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 946 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			onSwitchAccount={async (targetUserId, _redirectTo) => { |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 37 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 49 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		accountEmail = 'user@example.com', |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 160 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				onSwitchAccount={(targetUserId, redirectTo) => onSwitchAccount?.(targetUserId, redirectTo)} |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 31 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	getUserId: () => string \| undefined, |
| `src/lib/modules/docs/components/Breadcrumb.svelte` | 26 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		'user-journeys': 'User Journeys', |
| `src/lib/modules/docs/components/Breadcrumb.svelte` | 174 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 41 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should list user flashcards', async () => { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 55 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 103 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should enforce user isolation', async () => { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 113 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			question: 'User 1 Q', |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 114 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			answer: 'User 1 A', |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 119 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user2Flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 123 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user2Flashcards.length).toBe(0); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 126 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user1); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 127 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user2); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 58 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 303 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 347 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 391 | `code` | 1 | `useR` | `unknown` | `low` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/components/InboxHeader.stories.svelte` | 118 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/inbox/components/InboxHeader.stories.svelte` | 128 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await userEvent.click(kebabButton); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 29 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 44 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should create action item assigned to user', async () => { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 48 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 78 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 93 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		expect(actionItem?.assigneeUserId).toBe(userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 101 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 170 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 208 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 237 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 245 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 264 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 294 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 304 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 323 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 358 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 368 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 387 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 417 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 418 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			description: 'User 1 Action' |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 428 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			description: 'User 2 Action' |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 434 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 438 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(items[0]?.description).toBe('User 1 Action'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 445 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 474 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 485 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 493 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 503 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 515 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 543 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 559 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 578 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 606 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 631 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 659 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 683 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 711 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 735 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 763 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 785 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 813 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 835 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const templateId = await createTestMeetingTemplate(t, org1, user1); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 27 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 46 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 91 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 130 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 167 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 186 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 230 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 274 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 313 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 47 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 85 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 120 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 163 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 201 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 240 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 279 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 315 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 350 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should add a user attendee to a meeting', async () => { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 354 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 362 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 414 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 459 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		const memberAttendee = meeting.attendees.find((a) => a.userId === attendeeId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 467 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 476 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 521 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 529 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 584 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 624 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should list meetings for current user (direct invite)', async () => { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 628 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 630 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const personId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 655 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userMeetings = await t.query(api.features.meetings.meetings.listForUser, { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 660 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(userMeetings.length).toBe(1); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 661 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(userMeetings[0].title).toBe('Private Meeting'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 668 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 670 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		const personId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 694 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userMeetings = await t.query(api.features.meetings.meetings.listForUser, { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 699 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(userMeetings.length).toBe(1); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 700 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(userMeetings[0].title).toBe('Public Meeting'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 22 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 45 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 75 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 108 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 141 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 174 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 216 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 254 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 316 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 369 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 438 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, org1, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 439 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, org2, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 481 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 43 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 44 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				id: 'user-1', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 77 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 78 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				id: 'user-1', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 83 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 84 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				id: 'user-2', |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 23 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	email?: string; // For users |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 59 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const usersQuery = |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 83 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const users = usersQuery?.data ?? []; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 84 | `code` | 2 | `user, users` | `unknown` | `low` | No strong auth/workspace signals detected | 		for (const user of users) { |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 86 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 88 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				name: user.name \|\| user.email \|\| 'Unknown', |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 89 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				email: user.email |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 152 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 153 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				return 'User'; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 162 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 172 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 91 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const activeUsers = $derived(activePresenceQuery?.error ? [] : (activePresenceQuery?.data ?? [])); |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 92 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const activeCount = $derived(activeUsers.length); |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 164 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		get activeUsers() { |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 165 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 			return activeUsers; |
| `src/lib/modules/meetings/composables/useMeetings.svelte.ts` | 54 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			? useQuery(api.features.meetings.meetings.listForUser, () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 23 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 28 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			if (item.userId) { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 29 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 40 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 42 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 45 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 71 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 73 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 76 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 106 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 108 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 111 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 142 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 144 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 147 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 174 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 175 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 177 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 180 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(5) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 183 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 184 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 214 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 215 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 217 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 222 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 223 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 264 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 265 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 267 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 272 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 273 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 311 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 312 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 313 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user3Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 315 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 322 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 323 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 324 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user3Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 356 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 358 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 361 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 382 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 383 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 385 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 390 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 391 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 418 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 419 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 421 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 426 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 427 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 465 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 466 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 468 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 475 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 476 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 515 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 516 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 525 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 526 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 24 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 29 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			if (item.userId) { |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 30 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 41 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 43 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 49 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 64 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 66 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 68 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 93 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 95 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 97 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 128 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 130 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 134 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 148 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 150 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 154 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 178 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 180 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 192 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 217 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 226 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 227 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 229 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 235 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 236 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 239 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 262 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 263 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 265 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 268 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 272 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 274 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 275 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 305 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 306 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 308 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 314 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 316 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 317 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 331 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 334 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 335 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId2, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 340 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 356 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 358 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 362 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 376 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { userId: user1 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 377 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 386 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 387 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/modules/org-chart/components/RoleCard.svelte` | 13 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(6) signals | 		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 26 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-1', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 34 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 49 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-2', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 58 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 73 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-3', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 86 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 101 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-4', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 110 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 125 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-5', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 136 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 146 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 				userId="user-6" |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 159 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-7', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 166 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.svelte` | 8 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(7) signals | 		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte` | 35 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(6) signals | 			personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/projects/api.ts` | 25 | `string` | 2 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 74 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 					? members.find((m) => m.personId === state.assigneePersonId)?.userId |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 150 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			const member = members.find((m) => m.userId === item.assigneeUserId); |
| `src/lib/types/readwise.ts` | 22 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	user_book: number; |
| `src/lib/utils/errorReporting.ts` | 18 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	userAction?: string; |
| `src/lib/utils/errorReporting.ts` | 42 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userAction, |
| `src/lib/utils/errorReporting.ts` | 59 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user_action: userAction, |
| `src/lib/utils/errorReporting.ts` | 64 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user_agent: navigator.userAgent, |
| `src/lib/utils/parseConvexError.ts` | 39 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | function extractSynergyOSUserMessage(error: Error): string { |
| `src/lib/utils/parseConvexError.ts` | 59 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 		return parts[2]; // USER_MESSAGE is third part |
| `src/lib/utils/parseConvexError.ts` | 154 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const userMessage = extractSynergyOSUserMessage(error); |
| `src/lib/utils/parseConvexError.ts` | 156 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		return userMessage \|\| 'An error occurred. Please try again.'; |
| `src/routes/(authenticated)/+layout.server.ts` | 65 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				onboardingState.userOnboardingComplete && |
| `src/routes/(authenticated)/+layout.server.ts` | 116 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					if (!onboardingState.userOnboardingComplete) { |
| `src/routes/(authenticated)/+layout.server.ts` | 254 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/(authenticated)/+layout.server.ts` | 350 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/+layout.svelte` | 87 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			? useQuery(api.infrastructure.rbac.queries.getUserRBACDetails, () => { |
| `src/routes/(authenticated)/+layout.svelte` | 164 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				email: data.user?.email ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 291 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const accountEmail = $derived(() => data.user?.email ?? 'user@example.com'); |
| `src/routes/(authenticated)/+layout.svelte` | 293 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		data.user?.firstName && data.user?.lastName |
| `src/routes/(authenticated)/+layout.svelte` | 294 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			? `${data.user.firstName} ${data.user.lastName}` |
| `src/routes/(authenticated)/+layout.svelte` | 475 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					email: data.user?.email ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 826 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				user={data.user} |
| `src/routes/(authenticated)/account/+page.server.ts` | 14 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			user: null, |
| `src/routes/(authenticated)/account/+page.server.ts` | 27 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		linkedAccounts = (await client.query(api.core.users.index.listLinkedAccounts, { |
| `src/routes/(authenticated)/account/+page.svelte` | 13 | `code` | 3 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const currentUser = $derived(data.user as UserProfileType \| null); |
| `src/routes/(authenticated)/account/+page.svelte` | 20 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userProfile: UserProfileType \| null = $state(null); |
| `src/routes/(authenticated)/account/+page.svelte` | 28 | `code` | 2 | `users, User` | `unknown` | `low` | No strong auth/workspace signals detected | 				const profile = await convexClient.query(api.core.users.index.getUserById, { |
| `src/routes/(authenticated)/account/+page.svelte` | 32 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 				userProfile = profile as UserProfileType \| null; |
| `src/routes/(authenticated)/account/+page.svelte` | 35 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			console.error('Failed to load user profile:', error); |
| `src/routes/(authenticated)/account/+page.svelte` | 58 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								{#if userProfile} |
| `src/routes/(authenticated)/account/+page.svelte` | 59 | `code` | 3 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 									<UserProfile user={userProfile} showEmail={true} avatarSize="lg" /> |
| `src/routes/(authenticated)/account/+page.svelte` | 60 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								{:else if currentUser} |
| `src/routes/(authenticated)/account/+page.svelte` | 61 | `code` | 3 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 									<UserProfile user={currentUser} showEmail={true} avatarSize="lg" /> |
| `src/routes/(authenticated)/account/+page.svelte` | 72 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 										{userProfile?.email ?? currentUser?.email ?? 'Not available'} |
| `src/routes/(authenticated)/account/+page.svelte` | 79 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						{#if userProfile?.emailVerified === false} |
| `src/routes/(authenticated)/admin/+error.svelte` | 39 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	async function switchAccount(targetUserId: string) { |
| `src/routes/(authenticated)/admin/+layout.server.ts` | 31 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/+layout.svelte` | 18 | `string` | 3 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		{ href: '/admin/users', label: 'Users', icon: 'users' }, |
| `src/routes/(authenticated)/admin/+layout.svelte` | 29 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		users: |
| `src/routes/(authenticated)/admin/+page.server.ts` | 35 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/+page.svelte` | 5 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		users: { total: number; active: number; deleted: number }; |
| `src/routes/(authenticated)/admin/+page.svelte` | 37 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 					<p class="text-label text-tertiary">Total Users</p> |
| `src/routes/(authenticated)/admin/+page.svelte` | 38 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 					<p class="mt-form-field-gap text-h2 text-primary font-semibold">{stats.users.total}</p> |
| `src/routes/(authenticated)/admin/+page.svelte` | 40 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 						{stats.users.active} active, {stats.users.deleted} deleted |
| `src/routes/(authenticated)/admin/+page.svelte` | 102 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				href="/admin/users" |
| `src/routes/(authenticated)/admin/+page.svelte` | 105 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				<h3 class="text-primary font-semibold">User Management</h3> |
| `src/routes/(authenticated)/admin/+page.svelte` | 106 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				<p class="text-small text-secondary">View and manage all users</p> |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.server.ts` | 59 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 19 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 141 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				allowedUserIds: undefined, // Not editable in UI yet |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 164 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		uniqueUsers: 234, |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 179 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (flag.allowedUserIds?.length) { |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 181 | `code` | 3 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 				`${flag.allowedUserIds.length} user${flag.allowedUserIds.length !== 1 ? 's' : ''}` |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 269 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 										~{impact.estimatedAffected.toLocaleString()} users |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 463 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 							Users with email addresses matching these domains will see the feature. |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 478 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							Shows the feature to a percentage of users based on a consistent hash. |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 527 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Unique Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 529 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 									{mockAnalytics.uniqueUsers.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.server.ts` | 27 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 31 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	let formAllowedUserIds = $state<string[]>([]); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 43 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userSearchQuery = $state(''); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 44 | `code` | 2 | `userS, User` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userSearchResult: UserFlagsResult \| null = $state(null); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 45 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userSearchLoading = $state(false); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 46 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userNotFound = $state(false); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 50 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userSearchEnabledFlags = $derived( |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 51 | `code` | 2 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		userSearchResult ? userSearchResult.flags.filter((f) => f.result) : [] |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 53 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userSearchDisabledFlags = $derived( |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 54 | `code` | 2 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		userSearchResult ? userSearchResult.flags.filter((f) => !f.result) : [] |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 69 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 79 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userEmail: string \| null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 85 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 93 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		totalUsers: number; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 94 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		usersByDomain: Record<string, number>; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 102 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				byUserIds: number; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 108 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	type UserFlagsResult = { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 109 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userEmail: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 155 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 	async function handleUserSearch() { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 158 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		userSearchLoading = true; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 159 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userNotFound = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 160 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 		userSearchResult = null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 163 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			const result = await convexClient?.query(api.infrastructure.featureFlags.findFlagsForUser, { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 165 | `code` | 2 | `user, userS` | `unknown` | `low` | No strong auth/workspace signals detected | 				userEmail: userSearchQuery.trim() |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 169 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				userNotFound = true; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 173 | `code` | 2 | `userS, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			userSearchResult = result as UserFlagsResult; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 175 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			console.error('Failed to search user flags:', error); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 176 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 			userSearchResult = null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 177 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userNotFound = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 179 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 			userSearchLoading = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 195 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				(f.allowedUserIds?.length ?? 0) > 0 \|\| |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 220 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					(flag.allowedUserIds?.length ?? 0) > 0 \|\| |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 228 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					(flag.allowedUserIds?.length ?? 0) === 0 && |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 241 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (flag.allowedUserIds?.length) { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 243 | `code` | 3 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 				`${flag.allowedUserIds.length} user${flag.allowedUserIds.length !== 1 ? 's' : ''}` |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 288 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		formAllowedUserIds = []; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 300 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		formAllowedUserIds = flag.allowedUserIds ?? []; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 327 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				allowedUserIds: |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 494 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 									<strong>Target users:</strong> Use domain targeting (e.g., @acme.com) or percentage |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 615 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 												⚠️ Enabled but no targeting rules - flag will be disabled for all users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 680 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Total Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 682 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 									{impactStats.totalUsers.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 684 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								<p class="mt-form-field-gap text-label text-secondary">System-wide user count</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 699 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Total Affected Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 713 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 									{Object.keys(impactStats.usersByDomain).length} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 722 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								Search User Impact |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 725 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								Enter a user email to see which flags affect them and why. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 729 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 									placeholder="user@example.com" |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 730 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 									bind:value={userSearchQuery} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 735 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 											handleUserSearch(); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 741 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 									onclick={handleUserSearch} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 742 | `code` | 2 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 									disabled={userSearchLoading \|\| !userSearchQuery.trim()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 744 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 									{userSearchLoading ? 'Searching...' : 'Search'} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 748 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 							{#if userSearchResult} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 753 | `code` | 2 | `userS, user` | `unknown` | `low` | No strong auth/workspace signals detected | 										Results for: {userSearchResult.userEmail} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 756 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 										{#if userSearchEnabledFlags.length > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 759 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 													✅ Enabled Flags ({userSearchEnabledFlags.length}): |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 762 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 													{#each userSearchEnabledFlags as flagFlag (flagFlag.flag)} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 774 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 										{#if userSearchDisabledFlags.length > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 777 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 													❌ Disabled Flags ({userSearchDisabledFlags.length}): |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 780 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 													{#each userSearchDisabledFlags as flagFlag (flagFlag.flag)} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 793 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 							{:else if userNotFound} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 798 | `code` | 2 | `User, userS` | `unknown` | `low` | No strong auth/workspace signals detected | 										User {userSearchQuery.trim()} not found in system |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 829 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 													Estimated affected: ~{impact.estimatedAffected.toLocaleString()} users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 833 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 													Flag is disabled - no users affected |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 877 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 												{#if impact.breakdown.byUserIds > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 881 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 														<p class="text-label text-tertiary">User ID Targeting</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 883 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 															{impact.breakdown.byUserIds.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 909 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 											{#if impact.breakdown.byDomain === 0 && impact.breakdown.byUserIds === 0 && impact.breakdown.byOrgIds === 0 && impact.breakdown.byRollout === 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 911 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 													⚠️ No targeting rules configured - flag will be disabled for all users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 931 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 							Test how a feature flag evaluates for the current logged-in user. Select a flag to see |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 965 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 									Evaluates the flag for your current user account |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1113 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							from all users. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1157 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Shows the feature to a percentage of users based on a |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1158 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								consistent hash. Same user always gets the same result. Example: 25% means roughly 1 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1159 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 								in 4 users will see it. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1182 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Users with email addresses matching these domains will |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1213 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								<li>User IDs (if set) - highest priority</li> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1219 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>Note:</strong> User and Organization targeting are not yet available in the UI. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1328 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							from all users. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1372 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Shows the feature to a percentage of users based on a |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1373 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								consistent hash. Same user always gets the same result. Example: 25% means roughly 1 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1374 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 								in 4 users will see it. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1397 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Users with email addresses matching these domains will |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1428 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								<li>User IDs (if set) - highest priority</li> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1434 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 								<strong>Note:</strong> User and Organization targeting are not yet available in the UI. |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 24 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	let allUsers: unknown[] = []; |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 36 | `code` | 2 | `Users, users` | `unknown` | `low` | No strong auth/workspace signals detected | 		allUsers = (usersResult as unknown[]) ?? []; |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 58 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 63 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		allUsers |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 60 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	let assignUserId = $state<string>(''); |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 99 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 	const allUsers = $derived( |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 100 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		(data.allUsers \|\| []) as Array<{ _id: string; email: string; name: string \| null }> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 319 | `string` | 3 | `User, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				assigneeUserId: assignUserId as Id<'users'>, |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 329 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			assignUserId = ''; |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 460 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				users: number; |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1000 | `code` | 2 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 									{analytics.systemLevel.users} unique users |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1157 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							Configure which RBAC permissions are automatically granted when users fill |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1489 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						for="assign-user-select" |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1490 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 						class="text-small text-primary mb-header block font-medium">User</label |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1493 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						id="assign-user-select" |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1494 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 						bind:value={assignUserId} |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1497 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						<option value="">Select a user...</option> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1498 | `code` | 3 | `Users, user` | `unknown` | `low` | No strong auth/workspace signals detected | 						{#each allUsers as user (user._id)} |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1499 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 							<option value={user._id}> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1500 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 								{user.name \|\| user.email} ({user.email}) |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1742 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							Configure which RBAC permissions are automatically granted when users fill this |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 16 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	let userDetails: unknown = null; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 20 | `code` | 2 | `users, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			client.query(api.admin.users.getUserById, { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 26 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userDetails = userDetailsResult as unknown; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 29 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		console.warn('Failed to load user details:', error); |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 33 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 35 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		userDetails, |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 12 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userDetails = $derived( |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 13 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		(data.userDetails \|\| null) as { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 52 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		{#if userDetails} |
| `src/routes/(authenticated)/admin/settings/+page.server.ts` | 24 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/onboarding/welcome/+page.svelte` | 24 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			await convexClient.mutation(api.features.onboarding.index.completeUserOnboarding, { |
| `src/routes/(authenticated)/onboarding/welcome/+page.svelte` | 55 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			<h3 class="text-primary mt-4 font-medium">User Onboarding Coming Soon</h3> |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 26 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				<p class="text-sm">User ID: {getUserId() ?? 'N/A'}</p> |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 27 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				<p class="text-sm">Email: {data.user?.email ?? 'N/A'}</p> |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 38 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 			const getUserSettings = makeFunctionReference( |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 39 | `string` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 				'settings:getUserSettings' |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 35 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 			const getUserSettings = makeFunctionReference( |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 36 | `string` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 				'settings:getUserSettings' |
| `src/routes/(authenticated)/w/[slug]/+layout.server.ts` | 131 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			if (!onboardingState.userOnboardingComplete) { |
| `src/routes/(authenticated)/w/[slug]/activate/components/ActivationIssueCard.svelte` | 17 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		'GOV-01': { icon: 'user', color: 'error' }, |
| `src/routes/(authenticated)/w/[slug]/flashcards/+page.svelte` | 63 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			? useQuery(api.features.flashcards.index.getUserFlashcards, () => { |
| `src/routes/(authenticated)/w/[slug]/flashcards/+page.svelte` | 144 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				const result = await convexClient.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/routes/(authenticated)/w/[slug]/meetings/[id]/+page.server.ts` | 9 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!parentData.user) { |
| `src/routes/(authenticated)/w/[slug]/meetings/+page.svelte` | 274 | `code` | 2 | `Users, user` | `unknown` | `low` | No strong auth/workspace signals detected | 											attendeeAvatars={meeting.invitedUsers?.map((user) => ({ |
| `src/routes/(authenticated)/w/[slug]/meetings/+page.svelte` | 275 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 												name: user.name, |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 112 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				userId: confirmRemoveDialog.member.userId |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 201 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 						{#each membersList as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 22 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const isAuthenticated = true; // User is always authenticated in this route (protected by server) |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 36 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 				getUserSettings: makeFunctionReference( |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 66 | `string` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 					Id<'userSettings'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 96 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, { |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 28 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	})) as Array<{ userId: string; email: string; name: string; role: 'owner' \| 'admin' \| 'member' }>; |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 31 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const currentUserEmail = locals.auth.user?.email; |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 32 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	if (!currentUserEmail) { |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 33 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		throw error(401, 'User email not found'); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 65 | `string` | 3 | `user, User, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 				userId: selectedUserId as Id<'users'>, |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 101 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 	function openAssignModalForUser(userId: string) { |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 102 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		selectedUserId = userId; |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 132 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			{#each members as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 183 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 						<Button variant="secondary" onclick={() => openAssignModalForUser(member.userId)}> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 231 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 							{#each members as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 232 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 								<option value={member.userId}> |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 36 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			? useQuery(api.features.tags.index.listUserTags, () => { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 46 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userTags = $derived(tagsQuery?.data ?? []); |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 51 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	let selectedTagForSharing = $state<(typeof userTags)[0] \| null>(null); |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 54 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	function openShareModal(tag: (typeof userTags)[0]) { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 89 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					shared_from: 'user', |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 121 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		return userTags.filter( |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 126 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userTagsList = $derived(() => { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 156 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		{:else if userTagsList().length === 0 && organizationTags().length === 0} |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 179 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			{#if userTagsList().length > 0} |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 183 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						<span class="text-tertiary text-xs font-normal">({userTagsList().length})</span> |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 186 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						{#each userTagsList() as tag (tag._id)} |
| `src/routes/+layout.server.ts` | 6 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/+layout.svelte` | 56 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (data.user) { |
| `src/routes/+layout.svelte` | 58 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 				email: data.user.email, |
| `src/routes/+layout.svelte` | 60 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					data.user.firstName && data.user.lastName |
| `src/routes/+layout.svelte` | 61 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						? `${data.user.firstName} ${data.user.lastName}` |
| `src/routes/+layout.svelte` | 62 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 						: data.user.email |
| `src/routes/dev-docs/[...path]/+error.svelte` | 120 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 208 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userPermissions = await client.query( |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 209 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 215 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view'); |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 360 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			userAgent: undefined, // Could extract from event.request.headers.get('user-agent') if needed |
| `src/routes/dev-docs/+page.svelte` | 208 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			description: 'Strategy, metrics, user journeys', |
| `src/routes/dev-docs/all/+page.svelte` | 65 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					description: 'User archetypes and their core jobs', |
| `src/routes/dev-docs/all/+page.svelte` | 118 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 					title: 'User Journeys', |
| `src/routes/dev-docs/all/+page.svelte` | 120 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					href: '/dev-docs/2-areas/user-journeys' |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 18 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const userPermissions = await client.query( |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 19 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 25 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view'); |
| `src/routes/settings/+page.svelte` | 49 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 	type UserSettings = { |
| `src/routes/settings/+page.svelte` | 67 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	const isAuthenticated = true; // User is always authenticated in this route (protected by server) |
| `src/routes/settings/+page.svelte` | 109 | `string` | 2 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 				getUserSettings: makeFunctionReference('settings:getUserSettings') as FunctionReference< |
| `src/routes/settings/+page.svelte` | 135 | `string` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 					Id<'userSettings'> |
| `src/routes/settings/+page.svelte` | 178 | `code` | 2 | `userS, UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 	let _userSettings: UserSettings \| null = $state(null); |
| `src/routes/settings/+page.svelte` | 203 | `code` | 1 | `UserS` | `unknown` | `low` | No strong auth/workspace signals detected | 			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, { |
| `src/routes/settings/+page.svelte` | 210 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 				_userSettings = { |
| `src/routes/settings/+page.svelte` | 298 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	let _isOrgAdmin = $state(false); // Whether user can edit org settings (currently unused, reserved for future org settings) |
| `src/routes/settings/permissions-test/+page.svelte` | 90 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 	async function testInviteUser() { |
| `src/routes/settings/permissions-test/+page.svelte` | 97 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const loadingToastId = toast.loading('Inviting user...'); |
| `src/routes/settings/permissions-test/+page.svelte` | 111 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				toast.success('✅ User invited successfully', { id: loadingToastId }); |
| `src/routes/settings/permissions-test/+page.svelte` | 123 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			toast.error('User not authenticated'); |
| `src/routes/settings/permissions-test/+page.svelte` | 134 | `code` | 2 | `users, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			await convexClient.mutation(api.core.users.index.updateUserProfile, { |
| `src/routes/settings/permissions-test/+page.svelte` | 138 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				lastName: 'User' |
| `src/routes/settings/permissions-test/+page.svelte` | 170 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			Test and verify the RBAC permission system with your current user account |
| `src/routes/settings/permissions-test/+page.svelte` | 189 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				<dt class="text-label text-secondary">User ID</dt> |
| `src/routes/settings/permissions-test/+page.svelte` | 239 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				requires="users.invite" |
| `src/routes/settings/permissions-test/+page.svelte` | 242 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				onclick={testInviteUser} |
| `src/routes/settings/permissions-test/+page.svelte` | 244 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				Invite User |
| `src/routes/settings/permissions-test/+page.svelte` | 247 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				requires="users.manage-profile" |
| `src/routes/settings/permissions-test/+page.svelte` | 296 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				<h3 class="text-label text-secondary mb-2 font-semibold">Can invite users?</h3> |
| `src/routes/settings/permissions-test/+page.svelte` | 297 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 				<PermissionGate can="users.invite" {permissions}> |
| `src/routes/settings/permissions-test/+page.svelte` | 299 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 						✅ You have permission to invite users |
| `src/routes/settings/permissions-test/+page.svelte` | 303 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 							❌ You don't have permission to invite users |
| `src/routes/settings/permissions-test/+page.svelte` | 341 | `code` | 1 | `USER` | `unknown` | `low` | No strong auth/workspace signals detected | 					<code class="rounded-card bg-surface px-1 py-0.5 text-xs">YOUR_USER_ID</code> with your actual |
| `src/routes/settings/permissions-test/+page.svelte` | 342 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 					user ID shown in "Current Status" above. |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 121 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			invitedBy: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 122 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			invitedByName: 'Test User', |
| `tests/convex/integration/invariants.integration.test.ts` | 39 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				lastName: 'User', |
| `tests/convex/integration/invariants.integration.test.ts` | 40 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				name: 'Invariant User', |
| `tests/convex/integration/proposals.consent.test.ts` | 30 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `tests/convex/integration/proposals.consent.test.ts` | 38 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 					q.eq('workspaceId', workspaceId).eq('userId', userId) |
| `tests/convex/integration/proposals.consent.test.ts` | 41 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(4) signals | 		const personId = (person?._id ?? userId) as Id<'people'>; |
| `tests/convex/integration/proposals.consent.test.ts` | 87 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(2) + workspace(2) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `tests/convex/integration/proposals.consent.test.ts` | 92 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			if (item.userId) { |
| `tests/convex/integration/proposals.consent.test.ts` | 93 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				await cleanupTestData(t, item.userId); |
| `tests/convex/integration/proposals.consent.test.ts` | 109 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 111 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 114 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 175 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 177 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 180 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 223 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 225 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 228 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 282 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 283 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 289 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 337 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 377 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 378 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 389 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 437 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 476 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 478 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 481 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 547 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 548 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 559 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 606 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 641 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 643 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); // Regular member, not admin |
| `tests/convex/integration/proposals.consent.test.ts` | 644 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			const personId = await getPersonIdForUser(t, orgId, userId); |
| `tests/convex/integration/proposals.consent.test.ts` | 647 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 673 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 674 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 680 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 708 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 709 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 715 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 767 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 768 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 769 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 777 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				{ userId: creatorId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 778 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				{ userId: recorderId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 779 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 				{ userId: otherId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 826 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 850 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 851 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 857 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 920 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 921 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 928 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 975 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 1019 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 1020 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 1026 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 1079 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/rbac.integration.test.ts` | 84 | `string` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const permId = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 95 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(result?.permissions[0].slug).toBe('users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 119 | `string` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const viewPermission = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 134 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should validate hasPermission with "own" scope (user editing own profile)', async () => { |
| `tests/convex/integration/rbac.integration.test.ts` | 142 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 146 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 165 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId |
| `tests/convex/integration/rbac.integration.test.ts` | 233 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 237 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 241 | `string` | 2 | `users, Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const viewPermission = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 244 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, teamLeadRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 255 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const canViewUsers = await t.run(async (ctx) => { |
| `tests/convex/integration/rbac.integration.test.ts` | 256 | `string` | 2 | `user, users` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'users.view', { workspaceId: orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 260 | `code` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(canViewUsers).toBe(true); |
| `tests/convex/integration/rbac.integration.test.ts` | 284 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 288 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 295 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId |
| `tests/convex/integration/setup.ts` | 36 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			name: 'Test User', |
| `tests/convex/integration/setup.ts` | 38 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			lastName: 'User', |
| `tests/convex/integration/setup.ts` | 60 | `code` | 1 | `userS` | `unknown` | `low` | No strong auth/workspace signals detected | 			userSnapshot: { |
| `tests/convex/integration/setup.ts` | 65 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				lastName: 'User', |
| `tests/convex/integration/setup.ts` | 66 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 				name: 'Test User' |
| `tests/convex/integration/setup.ts` | 73 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await createTestOrganizationMember(t, workspaceId, userId, 'owner'); |
| `tests/convex/integration/setup.ts` | 74 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const personId = await getPersonIdForUser(t, workspaceId, userId); |
| `tests/convex/integration/setup.ts` | 76 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(3) signals | 	return { sessionId, userId, workspaceId, personId }; |
| `tests/convex/integration/setup.ts` | 89 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 	await createTestOrganizationMember(t, resolvedWorkspaceId, userId, 'owner'); |
| `tests/convex/integration/setup.ts` | 90 | `code` | 2 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 	const personId = await getPersonIdForUser(t, resolvedWorkspaceId, userId); |
| `tests/convex/integration/setup.ts` | 97 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			ownershipType: 'user', |
| `tests/convex/integration/setup.ts` | 159 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 171 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			displayName: (user as any)?.name ?? 'Test User', |
| `tests/convex/integration/setup.ts` | 192 | `string` | 3 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 241 | `code` | 2 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			invitedUserId: options?.invitedUserId, |
| `tests/convex/integration/setup.ts` | 325 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 				throw new Error(`Person not found for user ${userId} in workspace ${context.workspaceId}`); |
| `tests/convex/integration/setup.ts` | 466 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		if (user) { |
| `tests/convex/integration/setup.ts` | 510 | `string` | 2 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', workspaceId).eq('userId', userId) |
| `tests/convex/integration/setup.ts` | 516 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(3) signals | 			personId: person?._id ?? (userId as unknown as Id<'people'>), |
| `tests/convex/integration/tags.integration.test.ts` | 25 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should list user tags without type errors', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 27 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 31 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'Test Tag 1', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 41 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should list user tags with ownership info', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 43 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 47 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(2) signals | 		await createTestTag(t, userId, 'Personal Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 61 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 65 | `string` | 2 | `user, User` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'User Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 68 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 79 | `code` | 2 | `user, User` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 83 | `code` | 1 | `user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'Detail Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 86 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 100 | `code` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 106 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 	it('should enforce user isolation', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 110 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId: _session1, userId: user1, workspaceId: ws1 } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 111 | `code` | 2 | `user` | `unknown` | `low` | Mixed auth(2) + workspace(1) signals | 		const { sessionId: session2, userId: user2, workspaceId: ws2 } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 114 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		await createTestTag(t, user1, 'User 1 Tag', ws1); |
| `tests/convex/integration/tags.integration.test.ts` | 117 | `code` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user2Tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 121 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user2Tags.length).toBe(0); |
| `tests/convex/integration/tags.integration.test.ts` | 124 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user1); |
| `tests/convex/integration/tags.integration.test.ts` | 125 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user2); |
| `tests/convex/integration/users.integration.test.ts` | 21 | `string` | 1 | `Users` | `unknown` | `low` | No strong auth/workspace signals detected | describe('Users Integration Tests', () => { |
| `tests/convex/integration/users.integration.test.ts` | 37 | `string` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 			email: 'newuser@example.com', |
| `tests/convex/integration/users.integration.test.ts` | 39 | `string` | 1 | `User` | `unknown` | `low` | No strong auth/workspace signals detected | 			lastName: 'User', |
| `tests/convex/integration/users.integration.test.ts` | 47 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 51 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 52 | `string` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.email).toBe('newuser@example.com'); |
| `tests/convex/integration/users.integration.test.ts` | 53 | `string` | 2 | `user, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('Test User'); |
| `tests/convex/integration/users.integration.test.ts` | 79 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 83 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.email).toBe('updated@example.com'); |
| `tests/convex/integration/users.integration.test.ts` | 84 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('New Name'); |
| `tests/convex/integration/users.integration.test.ts` | 95 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 106 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 118 | `string` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/users.integration.test.ts` | 122 | `code` | 3 | `User, user` | `unknown` | `low` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/users.integration.test.ts` | 127 | `code` | 2 | `users, User` | `unknown` | `low` | No strong auth/workspace signals detected | 		const result = await t.mutation(api.core.users.index.updateUserProfile, { |
| `tests/convex/integration/users.integration.test.ts` | 136 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 140 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.firstName).toBe('Updated'); |
| `tests/convex/integration/users.integration.test.ts` | 141 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.lastName).toBe('Name'); |
| `tests/convex/integration/users.integration.test.ts` | 142 | `code` | 1 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('Updated Name'); |
| `tests/convex/integration/users.integration.test.ts` | 150 | `code` | 2 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		cleanupQueue.push(user1, user2); |
| `tests/convex/integration/users.integration.test.ts` | 152 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const result = await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 154 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 			targetUserId: user2, |
| `tests/convex/integration/users.integration.test.ts` | 176 | `code` | 3 | `user` | `unknown` | `low` | No strong auth/workspace signals detected | 		cleanupQueue.push(userA, userB, userC); |
| `tests/convex/integration/users.integration.test.ts` | 179 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 181 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 			targetUserId: userB |
| `tests/convex/integration/users.integration.test.ts` | 185 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 187 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 			targetUserId: userC |
| `tests/convex/integration/users.integration.test.ts` | 191 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 		const validation = await t.query(api.core.users.index.validateAccountLink, { |
| `tests/convex/integration/users.integration.test.ts` | 193 | `code` | 2 | `User, user` | `unknown` | `low` | No strong auth/workspace signals detected | 			targetUserId: userC |
| `tests/convex/integration/users.integration.test.ts` | 213 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 221 | `code` | 1 | `users` | `unknown` | `low` | No strong auth/workspace signals detected | 			t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 232 | `code` | 2 | `users, User` | `unknown` | `low` | No strong auth/workspace signals detected | 			t.query(api.core.users.index.getCurrentUser, { |