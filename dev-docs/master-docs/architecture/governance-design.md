# SynergyOS Governance Design Document

**Version**: 1.0  
**Status**: Draft  
**Last Updated**: 2025-12-15  
**Related**: circle-types-org-roles-design-v0.5.md, architecture.md

---

## Executive Summary

SynergyOS is a **decision-making operating system** that renders as an org chart. This document defines how SynergyOS supports multiple governance modes while maintaining a consistent underlying model.

**Core Insight**: "We model work as roles, decisions, and flows; everything else is skin."

---

## 1. Design Principles

### 1.1 Invariants Over Configuration

| Invariant (Non-Negotiable) | Configuration (Flexible) |
|---------------------------|-------------------------|
| Every circle has exactly one lead role | What they call that role |
| Roles have explicit decision rights | How many decisions they define |
| Authority calculated from roles | How formal the governance process is |
| Changes are traceable (when active) | What they call proposals |

### 1.2 Decision Rights as First-Class Citizens

Role clarity correlates with 53% higher efficiency, 27% higher effectiveness, 75% more passion for work. **Decision Rights are required, not optional.**

### 1.3 Progressive Adoption

- Start with current reality ("map what you have")
- Gradual evolution ("try empowered teams in Product")
- Mixed governance ("Engineering is hierarchy, Product is empowered_team")

### 1.4 Design Before Activation

Workspaces start in `design` phase. Structure can be freely changed without governance overhead. Once `activated`, changes are tracked and governance rules apply.

---

## 2. Core Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| GOV-01 | Every circle has exactly one role with `roleType: 'circle_lead'` | Auto-created on circle creation |
| GOV-02 | Every role has a `purpose` (non-empty string) | Mutation validation |
| GOV-03 | Every role has at least one `decisionRight` | Mutation validation |
| GOV-04 | Circle lead role cannot be deleted while circle exists | Mutation validation |
| GOV-05 | Role assignments are traceable (who assigned, when) | Schema requirement |
| GOV-06 | Governance changes create history records (when phase = 'active') | Mutation side effect |
| GOV-07 | Person can fill 0-N roles; role can have 0-N people | Many-to-many via assignments |
| GOV-08 | Lead authority is explicit, never null for active circles | Schema validation |
| ORG-10 | Root circle lead authority must not be 'convenes' | Activation validation only |

---

## 3. Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: INVARIANTS (system-enforced, non-negotiable)             │
│  • Every circle has one lead role (GOV-01)                         │
│  • Roles define purpose + decision rights (GOV-02, GOV-03)         │
│  • Authority calculated from assignments                           │
│  • Changes create history (when active) (GOV-06)                   │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 2: LEAD AUTHORITY (per-circle, 3 options)                   │
│  • decides | facilitates | convenes                                │
│  • Affects: proposal flow, decision process, auto-created roles    │
│  • Can vary within same workspace                                  │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 3: DISPLAY NAMES (per-workspace, cosmetic only)             │
│  • "Circle" → Department, Team, Squad                              │
│  • "Circle Lead" → Manager, Director, Coordinator                  │
│  • No behavioral impact                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Workspace Lifecycle

### 4.1 Phases

| Phase | History Tracked | Validation Enforced | Governance Required |
|-------|-----------------|---------------------|---------------------|
| `design` | ❌ No | ❌ No | ❌ No |
| `active` | ✅ Yes | ✅ Yes | ✅ Per circle type |

### 4.2 Design Phase

- Workspace creator gets RBAC role `org_designer`
- Free create/modify/delete of circles, roles, assignments
- No proposal approval, no history logging
- Invariants not enforced (except schema-level)

### 4.3 Activation Requirements

| Check | Rule | Error Message |
|-------|------|---------------|
| Root exists | Workspace has exactly one root circle | "Create a root circle before activation" |
| Root type valid | Root circle lead authority ≠ convenes (ORG-10) | "Root circle cannot use 'convenes' authority" |
| Lead roles exist | Every circle has `roleType: 'circle_lead'` | "Circle [name] needs a lead role" |

**Triggered by**: `org_designer` via explicit UI action

### 4.4 Transition

One-way only: `design` → `active`. No reversal. Once live, audit trail must be continuous.

---

## 5. Lead Authority Model

### 5.1 Authority Options

| Lead Authority | Decision Pattern | Lead Role | Root Eligible |
|----------------|------------------|-----------|---------------|
| `decides` | Lead decides directly | Circle Lead | ✅ Yes |
| `facilitates` | Team decides by consent, lead facilitates | Team Lead | ✅ Yes |
| `convenes` | Advisory only, recommendations to home circles | Steward | ❌ No |

**Key Question**: "How does the lead make decisions for this circle?"

### 5.2 Behavior Matrix

| Behavior | `decides` | `facilitates` | `convenes` |
|----------|-----------|---------------|------------|
| Lead approves proposals unilaterally | ✅ Yes | ❌ No | N/A |
| Consent process required | ❌ No | ✅ Yes | N/A |
| Members raise objections | Optional | Required | N/A |
| Decision rights binding | ✅ Yes | ✅ Yes | ❌ Advisory |

### 5.3 Auto-Created Roles by Lead Authority

| Lead Authority | Auto-Created Roles | Lead Role Name |
|----------------|-------------------|----------------|
| `decides` | circle_lead, secretary | Circle Lead |
| `facilitates` | circle_lead, facilitator, secretary | Team Lead |
| `convenes` | circle_lead (as Steward) | Steward |

**Note**: `convenes` circles have a "Steward" with `roleType: 'circle_lead'` but convening authority only.

### 5.4 Lead Authority Change

| Scenario | Action |
|----------|--------|
| Any → convenes | Transform lead role to Steward template |
| convenes → Any | Transform Steward to Circle Lead template |
| decides → facilitates | Add Facilitator if missing |
| facilitates → decides | Keep Facilitator (now optional) |

**Rule**: Never delete the lead role. Transform it.

---

## 6. Role Architecture

### 6.1 Role Types

| roleType | System-Determined | Can Delete | Authority |
|----------|-------------------|------------|-----------|
| `circle_lead` | ✅ Auto-created | ❌ Never | Per circle type |
| `structural` | ✅ Auto-created | ⚠️ With governance | Facilitator, Secretary |
| `custom` | ❌ User creates | ✅ Yes | As defined |

### 6.2 Why roleType on Both Tables

```
roleTemplates.roleType  → Blueprint definition
circleRoles.roleType    → Instance value
```

Custom roles have no template (`templateId: null`), so need their own `roleType: 'custom'`.

### 6.3 System Role Templates

| Template | isRequired | roleType | Used By |
|----------|------------|----------|---------|
| Circle Lead | true | circle_lead | hierarchy, empowered_team, hybrid |
| Steward | true | circle_lead | guild |
| Facilitator | false | structural | empowered_team, hybrid |
| Secretary | false | structural | All (optional or auto) |

### 6.4 Role Fields

**Note**: As of SYOS-960, descriptive fields (purpose, decisionRights, etc.) are stored in `customFieldValues`, not on the `circleRoles` schema. This enables flexible field definitions per workspace.

| Field | Required | Storage Location | Description |
|-------|----------|------------------|-------------|
| `name` | ✅ | circleRoles schema | Display name |
| `roleType` | ✅ | circleRoles schema | System-determined classification |
| `purpose` | ✅ | customFieldValues | "Why does this role exist?" |
| `decisionRights` | ✅ (min 1) | customFieldValues | What this role can decide alone |
| `accountabilities` | Optional | customFieldValues | Ongoing activities |
| `domains` | Optional | customFieldValues | Exclusive control areas |

### 6.5 Decision Rights Examples

| ✅ Good | ❌ Vague |
|---------|----------|
| "Decides which vendor to use for hosting" | "Manages technology" |
| "Can approve expenses up to $5,000" | "Handles budget" |
| "Decides sprint priorities each week" | "Sets priorities" |

---

## 7. Role Auto-Creation

### 7.1 Trigger: Circle Creation

```typescript
// In circle creation mutation
1. Create circle record
2. Read leadAuthority
3. Create roles per authority (see 5.3)
4. For each role:
   a. Create lean circleRole record (name, roleType, templateId only)
   b. Create customFieldValues from template.defaultFieldValues
      - One customFieldValues record per value (for searchability)
      - Helper: infrastructure/customFields/helpers.ts
```

### 7.2 Trigger: Lead Authority Change

When `leadAuthority` changes, system transforms lead role to match new authority's template. Structural roles added/kept as needed.

---

## 8. Authority Calculation

### 8.1 By Lead Authority

```typescript
function calculateAuthority(personId, circleId): Authority {
  const circle = getCircle(circleId);
  const isLead = hasRoleType(personId, circleId, 'circle_lead');
  const isMember = hasAnyRole(personId, circleId);
  
  switch (circle.leadAuthority) {
    case 'decides':
      return { canApproveProposals: isLead, canAssignRoles: isLead, ... };
    case 'facilitates':
      return { canApproveProposals: false, canRaiseObjections: isMember, ... };
    case 'convenes':
      return { canApproveProposals: false, canAssignRoles: isLead, ... }; // Advisory
  }
}
```

### 8.2 No Inheritance

Authority does NOT flow down. To have authority in a sub-circle, you must fill a role there.

---

## 9. Display Name Configuration

### 9.1 Schema

```typescript
// workspaces table
displayNames: v.optional(v.object({
  circle: v.string(),           // Default: "Circle"
  circleLead: v.string(),       // Default: "Circle Lead"
  facilitator: v.string(),      // Default: "Facilitator"
  secretary: v.string(),        // Default: "Secretary"
  tension: v.string(),          // Default: "Tension"
  proposal: v.string(),         // Default: "Proposal"
}))
```

### 9.2 Presets

| Preset | circle | circleLead | tension |
|--------|--------|------------|---------|
| Traditional | Department | Director | Issue |
| Agile | Squad | Lead | Impediment |
| Holacracy | Circle | Lead Link | Tension |
| Flat | Team | Coordinator | Opportunity |

---

## 10. Tension Processing

### 10.1 Types

| Type | Resolution Forum | Outcome |
|------|------------------|---------|
| `operational` | Tactical meeting | Action items |
| `governance` | Governance meeting | Proposals |
| `strategic` | Strategy review | Updated strategy |

### 10.2 By Lead Authority

| Lead Authority | Processing | Resolution Authority |
|----------------|------------|---------------------|
| `decides` | Lead reviews | Lead decides |
| `facilitates` | Consent process | Collective |
| `convenes` | Discussion | Advisory recommendation |

---

## 11. Onboarding Flow

### 11.1 Flow Selection

```
"How does your organization make decisions today?"

○ Leaders decide, teams execute        → decides, Traditional vocab
○ Teams collaborate, leaders facilitate → facilitates, Agile vocab
```

### 11.2 Minimum Viable Setup

| Required | Why |
|----------|-----|
| 1 workspace | Container |
| 1 root circle | Top-level unit |
| 1 lead role with purpose + 1 decision right | GOV-02, GOV-03 |

**Note**: Creator gets `org_designer` RBAC role. They are NOT automatically assigned to Circle Lead. Assignment is a separate action.

### 11.3 Post-Setup

Workspace starts in `design` phase. Creator can:
- Build full structure
- Review with stakeholders
- Iterate freely
- Activate when ready

---

## 12. Success Metrics

### 12.1 Adoption

| Metric | Target |
|--------|--------|
| % roles with purpose | 100% |
| % roles with ≥1 decision right | 100% |
| % circles with lead authority set | 100% |
| Time to first tension | < 7 days |

### 12.2 Clarity

| Metric | Target |
|--------|--------|
| Role clarity score (survey) | > 80% |
| Decision traceability | 100% |
| Tension resolution time | < 14 days |

### 12.3 Health Signals

| Signal | Healthy | Unhealthy |
|--------|---------|-----------|
| Tension volume | 1-3/person/month | 0 or 10+ |
| Proposal pass rate | 70-90% | < 50% or 100% |

---

## 13. Schema Summary

### 13.1 New/Changed Fields

**circleRoles table:**
- `roleType`: `'circle_lead' | 'structural' | 'custom'` (required)
- `templateId`: `Id<'roleTemplates'> | undefined` (links to template)
- **Removed** (SYOS-960): `purpose`, `decisionRights` → now in `customFieldValues`

**roleTemplates table:**
- `roleType`: `'circle_lead' | 'structural' | 'custom'`
- `defaultFieldValues`: `Array<{ systemKey: string, values: string[] }>` (flexible field system)
- `appliesTo`: `'decides' | 'facilitates' | 'convenes'` (single value, not array)
- **Removed** (SYOS-960): `defaultPurpose`, `defaultDecisionRights` → now in `defaultFieldValues`

**customFieldValues table:** (stores role descriptive fields)
- `entityType`: `'circle' | 'role' | ...` (which type of entity)
- `entityId`: `string` (the role/circle ID)
- `definitionId`: `Id<'customFieldDefinitions'>` (which field, e.g., "purpose")
- `value`: `string` (the actual value - one record per value)
- `searchText`: `string` (indexed for search)

**workspaces table:**
- `phase`: `'design' | 'active'` (default: 'design')
- `displayNames`: object (optional)

### 13.2 New Indexes

- `circleRoles.by_circle_roleType`: `['circleId', 'roleType']`

---

## Glossary

| Term | Definition |
|------|------------|
| **Circle** | Organizational unit with defined purpose and roles |
| **Lead Authority** | How the circle lead makes decisions (decides, facilitates, convenes) |
| **Decision Right** | Explicit authority to make specific decisions |
| **roleType** | System classification (circle_lead, structural, custom) |
| **Steward** | Convenes-specific lead role with convening authority only |
| **Tension** | Gap between current reality and desired state |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-15 | Initial version aligned with circle-types-org-roles-design-v0.5.md |