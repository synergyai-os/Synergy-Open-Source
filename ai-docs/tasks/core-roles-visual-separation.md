# Core Roles Visual Separation - BDD Scenarios

**Issue**: CORE roles (set by system or workspace admin) are not visually distinguished from regular roles when displayed in role lists, selectors, and dialogs.

**Date**: 2025-01-30

---

## BDD Scenarios

### Scenario 1: Core Roles Displayed in Circle Roles Panel

**Given** a circle has both core roles (created from templates with `isCore: true`) and regular roles  
**When** a user views the circle's roles in the CircleRolesPanel component  
**Then** core roles should be displayed in a separate "Core Roles" section  
**And** regular roles should be displayed in a separate "Roles" section  
**And** each section should have a header with the section name and count

**Current State**: ❌ All roles are displayed in a flat list without separation

---

### Scenario 2: Core Roles Displayed When Creating New Role via Context Menu

**Given** a user right-clicks on a circle in the org chart  
**And** selects "Add Role Here" from the context menu  
**When** the AddRoleDialog opens  
**And** the dialog shows existing roles (if applicable)  
**Then** core roles should be grouped under a "Core Roles" section  
**And** regular roles should be grouped under a "Roles" section

**Current State**: ❌ AddRoleDialog doesn't show existing roles (it's a creation form only)

**Note**: This scenario may not apply if AddRoleDialog is intentionally a creation-only form. Need to verify if there's a role selector elsewhere.

---

### Scenario 3: Core Roles Displayed in Role Assignment Dropdowns

**Given** a user is assigning a role to a user or task  
**When** a role selector dropdown is displayed  
**Then** core roles should be grouped under an "Core Roles" optgroup  
**And** regular roles should be grouped under a "Roles" optgroup  
**And** the optgroups should be visually distinct

**Current State**: ❌ Role selectors show all roles in a flat list without grouping

**Affected Components**:

- `ActionItemsList.svelte` - role assignment dropdown
- Any other components with role selectors

---

### Scenario 4: Core Roles Displayed in Import Preview

**Given** a user is importing an org structure via the import page  
**And** the structure includes roles that match core role templates  
**When** the import preview is displayed  
**Then** core roles should be visually distinguished (e.g., with a badge or different styling)  
**And** warnings should be shown if trying to import roles that duplicate core roles

**Current State**: ✅ Partially working - warnings are shown, but visual distinction in preview may be missing

---

### Scenario 5: Core Roles Displayed When Starting New Workspace

**Given** a user creates a new workspace  
**When** core roles are automatically created from templates  
**And** the user views the circle's roles  
**Then** core roles should be displayed in a "Core Roles" section  
**And** regular roles should be displayed in a "Roles" section

**Current State**: ❌ Core roles are created but displayed as regular roles

---

## Technical Requirements

### Data Model

**Current State**:

- `circleRoles` table has `templateId` field (optional)
- `roleTemplates` table has `isCore` boolean field
- `CircleRole` TypeScript type does **NOT** include `templateId`
- `listByCircle` query does **NOT** return `templateId`

**Required Changes**:

1. Add `templateId` to `CircleRole` TypeScript type
2. Update `listByCircle` query to return `templateId`
3. Components need to query role templates to determine `isCore` status
4. OR: Enrich roles with `isCore` flag in the query (more efficient)

### Component Updates Needed

1. **CircleRolesPanel.svelte**
   - Separate roles into `coreRoles` and `regularRoles` derived states
   - Display in two sections with headers

2. **CircleDetailPanel.svelte**
   - ✅ Already correctly separates core roles (reference implementation)

3. **Role Selectors** (ActionItemsList, etc.)
   - Use `<optgroup>` to group core vs regular roles

4. **AddRoleDialog.svelte**
   - If showing existing roles, separate into sections

---

## Validation Results

### ✅ Data Model Validation

1. **`CircleRole` TypeScript Type** (`useCircles.svelte.ts`)
   - ❌ Does NOT include `templateId` field
   - **Impact**: Components using this type cannot determine if a role is core

2. **`listByCircle` Query** (`convex/circleRoles.ts`)
   - ❌ Does NOT return `templateId` field (lines 168-176)
   - **Impact**: Components using this query cannot separate core roles

3. **`listByWorkspace` Query** (`convex/circleRoles.ts`)
   - ✅ DOES return `templateId` field (line 276, 297)
   - **Impact**: Components using this query CAN separate core roles

4. **`useOrgChart.getRolesForCircle()`**
   - ✅ DOES include `templateId` in returned roles (line 123)
   - **Impact**: CircleDetailPanel can correctly separate core roles

### ✅ Component Validation

1. **CircleDetailPanel.svelte**
   - ✅ CORRECTLY separates core roles from regular roles
   - ✅ Queries role templates to build `isCore` map
   - ✅ Filters roles using `role.templateId` lookup
   - ✅ Displays in separate "Core Roles" and "Roles" sections
   - **Status**: ✅ Working correctly (reference implementation)

2. **CircleRolesPanel.svelte**
   - ❌ Does NOT separate core roles from regular roles
   - ❌ Shows all roles in a flat list (lines 182-299)
   - ❌ Uses `roles` prop which comes from `useCircles` (doesn't have `templateId`)
   - **Status**: ❌ Needs update

3. **ActionItemsList.svelte** (Role Selector)
   - ❌ Does NOT separate core roles from regular roles
   - ❌ Shows all roles in flat dropdown (lines 120-122)
   - **Status**: ❌ Needs update

4. **AddRoleDialog.svelte**
   - ✅ Does NOT show existing roles (creation form only)
   - **Status**: ✅ N/A (not applicable)

5. **Import Preview** (`PreviewTree.svelte`, `StructurePreview.svelte`)
   - ✅ Shows core role warnings
   - ✅ Displays virtual core roles in preview tree
   - **Status**: ✅ Working correctly

### Root Cause Analysis

**Primary Issue**: `CircleRolesPanel` uses `roles` prop from `useCircles` composable, which uses `listByCircle` query that doesn't return `templateId`. Without `templateId`, the component cannot determine which roles are core roles.

**Secondary Issue**: Role selectors (like in `ActionItemsList`) also don't separate core roles, even when they have access to role data that includes `templateId`.

### Solution Approach

1. **Option A**: Update `listByCircle` to return `templateId` (recommended)
   - Update `convex/circleRoles.ts` `listByCircle` query
   - Update `CircleRole` TypeScript type to include `templateId`
   - Update `CircleRolesPanel` to separate roles like `CircleDetailPanel`

2. **Option B**: Use `listByWorkspace` in `CircleRolesPanel` instead
   - Already includes `templateId`
   - Requires refactoring to use different query

3. **Option C**: Query role templates separately in `CircleRolesPanel`
   - Similar to `CircleDetailPanel` approach
   - More queries but consistent pattern

---

## Success Criteria

- [ ] All role lists separate core roles from regular roles
- [ ] Core roles are labeled as "Core Roles" with appropriate visual distinction
- [ ] Regular roles are labeled as "Roles"
- [ ] Role selectors use optgroups for separation
- [ ] Type system includes `templateId` in `CircleRole` type
- [ ] Queries return `templateId` for role identification
