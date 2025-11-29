# Impact Analysis: Renaming `organizations` to `workspaces`

## Executive Summary

Renaming the `organizations` table to `workspaces` is a **major refactoring** that will impact:

- **967+ references** to "organizations" across the codebase
- **Schema changes** affecting 20+ tables with `organizationId` fields
- **3 related tables** that may also need renaming
- **Entire frontend module** (`modules/core/organizations`)
- **API endpoints** (`api.organizations.*`)
- **Route paths** (`/org/*`)
- **TypeScript types** (`Id<'organizations'>`)

**Estimated Impact**: 🔴 **HIGH** - Requires coordinated changes across backend, frontend, types, routes, and documentation.

---

## 1. Schema Changes (`convex/schema.ts`)

### Primary Table

- ✅ `organizations` → `workspaces`
- ✅ All `v.id('organizations')` → `v.id('workspaces')` (found in 20+ tables)

### Related Tables (Decision Required)

These tables reference `organizations` and may need renaming for consistency:

1. **`organizationMembers`** → `workspaceMembers`?
   - Used in: 50+ locations
   - Index: `by_organization` → `by_workspace`?

2. **`organizationInvites`** → `workspaceInvites`?
   - Used in: 30+ locations
   - Index: `by_organization` → `by_workspace`?

3. **`organizationSettings`** → `workspaceSettings`?
   - Used in: 10+ locations
   - Index: `by_organization` → `by_workspace`?

### Tables with `organizationId` Fields (All Need Updates)

| Table                  | Current Field               | New Field             | Index Updates Needed                         |
| ---------------------- | --------------------------- | --------------------- | -------------------------------------------- |
| `organizationMembers`  | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `circles`              | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `meetings`             | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `meetingTemplates`     | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `organizationInvites`  | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `organizationSettings` | `organizationId`            | `workspaceId`         | `by_organization` → `by_workspace`           |
| `sources`              | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |
| `highlights`           | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |
| `inboxItems`           | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |
| `tags`                 | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |
| `flashcards`           | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |
| `featureFlags`         | `allowedOrganizationIds`    | `allowedWorkspaceIds` | N/A                                          |
| `userRoles`            | `organizationId` (optional) | `workspaceId`         | `by_user_organization` → `by_user_workspace` |
| `permissionAuditLog`   | `organizationId` (optional) | `workspaceId`         | `by_organization` → `by_workspace`           |

**Total**: ~14 tables with `organizationId` fields + 3 related tables = **17 table changes**

---

## 2. Convex Backend Changes

### Files Requiring Updates

#### Core Organization Files

- ✅ `convex/organizations.ts` → `convex/workspaces.ts`
  - All queries/mutations referencing `'organizations'` table
  - All `Id<'organizations'>` type references
  - Function names: `ensureUniqueOrganizationSlug` → `ensureUniqueWorkspaceSlug`
  - Variable names: `organizationId` → `workspaceId`

#### Related Backend Files (50+ files)

- `convex/organizationSettings.ts` → `convex/workspaceSettings.ts`
- `convex/meetings.ts` - 20+ references to `organizationId`
- `convex/circles.ts` - References `organizationId`
- `convex/tags.ts` - References `organizationId`
- `convex/permissions.ts` - References `organizationId`
- `convex/featureFlags.ts` - References `allowedOrganizationIds`
- `convex/meetingTemplates.ts` - References `organizationId`
- `convex/meetingActionItems.ts` - References `organizationId`
- `convex/meetingDecisions.ts` - References `organizationId`
- `convex/meetingAgendaItems.ts` - References `organizationId`
- `convex/circleRoles.ts` - References `organizationId`
- `convex/seedOrgChart.ts` - References `organizationId`

### Query/Mutation Pattern Changes

**Before:**

```typescript
ctx.db.query('organizations')
ctx.db.insert('organizations', {...})
Id<'organizations'>
v.id('organizations')
```

**After:**

```typescript
ctx.db.query('workspaces')
ctx.db.insert('workspaces', {...})
Id<'workspaces'>
v.id('workspaces')
```

### Index Pattern Changes

**Before:**

```typescript
.withIndex('by_organization', (q) => q.eq('organizationId', id))
```

**After:**

```typescript
.withIndex('by_workspace', (q) => q.eq('workspaceId', id))
```

---

## 3. Frontend Module Changes

### Entire Module Directory

- ✅ `src/lib/modules/core/organizations/` → `src/lib/modules/core/workspaces/`
  - **18 files** in this directory need renaming/updating

### Key Files

- `api.ts` - API contract definitions
- `components/OrganizationSwitcher.svelte` → `WorkspaceSwitcher.svelte`
- `components/OrganizationModals.svelte` → `WorkspaceModals.svelte`
- `components/InviteMemberModal.svelte` - Update references
- `composables/useOrganizations.svelte.ts` → `useWorkspaces.svelte.ts`
- `composables/useOrganizationMembers.svelte.ts` → `useWorkspaceMembers.svelte.ts`
- `composables/useOrganizationQueries.svelte.ts` → `useWorkspaceQueries.svelte.ts`
- `composables/useOrganizationMutations.svelte.ts` → `useWorkspaceMutations.svelte.ts`
- All test files

### TypeScript Interface Changes

**Before:**

```typescript
interface OrganizationsModuleAPI {
	organizations: OrganizationSummary[];
	activeOrganizationId: string | null;
	activeOrganization: OrganizationSummary | null;
	// ...
}
```

**After:**

```typescript
interface WorkspacesModuleAPI {
	workspaces: WorkspaceSummary[];
	activeWorkspaceId: string | null;
	activeWorkspace: WorkspaceSummary | null;
	// ...
}
```

---

## 4. API Endpoint Changes

### Convex API (`convex/_generated/api.d.ts`)

- ✅ `api.organizations.*` → `api.workspaces.*`

### Affected Endpoints (Found 44+ references)

- `api.organizations.listOrganizations` → `api.workspaces.listWorkspaces`
- `api.organizations.createOrganization` → `api.workspaces.createWorkspace`
- `api.organizations.getBranding` → `api.workspaces.getBranding`
- `api.organizations.updateBranding` → `api.workspaces.updateBranding`
- `api.organizations.getMembers` → `api.workspaces.getMembers`
- `api.organizations.createOrganizationInvite` → `api.workspaces.createWorkspaceInvite`
- `api.organizations.acceptOrganizationInvite` → `api.workspaces.acceptWorkspaceInvite`
- `api.organizations.listOrganizationInvites` → `api.workspaces.listWorkspaceInvites`
- `api.organizations.getInviteByCode` → `api.workspaces.getInviteByCode`
- `api.organizations.removeOrganizationMember` → `api.workspaces.removeWorkspaceMember`
- `api.organizations.recordOrganizationSwitch` → `api.workspaces.recordWorkspaceSwitch`

### Files Using API Endpoints

- `src/routes/(authenticated)/+layout.svelte` (2 references)
- `src/routes/(authenticated)/+layout.server.ts` (3 references)
- `src/routes/(authenticated)/org/settings/branding/+page.svelte`
- `src/routes/(authenticated)/org/settings/branding/+page.server.ts`
- `src/routes/invite/+page.svelte`
- `src/routes/auth/login/+server.ts`
- `src/routes/auth/verify-email/+server.ts`
- `src/routes/auth/linked-sessions/+server.ts`
- `src/hooks.server.ts`
- `src/lib/modules/meetings/composables/useActionItems.svelte.ts`
- `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts`
- `src/lib/modules/org-chart/composables/useCircleMembers.svelte.ts`
- All organization module composables

---

## 5. Route Path Changes

### Current Routes (`/org/*`)

- ✅ `/org/circles/[id]` → `/workspace/circles/[id]`?
- ✅ `/org/members` → `/workspace/members`?
- ✅ `/org/circles` → `/workspace/circles`?
- ✅ `/org/chart` → `/workspace/chart`?
- ✅ `/org/onboarding` → `/workspace/onboarding`?
- ✅ `/org/teams/[id]` → `/workspace/teams/[id]`?
- ✅ `/org/settings/branding` → `/workspace/settings/branding`?

**Decision Required**: Keep `/org/` for brevity, or change to `/workspace/` for consistency?

### Route Files (10 files)

- `src/routes/(authenticated)/org/circles/[id]/+page.svelte`
- `src/routes/(authenticated)/org/members/+page.svelte`
- `src/routes/(authenticated)/org/circles/+page.svelte`
- `src/routes/(authenticated)/org/chart/+page.svelte`
- `src/routes/(authenticated)/org/onboarding/+page.svelte`
- `src/routes/(authenticated)/org/teams/[id]/+page.server.ts`
- `src/routes/(authenticated)/org/teams/+page.server.ts`
- `src/routes/(authenticated)/org/circles/+layout.server.ts`
- `src/routes/(authenticated)/org/settings/branding/+page.svelte`
- `src/routes/(authenticated)/org/settings/branding/+page.server.ts`

---

## 6. TypeScript Type Changes

### Convex Generated Types

- ✅ `Id<'organizations'>` → `Id<'workspaces'>` (found in 100+ locations)
- ✅ `Doc<'organizations'>` → `Doc<'workspaces'>`

### Custom Types

- `OrganizationSummary` → `WorkspaceSummary`
- `OrganizationInvite` → `WorkspaceInvite`
- `OrganizationMember` → `WorkspaceMember`
- `OrganizationsModuleAPI` → `WorkspacesModuleAPI`

### Variable Name Changes (Throughout Codebase)

- `organizationId` → `workspaceId` (found in 1100+ locations)
- `organization` → `workspace`
- `organizations` → `workspaces`
- `activeOrganizationId` → `activeWorkspaceId`
- `activeOrganization` → `activeWorkspace`
- `organizationInvites` → `workspaceInvites`
- `organizationMembers` → `workspaceMembers`

---

## 7. Context & State Management

### Svelte Context Keys

- ✅ `'organizations'` context → `'workspaces'` context

**Files Using Context:**

- `src/routes/(authenticated)/+layout.svelte`
- `src/routes/(authenticated)/meetings/+page.svelte`
- `src/routes/(authenticated)/org/circles/[id]/+page.svelte`
- All organization module composables

### Local Storage Keys

- Check `organizationStorage.ts` for localStorage keys that may reference "organization"

---

## 8. Documentation & Comments

### Documentation Files

- `dev-docs/master-docs/architecture.md` - May reference organizations
- `dev-docs/master-docs/product-vision.md` - May reference organizations
- `dev-docs/2-areas/patterns/*.md` - Pattern docs
- `ai-docs/tasks/*.md` - Task documentation
- `src/lib/modules/meetings/docs/*.md` - Meeting docs
- `src/lib/modules/projects/README.md` - References organizations
- `src/lib/modules/documents/README.md` - References organizations

### Code Comments

- Update all comments referencing "organization" to "workspace"
- Update function documentation

---

## 9. Test Files

### Integration Tests

- `src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts`
- `tests/convex/integration/setup.ts` - Test helpers
- All composable test files

### Mock Data

- `tests/composables/test-utils/mockConvex.svelte.ts` - Mock query results
- `tests/composables/test-utils/setupMocks.svelte.ts` - Mock setup

---

## 10. Migration Strategy Considerations

### Database Migration

⚠️ **CRITICAL**: Convex schema changes require:

1. **Data migration script** to rename table and update all references
2. **Backward compatibility** period (if needed)
3. **Deployment coordination** - schema changes must be deployed before code changes

### Migration Steps (Recommended Order)

1. **Phase 1: Schema Migration**
   - Create migration script to rename `organizations` → `workspaces`
   - Update all `organizationId` fields → `workspaceId`
   - Update all indexes
   - Test in development environment

2. **Phase 2: Backend Updates**
   - Rename `convex/organizations.ts` → `convex/workspaces.ts`
   - Update all Convex queries/mutations
   - Update all type references
   - Update related backend files

3. **Phase 3: Frontend Updates**
   - Rename module directory
   - Update all component names
   - Update all composables
   - Update all API calls
   - Update all types

4. **Phase 4: Routes & Context**
   - Update route paths (if changing)
   - Update context keys
   - Update localStorage keys

5. **Phase 5: Documentation**
   - Update all documentation
   - Update comments
   - Update README files

6. **Phase 6: Testing**
   - Run all integration tests
   - Run all unit tests
   - Manual QA testing
   - Verify data integrity

---

## 11. Decisions Required

### Critical Decisions

1. **Related Tables**: Should we rename?
   - `organizationMembers` → `workspaceMembers`?
   - `organizationInvites` → `workspaceInvites`?
   - `organizationSettings` → `workspaceSettings`?

2. **Route Paths**: Keep `/org/` or change to `/workspace/`?
   - Option A: Keep `/org/` (shorter, user-friendly)
   - Option B: Change to `/workspace/` (consistent with schema)

3. **Field Names**: Keep `organizationId` or change to `workspaceId`?
   - Option A: Change to `workspaceId` (consistent with table name)
   - Option B: Keep `organizationId` (less breaking, but inconsistent)

4. **Migration Strategy**: Big bang or gradual?
   - Option A: All at once (cleaner, but risky)
   - Option B: Gradual with compatibility layer (safer, but more complex)

5. **Backward Compatibility**: Do we need to support old API endpoints temporarily?
   - Option A: Yes, add compatibility layer
   - Option B: No, breaking change is acceptable

---

## 12. Risk Assessment

### High Risk Areas

- 🔴 **Schema migration** - Data loss risk if migration fails
- 🔴 **Type system** - TypeScript compilation errors if types don't match
- 🔴 **API endpoints** - Breaking changes for any external consumers
- 🔴 **Route paths** - Broken bookmarks/links if routes change
- 🔴 **Context keys** - Runtime errors if context keys don't match

### Medium Risk Areas

- 🟡 **Test files** - Tests may fail if not updated
- 🟡 **Documentation** - Outdated docs may confuse developers
- 🟡 **Variable names** - Inconsistent naming if not fully updated

### Low Risk Areas

- 🟢 **Comments** - Cosmetic only
- 🟢 **README files** - Documentation only

---

## 13. Estimated Effort

### Time Estimate (Rough)

- **Schema changes**: 2-4 hours
- **Backend updates**: 8-12 hours
- **Frontend module updates**: 6-8 hours
- **Route updates**: 2-3 hours
- **Type updates**: 4-6 hours
- **Test updates**: 4-6 hours
- **Documentation**: 2-3 hours
- **QA & Testing**: 4-8 hours

**Total**: ~32-50 hours (4-6 days for one developer)

### Complexity Factors

- Large number of files to update (967+ references)
- Need for careful coordination between schema and code
- Risk of breaking existing functionality
- Need for comprehensive testing

---

## 14. Recommendations

### Recommended Approach

1. **Start with a spike/prototype** in a feature branch
   - Test schema migration in development
   - Verify data integrity
   - Identify edge cases

2. **Create a detailed migration plan** with:
   - Step-by-step checklist
   - Rollback plan
   - Testing strategy
   - Deployment strategy

3. **Consider keeping route paths** (`/org/`) for user experience
   - Routes can remain `/org/*` even if schema is `workspaces`
   - Less breaking for users/bookmarks

4. **Rename related tables** for consistency
   - `organizationMembers` → `workspaceMembers`
   - `organizationInvites` → `workspaceInvites`
   - `organizationSettings` → `workspaceSettings`

5. **Use find-and-replace carefully**
   - Some "organization" references may be intentional (e.g., in comments about business logic)
   - Review each change manually

6. **Coordinate deployment**
   - Schema changes must deploy first
   - Backend changes deploy second
   - Frontend changes deploy last

---

## 15. Checklist for Implementation

### Pre-Implementation

- [ ] Get stakeholder approval
- [ ] Create feature branch
- [ ] Set up development environment for testing
- [ ] Create backup of production data (if applicable)

### Schema Changes

- [ ] Create migration script
- [ ] Test migration in development
- [ ] Update `convex/schema.ts`
- [ ] Update all `v.id('organizations')` → `v.id('workspaces')`
- [ ] Update all `organizationId` fields → `workspaceId`
- [ ] Update all indexes
- [ ] Verify schema compiles

### Backend Changes

- [ ] Rename `convex/organizations.ts` → `convex/workspaces.ts`
- [ ] Update all table references (`'organizations'` → `'workspaces'`)
- [ ] Update all type references (`Id<'organizations'>` → `Id<'workspaces'>`)
- [ ] Update all function names
- [ ] Update all variable names
- [ ] Update related backend files (meetings, circles, tags, etc.)
- [ ] Verify backend compiles

### Frontend Changes

- [ ] Rename module directory
- [ ] Update all component names
- [ ] Update all composables
- [ ] Update all API calls
- [ ] Update all types
- [ ] Update all context keys
- [ ] Update all variable names
- [ ] Verify frontend compiles

### Routes & URLs

- [ ] Decide on route path strategy
- [ ] Update route files (if changing paths)
- [ ] Update route references
- [ ] Test route navigation

### Testing

- [ ] Update all test files
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Manual QA testing
- [ ] Verify data integrity

### Documentation

- [ ] Update architecture docs
- [ ] Update API docs
- [ ] Update README files
- [ ] Update code comments
- [ ] Update task documentation

### Deployment

- [ ] Deploy schema changes first
- [ ] Verify schema deployment
- [ ] Deploy backend changes
- [ ] Verify backend deployment
- [ ] Deploy frontend changes
- [ ] Verify frontend deployment
- [ ] Monitor for errors
- [ ] Rollback plan ready

---

## Summary

This is a **major refactoring** affecting:

- ✅ **17 tables** in schema
- ✅ **50+ backend files**
- ✅ **18 frontend module files**
- ✅ **967+ code references**
- ✅ **44+ API endpoint references**
- ✅ **10 route files**
- ✅ **100+ TypeScript type references**

**Recommendation**: This is a significant undertaking. Consider:

1. Is the rename necessary? (Product/business reason?)
2. Can it be done incrementally?
3. Do we have time/resources for comprehensive testing?
4. What's the rollback plan?

If proceeding, follow the phased approach above and ensure thorough testing at each phase.
