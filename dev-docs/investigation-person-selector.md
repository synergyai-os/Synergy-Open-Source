# Investigation: PersonSelector Component Architecture & API Design

**Ticket**: SYOS-1029  
**Date**: 2025-12-20  
**Status**: Investigation Complete — Ready for Human Review  
**Delete after implementation**

---

## 1. Executive Summary

This document defines the architecture for a unified `PersonSelector` component that replaces `AssignUserDialog` and provides consistent person selection across the application. The design supports six distinct modes for different use cases while maintaining a single component API.

**Key Design Decisions:**

1. **Unified Component** — One component with mode-based behavior (not multiple components)
2. **Composable Pattern** — `usePersonSelector.svelte.ts` manages state/filtering
3. **TagSelector-Inspired UX** — Combobox with inline "Add New" flow and color/badge indicators
4. **Person-Centric Data** — All options derive from `people` table, with role-filler mode showing role context

---

## 2. API Design

### 2.1 Props Interface

```typescript
type PersonSelectorMode =
  | 'workspace-all'      // All workspace members (default)
  | 'circle-members'     // Only members of specific circle
  | 'circle-aware'       // All workspace, but show circle badges
  | 'role-fillers'       // Show roles with their fillers (for role-based assignment)
  | 'task-assignee'      // Person-only, no placeholders (tasks, docs, proposals)
  | 'document-owner';    // Same as task-assignee (semantic alias)

type PersonSelectorProps = {
  // Required
  mode: PersonSelectorMode;
  workspaceId: Id<'workspaces'>;
  sessionId: string;

  // Mode-specific (required for certain modes)
  circleId?: Id<'circles'>;        // Required for: circle-members, circle-aware, role-fillers

  // Selection
  selectedPersonIds: Id<'people'>[]; // Bindable - current selection
  onSelect: (personIds: Id<'people'>[]) => void;
  
  // Optional behavior
  multiple?: boolean;               // Allow multiple selection (default: false)
  excludePersonIds?: Id<'people'>[]; // Exclude these from options (e.g., already assigned)
  allowCreate?: boolean;            // Show "Add New" option (default: true)
  placeholder?: string;             // Input placeholder text
  
  // Optional refs
  inputRef?: HTMLElement | null;    // Bindable - for keyboard focus management
  open?: boolean;                   // Bindable - combobox open state
};
```

### 2.2 Component Location

```
src/lib/components/organisms/PersonSelector.svelte    # Component
src/lib/composables/usePersonSelector.svelte.ts       # State management
```

**Rationale**: `organisms/` because it composes Combobox (atom), Avatar (atom), Badge (atom), Text (atom), and manages complex state. Composable is shared because it may be used by multiple modules (org-chart, meetings, tasks, proposals).

---

## 3. Mode Behavior Matrix

| Mode | Data Source | Placeholders | Invited | Badge Display | Typical Use |
|------|------------|--------------|---------|---------------|-------------|
| `workspace-all` | `listPeopleInWorkspace` (all statuses) | ✅ Show | ✅ Show | Status-based (`placeholder`, `invited`) | General workspace member selection |
| `circle-members` | `getCircleMembers` | ✅ Show | ✅ Show | Status-based | Circle-specific assignment |
| `circle-aware` | `listPeopleInWorkspace` + circle check | ✅ Show | ✅ Show | `circle-member` vs `workspace-member` + status | Assign to role, show circle context |
| `role-fillers` | `listRolesByCircle` → expand fillers | ✅ Show | ✅ Show | Role name as context | "Assign same role as X" patterns |
| `task-assignee` | `listPeopleInWorkspace` (invited+active only) | ❌ Hide | ✅ Show | Status-based | Task/proposal assignment |
| `document-owner` | Same as task-assignee | ❌ Hide | ✅ Show | Status-based | Document ownership |

**Never show**: `archived` people (filtered out at composable level)

---

## 4. State Management (Composable)

### 4.1 Composable Interface

```typescript
// src/lib/composables/usePersonSelector.svelte.ts

export type PersonSelectorOption = {
  id: string;                        // Unique key for {#each}
  personId: Id<'people'>;
  roleId?: Id<'circleRoles'>;        // Only in role-fillers mode
  displayName: string;
  searchableText: string;            // For filtering (name + email + role)
  avatarName?: string;               // For Avatar component
  email?: string;                    // For subtitle display
  badge?: PersonBadgeType;
  status: 'placeholder' | 'invited' | 'active';
};

export type PersonBadgeType =
  | 'circle-member'      // Person is member of the target circle
  | 'workspace-member'   // Person in workspace but not target circle
  | 'placeholder'        // Status = placeholder
  | 'invited';           // Status = invited (pending acceptance)

export function usePersonSelector(config: {
  mode: () => PersonSelectorMode;
  workspaceId: () => Id<'workspaces'>;
  sessionId: () => string;
  circleId?: () => Id<'circles'> | undefined;
  excludePersonIds?: () => Id<'people'>[];
}) {
  // Internal state
  const state = $state({
    searchValue: '',
    isLoading: true,
    error: null as string | null
  });

  // Query hooks based on mode
  // ... reactive queries using useQuery

  // Computed: filtered options based on search
  const filteredOptions = $derived.by(() => {
    // Filter logic based on searchValue
  });

  // Computed: can create new (based on search match)
  const canCreateNew = $derived.by(() => {
    // Check if search doesn't match existing
  });

  return {
    get options() { return filteredOptions; },
    get searchValue() { return state.searchValue; },
    set searchValue(v: string) { state.searchValue = v; },
    get isLoading() { return state.isLoading; },
    get canCreateNew() { return canCreateNew; },
    // Actions
    clearSearch: () => { state.searchValue = ''; }
  };
}
```

### 4.2 Query Strategy by Mode

| Mode | Primary Query | Secondary Query |
|------|--------------|-----------------|
| `workspace-all` | `api.core.workspaces.index.listMembers` | — |
| `circle-members` | `api.core.circles.index.getMembers` | — |
| `circle-aware` | `api.core.workspaces.index.listMembers` | `api.core.circles.index.getMembers` (for badge logic) |
| `role-fillers` | `api.core.roles.index.listByCircle` + `getRoleFillers` per role | — |
| `task-assignee` | `api.core.workspaces.index.listMembers` (filter invited+active) | — |
| `document-owner` | Same as task-assignee | — |

---

## 5. Role Display Pattern (role-fillers mode)

When `mode='role-fillers'`, the component shows roles with their current fillers expanded:

```
Facilitator (Randy Smith)       ← roleId + personId
Facilitator (Alice Chen)        ← same roleId, different personId
Facilitator (Bob Jones)         ← same roleId, different personId
Secretary                       ← Empty role, no "(Empty)" label needed
Dev Lead (Sarah Park)           ← Single filler
```

**Search Behavior:**
- Search "randy" → filters to "Facilitator (Randy Smith)"
- Search "facilitator" → shows all Facilitator entries
- Search "secretary" → shows "Secretary" (unfilled)

**Data Structure for Role-Filler Options:**

```typescript
// For filled role
{
  id: `${roleId}-${personId}`,     // Unique composite key
  personId: personId,
  roleId: roleId,
  displayName: `${roleName} (${personName})`,
  searchableText: `${roleName} ${personName} ${personEmail}`,
  avatarName: personName,
  email: personEmail,
  badge: 'circle-member',           // Fillers are always circle members
  status: 'active'
}

// For unfilled role
{
  id: `${roleId}-unfilled`,
  personId: undefined,              // No person assigned
  roleId: roleId,
  displayName: roleName,
  searchableText: roleName,
  avatarName: undefined,
  email: undefined,
  badge: undefined,
  status: undefined
}
```

---

## 6. Badge Display Logic

### 6.1 Badge Types and Styling

Uses `Badge` component (`$lib/components/atoms/Badge.svelte`) with `variant` prop:

| Badge | Variant | Color | When Shown |
|-------|---------|-------|------------|
| `circle-member` | `success` | green | Person is member of target circle (circle-aware mode) |
| `workspace-member` | `default` | neutral | Person in workspace but not target circle |
| `placeholder` | `warning` | orange | `status === 'placeholder'` |
| `invited` | `primary` | blue | `status === 'invited'` |

```svelte
<!-- Usage example -->
<Badge variant={badge.variant}>{badge.label}</Badge>
```

### 6.2 Badge Priority

When multiple badges could apply, show in priority order:
1. **Status badges** (`placeholder`, `invited`) — Always shown first
2. **Membership badges** (`circle-member`, `workspace-member`) — Only if no status badge

**Example combinations:**
- Invited circle member → Shows `invited` badge (status takes priority)
- Active circle member → Shows `circle-member` badge
- Active workspace member (not in circle) → Shows `workspace-member` badge
- Placeholder → Shows `placeholder` badge (regardless of circle membership)

### 6.3 Badge Display by Mode

| Mode | Show Status Badges | Show Membership Badges |
|------|-------------------|----------------------|
| `workspace-all` | ✅ | ❌ (no circle context) |
| `circle-members` | ✅ | ❌ (all are circle members) |
| `circle-aware` | ✅ | ✅ |
| `role-fillers` | ✅ | ❌ (all are circle members) |
| `task-assignee` | ✅ (`invited` only, no placeholders) | ❌ |
| `document-owner` | ✅ (`invited` only, no placeholders) | ❌ |

---

## 7. "Add New" Flow

### 7.1 Trigger Condition

Show "Add New" option when:
1. `allowCreate !== false`
2. Search value has content
3. Search doesn't exactly match existing person's displayName or email

### 7.2 StandardDialog Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Add "[SearchValue]"                                         │
│                                                             │
│ Choose how to add this person:                              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📧  Create Placeholder                                  │ │
│ │     Name-only entry for planning. Can be converted      │ │
│ │     to a real user later.                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✉️  Send Invitation                                     │ │
│ │     Requires email address. Person will receive         │ │
│ │     invite to join workspace.                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                            [Cancel]         │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Dialog State Machine

```
[Search has value + no match]
        ↓
[User clicks "Add New"]
        ↓
   ┌─────────────────┐
   │ Choice Dialog   │──→ [Cancel] → Close
   └────────┬────────┘
            │
   ┌────────┴────────┐
   ↓                 ↓
[Placeholder]    [Invite]
   ↓                 ↓
Create via       Show email
mutation →       input step
select &         ↓
close         [Has email?]
              ┌──────┴──────┐
              ↓             ↓
         [Duplicate]    [New email]
              ↓             ↓
         Show error     Create via
         message        invitePerson
                        mutation →
                        select &
                        close
```

### 7.4 Mode Restrictions

| Mode | Placeholder Allowed | Invite Allowed |
|------|---------------------|----------------|
| `workspace-all` | ✅ | ✅ |
| `circle-members` | ✅ | ✅ |
| `circle-aware` | ✅ | ✅ |
| `role-fillers` | ✅ | ✅ |
| `task-assignee` | ❌ | ✅ |
| `document-owner` | ❌ | ✅ |

---

## 8. Data Structures

### 8.1 TypeScript Interfaces

```typescript
// src/lib/types/person-selector.ts

import type { Id } from '$lib/convex';

export type PersonSelectorMode =
  | 'workspace-all'
  | 'circle-members'
  | 'circle-aware'
  | 'role-fillers'
  | 'task-assignee'
  | 'document-owner';

/**
 * Badge type for person selector options.
 * Maps to Badge component variants (see design-system.md):
 * - 'circle-member'     → variant="success"
 * - 'workspace-member'  → variant="default"
 * - 'placeholder'       → variant="warning"
 * - 'invited'           → variant="primary"
 */
export type PersonBadgeType =
  | 'circle-member'
  | 'workspace-member'
  | 'placeholder'
  | 'invited';

export type PersonStatus = 'placeholder' | 'invited' | 'active';

export type PersonSelectorOption = {
  /** Unique key for rendering (personId or roleId-personId composite) */
  id: string;
  
  /** Person ID (required for selection, undefined for unfilled roles) */
  personId?: Id<'people'>;
  
  /** Role ID (only in role-fillers mode) */
  roleId?: Id<'circleRoles'>;
  
  /** Display text shown in dropdown */
  displayName: string;
  
  /** Text used for search/filter matching */
  searchableText: string;
  
  /** Name for Avatar component */
  avatarName?: string;
  
  /** Email for subtitle (optional) */
  email?: string;
  
  /** Badge type to display */
  badge?: PersonBadgeType;
  
  /** Person status (for filtering and display) */
  status?: PersonStatus;
};

export type PersonSelectorConfig = {
  mode: PersonSelectorMode;
  workspaceId: Id<'workspaces'>;
  sessionId: string;
  circleId?: Id<'circles'>;
  excludePersonIds?: Id<'people'>[];
  allowPlaceholders?: boolean;
};
```

### 8.2 Mapping Functions

```typescript
// Transform workspace member to option
function mapMemberToOption(
  member: WorkspaceMember,
  config: { circlePersonIds?: Set<Id<'people'>> }
): PersonSelectorOption {
  const isCircleMember = config.circlePersonIds?.has(member.personId);
  
  // Determine badge variant (matches Badge component variants: success, default, warning, primary)
  let badge: PersonBadgeType | undefined;
  if (member.status === 'placeholder') badge = 'placeholder';
  else if (member.status === 'invited') badge = 'invited';
  else if (config.circlePersonIds) {
    badge = isCircleMember ? 'circle-member' : 'workspace-member';
  }
  
  return {
    id: member.personId,
    personId: member.personId,
    displayName: member.displayName || member.email || 'Unknown',
    searchableText: `${member.displayName ?? ''} ${member.email ?? ''}`.trim(),
    avatarName: member.displayName,
    email: member.email,
    badge,
    status: member.status
  };
}

// Transform role with fillers to options
function mapRoleToOptions(
  role: RoleWithFillers,
  fillers: RoleFiller[]
): PersonSelectorOption[] {
  if (fillers.length === 0) {
    // Unfilled role
    return [{
      id: `${role.roleId}-unfilled`,
      roleId: role.roleId,
      displayName: role.name,
      searchableText: role.name,
      status: undefined
    }];
  }
  
  // Role with fillers - expand to one option per filler
  return fillers.map(filler => ({
    id: `${role.roleId}-${filler.personId}`,
    personId: filler.personId,
    roleId: role.roleId,
    displayName: `${role.name} (${filler.displayName})`,
    searchableText: `${role.name} ${filler.displayName} ${filler.email ?? ''}`,
    avatarName: filler.displayName,
    email: filler.email,
    badge: 'circle-member' as const,
    status: filler.status
  }));
}
```

---

## 9. Comparison with TagSelector

| Aspect | TagSelector | PersonSelector |
|--------|-------------|----------------|
| **Data source** | `availableTags` prop (client-provided) | Internal queries based on mode |
| **Create flow** | Inline color picker | StandardDialog with Placeholder/Invite choice |
| **Selection** | Multi-select always | Configurable (single/multi) |
| **Optimistic updates** | Yes (optimisticTags state) | Yes (same pattern) |
| **Badge display** | Color dot | Status/membership badges |
| **Hierarchy** | Parent/child groups | Flat (roles mode shows role context differently) |
| **State pattern** | Internal state + external bindable | Composable pattern |

**What to Reuse from TagSelector:**
1. ✅ Combobox open state sync pattern (internal + external)
2. ✅ Auto-focus input on open pattern
3. ✅ Keyboard navigation (Enter to create)
4. ✅ "Create new" option at bottom of list
5. ✅ Optimistic update pattern for new items

**What to Change:**
1. ❌ Color picker → StandardDialog choice flow
2. ❌ Hierarchical grouping → Flat list with badges
3. ❌ Client-provided options → Composable with internal queries
4. ❌ Multi-select only → Configurable single/multi

---

## 10. Migration Plan from AssignUserDialog

### Phase 1: Create New Components
1. Create `usePersonSelector.svelte.ts` composable
2. Create `PersonSelector.svelte` component
3. Create `PersonSelectorOption.svelte` (internal) for list item rendering
4. Add types to `src/lib/types/person-selector.ts`

### Phase 2: Feature Parity
1. Implement `workspace-all` mode (covers current AssignUserDialog functionality)
2. Test with role assignment flow
3. Test with circle member addition flow

### Phase 3: Replace Usages
1. Update `RoleDetailPanel.svelte` to use PersonSelector
2. Update `CircleOverviewTab.svelte` to use PersonSelector
3. Remove AssignUserDialog component

### Phase 4: Extended Modes
1. Implement `circle-members` mode
2. Implement `circle-aware` mode
3. Implement `role-fillers` mode
4. Implement `task-assignee` mode

---

## 11. Open Questions

### For Human Review

1. **Unfilled Role Selection** — In `role-fillers` mode, when user selects an unfilled role, what should happen?
   - Option A: Open "Assign to Role" flow (new dialog)
   - Option B: Return roleId only, let parent handle
   - **Recommendation**: Option B (keep component focused on selection)

2. **Multiple Roles Display** — If same person fills multiple roles, should they appear:
   - Option A: Once with combined role names
   - Option B: Once per role (multiple entries)
   - **Recommendation**: Option B (matches Linear pattern, simpler filtering)

3. **Circle Badge in task-assignee Mode** — Should we show circle context even though we don't allow placeholders?
   - **Recommendation**: No — keep task-assignee simple (person only)

4. **Email Validation** — For "Send Invite" flow, how strict should email validation be?
   - **Recommendation**: Basic format validation + duplicate check, WorkOS handles real validation

5. **"Add New" Permission** — Should we check `canInvitePeople` before showing the option?
   - **Recommendation**: Yes — hide "Add New" if user lacks invite permission

---

## 12. Implementation Tickets

Based on this investigation, create the following tickets:

| Ticket | Description | Estimate |
|--------|-------------|----------|
| SYOS-1030 | Create `usePersonSelector.svelte.ts` composable with workspace-all mode | 3 points |
| SYOS-1031 | Create `PersonSelector.svelte` component with basic UI | 3 points |
| SYOS-1032 | Implement "Add New" flow with StandardDialog | 2 points |
| SYOS-1033 | Add `circle-members` and `circle-aware` modes | 2 points |
| SYOS-1034 | Add `role-fillers` mode with expanded display | 3 points |
| SYOS-1035 | Migrate AssignUserDialog usages to PersonSelector | 2 points |

---

## 13. Appendix: Existing API Reference

### People Queries (convex/core/people/queries.ts)

| Function | Returns | Notes |
|----------|---------|-------|
| `listPeopleInWorkspace(ctx, workspaceId, { status? })` | `PersonDoc[]` | Can filter by status |
| `getPersonById(ctx, personId)` | `PersonDoc` | Throws if not found |

### Workspace Queries (convex/core/workspaces/members.ts)

| Function | Returns | Notes |
|----------|---------|-------|
| `listMembers` | `WorkspaceMemberSummary[]` | Includes personId, userId, email, name, role, joinedAt |

### Circle Queries (convex/core/circles/queries.ts)

| Function | Returns | Notes |
|----------|---------|-------|
| `getMembers` | Circle members with person info | Via `getCircleMembers` |

### Role Queries (convex/core/roles/queries.ts)

| Function | Returns | Notes |
|----------|---------|-------|
| `listByCircle` | Roles with filler counts | |
| `getRoleFillers` | Filler details | personId, displayName, email, assignedAt |

---

**END OF INVESTIGATION**

*Delete this file after SYOS-1029 implementation is complete.*

