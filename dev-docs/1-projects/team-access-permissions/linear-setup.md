# Linear Ticket Setup for RBAC Phase 1

**Copy and run these commands to create Linear tickets**

---

## Step 1: Get Team ID

First, let's verify your team name:

```typescript
mcp_Linear_list_teams()
```

**Expected**: Should show "SYOS" team

---

## Step 2: Create Linear Project (Optional - for org visibility)

```typescript
mcp_Linear_create_project({
  team: "SYOS",
  name: "RBAC Phase 1: Permissions System",
  summary: "Implement permission-based access control for user/team management",
  description: `
# RBAC Phase 1: User & Team Management Permissions

## Overview
Implement permission-based access control system where users can have multiple roles (e.g., Billing Admin + Team Lead) and permissions are resource-scoped (Team Leads only manage their teams).

## Goals
- ✅ Database foundation (6 new tables)
- 🚧 Permission checking system
- ⏳ Role management (assign/revoke)
- ⏳ Team management protection
- ⏳ User management protection
- ⏳ Frontend permission gates
- ⏳ Complete testing

## Architecture
- **Backend**: Convex (6 new tables, permission checking functions)
- **Frontend**: Svelte 5 composable (usePermissions)
- **Key Patterns**: Permission-based (not role-based), multi-role support, resource scoping

## Documentation
- **Project README**: dev-docs/1-projects/rbac-phase-1/README.md
- **Architecture**: dev-docs/rbac-architecture.md
- **Quick Reference**: dev-docs/rbac-quick-reference.md
- **Visual Diagrams**: dev-docs/rbac-visual-overview.md
- **Decisions**: dev-docs/1-projects/rbac-phase-1/decisions/

## Branch
\`feature/rbac-phase-1\`

## Status
**Vertical Slices**: 0/7 complete
- ⏳ Slice 1: Database Foundation (4h)
- ⏳ Slice 2: Core Permission Functions (4h)
- ⏳ Slice 3: Role Management (3h)
- ⏳ Slice 4: Team Management Protection (4h)
- ⏳ Slice 5: User Management Protection (3h)
- ⏳ Slice 6: Frontend Permission System (5h)
- ⏳ Slice 7: Testing & Documentation (5h)

**Total Estimate**: 28 hours (~3.5 days)

## Key Design Decisions
1. **Permission-Based Architecture**: Features check permissions, not roles (enables adding roles without code changes)
2. **Multi-Role Support**: Users can have multiple roles simultaneously (e.g., Billing Admin + Team Lead)
3. **Resource Scoping**: Team Leads only manage their teams (scope: "own")
4. **Medium Granularity**: Action-based permissions (teams.create, not teams.manage)
5. **Complete Audit Trail**: All permission checks and role changes logged
  `,
  state: "planned"
})
```

---

## Step 3: Create Tickets for Each Vertical Slice

### Slice 1: Database Foundation

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 1] Database Foundation - Schema + Seed Data",
  description: `
**Goal**: Create database schema and seed initial roles/permissions data

**Acceptance Criteria:**
- [ ] 6 new tables added to convex/schema.ts (roles, permissions, rolePermissions, userRoles, resourceGuests, permissionAuditLog)
- [ ] Schema deployed successfully
- [ ] Seed script creates 6 roles (Admin, Manager, Team Lead, Billing Admin, Member, Guest)
- [ ] Seed script creates 20 permissions (5 user, 7 team, 3 org, 5 placeholder)
- [ ] Seed script creates ~50 role-permission mappings
- [ ] Can query roles and permissions in Convex dashboard
- [ ] Admin role has all permissions with scope "all"
- [ ] Team Lead has limited permissions with scope "own"

**Files Changed:**
- convex/schema.ts - Add 6 new tables
- convex/seed/rbac.ts - New seed script

**Test Plan:**
1. Run seed script
2. Open Convex dashboard → Check roles table has 6 roles
3. Check permissions table has 20 permissions
4. Check rolePermissions table has mappings
5. Verify Admin role has all permissions
6. Verify Team Lead role has limited permissions with "own" scope

**Estimate**: 4 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Database Schema section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-1

**Branch**: feature/rbac-phase-1
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["backend", "database", "rbac"]
})
```

### Slice 2: Core Permission Functions

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 2] Core Permission Functions - Permission Checking Logic",
  description: `
**Goal**: Implement permission checking logic with scope support

**Acceptance Criteria:**
- [ ] userHasPermission() function works correctly
- [ ] Handles "all" scope (grants access)
- [ ] Handles "own" scope (checks resource ownership)
- [ ] Handles "assigned" scope (checks resource membership)
- [ ] Multi-role resolution works (user with 2 roles gets both permissions)
- [ ] requirePermission() throws error when denied
- [ ] getUserPermissions() returns all user permissions
- [ ] userHasAnyPermission() checks multiple permissions
- [ ] Unit tests pass (test multi-role, scope checking)

**Files Changed:**
- convex/permissions.ts - New file with permission functions
- convex/permissions.test.ts - New unit tests

**Test Plan:**
1. Create test user with Admin role → userHasPermission("teams.create") returns true
2. Create test user with Team Lead role for Team A → userHasPermission("teams.settings.update", teamAId) returns true
3. Same user tries Team B → userHasPermission("teams.settings.update", teamBId) returns false
4. Create user with Billing Admin + Team Lead roles → Verify can view billing AND manage their team
5. Run unit tests → All pass

**Estimate**: 4 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Permission Checking Logic section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-2

**Branch**: feature/rbac-phase-1
**Depends On**: Slice 1 (needs seeded data)
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["backend", "rbac", "testing"]
})
```

### Slice 3: Role Management

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 3] Role Management - Assign/Revoke Roles",
  description: `
**Goal**: Assign and revoke roles with audit logging

**Acceptance Criteria:**
- [ ] assignRole() mutation works
- [ ] Prevents duplicate role assignments
- [ ] Prevents non-admins from assigning Admin role
- [ ] revokeRole() mutation works (soft delete with revokedAt)
- [ ] getUserRoles() query returns active roles
- [ ] listRoles() query returns all available roles
- [ ] All role changes logged to permissionAuditLog
- [ ] Can assign multiple roles to same user
- [ ] Integration tests pass

**Files Changed:**
- convex/roles.ts - New file with role management
- convex/roles.test.ts - Integration tests

**Test Plan:**
1. Admin assigns Team Lead role to User A for Team X → Success
2. Check userRoles table → Entry exists
3. Check permissionAuditLog → Assignment logged
4. Admin assigns Billing Admin role to User A (second role) → Success
5. Verify User A has both roles via getUserRoles()
6. Admin revokes Team Lead role → revokedAt timestamp set
7. Verify User A only has Billing Admin role now
8. Manager tries to assign Admin role → Fails
9. Run integration tests → All pass

**Estimate**: 3 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Implementation Patterns section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-3

**Branch**: feature/rbac-phase-1
**Depends On**: Slices 1-2
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["backend", "rbac", "testing"]
})
```

### Slice 4: Team Management Protection

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 4] Team Management Protection - Permission Gates",
  description: `
**Goal**: Gate team CRUD operations with permission checks

**Acceptance Criteria:**
- [ ] createTeam() requires "teams.create" permission
- [ ] deleteTeam() requires "teams.delete" permission
- [ ] updateTeamSettings() requires "teams.settings.update" with resource scope
- [ ] Team Lead can only update their team (scope check works)
- [ ] addTeamMember() requires "teams.members.add" with resource scope
- [ ] removeTeamMember() requires "teams.members.remove" with resource scope
- [ ] All team operations logged to permissionAuditLog
- [ ] Access denied properly handled (error message shown)
- [ ] Integration tests pass

**Files Changed:**
- convex/teams.ts - Add permission checks to existing functions
- convex/teams.test.ts - Integration tests for permissions

**Test Plan:**
1. Admin creates team → Success
2. Member tries to create team → Permission denied
3. Team Lead of Team A updates Team A settings → Success
4. Team Lead of Team A tries to update Team B settings → Permission denied
5. Manager updates any team settings → Success
6. Member tries to add someone to team → Permission denied
7. Team Lead adds member to their team → Success
8. Check permissionAuditLog → All attempts logged
9. Run integration tests → All pass

**Estimate**: 4 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Implementation Patterns section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-4

**Branch**: feature/rbac-phase-1
**Depends On**: Slices 1-3
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["backend", "rbac", "teams", "testing"]
})
```

### Slice 5: User Management Protection

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 5] User Management Protection - Permission Gates",
  description: `
**Goal**: Gate user operations with permission checks

**Acceptance Criteria:**
- [ ] inviteUser() requires "users.invite" permission
- [ ] removeUser() requires "users.remove" permission
- [ ] assignRole() requires "users.roles.assign" permission
- [ ] revokeRole() requires "users.roles.revoke" permission
- [ ] updateOrgSettings() requires "org.settings.update" permission
- [ ] viewOrgSettings() requires "org.settings.view" permission
- [ ] Only Admin can delete organization
- [ ] All user operations logged to permissionAuditLog
- [ ] Integration tests pass

**Files Changed:**
- convex/users.ts - Add permission checks
- convex/organizations.ts - Add permission checks
- convex/users.test.ts - Integration tests

**Test Plan:**
1. Admin invites user → Success
2. Member tries to invite user → Permission denied
3. Manager invites user → Success
4. Manager assigns Team Lead role → Success
5. Team Lead tries to assign role → Permission denied
6. Admin updates org settings → Success
7. Manager tries to update org settings → Permission denied
8. Manager views org settings → Success (read-only)
9. Run integration tests → All pass

**Estimate**: 3 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Implementation Patterns section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-5

**Branch**: feature/rbac-phase-1
**Depends On**: Slices 1-3
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["backend", "rbac", "users", "testing"]
})
```

### Slice 6: Frontend Permission System

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 6] Frontend Permission System - Composable + UI Gates",
  description: `
**Goal**: Implement frontend composable and UI permission gates

**Acceptance Criteria:**
- [ ] usePermissions.svelte.ts composable created
- [ ] convex/permissions.ts has getUserPermissions query
- [ ] Composable provides can(), canAny(), canAll() functions
- [ ] Team management buttons show/hide based on permissions
- [ ] User invite button only visible with permission
- [ ] Role assignment UI only visible with permission
- [ ] Org settings page protected
- [ ] Permission denied error messages shown
- [ ] Works with reactive updates (permissions change → UI updates)
- [ ] E2E tests pass

**Files Changed:**
- src/lib/composables/usePermissions.svelte.ts - New composable
- src/lib/components/teams/TeamManagementPanel.svelte - Add permission gates
- src/lib/components/users/UserManagementPanel.svelte - Add permission gates
- src/lib/components/settings/OrgSettings.svelte - Add permission gates
- tests/e2e/permissions.spec.ts - E2E tests

**Test Plan:**
1. Login as Admin → All buttons visible
2. Login as Team Lead → Only team management for their team visible
3. Login as Member → Limited UI (view only)
4. Create team as Admin → Button visible, action works
5. Try to create team as Member → Button hidden
6. Navigate to another user's team as Team Lead → Edit button hidden
7. Navigate to own team as Team Lead → Edit button visible
8. Click edit → Changes save successfully
9. Run E2E tests → All pass

**Estimate**: 5 hours

**Documentation:**
- Architecture: dev-docs/rbac-architecture.md (Implementation Patterns section)
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-6

**Branch**: feature/rbac-phase-1
**Depends On**: Slices 1-5 (needs complete backend)
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["frontend", "rbac", "svelte", "testing"]
})
```

### Slice 7: Testing & Documentation

```typescript
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice 7] Testing & Documentation - Complete Coverage",
  description: `
**Goal**: Complete test coverage and update documentation

**Acceptance Criteria:**
- [ ] Unit tests cover all permission functions (>90% coverage)
- [ ] Integration tests cover complete permission flows
- [ ] E2E tests cover all user journeys
- [ ] All tests passing (no failures)
- [ ] Architecture doc updated with "Implementation Complete" status
- [ ] Pattern added to patterns/INDEX.md
- [ ] Code comments on complex logic
- [ ] Testing checklist completed (manual QA)
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Performance acceptable (permission checks < 100ms)

**Files Changed:**
- convex/permissions.test.ts - Complete unit tests
- convex/roles.test.ts - Complete integration tests
- tests/e2e/permissions.spec.ts - Complete E2E tests
- dev-docs/rbac-architecture.md - Update with implementation notes
- dev-docs/patterns/INDEX.md - Add RBAC pattern
- dev-docs/1-projects/rbac-phase-1/testing-checklist.md - Complete manual tests

**Test Plan:**
1. Run all unit tests → 100% pass
2. Run all integration tests → 100% pass
3. Run all E2E tests → 100% pass
4. Complete manual testing checklist → All scenarios work
5. Check test coverage → >90% for permission code
6. Review code for missing comments → Add where needed
7. Run linter → No warnings
8. Run TypeScript check → No errors
9. Test performance → Permission checks complete quickly
10. User acceptance testing → User confirms all features work

**Estimate**: 5 hours

**Documentation:**
- Testing Checklist: dev-docs/1-projects/rbac-phase-1/testing-checklist.md
- Vertical Slices: dev-docs/1-projects/rbac-phase-1/vertical-slices.md#slice-7

**Branch**: feature/rbac-phase-1
**Depends On**: Slices 1-6 (needs complete system)
  `,
  project: "RBAC Phase 1: Permissions System",
  state: "Todo",
  labels: ["testing", "documentation", "rbac"]
})
```

---

## Summary

After running all commands above, you should have:

- [ ] 1 Linear project created (optional - for org visibility)
- [ ] 7 Linear tickets created (one per vertical slice)
- [ ] All tickets in "Todo" state
- [ ] All tickets linked to project
- [ ] All tickets have clear acceptance criteria

**Next**: Mark Slice 1 as "In Progress" when you start:

```typescript
// Get issue ID from Linear
mcp_Linear_list_issues({ team: "SYOS", query: "[Slice 1]" })

// Update to In Progress
mcp_Linear_update_issue({
  id: "SYOS-XXX",  // Replace with actual ID
  state: "In Progress"
})
```


