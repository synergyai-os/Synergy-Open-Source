# RBAC Phase 1: Vertical Slices

**End-to-end implementation slices for permission-based access control**

---

## Slice 1: Database Foundation

**Goal**: Create database schema and seed initial data

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 4 hours

### What Gets Built

- 6 new database tables in `convex/schema.ts`
- Seed script in `convex/seed/rbac.ts`
- 6 roles seeded
- 20 permissions seeded
- ~50 role-permission mappings seeded

### Acceptance Criteria

- [ ] All 6 tables added to schema.ts (roles, permissions, rolePermissions, userRoles, resourceGuests, permissionAuditLog)
- [ ] Schema deployed successfully (`npx convex deploy`)
- [ ] Seed script creates 6 roles (Admin, Manager, Team Lead, Billing Admin, Member, Guest)
- [ ] Seed script creates 20 permissions (5 user, 7 team, 3 org, 5 placeholder)
- [ ] Seed script creates role-permission mappings
- [ ] Can query roles and permissions in Convex dashboard

### Files Changed

- `convex/schema.ts` - Add 6 new tables
- `convex/seed/rbac.ts` - New seed script

### Test Plan

1. Run seed script
2. Open Convex dashboard → Check roles table has 6 roles
3. Check permissions table has 20 permissions
4. Check rolePermissions table has mappings
5. Verify Admin role has all permissions
6. Verify Team Lead role has limited permissions with "own" scope

### Dependencies

None (first slice)

---

## Slice 2: Core Permission Functions

**Goal**: Implement permission checking logic

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 4 hours

### What Gets Built

- `convex/permissions.ts` with core functions
- Permission checking logic with scope support
- Helper functions for common patterns
- Basic unit tests

### Acceptance Criteria

- [ ] `userHasPermission()` function works correctly
- [ ] Handles "all" scope (grants access)
- [ ] Handles "own" scope (checks resource ownership)
- [ ] Handles "assigned" scope (checks resource membership)
- [ ] Multi-role resolution works (user with 2 roles gets both permissions)
- [ ] `requirePermission()` throws error when denied
- [ ] `getUserPermissions()` returns all user permissions
- [ ] `userHasAnyPermission()` checks multiple permissions
- [ ] Unit tests pass (test multi-role, scope checking)

### Files Changed

- `convex/permissions.ts` - New file with permission functions
- `convex/permissions.test.ts` - New unit tests

### Test Plan

1. Create test user with Admin role
2. Call `userHasPermission(userId, "teams.create")` → Should return true
3. Create test user with Team Lead role for Team A
4. Call `userHasPermission(userId, "teams.settings.update", teamAId)` → Should return true
5. Call `userHasPermission(userId, "teams.settings.update", teamBId)` → Should return false
6. Create user with both Billing Admin + Team Lead roles
7. Verify user can view billing AND manage their team
8. Run unit tests → All pass

### Dependencies

- Slice 1 (needs seeded data)

---

## Slice 3: Role Management

**Goal**: Assign and revoke roles with audit logging

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 3 hours

### What Gets Built

- `convex/roles.ts` with role management functions
- Role assignment/revocation mutations
- Audit logging for role changes
- Query functions to get user roles

### Acceptance Criteria

- [ ] `assignRole()` mutation works
- [ ] Prevents duplicate role assignments
- [ ] Prevents non-admins from assigning Admin role
- [ ] `revokeRole()` mutation works (soft delete with revokedAt)
- [ ] `getUserRoles()` query returns active roles
- [ ] `listRoles()` query returns all available roles
- [ ] All role changes logged to permissionAuditLog
- [ ] Can assign multiple roles to same user
- [ ] Integration tests pass

### Files Changed

- `convex/roles.ts` - New file with role management
- `convex/roles.test.ts` - Integration tests

### Test Plan

1. Admin assigns Team Lead role to User A for Team X
2. Check userRoles table → Entry exists
3. Check permissionAuditLog → Assignment logged
4. Admin assigns Billing Admin role to User A (same user, second role)
5. Verify User A has both roles
6. Call getUserRoles(userA) → Returns both roles
7. Admin revokes Team Lead role
8. Check userRoles → revokedAt timestamp set
9. Verify User A only has Billing Admin role now
10. Try to assign Admin role as Manager → Should fail
11. Run integration tests → All pass

### Dependencies

- Slice 1 (needs tables)
- Slice 2 (uses permission checking)

---

## Slice 4: Team Management Protection

**Goal**: Gate team CRUD operations with permission checks

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 4 hours

### What Gets Built

- Add permission checks to existing team functions
- Protect create, delete, update, member add/remove
- Resource-scoped permission checking

### Acceptance Criteria

- [ ] `createTeam()` requires "teams.create" permission
- [ ] `deleteTeam()` requires "teams.delete" permission
- [ ] `updateTeamSettings()` requires "teams.settings.update" with resource scope
- [ ] Team Lead can only update their team (scope check works)
- [ ] `addTeamMember()` requires "teams.members.add" with resource scope
- [ ] `removeTeamMember()` requires "teams.members.remove" with resource scope
- [ ] All team operations logged to permissionAuditLog
- [ ] Access denied properly handled (error message shown)
- [ ] Integration tests pass

### Files Changed

- `convex/teams.ts` - Add permission checks to existing functions
- `convex/teams.test.ts` - Integration tests for permissions

### Test Plan

1. Admin creates team → ✅ Success
2. Member tries to create team → ❌ Permission denied
3. Team Lead of Team A updates Team A settings → ✅ Success
4. Team Lead of Team A tries to update Team B settings → ❌ Permission denied
5. Manager updates any team settings → ✅ Success
6. Member tries to add someone to team → ❌ Permission denied
7. Team Lead adds member to their team → ✅ Success
8. Check permissionAuditLog → All attempts logged
9. Run integration tests → All pass

### Dependencies

- Slice 1 (needs tables)
- Slice 2 (uses permission functions)
- Slice 3 (needs role assignment to test)

---

## Slice 5: User Management Protection

**Goal**: Gate user operations with permission checks

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 3 hours

### What Gets Built

- Add permission checks to user invite/remove
- Protect role assignment functions
- Org settings protection

### Acceptance Criteria

- [ ] `inviteUser()` requires "users.invite" permission
- [ ] `removeUser()` requires "users.remove" permission
- [ ] `assignRole()` requires "users.roles.assign" permission
- [ ] `revokeRole()` requires "users.roles.revoke" permission
- [ ] `updateOrgSettings()` requires "org.settings.update" permission
- [ ] `viewOrgSettings()` requires "org.settings.view" permission
- [ ] Only Admin can delete organization
- [ ] All user operations logged to permissionAuditLog
- [ ] Integration tests pass

### Files Changed

- `convex/users.ts` - Add permission checks
- `convex/organizations.ts` - Add permission checks
- `convex/users.test.ts` - Integration tests

### Test Plan

1. Admin invites user → ✅ Success
2. Member tries to invite user → ❌ Permission denied
3. Manager invites user → ✅ Success
4. Manager assigns Team Lead role → ✅ Success
5. Team Lead tries to assign role → ❌ Permission denied
6. Admin updates org settings → ✅ Success
7. Manager tries to update org settings → ❌ Permission denied
8. Manager views org settings → ✅ Success (read-only)
9. Run integration tests → All pass

### Dependencies

- Slice 1 (needs tables)
- Slice 2 (uses permission functions)
- Slice 3 (role management)

---

## Slice 6: Frontend Permission System

**Goal**: Composable + UI permission gates

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 5 hours

### What Gets Built

- `usePermissions` composable
- Permission query functions
- Update UI components with permission gates
- Permission-based button visibility

### Acceptance Criteria

- [ ] `usePermissions.svelte.ts` composable created
- [ ] `convex/permissions.ts` has `getUserPermissions` query
- [ ] Composable provides `can()`, `canAny()`, `canAll()` functions
- [ ] Team management buttons show/hide based on permissions
- [ ] User invite button only visible with permission
- [ ] Role assignment UI only visible with permission
- [ ] Org settings page protected
- [ ] Permission denied error messages shown
- [ ] Works with reactive updates (permissions change → UI updates)
- [ ] E2E tests pass

### Files Changed

- `src/lib/composables/usePermissions.svelte.ts` - New composable
- `src/lib/components/teams/TeamManagementPanel.svelte` - Add permission gates
- `src/lib/components/users/UserManagementPanel.svelte` - Add permission gates
- `src/lib/components/settings/OrgSettings.svelte` - Add permission gates
- `tests/e2e/permissions.spec.ts` - E2E tests

### Test Plan

1. Login as Admin → All buttons visible
2. Login as Team Lead → Only team management for their team visible
3. Login as Member → Limited UI (view only)
4. Create team as Admin → Button visible, action works
5. Try to create team as Member → Button hidden
6. Navigate to another user's team as Team Lead → Edit button hidden
7. Navigate to own team as Team Lead → Edit button visible
8. Click edit → Changes save successfully
9. Run E2E tests → All pass

### Dependencies

- Slice 1-5 (needs complete backend)

---

## Slice 7: Testing & Documentation

**Goal**: Complete test coverage and documentation

**Linear**: SYOS-? (create ticket)  
**Status**: ⏳ Todo  
**Estimate**: 5 hours

### What Gets Built

- Complete unit test coverage
- Integration test suite
- E2E test suite
- Update architecture docs with implementation notes
- Add pattern to patterns/INDEX.md
- Testing checklist completed

### Acceptance Criteria

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

### Files Changed

- `convex/permissions.test.ts` - Complete unit tests
- `convex/roles.test.ts` - Complete integration tests
- `tests/e2e/permissions.spec.ts` - Complete E2E tests
- `dev-docs/rbac-architecture.md` - Update with implementation notes
- `dev-docs/patterns/INDEX.md` - Add RBAC pattern
- `dev-docs/1-projects/rbac-phase-1/testing-checklist.md` - Complete manual tests

### Test Plan

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

### Dependencies

- Slice 1-6 (needs complete system)

---

## Summary

| Slice | Description                | Hours | Depends On |
| ----- | -------------------------- | ----- | ---------- |
| 1     | Database Foundation        | 4h    | None       |
| 2     | Core Permission Functions  | 4h    | Slice 1    |
| 3     | Role Management            | 3h    | Slices 1-2 |
| 4     | Team Management Protection | 4h    | Slices 1-3 |
| 5     | User Management Protection | 3h    | Slices 1-3 |
| 6     | Frontend Permission System | 5h    | Slices 1-5 |
| 7     | Testing & Documentation    | 5h    | Slices 1-6 |

**Total**: 28 hours (~3.5 days)

---

## Testing After Each Slice

After completing each slice, test with user before moving to next:

1. Demo what was built
2. Let user test functionality
3. Get feedback
4. Make adjustments if needed
5. Mark slice complete in Linear
6. Move to next slice

This ensures we're building the right thing!
