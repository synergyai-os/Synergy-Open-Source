# CORE Audit Raw Data
Generated: 2025-12-21T07:29:58.617Z

## Summary
- Domains checked: 10
- Missing required files: 4
- Invariants: 0/0 passing
- Tests: 0/0 passing
- TypeScript: 0 errors, 0 warnings

## Domain Inventory

### users

**Required files:**
✅ tables.ts (exists)
   - exports: [accountLinksTable, userSettingsTable, usersTable]
   - (3 total)

✅ queries.ts (exists)
   - exports: [getCurrentUser, getUserById, getUserByWorkosId, listLinkedAccounts, listOrgLinksForUser, validateAccountLink]
   - (6 total)

✅ mutations.ts (exists)
   - exports: [addAccountLink, ensureWorkosUser, linkAccounts, removeAccountLink, syncUserFromWorkOS, unlinkAccounts, updateUserProfile]
   - (7 total)

✅ rules.ts (exists)
   - exports: [calculateProfileName, checkLinkDepth, ensureLinkable, getTransitiveLinks, linkExists, requireProfilePermission, requireSessionUserId]
   - (7 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
✅ constants.ts (exists)
   - exports: [MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS]
✅ README.md (exists)

✅ users.test.ts (exists)

### people

**Required files:**
✅ tables.ts (exists)
   - exports: [peopleTable]
   - (1 total)

✅ queries.ts (exists)
   - exports: [findPersonByEmailAndWorkspace, findPersonByUserAndWorkspace, getMyPerson, getNormalizedEmail, getPersonByEmailAndWorkspace, getPersonById, getPersonByUserAndWorkspace, getPersonForSessionAndWorkspace, getPersonForWorkspace, listAllPeopleInWorkspace, listPeopleInWorkspace, listWorkspacesForUser]
   - (12 total)

✅ mutations.ts (exists)
   - exports: [acceptInvite, archivePerson, createInvitedPerson, createPlaceholder, invitePerson, linkPersonToUser, transitionPlaceholderToInvited, updatePerson]
   - (8 total)

✅ rules.ts (exists)
   - exports: [canArchivePerson, canInvitePeople, canPersonBeArchived, getPersonEmail, isPersonActive, isPersonInvited, isPersonPlaceholder, isWorkspaceAdmin, isWorkspaceOwner, requireActivePerson, requirePerson]
   - (11 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
✅ constants.ts (exists)
   - exports: [USER_ID_FIELD]
✅ README.md (exists)

✅ people.test.ts (exists)

### circles

**Required files:**
✅ tables.ts (exists)
   - exports: [circleMembersTable, circleRolesTable, circlesTable]
   - (3 total)

✅ queries.ts (exists)
   - exports: [canAccess, get, getMembers, getMyAuthority, isMember, list]
   - (6 total)

✅ mutations.ts (exists)
   - exports: [addMember, archive, create, removeMember, restore, update, updateInline]
   - (7 total)

✅ rules.ts (exists)
   - exports: [requireCircle]
   - (1 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
✅ constants.ts (exists)
   - exports: [CIRCLE_TYPES, DECISION_MODELS, isCircleType, isDecisionModel]
✅ README.md (exists)

✅ circles.test.ts (exists)

### roles

**Required files:**
✅ tables.ts (exists)
   - exports: [roleTemplatesTable]
   - (1 total)

✅ queries.ts (exists)
   - exports: [canAccess, get, getMembersWithoutRoles, getRoleFillers, getUserRoles, listByCircle, listByWorkspace, listMembersWithoutRoles]
   - (8 total)

✅ mutations.ts (exists)
   - exports: [archiveRole, archiveRoleHelper, assignUser, create, removeUser, restoreAssignment, restoreRole, update, updateInline]
   - (9 total)

✅ rules.ts (exists)
   - exports: [countLeadRoles, hasDuplicateRoleName, isLeadRequiredForCircleType, isLeadTemplate, normalizeRoleName, validateRoleDecisionRights, validateRolePurpose]
   - (7 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
✅ constants.ts (exists)
   - exports: [ROLE_TYPES, isRoleType]
✅ README.md (exists)

✅ roles.test.ts (exists)

### assignments

**Required files:**
✅ tables.ts (exists)
   - exports: [assignmentsTable]
   - (1 total)

✅ queries.ts (exists)
   - exports: [ensureAssignmentInCircle, getActiveAssignmentForRole, getAssignmentById, hasAnyRoleInCircle, isAssignedToRole, listAssignmentsForPerson, listAssignmentsForRole, listAssignmentsInCircle]
   - (8 total)

✅ mutations.ts (exists)
   - exports: [create, end, update]
   - (3 total)

✅ rules.ts (exists)
   - exports: [canCreateAssignment, canEndAssignment, hasTermEnded, isAssignmentActive, isAssignmentEnded, requireActiveAssignment, requireAssignment]
   - (7 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
❌ constants.ts (missing)
✅ README.md (exists)

✅ assignments.test.ts (exists)

### proposals

**Required files:**
✅ tables.ts (exists)
   - exports: [circleProposalsTable, proposalAttachmentsTable, proposalEvolutionsTable, proposalObjectionsTable]
   - (4 total)

✅ queries.ts (exists)
   - exports: [get, getByAgendaItem, list, listByCircle, listForMeetingImport, myListDrafts]
   - (6 total)

✅ mutations.ts (exists)
   - exports: [addEvolution, approve, create, createFromDiff, importToMeeting, reject, removeEvolution, saveAndApprove, startProcessing, submit, withdraw]
   - (11 total)

✅ rules.ts (exists)
   - exports: [assertHasEvolutions, assertNotTerminal, assertTransition, canTransition, ensureUniqueCircleSlug, ensureWorkspaceMembership, getNextAgendaOrder, isProposalStatus, isTerminalState, requireProposal]
   - (10 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
✅ constants.ts (exists)
   - exports: [PROPOSAL_STATUSES]
✅ README.md (exists)

✅ proposals.test.ts (exists)

### policies

**Required files:**
❌ tables.ts (MISSING)

✅ queries.ts (exists)
   - exports: [listPolicies]
   - (1 total)

✅ mutations.ts (exists)
   - exports: [ensurePolicy]
   - (1 total)

✅ rules.ts (exists)
   - exports: [requirePoliciesDomain]
   - (1 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
❌ constants.ts (missing)
✅ README.md (exists)

❌ policies.test.ts (MISSING)

### authority

**Required files:**
⏭️ tables.ts (not required - calculation-only domain)

✅ queries.ts (exists)
   - exports: [describeAuthorityModel]
   - (1 total)

✅ mutations.ts (exists)
   - exports: [assertAuthorityIsDerived]
   - (1 total)

✅ rules.ts (exists)
   - exports: [hasRole, isCircleLead, isCircleMember, isFacilitator]
   - (4 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
❌ constants.ts (missing)
✅ README.md (exists)

✅ authority.test.ts (exists)

### history

**Required files:**
❌ tables.ts (MISSING)

✅ queries.ts (exists)
   - exports: [getEntityHistory, getUserChanges, getWorkspaceTimeline]
   - (3 total)

❌ mutations.ts (MISSING)

❌ rules.ts (MISSING)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
   - exports: [orgVersionHistoryTable]
❌ constants.ts (missing)
✅ README.md (exists)

✅ history.test.ts (exists)

### workspaces

**Required files:**
✅ tables.ts (exists)
   - exports: [workspaceAliasesTable, workspaceOrgSettingsTable, workspaceSettingsTable, workspacesTable]
   - (4 total)

✅ queries.ts (exists)
   - exports: [findById, findBySlug, getActivationIssues, getAliasBySlug, listWorkspaces]
   - (5 total)

✅ mutations.ts (exists)
   - exports: [activate]
   - (1 total)

✅ rules.ts (exists)
   - exports: [runActivationValidation]
   - (1 total)

✅ index.ts (exists)

**Optional files:**
✅ schema.ts (exists)
   - exports: [ActivationIssueValidator]
❌ constants.ts (missing)
✅ README.md (exists)

✅ workspaces.test.ts (exists)

## Invariant Results

```

> synergyos@0.1.0 invariants:critical
> npx convex run internal.admin.invariants.runAll '{"severityFilter":"critical"}' | npx tsx scripts/invariants-report.ts

=== Core Invariants Report ===
Total: 47
Passed: 45
Failed: 2
Critical Failed: 2

Failures:
- [CRITICAL] AUTH-01 - Every active circle has at least one Circle Lead assignment
  Message: 2 active circle(s) missing Lead assignment
  Sample IDs: q570bd5tmnxhx4zvrax4sy4hm17xjqws, q57e72q05q1my9na2979pprdcs7xjn7p
- [CRITICAL] GOV-03 - Every role has at least one decision right
  Message: 1 role(s) missing decision rights in customFieldValues
  Sample IDs: q97b13vk19e2w489dn05bk7se97xkjc7

Critical invariants failed. See failures above.

```

## Test Results

```

> synergyos@0.1.0 test:unit:server
> vitest --run --project=server


 RUN  v3.2.4 /Users/randyhereman/Coding/SynergyOS

 ❯ |server| convex/core/proposals/proposals.test.ts (9 tests | 3 failed) 7ms
   ✓ Queries > listProposalsQuery helper > filters by workspace and status when provided 1ms
   ✓ Queries > listProposalsQuery helper > applies limit and sorts by createdAt desc 0ms
   ✓ State Machine > VALID_TRANSITIONS > includes only known statuses 0ms
   × State Machine > canTransition > allows documented valid transitions 2ms
     → PROPOSAL_STATUSES.includes is not a function
   × State Machine > canTransition > blocks invalid transitions 0ms
     → PROPOSAL_STATUSES.includes is not a function
   × State Machine > assertTransition > does not throw for valid transitions 2ms
     → expected [Function] to not throw an error but 'TypeError: PROP…' was thrown
   ✓ State Machine > assertTransition > throws for invalid transitions 0ms
   ✓ State Machine > isTerminalState > identifies terminal statuses 0ms
   ✓ State Machine > isTerminalState > non-terminal statuses return false 0ms
 ❯ |server| convex/core/authority/authority.test.ts (10 tests | 2 failed) 6ms
   ✓ calculateAuthority > Hierarchy Circle Lead 1ms
   ✓ calculateAuthority > Hierarchy Member (not lead) 0ms
   ✓ calculateAuthority > Empowered Team Member 0ms
   ✓ calculateAuthority > Guild Steward 0ms
   ✓ calculateAuthority > Facilitator Role 0ms
   ✓ calculateAuthority > Circle Lead Facilitates 0ms
   ✓ calculateAuthority > Empty Assignments return default deny 0ms
   × getAuthorityContext > maps lead and facilitator to assignments with correct roleType 2ms
     → Unexpected table assignments
   × getAuthorityContext > falls back to custom roleType when no core/lead signals 0ms
     → Unexpected table assignments
   ✓ getAuthorityContext > throws when circle does not exist 1ms
 ❯ |server| convex/features/tasks/tasks.test.ts (12 tests | 12 failed) 15ms
   × tasks access helpers > ensureWorkspaceMembership rejects non-members 6ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: Workspace me…' but got '[vitest] No "findPersonByUserAndWorks…'
   × tasks access helpers > getTaskOrThrow throws when task missing 3ms
     → expected [Function] to throw error including 'TASK_NOT_FOUND: Task not found' but got 'SYNERGYOS_ERROR|TASK_NOT_FOUND|Task n…'
   × tasks access helpers > getMeetingForTaskOrThrow enforces meeting existence 0ms
     → expected [Function] to throw error including 'MEETING_NOT_FOUND: Meeting not found' but got 'SYNERGYOS_ERROR|MEETING_NOT_FOUND|Mee…'
   × tasks queries > listTasks filters by status and requires membership 1ms
     → [vitest] No "findPersonByUserAndWorkspace" export is defined on the "../../core/people/queries" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × tasks mutations > createTask inserts when access and inputs are valid 1ms
     → [vitest] No "findPersonByUserAndWorkspace" export is defined on the "../../core/people/queries" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × tasks mutations > createTask rejects mismatched meeting workspace 1ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: Meeting does…' but got '[vitest] No "findPersonByUserAndWorks…'
   × tasks mutations > createTask rejects missing assignee details 1ms
     → expected [Function] to throw error including 'VALIDATION_REQUIRED_FIELD: assigneeUs…' but got 'SYNERGYOS_ERROR|VALIDATION_REQUIRED_F…'
   × tasks mutations > updateTaskDetails rejects project workspace mismatch 1ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: Project does…' but got '[vitest] No "findPersonByUserAndWorks…'
   × tasks mutations > updateTaskStatus patches status and timestamp 0ms
     → [vitest] No "findPersonByUserAndWorkspace" export is defined on the "../../core/people/queries" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × tasks mutations > updateTaskStatus errors when meeting referenced but missing 0ms
     → expected [Function] to throw error including 'MEETING_NOT_FOUND: Meeting not found' but got 'SYNERGYOS_ERROR|MEETING_NOT_FOUND|Mee…'
   × tasks mutations > updateTaskAssignee enforces assignee validation 0ms
     → expected [Function] to throw error including 'VALIDATION_REQUIRED_FIELD: assigneeRo…' but got 'SYNERGYOS_ERROR|VALIDATION_REQUIRED_F…'
   × tasks mutations > updateTaskRemoval deletes the task 0ms
     → [vitest] No "findPersonByUserAndWorkspace" export is defined on the "../../core/people/queries" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 ❯ |server| convex/core/roles/roles.test.ts (19 tests | 17 failed) 12ms
   × queries > listMembersWithoutRoles > returns members when no roles exist 4ms
     → [vitest] No "ensureWorkspaceMembership" export is defined on the "./roleAccess" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × mutations > create > throws when role name duplicates existing role (uses ErrorCodes) 3ms
     → expected [Function] to throw error matching /VALIDATION_INVALID_FORMAT/ but got '[vitest] No "ensureCircleExists" expo…'
   ✓ mutations > archiveRole > throws when role is not found 1ms
   × mutations > assignUser > throws when assignment already exists 0ms
     → expected [Function] to throw error matching /ASSIGNMENT_ALREADY_EXISTS/ but got '[vitest] No "ensureCircleExists" expo…'
   ✓ templates > create > requires admin/owner membership (uses ErrorCodes) 1ms
   × validation > normalizeRoleName > trims and lowercases 1ms
     → [vitest] No "normalizeRoleName" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × validation > hasDuplicateRoleName > detects duplicates case-insensitively 0ms
     → [vitest] No "hasDuplicateRoleName" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × validation > hasDuplicateRoleName > returns false when no duplicate exists 0ms
     → [vitest] No "hasDuplicateRoleName" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × validation > hasDuplicateRoleName > ignores current role id 0ms
     → [vitest] No "hasDuplicateRoleName" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × validation > hasDuplicateRoleName > trims candidate before comparison 0ms
     → [vitest] No "hasDuplicateRoleName" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead detection > isLeadTemplate > returns true when template is circle_lead 0ms
     → [vitest] No "isLeadTemplate" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead detection > isLeadTemplate > returns false when template is structural 0ms
     → [vitest] No "isLeadTemplate" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead detection > isLeadTemplate > returns false when template is custom 0ms
     → [vitest] No "isLeadTemplate" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead detection > isLeadTemplate > returns false when template is undefined 0ms
     → [vitest] No "isLeadTemplate" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead detection > isLeadTemplate > returns false when template is null 0ms
     → [vitest] No "isLeadTemplate" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead helpers > countLeadRoles > counts lead roles based on template roleType 0ms
     → [vitest] No "countLeadRoles" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead helpers > isLeadRequiredForCircleType > uses defaults when overrides are absent 0ms
     → [vitest] No "isLeadRequiredForCircleType" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead helpers > isLeadRequiredForCircleType > defaults circle type to hierarchy 0ms
     → [vitest] No "isLeadRequiredForCircleType" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

   × lead helpers > isLeadRequiredForCircleType > respects override map when provided 0ms
     → [vitest] No "isLeadRequiredForCircleType" export is defined on the "./rules" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 ❯ |server| src/lib/modules/org-chart/__tests__/circleRoles.integration.test.ts (13 tests | 13 failed) 116ms
   × Circle Roles Integration Tests > should create a role in a circle 83ms
     → Validator error: Unexpected field `purpose` in object
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should list all roles in a circle 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should update a role 2ms
     → Validator error: Unexpected field `purpose` in object
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should delete a role 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should assign a user to a role 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should remove a user from a role 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should get all roles assigned to a user 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should allow multiple users to fill the same role 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should prevent duplicate role names in same circle 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should prevent assigning user twice to same role 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should delete all assignments when role is deleted 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should filter user roles by circle 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circle Roles Integration Tests > should enforce workspace membership - users cannot access other org roles 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ❯ |server| tests/convex/integration/users.integration.test.ts (9 tests | 8 failed | 1 skipped) 133ms
   × Users Integration Tests > should sync user from WorkOS - create new user 116ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should sync user from WorkOS - update existing user 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should get user by ID with sessionId validation 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should get current user with sessionId validation 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should update own profile with RBAC permission check 4ms
     → SYNERGYOS_ERROR|AUTHZ_INSUFFICIENT_RBAC|Missing permission users.manage-profile|Error code: AUTHZ_INSUFFICIENT_RBAC
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should link accounts bidirectionally 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Users Integration Tests > should validate account links transitively 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   ↓ Users Integration Tests > should enforce account link depth limits
   × Users Integration Tests > should fail with invalid sessionId 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
📋 Creating system custom field definitions for workspace 10004;workspaces...

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Purpose (role, purpose)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Decision Rights (role, decision_right)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Accountabilities (role, accountability)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Domains (role, domain)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Policies (role, policy)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Steering Metrics (role, steering_metric)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Notes (role, note)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Purpose (circle, purpose)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Domains (circle, domain)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Accountabilities (circle, accountability)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Policies (circle, policy)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Decision Rights (circle, decision_right)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
  ✅ Created field: Notes (circle, note)
📋 Custom field definitions ready: 13 created, 0 already existed (13 total)


stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create a circle with auto-generated slug
[createCoreRolesForCircle] Creating core roles for circle 10019;circles with type hierarchy

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
📋 Creating system custom field definitions for workspace 10004;workspaces...

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Purpose (role, purpose)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Decision Rights (role, decision_right)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Accountabilities (role, accountability)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Domains (role, domain)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Policies (role, policy)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Steering Metrics (role, steering_metric)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Notes (role, note)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Purpose (circle, purpose)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Domains (circle, domain)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Accountabilities (circle, accountability)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Policies (circle, policy)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Decision Rights (circle, decision_right)

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
  ✅ Created field: Notes (circle, note)
📋 Custom field definitions ready: 13 created, 0 already existed (13 total)


stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should create nested circles (parent-child relationship)
[createCoreRolesForCircle] Creating core roles for circle 10019;circles with type hierarchy

stdout | src/lib/modules/org-chart/__tests__/circles.integration.test.ts > Circles Integration Tests > should archive a circle (soft delete)
[createCoreRolesForCircle] Creating core roles for circle 10007;circles with type hierarchy

 ❯ |server| src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts (5 tests | 5 failed) 206ms
   × Flashcards Integration Tests > should create flashcard without type errors 196ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Flashcards Integration Tests > should list user flashcards 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Flashcards Integration Tests > should review flashcard and update state 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Flashcards Integration Tests > should fail with invalid sessionId 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Flashcards Integration Tests > should enforce user isolation 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ✓ |server| src/lib/server/middleware/rateLimit.test.ts (14 tests) 376ms
stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > State Transitions > should transition submitted → in_meeting when imported to meeting
[PLACEHOLDER] Proposal created: 10007;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

 ❯ |server| src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts (10 tests | 9 failed | 1 skipped) 236ms
   × Organizations Integration Tests > should list user workspaces with sessionId validation 160ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > should create workspace with auto-generated slug 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > should create workspace invite with RBAC permission check 35ms
     → SYNERGYOS_ERROR|AUTHZ_INSUFFICIENT_RBAC|Missing permission users.invite|Error code: AUTHZ_INSUFFICIENT_RBAC
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > should accept workspace invite and create membership 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > should decline workspace invite without creating membership 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   ↓ Organizations Integration Tests > should remove workspace member with RBAC permission check
   × Organizations Integration Tests > should enforce user isolation - users cannot see other orgs 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > should fail with invalid sessionId 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > Email validation for workspace invites > should accept valid email addresses 7ms
     → expected undefined to be defined
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Organizations Integration Tests > Email validation for workspace invites > should reject invalid email addresses 17ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > State Transitions > should transition in_meeting → approved and apply changes
[PLACEHOLDER] Proposal created: 10012;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

 ❯ |server| src/lib/modules/org-chart/__tests__/circles.integration.test.ts (13 tests | 13 failed) 94ms
   × Circles Integration Tests > should list circles in an workspace 37ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should create a circle with auto-generated slug 5ms
     → SYNERGYOS_ERROR|TEMPLATE_NOT_FOUND|No system templates found for circle type "hierarchy". Run seed to create templates.|Error code: TEMPLATE_NOT_FOUND
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should create nested circles (parent-child relationship) 3ms
     → SYNERGYOS_ERROR|TEMPLATE_NOT_FOUND|No system templates found for circle type "hierarchy". Run seed to create templates.|Error code: TEMPLATE_NOT_FOUND
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should get a single circle by ID 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should update a circle name and purpose 5ms
     → expected undefined to be 'Updated purpose' // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should archive a circle (soft delete) 2ms
     → SYNERGYOS_ERROR|TEMPLATE_NOT_FOUND|No system templates found for circle type "hierarchy". Run seed to create templates.|Error code: TEMPLATE_NOT_FOUND
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should add a member to a circle 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should remove a member from a circle 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should prevent adding a duplicate member to a circle 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should prevent creating a circle with invalid parent circle 6ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should prevent circular parent reference 17ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should enforce workspace membership - users cannot access other org circles 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Circles Integration Tests > should fail with invalid sessionId 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > State Transitions > should transition in_meeting → rejected and not apply changes
[PLACEHOLDER] Proposal created: 10012;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

 ❯ |server| src/lib/modules/meetings/__tests__/meetings.integration.test.ts (15 tests | 13 failed | 2 skipped) 247ms
   × Meetings Integration Tests > should create an ad-hoc meeting (no circle) 205ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   ↓ Meetings Integration Tests > should create a circle-based meeting
   × Meetings Integration Tests > should list meetings in an workspace 10ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should update a meeting 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should delete a meeting 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should create a daily recurring meeting 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should create a weekly recurring meeting 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should create a monthly recurring meeting 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should add a user attendee to a meeting 7ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   ↓ Meetings Integration Tests > should add a member attendee to a circle meeting
   × Meetings Integration Tests > should add multiple attendees to a meeting 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should remove an attendee from a meeting 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should list meetings by circle 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should list meetings for current user (direct invite) 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meetings Integration Tests > should list public meetings for all org members 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > State Transitions > should reject withdrawal from terminal states
[PLACEHOLDER] Proposal created: 10012;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > Authorization > should only allow meeting recorder to approve
[PLACEHOLDER] Proposal created: 10017;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

 ✓ |server| tests/convex/integration/invariants.integration.test.ts (2 tests) 198ms
 ❯ |server| src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts (7 tests | 7 failed) 266ms
   × meetingAgendaItems: updateNotes > should successfully update notes on agenda item 243ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: updateNotes > should fail without valid session 8ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: updateNotes > should fail for user not in workspace 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: markStatus > should successfully mark agenda item as processed 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: markStatus > should successfully mark agenda item as rejected 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: markStatus > should fail without valid session 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × meetingAgendaItems: markStatus > should fail for user not in workspace 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > Version History > should create version history entry on approval
[PLACEHOLDER] Proposal created: 10012;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

stdout | tests/convex/integration/proposals.consent.test.ts > Consent Process > Version History > should regenerate slug when circle name changes
[PLACEHOLDER] Proposal created: 10012;circleProposals
[PLACEHOLDER] Notify circle members
[PLACEHOLDER] Notify circle lead for review

 ❯ |server| tests/convex/integration/tags.integration.test.ts (6 tests | 6 failed) 83ms
   × Tags Integration Tests > should list user tags without type errors 69ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Tags Integration Tests > should list user tags with ownership info 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Tags Integration Tests > should get tags by ownership 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Tags Integration Tests > should get tag details 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Tags Integration Tests > should fail with invalid sessionId 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Tags Integration Tests > should enforce user isolation 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ❯ |server| tests/convex/integration/proposals.consent.test.ts (14 tests | 14 failed) 274ms
   × Consent Process > State Transitions > should transition draft → submitted when evolutions exist 203ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should reject submission without evolutions 31ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should transition submitted → in_meeting when imported to meeting 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should transition in_meeting → approved and apply changes 5ms
     → SYNERGYOS_ERROR|PROPOSAL_ACCESS_DENIED|Insufficient authority to approve|Error code: PROPOSAL_ACCESS_DENIED
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should transition in_meeting → rejected and not apply changes 7ms
     → SYNERGYOS_ERROR|PROPOSAL_ACCESS_DENIED|Insufficient authority to reject|Error code: PROPOSAL_ACCESS_DENIED
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should allow withdrawal from non-terminal states 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > State Transitions > should reject withdrawal from terminal states 3ms
     → SYNERGYOS_ERROR|PROPOSAL_ACCESS_DENIED|Insufficient authority to approve|Error code: PROPOSAL_ACCESS_DENIED
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Authorization > should allow any workspace member to create proposals 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Authorization > should only allow proposal creator to add evolutions (in draft) 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Authorization > should only allow proposal creator to submit 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Authorization > should only allow meeting recorder to approve 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Authorization > should only allow proposal creator to withdraw 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Version History > should create version history entry on approval 2ms
     → SYNERGYOS_ERROR|PROPOSAL_ACCESS_DENIED|Insufficient authority to approve|Error code: PROPOSAL_ACCESS_DENIED
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Consent Process > Version History > should regenerate slug when circle name changes 3ms
     → SYNERGYOS_ERROR|PROPOSAL_ACCESS_DENIED|Insufficient authority to approve|Error code: PROPOSAL_ACCESS_DENIED
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ❯ |server| src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts (15 tests | 15 failed) 312ms
   × tasks: create > should create action item assigned to user 261ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: create > should create action item assigned to role 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: create > should fail when assigneeUserId missing for user type 4ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: create > should fail without valid session 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: queries > should list action items by meeting 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: queries > should list action items by agenda item 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: queries > should list action items by assignee 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: queries > should filter by status in listByAssignee 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: queries > should get single action item 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should update action item details 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should update action item status 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should update action item assignee 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should remove action item 12ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should fail to update without valid session 5ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × tasks: mutations > should fail to access action item from different org 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ❯ |server| src/lib/modules/meetings/__tests__/meetingTemplates.integration.test.ts (11 tests | 11 failed) 146ms
   × Meeting Templates Integration Tests > should create a meeting template 113ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should list templates for an workspace 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should update a template 9ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should delete a template 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should add a step to a template 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should remove a step from a template 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should reorder steps in a template 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should cascade delete steps when template is deleted 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should seed default templates (Governance + Weekly Tactical) 6ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should only list templates for user workspace 3ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × Meeting Templates Integration Tests > should include step count in template list 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Admin has all permissions with 'all' scope
🌱 Seeding RBAC data (minimal set)...
Creating roles...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Admin has all permissions with 'all' scope
✅ Roles ready (6 roles created or already existed)
Creating permissions...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Admin has all permissions with 'all' scope
✅ Permissions ready (8 permissions created or already existed)
Creating role-permission mappings...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Admin has all permissions with 'all' scope
✅ Role-permission mappings ready (21 created, 0 already existed)
🎉 RBAC seed complete!

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Circle Lead can only manage own circles
🌱 Seeding RBAC data (minimal set)...
Creating roles...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Circle Lead can only manage own circles
✅ Roles ready (6 roles created or already existed)
Creating permissions...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Circle Lead can only manage own circles
✅ Permissions ready (8 permissions created or already existed)
Creating role-permission mappings...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Circle Lead can only manage own circles
✅ Role-permission mappings ready (21 created, 0 already existed)
🎉 RBAC seed complete!

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Multi-role user has permissions from all roles
🌱 Seeding RBAC data (minimal set)...
Creating roles...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Multi-role user has permissions from all roles
✅ Roles ready (6 roles created or already existed)
Creating permissions...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Multi-role user has permissions from all roles
✅ Permissions ready (8 permissions created or already existed)
Creating role-permission mappings...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Multi-role user has permissions from all roles
✅ Role-permission mappings ready (21 created, 0 already existed)
🎉 RBAC seed complete!

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > requirePermission throws error when permission denied
🌱 Seeding RBAC data (minimal set)...
Creating roles...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > requirePermission throws error when permission denied
✅ Roles ready (6 roles created or already existed)
Creating permissions...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > requirePermission throws error when permission denied
✅ Permissions ready (8 permissions created or already existed)
Creating role-permission mappings...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > requirePermission throws error when permission denied
✅ Role-permission mappings ready (21 created, 0 already existed)
🎉 RBAC seed complete!

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Permission checks are logged to audit log
🌱 Seeding RBAC data (minimal set)...
Creating roles...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Permission checks are logged to audit log
✅ Roles ready (6 roles created or already existed)
Creating permissions...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Permission checks are logged to audit log
✅ Permissions ready (8 permissions created or already existed)
Creating role-permission mappings...

stdout | convex/infrastructure/rbac/permissions.test.ts > RBAC Permission System > Permission checks are logged to audit log
✅ Role-permission mappings ready (21 created, 0 already existed)
🎉 RBAC seed complete!

 ✓ |server| convex/infrastructure/rbac/permissions.test.ts (5 tests) 65ms
 ✓ |server| src/routes/auth/register/register.test.ts (16 tests) 2ms
 ❯ |server| tests/convex/integration/rbac.integration.test.ts (10 tests | 10 failed) 58ms
   × RBAC Integration Tests > should get all roles 37ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should get all permissions 5ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should get permissions for a specific role 3ms
     → expected undefined to be 'manager' // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should validate hasPermission with "all" scope (Admin) 2ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should validate hasPermission with "own" scope (user editing own profile) 2ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should validate hasPermission with team scope (Team Lead) 1ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should throw when requirePermission fails 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should resolve multi-role permissions (User + Team Lead) 2ms
     → expected false to be true // Object.is equality
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should deny permission when user has no roles 2ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
   × RBAC Integration Tests > should deny permission with wrong scope 1ms
     → Cannot use index "by_user" for table "flashcards" because it is not declared in the schema.
 ✓ |server| convex/core/history/history.test.ts (2 tests) 3ms
 ✓ |server| convex/features/tags/assignments.test.ts (4 tests) 6ms
 ❯ |server| convex/features/notes/index.test.ts (5 tests | 1 failed) 11ms
   ✓ features/notes > createNote validates the session and inserts a note for the acting user 3ms
   × features/notes > updateNote rejects when the note is not owned by the acting user 5ms
     → expected [Function] to throw error including 'NOTE_ACCESS_DENIED: Note not found or…' but got 'SYNERGYOS_ERROR|NOTE_ACCESS_DENIED|No…'
   ✓ features/notes > updateNote patches when the note is owned by the acting user 0ms
   ✓ features/notes > findNote returns null when the note does not belong to the user 2ms
   ✓ features/notes > createNote surfaces authentication failures from validateSessionAndGetUserId 0ms
 ✓ |server| convex/core/people/people.test.ts (13 tests) 8ms
 ❯ |server| convex/core/circles/circles.test.ts (30 tests | 2 failed) 12ms
   ✓ circles domain > validation > validateCircleName > rejects undefined or null 1ms
   ✓ circles domain > validation > validateCircleName > rejects empty or whitespace-only strings 0ms
   ✓ circles domain > validation > validateCircleName > allows trimmed non-empty strings 0ms
   ✓ circles domain > validation > validateCircleNameUpdate > allows undefined to indicate no change 0ms
   ✓ circles domain > validation > validateCircleNameUpdate > rejects empty or whitespace-only strings 0ms
   ✓ circles domain > validation > validateCircleNameUpdate > allows trimmed non-empty strings 0ms
   ✓ circles domain > slug > slugifyName > converts name to lowercase 0ms
   ✓ circles domain > slug > slugifyName > replaces spaces with hyphens 0ms
   ✓ circles domain > slug > slugifyName > replaces special characters with hyphens 0ms
   ✓ circles domain > slug > slugifyName > removes leading and trailing hyphens 0ms
   ✓ circles domain > slug > slugifyName > limits to 48 characters 0ms
   ✓ circles domain > slug > slugifyName > trims whitespace 0ms
   ✓ circles domain > slug > slugifyName > defaults to circle if empty after processing 0ms
   ✓ circles domain > slug > slugifyName > handles multiple consecutive special characters 0ms
   ✓ circles domain > slug > slugifyName > preserves alphanumeric characters 0ms
   ✓ circles domain > slug > slugifyName > handles unicode characters 0ms
   ✓ circles domain > slug > slugifyName > handles edge cases correctly 0ms
   ✓ circles domain > slug > ensureUniqueSlug > returns base slug if not in existing set 0ms
   ✓ circles domain > slug > ensureUniqueSlug > appends -1 if base slug exists 0ms
   ✓ circles domain > slug > ensureUniqueSlug > appends -2 if base and -1 exist 0ms
   ✓ circles domain > slug > ensureUniqueSlug > finds next available suffix 0ms
   ✓ circles domain > slug > ensureUniqueSlug > handles gaps in numbering 0ms
   ✓ circles domain > slug > ensureUniqueSlug > handles empty existing set 0ms
   ✓ circles domain > slug > ensureUniqueSlug > handles large suffix numbers 0ms
   ✓ circles domain > slug > ensureUniqueSlug > works with different base slugs 0ms
   ✓ circles domain > slug > ensureUniqueSlug > handles edge cases correctly 0ms
   × circles domain > queries > getCircleMembers helper > returns non-null members filtered to existing users 4ms
     → expected [ { personId: 'p1', …(5) } ] to deeply equal [ { personId: 'p1', …(3) } ]
   ✓ circles domain > lifecycle > createCircleInternal > throws validation error code when name is invalid 2ms
   ✓ circles domain > archival > archiveCircle > throws when attempting to archive root circle 1ms
   × circles domain > members > addCircleMember > throws when member already exists 2ms
     → expected [Function] to throw error matching /CIRCLE_MEMBER_EXISTS/ but got '[vitest] No "ensureWorkspacePersonNot…'
 ❯ |server| convex/features/flashcards/flashcards.test.ts (7 tests | 7 failed) 9ms
   × flashcards helpers > createFlashcardForUser combines auth and algorithm defaults 3ms
     → requireUserId does not exist
   × flashcards helpers > updateFlashcardContent requires flashcardId 0ms
     → requireUserId does not exist
   × flashcards helpers > updateFlashcardContent enforces ownership before patch 0ms
     → requireUserId does not exist
   × flashcards helpers > archiveFlashcardForUser deletes after ownership check 0ms
     → requireUserId does not exist
   × flashcards helpers > archiveFlashcardForUser surfaces auth errors 0ms
     → requireUserId does not exist
   × flashcards helpers > fetchFlashcardsFromSourceHelper parses API result 0ms
     → requireUserId does not exist
   × flashcards helpers > fetchFlashcardsFromSourceHelper surfaces generation failures 4ms
     → expected [Function] to throw error including 'FLASHCARD_GENERATION_FAILED: Failed t…' but got 'SYNERGYOS_ERROR|FLASHCARD_GENERATION_…'
 ✓ |server| src/lib/utils/wcag-validator.test.ts (7 tests) 3ms
 ❯ |server| convex/features/inbox/inbox.test.ts (15 tests | 5 failed) 25ms
   ✓ inbox helpers > ensureInboxOwnership returns item when owned 1ms
   × inbox helpers > ensureInboxOwnership throws with error code when not owned 17ms
     → expected [Function] to throw error including 'INBOX_ITEM_NOT_FOUND: Inbox item not …' but got 'SYNERGYOS_ERROR|INBOX_ITEM_NOT_FOUND|…'
   ✓ inbox helpers > updateInboxItemProcessedForSession patches and notifies 1ms
   × inbox helpers > updateInboxItemProcessedForSession rejects when ownership fails 1ms
     → expected [Function] to throw error including 'INBOX_ITEM_NOT_FOUND: Inbox item not …' but got 'SYNERGYOS_ERROR|INBOX_ITEM_NOT_FOUND|…'
   ✓ inbox helpers > archiveInboxItemForSession patches and notifies 0ms
   × inbox helpers > archiveInboxItemForSession rejects when ownership fails 1ms
     → expected [Function] to throw error including 'INBOX_ITEM_NOT_FOUND: Inbox item not …' but got 'SYNERGYOS_ERROR|INBOX_ITEM_NOT_FOUND|…'
   ✓ inbox helpers > restoreInboxItemForSession patches and notifies 0ms
   ✓ inbox helpers > createNoteInInboxForSession creates item and notifies 0ms
   ✓ inbox helpers > createFlashcardInInboxForSession creates flashcard, inbox item, tags, and notifies 0ms
   × inbox helpers > createFlashcardInInboxForSession propagates auth failure 1ms
     → expected [Function] to throw error including 'AUTH_REQUIRED: auth required' but got 'SYNERGYOS_ERROR|AUTH_REQUIRED|auth re…'
   ✓ inbox helpers > createHighlightInInboxForSession creates highlight, inbox item, tags, and notifies 0ms
   × inbox helpers > createHighlightInInboxForSession propagates auth failure 0ms
     → expected [Function] to throw error including 'AUTH_REQUIRED: auth required' but got 'SYNERGYOS_ERROR|AUTH_REQUIRED|auth re…'
   ✓ inbox helpers > findInboxItemForSession returns null when actor is not found 0ms
   ✓ inbox helpers > findInboxItemWithDetailsForSession returns null when not owned 0ms
   ✓ inbox helpers > findSyncProgressForSession maps progress fields 0ms
stdout | convex/features/readwise/readwise.test.ts > readwise helpers > ensureSources creates author and source when missing
[syncReadwise] Fetching books page 1...

 ❯ |server| convex/features/readwise/readwise.test.ts (6 tests | 3 failed) 11ms
   × readwise helpers > fetchReadwiseHighlightsHandler requires authentication 7ms
     → expected [Function] to throw error including 'AUTH_REQUIRED: Authentication required' but got 'SYNERGYOS_ERROR|AUTH_REQUIRED|Authent…'
   × readwise helpers > fetchReadwiseHighlightsHandler requires API key 1ms
     → expected [Function] to throw error including 'EXTERNAL_API_KEY_MISSING: Readwise AP…' but got 'SYNERGYOS_ERROR|EXTERNAL_API_KEY_MISS…'
   ✓ readwise helpers > parseFilters supports custom date range and quantity 0ms
   ✓ readwise helpers > parseIncrementalDate falls back to last sync time 0ms
   × readwise helpers > requireWorkspaceId throws when no memberships found 1ms
     → expected [Function] to throw error including 'WORKSPACE_MEMBERSHIP_REQUIRED: User m…' but got 'SYNERGYOS_ERROR|WORKSPACE_MEMBERSHIP_…'
   ✓ readwise helpers > ensureSources creates author and source when missing 1ms
 ✓ |server| src/lib/modules/org-chart/utils/parseOrgStructure.test.ts (33 tests) 5ms
 ❯ |server| convex/features/meetings/lifecycle.test.ts (3 tests | 1 failed) 8ms
   ✓ meetings lifecycle helpers > cancel meeting sets canceledAt 2ms
   × meetings lifecycle helpers > cancel meeting fails when started 5ms
     → expected [Function] to throw error including 'GENERIC_ERROR: Cannot cancel a meetin…' but got 'SYNERGYOS_ERROR|GENERIC_ERROR|Cannot …'
   ✓ meetings lifecycle helpers > restore clears canceled/deleted flags 0ms
 ✓ |server| src/lib/utils/color-conversion.test.ts (15 tests) 4ms
 ✓ |server| convex/features/meetings/helpers/templates.test.ts (4 tests) 4ms
 ❯ |server| convex/features/meetings/invitations.test.ts (2 tests | 1 failed) 7ms
   ✓ meetings/invitations helpers > accept user invitation inserts attendee and marks accepted 2ms
   × meetings/invitations helpers > decline rejects circle invitation 5ms
     → expected [Function] to throw error including 'GENERIC_ERROR: Only user invitations …' but got 'SYNERGYOS_ERROR|GENERIC_ERROR|Only us…'
 ✓ |server| src/lib/modules/org-chart/utils/orgChartLayout.test.ts (27 tests) 4ms
 ✓ |server| convex/infrastructure/access/withCircleAccess.test.ts (6 tests) 6ms
 ✓ |server| convex/features/tags/lifecycle.test.ts (4 tests) 6ms
 ✓ |server| convex/core/assignments/assignments.test.ts (4 tests) 6ms
 ✓ |server| tests/convex/sessionValidation.test.ts (12 tests) 6ms
 ✓ |server| tests/convex/readwiseUtils.test.ts (14 tests) 2ms
 ✓ |server| convex/features/tags/access.test.ts (3 tests) 6ms
 ✓ |server| src/lib/utils/filterInboxItems.test.ts (4 tests) 2ms
 ✓ |server| src/lib/modules/org-chart/utils/orgChartStyling.test.ts (28 tests) 3ms
 ✓ |server| convex/features/meetings/helpers/queries/listForUser.test.ts (2 tests) 2ms
 ❯ |server| convex/core/workspaces/workspaces.test.ts (11 tests | 5 failed) 11ms
   ✓ workspaces helpers > ensureSlugFormat rejects invalid characters 1ms
   ✓ workspaces helpers > ensureSlugNotReserved rejects reserved names 0ms
   ✓ workspaces helpers > ensureUniqueWorkspaceSlug appends suffix when taken 1ms
   × workspaces helpers > requireWorkspaceAdminOrOwner rejects members 6ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: Must be org …' but got 'SYNERGYOS_ERROR|WORKSPACE_ACCESS_DENI…'
   × workspaces helpers > ensureInviteEmailFormat rejects invalid emails 1ms
     → expected [Function] to throw error including 'VALIDATION_INVALID_FORMAT: Invalid em…' but got '(0 , ensureInvi…'
   × workspaces helpers > ensureUserNotAlreadyMember rejects existing membership 0ms
     → (0 , ensureUserNotAlreadyMember) is not a function
   ✓ workspaces helpers > branding validation rejects invalid color format 0ms
   ✓ workspaces helpers > branding validation accepts valid OKLCH format 0ms
   × workspaces helpers > removeMember prevents removing last owner 1ms
     → expected [Function] to throw error including 'WORKSPACE_LAST_OWNER: Cannot remove t…' but got 'SYNERGYOS_ERROR|WORKSPACE_LAST_OWNER|…'
   × workspaces helpers > updateWorkspaceSlug throws when workspace not found 1ms
     → expected [Function] to throw error including 'WORKSPACE_NOT_FOUND: Workspace not fo…' but got 'SYNERGYOS_ERROR|WORKSPACE_NOT_FOUND|W…'
   ✓ workspaces helpers > recordCreateHistory can be called with circle entity 1ms
 ❯ |server| convex/features/workspaceSettings/index.test.ts (2 tests | 2 failed) 8ms
   × workspaceSettings auth > getOrgSettings rejects when user is not a member 7ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: You do not h…' but got 'SYNERGYOS_ERROR|WORKSPACE_ACCESS_DENI…'
   × workspaceSettings auth > updateOrgSettings rejects non-admin users 1ms
     → expected [Function] to throw error including 'WORKSPACE_ACCESS_DENIED: Only workspa…' but got 'SYNERGYOS_ERROR|WORKSPACE_ACCESS_DENI…'
 ✓ |server| convex/infrastructure/db/withActiveFilter.test.ts (3 tests) 2ms
 ✓ |server| convex/features/tags/validation.test.ts (3 tests) 7ms
 ✓ |server| convex/core/users/users.test.ts (2 tests) 2ms
 ✓ |server| convex/core/authority/calculator.test.ts (23 tests) 2ms
 ❯ |server| convex/infrastructure/sessionValidation.test.ts (2 tests | 2 failed) 7ms
   × sessionValidation > validateSession throws SESSION_NOT_FOUND when no active session 6ms
     → expected [Function] to throw error including 'SESSION_NOT_FOUND:' but got 'SYNERGYOS_ERROR|SESSION_NOT_FOUND|Ses…'
   × sessionValidation > validateSessionAndGetUserId throws SESSION_REVOKED when session is revoked 1ms
     → expected [Function] to throw error including 'SESSION_REVOKED:' but got 'SYNERGYOS_ERROR|SESSION_REVOKED|Sessi…'
 ✓ |server| convex/features/tags/queries.test.ts (2 tests) 11ms
 ✓ |server| src/lib/modules/org-chart/utils/orgChartVisibility.test.ts (20 tests) 2ms
 ✓ |server| convex/admin/orgStructureImport.test.ts (1 test) 4ms
 ✓ |server| src/demo.spec.ts (1 test) 1ms
 ❯ |server| convex/features/meetings/agendaItems.test.ts (1 test | 1 failed) 6ms
   × meetings/agendaItems > updateNotes throws coded error when agenda item is missing 5ms
     → expected [Function] to throw error including 'AGENDA_ITEM_NOT_FOUND: Agenda item no…' but got 'SYNERGYOS_ERROR|AGENDA_ITEM_NOT_FOUND…'
 ✓ |server| convex/infrastructure/auth.test.ts (1 test) 1ms
 ❯ |server| convex/features/meetings/presence.test.ts (1 test | 1 failed) 6ms
   × meetings/presence > recordHeartbeat throws when meeting is missing with coded error 6ms
     → expected [Function] to throw error including 'MEETING_NOT_FOUND: Meeting not found' but got 'SYNERGYOS_ERROR|MEETING_NOT_FOUND|Mee…'

 Test Files  29 failed | 30 passed (59)
      Tests  189 failed | 345 passed | 4 skipped (538)
   Start at  07:30:04
   Duration  1.49s (transform 1.89s, setup 237ms, collect 5.49s, tests 3.08s, environment 5ms, prepare 2.30s)


```

## TypeScript Check

- Errors: 0
- Warnings: 0

```

> synergyos@0.1.0 check
> svelte-kit sync && svelte-check --tsconfig ./tsconfig.json

Loading svelte-check in workspace: /Users/randyhereman/Coding/SynergyOS
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings

```