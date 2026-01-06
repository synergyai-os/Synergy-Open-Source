---
title: Identity terminology audit (user/users)
generatedAt: 2025-12-23T08:11:54.142Z
---

## Purpose

Audit of `user` / `users` occurrences in code and UI labels (strings), including inside identifiers like `availableUsers`, `useUsers`, `UserProfile`, `userId`, with a heuristic scope classification:
- **system_auth**: global auth identity / sessions / WorkOS / `userId` / `users` table
- **workspace**: workspace-scoped organizational identity (`personId`, `people`), circles/roles/members in a workspace context
- **unknown**: needs manual review

## Totals

| Scope | Count |
|---|---:|
| system_auth | 1725 |
| workspace | 798 |
| unknown | 1641 |

## All instances

| File | Line | Match count | Matched text(s) | Scope | Reason | Snippet |
|---|---:|---:|---|---|---|---|
| `convex/admin/invariants/crossDomain.ts` | 54 | 1 | `user` | `system_auth` | Auth signals: , userId | 			name: 'No userId references in core domain tables', |
| `convex/admin/invariants/crossDomain.ts` | 59 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 					? 'Core tables use personId instead of userId' |
| `convex/admin/invariants/crossDomain.ts` | 60 | 1 | `user` | `system_auth` | Auth signals: , userId | 					: `${violations.length} record(s) still use userId-based references` |
| `convex/admin/invariants/crossDomain.ts` | 217 | 1 | `user` | `workspace` | Workspace signals: circle | 					: `${violations.length} circleItem(s) still store user-based audit fields` |
| `convex/admin/invariants/identity.ts` | 18 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			.filter((person) => !person.userId) |
| `convex/admin/invariants/identity.ts` | 23 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			name: 'Active people must have userId set', |
| `convex/admin/invariants/identity.ts` | 28 | 1 | `users` | `workspace` | Workspace signals: people | 					? 'All active people are linked to users' |
| `convex/admin/invariants/identity.ts` | 29 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} active people missing userId` |
| `convex/admin/invariants/identity.ts` | 78 | 1 | `users` | `workspace` | Workspace signals: people | 					? 'All active people rely on users.email' |
| `convex/admin/invariants/identity.ts` | 117 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (!person.userId) continue; |
| `convex/admin/invariants/identity.ts` | 118 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(person.userId); |
| `convex/admin/invariants/identity.ts` | 119 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			if (!user) { |
| `convex/admin/invariants/identity.ts` | 126 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			name: 'Every person.userId points to existing user', |
| `convex/admin/invariants/identity.ts` | 131 | 1 | `users` | `workspace` | Workspace signals: people | 					? 'All people reference valid users' |
| `convex/admin/invariants/identity.ts` | 132 | 1 | `users` | `workspace` | Workspace signals: people | 					: `${violations.length} people reference missing users` |
| `convex/admin/invariants/identity.ts` | 147 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (!person.userId) continue; |
| `convex/admin/invariants/identity.ts` | 148 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			const key = `${person.workspaceId}\|${person.userId}`; |
| `convex/admin/invariants/identity.ts` | 158 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			name: 'No duplicate (workspaceId, userId) pairs in active people', |
| `convex/admin/invariants/identity.ts` | 163 | 1 | `user` | `workspace` | Workspace signals: people, workspace | 					? 'All active people unique per workspace/user' |
| `convex/admin/invariants/identity.ts` | 164 | 1 | `user` | `workspace` | Workspace signals: workspace | 					: `${violations.length} duplicate workspace/user pairs detected` |
| `convex/admin/invariants/identity.ts` | 205 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const archivedWithoutUserId = ( |
| `convex/admin/invariants/identity.ts` | 210 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		).filter((person) => !person.userId); |
| `convex/admin/invariants/identity.ts` | 223 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const violations = archivedWithoutUserId |
| `convex/admin/invariants/identity.ts` | 229 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			name: 'Previously-active archived people preserve userId', |
| `convex/admin/invariants/identity.ts` | 234 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					? 'All previously-active archived people retain userId' |
| `convex/admin/invariants/identity.ts` | 235 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} archived people with activity history missing userId` |
| `convex/admin/invariants/identity.ts` | 243 | 2 | `users` | `system_auth` | Auth signals: query users table | 		const users = await ctx.db.query('users').collect(); |
| `convex/admin/invariants/identity.ts` | 245 | 2 | `user, users` | `unknown` | No strong auth/workspace signals detected | 		for (const user of users) { |
| `convex/admin/invariants/identity.ts` | 246 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			if (user.deletedAt) continue; |
| `convex/admin/invariants/identity.ts` | 247 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			const email = user.email.toLowerCase(); |
| `convex/admin/invariants/identity.ts` | 257 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			name: 'Every user.email is unique', |
| `convex/admin/invariants/identity.ts` | 262 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 					? 'All users have unique emails' |
| `convex/admin/invariants/identity.ts` | 263 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 					: `${violations.length} duplicate email(s) detected among active users` |
| `convex/admin/invariants/identity.ts` | 278 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				(person) => !person.displayName \|\| person.email !== undefined \|\| person.userId !== undefined |
| `convex/admin/invariants/identity.ts` | 284 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			name: 'Placeholder people have displayName, no email, no userId', |
| `convex/admin/invariants/identity.ts` | 290 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					: `${violations.length} placeholder people with invalid fields (missing displayName or have email/userId)` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 35 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, circle | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 50 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 53 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 287 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: userId ${category.createdBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 303 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: updatedBy userId ${category.updatedBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 315 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 						`⚠️  Category ${category._id}: archivedBy userId ${category.archivedBy} not found in people table for workspace ${category.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 361 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 363 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 365 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * archivedBy userId not found: ${edgeCaseStats.archivedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 448 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 						`⚠️  CircleItem ${item._id}: userId ${item.createdBy} not found in people table for workspace ${item.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 464 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 						`⚠️  CircleItem ${item._id}: updatedBy userId ${item.updatedBy} not found in people table for workspace ${item.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 503 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 505 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 539 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			`     - createdBy userId not found: ${categoryResult.edgeCaseStats.createdByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 543 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			`     - updatedBy userId not found: ${categoryResult.edgeCaseStats.updatedByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 547 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			`     - archivedBy userId not found: ${categoryResult.edgeCaseStats.archivedByNotFound}` |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 551 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		console.log(`     - createdBy userId not found: ${itemResult.edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 553 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		console.log(`     - updatedBy userId not found: ${itemResult.edgeCaseStats.updatedByNotFound}`); |
| `convex/admin/migrations/migrateCircleItemsToCustomFields.ts` | 562 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			'   2. Verify no userId references remain in circleItems/circleItemCategories tables' |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 27 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, people, workspace | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 39 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 42 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 170 | 1 | `users` | `unknown` | Mixed auth(1) + workspace(2) signals | 				const legacyCreatedBy = (project as any).createdBy as Id<'users'> \| undefined; |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 188 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 							`⚠️  Project ${project._id}: userId ${legacyCreatedBy} not found in people table for workspace ${project.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateProjectsToPersonId.ts` | 212 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 27 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 39 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 42 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 170 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 				const legacyCreatedBy = (task as any).createdBy as Id<'users'> \| undefined; |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 188 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 							`⚠️  Task ${task._id}: userId ${legacyCreatedBy} not found in people table for workspace ${task.workspaceId}, using fallback person` |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 214 | 1 | `user` | `system_auth` | Auth signals: , userId | 		console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/orgStructureImport.test.ts` | 6 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | const mockUserId = 'u1' as Id<'users'>; |
| `convex/admin/orgStructureImport.test.ts` | 10 | 3 | `User, user` | `system_auth` | Auth signals: session, userId | 	validateSessionAndGetUserId: async () => ({ userId: mockUserId }) |
| `convex/admin/orgStructureImport.test.ts` | 30 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 	test('rejects when user lacks workspace membership (error uses ErrorCodes)', async () => { |
| `convex/admin/orgStructureImport.ts` | 11 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/admin/orgStructureImport.ts` | 41 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/admin/orgStructureImport.ts` | 45 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/admin/orgStructureImport.ts` | 192 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/orgStructureImport.ts` | 195 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await ensureWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/admin/orgStructureImport.ts` | 242 | 1 | `user` | `system_auth` | Auth signals: , userId | 					updatedBy: userId |
| `convex/admin/orgStructureImport.ts` | 256 | 1 | `user` | `system_auth` | Auth signals: , userId | 					userId, |
| `convex/admin/orgStructureImport.ts` | 278 | 1 | `user` | `system_auth` | Auth signals: , userId | 					updatedBy: userId |
| `convex/admin/rbac.ts` | 195 | 1 | `User` | `workspace` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/admin/rbac.ts` | 198 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/admin/rbac.ts` | 204 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/rbac.ts` | 218 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/rbac.ts` | 229 | 1 | `user` | `workspace` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/admin/rbac.ts` | 243 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/rbac.ts` | 260 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/admin/rbac.ts` | 281 | 1 | `User` | `workspace` | Workspace signals: role | export const listUserRoles = query({ |
| `convex/admin/rbac.ts` | 289 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/rbac.ts` | 290 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 			userId: Id<'users'>; |
| `convex/admin/rbac.ts` | 291 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userEmail: string; |
| `convex/admin/rbac.ts` | 292 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userName: string; |
| `convex/admin/rbac.ts` | 310 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(systemRole.userId); |
| `convex/admin/rbac.ts` | 311 | 1 | `user` | `workspace` | Workspace signals: role | 			if (!role \|\| !user) continue; |
| `convex/admin/rbac.ts` | 314 | 1 | `user` | `workspace` | Workspace signals: role | 				userRoleId: systemRole._id, |
| `convex/admin/rbac.ts` | 315 | 2 | `user` | `system_auth` | Auth signals: , userId | 				userId: user._id, |
| `convex/admin/rbac.ts` | 316 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 				userEmail: user.email, |
| `convex/admin/rbac.ts` | 317 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 				userName: user.name \|\| user.email, |
| `convex/admin/rbac.ts` | 334 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			if (!role \|\| !person \|\| !person.userId) continue; |
| `convex/admin/rbac.ts` | 336 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const user = await ctx.db.get(person.userId); |
| `convex/admin/rbac.ts` | 337 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			if (!user) continue; |
| `convex/admin/rbac.ts` | 340 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 				userRoleId: workspaceRole._id, |
| `convex/admin/rbac.ts` | 341 | 2 | `user` | `system_auth` | Auth signals: , userId | 				userId: user._id, |
| `convex/admin/rbac.ts` | 342 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 				userEmail: user.email, |
| `convex/admin/rbac.ts` | 343 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 				userName: user.name \|\| user.email, |
| `convex/admin/rbac.ts` | 383 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 			userId: Id<'users'>; |
| `convex/admin/rbac.ts` | 392 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: systemRole.userId |
| `convex/admin/rbac.ts` | 399 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (!person \|\| !person.userId) continue; |
| `convex/admin/rbac.ts` | 403 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: person.userId, |
| `convex/admin/rbac.ts` | 469 | 2 | `Users, user` | `system_auth` | Auth signals: , userId | 		const systemLevelUsers = new Set(systemLevelAssignments.map((ur) => ur.userId.toString())); |
| `convex/admin/rbac.ts` | 501 | 2 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 				users: systemLevelUsers.size |
| `convex/admin/rbac.ts` | 718 | 1 | `users` | `workspace` | Workspace signals: role | 			throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot delete role that is assigned to users'); |
| `convex/admin/rbac.ts` | 813 | 1 | `User` | `workspace` | Workspace signals: role | export const assignRoleToUser = mutation({ |
| `convex/admin/rbac.ts` | 816 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/admin/rbac.ts` | 823 | 1 | `User` | `system_auth` | Auth signals: session | 		const adminUserId = await requireSystemAdmin(ctx, args.sessionId); |
| `convex/admin/rbac.ts` | 839 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/admin/rbac.ts` | 846 | 1 | `User` | `workspace` | Workspace signals: workspace, role, member | 					'User must be a member of the workspace to assign workspace roles' |
| `convex/admin/rbac.ts` | 860 | 1 | `user` | `workspace` | Workspace signals: role | 				return { success: true, updated: true, userRoleId: existing._id }; |
| `convex/admin/rbac.ts` | 866 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', adminUserId)) |
| `convex/admin/rbac.ts` | 870 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			const userRoleId = await ctx.db.insert('workspaceRoles', { |
| `convex/admin/rbac.ts` | 878 | 1 | `user` | `workspace` | Workspace signals: role | 			return { success: true, updated: false, userRoleId }; |
| `convex/admin/rbac.ts` | 884 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/admin/rbac.ts` | 889 | 1 | `user` | `workspace` | Workspace signals: role | 				return { success: true, updated: true, userRoleId: existing._id }; |
| `convex/admin/rbac.ts` | 892 | 1 | `user` | `workspace` | Workspace signals: role | 			const userRoleId = await ctx.db.insert('systemRoles', { |
| `convex/admin/rbac.ts` | 893 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: args.assigneeUserId, |
| `convex/admin/rbac.ts` | 896 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				grantedBy: adminUserId |
| `convex/admin/rbac.ts` | 899 | 1 | `user` | `workspace` | Workspace signals: role | 			return { success: true, updated: false, userRoleId }; |
| `convex/admin/rbac.ts` | 909 | 1 | `User` | `workspace` | Workspace signals: role | export const revokeUserRole = mutation({ |
| `convex/admin/rbac.ts` | 912 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')) |
| `convex/admin/rbac.ts` | 918 | 1 | `user` | `workspace` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 919 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		if (systemRole && 'userId' in systemRole) { |
| `convex/admin/rbac.ts` | 920 | 1 | `user` | `workspace` | Workspace signals: role | 			await ctx.db.delete(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 925 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/rbac.ts` | 927 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			await ctx.db.delete(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/rbac.ts` | 931 | 1 | `User` | `workspace` | Workspace signals: role | 		throw createError(ErrorCodes.GENERIC_ERROR, 'User role assignment not found'); |
| `convex/admin/rbac.ts` | 941 | 1 | `User` | `workspace` | Workspace signals: role | export const updateUserRole = mutation({ |
| `convex/admin/rbac.ts` | 944 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')), |
| `convex/admin/rbac.ts` | 965 | 1 | `user` | `workspace` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>); |
| `convex/admin/rbac.ts` | 966 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>); |
| `convex/admin/rbac.ts` | 969 | 1 | `User` | `workspace` | Workspace signals: role | 			throw createError(ErrorCodes.GENERIC_ERROR, 'User role assignment not found'); |
| `convex/admin/rbac.ts` | 985 | 1 | `User` | `system_auth` | Auth signals: session | 		const adminUserId = await requireSystemAdmin(ctx, args.sessionId); |
| `convex/admin/rbac.ts` | 1044 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', adminUserId)) |
| `convex/admin/rbac.ts` | 1050 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 				userId: adminUserId, |
| `convex/admin/rbac.ts` | 1053 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				grantedBy: adminUserId |
| `convex/admin/rbac.ts` | 1061 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			userId: adminUserId, |
| `convex/admin/users.ts` | 17 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | export const listAllUsers = query({ |
| `convex/admin/users.ts` | 24 | 2 | `users` | `system_auth` | Auth signals: query users table | 		const users = await ctx.db.query('users').collect(); |
| `convex/admin/users.ts` | 26 | 2 | `users, user` | `unknown` | No strong auth/workspace signals detected | 		return users.map((user) => ({ |
| `convex/admin/users.ts` | 27 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			_id: user._id, |
| `convex/admin/users.ts` | 28 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 			workosId: user.workosId, |
| `convex/admin/users.ts` | 29 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			email: user.email, |
| `convex/admin/users.ts` | 30 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			emailVerified: user.emailVerified, |
| `convex/admin/users.ts` | 31 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			firstName: user.firstName, |
| `convex/admin/users.ts` | 32 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			lastName: user.lastName, |
| `convex/admin/users.ts` | 33 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			name: user.name, |
| `convex/admin/users.ts` | 34 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			profileImageUrl: user.profileImageUrl, |
| `convex/admin/users.ts` | 35 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			createdAt: user.createdAt, |
| `convex/admin/users.ts` | 36 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			updatedAt: user.updatedAt, |
| `convex/admin/users.ts` | 37 | 1 | `user` | `system_auth` | Auth signals: login | 			lastLoginAt: user.lastLoginAt, |
| `convex/admin/users.ts` | 38 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			deletedAt: user.deletedAt |
| `convex/admin/users.ts` | 46 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserById = query({ |
| `convex/admin/users.ts` | 49 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/admin/users.ts` | 54 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const user = await ctx.db.get(args.targetUserId); |
| `convex/admin/users.ts` | 55 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (!user) { |
| `convex/admin/users.ts` | 56 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			throw createError(ErrorCodes.GENERIC_ERROR, 'User not found'); |
| `convex/admin/users.ts` | 62 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/admin/users.ts` | 76 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/users.ts` | 87 | 1 | `user` | `workspace` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/admin/users.ts` | 100 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/users.ts` | 117 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/admin/users.ts` | 130 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			_id: user._id, |
| `convex/admin/users.ts` | 131 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 			workosId: user.workosId, |
| `convex/admin/users.ts` | 132 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			email: user.email, |
| `convex/admin/users.ts` | 133 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			emailVerified: user.emailVerified, |
| `convex/admin/users.ts` | 134 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			firstName: user.firstName, |
| `convex/admin/users.ts` | 135 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			lastName: user.lastName, |
| `convex/admin/users.ts` | 136 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			name: user.name, |
| `convex/admin/users.ts` | 137 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			profileImageUrl: user.profileImageUrl, |
| `convex/admin/users.ts` | 138 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			createdAt: user.createdAt, |
| `convex/admin/users.ts` | 139 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			updatedAt: user.updatedAt, |
| `convex/admin/users.ts` | 140 | 1 | `user` | `system_auth` | Auth signals: login | 			lastLoginAt: user.lastLoginAt, |
| `convex/admin/users.ts` | 141 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			deletedAt: user.deletedAt, |
| `convex/auth.config.ts` | 16 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 			issuer: `https://api.workos.com/user_management/${clientId}`, |
| `convex/core/assignments/assignments.test.ts` | 33 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn() |
| `convex/core/assignments/assignments.test.ts` | 45 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace | import { getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/assignments/assignments.test.ts` | 56 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as ReturnType<typeof vi.fn>).mockResolvedValue({ |
| `convex/core/assignments/assignments.test.ts` | 86 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 				assigneeUserId: 'user-target' as any |
| `convex/core/assignments/mutations.ts` | 11 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace | import { getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/assignments/mutations.ts` | 25 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId: Id<'users'>; |
| `convex/core/assignments/mutations.ts` | 55 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 	const targetPerson = await getPersonByUserAndWorkspace( |
| `convex/core/assignments/mutations.ts` | 57 | 1 | `User` | `workspace` | Workspace signals: assignee | 		args.assigneeUserId, |
| `convex/core/assignments/mutations.ts` | 170 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/core/authority/authority.test.ts` | 191 | 1 | `user` | `workspace` | Workspace signals: circle, role | 		userCircleRoles?: any[]; |
| `convex/core/authority/authority.test.ts` | 198 | 2 | `user` | `workspace` | Workspace signals: circle, role | 		const userCircleRoles = overrides.userCircleRoles ?? [ |
| `convex/core/authority/authority.test.ts` | 216 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				displayName: 'Test User', |
| `convex/core/authority/authority.test.ts` | 242 | 1 | `user` | `workspace` | Workspace signals: circle, role | 					if (table === 'userCircleRoles') { |
| `convex/core/authority/authority.test.ts` | 247 | 1 | `user` | `workspace` | Workspace signals: circle, role | 								collect: async () => userCircleRoles |
| `convex/core/authority/authority.test.ts` | 281 | 1 | `user` | `workspace` | Workspace signals: circle, role | 			userCircleRoles: [{ circleRoleId: customRole._id, archivedAt: undefined }], |
| `convex/core/circles/circles.test.ts` | 37 | 1 | `User` | `workspace` | Workspace signals: circle | 				displayName: 'Test User' |
| `convex/core/circles/circles.test.ts` | 217 | 1 | `users` | `workspace` | Workspace signals: circle, member | 			test('returns non-null members filtered to existing users', async () => { |
| `convex/core/circles/circles.test.ts` | 231 | 1 | `User` | `workspace` | Workspace signals: circle | 						displayName: 'Test User', |
| `convex/core/history/capture.ts` | 42 | 1 | `user` | `workspace` | Workspace signals: circle, role | 		case 'userCircleRole': |
| `convex/core/history/capture.ts` | 70 | 1 | `user` | `workspace` | Workspace signals: circle, role | 		case 'userCircleRole': |
| `convex/core/history/capture.ts` | 138 | 1 | `user` | `workspace` | Workspace signals: circle, role | 		} else if (entityType === 'userCircleRole' && doc.circleRoleId) { |
| `convex/core/history/queries.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/history/queries.ts` | 12 | 1 | `user` | `workspace` | Workspace signals: circle, role | 			v.literal('userCircleRole'), |
| `convex/core/history/queries.ts` | 19 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/history/queries.ts` | 67 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserChanges = query({ |
| `convex/core/history/queries.ts` | 78 | 1 | `User` | `system_auth` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/history/queries.ts` | 82 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const userQuery = ctx.db |
| `convex/core/history/queries.ts` | 87 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const results = await userQuery.take(limit * 2); |
| `convex/core/index.ts` | 16 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | export * from './users'; |
| `convex/core/people/constants.ts` | 1 | 2 | `USER, user` | `unknown` | Mixed auth(1) + workspace(2) signals | export const USER_ID_FIELD = 'userId' as const; |
| `convex/core/people/mutations.ts` | 21 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId?: Id<'users'> \| null; |
| `convex/core/people/mutations.ts` | 26 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/core/people/mutations.ts` | 43 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/core/people/mutations.ts` | 85 | 4 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			if (existingByEmail.userId && args.userId && existingByEmail.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 87 | 1 | `USER` | `workspace` | Workspace signals: people, people domain path | 					ErrorCodes.INVITE_USER_MISMATCH, |
| `convex/core/people/mutations.ts` | 88 | 1 | `user` | `workspace` | Workspace signals: person/people, people, people domain path | 					'Archived person is linked to a different user' |
| `convex/core/people/mutations.ts` | 101 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId ?? existingByEmail.userId |
| `convex/core/people/mutations.ts` | 112 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	if (args.userId !== null && args.userId !== undefined) { |
| `convex/core/people/mutations.ts` | 113 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const userId = args.userId; |
| `convex/core/people/mutations.ts` | 114 | 1 | `User` | `workspace` | Workspace signals: people, people domain path | 		const existingByUser = await ctx.db |
| `convex/core/people/mutations.ts` | 116 | 1 | `user` | `workspace` | Workspace signals: people, workspace, people domain path | 			.withIndex('by_workspace_user', (q) => |
| `convex/core/people/mutations.ts` | 117 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/core/people/mutations.ts` | 121 | 2 | `User` | `workspace` | Workspace signals: people, people domain path | 		if (existingByUser && existingByUser.status !== 'archived') { |
| `convex/core/people/mutations.ts` | 124 | 1 | `User` | `workspace` | Workspace signals: people, workspace, member, people domain path | 				'User is already a member of this workspace' |
| `convex/core/people/mutations.ts` | 132 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId ?? undefined, |
| `convex/core/people/mutations.ts` | 153 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	if (person.userId && person.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 154 | 2 | `USER, user` | `workspace` | Workspace signals: people, people domain path | 		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Invite belongs to a different user'); |
| `convex/core/people/mutations.ts` | 157 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	if (person.status === 'active' && person.userId === args.userId) { |
| `convex/core/people/mutations.ts` | 162 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/people/mutations.ts` | 238 | 1 | `User` | `workspace` | Workspace signals: person/people, people, people domain path | export async function linkPersonToUser(ctx: MutationCtx, args: LinkPersonArgs): Promise<PersonDoc> { |
| `convex/core/people/mutations.ts` | 241 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	if (person.userId && person.userId !== args.userId) { |
| `convex/core/people/mutations.ts` | 242 | 2 | `USER, user` | `workspace` | Workspace signals: person/people, people, people domain path | 		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Person already linked to another user'); |
| `convex/core/people/mutations.ts` | 247 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/people/mutations.ts` | 335 | 1 | `User` | `workspace` | Workspace signals: people, people domain path | 				'User does not have permission to send invites' |
| `convex/core/people/mutations.ts` | 411 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: undefined |
| `convex/core/people/mutations.ts` | 435 | 1 | `User` | `workspace` | Workspace signals: people, people domain path | 				'User does not have permission to create placeholders' |
| `convex/core/people/mutations.ts` | 443 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: undefined, |
| `convex/core/people/people.test.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, people domain path | import { acceptInvite, archivePerson, invitePerson, linkPersonToUser } from './mutations'; |
| `convex/core/people/people.test.ts` | 8 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | 	getPersonByUserAndWorkspace, |
| `convex/core/people/people.test.ts` | 10 | 1 | `User` | `workspace` | Workspace signals: people, workspace, people domain path | 	listWorkspacesForUser |
| `convex/core/people/people.test.ts` | 15 | 3 | `User, user` | `unknown` | Mixed auth(2) + workspace(2) signals | 	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-session' }) |
| `convex/core/people/people.test.ts` | 52 | 1 | `user` | `workspace` | Workspace signals: person/people, people, people domain path | 	test('acceptInvite links user and activates person', async () => { |
| `convex/core/people/people.test.ts` | 56 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: undefined, |
| `convex/core/people/people.test.ts` | 57 | 1 | `user` | `workspace` | Workspace signals: people, people domain path | 			email: 'user@example.com', |
| `convex/core/people/people.test.ts` | 66 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1', joinedAt: 123 }); |
| `convex/core/people/people.test.ts` | 86 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1' as any |
| `convex/core/people/people.test.ts` | 90 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 98 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		expect(updated.userId).toBe('user-1'); |
| `convex/core/people/people.test.ts` | 113 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, member | 	test('getPersonByUserAndWorkspace throws when membership missing', async () => { |
| `convex/core/people/people.test.ts` | 121 | 2 | `User, user` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | 			getPersonByUserAndWorkspace(ctx, 'user-1' as any, 'workspace-1' as any) |
| `convex/core/people/people.test.ts` | 152 | 1 | `User` | `workspace` | Workspace signals: people, workspace, people domain path | 	test('listWorkspacesForUser excludes archived and de-duplicates', async () => { |
| `convex/core/people/people.test.ts` | 163 | 2 | `User, user` | `workspace` | Workspace signals: people, workspace, people domain path | 		const result = await listWorkspacesForUser(ctx, 'user-1' as any); |
| `convex/core/people/people.test.ts` | 229 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	test('linkPersonToUser sets userId and activates non-archived person', async () => { |
| `convex/core/people/people.test.ts` | 235 | 1 | `user` | `workspace` | Workspace signals: people, people domain path | 			email: 'user@example.com', |
| `convex/core/people/people.test.ts` | 242 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1' }); |
| `convex/core/people/people.test.ts` | 259 | 1 | `User` | `workspace` | Workspace signals: person/people, people, people domain path | 		const result = await linkPersonToUser(ctx, { |
| `convex/core/people/people.test.ts` | 261 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1' as any |
| `convex/core/people/people.test.ts` | 265 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 271 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		expect(result.userId).toBe('user-1'); |
| `convex/core/people/people.test.ts` | 274 | 1 | `user` | `workspace` | Workspace signals: person/people, people, people domain path | 	test('getPersonEmail returns user email when linked', async () => { |
| `convex/core/people/people.test.ts` | 277 | 2 | `user` | `workspace` | Workspace signals: people, people domain path | 				get: vi.fn().mockResolvedValue({ _id: 'user-1', email: 'user@example.com' }) |
| `convex/core/people/people.test.ts` | 283 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'user-1', |
| `convex/core/people/people.test.ts` | 287 | 1 | `user` | `workspace` | Workspace signals: people, people domain path | 		expect(email).toBe('user@example.com'); |
| `convex/core/people/people.test.ts` | 288 | 1 | `user` | `workspace` | Workspace signals: people, people domain path | 		expect(ctx.db.get).toHaveBeenCalledWith('user-1'); |
| `convex/core/people/people.test.ts` | 298 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: undefined, |
| `convex/core/people/queries.ts` | 6 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/people/queries.ts` | 7 | 1 | `USER` | `workspace` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from './constants'; |
| `convex/core/people/queries.ts` | 24 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/people/queries.ts` | 25 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	return getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 32 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(4) signals | ): Promise<{ person: PersonDoc; workspaceId: Id<'workspaces'>; linkedUser: Id<'users'> }> { |
| `convex/core/people/queries.ts` | 33 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/people/queries.ts` | 34 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const resolvedWorkspaceId = await resolveWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 35 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId); |
| `convex/core/people/queries.ts` | 37 | 2 | `User, USER` | `workspace` | Workspace signals: person/people, people, people domain path | 	const linkedUser = activePerson[USER_ID_FIELD]; |
| `convex/core/people/queries.ts` | 38 | 1 | `User` | `workspace` | Workspace signals: people, people domain path | 	if (!linkedUser) { |
| `convex/core/people/queries.ts` | 39 | 1 | `user` | `workspace` | Workspace signals: person/people, people, workspace, member | 		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is missing linked user'); |
| `convex/core/people/queries.ts` | 41 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | 	return { person: activePerson, workspaceId: resolvedWorkspaceId, linkedUser }; |
| `convex/core/people/queries.ts` | 46 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 51 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/people/queries.ts` | 62 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | export async function getPersonByUserAndWorkspace( |
| `convex/core/people/queries.ts` | 64 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 67 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/people/queries.ts` | 71 | 1 | `User` | `workspace` | Workspace signals: people, workspace, member, people domain path | 			'User is not a member of this workspace' |
| `convex/core/people/queries.ts` | 109 | 1 | `User` | `workspace` | Workspace signals: people, workspace, people domain path | export async function listWorkspacesForUser( |
| `convex/core/people/queries.ts` | 111 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'> |
| `convex/core/people/queries.ts` | 115 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/people/queries.ts` | 126 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | export async function findPersonByUserAndWorkspace( |
| `convex/core/people/queries.ts` | 128 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/people/queries.ts` | 133 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/core/people/queries.ts` | 178 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/people/queries.ts` | 180 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/people/queries.ts` | 196 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 				userId: person.userId |
| `convex/core/people/rules.ts` | 60 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	if (person.userId) { |
| `convex/core/people/rules.ts` | 61 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const user = await ctx.db.get(person.userId); |
| `convex/core/people/rules.ts` | 62 | 1 | `user` | `workspace` | Workspace signals: people, people domain path | 		return user?.email ?? null; |
| `convex/core/people/tables.ts` | 8 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: v.optional(v.id('users')), // Null = invited but not signed up |
| `convex/core/people/tables.ts` | 9 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	email: v.optional(v.string()), // Provided for invited people without userId |
| `convex/core/people/tables.ts` | 28 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	invitedBy: v.optional(v.id('people')), // Who invited them (personId, not userId). Can be null for initial owner seeding. |
| `convex/core/people/tables.ts` | 41 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	.index('by_user', ['userId']) |
| `convex/core/people/tables.ts` | 42 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	.index('by_workspace_user', ['workspaceId', 'userId']) |
| `convex/core/policies/mutations.ts` | 3 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/policies/mutations.ts` | 12 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/policies/queries.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/policies/queries.ts` | 12 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/proposals/proposals.test.ts` | 19 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | const mockConvexUser = 'u1' as Id<'users'>; |
| `convex/core/proposals/proposals.test.ts` | 102 | 2 | `User` | `workspace` | Workspace signals: proposal | 		linkedUser: mockConvexUser |
| `convex/core/roles/mutations.ts` | 32 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	handleUserCircleRoleCreated, |
| `convex/core/roles/mutations.ts` | 33 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	handleUserCircleRoleRemoved, |
| `convex/core/roles/mutations.ts` | 34 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	handleUserCircleRoleRestored |
| `convex/core/roles/mutations.ts` | 102 | 1 | `User` | `workspace` | Workspace signals: circle, role | 		await handleUserCircleRoleRemoved(ctx, assignment._id); |
| `convex/core/roles/mutations.ts` | 414 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	await handleUserCircleRoleRestored(ctx, args.assignmentId); |
| `convex/core/roles/mutations.ts` | 493 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	await handleUserCircleRoleCreated( |
| `convex/core/roles/mutations.ts` | 546 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	await handleUserCircleRoleRemoved(ctx, assignment._id); |
| `convex/core/roles/queries.ts` | 249 | 1 | `User` | `workspace` | Workspace signals: role | async function listUserRoles( |
| `convex/core/roles/queries.ts` | 499 | 1 | `User` | `workspace` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/core/roles/queries.ts` | 506 | 1 | `User` | `workspace` | Workspace signals: role | 	handler: async (ctx, args) => listUserRoles(ctx, args) |
| `convex/core/roles/roleRbac.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: circle, role | export async function handleUserCircleRoleCreated( |
| `convex/core/roles/roleRbac.ts` | 75 | 1 | `User` | `workspace` | Workspace signals: circle, role | export async function handleUserCircleRoleRemoved( |
| `convex/core/roles/roleRbac.ts` | 89 | 1 | `User` | `workspace` | Workspace signals: circle, role | export async function handleUserCircleRoleRestored( |
| `convex/core/roles/roleRbac.ts` | 109 | 1 | `User` | `workspace` | Workspace signals: circle, role | 	await handleUserCircleRoleCreated( |
| `convex/core/roles/roles.test.ts` | 51 | 1 | `user` | `workspace` | Workspace signals: circle, role | 				userCircleRoles: [] |
| `convex/core/roles/roles.test.ts` | 198 | 1 | `User` | `workspace` | Workspace signals: circle, role | 			handleUserCircleRoleCreated: vi.fn(), |
| `convex/core/roles/roles.test.ts` | 199 | 1 | `User` | `workspace` | Workspace signals: circle, role | 			handleUserCircleRoleRemoved: vi.fn() |
| `convex/core/roles/roles.test.ts` | 244 | 1 | `User` | `workspace` | Workspace signals: circle, role | 			handleUserCircleRoleCreated: vi.fn(), |
| `convex/core/roles/roles.test.ts` | 245 | 1 | `User` | `workspace` | Workspace signals: circle, role | 			handleUserCircleRoleRemoved: vi.fn() |
| `convex/core/roles/roles.test.ts` | 381 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 				userId: 'u1' as Id<'users'>, |
| `convex/core/roles/roles.test.ts` | 383 | 1 | `User` | `workspace` | Workspace signals: role | 				displayName: 'Test User', |
| `convex/core/roles/templates/mutations.ts` | 34 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, args.workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 35 | 1 | `user` | `workspace` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/roles/templates/mutations.ts` | 94 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 95 | 1 | `user` | `workspace` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/roles/templates/mutations.ts` | 165 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace, role | 		const userIsAdmin = await isWorkspaceAdmin(ctx, template.workspaceId, personId); |
| `convex/core/roles/templates/mutations.ts` | 166 | 1 | `user` | `workspace` | Workspace signals: role | 		if (!userIsAdmin) { |
| `convex/core/users/mutations.ts` | 14 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/users/mutations.ts` | 20 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const syncUserFromWorkOS = mutation({ |
| `convex/core/users/mutations.ts` | 31 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 34 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		return upsertWorkosUser(ctx, { |
| `convex/core/users/mutations.ts` | 41 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const ensureWorkosUser = mutation({ |
| `convex/core/users/mutations.ts` | 52 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 54 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		return upsertWorkosUser(ctx, args); |
| `convex/core/users/mutations.ts` | 58 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const updateUserProfile = mutation({ |
| `convex/core/users/mutations.ts` | 61 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 76 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 80 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 81 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await ensureLinkable(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 82 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined); |
| `convex/core/users/mutations.ts` | 91 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 95 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 96 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await ensureLinkable(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 97 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined); |
| `convex/core/users/mutations.ts` | 105 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/mutations.ts` | 108 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 109 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		if (userId === args.targetUserId) { |
| `convex/core/users/mutations.ts` | 113 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await removeBidirectionalLink(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 121 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/mutations.ts` | 124 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 125 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		await removeBidirectionalLink(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 134 | 1 | `User` | `system_auth` | Auth-domain file pattern match | async function upsertWorkosUser( |
| `convex/core/users/mutations.ts` | 143 | 1 | `users` | `system_auth` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/mutations.ts` | 144 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const identity = await ctx.auth.getUserIdentity(); |
| `convex/core/users/mutations.ts` | 149 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const existingUser = await ctx.db |
| `convex/core/users/mutations.ts` | 150 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 		.query('users') |
| `convex/core/users/mutations.ts` | 157 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	if (existingUser) { |
| `convex/core/users/mutations.ts` | 158 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		await ctx.db.patch(existingUser._id, { |
| `convex/core/users/mutations.ts` | 167 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		return existingUser._id; |
| `convex/core/users/mutations.ts` | 170 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	return await ctx.db.insert('users', { |
| `convex/core/users/mutations.ts` | 187 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: Id<'users'>; |
| `convex/core/users/mutations.ts` | 193 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	await requireProfilePermission(ctx, args.sessionId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 195 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	const updates: Partial<Doc<'users'>> & { updatedAt: number } = { |
| `convex/core/users/mutations.ts` | 212 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const user = await ctx.db.get(args.targetUserId); |
| `convex/core/users/mutations.ts` | 214 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			args.firstName ?? user?.firstName, |
| `convex/core/users/mutations.ts` | 215 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			args.lastName ?? user?.lastName |
| `convex/core/users/mutations.ts` | 219 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	await ctx.db.patch(args.targetUserId, updates); |
| `convex/core/users/mutations.ts` | 226 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 227 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	linkedUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 230 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	if (await linkExists(ctx, primaryUserId, linkedUserId)) { |
| `convex/core/users/mutations.ts` | 235 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		primaryUserId, |
| `convex/core/users/mutations.ts` | 236 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		linkedUserId, |
| `convex/core/users/mutations.ts` | 245 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 246 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	linkedUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 249 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	await createDirectedLink(ctx, primaryUserId, linkedUserId, linkType); |
| `convex/core/users/mutations.ts` | 250 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	await createDirectedLink(ctx, linkedUserId, primaryUserId, linkType); |
| `convex/core/users/mutations.ts` | 255 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	currentUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 256 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/mutations.ts` | 258 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	const targetUser = await ctx.db.get(targetUserId); |
| `convex/core/users/mutations.ts` | 259 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	if (!targetUser) { |
| `convex/core/users/mutations.ts` | 265 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', currentUserId)) |
| `convex/core/users/mutations.ts` | 266 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		.filter((q) => q.eq(q.field('linkedUserId'), targetUserId)) |
| `convex/core/users/mutations.ts` | 274 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', targetUserId)) |
| `convex/core/users/mutations.ts` | 275 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		.filter((q) => q.eq(q.field('linkedUserId'), currentUserId)) |
| `convex/core/users/queries.ts` | 5 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { requireSessionUserId, linkExists } from './rules'; |
| `convex/core/users/queries.ts` | 6 | 2 | `User` | `system_auth` | Auth-domain file pattern match | import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/users/queries.ts` | 8 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const getUserById = query({ |
| `convex/core/users/queries.ts` | 11 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 12 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return await ctx.db.get(userId); |
| `convex/core/users/queries.ts` | 16 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const getUserByWorkosId = query({ |
| `convex/core/users/queries.ts` | 19 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 21 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 			.query('users') |
| `convex/core/users/queries.ts` | 27 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export const getCurrentUser = query({ |
| `convex/core/users/queries.ts` | 30 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 31 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return await ctx.db.get(userId); |
| `convex/core/users/queries.ts` | 38 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/queries.ts` | 41 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 42 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const exists = await linkExists(ctx, userId, args.targetUserId); |
| `convex/core/users/queries.ts` | 50 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 51 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return await listLinked(ctx, userId); |
| `convex/core/users/queries.ts` | 66 | 3 | `User, user, users` | `system_auth` | Auth-domain file pattern match | export async function listOrgLinksForUser(ctx: QueryCtx, userId: Id<'users'>): Promise<OrgLink[]> { |
| `convex/core/users/queries.ts` | 67 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/users/queries.ts` | 71 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/users/queries.ts` | 89 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | async function listLinked(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/core/users/queries.ts` | 92 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', userId)) |
| `convex/core/users/queries.ts` | 96 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		userId: Id<'users'>; |
| `convex/core/users/queries.ts` | 106 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		const user = await ctx.db.get(link.linkedUserId); |
| `convex/core/users/queries.ts` | 107 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		if (!user) continue; |
| `convex/core/users/queries.ts` | 110 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 			userId: link.linkedUserId, |
| `convex/core/users/queries.ts` | 111 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			email: user.email ?? null, |
| `convex/core/users/queries.ts` | 112 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			name: user.name ?? null, |
| `convex/core/users/queries.ts` | 113 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			firstName: user.firstName ?? null, |
| `convex/core/users/queries.ts` | 114 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			lastName: user.lastName ?? null, |
| `convex/core/users/rules.ts` | 3 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/users/rules.ts` | 12 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export async function requireSessionUserId( |
| `convex/core/users/rules.ts` | 15 | 1 | `users` | `system_auth` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/rules.ts` | 16 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/users/rules.ts` | 17 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	return userId; |
| `convex/core/users/rules.ts` | 23 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 24 | 1 | `users` | `system_auth` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/rules.ts` | 25 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/users/rules.ts` | 27 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	await requirePermission(ctx, userId, 'users.manage-profile', { |
| `convex/core/users/rules.ts` | 28 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		resourceOwnerId: targetUserId |
| `convex/core/users/rules.ts` | 31 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	return userId; |
| `convex/core/users/rules.ts` | 52 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/rules.ts` | 53 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	linkedUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 55 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	if (primaryUserId === linkedUserId) { |
| `convex/core/users/rules.ts` | 60 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	const queue: Array<{ userId: Id<'users'>; depth: number }> = [ |
| `convex/core/users/rules.ts` | 61 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		{ userId: primaryUserId, depth: 0 } |
| `convex/core/users/rules.ts` | 71 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		if (visited.has(current.userId)) { |
| `convex/core/users/rules.ts` | 74 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		visited.add(current.userId); |
| `convex/core/users/rules.ts` | 77 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			console.warn(`User ${primaryUserId} has too many linked accounts (>${MAX_TOTAL_ACCOUNTS})`); |
| `convex/core/users/rules.ts` | 83 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId)) |
| `convex/core/users/rules.ts` | 87 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			if (link.linkedUserId === linkedUserId) { |
| `convex/core/users/rules.ts` | 90 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			if (!visited.has(link.linkedUserId)) { |
| `convex/core/users/rules.ts` | 91 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 }); |
| `convex/core/users/rules.ts` | 101 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	userId: Id<'users'>, |
| `convex/core/users/rules.ts` | 103 | 1 | `users` | `system_auth` | Auth-domain file pattern match | ): Promise<Set<Id<'users'>>> { |
| `convex/core/users/rules.ts` | 104 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	const visited = new Set<Id<'users'>>(); |
| `convex/core/users/rules.ts` | 105 | 3 | `user, users` | `system_auth` | Auth-domain file pattern match | 	const queue: Array<{ userId: Id<'users'>; depth: number }> = [{ userId, depth: 0 }]; |
| `convex/core/users/rules.ts` | 109 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		if (visited.has(current.userId)) { |
| `convex/core/users/rules.ts` | 113 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		visited.add(current.userId); |
| `convex/core/users/rules.ts` | 120 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId)) |
| `convex/core/users/rules.ts` | 124 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			if (!visited.has(link.linkedUserId)) { |
| `convex/core/users/rules.ts` | 125 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 }); |
| `convex/core/users/rules.ts` | 135 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	userId1: Id<'users'>, |
| `convex/core/users/rules.ts` | 136 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	userId2: Id<'users'> |
| `convex/core/users/rules.ts` | 138 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	const user1Links = await getTransitiveLinks(ctx, userId1, MAX_LINK_DEPTH); |
| `convex/core/users/rules.ts` | 139 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	const user2Links = await getTransitiveLinks(ctx, userId2, MAX_LINK_DEPTH); |
| `convex/core/users/rules.ts` | 140 | 4 | `user` | `system_auth` | Auth-domain file pattern match | 	const combined = new Set([...user1Links, ...user2Links, userId1, userId2]); |
| `convex/core/users/rules.ts` | 147 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	ownerUserId: Id<'users'>, |
| `convex/core/users/rules.ts` | 148 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 150 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	if (ownerUserId === targetUserId) { |
| `convex/core/users/rules.ts` | 154 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const primary = await ctx.db.get(ownerUserId); |
| `convex/core/users/rules.ts` | 155 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const linked = await ctx.db.get(targetUserId); |
| `convex/core/users/rules.ts` | 162 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', ownerUserId)) |
| `convex/core/users/rules.ts` | 171 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	const wouldExceedDepth = await checkLinkDepth(ctx, ownerUserId, targetUserId); |
| `convex/core/users/schema.ts` | 3 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | export type UserDoc = Doc<'users'>; |
| `convex/core/users/schema.ts` | 4 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | export type UserId = Id<'users'>; |
| `convex/core/users/schema.ts` | 7 | 2 | `UserS, userS` | `system_auth` | Auth-domain file pattern match | export type UserSettingsDoc = Doc<'userSettings'>; |
| `convex/core/users/schema.ts` | 8 | 2 | `UserS, userS` | `system_auth` | Auth-domain file pattern match | export type UserSettingsId = Id<'userSettings'>; |
| `convex/core/users/tables.ts` | 4 | 1 | `users` | `system_auth` | Auth-domain file pattern match | export const usersTable = defineTable({ |
| `convex/core/users/tables.ts` | 21 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId: v.id('users'), |
| `convex/core/users/tables.ts` | 22 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	linkedUserId: v.id('users'), |
| `convex/core/users/tables.ts` | 27 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	.index('by_primary', ['primaryUserId']) |
| `convex/core/users/tables.ts` | 28 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	.index('by_linked', ['linkedUserId']); |
| `convex/core/users/tables.ts` | 30 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | export const userSettingsTable = defineTable({ |
| `convex/core/users/tables.ts` | 31 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	userId: v.id('users'), |
| `convex/core/users/tables.ts` | 36 | 2 | `user` | `system_auth` | Auth-domain file pattern match | }).index('by_user', ['userId']); |
| `convex/core/users/users.test.ts` | 4 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { requireProfilePermission, requireSessionUserId } from './rules'; |
| `convex/core/users/users.test.ts` | 6 | 3 | `User, user, users` | `system_auth` | Auth-domain file pattern match | const mockUserId = 'user-1' as Id<'users'>; |
| `convex/core/users/users.test.ts` | 7 | 3 | `User, user, users` | `system_auth` | Auth-domain file pattern match | const mockTargetUserId = 'user-2' as Id<'users'>; |
| `convex/core/users/users.test.ts` | 10 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-1' }) |
| `convex/core/users/users.test.ts` | 23 | 1 | `users` | `system_auth` | Auth-domain file pattern match | describe('users/rules - Session/Access', () => { |
| `convex/core/users/users.test.ts` | 24 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 	it('requireSessionUserId returns validated userId', async () => { |
| `convex/core/users/users.test.ts` | 27 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const result = await requireSessionUserId(ctx, 'session-1'); |
| `convex/core/users/users.test.ts` | 29 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		expect(result).toBe(mockUserId); |
| `convex/core/users/users.test.ts` | 35 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const result = await requireProfilePermission(ctx, 'session-2', mockTargetUserId); |
| `convex/core/users/users.test.ts` | 37 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		expect(result).toBe(mockUserId); |
| `convex/core/users/users.test.ts` | 38 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		expect(requirePermissionMock).toHaveBeenCalledWith(ctx, mockUserId, 'users.manage-profile', { |
| `convex/core/users/users.test.ts` | 39 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			resourceOwnerId: mockTargetUserId |
| `convex/core/workspaces/access.ts` | 5 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, workspaces domain path | import { findPersonByUserAndWorkspace, getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/workspaces/access.ts` | 16 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/workspaces/access.ts` | 19 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/access.ts` | 32 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>, |
| `convex/core/workspaces/access.ts` | 35 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/access.ts` | 51 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'> |
| `convex/core/workspaces/access.ts` | 53 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	const person = await requireWorkspaceMembership(ctx, workspaceId, userId); |
| `convex/core/workspaces/access.ts` | 58 | 2 | `user, users` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await requirePermission(ctx, userId, 'users.invite', { workspaceId }); |
| `convex/core/workspaces/lifecycle.ts` | 7 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/lifecycle.ts` | 134 | 3 | `User, user, users` | `workspace` | Workspace signals: workspace, workspaces domain path | export function findUserEmailField(user: Doc<'users'> \| null): string \| null { |
| `convex/core/workspaces/lifecycle.ts` | 135 | 1 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 136 | 1 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	const emailField = (user as Record<string, unknown>).email; |
| `convex/core/workspaces/lifecycle.ts` | 140 | 3 | `User, user, users` | `workspace` | Workspace signals: workspace, workspaces domain path | export function findUserNameField(user: Doc<'users'> \| null): string \| null { |
| `convex/core/workspaces/lifecycle.ts` | 141 | 1 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 142 | 1 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	const nameField = (user as Record<string, unknown>).name; |
| `convex/core/workspaces/lifecycle.ts` | 146 | 3 | `User, user, users` | `workspace` | Workspace signals: workspace, workspaces domain path | export function describeUserDisplayName(user: Doc<'users'> \| null): string { |
| `convex/core/workspaces/lifecycle.ts` | 147 | 4 | `User, user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/core/workspaces/lifecycle.ts` | 156 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 157 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		return createWorkspaceFlow(ctx, { name: args.name, userId }); |
| `convex/core/workspaces/lifecycle.ts` | 169 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 182 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 186 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/lifecycle.ts` | 208 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/lifecycle.ts` | 212 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/lifecycle.ts` | 226 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	args: { name: string; userId: Id<'users'> } |
| `convex/core/workspaces/lifecycle.ts` | 249 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const user = await ctx.db.get(args.userId); |
| `convex/core/workspaces/lifecycle.ts` | 250 | 1 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/lifecycle.ts` | 251 | 2 | `USER, User` | `workspace` | Workspace signals: workspace, workspaces domain path | 		throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found'); |
| `convex/core/workspaces/lifecycle.ts` | 253 | 3 | `user, User` | `workspace` | Workspace signals: workspace, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/lifecycle.ts` | 254 | 3 | `user, User` | `workspace` | Workspace signals: workspace, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/lifecycle.ts` | 255 | 2 | `user` | `workspace` | Workspace signals: workspace, workspaces domain path | 	const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/core/workspaces/lifecycle.ts` | 259 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: args.userId, |
| `convex/core/workspaces/lifecycle.ts` | 261 | 1 | `user` | `workspace` | Workspace signals: people, workspace, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/members.ts` | 6 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(3) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/members.ts` | 13 | 2 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | import { findUserEmailField, findUserNameField } from './lifecycle'; |
| `convex/core/workspaces/members.ts` | 14 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, member | import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../people/queries'; |
| `convex/core/workspaces/members.ts` | 21 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(3) signals | 		memberUserId: v.id('users') |
| `convex/core/workspaces/members.ts` | 24 | 3 | `user, User` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/members.ts` | 25 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 		return removeMember(ctx, { ...args, actingUserId }); |
| `convex/core/workspaces/members.ts` | 30 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(3) signals | 	userId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 44 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/members.ts` | 45 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/core/workspaces/members.ts` | 54 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(3) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/members.ts` | 68 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(3) signals | 		memberUserId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 69 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(3) signals | 		actingUserId: Id<'users'>; |
| `convex/core/workspaces/members.ts` | 75 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 		args.actingUserId, |
| `convex/core/workspaces/members.ts` | 79 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace, member, workspaces domain path | 	const targetPerson = await findPersonByUserAndWorkspace(ctx, args.memberUserId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 81 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'User is not a member of this workspace'); |
| `convex/core/workspaces/members.ts` | 92 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace, member, workspaces domain path | 	const actingPerson = await findPersonByUserAndWorkspace(ctx, args.actingUserId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 120 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(5) signals | 	if (!person.userId) return null; // Skip invited-only people |
| `convex/core/workspaces/members.ts` | 122 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	const user = await ctx.db.get(person.userId); |
| `convex/core/workspaces/members.ts` | 123 | 1 | `user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/members.ts` | 125 | 2 | `User, user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	const email = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 126 | 2 | `User, user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	const name = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 129 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		userId: person.userId, |
| `convex/core/workspaces/members.ts` | 140 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(4) signals | 	args: { workspaceId: Id<'workspaces'>; userId: Id<'users'>; role: 'owner' \| 'admin' \| 'member' } |
| `convex/core/workspaces/members.ts` | 147 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const user = await ctx.db.get(args.userId); |
| `convex/core/workspaces/members.ts` | 148 | 1 | `user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/members.ts` | 149 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace, member, workspaces domain path | 		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'User not found'); |
| `convex/core/workspaces/members.ts` | 155 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	const existingPerson = await findPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId); |
| `convex/core/workspaces/members.ts` | 157 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		console.log(`User ${args.userId} is already a member of org ${args.workspaceId}`); |
| `convex/core/workspaces/members.ts` | 162 | 3 | `user, User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 163 | 3 | `user, User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 164 | 2 | `user` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/core/workspaces/members.ts` | 168 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: args.userId, |
| `convex/core/workspaces/members.ts` | 170 | 1 | `user` | `workspace` | Workspace signals: people, workspace, member, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/members.ts` | 181 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 	console.log(`✅ Added user ${args.userId} to org ${args.workspaceId} with role ${args.role}`); |
| `convex/core/workspaces/mutations.ts` | 3 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/mutations.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, workspaces domain path | import { findPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/workspaces/mutations.ts` | 33 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/mutations.ts` | 34 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/queries.ts` | 3 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/queries.ts` | 10 | 1 | `User` | `workspace` | Workspace signals: workspace, workspaces domain path | 	listWorkspacesForUser, |
| `convex/core/workspaces/queries.ts` | 11 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace, workspaces domain path | 	findPersonByUserAndWorkspace, |
| `convex/core/workspaces/queries.ts` | 37 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 42 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, workspace._id); |
| `convex/core/workspaces/queries.ts` | 55 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 60 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/queries.ts` | 67 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | async function listWorkspaceSummaries(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/core/workspaces/queries.ts` | 68 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/workspaces/queries.ts` | 72 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/workspaces/queries.ts` | 124 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 125 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const summaries = await listWorkspaceSummaries(ctx, userId); |
| `convex/core/workspaces/queries.ts` | 141 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		sessionId: v.string() // Session validation (derives userId securely) |
| `convex/core/workspaces/queries.ts` | 145 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 158 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, alias.workspaceId); |
| `convex/core/workspaces/queries.ts` | 220 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/queries.ts` | 221 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/core/workspaces/settings.ts` | 3 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/workspaces/settings.ts` | 19 | 1 | `UserS` | `workspace` | Workspace signals: workspace, workspaces domain path | export const getUserSettings = query({ |
| `convex/core/workspaces/settings.ts` | 25 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 29 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 30 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 60 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		userId: v.string() |
| `convex/core/workspaces/settings.ts` | 64 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 65 | 6 | `user, users` | `unknown` | Mixed auth(3) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId as Id<'users'>)) // userId comes as string from session but is Id<"users"> at runtime |
| `convex/core/workspaces/settings.ts` | 92 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 125 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/settings.ts` | 144 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 170 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId, |
| `convex/core/workspaces/settings.ts` | 183 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/settings.ts` | 191 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 192 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/settings.ts` | 203 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			const settingsId = await ctx.db.insert('userSettings', { |
| `convex/core/workspaces/settings.ts` | 204 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId, |
| `convex/core/workspaces/settings.ts` | 221 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users'), |
| `convex/core/workspaces/settings.ts` | 229 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 230 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/settings.ts` | 241 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			const settingsId = await ctx.db.insert('userSettings', { |
| `convex/core/workspaces/settings.ts` | 242 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				userId: args.userId, |
| `convex/core/workspaces/settings.ts` | 263 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 267 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 268 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 279 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			const settingsId = await ctx.db.insert('userSettings', { |
| `convex/core/workspaces/settings.ts` | 280 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				userId, |
| `convex/core/workspaces/settings.ts` | 300 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 304 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 305 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 329 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/workspaces/settings.ts` | 333 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 334 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/core/workspaces/settings.ts` | 352 | 1 | `UserS` | `workspace` | Workspace signals: workspace, workspaces domain path | export const getUserSettingsForSync = internalQuery({ |
| `convex/core/workspaces/settings.ts` | 354 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 		userId: v.id('users') |
| `convex/core/workspaces/settings.ts` | 358 | 1 | `userS` | `workspace` | Workspace signals: workspace, workspaces domain path | 			.query('userSettings') |
| `convex/core/workspaces/settings.ts` | 359 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/core/workspaces/workspaces.test.ts` | 9 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | import { ensureInviteEmailFormat, ensureUserNotAlreadyMember } from './rules'; |
| `convex/core/workspaces/workspaces.test.ts` | 108 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'u1', |
| `convex/core/workspaces/workspaces.test.ts` | 138 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 	test('ensureUserNotAlreadyMember rejects existing membership', async () => { |
| `convex/core/workspaces/workspaces.test.ts` | 151 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 		await expect(ensureUserNotAlreadyMember(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow( |
| `convex/core/workspaces/workspaces.test.ts` | 152 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 			`${ErrorCodes.WORKSPACE_ALREADY_MEMBER}: User is already a member of this workspace` |
| `convex/core/workspaces/workspaces.test.ts` | 188 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'owner1', |
| `convex/core/workspaces/workspaces.test.ts` | 195 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			userId: 'admin', |
| `convex/core/workspaces/workspaces.test.ts` | 228 | 1 | `User` | `workspace` | Workspace signals: workspace, member, workspaces domain path | 				memberUserId: 'owner1' as any, |
| `convex/core/workspaces/workspaces.test.ts` | 229 | 1 | `User` | `workspace` | Workspace signals: workspace, workspaces domain path | 				actingUserId: 'admin' as any |
| `convex/docs/doc404Tracking.ts` | 10 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/docs/doc404Tracking.ts` | 23 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userAgent: v.optional(v.string()), |
| `convex/docs/doc404Tracking.ts` | 29 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		let userId: Id<'users'> \| undefined = undefined; |
| `convex/docs/doc404Tracking.ts` | 32 | 1 | `User` | `system_auth` | Auth signals: session | 				const derived = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 33 | 2 | `user` | `system_auth` | Auth signals: , userId | 				userId = derived.userId; |
| `convex/docs/doc404Tracking.ts` | 35 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId = undefined; |
| `convex/docs/doc404Tracking.ts` | 50 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 				userAgent: args.userAgent \|\| existing.userAgent, |
| `convex/docs/doc404Tracking.ts` | 53 | 3 | `user` | `system_auth` | Auth signals: , userId | 				userId: userId \|\| existing.userId |
| `convex/docs/doc404Tracking.ts` | 61 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 			userAgent: args.userAgent, |
| `convex/docs/doc404Tracking.ts` | 63 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `convex/docs/doc404Tracking.ts` | 80 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 100 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 124 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 129 | 1 | `user` | `system_auth` | Auth signals: , userId | 			resolvedBy: userId, |
| `convex/docs/doc404Tracking.ts` | 141 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 12 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/customFields/mutations.ts` | 13 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/customFields/mutations.ts` | 62 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 63 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, args.workspaceId); |
| `convex/features/customFields/mutations.ts` | 64 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/customFields/mutations.ts` | 103 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 106 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 107 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 129 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 136 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await canDefineField(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 137 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 166 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 170 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await canSetValue(ctx, userId, definition.workspaceId, args.entityType, args.entityId); |
| `convex/features/customFields/mutations.ts` | 174 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId); |
| `convex/features/customFields/mutations.ts` | 190 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 200 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await canSetValue(ctx, userId, definition.workspaceId, definition.entityType, args.entityId); |
| `convex/features/customFields/queries.ts` | 12 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/customFields/queries.ts` | 13 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace as _getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/customFields/queries.ts` | 34 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 35 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, args.workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 57 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 63 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, definition.workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 83 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 93 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await requireWorkspaceMembership(ctx, values[0].workspaceId, userId); |
| `convex/features/customFields/queries.ts` | 108 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 114 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await requireWorkspaceMembership(ctx, definition.workspaceId, userId); |
| `convex/features/customFields/rules.ts` | 13 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/customFields/rules.ts` | 24 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/customFields/rules.ts` | 30 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/features/customFields/rules.ts` | 41 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/customFields/rules.ts` | 47 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/customFields/tables.ts` | 57 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	name: v.string(), // Display name (user can customize for system fields) |
| `convex/features/export/blog.ts` | 132 | 1 | `User` | `system_auth` | Auth signals: session | 			internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/export/blog.ts` | 201 | 1 | `User` | `system_auth` | Auth signals: session | 			internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/flashcards/flashcards.test.ts` | 9 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	archiveFlashcardForUser, |
| `convex/features/flashcards/flashcards.test.ts` | 10 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	createFlashcardForUser, |
| `convex/features/flashcards/flashcards.test.ts` | 24 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	test('createFlashcardForUser combines auth and algorithm defaults', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 25 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 30 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const flashcardId = await createFlashcardForUser(ctx, { |
| `convex/features/flashcards/flashcards.test.ts` | 41 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1', |
| `convex/features/flashcards/flashcards.test.ts` | 50 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 59 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 72 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	test('archiveFlashcardForUser deletes after ownership check', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 75 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/flashcards.test.ts` | 79 | 1 | `User` | `system_auth` | Auth signals: session | 		await archiveFlashcardForUser(ctx, { sessionId: 's1', flashcardId: 'f1' as any }); |
| `convex/features/flashcards/flashcards.test.ts` | 85 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	test('archiveFlashcardForUser surfaces auth errors', async () => { |
| `convex/features/flashcards/flashcards.test.ts` | 86 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockRejectedValue( |
| `convex/features/flashcards/flashcards.test.ts` | 91 | 1 | `User` | `system_auth` | Auth signals: session | 			archiveFlashcardForUser({} as any, { sessionId: 's1', flashcardId: 'f1' as any }) |
| `convex/features/flashcards/flashcards.test.ts` | 109 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any); |
| `convex/features/flashcards/importExport.ts` | 11 | 1 | `User` | `system_auth` | Auth signals: session | async function requireUserIdFromSession( |
| `convex/features/flashcards/importExport.ts` | 16 | 1 | `User` | `system_auth` | Auth signals: session | 		.validateSessionAndGetUserIdInternal; |
| `convex/features/flashcards/importExport.ts` | 17 | 2 | `user` | `system_auth` | Auth signals: session, userId | 	const { userId } = (await ctx.runQuery(validateSession, { sessionId })) as { userId: string }; |
| `convex/features/flashcards/importExport.ts` | 18 | 1 | `user` | `system_auth` | Auth signals: , userId | 	return userId; |
| `convex/features/flashcards/importExport.ts` | 21 | 1 | `user` | `system_auth` | Auth signals: , userId | async function fetchKeys(ctx: FlashcardActionCtx, userId: string) { |
| `convex/features/flashcards/importExport.ts` | 27 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const keys = (await ctx.runQuery(getEncryptedKeysInternal, { userId })) as { |
| `convex/features/flashcards/importExport.ts` | 60 | 1 | `user` | `workspace` | Workspace signals: role | 					role: 'user', |
| `convex/features/flashcards/importExport.ts` | 118 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 	const userId = await requireUserIdFromSession(ctx, args.sessionId); |
| `convex/features/flashcards/importExport.ts` | 119 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const encryptedApiKey = await fetchKeys(ctx, userId); |
| `convex/features/flashcards/index.ts` | 7 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	createFlashcardForUser, |
| `convex/features/flashcards/index.ts` | 8 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	createFlashcardsForUser, |
| `convex/features/flashcards/index.ts` | 10 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	archiveFlashcardForUser |
| `convex/features/flashcards/index.ts` | 13 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import { listDueFlashcards, listUserFlashcards, listCollections } from './queries'; |
| `convex/features/flashcards/index.ts` | 29 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	handler: async (ctx, args): Promise<Id<'flashcards'>> => createFlashcardForUser(ctx, args) |
| `convex/features/flashcards/index.ts` | 49 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		createFlashcardsForUser(ctx, args, args.flashcards) |
| `convex/features/flashcards/index.ts` | 89 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	handler: async (ctx, args) => archiveFlashcardForUser(ctx, args) |
| `convex/features/flashcards/index.ts` | 113 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserFlashcards = query({ |
| `convex/features/flashcards/index.ts` | 120 | 1 | `User` | `workspace` | Workspace signals: personId, person/people | 		return listUserFlashcards(ctx, personId, args.tagIds ?? undefined); |
| `convex/features/flashcards/lifecycle.ts` | 20 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function createFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/lifecycle.ts` | 34 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function createFlashcardsForUser( |
| `convex/features/flashcards/lifecycle.ts` | 57 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function archiveFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/lifecycle.ts` | 67 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function restoreFlashcardForUser(ctx: MutationCtx, args: BaseArgs) { |
| `convex/features/flashcards/queries.ts` | 49 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function listUserFlashcards( |
| `convex/features/flashcards/repository.ts` | 50 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, people | export async function getUserFlashcards(ctx: QueryCtx, personId: Id<'people'>) { |
| `convex/features/flashcards/settings.ts` | 8 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		.query('userAlgorithmSettings') |
| `convex/features/flashcards/tables.ts` | 13 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased')) |
| `convex/features/flashcards/tables.ts` | 54 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | export const userAlgorithmSettingsTable = defineTable({ |
| `convex/features/inbox/access.ts` | 11 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	linkedUser: Id<'users'>; |
| `convex/features/inbox/access.ts` | 22 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		linkedUser |
| `convex/features/inbox/access.ts` | 29 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		linkedUser |
| `convex/features/inbox/inbox.test.ts` | 22 | 1 | `USER` | `workspace` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../core/people/constants'; |
| `convex/features/inbox/inbox.test.ts` | 24 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, workspace | const actor = { personId: 'p1' as any, workspaceId: 'w1' as any, linkedUser: 'u1' as any }; |
| `convex/features/inbox/inbox.test.ts` | 167 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 			expect.objectContaining({ [USER_ID_FIELD]: actor.linkedUser, question: 'q', answer: 'a' }) |
| `convex/features/inbox/inbox.test.ts` | 211 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 			[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/inbox.test.ts` | 252 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 				[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/inbox.test.ts` | 336 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 					[USER_ID_FIELD]: actor.linkedUser |
| `convex/features/inbox/lifecycle.ts` | 5 | 1 | `USER` | `workspace` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../core/people/constants'; |
| `convex/features/inbox/lifecycle.ts` | 69 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 112 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 183 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	actor: { linkedUser: Id<'users'>; workspaceId: Id<'workspaces'> }, |
| `convex/features/inbox/lifecycle.ts` | 189 | 3 | `user, USER, User` | `unknown` | No strong auth/workspace signals detected | 		.withIndex('by_user', (q) => q.eq(USER_ID_FIELD, actor.linkedUser)) |
| `convex/features/inbox/lifecycle.ts` | 196 | 3 | `user, USER, User` | `unknown` | No strong auth/workspace signals detected | 		.withIndex('by_user_name', (q) => q.eq(USER_ID_FIELD, actor.linkedUser).eq('name', 'manual')) |
| `convex/features/inbox/lifecycle.ts` | 200 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 			[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/lifecycle.ts` | 209 | 2 | `USER, User` | `unknown` | No strong auth/workspace signals detected | 		[USER_ID_FIELD]: actor.linkedUser, |
| `convex/features/inbox/tables.ts` | 17 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 40 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 60 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/inbox/tables.ts` | 95 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					v.literal('user'), |
| `convex/features/invites/helpers.ts` | 6 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../../core/people/queries'; |
| `convex/features/invites/helpers.ts` | 12 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	ensureInviteEmailMatchesUser, |
| `convex/features/invites/helpers.ts` | 14 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	ensureNoExistingUserInvite, |
| `convex/features/invites/helpers.ts` | 15 | 1 | `User` | `workspace` | Workspace signals: member | 	ensureUserNotAlreadyMember |
| `convex/features/invites/helpers.ts` | 19 | 3 | `User, user, users` | `unknown` | No strong auth/workspace signals detected | function findUserNameField(user: Doc<'users'> \| null): string \| null { |
| `convex/features/invites/helpers.ts` | 20 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/features/invites/helpers.ts` | 21 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const nameField = (user as Record<string, unknown>).name; |
| `convex/features/invites/helpers.ts` | 25 | 3 | `User, user, users` | `unknown` | No strong auth/workspace signals detected | function findUserEmailField(user: Doc<'users'> \| null): string \| null { |
| `convex/features/invites/helpers.ts` | 26 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/features/invites/helpers.ts` | 27 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const emailField = (user as Record<string, unknown>).email; |
| `convex/features/invites/helpers.ts` | 31 | 3 | `User, user, users` | `unknown` | No strong auth/workspace signals detected | function describeUserDisplayName(user: Doc<'users'> \| null): string { |
| `convex/features/invites/helpers.ts` | 32 | 4 | `User, user` | `workspace` | Workspace signals: member | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/features/invites/helpers.ts` | 59 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		invitedUserId?: Id<'users'>; |
| `convex/features/invites/helpers.ts` | 66 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (!normalizedEmail && !args.invitedUserId) { |
| `convex/features/invites/helpers.ts` | 69 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			'Either email or invitedUserId must be provided' |
| `convex/features/invites/helpers.ts` | 77 | 2 | `User` | `workspace` | Workspace signals: workspace | 	await ensureNoExistingUserInvite(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 78 | 2 | `User` | `workspace` | Workspace signals: workspace, member | 	await ensureUserNotAlreadyMember(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 83 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		invitedUserId: args.invitedUserId, |
| `convex/features/invites/helpers.ts` | 122 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 123 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 141 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/invites/helpers.ts` | 149 | 3 | `User, user` | `system_auth` | Auth signals: , userId | 	if (invite.invitedUserId && invite.invitedUserId !== userId) { |
| `convex/features/invites/helpers.ts` | 151 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 			ErrorCodes.INVITE_USER_MISMATCH, |
| `convex/features/invites/helpers.ts` | 152 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			'This invite is addressed to a different user' |
| `convex/features/invites/helpers.ts` | 156 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	await ensureInviteEmailMatchesUser(ctx, invite, userId); |
| `convex/features/invites/helpers.ts` | 161 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const existingPerson = await findPersonByUserAndWorkspace(ctx, userId, invite.workspaceId); |
| `convex/features/invites/helpers.ts` | 163 | 2 | `user` | `system_auth` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 164 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (!user) { |
| `convex/features/invites/helpers.ts` | 165 | 1 | `User` | `workspace` | Workspace signals: person/people | 			throw createError(ErrorCodes.PERSON_NOT_FOUND, 'User not found'); |
| `convex/features/invites/helpers.ts` | 167 | 3 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userName = findUserNameField(user); |
| `convex/features/invites/helpers.ts` | 168 | 3 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userEmail = findUserEmailField(user); |
| `convex/features/invites/helpers.ts` | 169 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		const displayName = userName \|\| userEmail?.split('@')[0] \|\| 'Unknown'; |
| `convex/features/invites/helpers.ts` | 174 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `convex/features/invites/helpers.ts` | 176 | 1 | `user` | `workspace` | Workspace signals: people | 			email: null, // Email comes from user lookup, not stored per people/README.md |
| `convex/features/invites/helpers.ts` | 207 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/helpers.ts` | 212 | 3 | `User, user` | `system_auth` | Auth signals: , userId | 	if (invite.invitedUserId && invite.invitedUserId !== userId) { |
| `convex/features/invites/helpers.ts` | 213 | 2 | `USER, user` | `unknown` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Cannot decline invite for another user'); |
| `convex/features/invites/helpers.ts` | 217 | 2 | `user` | `system_auth` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 218 | 4 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userEmail = user ? findUserEmailField(user) : null; |
| `convex/features/invites/helpers.ts` | 219 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) { |
| `convex/features/invites/helpers.ts` | 235 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/helpers.ts` | 242 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await requireCanInviteMembers(ctx, invite.workspaceId, userId); |
| `convex/features/invites/helpers.ts` | 262 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 263 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 292 | 3 | `User, user, users` | `system_auth` | Auth signals: Convex users id type, userId | export async function listInvitesForUser(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/features/invites/helpers.ts` | 293 | 2 | `user` | `system_auth` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 294 | 3 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	const email = user ? findUserEmailField(user) : null; |
| `convex/features/invites/helpers.ts` | 296 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const invitesByUser = await ctx.db |
| `convex/features/invites/helpers.ts` | 298 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('invitedUserId', userId)) |
| `convex/features/invites/helpers.ts` | 309 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	for (const invite of invitesByUser) { |
| `convex/features/invites/helpers.ts` | 329 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 330 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 354 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 355 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const inviterName = describeUserDisplayName(inviter); |
| `convex/features/invites/helpers.ts` | 364 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		invitedUserId: invite.invitedUserId ?? undefined |
| `convex/features/invites/helpers.ts` | 379 | 1 | `User` | `workspace` | Workspace signals: member | 	const memberUserIds = new Set( |
| `convex/features/invites/helpers.ts` | 380 | 3 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 		activePeople.filter((p) => p.userId).map((p) => p.userId as Id<'users'>) |
| `convex/features/invites/helpers.ts` | 387 | 3 | `User` | `workspace` | Workspace signals: member | 				(invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) \|\| |
| `convex/features/invites/helpers.ts` | 391 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null; |
| `convex/features/invites/helpers.ts` | 400 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				invitedByName: describeUserDisplayName(inviter) |
| `convex/features/invites/mutations.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/invites/mutations.ts` | 21 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		inviteeUserId: v.optional(v.id('users')), |
| `convex/features/invites/mutations.ts` | 25 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 26 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const person = await requireCanInviteMembers(ctx, args.workspaceId, userId); |
| `convex/features/invites/mutations.ts` | 30 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 			invitedUserId: args.inviteeUserId, |
| `convex/features/invites/mutations.ts` | 47 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 48 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		return acceptWorkspaceInvite(ctx, args.code, userId, { markAccepted: false }); |
| `convex/features/invites/mutations.ts` | 57 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: v.id('users'), |
| `convex/features/invites/mutations.ts` | 61 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		return acceptWorkspaceInvite(ctx, args.code, args.userId, { markAccepted: true }); |
| `convex/features/invites/mutations.ts` | 74 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 75 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		return declineWorkspaceInvite(ctx, args.inviteId, userId); |
| `convex/features/invites/mutations.ts` | 88 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 89 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return resendInviteEmail(ctx, args.inviteId, userId); |
| `convex/features/invites/queries.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/invites/queries.ts` | 17 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 34 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 35 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await requireCanInviteMembers(ctx, args.workspaceId, userId); |
| `convex/features/invites/queries.ts` | 48 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 53 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('invitedUserId', userId)) |
| `convex/features/invites/rules.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/invites/rules.ts` | 53 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function ensureNoExistingUserInvite( |
| `convex/features/invites/rules.ts` | 56 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	invitedUserId?: Id<'users'> |
| `convex/features/invites/rules.ts` | 58 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (!invitedUserId) return; |
| `convex/features/invites/rules.ts` | 60 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const existingUserInvite = await ctx.db |
| `convex/features/invites/rules.ts` | 62 | 3 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		.withIndex('by_user', (q) => q.eq('invitedUserId', invitedUserId)) |
| `convex/features/invites/rules.ts` | 65 | 2 | `User` | `workspace` | Workspace signals: workspace | 	if (existingUserInvite && existingUserInvite.workspaceId === workspaceId) { |
| `convex/features/invites/rules.ts` | 66 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.INVITE_ALREADY_EXISTS, 'This user already has an invite'); |
| `convex/features/invites/rules.ts` | 73 | 1 | `User` | `workspace` | Workspace signals: member | export async function ensureUserNotAlreadyMember( |
| `convex/features/invites/rules.ts` | 76 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	invitedUserId?: Id<'users'> |
| `convex/features/invites/rules.ts` | 78 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (!invitedUserId) return; |
| `convex/features/invites/rules.ts` | 80 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace | 	const person = await findPersonByUserAndWorkspace(ctx, invitedUserId, workspaceId); |
| `convex/features/invites/rules.ts` | 84 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 			'User is already a member of this workspace' |
| `convex/features/invites/rules.ts` | 92 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function ensureInviteEmailMatchesUser( |
| `convex/features/invites/rules.ts` | 95 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/rules.ts` | 100 | 2 | `user` | `system_auth` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/features/invites/rules.ts` | 101 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userEmail = user ? ((user as Record<string, unknown>).email as string \| null) : null; |
| `convex/features/invites/rules.ts` | 103 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (userEmail && inviteEmail !== userEmail.toLowerCase()) { |
| `convex/features/invites/tables.ts` | 12 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	invitedUserId: v.optional(v.id('users')), |
| `convex/features/invites/tables.ts` | 24 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	.index('by_user', ['invitedUserId']) |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 14 | 1 | `user` | `workspace` | Workspace signals: circle | 	invitationType: 'user' \| 'circle'; |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 24 | 1 | `user` | `workspace` | Workspace signals: circle | 	invitationType: v.union(v.literal('user'), v.literal('circle')), |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 40 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 	if (args.invitationType === 'user' && !args.personId) { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 43 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 			'personId is required when invitationType is "user"' |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 55 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 	if (args.invitationType === 'user' && args.personId) { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 124 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (invitation.invitationType !== 'user') { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 125 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be accepted'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 136 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the invited user can accept this invitation'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 182 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (invitation.invitationType !== 'user') { |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 183 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be declined'); |
| `convex/features/meetings/helpers/invitations/mutations.ts` | 196 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			'Only the invited user can decline this invitation' |
| `convex/features/meetings/helpers/invitations/queries.ts` | 37 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 			if (invitation.invitationType === 'user' && invitation.personId) { |
| `convex/features/meetings/helpers/invitations/queries.ts` | 85 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			invitation.invitationType === 'user' && |
| `convex/features/meetings/helpers/mutations/attendees.ts` | 62 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 			(inv) => inv.invitationType === 'user' && inv.personId === args.personId |
| `convex/features/meetings/helpers/mutations/createUpdate.ts` | 28 | 1 | `user` | `workspace` | Workspace signals: circle | 		invitationType: 'user' \| 'circle'; |
| `convex/features/meetings/helpers/mutations/createUpdate.ts` | 70 | 1 | `user` | `workspace` | Workspace signals: circle | 				invitationType: v.union(v.literal('user'), v.literal('circle')), |
| `convex/features/meetings/helpers/mutations/createUpdate.ts` | 138 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 			if (invitation.invitationType === 'user' && !invitation.personId) { |
| `convex/features/meetings/helpers/mutations/createUpdate.ts` | 141 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 					'personId is required when invitationType is "user"' |
| `convex/features/meetings/helpers/mutations/createUpdate.ts` | 151 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 			if (invitation.invitationType === 'user' && invitation.personId) { |
| `convex/features/meetings/helpers/queries/index.ts` | 5 | 3 | `Users` | `unknown` | No strong auth/workspace signals detected | export { getInvitedUsersQuery, getInvitedUsersArgs } from './invitedUsers'; |
| `convex/features/meetings/helpers/queries/index.ts` | 6 | 3 | `User` | `unknown` | No strong auth/workspace signals detected | export { listMeetingsForUser, listMeetingsForUserArgs } from './listForUser'; |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 13 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	getInvitedUsersForMeeting |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 14 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | } from './invitedUsersUtils'; |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 16 | 1 | `Users` | `system_auth` | Auth signals: session | type GetInvitedUsersArgs = { sessionId: string; meetingId: Id<'meetings'> }; |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 18 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | export const getInvitedUsersArgs = { |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 23 | 2 | `Users` | `unknown` | No strong auth/workspace signals detected | export async function getInvitedUsersQuery(ctx: QueryCtx, args: GetInvitedUsersArgs) { |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 51 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	return getInvitedUsersForMeeting( |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 7 | 1 | `user` | `workspace` | Workspace signals: circle | 		invitationType: 'user' \| 'circle'; |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 15 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people, circle | 		Array<{ invitationType: 'user' \| 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }> |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 18 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (invitation.invitationType === 'user' && invitation.status === 'declined') { |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 67 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people, circle | 		Array<{ invitationType: 'user' \| 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }> |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 75 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 		(invitation) => invitation.invitationType === 'user' && invitation.personId === personId |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 97 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | export async function getInvitedUsersForMeeting( |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 103 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people, circle | 		Array<{ invitationType: 'user' \| 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }> |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 111 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 		if (invitation.invitationType === 'user' && invitation.personId) { |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 9 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | import { listMeetingsForUser } from './listForUser'; |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 36 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | describe('helpers/queries/listForUser', () => { |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 41 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await expect(listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' })).rejects.toThrow( |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 63 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					invitationType: 'user', |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 71 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const result = await listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' }); |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 76 | 1 | `Users` | `workspace` | Workspace signals: personId, person/people | 				invitedUsers: [expect.objectContaining({ personId: 'person1' })] |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 8 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	getInvitedUsersForMeeting, |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 10 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | } from './invitedUsersUtils'; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 12 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | type ListForUserArgs = { sessionId: string; workspaceId: Id<'workspaces'> }; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 13 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | type MeetingWithInvitedUsers = { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 14 | 1 | `Users` | `workspace` | Workspace signals: personId, person/people | 	invitedUsers: Array<{ personId: string; name: string }>; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 22 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const listMeetingsForUserArgs = { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 27 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function listMeetingsForUser( |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 29 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	args: ListForUserArgs |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 30 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | ): Promise<MeetingWithInvitedUsers[]> { |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 87 | 1 | `user` | `workspace` | Workspace signals: circle | 	invitations: Array<{ invitationType: 'user' \| 'circle'; circleId?: Id<'circles'> }> |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 121 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	meetings: MeetingWithInvitedUsers[], |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 125 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people, circle | 		Array<{ invitationType: 'user' \| 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }> |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 129 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	const accessible: MeetingWithInvitedUsers[] = []; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 143 | 2 | `Users` | `unknown` | No strong auth/workspace signals detected | 		const invitedUsers = await getInvitedUsersForMeeting( |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 151 | 1 | `Users` | `workspace` | Workspace signals: personId, person/people | 		accessible.push({ ...meeting, invitedUsers, viewerPersonId: personId }); |
| `convex/features/meetings/invitations.test.ts` | 49 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('accept user invitation inserts attendee and marks accepted', async () => { |
| `convex/features/meetings/invitations.test.ts` | 54 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				invitationType: 'user', |
| `convex/features/meetings/invitations.test.ts` | 88 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		).rejects.toThrow(`${ErrorCodes.GENERIC_ERROR}: Only user invitations can be declined`); |
| `convex/features/meetings/meetings.ts` | 34 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	getInvitedUsersQuery, |
| `convex/features/meetings/meetings.ts` | 39 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	listMeetingsForUser, |
| `convex/features/meetings/meetings.ts` | 42 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	getInvitedUsersArgs, |
| `convex/features/meetings/meetings.ts` | 46 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	listMeetingsForUserArgs |
| `convex/features/meetings/meetings.ts` | 81 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | export const getInvitedUsers = query({ |
| `convex/features/meetings/meetings.ts` | 84 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		...getInvitedUsersArgs |
| `convex/features/meetings/meetings.ts` | 86 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	handler: (ctx, args): Promise<unknown[]> => getInvitedUsersQuery(ctx, args) |
| `convex/features/meetings/meetings.ts` | 89 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const listForUser = query({ |
| `convex/features/meetings/meetings.ts` | 92 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		...listMeetingsForUserArgs |
| `convex/features/meetings/meetings.ts` | 94 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	handler: (ctx, args): Promise<unknown[]> => listMeetingsForUser(ctx, args) |
| `convex/features/meetings/tables.ts` | 51 | 1 | `user` | `workspace` | Workspace signals: circle | 	invitationType: v.union(v.literal('user'), v.literal('circle')), |
| `convex/features/notes/index.test.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | 	validateSessionAndGetUserId: vi.fn() |
| `convex/features/notes/index.test.ts` | 7 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn(), |
| `convex/features/notes/index.test.ts` | 8 | 1 | `User` | `workspace` | Workspace signals: workspace | 	listWorkspacesForUser: vi.fn() |
| `convex/features/notes/index.test.ts` | 15 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/notes/index.test.ts` | 16 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/notes/index.test.ts` | 43 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = { _id: 'p1', workspaceId: 'w1', userId: 'u1', status: 'active' } as any; |
| `convex/features/notes/index.test.ts` | 45 | 1 | `user` | `system_auth` | Auth signals: session | 	test('createNote validates the session and inserts a note for the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 46 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 47 | 1 | `User` | `workspace` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 48 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 62 | 1 | `User` | `system_auth` | Auth signals: session | 		expect(validateSessionAndGetUserId).toHaveBeenCalledWith(ctx, 'sess'); |
| `convex/features/notes/index.test.ts` | 75 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('updateNote rejects when the note is not owned by the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 76 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 77 | 1 | `User` | `workspace` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 78 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 99 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('updateNote patches when the note is owned by the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 100 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 101 | 1 | `User` | `workspace` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 102 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 129 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('findNote returns null when the note does not belong to the user', async () => { |
| `convex/features/notes/index.test.ts` | 130 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 131 | 1 | `User` | `workspace` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 132 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 152 | 1 | `User` | `system_auth` | Auth signals: session | 	test('createNote surfaces authentication failures from validateSessionAndGetUserId', async () => { |
| `convex/features/notes/index.test.ts` | 153 | 1 | `User` | `system_auth` | Auth signals: session | 		(validateSessionAndGetUserId as any).mockRejectedValue( |
| `convex/features/notes/index.test.ts` | 156 | 1 | `User` | `workspace` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 157 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.ts` | 11 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/notes/index.ts` | 13 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/notes/index.ts` | 17 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(4) signals | type NoteActor = { personId: Id<'people'>; workspaceId: Id<'workspaces'>; userId: Id<'users'> }; |
| `convex/features/notes/index.ts` | 22 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/notes/index.ts` | 27 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const workspaces = await listWorkspacesForUser(ctx, userId); |
| `convex/features/notes/index.ts` | 42 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/features/notes/index.ts` | 43 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const resolvedWorkspaceId = await resolveWorkspaceId(ctx, userId, workspaceId); |
| `convex/features/notes/index.ts` | 44 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId); |
| `convex/features/notes/index.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId |
| `convex/features/onboarding/mutations.ts` | 12 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/onboarding/mutations.ts` | 13 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/onboarding/mutations.ts` | 42 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 43 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 124 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 125 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 187 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 188 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 238 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 239 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/mutations.ts` | 294 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const completeUserOnboarding = mutation({ |
| `convex/features/onboarding/mutations.ts` | 301 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 302 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 11 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/onboarding/queries.ts` | 12 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/onboarding/queries.ts` | 31 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 34 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 66 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 69 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const _person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/onboarding/queries.ts` | 109 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 114 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/features/onboarding/queries.ts` | 135 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 145 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 155 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				userOnboardingComplete: null |
| `convex/features/onboarding/queries.ts` | 162 | 1 | `user` | `workspace` | Workspace signals: person/people | 			userOnboardingComplete: !!person.onboardingCompletedAt |
| `convex/features/onboarding/queries.ts` | 187 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 190 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/readwise/access.ts` | 19 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 	const userId = await getUserId(ctx, args.sessionId); |
| `convex/features/readwise/access.ts` | 20 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const apiKey = await getDecryptedKey(ctx, userId); |
| `convex/features/readwise/access.ts` | 22 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	return runSync(ctx, { userId, workspaceId: args.workspaceId, apiKey, ...filters }); |
| `convex/features/readwise/access.ts` | 25 | 2 | `User, users` | `system_auth` | Auth signals: session, Convex users id type | async function getUserId(ctx: ActionCtx, sessionId: string): Promise<Id<'users'>> { |
| `convex/features/readwise/access.ts` | 26 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const { userId } = await ctx.runQuery( |
| `convex/features/readwise/access.ts` | 28 | 1 | `User` | `system_auth` | Auth signals: session | 			.validateSessionAndGetUserIdInternal as FunctionReference< |
| `convex/features/readwise/access.ts` | 32 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | 			{ userId: Id<'users'>; session: unknown } |
| `convex/features/readwise/access.ts` | 36 | 1 | `user` | `system_auth` | Auth signals: , userId | 	return userId; |
| `convex/features/readwise/access.ts` | 39 | 1 | `user` | `system_auth` | Auth signals: , userId | async function getDecryptedKey(ctx: ActionCtx, userId: string): Promise<string> { |
| `convex/features/readwise/access.ts` | 44 | 1 | `user` | `system_auth` | Auth signals: , userId | 		{ userId: string }, |
| `convex/features/readwise/access.ts` | 47 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const encryptedKeys = await ctx.runQuery(getKeysQuery, { userId }); |
| `convex/features/readwise/access.ts` | 66 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	args: { userId: string; workspaceId?: Id<'workspaces'>; apiKey: string } & FetchFilters |
| `convex/features/readwise/access.ts` | 72 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: string; |
| `convex/features/readwise/cleanup.ts` | 176 | 1 | `User` | `system_auth` | Auth signals: session | 			.validateSessionAndGetUserIdInternal; |
| `convex/features/readwise/cleanup.ts` | 177 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = (await ctx.runQuery(validateSession, { |
| `convex/features/readwise/cleanup.ts` | 179 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		})) as { userId: Id<'users'> }; |
| `convex/features/readwise/cleanup.ts` | 183 | 1 | `User` | `workspace` | Workspace signals: people, workspace | 			(internal as any).core.people.queries.listWorkspacesForUser, |
| `convex/features/readwise/cleanup.ts` | 184 | 1 | `user` | `system_auth` | Auth signals: , userId | 			{ userId } |
| `convex/features/readwise/cleanup.ts` | 187 | 1 | `User` | `workspace` | Workspace signals: workspace | 			throw new Error('User has no workspaces'); |
| `convex/features/readwise/cleanup.ts` | 191 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace | 			(internal as any).core.people.queries.findPersonByUserAndWorkspace, |
| `convex/features/readwise/cleanup.ts` | 192 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			{ userId, workspaceId } |
| `convex/features/readwise/cleanup.ts` | 195 | 1 | `user` | `workspace` | Workspace signals: person/people, workspace | 			throw new Error('Person not found for user and workspace'); |
| `convex/features/readwise/cleanup.ts` | 363 | 1 | `user` | `system_auth` | Auth signals: , userId | 		await ctx.runMutation(cleanupApi.updateSyncTimestamp, { userId }); |
| `convex/features/readwise/cleanup.ts` | 428 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/features/readwise/cleanup.ts` | 432 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 			.query('userSettings') |
| `convex/features/readwise/cleanup.ts` | 433 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/features/readwise/filters.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string, |
| `convex/features/readwise/filters.ts` | 57 | 1 | `UserS` | `workspace` | Workspace signals: workspace | 	const getUserSettingsQuery = internal.core.workspaces.settings |
| `convex/features/readwise/filters.ts` | 58 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 		.getUserSettingsForSync as FunctionReference< |
| `convex/features/readwise/filters.ts` | 61 | 1 | `user` | `system_auth` | Auth signals: , userId | 		{ userId: string }, |
| `convex/features/readwise/filters.ts` | 64 | 3 | `userS, UserS, user` | `system_auth` | Auth signals: , userId | 	const userSettings = await ctx.runQuery(getUserSettingsQuery, { userId }); |
| `convex/features/readwise/filters.ts` | 65 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	const lastSyncAt = userSettings?.lastReadwiseSyncAt; |
| `convex/features/readwise/filters.ts` | 71 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/readwise/filters.ts` | 73 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const getUserOrgIdsQuery = internal.infrastructure.access.permissions |
| `convex/features/readwise/filters.ts` | 74 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		.getUserOrganizationIdsQuery as FunctionReference< |
| `convex/features/readwise/filters.ts` | 77 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		{ userId: Id<'users'> }, |
| `convex/features/readwise/filters.ts` | 80 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const workspaceIds = await ctx.runQuery(getUserOrgIdsQuery, { userId }); |
| `convex/features/readwise/filters.ts` | 84 | 1 | `User` | `workspace` | Workspace signals: workspace | 			'User must belong to at least one workspace' |
| `convex/features/readwise/mutations.ts` | 94 | 1 | `Users` | `workspace` | Workspace signals: workspace | 		workspaceId: v.id('workspaces'), // REQUIRED: Users always have at least one workspace |
| `convex/features/readwise/mutations.ts` | 212 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/features/readwise/mutations.ts` | 214 | 1 | `user` | `system_auth` | Auth signals: , userId | 	handler: (ctx, args) => updateLastSyncTimeImpl(ctx, args.userId) |
| `convex/features/readwise/mutations/progress.ts` | 53 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | export async function updateLastSyncTimeImpl(ctx: MutationCtx, userId: Id<'users'>) { |
| `convex/features/readwise/mutations/progress.ts` | 56 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 		.query('userSettings') |
| `convex/features/readwise/mutations/progress.ts` | 57 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/features/readwise/mutations/progress.ts` | 67 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	await ctx.db.insert('userSettings', { |
| `convex/features/readwise/mutations/progress.ts` | 68 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/features/readwise/mutations/queries.ts` | 54 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/readwise/mutations/queries.ts` | 59 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/features/readwise/mutations/queries.ts` | 65 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 			'User is not a member of workspace' |
| `convex/features/readwise/mutations/tags.ts` | 3 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../../core/people/queries'; |
| `convex/features/readwise/orchestrator.ts` | 7 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/readwise/orchestrator.ts` | 10 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/readwise/orchestrator.ts` | 19 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const { userId, apiKey, updatedAfter: dateFilter, limit } = args; |
| `convex/features/readwise/orchestrator.ts` | 20 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const workspaceId = args.workspaceId ?? (await requireWorkspaceId(ctx, userId)); |
| `convex/features/readwise/orchestrator.ts` | 21 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/readwise/orchestrator.ts` | 27 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `convex/features/readwise/progress.ts` | 17 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	if (!person \|\| !person.userId) { |
| `convex/features/readwise/progress.ts` | 18 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		throw new Error('Person not found or missing userId'); |
| `convex/features/readwise/progress.ts` | 21 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		userId: person.userId |
| `convex/features/readwise/queries/progress.ts` | 3 | 1 | `USER` | `workspace` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../../core/people/constants'; |
| `convex/features/readwise/queries/progress.ts` | 16 | 2 | `User, USER` | `workspace` | Workspace signals: person/people | 	const linkedUser = person[USER_ID_FIELD]; |
| `convex/features/readwise/queries/progress.ts` | 17 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (!linkedUser) return null; |
| `convex/features/readwise/readwise.test.ts` | 28 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 			.mockResolvedValueOnce('user-1') // getUserId |
| `convex/features/readwise/readwise.test.ts` | 55 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const result = await parseIncrementalDate(ctx, 'user-1', undefined, undefined, undefined); |
| `convex/features/readwise/readwise.test.ts` | 62 | 1 | `user` | `workspace` | Workspace signals: workspace | 		await expect(requireWorkspaceId(ctx, 'user-1' as any)).rejects.toThrow( |
| `convex/features/readwise/readwise.test.ts` | 63 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 			`${ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED}: User must belong to at least one workspace` |
| `convex/features/readwise/readwise.test.ts` | 91 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'user-1', |
| `convex/features/readwise/sync.ts` | 59 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: v.id('users'), |
| `convex/features/readwise/tables.ts` | 32 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased')) |
| `convex/features/readwise/tables.ts` | 68 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased')) |
| `convex/features/readwise/testApi.ts` | 47 | 1 | `user` | `system_auth` | Auth signals: , userId | 			const { userId } = await ctx.runQuery( |
| `convex/features/readwise/testApi.ts` | 48 | 1 | `User` | `system_auth` | Auth signals: session | 				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/readwise/testApi.ts` | 58 | 1 | `user` | `system_auth` | Auth signals: , userId | 					userId |
| `convex/features/readwise/testApi.ts` | 166 | 1 | `user` | `system_auth` | Auth signals: , userId | 			const { userId } = await ctx.runQuery( |
| `convex/features/readwise/testApi.ts` | 167 | 1 | `User` | `system_auth` | Auth signals: session | 				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/readwise/testApi.ts` | 176 | 1 | `user` | `system_auth` | Auth signals: , userId | 					userId |
| `convex/features/tags/access.test.ts` | 33 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace | 		const actor = { personId: 'p1', workspaceId: 'ws1', user: 'u1' } as any; |
| `convex/features/tags/access.test.ts` | 46 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace | 		const actor = { personId: 'p1', workspaceId: 'ws1', user: 'u1' } as any; |
| `convex/features/tags/access.ts` | 1 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId as validateSession } from '../../infrastructure/sessionValidation'; |
| `convex/features/tags/access.ts` | 3 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/tags/access.ts` | 15 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type | 	user: Id<'users'>; |
| `convex/features/tags/access.ts` | 18 | 2 | `user, users` | `unknown` | Mixed auth(1) + workspace(1) signals | async function resolveWorkspace(ctx: AnyCtx, user: Id<'users'>, workspaceId?: WorkspaceId) { |
| `convex/features/tags/access.ts` | 21 | 2 | `User, user` | `workspace` | Workspace signals: workspace | 	const workspaces = await listWorkspacesForUser(ctx, user); |
| `convex/features/tags/access.ts` | 37 | 2 | `User` | `system_auth` | Auth signals: session | 	const actorUser = sessionResult.session.convexUserId; |
| `convex/features/tags/access.ts` | 38 | 1 | `User` | `workspace` | Workspace signals: workspace | 	const resolvedWorkspaceId = await resolveWorkspace(ctx, actorUser, workspaceId); |
| `convex/features/tags/access.ts` | 39 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace | 	const person = await getPersonByUserAndWorkspace(ctx, actorUser, resolvedWorkspaceId); |
| `convex/features/tags/access.ts` | 45 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		user: actorUser |
| `convex/features/tags/assignments.test.ts` | 9 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace | 		.mockResolvedValue({ personId: 'person1', workspaceId: 'ws1', user: 'u1' }), |
| `convex/features/tags/index.ts` | 8 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	listUserTags, |
| `convex/features/tags/lifecycle.test.ts` | 6 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, workspace | 		.mockResolvedValue({ personId: 'person1', workspaceId: 'ws1', user: 'u1' }), |
| `convex/features/tags/lifecycle.test.ts` | 85 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('createTagShare rejects when user does not own tag', async () => { |
| `convex/features/tags/lifecycle.test.ts` | 90 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				ownershipType: 'user', |
| `convex/features/tags/lifecycle.test.ts` | 113 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				ownershipType: 'user', |
| `convex/features/tags/lifecycle.ts` | 83 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 		ownership: v.optional(v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'))), |
| `convex/features/tags/lifecycle.ts` | 93 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	shareWith: Exclude<TagOwnership, 'user'>; |
| `convex/features/tags/lifecycle.ts` | 101 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	shareWith: Exclude<TagOwnership, 'user'>, |
| `convex/features/tags/lifecycle.ts` | 151 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (tag.ownershipType && tag.ownershipType !== 'user') { |
| `convex/features/tags/queries.ts` | 107 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const listUserTags = query({ |
| `convex/features/tags/tables.ts` | 14 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 	ownershipType: v.optional(v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'))) |
| `convex/features/tags/validation.ts` | 10 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | export type TagOwnership = 'user' \| 'workspace' \| 'circle'; |
| `convex/features/tags/validation.ts` | 44 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (ownership === 'user') { |
| `convex/features/tags/validation.ts` | 50 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			.filter((q) => q.eq(q.field('ownershipType'), 'user')) |
| `convex/features/tasks/access.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/access.ts` | 11 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/tasks/access.ts` | 13 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/features/tasks/access.ts` | 66 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/tasks/access.ts` | 75 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId); |
| `convex/features/tasks/access.ts` | 79 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, task.workspaceId, userId); |
| `convex/features/tasks/assignments.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/assignments.ts` | 13 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `convex/features/tasks/assignments.ts` | 15 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/assignments.ts` | 19 | 1 | `User` | `workspace` | Workspace signals: role, assignee | 	ensureValidAssignee(args.assigneeType, args.assigneeUserId, args.assigneeRoleId); |
| `convex/features/tasks/assignments.ts` | 21 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const { task, meeting } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/assignments.ts` | 23 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, args.userId, workspaceId); |
| `convex/features/tasks/assignments.ts` | 36 | 2 | `User` | `workspace` | Workspace signals: assignee | 		assigneeUserId: args.assigneeUserId, |
| `convex/features/tasks/index.ts` | 16 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/tasks/index.ts` | 36 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 37 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const tasks = await listTasks(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 48 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 49 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const tasks = await listTasksByMeeting(ctx, { meetingId: args.meetingId, userId }); |
| `convex/features/tasks/index.ts` | 60 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 61 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const tasks = await listTasksByAgendaItem(ctx, { agendaItemId: args.agendaItemId, userId }); |
| `convex/features/tasks/index.ts` | 69 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 73 | 3 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 75 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			currentUserId, |
| `convex/features/tasks/index.ts` | 76 | 2 | `User` | `workspace` | Workspace signals: assignee | 			targetUserId: args.assigneeUserId, |
| `convex/features/tasks/index.ts` | 89 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 90 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return getTaskWithAccess(ctx, { taskId: args.actionItemId, userId }); |
| `convex/features/tasks/index.ts` | 102 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 		assigneeType: v.union(v.literal('user'), v.literal('role')), |
| `convex/features/tasks/index.ts` | 103 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 110 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 111 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const { actionItemId } = await createTask(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 126 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 127 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return updateTaskDetails(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 138 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 139 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return updateTaskStatus(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 147 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 		assigneeType: v.union(v.literal('user'), v.literal('role')), |
| `convex/features/tasks/index.ts` | 148 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/index.ts` | 152 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 153 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		return updateTaskAssignee(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 163 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 164 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return updateTaskRemoval(ctx, { ...args, userId }); |
| `convex/features/tasks/lifecycle.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/tasks/lifecycle.ts` | 21 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 26 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 35 | 1 | `User` | `workspace` | Workspace signals: role, assignee | 	ensureValidAssignee(args.assigneeType, args.assigneeUserId, args.assigneeRoleId); |
| `convex/features/tasks/lifecycle.ts` | 37 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 59 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const person = await getPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId); |
| `convex/features/tasks/lifecycle.ts` | 69 | 2 | `User` | `workspace` | Workspace signals: assignee | 		assigneeUserId: args.assigneeUserId, |
| `convex/features/tasks/lifecycle.ts` | 87 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 91 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const { task } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 108 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 112 | 1 | `user` | `system_auth` | Auth signals: , userId | 	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 124 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 128 | 1 | `user` | `system_auth` | Auth signals: , userId | 	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 137 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>, |
| `convex/features/tasks/lifecycle.ts` | 140 | 2 | `user, User` | `workspace` | Workspace signals: assignee | 	if (assigneeType === 'user' && !assigneeUserId) { |
| `convex/features/tasks/lifecycle.ts` | 143 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 			'assigneeUserId is required when assigneeType is user' |
| `convex/features/tasks/queries.ts` | 14 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 18 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 34 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 40 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 50 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 57 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 66 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	currentUserId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 67 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	targetUserId?: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 72 | 4 | `User` | `workspace` | Workspace signals: assignee | 	const assigneeUserId = getTargetUserId(args.targetUserId, args.currentUserId); |
| `convex/features/tasks/queries.ts` | 76 | 3 | `user, User` | `workspace` | Workspace signals: assignee | 		.withIndex('by_assignee_user', (q) => q.eq('assigneeUserId', assigneeUserId)) |
| `convex/features/tasks/queries.ts` | 88 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 94 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await ensureWorkspaceMembership(ctx, task.workspaceId, args.userId); |
| `convex/features/tasks/queries.ts` | 99 | 5 | `User, users` | `system_auth` | Auth signals: Convex users id type | function getTargetUserId(targetUserId: Id<'users'> \| undefined, currentUserId: Id<'users'>) { |
| `convex/features/tasks/queries.ts` | 100 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 	return targetUserId ?? currentUserId; |
| `convex/features/tasks/tables.ts` | 10 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 	assigneeType: v.union(v.literal('user'), v.literal('role')), |
| `convex/features/tasks/tables.ts` | 11 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId: v.optional(v.id('users')), |
| `convex/features/tasks/tables.ts` | 26 | 2 | `user, User` | `workspace` | Workspace signals: assignee | 	.index('by_assignee_user', ['assigneeUserId']); |
| `convex/features/tasks/tasks.test.ts` | 12 | 1 | `User` | `workspace` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn().mockResolvedValue({ _id: 'person1' }) |
| `convex/features/tasks/tasks.test.ts` | 39 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 	vi.useRealTimers(); |
| `convex/features/tasks/tasks.test.ts` | 84 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 114 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `convex/features/tasks/tasks.test.ts` | 115 | 1 | `User` | `workspace` | Workspace signals: assignee | 			assigneeUserId: 'assignee1' as any, |
| `convex/features/tasks/tasks.test.ts` | 119 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 131 | 1 | `user` | `workspace` | Workspace signals: assignee | 				assigneeType: 'user', |
| `convex/features/tasks/tasks.test.ts` | 132 | 1 | `User` | `workspace` | Workspace signals: assignee | 				assigneeUserId: 'assignee1', |
| `convex/features/tasks/tasks.test.ts` | 154 | 1 | `user` | `workspace` | Workspace signals: assignee | 				assigneeType: 'user', |
| `convex/features/tasks/tasks.test.ts` | 155 | 1 | `User` | `workspace` | Workspace signals: assignee | 				assigneeUserId: 'assignee1' as any, |
| `convex/features/tasks/tasks.test.ts` | 157 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 172 | 1 | `user` | `workspace` | Workspace signals: assignee | 				assigneeType: 'user', |
| `convex/features/tasks/tasks.test.ts` | 174 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 177 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 			`${ErrorCodes.VALIDATION_REQUIRED_FIELD}: assigneeUserId is required when assigneeType is user` |
| `convex/features/tasks/tasks.test.ts` | 201 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 219 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 243 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 258 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 271 | 1 | `user` | `system_auth` | Auth signals: , userId | 		await updateTaskRemoval(ctx, { actionItemId: 'task1' as any, userId: 'u1' as any }); |
| `convex/features/tasks/types.ts` | 3 | 1 | `user` | `workspace` | Workspace signals: role, assignee | export type TaskAssigneeType = 'user' \| 'role'; |
| `convex/features/waitlist/index.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/waitlist/index.ts` | 24 | 1 | `User` | `system_auth` | Auth signals: session | 				await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/waitlist/index.ts` | 88 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 14 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceBranding/index.ts` | 16 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/workspaceBranding/index.ts` | 27 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 28 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/features/workspaceBranding/index.ts` | 29 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await ensureBrandingUpdatePermissions(ctx, args.workspaceId, userId); |
| `convex/features/workspaceBranding/index.ts` | 41 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 43 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 62 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceBranding/index.ts` | 63 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		return collectBrandingForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 68 | 1 | `User` | `workspace` | Workspace signals: workspace | async function collectBrandingForUser( |
| `convex/features/workspaceBranding/index.ts` | 69 | 1 | `User` | `workspace` | Workspace signals: workspace | 	ctx: Parameters<typeof listWorkspacesForUser>[0], |
| `convex/features/workspaceBranding/index.ts` | 70 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `convex/features/workspaceBranding/index.ts` | 72 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/features/workspaceBranding/index.ts` | 98 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `convex/features/workspaceBranding/index.ts` | 103 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		userId, |
| `convex/features/workspaceSettings/index.test.ts` | 6 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceSettings/index.test.ts` | 9 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId: vi.fn() |
| `convex/features/workspaceSettings/index.test.ts` | 12 | 2 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | const mockValidateSessionAndGetUserId = validateSessionAndGetUserId as vi.MockedFunction< |
| `convex/features/workspaceSettings/index.test.ts` | 13 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 	typeof validateSessionAndGetUserId |
| `convex/features/workspaceSettings/index.test.ts` | 22 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 	test('getOrgSettings rejects when user is not a member', async () => { |
| `convex/features/workspaceSettings/index.test.ts` | 23 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any }); |
| `convex/features/workspaceSettings/index.test.ts` | 42 | 1 | `users` | `workspace` | Workspace signals: workspace | 	test('updateOrgSettings rejects non-admin users', async () => { |
| `convex/features/workspaceSettings/index.test.ts` | 43 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any }); |
| `convex/features/workspaceSettings/index.ts` | 14 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/workspaceSettings/index.ts` | 24 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'>, |
| `convex/features/workspaceSettings/index.ts` | 29 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/features/workspaceSettings/index.ts` | 49 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 54 | 1 | `user` | `workspace` | Workspace signals: workspace | 			.withIndex('by_workspace_user', (q) => |
| `convex/features/workspaceSettings/index.ts` | 55 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/features/workspaceSettings/index.ts` | 100 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 104 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: userId, |
| `convex/features/workspaceSettings/index.ts` | 125 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 				messages: [{ role: 'user', content: 'test' }] |
| `convex/features/workspaceSettings/index.ts` | 149 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 		userId: v.id('users'), |
| `convex/features/workspaceSettings/index.ts` | 153 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, args.userId, args.workspaceId); |
| `convex/features/workspaceSettings/index.ts` | 204 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 207 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId); |
| `convex/features/workspaceSettings/index.ts` | 242 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 247 | 1 | `user` | `workspace` | Workspace signals: workspace | 			.withIndex('by_workspace_user', (q) => |
| `convex/features/workspaceSettings/index.ts` | 248 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				q.eq('workspaceId', args.workspaceId).eq('userId', userId) |
| `convex/features/workspaceSettings/index.ts` | 319 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/workspaceSettings/index.ts` | 322 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId); |
| `convex/infrastructure/access/permissions.ts` | 5 | 1 | `User` | `workspace` | Workspace signals: people, workspace, people domain path | import { listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/infrastructure/access/permissions.ts` | 12 | 1 | `User` | `workspace` | Workspace signals: workspace | export async function getUserWorkspaceIds( |
| `convex/infrastructure/access/permissions.ts` | 14 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 16 | 3 | `User, user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	const normalizedUserId = userId as Id<'users'>; |
| `convex/infrastructure/access/permissions.ts` | 19 | 2 | `User` | `workspace` | Workspace signals: workspace | 	const workspaceIds = await listWorkspacesForUser(ctx, normalizedUserId); |
| `convex/infrastructure/access/permissions.ts` | 28 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserOrganizationIdsQuery = internalQuery({ |
| `convex/infrastructure/access/permissions.ts` | 30 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/infrastructure/access/permissions.ts` | 34 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const workspaceIds = await listWorkspacesForUser(ctx, args.userId); |
| `convex/infrastructure/access/permissions.ts` | 44 | 1 | `User` | `workspace` | Workspace signals: circle | export async function getUserCircleIds( |
| `convex/infrastructure/access/permissions.ts` | 46 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 48 | 3 | `User, user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	const normalizedUserId = userId as Id<'users'>; |
| `convex/infrastructure/access/permissions.ts` | 54 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', normalizedUserId)) |
| `convex/infrastructure/access/permissions.ts` | 68 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string, |
| `convex/infrastructure/access/permissions.ts` | 69 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	content: { userId: string; workspaceId?: string; circleId?: string; ownershipType?: string } |
| `convex/infrastructure/access/permissions.ts` | 71 | 2 | `user` | `system_auth` | Auth signals: , userId | 	if (content.userId === userId) { |
| `convex/infrastructure/access/permissions.ts` | 76 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		getUserWorkspaceIds(ctx, userId), |
| `convex/infrastructure/access/permissions.ts` | 77 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		getUserCircleIds(ctx, userId) |
| `convex/infrastructure/access/permissions.ts` | 102 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 104 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string; |
| `convex/infrastructure/access/permissions.ts` | 109 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		getUserWorkspaceIds(ctx, userId), |
| `convex/infrastructure/access/permissions.ts` | 110 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		getUserCircleIds(ctx, userId) |
| `convex/infrastructure/access/permissions.ts` | 114 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 14 | 3 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const userId = 'user1' as Id<'users'>; |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 18 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 26 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 			async ({ userId: receivedUserId, circle }) => { |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 27 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				expect(receivedUserId).toBe(userId); |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 40 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 58 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 76 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 94 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.test.ts` | 112 | 2 | `User, user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }), |
| `convex/infrastructure/access/withCircleAccess.ts` | 3 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/infrastructure/access/withCircleAccess.ts` | 17 | 2 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId: typeof validateSessionAndGetUserId; |
| `convex/infrastructure/access/withCircleAccess.ts` | 25 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 		userId: Id<'users'> |
| `convex/infrastructure/access/withCircleAccess.ts` | 30 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 	validateSessionAndGetUserId, |
| `convex/infrastructure/access/withCircleAccess.ts` | 32 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	isWorkspaceMember: async (ctx, workspaceId, userId) => { |
| `convex/infrastructure/access/withCircleAccess.ts` | 35 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `convex/infrastructure/access/withCircleAccess.ts` | 50 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	handler: (input: { userId: Id<'users'>; circle: Doc<'circles'> }) => Promise<T>, |
| `convex/infrastructure/access/withCircleAccess.ts` | 54 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const { userId } = await deps.validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/access/withCircleAccess.ts` | 66 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		const isMember = await deps.isWorkspaceMember(ctx, circle.workspaceId, userId); |
| `convex/infrastructure/access/withCircleAccess.ts` | 75 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	return handler({ userId, circle }); |
| `convex/infrastructure/access/workspaceRoles.ts` | 12 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/access/workspaceRoles.ts` | 21 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `convex/infrastructure/access/workspaceRoles.ts` | 22 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 	userName: string \| null; |
| `convex/infrastructure/access/workspaceRoles.ts` | 23 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 	userEmail: string; |
| `convex/infrastructure/access/workspaceRoles.ts` | 25 | 2 | `user` | `workspace` | Workspace signals: workspace, role | 		userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; // ID from systemRoles or workspaceRoles table (SYOS-862: migrated from userRoles) |
| `convex/infrastructure/access/workspaceRoles.ts` | 52 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/access/workspaceRoles.ts` | 66 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 			if (!person.userId) continue; // Skip invited-only people (no userId yet) |
| `convex/infrastructure/access/workspaceRoles.ts` | 68 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			const userId = person.userId; // TypeScript narrowing after null check |
| `convex/infrastructure/access/workspaceRoles.ts` | 69 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			const user = await ctx.db.get(userId); |
| `convex/infrastructure/access/workspaceRoles.ts` | 70 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			if (!user) continue; |
| `convex/infrastructure/access/workspaceRoles.ts` | 78 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/access/workspaceRoles.ts` | 90 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 						userRoleId: systemRole._id, |
| `convex/infrastructure/access/workspaceRoles.ts` | 117 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 						userRoleId: workspaceRole._id, |
| `convex/infrastructure/access/workspaceRoles.ts` | 132 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				userId: userId, |
| `convex/infrastructure/access/workspaceRoles.ts` | 133 | 2 | `user` | `workspace` | Workspace signals: workspace, role | 				userName: user.name ?? null, |
| `convex/infrastructure/access/workspaceRoles.ts` | 134 | 2 | `user` | `workspace` | Workspace signals: workspace, role | 				userEmail: user.email, |
| `convex/infrastructure/access/workspaceRoles.ts` | 153 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth.test.ts` | 7 | 1 | `User` | `system_auth` | Auth signals: session | 		expect(Object.keys(auth).sort()).toEqual(['validateSessionAndGetUserId']); |
| `convex/infrastructure/auth.test.ts` | 8 | 1 | `User` | `system_auth` | Auth signals: session | 		expect(auth.validateSessionAndGetUserId).toBeTypeOf('function'); |
| `convex/infrastructure/auth.ts` | 7 | 1 | `User` | `system_auth` | Auth signals: session | export { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/auth.ts` | 11 | 1 | `User` | `system_auth` | Auth signals: session | const AUTH_HELPER_GUARD = 'use-validateSessionAndGetUserId-only' as const; |
| `convex/infrastructure/auth/helpers.ts` | 9 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const identity = await ctx.auth.getUserIdentity(); |
| `convex/infrastructure/auth/helpers.ts` | 20 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		throw createError(ErrorCodes.AUTH_REQUIRED, 'User not found'); |
| `convex/infrastructure/auth/tables.ts` | 10 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId: v.optional(v.id('users')), |
| `convex/infrastructure/auth/tables.ts` | 12 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/tables.ts` | 21 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	convexUserId: v.id('users'), |
| `convex/infrastructure/auth/tables.ts` | 22 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	workosUserId: v.string(), |
| `convex/infrastructure/auth/tables.ts` | 32 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/tables.ts` | 35 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 	userSnapshot: v.object({ |
| `convex/infrastructure/auth/tables.ts` | 36 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		userId: v.id('users'), |
| `convex/infrastructure/auth/tables.ts` | 52 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 	.index('by_convex_user', ['convexUserId']) |
| `convex/infrastructure/auth/tables.ts` | 65 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()) |
| `convex/infrastructure/auth/validateApiKeys.ts` | 37 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 							role: 'user', |
| `convex/infrastructure/auth/verification.ts` | 4 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/auth/verification.ts` | 25 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 140 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 181 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 220 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/verification.ts` | 225 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 234 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 				userAgent: args.userAgent |
| `convex/infrastructure/auth/verification.ts` | 266 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: v.optional(v.string()) |
| `convex/infrastructure/auth/verification.ts` | 300 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: args.userAgent |
| `convex/infrastructure/authSessions.ts` | 3 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/authSessions.ts` | 14 | 2 | `User, users` | `system_auth` | Auth signals: session, Convex users id type | 		ownerUserId: v.optional(v.id('users')), |
| `convex/infrastructure/authSessions.ts` | 16 | 1 | `user` | `system_auth` | Auth signals: session | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/authSessions.ts` | 22 | 1 | `User` | `system_auth` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 41 | 2 | `User` | `system_auth` | Auth signals: session | 			primaryUserId: args.ownerUserId, |
| `convex/infrastructure/authSessions.ts` | 43 | 2 | `user` | `system_auth` | Auth signals: session | 			userAgent: args.userAgent, |
| `convex/infrastructure/authSessions.ts` | 61 | 1 | `User` | `system_auth` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 84 | 2 | `User` | `system_auth` | Auth signals: session | 			primaryUserId: record.primaryUserId ?? undefined, |
| `convex/infrastructure/authSessions.ts` | 86 | 2 | `user` | `system_auth` | Auth signals: session | 			userAgent: record.userAgent, |
| `convex/infrastructure/authSessions.ts` | 92 | 1 | `User` | `system_auth` | Auth signals: session | export const getActiveSessionForUser = query({ |
| `convex/infrastructure/authSessions.ts` | 95 | 2 | `User, users` | `system_auth` | Auth signals: session, Convex users id type | 		targetUserId: v.id('users') |
| `convex/infrastructure/authSessions.ts` | 98 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 101 | 3 | `user, User` | `system_auth` | Auth signals: session | 			.withIndex('by_convex_user', (q) => q.eq('convexUserId', args.targetUserId)) |
| `convex/infrastructure/authSessions.ts` | 129 | 2 | `User, users` | `system_auth` | Auth signals: session, Convex users id type | 		ownerUserId: v.id('users'), |
| `convex/infrastructure/authSessions.ts` | 130 | 1 | `User` | `system_auth` | Auth signals: WorkOS, session | 		workosUserIdentifier: v.string(), |
| `convex/infrastructure/authSessions.ts` | 138 | 1 | `user` | `system_auth` | Auth signals: session | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/authSessions.ts` | 139 | 1 | `userS` | `system_auth` | Auth signals: session | 		userSnapshot: v.object({ |
| `convex/infrastructure/authSessions.ts` | 140 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | 			userId: v.id('users'), |
| `convex/infrastructure/authSessions.ts` | 168 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: args.ownerUserId, |
| `convex/infrastructure/authSessions.ts` | 169 | 2 | `User` | `system_auth` | Auth signals: WorkOS, session | 			workosUserId: args.workosUserIdentifier, |
| `convex/infrastructure/authSessions.ts` | 179 | 2 | `user` | `system_auth` | Auth signals: session | 			userAgent: args.userAgent, |
| `convex/infrastructure/authSessions.ts` | 182 | 2 | `userS` | `system_auth` | Auth signals: session | 			userSnapshot: args.userSnapshot |
| `convex/infrastructure/authSessions.ts` | 266 | 1 | `user` | `system_auth` | Auth signals: session | 		userAgent: v.optional(v.string()) |
| `convex/infrastructure/authSessions.ts` | 281 | 3 | `user` | `system_auth` | Auth signals: session | 			userAgent: args.userAgent ?? record.userAgent |
| `convex/infrastructure/email.ts` | 8 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/email.ts` | 79 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/email.ts` | 105 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				firstName: args.firstName \|\| 'User' |
| `convex/infrastructure/email.ts` | 247 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				firstName: args.firstName \|\| 'User' |
| `convex/infrastructure/errors/codes.ts` | 10 | 2 | `USER` | `unknown` | No strong auth/workspace signals detected | 	USER_NOT_FOUND: 'USER_NOT_FOUND', |
| `convex/infrastructure/errors/codes.ts` | 137 | 2 | `USER` | `unknown` | No strong auth/workspace signals detected | 	INVITE_USER_MISMATCH: 'INVITE_USER_MISMATCH', |
| `convex/infrastructure/errors/codes.ts` | 187 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userMessage: string; |
| `convex/infrastructure/errors/codes.ts` | 222 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userMessage: string, |
| `convex/infrastructure/errors/codes.ts` | 226 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const serializedMessage = `SYNERGYOS_ERROR\|${code}\|${userMessage}\|${fullDetails}`; |
| `convex/infrastructure/errors/codes.ts` | 234 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 	(error as any).userMessage = userMessage; |
| `convex/infrastructure/errors/codes.ts` | 240 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	console.error(`[${code}] ${userMessage}`, { |
| `convex/infrastructure/errors/codes.ts` | 242 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userMessage, |
| `convex/infrastructure/featureFlags.ts` | 5 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	findFlagsForUser, |
| `convex/infrastructure/featureFlags.ts` | 23 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	findFlagsForUser, |
| `convex/infrastructure/featureFlags/access.ts` | 2 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/featureFlags/access.ts` | 3 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import type { UserContext } from './types'; |
| `convex/infrastructure/featureFlags/access.ts` | 10 | 2 | `User` | `system_auth` | Auth signals: session | export async function getUserContext(ctx: Ctx, sessionId: string): Promise<UserContext> { |
| `convex/infrastructure/featureFlags/access.ts` | 11 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/featureFlags/access.ts` | 12 | 2 | `user` | `system_auth` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/infrastructure/featureFlags/access.ts` | 13 | 2 | `user` | `system_auth` | Auth signals: , userId | 	return { userId, user }; |
| `convex/infrastructure/featureFlags/debug.ts` | 1 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import type { Ctx, FeatureFlagDoc, UserContext } from './types'; |
| `convex/infrastructure/featureFlags/debug.ts` | 9 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	userContext: UserContext |
| `convex/infrastructure/featureFlags/debug.ts` | 12 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId: string; |
| `convex/infrastructure/featureFlags/debug.ts` | 13 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userEmail?: string; |
| `convex/infrastructure/featureFlags/debug.ts` | 21 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		{ flagConfig, userContext, flagName: flag }, |
| `convex/infrastructure/featureFlags/debug.ts` | 27 | 3 | `user` | `system_auth` | Auth signals: , userId | 		userId: userContext.userId, |
| `convex/infrastructure/featureFlags/debug.ts` | 28 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 		userEmail: userContext.user?.email ?? undefined, |
| `convex/infrastructure/featureFlags/debug.ts` | 32 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 			allowedUserIds: flagConfig.allowedUserIds, |
| `convex/infrastructure/featureFlags/debug.ts` | 43 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | export function buildMissingFlagDebug(flag: string, userContext: UserContext) { |
| `convex/infrastructure/featureFlags/debug.ts` | 46 | 3 | `user` | `system_auth` | Auth signals: , userId | 		userId: userContext.userId, |
| `convex/infrastructure/featureFlags/debug.ts` | 47 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 		userEmail: userContext.user?.email ?? undefined, |
| `convex/infrastructure/featureFlags/impact.ts` | 2 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import { findUserEmail } from './utils'; |
| `convex/infrastructure/featureFlags/impact.ts` | 6 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	totalUsers: number; |
| `convex/infrastructure/featureFlags/impact.ts` | 7 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	usersByDomain: Record<string, number>; |
| `convex/infrastructure/featureFlags/impact.ts` | 10 | 2 | `Users, users` | `system_auth` | Auth signals: query users table | 	const allUsers = await ctx.db.query('users').collect(); |
| `convex/infrastructure/featureFlags/impact.ts` | 11 | 2 | `Users` | `unknown` | No strong auth/workspace signals detected | 	const totalUsers = allUsers.length; |
| `convex/infrastructure/featureFlags/impact.ts` | 13 | 3 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 	const usersByDomain = countUsersByDomain(allUsers); |
| `convex/infrastructure/featureFlags/impact.ts` | 15 | 2 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 	const flagImpacts = flags.map((flag) => calculateImpact(flag, usersByDomain, totalUsers)); |
| `convex/infrastructure/featureFlags/impact.ts` | 18 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		totalUsers, |
| `convex/infrastructure/featureFlags/impact.ts` | 19 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 		usersByDomain: Object.fromEntries(usersByDomain), |
| `convex/infrastructure/featureFlags/impact.ts` | 24 | 3 | `Users, users` | `unknown` | No strong auth/workspace signals detected | function countUsersByDomain(users: Doc<'users'>[]): Map<string, number> { |
| `convex/infrastructure/featureFlags/impact.ts` | 25 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	const usersByDomain = new Map<string, number>(); |
| `convex/infrastructure/featureFlags/impact.ts` | 26 | 2 | `user, users` | `unknown` | No strong auth/workspace signals detected | 	for (const user of users) { |
| `convex/infrastructure/featureFlags/impact.ts` | 27 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 		const email = findUserEmail(user); |
| `convex/infrastructure/featureFlags/impact.ts` | 30 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 			usersByDomain.set(domain, (usersByDomain.get(domain) \|\| 0) + 1); |
| `convex/infrastructure/featureFlags/impact.ts` | 33 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	return usersByDomain; |
| `convex/infrastructure/featureFlags/impact.ts` | 38 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	usersByDomain: Map<string, number>, |
| `convex/infrastructure/featureFlags/impact.ts` | 39 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	totalUsers: number |
| `convex/infrastructure/featureFlags/impact.ts` | 44 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		byUserIds: 0, |
| `convex/infrastructure/featureFlags/impact.ts` | 59 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			breakdown.byDomain += usersByDomain.get(domain) \|\| 0; |
| `convex/infrastructure/featureFlags/impact.ts` | 63 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (flag.allowedUserIds?.length) { |
| `convex/infrastructure/featureFlags/impact.ts` | 64 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		breakdown.byUserIds = flag.allowedUserIds.length; |
| `convex/infrastructure/featureFlags/impact.ts` | 68 | 1 | `users` | `workspace` | Workspace signals: workspace | 		breakdown.byOrgIds = flag.allowedWorkspaceIds.length * 10; // Estimate: 10 users per org |
| `convex/infrastructure/featureFlags/impact.ts` | 72 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const alreadyCovered = breakdown.byDomain + breakdown.byUserIds + breakdown.byOrgIds; |
| `convex/infrastructure/featureFlags/impact.ts` | 73 | 2 | `Users` | `unknown` | No strong auth/workspace signals detected | 		const remainingUsers = Math.max(0, totalUsers - alreadyCovered); |
| `convex/infrastructure/featureFlags/impact.ts` | 74 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		breakdown.byRollout = Math.round((remainingUsers * flag.rolloutPercentage) / 100); |
| `convex/infrastructure/featureFlags/impact.ts` | 79 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		breakdown.byUserIds, |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 12 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 	allowedUserIds?: FeatureFlagDoc['allowedUserIds']; |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 29 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		allowedUserIds: args.allowedUserIds, |
| `convex/infrastructure/featureFlags/lifecycle.ts` | 44 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		allowedUserIds: args.allowedUserIds, |
| `convex/infrastructure/featureFlags/queries.ts` | 3 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import type { Ctx, FeatureFlagDoc, UserContext } from './types'; |
| `convex/infrastructure/featureFlags/queries.ts` | 4 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import { requireAdmin, getUserContext } from './access'; |
| `convex/infrastructure/featureFlags/queries.ts` | 17 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | async function buildFlagResultsForUser( |
| `convex/infrastructure/featureFlags/queries.ts` | 20 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	userContext: UserContext |
| `convex/infrastructure/featureFlags/queries.ts` | 25 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				{ flagConfig: flag, userContext, flagName: flag.flag }, |
| `convex/infrastructure/featureFlags/queries.ts` | 41 | 2 | `user, User` | `system_auth` | Auth signals: session | 		const userContext = await getUserContext(ctx, args.sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 43 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (!flagConfig \|\| !flagConfig.enabled \|\| !userContext.user) return false; |
| `convex/infrastructure/featureFlags/queries.ts` | 44 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		return evaluateFlag({ flagConfig, userContext, flagName: args.flag }, ctx); |
| `convex/infrastructure/featureFlags/queries.ts` | 51 | 2 | `user, User` | `system_auth` | Auth signals: session | 		const userContext = await getUserContext(ctx, args.sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 52 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 		const user = userContext.user; |
| `convex/infrastructure/featureFlags/queries.ts` | 59 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			if (!flagConfig \|\| !flagConfig.enabled \|\| !user) { |
| `convex/infrastructure/featureFlags/queries.ts` | 63 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			results[flag] = await evaluateFlag({ flagConfig, userContext, flagName: flag }, ctx); |
| `convex/infrastructure/featureFlags/queries.ts` | 99 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const findFlagsForUser = query({ |
| `convex/infrastructure/featureFlags/queries.ts` | 100 | 1 | `user` | `system_auth` | Auth signals: session | 	args: { sessionId: v.string(), userEmail: v.string() }, |
| `convex/infrastructure/featureFlags/queries.ts` | 103 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const user = await ctx.db |
| `convex/infrastructure/featureFlags/queries.ts` | 104 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			.query('users') |
| `convex/infrastructure/featureFlags/queries.ts` | 105 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			.withIndex('by_email', (q) => q.eq('email', args.userEmail.toLowerCase())) |
| `convex/infrastructure/featureFlags/queries.ts` | 107 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (!user) return null; |
| `convex/infrastructure/featureFlags/queries.ts` | 109 | 4 | `user` | `system_auth` | Auth signals: , userId | 		const userContext = { userId: user._id, user }; |
| `convex/infrastructure/featureFlags/queries.ts` | 111 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 		const flags = await buildFlagResultsForUser(ctx, allFlags, userContext); |
| `convex/infrastructure/featureFlags/queries.ts` | 114 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 			userEmail: args.userEmail, |
| `convex/infrastructure/featureFlags/queries.ts` | 115 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: user._id, |
| `convex/infrastructure/featureFlags/queries.ts` | 132 | 2 | `user, User` | `system_auth` | Auth signals: session | 		const userContext = await getUserContext(ctx, sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 134 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (!flagConfig) return buildMissingFlagDebug(flag, userContext); |
| `convex/infrastructure/featureFlags/queries.ts` | 135 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		return buildDebugInfo(ctx, flag, flagConfig, userContext); |
| `convex/infrastructure/featureFlags/queries.ts` | 146 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/featureFlags/queries.ts` | 163 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/featureFlags/targeting.ts` | 3 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import { getUserRolloutBucket, hasTargetingRules } from './utils'; |
| `convex/infrastructure/featureFlags/targeting.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: people, workspace, people domain path | import { listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/infrastructure/featureFlags/targeting.ts` | 6 | 1 | `user` | `workspace` | Workspace signals: workspace | async function userHasWorkspaceAccess( |
| `convex/infrastructure/featureFlags/targeting.ts` | 8 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/featureFlags/targeting.ts` | 13 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const userWorkspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/infrastructure/featureFlags/targeting.ts` | 14 | 1 | `user` | `workspace` | Workspace signals: workspace | 	return allowedWorkspaceIds.some((orgId) => userWorkspaceIds.includes(orgId)); |
| `convex/infrastructure/featureFlags/targeting.ts` | 17 | 2 | `user, users` | `unknown` | No strong auth/workspace signals detected | function isDomainAllowed(user: Doc<'users'> \| null, allowedDomains: string[] \| undefined): boolean { |
| `convex/infrastructure/featureFlags/targeting.ts` | 18 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!user?.email \|\| !allowedDomains?.length) return false; |
| `convex/infrastructure/featureFlags/targeting.ts` | 19 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const emailDomain = user.email.split('@')[1]; |
| `convex/infrastructure/featureFlags/targeting.ts` | 26 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/featureFlags/targeting.ts` | 31 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	const bucket = getUserRolloutBucket(userId, flagName); |
| `convex/infrastructure/featureFlags/targeting.ts` | 36 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const { flagConfig, userContext, flagName } = input; |
| `convex/infrastructure/featureFlags/targeting.ts` | 37 | 3 | `user` | `system_auth` | Auth signals: , userId | 	const { userId, user } = userContext; |
| `convex/infrastructure/featureFlags/targeting.ts` | 39 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!flagConfig.enabled \|\| !user) return false; |
| `convex/infrastructure/featureFlags/targeting.ts` | 41 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	if (flagConfig.allowedUserIds?.includes(userId)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 42 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 43 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (isDomainAllowed(user, flagConfig.allowedDomains)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 44 | 1 | `user` | `system_auth` | Auth signals: , userId | 	if (checkRollout(userId, flagName, flagConfig.rolloutPercentage)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 53 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const { flagConfig, userContext, flagName } = input; |
| `convex/infrastructure/featureFlags/targeting.ts` | 54 | 3 | `user` | `system_auth` | Auth signals: , userId | 	const { userId, user } = userContext; |
| `convex/infrastructure/featureFlags/targeting.ts` | 57 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	if (!user) return disabled(flagConfig, 'User not found'); |
| `convex/infrastructure/featureFlags/targeting.ts` | 59 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	if (flagConfig.allowedUserIds?.includes(userId)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 60 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		return success('User ID explicitly allowed'); |
| `convex/infrastructure/featureFlags/targeting.ts` | 63 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 67 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (isDomainAllowed(user, flagConfig.allowedDomains)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 68 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const domain = user.email?.split('@')[1]; |
| `convex/infrastructure/featureFlags/targeting.ts` | 73 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 		const bucket = getUserRolloutBucket(userId, flagName); |
| `convex/infrastructure/featureFlags/targeting.ts` | 85 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	return disabled(flagConfig, 'Targeting rules exist but user does not match'); |
| `convex/infrastructure/featureFlags/types.ts` | 8 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export interface UserContext { |
| `convex/infrastructure/featureFlags/types.ts` | 9 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/infrastructure/featureFlags/types.ts` | 10 | 2 | `user, users` | `unknown` | No strong auth/workspace signals detected | 	user: Doc<'users'> \| null; |
| `convex/infrastructure/featureFlags/types.ts` | 15 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	userContext: UserContext; |
| `convex/infrastructure/featureFlags/types.ts` | 27 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	byUserIds: number; |
| `convex/infrastructure/featureFlags/utils.ts` | 3 | 3 | `User, user, users` | `unknown` | No strong auth/workspace signals detected | export function findUserEmail(user: Doc<'users'> \| null): string \| null { |
| `convex/infrastructure/featureFlags/utils.ts` | 4 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!user) return null; |
| `convex/infrastructure/featureFlags/utils.ts` | 5 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const email = (user as Record<string, unknown>).email; |
| `convex/infrastructure/featureFlags/utils.ts` | 9 | 3 | `User, user, users` | `system_auth` | Auth signals: Convex users id type, userId | export function getUserRolloutBucket(userId: Id<'users'>, flag: string): number { |
| `convex/infrastructure/featureFlags/utils.ts` | 11 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const str = `${userId}:${flag}`; |
| `convex/infrastructure/featureFlags/utils.ts` | 24 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		flagConfig.allowedUserIds !== undefined \|\| |
| `convex/infrastructure/rbac/permissions.test.ts` | 18 | 1 | `User` | `workspace` | Workspace signals: role | import { assignRoleToUser } from '../../../tests/convex/integration/setup'; |
| `convex/infrastructure/rbac/permissions.test.ts` | 25 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 26 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 48 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 53 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 61 | 2 | `User, users` | `system_auth` | Auth signals: insert users table | 			const otherUserId = await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 62 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 				workosId: 'other-user', |
| `convex/infrastructure/rbac/permissions.test.ts` | 69 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.update', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 70 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId // Different owner |
| `convex/infrastructure/rbac/permissions.test.ts` | 82 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 92 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const otherUserId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 93 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 94 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 				workosId: 'other-user-1', |
| `convex/infrastructure/rbac/permissions.test.ts` | 115 | 1 | `User` | `workspace` | Workspace signals: circle, role | 		await assignRoleToUser(t, circleLeadId, roleId, { assignedBy: circleLeadId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 121 | 1 | `user` | `workspace` | Workspace signals: circle | 				resourceOwnerId: circleLeadId // Same as user |
| `convex/infrastructure/rbac/permissions.test.ts` | 131 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId // Different owner |
| `convex/infrastructure/rbac/permissions.test.ts` | 169 | 1 | `User` | `workspace` | Workspace signals: circle, role | 		await assignRoleToUser(t, circleLeadId, roleId, { |
| `convex/infrastructure/rbac/permissions.test.ts` | 182 | 1 | `user` | `workspace` | Workspace signals: role | 	test('Multi-role user has permissions from all roles', async () => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 186 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 187 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 217 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await assignRoleToUser(t, userId, circleLeadRoleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 218 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, billingRoleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 223 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'circles.update', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 224 | 1 | `user` | `system_auth` | Auth signals: , userId | 				resourceOwnerId: userId |
| `convex/infrastructure/rbac/permissions.test.ts` | 233 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'workspaces.manage-billing'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 243 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 244 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 266 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 272 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				await requirePermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 281 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 282 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 304 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, roleId, { assignedBy: userId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 309 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			await hasPermission(ctx, userId, 'circles.create'); |
| `convex/infrastructure/rbac/permissions.test.ts` | 316 | 3 | `user` | `system_auth` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/permissions.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: role | 	listActiveUserRoles, |
| `convex/infrastructure/rbac/permissions.ts` | 5 | 1 | `User` | `workspace` | Workspace signals: role | 	createUserRoleAssignment, |
| `convex/infrastructure/rbac/permissions.ts` | 6 | 1 | `User` | `workspace` | Workspace signals: role | 	updateUserRoleRevocation |
| `convex/infrastructure/rbac/permissions.ts` | 8 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export { isSystemAdmin, getUserPermissionsQuery } from './permissions/queries'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 3 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../sessionValidation'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 5 | 1 | `User` | `workspace` | Workspace signals: role | import { listActiveUserRoles } from './lifecycle'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 11 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	UserPermission |
| `convex/infrastructure/rbac/permissions/access.ts` | 17 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | const scopePriority: Record<UserPermission['scope'], number> = { all: 3, own: 2, none: 1 }; |
| `convex/infrastructure/rbac/permissions/access.ts` | 21 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 25 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	const permissions = await listUserPermissions(ctx, userId, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 29 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User has all scope'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 30 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (perm.scope === 'own') return handleOwnScope(ctx, userId, permissionSlug, perm, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 34 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 42 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 46 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		reason: 'Permission not granted to user', |
| `convex/infrastructure/rbac/permissions/access.ts` | 54 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 58 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const allowed = await hasPermission(ctx, userId, permissionSlug, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 64 | 1 | `users` | `system_auth` | Auth signals: session, Convex users id type | export async function requireSystemAdmin(ctx: Ctx, sessionId: string): Promise<Id<'users'>> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 65 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 66 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const isAdmin = await checkIsSystemAdmin(ctx, userId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 70 | 1 | `user` | `system_auth` | Auth signals: , userId | 	return userId; |
| `convex/infrastructure/rbac/permissions/access.ts` | 73 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | export async function checkIsSystemAdmin(ctx: Ctx, userId: Id<'users'>): Promise<boolean> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 74 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const roles = await listActiveUserRoles(ctx, userId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 83 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export async function listUserPermissions( |
| `convex/infrastructure/rbac/permissions/access.ts` | 85 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 87 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | ): Promise<UserPermission[]> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 88 | 2 | `User` | `workspace` | Workspace signals: role | 	const activeUserRoles = await listActiveUserRoles( |
| `convex/infrastructure/rbac/permissions/access.ts` | 90 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 93 | 1 | `User` | `workspace` | Workspace signals: role | 	const permissions = await collectPermissionsForRoles(ctx, activeUserRoles); |
| `convex/infrastructure/rbac/permissions/access.ts` | 100 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | ): Promise<UserPermission[]> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 101 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const permissions: UserPermission[] = []; |
| `convex/infrastructure/rbac/permissions/access.ts` | 102 | 1 | `user` | `workspace` | Workspace signals: role | 	for (const userRole of roles) { |
| `convex/infrastructure/rbac/permissions/access.ts` | 103 | 1 | `user` | `workspace` | Workspace signals: role | 		const role = await ctx.db.get(userRole.roleId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 107 | 1 | `user` | `workspace` | Workspace signals: role | 			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId)) |
| `convex/infrastructure/rbac/permissions/access.ts` | 123 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | function mergePermissions(permissions: UserPermission[]): UserPermission[] { |
| `convex/infrastructure/rbac/permissions/access.ts` | 124 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const merged = new Map<string, UserPermission>(); |
| `convex/infrastructure/rbac/permissions/access.ts` | 136 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 138 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/access.ts` | 144 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 148 | 1 | `User` | `workspace` | Workspace signals: circle, role | 			'User has circle-scoped role for this circle' |
| `convex/infrastructure/rbac/permissions/access.ts` | 152 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const isOwner = context.resourceOwnerId === userId; |
| `convex/infrastructure/rbac/permissions/access.ts` | 154 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User owns resource'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 156 | 2 | `user` | `system_auth` | Auth signals: , userId | 		await logAndDeny(ctx, userId, permissionSlug, perm, context, 'Resource not owned by user'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 161 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 172 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 174 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/access.ts` | 179 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 192 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 194 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	perm: UserPermission, |
| `convex/infrastructure/rbac/permissions/access.ts` | 199 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 4 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace } from '../../../core/people/queries'; |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 14 | 1 | `User` | `workspace` | Workspace signals: role | export async function listActiveUserRoles( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 16 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 30 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 47 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const person = await findPersonByUserAndWorkspace(ctx, userId, context.workspaceId); |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 85 | 1 | `User` | `workspace` | Workspace signals: role | export async function createUserRoleAssignment( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 88 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 90 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 		assignedBy: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 101 | 1 | `User` | `workspace` | Workspace signals: workspace, role | 		'createUserRoleAssignment is deprecated. Use grantSystemRole or grantWorkspaceRole from scopeHelpers instead.' |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 111 | 1 | `User` | `workspace` | Workspace signals: role | export async function updateUserRoleRevocation( |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 113 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 	_userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 117 | 1 | `User` | `workspace` | Workspace signals: workspace, role | 		'updateUserRoleRevocation is deprecated. Use revokeSystemRole or revokeWorkspaceRole from scopeHelpers instead.' |
| `convex/infrastructure/rbac/permissions/logging.ts` | 7 | 2 | `user` | `system_auth` | Auth signals: , userId | 				userId: entry.userId, |
| `convex/infrastructure/rbac/permissions/queries.ts` | 3 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../../sessionValidation'; |
| `convex/infrastructure/rbac/permissions/queries.ts` | 5 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | import { checkIsSystemAdmin, listUserPermissions } from './access'; |
| `convex/infrastructure/rbac/permissions/queries.ts` | 10 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 11 | 1 | `user` | `system_auth` | Auth signals: , userId | 		return checkIsSystemAdmin(ctx, userId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 15 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserPermissionsQuery = query({ |
| `convex/infrastructure/rbac/permissions/queries.ts` | 22 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 27 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 		return listUserPermissions(ctx, userId, context).then((permissions) => |
| `convex/infrastructure/rbac/permissions/types.ts` | 28 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	\| 'users.invite' |
| `convex/infrastructure/rbac/permissions/types.ts` | 29 | 1 | `users` | `workspace` | Workspace signals: role | 	\| 'users.change-roles' |
| `convex/infrastructure/rbac/permissions/types.ts` | 30 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	\| 'users.manage-profile' |
| `convex/infrastructure/rbac/permissions/types.ts` | 42 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	resourceOwnerId?: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/types.ts` | 46 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/types.ts` | 55 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export interface UserPermission { |
| `convex/infrastructure/rbac/queries.ts` | 9 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/queries.ts` | 18 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 29 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 40 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 76 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export const getUserRBACDetails = query({ |
| `convex/infrastructure/rbac/queries.ts` | 83 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 87 | 1 | `user` | `workspace` | Workspace signals: role | 			userRoleId: Id<'systemRoles'>; |
| `convex/infrastructure/rbac/queries.ts` | 104 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 				userRoleId: Id<'workspaceRoles'>; |
| `convex/infrastructure/rbac/queries.ts` | 123 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/queries.ts` | 156 | 1 | `user` | `workspace` | Workspace signals: role | 				userRoleId: systemRole._id, |
| `convex/infrastructure/rbac/queries.ts` | 174 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/queries.ts` | 213 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 					userRoleId: workspaceRole._id, |
| `convex/infrastructure/rbac/roles.ts` | 12 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/roles.ts` | 21 | 1 | `User` | `workspace` | Workspace signals: person/people, people, workspace, role | import { findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/infrastructure/rbac/roles.ts` | 31 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(2) signals | 		assigneeUserId: v.id('users'), |
| `convex/infrastructure/rbac/roles.ts` | 40 | 3 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 43 | 2 | `User, users` | `workspace` | Workspace signals: role | 		await requirePermission(ctx, actingUserId, 'users.change-roles', { |
| `convex/infrastructure/rbac/roles.ts` | 62 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace, role, assignee | 			const person = await findPersonByUserAndWorkspace(ctx, args.assigneeUserId, args.workspaceId); |
| `convex/infrastructure/rbac/roles.ts` | 66 | 1 | `User` | `workspace` | Workspace signals: workspace, role, member | 					'User must be a member of the workspace to assign workspace roles' |
| `convex/infrastructure/rbac/roles.ts` | 83 | 1 | `User` | `workspace` | Workspace signals: role | 				throw createError(ErrorCodes.GENERIC_ERROR, `User already has role: ${args.roleSlug}`); |
| `convex/infrastructure/rbac/roles.ts` | 87 | 2 | `User` | `workspace` | Workspace signals: person/people, workspace, role | 			const actorPerson = await findPersonByUserAndWorkspace(ctx, actingUserId, args.workspaceId); |
| `convex/infrastructure/rbac/roles.ts` | 97 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			return { success: true, userRoleId: workspaceRoleId as any }; // Type cast for backward compatibility |
| `convex/infrastructure/rbac/roles.ts` | 103 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(2) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/roles.ts` | 108 | 1 | `User` | `workspace` | Workspace signals: role | 				throw createError(ErrorCodes.GENERIC_ERROR, `User already has role: ${args.roleSlug}`); |
| `convex/infrastructure/rbac/roles.ts` | 113 | 1 | `User` | `workspace` | Workspace signals: role, assignee | 				args.assigneeUserId, |
| `convex/infrastructure/rbac/roles.ts` | 115 | 1 | `User` | `workspace` | Workspace signals: role | 				actingUserId |
| `convex/infrastructure/rbac/roles.ts` | 118 | 1 | `user` | `workspace` | Workspace signals: role | 			return { success: true, userRoleId: systemRoleId as any }; // Type cast for backward compatibility |
| `convex/infrastructure/rbac/roles.ts` | 136 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')) // Accepts either table ID |
| `convex/infrastructure/rbac/roles.ts` | 139 | 3 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 142 | 1 | `user` | `workspace` | Workspace signals: role | 		const systemRole = await ctx.db.get(args.userRoleId as any); |
| `convex/infrastructure/rbac/roles.ts` | 143 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		if (systemRole && 'userId' in systemRole) { |
| `convex/infrastructure/rbac/roles.ts` | 145 | 2 | `User, users` | `workspace` | Workspace signals: role | 			await requirePermission(ctx, actingUserId, 'users.change-roles', {}); |
| `convex/infrastructure/rbac/roles.ts` | 147 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			await revokeSystemRole(ctx, systemRole.userId, systemRole.role as SystemRole); |
| `convex/infrastructure/rbac/roles.ts` | 152 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 		const workspaceRole = await ctx.db.get(args.userRoleId as any); |
| `convex/infrastructure/rbac/roles.ts` | 155 | 2 | `User, users` | `workspace` | Workspace signals: role | 			await requirePermission(ctx, actingUserId, 'users.change-roles', { |
| `convex/infrastructure/rbac/roles.ts` | 163 | 1 | `User` | `workspace` | Workspace signals: role | 		throw createError(ErrorCodes.GENERIC_ERROR, 'User role not found'); |
| `convex/infrastructure/rbac/roles.ts` | 172 | 1 | `User` | `workspace` | Workspace signals: role | export const getUserRoles = query({ |
| `convex/infrastructure/rbac/roles.ts` | 174 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		sessionId: v.string(), // Session validation (derives userId securely) |
| `convex/infrastructure/rbac/roles.ts` | 180 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/roles.ts` | 183 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; |
| `convex/infrastructure/rbac/roles.ts` | 195 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/roles.ts` | 206 | 1 | `user` | `workspace` | Workspace signals: role | 					userRoleId: systemRole._id, |
| `convex/infrastructure/rbac/roles.ts` | 217 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId); |
| `convex/infrastructure/rbac/roles.ts` | 233 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 							userRoleId: workspaceRole._id, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 45 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 50 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 67 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 70 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const hasRole = await hasSystemRole(ctx, userId, role); |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 83 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | export async function listSystemRoles(ctx: Ctx, userId: Id<'users'>): Promise<SystemRole[]> { |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 86 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 188 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 190 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	grantedBy?: Id<'users'> |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 195 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 204 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 255 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 260 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/seedRBAC.ts` | 62 | 1 | `users` | `workspace` | Workspace signals: circle | 			'Full system access - can manage all users, circles, and settings' |
| `convex/infrastructure/rbac/seedRBAC.ts` | 68 | 1 | `users` | `workspace` | Workspace signals: circle | 			'Can manage circles and invite users' |
| `convex/infrastructure/rbac/seedRBAC.ts` | 86 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			'Standard user - view access and own profile management' |
| `convex/infrastructure/rbac/seedRBAC.ts` | 135 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const userInvitePerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 136 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.invite', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 137 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 139 | 1 | `users` | `workspace` | Workspace signals: workspace | 			'Invite new users to workspace', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 143 | 1 | `user` | `workspace` | Workspace signals: role | 		const userChangeRolesPerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 144 | 1 | `users` | `workspace` | Workspace signals: role | 			'users.change-roles', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 145 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 147 | 1 | `user` | `workspace` | Workspace signals: role | 			'Change user roles', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 151 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const userManageProfilePerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 152 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 153 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 155 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			'Edit user profiles (own or others)', |
| `convex/infrastructure/rbac/seedRBAC.ts` | 221 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userInvitePerm, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 222 | 1 | `user` | `workspace` | Workspace signals: role | 			userChangeRolesPerm, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 223 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userManageProfilePerm, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 236 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{ id: userInvitePerm, scope: 'all' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 237 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 248 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 258 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 267 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{ id: userManageProfilePerm, scope: 'own' as const }, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 19 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/setupAdmin.ts` | 20 | 2 | `User` | `workspace` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace as _findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/infrastructure/rbac/setupAdmin.ts` | 28 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 		assigneeUserId: v.id('users'), |
| `convex/infrastructure/rbac/setupAdmin.ts` | 35 | 1 | `User` | `system_auth` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 38 | 2 | `user, User` | `workspace` | Workspace signals: assignee | 		console.log(`🔧 Setting up admin for user: ${args.assigneeUserId}`); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 59 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 66 | 1 | `User` | `workspace` | Workspace signals: workspace, role, member | 					'User must be a member of the workspace to assign workspace admin role' |
| `convex/infrastructure/rbac/setupAdmin.ts` | 82 | 1 | `User` | `workspace` | Workspace signals: workspace, role | 				console.log('⚠️  User already has workspace admin role'); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 85 | 1 | `User` | `workspace` | Workspace signals: workspace, role | 					message: 'User already has workspace admin role', |
| `convex/infrastructure/rbac/setupAdmin.ts` | 86 | 1 | `user` | `workspace` | Workspace signals: role | 					userRoleId: existing._id |
| `convex/infrastructure/rbac/setupAdmin.ts` | 90 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 			const userRoleId = await ctx.db.insert('workspaceRoles', { |
| `convex/infrastructure/rbac/setupAdmin.ts` | 98 | 2 | `user, User` | `workspace` | Workspace signals: workspace, role, assignee | 			console.log(`✅ Workspace admin role assigned to user ${args.assigneeUserId}`); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 101 | 2 | `User` | `workspace` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 106 | 1 | `user` | `workspace` | Workspace signals: role | 				userRoleId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 114 | 3 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 119 | 1 | `User` | `workspace` | Workspace signals: role | 				console.log('⚠️  User already has platform admin role'); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 120 | 2 | `User` | `workspace` | Workspace signals: assignee | 				const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 123 | 1 | `User` | `workspace` | Workspace signals: role | 					message: 'User already has platform admin role', |
| `convex/infrastructure/rbac/setupAdmin.ts` | 124 | 1 | `user` | `workspace` | Workspace signals: role | 					userRoleId: existing._id, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 130 | 1 | `user` | `workspace` | Workspace signals: role | 			const userRoleId = await ctx.db.insert('systemRoles', { |
| `convex/infrastructure/rbac/setupAdmin.ts` | 131 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: args.assigneeUserId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 134 | 1 | `User` | `workspace` | Workspace signals: assignee | 				grantedBy: args.assigneeUserId // Self-assigned |
| `convex/infrastructure/rbac/setupAdmin.ts` | 137 | 2 | `user, User` | `workspace` | Workspace signals: role, assignee | 			console.log(`✅ Platform admin role assigned to user ${args.assigneeUserId}`); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 140 | 2 | `User` | `workspace` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 145 | 1 | `user` | `workspace` | Workspace signals: role | 				userRoleId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 152 | 2 | `User` | `workspace` | Workspace signals: assignee | 		const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 157 | 1 | `user` | `workspace` | Workspace signals: role | 			userRoleId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 170 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/infrastructure/rbac/setupAdmin.ts` | 174 | 1 | `User` | `system_auth` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 189 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 211 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 238 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		const permissions = await getUserPermissions(ctx, args.targetUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 241 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			userId: args.targetUserId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 258 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | async function getUserPermissions( |
| `convex/infrastructure/rbac/setupAdmin.ts` | 260 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/infrastructure/rbac/setupAdmin.ts` | 272 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 304 | 3 | `user` | `system_auth` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/tables.ts` | 29 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: v.id('users'), |
| `convex/infrastructure/rbac/tables.ts` | 32 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	grantedBy: v.optional(v.id('users')) |
| `convex/infrastructure/rbac/tables.ts` | 34 | 2 | `user` | `system_auth` | Auth signals: , userId | 	.index('by_user', ['userId']) |
| `convex/infrastructure/rbac/tables.ts` | 135 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: v.id('users'), |
| `convex/infrastructure/rbac/tables.ts` | 148 | 2 | `user` | `system_auth` | Auth signals: , userId | 	.index('by_user', ['userId']) |
| `convex/infrastructure/rbac/tables.ts` | 150 | 2 | `user` | `system_auth` | Auth signals: , userId | 	.index('by_user_timestamp', ['userId', 'timestamp']) |
| `convex/infrastructure/sessionValidation.test.ts` | 4 | 1 | `User` | `system_auth` | Auth signals: session | import { validateSession, validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/sessionValidation.test.ts` | 26 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type | 		await expect(validateSession(ctx, 'user1' as Id<'users'>)).rejects.toThrow( |
| `convex/infrastructure/sessionValidation.test.ts` | 31 | 1 | `User` | `system_auth` | Auth signals: session | 	test('validateSessionAndGetUserId throws SESSION_REVOKED when session is revoked', async () => { |
| `convex/infrastructure/sessionValidation.test.ts` | 36 | 3 | `User, user, users` | `system_auth` | Auth signals: session, Convex users id type | 			convexUserId: 'user1' as Id<'users'>, |
| `convex/infrastructure/sessionValidation.test.ts` | 42 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'sid')).rejects.toThrow( |
| `convex/infrastructure/sessionValidation.ts` | 33 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | export async function validateSession(ctx: QueryCtx \| MutationCtx, userId: Id<'users'>) { |
| `convex/infrastructure/sessionValidation.ts` | 41 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 				q.eq(q.field('convexUserId'), userId), |
| `convex/infrastructure/sessionValidation.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: session | 		throw createError(ErrorCodes.SESSION_NOT_FOUND, 'Session not found - user must log in'); |
| `convex/infrastructure/sessionValidation.ts` | 57 | 1 | `user` | `system_auth` | Auth signals: session | 			'Session has been revoked - user must log in again' |
| `convex/infrastructure/sessionValidation.ts` | 91 | 1 | `User` | `system_auth` | Auth signals: session | export async function validateSessionAndGetUserId( |
| `convex/infrastructure/sessionValidation.ts` | 94 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | ): Promise<{ userId: Id<'users'>; session: Doc<'authSessions'> }> { |
| `convex/infrastructure/sessionValidation.ts` | 112 | 1 | `user` | `system_auth` | Auth signals: session | 			'Session not found or expired - user must log in' |
| `convex/infrastructure/sessionValidation.ts` | 120 | 1 | `user` | `system_auth` | Auth signals: session | 			'Session has been revoked - user must log in again' |
| `convex/infrastructure/sessionValidation.ts` | 125 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		userId: session.convexUserId, |
| `convex/infrastructure/sessionValidation.ts` | 134 | 1 | `User` | `system_auth` | Auth signals: session | export const validateSessionAndGetUserIdInternal = internalQuery({ |
| `convex/infrastructure/sessionValidation.ts` | 139 | 1 | `User` | `system_auth` | Auth signals: session | 		return validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/tables.ts` | 9 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 	allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/tables.ts` | 34 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userAgent: v.optional(v.string()), |
| `convex/infrastructure/tables.ts` | 36 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: v.optional(v.id('users')), |
| `convex/infrastructure/tables.ts` | 43 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	resolvedBy: v.optional(v.id('users')), |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 16 | 1 | `User` | `workspace` | Workspace signals: people | 	withUserAndEmailBefore: number; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 19 | 1 | `User` | `workspace` | Workspace signals: people | 	remainingWithUserAndEmail: number; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 30 | 1 | `User` | `workspace` | Workspace signals: people | 		let withUserAndEmailBefore = 0; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 34 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			const hasUser = Boolean(person.userId); |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 37 | 1 | `User` | `workspace` | Workspace signals: people | 			if (hasUser && hasEmail) { |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 38 | 1 | `User` | `workspace` | Workspace signals: people | 				withUserAndEmailBefore++; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 43 | 1 | `User` | `workspace` | Workspace signals: people | 			if (!hasUser && hasEmail) { |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 48 | 2 | `User` | `workspace` | Workspace signals: people | 		const remainingWithUserAndEmail = withUserAndEmailBefore - cleared; |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 55 | 1 | `User` | `workspace` | Workspace signals: people | 					withUserAndEmailBefore, |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 58 | 1 | `User` | `workspace` | Workspace signals: people | 					remainingWithUserAndEmail |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 67 | 1 | `User` | `workspace` | Workspace signals: people | 			withUserAndEmailBefore, |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 70 | 1 | `User` | `workspace` | Workspace signals: people | 			remainingWithUserAndEmail |
| `convex/schema.ts` | 18 | 3 | `userS, users` | `system_auth` | Auth signals: users domain path | import { accountLinksTable, userSettingsTable, usersTable } from './core/users/tables'; |
| `convex/schema.ts` | 46 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userAlgorithmSettingsTable |
| `convex/schema.ts` | 75 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 		users: usersTable, |
| `convex/schema.ts` | 104 | 2 | `userS` | `unknown` | No strong auth/workspace signals detected | 		userSettings: userSettingsTable, |
| `convex/schema.ts` | 118 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		userAlgorithmSettings: userAlgorithmSettingsTable, |
| `e2e/.auth/user-worker-0.json` | 56 | 1 | `user` | `system_auth` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e148-724a-83a5-14573acf43d4\",1763544654152],\"distinct_id\":\"019a9b73-ded4-742b-835e-963b8701cb22\",\"$device_id\":\"019a9b73-dece-7308-954b-b5c58bd2449a\",\"$ |
| `e2e/.auth/user-worker-1.json` | 60 | 1 | `user` | `system_auth` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e13e-7927-b4ef-4285a6b9f07a\",1763544654142],\"distinct_id\":\"019a9b73-ded3-7c08-81ef-ceb7bf432fe6\",\"$device_id\":\"019a9b73-dece-7275-a265-e654e82048a7\",\"$ |
| `e2e/.auth/user-worker-2.json` | 60 | 1 | `user` | `system_auth` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e140-7a66-b3de-dea243a1fdc0\",1763544654144],\"distinct_id\":\"019a9b73-ded3-77c3-b08c-739e5e58cb76\",\"$device_id\":\"019a9b73-dece-776c-b6b0-a184fede3917\",\"$ |
| `e2e/.auth/user-worker-3.json` | 56 | 1 | `user` | `system_auth` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e13d-7e64-98ad-736fbc9e35cb\",1763544654141],\"distinct_id\":\"019a9b73-ded3-781e-a7ca-26016f4adfc8\",\"$device_id\":\"019a9b73-dece-7b4a-8757-701468cf87e7\",\"$ |
| `e2e/.auth/user-worker-4.json` | 52 | 1 | `user` | `system_auth` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019aa115-536d-79be-a3bf-9e3fe4800667\",1763639120749],\"distinct_id\":\"019aa115-5269-7868-bdc8-91b18ad8c2b5\",\"$device_id\":\"019aa115-5267-7aa0-935c-4fa952bc3ac2\",\"$ |
| `e2e/auth-registration.test.ts` | 18 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('should register new user with email verification', async ({ page, request }) => { |
| `e2e/auth-registration.test.ts` | 41 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			await lastNameInput.fill('User'); |
| `e2e/auth-registration.test.ts` | 119 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			await lastNameInput.fill('User'); |
| `e2e/auth-registration.test.ts` | 192 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await page.fill('input[type="email"]', 'randy+cicduser@synergyai.nl'); |
| `e2e/auth-security.test.ts` | 41 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('should not allow accessing other user data', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 47 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const userItemsCount = await inboxItems.count(); |
| `e2e/auth-security.test.ts` | 51 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 		console.log(`User has ${userItemsCount} inbox items`); |
| `e2e/auth-security.test.ts` | 211 | 1 | `user` | `system_auth` | Auth signals: session | 	test.skip('should capture IP address and user-agent on session creation', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 237 | 1 | `user` | `system_auth` | Auth signals: session | 		console.log('✅ Session valid - IP/user-agent captured for audit (not validated for security)'); |
| `e2e/auth-security.test.ts` | 278 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('should only show user-owned inbox items', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 300 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		console.log(`User has ${itemCount} inbox items`); |
| `e2e/fixtures.ts` | 62 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			const fileName = path.resolve(__dirname, `.auth/user-worker-${workerIndex}.json`); |
| `e2e/fixtures.ts` | 78 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 				const email = process.env[`WORKER_${workerIndex}_EMAIL`] \|\| process.env.TEST_USER_EMAIL; |
| `e2e/fixtures.ts` | 80 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 					process.env[`WORKER_${workerIndex}_PASSWORD`] \|\| process.env.TEST_USER_PASSWORD; |
| `e2e/fixtures.ts` | 121 | 1 | `User` | `workspace` | Workspace signals: workspace | 							`📝 [Worker ${workerIndex}] User redirected to onboarding - creating workspace...` |
| `e2e/flashcard-approval.spec.ts` | 17 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/flashcard-collections.spec.ts` | 16 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/flashcard-collections.spec.ts` | 227 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			console.log('No tag-based collections found - user has no tagged flashcards'); |
| `e2e/inbox-sync.test.ts` | 13 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('user can view inbox page', async ({ page }) => { |
| `e2e/inbox-sync.test.ts` | 26 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('user can open sync configuration', async ({ page }) => { |
| `e2e/inbox-sync.test.ts` | 63 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('user can sync Readwise highlights - import 10 items', async ({ page }) => { |
| `e2e/inbox-workflow.spec.ts` | 17 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/inbox-workflow.spec.ts` | 95 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			console.log('No inbox items found - user inbox is empty'); |
| `e2e/inbox-workflow.spec.ts` | 158 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | test.describe('Inbox Security - User Isolation', () => { |
| `e2e/inbox-workflow.spec.ts` | 159 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('should only show user-owned inbox items', async ({ page }) => { |
| `e2e/inbox-workflow.spec.ts` | 170 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		console.log(`User has ${itemCount} inbox items`); |
| `e2e/inbox-workflow.spec.ts` | 179 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	test('should prevent access to other users inbox items', async ({ page }) => { |
| `e2e/member-invite-modal.spec.ts` | 14 | 1 | `user` | `workspace` | Workspace signals: member | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/organizations.smoke.test.ts` | 49 | 1 | `User` | `workspace` | Workspace signals: workspace | 			console.log('User has only one workspace, skipping switch test'); |
| `e2e/organizations.smoke.test.ts` | 169 | 1 | `User` | `workspace` | Workspace signals: workspace | 			console.log('User has no workspaces, skipping persistence test'); |
| `e2e/organizations.smoke.test.ts` | 236 | 1 | `User` | `workspace` | Workspace signals: workspace | 			console.log('User has less than 2 workspaces, skipping URL param test'); |
| `e2e/quick-create.spec.ts` | 15 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | test.use({ storageState: 'e2e/.auth/user.json' }); |
| `e2e/rate-limiting.test.ts` | 20 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			const email = 'randy+cicduser@synergyai.nl'; |
| `e2e/rate-limiting.test.ts` | 57 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					email: 'randy+cicduser@synergyai.nl', |
| `e2e/settings-security.spec.ts` | 144 | 1 | `user` | `system_auth` | Auth signals: session | 	test('should load user settings with sessionId authentication', async ({ page }) => { |
| `e2e/settings-security.spec.ts` | 170 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | test.describe('Settings Security - User Isolation', () => { |
| `e2e/settings-security.spec.ts` | 171 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	test('should only show authenticated user settings', async ({ page }) => { |
| `e2e/settings-security.spec.ts` | 196 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		console.log('✅ Settings loaded successfully for authenticated user'); |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 37 | 2 | `User, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 					args: { sessionId: v.string(), assigneeUserId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 38 | 1 | `User` | `workspace` | Workspace signals: assignee | 					handler: async (ctx, args) => args.assigneeUserId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 50 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 					args: { userId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 51 | 1 | `user` | `system_auth` | Auth signals: , userId | 					handler: async (ctx, args) => args.userId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 72 | 1 | `user` | `system_auth` | Auth signals: , userId | 			name: 'userId arg blocked in public endpoint', |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 79 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | 					args: { sessionId: v.string(), userId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 80 | 1 | `user` | `system_auth` | Auth signals: , userId | 					handler: async (ctx, args) => args.userId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 83 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			errors: [{ messageId: 'userIdArg' }] |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 93 | 2 | `User, users` | `system_auth` | Auth signals: session, Convex users id type | 					args: { sessionId: v.string(), targetUserId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 94 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					handler: async (ctx, args) => args.targetUserId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 108 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					handler: async (ctx, args) => getAuthUserId(ctx) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 7 | 2 | `User, user` | `system_auth` | Auth signals: , userId | import noUseridInAuditFields from '../no-userid-in-audit-fields.js'; |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 16 | 2 | `user, User` | `system_auth` | Auth signals: , userId | ruleTester.run('no-userid-in-audit-fields', noUseridInAuditFields, { |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 46 | 1 | `user` | `system_auth` | Auth signals: , userId | 			name: 'Allowed: non-audit field with userId (not an audit pattern)', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 50 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					ownerId: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 51 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 					targetUserId: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 59 | 1 | `user` | `workspace` | Workspace signals: role | 				export const userRolesTable = defineTable({ |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 60 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 					userId: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 61 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 73 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 						updatedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 83 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 91 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: createdBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 97 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 107 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 113 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: updatedBy uses v.optional(v.id("users"))', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 118 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					updatedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 128 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 134 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: archivedBy uses v.optional(v.id("users"))', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 139 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					archivedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 149 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 155 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: deletedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 160 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					deletedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 170 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 176 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: modifiedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 181 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					modifiedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 191 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 197 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			name: 'Invalid: changedBy uses v.id("users")', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 202 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					changedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 212 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 222 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					createdBy: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 223 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					updatedBy: v.optional(v.id('users')), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 224 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					archivedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 234 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 242 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 250 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					messageId: 'auditFieldUsesUserId', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 258 | 1 | `user` | `system_auth` | Auth signals: , userId | console.log('✅ All no-userid-in-audit-fields tests passed!'); |
| `eslint-rules/no-legacy-auth-patterns.js` | 4 | 2 | `User` | `system_auth` | Auth signals: session | const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']); |
| `eslint-rules/no-legacy-auth-patterns.js` | 8 | 1 | `User` | `workspace` | Workspace signals: member | 	'memberUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 9 | 1 | `User` | `workspace` | Workspace signals: assignee | 	'assigneeUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 10 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	'targetUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 11 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	'inviteeUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 12 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	'ownerUserId', |
| `eslint-rules/no-legacy-auth-patterns.js` | 13 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	'candidateUserId' |
| `eslint-rules/no-legacy-auth-patterns.js` | 17 | 2 | `USER` | `unknown` | No strong auth/workspace signals detected | const USER_ID_ARG_CODE = 'USER_ID_ARG_BLOCKED'; |
| `eslint-rules/no-legacy-auth-patterns.js` | 38 | 2 | `USER` | `unknown` | No strong auth/workspace signals detected | 	[USER_ID_ARG_CODE]: ['AUTH_GUARD_USER_ID_ARG'], |
| `eslint-rules/no-legacy-auth-patterns.js` | 100 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(2) signals | 			propName === 'userId' \|\| propName === 'personId' \|\| propName.endsWith('UserId'); |
| `eslint-rules/no-legacy-auth-patterns.js` | 146 | 1 | `User` | `system_auth` | Auth signals: session | 				'AUTH_GUARD_LEGACY_HELPER: Legacy auth helper "{{name}}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 148 | 1 | `User` | `system_auth` | Auth signals: session | 				'MISSING_SESSION_ID_ARG: Public Convex endpoints must declare args.sessionId and validate via validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 149 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userIdArg: |
| `eslint-rules/no-legacy-auth-patterns.js` | 150 | 4 | `USER, user, User` | `system_auth` | Auth signals: session, userId | 				'USER_ID_ARG_BLOCKED: Public Convex endpoints must not accept client-provided userId. Derive user identity via validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 152 | 6 | `User` | `workspace` | Workspace signals: member, assignee | 				'TARGET_ARG_NOT_WHITELISTED: Use a whitelisted target identifier: targetUserId (general), memberUserId (membership), assigneeUserId (assignments), inviteeUserId (invites), ownerUserId (ownership), candidateUserId (recruiting).' |
| `eslint-rules/no-legacy-auth-patterns.js` | 238 | 2 | `user, USER` | `system_auth` | Auth signals: , userId | 					const code = propName === 'userId' ? USER_ID_ARG_CODE : TARGET_ARG_NOT_WHITELISTED_CODE; |
| `eslint-rules/no-legacy-auth-patterns.js` | 246 | 2 | `user` | `system_auth` | Auth signals: , userId | 						messageId: propName === 'userId' ? 'userIdArg' : 'targetArgNotAllowed', |
| `eslint-rules/no-userid-in-audit-fields.js` | 53 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		field: 'invitedUserId', |
| `eslint-rules/no-userid-in-audit-fields.js` | 89 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | function isVIdUsersCall(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 97 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		node.arguments[0].value === 'users' |
| `eslint-rules/no-userid-in-audit-fields.js` | 106 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | function wrapsVIdUsers(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 115 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		if (node.arguments.length > 0 && isVIdUsersCall(node.arguments[0])) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 119 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		return node.arguments.some((arg) => wrapsVIdUsers(arg)); |
| `eslint-rules/no-userid-in-audit-fields.js` | 129 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | function usesVIdUsers(node) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 130 | 2 | `Users` | `unknown` | No strong auth/workspace signals detected | 	return isVIdUsersCall(node) \|\| wrapsVIdUsers(node); |
| `eslint-rules/no-userid-in-audit-fields.js` | 137 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			description: 'Enforce XDOM-01/XDOM-02: audit fields must use personId, not userId', |
| `eslint-rules/no-userid-in-audit-fields.js` | 142 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			auditFieldUsesUserId: |
| `eslint-rules/no-userid-in-audit-fields.js` | 143 | 1 | `users` | `unknown` | Mixed auth(1) + workspace(1) signals | 				"Audit field \"{{fieldName}}\" uses v.id('users') instead of v.id('people'). " + |
| `eslint-rules/no-userid-in-audit-fields.js` | 196 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 				if (usesVIdUsers(node.value)) { |
| `eslint-rules/no-userid-in-audit-fields.js` | 209 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 						messageId: 'auditFieldUsesUserId', |
| `scripts/activate-worker-users.ts` | 59 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 		const response = await fetch('https://api.workos.com/user_management/authenticate', { |
| `scripts/activate-worker-users.ts` | 109 | 1 | `Users` | `system_auth` | Auth signals: WorkOS | 	console.log('🚀 Activating WorkOS Worker Users\n'); |
| `scripts/activate-worker-users.ts` | 165 | 1 | `users` | `system_auth` | Auth signals: WorkOS | 		console.log('   1. Workers exist in WorkOS (run create-worker-users.ts)'); |
| `scripts/add-circles-feature-flag.ts` | 60 | 2 | `user, User` | `workspace` | Workspace signals: circle | 		console.log('\n📝 Next step: Add your user ID to allowedUserIds in Convex dashboard'); |
| `scripts/add-circles-feature-flag.ts` | 64 | 2 | `user, User` | `workspace` | Workspace signals: circle | 		console.log('   4. Add your user ID to allowedUserIds array'); |
| `scripts/add-circles-feature-flag.ts` | 65 | 1 | `user` | `workspace` | Workspace signals: circle | 		console.log('   Your user ID: c7c555a2-895a-48b6-ae24-d4147d44b1d5'); |
| `scripts/add-users-to-org.ts` | 20 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	console.error('Then run: CONVEX_DEPLOY_KEY=your_key npx tsx scripts/add-users-to-org.ts'); |
| `scripts/add-users-to-org.ts` | 28 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | const USER_IDS = [ |
| `scripts/add-users-to-org.ts` | 33 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | ] as Id<'users'>[]; |
| `scripts/add-users-to-org.ts` | 35 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | async function addUsersToOrg() { |
| `scripts/add-users-to-org.ts` | 36 | 1 | `users` | `workspace` | Workspace signals: workspace | 	console.log('🚀 Adding users to workspace...\n'); |
| `scripts/add-users-to-org.ts` | 38 | 2 | `Users, USER` | `unknown` | No strong auth/workspace signals detected | 	console.log(`Users to add: ${USER_IDS.length}\n`); |
| `scripts/add-users-to-org.ts` | 44 | 2 | `user, USER` | `system_auth` | Auth signals: , userId | 	for (const userId of USER_IDS) { |
| `scripts/add-users-to-org.ts` | 46 | 2 | `user` | `system_auth` | Auth signals: , userId | 			console.log(`Adding user ${userId}...`); |
| `scripts/add-users-to-org.ts` | 51 | 2 | `user` | `system_auth` | Auth signals: , userId | 				userId: userId, |
| `scripts/add-users-to-org.ts` | 55 | 2 | `user` | `system_auth` | Auth signals: , userId | 			console.log(`✅ Successfully added user ${userId}\n`); |
| `scripts/add-users-to-org.ts` | 57 | 2 | `user` | `system_auth` | Auth signals: , userId | 			console.error(`❌ Failed to add user ${userId}:`, error); |
| `scripts/add-users-to-org.ts` | 66 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | addUsersToOrg().catch((error) => { |
| `scripts/audit-core.ts` | 26 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	'users', |
| `scripts/audit-user-terminology.ts` | 24 | 1 | `user` | `system_auth` | Auth-domain file pattern match | const OUTPUT_DIR = path.join(REPO_ROOT, 'dev-docs', 'audits', 'identity-user-terminology'); |
| `scripts/audit-user-terminology.ts` | 26 | 1 | `user` | `system_auth` | Auth-domain file pattern match | const OUTPUT_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.md'); |
| `scripts/audit-user-terminology.ts` | 29 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'identity-user-terminology-audit.workspace.md' |
| `scripts/audit-user-terminology.ts` | 33 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'identity-user-terminology-audit.system-auth.md' |
| `scripts/audit-user-terminology.ts` | 35 | 1 | `user` | `system_auth` | Auth-domain file pattern match | const OUTPUT_UNKNOWN_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.unknown.md'); |
| `scripts/audit-user-terminology.ts` | 36 | 1 | `user` | `system_auth` | Auth-domain file pattern match | const OUTPUT_SUMMARY_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.summary.md'); |
| `scripts/audit-user-terminology.ts` | 39 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'identity-user-terminology-audit.actionable.md' |
| `scripts/audit-user-terminology.ts` | 73 | 2 | `USER, users` | `system_auth` | Auth-domain file pattern match | const USER_SUBSTRING_RE = /users?/gi; |
| `scripts/audit-user-terminology.ts` | 75 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | const USER_TOKEN_RE = /[A-Za-z_][A-Za-z0-9_]*/g; |
| `scripts/audit-user-terminology.ts` | 76 | 2 | `USER, users` | `system_auth` | Auth-domain file pattern match | const STRING_LITERAL_WITH_USER_RE = /(['"`])[^'"`]*users?[^'"`]*\1/i; |
| `scripts/audit-user-terminology.ts` | 78 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | const WORKSPACE_USER_TOKEN_EXCEPTIONS = new Set<string>([ |
| `scripts/audit-user-terminology.ts` | 80 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userId', |
| `scripts/audit-user-terminology.ts` | 81 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userIds', |
| `scripts/audit-user-terminology.ts` | 82 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'actorUserId', |
| `scripts/audit-user-terminology.ts` | 83 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'actingUserId', |
| `scripts/audit-user-terminology.ts` | 84 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'targetUserId', |
| `scripts/audit-user-terminology.ts` | 85 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'memberUserId', |
| `scripts/audit-user-terminology.ts` | 86 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'assigneeUserId', |
| `scripts/audit-user-terminology.ts` | 87 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'inviteeUserId', |
| `scripts/audit-user-terminology.ts` | 88 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'invitedUserId', |
| `scripts/audit-user-terminology.ts` | 89 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'ownerUserId', |
| `scripts/audit-user-terminology.ts` | 90 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'candidateUserId', |
| `scripts/audit-user-terminology.ts` | 93 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userRoleId', |
| `scripts/audit-user-terminology.ts` | 94 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userRoleIds', |
| `scripts/audit-user-terminology.ts` | 97 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'getUser', |
| `scripts/audit-user-terminology.ts` | 98 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'getUserById', |
| `scripts/audit-user-terminology.ts` | 99 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'findUser', |
| `scripts/audit-user-terminology.ts` | 100 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'findUserById', |
| `scripts/audit-user-terminology.ts` | 101 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'findUserByEmail', |
| `scripts/audit-user-terminology.ts` | 102 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	'validateUser', |
| `scripts/audit-user-terminology.ts` | 105 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userEmail', |
| `scripts/audit-user-terminology.ts` | 106 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userName', |
| `scripts/audit-user-terminology.ts` | 107 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userEmails', |
| `scripts/audit-user-terminology.ts` | 108 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	'userNames' |
| `scripts/audit-user-terminology.ts` | 111 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | const WORKSPACE_USER_PATTERN_EXCEPTIONS: RegExp[] = [ |
| `scripts/audit-user-terminology.ts` | 112 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 	/^get.*User$/, // getActiveUser, getUserById |
| `scripts/audit-user-terminology.ts` | 113 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	/^find.*User$/, // findUserByEmail |
| `scripts/audit-user-terminology.ts` | 114 | 2 | `User, UserS` | `system_auth` | Auth-domain file pattern match | 	/^validate.*User$/, // validateUserSession |
| `scripts/audit-user-terminology.ts` | 115 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	/^create.*User$/, // createUser |
| `scripts/audit-user-terminology.ts` | 116 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	/^update.*User$/, // updateUser |
| `scripts/audit-user-terminology.ts` | 117 | 5 | `User, Users` | `system_auth` | Auth-domain file pattern match | 	/^(User\|Users)(Doc\|Id\|Type)s?$/, // UserDoc, UserId, UsersType |
| `scripts/audit-user-terminology.ts` | 118 | 3 | `users` | `system_auth` | Auth-domain file pattern match | 	/^(Doc\|Id)<'?users'?>$/, // Doc<'users'> / Id<'users'> (best effort) |
| `scripts/audit-user-terminology.ts` | 121 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 	/^(get\|find\|list)Person.*By.*User/i, // getPersonByUserAndWorkspace, findPersonByUserAndWorkspace |
| `scripts/audit-user-terminology.ts` | 122 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	/^(get\|find\|list).*ForUser$/i, // listWorkspacesForUser |
| `scripts/audit-user-terminology.ts` | 123 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	/^(get\|find).*ByUserAndWorkspace$/i, // findPersonByUserAndWorkspace |
| `scripts/audit-user-terminology.ts` | 124 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	/^linkPersonToUser$/i, |
| `scripts/audit-user-terminology.ts` | 127 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 	/^find(User)?(Name\|Email)Field$/i, // findUserNameField, findUserEmailField |
| `scripts/audit-user-terminology.ts` | 130 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	/^invited(User)?Id$/i, |
| `scripts/audit-user-terminology.ts` | 133 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	/^(get\|list\|assign\|revoke\|update).*UserRole/i, |
| `scripts/audit-user-terminology.ts` | 134 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	/^(list\|create\|update)UserRoleAssignment/i, |
| `scripts/audit-user-terminology.ts` | 137 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 	/^USER_ID_FIELD$/i, |
| `scripts/audit-user-terminology.ts` | 138 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 	/^USER_.*_FIELD$/i |
| `scripts/audit-user-terminology.ts` | 142 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	/^convex\/core\/users\//, |
| `scripts/audit-user-terminology.ts` | 147 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	/\/audit-user-terminology(\.ts)?$/ |
| `scripts/audit-user-terminology.ts` | 185 | 1 | `User` | `system_auth` | Auth-domain file pattern match | function replaceUserWithPreferredTerm(text: string, preferred: 'Person' \| 'Member'): string { |
| `scripts/audit-user-terminology.ts` | 190 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		.replaceAll(/\bUsers\b/g, preferred === 'Person' ? 'People' : 'Members') |
| `scripts/audit-user-terminology.ts` | 191 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 		.replaceAll(/\busers\b/g, plural) |
| `scripts/audit-user-terminology.ts` | 192 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		.replaceAll(/\bUser\b/g, preferred) |
| `scripts/audit-user-terminology.ts` | 193 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		.replaceAll(/\buser\b/g, singular); |
| `scripts/audit-user-terminology.ts` | 196 | 1 | `User` | `system_auth` | Auth-domain file pattern match | function replaceUserInStringLiterals(lineText: string, preferred: 'Person' \| 'Member'): string { |
| `scripts/audit-user-terminology.ts` | 199 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	return lineText.replaceAll(/(['"`])([^'"`]*\busers?\b[^'"`]*)\1/gi, (_m, quote, body) => { |
| `scripts/audit-user-terminology.ts` | 200 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		return `${quote}${replaceUserWithPreferredTerm(String(body), preferred)}${quote}`; |
| `scripts/audit-user-terminology.ts` | 207 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		STRING_LITERAL_WITH_USER_RE.test(lineText) && |
| `scripts/audit-user-terminology.ts` | 208 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		/\b(Add\|Assign\|Invite)\s+User(s)?\b/i.test(lineText) |
| `scripts/audit-user-terminology.ts` | 224 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		if (!base.includes('User')) continue; |
| `scripts/audit-user-terminology.ts` | 226 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const suggestedName = base.replaceAll('User', preferred); |
| `scripts/audit-user-terminology.ts` | 251 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		'This report is intentionally narrow: it focuses on high-signal workspace UI terminology drift (\"User\" → \"Person\"), plus a short list of code identifier rename candidates.' |
| `scripts/audit-user-terminology.ts` | 257 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	lines.push('## P1: Org-chart component file names containing "User"'); |
| `scripts/audit-user-terminology.ts` | 278 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	lines.push('## P2: Workspace UI copy containing "User" (high-signal phrases only)'); |
| `scripts/audit-user-terminology.ts` | 288 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			const suggested = replaceUserInStringLiterals(current, preferred); |
| `scripts/audit-user-terminology.ts` | 308 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 309 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? ''); |
| `scripts/audit-user-terminology.ts` | 310 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		const userTokens = tokens |
| `scripts/audit-user-terminology.ts` | 314 | 2 | `User, Users` | `system_auth` | Auth-domain file pattern match | 			.filter((t) => /User\|Users/.test(t)) |
| `scripts/audit-user-terminology.ts` | 315 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 			.filter((t) => !WORKSPACE_USER_TOKEN_EXCEPTIONS.has(t)) |
| `scripts/audit-user-terminology.ts` | 316 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 			.filter((t) => !WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(t))); |
| `scripts/audit-user-terminology.ts` | 318 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		for (const tok of Array.from(new Set(userTokens))) { |
| `scripts/audit-user-terminology.ts` | 322 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			const stateFlagMatch = /^isUser([A-Z][A-Za-z0-9_]*)$/.exec(tok); |
| `scripts/audit-user-terminology.ts` | 325 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 				: tok.replaceAll(/User/g, preferred); |
| `scripts/audit-user-terminology.ts` | 345 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	lines.push('## P3: Org-chart code identifiers containing "User" (rename candidates)'); |
| `scripts/audit-user-terminology.ts` | 366 | 1 | `User` | `system_auth` | Auth-domain file pattern match | function hasOnlyExceptionUserTokens(lineText: string): boolean { |
| `scripts/audit-user-terminology.ts` | 367 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 	USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 368 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 	const tokens = Array.from(lineText.matchAll(USER_TOKEN_RE)) |
| `scripts/audit-user-terminology.ts` | 371 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	const userTokens = tokens.filter((t) => t.toLowerCase().includes('user')); |
| `scripts/audit-user-terminology.ts` | 372 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	if (userTokens.length === 0) return false; |
| `scripts/audit-user-terminology.ts` | 374 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	for (const tok of userTokens) { |
| `scripts/audit-user-terminology.ts` | 375 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue; |
| `scripts/audit-user-terminology.ts` | 376 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		if (WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(tok))) continue; |
| `scripts/audit-user-terminology.ts` | 424 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				path.basename(resolved).startsWith('identity-user-terminology-audit') |
| `scripts/audit-user-terminology.ts` | 452 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: '/infrastructure/users/', why: 'users infra path' }, |
| `scripts/audit-user-terminology.ts` | 453 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: '/admin/users/', why: 'admin users path' }, |
| `scripts/audit-user-terminology.ts` | 462 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: "v.id('users')", why: 'Convex users id type' }, |
| `scripts/audit-user-terminology.ts` | 463 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: "id<'users'>", why: 'Convex users id type' }, |
| `scripts/audit-user-terminology.ts` | 464 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: "db.query('users')", why: 'query users table' }, |
| `scripts/audit-user-terminology.ts` | 465 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: "db.insert('users'", why: 'insert users table' }, |
| `scripts/audit-user-terminology.ts` | 466 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: '/core/users/', why: 'users domain path' }, |
| `scripts/audit-user-terminology.ts` | 467 | 2 | `users` | `system_auth` | Auth-domain file pattern match | 		{ key: 'users table', why: 'users table mention' }, |
| `scripts/audit-user-terminology.ts` | 490 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 	const hasUserId = /\buserid\b/i.test(lineText); |
| `scripts/audit-user-terminology.ts` | 491 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const authCount = matchedAuth.length + (hasUserId ? 1 : 0); |
| `scripts/audit-user-terminology.ts` | 518 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 				.join(', ')}${hasUserId ? ', userId' : ''}` |
| `scripts/audit-user-terminology.ts` | 541 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 	if (STRING_LITERAL_WITH_USER_RE.test(lineText)) return 'string'; |
| `scripts/audit-user-terminology.ts` | 573 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		USER_SUBSTRING_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 574 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		const matches = Array.from(line.matchAll(USER_SUBSTRING_RE)); |
| `scripts/audit-user-terminology.ts` | 694 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	lines.push('title: Identity terminology audit summary (user/users)'); |
| `scripts/audit-user-terminology.ts` | 701 | 4 | `user, users` | `system_auth` | Auth-domain file pattern match | 		'- **Correct**: `user/users` when referring to global auth identity (`users` table, WorkOS, sessions, `userId`).' |
| `scripts/audit-user-terminology.ts` | 704 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		'- **Incorrect (to fix)**: `user/users` used in workspace/domain context where the entity is a `person`/`people` record (`personId`, circles/roles/workspace membership).' |
| `scripts/audit-user-terminology.ts` | 750 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		'- Then fix **UI labels** (workspace `kind=string`) where "Users" should be "People" (or "Members" when it truly means membership).' |
| `scripts/audit-user-terminology.ts` | 753 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		'- Apply mechanical renames (e.g. `availableUsers` → `availablePeople`) and re-run the script.' |
| `scripts/audit-user-terminology.ts` | 756 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		'- Use `identity-user-terminology-audit.unknown.md` only after the workspace list is shrinking (unknown becomes manageable).' |
| `scripts/audit-user-terminology.ts` | 770 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	lines.push(`title: Identity terminology audit (user/users)`); |
| `scripts/audit-user-terminology.ts` | 777 | 6 | `user, users, Users, User` | `system_auth` | Auth-domain file pattern match | 		'Audit of `user` / `users` occurrences in code and UI labels (strings), including inside identifiers like `availableUsers`, `useUsers`, `UserProfile`, `userId`, with a heuristic scope classification:' |
| `scripts/audit-user-terminology.ts` | 780 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		'- **system_auth**: global auth identity / sessions / WorkOS / `userId` / `users` table' |
| `scripts/audit-user-terminology.ts` | 821 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	lines.push('## Workspace-scoped tokens containing "user" (candidate renames)'); |
| `scripts/audit-user-terminology.ts` | 824 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		'This list is derived from lines classified as `workspace` and extracts identifier-like tokens containing `user`/`users` (case-insensitive).' |
| `scripts/audit-user-terminology.ts` | 827 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		'It is intended to drive a systematic rename plan toward **0 workspace-scoped `user` terminology**. Tokens in the exception allowlist are omitted.' |
| `scripts/audit-user-terminology.ts` | 840 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 841 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? ''); |
| `scripts/audit-user-terminology.ts` | 844 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			if (!tok.toLowerCase().includes('user')) continue; |
| `scripts/audit-user-terminology.ts` | 845 | 1 | `USER` | `system_auth` | Auth-domain file pattern match | 			if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue; |
| `scripts/audit-user-terminology.ts` | 864 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 		const recommendation = lower.includes('users') |
| `scripts/audit-user-terminology.ts` | 866 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			: lower.includes('user') |
| `scripts/audit-user-terminology.ts` | 878 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		'Goal: reduce **workspace-scoped** `user/users` terminology to **0** in code + UI labels by renaming identifiers and UI copy to `person/people` (or `member` only when the domain truly means membership rather than identity).' |
| `scripts/audit-user-terminology.ts` | 884 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		'- **Step 1: Define the “allowed user” carve-outs (prevents breaking identity model)**' |
| `scripts/audit-user-terminology.ts` | 886 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	lines.push('  - Keep `userId` and the `users` table terminology for **System/Auth identity**.'); |
| `scripts/audit-user-terminology.ts` | 888 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		'  - Keep `*UserId` forms when they truly refer to global identity targets (invites, auth flows).' |
| `scripts/audit-user-terminology.ts` | 894 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		'  - Rename variables/props like `availableUsers` → `availablePeople` or `availablePersons` (prefer `people/person` when backed by `people` table).' |
| `scripts/audit-user-terminology.ts` | 897 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		'  - Rename functions/hooks like `useUsers...` that actually query `people`/`personId` to `usePeople...` / `usePersons...`.' |
| `scripts/audit-user-terminology.ts` | 900 | 1 | `Users` | `system_auth` | Auth-domain file pattern match | 		'  - Rename UI copy text in workspace screens: "Users" → "People" (or "Members" only when it refers to membership).' |
| `scripts/audit-user-terminology.ts` | 905 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		'  - Rename components/files like `AssignUserDialog` to `AssignPersonDialog` only after updating all imports + stories/tests.' |
| `scripts/audit-user-terminology.ts` | 912 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	lines.push('  - Ensure all workspace mutations/queries accept `personId` (not `userId`).'); |
| `scripts/audit-user-terminology.ts` | 913 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	lines.push('  - Reserve `user/users` naming for global identity and auth tables only.'); |
| `scripts/audit-user-terminology.ts` | 932 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			!(r.kind === 'code' && hasOnlyExceptionUserTokens(r.lineText)) |
| `scripts/audit-user-terminology.ts` | 947 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		title: 'Identity terminology audit (workspace-only): user/users', |
| `scripts/audit-user-terminology.ts` | 952 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		title: 'Identity terminology audit (system/auth-only): user/users', |
| `scripts/audit-user-terminology.ts` | 957 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		title: 'Identity terminology audit (unknown-only): user/users', |
| `scripts/audit-user-terminology.ts` | 965 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			'identity-user-terminology-audit.workspace.production-code.md' |
| `scripts/audit-user-terminology.ts` | 971 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.tests.md'), |
| `scripts/audit-user-terminology.ts` | 976 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.ui-strings.md'), |
| `scripts/check-auth-guard.js` | 11 | 2 | `User` | `system_auth` | Auth signals: session | const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']); |
| `scripts/check-auth-guard.js` | 49 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | function hasUserIdProperty(objectExpression) { |
| `scripts/check-auth-guard.js` | 52 | 1 | `user` | `system_auth` | Auth signals: , userId | 			return findPropertyName(prop.name) === 'userId'; |
| `scripts/check-auth-guard.js` | 58 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | function hasUserIdArgs(callExpression, serverImports) { |
| `scripts/check-auth-guard.js` | 75 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		return hasUserIdProperty(initializer); |
| `scripts/check-auth-guard.js` | 81 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			return hasUserIdProperty(maybeArgs); |
| `scripts/check-auth-guard.js` | 122 | 1 | `User` | `system_auth` | Auth signals: session | 				`Legacy auth helper "${node.text}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).`, |
| `scripts/check-auth-guard.js` | 127 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		if (ts.isCallExpression(node) && hasUserIdArgs(node, serverImports)) { |
| `scripts/check-auth-guard.js` | 129 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 				'AUTH_GUARD_USER_ID_ARG', |
| `scripts/check-auth-guard.js` | 130 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 				'Public Convex endpoints must not accept client-provided userId. Derive identity via validateSessionAndGetUserId(ctx, sessionId).', |
| `scripts/check-auth-guard.js` | 161 | 1 | `user` | `system_auth` | Auth signals: , userId | 			`✅ Auth guard passed: no new legacy auth helpers or client userId args detected.` + |
| `scripts/create-worker-users.ts` | 44 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | interface WorkerUser { |
| `scripts/create-worker-users.ts` | 51 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | async function createWorkerUser(worker: WorkerUser): Promise<boolean> { |
| `scripts/create-worker-users.ts` | 55 | 2 | `user, users` | `system_auth` | Auth signals: WorkOS | 		const response = await fetch('https://api.workos.com/user_management/users', { |
| `scripts/create-worker-users.ts` | 86 | 1 | `Users` | `system_auth` | Auth signals: WorkOS | 	console.log('🚀 Creating WorkOS Worker Users for Parallel E2E Testing\n'); |
| `scripts/create-worker-users.ts` | 87 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	console.log('This will create 5 users:'); |
| `scripts/create-worker-users.ts` | 96 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const workers: WorkerUser[] = []; |
| `scripts/create-worker-users.ts` | 107 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const results = await Promise.all(workers.map(createWorkerUser)); |
| `scripts/create-worker-users.ts` | 113 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		console.log('\n✅ All 5 worker users created successfully!\n'); |
| `scripts/create-worker-users.ts` | 115 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		console.log('# Worker Pool Users (for parallel execution)'); |
| `scripts/create-worker-users.ts` | 123 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		console.error('\n❌ Some users failed to create. Check errors above.'); |
| `scripts/enable-meetings-module-flag.ts` | 79 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /meetings'); |
| `scripts/enable-meetings-module-flag.ts` | 80 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /dashboard'); |
| `scripts/enable-meetings-module-flag.ts` | 81 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		console.log('   ❌ Users in other orgs cannot access these routes'); |
| `scripts/lint-naming/config.ts` | 65 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	new RegExp('users\\.ts$'), |
| `scripts/lint-naming/config.ts` | 80 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	'listUserTags', |
| `scripts/refactor-organizations-to-workspaces.ts` | 254 | 1 | `User` | `workspace` | Workspace signals: workspace | 		pattern: /\bgetUserOrganizationIds\b/g, |
| `scripts/refactor-organizations-to-workspaces.ts` | 255 | 1 | `User` | `workspace` | Workspace signals: workspace | 		replacement: 'getUserWorkspaceIds', |
| `scripts/refactor-organizations-to-workspaces.ts` | 256 | 1 | `User` | `workspace` | Workspace signals: workspace | 		description: 'Function getUserWorkspaceIds' |
| `scripts/test-worker-login.ts` | 53 | 1 | `user` | `system_auth` | Auth signals: WorkOS, login | 		const response = await fetch('https://api.workos.com/user_management/authenticate', { |
| `scripts/test-worker-login.ts` | 91 | 1 | `User` | `system_auth` | Auth signals: login | 	console.log('🧪 Testing Worker User Authentication\n'); |
| `scripts/test-worker-login.ts` | 155 | 1 | `Users` | `system_auth` | Auth signals: WorkOS, login | 		console.log('   2. Users were not created successfully in WorkOS'); |
| `scripts/test-worker-login.ts` | 157 | 1 | `users` | `system_auth` | Auth signals: login | 		console.log('\n🔧 Try running: tsx scripts/create-worker-users.ts'); |
| `scripts/update-circles-feature-flag.ts` | 53 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const userId = 'jx7b6gcvkmpsppm7sqzst8s3q57v898d'; // randy@synergyai.nl |
| `scripts/update-circles-feature-flag.ts` | 59 | 3 | `User, user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 			allowedUserIds: [userId as Id<'users'>] |
| `scripts/update-circles-feature-flag.ts` | 65 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		console.log(`   allowedUserIds: [${userId}]`); |
| `scripts/update-circles-feature-flag.ts` | 67 | 1 | `User` | `workspace` | Workspace signals: circle | 		console.log('   Change allowedUserIds to:'); |
| `src/app.d.ts` | 8 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				user?: { |
| `src/app.d.ts` | 9 | 2 | `user` | `system_auth` | Auth signals: , userId | 					userId: string; // Convex user ID (for queries) |
| `src/app.d.ts` | 10 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 					workosId: string; // WorkOS user ID (for reference) |
| `src/hooks.server.ts` | 19 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	'/invite', // Invite acceptance page (public so users can view invites before signing in) |
| `src/hooks.server.ts` | 41 | 1 | `user` | `workspace` | Workspace signals: workspace | 		activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/hooks.server.ts` | 68 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			user: null |
| `src/lib/client/crypto.svelte.test.ts` | 11 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'test-123', |
| `src/lib/client/crypto.ts` | 38 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		navigator.userAgent, |
| `src/lib/client/crypto.ts` | 40 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		navigator.language, // Usually stable (user preference) |
| `src/lib/client/crypto.ts` | 158 | 2 | `user` | `system_auth` | Auth signals: , userId | 		userId: 'test-user-123', |
| `src/lib/client/sessionStorage.ts` | 18 | 1 | `user` | `system_auth` | Auth signals: session | 	userEmail: string; |
| `src/lib/client/sessionStorage.ts` | 19 | 1 | `user` | `system_auth` | Auth signals: session | 	userName?: string; |
| `src/lib/client/sessionStorage.ts` | 46 | 1 | `user` | `system_auth` | Auth signals: session | 	return `${navigator.userAgent}-${screen.width}x${screen.height}`.slice(0, 32); |
| `src/lib/client/sessionStorage.ts` | 131 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		for (const [userId, session] of Object.entries(parsed.sessions)) { |
| `src/lib/client/sessionStorage.ts` | 133 | 1 | `user` | `system_auth` | Auth signals: session, userId | 				validSessions[userId] = session; |
| `src/lib/client/sessionStorage.ts` | 183 | 1 | `user` | `system_auth` | Auth signals: session, userId | export async function addSession(userId: string, session: SessionData): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 185 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	store.sessions[userId] = session; |
| `src/lib/client/sessionStorage.ts` | 189 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		store.activeAccount = userId; |
| `src/lib/client/sessionStorage.ts` | 198 | 1 | `user` | `system_auth` | Auth signals: session, userId | export async function removeSession(userId: string): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 200 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	delete store.sessions[userId]; |
| `src/lib/client/sessionStorage.ts` | 203 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	if (store.activeAccount === userId) { |
| `src/lib/client/sessionStorage.ts` | 214 | 1 | `user` | `system_auth` | Auth signals: session, userId | export async function setActiveAccount(userId: string \| null): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 216 | 2 | `user` | `system_auth` | Auth signals: session, userId | 	if (userId && store.sessions[userId]) { |
| `src/lib/client/sessionStorage.ts` | 217 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		store.activeAccount = userId; |
| `src/lib/client/sessionStorage.ts` | 219 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	} else if (userId === null) { |
| `src/lib/components/atoms/Combobox.stories.svelte` | 55 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				description: 'Whether users can deselect a selected option' |
| `src/lib/components/atoms/iconRegistry.ts` | 53 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	\| 'user' |
| `src/lib/components/atoms/iconRegistry.ts` | 54 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	\| 'user-plus'; |
| `src/lib/components/atoms/iconRegistry.ts` | 237 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	user: { |
| `src/lib/components/atoms/iconRegistry.ts` | 244 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	'user-plus': { |
| `src/lib/components/molecules/AccountMenu.svelte` | 7 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onCreateWorkspace?: (targetUserId: string) => void; |
| `src/lib/components/molecules/AccountMenu.svelte` | 8 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onJoinWorkspace?: (targetUserId: string) => void; |
| `src/lib/components/molecules/AccountMenu.svelte` | 9 | 1 | `User` | `system_auth` | Auth signals: logout | 		onLogout?: (targetUserId: string) => void; |
| `src/lib/components/molecules/AccountMenu.svelte` | 10 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		targetUserId: string; |
| `src/lib/components/molecules/AccountMenu.svelte` | 20 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		targetUserId, |
| `src/lib/components/molecules/AccountMenu.svelte` | 75 | 1 | `User` | `workspace` | Workspace signals: workspace | 						onCreateWorkspace?.(targetUserId); |
| `src/lib/components/molecules/AccountMenu.svelte` | 89 | 1 | `User` | `workspace` | Workspace signals: workspace | 						onJoinWorkspace?.(targetUserId); |
| `src/lib/components/molecules/AccountMenu.svelte` | 104 | 1 | `User` | `system_auth` | Auth signals: logout | 						onLogout?.(targetUserId); |
| `src/lib/components/molecules/InfoCard.stories.svelte` | 44 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'This is a warning message. Use this variant to alert users about potential issues or important considerations.' |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 14 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 22 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 23 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onCreateWorkspace?: (targetUserId: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 24 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onJoinWorkspace?: (targetUserId: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 25 | 1 | `User` | `system_auth` | Auth signals: logout | 		onLogout?: (targetUserId: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 60 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 		targetUserId={account.userId} |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 66 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	{#each workspaces as workspace (`${workspace.workspaceId}-${account.userId}`)} |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 72 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				onSwitchAccount?.(account.userId, `/inbox?org=${workspace.workspaceId}`); |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 12 | 1 | `user` | `workspace` | Workspace signals: workspace | 				description: 'Optional image URL for user avatar' |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 18 | 1 | `user` | `workspace` | Workspace signals: workspace | 			username: { |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 20 | 1 | `User` | `workspace` | Workspace signals: workspace | 				description: 'User name (displayed on top line)' |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 28 | 1 | `user` | `workspace` | Workspace signals: workspace | 				description: 'Show username and orgName labels (collapsed when false)' |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 47 | 1 | `user` | `workspace` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 58 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 73 | 1 | `user` | `workspace` | Workspace signals: workspace | 		username: 'Jane Smith', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 84 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 98 | 1 | `user` | `workspace` | Workspace signals: workspace | 		username: 'test', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 109 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 123 | 1 | `user` | `workspace` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 135 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 149 | 1 | `user` | `workspace` | Workspace signals: workspace | 		username: 'John Doe', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 160 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 174 | 2 | `user, User` | `workspace` | Workspace signals: workspace | 		username: 'Very Long Username That Might Truncate', |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 185 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 197 | 1 | `user` | `workspace` | Workspace signals: workspace | 	args={{ initials: 'T', username: 'test', orgName: 'Owner', showLabels: true, variant: 'sidebar' }} |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 204 | 2 | `user` | `workspace` | Workspace signals: workspace | 				username={args.username} |
| `src/lib/components/organisms/ErrorBoundary.svelte` | 68 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 					userAgent: navigator.userAgent |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 35 | 1 | `user` | `system_auth` | Auth signals: auth path, login | 	args={{ email: 'user@example.com', password: '', redirectTarget: '/auth/redirect' }} |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 54 | 1 | `user` | `system_auth` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 69 | 1 | `user` | `system_auth` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 84 | 1 | `user` | `system_auth` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 198 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 			document.body.style.userSelect = 'none'; |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 223 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 						document.body.style.userSelect = ''; |
| `src/lib/components/organisms/ResizableSplitter.svelte` | 252 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 				document.body.style.userSelect = ''; |
| `src/lib/composables/usePersonSelector.svelte.ts` | 290 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId?: Id<'users'>; |
| `src/lib/infrastructure/analytics/events.ts` | 26 | 1 | `user` | `workspace` | Workspace signals: workspace | export type OwnershipScope = 'user' \| 'workspace' \| 'team'; |
| `src/lib/infrastructure/analytics/events.ts` | 112 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		shared_from: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 123 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 127 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		evaluation_method: 'allowed_user' \| 'allowed_domain' \| 'percentage' \| 'global'; |
| `src/lib/infrastructure/analytics/events.ts` | 131 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 138 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 144 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 154 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/events.ts` | 165 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		scope: 'user'; |
| `src/lib/infrastructure/analytics/posthog/identity.ts` | 66 | 1 | `user` | `system_auth` | Auth signals: , userId | 	if (payload.sub) properties.userId = payload.sub; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 20 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	user?: UseAuthSessionReturn['user']; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 39 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		user: null as UseAuthSessionReturn['user'], |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 71 | 3 | `user` | `system_auth` | Auth-domain file pattern match | 			state.user = data.authenticated && data.user ? data.user : null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 76 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			state.activeAccountId = data.user?.userId ?? null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 79 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			if (data.authenticated && data.user && data.csrfToken && data.expiresAt) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 80 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 				await addSession(data.user.userId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 84 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userEmail: data.user.email, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 85 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userName: data.user.name |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 90 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			if (data.authenticated && data.user) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 102 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 								userId: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 106 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 								userEmail: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 107 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 								userName?: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 121 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 								await addSession(session.userId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 125 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 									userEmail: session.userEmail, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 126 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 									userName: session.userName |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 132 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 									const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${session.userId}`; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 156 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 			const currentUserId = data.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 158 | 3 | `user, User` | `system_auth` | Auth-domain file pattern match | 				.filter(([userId]) => userId !== currentUserId) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 159 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				.map(([userId, session]) => ({ |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 160 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 					userId, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 161 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 					email: session.userEmail, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 162 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 					name: session.userName, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 168 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			state.user = null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 177 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		const currentUserId = state.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 178 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		if (!currentUserId) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 182 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		await logoutAccount(currentUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 185 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	async function logoutAccount(targetUserId: string) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 188 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		const currentUserId = state.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 189 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		const isLoggingOutCurrentAccount = targetUserId === currentUserId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 195 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			const targetSession = allSessions[targetUserId]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 196 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			const accountName = targetSession?.userName \|\| targetSession?.userEmail \|\| 'Account'; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 209 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 						body: JSON.stringify({ targetUserId }) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 224 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await removeSession(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 261 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 				await removeSession(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 272 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					const nextUserId = remainingAccounts[0]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 273 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					await setActiveAccount(nextUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 281 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 							body: JSON.stringify({ userId: nextUserId }) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 316 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	async function switchAccount(targetUserId: string, redirectTo?: string) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 321 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		if (!allSessions[targetUserId]) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 326 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const targetSession = allSessions[targetUserId]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 327 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		const targetAccountName = targetSession.userName \|\| targetSession.userEmail \|\| 'account'; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 353 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			await setActiveAccount(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 363 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					targetUserId, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 391 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 				await addSession(targetUserId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 420 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		get user() { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 421 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			return state.user; |
| `src/lib/infrastructure/auth/server/session.ts` | 71 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	convexUserId: Parameters<typeof createSessionRecord>[0]['convexUserId']; |
| `src/lib/infrastructure/auth/server/session.ts` | 72 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/server/session.ts` | 77 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 	userSnapshot: Parameters<typeof createSessionRecord>[0]['userSnapshot']; |
| `src/lib/infrastructure/auth/server/session.ts` | 100 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		convexUserId: options.convexUserId, |
| `src/lib/infrastructure/auth/server/session.ts` | 101 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		workosUserId: options.workosUserId, |
| `src/lib/infrastructure/auth/server/session.ts` | 107 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 		userSnapshot: options.userSnapshot, |
| `src/lib/infrastructure/auth/server/session.ts` | 109 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: options.event.request.headers.get('user-agent') |
| `src/lib/infrastructure/auth/server/session.ts` | 128 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 	const activeWorkspace = options.userSnapshot.activeWorkspace |
| `src/lib/infrastructure/auth/server/session.ts` | 130 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				type: options.userSnapshot.activeWorkspace.type, |
| `src/lib/infrastructure/auth/server/session.ts` | 131 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				id: options.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string \| null, not optional |
| `src/lib/infrastructure/auth/server/session.ts` | 132 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				name: options.userSnapshot.activeWorkspace.name |
| `src/lib/infrastructure/auth/server/session.ts` | 138 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		user: { |
| `src/lib/infrastructure/auth/server/session.ts` | 139 | 4 | `user, userS, users` | `system_auth` | Auth-domain file pattern match | 			userId: options.userSnapshot.userId, // Id<'users'> is compatible with string at runtime |
| `src/lib/infrastructure/auth/server/session.ts` | 140 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			workosId: options.userSnapshot.workosId, |
| `src/lib/infrastructure/auth/server/session.ts` | 141 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			email: options.userSnapshot.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 142 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			firstName: options.userSnapshot.firstName, |
| `src/lib/infrastructure/auth/server/session.ts` | 143 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			lastName: options.userSnapshot.lastName, |
| `src/lib/infrastructure/auth/server/session.ts` | 144 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			name: options.userSnapshot.name, |
| `src/lib/infrastructure/auth/server/session.ts` | 153 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	logger.info('auth', 'Session established for user', { |
| `src/lib/infrastructure/auth/server/session.ts` | 154 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 		email: options.userSnapshot.email |
| `src/lib/infrastructure/auth/server/session.ts` | 176 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 189 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 202 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 210 | 2 | `user, userS` | `system_auth` | Auth-domain file pattern match | 		userEmail: record.userSnapshot?.email |
| `src/lib/infrastructure/auth/server/session.ts` | 225 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 282 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			logger.error('auth', 'Failed to refresh WorkOS session - logging user out', { |
| `src/lib/infrastructure/auth/server/session.ts` | 284 | 2 | `user, userS` | `system_auth` | Auth-domain file pattern match | 				userEmail: record.userSnapshot?.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 291 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 317 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent'), |
| `src/lib/infrastructure/auth/server/session.ts` | 323 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 	const activeWorkspace = record.userSnapshot.activeWorkspace |
| `src/lib/infrastructure/auth/server/session.ts` | 325 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				type: record.userSnapshot.activeWorkspace.type, |
| `src/lib/infrastructure/auth/server/session.ts` | 326 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				id: record.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string \| null, not optional |
| `src/lib/infrastructure/auth/server/session.ts` | 327 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 				name: record.userSnapshot.activeWorkspace.name |
| `src/lib/infrastructure/auth/server/session.ts` | 333 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		user: { |
| `src/lib/infrastructure/auth/server/session.ts` | 334 | 4 | `user, userS, users` | `system_auth` | Auth-domain file pattern match | 			userId: record.userSnapshot.userId, // Id<'users'> is compatible with string at runtime |
| `src/lib/infrastructure/auth/server/session.ts` | 335 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			workosId: record.userSnapshot.workosId, |
| `src/lib/infrastructure/auth/server/session.ts` | 336 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			email: record.userSnapshot.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 337 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			firstName: record.userSnapshot.firstName, |
| `src/lib/infrastructure/auth/server/session.ts` | 338 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			lastName: record.userSnapshot.lastName, |
| `src/lib/infrastructure/auth/server/session.ts` | 339 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			name: record.userSnapshot.name, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 53 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId?: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 55 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 69 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		ownerUserId: options.primaryUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 71 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 88 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 		primaryUserId?: Id<'users'> \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 102 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		primaryUserId: result.primaryUserId ?? undefined |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 108 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 109 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 115 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 	userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 117 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 127 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		ownerUserId: options.convexUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 128 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		workosUserIdentifier: options.workosUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 136 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 137 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 		userSnapshot: options.userSnapshot |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 152 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 			convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 153 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			workosUserId: string; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 163 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 164 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 173 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			convexUserId: result.convexUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 174 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			workosUserId: result.workosUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 184 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: result.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 185 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: result.userSnapshot |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 199 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export async function getActiveSessionRecordForUser(options: { |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 201 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	targetUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 205 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const result = (await convexQuery('infrastructure/authSessions:getActiveSessionForUser', { |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 207 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		targetUserId: options.targetUserId |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 246 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 255 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined |
| `src/lib/infrastructure/auth/server/workos.ts` | 47 | 1 | `User` | `system_auth` | Auth-domain file pattern match | interface WorkOSUser { |
| `src/lib/infrastructure/auth/server/workos.ts` | 78 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 106 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			'user' in data, |
| `src/lib/infrastructure/auth/server/workos.ts` | 113 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		user: WorkOSUser; |
| `src/lib/infrastructure/auth/server/workos.ts` | 118 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 		hasUser: !!typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 119 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userEmail: typedData.user?.email |
| `src/lib/infrastructure/auth/server/workos.ts` | 123 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		typedData.access_token && typedData.refresh_token && typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 155 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		user: typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 173 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 245 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/sessions/logout`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 271 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/workos.ts` | 276 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 286 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			user_agent: options.userAgent |
| `src/lib/infrastructure/auth/server/workos.ts` | 309 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			'user' in data, |
| `src/lib/infrastructure/auth/server/workos.ts` | 316 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 		user: WorkOSUser; |
| `src/lib/infrastructure/auth/server/workos.ts` | 321 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 		hasUser: !!typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 322 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userEmail: typedData.user?.email |
| `src/lib/infrastructure/auth/server/workos.ts` | 348 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		user: typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 365 | 2 | `User` | `system_auth` | Auth-domain file pattern match | export async function getUserByEmail(email: string): Promise<WorkOSUser \| null> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 367 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	console.log('🔍 Checking if user exists:', email); |
| `src/lib/infrastructure/auth/server/workos.ts` | 370 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 		`${WORKOS_BASE_URL}/user_management/users?email=${encodeURIComponent(email)}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 377 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	console.log('🔍 WorkOS get user response status:', response.status); |
| `src/lib/infrastructure/auth/server/workos.ts` | 381 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.error('❌ WorkOS get user failed:', errorText); |
| `src/lib/infrastructure/auth/server/workos.ts` | 383 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			`WorkOS get user failed (${response.status}): ${errorText}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 394 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const typedData = data as { data?: WorkOSUser[] }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 395 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	console.log('🔍 WorkOS get user response:', { usersFound: typedData.data?.length }); |
| `src/lib/infrastructure/auth/server/workos.ts` | 401 | 1 | `User` | `system_auth` | Auth-domain file pattern match | export async function createUserWithPassword(options: { |
| `src/lib/infrastructure/auth/server/workos.ts` | 406 | 1 | `user` | `system_auth` | Auth-domain file pattern match | }): Promise<{ userId: string }> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 408 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	console.log('🔍 Creating new user:', options.email); |
| `src/lib/infrastructure/auth/server/workos.ts` | 410 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/users`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 422 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	console.log('🔍 WorkOS create user response status:', response.status); |
| `src/lib/infrastructure/auth/server/workos.ts` | 426 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.error('❌ WorkOS create user failed:', errorText); |
| `src/lib/infrastructure/auth/server/workos.ts` | 428 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			`WorkOS user creation failed (${response.status}): ${errorText}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 441 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		'WorkOS user creation response missing user ID.' |
| `src/lib/infrastructure/auth/server/workos.ts` | 444 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	console.log('✅ User created successfully:', typedData.id); |
| `src/lib/infrastructure/auth/server/workos.ts` | 446 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	return { userId: typedData.id }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 460 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 502 | 1 | `user` | `system_auth` | Auth-domain file pattern match | }): Promise<{ userId: string }> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 506 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset/confirm`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 551 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		!('user' in data) \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 552 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		typeof data.user !== 'object' \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 553 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		data.user === null \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 554 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		!('id' in data.user) \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 555 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		typeof data.user.id !== 'string' |
| `src/lib/infrastructure/auth/server/workos.ts` | 557 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		invariant(false, 'WorkOS reset password response missing user ID.'); |
| `src/lib/infrastructure/auth/server/workos.ts` | 559 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	const typedData = data as { user: { id: string } }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 560 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	console.log('✅ Password reset successful for user:', typedData.user.id); |
| `src/lib/infrastructure/auth/server/workos.ts` | 562 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	return { userId: typedData.user.id }; |
| `src/lib/infrastructure/auth/types.ts` | 23 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	primaryUserId?: Id<'users'> \| null; |
| `src/lib/infrastructure/auth/types.ts` | 27 | 2 | `user, users` | `system_auth` | Auth-domain file pattern match | 	userId: Id<'users'>; |
| `src/lib/infrastructure/auth/types.ts` | 42 | 2 | `User, users` | `system_auth` | Auth-domain file pattern match | 	convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/types.ts` | 43 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/types.ts` | 53 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userAgent?: string; |
| `src/lib/infrastructure/auth/types.ts` | 54 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 	userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/types.ts` | 65 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 	user: WorkOSUser; |
| `src/lib/infrastructure/auth/types.ts` | 77 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 	user: WorkOSUser; |
| `src/lib/infrastructure/auth/types.ts` | 83 | 1 | `User` | `system_auth` | Auth-domain file pattern match | interface WorkOSUser { |
| `src/lib/infrastructure/auth/types.ts` | 101 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	userId: string; |
| `src/lib/infrastructure/auth/types.ts` | 112 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	get user(): { |
| `src/lib/infrastructure/auth/types.ts` | 113 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		userId: string; |
| `src/lib/infrastructure/auth/types.ts` | 130 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	logoutAccount: (targetUserId: string) => Promise<void>; |
| `src/lib/infrastructure/auth/types.ts` | 131 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	switchAccount: (targetUserId: string, redirectTo?: string) => Promise<void>; |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 28 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	getUserId: () => string \| undefined |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 50 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 	const userId = getUserId(); |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 52 | 2 | `user` | `system_auth` | Auth signals: , userId | 		userId ? { flag, userId } : 'skip' |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 63 | 1 | `user` | `system_auth` | Auth signals: , userId | 				if (lastValue !== enabled && userId) { |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 64 | 1 | `user` | `system_auth` | Auth signals: , userId | 					reportFeatureFlagCheck(flag, enabled, userId, { |
| `src/lib/infrastructure/feature-flags/index.ts` | 27 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | export { getFlagDescription, getUserRolloutBucket, isInRollout, isAllowedDomain } from './utils'; |
| `src/lib/infrastructure/feature-flags/types.ts` | 8 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId?: string; |
| `src/lib/infrastructure/feature-flags/types.ts` | 10 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userEmail?: string; |
| `src/lib/infrastructure/feature-flags/types.ts` | 26 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	allowedUserIds?: string[]; |
| `src/lib/infrastructure/feature-flags/utils.ts` | 20 | 2 | `User, user` | `system_auth` | Auth signals: , userId | export function getUserRolloutBucket(userId: string, flag: string): number { |
| `src/lib/infrastructure/feature-flags/utils.ts` | 22 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const str = `${userId}:${flag}`; |
| `src/lib/infrastructure/feature-flags/utils.ts` | 42 | 1 | `user` | `system_auth` | Auth signals: , userId | export function isInRollout(userId: string, flag: string, percentage: number): boolean { |
| `src/lib/infrastructure/feature-flags/utils.ts` | 46 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 	const bucket = getUserRolloutBucket(userId, flag); |
| `src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts` | 22 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId?: () => Id<'users'> \| null; |
| `src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts` | 64 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			? useQuery(api.infrastructure.rbac.permissions.getUserPermissionsQuery, () => { |
| `src/lib/infrastructure/users/api.ts` | 16 | 1 | `User` | `system_auth` | Auth signals: users infra path | export type UserProfile = { |
| `src/lib/infrastructure/users/api.ts` | 17 | 2 | `user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/infrastructure/users/api.ts` | 34 | 2 | `user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/infrastructure/users/api.ts` | 61 | 1 | `Users` | `system_auth` | Auth signals: users infra path | export interface UsersInfrastructureAPI { |
| `src/lib/infrastructure/users/api.ts` | 67 | 2 | `User` | `system_auth` | Auth signals: users infra path | 	get currentUser(): UserProfile \| null; |
| `src/lib/infrastructure/users/api.ts` | 72 | 4 | `User, user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 	getUserById(userId: Id<'users'>): UserProfile \| null; |
| `src/lib/infrastructure/users/api.ts` | 95 | 2 | `user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 		userId: Id<'users'>, |
| `src/lib/infrastructure/users/components/index.ts` | 12 | 2 | `User` | `system_auth` | Auth signals: users infra path | export { default as UserAvatar } from './UserAvatar.svelte'; |
| `src/lib/infrastructure/users/components/index.ts` | 13 | 2 | `User` | `system_auth` | Auth signals: users infra path | export { default as UserProfile } from './UserProfile.svelte'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 3 | 1 | `User` | `system_auth` | Auth signals: users infra path | 	import type { UserProfile } from '../api'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 6 | 2 | `user, User` | `system_auth` | Auth signals: users infra path | 		user: UserProfile \| null \| undefined; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 12 | 1 | `user` | `system_auth` | Auth signals: users infra path | 	let { user, variant = 'default', size = 'md', class: className = '' }: Props = $props(); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 17 | 2 | `user, User` | `system_auth` | Auth signals: users infra path | 	function getInitials(user: UserProfile \| null \| undefined): string { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 18 | 1 | `user` | `system_auth` | Auth signals: users infra path | 		if (!user) return '?'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 21 | 1 | `user` | `system_auth` | Auth signals: users infra path | 		if (user.name) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 23 | 1 | `user` | `system_auth` | Auth signals: users infra path | 				user.name |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 29 | 1 | `user` | `system_auth` | Auth signals: users infra path | 					.join('') \|\| user.name.slice(0, 2).toUpperCase() |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 34 | 2 | `user` | `system_auth` | Auth signals: users infra path | 		if (user.firstName \|\| user.lastName) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 35 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			const first = user.firstName?.[0]?.toUpperCase() ?? ''; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 36 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			const last = user.lastName?.[0]?.toUpperCase() ?? ''; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 41 | 1 | `user` | `system_auth` | Auth signals: users infra path | 		if (user.email) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 42 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			return user.email.slice(0, 2).toUpperCase(); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 48 | 1 | `user` | `system_auth` | Auth signals: users infra path | 	const initials = $derived(getInitials(user)); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 49 | 1 | `user` | `system_auth` | Auth signals: users infra path | 	const imageUrl = $derived(user?.profileImageUrl); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 65 | 3 | `user, User` | `system_auth` | Auth signals: users infra path | 		alt={user?.name \|\| user?.email \|\| 'User'} |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 2 | 2 | `User` | `system_auth` | Auth signals: users infra path | 	import UserAvatar from './UserAvatar.svelte'; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 3 | 1 | `User` | `system_auth` | Auth signals: users infra path | 	import type { UserProfile } from '../api'; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 6 | 2 | `user, User` | `system_auth` | Auth signals: users infra path | 		user: UserProfile \| null \| undefined; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 12 | 1 | `user` | `system_auth` | Auth signals: users infra path | 	let { user, showEmail = true, avatarSize = 'md', class: className = '' }: Props = $props(); |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 15 | 1 | `user` | `system_auth` | Auth signals: users infra path | 		user?.name \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 16 | 4 | `user` | `system_auth` | Auth signals: users infra path | 			(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 17 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			user?.firstName \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 18 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			user?.lastName \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 19 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			user?.email \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 20 | 1 | `User` | `system_auth` | Auth signals: users infra path | 			'Unknown User' |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 25 | 2 | `User, user` | `system_auth` | Auth signals: users infra path | 	<UserAvatar {user} size={avatarSize} /> |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 28 | 1 | `user` | `system_auth` | Auth signals: users infra path | 		{#if showEmail && user?.email} |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 29 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			<span class="text-label text-secondary">{user.email}</span> |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 14 | 1 | `User` | `system_auth` | Auth signals: users infra path | import type { UserProfile, LinkedAccount } from '../api'; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 17 | 1 | `User` | `system_auth` | Auth signals: users infra path | export interface UseUserQueriesOptions { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 21 | 1 | `User` | `system_auth` | Auth signals: users infra path | export interface UseUserQueriesReturn { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 22 | 2 | `User` | `system_auth` | Auth signals: users infra path | 	get currentUser(): UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 23 | 4 | `User, user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 	getUserById(userId: Id<'users'>): UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 26 | 1 | `User` | `system_auth` | Auth signals: users infra path | 	currentUserQuery: ReturnType<typeof useQuery> \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 49 | 3 | `User` | `system_auth` | Auth signals: users infra path | export function useUserQueries(options: UseUserQueriesOptions): UseUserQueriesReturn { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 53 | 1 | `User` | `system_auth` | Auth signals: users infra path | 	const currentUserQuery = |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 55 | 2 | `users, User` | `system_auth` | Auth signals: users infra path | 			? useQuery(api.core.users.index.getCurrentUser, () => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 65 | 1 | `users` | `system_auth` | Auth signals: users infra path | 			? useQuery(api.core.users.index.listLinkedAccounts, () => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 73 | 2 | `User` | `system_auth` | Auth signals: users infra path | 	const isLoading = $derived(currentUserQuery ? currentUserQuery.data === undefined : false); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 76 | 2 | `User` | `system_auth` | Auth signals: users infra path | 	const currentUser = $derived((): UserProfile \| null => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 77 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		if (currentUserQuery?.data !== undefined) { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 78 | 3 | `user, User` | `system_auth` | Auth signals: users infra path | 			const user = currentUserQuery.data as UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 79 | 1 | `user` | `system_auth` | Auth signals: users infra path | 			return user; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 97 | 4 | `User, user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 	function getUserById(userId: Id<'users'>): UserProfile \| null { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 98 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		const current = currentUser(); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 99 | 2 | `user` | `system_auth` | Auth signals: users infra path, userId | 		if (current && current.userId === userId) { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 107 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		get currentUser() { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 108 | 1 | `User` | `system_auth` | Auth signals: users infra path | 			return currentUser(); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 110 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		getUserById, |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 117 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		currentUserQuery |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 15 | 1 | `Users` | `system_auth` | Auth signals: users infra path | import type { UsersInfrastructureAPI } from '../api'; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 16 | 2 | `User` | `system_auth` | Auth signals: users infra path | import { useUserQueries } from './useUserQueries.svelte'; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 19 | 1 | `Users` | `system_auth` | Auth signals: users infra path | export type UseUsersOptions = { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 23 | 2 | `Users` | `system_auth` | Auth signals: users infra path | export type UseUsers = ReturnType<typeof useUsers>; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 51 | 3 | `Users` | `system_auth` | Auth signals: users infra path | export function useUsers(options: UseUsersOptions): UsersInfrastructureAPI { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 56 | 1 | `User` | `system_auth` | Auth signals: users infra path | 	const queries = useUserQueries({ |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 69 | 2 | `user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 		userId: Id<'users'>, |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 83 | 2 | `users, User` | `system_auth` | Auth signals: users infra path | 			await convexClient.mutation(api.core.users.index.updateUserProfile, { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 85 | 2 | `User, user` | `system_auth` | Auth signals: users infra path, userId | 				targetUserId: userId, |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 111 | 2 | `users, Users` | `system_auth` | Auth signals: users infra path | 	const usersApi: UsersInfrastructureAPI = { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 112 | 1 | `User` | `system_auth` | Auth signals: users infra path | 		get currentUser() { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 113 | 1 | `User` | `system_auth` | Auth signals: users infra path | 			return queries.currentUser; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 115 | 3 | `User, user, users` | `system_auth` | Auth signals: users infra path, Convex users id type, userId | 		getUserById(userId: Id<'users'>) { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 116 | 2 | `User, user` | `system_auth` | Auth signals: users infra path, userId | 			return queries.getUserById(userId); |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 128 | 1 | `users` | `system_auth` | Auth signals: users infra path | 	return usersApi; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 132 | 2 | `Users, User` | `system_auth` | Auth signals: users infra path | export type { UsersInfrastructureAPI, UserProfile, LinkedAccount } from '../api'; |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 21 | 1 | `User` | `workspace` | Workspace signals: workspace, role | 	assignRoleToUser, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 26 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 31 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (item.userId) { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 32 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 41 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	it('should list user workspaces with sessionId validation', async () => { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 43 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId, workspaceId: defaultWorkspaceId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 46 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 47 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 61 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId, workspaceId: defaultWorkspaceId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 63 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 84 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: adminUserId, sessionId: adminSessionId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 86 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, adminUserId, 'admin'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 90 | 2 | `users, Users` | `workspace` | Workspace signals: workspace | 		const invitePermission = await createTestPermission(t, 'users.invite', 'Invite Users'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 92 | 2 | `User` | `workspace` | Workspace signals: workspace, role | 		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 94 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 100 | 1 | `user` | `workspace` | Workspace signals: workspace | 			email: 'newuser@example.com', |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 111 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviterUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 112 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviteeUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 114 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 117 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const { code } = await createTestInvite(t, orgId, inviterUserId, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 118 | 2 | `User` | `workspace` | Workspace signals: workspace | 			invitedUserId: inviteeUserId, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 122 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviterUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 123 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviteeUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 137 | 2 | `User` | `workspace` | Workspace signals: workspace | 			const inviteeUser = await ctx.db.get(inviteeUserId); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 140 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: inviteeUserId, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 141 | 3 | `User, user` | `workspace` | Workspace signals: workspace | 				email: inviteeUser?.email ?? `user-${inviteeUserId}@example.com`, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 142 | 2 | `User` | `workspace` | Workspace signals: workspace | 				displayName: inviteeUser?.name ?? 'Test User', |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 163 | 1 | `user` | `workspace` | Workspace signals: workspace | 				.withIndex('by_workspace_user', (q) => |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 164 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', orgId).eq('userId', inviteeUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 175 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviterUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 176 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: inviteeUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 178 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 180 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const { inviteId } = await createTestInvite(t, orgId, inviterUserId, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 181 | 2 | `User` | `workspace` | Workspace signals: workspace | 			invitedUserId: inviteeUserId |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 184 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviterUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 185 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: inviteeUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 195 | 1 | `user` | `workspace` | Workspace signals: workspace | 				.withIndex('by_workspace_user', (q) => |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 196 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', orgId).eq('userId', inviteeUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 207 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { userId: adminUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 208 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId: memberUserId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 210 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, adminUserId, 'admin'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 211 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, memberUserId, 'member'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 215 | 2 | `users, Users` | `workspace` | Workspace signals: workspace | 		const removePermission = await createTestPermission(t, 'users.remove', 'Remove Users'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 217 | 2 | `User` | `workspace` | Workspace signals: workspace, role | 		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 219 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 220 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: memberUserId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 227 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 			memberUserId |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 235 | 1 | `user` | `workspace` | Workspace signals: workspace | 				.withIndex('by_workspace_user', (q) => |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 236 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(2) signals | 					q.eq('workspaceId', orgId).eq('userId', memberUserId) |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 244 | 2 | `user, users` | `workspace` | Workspace signals: workspace | 	it('should enforce user isolation - users cannot see other orgs', async () => { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 248 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: user1, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 253 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: user2, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 260 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const org1 = await createTestOrganization(t, 'User 1 Org'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 261 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, org1, user1, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 263 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const org2 = await createTestOrganization(t, 'User 2 Org'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 264 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, org2, user2, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 266 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 267 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 270 | 1 | `user` | `workspace` | Workspace signals: workspace | 		const user1Orgs = await t.query(api.core.workspaces.index.listWorkspaces, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 273 | 1 | `user` | `workspace` | Workspace signals: workspace | 		expect(user1Orgs.length).toBe(1); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 274 | 2 | `user, User` | `workspace` | Workspace signals: workspace | 		expect(user1Orgs[0].name).toBe('User 1 Org'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 277 | 1 | `user` | `workspace` | Workspace signals: workspace | 		const user2Orgs = await t.query(api.core.workspaces.index.listWorkspaces, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 280 | 1 | `user` | `workspace` | Workspace signals: workspace | 		expect(user2Orgs.length).toBe(1); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 281 | 2 | `user, User` | `workspace` | Workspace signals: workspace | 		expect(user2Orgs[0].name).toBe('User 2 Org'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 297 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 299 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 300 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 303 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user@example.com', |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 304 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'test.user@domain.co.uk', |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 305 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user+tag@example.com', |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 306 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user123@subdomain.example.org' |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 325 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 327 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 328 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 334 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user@', // Missing domain |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 335 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user@.com', // Invalid domain |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 336 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user@domain.', // Missing TLD |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 338 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'user@domain.c' // TLD too short (must be 2+ chars) |
| `src/lib/infrastructure/workspaces/components/InviteMemberModal.svelte` | 93 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 			toast.success('User invited'); |
| `src/lib/infrastructure/workspaces/components/InviteMemberModal.svelte` | 98 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 					emailError = 'This user has already been invited'; |
| `src/lib/infrastructure/workspaces/components/InviteMemberModal.svelte` | 100 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 					emailError = 'This user is already a member'; |
| `src/lib/infrastructure/workspaces/components/InviteMemberModal.svelte` | 140 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 						Send an invite to a specific user by email. They'll receive a link to join this |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 17 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		userId: string; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 36 | 1 | `user` | `workspace` | Workspace signals: workspace | 		accountEmail = 'user@example.com', |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 37 | 1 | `user` | `workspace` | Workspace signals: workspace | 		accountName = 'user@example.com', |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 76 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onCreateWorkspaceForAccount?: (targetUserId: string) => void; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 77 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onJoinWorkspaceForAccount?: (targetUserId: string) => void; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 79 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 80 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		onLogoutAccount?: (targetUserId: string) => void; |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 132 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			(account) => account && account.userId |
| `src/lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte` | 241 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					{#each linkedAccountsWithOrgs as account (account.userId)} |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 20 | 1 | `User` | `workspace` | Workspace signals: workspace | 	getUserId: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 42 | 1 | `User` | `workspace` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 66 | 2 | `User` | `workspace` | Workspace signals: workspace | 			const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 67 | 1 | `User` | `workspace` | Workspace signals: workspace | 			if (!currentUserId) { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceAnalytics.svelte.ts` | 68 | 1 | `user` | `workspace` | Workspace signals: workspace | 				console.debug('⏭️ Skipping workspace switch tracking - user not authenticated yet'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 8 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	userId: Id<'users'>; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 68 | 1 | `User` | `workspace` | Workspace signals: workspace, member | 		removeMember: async (args: { workspaceId: string; memberUserId: string }) => { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 78 | 3 | `User, users` | `unknown` | Mixed auth(1) + workspace(2) signals | 					memberUserId: args.memberUserId as Id<'users'> |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMembers.svelte.ts` | 113 | 1 | `user` | `workspace` | Workspace signals: workspace, member | 						message = 'This user has already been invited'; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 24 | 1 | `User` | `workspace` | Workspace signals: workspace | 	getUserId: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 47 | 1 | `User` | `workspace` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 64 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const userId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceMutations.svelte.ts` | 65 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		invariant(userId, 'User ID is required. Please log in again.'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 63 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 87 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 113 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 134 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 137 | 1 | `user` | `workspace` | Workspace signals: workspace | 			mockStorage.setItem('activeOrganizationId_test-user-id', 'invalid-org-id'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 141 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 161 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 165 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 187 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 191 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 208 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'activeOrganizationId_test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 219 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 223 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 241 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const detailsKey = 'activeOrganizationDetails_test-user-id'; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 254 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 258 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-1', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 267 | 1 | `user` | `workspace` | Workspace signals: workspace | 				'activeOrganizationId_user-1', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 274 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should clear active workspace when userId changes', async () => { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 280 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' }); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 284 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-1', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 302 | 1 | `user` | `workspace` | Workspace signals: workspace | 			expect(mockStorage.getItem('activeOrganizationId_user-1')).toBe('org-1'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 310 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'user-2', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 320 | 1 | `user` | `workspace` | Workspace signals: workspace | 			expect(mockStorage.removeItem).toHaveBeenCalledWith('activeOrganizationId_user-1'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 321 | 1 | `user` | `workspace` | Workspace signals: workspace | 			expect(mockStorage.removeItem).toHaveBeenCalledWith('activeOrganizationDetails_user-1'); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 336 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 366 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 48 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 94 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 112 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.characterization.svelte.test.ts` | 152 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 65 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 105 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 132 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 156 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id' |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 195 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 215 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 245 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.integration.svelte.test.ts` | 283 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: () => 'test-user-id', |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 51 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	userId?: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 57 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const getUserId = options?.userId \|\| (() => undefined); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 61 | 2 | `User` | `workspace` | Workspace signals: workspace | 	const currentUserId = browser ? getUserId() : undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 62 | 1 | `User` | `workspace` | Workspace signals: workspace | 	const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 63 | 1 | `User` | `workspace` | Workspace signals: workspace | 	const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 75 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		userId: getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 94 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		userId: getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 105 | 1 | `User` | `workspace` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts` | 249 | 1 | `User` | `workspace` | Workspace signals: workspace | 		getUserId, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 16 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	userId?: () => string \| undefined; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 35 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	const getUserId = options.userId \|\| (() => undefined); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 43 | 1 | `User` | `workspace` | Workspace signals: workspace | 		lastUserId: undefined as string \| undefined, |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 55 | 2 | `User` | `workspace` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 56 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 57 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 125 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const userId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 129 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		if (userId !== undefined) { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 131 | 2 | `User` | `workspace` | Workspace signals: workspace | 			const prevUserId = untrack(() => state.lastUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 136 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				state.lastUserId = userId; |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 140 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (prevUserId !== undefined && prevUserId !== userId) { |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 146 | 1 | `User` | `workspace` | Workspace signals: workspace | 				const oldStorageKey = getStorageKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 147 | 1 | `User` | `workspace` | Workspace signals: workspace | 				const oldStorageDetailsKey = getStorageDetailsKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 265 | 2 | `User` | `workspace` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 266 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 267 | 1 | `User` | `workspace` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 58 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should return key with userId prefix when userId provided', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 59 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const result = getStorageKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 60 | 1 | `user` | `workspace` | Workspace signals: workspace | 			expect(result).toBe('activeOrganizationId_user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 63 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should return base key when userId is undefined', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 68 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should handle empty string userId (treated as falsy)', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 76 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should return key with userId prefix when userId provided', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 77 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const result = getStorageDetailsKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 78 | 1 | `user` | `workspace` | Workspace signals: workspace | 			expect(result).toBe('activeOrganizationDetails_user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 81 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should return base key when userId is undefined', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 86 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		it('should handle empty string userId (treated as falsy)', () => { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 196 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const storageKey = getStorageKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 197 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const storageDetailsKey = getStorageDetailsKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 236 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const storageKey = getStorageKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 237 | 1 | `user` | `workspace` | Workspace signals: workspace | 			const storageDetailsKey = getStorageDetailsKey('user123'); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 272 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const userId = 'user123'; |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 273 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const storageKey = getStorageKey(userId); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 274 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			const storageDetailsKey = getStorageDetailsKey(userId); |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 21 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | export function getStorageKey(userId: string \| undefined): string { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 22 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX; |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 31 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | export function getStorageDetailsKey(userId: string \| undefined): string { |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.ts` | 32 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	return userId ? `${STORAGE_DETAILS_KEY_PREFIX}_${userId}` : STORAGE_DETAILS_KEY_PREFIX; |
| `src/lib/modules/core/api.ts` | 230 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		getUserId: () => string \| undefined, |
| `src/lib/modules/core/components/AppTopBar.svelte` | 13 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		accountEmail = 'user@example.com', |
| `src/lib/modules/core/components/notes/NoteEditor.svelte` | 498 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/lib/modules/core/components/notes/prosemirror/EmojiMenu.svelte` | 60 | 1 | `user` | `workspace` | Workspace signals: person/people | 		{ emoji: '👤', keywords: ['user', 'person', 'profile'] }, |
| `src/lib/modules/core/components/notes/prosemirror/EmojiMenu.svelte` | 61 | 1 | `users` | `workspace` | Workspace signals: people | 		{ emoji: '👥', keywords: ['users', 'people', 'team', 'group'] }, |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 68 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					<Icon type="user" size="sm" color="default" class="flex-shrink-0" /> |
| `src/lib/modules/core/components/Sidebar.svelte` | 43 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		user?: { email: string; firstName?: string; lastName?: string } \| null; |
| `src/lib/modules/core/components/Sidebar.svelte` | 58 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		user = null, |
| `src/lib/modules/core/components/Sidebar.svelte` | 84 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 	const accountEmail = user?.email ?? 'user@example.com'; |
| `src/lib/modules/core/components/Sidebar.svelte` | 85 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const accountName = user?.firstName |
| `src/lib/modules/core/components/Sidebar.svelte` | 86 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 		? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` |
| `src/lib/modules/core/components/Sidebar.svelte` | 140 | 1 | `user` | `system_auth` | Auth signals: , userId | 					if (!account.userId) continue; |
| `src/lib/modules/core/components/Sidebar.svelte` | 143 | 1 | `user` | `system_auth` | Auth signals: , userId | 					const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${account.userId}`; |
| `src/lib/modules/core/components/Sidebar.svelte` | 151 | 1 | `user` | `system_auth` | Auth signals: , userId | 								const currentOrgs = linkedAccountOrgsMap[account.userId]; |
| `src/lib/modules/core/components/Sidebar.svelte` | 153 | 1 | `user` | `system_auth` | Auth signals: , userId | 									linkedAccountOrgsMap[account.userId] = orgs; |
| `src/lib/modules/core/components/Sidebar.svelte` | 162 | 1 | `user` | `system_auth` | Auth signals: , userId | 						if (linkedAccountOrgsMap[account.userId]) { |
| `src/lib/modules/core/components/Sidebar.svelte` | 163 | 1 | `user` | `system_auth` | Auth signals: , userId | 							delete linkedAccountOrgsMap[account.userId]; |
| `src/lib/modules/core/components/Sidebar.svelte` | 201 | 3 | `User, user` | `system_auth` | Auth signals: session, userId | 			const currentUserId = authSession.user?.userId; |
| `src/lib/modules/core/components/Sidebar.svelte` | 202 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			if (!currentUserId) return; |
| `src/lib/modules/core/components/Sidebar.svelte` | 206 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${currentUserId}`; |
| `src/lib/modules/core/components/Sidebar.svelte` | 221 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: account.userId, |
| `src/lib/modules/core/components/Sidebar.svelte` | 226 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			workspaces: map[account.userId] ?? [] |
| `src/lib/modules/core/components/Sidebar.svelte` | 396 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 	const useResizable = $derived( |
| `src/lib/modules/core/components/Sidebar.svelte` | 458 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | {#if useResizable && onSidebarWidthChange} |
| `src/lib/modules/core/components/Sidebar.svelte` | 546 | 1 | `User` | `workspace` | Workspace signals: workspace | 				onCreateWorkspaceForAccount={async (targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 548 | 1 | `User` | `unknown` | Mixed auth(2) + workspace(1) signals | 					await authSession.switchAccount(targetUserId, '/auth/redirect?create=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 550 | 1 | `User` | `workspace` | Workspace signals: workspace | 				onJoinWorkspaceForAccount={async (targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 552 | 1 | `User` | `unknown` | Mixed auth(2) + workspace(1) signals | 					await authSession.switchAccount(targetUserId, '/auth/redirect?join=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 565 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				onSwitchAccount={async (targetUserId, _redirectTo) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 567 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 					const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 577 | 1 | `User` | `system_auth` | Auth signals: session | 						await authSession.switchAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 589 | 1 | `User` | `system_auth` | Auth signals: logout | 				onLogoutAccount={(targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 590 | 1 | `User` | `system_auth` | Auth signals: session, logout | 					authSession.logoutAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 927 | 1 | `User` | `workspace` | Workspace signals: workspace | 			onCreateWorkspaceForAccount={async (targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 929 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				await authSession.switchAccount(targetUserId, '/inbox?create=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 931 | 1 | `User` | `workspace` | Workspace signals: workspace | 			onJoinWorkspaceForAccount={async (targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 933 | 1 | `User` | `unknown` | Mixed auth(1) + workspace(1) signals | 				await authSession.switchAccount(targetUserId, '/inbox?join=workspace'); |
| `src/lib/modules/core/components/Sidebar.svelte` | 946 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			onSwitchAccount={async (targetUserId, _redirectTo) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 948 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 				const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 959 | 1 | `User` | `system_auth` | Auth signals: session | 					await authSession.switchAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 971 | 1 | `User` | `system_auth` | Auth signals: logout | 			onLogoutAccount={(targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 972 | 1 | `User` | `system_auth` | Auth signals: session, logout | 				authSession.logoutAccount(targetUserId); |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 18 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 34 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onCreateWorkspaceForAccount?: (targetUserId: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 35 | 1 | `User` | `workspace` | Workspace signals: workspace | 		onJoinWorkspaceForAccount?: (targetUserId: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 37 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 39 | 1 | `User` | `system_auth` | Auth signals: logout | 		onLogoutAccount?: (targetUserId: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 49 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		accountEmail = 'user@example.com', |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 157 | 2 | `User` | `workspace` | Workspace signals: workspace | 				onCreateWorkspaceForAccount={(targetUserId) => onCreateWorkspaceForAccount?.(targetUserId)} |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 158 | 2 | `User` | `workspace` | Workspace signals: workspace | 				onJoinWorkspaceForAccount={(targetUserId) => onJoinWorkspaceForAccount?.(targetUserId)} |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 160 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 				onSwitchAccount={(targetUserId, redirectTo) => onSwitchAccount?.(targetUserId, redirectTo)} |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 162 | 2 | `User` | `system_auth` | Auth signals: logout | 				onLogoutAccount={(targetUserId) => onLogoutAccount?.(targetUserId)} |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 31 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	getUserId: () => string \| undefined, |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 76 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 					ownership?: 'user' \| 'workspace' \| 'circle'; |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 100 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			const userId = getUserId(); |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 101 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 			invariant(userId, 'User ID is required'); |
| `src/lib/modules/docs/components/Breadcrumb.svelte` | 26 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		'user-journeys': 'User Journeys', |
| `src/lib/modules/docs/components/Breadcrumb.svelte` | 174 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 15 | 1 | `user` | `system_auth` | Auth signals: , userId | 	let userId: any; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 19 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (userId) { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 21 | 1 | `user` | `system_auth` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 27 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 28 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 41 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should list user flashcards', async () => { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 43 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 44 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 55 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 66 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 67 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 103 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should enforce user isolation', async () => { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 107 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 108 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 113 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			question: 'User 1 Q', |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 114 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			answer: 'User 1 A', |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 119 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const user2Flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 123 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user2Flashcards.length).toBe(0); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 126 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user1); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 127 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user2); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 128 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId = null; |
| `src/lib/modules/flashcards/components/FlashcardMetadata.svelte` | 34 | 3 | `User, user` | `system_auth` | Auth signals: , userId | 	const getUserId = () => $page.data.user?.userId; |
| `src/lib/modules/flashcards/components/FlashcardMetadata.svelte` | 45 | 1 | `User` | `system_auth` | Auth signals: session | 	const tagging = coreAPI?.useTagging('flashcard', getUserId, getSessionId, () => |
| `src/lib/modules/flashcards/composables/useStudySession.svelte.ts` | 16 | 2 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 58 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 303 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 347 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useInboxSync.svelte.test.ts` | 391 | 1 | `useR` | `unknown` | No strong auth/workspace signals detected | 		vi.useRealTimers(); |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 37 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 47 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 57 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 90 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 100 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 110 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 143 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 153 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 194 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 244 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 254 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 264 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 300 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 310 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 320 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 356 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 366 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 402 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 412 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 457 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 467 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 477 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 504 | 1 | `user` | `workspace` | Workspace signals: personId, person/people | 				personId: 'user-1', |
| `src/lib/modules/inbox/components/InboxHeader.stories.svelte` | 118 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/inbox/components/InboxHeader.stories.svelte` | 128 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await userEvent.click(kebabButton); |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 21 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 	ownershipType?: 'user' \| 'workspace' \| 'circle'; |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 34 | 1 | `user` | `workspace` | Workspace signals: workspace | 	activeWorkspaceId?: () => string \| null; // Function for reactivity (optional - tags can be user or org-scoped) |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 57 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 			ownership?: 'user' \| 'workspace' \| 'circle'; |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 84 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 					ownership?: 'user' \| 'workspace' \| 'circle'; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 29 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 34 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 35 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 44 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should create action item assigned to user', async () => { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 46 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 48 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 52 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 77 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 78 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 92 | 1 | `user` | `workspace` | Workspace signals: assignee | 		expect(actionItem?.assigneeType).toBe('user'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 93 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		expect(actionItem?.assigneeUserId).toBe(userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 99 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 101 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 103 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 105 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 166 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 	it('should fail when assigneeUserId missing for user type', async () => { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 168 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 170 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 172 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 174 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 198 | 1 | `user` | `workspace` | Workspace signals: assignee | 				assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 201 | 1 | `User` | `workspace` | Workspace signals: assignee | 		).rejects.toThrow('assigneeUserId is required'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 206 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 208 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 210 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 212 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 236 | 1 | `user` | `workspace` | Workspace signals: assignee | 				assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 237 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 245 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 250 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 251 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 262 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 264 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 266 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 268 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 293 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 294 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 303 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 304 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 321 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 323 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 325 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 327 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 357 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 358 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 367 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 368 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 384 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 385 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 387 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 388 | 1 | `user` | `workspace` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, user2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 390 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 392 | 3 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: user2 }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 416 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 417 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 418 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			description: 'User 1 Action' |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 426 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 427 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 			assigneeUserId: user2, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 428 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			description: 'User 2 Action' |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 434 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 438 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		expect(items[0]?.description).toBe('User 1 Action'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 443 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 445 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 447 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 449 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 473 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 474 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 484 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 485 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 493 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 503 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 513 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 515 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 517 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 519 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 542 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 543 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 559 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 564 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 565 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 576 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 578 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 580 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 582 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 605 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 606 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 629 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 631 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 633 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 635 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 658 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 659 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 680 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 681 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 683 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 685 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 687 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 710 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 711 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 719 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 720 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 			assigneeUserId: user2 |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 728 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 		expect(item?.assigneeUserId).toBe(user2); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 733 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 735 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 737 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 739 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 762 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 763 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 783 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 785 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 787 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 789 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 812 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 813 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			assigneeUserId: userId, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 831 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 833 | 1 | `user` | `workspace` | Workspace signals: member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 835 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const templateId = await createTestMeetingTemplate(t, org1, user1); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 838 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 840 | 1 | `user` | `workspace` | Workspace signals: member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 842 | 4 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: user1, orgId: org1 }, { userId: user2, orgId: org2 }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 866 | 1 | `user` | `workspace` | Workspace signals: assignee | 			assigneeType: 'user', |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 867 | 2 | `User, user` | `workspace` | Workspace signals: assignee | 			assigneeUserId: user1, |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 27 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 32 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 33 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 44 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 46 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 48 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 89 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 91 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 93 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 95 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 124 | 1 | `user` | `workspace` | Workspace signals: workspace | 	it('should fail for user not in workspace', async () => { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 128 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 130 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 132 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 151 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 153 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: otherUserId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 167 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 172 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 173 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 184 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 186 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 188 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 190 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 228 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 230 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 232 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 234 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 272 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 274 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 276 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 278 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 307 | 1 | `user` | `workspace` | Workspace signals: workspace | 	it('should fail for user not in workspace', async () => { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 311 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 313 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 315 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 334 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 336 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: otherUserId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 18 | 1 | `User` | `workspace` | Workspace signals: personId, person/people | 	getPersonIdForUser, |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 24 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 29 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 30 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 45 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 47 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 49 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 51 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 83 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 85 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 87 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 89 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 118 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 120 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 122 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 124 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 161 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 163 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 165 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 167 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 199 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 201 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 203 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 205 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 238 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 240 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 242 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 244 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 277 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 279 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 281 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 283 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 313 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 315 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 317 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 319 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 350 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should add a user attendee to a meeting', async () => { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 352 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 354 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 356 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 359 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 360 | 1 | `user` | `workspace` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, userId2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 362 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 363 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people | 		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 365 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 366 | 2 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: userId2 }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 412 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 414 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 417 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 419 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 422 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 423 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: attendeeId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 441 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 446 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId: attendeeId |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 459 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		const memberAttendee = meeting.attendees.find((a) => a.userId === attendeeId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 465 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 467 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 470 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 472 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 474 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 476 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 477 | 1 | `User` | `workspace` | Workspace signals: personId, person/people | 		const attendeePersonId = await getPersonIdForUser(t, orgId, attendeeId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 478 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: attendeeId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 519 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 521 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 523 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 526 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 527 | 1 | `user` | `workspace` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, userId2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 529 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const creatorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 530 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people | 		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 532 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 533 | 2 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: userId2 }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 582 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 584 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 587 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 589 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 624 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should list meetings for current user (direct invite)', async () => { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 626 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 628 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 630 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const personId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 632 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 634 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 655 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userMeetings = await t.query(api.features.meetings.meetings.listForUser, { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 660 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(userMeetings.length).toBe(1); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 661 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(userMeetings[0].title).toBe('Private Meeting'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 666 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 668 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 670 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		const personId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 672 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 674 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 694 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userMeetings = await t.query(api.features.meetings.meetings.listForUser, { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 699 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(userMeetings.length).toBe(1); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 700 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(userMeetings[0].title).toBe('Public Meeting'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 22 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 27 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 28 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 43 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 45 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 47 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 73 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 75 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 77 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 106 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 108 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 110 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 139 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 141 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 143 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 172 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 174 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 176 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 214 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 216 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 218 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 252 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 254 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 256 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 314 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 316 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 318 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 367 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 369 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 371 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 430 | 1 | `user` | `workspace` | Workspace signals: workspace | 	it('should only list templates for user workspace', async () => { |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 432 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 438 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, org1, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 439 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, org2, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 441 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId: org1 }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 479 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 481 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 483 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/api.ts` | 34 | 1 | `Users` | `workspace` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; |
| `src/lib/modules/meetings/components/ActionItemsList.svelte` | 102 | 2 | `user` | `workspace` | Workspace signals: role, assignee | 							onclick={() => (form.assigneeType = form.assigneeType === 'user' ? 'role' : 'user')} |
| `src/lib/modules/meetings/components/ActionItemsList.svelte` | 104 | 2 | `user, User` | `workspace` | Workspace signals: role, assignee | 							{form.assigneeType === 'user' ? '👤 User' : '🎭 Role'} |
| `src/lib/modules/meetings/components/ActionItemsList.svelte` | 112 | 1 | `user` | `workspace` | Workspace signals: assignee | 				{#if form.assigneeType === 'user'} |
| `src/lib/modules/meetings/components/AttendeeChip.svelte` | 9 | 1 | `user` | `workspace` | Workspace signals: circle | 		getTypeLabel: (type: 'user' \| 'circle') => string; |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 43 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 44 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				id: 'user-1', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 77 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 78 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				id: 'user-1', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 83 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 84 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				id: 'user-2', |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 118 | 1 | `users` | `workspace` | Workspace signals: circle | 	Note: Mock displays populated attendees (3 users + 3 circles) by default. |
| `src/lib/modules/meetings/components/AttendeeSelector.svelte` | 168 | 1 | `users` | `workspace` | Workspace signals: circle | 					placeholder="Search users or circles..." |
| `src/lib/modules/meetings/components/AttendeeSelector.svelte` | 294 | 1 | `users` | `workspace` | Workspace signals: circle | 		<Text variant="label" color="tertiary" as="p">No attendees selected - add users or circles</Text |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 20 | 2 | `user` | `workspace` | Workspace signals: person/people, circle | 	type: 'user' \| 'circle'; // user → person invite |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 23 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	email?: string; // For users |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 44 | 1 | `user` | `workspace` | Workspace signals: circle | 	getTypeLabel: (type: 'user' \| 'circle') => string; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 45 | 1 | `user` | `workspace` | Workspace signals: circle | 	getTypeBadgeClass: (type: 'user' \| 'circle') => string; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 46 | 1 | `user` | `workspace` | Workspace signals: circle | 	getTypeIcon: (type: 'user' \| 'circle') => string; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 59 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 	const usersQuery = |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 83 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 		const users = usersQuery?.data ?? []; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 84 | 2 | `user, users` | `unknown` | No strong auth/workspace signals detected | 		for (const user of users) { |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 86 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				type: 'user', |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 87 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people | 				id: user.personId as Id<'people'>, |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 88 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 				name: user.name \|\| user.email \|\| 'Unknown', |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 89 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				email: user.email |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 150 | 1 | `user` | `workspace` | Workspace signals: circle | 	function getTypeLabel(type: 'user' \| 'circle'): string { |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 152 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 153 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				return 'User'; |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 160 | 1 | `user` | `workspace` | Workspace signals: circle | 	function getTypeBadgeClass(type: 'user' \| 'circle'): string { |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 162 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 170 | 1 | `user` | `workspace` | Workspace signals: circle | 	function getTypeIcon(type: 'user' \| 'circle'): string { |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 172 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			case 'user': |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 180 | 1 | `users` | `workspace` | Workspace signals: circle | 		(usersQuery?.isLoading ?? false) \|\| (circlesQuery?.isLoading ?? false) |
| `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts` | 29 | 2 | `user` | `workspace` | Workspace signals: person/people, circle | 	type: 'user' \| 'circle'; // 'user' means person invite |
| `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts` | 553 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, people | 							personId: attendee.type === 'user' ? (attendee.id as Id<'people'>) : undefined, |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 91 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	const activeUsers = $derived(activePresenceQuery?.error ? [] : (activePresenceQuery?.data ?? [])); |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 92 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	const activeCount = $derived(activeUsers.length); |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 164 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		get activeUsers() { |
| `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` | 165 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 			return activeUsers; |
| `src/lib/modules/meetings/composables/useMeetings.svelte.ts` | 39 | 2 | `Users, users` | `workspace` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; // Invited users for display |
| `src/lib/modules/meetings/composables/useMeetings.svelte.ts` | 54 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			? useQuery(api.features.meetings.meetings.listForUser, () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 17 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 	getPersonIdForUser, |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 23 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 28 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			if (item.userId) { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 29 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 40 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 42 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 45 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 71 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 73 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 76 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 106 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 108 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 111 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 142 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 144 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 147 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 172 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should assign a user to a role', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 174 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 175 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 177 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 178 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 179 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 180 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(5) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 183 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 184 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 212 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should remove a user from a role', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 214 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 215 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 217 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 218 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 219 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 222 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 223 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 262 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should get all roles assigned to a user', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 264 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 265 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 267 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 268 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 269 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 272 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 273 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 300 | 2 | `user, User` | `workspace` | Workspace signals: org-chart path, circle, role | 		const userRoles = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 305 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 		expect(userRoles.length).toBe(2); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 306 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 		expect(userRoles.map((r) => r.roleName).sort()).toEqual(['Circle Lead', 'Dev Lead']); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 309 | 1 | `users` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should allow multiple users to fill the same role', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 311 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 312 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 313 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user3Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 315 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 316 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 317 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user3Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 318 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const person2 = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 319 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const person3 = await getPersonIdForUser(t, orgId, user3Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 322 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 323 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 324 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user3Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 356 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 358 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 361 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 380 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should prevent assigning user twice to same role', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 382 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 383 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 385 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 386 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 387 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 390 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 391 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 418 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 419 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 421 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 422 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 423 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 426 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 427 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 443 | 2 | `user, User` | `workspace` | Workspace signals: org-chart path, circle, role | 		const userRolesBefore = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 447 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 		expect(userRolesBefore.length).toBe(1); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 456 | 2 | `user, User` | `workspace` | Workspace signals: org-chart path, circle, role | 		const userRolesAfter = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 460 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 		expect(userRolesAfter.length).toBe(0); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 463 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 	it('should filter user roles by circle', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 465 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 466 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 468 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 469 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 470 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const person2 = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 475 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 476 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 503 | 1 | `User` | `workspace` | Workspace signals: org-chart path, circle, role | 		const circle1Roles = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 513 | 1 | `users` | `workspace` | Workspace signals: workspace, org-chart path, circle, role | 	it('should enforce workspace membership - users cannot access other org roles', async () => { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 515 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 516 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 520 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 521 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 525 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 526 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 18 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 	getPersonIdForUser, |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 24 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 29 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			if (item.userId) { |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 30 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 41 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 43 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 49 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 64 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 66 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 68 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 93 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 95 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 97 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 128 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 130 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 134 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 148 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 150 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 154 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 178 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 180 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 192 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 217 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 226 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 227 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 229 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 230 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 231 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 235 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 236 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 239 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 262 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 263 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 265 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 266 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 267 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 268 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		const actorPersonId = await getPersonIdForUser(t, orgId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 271 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestCircleMember(t, circleId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 272 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 274 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 275 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 305 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 306 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId: user2Id } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 308 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 309 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 310 | 2 | `User, user` | `workspace` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 313 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestCircleMember(t, circleId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 314 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestCircleMember(t, circleId, userId); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 316 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 317 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2Id }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 331 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 334 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 335 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId2, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 340 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 356 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 358 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 362 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 374 | 1 | `users` | `workspace` | Workspace signals: workspace, org-chart path, circle, member | 	it('should enforce workspace membership - users cannot access other org circles', async () => { |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 376 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { userId: user1 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 377 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(2) signals | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 379 | 1 | `User` | `workspace` | Workspace signals: org-chart path, circle | 		const org1 = await createTestOrganization(t, 'User 1 Org'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 380 | 1 | `User` | `workspace` | Workspace signals: org-chart path, circle | 		const org2 = await createTestOrganization(t, 'User 2 Org'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 381 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 382 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 386 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user1, orgId: org1 }); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 387 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		cleanupQueue.push({ userId: user2, orgId: org2 }); |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 218 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 			layerType === 'circle' ? 'circle' : layerType === 'role' ? 'user' : null; |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 164 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 169 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle | 		await userEvent.click(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 201 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 206 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle | 		await userEvent.hover(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 207 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle | 		await userEvent.unhover(circleGroup); |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 86 | 1 | `user` | `workspace` | Workspace signals: org-chart path, circle, role | 		if (confirm(`Archive role "${roleName}"? All user assignments will be removed.`)) { |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 49 | 1 | `user` | `workspace` | Workspace signals: org-chart path | 		const userChildren: DisplayNode[] = node.children.map((c) => ({ ...c, isAutoCreated: false })); |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 52 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 		return [...coreRoles, ...userChildren]; |
| `src/lib/modules/org-chart/components/RoleCard.stories.svelte` | 152 | 1 | `User` | `workspace` | Workspace signals: org-chart path, role | 	name="CurrentUserHighlighted" |
| `src/lib/modules/org-chart/components/RoleCard.stories.svelte` | 183 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 				The current user's card (Randy Hereman) is highlighted with the brand teal background. |
| `src/lib/modules/org-chart/components/RoleCard.svelte` | 13 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(6) signals | 		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/org-chart/components/RoleCard.svelte` | 232 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 							<Icon type="user-plus" size="sm" /> |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 305 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 			return 'user'; |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 470 | 1 | `users` | `workspace` | Workspace signals: org-chart path, role | 										icon="users" |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 26 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-1', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 34 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 49 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-2', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 58 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 73 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-3', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 86 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 101 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-4', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 110 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 125 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-5', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 136 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 				userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 146 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 				userId="user-6" |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 159 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 		userId: 'user-7', |
| `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte` | 166 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			userId={args.userId} |
| `src/lib/modules/org-chart/components/RoleMemberItem.svelte` | 8 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(7) signals | 		personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 162 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 167 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 		await userEvent.click(roleGroup); |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 197 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 202 | 1 | `user` | `workspace` | Workspace signals: org-chart path, role | 		await userEvent.hover(roleGroup); |
| `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte` | 35 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(6) signals | 			personId: Id<'people'>; // Workspace-scoped identifier (architecture requirement - NEVER use userId) |
| `src/lib/modules/projects/api.ts` | 24 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 	assigneeType: 'user' \| 'role'; |
| `src/lib/modules/projects/api.ts` | 25 | 2 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 	assigneeUserId?: Id<'users'>; |
| `src/lib/modules/projects/api.ts` | 31 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	createdBy: Id<'users'>; |
| `src/lib/modules/projects/api.ts` | 79 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: Id<'users'>; |
| `src/lib/modules/projects/api.ts` | 126 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 	get assigneeType(): 'user' \| 'role'; |
| `src/lib/modules/projects/api.ts` | 127 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 	set assigneeType(value: 'user' \| 'role'); |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 30 | 2 | `user` | `workspace` | Workspace signals: role, assignee | 		assigneeType: 'user' as 'user' \| 'role', |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 39 | 1 | `user` | `workspace` | Workspace signals: assignee | 		state.assigneeType = 'user'; |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 60 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, assignee | 		if (state.assigneeType === 'user' && !state.assigneePersonId) { |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 72 | 1 | `User` | `workspace` | Workspace signals: assignee | 			const assigneeUserId = |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 73 | 1 | `user` | `workspace` | Workspace signals: personId, person/people, assignee | 				state.assigneeType === 'user' && state.assigneePersonId |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 74 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 					? members.find((m) => m.personId === state.assigneePersonId)?.userId |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 77 | 2 | `user, User` | `workspace` | Workspace signals: assignee | 			if (state.assigneeType === 'user' && !assigneeUserId) { |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 78 | 1 | `user` | `workspace` | Workspace signals: person/people | 				toast.error('Selected person is missing a linked user'); |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 89 | 1 | `User` | `workspace` | Workspace signals: assignee | 				assigneeUserId, |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 149 | 2 | `user, User` | `workspace` | Workspace signals: assignee | 		if (item.assigneeType === 'user' && item.assigneeUserId) { |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 150 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(2) signals | 			const member = members.find((m) => m.userId === item.assigneeUserId); |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 151 | 1 | `User` | `workspace` | Workspace signals: member | 			return member?.name \|\| member?.email \|\| 'Unknown User'; |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 208 | 1 | `user` | `workspace` | Workspace signals: role, assignee | 		set assigneeType(value: 'user' \| 'role') { |
| `src/lib/modules/projects/composables/useTasks.svelte.ts` | 25 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/types/convex.ts` | 65 | 1 | `user` | `workspace` | Workspace signals: workspace, circle | 	ownershipType?: 'user' \| 'workspace' \| 'circle' \| 'purchased'; |
| `src/lib/types/convex.ts` | 77 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 93 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 111 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 118 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/readwise.ts` | 22 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	user_book: number; |
| `src/lib/utils/errorReporting.ts` | 18 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	userAction?: string; |
| `src/lib/utils/errorReporting.ts` | 24 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId?: string; |
| `src/lib/utils/errorReporting.ts` | 42 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userAction, |
| `src/lib/utils/errorReporting.ts` | 45 | 2 | `user` | `system_auth` | Auth signals: , userId | 		userId: _userId |
| `src/lib/utils/errorReporting.ts` | 59 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user_action: userAction, |
| `src/lib/utils/errorReporting.ts` | 64 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user_agent: navigator.userAgent, |
| `src/lib/utils/errorReporting.ts` | 107 | 1 | `user` | `system_auth` | Auth signals: , userId | 	userId?: string, |
| `src/lib/utils/errorReporting.ts` | 117 | 2 | `user` | `system_auth` | Auth signals: , userId | 				user_id: userId, |
| `src/lib/utils/parseConvexError.ts` | 39 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | function extractSynergyOSUserMessage(error: Error): string { |
| `src/lib/utils/parseConvexError.ts` | 59 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 		return parts[2]; // USER_MESSAGE is third part |
| `src/lib/utils/parseConvexError.ts` | 154 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const userMessage = extractSynergyOSUserMessage(error); |
| `src/lib/utils/parseConvexError.ts` | 156 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		return userMessage \|\| 'An error occurred. Please try again.'; |
| `src/routes/(authenticated)/+layout.server.ts` | 65 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				onboardingState.userOnboardingComplete && |
| `src/routes/(authenticated)/+layout.server.ts` | 116 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					if (!onboardingState.userOnboardingComplete) { |
| `src/routes/(authenticated)/+layout.server.ts` | 161 | 1 | `user` | `workspace` | Workspace signals: workspace | 						if (!firstWorkspaceState.userOnboardingComplete) { |
| `src/routes/(authenticated)/+layout.server.ts` | 254 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/(authenticated)/+layout.server.ts` | 350 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/+layout.svelte` | 52 | 3 | `user` | `system_auth` | Auth signals: , userId | 		userId: () => data.user?.userId, |
| `src/routes/(authenticated)/+layout.svelte` | 87 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			? useQuery(api.infrastructure.rbac.queries.getUserRBACDetails, () => { |
| `src/routes/(authenticated)/+layout.svelte` | 170 | 3 | `user` | `system_auth` | Auth signals: , userId | 				userId: data.user?.userId ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 172 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				email: data.user?.email ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 174 | 1 | `user` | `system_auth` | Auth signals: WorkOS | 				workosId: data.user?.workosId ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 299 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 	const accountEmail = $derived(() => data.user?.email ?? 'user@example.com'); |
| `src/routes/(authenticated)/+layout.svelte` | 301 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		data.user?.firstName && data.user?.lastName |
| `src/routes/(authenticated)/+layout.svelte` | 302 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 			? `${data.user.firstName} ${data.user.lastName}` |
| `src/routes/(authenticated)/+layout.svelte` | 784 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 				user={data.user} |
| `src/routes/(authenticated)/account/+page.server.ts` | 14 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			user: null, |
| `src/routes/(authenticated)/account/+page.server.ts` | 27 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		linkedAccounts = (await client.query(api.core.users.index.listLinkedAccounts, { |
| `src/routes/(authenticated)/account/+page.svelte` | 6 | 3 | `User, users` | `system_auth` | Auth signals: users infra path | 	import UserProfile from '$lib/infrastructure/users/components/UserProfile.svelte'; |
| `src/routes/(authenticated)/account/+page.svelte` | 7 | 1 | `users` | `system_auth` | Auth signals: users infra path | 	import type { LinkedAccount } from '$lib/infrastructure/users/api'; |
| `src/routes/(authenticated)/account/+page.svelte` | 8 | 3 | `User, users` | `system_auth` | Auth signals: users infra path | 	import type { UserProfile as UserProfileType } from '$lib/infrastructure/users/api'; |
| `src/routes/(authenticated)/account/+page.svelte` | 13 | 3 | `User, user` | `unknown` | No strong auth/workspace signals detected | 	const currentUser = $derived(data.user as UserProfileType \| null); |
| `src/routes/(authenticated)/account/+page.svelte` | 20 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 	let userProfile: UserProfileType \| null = $state(null); |
| `src/routes/(authenticated)/account/+page.svelte` | 27 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 			if (currentUser?.userId) { |
| `src/routes/(authenticated)/account/+page.svelte` | 28 | 2 | `users, User` | `unknown` | No strong auth/workspace signals detected | 				const profile = await convexClient.query(api.core.users.index.getUserById, { |
| `src/routes/(authenticated)/account/+page.svelte` | 30 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 					userId: currentUser.userId |
| `src/routes/(authenticated)/account/+page.svelte` | 32 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 				userProfile = profile as UserProfileType \| null; |
| `src/routes/(authenticated)/account/+page.svelte` | 35 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			console.error('Failed to load user profile:', error); |
| `src/routes/(authenticated)/account/+page.svelte` | 58 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 								{#if userProfile} |
| `src/routes/(authenticated)/account/+page.svelte` | 59 | 3 | `User, user` | `unknown` | No strong auth/workspace signals detected | 									<UserProfile user={userProfile} showEmail={true} avatarSize="lg" /> |
| `src/routes/(authenticated)/account/+page.svelte` | 60 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								{:else if currentUser} |
| `src/routes/(authenticated)/account/+page.svelte` | 61 | 3 | `User, user` | `unknown` | No strong auth/workspace signals detected | 									<UserProfile user={currentUser} showEmail={true} avatarSize="lg" /> |
| `src/routes/(authenticated)/account/+page.svelte` | 72 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 										{userProfile?.email ?? currentUser?.email ?? 'Not available'} |
| `src/routes/(authenticated)/account/+page.svelte` | 79 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						{#if userProfile?.emailVerified === false} |
| `src/routes/(authenticated)/account/+page.svelte` | 105 | 1 | `user` | `system_auth` | Auth signals: , userId | 							{#each linkedAccounts as account (account.userId)} |
| `src/routes/(authenticated)/admin/+error.svelte` | 11 | 1 | `user` | `system_auth` | Auth signals: , userId | 	let linkedAccounts = $state<Array<{ userId: string; email: string; name: string }>>([]); |
| `src/routes/(authenticated)/admin/+error.svelte` | 25 | 2 | `user` | `system_auth` | Auth signals: session, userId | 					(session: { userId: string; email: string; userName?: string }) => ({ |
| `src/routes/(authenticated)/admin/+error.svelte` | 26 | 2 | `user` | `system_auth` | Auth signals: session, userId | 						userId: session.userId, |
| `src/routes/(authenticated)/admin/+error.svelte` | 28 | 1 | `user` | `system_auth` | Auth signals: session | 						name: session.userName \|\| session.email |
| `src/routes/(authenticated)/admin/+error.svelte` | 39 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	async function switchAccount(targetUserId: string) { |
| `src/routes/(authenticated)/admin/+error.svelte` | 48 | 1 | `User` | `system_auth` | Auth signals: session | 			await authSession.switchAccount(targetUserId, redirectUrl); |
| `src/routes/(authenticated)/admin/+error.svelte` | 113 | 1 | `user` | `system_auth` | Auth signals: , userId | 					{#each linkedAccounts as account (account.userId)} |
| `src/routes/(authenticated)/admin/+error.svelte` | 116 | 1 | `user` | `system_auth` | Auth signals: , userId | 							onclick={() => switchAccount(account.userId)} |
| `src/routes/(authenticated)/admin/+layout.server.ts` | 31 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/+layout.svelte` | 18 | 3 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 		{ href: '/admin/users', label: 'Users', icon: 'users' }, |
| `src/routes/(authenticated)/admin/+layout.svelte` | 29 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		users: |
| `src/routes/(authenticated)/admin/+page.server.ts` | 35 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/+page.svelte` | 5 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		users: { total: number; active: number; deleted: number }; |
| `src/routes/(authenticated)/admin/+page.svelte` | 37 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 					<p class="text-label text-tertiary">Total Users</p> |
| `src/routes/(authenticated)/admin/+page.svelte` | 38 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 					<p class="mt-form-field-gap text-h2 text-primary font-semibold">{stats.users.total}</p> |
| `src/routes/(authenticated)/admin/+page.svelte` | 40 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 						{stats.users.active} active, {stats.users.deleted} deleted |
| `src/routes/(authenticated)/admin/+page.svelte` | 97 | 1 | `user` | `workspace` | Workspace signals: role | 					Manage roles, permissions, and user-role assignments |
| `src/routes/(authenticated)/admin/+page.svelte` | 102 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				href="/admin/users" |
| `src/routes/(authenticated)/admin/+page.svelte` | 105 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				<h3 class="text-primary font-semibold">User Management</h3> |
| `src/routes/(authenticated)/admin/+page.svelte` | 106 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				<p class="text-small text-secondary">View and manage all users</p> |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.server.ts` | 59 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 19 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 141 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				allowedUserIds: undefined, // Not editable in UI yet |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 164 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		uniqueUsers: 234, |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 179 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		if (flag.allowedUserIds?.length) { |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 181 | 3 | `User, user` | `unknown` | No strong auth/workspace signals detected | 				`${flag.allowedUserIds.length} user${flag.allowedUserIds.length !== 1 ? 's' : ''}` |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 269 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 										~{impact.estimatedAffected.toLocaleString()} users |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 463 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 							Users with email addresses matching these domains will see the feature. |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 478 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							Shows the feature to a percentage of users based on a consistent hash. |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 527 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Unique Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 529 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 									{mockAnalytics.uniqueUsers.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.server.ts` | 27 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 31 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	let formAllowedUserIds = $state<string[]>([]); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 43 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	let userSearchQuery = $state(''); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 44 | 2 | `userS, User` | `unknown` | No strong auth/workspace signals detected | 	let userSearchResult: UserFlagsResult \| null = $state(null); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 45 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	let userSearchLoading = $state(false); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 46 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	let userNotFound = $state(false); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 50 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	const userSearchEnabledFlags = $derived( |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 51 | 2 | `userS` | `unknown` | No strong auth/workspace signals detected | 		userSearchResult ? userSearchResult.flags.filter((f) => f.result) : [] |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 53 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 	const userSearchDisabledFlags = $derived( |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 54 | 2 | `userS` | `unknown` | No strong auth/workspace signals detected | 		userSearchResult ? userSearchResult.flags.filter((f) => !f.result) : [] |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 69 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 78 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 79 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userEmail: string \| null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 85 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			allowedUserIds?: string[]; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 93 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		totalUsers: number; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 94 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		usersByDomain: Record<string, number>; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 102 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				byUserIds: number; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 108 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	type UserFlagsResult = { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 109 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userEmail: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 110 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 155 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 	async function handleUserSearch() { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 156 | 1 | `userS` | `system_auth` | Auth signals: session | 		if (!userSearchQuery.trim() \|\| !sessionId) return; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 158 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 		userSearchLoading = true; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 159 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userNotFound = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 160 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 		userSearchResult = null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 163 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			const result = await convexClient?.query(api.infrastructure.featureFlags.findFlagsForUser, { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 165 | 2 | `user, userS` | `unknown` | No strong auth/workspace signals detected | 				userEmail: userSearchQuery.trim() |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 169 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				userNotFound = true; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 173 | 2 | `userS, User` | `unknown` | No strong auth/workspace signals detected | 			userSearchResult = result as UserFlagsResult; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 175 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			console.error('Failed to search user flags:', error); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 176 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 			userSearchResult = null; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 177 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			userNotFound = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 179 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 			userSearchLoading = false; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 195 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				(f.allowedUserIds?.length ?? 0) > 0 \|\| |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 220 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					(flag.allowedUserIds?.length ?? 0) > 0 \|\| |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 228 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					(flag.allowedUserIds?.length ?? 0) === 0 && |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 241 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		if (flag.allowedUserIds?.length) { |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 243 | 3 | `User, user` | `unknown` | No strong auth/workspace signals detected | 				`${flag.allowedUserIds.length} user${flag.allowedUserIds.length !== 1 ? 's' : ''}` |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 288 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		formAllowedUserIds = []; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 300 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 		formAllowedUserIds = flag.allowedUserIds ?? []; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 327 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				allowedUserIds: |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 328 | 3 | `User, users` | `system_auth` | Auth signals: Convex users id type | 					formAllowedUserIds.length > 0 ? (formAllowedUserIds as Id<'users'>[]) : undefined, |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 494 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 									<strong>Target users:</strong> Use domain targeting (e.g., @acme.com) or percentage |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 615 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 												⚠️ Enabled but no targeting rules - flag will be disabled for all users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 680 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Total Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 682 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 									{impactStats.totalUsers.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 684 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 								<p class="mt-form-field-gap text-label text-secondary">System-wide user count</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 699 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 								<p class="text-label text-tertiary">Total Affected Users</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 713 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 									{Object.keys(impactStats.usersByDomain).length} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 722 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								Search User Impact |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 725 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 								Enter a user email to see which flags affect them and why. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 729 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 									placeholder="user@example.com" |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 730 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 									bind:value={userSearchQuery} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 735 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 											handleUserSearch(); |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 741 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 									onclick={handleUserSearch} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 742 | 2 | `userS` | `unknown` | No strong auth/workspace signals detected | 									disabled={userSearchLoading \|\| !userSearchQuery.trim()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 744 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 									{userSearchLoading ? 'Searching...' : 'Search'} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 748 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 							{#if userSearchResult} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 753 | 2 | `userS, user` | `unknown` | No strong auth/workspace signals detected | 										Results for: {userSearchResult.userEmail} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 756 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 										{#if userSearchEnabledFlags.length > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 759 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 													✅ Enabled Flags ({userSearchEnabledFlags.length}): |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 762 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 													{#each userSearchEnabledFlags as flagFlag (flagFlag.flag)} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 774 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 										{#if userSearchDisabledFlags.length > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 777 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 													❌ Disabled Flags ({userSearchDisabledFlags.length}): |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 780 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 													{#each userSearchDisabledFlags as flagFlag (flagFlag.flag)} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 793 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 							{:else if userNotFound} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 798 | 2 | `User, userS` | `unknown` | No strong auth/workspace signals detected | 										User {userSearchQuery.trim()} not found in system |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 829 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 													Estimated affected: ~{impact.estimatedAffected.toLocaleString()} users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 833 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 													Flag is disabled - no users affected |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 877 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 												{#if impact.breakdown.byUserIds > 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 881 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 														<p class="text-label text-tertiary">User ID Targeting</p> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 883 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 															{impact.breakdown.byUserIds.toLocaleString()} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 909 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 											{#if impact.breakdown.byDomain === 0 && impact.breakdown.byUserIds === 0 && impact.breakdown.byOrgIds === 0 && impact.breakdown.byRollout === 0} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 911 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 													⚠️ No targeting rules configured - flag will be disabled for all users |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 931 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 							Test how a feature flag evaluates for the current logged-in user. Select a flag to see |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 965 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 									Evaluates the flag for your current user account |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1113 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							from all users. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1157 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Shows the feature to a percentage of users based on a |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1158 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 								consistent hash. Same user always gets the same result. Example: 25% means roughly 1 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1159 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 								in 4 users will see it. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1182 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Users with email addresses matching these domains will |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1213 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								<li>User IDs (if set) - highest priority</li> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1219 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								<strong>Note:</strong> User and Organization targeting are not yet available in the UI. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1328 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							from all users. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1372 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Shows the feature to a percentage of users based on a |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1373 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 								consistent hash. Same user always gets the same result. Example: 25% means roughly 1 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1374 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 								in 4 users will see it. |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1397 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 								<strong>How it works:</strong> Users with email addresses matching these domains will |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1428 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								<li>User IDs (if set) - highest priority</li> |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1434 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 								<strong>Note:</strong> User and Organization targeting are not yet available in the UI. |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 24 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	let allUsers: unknown[] = []; |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 27 | 1 | `users` | `workspace` | Workspace signals: role | 		const [rolesResult, permissionsResult, analyticsResult, usersResult] = await Promise.all([ |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 31 | 2 | `users, Users` | `system_auth` | Auth signals: session | 			client.query(api.admin.users.listAllUsers, { sessionId }).catch(() => []) |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 36 | 2 | `Users, users` | `unknown` | No strong auth/workspace signals detected | 		allUsers = (usersResult as unknown[]) ?? []; |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 58 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 63 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		allUsers |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 60 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	let assignUserId = $state<string>(''); |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 99 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 	const allUsers = $derived( |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 100 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		(data.allUsers \|\| []) as Array<{ _id: string; email: string; name: string \| null }> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 291 | 1 | `User` | `workspace` | Workspace signals: role | 	async function assignRoleToUser() { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 297 | 1 | `User` | `workspace` | Workspace signals: role | 		if (!assignUserId \|\| !assignRoleId) { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 298 | 1 | `user` | `workspace` | Workspace signals: role | 			assignRoleError = 'Please select a user and role'; |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 317 | 1 | `User` | `workspace` | Workspace signals: role | 			await convexClient.mutation(api.admin.rbac.assignRoleToUser, { |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 319 | 3 | `User, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 				assigneeUserId: assignUserId as Id<'users'>, |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 329 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			assignUserId = ''; |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 460 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				users: number; |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 644 | 1 | `user` | `workspace` | Workspace signals: role | 				Manage roles, permissions, and user-role assignments |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 694 | 1 | `User` | `workspace` | Workspace signals: role | 				<p class="text-label text-secondary mt-fieldGroup">User-role assignments</p> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 707 | 1 | `User` | `workspace` | Workspace signals: role | 				Assign Role to User |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 727 | 1 | `users` | `workspace` | Workspace signals: role | 							Roles define what users can do in SynergyOS. Each role has permissions that grant |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 734 | 1 | `users` | `workspace` | Workspace signals: role | 								<li>Assign roles to users to grant permissions</li> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1000 | 2 | `users` | `unknown` | No strong auth/workspace signals detected | 									{analytics.systemLevel.users} unique users |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1157 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							Configure which RBAC permissions are automatically granted when users fill |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1159 | 1 | `user` | `workspace` | Workspace signals: role | 							user is assigned to a role template. |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1421 | 1 | `users` | `workspace` | Workspace signals: role | 					Create a new role that can be assigned to users |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1480 | 1 | `User` | `workspace` | Workspace signals: role | 				<Dialog.Title class="text-h3 text-primary font-semibold">Assign Role to User</Dialog.Title> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1482 | 1 | `user` | `workspace` | Workspace signals: role | 					Assign a role to a user to grant them permissions |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1489 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						for="assign-user-select" |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1490 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 						class="text-small text-primary mb-header block font-medium">User</label |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1493 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						id="assign-user-select" |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1494 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 						bind:value={assignUserId} |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1497 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						<option value="">Select a user...</option> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1498 | 3 | `Users, user` | `unknown` | No strong auth/workspace signals detected | 						{#each allUsers as user (user._id)} |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1499 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 							<option value={user._id}> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1500 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 								{user.name \|\| user.email} ({user.email}) |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1618 | 1 | `User` | `workspace` | Workspace signals: role | 				<Button variant="primary" onclick={assignRoleToUser} disabled={assignRoleLoading}> |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1742 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							Configure which RBAC permissions are automatically granted when users fill this |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 16 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	let userDetails: unknown = null; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 19 | 1 | `user` | `workspace` | Workspace signals: role | 		const [userDetailsResult, allRolesResult] = await Promise.all([ |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 20 | 2 | `users, User` | `unknown` | No strong auth/workspace signals detected | 			client.query(api.admin.users.getUserById, { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 22 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 				targetUserId: params.id as Id<'users'> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 26 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		userDetails = userDetailsResult as unknown; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 29 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		console.warn('Failed to load user details:', error); |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 33 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 35 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		userDetails, |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 12 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userDetails = $derived( |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 13 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		(data.userDetails \|\| null) as { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 18 | 1 | `user` | `workspace` | Workspace signals: role | 				userRoleId: string; |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 38 | 1 | `User` | `workspace` | Workspace signals: role | 	<title>User Role Assignment - Admin - SynergyOS</title> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 45 | 3 | `user, User` | `workspace` | Workspace signals: role | 			{userDetails?.name \|\| userDetails?.email \|\| 'User'} - Role Assignment |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 47 | 1 | `user` | `workspace` | Workspace signals: role | 		<p class="text-secondary mt-1 text-sm">Manage roles for this user</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 52 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		{#if userDetails} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 56 | 1 | `user` | `workspace` | Workspace signals: role | 				{#if userDetails.roles.length > 0} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 58 | 4 | `user` | `workspace` | Workspace signals: role | 						{#each userDetails.roles as userRole (userRole.userRoleId)} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 63 | 1 | `user` | `workspace` | Workspace signals: role | 									<p class="text-primary font-medium">{userRole.roleName}</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 65 | 1 | `user` | `workspace` | Workspace signals: workspace, role | 										{userRole.workspaceId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 67 | 1 | `user` | `workspace` | Workspace signals: role | 											: userRole.teamId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 77 | 1 | `User` | `workspace` | Workspace signals: role | 											await convexClient.mutation(api.admin.rbac.revokeUserRole, { |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 79 | 3 | `user` | `workspace` | Workspace signals: workspace, role | 												userRoleId: userRole.userRoleId as Id<'systemRoles'> \| Id<'workspaceRoles'> |
| `src/routes/(authenticated)/admin/settings/+page.server.ts` | 24 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 16 | 1 | `users` | `system_auth` | Auth signals: admin users path | 	let users: unknown[] = []; |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 18 | 3 | `users, Users` | `system_auth` | Auth signals: admin users path, session | 		const usersResult = await client.query(api.admin.users.listAllUsers, { sessionId }); |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 19 | 2 | `users` | `system_auth` | Auth signals: admin users path | 		users = (usersResult as unknown[]) ?? []; |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 21 | 1 | `users` | `system_auth` | Auth signals: admin users path | 		console.warn('Failed to load users:', error); |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 25 | 2 | `user` | `system_auth` | Auth signals: admin users path | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 27 | 1 | `users` | `system_auth` | Auth signals: admin users path | 		users |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 6 | 1 | `users` | `system_auth` | Auth signals: admin users path | 	const users = $derived( |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 7 | 1 | `users` | `system_auth` | Auth signals: admin users path | 		(data.users \|\| []) as Array<{ |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 18 | 1 | `User` | `system_auth` | Auth signals: admin users path | 	<title>User Management - Admin - SynergyOS</title> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 24 | 1 | `User` | `system_auth` | Auth signals: admin users path | 		<h1 class="text-h2 text-primary font-bold">User Management</h1> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 25 | 1 | `users` | `system_auth` | Auth signals: admin users path | 		<p class="mt-form-field-gap text-small text-secondary">View and manage all users</p> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 52 | 3 | `users, user` | `system_auth` | Auth signals: admin users path | 					{#each users as user (user._id)} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 54 | 1 | `user` | `system_auth` | Auth signals: admin users path | 							<td class="px-card py-form-field-gap text-small text-primary">{user.email}</td> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 55 | 1 | `user` | `system_auth` | Auth signals: admin users path | 							<td class="px-card py-form-field-gap text-small text-secondary">{user.name \|\| '-'}</td |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 58 | 1 | `user` | `system_auth` | Auth signals: admin users path | 								{new Date(user.createdAt).toLocaleDateString()} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 61 | 2 | `user` | `system_auth` | Auth signals: admin users path, login | 								{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 65 | 2 | `users, user` | `system_auth` | Auth signals: admin users path | 									href="/admin/rbac/users/{user._id}" |
| `src/routes/(authenticated)/onboarding/+layout.svelte` | 22 | 3 | `user` | `system_auth` | Auth signals: , userId | 			userId: () => data.user?.userId, |
| `src/routes/(authenticated)/onboarding/welcome/+page.svelte` | 24 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			await convexClient.mutation(api.features.onboarding.index.completeUserOnboarding, { |
| `src/routes/(authenticated)/onboarding/welcome/+page.svelte` | 55 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			<h3 class="text-primary mt-4 font-medium">User Onboarding Coming Soon</h3> |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 5 | 3 | `User, user` | `system_auth` | Auth signals: , userId | 	const getUserId = () => data.user?.userId; |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 26 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 				<p class="text-sm">User ID: {getUserId() ?? 'N/A'}</p> |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 27 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				<p class="text-sm">Email: {data.user?.email ?? 'N/A'}</p> |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 38 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 			const getUserSettings = makeFunctionReference( |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 39 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 				'settings:getUserSettings' |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 46 | 1 | `UserS` | `system_auth` | Auth signals: session | 			const data = await convexClient.query(getUserSettings, { sessionId }); |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 35 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 			const getUserSettings = makeFunctionReference( |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 36 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 				'settings:getUserSettings' |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 43 | 1 | `UserS` | `system_auth` | Auth signals: session | 			const data = await convexClient.query(getUserSettings, { sessionId }); |
| `src/routes/(authenticated)/w/[slug]/+layout.server.ts` | 131 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			if (!onboardingState.userOnboardingComplete) { |
| `src/routes/(authenticated)/w/[slug]/+layout.svelte` | 26 | 3 | `user` | `system_auth` | Auth signals: , userId | 		userId: () => data.user?.userId, |
| `src/routes/(authenticated)/w/[slug]/activate/components/ActivationIssueCard.svelte` | 17 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		'GOV-01': { icon: 'user', color: 'error' }, |
| `src/routes/(authenticated)/w/[slug]/dev/people-selector/+page.svelte` | 306 | 1 | `user` | `workspace` | Workspace signals: people | 							<Icon type="user-plus" size="sm" /> |
| `src/routes/(authenticated)/w/[slug]/flashcards/+page.svelte` | 63 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			? useQuery(api.features.flashcards.index.getUserFlashcards, () => { |
| `src/routes/(authenticated)/w/[slug]/flashcards/+page.svelte` | 144 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				const result = await convexClient.query(api.features.flashcards.index.getUserFlashcards, { |
| `src/routes/(authenticated)/w/[slug]/meetings/[id]/+page.server.ts` | 9 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	if (!parentData.user) { |
| `src/routes/(authenticated)/w/[slug]/meetings/[id]/+page.server.ts` | 19 | 3 | `user` | `system_auth` | Auth signals: , userId | 		userId: parentData.user.userId, |
| `src/routes/(authenticated)/w/[slug]/meetings/+page.svelte` | 274 | 2 | `Users, user` | `unknown` | No strong auth/workspace signals detected | 											attendeeAvatars={meeting.invitedUsers?.map((user) => ({ |
| `src/routes/(authenticated)/w/[slug]/meetings/+page.svelte` | 275 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 												name: user.name, |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 71 | 1 | `users` | `workspace` | Workspace signals: member | 		return permissions.can('users.remove'); |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 81 | 1 | `users` | `workspace` | Workspace signals: member | 		return permissions.can('users.invite'); |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 112 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				userId: confirmRemoveDialog.member.userId |
| `src/routes/(authenticated)/w/[slug]/members/+page.svelte` | 201 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 						{#each membersList as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/proposals/+page.svelte` | 67 | 1 | `user` | `workspace` | Workspace signals: proposal | 					limit: 100 // Get all user's proposals |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 22 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const isAuthenticated = true; // User is always authenticated in this route (protected by server) |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 36 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 				getUserSettings: makeFunctionReference( |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 37 | 1 | `UserS` | `workspace` | Workspace signals: workspace | 					'core/workspaces/settings:getUserSettings' |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 50 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 58 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 66 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 					Id<'userSettings'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 70 | 1 | `users` | `system_auth` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 73 | 1 | `users` | `system_auth` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 96 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, { |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 591 | 1 | `User` | `workspace` | Workspace signals: person/people | 												👤 Personal (User-owned) |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 28 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	})) as Array<{ userId: string; email: string; name: string; role: 'owner' \| 'admin' \| 'member' }>; |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 31 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 	const currentUserEmail = locals.auth.user?.email; |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 32 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	if (!currentUserEmail) { |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 33 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		throw error(401, 'User email not found'); |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 37 | 1 | `User` | `workspace` | Workspace signals: member | 	const membership = membersResult.find((m) => m.email === currentUserEmail); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 45 | 1 | `User` | `workspace` | Workspace signals: role | 	let selectedUserId = $state<string>(''); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 54 | 2 | `User, user` | `workspace` | Workspace signals: role | 		invariant(selectedUserId && selectedRoleId, 'Please select a user and role'); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 65 | 3 | `user, User, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 				userId: selectedUserId as Id<'users'>, |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 75 | 1 | `User` | `workspace` | Workspace signals: role | 			selectedUserId = ''; |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 87 | 1 | `user` | `workspace` | Workspace signals: role | 	async function handleRevokeRole(userRoleId: string) { |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 94 | 2 | `user` | `workspace` | Workspace signals: workspace, role | 				userRoleId: userRoleId as Id<'systemRoles'> \| Id<'workspaceRoles'> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 101 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 	function openAssignModalForUser(userId: string) { |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 102 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		selectedUserId = userId; |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 125 | 1 | `users` | `workspace` | Workspace signals: role | 				Roles control what users can do. <strong>System roles</strong> apply globally. |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 132 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			{#each members as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 137 | 2 | `user` | `workspace` | Workspace signals: role, member | 								{member.userName \|\| member.userEmail} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 140 | 1 | `user` | `workspace` | Workspace signals: role, member | 								{member.userEmail} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 146 | 1 | `user` | `workspace` | Workspace signals: role, member | 									{#each member.roles as role (role.userRoleId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 160 | 1 | `user` | `workspace` | Workspace signals: role | 												onclick={() => handleRevokeRole(role.userRoleId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 183 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(2) signals | 						<Button variant="secondary" onclick={() => openAssignModalForUser(member.userId)}> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 220 | 1 | `user` | `workspace` | Workspace signals: role | 							for="user-select" |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 223 | 1 | `User` | `workspace` | Workspace signals: role | 							User |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 226 | 1 | `user` | `workspace` | Workspace signals: role | 							id="user-select" |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 227 | 1 | `User` | `workspace` | Workspace signals: role | 							bind:value={selectedUserId} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 230 | 1 | `user` | `workspace` | Workspace signals: role | 							<option value="">Select a user...</option> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 231 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 							{#each members as member (member.userId)} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 232 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 								<option value={member.userId}> |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 233 | 2 | `user` | `workspace` | Workspace signals: role, member | 									{member.userName \|\| member.userEmail} |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 36 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			? useQuery(api.features.tags.index.listUserTags, () => { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 46 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userTags = $derived(tagsQuery?.data ?? []); |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 51 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	let selectedTagForSharing = $state<(typeof userTags)[0] \| null>(null); |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 54 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	function openShareModal(tag: (typeof userTags)[0]) { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 89 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					shared_from: 'user', |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 121 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		return userTags.filter( |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 126 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userTagsList = $derived(() => { |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 128 | 2 | `user` | `workspace` | Workspace signals: workspace | 		return userTags.filter((t) => !t.workspaceId \|\| t.ownershipType === 'user'); |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 156 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		{:else if userTagsList().length === 0 && organizationTags().length === 0} |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 179 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			{#if userTagsList().length > 0} |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 183 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						<span class="text-tertiary text-xs font-normal">({userTagsList().length})</span> |
| `src/routes/(authenticated)/w/[slug]/tags/+page.svelte` | 186 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						{#each userTagsList() as tag (tag._id)} |
| `src/routes/+layout.server.ts` | 6 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		user: locals.auth.user, |
| `src/routes/+layout.server.ts` | 13 | 1 | `user` | `workspace` | Workspace signals: workspace | 		activeWorkspace: locals.auth.user?.activeWorkspace |
| `src/routes/+layout.svelte` | 56 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (data.user) { |
| `src/routes/+layout.svelte` | 57 | 2 | `user` | `system_auth` | Auth signals: , userId | 			posthog.identify(data.user.userId, { |
| `src/routes/+layout.svelte` | 58 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 				email: data.user.email, |
| `src/routes/+layout.svelte` | 60 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 					data.user.firstName && data.user.lastName |
| `src/routes/+layout.svelte` | 61 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 						? `${data.user.firstName} ${data.user.lastName}` |
| `src/routes/+layout.svelte` | 62 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 						: data.user.email |
| `src/routes/auth/callback/+server.ts` | 45 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			primaryUserId |
| `src/routes/auth/callback/+server.ts` | 54 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ Authorization code exchanged, user:', authResponse.user.email); |
| `src/routes/auth/callback/+server.ts` | 56 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/callback/+server.ts` | 59 | 3 | `User, users` | `system_auth` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/callback/+server.ts` | 61 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 62 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 63 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/callback/+server.ts` | 64 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/callback/+server.ts` | 65 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			emailVerified: authResponse.user.email_verified ?? true |
| `src/routes/auth/callback/+server.ts` | 68 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/callback/+server.ts` | 76 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 		if (linkAccount && primaryUserId && primaryUserId !== convexUserId) { |
| `src/routes/auth/callback/+server.ts` | 78 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 			const existingUserId = event.locals.auth?.user?.userId; |
| `src/routes/auth/callback/+server.ts` | 79 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 			if (!existingSessionId \|\| !existingUserId \|\| existingUserId !== primaryUserId) { |
| `src/routes/auth/callback/+server.ts` | 84 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 				await convex.mutation(api.core.users.index.linkAccounts, { |
| `src/routes/auth/callback/+server.ts` | 86 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 					targetUserId: convexUserId |
| `src/routes/auth/callback/+server.ts` | 96 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/callback/+server.ts` | 97 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 103 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/callback/+server.ts` | 104 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/callback/+server.ts` | 105 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 106 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 107 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 108 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 110 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/callback/+server.ts` | 111 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/callback/+server.ts` | 112 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/callback/+server.ts` | 115 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/callback/+server.ts` | 131 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/callback/+server.ts` | 132 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 137 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/callback/+server.ts` | 138 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/callback/+server.ts` | 139 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 140 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 141 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 142 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 144 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/callback/+server.ts` | 145 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/callback/+server.ts` | 146 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/callback/+server.ts` | 156 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 					activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/callback/+server.ts` | 166 | 3 | `user` | `system_auth` | Auth-domain file pattern match | 					userId: event.locals.auth.user?.userId |
| `src/routes/auth/linked-sessions/+server.ts` | 6 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/linked-sessions/+server.ts` | 17 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 		hasUser: !!auth?.user, |
| `src/routes/auth/linked-sessions/+server.ts` | 18 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		currentUserId: auth?.user?.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 19 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 		currentUserEmail: auth?.user?.email |
| `src/routes/auth/linked-sessions/+server.ts` | 22 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/linked-sessions/+server.ts` | 34 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 		const linkedAccounts = await convex.query(api.core.users.index.listLinkedAccounts, { |
| `src/routes/auth/linked-sessions/+server.ts` | 40 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 				userId: a.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 48 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			userId: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 52 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			userEmail: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 53 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			userName?: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 66 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 69 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 				const sessionRecord = await getActiveSessionRecordForUser({ |
| `src/routes/auth/linked-sessions/+server.ts` | 71 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 					targetUserId: account.userId |
| `src/routes/auth/linked-sessions/+server.ts` | 74 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 89 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 100 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 111 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 115 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						userEmail: account.email ?? '', |
| `src/routes/auth/linked-sessions/+server.ts` | 116 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						userName: account.name ?? undefined, |
| `src/routes/auth/linked-sessions/+server.ts` | 128 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 135 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 142 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 152 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 				userId: s.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 153 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				email: s.userEmail, |
| `src/routes/auth/login/+server.ts` | 42 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('🔍 Authenticating user:', email); |
| `src/routes/auth/login/+server.ts` | 49 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/login/+server.ts` | 55 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/login/+server.ts` | 58 | 3 | `User, users` | `system_auth` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/login/+server.ts` | 60 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 61 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 62 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/login/+server.ts` | 63 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/login/+server.ts` | 64 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			emailVerified: authResponse.user.email_verified ?? true |
| `src/routes/auth/login/+server.ts` | 67 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/login/+server.ts` | 78 | 4 | `User, user, users` | `system_auth` | Auth-domain file pattern match | 			const primaryUserId = event.locals.auth?.user?.userId as Id<'users'> \| undefined; |
| `src/routes/auth/login/+server.ts` | 80 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			if (!primaryUserId) { |
| `src/routes/auth/login/+server.ts` | 81 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				console.error('❌ No primary user in session for linking'); |
| `src/routes/auth/login/+server.ts` | 96 | 3 | `User` | `system_auth` | Auth-domain file pattern match | 				console.log('🔗 Linking accounts:', { primaryUserId, linkedUserId: convexUserId }); |
| `src/routes/auth/login/+server.ts` | 99 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 				await convex.mutation(api.core.users.index.linkAccounts, { |
| `src/routes/auth/login/+server.ts` | 101 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 					targetUserId: convexUserId |
| `src/routes/auth/login/+server.ts` | 115 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/login/+server.ts` | 116 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 123 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 124 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 125 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 126 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 127 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 128 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 130 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 131 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 132 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 135 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					userAgent: event.request.headers.get('user-agent') ?? undefined |
| `src/routes/auth/login/+server.ts` | 144 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/login/+server.ts` | 145 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 150 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 151 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 152 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 153 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 154 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 155 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 157 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 158 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 159 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 205 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/login/+server.ts` | 206 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 211 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 212 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 213 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 214 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 215 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 216 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 218 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 219 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 220 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 232 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			console.log('🔍 User logged in from invite link, accepting invite:', inviteCode); |
| `src/routes/auth/login/+server.ts` | 289 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 					activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/login/+server.ts` | 297 | 3 | `user` | `system_auth` | Auth-domain file pattern match | 						userId: event.locals.auth.user?.userId |
| `src/routes/auth/redirect/+server.ts` | 23 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			activeWorkspaceId: locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/redirect/+server.ts` | 28 | 3 | `user` | `system_auth` | Auth-domain file pattern match | 			userId: locals.auth.user?.userId |
| `src/routes/auth/register/+server.ts` | 48 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			console.error('❌ Password contains email username:', emailLocalPart); |
| `src/routes/auth/register/+server.ts` | 58 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const { getUserByEmail } = await import('$lib/infrastructure/auth/server/workos'); |
| `src/routes/auth/register/+server.ts` | 59 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		const existingUser = await getUserByEmail(email); |
| `src/routes/auth/register/+server.ts` | 60 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		if (existingUser) { |
| `src/routes/auth/register/+server.ts` | 84 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') ?? undefined, |
| `src/routes/auth/register/register.test.ts` | 41 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'short'); |
| `src/routes/auth/register/register.test.ts` | 47 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'LongPass1!'); |
| `src/routes/auth/register/register.test.ts` | 52 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'VeryLongPassword123!'); |
| `src/routes/auth/register/register.test.ts` | 58 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should reject password containing full email username', () => { |
| `src/routes/auth/register/register.test.ts` | 64 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should reject password containing email username with alias', () => { |
| `src/routes/auth/register/register.test.ts` | 70 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should reject password containing email username regardless of case', () => { |
| `src/routes/auth/register/register.test.ts` | 76 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should reject password with email username in the middle', () => { |
| `src/routes/auth/register/register.test.ts` | 82 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should accept password that does not contain email username', () => { |
| `src/routes/auth/register/register.test.ts` | 87 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		it('should accept password when email username is less than 4 chars', () => { |
| `src/routes/auth/register/register.test.ts` | 101 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('user+test+alias@example.com', 'userpassword123'); |
| `src/routes/auth/register/register.test.ts` | 107 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('TestUser@Example.com', 'testuser123'); |
| `src/routes/auth/register/register.test.ts` | 113 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'C0mpl3x!P@ssw0rd'); |
| `src/routes/auth/resend-code/+server.ts` | 44 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') ?? undefined, |
| `src/routes/auth/restore/+server.ts` | 8 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/restore/+server.ts` | 17 | 3 | `User, user, users` | `system_auth` | Auth-domain file pattern match | 	const targetUserId = body.userId as Id<'users'> \| undefined; |
| `src/routes/auth/restore/+server.ts` | 19 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	if (!targetUserId) { |
| `src/routes/auth/restore/+server.ts` | 20 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return json({ error: 'Missing userId' }, { status: 400 }); |
| `src/routes/auth/restore/+server.ts` | 29 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		const targetSession = await getActiveSessionRecordForUser({ |
| `src/routes/auth/restore/+server.ts` | 31 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			targetUserId |
| `src/routes/auth/restore/+server.ts` | 45 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			convexUserId: targetSession.convexUserId, |
| `src/routes/auth/restore/+server.ts` | 46 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 			workosUserId: targetSession.workosUserId, |
| `src/routes/auth/restore/+server.ts` | 51 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: targetSession.userSnapshot |
| `src/routes/auth/restore/+server.ts` | 54 | 2 | `user, userS` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ Session restored for user:', targetSession.userSnapshot.email); |
| `src/routes/auth/session/+server.ts` | 7 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/session/+server.ts` | 21 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			user: auth.user, |
| `src/routes/auth/start/+server.ts` | 11 | 1 | `user` | `system_auth` | Auth-domain file pattern match | const WORKOS_AUTHORIZE_URL = 'https://api.workos.com/user_management/authorize'; |
| `src/routes/auth/start/+server.ts` | 103 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const primaryUserId = |
| `src/routes/auth/start/+server.ts` | 104 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		linkAccount && event.locals.auth.user?.userId |
| `src/routes/auth/start/+server.ts` | 105 | 3 | `user, users` | `system_auth` | Auth-domain file pattern match | 			? (event.locals.auth.user.userId as Id<'users'>) |
| `src/routes/auth/start/+server.ts` | 126 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		primaryUserId, |
| `src/routes/auth/start/+server.ts` | 128 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 		userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/switch/+server.ts` | 7 | 1 | `User` | `system_auth` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/switch/+server.ts` | 29 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 	if (!event.locals.auth.sessionId \|\| !event.locals.auth.user?.userId) { |
| `src/routes/auth/switch/+server.ts` | 48 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		!(payload as { targetUserId?: unknown }).targetUserId \|\| |
| `src/routes/auth/switch/+server.ts` | 49 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		typeof (payload as { targetUserId: unknown }).targetUserId !== 'string' |
| `src/routes/auth/switch/+server.ts` | 51 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return json({ error: 'Missing target user' }, { status: 400 }); |
| `src/routes/auth/switch/+server.ts` | 54 | 4 | `User, users` | `system_auth` | Auth-domain file pattern match | 	const targetUserId = (payload as { targetUserId: string }).targetUserId as Id<'users'>; |
| `src/routes/auth/switch/+server.ts` | 60 | 4 | `User, user, users` | `system_auth` | Auth-domain file pattern match | 	const currentUserId = event.locals.auth.user.userId as Id<'users'>; |
| `src/routes/auth/switch/+server.ts` | 62 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 	if (targetUserId === currentUserId) { |
| `src/routes/auth/switch/+server.ts` | 68 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				userId: currentUserId |
| `src/routes/auth/switch/+server.ts` | 81 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 	const linkStatus = await convex.query(api.core.users.index.validateAccountLink, { |
| `src/routes/auth/switch/+server.ts` | 83 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		targetUserId |
| `src/routes/auth/switch/+server.ts` | 97 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const targetSession = await getActiveSessionRecordForUser({ |
| `src/routes/auth/switch/+server.ts` | 99 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		targetUserId |
| `src/routes/auth/switch/+server.ts` | 116 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		convexUserId: targetSession.convexUserId, |
| `src/routes/auth/switch/+server.ts` | 117 | 2 | `User` | `system_auth` | Auth-domain file pattern match | 		workosUserId: targetSession.workosUserId, |
| `src/routes/auth/switch/+server.ts` | 122 | 2 | `userS` | `system_auth` | Auth-domain file pattern match | 		userSnapshot: targetSession.userSnapshot |
| `src/routes/auth/switch/+server.ts` | 133 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 			userId: currentUserId |
| `src/routes/auth/token/+server.ts` | 18 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	if (!locals.auth.sessionId \|\| !locals.auth.user) { |
| `src/routes/auth/unlink-account/+server.ts` | 21 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/unlink-account/+server.ts` | 31 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const body = (await request.json()) as { targetUserId?: string }; |
| `src/routes/auth/unlink-account/+server.ts` | 32 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	const { targetUserId } = body; |
| `src/routes/auth/unlink-account/+server.ts` | 34 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	if (!targetUserId) { |
| `src/routes/auth/unlink-account/+server.ts` | 35 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		return json({ error: 'Target user ID is required' }, { status: 400 }); |
| `src/routes/auth/unlink-account/+server.ts` | 44 | 1 | `users` | `system_auth` | Auth-domain file pattern match | 		await convex.mutation(api.core.users.index.unlinkAccounts, { |
| `src/routes/auth/unlink-account/+server.ts` | 46 | 3 | `User, users` | `system_auth` | Auth-domain file pattern match | 			targetUserId: targetUserId as Id<'users'> |
| `src/routes/auth/verify-email/+server.ts` | 6 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 	createUserWithPassword, |
| `src/routes/auth/verify-email/+server.ts` | 69 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('🔍 Creating WorkOS user:', email); |
| `src/routes/auth/verify-email/+server.ts` | 72 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		await createUserWithPassword({ |
| `src/routes/auth/verify-email/+server.ts` | 79 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ User created, now authenticating...'); |
| `src/routes/auth/verify-email/+server.ts` | 86 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/verify-email/+server.ts` | 89 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ User authenticated after registration'); |
| `src/routes/auth/verify-email/+server.ts` | 92 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/verify-email/+server.ts` | 94 | 3 | `User, users` | `system_auth` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/verify-email/+server.ts` | 96 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 97 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/verify-email/+server.ts` | 98 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/verify-email/+server.ts` | 99 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/verify-email/+server.ts` | 103 | 3 | `User, user` | `system_auth` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/verify-email/+server.ts` | 113 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/verify-email/+server.ts` | 114 | 2 | `User, user` | `system_auth` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 119 | 1 | `userS` | `system_auth` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/verify-email/+server.ts` | 120 | 2 | `user, User` | `system_auth` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/verify-email/+server.ts` | 121 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 122 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/verify-email/+server.ts` | 123 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/verify-email/+server.ts` | 124 | 1 | `user` | `system_auth` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/verify-email/+server.ts` | 126 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/verify-email/+server.ts` | 127 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/verify-email/+server.ts` | 128 | 2 | `user` | `system_auth` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/verify-email/+server.ts` | 143 | 1 | `User` | `system_auth` | Auth-domain file pattern match | 			console.log('🔍 User registered from invite link, accepting invite:', inviteCode); |
| `src/routes/dev-docs/[...path]/+error.svelte` | 120 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		user-select: none; |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 208 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userPermissions = await client.query( |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 209 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 215 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view'); |
| `src/routes/dev-docs/[...path]/+page.server.ts` | 360 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 			userAgent: undefined, // Could extract from event.request.headers.get('user-agent') if needed |
| `src/routes/dev-docs/+page.svelte` | 208 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			description: 'Strategy, metrics, user journeys', |
| `src/routes/dev-docs/all/+page.svelte` | 65 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					description: 'User archetypes and their core jobs', |
| `src/routes/dev-docs/all/+page.svelte` | 118 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 					title: 'User Journeys', |
| `src/routes/dev-docs/all/+page.svelte` | 120 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					href: '/dev-docs/2-areas/user-journeys' |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 18 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const userPermissions = await client.query( |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 19 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		api.infrastructure.rbac.permissions.getUserPermissionsQuery, |
| `src/routes/marketing-docs/[...path]/+page.server.ts` | 25 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view'); |
| `src/routes/settings/+page.svelte` | 49 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 	type UserSettings = { |
| `src/routes/settings/+page.svelte` | 51 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId: string; |
| `src/routes/settings/+page.svelte` | 67 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	const isAuthenticated = true; // User is always authenticated in this route (protected by server) |
| `src/routes/settings/+page.svelte` | 109 | 2 | `UserS` | `unknown` | No strong auth/workspace signals detected | 				getUserSettings: makeFunctionReference('settings:getUserSettings') as FunctionReference< |
| `src/routes/settings/+page.svelte` | 121 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/settings/+page.svelte` | 129 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/settings/+page.svelte` | 135 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 					Id<'userSettings'> |
| `src/routes/settings/+page.svelte` | 139 | 1 | `users` | `system_auth` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/settings/+page.svelte` | 142 | 1 | `users` | `system_auth` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/settings/+page.svelte` | 178 | 2 | `userS, UserS` | `unknown` | No strong auth/workspace signals detected | 	let _userSettings: UserSettings \| null = $state(null); |
| `src/routes/settings/+page.svelte` | 203 | 1 | `UserS` | `unknown` | No strong auth/workspace signals detected | 			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, { |
| `src/routes/settings/+page.svelte` | 210 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 				_userSettings = { |
| `src/routes/settings/+page.svelte` | 212 | 1 | `user` | `system_auth` | Auth signals: , userId | 					userId: '', // Not needed for display |
| `src/routes/settings/+page.svelte` | 297 | 1 | `User` | `workspace` | Workspace signals: person/people | 	let _orgReadwiseApiKey = $state(''); // User's personal Readwise for org imports |
| `src/routes/settings/+page.svelte` | 298 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	let _isOrgAdmin = $state(false); // Whether user can edit org settings (currently unused, reserved for future org settings) |
| `src/routes/settings/+page.svelte` | 759 | 1 | `User` | `workspace` | Workspace signals: person/people | 												👤 Personal (User-owned) |
| `src/routes/settings/permissions-test/+page.svelte` | 14 | 3 | `user` | `system_auth` | Auth signals: , userId | 	const userId = $derived($page.data.user?.userId); |
| `src/routes/settings/permissions-test/+page.svelte` | 44 | 4 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 		userId: () => (userId ? (userId as Id<'users'>) : null), |
| `src/routes/settings/permissions-test/+page.svelte` | 62 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (!convexClient \|\| !orgId \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 90 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 	async function testInviteUser() { |
| `src/routes/settings/permissions-test/+page.svelte` | 92 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (!convexClient \|\| !orgId \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 97 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const loadingToastId = toast.loading('Inviting user...'); |
| `src/routes/settings/permissions-test/+page.svelte` | 111 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				toast.success('✅ User invited successfully', { id: loadingToastId }); |
| `src/routes/settings/permissions-test/+page.svelte` | 122 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (!convexClient \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 123 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			toast.error('User not authenticated'); |
| `src/routes/settings/permissions-test/+page.svelte` | 134 | 2 | `users, User` | `unknown` | No strong auth/workspace signals detected | 			await convexClient.mutation(api.core.users.index.updateUserProfile, { |
| `src/routes/settings/permissions-test/+page.svelte` | 136 | 3 | `User, user, users` | `system_auth` | Auth signals: Convex users id type, userId | 				targetUserId: userId as Id<'users'>, |
| `src/routes/settings/permissions-test/+page.svelte` | 138 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				lastName: 'User' |
| `src/routes/settings/permissions-test/+page.svelte` | 170 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			Test and verify the RBAC permission system with your current user account |
| `src/routes/settings/permissions-test/+page.svelte` | 189 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				<dt class="text-label text-secondary">User ID</dt> |
| `src/routes/settings/permissions-test/+page.svelte` | 190 | 1 | `user` | `system_auth` | Auth signals: , userId | 				<dd class="font-code text-body text-primary">{userId ?? 'Not logged in'}</dd> |
| `src/routes/settings/permissions-test/+page.svelte` | 239 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				requires="users.invite" |
| `src/routes/settings/permissions-test/+page.svelte` | 242 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				onclick={testInviteUser} |
| `src/routes/settings/permissions-test/+page.svelte` | 244 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				Invite User |
| `src/routes/settings/permissions-test/+page.svelte` | 247 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				requires="users.manage-profile" |
| `src/routes/settings/permissions-test/+page.svelte` | 296 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				<h3 class="text-label text-secondary mb-2 font-semibold">Can invite users?</h3> |
| `src/routes/settings/permissions-test/+page.svelte` | 297 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 				<PermissionGate can="users.invite" {permissions}> |
| `src/routes/settings/permissions-test/+page.svelte` | 299 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 						✅ You have permission to invite users |
| `src/routes/settings/permissions-test/+page.svelte` | 303 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 							❌ You don't have permission to invite users |
| `src/routes/settings/permissions-test/+page.svelte` | 333 | 2 | `user, USER` | `system_auth` | Auth signals: , userId | 							>npx convex run rbac/setupAdmin:setupAdmin '{'{'}userId:"YOUR_USER_ID"}'</code |
| `src/routes/settings/permissions-test/+page.svelte` | 341 | 1 | `USER` | `unknown` | No strong auth/workspace signals detected | 					<code class="rounded-card bg-surface px-1 py-0.5 text-xs">YOUR_USER_ID</code> with your actual |
| `src/routes/settings/permissions-test/+page.svelte` | 342 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 					user ID shown in "Current Status" above. |
| `tests/composables/fixtures/TestComponent.svelte` | 23 | 2 | `user` | `system_auth` | Auth signals: , userId | 		userId: userIdProp = () => undefined, |
| `tests/composables/fixtures/TestComponent.svelte` | 29 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId?: () => string \| undefined; |
| `tests/composables/fixtures/TestComponent.svelte` | 38 | 2 | `user` | `system_auth` | Auth signals: , userId | 	const userId = () => userIdProp(); |
| `tests/composables/fixtures/TestComponent.svelte` | 43 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId, |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 12 | 1 | `user` | `system_auth` | Auth signals: , userId | export function createMockLocalStorage(userId?: string): Storage { |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 16 | 2 | `user` | `system_auth` | Auth signals: , userId | 		return userId ? `${key}_${userId}` : key; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 34 | 2 | `user` | `system_auth` | Auth signals: , userId | 				if (!userId \|\| key.endsWith(`_${userId}`)) { |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 57 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId?: string; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 61 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const { userId, urlSearch = '' } = options; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 64 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const mockStorage = createMockLocalStorage(userId); |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 121 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			invitedBy: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 122 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			invitedByName: 'Test User', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 196 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 207 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 219 | 2 | `user` | `system_auth` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/convex/integration/invariants.integration.test.ts` | 33 | 1 | `user` | `system_auth` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `tests/convex/integration/invariants.integration.test.ts` | 34 | 1 | `users` | `system_auth` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `tests/convex/integration/invariants.integration.test.ts` | 39 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				lastName: 'User', |
| `tests/convex/integration/invariants.integration.test.ts` | 40 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				name: 'Invariant User', |
| `tests/convex/integration/invariants.integration.test.ts` | 49 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/proposals.consent.test.ts` | 23 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, proposal | 	getPersonIdForUser |
| `tests/convex/integration/proposals.consent.test.ts` | 30 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(1) signals | 	userId: Id<'users'> |
| `tests/convex/integration/proposals.consent.test.ts` | 37 | 1 | `user` | `workspace` | Workspace signals: workspace, proposal | 				.withIndex('by_workspace_user', (q) => |
| `tests/convex/integration/proposals.consent.test.ts` | 38 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 					q.eq('workspaceId', workspaceId).eq('userId', userId) |
| `tests/convex/integration/proposals.consent.test.ts` | 41 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(4) signals | 		const personId = (person?._id ?? userId) as Id<'people'>; |
| `tests/convex/integration/proposals.consent.test.ts` | 74 | 1 | `user` | `workspace` | Workspace signals: circle, role, proposal | 		await ctx.db.insert('userCircleRoles', { |
| `tests/convex/integration/proposals.consent.test.ts` | 87 | 2 | `user, users` | `unknown` | Mixed auth(2) + workspace(2) signals | 	const cleanupQueue: Array<{ userId?: Id<'users'>; orgId?: Id<'workspaces'> }> = []; |
| `tests/convex/integration/proposals.consent.test.ts` | 92 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			if (item.userId) { |
| `tests/convex/integration/proposals.consent.test.ts` | 93 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				await cleanupTestData(t, item.userId); |
| `tests/convex/integration/proposals.consent.test.ts` | 109 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 111 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 114 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 175 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 177 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 180 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 223 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 225 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 228 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 282 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 283 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 289 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 337 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 377 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 378 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 389 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 437 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 476 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 478 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); |
| `tests/convex/integration/proposals.consent.test.ts` | 481 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 547 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 548 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 559 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 606 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 641 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 643 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 			await createTestOrganizationMember(t, orgId, userId, 'member'); // Regular member, not admin |
| `tests/convex/integration/proposals.consent.test.ts` | 644 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			const personId = await getPersonIdForUser(t, orgId, userId); |
| `tests/convex/integration/proposals.consent.test.ts` | 647 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 673 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 674 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 680 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 708 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 709 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 715 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 767 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 768 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 769 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 777 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				{ userId: creatorId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 778 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				{ userId: recorderId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 779 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 				{ userId: otherId }, |
| `tests/convex/integration/proposals.consent.test.ts` | 826 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 850 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 851 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: otherSessionId, userId: otherId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 857 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: otherId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 920 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 921 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 925 | 1 | `User` | `workspace` | Workspace signals: personId, person/people, proposal | 			const recorderPersonId = await getPersonIdForUser(t, orgId, recorderId); |
| `tests/convex/integration/proposals.consent.test.ts` | 928 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 975 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/proposals.consent.test.ts` | 1019 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: creatorSessionId, userId: creatorId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 1020 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 			const { sessionId: recorderSessionId, userId: recorderId } = await createTestSession(t); |
| `tests/convex/integration/proposals.consent.test.ts` | 1026 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			cleanupQueue.push({ userId: creatorId }, { userId: recorderId }, { orgId }); |
| `tests/convex/integration/proposals.consent.test.ts` | 1079 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					userId: recorderId, |
| `tests/convex/integration/rbac.integration.test.ts` | 17 | 1 | `User` | `workspace` | Workspace signals: role | 	assignRoleToUser, |
| `tests/convex/integration/rbac.integration.test.ts` | 26 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `tests/convex/integration/rbac.integration.test.ts` | 31 | 1 | `user` | `system_auth` | Auth signals: , userId | 			if (item.userId) { |
| `tests/convex/integration/rbac.integration.test.ts` | 32 | 1 | `user` | `system_auth` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `tests/convex/integration/rbac.integration.test.ts` | 43 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 44 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 61 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 62 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 81 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 82 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 84 | 2 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 		const permId = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 95 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		expect(result?.permissions[0].slug).toBe('users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 114 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId: adminUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 119 | 2 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 		const viewPermission = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 122 | 2 | `User` | `workspace` | Workspace signals: role | 		await assignRoleToUser(t, adminUserId, adminRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 124 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 128 | 2 | `User, users` | `workspace` | Workspace signals: workspace | 			return await hasPermission(ctx, adminUserId, 'users.view', { workspaceId: orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 134 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should validate hasPermission with "own" scope (user editing own profile)', async () => { |
| `tests/convex/integration/rbac.integration.test.ts` | 136 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 139 | 3 | `user, User` | `workspace` | Workspace signals: role | 		const userRole = await createTestRole(t, 'user', 'User'); |
| `tests/convex/integration/rbac.integration.test.ts` | 142 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 145 | 1 | `user` | `workspace` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/rbac.integration.test.ts` | 146 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 148 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 152 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 153 | 1 | `user` | `system_auth` | Auth signals: , userId | 				resourceOwnerId: userId |
| `tests/convex/integration/rbac.integration.test.ts` | 160 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId: otherUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 161 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: otherUserId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 164 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 165 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId |
| `tests/convex/integration/rbac.integration.test.ts` | 174 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId: teamLeadUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 194 | 2 | `User` | `workspace` | Workspace signals: circle, role | 		await assignRoleToUser(t, teamLeadUserId, circleLeadRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 196 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId: teamLeadUserId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 200 | 1 | `User` | `workspace` | Workspace signals: circle | 			return await hasPermission(ctx, teamLeadUserId, 'circles.update', { circleId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 213 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 214 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 219 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 				return await requirePermission(ctx, userId, 'users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 224 | 1 | `User` | `workspace` | Workspace signals: role | 	it('should resolve multi-role permissions (User + Team Lead)', async () => { |
| `tests/convex/integration/rbac.integration.test.ts` | 226 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 230 | 3 | `user, User` | `workspace` | Workspace signals: role | 		const userRole = await createTestRole(t, 'user', 'User'); |
| `tests/convex/integration/rbac.integration.test.ts` | 233 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 236 | 1 | `user` | `workspace` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/rbac.integration.test.ts` | 237 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 241 | 2 | `users, Users` | `unknown` | No strong auth/workspace signals detected | 		const viewPermission = await createTestPermission(t, 'users.view', 'View Users'); |
| `tests/convex/integration/rbac.integration.test.ts` | 244 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, teamLeadRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 246 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 250 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 251 | 1 | `user` | `system_auth` | Auth signals: , userId | 				resourceOwnerId: userId |
| `tests/convex/integration/rbac.integration.test.ts` | 255 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		const canViewUsers = await t.run(async (ctx) => { |
| `tests/convex/integration/rbac.integration.test.ts` | 256 | 2 | `user, users` | `unknown` | Mixed auth(1) + workspace(1) signals | 			return await hasPermission(ctx, userId, 'users.view', { workspaceId: orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 260 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | 		expect(canViewUsers).toBe(true); |
| `tests/convex/integration/rbac.integration.test.ts` | 263 | 1 | `user` | `workspace` | Workspace signals: role | 	it('should deny permission when user has no roles', async () => { |
| `tests/convex/integration/rbac.integration.test.ts` | 265 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 266 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 269 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 277 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 278 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		const { userId: otherUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 281 | 3 | `user, User` | `workspace` | Workspace signals: role | 		const userRole = await createTestRole(t, 'user', 'User'); |
| `tests/convex/integration/rbac.integration.test.ts` | 284 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/rbac.integration.test.ts` | 287 | 1 | `user` | `workspace` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/rbac.integration.test.ts` | 288 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 290 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push({ userId }, { userId: otherUserId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 294 | 2 | `user, users` | `system_auth` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 295 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				resourceOwnerId: otherUserId |
| `tests/convex/integration/setup.ts` | 24 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 32 | 1 | `user` | `system_auth` | Auth signals: , userId | 	const userId = await t.run(async (ctx) => { |
| `tests/convex/integration/setup.ts` | 33 | 1 | `users` | `system_auth` | Auth signals: insert users table | 		return await ctx.db.insert('users', { |
| `tests/convex/integration/setup.ts` | 36 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			name: 'Test User', |
| `tests/convex/integration/setup.ts` | 38 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			lastName: 'User', |
| `tests/convex/integration/setup.ts` | 51 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 			convexUserId: userId, |
| `tests/convex/integration/setup.ts` | 52 | 1 | `User` | `system_auth` | Auth signals: WorkOS | 			workosUserId: `test_workos_${uniqueId}`, |
| `tests/convex/integration/setup.ts` | 60 | 1 | `userS` | `unknown` | No strong auth/workspace signals detected | 			userSnapshot: { |
| `tests/convex/integration/setup.ts` | 61 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/setup.ts` | 65 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				lastName: 'User', |
| `tests/convex/integration/setup.ts` | 66 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 				name: 'Test User' |
| `tests/convex/integration/setup.ts` | 73 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await createTestOrganizationMember(t, workspaceId, userId, 'owner'); |
| `tests/convex/integration/setup.ts` | 74 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const personId = await getPersonIdForUser(t, workspaceId, userId); |
| `tests/convex/integration/setup.ts` | 76 | 1 | `user` | `unknown` | Mixed auth(2) + workspace(3) signals | 	return { sessionId, userId, workspaceId, personId }; |
| `tests/convex/integration/setup.ts` | 84 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 89 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 	await createTestOrganizationMember(t, resolvedWorkspaceId, userId, 'owner'); |
| `tests/convex/integration/setup.ts` | 90 | 2 | `User, user` | `unknown` | Mixed auth(1) + workspace(3) signals | 	const personId = await getPersonIdForUser(t, resolvedWorkspaceId, userId); |
| `tests/convex/integration/setup.ts` | 97 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			ownershipType: 'user', |
| `tests/convex/integration/setup.ts` | 110 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 116 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `tests/convex/integration/setup.ts` | 151 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 159 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 166 | 2 | `user` | `system_auth` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `tests/convex/integration/setup.ts` | 169 | 1 | `user` | `system_auth` | Auth signals: , userId | 			userId, |
| `tests/convex/integration/setup.ts` | 170 | 3 | `user` | `system_auth` | Auth signals: , userId | 			email: (user as any)?.email ?? `user-${userId}@example.com`, |
| `tests/convex/integration/setup.ts` | 171 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 			displayName: (user as any)?.name ?? 'Test User', |
| `tests/convex/integration/setup.ts` | 184 | 1 | `User` | `workspace` | Workspace signals: personId, person/people | export async function getPersonIdForUser( |
| `tests/convex/integration/setup.ts` | 187 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `tests/convex/integration/setup.ts` | 192 | 3 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 195 | 1 | `user` | `workspace` | Workspace signals: person/people, workspace | 			throw new Error('Person not found for user in workspace'); |
| `tests/convex/integration/setup.ts` | 207 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	createdBy: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 228 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 	invitedBy: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 231 | 2 | `User, users` | `system_auth` | Auth signals: Convex users id type | 		invitedUserId?: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 241 | 2 | `User` | `unknown` | No strong auth/workspace signals detected | 			invitedUserId: options?.invitedUserId, |
| `tests/convex/integration/setup.ts` | 299 | 1 | `User` | `workspace` | Workspace signals: role | export async function assignRoleToUser( |
| `tests/convex/integration/setup.ts` | 301 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 306 | 1 | `users` | `system_auth` | Auth signals: Convex users id type | 		assignedBy?: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 320 | 3 | `user` | `system_auth` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 325 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 				throw new Error(`Person not found for user ${userId} in workspace ${context.workspaceId}`); |
| `tests/convex/integration/setup.ts` | 333 | 2 | `user` | `system_auth` | Auth signals: , userId | 					.withIndex('by_user', (q) => q.eq('userId', context.assignedBy!)) |
| `tests/convex/integration/setup.ts` | 349 | 1 | `user` | `system_auth` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/setup.ts` | 352 | 1 | `user` | `system_auth` | Auth signals: , userId | 				grantedBy: context?.assignedBy ?? userId // Default to self-assignment for tests |
| `tests/convex/integration/setup.ts` | 380 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | export async function cleanupTestData(t: TestConvex<any>, userId?: Id<'users'>): Promise<void> { |
| `tests/convex/integration/setup.ts` | 381 | 1 | `user` | `system_auth` | Auth signals: , userId | 	if (!userId) return; |
| `tests/convex/integration/setup.ts` | 387 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 			.filter((q) => q.eq(q.field('convexUserId'), userId)) |
| `tests/convex/integration/setup.ts` | 396 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 405 | 1 | `user` | `system_auth` | Auth signals: , userId | 			.filter((q) => q.eq(q.field('invitedBy'), userId)) |
| `tests/convex/integration/setup.ts` | 414 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', userId)) |
| `tests/convex/integration/setup.ts` | 423 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 449 | 3 | `user` | `system_auth` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 458 | 3 | `user, User` | `system_auth` | Auth signals: , userId | 			.withIndex('by_convex_user', (q) => q.eq('convexUserId', userId)) |
| `tests/convex/integration/setup.ts` | 465 | 2 | `user` | `system_auth` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `tests/convex/integration/setup.ts` | 466 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		if (user) { |
| `tests/convex/integration/setup.ts` | 467 | 1 | `user` | `system_auth` | Auth signals: , userId | 			await ctx.db.delete(userId); |
| `tests/convex/integration/setup.ts` | 500 | 2 | `user, users` | `system_auth` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `tests/convex/integration/setup.ts` | 509 | 1 | `user` | `workspace` | Workspace signals: workspace | 				.withIndex('by_workspace_user', (q) => |
| `tests/convex/integration/setup.ts` | 510 | 2 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 					q.eq('workspaceId', workspaceId).eq('userId', userId) |
| `tests/convex/integration/setup.ts` | 516 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(3) signals | 			personId: person?._id ?? (userId as unknown as Id<'people'>), |
| `tests/convex/integration/tags.integration.test.ts` | 15 | 1 | `user` | `system_auth` | Auth signals: , userId | 	let userId: any; |
| `tests/convex/integration/tags.integration.test.ts` | 19 | 1 | `user` | `system_auth` | Auth signals: , userId | 		if (userId) { |
| `tests/convex/integration/tags.integration.test.ts` | 21 | 1 | `user` | `system_auth` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `tests/convex/integration/tags.integration.test.ts` | 25 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should list user tags without type errors', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 27 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 28 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 31 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'Test Tag 1', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 34 | 1 | `User` | `system_auth` | Auth signals: session | 		const tags = await t.query(api.features.tags.index.listUserTags, { sessionId }); |
| `tests/convex/integration/tags.integration.test.ts` | 41 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should list user tags with ownership info', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 43 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 44 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 47 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(2) signals | 		await createTestTag(t, userId, 'Personal Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 50 | 1 | `User` | `system_auth` | Auth signals: session | 		const tags = await t.query(api.features.tags.index.listUserTags, { sessionId }); |
| `tests/convex/integration/tags.integration.test.ts` | 61 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 62 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 65 | 2 | `user, User` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'User Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 68 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 79 | 2 | `user, User` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId, userId: testUserId, workspaceId } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 80 | 2 | `user, User` | `system_auth` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 83 | 1 | `user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await createTestTag(t, userId, 'Detail Tag', workspaceId); |
| `tests/convex/integration/tags.integration.test.ts` | 86 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 		const tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 100 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 106 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 	it('should enforce user isolation', async () => { |
| `tests/convex/integration/tags.integration.test.ts` | 110 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId: _session1, userId: user1, workspaceId: ws1 } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 111 | 2 | `user` | `unknown` | Mixed auth(2) + workspace(1) signals | 		const { sessionId: session2, userId: user2, workspaceId: ws2 } = await createTestSession(t); |
| `tests/convex/integration/tags.integration.test.ts` | 114 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		await createTestTag(t, user1, 'User 1 Tag', ws1); |
| `tests/convex/integration/tags.integration.test.ts` | 117 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		const user2Tags = await t.query(api.features.tags.index.listUserTags, { |
| `tests/convex/integration/tags.integration.test.ts` | 121 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user2Tags.length).toBe(0); |
| `tests/convex/integration/tags.integration.test.ts` | 124 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user1); |
| `tests/convex/integration/tags.integration.test.ts` | 125 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		await cleanupTestData(t, user2); |
| `tests/convex/integration/tags.integration.test.ts` | 126 | 1 | `user` | `system_auth` | Auth signals: , userId | 		userId = null; // Prevent double cleanup |
| `tests/convex/integration/users.integration.test.ts` | 17 | 1 | `User` | `workspace` | Workspace signals: role | 	assignRoleToUser, |
| `tests/convex/integration/users.integration.test.ts` | 21 | 1 | `Users` | `unknown` | No strong auth/workspace signals detected | describe('Users Integration Tests', () => { |
| `tests/convex/integration/users.integration.test.ts` | 26 | 1 | `user` | `system_auth` | Auth signals: , userId | 		for (const userId of cleanupQueue) { |
| `tests/convex/integration/users.integration.test.ts` | 27 | 1 | `user` | `system_auth` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `tests/convex/integration/users.integration.test.ts` | 32 | 2 | `user` | `system_auth` | Auth signals: WorkOS | 	it('should sync user from WorkOS - create new user', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 35 | 3 | `user, users, User` | `system_auth` | Auth signals: WorkOS, userId | 		const userId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 37 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 			email: 'newuser@example.com', |
| `tests/convex/integration/users.integration.test.ts` | 39 | 1 | `User` | `unknown` | No strong auth/workspace signals detected | 			lastName: 'User', |
| `tests/convex/integration/users.integration.test.ts` | 43 | 1 | `user` | `system_auth` | Auth signals: , userId | 		expect(userId).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 44 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 47 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 48 | 1 | `user` | `system_auth` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 51 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 52 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.email).toBe('newuser@example.com'); |
| `tests/convex/integration/users.integration.test.ts` | 53 | 2 | `user, User` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('Test User'); |
| `tests/convex/integration/users.integration.test.ts` | 56 | 2 | `user` | `system_auth` | Auth signals: WorkOS | 	it('should sync user from WorkOS - update existing user', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 60 | 3 | `user, users, User` | `system_auth` | Auth signals: WorkOS, userId | 		const userId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 67 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 70 | 3 | `User, users` | `system_auth` | Auth signals: WorkOS | 		const updatedUserId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 77 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 		expect(updatedUserId).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 79 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 80 | 1 | `user` | `system_auth` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 83 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.email).toBe('updated@example.com'); |
| `tests/convex/integration/users.integration.test.ts` | 84 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('New Name'); |
| `tests/convex/integration/users.integration.test.ts` | 87 | 1 | `user` | `system_auth` | Auth signals: session | 	it('should get user by ID with sessionId validation', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 89 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 90 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 93 | 3 | `user, users, User` | `system_auth` | Auth signals: session | 		const user = await t.query(api.core.users.index.getUserById, { sessionId }); |
| `tests/convex/integration/users.integration.test.ts` | 95 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 96 | 2 | `user` | `system_auth` | Auth signals: , userId | 		expect(user?._id).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 99 | 1 | `user` | `system_auth` | Auth signals: session | 	it('should get current user with sessionId validation', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 101 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 102 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 104 | 3 | `user, users, User` | `system_auth` | Auth signals: session | 		const user = await t.query(api.core.users.index.getCurrentUser, { sessionId }); |
| `tests/convex/integration/users.integration.test.ts` | 106 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 107 | 2 | `user` | `system_auth` | Auth signals: , userId | 		expect(user?._id).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 112 | 1 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 115 | 3 | `user, User` | `workspace` | Workspace signals: role | 		const userRole = await createTestRole(t, 'user', 'User'); |
| `tests/convex/integration/users.integration.test.ts` | 118 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			'users.manage-profile', |
| `tests/convex/integration/users.integration.test.ts` | 121 | 1 | `user` | `workspace` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/users.integration.test.ts` | 122 | 3 | `User, user` | `unknown` | Mixed auth(1) + workspace(1) signals | 		await assignRoleToUser(t, userId, userRole); |
| `tests/convex/integration/users.integration.test.ts` | 124 | 1 | `user` | `system_auth` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 127 | 2 | `users, User` | `unknown` | No strong auth/workspace signals detected | 		const result = await t.mutation(api.core.users.index.updateUserProfile, { |
| `tests/convex/integration/users.integration.test.ts` | 129 | 2 | `User, user` | `system_auth` | Auth signals: , userId | 			targetUserId: userId, |
| `tests/convex/integration/users.integration.test.ts` | 136 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		const user = await t.run(async (ctx) => { |
| `tests/convex/integration/users.integration.test.ts` | 137 | 1 | `user` | `system_auth` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 140 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.firstName).toBe('Updated'); |
| `tests/convex/integration/users.integration.test.ts` | 141 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.lastName).toBe('Name'); |
| `tests/convex/integration/users.integration.test.ts` | 142 | 1 | `user` | `unknown` | No strong auth/workspace signals detected | 		expect(user?.name).toBe('Updated Name'); |
| `tests/convex/integration/users.integration.test.ts` | 147 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 148 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 150 | 2 | `user` | `unknown` | No strong auth/workspace signals detected | 		cleanupQueue.push(user1, user2); |
| `tests/convex/integration/users.integration.test.ts` | 152 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		const result = await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 154 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 			targetUserId: user2, |
| `tests/convex/integration/users.integration.test.ts` | 161 | 1 | `users` | `system_auth` | Auth signals: session | 		const links1 = await t.query(api.core.users.index.listLinkedAccounts, { sessionId: session1 }); |
| `tests/convex/integration/users.integration.test.ts` | 163 | 2 | `user` | `system_auth` | Auth signals: , userId | 		expect(links1[0].userId).toBe(user2); |
| `tests/convex/integration/users.integration.test.ts` | 165 | 1 | `users` | `system_auth` | Auth signals: session | 		const links2 = await t.query(api.core.users.index.listLinkedAccounts, { sessionId: session2 }); |
| `tests/convex/integration/users.integration.test.ts` | 167 | 2 | `user` | `system_auth` | Auth signals: , userId | 		expect(links2[0].userId).toBe(user1); |
| `tests/convex/integration/users.integration.test.ts` | 172 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: sessionA, userId: userA } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 173 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: sessionB, userId: userB } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 174 | 2 | `user` | `system_auth` | Auth signals: session, userId | 		const { sessionId: sessionC, userId: userC } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 176 | 3 | `user` | `unknown` | No strong auth/workspace signals detected | 		cleanupQueue.push(userA, userB, userC); |
| `tests/convex/integration/users.integration.test.ts` | 179 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 181 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 			targetUserId: userB |
| `tests/convex/integration/users.integration.test.ts` | 185 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 187 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 			targetUserId: userC |
| `tests/convex/integration/users.integration.test.ts` | 191 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 		const validation = await t.query(api.core.users.index.validateAccountLink, { |
| `tests/convex/integration/users.integration.test.ts` | 193 | 2 | `User, user` | `unknown` | No strong auth/workspace signals detected | 			targetUserId: userC |
| `tests/convex/integration/users.integration.test.ts` | 202 | 2 | `users, user` | `system_auth` | Auth signals: session, userId | 		const users: Array<{ sessionId: string; userId: string }> = []; |
| `tests/convex/integration/users.integration.test.ts` | 206 | 1 | `user` | `system_auth` | Auth signals: session, userId | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 207 | 2 | `users, user` | `system_auth` | Auth signals: session, userId | 			users.push({ sessionId, userId }); |
| `tests/convex/integration/users.integration.test.ts` | 208 | 1 | `user` | `system_auth` | Auth signals: , userId | 			cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 213 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			await t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 214 | 1 | `users` | `system_auth` | Auth signals: session | 				sessionId: users[i].sessionId, |
| `tests/convex/integration/users.integration.test.ts` | 215 | 3 | `User, users, user` | `system_auth` | Auth signals: , userId | 				targetUserId: users[i + 1].userId |
| `tests/convex/integration/users.integration.test.ts` | 221 | 1 | `users` | `unknown` | No strong auth/workspace signals detected | 			t.mutation(api.core.users.index.linkAccounts, { |
| `tests/convex/integration/users.integration.test.ts` | 222 | 1 | `users` | `system_auth` | Auth signals: session | 				sessionId: users[9].sessionId, |
| `tests/convex/integration/users.integration.test.ts` | 223 | 3 | `User, users, user` | `system_auth` | Auth signals: , userId | 				targetUserId: users[10].userId |
| `tests/convex/integration/users.integration.test.ts` | 232 | 2 | `users, User` | `unknown` | No strong auth/workspace signals detected | 			t.query(api.core.users.index.getCurrentUser, { |
| `tests/convex/sessionValidation.test.ts` | 14 | 1 | `User` | `system_auth` | Auth signals: session | 	validateSessionAndGetUserId, |
| `tests/convex/sessionValidation.test.ts` | 45 | 1 | `User` | `system_auth` | Auth signals: session | describe('validateSessionAndGetUserId', () => { |
| `tests/convex/sessionValidation.test.ts` | 47 | 3 | `User, user, users` | `system_auth` | Auth signals: session, Convex users id type | 	const validUserId = 'user_abc123' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 50 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	it('should return userId for valid session', async () => { |
| `tests/convex/sessionValidation.test.ts` | 53 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 60 | 1 | `User` | `system_auth` | Auth signals: session | 		const result = await validateSessionAndGetUserId(ctx, validSessionId); |
| `tests/convex/sessionValidation.test.ts` | 62 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		expect(result.userId).toBe(validUserId); |
| `tests/convex/sessionValidation.test.ts` | 69 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 77 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 85 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 93 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 101 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 109 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 117 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'nonexistent_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 124 | 3 | `User, user, users` | `system_auth` | Auth signals: session, Convex users id type | 	const validUserId = 'user_deprecated123' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 129 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 136 | 1 | `User` | `system_auth` | Auth signals: session | 		const result = await validateSession(ctx, validUserId); |
| `tests/convex/sessionValidation.test.ts` | 139 | 2 | `User` | `system_auth` | Auth signals: session | 		expect(result.convexUserId).toBe(validUserId); |
| `tests/convex/sessionValidation.test.ts` | 144 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 152 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSession(ctx, validUserId)).rejects.toThrow('Session not found'); |
| `tests/convex/sessionValidation.test.ts` | 158 | 3 | `User, user, users` | `system_auth` | Auth signals: session, Convex users id type | 	const attackerUserId = 'user_attacker' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 159 | 3 | `User, user, users` | `system_auth` | Auth signals: session, Convex users id type | 	const victimUserId = 'user_victim' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 162 | 1 | `user` | `system_auth` | Auth signals: session, userId | 	it('should prevent attacker from accessing victim data by passing victim userId', async () => { |
| `tests/convex/sessionValidation.test.ts` | 166 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: attackerUserId, |
| `tests/convex/sessionValidation.test.ts` | 176 | 1 | `User` | `system_auth` | Auth signals: session | 		const result = await validateSessionAndGetUserId(ctx, attackerSessionId); |
| `tests/convex/sessionValidation.test.ts` | 179 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		expect(result.userId).toBe(attackerUserId); |
| `tests/convex/sessionValidation.test.ts` | 181 | 2 | `user, User` | `system_auth` | Auth signals: session, userId | 		expect(result.userId).not.toBe(victimUserId); |
| `tests/convex/sessionValidation.test.ts` | 188 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'forged_session_id')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 197 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: victimUserId, |
| `tests/convex/sessionValidation.test.ts` | 205 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 214 | 2 | `User` | `system_auth` | Auth signals: session | 			convexUserId: victimUserId, |
| `tests/convex/sessionValidation.test.ts` | 222 | 1 | `User` | `system_auth` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 231 | 3 | `user, users` | `system_auth` | Auth signals: session, Convex users id type, userId | 		const userId = 'perf_test_user' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 236 | 2 | `User, user` | `system_auth` | Auth signals: session, userId | 			convexUserId: userId, |
| `tests/convex/sessionValidation.test.ts` | 257 | 1 | `User` | `system_auth` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, sessionId); |

## Workspace-scoped tokens containing "user" (candidate renames)

This list is derived from lines classified as `workspace` and extracts identifier-like tokens containing `user`/`users` (case-insensitive).
It is intended to drive a systematic rename plan toward **0 workspace-scoped `user` terminology**. Tokens in the exception allowlist are omitted.

| Token | Count | Recommendation | Example location |
|---|---:|---|---|
| `user` | 41 | Rename to Person form | `src/routes/+layout.server.ts:13` |
| `getPersonByUserAndWorkspace` | 28 | Rename to Person form | `convex/features/tasks/tasks.test.ts:12` |
| `user2Id` | 22 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circles.integration.test.ts:230` |
| `findPersonByUserAndWorkspace` | 21 | Rename to Person form | `convex/infrastructure/rbac/setupAdmin.ts:20` |
| `getPersonIdForUser` | 20 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circles.integration.test.ts:18` |
| `username` | 20 | Rename to Person form | `src/lib/components/molecules/WorkspaceSelector.stories.svelte:18` |
| `listWorkspacesForUser` | 19 | Rename to Person form | `convex/infrastructure/featureFlags/targeting.ts:4` |
| `assignRoleToUser` | 15 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/+page.svelte:291` |
| `userRole` | 13 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte:58` |
| `currentUserId` | 12 | Rename to Person form | `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts:61` |
| `getUserId` | 10 | Rename to Person form | `src/lib/infrastructure/workspaces/composables/useWorkspaces.svelte.ts:61` |
| `userEvent` | 9 | Rename to Person form | `src/lib/modules/org-chart/components/RoleNode.stories.svelte:162` |
| `user2` | 8 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circles.integration.test.ts:382` |
| `users` | 8 | Rename to People/Persons form | `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte:125` |
| `getUserRoles` | 7 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts:300` |
| `User` | 7 | Rename to Person form | `src/routes/settings/+page.svelte:759` |
| `findUserEmailField` | 6 | Rename to Person form | `convex/features/invites/helpers.ts:32` |
| `findUserNameField` | 6 | Rename to Person form | `convex/features/invites/helpers.ts:32` |
| `handleUserCircleRoleCreated` | 6 | Rename to Person form | `convex/core/roles/roles.test.ts:198` |
| `handleUserCircleRoleRemoved` | 6 | Rename to Person form | `convex/core/roles/roles.test.ts:199` |
| `USER_ID_FIELD` | 6 | Rename to Person form | `convex/features/readwise/queries/progress.ts:3` |
| `userCircleRoles` | 6 | Rename to Person form | `convex/core/roles/roles.test.ts:51` |
| `userIsAdmin` | 6 | Rename to Person form | `convex/core/roles/templates/mutations.ts:34` |
| `withUserAndEmailBefore` | 6 | Rename to Person form | `convex/migrations/clearPeopleEmailDenormalization.ts:16` |
| `adminUserId` | 5 | Rename to Person form | `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts:86` |
| `ensureUserNotAlreadyMember` | 5 | Rename to Person form | `convex/features/invites/rules.ts:73` |
| `invitedUsers` | 5 | Rename to People/Persons form | `src/lib/modules/meetings/composables/useMeetings.svelte.ts:39` |
| `linkedUser` | 5 | Rename to Person form | `convex/features/readwise/queries/progress.ts:16` |
| `user1` | 5 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circles.integration.test.ts:381` |
| `getUserPermissions` | 4 | Rename to Person form | `convex/infrastructure/rbac/setupAdmin.ts:101` |
| `inviterUserId` | 4 | Rename to Person form | `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts:114` |
| `listActiveUserRoles` | 4 | Rename to Person form | `convex/infrastructure/rbac/permissions.ts:4` |
| `remainingWithUserAndEmail` | 4 | Rename to Person form | `convex/migrations/clearPeopleEmailDenormalization.ts:19` |
| `userId2` | 4 | Rename to Person form | `src/lib/modules/meetings/__tests__/meetings.integration.test.ts:360` |
| `userRoles` | 4 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts:300` |
| `existingByUser` | 3 | Rename to Person form | `convex/core/people/mutations.ts:114` |
| `handleUserCircleRoleRestored` | 3 | Rename to Person form | `convex/core/roles/roleRbac.ts:89` |
| `linkPersonToUser` | 3 | Rename to Person form | `convex/core/people/people.test.ts:4` |
| `listUserRoles` | 3 | Rename to Person form | `convex/core/roles/queries.ts:249` |
| `prevUserId` | 3 | Rename to Person form | `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts:131` |
| `selectedUserId` | 3 | Rename to Person form | `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte:45` |
| `activeUserRoles` | 2 | Rename to Person form | `convex/infrastructure/rbac/permissions/access.ts:88` |
| `actorUser` | 2 | Rename to Person form | `convex/features/tags/access.ts:38` |
| `createUserRoleAssignment` | 2 | Rename to Person form | `convex/infrastructure/rbac/permissions.ts:5` |
| `existingUserInvite` | 2 | Rename to Person form | `convex/features/invites/rules.ts:65` |
| `hasUser` | 2 | Rename to Person form | `convex/migrations/clearPeopleEmailDenormalization.ts:37` |
| `lastUserId` | 2 | Rename to Person form | `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts:43` |
| `memberUserIds` | 2 | Rename to Person form | `convex/features/invites/helpers.ts:379` |
| `revokeUserRole` | 2 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte:77` |
| `teamLeadUserId` | 2 | Rename to Person form | `tests/convex/integration/rbac.integration.test.ts:194` |
| `updateUserRoleRevocation` | 2 | Rename to Person form | `convex/infrastructure/rbac/permissions.ts:6` |
| `user1Orgs` | 2 | Rename to Person form | `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts:270` |
| `user2Orgs` | 2 | Rename to Person form | `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts:277` |
| `user3Id` | 2 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts:317` |
| `userChangeRolesPerm` | 2 | Rename to Person form | `convex/infrastructure/rbac/seedRBAC.ts:143` |
| `userChildren` | 2 | Rename to Person form | `src/lib/modules/org-chart/components/import/PreviewTree.svelte:49` |
| `userDetails` | 2 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte:56` |
| `userOnboardingComplete` | 2 | Rename to Person form | `src/routes/(authenticated)/+layout.server.ts:161` |
| `userRolesAfter` | 2 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts:456` |
| `userRolesBefore` | 2 | Rename to Person form | `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts:443` |
| `_findPersonByUserAndWorkspace` | 1 | Rename to Person form | `convex/infrastructure/rbac/setupAdmin.ts:20` |
| `_getPersonByUserAndWorkspace` | 1 | Rename to Person form | `convex/features/customFields/queries.ts:13` |
| `_userRoleId` | 1 | Rename to Person form | `convex/infrastructure/rbac/permissions/lifecycle.ts:113` |
| `assignUserId` | 1 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/+page.svelte:297` |
| `bgetUserOrganizationIds` | 1 | Rename to Person form | `scripts/refactor-organizations-to-workspaces.ts:254` |
| `collectBrandingForUser` | 1 | Rename to Person form | `convex/features/workspaceBranding/index.ts:68` |
| `currentUserEmail` | 1 | Rename to Person form | `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts:37` |
| `ensureNoExistingUserInvite` | 1 | Rename to Person form | `convex/features/invites/helpers.ts:77` |
| `getTargetUserId` | 1 | Rename to Person form | `convex/features/tasks/queries.ts:72` |
| `getUserCircleIds` | 1 | Rename to Person form | `convex/infrastructure/access/permissions.ts:44` |
| `getUserFlashcards` | 1 | Rename to Person form | `convex/features/flashcards/repository.ts:50` |
| `getUserSettings` | 1 | Rename to People/Persons form | `convex/core/workspaces/settings.ts:19` |
| `getUserSettingsForSync` | 1 | Rename to People/Persons form | `convex/core/workspaces/settings.ts:352` |
| `getUserSettingsQuery` | 1 | Rename to People/Persons form | `convex/features/readwise/filters.ts:57` |
| `getUserWorkspaceIds` | 1 | Rename to Person form | `convex/infrastructure/access/permissions.ts:12` |
| `INVITE_USER_MISMATCH` | 1 | Rename to Person form | `convex/core/people/mutations.ts:87` |
| `inviteeUser` | 1 | Rename to Person form | `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts:137` |
| `listUserFlashcards` | 1 | Rename to Person form | `convex/features/flashcards/index.ts:120` |
| `mockConvexUser` | 1 | Rename to Person form | `convex/core/proposals/proposals.test.ts:102` |
| `normalizedUserId` | 1 | Rename to Person form | `convex/infrastructure/access/permissions.ts:19` |
| `updateUserRole` | 1 | Rename to Person form | `convex/admin/rbac.ts:941` |
| `userDetailsResult` | 1 | Rename to Person form | `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts:19` |
| `userHasWorkspaceAccess` | 1 | Rename to Person form | `convex/infrastructure/featureFlags/targeting.ts:6` |
| `userRolesTable` | 1 | Rename to Person form | `eslint-rules/__tests__/no-userid-in-audit-fields.test.js:59` |
| `Users` | 1 | Rename to People/Persons form | `convex/features/readwise/mutations.ts:94` |
| `usersQuery` | 1 | Rename to People/Persons form | `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts:180` |
| `usersResult` | 1 | Rename to People/Persons form | `src/routes/(authenticated)/admin/rbac/+page.server.ts:27` |
| `userWorkspaceIds` | 1 | Rename to Person form | `convex/infrastructure/featureFlags/targeting.ts:14` |

## Workspace-scoped cleanup plan (draft)

Goal: reduce **workspace-scoped** `user/users` terminology to **0** in code + UI labels by renaming identifiers and UI copy to `person/people` (or `member` only when the domain truly means membership rather than identity).

### Recommended approach

- **Step 1: Define the “allowed user” carve-outs (prevents breaking identity model)**
  - Keep `userId` and the `users` table terminology for **System/Auth identity**.
  - Keep `*UserId` forms when they truly refer to global identity targets (invites, auth flows).
  - Everything else in workspace context should migrate to `person/people`.

- **Step 2: Mechanical renames (safe, mostly-local)**
  - Rename variables/props like `availableUsers` → `availablePeople` or `availablePersons` (prefer `people/person` when backed by `people` table).
  - Rename functions/hooks like `useUsers...` that actually query `people`/`personId` to `usePeople...` / `usePersons...`.
  - Rename UI copy text in workspace screens: "Users" → "People" (or "Members" only when it refers to membership).

- **Step 3: File/module renames (medium risk, do after mechanical renames)**
  - Rename components/files like `AssignUserDialog` to `AssignPersonDialog` only after updating all imports + stories/tests.
  - Prefer leaving purely-presentational legacy names for later only if churn risk is high, but the stated goal here is 0—so schedule them.

- **Step 4: API boundary verification (must stay consistent)**
  - Ensure all workspace mutations/queries accept `personId` (not `userId`).
  - Reserve `user/users` naming for global identity and auth tables only.
