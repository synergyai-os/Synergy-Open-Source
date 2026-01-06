---
title: Identity terminology audit (system/auth-only): user/users
generatedAt: 2025-12-23T08:11:54.162Z
---

## Totals

| Scope | Count | doc | comment | string | code |
|---|---:|---:|---:|---:|---:|
| system_auth | 1725 | 0 | 0 | 542 | 1183 |
| workspace | 0 | 0 | 0 | 0 | 0 |
| unknown | 0 | 0 | 0 | 0 | 0 |

## Instances

| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |
|---|---:|---|---:|---|---|---|---|---|
| `convex/admin/invariants/crossDomain.ts` | 54 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			name: 'No userId references in core domain tables', |
| `convex/admin/invariants/crossDomain.ts` | 60 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					: `${violations.length} record(s) still use userId-based references` |
| `convex/admin/invariants/identity.ts` | 243 | `string` | 2 | `users` | `system_auth` | `medium` | Auth signals: query users table | 		const users = await ctx.db.query('users').collect(); |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 39 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 170 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 				const legacyCreatedBy = (task as any).createdBy as Id<'users'> \| undefined; |
| `convex/admin/migrations/migrateTasksAuditFields.ts` | 214 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`); |
| `convex/admin/orgStructureImport.test.ts` | 6 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | const mockUserId = 'u1' as Id<'users'>; |
| `convex/admin/orgStructureImport.test.ts` | 10 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 	validateSessionAndGetUserId: async () => ({ userId: mockUserId }) |
| `convex/admin/orgStructureImport.ts` | 11 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/admin/orgStructureImport.ts` | 41 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/admin/orgStructureImport.ts` | 192 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/admin/orgStructureImport.ts` | 242 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					updatedBy: userId |
| `convex/admin/orgStructureImport.ts` | 256 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					userId, |
| `convex/admin/orgStructureImport.ts` | 278 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					updatedBy: userId |
| `convex/admin/rbac.ts` | 198 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/admin/rbac.ts` | 218 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/rbac.ts` | 243 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/rbac.ts` | 290 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 			userId: Id<'users'>; |
| `convex/admin/rbac.ts` | 315 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: user._id, |
| `convex/admin/rbac.ts` | 341 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: user._id, |
| `convex/admin/rbac.ts` | 383 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 			userId: Id<'users'>; |
| `convex/admin/rbac.ts` | 469 | `code` | 2 | `Users, user` | `system_auth` | `medium` | Auth signals: , userId | 		const systemLevelUsers = new Set(systemLevelAssignments.map((ur) => ur.userId.toString())); |
| `convex/admin/rbac.ts` | 823 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const adminUserId = await requireSystemAdmin(ctx, args.sessionId); |
| `convex/admin/rbac.ts` | 866 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', adminUserId)) |
| `convex/admin/rbac.ts` | 985 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const adminUserId = await requireSystemAdmin(ctx, args.sessionId); |
| `convex/admin/rbac.ts` | 1044 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', adminUserId)) |
| `convex/admin/rbac.ts` | 1050 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 				userId: adminUserId, |
| `convex/admin/rbac.ts` | 1061 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			userId: adminUserId, |
| `convex/admin/users.ts` | 24 | `string` | 2 | `users` | `system_auth` | `medium` | Auth signals: query users table | 		const users = await ctx.db.query('users').collect(); |
| `convex/admin/users.ts` | 28 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 			workosId: user.workosId, |
| `convex/admin/users.ts` | 37 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: login | 			lastLoginAt: user.lastLoginAt, |
| `convex/admin/users.ts` | 49 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/admin/users.ts` | 76 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/users.ts` | 100 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/admin/users.ts` | 131 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 			workosId: user.workosId, |
| `convex/admin/users.ts` | 140 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: login | 			lastLoginAt: user.lastLoginAt, |
| `convex/auth.config.ts` | 16 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 			issuer: `https://api.workos.com/user_management/${clientId}`, |
| `convex/core/history/queries.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/history/queries.ts` | 19 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/history/queries.ts` | 78 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/policies/mutations.ts` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/policies/mutations.ts` | 12 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/policies/queries.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/policies/queries.ts` | 12 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 14 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/users/mutations.ts` | 20 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const syncUserFromWorkOS = mutation({ |
| `convex/core/users/mutations.ts` | 31 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 34 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		return upsertWorkosUser(ctx, { |
| `convex/core/users/mutations.ts` | 41 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const ensureWorkosUser = mutation({ |
| `convex/core/users/mutations.ts` | 52 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 54 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		return upsertWorkosUser(ctx, args); |
| `convex/core/users/mutations.ts` | 58 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const updateUserProfile = mutation({ |
| `convex/core/users/mutations.ts` | 61 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 76 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 80 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 81 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await ensureLinkable(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 82 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined); |
| `convex/core/users/mutations.ts` | 91 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users'), |
| `convex/core/users/mutations.ts` | 95 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 96 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await ensureLinkable(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 97 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined); |
| `convex/core/users/mutations.ts` | 105 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/mutations.ts` | 108 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 109 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (userId === args.targetUserId) { |
| `convex/core/users/mutations.ts` | 113 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await removeBidirectionalLink(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 121 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/mutations.ts` | 124 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/core/users/mutations.ts` | 125 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		await removeBidirectionalLink(ctx, userId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 134 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | async function upsertWorkosUser( |
| `convex/core/users/mutations.ts` | 143 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/mutations.ts` | 144 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const identity = await ctx.auth.getUserIdentity(); |
| `convex/core/users/mutations.ts` | 149 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const existingUser = await ctx.db |
| `convex/core/users/mutations.ts` | 150 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		.query('users') |
| `convex/core/users/mutations.ts` | 157 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (existingUser) { |
| `convex/core/users/mutations.ts` | 158 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		await ctx.db.patch(existingUser._id, { |
| `convex/core/users/mutations.ts` | 167 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		return existingUser._id; |
| `convex/core/users/mutations.ts` | 170 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	return await ctx.db.insert('users', { |
| `convex/core/users/mutations.ts` | 187 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: Id<'users'>; |
| `convex/core/users/mutations.ts` | 193 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	await requireProfilePermission(ctx, args.sessionId, args.targetUserId); |
| `convex/core/users/mutations.ts` | 195 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	const updates: Partial<Doc<'users'>> & { updatedAt: number } = { |
| `convex/core/users/mutations.ts` | 212 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const user = await ctx.db.get(args.targetUserId); |
| `convex/core/users/mutations.ts` | 214 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			args.firstName ?? user?.firstName, |
| `convex/core/users/mutations.ts` | 215 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			args.lastName ?? user?.lastName |
| `convex/core/users/mutations.ts` | 219 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	await ctx.db.patch(args.targetUserId, updates); |
| `convex/core/users/mutations.ts` | 226 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 227 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	linkedUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 230 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (await linkExists(ctx, primaryUserId, linkedUserId)) { |
| `convex/core/users/mutations.ts` | 235 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		primaryUserId, |
| `convex/core/users/mutations.ts` | 236 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		linkedUserId, |
| `convex/core/users/mutations.ts` | 245 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 246 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	linkedUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 249 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	await createDirectedLink(ctx, primaryUserId, linkedUserId, linkType); |
| `convex/core/users/mutations.ts` | 250 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	await createDirectedLink(ctx, linkedUserId, primaryUserId, linkType); |
| `convex/core/users/mutations.ts` | 255 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	currentUserId: Id<'users'>, |
| `convex/core/users/mutations.ts` | 256 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/mutations.ts` | 258 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const targetUser = await ctx.db.get(targetUserId); |
| `convex/core/users/mutations.ts` | 259 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!targetUser) { |
| `convex/core/users/mutations.ts` | 265 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', currentUserId)) |
| `convex/core/users/mutations.ts` | 266 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.filter((q) => q.eq(q.field('linkedUserId'), targetUserId)) |
| `convex/core/users/mutations.ts` | 274 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', targetUserId)) |
| `convex/core/users/mutations.ts` | 275 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.filter((q) => q.eq(q.field('linkedUserId'), currentUserId)) |
| `convex/core/users/queries.ts` | 5 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { requireSessionUserId, linkExists } from './rules'; |
| `convex/core/users/queries.ts` | 6 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/users/queries.ts` | 8 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const getUserById = query({ |
| `convex/core/users/queries.ts` | 11 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 12 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return await ctx.db.get(userId); |
| `convex/core/users/queries.ts` | 16 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const getUserByWorkosId = query({ |
| `convex/core/users/queries.ts` | 19 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 21 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 			.query('users') |
| `convex/core/users/queries.ts` | 27 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export const getCurrentUser = query({ |
| `convex/core/users/queries.ts` | 30 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 31 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return await ctx.db.get(userId); |
| `convex/core/users/queries.ts` | 38 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: v.id('users') |
| `convex/core/users/queries.ts` | 41 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 42 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const exists = await linkExists(ctx, userId, args.targetUserId); |
| `convex/core/users/queries.ts` | 50 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const userId = await requireSessionUserId(ctx, args.sessionId); |
| `convex/core/users/queries.ts` | 51 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return await listLinked(ctx, userId); |
| `convex/core/users/queries.ts` | 66 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | export async function listOrgLinksForUser(ctx: QueryCtx, userId: Id<'users'>): Promise<OrgLink[]> { |
| `convex/core/users/queries.ts` | 67 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 	const workspaceIds = await listWorkspacesForUser(ctx, userId); |
| `convex/core/users/queries.ts` | 71 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId); |
| `convex/core/users/queries.ts` | 89 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | async function listLinked(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/core/users/queries.ts` | 92 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', userId)) |
| `convex/core/users/queries.ts` | 96 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		userId: Id<'users'>; |
| `convex/core/users/queries.ts` | 106 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		const user = await ctx.db.get(link.linkedUserId); |
| `convex/core/users/queries.ts` | 107 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		if (!user) continue; |
| `convex/core/users/queries.ts` | 110 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: link.linkedUserId, |
| `convex/core/users/queries.ts` | 111 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			email: user.email ?? null, |
| `convex/core/users/queries.ts` | 112 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			name: user.name ?? null, |
| `convex/core/users/queries.ts` | 113 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: user.firstName ?? null, |
| `convex/core/users/queries.ts` | 114 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: user.lastName ?? null, |
| `convex/core/users/rules.ts` | 3 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/core/users/rules.ts` | 12 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export async function requireSessionUserId( |
| `convex/core/users/rules.ts` | 15 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/rules.ts` | 16 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/users/rules.ts` | 17 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	return userId; |
| `convex/core/users/rules.ts` | 23 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 24 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | ): Promise<Id<'users'>> { |
| `convex/core/users/rules.ts` | 25 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/core/users/rules.ts` | 27 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	await requirePermission(ctx, userId, 'users.manage-profile', { |
| `convex/core/users/rules.ts` | 28 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		resourceOwnerId: targetUserId |
| `convex/core/users/rules.ts` | 31 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	return userId; |
| `convex/core/users/rules.ts` | 52 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId: Id<'users'>, |
| `convex/core/users/rules.ts` | 53 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	linkedUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 55 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (primaryUserId === linkedUserId) { |
| `convex/core/users/rules.ts` | 60 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const queue: Array<{ userId: Id<'users'>; depth: number }> = [ |
| `convex/core/users/rules.ts` | 61 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		{ userId: primaryUserId, depth: 0 } |
| `convex/core/users/rules.ts` | 71 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		if (visited.has(current.userId)) { |
| `convex/core/users/rules.ts` | 74 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		visited.add(current.userId); |
| `convex/core/users/rules.ts` | 77 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			console.warn(`User ${primaryUserId} has too many linked accounts (>${MAX_TOTAL_ACCOUNTS})`); |
| `convex/core/users/rules.ts` | 83 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId)) |
| `convex/core/users/rules.ts` | 87 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			if (link.linkedUserId === linkedUserId) { |
| `convex/core/users/rules.ts` | 90 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			if (!visited.has(link.linkedUserId)) { |
| `convex/core/users/rules.ts` | 91 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 }); |
| `convex/core/users/rules.ts` | 101 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	userId: Id<'users'>, |
| `convex/core/users/rules.ts` | 103 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | ): Promise<Set<Id<'users'>>> { |
| `convex/core/users/rules.ts` | 104 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	const visited = new Set<Id<'users'>>(); |
| `convex/core/users/rules.ts` | 105 | `string` | 3 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const queue: Array<{ userId: Id<'users'>; depth: number }> = [{ userId, depth: 0 }]; |
| `convex/core/users/rules.ts` | 109 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		if (visited.has(current.userId)) { |
| `convex/core/users/rules.ts` | 113 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		visited.add(current.userId); |
| `convex/core/users/rules.ts` | 120 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId)) |
| `convex/core/users/rules.ts` | 124 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			if (!visited.has(link.linkedUserId)) { |
| `convex/core/users/rules.ts` | 125 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 }); |
| `convex/core/users/rules.ts` | 135 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	userId1: Id<'users'>, |
| `convex/core/users/rules.ts` | 136 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	userId2: Id<'users'> |
| `convex/core/users/rules.ts` | 138 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const user1Links = await getTransitiveLinks(ctx, userId1, MAX_LINK_DEPTH); |
| `convex/core/users/rules.ts` | 139 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const user2Links = await getTransitiveLinks(ctx, userId2, MAX_LINK_DEPTH); |
| `convex/core/users/rules.ts` | 140 | `code` | 4 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const combined = new Set([...user1Links, ...user2Links, userId1, userId2]); |
| `convex/core/users/rules.ts` | 147 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	ownerUserId: Id<'users'>, |
| `convex/core/users/rules.ts` | 148 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	targetUserId: Id<'users'> |
| `convex/core/users/rules.ts` | 150 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (ownerUserId === targetUserId) { |
| `convex/core/users/rules.ts` | 154 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const primary = await ctx.db.get(ownerUserId); |
| `convex/core/users/rules.ts` | 155 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const linked = await ctx.db.get(targetUserId); |
| `convex/core/users/rules.ts` | 162 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.withIndex('by_primary', (q) => q.eq('primaryUserId', ownerUserId)) |
| `convex/core/users/rules.ts` | 171 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const wouldExceedDepth = await checkLinkDepth(ctx, ownerUserId, targetUserId); |
| `convex/core/users/schema.ts` | 3 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | export type UserDoc = Doc<'users'>; |
| `convex/core/users/schema.ts` | 4 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | export type UserId = Id<'users'>; |
| `convex/core/users/schema.ts` | 7 | `string` | 2 | `UserS, userS` | `system_auth` | `high` | Auth-domain file pattern match | export type UserSettingsDoc = Doc<'userSettings'>; |
| `convex/core/users/schema.ts` | 8 | `string` | 2 | `UserS, userS` | `system_auth` | `high` | Auth-domain file pattern match | export type UserSettingsId = Id<'userSettings'>; |
| `convex/core/users/tables.ts` | 4 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | export const usersTable = defineTable({ |
| `convex/core/users/tables.ts` | 21 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId: v.id('users'), |
| `convex/core/users/tables.ts` | 22 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	linkedUserId: v.id('users'), |
| `convex/core/users/tables.ts` | 27 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	.index('by_primary', ['primaryUserId']) |
| `convex/core/users/tables.ts` | 28 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	.index('by_linked', ['linkedUserId']); |
| `convex/core/users/tables.ts` | 30 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | export const userSettingsTable = defineTable({ |
| `convex/core/users/tables.ts` | 31 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	userId: v.id('users'), |
| `convex/core/users/tables.ts` | 36 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | }).index('by_user', ['userId']); |
| `convex/core/users/users.test.ts` | 4 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { requireProfilePermission, requireSessionUserId } from './rules'; |
| `convex/core/users/users.test.ts` | 6 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | const mockUserId = 'user-1' as Id<'users'>; |
| `convex/core/users/users.test.ts` | 7 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | const mockTargetUserId = 'user-2' as Id<'users'>; |
| `convex/core/users/users.test.ts` | 10 | `string` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-1' }) |
| `convex/core/users/users.test.ts` | 23 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | describe('users/rules - Session/Access', () => { |
| `convex/core/users/users.test.ts` | 24 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 	it('requireSessionUserId returns validated userId', async () => { |
| `convex/core/users/users.test.ts` | 27 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const result = await requireSessionUserId(ctx, 'session-1'); |
| `convex/core/users/users.test.ts` | 29 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		expect(result).toBe(mockUserId); |
| `convex/core/users/users.test.ts` | 35 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const result = await requireProfilePermission(ctx, 'session-2', mockTargetUserId); |
| `convex/core/users/users.test.ts` | 37 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		expect(result).toBe(mockUserId); |
| `convex/core/users/users.test.ts` | 38 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		expect(requirePermissionMock).toHaveBeenCalledWith(ctx, mockUserId, 'users.manage-profile', { |
| `convex/core/users/users.test.ts` | 39 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			resourceOwnerId: mockTargetUserId |
| `convex/docs/doc404Tracking.ts` | 10 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation'; |
| `convex/docs/doc404Tracking.ts` | 29 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		let userId: Id<'users'> \| undefined = undefined; |
| `convex/docs/doc404Tracking.ts` | 32 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				const derived = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 33 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId = derived.userId; |
| `convex/docs/doc404Tracking.ts` | 35 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId = undefined; |
| `convex/docs/doc404Tracking.ts` | 53 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: userId \|\| existing.userId |
| `convex/docs/doc404Tracking.ts` | 63 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `convex/docs/doc404Tracking.ts` | 80 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 100 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 124 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/docs/doc404Tracking.ts` | 129 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			resolvedBy: userId, |
| `convex/docs/doc404Tracking.ts` | 141 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 12 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/customFields/mutations.ts` | 62 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 103 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 129 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 166 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/mutations.ts` | 190 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 12 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/customFields/queries.ts` | 34 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 57 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 83 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/queries.ts` | 108 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/customFields/rules.ts` | 24 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/customFields/rules.ts` | 30 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/features/customFields/rules.ts` | 41 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/export/blog.ts` | 132 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/export/blog.ts` | 201 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/flashcards/flashcards.test.ts` | 41 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1', |
| `convex/features/flashcards/flashcards.test.ts` | 79 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await archiveFlashcardForUser(ctx, { sessionId: 's1', flashcardId: 'f1' as any }); |
| `convex/features/flashcards/flashcards.test.ts` | 91 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			archiveFlashcardForUser({} as any, { sessionId: 's1', flashcardId: 'f1' as any }) |
| `convex/features/flashcards/importExport.ts` | 11 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | async function requireUserIdFromSession( |
| `convex/features/flashcards/importExport.ts` | 16 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		.validateSessionAndGetUserIdInternal; |
| `convex/features/flashcards/importExport.ts` | 17 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	const { userId } = (await ctx.runQuery(validateSession, { sessionId })) as { userId: string }; |
| `convex/features/flashcards/importExport.ts` | 18 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	return userId; |
| `convex/features/flashcards/importExport.ts` | 21 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | async function fetchKeys(ctx: FlashcardActionCtx, userId: string) { |
| `convex/features/flashcards/importExport.ts` | 27 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const keys = (await ctx.runQuery(getEncryptedKeysInternal, { userId })) as { |
| `convex/features/flashcards/importExport.ts` | 118 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 	const userId = await requireUserIdFromSession(ctx, args.sessionId); |
| `convex/features/flashcards/importExport.ts` | 119 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const encryptedApiKey = await fetchKeys(ctx, userId); |
| `convex/features/inbox/access.ts` | 11 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	linkedUser: Id<'users'>; |
| `convex/features/invites/helpers.ts` | 59 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		invitedUserId?: Id<'users'>; |
| `convex/features/invites/helpers.ts` | 141 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/invites/helpers.ts` | 149 | `code` | 3 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	if (invite.invitedUserId && invite.invitedUserId !== userId) { |
| `convex/features/invites/helpers.ts` | 156 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	await ensureInviteEmailMatchesUser(ctx, invite, userId); |
| `convex/features/invites/helpers.ts` | 163 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 174 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `convex/features/invites/helpers.ts` | 207 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/helpers.ts` | 212 | `code` | 3 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	if (invite.invitedUserId && invite.invitedUserId !== userId) { |
| `convex/features/invites/helpers.ts` | 217 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 235 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/helpers.ts` | 292 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | export async function listInvitesForUser(ctx: QueryCtx, userId: Id<'users'>) { |
| `convex/features/invites/helpers.ts` | 293 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/features/invites/helpers.ts` | 298 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('invitedUserId', userId)) |
| `convex/features/invites/mutations.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/invites/mutations.ts` | 21 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		inviteeUserId: v.optional(v.id('users')), |
| `convex/features/invites/mutations.ts` | 25 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 47 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 57 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: v.id('users'), |
| `convex/features/invites/mutations.ts` | 74 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 88 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/mutations.ts` | 89 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return resendInviteEmail(ctx, args.inviteId, userId); |
| `convex/features/invites/queries.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/invites/queries.ts` | 17 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 34 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 48 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/invites/queries.ts` | 53 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('invitedUserId', userId)) |
| `convex/features/invites/rules.ts` | 56 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	invitedUserId?: Id<'users'> |
| `convex/features/invites/rules.ts` | 76 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	invitedUserId?: Id<'users'> |
| `convex/features/invites/rules.ts` | 95 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/invites/rules.ts` | 100 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/features/invites/tables.ts` | 12 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	invitedUserId: v.optional(v.id('users')), |
| `convex/features/meetings/helpers/queries/invitedUsers.ts` | 16 | `code` | 1 | `Users` | `system_auth` | `medium` | Auth signals: session | type GetInvitedUsersArgs = { sessionId: string; meetingId: Id<'meetings'> }; |
| `convex/features/notes/index.test.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 	validateSessionAndGetUserId: vi.fn() |
| `convex/features/notes/index.test.ts` | 15 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/notes/index.test.ts` | 45 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	test('createNote validates the session and inserts a note for the acting user', async () => { |
| `convex/features/notes/index.test.ts` | 46 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 62 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		expect(validateSessionAndGetUserId).toHaveBeenCalledWith(ctx, 'sess'); |
| `convex/features/notes/index.test.ts` | 76 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 100 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 130 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' }); |
| `convex/features/notes/index.test.ts` | 152 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 	test('createNote surfaces authentication failures from validateSessionAndGetUserId', async () => { |
| `convex/features/notes/index.test.ts` | 153 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		(validateSessionAndGetUserId as any).mockRejectedValue( |
| `convex/features/notes/index.ts` | 11 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/notes/index.ts` | 22 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/notes/index.ts` | 42 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/features/notes/index.ts` | 50 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId |
| `convex/features/onboarding/mutations.ts` | 12 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/onboarding/mutations.ts` | 42 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 124 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 187 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 238 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/mutations.ts` | 301 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 11 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/onboarding/queries.ts` | 31 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 66 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 109 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/onboarding/queries.ts` | 114 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/features/onboarding/queries.ts` | 187 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/readwise/access.ts` | 19 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 	const userId = await getUserId(ctx, args.sessionId); |
| `convex/features/readwise/access.ts` | 20 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const apiKey = await getDecryptedKey(ctx, userId); |
| `convex/features/readwise/access.ts` | 25 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | async function getUserId(ctx: ActionCtx, sessionId: string): Promise<Id<'users'>> { |
| `convex/features/readwise/access.ts` | 26 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { userId } = await ctx.runQuery( |
| `convex/features/readwise/access.ts` | 28 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			.validateSessionAndGetUserIdInternal as FunctionReference< |
| `convex/features/readwise/access.ts` | 32 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | 			{ userId: Id<'users'>; session: unknown } |
| `convex/features/readwise/access.ts` | 36 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	return userId; |
| `convex/features/readwise/access.ts` | 39 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | async function getDecryptedKey(ctx: ActionCtx, userId: string): Promise<string> { |
| `convex/features/readwise/access.ts` | 44 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		{ userId: string }, |
| `convex/features/readwise/access.ts` | 47 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const encryptedKeys = await ctx.runQuery(getKeysQuery, { userId }); |
| `convex/features/readwise/access.ts` | 72 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: string; |
| `convex/features/readwise/cleanup.ts` | 176 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			.validateSessionAndGetUserIdInternal; |
| `convex/features/readwise/cleanup.ts` | 177 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = (await ctx.runQuery(validateSession, { |
| `convex/features/readwise/cleanup.ts` | 179 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		})) as { userId: Id<'users'> }; |
| `convex/features/readwise/cleanup.ts` | 184 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			{ userId } |
| `convex/features/readwise/cleanup.ts` | 363 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		await ctx.runMutation(cleanupApi.updateSyncTimestamp, { userId }); |
| `convex/features/readwise/cleanup.ts` | 428 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/features/readwise/cleanup.ts` | 433 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.userId)) |
| `convex/features/readwise/filters.ts` | 50 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string, |
| `convex/features/readwise/filters.ts` | 61 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		{ userId: string }, |
| `convex/features/readwise/filters.ts` | 64 | `code` | 3 | `userS, UserS, user` | `system_auth` | `medium` | Auth signals: , userId | 	const userSettings = await ctx.runQuery(getUserSettingsQuery, { userId }); |
| `convex/features/readwise/filters.ts` | 71 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/readwise/filters.ts` | 77 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		{ userId: Id<'users'> }, |
| `convex/features/readwise/mutations.ts` | 212 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/features/readwise/mutations.ts` | 214 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	handler: (ctx, args) => updateLastSyncTimeImpl(ctx, args.userId) |
| `convex/features/readwise/mutations/progress.ts` | 53 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | export async function updateLastSyncTimeImpl(ctx: MutationCtx, userId: Id<'users'>) { |
| `convex/features/readwise/mutations/progress.ts` | 57 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/features/readwise/mutations/progress.ts` | 68 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/features/readwise/mutations/queries.ts` | 54 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/features/readwise/orchestrator.ts` | 10 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/readwise/orchestrator.ts` | 19 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { userId, apiKey, updatedAfter: dateFilter, limit } = args; |
| `convex/features/readwise/orchestrator.ts` | 27 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `convex/features/readwise/readwise.test.ts` | 91 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'user-1', |
| `convex/features/readwise/sync.ts` | 59 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: v.id('users'), |
| `convex/features/readwise/testApi.ts` | 47 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			const { userId } = await ctx.runQuery( |
| `convex/features/readwise/testApi.ts` | 48 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/readwise/testApi.ts` | 58 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					userId |
| `convex/features/readwise/testApi.ts` | 166 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			const { userId } = await ctx.runQuery( |
| `convex/features/readwise/testApi.ts` | 167 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal, |
| `convex/features/readwise/testApi.ts` | 176 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					userId |
| `convex/features/tags/access.ts` | 1 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId as validateSession } from '../../infrastructure/sessionValidation'; |
| `convex/features/tags/access.ts` | 15 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	user: Id<'users'>; |
| `convex/features/tags/access.ts` | 37 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 	const actorUser = sessionResult.session.convexUserId; |
| `convex/features/tasks/access.ts` | 11 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/tasks/access.ts` | 66 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/features/tasks/assignments.ts` | 15 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/assignments.ts` | 21 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { task, meeting } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/index.ts` | 16 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/tasks/index.ts` | 36 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 37 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const tasks = await listTasks(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 48 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 49 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const tasks = await listTasksByMeeting(ctx, { meetingId: args.meetingId, userId }); |
| `convex/features/tasks/index.ts` | 60 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 61 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const tasks = await listTasksByAgendaItem(ctx, { agendaItemId: args.agendaItemId, userId }); |
| `convex/features/tasks/index.ts` | 73 | `code` | 3 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 89 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 90 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return getTaskWithAccess(ctx, { taskId: args.actionItemId, userId }); |
| `convex/features/tasks/index.ts` | 110 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 111 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const { actionItemId } = await createTask(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 126 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 127 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return updateTaskDetails(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 138 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 139 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return updateTaskStatus(ctx, { ...args, userId }); |
| `convex/features/tasks/index.ts` | 152 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 163 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/tasks/index.ts` | 164 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return updateTaskRemoval(ctx, { ...args, userId }); |
| `convex/features/tasks/lifecycle.ts` | 26 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 87 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 91 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { task } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 108 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 112 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/lifecycle.ts` | 124 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/lifecycle.ts` | 128 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId); |
| `convex/features/tasks/queries.ts` | 14 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 34 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 50 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 66 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	currentUserId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 67 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	targetUserId?: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 88 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/features/tasks/queries.ts` | 99 | `string` | 5 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | function getTargetUserId(targetUserId: Id<'users'> \| undefined, currentUserId: Id<'users'>) { |
| `convex/features/tasks/tasks.test.ts` | 84 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 119 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 157 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 174 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 201 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 219 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 243 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 258 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: 'u1' as any |
| `convex/features/tasks/tasks.test.ts` | 271 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		await updateTaskRemoval(ctx, { actionItemId: 'task1' as any, userId: 'u1' as any }); |
| `convex/features/waitlist/index.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation'; |
| `convex/features/waitlist/index.ts` | 24 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/features/waitlist/index.ts` | 88 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/access/permissions.ts` | 14 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 16 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	const normalizedUserId = userId as Id<'users'>; |
| `convex/infrastructure/access/permissions.ts` | 30 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: v.id('users') |
| `convex/infrastructure/access/permissions.ts` | 46 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 48 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	const normalizedUserId = userId as Id<'users'>; |
| `convex/infrastructure/access/permissions.ts` | 54 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', normalizedUserId)) |
| `convex/infrastructure/access/permissions.ts` | 68 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string, |
| `convex/infrastructure/access/permissions.ts` | 71 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	if (content.userId === userId) { |
| `convex/infrastructure/access/permissions.ts` | 102 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string |
| `convex/infrastructure/access/permissions.ts` | 104 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string; |
| `convex/infrastructure/access/permissions.ts` | 114 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/auth.test.ts` | 7 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		expect(Object.keys(auth).sort()).toEqual(['validateSessionAndGetUserId']); |
| `convex/infrastructure/auth.test.ts` | 8 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		expect(auth.validateSessionAndGetUserId).toBeTypeOf('function'); |
| `convex/infrastructure/auth.ts` | 7 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | export { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/auth.ts` | 11 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | const AUTH_HELPER_GUARD = 'use-validateSessionAndGetUserId-only' as const; |
| `convex/infrastructure/auth/helpers.ts` | 9 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const identity = await ctx.auth.getUserIdentity(); |
| `convex/infrastructure/auth/helpers.ts` | 20 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		throw createError(ErrorCodes.AUTH_REQUIRED, 'User not found'); |
| `convex/infrastructure/auth/tables.ts` | 10 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId: v.optional(v.id('users')), |
| `convex/infrastructure/auth/tables.ts` | 12 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/tables.ts` | 21 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	convexUserId: v.id('users'), |
| `convex/infrastructure/auth/tables.ts` | 22 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	workosUserId: v.string(), |
| `convex/infrastructure/auth/tables.ts` | 32 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/tables.ts` | 35 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	userSnapshot: v.object({ |
| `convex/infrastructure/auth/tables.ts` | 36 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		userId: v.id('users'), |
| `convex/infrastructure/auth/tables.ts` | 52 | `string` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 	.index('by_convex_user', ['convexUserId']) |
| `convex/infrastructure/auth/tables.ts` | 65 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent: v.optional(v.string()) |
| `convex/infrastructure/auth/validateApiKeys.ts` | 37 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 							role: 'user', |
| `convex/infrastructure/auth/verification.ts` | 4 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/auth/verification.ts` | 25 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 140 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 181 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 220 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/auth/verification.ts` | 225 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/auth/verification.ts` | 234 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				userAgent: args.userAgent |
| `convex/infrastructure/auth/verification.ts` | 266 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: v.optional(v.string()) |
| `convex/infrastructure/auth/verification.ts` | 300 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: args.userAgent |
| `convex/infrastructure/authSessions.ts` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/authSessions.ts` | 14 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 		ownerUserId: v.optional(v.id('users')), |
| `convex/infrastructure/authSessions.ts` | 16 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/authSessions.ts` | 22 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 41 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			primaryUserId: args.ownerUserId, |
| `convex/infrastructure/authSessions.ts` | 43 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: session | 			userAgent: args.userAgent, |
| `convex/infrastructure/authSessions.ts` | 61 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 84 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			primaryUserId: record.primaryUserId ?? undefined, |
| `convex/infrastructure/authSessions.ts` | 86 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: session | 			userAgent: record.userAgent, |
| `convex/infrastructure/authSessions.ts` | 92 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | export const getActiveSessionForUser = query({ |
| `convex/infrastructure/authSessions.ts` | 95 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 		targetUserId: v.id('users') |
| `convex/infrastructure/authSessions.ts` | 98 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/authSessions.ts` | 101 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: session | 			.withIndex('by_convex_user', (q) => q.eq('convexUserId', args.targetUserId)) |
| `convex/infrastructure/authSessions.ts` | 129 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 		ownerUserId: v.id('users'), |
| `convex/infrastructure/authSessions.ts` | 130 | `code` | 1 | `User` | `system_auth` | `high` | Auth signals: WorkOS, session | 		workosUserIdentifier: v.string(), |
| `convex/infrastructure/authSessions.ts` | 138 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 		userAgent: v.optional(v.string()), |
| `convex/infrastructure/authSessions.ts` | 139 | `code` | 1 | `userS` | `system_auth` | `medium` | Auth signals: session | 		userSnapshot: v.object({ |
| `convex/infrastructure/authSessions.ts` | 140 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | 			userId: v.id('users'), |
| `convex/infrastructure/authSessions.ts` | 168 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: args.ownerUserId, |
| `convex/infrastructure/authSessions.ts` | 169 | `code` | 2 | `User` | `system_auth` | `high` | Auth signals: WorkOS, session | 			workosUserId: args.workosUserIdentifier, |
| `convex/infrastructure/authSessions.ts` | 179 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: session | 			userAgent: args.userAgent, |
| `convex/infrastructure/authSessions.ts` | 182 | `code` | 2 | `userS` | `system_auth` | `medium` | Auth signals: session | 			userSnapshot: args.userSnapshot |
| `convex/infrastructure/authSessions.ts` | 266 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 		userAgent: v.optional(v.string()) |
| `convex/infrastructure/authSessions.ts` | 281 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: session | 			userAgent: args.userAgent ?? record.userAgent |
| `convex/infrastructure/email.ts` | 8 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/email.ts` | 79 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/featureFlags/access.ts` | 2 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/featureFlags/access.ts` | 10 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | export async function getUserContext(ctx: Ctx, sessionId: string): Promise<UserContext> { |
| `convex/infrastructure/featureFlags/access.ts` | 11 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/featureFlags/access.ts` | 12 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const user = await ctx.db.get(userId); |
| `convex/infrastructure/featureFlags/access.ts` | 13 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	return { userId, user }; |
| `convex/infrastructure/featureFlags/debug.ts` | 12 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId: string; |
| `convex/infrastructure/featureFlags/debug.ts` | 27 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: userContext.userId, |
| `convex/infrastructure/featureFlags/debug.ts` | 46 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: userContext.userId, |
| `convex/infrastructure/featureFlags/impact.ts` | 10 | `string` | 2 | `Users, users` | `system_auth` | `medium` | Auth signals: query users table | 	const allUsers = await ctx.db.query('users').collect(); |
| `convex/infrastructure/featureFlags/queries.ts` | 41 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: session | 		const userContext = await getUserContext(ctx, args.sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 51 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: session | 		const userContext = await getUserContext(ctx, args.sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 100 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	args: { sessionId: v.string(), userEmail: v.string() }, |
| `convex/infrastructure/featureFlags/queries.ts` | 109 | `code` | 4 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userContext = { userId: user._id, user }; |
| `convex/infrastructure/featureFlags/queries.ts` | 115 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: user._id, |
| `convex/infrastructure/featureFlags/queries.ts` | 132 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: session | 		const userContext = await getUserContext(ctx, sessionId); |
| `convex/infrastructure/featureFlags/queries.ts` | 146 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/featureFlags/queries.ts` | 163 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/featureFlags/targeting.ts` | 8 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/featureFlags/targeting.ts` | 26 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/featureFlags/targeting.ts` | 31 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	const bucket = getUserRolloutBucket(userId, flagName); |
| `convex/infrastructure/featureFlags/targeting.ts` | 37 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { userId, user } = userContext; |
| `convex/infrastructure/featureFlags/targeting.ts` | 41 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	if (flagConfig.allowedUserIds?.includes(userId)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 44 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	if (checkRollout(userId, flagName, flagConfig.rolloutPercentage)) return true; |
| `convex/infrastructure/featureFlags/targeting.ts` | 54 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { userId, user } = userContext; |
| `convex/infrastructure/featureFlags/targeting.ts` | 59 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	if (flagConfig.allowedUserIds?.includes(userId)) { |
| `convex/infrastructure/featureFlags/targeting.ts` | 73 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 		const bucket = getUserRolloutBucket(userId, flagName); |
| `convex/infrastructure/featureFlags/types.ts` | 9 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/infrastructure/featureFlags/utils.ts` | 9 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | export function getUserRolloutBucket(userId: Id<'users'>, flag: string): number { |
| `convex/infrastructure/featureFlags/utils.ts` | 11 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const str = `${userId}:${flag}`; |
| `convex/infrastructure/rbac/permissions.test.ts` | 25 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 26 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 61 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: insert users table | 			const otherUserId = await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 62 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 				workosId: 'other-user', |
| `convex/infrastructure/rbac/permissions.test.ts` | 82 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 93 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 94 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 				workosId: 'other-user-1', |
| `convex/infrastructure/rbac/permissions.test.ts` | 186 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 187 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 224 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				resourceOwnerId: userId |
| `convex/infrastructure/rbac/permissions.test.ts` | 243 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 244 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 281 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `convex/infrastructure/rbac/permissions.test.ts` | 282 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `convex/infrastructure/rbac/permissions.test.ts` | 316 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/permissions/access.ts` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../sessionValidation'; |
| `convex/infrastructure/rbac/permissions/access.ts` | 21 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 25 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	const permissions = await listUserPermissions(ctx, userId, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 29 | `string` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User has all scope'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 30 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (perm.scope === 'own') return handleOwnScope(ctx, userId, permissionSlug, perm, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 34 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 42 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 54 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 58 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const allowed = await hasPermission(ctx, userId, permissionSlug, context); |
| `convex/infrastructure/rbac/permissions/access.ts` | 64 | `string` | 1 | `users` | `system_auth` | `high` | Auth signals: session, Convex users id type | export async function requireSystemAdmin(ctx: Ctx, sessionId: string): Promise<Id<'users'>> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 65 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 	const { userId } = await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 66 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const isAdmin = await checkIsSystemAdmin(ctx, userId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 70 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	return userId; |
| `convex/infrastructure/rbac/permissions/access.ts` | 73 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | export async function checkIsSystemAdmin(ctx: Ctx, userId: Id<'users'>): Promise<boolean> { |
| `convex/infrastructure/rbac/permissions/access.ts` | 85 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 90 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 136 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 144 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 152 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const isOwner = context.resourceOwnerId === userId; |
| `convex/infrastructure/rbac/permissions/access.ts` | 154 | `string` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User owns resource'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 156 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		await logAndDeny(ctx, userId, permissionSlug, perm, context, 'Resource not owned by user'); |
| `convex/infrastructure/rbac/permissions/access.ts` | 161 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 172 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 179 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/access.ts` | 192 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/access.ts` | 199 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 16 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 30 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 88 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 90 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		assignedBy: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/logging.ts` | 7 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: entry.userId, |
| `convex/infrastructure/rbac/permissions/queries.ts` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../../sessionValidation'; |
| `convex/infrastructure/rbac/permissions/queries.ts` | 10 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 11 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return checkIsSystemAdmin(ctx, userId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 22 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/permissions/queries.ts` | 27 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 		return listUserPermissions(ctx, userId, context).then((permissions) => |
| `convex/infrastructure/rbac/permissions/types.ts` | 42 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	resourceOwnerId?: Id<'users'>; |
| `convex/infrastructure/rbac/permissions/types.ts` | 46 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `convex/infrastructure/rbac/queries.ts` | 9 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/queries.ts` | 18 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 29 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 40 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 83 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/queries.ts` | 123 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/queries.ts` | 174 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 45 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 50 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 67 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 86 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 188 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 190 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	grantedBy?: Id<'users'> |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 195 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 204 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 255 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `convex/infrastructure/rbac/scopeHelpers.ts` | 260 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 19 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSessionAndGetUserId } from '../sessionValidation'; |
| `convex/infrastructure/rbac/setupAdmin.ts` | 35 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 170 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		targetUserId: v.id('users') |
| `convex/infrastructure/rbac/setupAdmin.ts` | 174 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 189 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 211 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 241 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			userId: args.targetUserId, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 260 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `convex/infrastructure/rbac/setupAdmin.ts` | 272 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/setupAdmin.ts` | 304 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `convex/infrastructure/rbac/tables.ts` | 29 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: v.id('users'), |
| `convex/infrastructure/rbac/tables.ts` | 32 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	grantedBy: v.optional(v.id('users')) |
| `convex/infrastructure/rbac/tables.ts` | 34 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	.index('by_user', ['userId']) |
| `convex/infrastructure/rbac/tables.ts` | 135 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: v.id('users'), |
| `convex/infrastructure/rbac/tables.ts` | 148 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	.index('by_user', ['userId']) |
| `convex/infrastructure/rbac/tables.ts` | 150 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	.index('by_user_timestamp', ['userId', 'timestamp']) |
| `convex/infrastructure/sessionValidation.test.ts` | 4 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | import { validateSession, validateSessionAndGetUserId } from './sessionValidation'; |
| `convex/infrastructure/sessionValidation.test.ts` | 26 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 		await expect(validateSession(ctx, 'user1' as Id<'users'>)).rejects.toThrow( |
| `convex/infrastructure/sessionValidation.test.ts` | 31 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 	test('validateSessionAndGetUserId throws SESSION_REVOKED when session is revoked', async () => { |
| `convex/infrastructure/sessionValidation.test.ts` | 36 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 			convexUserId: 'user1' as Id<'users'>, |
| `convex/infrastructure/sessionValidation.test.ts` | 42 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'sid')).rejects.toThrow( |
| `convex/infrastructure/sessionValidation.ts` | 33 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | export async function validateSession(ctx: QueryCtx \| MutationCtx, userId: Id<'users'>) { |
| `convex/infrastructure/sessionValidation.ts` | 41 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 				q.eq(q.field('convexUserId'), userId), |
| `convex/infrastructure/sessionValidation.ts` | 50 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 		throw createError(ErrorCodes.SESSION_NOT_FOUND, 'Session not found - user must log in'); |
| `convex/infrastructure/sessionValidation.ts` | 57 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 			'Session has been revoked - user must log in again' |
| `convex/infrastructure/sessionValidation.ts` | 91 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | export async function validateSessionAndGetUserId( |
| `convex/infrastructure/sessionValidation.ts` | 94 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | ): Promise<{ userId: Id<'users'>; session: Doc<'authSessions'> }> { |
| `convex/infrastructure/sessionValidation.ts` | 112 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 			'Session not found or expired - user must log in' |
| `convex/infrastructure/sessionValidation.ts` | 120 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 			'Session has been revoked - user must log in again' |
| `convex/infrastructure/sessionValidation.ts` | 125 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		userId: session.convexUserId, |
| `convex/infrastructure/sessionValidation.ts` | 134 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | export const validateSessionAndGetUserIdInternal = internalQuery({ |
| `convex/infrastructure/sessionValidation.ts` | 139 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		return validateSessionAndGetUserId(ctx, args.sessionId); |
| `convex/infrastructure/tables.ts` | 9 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	allowedUserIds: v.optional(v.array(v.id('users'))), |
| `convex/infrastructure/tables.ts` | 36 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: v.optional(v.id('users')), |
| `convex/infrastructure/tables.ts` | 43 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	resolvedBy: v.optional(v.id('users')), |
| `convex/schema.ts` | 18 | `string` | 3 | `userS, users` | `system_auth` | `medium` | Auth signals: users domain path | import { accountLinksTable, userSettingsTable, usersTable } from './core/users/tables'; |
| `e2e/.auth/user-worker-0.json` | 56 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e148-724a-83a5-14573acf43d4\",1763544654152],\"distinct_id\":\"019a9b73-ded4-742b-835e-963b8701cb22\",\"$device_id\":\"019a9b73-dece-7308-954b-b5c58bd2449a\",\"$ |
| `e2e/.auth/user-worker-1.json` | 60 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e13e-7927-b4ef-4285a6b9f07a\",1763544654142],\"distinct_id\":\"019a9b73-ded3-7c08-81ef-ceb7bf432fe6\",\"$device_id\":\"019a9b73-dece-7275-a265-e654e82048a7\",\"$ |
| `e2e/.auth/user-worker-2.json` | 60 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e140-7a66-b3de-dea243a1fdc0\",1763544654144],\"distinct_id\":\"019a9b73-ded3-77c3-b08c-739e5e58cb76\",\"$device_id\":\"019a9b73-dece-776c-b6b0-a184fede3917\",\"$ |
| `e2e/.auth/user-worker-3.json` | 56 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019a9b73-e13d-7e64-98ad-736fbc9e35cb\",1763544654141],\"distinct_id\":\"019a9b73-ded3-781e-a7ca-26016f4adfc8\",\"$device_id\":\"019a9b73-dece-7b4a-8757-701468cf87e7\",\"$ |
| `e2e/.auth/user-worker-4.json` | 52 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, login |           "value": "{\"$user_state\":\"anonymous\",\"$sesid\":[null,\"019aa115-536d-79be-a3bf-9e3fe4800667\",1763639120749],\"distinct_id\":\"019aa115-5269-7868-bdc8-91b18ad8c2b5\",\"$device_id\":\"019aa115-5267-7aa0-935c-4fa952bc3ac2\",\"$ |
| `e2e/auth-security.test.ts` | 211 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	test.skip('should capture IP address and user-agent on session creation', async ({ page }) => { |
| `e2e/auth-security.test.ts` | 237 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 		console.log('✅ Session valid - IP/user-agent captured for audit (not validated for security)'); |
| `e2e/settings-security.spec.ts` | 144 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	test('should load user settings with sessionId authentication', async ({ page }) => { |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 50 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 					args: { userId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 51 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					handler: async (ctx, args) => args.userId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 72 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			name: 'userId arg blocked in public endpoint', |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 79 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | 					args: { sessionId: v.string(), userId: v.id('users') }, |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 80 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					handler: async (ctx, args) => args.userId |
| `eslint-rules/__tests__/no-legacy-auth-patterns.test.js` | 93 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 					args: { sessionId: v.string(), targetUserId: v.id('users') }, |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 7 | `string` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | import noUseridInAuditFields from '../no-userid-in-audit-fields.js'; |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 16 | `string` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | ruleTester.run('no-userid-in-audit-fields', noUseridInAuditFields, { |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 46 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			name: 'Allowed: non-audit field with userId (not an audit pattern)', |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 50 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					ownerId: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 51 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					targetUserId: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 60 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 					userId: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 61 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 73 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 						updatedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 83 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 97 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					createdBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 118 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					updatedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 139 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					archivedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 160 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					deletedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 181 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					modifiedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 202 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					changedBy: v.id('users') |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 222 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					createdBy: v.id('users'), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 223 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					updatedBy: v.optional(v.id('users')), |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 224 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					archivedBy: v.optional(v.id('users')) |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 258 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | console.log('✅ All no-userid-in-audit-fields tests passed!'); |
| `eslint-rules/no-legacy-auth-patterns.js` | 4 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']); |
| `eslint-rules/no-legacy-auth-patterns.js` | 146 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				'AUTH_GUARD_LEGACY_HELPER: Legacy auth helper "{{name}}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 148 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				'MISSING_SESSION_ID_ARG: Public Convex endpoints must declare args.sessionId and validate via validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 150 | `string` | 4 | `USER, user, User` | `system_auth` | `high` | Auth signals: session, userId | 				'USER_ID_ARG_BLOCKED: Public Convex endpoints must not accept client-provided userId. Derive user identity via validateSessionAndGetUserId(ctx, sessionId).', |
| `eslint-rules/no-legacy-auth-patterns.js` | 238 | `string` | 2 | `user, USER` | `system_auth` | `medium` | Auth signals: , userId | 					const code = propName === 'userId' ? USER_ID_ARG_CODE : TARGET_ARG_NOT_WHITELISTED_CODE; |
| `eslint-rules/no-legacy-auth-patterns.js` | 246 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 						messageId: propName === 'userId' ? 'userIdArg' : 'targetArgNotAllowed', |
| `scripts/activate-worker-users.ts` | 59 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 		const response = await fetch('https://api.workos.com/user_management/authenticate', { |
| `scripts/activate-worker-users.ts` | 109 | `string` | 1 | `Users` | `system_auth` | `medium` | Auth signals: WorkOS | 	console.log('🚀 Activating WorkOS Worker Users\n'); |
| `scripts/activate-worker-users.ts` | 165 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: WorkOS | 		console.log('   1. Workers exist in WorkOS (run create-worker-users.ts)'); |
| `scripts/add-users-to-org.ts` | 33 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | ] as Id<'users'>[]; |
| `scripts/add-users-to-org.ts` | 44 | `code` | 2 | `user, USER` | `system_auth` | `medium` | Auth signals: , userId | 	for (const userId of USER_IDS) { |
| `scripts/add-users-to-org.ts` | 46 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			console.log(`Adding user ${userId}...`); |
| `scripts/add-users-to-org.ts` | 51 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: userId, |
| `scripts/add-users-to-org.ts` | 55 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			console.log(`✅ Successfully added user ${userId}\n`); |
| `scripts/add-users-to-org.ts` | 57 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			console.error(`❌ Failed to add user ${userId}:`, error); |
| `scripts/audit-user-terminology.ts` | 24 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | const OUTPUT_DIR = path.join(REPO_ROOT, 'dev-docs', 'audits', 'identity-user-terminology'); |
| `scripts/audit-user-terminology.ts` | 26 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | const OUTPUT_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.md'); |
| `scripts/audit-user-terminology.ts` | 29 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'identity-user-terminology-audit.workspace.md' |
| `scripts/audit-user-terminology.ts` | 33 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'identity-user-terminology-audit.system-auth.md' |
| `scripts/audit-user-terminology.ts` | 35 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | const OUTPUT_UNKNOWN_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.unknown.md'); |
| `scripts/audit-user-terminology.ts` | 36 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | const OUTPUT_SUMMARY_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.summary.md'); |
| `scripts/audit-user-terminology.ts` | 39 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'identity-user-terminology-audit.actionable.md' |
| `scripts/audit-user-terminology.ts` | 73 | `code` | 2 | `USER, users` | `system_auth` | `high` | Auth-domain file pattern match | const USER_SUBSTRING_RE = /users?/gi; |
| `scripts/audit-user-terminology.ts` | 75 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | const USER_TOKEN_RE = /[A-Za-z_][A-Za-z0-9_]*/g; |
| `scripts/audit-user-terminology.ts` | 76 | `code` | 2 | `USER, users` | `system_auth` | `high` | Auth-domain file pattern match | const STRING_LITERAL_WITH_USER_RE = /(['"`])[^'"`]*users?[^'"`]*\1/i; |
| `scripts/audit-user-terminology.ts` | 78 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | const WORKSPACE_USER_TOKEN_EXCEPTIONS = new Set<string>([ |
| `scripts/audit-user-terminology.ts` | 80 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userId', |
| `scripts/audit-user-terminology.ts` | 81 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userIds', |
| `scripts/audit-user-terminology.ts` | 82 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'actorUserId', |
| `scripts/audit-user-terminology.ts` | 83 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'actingUserId', |
| `scripts/audit-user-terminology.ts` | 84 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'targetUserId', |
| `scripts/audit-user-terminology.ts` | 85 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'memberUserId', |
| `scripts/audit-user-terminology.ts` | 86 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'assigneeUserId', |
| `scripts/audit-user-terminology.ts` | 87 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'inviteeUserId', |
| `scripts/audit-user-terminology.ts` | 88 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'invitedUserId', |
| `scripts/audit-user-terminology.ts` | 89 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'ownerUserId', |
| `scripts/audit-user-terminology.ts` | 90 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'candidateUserId', |
| `scripts/audit-user-terminology.ts` | 93 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userRoleId', |
| `scripts/audit-user-terminology.ts` | 94 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userRoleIds', |
| `scripts/audit-user-terminology.ts` | 97 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'getUser', |
| `scripts/audit-user-terminology.ts` | 98 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'getUserById', |
| `scripts/audit-user-terminology.ts` | 99 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'findUser', |
| `scripts/audit-user-terminology.ts` | 100 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'findUserById', |
| `scripts/audit-user-terminology.ts` | 101 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'findUserByEmail', |
| `scripts/audit-user-terminology.ts` | 102 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	'validateUser', |
| `scripts/audit-user-terminology.ts` | 105 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userEmail', |
| `scripts/audit-user-terminology.ts` | 106 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userName', |
| `scripts/audit-user-terminology.ts` | 107 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userEmails', |
| `scripts/audit-user-terminology.ts` | 108 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	'userNames' |
| `scripts/audit-user-terminology.ts` | 111 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | const WORKSPACE_USER_PATTERN_EXCEPTIONS: RegExp[] = [ |
| `scripts/audit-user-terminology.ts` | 112 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^get.*User$/, // getActiveUser, getUserById |
| `scripts/audit-user-terminology.ts` | 113 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^find.*User$/, // findUserByEmail |
| `scripts/audit-user-terminology.ts` | 114 | `code` | 2 | `User, UserS` | `system_auth` | `high` | Auth-domain file pattern match | 	/^validate.*User$/, // validateUserSession |
| `scripts/audit-user-terminology.ts` | 115 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^create.*User$/, // createUser |
| `scripts/audit-user-terminology.ts` | 116 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^update.*User$/, // updateUser |
| `scripts/audit-user-terminology.ts` | 117 | `code` | 5 | `User, Users` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(User\|Users)(Doc\|Id\|Type)s?$/, // UserDoc, UserId, UsersType |
| `scripts/audit-user-terminology.ts` | 118 | `string` | 3 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(Doc\|Id)<'?users'?>$/, // Doc<'users'> / Id<'users'> (best effort) |
| `scripts/audit-user-terminology.ts` | 121 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(get\|find\|list)Person.*By.*User/i, // getPersonByUserAndWorkspace, findPersonByUserAndWorkspace |
| `scripts/audit-user-terminology.ts` | 122 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(get\|find\|list).*ForUser$/i, // listWorkspacesForUser |
| `scripts/audit-user-terminology.ts` | 123 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(get\|find).*ByUserAndWorkspace$/i, // findPersonByUserAndWorkspace |
| `scripts/audit-user-terminology.ts` | 124 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^linkPersonToUser$/i, |
| `scripts/audit-user-terminology.ts` | 127 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^find(User)?(Name\|Email)Field$/i, // findUserNameField, findUserEmailField |
| `scripts/audit-user-terminology.ts` | 130 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^invited(User)?Id$/i, |
| `scripts/audit-user-terminology.ts` | 133 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(get\|list\|assign\|revoke\|update).*UserRole/i, |
| `scripts/audit-user-terminology.ts` | 134 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	/^(list\|create\|update)UserRoleAssignment/i, |
| `scripts/audit-user-terminology.ts` | 137 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 	/^USER_ID_FIELD$/i, |
| `scripts/audit-user-terminology.ts` | 138 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 	/^USER_.*_FIELD$/i |
| `scripts/audit-user-terminology.ts` | 142 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	/^convex\/core\/users\//, |
| `scripts/audit-user-terminology.ts` | 147 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	/\/audit-user-terminology(\.ts)?$/ |
| `scripts/audit-user-terminology.ts` | 185 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | function replaceUserWithPreferredTerm(text: string, preferred: 'Person' \| 'Member'): string { |
| `scripts/audit-user-terminology.ts` | 190 | `code` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		.replaceAll(/\bUsers\b/g, preferred === 'Person' ? 'People' : 'Members') |
| `scripts/audit-user-terminology.ts` | 191 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		.replaceAll(/\busers\b/g, plural) |
| `scripts/audit-user-terminology.ts` | 192 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		.replaceAll(/\bUser\b/g, preferred) |
| `scripts/audit-user-terminology.ts` | 193 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		.replaceAll(/\buser\b/g, singular); |
| `scripts/audit-user-terminology.ts` | 196 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | function replaceUserInStringLiterals(lineText: string, preferred: 'Person' \| 'Member'): string { |
| `scripts/audit-user-terminology.ts` | 199 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	return lineText.replaceAll(/(['"`])([^'"`]*\busers?\b[^'"`]*)\1/gi, (_m, quote, body) => { |
| `scripts/audit-user-terminology.ts` | 200 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		return `${quote}${replaceUserWithPreferredTerm(String(body), preferred)}${quote}`; |
| `scripts/audit-user-terminology.ts` | 207 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		STRING_LITERAL_WITH_USER_RE.test(lineText) && |
| `scripts/audit-user-terminology.ts` | 208 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		/\b(Add\|Assign\|Invite)\s+User(s)?\b/i.test(lineText) |
| `scripts/audit-user-terminology.ts` | 224 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (!base.includes('User')) continue; |
| `scripts/audit-user-terminology.ts` | 226 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const suggestedName = base.replaceAll('User', preferred); |
| `scripts/audit-user-terminology.ts` | 251 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		'This report is intentionally narrow: it focuses on high-signal workspace UI terminology drift (\"User\" → \"Person\"), plus a short list of code identifier rename candidates.' |
| `scripts/audit-user-terminology.ts` | 257 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('## P1: Org-chart component file names containing "User"'); |
| `scripts/audit-user-terminology.ts` | 278 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('## P2: Workspace UI copy containing "User" (high-signal phrases only)'); |
| `scripts/audit-user-terminology.ts` | 288 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			const suggested = replaceUserInStringLiterals(current, preferred); |
| `scripts/audit-user-terminology.ts` | 308 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 309 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? ''); |
| `scripts/audit-user-terminology.ts` | 310 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		const userTokens = tokens |
| `scripts/audit-user-terminology.ts` | 314 | `code` | 2 | `User, Users` | `system_auth` | `high` | Auth-domain file pattern match | 			.filter((t) => /User\|Users/.test(t)) |
| `scripts/audit-user-terminology.ts` | 315 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 			.filter((t) => !WORKSPACE_USER_TOKEN_EXCEPTIONS.has(t)) |
| `scripts/audit-user-terminology.ts` | 316 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 			.filter((t) => !WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(t))); |
| `scripts/audit-user-terminology.ts` | 318 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		for (const tok of Array.from(new Set(userTokens))) { |
| `scripts/audit-user-terminology.ts` | 322 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			const stateFlagMatch = /^isUser([A-Z][A-Za-z0-9_]*)$/.exec(tok); |
| `scripts/audit-user-terminology.ts` | 325 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 				: tok.replaceAll(/User/g, preferred); |
| `scripts/audit-user-terminology.ts` | 345 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('## P3: Org-chart code identifiers containing "User" (rename candidates)'); |
| `scripts/audit-user-terminology.ts` | 366 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | function hasOnlyExceptionUserTokens(lineText: string): boolean { |
| `scripts/audit-user-terminology.ts` | 367 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 	USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 368 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 	const tokens = Array.from(lineText.matchAll(USER_TOKEN_RE)) |
| `scripts/audit-user-terminology.ts` | 371 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const userTokens = tokens.filter((t) => t.toLowerCase().includes('user')); |
| `scripts/audit-user-terminology.ts` | 372 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (userTokens.length === 0) return false; |
| `scripts/audit-user-terminology.ts` | 374 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	for (const tok of userTokens) { |
| `scripts/audit-user-terminology.ts` | 375 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue; |
| `scripts/audit-user-terminology.ts` | 376 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		if (WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(tok))) continue; |
| `scripts/audit-user-terminology.ts` | 424 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				path.basename(resolved).startsWith('identity-user-terminology-audit') |
| `scripts/audit-user-terminology.ts` | 452 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: '/infrastructure/users/', why: 'users infra path' }, |
| `scripts/audit-user-terminology.ts` | 453 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: '/admin/users/', why: 'admin users path' }, |
| `scripts/audit-user-terminology.ts` | 462 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: "v.id('users')", why: 'Convex users id type' }, |
| `scripts/audit-user-terminology.ts` | 463 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: "id<'users'>", why: 'Convex users id type' }, |
| `scripts/audit-user-terminology.ts` | 464 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: "db.query('users')", why: 'query users table' }, |
| `scripts/audit-user-terminology.ts` | 465 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: "db.insert('users'", why: 'insert users table' }, |
| `scripts/audit-user-terminology.ts` | 466 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: '/core/users/', why: 'users domain path' }, |
| `scripts/audit-user-terminology.ts` | 467 | `string` | 2 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		{ key: 'users table', why: 'users table mention' }, |
| `scripts/audit-user-terminology.ts` | 490 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 	const hasUserId = /\buserid\b/i.test(lineText); |
| `scripts/audit-user-terminology.ts` | 491 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const authCount = matchedAuth.length + (hasUserId ? 1 : 0); |
| `scripts/audit-user-terminology.ts` | 518 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 				.join(', ')}${hasUserId ? ', userId' : ''}` |
| `scripts/audit-user-terminology.ts` | 541 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 	if (STRING_LITERAL_WITH_USER_RE.test(lineText)) return 'string'; |
| `scripts/audit-user-terminology.ts` | 573 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		USER_SUBSTRING_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 574 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		const matches = Array.from(line.matchAll(USER_SUBSTRING_RE)); |
| `scripts/audit-user-terminology.ts` | 694 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('title: Identity terminology audit summary (user/users)'); |
| `scripts/audit-user-terminology.ts` | 701 | `string` | 4 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		'- **Correct**: `user/users` when referring to global auth identity (`users` table, WorkOS, sessions, `userId`).' |
| `scripts/audit-user-terminology.ts` | 704 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		'- **Incorrect (to fix)**: `user/users` used in workspace/domain context where the entity is a `person`/`people` record (`personId`, circles/roles/workspace membership).' |
| `scripts/audit-user-terminology.ts` | 750 | `string` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		'- Then fix **UI labels** (workspace `kind=string`) where "Users" should be "People" (or "Members" when it truly means membership).' |
| `scripts/audit-user-terminology.ts` | 753 | `string` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		'- Apply mechanical renames (e.g. `availableUsers` → `availablePeople`) and re-run the script.' |
| `scripts/audit-user-terminology.ts` | 756 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		'- Use `identity-user-terminology-audit.unknown.md` only after the workspace list is shrinking (unknown becomes manageable).' |
| `scripts/audit-user-terminology.ts` | 770 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push(`title: Identity terminology audit (user/users)`); |
| `scripts/audit-user-terminology.ts` | 777 | `string` | 6 | `user, users, Users, User` | `system_auth` | `high` | Auth-domain file pattern match | 		'Audit of `user` / `users` occurrences in code and UI labels (strings), including inside identifiers like `availableUsers`, `useUsers`, `UserProfile`, `userId`, with a heuristic scope classification:' |
| `scripts/audit-user-terminology.ts` | 780 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		'- **system_auth**: global auth identity / sessions / WorkOS / `userId` / `users` table' |
| `scripts/audit-user-terminology.ts` | 821 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('## Workspace-scoped tokens containing "user" (candidate renames)'); |
| `scripts/audit-user-terminology.ts` | 824 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		'This list is derived from lines classified as `workspace` and extracts identifier-like tokens containing `user`/`users` (case-insensitive).' |
| `scripts/audit-user-terminology.ts` | 827 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		'It is intended to drive a systematic rename plan toward **0 workspace-scoped `user` terminology**. Tokens in the exception allowlist are omitted.' |
| `scripts/audit-user-terminology.ts` | 840 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		USER_TOKEN_RE.lastIndex = 0; |
| `scripts/audit-user-terminology.ts` | 841 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? ''); |
| `scripts/audit-user-terminology.ts` | 844 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			if (!tok.toLowerCase().includes('user')) continue; |
| `scripts/audit-user-terminology.ts` | 845 | `code` | 1 | `USER` | `system_auth` | `high` | Auth-domain file pattern match | 			if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue; |
| `scripts/audit-user-terminology.ts` | 864 | `string` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		const recommendation = lower.includes('users') |
| `scripts/audit-user-terminology.ts` | 866 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			: lower.includes('user') |
| `scripts/audit-user-terminology.ts` | 878 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		'Goal: reduce **workspace-scoped** `user/users` terminology to **0** in code + UI labels by renaming identifiers and UI copy to `person/people` (or `member` only when the domain truly means membership rather than identity).' |
| `scripts/audit-user-terminology.ts` | 884 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		'- **Step 1: Define the “allowed user” carve-outs (prevents breaking identity model)**' |
| `scripts/audit-user-terminology.ts` | 886 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('  - Keep `userId` and the `users` table terminology for **System/Auth identity**.'); |
| `scripts/audit-user-terminology.ts` | 888 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		'  - Keep `*UserId` forms when they truly refer to global identity targets (invites, auth flows).' |
| `scripts/audit-user-terminology.ts` | 894 | `string` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		'  - Rename variables/props like `availableUsers` → `availablePeople` or `availablePersons` (prefer `people/person` when backed by `people` table).' |
| `scripts/audit-user-terminology.ts` | 897 | `string` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		'  - Rename functions/hooks like `useUsers...` that actually query `people`/`personId` to `usePeople...` / `usePersons...`.' |
| `scripts/audit-user-terminology.ts` | 900 | `string` | 1 | `Users` | `system_auth` | `high` | Auth-domain file pattern match | 		'  - Rename UI copy text in workspace screens: "Users" → "People" (or "Members" only when it refers to membership).' |
| `scripts/audit-user-terminology.ts` | 905 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		'  - Rename components/files like `AssignUserDialog` to `AssignPersonDialog` only after updating all imports + stories/tests.' |
| `scripts/audit-user-terminology.ts` | 912 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('  - Ensure all workspace mutations/queries accept `personId` (not `userId`).'); |
| `scripts/audit-user-terminology.ts` | 913 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	lines.push('  - Reserve `user/users` naming for global identity and auth tables only.'); |
| `scripts/audit-user-terminology.ts` | 932 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			!(r.kind === 'code' && hasOnlyExceptionUserTokens(r.lineText)) |
| `scripts/audit-user-terminology.ts` | 947 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		title: 'Identity terminology audit (workspace-only): user/users', |
| `scripts/audit-user-terminology.ts` | 952 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		title: 'Identity terminology audit (system/auth-only): user/users', |
| `scripts/audit-user-terminology.ts` | 957 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		title: 'Identity terminology audit (unknown-only): user/users', |
| `scripts/audit-user-terminology.ts` | 965 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			'identity-user-terminology-audit.workspace.production-code.md' |
| `scripts/audit-user-terminology.ts` | 971 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.tests.md'), |
| `scripts/audit-user-terminology.ts` | 976 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.ui-strings.md'), |
| `scripts/check-auth-guard.js` | 11 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']); |
| `scripts/check-auth-guard.js` | 52 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			return findPropertyName(prop.name) === 'userId'; |
| `scripts/check-auth-guard.js` | 122 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 				`Legacy auth helper "${node.text}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).`, |
| `scripts/check-auth-guard.js` | 130 | `string` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 				'Public Convex endpoints must not accept client-provided userId. Derive identity via validateSessionAndGetUserId(ctx, sessionId).', |
| `scripts/check-auth-guard.js` | 161 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			`✅ Auth guard passed: no new legacy auth helpers or client userId args detected.` + |
| `scripts/create-worker-users.ts` | 55 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: WorkOS | 		const response = await fetch('https://api.workos.com/user_management/users', { |
| `scripts/create-worker-users.ts` | 86 | `string` | 1 | `Users` | `system_auth` | `medium` | Auth signals: WorkOS | 	console.log('🚀 Creating WorkOS Worker Users for Parallel E2E Testing\n'); |
| `scripts/test-worker-login.ts` | 53 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: WorkOS, login | 		const response = await fetch('https://api.workos.com/user_management/authenticate', { |
| `scripts/test-worker-login.ts` | 91 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: login | 	console.log('🧪 Testing Worker User Authentication\n'); |
| `scripts/test-worker-login.ts` | 155 | `string` | 1 | `Users` | `system_auth` | `high` | Auth signals: WorkOS, login | 		console.log('   2. Users were not created successfully in WorkOS'); |
| `scripts/test-worker-login.ts` | 157 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: login | 		console.log('\n🔧 Try running: tsx scripts/create-worker-users.ts'); |
| `src/app.d.ts` | 9 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					userId: string; // Convex user ID (for queries) |
| `src/app.d.ts` | 10 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 					workosId: string; // WorkOS user ID (for reference) |
| `src/lib/client/crypto.svelte.test.ts` | 11 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'test-123', |
| `src/lib/client/crypto.ts` | 158 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: 'test-user-123', |
| `src/lib/client/sessionStorage.ts` | 18 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	userEmail: string; |
| `src/lib/client/sessionStorage.ts` | 19 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	userName?: string; |
| `src/lib/client/sessionStorage.ts` | 46 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	return `${navigator.userAgent}-${screen.width}x${screen.height}`.slice(0, 32); |
| `src/lib/client/sessionStorage.ts` | 131 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		for (const [userId, session] of Object.entries(parsed.sessions)) { |
| `src/lib/client/sessionStorage.ts` | 133 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 				validSessions[userId] = session; |
| `src/lib/client/sessionStorage.ts` | 183 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | export async function addSession(userId: string, session: SessionData): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 185 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	store.sessions[userId] = session; |
| `src/lib/client/sessionStorage.ts` | 189 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		store.activeAccount = userId; |
| `src/lib/client/sessionStorage.ts` | 198 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | export async function removeSession(userId: string): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 200 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	delete store.sessions[userId]; |
| `src/lib/client/sessionStorage.ts` | 203 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	if (store.activeAccount === userId) { |
| `src/lib/client/sessionStorage.ts` | 214 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | export async function setActiveAccount(userId: string \| null): Promise<void> { |
| `src/lib/client/sessionStorage.ts` | 216 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	if (userId && store.sessions[userId]) { |
| `src/lib/client/sessionStorage.ts` | 217 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		store.activeAccount = userId; |
| `src/lib/client/sessionStorage.ts` | 219 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	} else if (userId === null) { |
| `src/lib/components/molecules/AccountMenu.svelte` | 9 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 		onLogout?: (targetUserId: string) => void; |
| `src/lib/components/molecules/AccountMenu.svelte` | 104 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 						onLogout?.(targetUserId); |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 14 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 25 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 		onLogout?: (targetUserId: string) => void; |
| `src/lib/components/molecules/LinkedAccountGroup.svelte` | 60 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 		targetUserId={account.userId} |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 35 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: auth path, login | 	args={{ email: 'user@example.com', password: '', redirectTarget: '/auth/redirect' }} |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 54 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 69 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/components/organisms/LoginBox.stories.svelte` | 84 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: login | 		email: 'user@example.com', |
| `src/lib/infrastructure/analytics/posthog/identity.ts` | 66 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	if (payload.sub) properties.userId = payload.sub; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 20 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	user?: UseAuthSessionReturn['user']; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 39 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		user: null as UseAuthSessionReturn['user'], |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 71 | `code` | 3 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			state.user = data.authenticated && data.user ? data.user : null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 76 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			state.activeAccountId = data.user?.userId ?? null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 79 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			if (data.authenticated && data.user && data.csrfToken && data.expiresAt) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 80 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				await addSession(data.user.userId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 84 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userEmail: data.user.email, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 85 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userName: data.user.name |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 90 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			if (data.authenticated && data.user) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 102 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								userId: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 106 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								userEmail: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 107 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								userName?: string; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 121 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								await addSession(session.userId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 125 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 									userEmail: session.userEmail, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 126 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 									userName: session.userName |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 132 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 									const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${session.userId}`; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 156 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			const currentUserId = data.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 158 | `code` | 3 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				.filter(([userId]) => userId !== currentUserId) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 159 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				.map(([userId, session]) => ({ |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 160 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userId, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 161 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					email: session.userEmail, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 162 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					name: session.userName, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 168 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			state.user = null; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 177 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		const currentUserId = state.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 178 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (!currentUserId) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 182 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		await logoutAccount(currentUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 185 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	async function logoutAccount(targetUserId: string) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 188 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		const currentUserId = state.user?.userId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 189 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const isLoggingOutCurrentAccount = targetUserId === currentUserId; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 195 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			const targetSession = allSessions[targetUserId]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 196 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const accountName = targetSession?.userName \|\| targetSession?.userEmail \|\| 'Account'; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 209 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 						body: JSON.stringify({ targetUserId }) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 224 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await removeSession(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 261 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 				await removeSession(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 272 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					const nextUserId = remainingAccounts[0]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 273 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					await setActiveAccount(nextUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 281 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 							body: JSON.stringify({ userId: nextUserId }) |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 316 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	async function switchAccount(targetUserId: string, redirectTo?: string) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 321 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (!allSessions[targetUserId]) { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 326 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const targetSession = allSessions[targetUserId]; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 327 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		const targetAccountName = targetSession.userName \|\| targetSession.userEmail \|\| 'account'; |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 353 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			await setActiveAccount(targetUserId); |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 363 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					targetUserId, |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 391 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 				await addSession(targetUserId, { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 420 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		get user() { |
| `src/lib/infrastructure/auth/composables/useAuthSession.svelte.ts` | 421 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			return state.user; |
| `src/lib/infrastructure/auth/server/session.ts` | 71 | `string` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	convexUserId: Parameters<typeof createSessionRecord>[0]['convexUserId']; |
| `src/lib/infrastructure/auth/server/session.ts` | 72 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/server/session.ts` | 77 | `string` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	userSnapshot: Parameters<typeof createSessionRecord>[0]['userSnapshot']; |
| `src/lib/infrastructure/auth/server/session.ts` | 100 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		convexUserId: options.convexUserId, |
| `src/lib/infrastructure/auth/server/session.ts` | 101 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		workosUserId: options.workosUserId, |
| `src/lib/infrastructure/auth/server/session.ts` | 107 | `code` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 		userSnapshot: options.userSnapshot, |
| `src/lib/infrastructure/auth/server/session.ts` | 109 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: options.event.request.headers.get('user-agent') |
| `src/lib/infrastructure/auth/server/session.ts` | 128 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	const activeWorkspace = options.userSnapshot.activeWorkspace |
| `src/lib/infrastructure/auth/server/session.ts` | 130 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				type: options.userSnapshot.activeWorkspace.type, |
| `src/lib/infrastructure/auth/server/session.ts` | 131 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				id: options.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string \| null, not optional |
| `src/lib/infrastructure/auth/server/session.ts` | 132 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				name: options.userSnapshot.activeWorkspace.name |
| `src/lib/infrastructure/auth/server/session.ts` | 138 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		user: { |
| `src/lib/infrastructure/auth/server/session.ts` | 139 | `string` | 4 | `user, userS, users` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: options.userSnapshot.userId, // Id<'users'> is compatible with string at runtime |
| `src/lib/infrastructure/auth/server/session.ts` | 140 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			workosId: options.userSnapshot.workosId, |
| `src/lib/infrastructure/auth/server/session.ts` | 141 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			email: options.userSnapshot.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 142 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: options.userSnapshot.firstName, |
| `src/lib/infrastructure/auth/server/session.ts` | 143 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: options.userSnapshot.lastName, |
| `src/lib/infrastructure/auth/server/session.ts` | 144 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			name: options.userSnapshot.name, |
| `src/lib/infrastructure/auth/server/session.ts` | 153 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	logger.info('auth', 'Session established for user', { |
| `src/lib/infrastructure/auth/server/session.ts` | 154 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 		email: options.userSnapshot.email |
| `src/lib/infrastructure/auth/server/session.ts` | 176 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 189 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 202 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 210 | `code` | 2 | `user, userS` | `system_auth` | `high` | Auth-domain file pattern match | 		userEmail: record.userSnapshot?.email |
| `src/lib/infrastructure/auth/server/session.ts` | 225 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 282 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			logger.error('auth', 'Failed to refresh WorkOS session - logging user out', { |
| `src/lib/infrastructure/auth/server/session.ts` | 284 | `code` | 2 | `user, userS` | `system_auth` | `high` | Auth-domain file pattern match | 				userEmail: record.userSnapshot?.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 291 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				user: null |
| `src/lib/infrastructure/auth/server/session.ts` | 317 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent'), |
| `src/lib/infrastructure/auth/server/session.ts` | 323 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	const activeWorkspace = record.userSnapshot.activeWorkspace |
| `src/lib/infrastructure/auth/server/session.ts` | 325 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				type: record.userSnapshot.activeWorkspace.type, |
| `src/lib/infrastructure/auth/server/session.ts` | 326 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				id: record.userSnapshot.activeWorkspace.id ?? null, // Ensure id is string \| null, not optional |
| `src/lib/infrastructure/auth/server/session.ts` | 327 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 				name: record.userSnapshot.activeWorkspace.name |
| `src/lib/infrastructure/auth/server/session.ts` | 333 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		user: { |
| `src/lib/infrastructure/auth/server/session.ts` | 334 | `string` | 4 | `user, userS, users` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: record.userSnapshot.userId, // Id<'users'> is compatible with string at runtime |
| `src/lib/infrastructure/auth/server/session.ts` | 335 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			workosId: record.userSnapshot.workosId, |
| `src/lib/infrastructure/auth/server/session.ts` | 336 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			email: record.userSnapshot.email, |
| `src/lib/infrastructure/auth/server/session.ts` | 337 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: record.userSnapshot.firstName, |
| `src/lib/infrastructure/auth/server/session.ts` | 338 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: record.userSnapshot.lastName, |
| `src/lib/infrastructure/auth/server/session.ts` | 339 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			name: record.userSnapshot.name, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 53 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId?: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 55 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 69 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		ownerUserId: options.primaryUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 71 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 88 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		primaryUserId?: Id<'users'> \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 102 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		primaryUserId: result.primaryUserId ?? undefined |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 108 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 109 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 115 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 117 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 127 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		ownerUserId: options.convexUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 128 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		workosUserIdentifier: options.workosUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 136 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 137 | `code` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 		userSnapshot: options.userSnapshot |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 152 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 153 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: string; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 163 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 164 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 173 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId: result.convexUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 174 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: result.workosUserId, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 184 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: result.userAgent ?? undefined, |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 185 | `code` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: result.userSnapshot |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 199 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export async function getActiveSessionRecordForUser(options: { |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 201 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	targetUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 205 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const result = (await convexQuery('infrastructure/authSessions:getActiveSessionForUser', { |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 207 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId: options.targetUserId |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 246 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | 255 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: options.userAgent ?? undefined |
| `src/lib/infrastructure/auth/server/workos.ts` | 47 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | interface WorkOSUser { |
| `src/lib/infrastructure/auth/server/workos.ts` | 78 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 106 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			'user' in data, |
| `src/lib/infrastructure/auth/server/workos.ts` | 113 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		user: WorkOSUser; |
| `src/lib/infrastructure/auth/server/workos.ts` | 118 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		hasUser: !!typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 119 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userEmail: typedData.user?.email |
| `src/lib/infrastructure/auth/server/workos.ts` | 123 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		typedData.access_token && typedData.refresh_token && typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 155 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		user: typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 173 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 245 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/sessions/logout`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 271 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent?: string \| null; |
| `src/lib/infrastructure/auth/server/workos.ts` | 276 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 286 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user_agent: options.userAgent |
| `src/lib/infrastructure/auth/server/workos.ts` | 309 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			'user' in data, |
| `src/lib/infrastructure/auth/server/workos.ts` | 316 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 		user: WorkOSUser; |
| `src/lib/infrastructure/auth/server/workos.ts` | 321 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		hasUser: !!typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 322 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userEmail: typedData.user?.email |
| `src/lib/infrastructure/auth/server/workos.ts` | 348 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		user: typedData.user, |
| `src/lib/infrastructure/auth/server/workos.ts` | 365 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export async function getUserByEmail(email: string): Promise<WorkOSUser \| null> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 367 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('🔍 Checking if user exists:', email); |
| `src/lib/infrastructure/auth/server/workos.ts` | 370 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 		`${WORKOS_BASE_URL}/user_management/users?email=${encodeURIComponent(email)}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 377 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('🔍 WorkOS get user response status:', response.status); |
| `src/lib/infrastructure/auth/server/workos.ts` | 381 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.error('❌ WorkOS get user failed:', errorText); |
| `src/lib/infrastructure/auth/server/workos.ts` | 383 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			`WorkOS get user failed (${response.status}): ${errorText}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 394 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const typedData = data as { data?: WorkOSUser[] }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 395 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('🔍 WorkOS get user response:', { usersFound: typedData.data?.length }); |
| `src/lib/infrastructure/auth/server/workos.ts` | 401 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | export async function createUserWithPassword(options: { |
| `src/lib/infrastructure/auth/server/workos.ts` | 406 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | }): Promise<{ userId: string }> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 408 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('🔍 Creating new user:', options.email); |
| `src/lib/infrastructure/auth/server/workos.ts` | 410 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/users`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 422 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('🔍 WorkOS create user response status:', response.status); |
| `src/lib/infrastructure/auth/server/workos.ts` | 426 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.error('❌ WorkOS create user failed:', errorText); |
| `src/lib/infrastructure/auth/server/workos.ts` | 428 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			`WorkOS user creation failed (${response.status}): ${errorText}`, |
| `src/lib/infrastructure/auth/server/workos.ts` | 441 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		'WorkOS user creation response missing user ID.' |
| `src/lib/infrastructure/auth/server/workos.ts` | 444 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('✅ User created successfully:', typedData.id); |
| `src/lib/infrastructure/auth/server/workos.ts` | 446 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	return { userId: typedData.id }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 460 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 502 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | }): Promise<{ userId: string }> { |
| `src/lib/infrastructure/auth/server/workos.ts` | 506 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset/confirm`, { |
| `src/lib/infrastructure/auth/server/workos.ts` | 551 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		!('user' in data) \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 552 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		typeof data.user !== 'object' \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 553 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		data.user === null \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 554 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		!('id' in data.user) \|\| |
| `src/lib/infrastructure/auth/server/workos.ts` | 555 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		typeof data.user.id !== 'string' |
| `src/lib/infrastructure/auth/server/workos.ts` | 557 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		invariant(false, 'WorkOS reset password response missing user ID.'); |
| `src/lib/infrastructure/auth/server/workos.ts` | 559 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	const typedData = data as { user: { id: string } }; |
| `src/lib/infrastructure/auth/server/workos.ts` | 560 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	console.log('✅ Password reset successful for user:', typedData.user.id); |
| `src/lib/infrastructure/auth/server/workos.ts` | 562 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	return { userId: typedData.user.id }; |
| `src/lib/infrastructure/auth/types.ts` | 23 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	primaryUserId?: Id<'users'> \| null; |
| `src/lib/infrastructure/auth/types.ts` | 27 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	userId: Id<'users'>; |
| `src/lib/infrastructure/auth/types.ts` | 42 | `string` | 2 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	convexUserId: Id<'users'>; |
| `src/lib/infrastructure/auth/types.ts` | 43 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	workosUserId: string; |
| `src/lib/infrastructure/auth/types.ts` | 53 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userAgent?: string; |
| `src/lib/infrastructure/auth/types.ts` | 54 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 	userSnapshot: SessionSnapshot; |
| `src/lib/infrastructure/auth/types.ts` | 65 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 	user: WorkOSUser; |
| `src/lib/infrastructure/auth/types.ts` | 77 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 	user: WorkOSUser; |
| `src/lib/infrastructure/auth/types.ts` | 83 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | interface WorkOSUser { |
| `src/lib/infrastructure/auth/types.ts` | 101 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	userId: string; |
| `src/lib/infrastructure/auth/types.ts` | 112 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	get user(): { |
| `src/lib/infrastructure/auth/types.ts` | 113 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userId: string; |
| `src/lib/infrastructure/auth/types.ts` | 130 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	logoutAccount: (targetUserId: string) => Promise<void>; |
| `src/lib/infrastructure/auth/types.ts` | 131 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	switchAccount: (targetUserId: string, redirectTo?: string) => Promise<void>; |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 50 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 	const userId = getUserId(); |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 52 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId ? { flag, userId } : 'skip' |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 63 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				if (lastValue !== enabled && userId) { |
| `src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts` | 64 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					reportFeatureFlagCheck(flag, enabled, userId, { |
| `src/lib/infrastructure/feature-flags/types.ts` | 8 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId?: string; |
| `src/lib/infrastructure/feature-flags/utils.ts` | 20 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | export function getUserRolloutBucket(userId: string, flag: string): number { |
| `src/lib/infrastructure/feature-flags/utils.ts` | 22 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const str = `${userId}:${flag}`; |
| `src/lib/infrastructure/feature-flags/utils.ts` | 42 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | export function isInRollout(userId: string, flag: string, percentage: number): boolean { |
| `src/lib/infrastructure/feature-flags/utils.ts` | 46 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	const bucket = getUserRolloutBucket(userId, flag); |
| `src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts` | 22 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId?: () => Id<'users'> \| null; |
| `src/lib/infrastructure/users/api.ts` | 16 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export type UserProfile = { |
| `src/lib/infrastructure/users/api.ts` | 17 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/infrastructure/users/api.ts` | 34 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/infrastructure/users/api.ts` | 61 | `code` | 1 | `Users` | `system_auth` | `medium` | Auth signals: users infra path | export interface UsersInfrastructureAPI { |
| `src/lib/infrastructure/users/api.ts` | 67 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	get currentUser(): UserProfile \| null; |
| `src/lib/infrastructure/users/api.ts` | 72 | `string` | 4 | `User, user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 	getUserById(userId: Id<'users'>): UserProfile \| null; |
| `src/lib/infrastructure/users/api.ts` | 95 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 		userId: Id<'users'>, |
| `src/lib/infrastructure/users/components/index.ts` | 12 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export { default as UserAvatar } from './UserAvatar.svelte'; |
| `src/lib/infrastructure/users/components/index.ts` | 13 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export { default as UserProfile } from './UserProfile.svelte'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	import type { UserProfile } from '../api'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 6 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: users infra path | 		user: UserProfile \| null \| undefined; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 12 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 	let { user, variant = 'default', size = 'md', class: className = '' }: Props = $props(); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 17 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: users infra path | 	function getInitials(user: UserProfile \| null \| undefined): string { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 18 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		if (!user) return '?'; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 21 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		if (user.name) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 23 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 				user.name |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 29 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 					.join('') \|\| user.name.slice(0, 2).toUpperCase() |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 34 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		if (user.firstName \|\| user.lastName) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 35 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			const first = user.firstName?.[0]?.toUpperCase() ?? ''; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 36 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			const last = user.lastName?.[0]?.toUpperCase() ?? ''; |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 41 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		if (user.email) { |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 42 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			return user.email.slice(0, 2).toUpperCase(); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 48 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 	const initials = $derived(getInitials(user)); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 49 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 	const imageUrl = $derived(user?.profileImageUrl); |
| `src/lib/infrastructure/users/components/UserAvatar.svelte` | 65 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: users infra path | 		alt={user?.name \|\| user?.email \|\| 'User'} |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 2 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	import UserAvatar from './UserAvatar.svelte'; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 3 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	import type { UserProfile } from '../api'; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 6 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: users infra path | 		user: UserProfile \| null \| undefined; |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 12 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 	let { user, showEmail = true, avatarSize = 'md', class: className = '' }: Props = $props(); |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 15 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		user?.name \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 16 | `string` | 4 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 17 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			user?.firstName \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 18 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			user?.lastName \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 19 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			user?.email \|\| |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 20 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 			'Unknown User' |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 25 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: users infra path | 	<UserAvatar {user} size={avatarSize} /> |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 28 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 		{#if showEmail && user?.email} |
| `src/lib/infrastructure/users/components/UserProfile.svelte` | 29 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			<span class="text-label text-secondary">{user.email}</span> |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 14 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | import type { UserProfile, LinkedAccount } from '../api'; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 17 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export interface UseUserQueriesOptions { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 21 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export interface UseUserQueriesReturn { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 22 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	get currentUser(): UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 23 | `string` | 4 | `User, user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 	getUserById(userId: Id<'users'>): UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 26 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	currentUserQuery: ReturnType<typeof useQuery> \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 49 | `code` | 3 | `User` | `system_auth` | `medium` | Auth signals: users infra path | export function useUserQueries(options: UseUserQueriesOptions): UseUserQueriesReturn { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 53 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	const currentUserQuery = |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 55 | `code` | 2 | `users, User` | `system_auth` | `medium` | Auth signals: users infra path | 			? useQuery(api.core.users.index.getCurrentUser, () => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 65 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: users infra path | 			? useQuery(api.core.users.index.listLinkedAccounts, () => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 73 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	const isLoading = $derived(currentUserQuery ? currentUserQuery.data === undefined : false); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 76 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	const currentUser = $derived((): UserProfile \| null => { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 77 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		if (currentUserQuery?.data !== undefined) { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 78 | `code` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: users infra path | 			const user = currentUserQuery.data as UserProfile \| null; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 79 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: users infra path | 			return user; |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 97 | `string` | 4 | `User, user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 	function getUserById(userId: Id<'users'>): UserProfile \| null { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 98 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		const current = currentUser(); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 99 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: users infra path, userId | 		if (current && current.userId === userId) { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 107 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		get currentUser() { |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 108 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 			return currentUser(); |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 110 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		getUserById, |
| `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts` | 117 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		currentUserQuery |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 15 | `code` | 1 | `Users` | `system_auth` | `medium` | Auth signals: users infra path | import type { UsersInfrastructureAPI } from '../api'; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 16 | `string` | 2 | `User` | `system_auth` | `medium` | Auth signals: users infra path | import { useUserQueries } from './useUserQueries.svelte'; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 19 | `code` | 1 | `Users` | `system_auth` | `medium` | Auth signals: users infra path | export type UseUsersOptions = { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 23 | `code` | 2 | `Users` | `system_auth` | `medium` | Auth signals: users infra path | export type UseUsers = ReturnType<typeof useUsers>; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 51 | `code` | 3 | `Users` | `system_auth` | `medium` | Auth signals: users infra path | export function useUsers(options: UseUsersOptions): UsersInfrastructureAPI { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 56 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 	const queries = useUserQueries({ |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 69 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 		userId: Id<'users'>, |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 83 | `code` | 2 | `users, User` | `system_auth` | `medium` | Auth signals: users infra path | 			await convexClient.mutation(api.core.users.index.updateUserProfile, { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 85 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: users infra path, userId | 				targetUserId: userId, |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 111 | `code` | 2 | `users, Users` | `system_auth` | `medium` | Auth signals: users infra path | 	const usersApi: UsersInfrastructureAPI = { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 112 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 		get currentUser() { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 113 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: users infra path | 			return queries.currentUser; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 115 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: users infra path, Convex users id type, userId | 		getUserById(userId: Id<'users'>) { |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 116 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: users infra path, userId | 			return queries.getUserById(userId); |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 128 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: users infra path | 	return usersApi; |
| `src/lib/infrastructure/users/composables/useUsers.svelte.ts` | 132 | `code` | 2 | `Users, User` | `system_auth` | `medium` | Auth signals: users infra path | export type { UsersInfrastructureAPI, UserProfile, LinkedAccount } from '../api'; |
| `src/lib/modules/core/components/Sidebar.svelte` | 140 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					if (!account.userId) continue; |
| `src/lib/modules/core/components/Sidebar.svelte` | 143 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${account.userId}`; |
| `src/lib/modules/core/components/Sidebar.svelte` | 151 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 								const currentOrgs = linkedAccountOrgsMap[account.userId]; |
| `src/lib/modules/core/components/Sidebar.svelte` | 153 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 									linkedAccountOrgsMap[account.userId] = orgs; |
| `src/lib/modules/core/components/Sidebar.svelte` | 162 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 						if (linkedAccountOrgsMap[account.userId]) { |
| `src/lib/modules/core/components/Sidebar.svelte` | 163 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 							delete linkedAccountOrgsMap[account.userId]; |
| `src/lib/modules/core/components/Sidebar.svelte` | 201 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 			const currentUserId = authSession.user?.userId; |
| `src/lib/modules/core/components/Sidebar.svelte` | 221 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: account.userId, |
| `src/lib/modules/core/components/Sidebar.svelte` | 567 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 					const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 577 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 						await authSession.switchAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 589 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 				onLogoutAccount={(targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 590 | `code` | 1 | `User` | `system_auth` | `high` | Auth signals: session, logout | 					authSession.logoutAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 948 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 				const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 959 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 					await authSession.switchAccount(targetUserId); |
| `src/lib/modules/core/components/Sidebar.svelte` | 971 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 			onLogoutAccount={(targetUserId) => { |
| `src/lib/modules/core/components/Sidebar.svelte` | 972 | `code` | 1 | `User` | `system_auth` | `high` | Auth signals: session, logout | 				authSession.logoutAccount(targetUserId); |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 18 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 39 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: logout | 		onLogoutAccount?: (targetUserId: string) => void; |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 162 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: logout | 				onLogoutAccount={(targetUserId) => onLogoutAccount?.(targetUserId)} |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 100 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			const userId = getUserId(); |
| `src/lib/modules/core/composables/useTagging.svelte.ts` | 101 | `string` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			invariant(userId, 'User ID is required'); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 15 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	let userId: any; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 19 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (userId) { |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 21 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 27 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 28 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 43 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 44 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 66 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId: testUserId } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 67 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 107 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 108 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts` | 128 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId = null; |
| `src/lib/modules/flashcards/components/FlashcardMetadata.svelte` | 34 | `code` | 3 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	const getUserId = () => $page.data.user?.userId; |
| `src/lib/modules/flashcards/components/FlashcardMetadata.svelte` | 45 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 	const tagging = coreAPI?.useTagging('flashcard', getUserId, getSessionId, () => |
| `src/lib/modules/flashcards/composables/useStudySession.svelte.ts` | 16 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 34 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 35 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 46 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 50 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 52 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 99 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 103 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 105 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 168 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 172 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 174 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 206 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 210 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 212 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 250 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 251 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 262 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 266 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 268 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 321 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 325 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 327 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 384 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 385 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 390 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 392 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: user2 }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 443 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 447 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 449 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 513 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 517 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 519 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 564 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 565 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 576 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 580 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 582 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 629 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 633 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 635 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 680 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 681 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 685 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 687 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 733 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 737 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 739 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 783 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 787 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 789 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 831 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 838 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 842 | `code` | 4 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: user1, orgId: org1 }, { userId: user2, orgId: org2 }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 32 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 33 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 44 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 48 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 50 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 89 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 93 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 95 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 128 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 132 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 151 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 153 | `code` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: otherUserId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 172 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 173 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 184 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 188 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 190 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 228 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 232 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 234 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 272 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 276 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 278 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 311 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 315 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 334 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: otherSessionId, userId: otherUserId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | 336 | `code` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }, { userId: otherUserId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 24 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 29 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 30 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 45 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 49 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 51 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 83 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 87 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 89 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 118 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 122 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 124 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 161 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 165 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 167 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 199 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 203 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 205 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 238 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 242 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 244 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 277 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 281 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 283 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 313 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 317 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 319 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 352 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 356 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 359 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 365 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 366 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: userId2 }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 412 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 417 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 419 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 422 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 423 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: attendeeId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 441 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 446 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: attendeeId |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 465 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 470 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 472 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 474 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: attendeeSessionId, userId: attendeeId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 478 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: attendeeId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 519 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 523 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 526 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: _sessionId2, userId: userId2 } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 532 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 533 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: userId2 }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 582 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 587 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 589 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 626 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 632 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 634 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 666 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 672 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const templateId = await createTestMeetingTemplate(t, orgId, userId); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 674 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 27 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 28 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 43 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 47 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 73 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 77 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 106 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 110 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 139 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 143 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 172 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 176 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 214 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 218 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 252 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 256 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 314 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 318 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 367 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 371 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 432 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 441 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId: org1 }); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 479 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts` | 483 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `src/lib/modules/projects/api.ts` | 31 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	createdBy: Id<'users'>; |
| `src/lib/modules/projects/api.ts` | 79 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: Id<'users'>; |
| `src/lib/modules/projects/composables/useTasks.svelte.ts` | 25 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `src/lib/types/convex.ts` | 77 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 93 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 111 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/types/convex.ts` | 118 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/lib/utils/errorReporting.ts` | 24 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId?: string; |
| `src/lib/utils/errorReporting.ts` | 45 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: _userId |
| `src/lib/utils/errorReporting.ts` | 107 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	userId?: string, |
| `src/lib/utils/errorReporting.ts` | 117 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				user_id: userId, |
| `src/routes/(authenticated)/+layout.svelte` | 52 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: () => data.user?.userId, |
| `src/routes/(authenticated)/+layout.svelte` | 170 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId: data.user?.userId ?? null, |
| `src/routes/(authenticated)/+layout.svelte` | 174 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 				workosId: data.user?.workosId ?? null, |
| `src/routes/(authenticated)/account/+page.svelte` | 6 | `string` | 3 | `User, users` | `system_auth` | `medium` | Auth signals: users infra path | 	import UserProfile from '$lib/infrastructure/users/components/UserProfile.svelte'; |
| `src/routes/(authenticated)/account/+page.svelte` | 7 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: users infra path | 	import type { LinkedAccount } from '$lib/infrastructure/users/api'; |
| `src/routes/(authenticated)/account/+page.svelte` | 8 | `string` | 3 | `User, users` | `system_auth` | `medium` | Auth signals: users infra path | 	import type { UserProfile as UserProfileType } from '$lib/infrastructure/users/api'; |
| `src/routes/(authenticated)/account/+page.svelte` | 27 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 			if (currentUser?.userId) { |
| `src/routes/(authenticated)/account/+page.svelte` | 30 | `code` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 					userId: currentUser.userId |
| `src/routes/(authenticated)/account/+page.svelte` | 105 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 							{#each linkedAccounts as account (account.userId)} |
| `src/routes/(authenticated)/admin/+error.svelte` | 11 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	let linkedAccounts = $state<Array<{ userId: string; email: string; name: string }>>([]); |
| `src/routes/(authenticated)/admin/+error.svelte` | 25 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 					(session: { userId: string; email: string; userName?: string }) => ({ |
| `src/routes/(authenticated)/admin/+error.svelte` | 26 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 						userId: session.userId, |
| `src/routes/(authenticated)/admin/+error.svelte` | 28 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 						name: session.userName \|\| session.email |
| `src/routes/(authenticated)/admin/+error.svelte` | 48 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 			await authSession.switchAccount(targetUserId, redirectUrl); |
| `src/routes/(authenticated)/admin/+error.svelte` | 113 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					{#each linkedAccounts as account (account.userId)} |
| `src/routes/(authenticated)/admin/+error.svelte` | 116 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 							onclick={() => switchAccount(account.userId)} |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 78 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 110 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 156 | `code` | 1 | `userS` | `system_auth` | `medium` | Auth signals: session | 		if (!userSearchQuery.trim() \|\| !sessionId) return; |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 328 | `string` | 3 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					formAllowedUserIds.length > 0 ? (formAllowedUserIds as Id<'users'>[]) : undefined, |
| `src/routes/(authenticated)/admin/rbac/+page.server.ts` | 31 | `code` | 2 | `users, Users` | `system_auth` | `medium` | Auth signals: session | 			client.query(api.admin.users.listAllUsers, { sessionId }).catch(() => []) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.server.ts` | 22 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 				targetUserId: params.id as Id<'users'> |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 16 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 	let users: unknown[] = []; |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 18 | `code` | 3 | `users, Users` | `system_auth` | `high` | Auth signals: admin users path, session | 		const usersResult = await client.query(api.admin.users.listAllUsers, { sessionId }); |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 19 | `code` | 2 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 		users = (usersResult as unknown[]) ?? []; |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 21 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 		console.warn('Failed to load users:', error); |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 25 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: admin users path | 		user: locals.auth.user, |
| `src/routes/(authenticated)/admin/users/+page.server.ts` | 27 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 		users |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 6 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 	const users = $derived( |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 7 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 		(data.users \|\| []) as Array<{ |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 18 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: admin users path | 	<title>User Management - Admin - SynergyOS</title> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 24 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: admin users path | 		<h1 class="text-h2 text-primary font-bold">User Management</h1> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 25 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: admin users path | 		<p class="mt-form-field-gap text-small text-secondary">View and manage all users</p> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 52 | `code` | 3 | `users, user` | `system_auth` | `medium` | Auth signals: admin users path | 					{#each users as user (user._id)} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 54 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: admin users path | 							<td class="px-card py-form-field-gap text-small text-primary">{user.email}</td> |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 55 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: admin users path | 							<td class="px-card py-form-field-gap text-small text-secondary">{user.name \|\| '-'}</td |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 58 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: admin users path | 								{new Date(user.createdAt).toLocaleDateString()} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 61 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: admin users path, login | 								{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'} |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 65 | `string` | 2 | `users, user` | `system_auth` | `medium` | Auth signals: admin users path | 									href="/admin/rbac/users/{user._id}" |
| `src/routes/(authenticated)/onboarding/+layout.svelte` | 22 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: () => data.user?.userId, |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 5 | `code` | 3 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 	const getUserId = () => data.user?.userId; |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 46 | `code` | 1 | `UserS` | `system_auth` | `medium` | Auth signals: session | 			const data = await convexClient.query(getUserSettings, { sessionId }); |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 43 | `code` | 1 | `UserS` | `system_auth` | `medium` | Auth signals: session | 			const data = await convexClient.query(getUserSettings, { sessionId }); |
| `src/routes/(authenticated)/w/[slug]/+layout.svelte` | 26 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: () => data.user?.userId, |
| `src/routes/(authenticated)/w/[slug]/meetings/[id]/+page.server.ts` | 19 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: parentData.user.userId, |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 50 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 58 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 70 | `string` | 1 | `users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 73 | `string` | 1 | `users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>> |
| `src/routes/+layout.svelte` | 57 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			posthog.identify(data.user.userId, { |
| `src/routes/auth/callback/+server.ts` | 45 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			primaryUserId |
| `src/routes/auth/callback/+server.ts` | 54 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ Authorization code exchanged, user:', authResponse.user.email); |
| `src/routes/auth/callback/+server.ts` | 56 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/callback/+server.ts` | 59 | `code` | 3 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/callback/+server.ts` | 61 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 62 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 63 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/callback/+server.ts` | 64 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/callback/+server.ts` | 65 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			emailVerified: authResponse.user.email_verified ?? true |
| `src/routes/auth/callback/+server.ts` | 68 | `string` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/callback/+server.ts` | 76 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (linkAccount && primaryUserId && primaryUserId !== convexUserId) { |
| `src/routes/auth/callback/+server.ts` | 78 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			const existingUserId = event.locals.auth?.user?.userId; |
| `src/routes/auth/callback/+server.ts` | 79 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			if (!existingSessionId \|\| !existingUserId \|\| existingUserId !== primaryUserId) { |
| `src/routes/auth/callback/+server.ts` | 84 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 				await convex.mutation(api.core.users.index.linkAccounts, { |
| `src/routes/auth/callback/+server.ts` | 86 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					targetUserId: convexUserId |
| `src/routes/auth/callback/+server.ts` | 96 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/callback/+server.ts` | 97 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 103 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/callback/+server.ts` | 104 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/callback/+server.ts` | 105 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 106 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 107 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 108 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 110 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/callback/+server.ts` | 111 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/callback/+server.ts` | 112 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/callback/+server.ts` | 115 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/callback/+server.ts` | 131 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/callback/+server.ts` | 132 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 137 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/callback/+server.ts` | 138 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/callback/+server.ts` | 139 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/callback/+server.ts` | 140 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/callback/+server.ts` | 141 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 142 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/callback/+server.ts` | 144 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/callback/+server.ts` | 145 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/callback/+server.ts` | 146 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/callback/+server.ts` | 156 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/callback/+server.ts` | 166 | `code` | 3 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userId: event.locals.auth.user?.userId |
| `src/routes/auth/linked-sessions/+server.ts` | 6 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/linked-sessions/+server.ts` | 17 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		hasUser: !!auth?.user, |
| `src/routes/auth/linked-sessions/+server.ts` | 18 | `code` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		currentUserId: auth?.user?.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 19 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		currentUserEmail: auth?.user?.email |
| `src/routes/auth/linked-sessions/+server.ts` | 22 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/linked-sessions/+server.ts` | 34 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		const linkedAccounts = await convex.query(api.core.users.index.listLinkedAccounts, { |
| `src/routes/auth/linked-sessions/+server.ts` | 40 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: a.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 48 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 52 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userEmail: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 53 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userName?: string; |
| `src/routes/auth/linked-sessions/+server.ts` | 66 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 69 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 				const sessionRecord = await getActiveSessionRecordForUser({ |
| `src/routes/auth/linked-sessions/+server.ts` | 71 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 					targetUserId: account.userId |
| `src/routes/auth/linked-sessions/+server.ts` | 74 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 89 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 100 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 111 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 115 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userEmail: account.email ?? '', |
| `src/routes/auth/linked-sessions/+server.ts` | 116 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userName: account.name ?? undefined, |
| `src/routes/auth/linked-sessions/+server.ts` | 128 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 135 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 142 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userId: account.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 152 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: s.userId, |
| `src/routes/auth/linked-sessions/+server.ts` | 153 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				email: s.userEmail, |
| `src/routes/auth/login/+server.ts` | 42 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('🔍 Authenticating user:', email); |
| `src/routes/auth/login/+server.ts` | 49 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/login/+server.ts` | 55 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/login/+server.ts` | 58 | `code` | 3 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/login/+server.ts` | 60 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 61 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 62 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/login/+server.ts` | 63 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/login/+server.ts` | 64 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			emailVerified: authResponse.user.email_verified ?? true |
| `src/routes/auth/login/+server.ts` | 67 | `string` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/login/+server.ts` | 78 | `string` | 4 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | 			const primaryUserId = event.locals.auth?.user?.userId as Id<'users'> \| undefined; |
| `src/routes/auth/login/+server.ts` | 80 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			if (!primaryUserId) { |
| `src/routes/auth/login/+server.ts` | 81 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				console.error('❌ No primary user in session for linking'); |
| `src/routes/auth/login/+server.ts` | 96 | `code` | 3 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 				console.log('🔗 Linking accounts:', { primaryUserId, linkedUserId: convexUserId }); |
| `src/routes/auth/login/+server.ts` | 99 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 				await convex.mutation(api.core.users.index.linkAccounts, { |
| `src/routes/auth/login/+server.ts` | 101 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					targetUserId: convexUserId |
| `src/routes/auth/login/+server.ts` | 115 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/login/+server.ts` | 116 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 123 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 124 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 125 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 126 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 127 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 128 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 130 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 131 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 132 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 135 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					userAgent: event.request.headers.get('user-agent') ?? undefined |
| `src/routes/auth/login/+server.ts` | 144 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 					convexUserId, |
| `src/routes/auth/login/+server.ts` | 145 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 					workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 150 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 					userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 151 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 152 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 153 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 154 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 155 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 157 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 							authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 158 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 159 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 								: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 205 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/login/+server.ts` | 206 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 211 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/login/+server.ts` | 212 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/login/+server.ts` | 213 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/login/+server.ts` | 214 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/login/+server.ts` | 215 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 216 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/login/+server.ts` | 218 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/login/+server.ts` | 219 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/login/+server.ts` | 220 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/login/+server.ts` | 232 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			console.log('🔍 User logged in from invite link, accepting invite:', inviteCode); |
| `src/routes/auth/login/+server.ts` | 289 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					activeWorkspaceId: event.locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/login/+server.ts` | 297 | `code` | 3 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						userId: event.locals.auth.user?.userId |
| `src/routes/auth/redirect/+server.ts` | 23 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			activeWorkspaceId: locals.auth.user?.activeWorkspace?.id ?? null |
| `src/routes/auth/redirect/+server.ts` | 28 | `code` | 3 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: locals.auth.user?.userId |
| `src/routes/auth/register/+server.ts` | 48 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			console.error('❌ Password contains email username:', emailLocalPart); |
| `src/routes/auth/register/+server.ts` | 58 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const { getUserByEmail } = await import('$lib/infrastructure/auth/server/workos'); |
| `src/routes/auth/register/+server.ts` | 59 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const existingUser = await getUserByEmail(email); |
| `src/routes/auth/register/+server.ts` | 60 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		if (existingUser) { |
| `src/routes/auth/register/+server.ts` | 84 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') ?? undefined, |
| `src/routes/auth/register/register.test.ts` | 41 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'short'); |
| `src/routes/auth/register/register.test.ts` | 47 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'LongPass1!'); |
| `src/routes/auth/register/register.test.ts` | 52 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'VeryLongPassword123!'); |
| `src/routes/auth/register/register.test.ts` | 58 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should reject password containing full email username', () => { |
| `src/routes/auth/register/register.test.ts` | 64 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should reject password containing email username with alias', () => { |
| `src/routes/auth/register/register.test.ts` | 70 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should reject password containing email username regardless of case', () => { |
| `src/routes/auth/register/register.test.ts` | 76 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should reject password with email username in the middle', () => { |
| `src/routes/auth/register/register.test.ts` | 82 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should accept password that does not contain email username', () => { |
| `src/routes/auth/register/register.test.ts` | 87 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		it('should accept password when email username is less than 4 chars', () => { |
| `src/routes/auth/register/register.test.ts` | 101 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('user+test+alias@example.com', 'userpassword123'); |
| `src/routes/auth/register/register.test.ts` | 107 | `string` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('TestUser@Example.com', 'testuser123'); |
| `src/routes/auth/register/register.test.ts` | 113 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			const result = validatePassword('user@example.com', 'C0mpl3x!P@ssw0rd'); |
| `src/routes/auth/resend-code/+server.ts` | 44 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') ?? undefined, |
| `src/routes/auth/restore/+server.ts` | 8 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/restore/+server.ts` | 17 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const targetUserId = body.userId as Id<'users'> \| undefined; |
| `src/routes/auth/restore/+server.ts` | 19 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!targetUserId) { |
| `src/routes/auth/restore/+server.ts` | 20 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return json({ error: 'Missing userId' }, { status: 400 }); |
| `src/routes/auth/restore/+server.ts` | 29 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		const targetSession = await getActiveSessionRecordForUser({ |
| `src/routes/auth/restore/+server.ts` | 31 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			targetUserId |
| `src/routes/auth/restore/+server.ts` | 45 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId: targetSession.convexUserId, |
| `src/routes/auth/restore/+server.ts` | 46 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: targetSession.workosUserId, |
| `src/routes/auth/restore/+server.ts` | 51 | `code` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: targetSession.userSnapshot |
| `src/routes/auth/restore/+server.ts` | 54 | `string` | 2 | `user, userS` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ Session restored for user:', targetSession.userSnapshot.email); |
| `src/routes/auth/session/+server.ts` | 7 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/session/+server.ts` | 21 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			user: auth.user, |
| `src/routes/auth/start/+server.ts` | 11 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | const WORKOS_AUTHORIZE_URL = 'https://api.workos.com/user_management/authorize'; |
| `src/routes/auth/start/+server.ts` | 103 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const primaryUserId = |
| `src/routes/auth/start/+server.ts` | 104 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		linkAccount && event.locals.auth.user?.userId |
| `src/routes/auth/start/+server.ts` | 105 | `string` | 3 | `user, users` | `system_auth` | `high` | Auth-domain file pattern match | 			? (event.locals.auth.user.userId as Id<'users'>) |
| `src/routes/auth/start/+server.ts` | 126 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		primaryUserId, |
| `src/routes/auth/start/+server.ts` | 128 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/switch/+server.ts` | 7 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | import { getActiveSessionRecordForUser } from '$lib/infrastructure/auth/server/sessionStore'; |
| `src/routes/auth/switch/+server.ts` | 29 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!event.locals.auth.sessionId \|\| !event.locals.auth.user?.userId) { |
| `src/routes/auth/switch/+server.ts` | 48 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		!(payload as { targetUserId?: unknown }).targetUserId \|\| |
| `src/routes/auth/switch/+server.ts` | 49 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		typeof (payload as { targetUserId: unknown }).targetUserId !== 'string' |
| `src/routes/auth/switch/+server.ts` | 51 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return json({ error: 'Missing target user' }, { status: 400 }); |
| `src/routes/auth/switch/+server.ts` | 54 | `string` | 4 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const targetUserId = (payload as { targetUserId: string }).targetUserId as Id<'users'>; |
| `src/routes/auth/switch/+server.ts` | 60 | `string` | 4 | `User, user, users` | `system_auth` | `high` | Auth-domain file pattern match | 	const currentUserId = event.locals.auth.user.userId as Id<'users'>; |
| `src/routes/auth/switch/+server.ts` | 62 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (targetUserId === currentUserId) { |
| `src/routes/auth/switch/+server.ts` | 68 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: currentUserId |
| `src/routes/auth/switch/+server.ts` | 81 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 	const linkStatus = await convex.query(api.core.users.index.validateAccountLink, { |
| `src/routes/auth/switch/+server.ts` | 83 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId |
| `src/routes/auth/switch/+server.ts` | 97 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const targetSession = await getActiveSessionRecordForUser({ |
| `src/routes/auth/switch/+server.ts` | 99 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		targetUserId |
| `src/routes/auth/switch/+server.ts` | 116 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		convexUserId: targetSession.convexUserId, |
| `src/routes/auth/switch/+server.ts` | 117 | `code` | 2 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		workosUserId: targetSession.workosUserId, |
| `src/routes/auth/switch/+server.ts` | 122 | `code` | 2 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 		userSnapshot: targetSession.userSnapshot |
| `src/routes/auth/switch/+server.ts` | 133 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 			userId: currentUserId |
| `src/routes/auth/token/+server.ts` | 18 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!locals.auth.sessionId \|\| !locals.auth.user) { |
| `src/routes/auth/unlink-account/+server.ts` | 21 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!auth?.sessionId \|\| !auth.user) { |
| `src/routes/auth/unlink-account/+server.ts` | 31 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const body = (await request.json()) as { targetUserId?: string }; |
| `src/routes/auth/unlink-account/+server.ts` | 32 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	const { targetUserId } = body; |
| `src/routes/auth/unlink-account/+server.ts` | 34 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	if (!targetUserId) { |
| `src/routes/auth/unlink-account/+server.ts` | 35 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		return json({ error: 'Target user ID is required' }, { status: 400 }); |
| `src/routes/auth/unlink-account/+server.ts` | 44 | `code` | 1 | `users` | `system_auth` | `high` | Auth-domain file pattern match | 		await convex.mutation(api.core.users.index.unlinkAccounts, { |
| `src/routes/auth/unlink-account/+server.ts` | 46 | `string` | 3 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 			targetUserId: targetUserId as Id<'users'> |
| `src/routes/auth/verify-email/+server.ts` | 6 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 	createUserWithPassword, |
| `src/routes/auth/verify-email/+server.ts` | 69 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('🔍 Creating WorkOS user:', email); |
| `src/routes/auth/verify-email/+server.ts` | 72 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		await createUserWithPassword({ |
| `src/routes/auth/verify-email/+server.ts` | 79 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ User created, now authenticating...'); |
| `src/routes/auth/verify-email/+server.ts` | 86 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			userAgent: event.request.headers.get('user-agent') |
| `src/routes/auth/verify-email/+server.ts` | 89 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ User authenticated after registration'); |
| `src/routes/auth/verify-email/+server.ts` | 92 | `string` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('🔍 Syncing user to Convex...'); |
| `src/routes/auth/verify-email/+server.ts` | 94 | `code` | 3 | `User, users` | `system_auth` | `high` | Auth-domain file pattern match | 		const convexUserId = await convex.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `src/routes/auth/verify-email/+server.ts` | 96 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 97 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			email: authResponse.user.email, |
| `src/routes/auth/verify-email/+server.ts` | 98 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			firstName: authResponse.user.first_name, |
| `src/routes/auth/verify-email/+server.ts` | 99 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 			lastName: authResponse.user.last_name, |
| `src/routes/auth/verify-email/+server.ts` | 103 | `string` | 3 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 		console.log('✅ User synced to Convex, userId:', convexUserId); |
| `src/routes/auth/verify-email/+server.ts` | 113 | `code` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			convexUserId, |
| `src/routes/auth/verify-email/+server.ts` | 114 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth-domain file pattern match | 			workosUserId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 119 | `code` | 1 | `userS` | `system_auth` | `high` | Auth-domain file pattern match | 			userSnapshot: { |
| `src/routes/auth/verify-email/+server.ts` | 120 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth-domain file pattern match | 				userId: convexUserId, |
| `src/routes/auth/verify-email/+server.ts` | 121 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				workosId: authResponse.user.id, |
| `src/routes/auth/verify-email/+server.ts` | 122 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				email: authResponse.user.email, |
| `src/routes/auth/verify-email/+server.ts` | 123 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				firstName: authResponse.user.first_name ?? undefined, |
| `src/routes/auth/verify-email/+server.ts` | 124 | `code` | 1 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 				lastName: authResponse.user.last_name ?? undefined, |
| `src/routes/auth/verify-email/+server.ts` | 126 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 					authResponse.user.first_name && authResponse.user.last_name |
| `src/routes/auth/verify-email/+server.ts` | 127 | `string` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						? `${authResponse.user.first_name} ${authResponse.user.last_name}` |
| `src/routes/auth/verify-email/+server.ts` | 128 | `code` | 2 | `user` | `system_auth` | `high` | Auth-domain file pattern match | 						: (authResponse.user.first_name ?? authResponse.user.last_name ?? undefined) |
| `src/routes/auth/verify-email/+server.ts` | 143 | `string` | 1 | `User` | `system_auth` | `high` | Auth-domain file pattern match | 			console.log('🔍 User registered from invite link, accepting invite:', inviteCode); |
| `src/routes/settings/+page.svelte` | 51 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: string; |
| `src/routes/settings/+page.svelte` | 121 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/settings/+page.svelte` | 129 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 					Id<'users'> |
| `src/routes/settings/+page.svelte` | 139 | `string` | 1 | `users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/settings/+page.svelte` | 142 | `string` | 1 | `users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>, |
| `src/routes/settings/+page.svelte` | 212 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					userId: '', // Not needed for display |
| `src/routes/settings/permissions-test/+page.svelte` | 14 | `code` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const userId = $derived($page.data.user?.userId); |
| `src/routes/settings/permissions-test/+page.svelte` | 44 | `string` | 4 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 		userId: () => (userId ? (userId as Id<'users'>) : null), |
| `src/routes/settings/permissions-test/+page.svelte` | 62 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (!convexClient \|\| !orgId \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 92 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (!convexClient \|\| !orgId \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 122 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (!convexClient \|\| !userId) { |
| `src/routes/settings/permissions-test/+page.svelte` | 136 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 				targetUserId: userId as Id<'users'>, |
| `src/routes/settings/permissions-test/+page.svelte` | 190 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				<dd class="font-code text-body text-primary">{userId ?? 'Not logged in'}</dd> |
| `src/routes/settings/permissions-test/+page.svelte` | 333 | `string` | 2 | `user, USER` | `system_auth` | `medium` | Auth signals: , userId | 							>npx convex run rbac/setupAdmin:setupAdmin '{'{'}userId:"YOUR_USER_ID"}'</code |
| `tests/composables/fixtures/TestComponent.svelte` | 23 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId: userIdProp = () => undefined, |
| `tests/composables/fixtures/TestComponent.svelte` | 29 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId?: () => string \| undefined; |
| `tests/composables/fixtures/TestComponent.svelte` | 38 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const userId = () => userIdProp(); |
| `tests/composables/fixtures/TestComponent.svelte` | 43 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId, |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 12 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | export function createMockLocalStorage(userId?: string): Storage { |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 16 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		return userId ? `${key}_${userId}` : key; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 34 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				if (!userId \|\| key.endsWith(`_${userId}`)) { |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 57 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId?: string; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 61 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const { userId, urlSearch = '' } = options; |
| `tests/composables/test-utils/mockBrowser.svelte.ts` | 64 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const mockStorage = createMockLocalStorage(userId); |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 196 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 207 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/composables/test-utils/mockConvex.svelte.ts` | 219 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId: 'user-1', |
| `tests/convex/integration/invariants.integration.test.ts` | 33 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const userId = await t.run(async (ctx) => { |
| `tests/convex/integration/invariants.integration.test.ts` | 34 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 			return await ctx.db.insert('users', { |
| `tests/convex/integration/invariants.integration.test.ts` | 49 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/rbac.integration.test.ts` | 26 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const cleanupQueue: Array<{ userId?: any; orgId?: any }> = []; |
| `tests/convex/integration/rbac.integration.test.ts` | 31 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			if (item.userId) { |
| `tests/convex/integration/rbac.integration.test.ts` | 32 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				await cleanupTestData(t, item.userId); |
| `tests/convex/integration/rbac.integration.test.ts` | 43 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 44 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 61 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 62 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 81 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 82 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 114 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: adminUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 124 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: adminUserId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 136 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 148 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 152 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 153 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				resourceOwnerId: userId |
| `tests/convex/integration/rbac.integration.test.ts` | 160 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: otherUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 161 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: otherUserId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 164 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 174 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: teamLeadUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 196 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId: teamLeadUserId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 213 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 214 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 219 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 				return await requirePermission(ctx, userId, 'users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 226 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 246 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId, orgId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 250 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/rbac.integration.test.ts` | 251 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				resourceOwnerId: userId |
| `tests/convex/integration/rbac.integration.test.ts` | 265 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 266 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 269 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.view'); |
| `tests/convex/integration/rbac.integration.test.ts` | 277 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 278 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		const { userId: otherUserId } = await createTestSession(t); |
| `tests/convex/integration/rbac.integration.test.ts` | 290 | `code` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push({ userId }, { userId: otherUserId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 294 | `string` | 2 | `user, users` | `system_auth` | `medium` | Auth signals: , userId | 			return await hasPermission(ctx, userId, 'users.manage-profile', { |
| `tests/convex/integration/setup.ts` | 24 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 32 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	const userId = await t.run(async (ctx) => { |
| `tests/convex/integration/setup.ts` | 33 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: insert users table | 		return await ctx.db.insert('users', { |
| `tests/convex/integration/setup.ts` | 51 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 			convexUserId: userId, |
| `tests/convex/integration/setup.ts` | 52 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: WorkOS | 			workosUserId: `test_workos_${uniqueId}`, |
| `tests/convex/integration/setup.ts` | 61 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/setup.ts` | 84 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 110 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 116 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `tests/convex/integration/setup.ts` | 151 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 166 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `tests/convex/integration/setup.ts` | 169 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			userId, |
| `tests/convex/integration/setup.ts` | 170 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			email: (user as any)?.email ?? `user-${userId}@example.com`, |
| `tests/convex/integration/setup.ts` | 187 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `tests/convex/integration/setup.ts` | 207 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	createdBy: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 228 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 	invitedBy: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 231 | `string` | 2 | `User, users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		invitedUserId?: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 301 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'>, |
| `tests/convex/integration/setup.ts` | 306 | `string` | 1 | `users` | `system_auth` | `medium` | Auth signals: Convex users id type | 		assignedBy?: Id<'users'>; |
| `tests/convex/integration/setup.ts` | 320 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 333 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 					.withIndex('by_user', (q) => q.eq('userId', context.assignedBy!)) |
| `tests/convex/integration/setup.ts` | 349 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				userId, |
| `tests/convex/integration/setup.ts` | 352 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 				grantedBy: context?.assignedBy ?? userId // Default to self-assignment for tests |
| `tests/convex/integration/setup.ts` | 380 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | export async function cleanupTestData(t: TestConvex<any>, userId?: Id<'users'>): Promise<void> { |
| `tests/convex/integration/setup.ts` | 381 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	if (!userId) return; |
| `tests/convex/integration/setup.ts` | 387 | `string` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 			.filter((q) => q.eq(q.field('convexUserId'), userId)) |
| `tests/convex/integration/setup.ts` | 396 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 405 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.filter((q) => q.eq(q.field('invitedBy'), userId)) |
| `tests/convex/integration/setup.ts` | 414 | `string` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_primary', (q) => q.eq('primaryUserId', userId)) |
| `tests/convex/integration/setup.ts` | 423 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 449 | `string` | 3 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_user', (q) => q.eq('userId', userId)) |
| `tests/convex/integration/setup.ts` | 458 | `string` | 3 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 			.withIndex('by_convex_user', (q) => q.eq('convexUserId', userId)) |
| `tests/convex/integration/setup.ts` | 465 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		const user = await ctx.db.get(userId); |
| `tests/convex/integration/setup.ts` | 467 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			await ctx.db.delete(userId); |
| `tests/convex/integration/setup.ts` | 500 | `string` | 2 | `user, users` | `system_auth` | `high` | Auth signals: Convex users id type, userId | 	userId: Id<'users'> |
| `tests/convex/integration/tags.integration.test.ts` | 15 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 	let userId: any; |
| `tests/convex/integration/tags.integration.test.ts` | 19 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		if (userId) { |
| `tests/convex/integration/tags.integration.test.ts` | 21 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `tests/convex/integration/tags.integration.test.ts` | 28 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 34 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const tags = await t.query(api.features.tags.index.listUserTags, { sessionId }); |
| `tests/convex/integration/tags.integration.test.ts` | 44 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 50 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const tags = await t.query(api.features.tags.index.listUserTags, { sessionId }); |
| `tests/convex/integration/tags.integration.test.ts` | 62 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 80 | `code` | 2 | `user, User` | `system_auth` | `medium` | Auth signals: , userId | 		userId = testUserId; |
| `tests/convex/integration/tags.integration.test.ts` | 126 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		userId = null; // Prevent double cleanup |
| `tests/convex/integration/users.integration.test.ts` | 26 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		for (const userId of cleanupQueue) { |
| `tests/convex/integration/users.integration.test.ts` | 27 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			await cleanupTestData(t, userId); |
| `tests/convex/integration/users.integration.test.ts` | 32 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 	it('should sync user from WorkOS - create new user', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 35 | `code` | 3 | `user, users, User` | `system_auth` | `high` | Auth signals: WorkOS, userId | 		const userId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 43 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(userId).toBeDefined(); |
| `tests/convex/integration/users.integration.test.ts` | 44 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 48 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 56 | `string` | 2 | `user` | `system_auth` | `medium` | Auth signals: WorkOS | 	it('should sync user from WorkOS - update existing user', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 60 | `code` | 3 | `user, users, User` | `system_auth` | `high` | Auth signals: WorkOS, userId | 		const userId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 67 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 70 | `code` | 3 | `User, users` | `system_auth` | `medium` | Auth signals: WorkOS | 		const updatedUserId = await t.mutation(api.core.users.index.syncUserFromWorkOS, { |
| `tests/convex/integration/users.integration.test.ts` | 77 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(updatedUserId).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 80 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 87 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	it('should get user by ID with sessionId validation', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 89 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 90 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 93 | `code` | 3 | `user, users, User` | `system_auth` | `medium` | Auth signals: session | 		const user = await t.query(api.core.users.index.getUserById, { sessionId }); |
| `tests/convex/integration/users.integration.test.ts` | 96 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(user?._id).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 99 | `string` | 1 | `user` | `system_auth` | `medium` | Auth signals: session | 	it('should get current user with sessionId validation', async () => { |
| `tests/convex/integration/users.integration.test.ts` | 101 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 102 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 104 | `code` | 3 | `user, users, User` | `system_auth` | `medium` | Auth signals: session | 		const user = await t.query(api.core.users.index.getCurrentUser, { sessionId }); |
| `tests/convex/integration/users.integration.test.ts` | 107 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(user?._id).toBe(userId); |
| `tests/convex/integration/users.integration.test.ts` | 112 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 124 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 129 | `code` | 2 | `User, user` | `system_auth` | `medium` | Auth signals: , userId | 			targetUserId: userId, |
| `tests/convex/integration/users.integration.test.ts` | 137 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			return await ctx.db.get(userId); |
| `tests/convex/integration/users.integration.test.ts` | 147 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session1, userId: user1 } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 148 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: session2, userId: user2 } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 161 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: session | 		const links1 = await t.query(api.core.users.index.listLinkedAccounts, { sessionId: session1 }); |
| `tests/convex/integration/users.integration.test.ts` | 163 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(links1[0].userId).toBe(user2); |
| `tests/convex/integration/users.integration.test.ts` | 165 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: session | 		const links2 = await t.query(api.core.users.index.listLinkedAccounts, { sessionId: session2 }); |
| `tests/convex/integration/users.integration.test.ts` | 167 | `code` | 2 | `user` | `system_auth` | `medium` | Auth signals: , userId | 		expect(links2[0].userId).toBe(user1); |
| `tests/convex/integration/users.integration.test.ts` | 172 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: sessionA, userId: userA } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 173 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: sessionB, userId: userB } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 174 | `code` | 2 | `user` | `system_auth` | `high` | Auth signals: session, userId | 		const { sessionId: sessionC, userId: userC } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 202 | `code` | 2 | `users, user` | `system_auth` | `high` | Auth signals: session, userId | 		const users: Array<{ sessionId: string; userId: string }> = []; |
| `tests/convex/integration/users.integration.test.ts` | 206 | `code` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 			const { sessionId, userId } = await createTestSession(t); |
| `tests/convex/integration/users.integration.test.ts` | 207 | `code` | 2 | `users, user` | `system_auth` | `high` | Auth signals: session, userId | 			users.push({ sessionId, userId }); |
| `tests/convex/integration/users.integration.test.ts` | 208 | `code` | 1 | `user` | `system_auth` | `medium` | Auth signals: , userId | 			cleanupQueue.push(userId); |
| `tests/convex/integration/users.integration.test.ts` | 214 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: session | 				sessionId: users[i].sessionId, |
| `tests/convex/integration/users.integration.test.ts` | 215 | `code` | 3 | `User, users, user` | `system_auth` | `medium` | Auth signals: , userId | 				targetUserId: users[i + 1].userId |
| `tests/convex/integration/users.integration.test.ts` | 222 | `code` | 1 | `users` | `system_auth` | `medium` | Auth signals: session | 				sessionId: users[9].sessionId, |
| `tests/convex/integration/users.integration.test.ts` | 223 | `code` | 3 | `User, users, user` | `system_auth` | `medium` | Auth signals: , userId | 				targetUserId: users[10].userId |
| `tests/convex/sessionValidation.test.ts` | 14 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 	validateSessionAndGetUserId, |
| `tests/convex/sessionValidation.test.ts` | 45 | `string` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | describe('validateSessionAndGetUserId', () => { |
| `tests/convex/sessionValidation.test.ts` | 47 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 	const validUserId = 'user_abc123' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 50 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	it('should return userId for valid session', async () => { |
| `tests/convex/sessionValidation.test.ts` | 53 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 60 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const result = await validateSessionAndGetUserId(ctx, validSessionId); |
| `tests/convex/sessionValidation.test.ts` | 62 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		expect(result.userId).toBe(validUserId); |
| `tests/convex/sessionValidation.test.ts` | 69 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 77 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 85 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 93 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 101 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 109 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 117 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'nonexistent_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 124 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 	const validUserId = 'user_deprecated123' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 129 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 136 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const result = await validateSession(ctx, validUserId); |
| `tests/convex/sessionValidation.test.ts` | 139 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 		expect(result.convexUserId).toBe(validUserId); |
| `tests/convex/sessionValidation.test.ts` | 144 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: validUserId, |
| `tests/convex/sessionValidation.test.ts` | 152 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSession(ctx, validUserId)).rejects.toThrow('Session not found'); |
| `tests/convex/sessionValidation.test.ts` | 158 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 	const attackerUserId = 'user_attacker' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 159 | `string` | 3 | `User, user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type | 	const victimUserId = 'user_victim' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 162 | `string` | 1 | `user` | `system_auth` | `high` | Auth signals: session, userId | 	it('should prevent attacker from accessing victim data by passing victim userId', async () => { |
| `tests/convex/sessionValidation.test.ts` | 166 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: attackerUserId, |
| `tests/convex/sessionValidation.test.ts` | 176 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		const result = await validateSessionAndGetUserId(ctx, attackerSessionId); |
| `tests/convex/sessionValidation.test.ts` | 179 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		expect(result.userId).toBe(attackerUserId); |
| `tests/convex/sessionValidation.test.ts` | 181 | `code` | 2 | `user, User` | `system_auth` | `high` | Auth signals: session, userId | 		expect(result.userId).not.toBe(victimUserId); |
| `tests/convex/sessionValidation.test.ts` | 188 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'forged_session_id')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 197 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: victimUserId, |
| `tests/convex/sessionValidation.test.ts` | 205 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 214 | `code` | 2 | `User` | `system_auth` | `medium` | Auth signals: session | 			convexUserId: victimUserId, |
| `tests/convex/sessionValidation.test.ts` | 222 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow( |
| `tests/convex/sessionValidation.test.ts` | 231 | `string` | 3 | `user, users` | `system_auth` | `high` | Auth signals: session, Convex users id type, userId | 		const userId = 'perf_test_user' as Id<'users'>; |
| `tests/convex/sessionValidation.test.ts` | 236 | `code` | 2 | `User, user` | `system_auth` | `high` | Auth signals: session, userId | 			convexUserId: userId, |
| `tests/convex/sessionValidation.test.ts` | 257 | `code` | 1 | `User` | `system_auth` | `medium` | Auth signals: session | 		await validateSessionAndGetUserId(ctx, sessionId); |