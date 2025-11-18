# RBAC Documentation Analysis & Fix Plan

**Date**: 2025-01-XX  
**Status**: 🔴 Critical Issues Found

---

## 🔴 Critical Issues Found

### 1. **Wrong Project Name**
- ❌ Doc says: "Axon"
- ✅ Should be: "SynergyOS"

### 2. **Outdated Status**
- ❌ Doc says: "Architecture Complete - Ready for Implementation"
- ✅ Reality: RBAC is **ALREADY IMPLEMENTED**
- ✅ Current state: System admin panel exists at `/admin/rbac`

### 3. **Permission Slugs Don't Match**
- ❌ Doc says: `users.roles.assign`
- ✅ Actual: `users.change-roles`

- ❌ Doc says: `teams.settings.update`
- ✅ Actual: `teams.update`

- ❌ Doc says: `teams.members.add`
- ✅ Actual: `teams.add-members`

- ❌ Doc says: `org.settings.view`
- ✅ Actual: `organizations.view-settings`

- ❌ Doc says: `org.settings.update`
- ✅ Actual: `organizations.update-settings`

### 4. **Broken Links**
- ❌ `./2-areas/architecture.md` (relative path won't work)
- ✅ Should be: `/dev-docs/2-areas/architecture/architecture.md`

### 5. **Missing Current Implementation Details**
- ❌ No mention of system admin vs organization admin distinction
- ❌ No mention of admin panel (`/admin/rbac`)
- ❌ No mention of current implementation status
- ❌ No code location references

### 6. **Draft Language**
- ❌ "What We Built Today" (past tense planning doc)
- ❌ "Questions to Answer Before Implementation"
- ❌ "Your Feedback Needed"
- ✅ Should be: Current state documentation

---

## ✅ What Should Be Documented

### Current Implementation Status
- ✅ RBAC system is **implemented and live**
- ✅ System admin panel exists at `/admin/rbac`
- ✅ Database schema: `roles`, `permissions`, `rolePermissions`, `userRoles`, `resourceGuests`
- ✅ Permission checking functions in `convex/rbac/permissions.ts`
- ✅ Seed script in `convex/rbac/seedRBAC.ts`
- ✅ Admin queries/mutations in `convex/admin/rbac.ts`

### Actual Permission Slugs
```typescript
// User Management
'users.view'
'users.invite'
'users.remove'
'users.change-roles'
'users.manage-profile'

// Team Management
'teams.view'
'teams.create'
'teams.update'
'teams.delete'
'teams.add-members'
'teams.remove-members'
'teams.change-roles'

// Organization Management
'organizations.view-settings'
'organizations.update-settings'
'organizations.manage-billing'
```

### System Admin vs Organization Admin
- **System Admin**: Global platform admin (no `organizationId`)
- **Organization Admin**: Organization-scoped admin role
- System admins access `/admin` routes
- Organization admins manage their org via settings

### Code Locations
- **Schema**: `convex/schema.ts` (lines 842-871)
- **Permissions**: `convex/rbac/permissions.ts`
- **Seed**: `convex/rbac/seedRBAC.ts`
- **Admin Panel**: `src/routes/(authenticated)/admin/rbac/`
- **Admin Backend**: `convex/admin/rbac.ts`

---

## 📋 Fix Plan

### Phase 1: Fix Critical Issues
1. ✅ Update project name: "Axon" → "SynergyOS"
2. ✅ Update status: "Ready for Implementation" → "✅ Implemented"
3. ✅ Fix permission slugs to match actual implementation
4. ✅ Fix broken links
5. ✅ Remove draft language

### Phase 2: Add Current State
1. ✅ Add "Current Implementation" section
2. ✅ Document system admin vs organization admin
3. ✅ Add code location references
4. ✅ Add admin panel documentation
5. ✅ Update examples to match actual code

### Phase 3: Improve Structure (Context7 Best Practices)
1. ✅ Separate "Explanation" (how it works) from "Reference" (API docs)
2. ✅ Add "How-To Guides" (common tasks)
3. ✅ Add "Tutorial" (getting started)
4. ✅ Improve navigation and cross-references

---

## 🎯 Documentation Types (Diátaxis Framework)

Based on Context7 research, great documentation has 4 types:

1. **Tutorial**: Learning-oriented (getting started)
2. **How-To Guide**: Goal-oriented (common tasks)
3. **Reference**: Information-oriented (API, functions)
4. **Explanation**: Understanding-oriented (concepts, architecture)

**Current State**: RBAC-SUMMARY.md mixes all 4 types (confusing)

**Proposed Structure**:
- `RBAC-SUMMARY.md` → **Explanation** (high-level overview)
- `rbac-quick-reference.md` → **Reference** (API, functions)
- `rbac-how-to.md` → **How-To Guides** (common tasks)
- `rbac-getting-started.md` → **Tutorial** (step-by-step)

---

## ✅ Next Steps

1. Fix RBAC-SUMMARY.md with correct information
2. Update all permission slugs
3. Fix all links
4. Add current implementation status
5. Restructure following Diátaxis framework

