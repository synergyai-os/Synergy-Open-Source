# Workspace Initialization & Circle Type Research

**Date**: 2025-01-XX  
**Purpose**: Deep research into current codebase state for circle types, required roles, RBAC vs Authority, and workspace initialization sequence.

---

## 1. Circle Type Definitions (Current State)

### What Each circleType Means

Based on `convex/core/authority/policies.ts` and `convex/core/authority/calculator.ts`:

| Type             | Authority Model                                     | Who Decides?                        | Use Case                          | Lead Required? |
| ---------------- | --------------------------------------------------- | ----------------------------------- | --------------------------------- | -------------- |
| `hierarchy`      | **Authority** (Lead decides directly)               | Circle Lead unilaterally            | Traditional org structure         | ✅ Yes         |
| `empowered_team` | **Facilitative** (Team consensus, Lead facilitates) | Team via consent process            | Agile/self-organizing teams       | ❌ No          |
| `guild`          | **Convening** (No authority, coordination only)     | Decisions made in home circles      | Community of practice             | ❌ No          |
| `hybrid`         | **Authority** (Lead decides, same as hierarchy)     | Circle Lead, but uses consent model | Mix of hierarchy + team consensus | ✅ Yes         |

### Circle Type Policy Details

**Source**: `convex/core/authority/policies.ts` (lines 8-41)

```typescript
hierarchy: {
  leadRequired: true,
  leadLabel: 'Circle Lead',
  decisionModel: 'lead_decides',
  canLeadApproveUnilaterally: true,      // ✅ Lead can approve proposals directly
  canLeadAssignRoles: true,              // ✅ Lead can assign roles
  coreRoles: ['Circle Lead', 'Secretary']
}

empowered_team: {
  leadRequired: false,
  leadLabel: 'Coordinator',
  decisionModel: 'consent',
  canLeadApproveUnilaterally: false,     // ❌ No unilateral approval
  canLeadAssignRoles: false,             // ❌ No role assignment authority
  coreRoles: ['Facilitator', 'Secretary']
}

guild: {
  leadRequired: false,
  leadLabel: 'Steward',
  decisionModel: 'consensus',
  canLeadApproveUnilaterally: false,      // ❌ No approval authority
  canLeadAssignRoles: false,             // ❌ No role assignment authority
  coreRoles: ['Steward']
}

hybrid: {
  leadRequired: true,
  leadLabel: 'Circle Lead',
  decisionModel: 'consent',
  canLeadApproveUnilaterally: false,     // ❌ Uses consent, not unilateral
  canLeadAssignRoles: true,              // ✅ Lead can assign roles
  coreRoles: ['Circle Lead', 'Facilitator', 'Secretary']
}
```

### Answers to Specific Questions

**Q: Does circleType affect which roles are auto-created?**  
**A: YES** — See `convex/core/circles/circleCoreRoles.ts` (lines 56-85):

- Circle Lead role is only created if `leadRequired: true` for the circleType
- Default mapping: `hierarchy` and `hybrid` = Lead required; `empowered_team` and `guild` = Lead not required
- Can be overridden by workspace settings (`workspaceOrgSettings.leadRequirementByCircleType`)

**Q: Does circleType affect authority calculation?**  
**A: YES** — See `convex/core/authority/calculator.ts`:

- `calculateAuthorityLevel(circleType)` maps circleType → authority level
- Authority level determines `canApproveProposals`, `canAssignRoles`, etc.
- Policy lookup (`getPolicy(circleType)`) determines decision model and permissions

**Q: Does circleType affect proposal/consent flow?**  
**A: YES** — See `convex/core/authority/policies.ts`:

- `decisionModel` field determines approval mechanism:
  - `lead_decides` (hierarchy): Lead approves unilaterally
  - `consent` (empowered_team, hybrid): Team approves via "no valid objections"
  - `consensus` (guild): All members must agree
- `canLeadApproveUnilaterally` flag controls if Lead can approve without team input

**Q: Can circleType change after creation?**  
**A: YES** — CircleType is a mutable field on the `circles` table. No restrictions found in code. However:

- Changing circleType would change authority calculations immediately
- Roles created from templates would remain (but Lead role requirement logic would change)
- No migration logic exists to handle circleType changes

---

## 2. Required Roles (Seed Data Decision)

### What Roles MUST Exist for System to Function?

**Source**: `convex/admin/seedRoleTemplates.ts` (system-level templates)

| Role            | Required?                      | System-level or per-circle?        | Why?                                                                 |
| --------------- | ------------------------------ | ---------------------------------- | -------------------------------------------------------------------- |
| **Circle Lead** | ✅ Conditional (by circleType) | Per-circle (created from template) | Authority calculation depends on it for `hierarchy`/`hybrid` circles |
| **Facilitator** | ❌ Optional                    | Per-circle (created from template) | Used for meetings, but not required for system function              |
| **Secretary**   | ❌ Optional                    | Per-circle (created from template) | Used for record-keeping, but not required for system function        |

### Role Templates vs Role Instances

**Role Templates** (`roleTemplates` table):

- **System-level templates**: `workspaceId = undefined`, `isCore = true`
  - Created by: `convex/admin/seedRoleTemplates.ts` (manual/one-time)
  - Examples: "Circle Lead", "Facilitator", "Secretary"
- **Workspace-level templates**: `workspaceId = <workspaceId>`, `isCore = true`
  - Can be created per workspace for customization

**Role Instances** (`circleRoles` table):

- Created from templates when circle is created
- Function: `createCoreRolesForCircle()` in `convex/core/circles/circleCoreRoles.ts`
- Creates actual roles in circles based on templates

### Does Every Circle Need a Circle Lead?

**A: NO** — Only circles with `circleType` that has `leadRequired: true`:

- `hierarchy` → ✅ Lead required
- `hybrid` → ✅ Lead required
- `empowered_team` → ❌ Lead not required
- `guild` → ❌ Lead not required

**Implementation**: `convex/core/circles/circleCoreRoles.ts` lines 56-85 checks `template.isRequired === true` and then checks `leadRequirementByCircleType[circleType]` before creating Lead role.

### What Breaks if Circle Lead Role Doesn't Exist?

**Current State**:

- Authority calculation (`convex/core/authority/calculator.ts`) checks `isCircleLead(ctx)`
- If no Lead role exists, `isCircleLead()` returns `false`
- Authority permissions that depend on Lead (e.g., `canApproveProposals`, `canAssignRoles`) would be `false`
- **System continues to function**, but Lead-specific permissions would be unavailable

**Invariants**:

- `AUTH-01`: "Every active circle must have at least one Circle Lead assignment" (but this is currently failing in test data per architecture.md)
- `AUTH-02`: "Root circle must have Circle Lead assignment" (also failing in test data)

---

## 3. RBAC vs Authority (Design Clarity)

### Current State: Two Separate Systems

**Organizational Authority** (Core domain):

- **What**: Domain authority — what work you do, accountabilities, decision rights
- **Where**: Calculated from `assignments` + `circleRoles` + `circleType`
- **Who manages**: Circle Leads, org designers via proposals
- **Changes**: Frequently, through consent process

**RBAC** (Infrastructure layer):

- **What**: System capabilities — what features you can access (billing, workspace settings, invite users)
- **Where**: `workspaceRoles` table (workspace-scoped) or `systemRoles` table (system-scoped)
- **Who manages**: Workspace admins
- **Changes**: Rarely, requires explicit admin action

### Does a Fresh Workspace Need ANY RBAC Roles Seeded?

**A: NO** — Current implementation does NOT automatically grant RBAC roles:

**Evidence**: `convex/core/workspaces/lifecycle.ts` (lines 214-226):

```typescript
const personId = await ctx.db.insert('people', {
	workspaceId,
	userId: args.userId,
	displayName,
	email: undefined,
	workspaceRole: 'owner', // ✅ Sets workspaceRole field
	status: 'active'
	// ... no workspaceRoles table insert
});
```

**What Actually Happens**:

- Creator gets `people.workspaceRole = 'owner'`
- **NO** `workspaceRoles` record is created automatically
- Access checks use `people.workspaceRole` directly (see `convex/core/people/rules.ts` line 41-44)

### What's the Minimum RBAC Setup for a Functioning Workspace?

**Current State**:

- **NO RBAC roles required** — workspace functions using `people.workspaceRole` field
- `workspaceRole: 'owner'` or `'admin'` grants admin access via direct field check
- `workspaceRoles` table is **optional** — used for granular permission system (not yet fully implemented)

**Access Check Pattern** (`convex/core/people/rules.ts`):

```typescript
export async function isWorkspaceAdmin(ctx, personId): Promise<boolean> {
	const person = await requireActivePerson(ctx, personId);
	return person.workspaceRole === 'owner' || person.workspaceRole === 'admin';
}
```

**Conclusion**: The system currently uses `people.workspaceRole` as the primary access control mechanism. The `workspaceRoles` table exists but is not required for basic workspace functionality.

---

## 4. Workspace Initialization Sequence

### What MUST Happen When Workspace is Created?

**Source**: `convex/core/workspaces/lifecycle.ts` — `createWorkspaceFlow()` function (lines 182-241)

### Exact Sequence (Current Implementation)

```
createWorkspace()
    └── 1. Insert workspace record (lines 197-203)
    │       - name, slug, createdAt, updatedAt, plan: 'starter'
    │
    └── 2. Create person record for creator (lines 214-226)
    │       - workspaceId, userId, displayName
    │       - workspaceRole: 'owner' ✅
    │       - status: 'active'
    │       - invitedAt, joinedAt: now
    │       - NO workspaceRoles record created ❌
    │
    └── 3. Create root circle (lines 228, 243-268)
    │       - name: 'General Circle'
    │       - slug: 'general-circle'
    │       - circleType: 'hierarchy' ✅ (hardcoded)
    │       - decisionModel: 'manager_decides' ✅ (hardcoded)
    │       - parentCircleId: undefined
    │
    └── 4. Create core roles for root circle (lines 229, 270-281)
    │       - Calls: createCoreRolesForCircle(ctx, rootCircleId, workspaceId, personId, 'hierarchy')
    │       - Creates roles from system-level + workspace-level core templates
    │       - For 'hierarchy': Creates Circle Lead role (if template exists and leadRequired=true)
    │       - For 'hierarchy': Creates Secretary role (if template exists)
    │       - Does NOT create Facilitator (not in hierarchy coreRoles list)
    │
    └── 5. Assign creator to Circle Lead role? ❌ NO
    │       - NO automatic assignment happens
    │       - Creator has workspaceRole: 'owner' but no assignment to Circle Lead role
    │
    └── 6. Grant creator workspace_admin RBAC role? ❌ NO
    │       - NO workspaceRoles record created
    │       - Access uses people.workspaceRole field directly
    │
    └── 7. Seed custom field definitions (lines 280, 320-348)
    │       - Creates system field definitions for circles and roles
    │       - Fields: purpose, domains, accountabilities, policies, decision_rights, notes
    │
    └── 8. Seed meeting templates (lines 231-238, scheduled)
            - Calls: features.meetings.templates.seedDefaultTemplatesInternal
            - Creates governance and tactical meeting templates
            - Runs asynchronously via scheduler
```

### What's Currently Implemented vs Assumed?

| Step                             | Implemented? | Notes                              |
| -------------------------------- | ------------ | ---------------------------------- |
| 1. Insert workspace              | ✅ YES       | Lines 197-203                      |
| 2. Create person record          | ✅ YES       | Lines 214-226                      |
| 3. Create root circle            | ✅ YES       | Lines 228, 243-268                 |
| 4. Create core roles             | ✅ YES       | Lines 229, 270-281                 |
| 5. Assign creator to Circle Lead | ❌ **NO**    | Not implemented                    |
| 6. Grant workspace_admin RBAC    | ❌ **NO**    | Uses `workspaceRole` field instead |
| 7. Seed custom fields            | ✅ YES       | Lines 280, 320-348                 |
| 8. Seed meeting templates        | ✅ YES       | Lines 231-238 (async)              |

### What Can Be Deferred vs Must Happen Atomically?

**Must Happen Atomically** (within same transaction):

- Workspace creation
- Person record creation
- Root circle creation
- Core roles creation (if templates exist)

**Can Be Deferred** (scheduled/async):

- Meeting templates seeding (currently scheduled via `ctx.scheduler.runAfter(0, ...)`)
- Any feature-specific seeding

**Gap Identified**:

- Creator is NOT automatically assigned to Circle Lead role
- This means creator has `workspaceRole: 'owner'` but no organizational role assignment
- Authority calculations would show creator has no circle-level authority (only workspace-level)

---

## 5. Seed Data Categories

### What Categories of Seed Data Exist?

| Category             | When Created            | By Whom                | Examples                                                      | Status                  |
| -------------------- | ----------------------- | ---------------------- | ------------------------------------------------------------- | ----------------------- |
| **System bootstrap** | Once, before any user   | DevOps/deploy (manual) | Role templates, RBAC definitions                              | ✅ Manual scripts exist |
| **Workspace init**   | Per workspace creation  | System (automatic)     | Root circle, creator person record, core roles, custom fields | ✅ Automatic            |
| **Feature defaults** | Per workspace, optional | System or user         | Meeting templates                                             | ✅ Automatic (async)    |

### System Bootstrap Seed Data

**1. Role Templates** (`convex/admin/seedRoleTemplates.ts`):

- **When**: Manual, one-time (before first workspace)
- **What**: System-level role templates (`workspaceId = undefined`)
  - Circle Lead (core, required)
  - Facilitator (core, optional)
  - Secretary (core, optional)
- **Run**: `npx convex run admin/seedRoleTemplates:seedRoleTemplates`
- **Status**: ✅ Script exists, must be run manually

**2. RBAC Definitions** (`convex/infrastructure/rbac/seedRBAC.ts`):

- **When**: Manual, one-time (before first workspace)
- **What**: RBAC roles, permissions, role-permission mappings
  - Roles: `admin`, `manager`, `circle-lead`, `billing-admin`, `member`, `guest`
  - Permissions: Various capability definitions
- **Run**: `npx convex run infrastructure/rbac/seedRBAC:seedRBAC`
- **Status**: ✅ Script exists, but roles don't match actual code usage (see SEED-SCRIPTS-ANALYSIS.md)

### Workspace Init Seed Data

**1. Root Circle** (`convex/core/workspaces/lifecycle.ts`):

- Created automatically with `circleType: 'hierarchy'`
- Hardcoded defaults

**2. Core Roles** (`convex/core/circles/circleCoreRoles.ts`):

- Created from system-level + workspace-level templates
- Conditional based on circleType

**3. Custom Field Definitions** (`convex/core/workspaces/lifecycle.ts`):

- System fields for circles and roles
- Created automatically

**4. Meeting Templates** (`convex/features/meetings/helpers/templates/seed.ts`):

- Governance and tactical templates
- Created asynchronously via scheduler

### What's Truly System-Level vs Workspace-Level?

**System-Level** (shared across all workspaces):

- Role templates (`workspaceId = undefined`)
- RBAC role definitions (`rbacRoles` table)
- RBAC permission definitions (`rbacPermissions` table)
- RBAC role-permission mappings (`rbacRolePermissions` table)

**Workspace-Level** (per workspace):

- Role instances (`circleRoles` table)
- Role assignments (`assignments` table)
- Custom field definitions (`customFieldDefinitions` table)
- Meeting templates (`meetingTemplates` table)
- Workspace org settings (`workspaceOrgSettings` table)

### What Should Be Code vs Database Records?

**Code** (hardcoded constants):

- Circle type definitions (`convex/core/circles/schema.ts`)
- Circle type policies (`convex/core/authority/policies.ts`)
- Authority level mappings (`convex/core/authority/calculator.ts`)
- Default lead requirements by circle type (`convex/core/circles/circleCoreRoles.ts`)

**Database Records** (seeded):

- Role templates (`roleTemplates` table)
- RBAC roles (`rbacRoles` table)
- RBAC permissions (`rbacPermissions` table)
- Custom field definitions (`customFieldDefinitions` table)
- Meeting templates (`meetingTemplates` table)

---

## Summary: Key Findings

### ✅ What's Clear

1. **Circle Types**: Well-defined with clear authority models
2. **Role Templates**: System-level templates exist and are used
3. **Workspace Creation**: Sequence is implemented and documented
4. **RBAC vs Authority**: Two separate systems, clearly distinguished

### ⚠️ Gaps Identified

1. **Creator Not Assigned to Circle Lead**:
   - Creator gets `workspaceRole: 'owner'` but no `assignment` to Circle Lead role
   - Authority calculations would show no circle-level authority
   - **Impact**: Creator can manage workspace but has no organizational role

2. **No Automatic RBAC Role Granting**:
   - `workspaceRole: 'owner'` is checked directly, not via `workspaceRoles` table
   - `workspaceRoles` table exists but is optional/not required
   - **Impact**: Two access control mechanisms (field vs table) - potential confusion

3. **Circle Lead Assignment Missing**:
   - Root circle gets Circle Lead role created (if template exists)
   - But creator is NOT automatically assigned to it
   - **Impact**: Root circle may have Circle Lead role but no person filling it

4. **RBAC Seed Script Mismatch**:
   - `seedRBAC.ts` creates roles that don't match actual code usage
   - Code uses `workspace_admin`, `platform_admin`, etc.
   - Script creates `admin`, `manager`, `circle-lead`, etc.
   - **Impact**: Seed script may not be useful without manual mapping

### 🔍 Questions for Further Investigation

1. **Should creator be automatically assigned to Circle Lead role?**
   - Current: NO assignment
   - Proposed: YES, assign creator to Circle Lead role on root circle

2. **Should workspaceRole 'owner' automatically create workspaceRoles record?**
   - Current: NO, uses field directly
   - Proposed: Either migrate to `workspaceRoles` table OR document that field is primary

3. **What happens if role templates don't exist when circle is created?**
   - Current: `createCoreRolesForCircle()` returns early if no templates found
   - Impact: Circle created without core roles - may violate invariants

4. **Can circleType change after creation?**
   - Current: YES, field is mutable
   - Impact: Authority calculations change immediately - may break existing assignments

---

## Recommended Next Steps

1. **Document the gap**: Creator not assigned to Circle Lead role
2. **Decide on RBAC approach**: Field-based (`workspaceRole`) vs table-based (`workspaceRoles`)
3. **Fix seed script alignment**: Update `seedRBAC.ts` to match actual code usage
4. **Add invariant check**: Ensure root circle has Circle Lead assignment after workspace creation
5. **Consider auto-assignment**: Automatically assign creator to Circle Lead role on root circle

---

_This document reflects the current state of the codebase as of the research date. Implementation details may change._
