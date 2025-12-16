# Implementation State Research - 5 Key Questions

**Date**: 2025-01-XX  
**Purpose**: Deep research to verify current implementation state for design document creation.

---

## Q1: What Role Templates Currently Exist in the System?

### Seed Data Files

**Source**: `convex/admin/seedRoleTemplates.ts`

**System-Level Templates** (created manually, one-time):

1. **Circle Lead**
   - `name`: "Circle Lead"
   - `description`: "Leads the circle and coordinates work"
   - `isCore`: `true`
   - `isRequired`: `true`
   - `workspaceId`: `undefined` (system-level)

2. **Facilitator**
   - `name`: "Facilitator"
   - `description`: "Facilitates meetings and governance"
   - `isCore`: `true`
   - `isRequired`: `false`
   - `workspaceId`: `undefined` (system-level)

3. **Secretary**
   - `name`: "Secretary"
   - `description`: "Manages records and communications"
   - `isCore`: `true`
   - `isRequired`: `false`
   - `workspaceId`: `undefined` (system-level)

**How to Run**: `npx convex run admin/seedRoleTemplates:seedRoleTemplates`

### Role Templates Table Schema

**Source**: `convex/core/roles/tables.ts` (lines 4-26)

```typescript
roleTemplatesTable = defineTable({
  workspaceId: v.optional(v.id('workspaces')),  // undefined = system-level
  name: v.string(),
  description: v.optional(v.string()),
  isCore: v.boolean(),                          // Core templates auto-create roles
  isRequired: v.boolean(),                      // true = Lead role template
  rbacPermissions: v.optional(v.array(...)),    // RBAC bridge
  archivedAt: v.optional(v.number()),
  archivedByPersonId: v.optional(v.id('people')),
  createdAt: v.number(),
  createdByPersonId: v.id('people'),
  updatedAt: v.number(),
  updatedByPersonId: v.optional(v.id('people'))
})
```

**Indexes**:

- `by_workspace`: `['workspaceId']`
- `by_core`: `['workspaceId', 'isCore']` (used to query core templates)

### Hardcoded Role Template Names in Code

**Found in**:

- `convex/admin/seedRoleTemplates.ts`: "Circle Lead", "Facilitator", "Secretary"
- `convex/core/authority/policies.ts`: Core role names per circleType:
  - `hierarchy`: `['Circle Lead', 'Secretary']`
  - `empowered_team`: `['Facilitator', 'Secretary']`
  - `guild`: `['Steward']`
  - `hybrid`: `['Circle Lead', 'Facilitator', 'Secretary']`
- `convex/core/authority/rules.ts`: `isFacilitator()` checks for role name "Facilitator"

### Summary

**Current State**:

- ✅ 3 system-level templates exist (Circle Lead, Facilitator, Secretary)
- ✅ Templates are seed data (manual script, not automatic)
- ✅ Templates can be workspace-level (`workspaceId` set) or system-level (`workspaceId = undefined`)
- ✅ Lead role identified by `isRequired: true` flag on template
- ⚠️ **Gap**: If seed script hasn't been run, no templates exist → circles created without core roles

---

## Q2: What Actually Happens During Workspace Creation Today?

### Workspace Creation Flow

**Source**: `convex/core/workspaces/lifecycle.ts` — `createWorkspaceFlow()` function (lines 182-241)

### Exact Sequence (Line-by-Line)

```
1. Insert workspace record (lines 197-203)
   ✅ workspaceId = ctx.db.insert('workspaces', {
        name: trimmedName,
        slug,
        createdAt: now,
        updatedAt: now,
        plan: 'starter'
      })

2. Create person record for creator (lines 214-226)
   ✅ personId = ctx.db.insert('people', {
        workspaceId,
        userId: args.userId,
        displayName,
        email: undefined,
        workspaceRole: 'owner',        // ✅ Sets workspaceRole field
        status: 'active',
        invitedAt: now,
        invitedBy: undefined,
        joinedAt: now,
        archivedAt: undefined,
        archivedBy: undefined
      })

3. Create root circle (lines 228, 243-268)
   ✅ rootCircleId = createRootCircle(ctx, workspaceId, personId, now)
   ✅ Circle created with:
      - name: 'General Circle'
      - slug: 'general-circle'
      - circleType: 'hierarchy'        // ✅ Hardcoded
      - decisionModel: 'manager_decides'  // ✅ Hardcoded
      - parentCircleId: undefined

4. Create core roles for root circle (lines 229, 270-281)
   ✅ createRootCircleDefaults(ctx, rootCircleId, workspaceId, personId, args.userId, now)
   ✅ Calls: createCoreRolesForCircle(ctx, rootCircleId, workspaceId, personId, 'hierarchy')
   ✅ Creates roles from system-level + workspace-level core templates
   ✅ For 'hierarchy': Creates Circle Lead role (if template exists and leadRequired=true)
   ✅ For 'hierarchy': Creates Secretary role (if template exists)

5. Assign creator to Circle Lead role?
   ❌ NO — Not implemented
   ⚠️ Creator has workspaceRole: 'owner' but NO assignment to Circle Lead role

6. Grant creator workspace_admin RBAC role?
   ❌ NO — Not implemented
   ✅ Uses people.workspaceRole field directly (not workspaceRoles table)

7. Seed custom field definitions (lines 280, 320-348)
   ✅ seedCustomFieldDefinitions(ctx, workspaceId, personId, now)
   ✅ Creates system field definitions for circles and roles:
      - Circle fields: purpose, domains, accountabilities, policies, decision_rights, notes
      - Role fields: purpose, domains, accountabilities, policies, decision_rights, notes

8. Seed meeting templates (lines 231-238, scheduled)
   ✅ ctx.scheduler.runAfter(0, internal.features.meetings.templates.seedDefaultTemplatesInternal)
   ✅ Creates governance and tactical meeting templates (async)
```

### What Gets Created Atomically?

**Within same transaction**:

- Workspace record
- Person record (creator)
- Root circle
- Core roles (Circle Lead, Secretary if templates exist)
- Custom field definitions

**Deferred (async)**:

- Meeting templates (scheduled via `ctx.scheduler.runAfter(0, ...)`)

### Root Circle Configuration

**Hardcoded Values**:

- `circleType`: `'hierarchy'` (line 254)
- `decisionModel`: `'manager_decides'` (line 255)
- `name`: `'General Circle'` (line 251)
- `slug`: `'general-circle'` (line 252)

**No user input** — all defaults are hardcoded.

### RBAC Roles Granted to Creator

**Current State**: **NONE** — No `workspaceRoles` record created.

**Access Mechanism**: Uses `people.workspaceRole` field directly:

- `workspaceRole: 'owner'` → grants admin access via `isWorkspaceAdmin()` check
- See `convex/core/people/rules.ts` line 41-44:
  ```typescript
  export async function isWorkspaceAdmin(ctx, personId): Promise<boolean> {
  	const person = await requireActivePerson(ctx, personId);
  	return person.workspaceRole === 'owner' || person.workspaceRole === 'admin';
  }
  ```

### Summary

**What's Implemented**:

- ✅ Workspace, person, root circle creation
- ✅ Core roles creation (if templates exist)
- ✅ Custom field definitions seeding
- ✅ Meeting templates seeding (async)

**What's NOT Implemented**:

- ❌ Creator assignment to Circle Lead role
- ❌ `workspaceRoles` table record creation (uses field instead)

**Gap**: Creator has workspace-level access (`workspaceRole: 'owner'`) but no circle-level authority (no assignment to Circle Lead role).

---

## Q3: How Are Core Roles Created When a Circle is Created?

### Circle Creation Logic

**Source**: `convex/core/circles/circleLifecycle.ts` — `createCircleInternal()` function (lines 16-101)

### Flow

```
1. Validate inputs and permissions (lines 28-67)
   ✅ Check workspace membership
   ✅ Validate circle name
   ✅ Check for existing root circle (if parentCircleId undefined)
   ✅ Validate parent circle (if parentCircleId set)

2. Create circle record (lines 76-88)
   ✅ circleId = ctx.db.insert('circles', {
        workspaceId,
        name: trimmedName,
        slug,
        purpose: args.purpose,
        parentCircleId: args.parentCircleId,
        circleType: args.circleType ?? 'hierarchy',      // Default: hierarchy
        decisionModel: args.decisionModel ?? 'manager_decides',  // Default: manager_decides
        status: 'active',
        createdAt: now,
        updatedAt: now,
        updatedByPersonId: actorPersonId
      })

3. Create core roles (line 95)
   ✅ createCoreRolesForCircle(ctx, circleId, args.workspaceId, actorPersonId, circleType)
```

### Core Roles Creation Logic

**Source**: `convex/core/circles/circleCoreRoles.ts` — `createCoreRolesForCircle()` function (lines 6-107)

### Detailed Flow

```
1. Query system-level core templates (lines 16-20)
   ✅ systemCoreTemplates = query('roleTemplates')
        .withIndex('by_core', q => q.eq('workspaceId', undefined).eq('isCore', true))
        .filter(q => q.eq(q.field('archivedAt'), undefined))

2. Query workspace-level core templates (lines 23-27)
   ✅ workspaceCoreTemplates = query('roleTemplates')
        .withIndex('by_core', q => q.eq('workspaceId', workspaceId).eq('isCore', true))
        .filter(q => q.eq(q.field('archivedAt'), undefined))

3. Combine templates (line 30)
   ✅ allCoreTemplates = [...systemCoreTemplates, ...workspaceCoreTemplates]

4. If no templates found, return early (lines 32-35)
   ⚠️ No roles created if templates don't exist

5. Get existing roles in circle (lines 38-41)
   ✅ existingRoles = query('circleRoles')
        .withIndex('by_circle_archived', q => q.eq('circleId', circleId).eq('archivedAt', undefined))

6. For each core template (lines 47-106):
   a. Skip if role with same name already exists (lines 48-54)
      ✅ Idempotent behavior — won't create duplicates

   b. Check if Lead role required for circleType (lines 56-85)
      ✅ If template.isRequired === true:
         - Check workspace settings: orgSettings.leadRequirementByCircleType[circleType]
         - Fallback to DEFAULT_LEAD_REQUIRED mapping:
           - hierarchy: true
           - empowered_team: false
           - guild: false
           - hybrid: true
         - If leadRequired === false, skip Lead role creation

   c. Create role from template (lines 87-99)
      ✅ roleId = ctx.db.insert('circleRoles', {
           circleId,
           workspaceId,
           name: template.name,
           purpose: template.description,  // Template description → role purpose
           templateId: template._id,        // Link role to template
           status: 'active',
           isHiring: false,
           createdAt: now,
           updatedAt: now,
           updatedByPersonId: personId
         })
```

### Does It Auto-Create Roles Based on circleType?

**Answer**: **YES, but conditionally**

**Logic**:

1. Queries for core templates (`isCore: true`)
2. For each template:
   - Creates role if name doesn't already exist (idempotent)
   - **Special handling for Lead role** (`isRequired: true`):
     - Checks if Lead required for circleType
     - Skips creation if `leadRequired === false` for that circleType

**CircleType-Specific Behavior**:

- `hierarchy`: Creates Circle Lead + Secretary (if templates exist)
- `empowered_team`: Creates Facilitator + Secretary (skips Lead)
- `guild`: Creates Steward (skips Lead)
- `hybrid`: Creates Circle Lead + Facilitator + Secretary (if templates exist)

### Role Template Instantiation

**Pattern**: Template → Role Instance

**Template Fields** → **Role Fields**:

- `template.name` → `role.name`
- `template.description` → `role.purpose`
- `template._id` → `role.templateId` (link)
- `template.isCore` → Used for querying, not stored on role
- `template.isRequired` → Used for Lead detection, not stored on role

**Role Instance Fields** (not from template):

- `circleId` (which circle owns the role)
- `workspaceId` (inherited from circle)
- `status: 'active'`
- `isHiring: false`
- `createdAt`, `updatedAt`, `updatedByPersonId`

### What Happens Differently for Each CircleType?

**Source**: `convex/core/circles/circleCoreRoles.ts` lines 72-78

```typescript
const DEFAULT_LEAD_REQUIRED: Record<CircleType, boolean> = {
	hierarchy: true, // ✅ Creates Lead role
	empowered_team: false, // ❌ Skips Lead role
	guild: false, // ❌ Skips Lead role
	hybrid: true // ✅ Creates Lead role
};
```

**Core Roles Created** (from `convex/core/authority/policies.ts`):

- `hierarchy`: `['Circle Lead', 'Secretary']`
- `empowered_team`: `['Facilitator', 'Secretary']`
- `guild`: `['Steward']`
- `hybrid`: `['Circle Lead', 'Facilitator', 'Secretary']`

**Note**: Core roles are created **only if templates exist**. If `seedRoleTemplates` hasn't been run, no roles are created.

### Summary

**SYOS-670 Claim Verification**: ✅ **CONFIRMED**

- Core roles ARE auto-created when circles are created
- For `hierarchy`/`hybrid` only: Circle Lead role is created
- For `empowered_team`/`guild`: Lead role is skipped

**Dependencies**:

- ⚠️ Requires role templates to exist (manual seed script)
- ⚠️ If templates don't exist, no roles are created (silent failure)

---

## Q4: What Is the Structure of `circleRoles` Table vs `roleTemplates`?

### circleRoles Table Schema

**Source**: `convex/core/circles/tables.ts` (lines 52-71)

```typescript
circleRolesTable = defineTable({
	// Identity
	circleId: v.id('circles'), // Which circle owns this role
	workspaceId: v.id('workspaces'), // Inherited from circle
	name: v.string(), // Role name (e.g., "Circle Lead")

	// Content
	purpose: v.optional(v.string()), // Role purpose/description

	// Template link
	templateId: v.optional(v.id('roleTemplates')), // Link to template (if created from template)

	// Lifecycle
	status: v.union(v.literal('draft'), v.literal('active')),
	isHiring: v.boolean(), // Whether role is advertised

	// Optional
	representsToParent: v.optional(v.boolean()), // Role interfaces with parent circle

	// Audit
	createdAt: v.number(),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people')),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
});
```

**Indexes**:

- `by_circle`: `['circleId']`
- `by_circle_archived`: `['circleId', 'archivedAt']`
- `by_template`: `['templateId']`
- `by_circle_status`: `['circleId', 'status', 'archivedAt']`
- `by_workspace_hiring`: `['workspaceId', 'isHiring', 'archivedAt']`

### roleTemplates Table Schema

**Source**: `convex/core/roles/tables.ts` (lines 4-26)

```typescript
roleTemplatesTable = defineTable({
	// Scope
	workspaceId: v.optional(v.id('workspaces')), // undefined = system-level

	// Content
	name: v.string(), // Template name (e.g., "Circle Lead")
	description: v.optional(v.string()), // Template description

	// Classification
	isCore: v.boolean(), // Core templates auto-create roles
	isRequired: v.boolean(), // true = Lead role template

	// RBAC Bridge
	rbacPermissions: v.optional(
		v.array(
			v.object({
				permissionSlug: v.string(),
				scope: v.union(v.literal('all'), v.literal('own'))
			})
		)
	),

	// Lifecycle
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people')),

	// Audit
	createdAt: v.number(),
	createdByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people'))
});
```

**Indexes**:

- `by_workspace`: `['workspaceId']`
- `by_core`: `['workspaceId', 'isCore']` (used to query core templates)

### Template → Role Instance Mapping

**When role is created from template** (`convex/core/circles/circleCoreRoles.ts` lines 87-99):

| Template Field             | Role Field        | Notes                                       |
| -------------------------- | ----------------- | ------------------------------------------- |
| `template.name`            | `role.name`       | Copied directly                             |
| `template.description`     | `role.purpose`    | Template description becomes role purpose   |
| `template._id`             | `role.templateId` | Foreign key link                            |
| `template.isCore`          | _(not stored)_    | Used for querying templates                 |
| `template.isRequired`      | _(not stored)_    | Used for Lead detection via template lookup |
| `template.rbacPermissions` | _(not stored)_    | Used for RBAC bridge (see `roleRbac.ts`)    |

**Role-Specific Fields** (not from template):

- `circleId` — which circle owns the role
- `workspaceId` — inherited from circle
- `status: 'active'` — lifecycle state
- `isHiring: false` — hiring flag
- `representsToParent` — optional parent interface flag
- `createdAt`, `updatedAt`, `updatedByPersonId` — audit fields

### How Does a Role "Instance" Differ from a "Template"?

**Template** (Blueprint):

- **Scope**: System-level (`workspaceId = undefined`) or workspace-level (`workspaceId = <id>`)
- **Purpose**: Reusable pattern for creating roles
- **Fields**: `name`, `description`, `isCore`, `isRequired`, `rbacPermissions`
- **Lifecycle**: Can be archived but persists across circles
- **Usage**: Queried when creating circles to instantiate roles

**Role Instance** (Actual Role):

- **Scope**: Belongs to a specific circle (`circleId`)
- **Purpose**: Actual role that can be assigned to people
- **Fields**: `name`, `purpose`, `templateId` (link), `status`, `isHiring`
- **Lifecycle**: Can be archived per circle
- **Usage**: Referenced in `assignments` table to track who fills the role

**Key Difference**:

- **Template** = "Circle Lead" pattern (system-wide definition)
- **Role Instance** = "Circle Lead" role in "Engineering Circle" (circle-specific)

**One Template → Many Role Instances**:

- One "Circle Lead" template can create many "Circle Lead" roles (one per circle)
- Template changes propagate to role instances (see `convex/core/roles/templates/rules.ts` — `updateLeadRolesFromTemplate()`)

### Summary

**Template Fields NOT on Role**:

- `isCore` — used for querying, not stored
- `isRequired` — used for Lead detection, not stored
- `rbacPermissions` — used for RBAC bridge, not stored

**Role Fields NOT on Template**:

- `circleId` — role belongs to circle, template doesn't
- `workspaceId` — role inherits from circle, template has own scope
- `status` — role lifecycle, template has `archivedAt` instead
- `isHiring` — role-specific flag
- `representsToParent` — role-specific flag

**Link**: `role.templateId` → `template._id` (optional foreign key)

---

## Q5: What's the Current State of the `assignments` Table?

### Assignments Table Schema

**Source**: `convex/core/assignments/tables.ts` (lines 4-30)

```typescript
assignmentsTable = defineTable({
	// Core links (triplet identity)
	circleId: v.id('circles'),
	roleId: v.id('circleRoles'),
	personId: v.id('people'), // ✅ Uses personId (not userId)

	// Metadata
	assignedAt: v.number(),
	assignedByPersonId: v.optional(v.id('people')),

	// Optional term limits
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number()),

	// Lifecycle
	status: v.union(v.literal('active'), v.literal('ended')),
	endedAt: v.optional(v.number()),
	endedByPersonId: v.optional(v.id('people')),
	endReason: v.optional(v.string())
});
```

**Indexes**:

- `by_circle`: `['circleId']`
- `by_role`: `['roleId']`
- `by_person`: `['personId']`
- `by_circle_role`: `['circleId', 'roleId']`
- `by_circle_person`: `['circleId', 'personId']`
- `by_role_person`: `['roleId', 'personId']`
- `by_circle_status`: `['circleId', 'status']`

### Is personId Used (Not userId)?

**Answer**: ✅ **YES** — `personId` is used (not `userId`)

**Evidence**:

- Schema: `personId: v.id('people')` (line 8)
- Mutations: `convex/core/assignments/mutations.ts` line 91 uses `personId`
- Queries: `convex/core/assignments/queries.ts` uses `personId` throughout
- Authority context: `convex/core/authority/context.ts` line 38 queries by `personId`

**XDOM-01 Compliance**: ✅ Compliant — uses `personId` for workspace-scoped identity.

### How Is Circle Lead Assignment Identified?

**Source**: `convex/core/authority/context.ts` — `getAuthorityContextFromAssignments()` (lines 20-78)

**Process**:

```
1. Get active assignments for person in circle (lines 38-44)
   ✅ activeAssignments = query('assignments')
        .withIndex('by_circle_person', q => q.eq('circleId', circleId).eq('personId', personId))
        .filter(q => q.eq(q.field('status'), 'active'))

2. Load roles for assignments (lines 46-48)
   ✅ roles = Promise.all(activeAssignments.map(a => db.get(a.roleId)))

3. For each assignment, determine roleType (lines 51-69)
   ✅ template = role.templateId ? await db.get(role.templateId) : null
   ✅ roleType = mapRoleType({
        roleName: role.name,
        isLead: isLeadTemplate(template),        // ← Lead detection here
        isCoreTemplate: template?.isCore ?? false,
        policy
      })

4. Lead detection (convex/core/roles/detection.ts)
   ✅ isLeadTemplate(template): template?.isRequired === true
```

**Lead Identification Logic**:

**Source**: `convex/core/roles/detection.ts` (lines 15-17)

```typescript
export function isLeadTemplate(template: RoleTemplate | null | undefined): boolean {
	return template?.isRequired === true;
}
```

**Flow**:

1. Assignment → `roleId` → `circleRole` → `templateId` → `roleTemplate`
2. Check `template.isRequired === true`
3. If true → `roleType = 'lead'`
4. Authority calculation checks `assignment.roleType === 'lead'`

**Source**: `convex/core/authority/rules.ts` (lines 12-16)

```typescript
export function isCircleLead(ctx: AuthorityContext): boolean {
	return ctx.assignments.some(
		(a) => isSameActor(ctx, a) && a.circleId === ctx.circleId && a.roleType === 'lead'
	);
}
```

### Are There Any Special Fields for Lead Roles?

**Answer**: ❌ **NO** — No special fields on `assignments` table for Lead roles.

**Lead Detection**:

- **Not stored** on assignment record
- **Computed** at runtime via template lookup:
  - `assignment.roleId` → `circleRole.templateId` → `roleTemplate.isRequired`
- **Cached** in `AuthorityContext.assignments[].roleType` (computed field, not stored)

**Assignment Fields** (same for all roles):

- `circleId`, `roleId`, `personId` (triplet identity)
- `assignedAt`, `assignedByPersonId`
- `startDate`, `endDate` (optional term limits)
- `status`, `endedAt`, `endedByPersonId`, `endReason`

**No Lead-Specific Fields**:

- ❌ No `isLead` boolean on assignment
- ❌ No `leadRoleId` field
- ❌ No special status for Lead assignments

**Lead Identification**: Via template lookup chain:

```
assignment → role → template → isRequired === true
```

### Summary

**Current State**:

- ✅ Uses `personId` (workspace-scoped identity, XDOM-01 compliant)
- ✅ Lead identification via template lookup (`template.isRequired === true`)
- ✅ No special fields for Lead roles on assignments table
- ✅ Lead status computed at runtime, not stored

**Pattern**:

- **Assignment** = Person fills Role in Circle
- **Lead Assignment** = Assignment where Role's Template has `isRequired: true`
- **Detection** = Template lookup chain (assignment → role → template → isRequired)

---

# Summary: Key Findings

### ✅ What's Clear

1. **Role Templates**: 3 system-level templates exist (Circle Lead, Facilitator, Secretary)
2. **Workspace Creation**: Sequence is implemented (workspace → person → root circle → core roles)
3. **Core Roles**: Auto-created based on circleType (hierarchy/hybrid get Lead, others don't)
4. **Table Structure**: Clear separation between templates (blueprints) and roles (instances)
5. **Assignments**: Uses `personId`, Lead identified via template lookup

### ⚠️ Gaps Identified

1. **Creator Not Assigned to Circle Lead**:
   - Creator gets `workspaceRole: 'owner'` but no assignment to Circle Lead role
   - Root circle may have Circle Lead role but no person filling it

2. **Templates Dependency**:
   - Core roles only created if templates exist
   - If `seedRoleTemplates` hasn't been run, circles created without roles (silent failure)

3. **Hardcoded Root Circle**:
   - Root circle always `circleType: 'hierarchy'`, `decisionModel: 'manager_decides'`
   - No user input or configuration option

4. **RBAC vs Field-Based Access**:
   - Uses `people.workspaceRole` field directly (not `workspaceRoles` table)
   - Two access control mechanisms exist (field vs table) — potential confusion

### 🔍 Questions for Design Document

1. **Should creator be automatically assigned to Circle Lead role?**
   - Current: NO
   - Proposed: YES (to satisfy AUTH-02 invariant)

2. **Should role template seeding be automatic?**
   - Current: Manual script
   - Proposed: Auto-seed on first workspace creation or deployment

3. **Should root circle circleType be configurable?**
   - Current: Hardcoded `'hierarchy'`
   - Proposed: User choice or workspace setting

4. **Should we migrate from field-based to table-based RBAC?**
   - Current: `people.workspaceRole` field
   - Proposed: `workspaceRoles` table records

---

_This document reflects the current state of the codebase as of the research date. Implementation details may change._

I'll review this critically against architecture.md and flag issues.

---
