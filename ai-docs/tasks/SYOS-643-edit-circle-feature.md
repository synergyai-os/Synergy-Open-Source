# Edit Circle Feature - BDD Specification

**Linear Ticket**: [SYOS-643](https://linear.app/younghumanclub/issue/SYOS-643)

**Feature**: Edit Circle  
**Status**: 🚧 Ready for Implementation  
**Last Updated**: 2025-12-04

---

## Overview

Enable two modes for editing circles and roles:

1. **Quick Edit Mode**: Direct inline editing with auto-save (requires RBAC permission + workspace setting)
2. **Proposal Mode**: Create proposals for governance meeting approval (default, always available)

**Core Philosophy**: Anyone can propose changes. Quick edits require permission + workspace admin approval.

**Permission Scope**: The `org-chart.edit.quick` permission covers **both circles AND roles** - a single unified permission for all org chart quick edits.

**Organizational Context**: This feature supports both hierarchical and empowered team models. Circle operating modes (hierarchy, empowered_team, guild, hybrid) may affect how proposals are processed and who can approve quick edits. See `organizational-operating-modes.md` for details.

---

## Current Status

### ✅ What Exists

- Governance meeting template (created automatically on workspace creation)
- `workspaceOrgSettings` table (for workspace-level org chart settings)
- RBAC system (roles, permissions, userRoles tables)
- Circle items schema (`circleItemCategories`, `circleItems` tables)
- Circle properties (name, purpose) in `circles` table

### ❌ What's Missing

- Proposal system (no `circleProposals` table)
- Quick edit functionality (no inline editing)
- `org-chart.edit.quick` permission (✅ Role created: "Org Designer")
- `allowQuickChanges` workspace setting
- Proposal → Governance meeting integration
- Analytics/metrics for proposal engagement

---

## User Stories

### US-1: Quick Edit Mode (Org Designer)

**As an** Org Designer  
**I want to** click on circle and role fields and edit them directly with auto-save  
**So that** I can quickly develop and evolve the organization structure

**Acceptance Criteria**:

- Click on text field → becomes editable
- Click outside → auto-saves
- Requires: RBAC `Org Designer` role + `org-chart.edit.quick` permission + `allowQuickChanges` setting enabled
- Works for: **Circles** (name, purpose, domains, accountabilities, policies, decision rights, notes) AND **Roles** (name, purpose, domains, accountabilities)

---

### US-2: Proposal Mode (Default)

**As a** workspace member  
**I want to** create proposals for circle/role changes  
**So that** changes are reviewed and approved through governance meetings

**Acceptance Criteria**:

- Anyone can create proposals (no permission required)
- Proposal includes: description, evolutions (changes), attachments
- Proposal can be linked to governance meeting
- Proposal status: `draft` → `submitted` → `in-meeting` → `approved`/`rejected`/`amended`

---

### US-3: Workspace Admin Control

**As a** workspace admin  
**I want to** control whether quick edits are allowed  
**So that** I can enforce governance process when needed

**Acceptance Criteria**:

- Setting: `allowQuickChanges` (boolean) in `workspaceOrgSettings`
- When disabled: all edits must go through proposal workflow
- When enabled: Org Designers can use quick edit mode

---

### US-4: Governance Meeting Integration

**As a** circle member  
**I want to** process proposals in governance meetings  
**So that** changes follow Integrated Decision Making process

**Acceptance Criteria**:

- Proposals can be added to governance meeting agenda
- Recorder manages meeting flow
- Proposals processed using IDM process
- Approved proposals automatically apply changes

---

### US-5: Engagement Analytics

**As a** workspace admin  
**I want to** see proposal engagement metrics  
**So that** I can measure organizational evolution and participation

**Acceptance Criteria**:

- Track: proposals created per user/circle, approval rates, time to approval
- Dashboard shows: engagement trends, most active proposers, proposal status breakdown

---

## BDD Scenarios

### Scenario 1: Quick Edit - Successful Auto-Save (Circle)

```
Given I have the "Org Designer" role
And I have the "org-chart.edit.quick" permission
And the workspace has "allowQuickChanges" enabled
When I click on the "Domains" text field in circle details
And I type "Manage product roadmap"
And I click outside the field
Then the change is automatically saved
And I see a success notification
And the circle item is updated in the database
```

### Scenario 1b: Quick Edit - Successful Auto-Save (Role)

```
Given I have the "Org Designer" role
And I have the "org-chart.edit.quick" permission
And the workspace has "allowQuickChanges" enabled
When I click on the "Accountabilities" text field in role details
And I type "Design user interfaces"
And I click outside the field
Then the change is automatically saved
And I see a success notification
And the role item is updated in the database
```

---

### Scenario 2: Quick Edit - Permission Denied

```
Given I do NOT have the "Org Designer" role
When I click on a circle or role field
Then the field remains read-only
And I see a tooltip: "Quick edits require Org Designer role"
```

---

### Scenario 3: Quick Edit - Setting Disabled

```
Given I have the "Org Designer" role
And the workspace has "allowQuickChanges" disabled
When I click on a circle or role field
Then the field remains read-only
And I see a tooltip: "Quick edits disabled. Use 'Edit circle' or 'Edit role' to create a proposal."
```

---

### Scenario 4: Create Proposal - Circle Edit

```
Given I am a workspace member
When I click "Edit circle" button
And I modify the circle name to "Engineering Circle"
And I add a domain: "Manage technical infrastructure"
And I click "Save as proposal"
Then a proposal is created with status "draft"
And the proposal contains my changes as "evolutions"
And I can add a description and attachments
```

---

### Scenario 5: Submit Proposal to Governance Meeting

```
Given I have a proposal in "draft" status
When I click "Bring to meeting"
And I select a governance meeting
Then the proposal status changes to "submitted"
And the proposal appears in the meeting agenda
```

---

### Scenario 6: Process Proposal in Governance Meeting

```
Given a governance meeting is in session
And a proposal is on the agenda
And I am the recorder (or assigned recorder)
When I process the proposal using IDM process
And the proposal is approved
Then the proposal status changes to "approved"
And the circle changes are automatically applied
And version history is captured
```

---

### Scenario 7: Workspace Admin Toggle Quick Changes

```
Given I am a workspace admin
When I navigate to workspace settings
And I toggle "Allow quick changes" to enabled
Then Org Designers can use quick edit mode
And I see a confirmation: "Quick edits enabled for Org Designers"
```

---

## Technical Decisions Needed

### 1. Proposal Storage

**Decision**: Create `circleProposals` table  
**Fields**:

- `workspaceId: v.id('workspaces')`
- `circleId: v.optional(v.id('circles'))` (optional - can be for role too)
- `entityType: v.union(v.literal('circle'), v.literal('role'))`
- `entityId: v.string()` (circle or role ID)
- `status: v.union(v.literal('draft'), v.literal('submitted'), v.literal('in-meeting'), v.literal('objections'), v.literal('integrated'), v.literal('approved'), v.literal('rejected'), v.literal('amended'))`
- `description: v.string()` (proposal justification)
- `createdBy: v.id('users')`
- `createdAt: v.number()`
- `meetingId: v.optional(v.id('meetings'))` (link to governance meeting)
- `versionHistoryEntryId: v.optional(v.id('orgVersionHistory'))` (link to version history - see Resolved Decision #1)

**Related Tables**:

- `proposalAttachments` (see Resolved Decision #3)
- `proposalObjections` (see Resolved Decision #5)

**Rationale**: Separate table allows proposals to exist independently, link to meetings, track status workflow. References version history for evolutions (no duplication).

---

### 2. Settings Location

**Decision**: Add `allowQuickChanges` to `workspaceOrgSettings` table  
**Rationale**: Already exists for org chart settings (`requireCircleLeadRole`, `coreRoleTemplateIds`). Consistent location.

---

### 3. RBAC Role & Permission

**Decision**:

- ✅ Create `Org Designer` role (system role) - **COMPLETED**
- Create `org-chart.edit.quick` permission
- Assign permission to `Org Designer` role

**Rationale**:

- Permission name `org-chart.edit.quick` covers both circles AND roles (unified permission)
- Single permission simplifies RBAC management
- Follows existing RBAC pattern

---

### 4. Analytics Storage

**Decision**: Use existing `orgVersionHistory` + new proposal metrics queries  
**Rationale**: Version history already tracks changes. Add proposal-specific queries for engagement metrics.

---

## Resolved Decisions

### 1. Proposal Evolutions Format ✅

**Decision**: Reference `orgVersionHistory` entries, not JSON snapshots

**Rationale**:

- Single source of truth (no data duplication)
- Full audit trail: see who proposed what, when, and why
- Automatic linking: proposals link to version history entries
- Efficient: no redundant data storage
- Traceability: version history shows proposal context

**Implementation**:

- Store `proposalId` in `orgVersionHistory` entries when proposal created
- Query version history filtered by `proposalId` to see proposal context
- When proposal approved, link version history entry to approved change

---

### 2. Recorder Assignment ✅

**Decision**: Use existing `recorderId` field in `meetings` table

**Rationale**:

- Field already exists (`meetings.recorderId`)
- Default: Circle Lead role holder
- Override: Meeting creator or circle lead can assign any circle member
- UI: Display as "Recorder" for governance meetings

**Implementation**:

- Default `recorderId` to Circle Lead role holder when meeting created
- Allow override in meeting creation/edit UI
- Track in `meetings.recorderId` (already in schema)

---

### 3. Proposal Attachments ✅

**Decision**: Use Convex file storage (`_storage` table) with junction table

**Rationale**:

- Convex has built-in `_storage` table (production-ready, scalable)
- Already used in codebase (`imageFileId: v.id('_storage')` in inbox items)
- Junction table allows better querying and metadata

**Implementation**:

- Create `proposalAttachments` table:
  - `proposalId: v.id('circleProposals')`
  - `fileId: v.id('_storage')`
  - `fileName: v.string()`
  - `fileType: v.string()`
  - `uploadedBy: v.id('users')`
  - `uploadedAt: v.number()`

---

### 4. Quick Edit Conflict Resolution ✅

**Decision**: Last write wins (standard pattern, Convex handles automatically)

**Rationale**:

- Standard pattern for concurrent edits in databases
- Convex's optimistic updates handle this automatically
- Simple and predictable behavior

**Implementation**:

- Convex handles conflicts automatically (last save wins)
- Optional: Show notification if someone else edited while user was editing
- Consider: Add `updatedAt` timestamp check to detect conflicts (warn user, don't block)

---

### 5. Proposal Approval Workflow ✅

**Decision**: Integrative Decision Making (IDM) process with objection handling

**Process**:

1. Present proposal
2. Clarifying questions round
3. Reaction round (quick reactions, no discussion)
4. **Objection round**: Each member presses "Objection" or "No Objection"
5. **Process objections**: Recorder validates objections, facilitates integration
6. **Approval**: Only when no valid objections remain (or all integrated)

**Implementation**:

- Create `proposalObjections` table:
  - `proposalId: v.id('circleProposals')`
  - `userId: v.id('users')`
  - `objectionText: v.string()`
  - `isValid: v.boolean()` (recorder validates)
  - `integrated: v.boolean()` (has been integrated into proposal)
  - `createdAt: v.number()`
- Meeting UI: "Objection" / "No Objection" buttons for each member
- Recorder manages: Validates objections, facilitates integration
- Status flow: `draft` → `submitted` → `in-meeting` → `objections` → `integrated` → `approved` / `rejected`

---

### 6. Circle Operating Mode Impact ✅

**Decision**: RBAC adapts based on circle type + user's roles in that circle

**Rationale**:

- Every permission check considers circle type + user's roles in that circle
- Configurable in workspace settings (Org Designer + Workspace Super Admin)
- If circle type doesn't allow proposals → block proposal creation
- Operating modes configurable per circle or workspace defaults

**Implementation**:

- Add `circleType` field to circles (see `organizational-operating-modes.md`)
- RBAC checks: `canEditInCircle(user, circle, permission)` considers `circle.circleType`
- Workspace settings: Default operating modes, proposal rules per circle type
- Configurable by: Org Designer role + Workspace Super Admin

---

### 7. Decision Model Integration ✅

**Decision**: Proposal approval follows circle's decision model (configured in workspace settings)

**Rationale**:

- Different circles need different decision processes
- Configured in workspace settings
- Proposal workflow adapts to circle's `decisionModel` field

**Implementation**:

- Circle has `decisionModel` field (see `organizational-operating-modes.md`)
- Proposal approval workflow adapts:
  - `manager_decides`: Manager role approves
  - `team_consensus`: All members must agree
  - `consent`: No valid objections (IDM process)
  - `coordination_only`: Must be approved in member's home circle
- Configured in workspace settings (Org Designer + Workspace Super Admin)

---

## Next Steps

1. ✅ Create BDD specification (this document)
2. ✅ Create `Org Designer` RBAC role
3. ✅ Resolve open questions (see Resolved Decisions above)
4. ⬜ Create `org-chart.edit.quick` permission
5. ⬜ Assign permission to `Org Designer` role
6. ⬜ Design proposal schema (`circleProposals`, `proposalAttachments`, `proposalObjections` tables`)
7. ⬜ Design IDM objection workflow (`proposalObjections` table)
8. ⬜ Design quick edit UI/UX flow (with conflict detection)
9. ⬜ Design proposal → governance meeting integration (recorder assignment, objection UI)
10. ⬜ Design RBAC adaptation logic (circle type + role context)
11. ⬜ Design analytics/metrics queries

---

## References

- Governance template: `convex/meetingTemplates.ts` (lines 505-541)
- Workspace org settings: `convex/schema.ts` (lines 724-734)
- RBAC system: `convex/schema.ts` (lines 1128-1227)
- Circle items schema: `convex/schema.ts` (lines 233-271)
- Holacracy/IDM: Research patterns for proposal processing
- Organizational operating modes: `ai-docs/tasks/organizational-operating-modes.md` (how circle types affect quick edits and proposals)
