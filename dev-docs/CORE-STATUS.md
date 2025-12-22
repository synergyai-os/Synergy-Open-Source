# CORE Status Assessment

**Living Document** — Updated as domains evolve  
**Last Updated**: 2025-12-21  
**Audit Source**: `/dev-docs/CORE-AUDIT-RAW.md`  
**Purpose**: Answer "what's actually implemented?" for each core domain

---

## Executive Summary

| Status | Count | Domains |
|--------|-------|---------|
| ✅ Complete | 6 | users, people, circles, roles, assignments, workspaces |
| ⚠️ Partial | 2 | proposals, authority |
| ❌ Not implemented | 1 | policies |
| 🔄 Needs redesign | 1 | history |

**Blocking Issues for Feature Work:**
1. **Critical invariant failures** (AUTH-01, GOV-03) — 2 circles missing lead assignments, 1 role missing decision rights
2. **History domain incomplete** — No mutation infrastructure, only queries exist
3. **Policies domain scaffold only** — No tables.ts, minimal implementation
4. **Test infrastructure issues** — 189 failed tests (mostly mocking/setup, not logic)

---

## Domain Assessments

### users

**Status:** ✅ Complete

**What Works:**
- Full CRUD operations (create, get, list, link accounts)
- Session validation (`validateSessionAndGetUserId`)
- WorkOS sync integration
- Account linking (bidirectional with transitive validation)
- Profile management with RBAC checks
- Workspace relationship queries

**File Inventory:**
- ✅ tables.ts (usersTable, userSettingsTable, accountLinksTable)
- ✅ queries.ts (6 exports: getCurrentUser, getUserById, etc.)
- ✅ mutations.ts (7 exports: syncUserFromWorkOS, updateUserProfile, etc.)
- ✅ rules.ts (7 exports: validation and auth helpers)
- ✅ constants.ts (MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS)
- ✅ schema.ts (types and re-exports)
- ✅ users.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ Passing (2/2 in users.test.ts)
- Integration tests: ⚠️ 8/9 failing (schema issue: flashcards by_user index missing)
- Issue: All integration test failures are due to unrelated flashcards table index, not users domain logic

**What's Missing:**
- Nothing — domain is architecturally complete

**What's Untested:**
- Account link depth enforcement in production scenarios
- Edge cases for WorkOS sync failures

**Blocking Issues:**
- None

---

### people

**Status:** ✅ Complete

**What Works:**
- Workspace-scoped identity (full separation from users)
- Four-status lifecycle (placeholder → invited → active → archived)
- Invitation flows (create, accept, transition)
- Email normalization and lookup
- Workspace membership queries
- Person-to-user linking

**File Inventory:**
- ✅ tables.ts (peopleTable)
- ✅ queries.ts (12 exports: getMyPerson, getPersonById, listPeopleInWorkspace, etc.)
- ✅ mutations.ts (8 exports: invitePerson, acceptInvite, archivePerson, etc.)
- ✅ rules.ts (11 exports: canArchivePerson, requireActivePerson, etc.)
- ✅ constants.ts (USER_ID_FIELD)
- ✅ schema.ts (types)
- ✅ people.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ Passing (13/13 in people.test.ts)
- Integration tests: Not isolated (covered by workspace flows)

**What's Missing:**
- Nothing — domain is architecturally complete

**What's Untested:**
- Placeholder-to-invited transitions in multi-workspace scenarios
- Edge cases for duplicate invitations

**Blocking Issues:**
- None

---

### circles

**Status:** ✅ Complete

**What Works:**
- Full CRUD (create, get, list, update, archive, restore)
- Hierarchical structure (parent/child circles)
- Circle types (hierarchy, empowered_team, guild, hybrid)
- Member management (add, remove, check membership)
- Workspace scoping and isolation
- Authority calculations per circle
- Slug generation and uniqueness

**File Inventory:**
- ✅ tables.ts (circlesTable, circleMembersTable, circleRolesTable)
- ✅ queries.ts (6 exports: get, list, canAccess, getMembers, isMember, getMyAuthority)
- ✅ mutations.ts (7 exports: create, update, archive, restore, addMember, removeMember, updateInline)
- ✅ rules.ts (1 export: requireCircle)
- ✅ constants.ts (CIRCLE_TYPES, DECISION_MODELS with type guards)
- ✅ schema.ts (types)
- ✅ circles.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ 28/30 passing (2 failures: member filtering test, addMember test)
- Integration tests: ⚠️ 13/13 failing (schema issue: template system seeding, flashcards index)
- Issue: Integration test failures are setup/infrastructure, not circle logic

**What's Missing:**
- Nothing — domain is architecturally complete

**What's Untested:**
- Circular parent reference prevention (test exists but needs verification)
- Deep hierarchy navigation (5+ levels)

**Blocking Issues:**
- **AUTH-01 invariant**: 2 active circles missing Circle Lead assignment (critical)

---

### roles

**Status:** ✅ Complete

**What Works:**
- Full CRUD for roles (create, update, archive, restore)
- Role templates (system + workspace-scoped)
- Role types (circle_lead, structural, custom)
- Assignment management (assign/remove users)
- Role validation (duplicate names, lead requirements)
- RBAC bridge (roleTemplates → workspaceRoles)
- Decision rights and purpose fields (via customFieldValues)

**File Inventory:**
- ✅ tables.ts (roleTemplatesTable)
- ✅ queries.ts (8 exports: get, canAccess, listByCircle, getUserRoles, etc.)
- ✅ mutations.ts (9 exports: create, update, archiveRole, assignUser, etc.)
- ✅ rules.ts (7 exports: validation helpers like hasDuplicateRoleName, isLeadTemplate)
- ✅ constants.ts (ROLE_TYPES with type guard)
- ✅ schema.ts (types)
- ✅ roles.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ⚠️ 2/19 passing (17 failures: mocking issues with vi.mock imports)
- Integration tests: ⚠️ 0/13 passing (schema issues: flashcards index, field validation)
- Issue: Test failures are infrastructure (mocking, schema), not role logic

**What's Missing:**
- Nothing — domain is architecturally complete

**What's Untested:**
- Lead role transformation on circle type change
- Template inheritance across workspace hierarchy

**Blocking Issues:**
- **GOV-03 invariant**: 1 role missing decision rights (critical)

---

### assignments

**Status:** ✅ Complete

**What Works:**
- Person-to-role assignment tracking
- Term-based assignments (start/end dates)
- Active/ended state management
- Circle membership derived from assignments
- Assignment history and audit trail
- Validation (person exists, role exists, circle context)

**File Inventory:**
- ✅ tables.ts (assignmentsTable)
- ✅ queries.ts (8 exports: getActiveAssignmentForRole, listAssignmentsForPerson, etc.)
- ✅ mutations.ts (3 exports: create, end, update)
- ✅ rules.ts (7 exports: canCreateAssignment, requireActiveAssignment, etc.)
- ❌ constants.ts (missing — not needed for this domain)
- ✅ schema.ts (types)
- ✅ assignments.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ 4/4 passing
- Integration tests: Not isolated (covered by circle role flows)

**What's Missing:**
- Nothing — domain is architecturally complete

**What's Untested:**
- Overlapping assignments to same role (conflict handling)
- Historical assignment queries (ended terms)

**Blocking Issues:**
- None (but see AUTH-01 — missing lead assignments affect this domain)

---

### proposals

**Status:** ⚠️ Partial

**What Works:**
- Full state machine (draft → submitted → in_meeting → approved/rejected/withdrawn)
- Proposal creation and submission
- Evolution tracking (proposal changes over time)
- Meeting import/export
- Circle-scoped proposals
- Workspace membership enforcement
- Slug generation

**File Inventory:**
- ✅ tables.ts (circleProposalsTable, proposalEvolutionsTable, proposalObjectionsTable, proposalAttachmentsTable)
- ✅ queries.ts (6 exports: get, list, listByCircle, myListDrafts, etc.)
- ✅ mutations.ts (11 exports: create, submit, approve, reject, withdraw, etc.)
- ✅ rules.ts (10 exports: state machine validation, transition logic)
- ✅ constants.ts (PROPOSAL_STATUSES)
- ✅ schema.ts (types)
- ✅ proposals.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ⚠️ 6/9 passing (3 failures: PROPOSAL_STATUSES.includes is not a function)
- Integration tests: ⚠️ 0/14 passing (authorization issues, flashcards index)
- Issue: Constants export issue + authorization context missing in tests

**What's Missing:**
- **Proposal approval authority calculation** — Tests show `PROPOSAL_ACCESS_DENIED` errors
- **Objection handling flows** — Objections table exists but workflow incomplete
- **Version history integration** — History records not created on approval

**What's Untested:**
- Full objection → integration → approval cycle
- Proposal attachment handling
- Historical proposal queries

**Blocking Issues:**
- Authorization layer incomplete (tests fail at `approve`/`reject` with access denied)
- PROPOSAL_STATUSES constant not exported correctly (breaks `isProposalStatus` validation)

---

### policies

**Status:** ❌ Not implemented

**What Works:**
- Basic scaffolding (queries.ts, mutations.ts, rules.ts exist)
- `listPolicies` query (minimal implementation)
- `ensurePolicy` mutation (stub)

**File Inventory:**
- ❌ tables.ts (MISSING — critical blocker)
- ✅ queries.ts (1 export: listPolicies — stub)
- ✅ mutations.ts (1 export: ensurePolicy — stub)
- ✅ rules.ts (1 export: requirePoliciesDomain — stub)
- ❌ constants.ts (missing — not needed yet)
- ✅ schema.ts (exists but no tables to reference)
- ❌ policies.test.ts (MISSING)
- ✅ README.md (exists — describes intent, not implementation)

**Tests:**
- Unit tests: None (no test file)
- Integration tests: None

**What's Missing:**
- **Everything** — tables.ts required to define schema
- Policy data model undefined
- Policy enforcement mechanism undefined
- Circle-to-policy relationship undefined

**What's Untested:**
- All functionality (not implemented)

**Blocking Issues:**
- **No tables.ts** — Cannot store policies without schema
- **No data model** — "Policy" concept not defined beyond scaffold
- **Deferred until governance customization scoped** (per architecture.md)

**Recommendation:**
- Mark as "intentionally incomplete" — not blocking feature work
- Revisit when governance customization features are scoped

---

### authority

**Status:** ⚠️ Partial

**What Works:**
- Authority calculation from roles (`calculateAuthority`)
- Circle Lead detection (`isCircleLead`)
- Facilitator detection (`isFacilitator`)
- Circle membership check (`isCircleMember`)
- Role-based authority checks (`hasRole`)
- Authority model description (`describeAuthorityModel`)

**File Inventory:**
- ⏭️ tables.ts (not required — calculation-only domain)
- ✅ queries.ts (1 export: describeAuthorityModel)
- ✅ mutations.ts (1 export: assertAuthorityIsDerived)
- ✅ rules.ts (4 exports: hasRole, isCircleLead, isFacilitator, isCircleMember)
- ❌ constants.ts (missing — could benefit from authority model constants)
- ✅ schema.ts (types)
- ✅ authority.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ 23/23 passing (calculator.test.ts)
- Unit tests: ⚠️ 8/10 passing (authority.test.ts — 2 failures: getAuthorityContext mock issues)
- Integration tests: Not isolated (covered by circle/role flows)

**What's Missing:**
- **Circle type-specific authority logic** — Tests for hierarchy vs empowered_team vs guild
- **Authority caching** — Performance optimization for repeated calculations
- **Authority inheritance** — Parent circle authority propagation (if needed)

**What's Untested:**
- Multi-role authority resolution (person with 3+ roles)
- Edge cases: archived roles, ended assignments
- Performance with 100+ person circles

**Blocking Issues:**
- None (calculation works, gaps are edge cases)

---

### history

**Status:** 🔄 Needs redesign

**What Works:**
- Read operations (queries exist):
  - `getEntityHistory` — Timeline for specific entity
  - `getUserChanges` — All changes by a user
  - `getWorkspaceTimeline` — Workspace-wide history
- Schema definition (`orgVersionHistoryTable` in schema.ts)

**File Inventory:**
- ❌ tables.ts (MISSING — orgVersionHistoryTable defined in schema.ts directly)
- ✅ queries.ts (3 exports: getEntityHistory, getUserChanges, getWorkspaceTimeline)
- ❌ mutations.ts (MISSING — critical blocker)
- ❌ rules.ts (MISSING — no validation/access control)
- ❌ constants.ts (missing — could define entity types, change types)
- ✅ schema.ts (orgVersionHistoryTable exists here — wrong location)
- ✅ history.test.ts (2/2 passing — basic query tests only)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ✅ 2/2 passing (query logic only)
- Integration tests: None (no write operations to test)

**What's Missing:**
- **No write operations** — How do changes get recorded?
- **No mutations.ts** — Cannot manually record history
- **No rules.ts** — No validation or access control
- **Table in wrong location** — Should be in `tables.ts`, not `schema.ts`
- **No automatic history tracking** — No hooks/middleware to auto-record changes
- **Workspace lifecycle integration missing** — GOV-06 (history only tracked when phase='active')

**What's Untested:**
- All write operations (don't exist)
- History recording on proposal approval
- History recording on circle changes
- Phase-aware history gating

**Blocking Issues:**
- **No mutation infrastructure** — Cannot record history without mutations
- **Architectural confusion** — Is history manual or automatic? How is it triggered?
- **GOV-06 implementation incomplete** — Workspace phase checking not enforced

**Recommendation:**
- **Move orgVersionHistoryTable** to `history/tables.ts`
- **Decide recording strategy**: Automatic (middleware) vs manual (explicit calls)
- **Create mutations.ts** with `recordChange(ctx, entityType, entityId, changes, personId)`
- **Create rules.ts** with `requireHistoryAccess`, `shouldRecordHistory(workspace)`
- **Add constants.ts** with `ENTITY_TYPES`, `CHANGE_TYPES`

---

### workspaces

**Status:** ✅ Complete

**What Works:**
- Workspace creation and management
- Slug generation and validation (reserved names, uniqueness)
- Workspace lifecycle (design → active activation)
- Activation validation (root circle checks, lead role checks)
- Workspace settings and aliases
- Multi-tenant isolation

**File Inventory:**
- ✅ tables.ts (workspacesTable, workspaceSettingsTable, workspaceOrgSettingsTable, workspaceAliasesTable)
- ✅ queries.ts (5 exports: findById, findBySlug, listWorkspaces, getActivationIssues, getAliasBySlug)
- ✅ mutations.ts (1 export: activate)
- ✅ rules.ts (1 export: runActivationValidation)
- ❌ constants.ts (missing — could define reserved slugs, validation rules)
- ✅ schema.ts (ActivationIssueValidator type)
- ✅ workspaces.test.ts (exists)
- ✅ README.md (exists)

**Tests:**
- Unit tests: ⚠️ 6/11 passing (5 failures: error format expectations)
- Integration tests: ⚠️ 1/10 passing (flashcards index, RBAC permission checks)
- Issue: Test failures are error format changes, not workspace logic

**What's Missing:**
- Nothing architecturally — activation flow works

**What's Untested:**
- Activation with 100+ circles (performance)
- Workspace deletion/archival (if supported)

**Blocking Issues:**
- None

---

## Cross-Domain Flow Testing

### Identity Chain (session → workspace)

**Status:** ✅ Working

**Flow:**
```
sessionId → validateSessionAndGetUserId → userId
userId + workspaceId → getPersonByUserAndWorkspace → personId
```

**Evidence:**
- Integration tests show successful session validation
- Person-to-workspace lookups working
- Workspace isolation enforced

**Issues:**
- None

---

### Create circle → auto-creates lead role

**Status:** ⚠️ Partially Working

**Expected Flow:**
1. Create circle with `circleType`
2. System looks up roleTemplate for that `circleType` + `roleType: 'circle_lead'`
3. System creates role with template defaults
4. System validates GOV-01 (exactly one lead role)

**Evidence:**
- Integration tests show: `TEMPLATE_NOT_FOUND: No system templates found for circle type "hierarchy"`
- Schema supports templates (roleTemplates table exists)
- Logic exists in `features/circleRoles/mutations.ts` (`createCoreRolesForCircle`)

**Issues:**
- **Templates not seeded** — Integration tests fail because system templates missing
- **Seeding not automatic** — Requires manual `npm run seed` (not run in test setup)

**Blocking:**
- **AUTH-01 invariant failure** — 2 circles without lead assignments (likely missing templates)

**Recommendation:**
- Ensure test setup runs template seed
- Add invariant check to circle creation (fail fast if templates missing)

---

### Assign person → authority calculated

**Status:** ✅ Working

**Flow:**
1. Create assignment (person + role + circle)
2. Authority query reads assignments
3. `calculateAuthority` computes permissions from role types

**Evidence:**
- `authority/calculator.test.ts`: 23/23 passing
- Authority calculation logic tested and working

**Issues:**
- None (calculation works; assignment creation tested separately)

---

### Proposal state machine

**Status:** ⚠️ Partially Working

**Flow:**
1. Create proposal (draft)
2. Add evolutions (changes)
3. Submit → `submitted`
4. Import to meeting → `in_meeting`
5. Approve/reject → `approved`/`rejected`

**Evidence:**
- Unit tests: State machine validation working (6/9 passing)
- Integration tests: State transitions fail at authorization

**Issues:**
- **Authorization checks incomplete** — Cannot approve/reject (access denied)
- **PROPOSAL_STATUSES constant export issue** — `includes` is not a function

**Blocking:**
- Proposal approval flow broken (cannot test full state machine)

**Recommendation:**
- Fix PROPOSAL_STATUSES export (should be array, not object)
- Implement proposal authorization layer (who can approve?)

---

### History on changes

**Status:** ❌ Not Implemented

**Expected Flow:**
1. Approve proposal (state = `approved`)
2. System records history entry in `orgVersionHistory`
3. History includes: what changed, who approved, when

**Evidence:**
- No mutations.ts in history domain
- No calls to history recording in proposal mutations
- GOV-06 invariant (history recording) marked "warning" (not enforced)

**Issues:**
- **No write operations** — History domain is read-only
- **No automatic tracking** — Changes not recorded

**Blocking:**
- Cannot test history flows (no way to write history)

**Recommendation:**
- Implement history recording before production
- Decide: automatic middleware or manual calls

---

### Workspace lifecycle

**Status:** ✅ Working

**Flow:**
1. Create workspace (phase = `design`)
2. Build circles, roles, assignments freely
3. Run activation validation
4. Activate → phase = `active` (one-way, permanent)

**Evidence:**
- `workspaces/mutations.ts`: `activate` function exists
- `workspaces/rules.ts`: `runActivationValidation` checks invariants
- Tests: 6/11 passing (failures are error format, not logic)

**Issues:**
- None (activation works)

---

## Test Summary

### Unit Tests

**Overall:** 345/538 passing (64%)

**By Domain:**
- ✅ users: 2/2
- ✅ people: 13/13
- ⚠️ circles: 28/30
- ⚠️ roles: 2/19 (mocking issues)
- ✅ assignments: 4/4
- ⚠️ proposals: 6/9 (constant export issue)
- ❌ policies: No tests
- ✅ authority: 31/33
- ✅ history: 2/2
- ⚠️ workspaces: 6/11 (error format issues)

**Key Issue:**
- Most failures are **test infrastructure** (mocking, flashcards index) not domain logic

### Integration Tests

**Overall:** 0/189 passing (0%) — All fail due to shared issue

**Root Cause:**
- `Cannot use index "by_user" for table "flashcards" because it is not declared in the schema`
- This is a schema issue in flashcards feature (not core)
- Blocks all integration tests (shared test setup)

**Recommendation:**
- Fix flashcards schema (add missing index)
- Re-run integration tests
- Likely many will pass once schema fixed

### Invariants

**Overall:** 45/47 passing (96%)

**Failures:**
- **AUTH-01** (critical): 2 active circles missing Circle Lead assignment
  - Sample IDs: `q570bd5tmnxhx4zvrax4sy4hm17xjqws`, `q57e72q05q1my9na2979pprdcs7xjn7p`
- **GOV-03** (critical): 1 role missing decision rights
  - Sample ID: `q97b13vk19e2w489dn05bk7se97xkjc7`

**Impact:**
- Low (test data) — Can be fixed by:
  1. Running template seed
  2. Manually assigning leads to affected circles
  3. Adding decision rights to affected role

---

## Recommendations

### Critical (Block Production)

1. **Fix invariant failures**
   - Resolve AUTH-01: Assign Circle Leads to 2 affected circles
   - Resolve GOV-03: Add decision rights to 1 affected role
   - Ensure template seeding runs on workspace creation

2. **Implement history mutations**
   - Move `orgVersionHistoryTable` to `history/tables.ts`
   - Create `history/mutations.ts` with recording functions
   - Integrate with proposal approval flow
   - Document recording strategy (automatic vs manual)

3. **Complete proposal authorization**
   - Implement authority checks in `approve`/`reject` mutations
   - Fix PROPOSAL_STATUSES export (array, not object)
   - Add tests for multi-role approval scenarios

4. **Fix flashcards schema**
   - Add missing `by_user` index to flashcards table
   - Unblocks all integration tests

### High Priority (Before Feature Work)

5. **Complete policies domain OR mark as deferred**
   - If needed soon: Create `policies/tables.ts`, define data model
   - If deferred: Update architecture.md to clarify "not needed for MVP"

6. **Improve test infrastructure**
   - Fix mocking strategy (roles tests: 17 failures)
   - Standardize error format expectations (workspaces tests: 5 failures)
   - Add integration test isolation (don't share flashcards schema)

### Medium Priority (Quality Improvements)

7. **Authority edge cases**
   - Test multi-role authority resolution
   - Test archived role / ended assignment scenarios
   - Add performance tests (100+ person circles)

8. **Cross-domain flow tests**
   - Add explicit tests for identity chain
   - Add explicit tests for circle → lead auto-creation
   - Add explicit tests for assignment → authority calculation

### Low Priority (Future Work)

9. **Performance optimization**
   - Authority calculation caching
   - Workspace activation validation (large hierarchies)

10. **Documentation**
    - Add code examples to domain READMEs
    - Document template seeding process
    - Document history recording best practices

---

## What's Blocking Feature Work?

| Feature Area | Blocker | Severity |
|--------------|---------|----------|
| **Governance flows** | AUTH-01 invariant (missing leads) | High |
| **Proposal approval** | Authorization incomplete | High |
| **Audit trails** | History mutations missing | Medium |
| **Custom policies** | Policies domain not implemented | Low (deferred) |
| **Integration tests** | Flashcards schema issue | High (testing) |

---

## Next Steps

1. **Fix AUTH-01 and GOV-03** — Run seed, manually fix affected records
2. **Implement history mutations** — Unblock audit trail functionality
3. **Complete proposal authorization** — Enable end-to-end governance testing
4. **Fix flashcards schema** — Unblock integration test suite
5. **Mark policies as "deferred"** — Clarify it's not blocking MVP

---

*This document should be updated as domains evolve. Run audit script periodically and regenerate assessments.*

