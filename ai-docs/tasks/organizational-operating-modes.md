# Organizational Operating Modes - BDD Specification

**Feature**: Circle Operating Modes & Decision Models  
**Status**: ⚠️ SUPERSEDED by SYOS-670  
**Last Updated**: 2025-12-05

---

> ## ⚠️ THIS DOCUMENT IS SUPERSEDED
>
> **This document has been replaced by**: `ai-docs/tasks/SYOS-670-circle-lead-authority-design.md`
>
> The SYOS-670 design includes:
>
> - Evidence-based decisions from product discovery session
> - Simplified MVP scope (hard-coded defaults, no complex overrides)
> - Authority levels by circle type
> - Lead optionality for empowered teams and guilds
> - Consent-based decision process
>
> **Do not use this document for implementation.** Reference SYOS-670 instead.

---

## Original Document (Historical Reference)

---

## Overview

Enable circles to operate in different modes (hierarchy, empowered_team, guild, hybrid) with configurable decision models. This supports Marty Cagan's product model alongside traditional hierarchical structures, allowing organizations to use the right operating mode for each circle.

**Core Philosophy**: Same data structure (circles + roles), different behavioral rules. Circles can be hierarchical (manager decides) or empowered (team consensus), or guilds (coordination only).

**Key Insight**: The circles-and-roles model is flexible enough to represent multiple overlapping structures simultaneously. Operating modes are metadata that changes behavior, not fundamental structural changes.

---

## Current Status

### ✅ What Exists

- Circles schema (supports infinite nesting, hierarchical structure)
- Roles schema (can belong to circles, users can fill multiple roles)
- RBAC system (permissions, roles, userRoles with resource scoping)
- Circle members (many-to-many, users can belong to multiple circles)
- Version history (tracks all changes)

### ❌ What's Missing

- Circle operating mode metadata (`circleType`, `decisionModel` fields)
- RBAC adaptation based on circle type
- Decision model enforcement logic
- UI indicators for circle operating mode
- Operating mode configuration UI
- Cross-circle membership coordination (guilds)

---

## User Stories

### US-1: Configure Circle Operating Mode

**As a** workspace admin or circle lead  
**I want to** configure how a circle makes decisions  
**So that** the circle operates in the right mode for its purpose

**Acceptance Criteria**:

- Can set circle operating mode: `hierarchy` | `empowered_team` | `guild` | `hybrid`
- Can set decision model: `manager_decides` | `team_consensus` | `lead_link` | `consent`
- Operating mode affects RBAC behavior automatically
- Default: `hierarchy` with `manager_decides` (backward compatible)

---

### US-2: Hierarchical Circles (Traditional)

**As a** manager in a hierarchical circle  
**I want to** make decisions that my team must follow  
**So that** we maintain clear accountability chains

**Acceptance Criteria**:

- Circle type: `hierarchy`
- Decision model: `manager_decides`
- Only circle lead/manager role can approve proposals
- Quick edits require manager approval (if enabled)
- RBAC restricts decision-making to manager role

**Use Cases**: Finance, Legal, Compliance, Executive leadership

---

### US-3: Empowered Product Teams

**As a** member of an empowered product team  
**I want to** make decisions collaboratively with my team  
**So that** we can move fast and learn quickly

**Acceptance Criteria**:

- Circle type: `empowered_team`
- Decision model: `team_consensus` or `consent`
- Any circle member can propose changes
- Proposals approved by team consensus (or consent - no objections)
- Quick edits available to all team members (if permission + setting enabled)
- RBAC allows wide decision-making within circle scope

**Use Cases**: Product teams, cross-functional pods, outcome-oriented teams

---

### US-4: Guild Circles (Communities of Practice)

**As a** member of a design guild  
**I want to** coordinate with other designers across teams  
**So that** we maintain consistency and share knowledge

**Acceptance Criteria**:

- Circle type: `guild`
- Decision model: `coordination_only` (no authority)
- Members can propose/discuss but not execute decisions
- Guild proposals must be approved by member's home circle
- RBAC read-only for guild decisions
- Members belong to guild AND their product team circle

**Use Cases**: Design system guild, architecture guild, practice communities

---

### US-5: Hybrid Circles

**As a** delivery lead  
**I want to** have some hierarchical control while empowering teams  
**So that** we balance accountability with speed

**Acceptance Criteria**:

- Circle type: `hybrid`
- Decision model: configurable per decision type
- Some decisions require manager approval (budget, hiring)
- Other decisions use team consensus (sprint planning, technical choices)
- RBAC adapts based on decision type

**Use Cases**: Client delivery teams, departments with mixed needs

---

### US-6: RBAC Adaptation to Circle Type

**As a** system  
**I want to** adapt permissions based on circle operating mode  
**So that** the right people can make decisions in each context

**Acceptance Criteria**:

- If circle.type == `hierarchy`: only manager role can approve
- If circle.type == `empowered_team`: any circle member can act within scope
- If circle.type == `guild`: members can propose but not execute
- RBAC checks consider circle type when evaluating permissions
- Permission scope adapts: `all` | `own` | `circle_members` | `none`

---

### US-7: Cross-Circle Membership

**As a** designer  
**I want to** belong to both a product team and a design guild  
**So that** I can contribute to both work execution and practice development

**Acceptance Criteria**:

- User can have roles in multiple circles simultaneously
- Each role has different authority based on circle type
- UI shows which circle context user is operating in
- Proposals can be created in any circle user belongs to
- Guild membership doesn't override product team authority

---

## BDD Scenarios

### Scenario 1: Configure Empowered Product Team

```
Given I am a workspace admin
When I navigate to circle settings for "ZDHC Transformation"
And I set operating mode to "empowered_team"
And I set decision model to "team_consensus"
Then the circle operates in empowered mode
And all circle members can make decisions within scope
And proposals require team consensus approval
```

---

### Scenario 2: Hierarchical Finance Circle

```
Given I am a workspace admin
When I navigate to circle settings for "Finance"
And I set operating mode to "hierarchy"
And I set decision model to "manager_decides"
Then only the Finance Lead role can approve proposals
And team members can propose but not execute
And RBAC restricts decision-making to Finance Lead
```

---

### Scenario 3: Design Guild Coordination

```
Given I am a designer
And I belong to "Product Team Alpha" (empowered_team)
And I belong to "Design Practice" (guild)
When I create a proposal in the Design Practice guild
Then the proposal is for coordination/discussion only
And approval must come from my Product Team Alpha circle
And I cannot execute guild decisions independently
```

---

### Scenario 4: RBAC Check in Empowered Team

```
Given I am a member of "Product Team Beta" (empowered_team)
And I have the "org-chart.edit.quick" permission
And the workspace has "allowQuickChanges" enabled
When I attempt to edit a circle item in Product Team Beta
Then RBAC checks: circle.type == "empowered_team"
And RBAC allows: any circle member can edit
And my edit is approved
```

---

### Scenario 5: RBAC Check in Hierarchical Circle

```
Given I am a member of "Finance" (hierarchy)
And I do NOT have the Finance Lead role
And I have the "org-chart.edit.quick" permission
When I attempt to edit a circle item in Finance
Then RBAC checks: circle.type == "hierarchy"
And RBAC requires: manager role (Finance Lead)
And my edit is denied
And I see: "Only Finance Lead can make changes in hierarchical circles"
```

---

### Scenario 6: Proposal Approval in Empowered Team

```
Given I created a proposal in "Product Team Alpha" (empowered_team)
And the decision model is "team_consensus"
When the proposal is brought to governance meeting
Then approval requires: all team members agree (or consent - no objections)
And if approved, changes are applied automatically
```

---

### Scenario 7: Proposal Approval in Hierarchical Circle

```
Given I created a proposal in "Finance" (hierarchy)
And the decision model is "manager_decides"
When the proposal is brought to governance meeting
Then approval requires: Finance Lead role approval
And other members can provide input but not block
And if approved, changes are applied automatically
```

---

## Technical Decisions Needed

### 1. Schema Changes

**Decision**: Add operating mode fields to `circles` table

**Fields**:

- `circleType`: `v.union(v.literal('hierarchy'), v.literal('empowered_team'), v.literal('guild'), v.literal('hybrid'))`
- `decisionModel`: `v.union(v.literal('manager_decides'), v.literal('team_consensus'), v.literal('lead_link'), v.literal('consent'), v.literal('coordination_only'))`
- `outcomeOriented`: `v.optional(v.boolean())` - Is this circle outcome-oriented?
- `escalationPath`: `v.optional(v.id('circles'))` - Where to escalate when stuck?

**Rationale**:

- Minimal schema changes (just metadata)
- Backward compatible (defaults to hierarchy)
- Supports all operating modes described

---

### 2. RBAC Adaptation Logic

**Decision**: Extend RBAC permission checks to consider circle type

**Logic**:

```typescript
function canEditInCircle(user, circle, permission) {
	// Base permission check
	if (!hasPermission(user, permission)) return false;

	// Circle type adaptation
	switch (circle.circleType) {
		case 'hierarchy':
			return hasRole(user, circle, 'manager') || hasRole(user, circle, 'circle_lead');
		case 'empowered_team':
			return isCircleMember(user, circle);
		case 'guild':
			return false; // Guilds are coordination-only
		case 'hybrid':
			// Check decision type or default to manager
			return hasRole(user, circle, 'manager') || isCircleMember(user, circle);
	}
}
```

**Rationale**: RBAC system already supports resource scoping. Extend checks to consider circle metadata.

---

### 3. Default Operating Modes

**Decision**:

- Root circle: `hierarchy` (executive decisions)
- New circles: `hierarchy` (backward compatible)
- Workspace admin can change any circle's mode

**Rationale**:

- Safe defaults (traditional org chart behavior)
- Explicit opt-in to empowered modes
- Prevents accidental permission escalation

---

### 4. Cross-Circle Membership

**Decision**: Already supported by existing schema

**Current Support**:

- Users can belong to multiple circles (`circleMembers` table)
- Users can fill multiple roles (`userCircleRoles` table)
- RBAC supports resource scoping (`circleId` in `userRoles`)

**What's Needed**:

- UI to show user's circle memberships
- Context switching (which circle am I operating in?)
- Clear indicators of authority differences

**Rationale**: Data model already supports this. Need UI/UX to make it clear.

---

### 5. Proposal Processing by Circle Type

**Decision**: Proposal approval workflow adapts to circle's decision model

**Workflow**:

- `manager_decides`: Single approver (manager role)
- `team_consensus`: All members must agree
- `consent`: No objections (Holacracy-style)
- `coordination_only`: Must be approved in member's home circle

**Rationale**: Different circles need different decision processes. Proposals should respect circle's operating mode.

---

## Open Questions

1. **Hybrid mode complexity**: How granular should decision type configuration be? Per-field or per-category?
2. **Guild authority**: Can guilds ever have execution authority, or always coordination-only?
3. **Escalation paths**: How to handle circles that get stuck? Default to parent circle?
4. **Role authority scope**: Should role authority be defined per-circle or globally?
5. **Migration strategy**: How to migrate existing circles to new operating modes without breaking permissions?
6. **UI complexity**: How to make operating modes clear without overwhelming users?

---

## Integration with Edit Circle Feature

**Impact on Quick Edits**:

- Hierarchical circles: Only manager can quick edit (even with `org-chart.edit.quick` permission)
- Empowered teams: All members can quick edit (if permission + setting enabled)
- Guilds: No quick edits (coordination-only)
- Hybrid: Depends on decision type configuration

**Impact on Proposals**:

- Proposal approval workflow follows circle's decision model
- Recorder assignment may vary by circle type (guilds might not have recorder)
- Proposal processing in governance meetings adapts to circle type

**See**: `edit-circle-feature.md` for proposal and quick edit details.

---

## Next Steps

1. ✅ Create BDD specification (this document)
2. ⬜ Design schema changes (add `circleType`, `decisionModel` fields)
3. ⬜ Design RBAC adaptation logic
4. ⬜ Design operating mode configuration UI
5. ⬜ Design circle type indicators in UI
6. ⬜ Design cross-circle membership UI
7. ⬜ Update proposal workflow to respect circle type
8. ⬜ Update quick edit feature to respect circle type
9. ⬜ Migration plan for existing circles

---

## References

- Current circles schema: `convex/schema.ts` (lines 137-154)
- RBAC system: `convex/schema.ts` (lines 1128-1227)
- Edit circle feature: `ai-docs/tasks/edit-circle-feature.md`
- Org chart essentials: `src/lib/modules/org-chart/docs/essentials.md`
- Marty Cagan product model: Hybrid organizational structures
- Holacracy: Consent-based decision making

---

## Example: SaproLab Organizational Structure

```
ROOT: SaproLab (hierarchy, manager_decides)
├── Role: CEO (Bjorn)
├── Role: CFO
│
├── Circle: Finance (hierarchy, manager_decides)
│   ├── Role: Finance Lead (hierarchical authority)
│   └── Role: Accountant (reports to lead)
│
├── Circle: ZDHC Transformation (empowered_team, team_consensus)
│   ├── Role: Product Manager
│   ├── Role: Designer
│   ├── Role: Tech Lead
│   └── Outcome: SBX Launch success
│
├── Circle: Client Delivery (hybrid, manager_decides for budget/hiring, team_consensus for execution)
│   ├── Role: Delivery Lead (hierarchical for admin)
│   └── Circle: Client Project X (empowered_team, team_consensus)
│       ├── Role: Consultant A
│       └── Role: Consultant B
│
└── Circle: Design Practice (guild, coordination_only)
    ├── Member: Designer from ZDHC circle
    └── Member: Designer from another team
```

**Key Behaviors**:

- Finance: Only Finance Lead can approve changes
- ZDHC Transformation: Team members can make decisions collaboratively
- Client Delivery: Hybrid - Delivery Lead controls budget, team controls execution
- Design Practice: Coordination only, no execution authority
