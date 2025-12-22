---
title: Identity terminology audit summary (user/users)
generatedAt: 2025-12-21T17:28:23.997Z
---

## How to identify what is “correct” vs “incorrect”

- **Correct**: `user/users` when referring to global auth identity (`users` table, WorkOS, sessions, `userId`).
- **Incorrect (to fix)**: `user/users` used in workspace/domain context where the entity is a `person`/`people` record (`personId`, circles/roles/workspace membership).
- **Priority order**: workspace+`code` → workspace+`string` → workspace+docs/comments.

## Top files to fix first (workspace-scoped occurrences, top 50)

| File | workspace | unknown | system_auth |
|---|---:|---:|---:|
| `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` | 41 | 37 | 0 |
| `src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts` | 34 | 60 | 0 |
| `convex/admin/rbac.ts` | 30 | 21 | 14 |
| `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts` | 29 | 41 | 53 |
| `src/lib/modules/inbox/__tests__/useKeyboardNavigation.svelte.test.ts` | 23 | 0 | 0 |
| `convex/infrastructure/rbac/roles.ts` | 21 | 11 | 0 |
| `convex/infrastructure/rbac/setupAdmin.ts` | 21 | 6 | 10 |
| `convex/admin/fixInvariantViolations.ts` | 20 | 18 | 13 |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 20 | 0 | 0 |
| `src/lib/components/molecules/WorkspaceSelector.stories.svelte` | 18 | 0 | 0 |
| `convex/core/workspaces/members.ts` | 16 | 18 | 0 |
| `src/routes/(authenticated)/w/[slug]/settings/roles/+page.svelte` | 16 | 7 | 0 |
| `convex/core/people/people.test.ts` | 15 | 13 | 0 |
| `src/lib/modules/org-chart/__tests__/circles.integration.test.ts` | 14 | 52 | 0 |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 14 | 17 | 0 |
| `convex/core/workspaces/lifecycle.ts` | 14 | 11 | 0 |
| `convex/core/workspaces/settings.ts` | 13 | 24 | 0 |
| `tests/convex/integration/rbac.integration.test.ts` | 13 | 17 | 34 |
| `convex/features/notes/index.test.ts` | 13 | 4 | 10 |
| `convex/core/people/mutations.ts` | 11 | 16 | 0 |
| `convex/admin/archived/syos814VerifyPhase3.ts` | 11 | 7 | 3 |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 11 | 3 | 0 |
| `src/lib/modules/projects/composables/useTaskForm.svelte.ts` | 11 | 2 | 0 |
| `convex/migrations/clearPeopleEmailDenormalization.ts` | 11 | 1 | 0 |
| `src/lib/infrastructure/workspaces/composables/useWorkspaceState.svelte.ts` | 10 | 6 | 0 |
| `convex/admin/archived/syos814VerifyPhase2.ts` | 10 | 5 | 3 |
| `convex/features/invites/helpers.ts` | 9 | 38 | 13 |
| `convex/core/people/queries.ts` | 9 | 18 | 0 |
| `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts` | 9 | 11 | 0 |
| `convex/features/tasks/tasks.test.ts` | 9 | 1 | 9 |
| `src/lib/modules/org-chart/components/AssignUserDialog.svelte` | 9 | 0 | 0 |
| `convex/infrastructure/access/workspaceRoles.ts` | 8 | 9 | 0 |
| `src/lib/infrastructure/workspaces/composables/workspaceStorage.svelte.test.ts` | 8 | 9 | 0 |
| `src/lib/infrastructure/workspaces/composables/useWorkspaces.behavior.svelte.test.ts` | 7 | 19 | 0 |
| `convex/infrastructure/rbac/seedRBAC.ts` | 7 | 16 | 0 |
| `convex/infrastructure/rbac/permissions/access.ts` | 7 | 13 | 26 |
| `convex/infrastructure/rbac/permissions/lifecycle.ts` | 7 | 1 | 4 |
| `convex/core/roles/mutations.ts` | 7 | 0 | 0 |
| `src/lib/modules/meetings/__tests__/meetings.integration.test.ts` | 6 | 29 | 58 |
| `convex/admin/invariants/identity.ts` | 6 | 25 | 1 |
| `convex/admin/migrateVersionHistory.ts` | 6 | 6 | 4 |
| `convex/core/workspaces/workspaces.test.ts` | 6 | 3 | 0 |
| `convex/features/meetings/helpers/queries/invitedUsersUtils.ts` | 6 | 2 | 0 |
| `convex/core/roles/roles.test.ts` | 6 | 1 | 0 |
| `convex/admin/reportMissingProposalPersons.ts` | 6 | 0 | 0 |
| `convex/core/roles/templates/mutations.ts` | 6 | 0 | 0 |
| `src/lib/modules/org-chart/components/CircleContextMenu.svelte` | 6 | 0 | 0 |
| `src/lib/modules/org-chart/components/RoleContextMenu.svelte` | 6 | 0 | 0 |
| `convex/infrastructure/rbac/permissions.test.ts` | 5 | 14 | 15 |
| `convex/admin/migrateTagsToPersonId.ts` | 5 | 11 | 0 |

## Suggested workflow

- Start with **production code** (not tests), `scope=workspace`, `kind=code`, `confidence=high|medium`.
- Then fix **UI labels** (workspace `kind=string`) where "Users" should be "People" (or "Members" when it truly means membership).
- Apply mechanical renames (e.g. `availableUsers` → `availablePeople`) and re-run the script.
- Use `identity-user-terminology-audit.unknown.md` only after the workspace list is shrinking (unknown becomes manageable).
