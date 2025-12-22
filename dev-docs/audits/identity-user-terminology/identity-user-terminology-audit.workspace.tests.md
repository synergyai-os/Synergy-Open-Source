---
title: Identity terminology audit (workspace): test code candidates
generatedAt: 2025-12-21T17:28:23.996Z
---

## Totals

| Scope | Count | doc | comment | string | code |
|---|---:|---:|---:|---:|---:|
| system_auth | 0 | 0 | 0 | 0 | 0 |
| workspace | 116 | 0 | 0 | 0 | 116 |
| unknown | 0 | 0 | 0 | 0 | 0 |

## Instances

| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |
|---|---:|---|---:|---|---|---|---|---|
| `convex/core/assignments/assignments.test.ts` | 33 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn() |
| `convex/core/assignments/assignments.test.ts` | 45 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace | import { getPersonByUserAndWorkspace } from '../people/queries'; |
| `convex/core/assignments/assignments.test.ts` | 56 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as ReturnType<typeof vi.fn>).mockResolvedValue({ |
| `convex/core/authority/authority.test.ts` | 191 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: circle, role | 		userCircleRoles?: any[]; |
| `convex/core/authority/authority.test.ts` | 198 | `code` | 2 | `user` | `workspace` | `high` | Workspace signals: circle, role | 		const userCircleRoles = overrides.userCircleRoles ?? [ |
| `convex/core/authority/authority.test.ts` | 247 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: circle, role | 								collect: async () => userCircleRoles |
| `convex/core/authority/authority.test.ts` | 281 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: circle, role | 			userCircleRoles: [{ circleRoleId: customRole._id, archivedAt: undefined }], |
| `convex/core/people/people.test.ts` | 4 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, people domain path | import { acceptInvite, archivePerson, invitePerson, linkPersonToUser } from './mutations'; |
| `convex/core/people/people.test.ts` | 8 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | 	getPersonByUserAndWorkspace, |
| `convex/core/people/people.test.ts` | 10 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: people, workspace, people domain path | 	listWorkspacesForUser |
| `convex/core/people/people.test.ts` | 259 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, people, people domain path | 		const result = await linkPersonToUser(ctx, { |
| `convex/core/proposals/proposals.test.ts` | 102 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: proposal | 		linkedUser: mockConvexUser |
| `convex/core/roles/roles.test.ts` | 51 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: circle, role | 				userCircleRoles: [] |
| `convex/core/roles/roles.test.ts` | 198 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 			handleUserCircleRoleCreated: vi.fn(), |
| `convex/core/roles/roles.test.ts` | 199 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 			handleUserCircleRoleRemoved: vi.fn() |
| `convex/core/roles/roles.test.ts` | 244 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 			handleUserCircleRoleCreated: vi.fn(), |
| `convex/core/roles/roles.test.ts` | 245 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 			handleUserCircleRoleRemoved: vi.fn() |
| `convex/core/workspaces/workspaces.test.ts` | 9 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | import { ensureInviteEmailFormat, ensureUserNotAlreadyMember } from './rules'; |
| `convex/core/workspaces/workspaces.test.ts` | 151 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member, workspaces domain path | 		await expect(ensureUserNotAlreadyMember(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow( |
| `convex/core/workspaces/workspaces.test.ts` | 229 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, workspaces domain path | 				actingUserId: 'admin' as any |
| `convex/features/inbox/inbox.test.ts` | 22 | `code` | 1 | `USER` | `workspace` | `high` | Workspace signals: people, people domain path | import { USER_ID_FIELD } from '../../core/people/constants'; |
| `convex/features/meetings/helpers/queries/listForUser.test.ts` | 76 | `code` | 1 | `Users` | `workspace` | `high` | Workspace signals: personId, person/people | 				invitedUsers: [expect.objectContaining({ personId: 'person1' })] |
| `convex/features/notes/index.test.ts` | 7 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn(), |
| `convex/features/notes/index.test.ts` | 8 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 	listWorkspacesForUser: vi.fn() |
| `convex/features/notes/index.test.ts` | 16 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: person/people, people, workspace, people domain path | import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries'; |
| `convex/features/notes/index.test.ts` | 47 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 48 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 77 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 78 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 101 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 102 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 131 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 132 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/notes/index.test.ts` | 156 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		(listWorkspacesForUser as any).mockResolvedValue(['w1']); |
| `convex/features/notes/index.test.ts` | 157 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 		(getPersonByUserAndWorkspace as any).mockResolvedValue(person); |
| `convex/features/tasks/tasks.test.ts` | 12 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: person/people, workspace | 	getPersonByUserAndWorkspace: vi.fn().mockResolvedValue({ _id: 'person1' }) |
| `convex/infrastructure/rbac/permissions.test.ts` | 18 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | import { assignRoleToUser } from '../../../tests/convex/integration/setup'; |
| `convex/infrastructure/rbac/permissions.test.ts` | 115 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 		await assignRoleToUser(t, circleLeadId, roleId, { assignedBy: circleLeadId }); |
| `convex/infrastructure/rbac/permissions.test.ts` | 121 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: circle | 				resourceOwnerId: circleLeadId // Same as user |
| `convex/infrastructure/rbac/permissions.test.ts` | 169 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: circle, role | 		await assignRoleToUser(t, circleLeadId, roleId, { |
| `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` | 59 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 				export const userRolesTable = defineTable({ |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 21 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, role | 	assignRoleToUser, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 86 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, adminUserId, 'admin'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 92 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: workspace, role | 		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 114 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 117 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const { code } = await createTestInvite(t, orgId, inviterUserId, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 118 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			invitedUserId: inviteeUserId, |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 137 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			const inviteeUser = await ctx.db.get(inviteeUserId); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 178 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, inviterUserId, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 180 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: workspace | 		const { inviteId } = await createTestInvite(t, orgId, inviterUserId, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 181 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: workspace | 			invitedUserId: inviteeUserId |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 210 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, orgId, adminUserId, 'admin'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 217 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: workspace, role | 		await assignRoleToUser(t, adminUserId, adminRole, { workspaceId: orgId }); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 261 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, org1, user1, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 264 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: workspace, member | 		await createTestOrganizationMember(t, org2, user2, 'owner'); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 270 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		const user1Orgs = await t.query(api.core.workspaces.index.listWorkspaces, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 273 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		expect(user1Orgs.length).toBe(1); |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 277 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		const user2Orgs = await t.query(api.core.workspaces.index.listWorkspaces, { |
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 280 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: workspace | 		expect(user2Orgs.length).toBe(1); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 388 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, user2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 427 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: assignee | 			assigneeUserId: user2, |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 720 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: assignee | 			assigneeUserId: user2 |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 728 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: assignee | 		expect(item?.assigneeUserId).toBe(user2); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 833 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 840 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 867 | `code` | 2 | `User, user` | `workspace` | `medium` | Workspace signals: assignee | 			assigneeUserId: user1, |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 360 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, userId2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 363 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people | 		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 527 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: member | 		await createTestOrganizationMember(t, orgId, userId2, 'member'); |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 530 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people | 		const attendeePersonId = await getPersonIdForUser(t, orgId, userId2); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 178 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 179 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 218 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 219 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 268 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 269 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 300 | `code` | 2 | `user, User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		const userRoles = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 305 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		expect(userRoles.length).toBe(2); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 306 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		expect(userRoles.map((r) => r.roleName).sort()).toEqual(['Circle Lead', 'Dev Lead']); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 316 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 317 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user3Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 318 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const person2 = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 319 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const person3 = await getPersonIdForUser(t, orgId, user3Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 386 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 387 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 422 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 423 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const assigneePersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 443 | `code` | 2 | `user, User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		const userRolesBefore = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 447 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		expect(userRolesBefore.length).toBe(1); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 456 | `code` | 2 | `user, User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		const userRolesAfter = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 460 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		expect(userRolesAfter.length).toBe(0); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 469 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 470 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const person2 = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 503 | `code` | 1 | `User` | `workspace` | `high` | Workspace signals: org-chart path, circle, role | 		const circle1Roles = await t.query(api.core.roles.index.getUserRoles, { |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 520 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 521 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, role, member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 230 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 231 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 266 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 267 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 271 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestCircleMember(t, circleId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 309 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, orgId, user2Id, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 310 | `code` | 2 | `User, user` | `workspace` | `high` | Workspace signals: personId, person/people, org-chart path, circle | 		const memberPersonId = await getPersonIdForUser(t, orgId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 313 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestCircleMember(t, circleId, user2Id); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 381 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, org1, user1, 'member'); |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 382 | `code` | 1 | `user` | `workspace` | `high` | Workspace signals: org-chart path, circle, member | 		await createTestOrganizationMember(t, org2, user2, 'member'); |
| `tests/convex/integration/rbac.integration.test.ts` | 17 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	assignRoleToUser, |
| `tests/convex/integration/rbac.integration.test.ts` | 122 | `code` | 2 | `User` | `workspace` | `medium` | Workspace signals: role | 		await assignRoleToUser(t, adminUserId, adminRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 145 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/rbac.integration.test.ts` | 194 | `code` | 2 | `User` | `workspace` | `high` | Workspace signals: circle, role | 		await assignRoleToUser(t, teamLeadUserId, circleLeadRole); |
| `tests/convex/integration/rbac.integration.test.ts` | 200 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: circle | 			return await hasPermission(ctx, teamLeadUserId, 'circles.update', { circleId }); |
| `tests/convex/integration/rbac.integration.test.ts` | 236 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/rbac.integration.test.ts` | 287 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |
| `tests/convex/integration/setup.ts` | 299 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | export async function assignRoleToUser( |
| `tests/convex/integration/users.integration.test.ts` | 17 | `code` | 1 | `User` | `workspace` | `medium` | Workspace signals: role | 	assignRoleToUser, |
| `tests/convex/integration/users.integration.test.ts` | 121 | `code` | 1 | `user` | `workspace` | `medium` | Workspace signals: role | 		await assignPermissionToRole(t, userRole, profilePermission, 'own'); |