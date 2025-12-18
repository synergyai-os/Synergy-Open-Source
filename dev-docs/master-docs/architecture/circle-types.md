# Circle Types & Organizational Roles Design v0.5

**Status**: ⚠️ SUPERSEDED - See `governance-design.md` for current design  
**Last Updated**: 2025-12-15  
**Parent Document**: governance-design.md (canonical source)  
**Related**: SYOS-670, SYOS-663, architecture.md

> **Note**: This document contains the original design notes. The canonical, implemented design is in `governance-design.md`. This file is kept for historical reference only. Schema references below (defaultPurpose, defaultDecisionRights) are outdated - implementation uses `defaultFieldValues` per SYOS-960.

---

## 1. Circle Type Definitions

### 1.1 The Four Circle Types

| Type | Authority Model | Lead Authority | Root Eligible |
|------|-----------------|----------------|---------------|
| `hierarchy` | Authority 👑 | Full (decides directly) | ✅ Yes |
| `empowered_team` | Facilitative 🤝 | Facilitative (coordinates, breaks ties) | ✅ Yes |
| `guild` | Convening 🌱 | Convening (schedules only, advisory) | ❌ No |
| `hybrid` | Authority 👑 | Full (uses consent process) | ✅ Yes |

### 1.2 Authority Models

**Authority (hierarchy, hybrid)**: Lead decides directly OR uses consent. Approves proposals, assigns roles, represents to parent.

**Facilitative (empowered_team)**: Team decides by consent; lead breaks ties. Lead coordinates, schedules, represents to parent.

**Convening (guild)**: Advisory only. Recommendations go to members' home circles. Cannot approve proposals or make binding decisions.

### 1.3 Root Circle Validation (ORG-09)

```typescript
export function canBeRootCircle(circleType: CircleType): boolean {
  return circleType !== 'guild';
}
```

**Enforcement**: Only on workspace activation. During design phase, any structure is allowed.

---

## 2. Role Architecture

### 2.1 Role Types

| roleType | Meaning | System-Determined | Can Delete? |
|----------|---------|-------------------|-------------|
| `circle_lead` | Lead role for this circle | ✅ Auto-created | ❌ While circle exists |
| `structural` | Core governance role (Facilitator, Secretary) | ✅ Auto-created per circle type | ⚠️ With caution |
| `custom` | User-defined role | ❌ User creates | ✅ Freely |

**Rule**: `roleType` is system-determined. Users creating roles always get `custom` type.

### 2.2 Why roleType on Both Tables

```
roleTemplates.roleType  → Blueprint definition
circleRoles.roleType    → Instance value (denormalized OR standalone)
```

**Rationale**: Custom roles have no template (`templateId: null`). They need their own `roleType: 'custom'`. System roles inherit from template but store locally for query performance.

### 2.3 System Role Templates

| Template | isCore | isRequired | roleType | Notes |
|----------|--------|------------|----------|-------|
| Circle Lead | true | true | circle_lead | hierarchy, empowered_team, hybrid |
| Steward | true | true | circle_lead | guild only (same roleType, different authority) |
| Facilitator | true | false | structural | |
| Secretary | true | false | structural | Default name; workspace can customize |

**Secretary**: System default name. Workspaces can rename to "Recorder", "Scribe", etc. via display name settings.

### 2.4 Required Roles by Circle Type

| Role | hierarchy | empowered_team | guild | hybrid | roleType |
|------|-----------|----------------|-------|--------|----------|
| Circle Lead | ✅ Auto | ✅ Auto | — | ✅ Auto | circle_lead |
| Steward | — | — | ✅ Auto | — | circle_lead |
| Facilitator | ❌ Optional | ✅ Auto | ❌ Optional | ✅ Auto | structural |
| Secretary | ✅ Auto | ✅ Auto | ❌ Optional | ✅ Auto | structural |

### 2.5 Lead Detection Pattern

```
assignment.roleId → circleRole.templateId → roleTemplate.isRequired === true
```

**Clarification**: Both "Circle Lead" and "Steward" have `roleType: 'circle_lead'`. The roleType indicates "this IS the lead role for this circle", not the authority level. Authority is determined by `circleType`.

---

## 3. Role Auto-Creation

### 3.1 Trigger: Circle Creation

When a circle is created, the system automatically creates roles based on `circleType`:

```typescript
// convex/core/circles/mutations.ts - createCircle handler
async function createCircleWithRoles(ctx, data) {
  // 1. Create circle record
  const circleId = await ctx.db.insert('circles', { ...data });
  
  // 2. Get required roles for this circle type
  const requiredRoles = getRequiredRolesForType(data.circleType);
  
  // 3. Create each role
  for (const template of requiredRoles) {
    await ctx.db.insert('circleRoles', {
      circleId,
      workspaceId: data.workspaceId,
      name: template.name,
      roleType: template.roleType,
      templateId: template._id,
      purpose: template.defaultPurpose,
      decisionRights: template.defaultDecisionRights,
      status: 'active',
      // ...
    });
  }
  
  return circleId;
}
```

### 3.2 Trigger: Circle Type Change

When `circleType` is changed on an existing circle:

| Scenario | Action |
|----------|--------|
| hierarchy → empowered_team | Add Facilitator if missing |
| empowered_team → hierarchy | Keep Facilitator (now optional) |
| Any → guild | Replace Circle Lead with Steward |
| guild → Any | Replace Steward with Circle Lead |

**Rule**: Never delete the lead role. Transform it to the new type's lead template.

---

## 4. Decision Rights Model

### 4.1 Phase 1: Custom Decision Rights (Current)

Free-text strings describing what the role holder can decide without escalation.

```typescript
// circleRoles table
decisionRights: v.array(v.string())  // Required, min 1 item
```

**Enforcement location**: `convex/core/roles/rules.ts:validateRoleCreation()`

### 4.2 Default Decision Rights by Role

**Circle Lead (hierarchy/hybrid)**:
- Approves proposals for this circle
- Assigns and removes role holders
- Decides priorities when team cannot reach consensus
- Represents circle to parent circle

**Circle Lead (empowered_team)**:
- Breaks ties when consent cannot be reached
- Decides meeting scheduling and cadence
- Represents circle to parent circle

**Steward (guild)**:
- Schedules gatherings and community events
- Decides communication channels and formats
- Makes recommendations to home circles (non-binding)

**Facilitator**:
- Decides meeting agenda and time allocation
- Can pause discussions that go off-topic

**Secretary**:
- Decides format and structure of meeting notes
- Can request clarification for accurate recording

### 4.3 Phase 2: System Decision Domains (Future)

For AI authority calculation. Not implementing in Phase 1.

---

## 5. Workspace Lifecycle

### 5.1 Phases

| Phase | Description | History Tracked | Validation Enforced |
|-------|-------------|-----------------|---------------------|
| `design` | Structure being built | ❌ No | ❌ No |
| `active` | Live organization | ✅ Yes | ✅ Yes |

**Transition**: One-way only. `design` → `active`. No reversal.

**Rationale**: Once live, you want to track and trace all changes. Reverting to design would create audit gaps.

### 5.2 Design Phase Behavior

- Workspace creator gets RBAC role `org_designer`
- Org designers can freely create/modify/delete circles, roles, assignments
- No proposal approval process required
- No history/audit logging
- Governance invariants (ORG-09, AUTH-*, GOV-*) not enforced
- Useful for: Initial setup, stakeholder review, iteration before launch

### 5.3 Activation Requirements

Transition from `design` → `active` requires validation:

| Check | Rule | Error if Failed |
|-------|------|-----------------|
| Root circle exists | Workspace has exactly one root circle | "Create a root circle before activation" |
| Root type valid | Root circle type ≠ guild (ORG-09) | "Root circle cannot be a guild" |
| Lead roles exist | Every circle has a role with `roleType: 'circle_lead'` | "Circle [name] needs a lead role" |
| Lead assigned (optional?) | TBD - may allow activation without assignments | TBD |

**Triggered by**: `org_designer` via explicit UI action ("Activate Workspace")

### 5.4 Post-Activation

- History tracking begins for all changes
- Governance rules enforced per circle type
- Changes require appropriate authority
- `org_designer` role **persists** (separate concern from organizational authority)

### 5.5 Creator Does NOT Auto-Assign to Lead

Workspace creator gets `org_designer` RBAC role, NOT automatic Circle Lead assignment.

**Rationale**: Org Designer (HR, consultant) may set up structure for others. They need edit permissions, not organizational authority.

---

## 6. Schema Changes

### 6.1 circleRoles Table Additions

```typescript
// convex/core/roles/tables.ts - ADD these fields

roleType: v.union(
  v.literal('circle_lead'),
  v.literal('structural'),
  v.literal('custom')
),

decisionRights: v.array(v.string()),  // Required, min 1 item

purpose: v.string(),  // Change from v.optional(v.string())

// ADD index
.index('by_circle_roleType', ['circleId', 'roleType'])
```

### 6.2 roleTemplates Table Addition

```typescript
// convex/core/roles/tables.ts - ADD field

roleType: v.union(
  v.literal('circle_lead'),
  v.literal('structural'),
  v.literal('custom')
),

defaultPurpose: v.string(),
defaultDecisionRights: v.array(v.string()),
```

### 6.3 workspaces Table Addition

```typescript
// convex/core/workspaces/tables.ts - ADD field

phase: v.union(v.literal('design'), v.literal('active')),
// Default: 'design'
```

### 6.4 Data Model Relationships

```
assignments.roleId       → circleRoles._id
circleRoles.templateId   → roleTemplates._id (nullable for custom roles)
circleRoles.circleId     → circles._id
circles.workspaceId      → workspaces._id
```

---

## 7. Governance Invariants

### 7.1 New Invariants (GOV-*)

| ID | Invariant | Enforcement | Location |
|----|-----------|-------------|----------|
| **GOV-01** | Every circle has exactly one role with `roleType: 'circle_lead'` | Auto-created on circle creation | `circles/mutations.ts` |
| **GOV-02** | Every role has a purpose (non-empty string) | Mutation validation | `roles/rules.ts` |
| **GOV-03** | Every role has at least one decisionRight | Mutation validation | `roles/rules.ts` |
| **GOV-04** | Circle lead role cannot be deleted while circle exists | Mutation validation | `roles/rules.ts` |
| **GOV-05** | Role assignments are traceable (assignedByPersonId, assignedAt) | Schema requirement | `assignments/tables.ts` |
| **GOV-06** | Governance changes create history records (when phase = 'active') | Mutation side effect | `history/mutations.ts` |
| **GOV-07** | Person can fill 0-N roles; role can have 0-N people | Many-to-many via assignments | Schema design |
| **GOV-08** | Circle type is explicit, never null for active circles | Schema default + validation | `circles/tables.ts` |

### 7.2 Organization Invariant

| ID | Invariant | Enforcement | Location |
|----|-----------|-------------|----------|
| **ORG-09** | Root circle type must not be 'guild' | Activation validation only | `workspaces/lifecycle.ts` |

### 7.3 Validation Rules

```typescript
// convex/core/roles/rules.ts

// GOV-01: Only one circle_lead per circle
export async function validateRoleTypeUniqueness(
  ctx: QueryCtx,
  circleId: Id<'circles'>,
  roleType: RoleType,
  excludeRoleId?: Id<'circleRoles'>
): Promise<void> {
  if (roleType === 'circle_lead') {
    const existing = await ctx.db.query('circleRoles')
      .withIndex('by_circle_roleType', q => 
        q.eq('circleId', circleId).eq('roleType', 'circle_lead'))
      .first();
    if (existing && existing._id !== excludeRoleId) {
      throw new Error('VALIDATION_DUPLICATE: Circle already has a lead role');
    }
  }
}

// GOV-02 + GOV-03: Purpose and decision rights required
export function validateRoleCreation(data: RoleCreateInput): void {
  if (!data.purpose?.trim()) {
    throw new Error('VALIDATION_REQUIRED_FIELD: Role purpose is required');
  }
  if (!data.decisionRights?.length) {
    throw new Error('VALIDATION_REQUIRED_FIELD: At least one decision right is required');
  }
}

// GOV-04: Cannot delete lead role
export function validateRoleDeletion(role: CircleRole, circle: Circle): void {
  if (role.roleType === 'circle_lead' && !circle.archivedAt) {
    throw new Error('VALIDATION_INVALID_OPERATION: Cannot delete lead role while circle exists');
  }
}
```

---

## 8. Implementation TODOs

### Phase 1: Schema Updates
- [ ] Add `roleType` field to circleRoles table
- [ ] Add `decisionRights` field to circleRoles table
- [ ] Make `purpose` required (non-empty)
- [ ] Add `by_circle_roleType` index to circleRoles
- [ ] Add `roleType`, `defaultPurpose`, `defaultDecisionRights` to roleTemplates
- [ ] Add `phase` field to workspaces table (default: 'design')
- [ ] Add Steward template to seed data
- [ ] Update Secretary template in seed data (was Secretary, confirm naming)

### Phase 2: Validation Rules
- [ ] Implement `canBeRootCircle(circleType)` function
- [ ] Implement GOV-01 uniqueness validation
- [ ] Implement GOV-02 validation (purpose required)
- [ ] Implement GOV-03 validation (decisionRights required)
- [ ] Implement GOV-04 enforcement (lead role protection)
- [ ] Implement ORG-09 check (only on activation)

### Phase 3: Role Auto-Creation
- [ ] Implement role creation in circle creation mutation
- [ ] Implement circle type change handler (role transformation)
- [ ] Add tests for auto-creation by circle type

### Phase 4: Workspace Lifecycle
- [ ] Implement workspace phase field
- [ ] Add `org_designer` to RBAC workspace roles
- [ ] Implement activation validation
- [ ] Conditional history tracking (only when phase = 'active')

### Phase 5: Authority Calculation
- [ ] Update `convex/core/authority/policies.ts` with circle type authority
- [ ] Implement Steward convening authority (advisory only)
- [ ] Add authority tests per circle type

### Phase 6: Documentation Updates
- [ ] Add GOV-* invariant category to architecture.md
- [ ] Add ORG-09 to INVARIANTS.md
- [ ] Add `org_designer` RBAC role to architecture.md
- [ ] Document workspace lifecycle phases in architecture.md

---

## 9. Architectural Decisions

### AD-01: Circle Types Are FROZEN
**Status**: Accepted  
The four circle types (hierarchy, empowered_team, guild, hybrid) are foundational.

### AD-02: Lead Detection via Template Lookup
**Status**: Accepted (SYOS-670)  
`assignment.roleId → circleRole.templateId → roleTemplate.isRequired === true`

### AD-03: roleType is System-Determined
**Status**: Accepted  
Users cannot set roleType. System assigns based on template or defaults to 'custom'.

### AD-04: roleType on Both Tables
**Status**: Accepted  
Custom roles have no template. System roles denormalize for query performance.

### AD-05: Workspace Lifecycle is One-Way
**Status**: Accepted  
`design` → `active` only. No reversal. Audit integrity requires continuous tracking once live.

### AD-06: Creator Gets RBAC Role, Not Circle Role
**Status**: Accepted  
Workspace creator gets `org_designer` RBAC role. Role persists after activation.

### AD-07: Governance Validation Only on Activation
**Status**: Accepted  
During design phase, any structure is allowed. ORG-09 and other invariants checked only when activating.

### AD-08: Secretary as System Default
**Status**: Accepted  
"Secretary" is the system template name. Workspaces can customize display name.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.5 | 2025-12-15 | Added: Role auto-creation trigger section, circle type change handling, activation requirements, enforcement locations for all invariants, roleType on both tables rationale, Secretary as default name, one-way lifecycle, by_circle_roleType index. Clarified: Steward IS circle_lead roleType. |
| 0.4 | 2025-12-15 | Major revision: Removed creator auto-assignment, added workspace lifecycle phases, clarified roleType is system-determined. |
| 0.3 | 2025-12-14 | Initial governance invariants, circle type definitions |