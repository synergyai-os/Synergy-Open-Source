# RBAC Phase 1: Testing Checklist

**Manual QA steps to verify permission system works correctly**

---

## Prerequisites

Before testing:

- [ ] All 7 slices implemented
- [ ] All automated tests passing
- [ ] Test data seeded (users with different roles)

---

## Test Users Setup

Create these test users for manual testing:

| User                | Email            | Roles                     | Teams                 |
| ------------------- | ---------------- | ------------------------- | --------------------- |
| Alice Admin         | alice@test.com   | Admin                     | -                     |
| Bob Manager         | bob@test.com     | Manager                   | -                     |
| Charlie Team Lead   | charlie@test.com | Team Lead                 | Team Alpha            |
| Diana Billing Admin | diana@test.com   | Billing Admin             | -                     |
| Eve Multi-Role      | eve@test.com     | Billing Admin + Team Lead | Team Beta             |
| Frank Member        | frank@test.com   | Member                    | Team Alpha, Team Beta |

---

## 1. Database Foundation Tests

### ✅ Verify Schema

- [ ] Open Convex dashboard → Tables exist:
  - [ ] `roles` table exists
  - [ ] `permissions` table exists
  - [ ] `rolePermissions` table exists
  - [ ] `userRoles` table exists
  - [ ] `permissionAuditLog` table exists
  - [ ] `resourceGuests` table exists (empty, Phase 3)

### ✅ Verify Seed Data

- [ ] `roles` table has 6 roles:
  - [ ] admin
  - [ ] manager
  - [ ] team_lead
  - [ ] billing_admin
  - [ ] member
  - [ ] guest

- [ ] `permissions` table has 20 permissions:
  - [ ] 5 user management permissions
  - [ ] 7 team management permissions
  - [ ] 3 org settings permissions
  - [ ] 5 billing/guest placeholders

- [ ] `rolePermissions` table has mappings:
  - [ ] Admin role has ALL permissions with scope "all"
  - [ ] Team Lead has limited permissions with scope "own"
  - [ ] Manager has team management with scope "all"
  - [ ] Billing Admin has billing permissions (placeholder)
  - [ ] Member has view-only permissions with scope "assigned"

---

## 2. Permission Checking Tests

### ✅ Admin Permission Tests

Login as: **Alice Admin**

- [ ] Can view all teams
- [ ] Can create new team → Try creating "Test Team 1"
- [ ] Can delete team → Try deleting "Test Team 1"
- [ ] Can update any team settings
- [ ] Can invite users
- [ ] Can assign roles to users
- [ ] Can view org settings
- [ ] Can update org settings

**Expected**: All actions succeed

### ✅ Manager Permission Tests

Login as: **Bob Manager**

- [ ] Can view all teams
- [ ] Can create new team → Try creating "Test Team 2"
- [ ] Can delete team → Try deleting "Test Team 2"
- [ ] Can update any team settings
- [ ] Can invite users
- [ ] Can assign roles (except Admin)
- [ ] Can view org settings (read-only)
- [ ] **Cannot** update org settings → Try updating → Should fail

**Expected**: Org settings update fails, everything else succeeds

### ✅ Team Lead Permission Tests

Login as: **Charlie Team Lead** (leads Team Alpha)

- [ ] Can view Team Alpha
- [ ] Can update Team Alpha settings → Try updating name
- [ ] Can add members to Team Alpha
- [ ] Can remove members from Team Alpha
- [ ] **Cannot** create new teams → Button should be hidden
- [ ] **Cannot** delete Team Alpha → Button should be hidden
- [ ] **Cannot** view/update Team Beta → Navigation should fail
- [ ] **Cannot** invite users to org → Button should be hidden
- [ ] **Cannot** assign roles → Button should be hidden
- [ ] Can view users in Team Alpha
- [ ] **Cannot** view users outside Team Alpha

**Expected**: Only Team Alpha management works, all other actions blocked

### ✅ Multi-Role Permission Tests

Login as: **Eve Multi-Role** (Billing Admin + Team Lead of Team Beta)

- [ ] Can view billing dashboard (from Billing Admin role)
- [ ] Can update billing settings (from Billing Admin role)
- [ ] Can view Team Beta (from Team Lead role)
- [ ] Can update Team Beta settings (from Team Lead role)
- [ ] **Cannot** update other teams → Try Team Alpha → Should fail
- [ ] **Cannot** create teams → Button should be hidden
- [ ] **Cannot** invite users → Button should be hidden

**Expected**: Has permissions from BOTH roles combined

### ✅ Member Permission Tests

Login as: **Frank Member** (member of Team Alpha and Team Beta)

- [ ] Can view Team Alpha
- [ ] Can view Team Beta
- [ ] Can see members of Team Alpha
- [ ] Can see members of Team Beta
- [ ] **Cannot** update any team settings → Buttons should be hidden
- [ ] **Cannot** add/remove team members → Buttons should be hidden
- [ ] **Cannot** create teams → Button should be hidden
- [ ] **Cannot** invite users → Button should be hidden
- [ ] **Cannot** view org settings → Navigation should fail

**Expected**: View-only access to assigned teams

---

## 3. Role Assignment Tests

Login as: **Alice Admin**

### ✅ Assign Role

- [ ] Navigate to user management
- [ ] Select Bob Manager
- [ ] Assign "Team Lead" role for Team Alpha
- [ ] Verify Bob now has 2 roles (Manager + Team Lead)
- [ ] Check Convex dashboard → `userRoles` table has 2 entries for Bob
- [ ] Check `permissionAuditLog` → Assignment logged

### ✅ Revoke Role

- [ ] Navigate to user management
- [ ] Select Bob Manager
- [ ] Revoke "Team Lead" role
- [ ] Verify Bob now has 1 role (Manager)
- [ ] Check Convex dashboard → `userRoles` entry has `revokedAt` timestamp
- [ ] Check `permissionAuditLog` → Revocation logged

### ✅ Assign Admin Role (Special Case)

Login as: **Bob Manager**

- [ ] Try to assign "Admin" role to Frank
- [ ] **Should fail** → Only Admins can assign Admin role

Login as: **Alice Admin**

- [ ] Try to assign "Admin" role to Frank
- [ ] **Should succeed** → Admins can assign Admin role

### ✅ Duplicate Role Prevention

- [ ] Try to assign same role twice to same user
- [ ] **Should fail** → Error message: "User already has this role"

---

## 4. Team Management Tests

### ✅ Create Team

Login as: **Alice Admin**

- [ ] Navigate to teams
- [ ] Click "Create Team"
- [ ] Fill in team details
- [ ] Submit
- [ ] Team created successfully
- [ ] Check `permissionAuditLog` → Action logged

Login as: **Frank Member**

- [ ] Navigate to teams
- [ ] "Create Team" button should be hidden
- [ ] Try direct API call (manual test) → Should fail

### ✅ Update Team Settings

Login as: **Charlie Team Lead** (leads Team Alpha)

- [ ] Navigate to Team Alpha
- [ ] Click "Edit Settings"
- [ ] Update team name
- [ ] Save
- [ ] Changes saved successfully
- [ ] Navigate to Team Beta
- [ ] "Edit Settings" button should be hidden

Login as: **Bob Manager**

- [ ] Can edit any team settings (Team Alpha AND Team Beta)

### ✅ Add/Remove Team Members

Login as: **Charlie Team Lead** (leads Team Alpha)

- [ ] Navigate to Team Alpha
- [ ] Click "Add Member"
- [ ] Select Frank Member
- [ ] Add to team
- [ ] Frank now in Team Alpha
- [ ] Remove Frank from Team Alpha
- [ ] Frank removed successfully
- [ ] Try to add member to Team Beta → Button should be hidden

---

## 5. User Management Tests

### ✅ Invite User

Login as: **Alice Admin**

- [ ] Navigate to user management
- [ ] Click "Invite User"
- [ ] Enter email: newuser@test.com
- [ ] Submit
- [ ] Invitation sent

Login as: **Frank Member**

- [ ] "Invite User" button should be hidden

### ✅ Remove User

Login as: **Alice Admin**

- [ ] Navigate to user management
- [ ] Select user (not yourself!)
- [ ] Click "Remove User"
- [ ] Confirm removal
- [ ] User removed

Login as: **Bob Manager**

- [ ] Can remove users (has permission)

Login as: **Frank Member**

- [ ] Cannot see "Remove User" option

---

## 6. Org Settings Tests

### ✅ View Org Settings

Login as: **Alice Admin**

- [ ] Navigate to Organization Settings
- [ ] Can see all settings
- [ ] Can edit fields

Login as: **Bob Manager**

- [ ] Navigate to Organization Settings
- [ ] Can see all settings (read-only)
- [ ] Cannot edit fields → Edit button should be hidden

Login as: **Frank Member**

- [ ] Navigate to Organization Settings
- [ ] **Should redirect or show error** → No permission

### ✅ Update Org Settings

Login as: **Alice Admin**

- [ ] Update organization name
- [ ] Save
- [ ] Changes saved successfully

Login as: **Bob Manager**

- [ ] Try to save changes
- [ ] **Should fail** → Error: "Permission denied"

---

## 7. Audit Log Tests

Login as: **Alice Admin**

- [ ] Navigate to Convex dashboard
- [ ] Open `permissionAuditLog` table
- [ ] Verify recent actions logged:
  - [ ] Permission checks (access_granted, access_denied)
  - [ ] Role assignments (role_assigned)
  - [ ] Role revocations (role_revoked)
- [ ] Check log entries have:
  - [ ] userId (who performed action)
  - [ ] action (what happened)
  - [ ] permissionId or roleId
  - [ ] timestamp
  - [ ] performedBy (who initiated)

---

## 8. UI/UX Tests

### ✅ Permission Gates

For each role, verify:

- [ ] Buttons show/hide correctly based on permissions
- [ ] Navigation links show/hide correctly
- [ ] Pages redirect if no permission
- [ ] Error messages are user-friendly (not "Permission denied: teams.create")

### ✅ Error Handling

- [ ] Try action without permission → Clear error message shown
- [ ] Error message doesn't expose internal permission IDs
- [ ] Error message suggests what to do (e.g., "Contact admin for access")

### ✅ Reactivity

- [ ] Admin assigns new role to current user
- [ ] UI updates immediately (new buttons appear)
- [ ] No page refresh required

---

## 9. Performance Tests

### ✅ Permission Check Speed

- [ ] Open browser dev tools → Network tab
- [ ] Perform various actions (create team, update settings, etc.)
- [ ] Check permission check time:
  - [ ] Permission checks complete < 100ms
  - [ ] No noticeable delay in UI

### ✅ Page Load

- [ ] Navigate to teams page
- [ ] Check load time:
  - [ ] Page loads < 1 second
  - [ ] Permission checks don't block render

---

## 10. Edge Cases

### ✅ Expired Roles (if implemented)

- [ ] Assign role with expiration date
- [ ] Wait for expiration
- [ ] User no longer has permission
- [ ] UI updates correctly

### ✅ Soft-Deleted Roles

- [ ] Revoke role (sets revokedAt)
- [ ] User immediately loses permission
- [ ] Old role still visible in audit log

### ✅ Multiple Concurrent Roles

- [ ] User has 3+ roles
- [ ] Permission resolution works correctly (union of all permissions)
- [ ] No performance issues

### ✅ Null/Undefined Edge Cases

- [ ] User with no roles → Has no permissions
- [ ] Role with no permissions → User can't do anything
- [ ] Permission check with null resourceId → Works for org-level permissions

---

## 11. Regression Tests

Ensure existing features still work:

- [ ] Login/logout still works
- [ ] Team creation (with permissions) still works
- [ ] User invite (with permissions) still works
- [ ] No existing features broken

---

## Sign-Off

### Completed By

- [ ] Tester Name: ******\_\_\_******
- [ ] Date: ******\_\_\_******
- [ ] All tests passed: Yes / No
- [ ] Issues found: ******\_\_\_******

### Issues Found

Document any issues:

| #   | Description | Severity     | Status     |
| --- | ----------- | ------------ | ---------- |
| 1   |             | High/Med/Low | Open/Fixed |
| 2   |             | High/Med/Low | Open/Fixed |

### User Acceptance

- [ ] User tested all scenarios
- [ ] User confirmed features work as expected
- [ ] User approved for production

**Signed off by**: ******\_\_\_****** (User)  
**Date**: ******\_\_\_******

---

## Next Steps

After all tests pass:

- [ ] Update architecture doc with "Implementation Complete"
- [ ] Extract patterns to `dev-docs/patterns/`
- [ ] Archive project docs to `dev-docs/4-archive/`
- [ ] Merge PR
- [ ] Deploy to production
- [ ] Monitor for issues
