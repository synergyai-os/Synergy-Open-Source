# Core Data Architecture Audit

**Date**: 2025-01-27 (Updated: 2025-01-30, Phase 4 Complete: 2025-01-30)  
**Status**: ✅ **COMPLETE** - All phases complete, core data properly organized  
**Auditor**: Senior Architect Review

---

## Executive Summary

**Current State**: Core data (workspaces, circles, users, RBAC) is **incorrectly organized** as application modules. This creates architectural confusion, circular dependencies, and prevents clean separation of concerns.

**Recommendation**: Extract core data into `src/lib/infrastructure/` before building any new application features.

**Success Criteria** - Core data must be:
1. ✅ Located in `src/lib/infrastructure/` (not modules)
2. ✅ Zero feature flags (always available)
3. ✅ No module dependencies (foundational)
4. ✅ Clear separation: Core Data vs Application Modules
5. ✅ Consistent naming (`org-chart` data → `organizational-model`)

---

## Alignment with Product Vision

This audit directly supports the [Product Vision](./product-vision.md):

| Vision Principle | Architectural Requirement |
|------------------|---------------------------|
| **"Modular platform"** | Modules = optional features, not foundational data |
| **"Privacy-first"** | Core data must not have feature flags that could break fundamentals |
| **"Scalability"** | Infrastructure must be stable before building discovery/delivery features |
| **"Open source"** | Clear architecture enables community contributions |

---

## Current Architecture Analysis

### 🏗️ Core Data Entities (From Schema)

**Foundation Layer** (should be infrastructure):
- `users` - System users
- `workspaces` - Multi-tenant workspaces
- `workspaceMembers` - User-workspace relationships
- `circles` - Hierarchical organizational units
- `circleMembers` - User-circle relationships
- `circleRoles` - Organizational accountabilities (NOT RBAC)
- `userCircleRoles` - User-circle role assignments
- `roles` - RBAC access control roles
- `permissions` - RBAC permissions
- `rolePermissions` - RBAC role-permission mappings
- `userRoles` - RBAC user-role assignments

### 📦 Current Organization (INCORRECT)

| Entity | Current Location | Should Be | Status |
|--------|------------------|-----------|--------|
| **Workspaces** | `src/lib/modules/core/workspaces/` | `src/lib/infrastructure/workspaces/` | ❌ Wrong location |
| **Circles** | `src/lib/modules/org-chart/` | `src/lib/infrastructure/organizational-model/` | ❌ Wrong location |
| **Circle Roles** | `src/lib/modules/org-chart/` | `src/lib/infrastructure/organizational-model/` | ❌ Wrong location |
| **Users** | `convex/users.ts` only | `src/lib/infrastructure/users/` | ⚠️ Missing frontend |
| **RBAC** | `src/lib/infrastructure/rbac/` | `src/lib/infrastructure/rbac/` | ✅ Correct |

### 🔍 Backend Organization (✅ CORRECT)

| Entity | Backend Location | Status |
|--------|------------------|--------|
| **Workspaces** | `convex/workspaces.ts` | ✅ Correct |
| **Circles** | `convex/circles.ts` | ✅ Correct |
| **Circle Roles** | `convex/circleRoles.ts` | ✅ Correct |
| **Users** | `convex/users.ts` | ✅ Correct |
| **RBAC** | `convex/rbac/*.ts` | ✅ Correct |

---

## Problems Identified

### ❌ Problem 1: Core Data in Modules

**Issue**: Workspaces and circles are in `src/lib/modules/`, treating them as optional features.

**Impact**:
- Core data appears optional/discoverable via module registry
- Creates confusion: "Is workspace management a feature?"
- Module system overhead for foundational data
- Feature flags on core data (`org_module_beta` flag on org-chart module)

**Evidence**:

```typescript
// src/lib/modules/core/manifest.ts
export const coreModule: ModuleManifest = {
  name: 'core',
  featureFlag: null, // Always enabled - but WHY is it a module?
  dependencies: []
};

// src/lib/modules/org-chart/manifest.ts
export const orgChartModule: ModuleManifest = {
  name: 'org-chart',
  featureFlag: 'org_module_beta', // ❌ Core data behind feature flag!
  dependencies: ['core']
};
```

**Fix**: Move core data to `src/lib/infrastructure/` - core data is NOT a module.

---

### ❌ Problem 2: Naming Confusion - "org-chart" vs Core Organizational Model

**Issue**: Module is named `org-chart` but manages `circles`, `circleRoles`, and `circleMembers` - core organizational data.

**Impact**:
- Name suggests visualization feature, not data management
- Confusing: "org-chart" implies UI, but it contains core data CRUD
- Inconsistent with backend (`convex/circles.ts`)
- Mixes visualization logic (`useOrgChart.svelte.ts`) with data logic (`useCircles.svelte.ts`)

**Evidence**:

```
src/lib/modules/org-chart/
  ├── composables/
  │   ├── useCircles.svelte.ts      ← Core data CRUD (should be infrastructure)
  │   ├── useCircleMembers.svelte.ts ← Core data (should be infrastructure)
  │   ├── useCircleRoles.svelte.ts   ← Core data (should be infrastructure)
  │   └── useOrgChart.svelte.ts      ← Visualization state (can stay as module)
  └── components/
      ├── OrgChart.svelte            ← Visualization (can stay as module)
      └── CreateCircleModal.svelte   ← Core data UI (should be infrastructure)
```

**Fix**: 
- Rename core data domain to `organizational-model` (infrastructure)
- Keep `org-chart` as visualization module only

---

### ❌ Problem 3: Module Registry Overhead for Core Data

**Issue**: Core data goes through module registry system unnecessarily.

**Impact**:
- Extra abstraction layer for foundational data
- Module discovery/feature flag checks for core data
- Dependency resolution overhead

**Evidence**:

```typescript
// src/lib/modules/index.ts
registerModule(coreModule);      // ❌ Core data shouldn't be registered
registerModule(orgChartModule);  // ❌ Core data shouldn't be registered
```

**Fix**: Core data should be directly importable from infrastructure, no registry needed.

---

### ⚠️ Problem 4: Missing Frontend Infrastructure for Users

**Issue**: Users are only managed in backend (`convex/users.ts`), no frontend infrastructure.

**Impact**:
- No composables for user management
- No user profile components
- Inconsistent with workspaces/circles pattern

**Evidence**:

```
convex/users.ts                   ✅ Backend exists
src/lib/infrastructure/users/     ❌ Missing
```

**Fix**: Create `src/lib/infrastructure/users/` with composables and components.

---

### ✅ What's Working Well

1. **RBAC Location**: `src/lib/infrastructure/rbac/` is correctly placed
2. **Backend Organization**: All core data backend files are well-organized in `convex/`
3. **Schema Clarity**: Schema clearly defines core data entities
4. **API Contracts**: Module APIs are well-defined (can be reused for infrastructure)
5. **Composables Pattern**: Svelte 5 composables are well-structured

---

## Files Currently Used

### Core Data Backend (✅ Well Organized)

```
convex/
├── users.ts                    # User CRUD, account linking
├── workspaces.ts               # Workspace CRUD, invites
├── circles.ts                  # Circle CRUD, hierarchy
├── circleRoles.ts              # Circle role CRUD
└── rbac/
    ├── roles.ts                # RBAC role queries
    ├── permissions.ts          # Permission checks
    ├── queries.ts              # RBAC queries
    └── seedRBAC.ts             # RBAC seed data
```

### Core Data Frontend (❌ Incorrectly Organized)

```
src/lib/modules/core/workspaces/          ❌ Should be infrastructure
├── api.ts
├── composables/
│   ├── useWorkspaces.svelte.ts
│   ├── useWorkspaceQueries.svelte.ts
│   ├── useWorkspaceMutations.svelte.ts
│   └── ...
└── components/
    └── WorkspaceSwitcher.svelte

src/lib/modules/org-chart/                ❌ Core data should be infrastructure
├── api.ts
├── composables/
│   ├── useCircles.svelte.ts              ❌ Core data - move to infrastructure
│   ├── useCircleMembers.svelte.ts        ❌ Core data - move to infrastructure
│   ├── useCircleRoles.svelte.ts          ❌ Core data - move to infrastructure
│   └── useOrgChart.svelte.ts             ✅ Visualization - stays in module
└── components/
    ├── OrgChart.svelte                   ✅ Visualization - stays in module
    ├── CircleNode.svelte                 ✅ Visualization - stays in module
    ├── RoleNode.svelte                   ✅ Visualization - stays in module
    ├── CircleDetailPanel.svelte          ✅ Visualization - stays in module
    ├── RoleDetailPanel.svelte            ✅ Visualization - stays in module
    └── circles/
        ├── CreateCircleModal.svelte      ❌ Core data UI - move to infrastructure
        ├── CircleMembersPanel.svelte     ⚠️ Could go either way
        └── CircleRolesPanel.svelte       ⚠️ Could go either way
```

### Infrastructure (✅ Partially Correct)

```
src/lib/infrastructure/
├── rbac/                       ✅ Correct
│   ├── composables/
│   │   └── usePermissions.svelte.ts
│   └── components/
│       ├── PermissionGate.svelte
│       └── PermissionButton.svelte
├── auth/                       ✅ Correct
│   └── composables/
│       └── useAuthSession.svelte.ts
├── analytics/                  ✅ Correct
├── feature-flags/              ✅ Correct
└── users/                      ❌ Missing
```

---

## Target State Architecture

### 📋 Infrastructure (Core Data)

```
src/lib/infrastructure/
├── workspaces/                 # Workspace management
│   ├── composables/
│   │   ├── useWorkspaces.svelte.ts
│   │   ├── useWorkspaceQueries.svelte.ts
│   │   └── useWorkspaceMutations.svelte.ts
│   ├── components/
│   │   └── WorkspaceSwitcher.svelte
│   └── api.ts                  # Public API contract
│
├── organizational-model/       # Core Organizational Model (circles, roles, members)
│   ├── composables/
│   │   ├── useCircles.svelte.ts
│   │   ├── useCircleMembers.svelte.ts
│   │   └── useCircleRoles.svelte.ts
│   ├── components/
│   │   ├── CircleSelector.svelte
│   │   └── CreateCircleModal.svelte
│   └── api.ts
│
├── users/                      # User management (NEW)
│   ├── composables/
│   │   ├── useUsers.svelte.ts
│   │   └── useUserQueries.svelte.ts
│   ├── components/
│   │   └── UserProfile.svelte
│   └── api.ts
│
├── rbac/                       # Already correct ✅
│   ├── composables/
│   │   └── usePermissions.svelte.ts
│   └── components/
│       ├── PermissionGate.svelte
│       └── PermissionButton.svelte
│
├── auth/                       # Already correct ✅
│   └── composables/
│       └── useAuthSession.svelte.ts
│
├── analytics/                  # Already correct ✅
└── feature-flags/              # Already correct ✅
```

### 📋 Application Modules (Visualization & Features)

```
src/lib/modules/
├── org-chart/                  # Visualization module (CLEANED)
│   ├── composables/
│   │   └── useOrgChart.svelte.ts    # Visualization state only
│   └── components/
│       ├── OrgChart.svelte          # Bubble chart visualization
│       ├── CircleNode.svelte        # Visual node
│       ├── RoleNode.svelte          # Visual node
│       ├── CircleDetailPanel.svelte # Detail panel
│       └── RoleDetailPanel.svelte   # Detail panel
│
├── meetings/                   # Application module ✅
├── inbox/                      # Application module ✅
├── projects/                   # Application module ✅
└── flashcards/                 # Application module ✅
```

---

## Migration Plan

### Phase 1: Extract Workspaces (~2-3 hours)

**Actions**:
1. Create `src/lib/infrastructure/workspaces/` directory structure
2. Move composables from `src/lib/modules/core/workspaces/composables/`
3. Move components from `src/lib/modules/core/workspaces/components/`
4. Update all imports (13+ files reference this module)
5. Remove `coreModule` from module registry

**Files to Move**:
- `src/lib/modules/core/workspaces/**` → `src/lib/infrastructure/workspaces/**`

**Files to Update** (import paths):
- All files importing from `$lib/modules/core/workspaces`
- `src/lib/modules/core/manifest.ts` (remove workspaces)
- `src/lib/modules/index.ts` (remove coreModule registration)

**Validation**:
- All workspace composables importable from infrastructure
- No module registry entries for workspaces
- App runs without errors

---

### Phase 2: Extract Organizational Model (~3-4 hours)

**Actions**:
1. Create `src/lib/infrastructure/organizational-model/` directory structure
2. Move core data composables:
   - `useCircles.svelte.ts`
   - `useCircleMembers.svelte.ts`
   - `useCircleRoles.svelte.ts`
3. Move core data components:
   - `CreateCircleModal.svelte`
4. Keep visualization in `modules/org-chart/`:
   - `useOrgChart.svelte.ts`
   - All visualization components
5. Update `org-chart` module to import from infrastructure
6. Remove feature flag from org-chart (or make it visualization-only)

**Files to Move**:
- `useCircles.svelte.ts` → `infrastructure/organizational-model/composables/`
- `useCircleMembers.svelte.ts` → `infrastructure/organizational-model/composables/`
- `useCircleRoles.svelte.ts` → `infrastructure/organizational-model/composables/`
- `CreateCircleModal.svelte` → `infrastructure/organizational-model/components/`

**Files to Keep** (in `modules/org-chart/`):
- `useOrgChart.svelte.ts`
- `OrgChart.svelte`
- `CircleNode.svelte`, `RoleNode.svelte`
- `CircleDetailPanel.svelte`, `RoleDetailPanel.svelte`

**Validation**:
- Core data composables importable from infrastructure
- Visualization module imports from infrastructure
- Feature flag only controls visualization, not core data

---

### Phase 3: Create Users Infrastructure (~2 hours)

**Actions**:
1. Create `src/lib/infrastructure/users/` directory
2. Create composables:
   - `useUsers.svelte.ts`
   - `useUserQueries.svelte.ts`
3. Create basic components:
   - `UserProfile.svelte`
4. Wire up to `convex/users.ts` backend
5. Create public API contract

**New Files**:
- `src/lib/infrastructure/users/composables/useUsers.svelte.ts`
- `src/lib/infrastructure/users/composables/useUserQueries.svelte.ts`
- `src/lib/infrastructure/users/components/UserProfile.svelte`
- `src/lib/infrastructure/users/api.ts`

**Validation**:
- User composables work with existing auth flow
- User queries return expected data

---

### Phase 4: Cleanup Module Registry (~1 hour) ✅ **COMPLETE**

**Actions**:
1. ✅ Remove core data from module registry - Verified: workspaces, organizational-model, users are NOT registered
2. ✅ Update module discovery to exclude infrastructure - Infrastructure is directly importable, not via registry
3. ✅ Verify feature flags for core data - Confirmed: org-chart visualization is now always-on (feature flag removed)
4. ✅ Update documentation - Updated org-chart manifest comments and audit document

**Files Updated**:
- `src/lib/modules/org-chart/manifest.ts` - Updated comment to clarify dependency is for shared utilities
- `dev-docs/master-docs/core-data-architecture-audit.md` - Marked Phase 4 complete

**Validation**:
- ✅ No infrastructure code in module registry (verified)
- ✅ All modules load correctly (core module provides shared features, not core data)
- ✅ Feature flags only control optional features (org-chart is now always-on, core functionality)

---

## Validation Checklist

Before considering core data migration complete:

**Phase 1 - Workspaces**:
- [x] All workspace code in `src/lib/infrastructure/workspaces/` ✅
- [x] No workspace code in `src/lib/modules/` ✅
- [x] All imports updated ✅
- [x] Tests passing ✅

**Phase 2 - Organizational Model**:
- [x] Core data composables in `src/lib/infrastructure/organizational-model/` ✅
- [x] Visualization code remains in `src/lib/modules/org-chart/` ✅
- [x] org-chart module imports from infrastructure ✅
- [x] No feature flag on core data ✅
- [x] Tests passing ✅

**Phase 3 - Users**:
- [x] User infrastructure created ✅
- [x] Composables work with auth flow ✅
- [x] Tests passing ✅

**Phase 4 - Registry Cleanup**:
- [x] No core data in module registry ✅
- [x] Documentation updated ✅
- [x] All tests passing ✅

---

## Risks & Mitigation

### Risk 1: Breaking Changes During Migration

**Likelihood**: Medium  
**Impact**: High

**Mitigation**:
- Use TypeScript path aliases for backward compatibility during transition
- Migrate one entity at a time (workspaces → organizational-model → users)
- Run full test suite after each phase
- Keep backup branches

### Risk 2: Circular Dependencies

**Likelihood**: Low  
**Impact**: High

**Mitigation**:
- Clear dependency rules: Infrastructure → Modules (one-way only)
- Infrastructure has NO module dependencies
- Modules depend on infrastructure, not vice versa
- Use TypeScript strict mode to catch violations

### Risk 3: Incomplete Migration

**Likelihood**: Medium  
**Impact**: Medium

**Mitigation**:
- Phase-by-phase validation checklist
- grep for old import paths after each phase
- Code review required for each phase PR

---

## Conclusion

**Current State**: ✅ **COMPLETE** - Core data properly organized in infrastructure.

**Required Actions**: ✅ All phases complete - core data extracted to infrastructure.

**Timeline Estimate**: ~8-10 hours total (can be done in 2-3 focused sessions)

**Success Criteria**: 
- All core data in infrastructure
- Zero feature flags on core data
- Clear separation: infrastructure (always on) vs modules (optional features)

---

## Next Steps

1. ✅ Review and approve this audit
2. Create Linear tickets for each phase
3. Execute Phase 1 (Workspaces extraction)
4. Validate Phase 1 before proceeding
5. Repeat for remaining phases

---

**Approved by**: _________________  
**Date**: _________________
