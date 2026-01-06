---
title: Identity terminology audit (workspace): production code candidates
generatedAt: 2025-12-23T08:11:54.166Z
---

## Totals

| Scope | Count | doc | comment | string | code |
|---|---:|---:|---:|---:|---:|
| system_auth | 0 | 0 | 0 | 0 | 0 |
| workspace | 194 | 0 | 0 | 0 | 194 |
| unknown | 0 | 0 | 0 | 0 | 0 |

## Instances

| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |
|---|---:|---|---:|---|---|---|---|---|
| `convex/admin/rbac.ts` | 311 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			if (!role \|\| !user) continue; |
| `convex/admin/rbac.ts` | 813 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export const assignRoleToUser = mutation({ |
| `convex/core/people/mutations.ts` | 87 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | 					ErrorCodes.INVITE_USER_MISMATCH, |
| `convex/core/people/mutations.ts` | 114 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 		const existingByUser = await ctx.db |
| `convex/core/people/mutations.ts` | 121 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 		if (existingByUser && existingByUser.status !== 'archived') { |
| `convex/core/people/queries.ts` | 37 | `code` | 2 | `User, USER` | `workspace` | `high` | Workspace signals: person/people, people, people domain path | 	const linkedUser = activePerson[USER_ID_FIELD]; |
| `convex/core/people/queries.ts` | 38 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, people domain path | 	if (!linkedUser) { |
| `convex/core/people/queries.ts` | 41 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | 	return { person: activePerson, workspaceId: resolvedWorkspaceId, linkedUser }; |
| `convex/core/people/rules.ts` | 62 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, people domain path | 		return user?.email ?? null; |
| `convex/core/roles/mutations.ts` | 32 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleCreated, |
| `convex/core/roles/mutations.ts` | 33 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleRemoved, |
| `convex/core/roles/mutations.ts` | 34 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	handleUserCircleRoleRestored |
| `convex/core/roles/mutations.ts` | 102 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 		await handleUserCircleRoleRemoved(ctx, assignment._id); |
| `convex/core/roles/mutations.ts` | 414 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleRestored(ctx, args.assignmentId); |
| `convex/core/roles/mutations.ts` | 493 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleCreated( |
| `convex/core/roles/mutations.ts` | 546 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 	await handleUserCircleRoleRemoved(ctx, assignment._id); |
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
| `convex/core/workspaces/lifecycle.ts` | 135 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 136 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const emailField = (user as Record<string, unknown>).email; |
| `convex/core/workspaces/lifecycle.ts` | 141 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/lifecycle.ts` | 142 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const nameField = (user as Record<string, unknown>).name; |
| `convex/core/workspaces/lifecycle.ts` | 147 | `code` | 4 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/core/workspaces/lifecycle.ts` | 250 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/lifecycle.ts` | 253 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/lifecycle.ts` | 254 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/lifecycle.ts` | 261 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, workspace, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/members.ts` | 123 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) return null; |
| `convex/core/workspaces/members.ts` | 125 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const email = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 126 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const name = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 148 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	if (!user) { |
| `convex/core/workspaces/members.ts` | 162 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const userName = findUserNameField(user); |
| `convex/core/workspaces/members.ts` | 163 | `code` | 3 | `user, User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 	const userEmail = findUserEmailField(user); |
| `convex/core/workspaces/members.ts` | 170 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: people, workspace, member, workspaces domain path | 		email: undefined, // Email comes from user lookup, not stored per people/README.md |
| `convex/core/workspaces/settings.ts` | 19 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | export const getUserSettings = query({ |
| `convex/core/workspaces/settings.ts` | 352 | `code` | 1 | `UserS` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | export const getUserSettingsForSync = internalQuery({ |
| `convex/features/customFields/queries.ts` | 13 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace as _getPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/features/flashcards/index.ts` | 120 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people | 		return listUserFlashcards(ctx, personId, args.tagIds ?? undefined); |
| `convex/features/flashcards/repository.ts` | 50 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: personId, person/people, people | export async function getUserFlashcards(ctx: QueryCtx, personId: Id<'people'>) { |
| `convex/features/invites/helpers.ts` | 15 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	ensureUserNotAlreadyMember |
| `convex/features/invites/helpers.ts` | 32 | `code` | 4 | `User, user` | `workspace` | `medium` | Workspace signals: member | 	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member'; |
| `convex/features/invites/helpers.ts` | 77 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	await ensureNoExistingUserInvite(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 78 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 	await ensureUserNotAlreadyMember(ctx, args.workspaceId, args.invitedUserId); |
| `convex/features/invites/helpers.ts` | 176 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: people | 			email: null, // Email comes from user lookup, not stored per people/README.md |
| `convex/features/invites/helpers.ts` | 379 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	const memberUserIds = new Set( |
| `convex/features/invites/helpers.ts` | 387 | `code` | 3 | `User` | `workspace` | `medium` | Workspace signals: member | 				(invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) \|\| |
| `convex/features/invites/rules.ts` | 65 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	if (existingUserInvite && existingUserInvite.workspaceId === workspaceId) { |
| `convex/features/invites/rules.ts` | 73 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | export async function ensureUserNotAlreadyMember( |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 14 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers: Array<{ personId: string; name: string }>; |
| `convex/features/meetings/helpers/queries/listForUser.ts` | 151 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 		accessible.push({ ...meeting, invitedUsers, viewerPersonId: personId }); |
| `convex/features/onboarding/queries.ts` | 162 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: person/people | 			userOnboardingComplete: !!person.onboardingCompletedAt |
| `convex/features/readwise/filters.ts` | 57 | `code` | 1 | `UserS` | `workspace` | `medium` | Workspace signals: workspace | 	const getUserSettingsQuery = internal.core.workspaces.settings |
| `convex/features/readwise/mutations.ts` | 94 | `code` | 1 | `Users` | `workspace` | `medium` | Workspace signals: workspace | 		workspaceId: v.id('workspaces'), // REQUIRED: Users always have at least one workspace |
| `convex/features/readwise/queries/progress.ts` | 16 | `code` | 2 | `User, USER` | `workspace` | `medium` | Workspace signals: person/people | 	const linkedUser = person[USER_ID_FIELD]; |
| `convex/features/tags/access.ts` | 21 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: workspace | 	const workspaces = await listWorkspacesForUser(ctx, user); |
| `convex/features/tags/access.ts` | 38 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const resolvedWorkspaceId = await resolveWorkspace(ctx, actorUser, workspaceId); |
| `convex/features/tags/access.ts` | 39 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	const person = await getPersonByUserAndWorkspace(ctx, actorUser, resolvedWorkspaceId); |
| `convex/features/tasks/queries.ts` | 72 | `code` | 4 | `User` | `workspace` | `medium` | Workspace signals: assignee | 	const assigneeUserId = getTargetUserId(args.targetUserId, args.currentUserId); |
| `convex/features/workspaceBranding/index.ts` | 68 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | async function collectBrandingForUser( |
| `convex/infrastructure/access/permissions.ts` | 12 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | export async function getUserWorkspaceIds( |
| `convex/infrastructure/access/permissions.ts` | 19 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	const workspaceIds = await listWorkspacesForUser(ctx, normalizedUserId); |
| `convex/infrastructure/access/permissions.ts` | 44 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | export async function getUserCircleIds( |
| `convex/infrastructure/access/workspaceRoles.ts` | 25 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 		userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>; // ID from systemRoles or workspaceRoles table (SYOS-862: migrated from userRoles) |
| `convex/infrastructure/access/workspaceRoles.ts` | 70 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 			if (!user) continue; |
| `convex/infrastructure/access/workspaceRoles.ts` | 133 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userName: user.name ?? null, |
| `convex/infrastructure/access/workspaceRoles.ts` | 134 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 				userEmail: user.email, |
| `convex/infrastructure/featureFlags/impact.ts` | 68 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: workspace | 		breakdown.byOrgIds = flag.allowedWorkspaceIds.length * 10; // Estimate: 10 users per org |
| `convex/infrastructure/featureFlags/targeting.ts` | 6 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | async function userHasWorkspaceAccess( |
| `convex/infrastructure/featureFlags/targeting.ts` | 14 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 	return allowedWorkspaceIds.some((orgId) => userWorkspaceIds.includes(orgId)); |
| `convex/infrastructure/rbac/permissions/access.ts` | 88 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: role | 	const activeUserRoles = await listActiveUserRoles( |
| `convex/infrastructure/rbac/permissions/access.ts` | 93 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	const permissions = await collectPermissionsForRoles(ctx, activeUserRoles); |
| `convex/infrastructure/rbac/permissions/access.ts` | 102 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 	for (const userRole of roles) { |
| `convex/infrastructure/rbac/permissions/access.ts` | 103 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const role = await ctx.db.get(userRole.roleId); |
| `convex/infrastructure/rbac/permissions/access.ts` | 107 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId)) |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 113 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 	_userRoleId: Id<'systemRoles'> \| Id<'workspaceRoles'>, |
| `convex/infrastructure/rbac/seedRBAC.ts` | 143 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		const userChangeRolesPerm = await getOrCreatePermission( |
| `convex/infrastructure/rbac/seedRBAC.ts` | 222 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 			userChangeRolesPerm, |
| `convex/infrastructure/rbac/setupAdmin.ts` | 20 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { findPersonByUserAndWorkspace as _findPersonByUserAndWorkspace } from '../../core/people/queries'; |
| `convex/infrastructure/rbac/setupAdmin.ts` | 101 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 120 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 				const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 140 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 			const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
| `convex/infrastructure/rbac/setupAdmin.ts` | 152 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: assignee | 		const permissions = await getUserPermissions(ctx, args.assigneeUserId); |
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
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 55 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 56 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 57 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 131 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			const prevUserId = untrack(() => state.lastUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 146 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				const oldStorageKey = getStorageKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 147 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 				const oldStorageDetailsKey = getStorageDetailsKey(prevUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 265 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const currentUserId = getUserId(); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 266 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageKey = getStorageKey(currentUserId); |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 267 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const storageDetailsKey = getStorageDetailsKey(currentUserId); |
| `src/lib/modules/inbox/composables/useTagging.svelte.ts` | 34 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 	activeWorkspaceId?: () => string \| null; // Function for reactivity (optional - tags can be user or org-scoped) |
| `src/lib/modules/meetings/api.ts` | 34 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; |
| `src/lib/modules/meetings/components/AttendeeSelector.stories.svelte` | 118 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 	Note: Mock displays populated attendees (3 users + 3 circles) by default. |
| `src/lib/modules/meetings/components/AttendeeSelector.svelte` | 294 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 		<Text variant="label" color="tertiary" as="p">No attendees selected - add users or circles</Text |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 87 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: personId, person/people, people | 				id: user.personId as Id<'people'>, |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 180 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: circle | 		(usersQuery?.isLoading ?? false) \|\| (circlesQuery?.isLoading ?? false) |
| `src/lib/modules/meetings/composables/useMeetings.svelte.ts` | 39 | `code` | 2 | `Users, users` | `workspace` | `high` | Workspace signals: personId, person/people | 	invitedUsers?: Array<{ personId: string; name: string }>; // Invited users for display |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 164 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 169 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.click(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 201 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 206 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.hover(circleGroup); |
| `src/lib/modules/org-chart/components/CircleNode.stories.svelte` | 207 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle | 		await userEvent.unhover(circleGroup); |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 86 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		if (confirm(`Archive role "${roleName}"? All user assignments will be removed.`)) { |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 49 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: org-chart path | 		const userChildren: DisplayNode[] = node.children.map((c) => ({ ...c, isAutoCreated: false })); |
| `src/lib/modules/org-chart/components/import/PreviewTree.svelte` | 52 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		return [...coreRoles, ...userChildren]; |
| `src/lib/modules/org-chart/components/RoleCard.stories.svelte` | 183 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 				The current user's card (Randy Hereman) is highlighted with the brand teal background. |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 162 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 167 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		await userEvent.click(roleGroup); |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 197 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 	play={async ({ canvasElement, userEvent }) => { |
| `src/lib/modules/org-chart/components/RoleNode.stories.svelte` | 202 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, role | 		await userEvent.hover(roleGroup); |
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
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 38 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	<title>User Role Assignment - Admin - SynergyOS</title> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 47 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		<p class="text-secondary mt-1 text-sm">Manage roles for this user</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 56 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				{#if userDetails.roles.length > 0} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 58 | `code` | 4 | `user` | `workspace` | `medium` | Workspace signals: role | 						{#each userDetails.roles as userRole (userRole.userRoleId)} |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 63 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 									<p class="text-primary font-medium">{userRole.roleName}</p> |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 65 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 										{userRole.workspaceId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 67 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 											: userRole.teamId |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 79 | `code` | 3 | `user` | `workspace` | `high` | Workspace signals: workspace, role | 												userRoleId: userRole.userRoleId as Id<'systemRoles'> \| Id<'workspaceRoles'> |
| `src/routes/(authenticated)/w/[slug]/proposals/+page.svelte` | 67 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: proposal | 					limit: 100 // Get all user's proposals |
| `src/routes/(authenticated)/w/[slug]/settings/+page.svelte` | 591 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: person/people | 												👤 Personal (User-owned) |
| `src/routes/(authenticated)/w/[slug]/settings/branding/+page.server.ts` | 37 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: member | 	const membership = membersResult.find((m) => m.email === currentUserEmail); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 45 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	let selectedUserId = $state<string>(''); |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 75 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 			selectedUserId = ''; |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 125 | `code` | 1 | `users` | `workspace` | `medium` | Workspace signals: role | 				Roles control what users can do. <strong>System roles</strong> apply globally. |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 223 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 							User |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 227 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 							bind:value={selectedUserId} |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 230 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 							<option value="">Select a user...</option> |
| `src/routes/+layout.server.ts` | 13 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		activeWorkspace: locals.auth.user?.activeWorkspace |
| `src/routes/settings/+page.svelte` | 759 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: person/people | 												👤 Personal (User-owned) |