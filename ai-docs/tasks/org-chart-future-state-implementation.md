# Org Chart Future State Implementation Plan

**Goal**: Achieve complete future state with version history, soft deletes, core roles, scope field, circle items, and full traceability.

**Status**: ⏳ In Progress  
**Last Updated**: 2025-12-01
**Linear Ticket**: [SYOS-613](https://linear.app/younghumanclub/issue/SYOS-613)

---

## Overview

This plan addresses critical gaps identified in the essentials document to achieve the complete future state. The essentials document describes **what** we want to achieve - this plan describes **how** to implement it.

**Key Decisions Resolved**:

- ✅ Schema validated for query performance (index coverage checklist added)
- ✅ Restoration validation rules documented (edge cases covered)
- ✅ Root circle created on workspace creation, can rename but not archive/delete
- ✅ Circle items are customizable categories with draggable DB items
- ✅ Version history uses discriminated unions (type-safe, no `v.any()`)
- ✅ System templates use `v.union(v.id('workspaces'), v.null())` for nullable IDs
- ✅ Cascade: Circle archived → roles archived → assignments archived
- ✅ List queries exclude archived by default

---

## Phase 0: Root Circle & Workspace Setup

**Goal**: Ensure every workspace has a root circle and default setup on creation.

### 0.1 Root Circle Creation

- [ ] Update workspace creation mutation to auto-create root circle
- [ ] Root circle properties: `name: "General Circle"`, `parentCircleId: null`
- [ ] Add protection: Root circle cannot be archived or deleted
- [ ] Add validation: Only one circle per workspace can have `parentCircleId = null`

### 0.2 Default Category Setup

- [ ] Create default circle item categories on workspace creation
- [ ] Default categories for circles: Purpose, Domains, Accountabilities, Policies, Decision Rights, Notes
- [ ] Default categories for roles: Purpose, Domains, Accountabilities

---

## Phase 1: Schema Foundation (Critical - Must Do First)

### 1.1 Soft Delete Implementation

**Goal**: Add soft delete support to all org chart entities to enable version history.

#### Schema Changes Required

**`circleRoles` table**:

- [ ] Add `archivedAt: v.optional(v.number())` - Soft delete timestamp
- [ ] Add `archivedBy: v.optional(v.id('users'))` - Who archived it
- [ ] Add `updatedAt: v.number()` - Last modification timestamp
- [ ] Add `updatedBy: v.optional(v.id('users'))` - Who last modified
- [ ] Add index: `by_circle_archived` on `['circleId', 'archivedAt']` for efficient filtering

**`userCircleRoles` table**:

- [ ] Add `archivedAt: v.optional(v.number())` - Soft delete timestamp (when user removed from role)
- [ ] Add `archivedBy: v.optional(v.id('users'))` - Who removed the assignment
- [ ] Add `updatedAt: v.number()` - Last modification timestamp
- [ ] Add `updatedBy: v.optional(v.id('users'))` - Who last modified
- [ ] Add index: `by_role_archived` on `['circleRoleId', 'archivedAt']` for efficient filtering
- [ ] Add index: `by_user_archived` on `['userId', 'archivedAt']` for user history queries

**`circleMembers` table**:

- [ ] Add `archivedAt: v.optional(v.number())` - Soft delete timestamp (when user leaves circle)
- [ ] Add `archivedBy: v.optional(v.id('users'))` - Who removed the member
- [ ] Add `addedBy: v.optional(v.id('users'))` - Who added the member (complement to `joinedAt`)
- [ ] Add index: `by_circle_archived` on `['circleId', 'archivedAt']` for efficient filtering

**`circles` table** (verify existing):

- [ ] Verify `archivedAt: v.optional(v.number())` exists
- [ ] Add `archivedBy: v.optional(v.id('users'))` if missing
- [ ] Add `updatedAt: v.number()` if missing
- [ ] Add `updatedBy: v.optional(v.id('users'))` if missing
- [ ] **Add index: `by_workspace_archived` on `['workspaceId', 'archivedAt']`** ← CRITICAL for performance

#### Query Patterns

- [ ] Document query pattern: `.withIndex('by_x_archived', q => q.eq('x', val).eq('archivedAt', undefined))`
- [ ] Create helper functions: `getActiveRoles()`, `getArchivedRoles()`, etc.

#### Index Coverage Validation Checklist

Verify these common queries have efficient index paths:

| Query                                            | Index                           | Performance         |
| ------------------------------------------------ | ------------------------------- | ------------------- |
| Get all active circles in workspace              | `by_workspace_archived`         | ✅ O(n active)      |
| Get all active roles in circle                   | `by_circle_archived`            | ✅ O(n roles)       |
| Get all active roles in workspace (cross-circle) | ❓ Need to check                | See note below      |
| Get user's active roles (all workspaces)         | `by_user_archived`              | ✅ O(n assignments) |
| Get version history for entity                   | `by_entity`                     | ✅ O(n changes)     |
| Get workspace timeline (date range)              | `by_workspace` + changedAt      | ✅ O(n in range)    |
| Get all changes by user in workspace             | `by_user` then filter workspace | ⚠️ Filter in code   |

**Note on "Get all active roles in workspace"**:

- This is a cross-circle query (roles belong to circles, not directly to workspaces)
- Two approaches:
  1. **Denormalize**: Add `workspaceId` to `circleRoles` table + index (more storage, faster query)
  2. **Join in code**: Get circles → get roles per circle → flatten (simpler, acceptable for moderate scale)
- **Decision**: Use approach #2 for v1 (simpler, workspace role counts typically <500)

#### Cascade Rules (Decided)

- [x] When circle archived → archive all roles in circle (CONFIRMED)
- [x] When role archived → archive all assignments to that role (CONFIRMED)
- [x] When user removed from workspace → archive all their assignments (CONFIRMED)
- [ ] Implement cascade logic in archive mutations
- [ ] Document cascade logic in schema comments

---

### 1.2 Version History Schema

**Goal**: Complete audit trail of all organizational changes with **type-safe storage** (no `v.any()`).

#### Schema Design

**`orgVersionHistory` table** (new) - Uses discriminated union for type-safe snapshots:

```typescript
defineTable(
  v.union(
    // Circle change
    v.object({
      entityType: v.literal('circle'),
      workspaceId: v.id('workspaces'),
      entityId: v.id('circles'),
      changeType: v.union(v.literal('create'), v.literal('update'), v.literal('archive'), v.literal('restore')),
      changedBy: v.id('users'),
      changedAt: v.number(),
      changeDescription: v.optional(v.string()),
      before: v.optional(v.object({
        name: v.string(),
        slug: v.string(),
        purpose: v.optional(v.string()),
        parentCircleId: v.optional(v.id('circles')), // undefined = root circle
        archivedAt: v.optional(v.number())
      })),
      after: v.optional(v.object({
        name: v.string(),
        slug: v.string(),
        purpose: v.optional(v.string()),
        parentCircleId: v.optional(v.id('circles')), // undefined = root circle
        archivedAt: v.optional(v.number())
      }))
    }),
    // Circle Role change
    v.object({
      entityType: v.literal('circleRole'),
      workspaceId: v.id('workspaces'),
      entityId: v.id('circleRoles'),
      changeType: v.union(v.literal('create'), v.literal('update'), v.literal('archive'), v.literal('restore')),
      changedBy: v.id('users'),
      changedAt: v.number(),
      changeDescription: v.optional(v.string()),
      before: v.optional(v.object({
        circleId: v.id('circles'),
        name: v.string(),
        purpose: v.optional(v.string()),
        templateId: v.optional(v.id('roleTemplates')),
        archivedAt: v.optional(v.number())
      })),
      after: v.optional(v.object({
        circleId: v.id('circles'),
        name: v.string(),
        purpose: v.optional(v.string()),
        templateId: v.optional(v.id('roleTemplates')),
        archivedAt: v.optional(v.number())
      }))
    }),
    // User Circle Role (assignment) change
    v.object({
      entityType: v.literal('userCircleRole'),
      workspaceId: v.id('workspaces'),
      entityId: v.id('userCircleRoles'),
      changeType: v.union(v.literal('create'), v.literal('update'), v.literal('archive'), v.literal('restore')),
      changedBy: v.id('users'),
      changedAt: v.number(),
      changeDescription: v.optional(v.string()),
      before: v.optional(v.object({
        userId: v.id('users'),
        circleRoleId: v.id('circleRoles'),
        scope: v.optional(v.string()),
        archivedAt: v.optional(v.number())
      })),
      after: v.optional(v.object({
        userId: v.id('users'),
        circleRoleId: v.id('circleRoles'),
        scope: v.optional(v.string()),
        archivedAt: v.optional(v.number())
      }))
    }),
    // Circle Member change
    v.object({
      entityType: v.literal('circleMember'),
      workspaceId: v.id('workspaces'),
      entityId: v.id('circleMembers'),
      changeType: v.union(v.literal('create'), v.literal('update'), v.literal('archive'), v.literal('restore')),
      changedBy: v.id('users'),
      changedAt: v.number(),
      changeDescription: v.optional(v.string()),
      before: v.optional(v.object({
        circleId: v.id('circles'),
        userId: v.id('users'),
        archivedAt: v.optional(v.number())
      })),
      after: v.optional(v.object({
        circleId: v.id('circles'),
        userId: v.id('users'),
        archivedAt: v.optional(v.number())
      }))
    }),
    // Circle Item change
    v.object({
      entityType: v.literal('circleItem'),
      workspaceId: v.id('workspaces'),
      entityId: v.id('circleItems'),
      changeType: v.union(v.literal('create'), v.literal('update'), v.literal('archive'), v.literal('restore')),
      changedBy: v.id('users'),
      changedAt: v.number(),
      changeDescription: v.optional(v.string()),
      before: v.optional(v.object({
        categoryId: v.id('circleItemCategories'),
        content: v.string(),
        order: v.number()
      })),
      after: v.optional(v.object({
        categoryId: v.id('circleItemCategories'),
        content: v.string(),
        order: v.number()
      }))
    })
  )
)
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_workspace', ['workspaceId', 'changedAt'])
  .index('by_user', ['changedBy', 'changedAt'])
```

**Why discriminated unions?** TypeScript knows exactly what shape `before`/`after` have based on `entityType`. No `v.any()` needed.

#### Change Capture Strategy

**Decision**: Application-level capture using Convex triggers pattern (from `convex-helpers`)

- [ ] Install `convex-helpers` for trigger support
- [ ] Create `triggers.register()` for each org chart table
- [ ] Trigger captures `change.oldDoc`, `change.newDoc`, `change.operation`
- [ ] Helper: `captureVersionHistory(ctx, entityType, change, workspaceId)`

**Retention**: Keep forever initially (add configurable retention later)

---

### 1.3 Role Templates Schema

**Goal**: Support core roles that auto-create in all circles.

#### Schema Design

**`roleTemplates` table** (new):

```typescript
{
  // Use v.optional() for nullable foreign key (codebase pattern)
  workspaceId: v.optional(v.id('workspaces')), // undefined = system-level template
  name: v.string(), // Template name (e.g., "Circle Lead")
  purpose: v.optional(v.string()), // Default purpose text
  isCore: v.boolean(), // Auto-create in all circles?
  isRequired: v.boolean(), // Cannot delete if required?
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id('users'),
  updatedBy: v.optional(v.id('users')),
  archivedAt: v.optional(v.number()),
  archivedBy: v.optional(v.id('users'))
}
```

**Note**: Uses `v.optional()` pattern consistent with codebase (e.g., `parentCircleId` in circles). System templates have `workspaceId` absent/undefined, workspace templates have an ID.

**Indexes**:

- [ ] `by_workspace` on `['workspaceId']` - Get workspace templates (includes null for system)
- [ ] `by_core` on `['workspaceId', 'isCore']` - Get core templates

**Link to Roles**:

- [ ] Add `templateId: v.optional(v.id('roleTemplates'))` to `circleRoles` table
- [ ] Add index: `by_template` on `['templateId']` for template queries

#### Auto-Creation Logic

- [ ] When circle created → create roles from core templates for that workspace
- [ ] Also create roles from system-level core templates (workspaceId = null)
- [ ] Backfill existing circles → migration script to create core roles
- [ ] Document auto-creation triggers

---

### 1.4 Scope Field Implementation

**Goal**: Add member-level scope text to role assignments.

#### Schema Changes

**`userCircleRoles` table**:

- [ ] Add `scope: v.optional(v.string())` - Member-level scope text
  - Type: `v.optional(v.string())` (nullable)
  - Max length: 500 characters (reasonable limit)
  - Validation: Trim whitespace, allow empty string (store as null)

#### UI Integration

- [ ] Display scope in RoleCard when showing members
- [ ] Display scope in RoleMemberItem component
- [ ] Add scope editing UI (inline edit or modal)
- [ ] Document scope display patterns

---

### 1.5 Workspace Settings Schema

**Goal**: Store workspace-level configuration for org chart behavior.

#### Schema Design

**`workspaceOrgSettings` table** (new):

```typescript
{
  workspaceId: v.id('workspaces'),
  requireCircleLeadRole: v.boolean(), // Default: true
  coreRoleTemplateIds: v.array(v.id('roleTemplates')), // Which templates are core
  allowRoleDeletion: v.boolean(), // Default: true (false = only archive)
  versionHistoryRetentionDays: v.optional(v.number()), // null = keep forever
  updatedAt: v.number(),
  updatedBy: v.id('users')
}
```

**Indexes**:

- [ ] `by_workspace` on `['workspaceId']` - Get workspace settings

**Default Values**:

- [ ] Seed default settings on workspace creation
- [ ] Document default values and behavior

---

### 1.6 Circle Items Schema

**Goal**: Customizable content categories for circles and roles with drag/drop ordering.

#### Schema Design

**`circleItemCategories` table** (new) - Category definitions:

```typescript
{
  workspaceId: v.id('workspaces'),
  entityType: v.union(v.literal('circle'), v.literal('role')), // What entity type this category applies to
  name: v.string(), // "Domains", "Accountabilities", etc.
  order: v.number(), // Display order
  isDefault: v.boolean(), // Created automatically with workspace
  createdAt: v.number(),
  updatedAt: v.number(),
  archivedAt: v.optional(v.number()),
  archivedBy: v.optional(v.id('users'))
}
```

**`circleItems` table** (new) - Content items within categories:

```typescript
{
  workspaceId: v.id('workspaces'),
  categoryId: v.id('circleItemCategories'),
  entityType: v.union(v.literal('circle'), v.literal('role')), // Denormalized for queries
  entityId: v.string(), // Circle or Role ID (stored as string for flexibility)
  content: v.string(), // Item text content
  order: v.number(), // Display order within category (drag/drop)
  createdAt: v.number(),
  createdBy: v.id('users'),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id('users')),
  archivedAt: v.optional(v.number()),
  archivedBy: v.optional(v.id('users')),
  // Future: embedding field for AI/RAG vectorization
  // embeddingId: v.optional(v.id('embeddings'))
}
```

**Indexes**:

- [ ] `by_workspace` on `['workspaceId']` - Get all categories for workspace
- [ ] `by_entity_type` on `['workspaceId', 'entityType']` - Get categories by type
- [ ] `by_category` on `['categoryId']` - Get items in category
- [ ] `by_entity` on `['entityType', 'entityId']` - Get items for specific circle/role

**Ordering Strategy** (for drag/drop):

- Use integer ordering (0, 1, 2, 3...)
- On reorder: Update only moved item + items between old and new position
- Conflict resolution: If same order value, sort by `createdAt` (stable secondary sort)
- Renumbering: Batch renumber to 0, 1, 2... if gaps become large (>1000)
- Pagination: Not needed for v1 (categories typically have <50 items)

**Default Categories (created on workspace creation)**:

Circle categories:

- Purpose (order: 0)
- Domains (order: 1)
- Accountabilities (order: 2)
- Policies (order: 3)
- Decision Rights (order: 4)
- Notes (order: 5)

Role categories:

- Purpose (order: 0)
- Domains (order: 1)
- Accountabilities (order: 2)

---

## Phase 2: Business Logic & Validation

### 2.1 Circle Lead Enforcement

**Goal**: Enforce that every circle has a Circle Lead role.

#### Validation Rules

- [ ] On circle creation → auto-create Circle Lead role if `requireCircleLeadRole = true`
- [ ] On Circle Lead role deletion → Block if `isRequired = true` and `requireCircleLeadRole = true`
- [ ] On last Circle Lead assignment removal → Block or warn?
- [ ] Document enforcement logic

#### Edge Cases

- [ ] What if Circle Lead role is archived? → Still counts as existing?
- [ ] What if all Circle Lead assignments are archived? → Block or allow?
- [ ] What if workspace setting changes? → Backfill or only apply to new circles?

---

### 2.2 Soft Delete Cascade Logic

**Goal**: Define how soft deletes cascade through relationships.

#### Cascade Rules (DECIDED)

- [x] **Root Circle**: Cannot be archived or deleted (protected)
- [x] **Circle archived** → Archive all roles in that circle ✅
- [x] **Circle archived** → Keep members active (members can belong to multiple circles)
- [x] **Role archived** → Archive all user assignments to that role ✅
- [x] **Task references**: Tasks keep archived role references (display as "role archived")
- [ ] Implement cascade logic in archive mutations
- [ ] Document cascade behavior in code comments

#### Query Patterns

- [ ] Default: All list queries exclude archived records (`!archivedAt`)
- [ ] Add `includeArchived?: boolean` parameter to queries
- [ ] Active roles query: Filter by `!archivedAt`
- [ ] Create helper functions: `filterActive()`, `filterArchived()`

---

### 2.3 Version History Capture

**Goal**: Automatically capture all changes to org chart entities using Convex triggers.

#### Capture Points

- [ ] Circle mutations: create, update, archive, restore
- [ ] Role mutations: create, update, archive, restore
- [ ] Assignment mutations: create, update (scope changes), archive
- [ ] Member mutations: create (join), archive (leave)
- [ ] Circle Item mutations: create, update, archive, reorder

#### Implementation (using convex-helpers triggers)

```typescript
// convex/orgChartTriggers.ts
import { Triggers } from 'convex-helpers/server/triggers';

const triggers = new Triggers();

triggers.register('circles', async (ctx, change) => {
  await captureVersionHistory(ctx, 'circle', change);
});

triggers.register('circleRoles', async (ctx, change) => {
  await captureVersionHistory(ctx, 'circleRole', change);
});

// ... similar for other tables
```

#### Helper Functions

- [ ] `captureVersionHistory(ctx, entityType, change)` - Insert version history record
- [ ] `getVersionHistory(entityType, entityId, { limit?, cursor? })` - Paginated entity history
- [ ] `getWorkspaceVersionHistory(workspaceId, { limit?, cursor?, startDate?, endDate? })` - Paginated workspace timeline

#### Performance Considerations

- [ ] **Always use `.take(limit)` on history queries** - History tables grow unbounded
- [ ] **Use cursor-based pagination** for large result sets
- [ ] **Index ordering**: `changedAt` as second field enables efficient time-ordered queries

#### Bulk Operations (Future Enhancement)

When archiving a circle with 50 roles, 51 version history entries are created. For better timeline UX:

```typescript
// Optional: Add batchId to link related changes
batchId: v.optional(v.string()), // UUID for grouping (e.g., "archive-circle-abc123")
```

**v1 Decision**: Not required - each change is independent and queryable. Add `batchId` in v2 if timeline UX needs grouping.

---

## Phase 3: Migration Strategy

### Migration Sequencing

**Order matters!** Execute migrations in this sequence:

```
1. Schema changes (add fields, indexes) ──────────────────────────┐
   ↓                                                              │ Can run
2. Query updates (add archived filtering) ────────────────────────┤ together
   ↓                                                              │
3. Mutation updates (soft delete instead of hard delete) ─────────┘
   ↓
4. Version history table creation ────────────────────────────────┐
   ↓                                                              │ After
5. Version history backfill (existing data) ──────────────────────┤ soft delete
   ↓                                                              │ works
6. Enable version history triggers ───────────────────────────────┘
   ↓
7. Role templates + core roles backfill ──────────────────────────── Last
```

**Rollback Strategy**:

- Schema changes: Safe to roll back (fields are optional)
- Query changes: Roll back by removing archived filter
- Triggers: Disable by removing trigger registration
- Backfill: No rollback needed (additive only)

### 3.1 Soft Delete Migration

**Goal**: Migrate existing hard deletes to soft delete system.

#### Migration Steps

- [ ] Add `archivedAt` fields to all tables (nullable, no default)
- [ ] Add `archivedBy` fields to all tables (nullable, no default)
- [ ] Add `updatedAt` fields where missing
- [ ] Add `updatedBy` fields where missing
- [ ] Create indexes for archived queries
- [ ] Update all queries to filter `!archivedAt`
- [ ] Update all mutations to set `archivedAt` instead of deleting
- [ ] Test migration on staging data

---

### 3.2 Version History Backfill

**Goal**: Create initial version history for existing data.

#### Backfill Strategy

- [ ] Create version history records for all existing entities
- [ ] Use `createdAt` as `changedAt` for initial records
- [ ] Use creator or system user as `changedBy`
- [ ] Set `changeType = 'create'` for initial records
- [ ] Document backfill script

**Dependency**: Run AFTER soft delete fields are added (so backfill includes archived state)

---

### 3.3 Core Roles Migration

**Goal**: Mark existing roles as core roles based on templates.

#### Migration Steps

- [ ] Create role templates for common roles (Circle Lead, Facilitator, etc.)
- [ ] Link existing roles to templates where name matches
- [ ] Mark templates as core where appropriate
- [ ] Backfill roles in circles that don't have core roles yet
- [ ] Document migration script

**Dependency**: Run AFTER version history is enabled (so template linking is tracked)

---

## Phase 4: API & Query Updates

### 4.1 Query Functions

**Goal**: Update all queries to respect soft deletes and support version history.

#### Updated Queries

- [ ] `listByCircle` - Filter `!archivedAt` for roles
- [ ] `getRoleFillers` - Filter `!archivedAt` for assignments
- [ ] `getUserRoles` - Filter `!archivedAt` for assignments and roles
- [ ] Add `includeArchived` parameter to queries (default: false)

#### New Queries

- [ ] `getVersionHistory(entityType, entityId)` - Get version history for entity
- [ ] `getWorkspaceVersionHistory(workspaceId, filters?)` - Get workspace history
- [ ] `getArchivedRoles(circleId)` - Get archived roles
- [ ] `getArchivedAssignments(roleId)` - Get archived assignments

---

### 4.2 Mutation Functions

**Goal**: Update mutations to use soft delete and capture version history.

#### Updated Mutations

- [ ] `deleteRole` → `archiveRole` (set `archivedAt` instead of delete)
- [ ] `removeUserFromRole` → `archiveAssignment` (set `archivedAt` instead of delete)
- [ ] `removeMemberFromCircle` → `archiveMembership` (set `archivedAt` instead of delete)
- [ ] Add version history capture to all mutations

#### New Mutations

- [ ] `restoreRole(roleId)` - Un-archive a role
- [ ] `restoreAssignment(assignmentId)` - Un-archive an assignment
- [ ] `restoreCircle(circleId)` - Un-archive a circle (with cascade?)

#### Restoration Validation Rules

**`restoreCircle(circleId)`**:
| Scenario | Action |
|----------|--------|
| Parent circle is archived | ❌ Block with error: "Cannot restore circle while parent circle is archived" |
| Parent circle was deleted (hard) | ❌ Block with error: "Parent circle no longer exists" |
| Circle is root circle | N/A - Root circles cannot be archived |

**`restoreRole(roleId)`**:
| Scenario | Action |
|----------|--------|
| Circle is archived | ❌ Block with error: "Cannot restore role while circle is archived. Restore circle first." |
| Circle was hard-deleted | ❌ Block with error: "Circle no longer exists" |
| Role template no longer exists | ✅ Allow - clear `templateId` reference |

**`restoreAssignment(assignmentId)`**:
| Scenario | Action |
|----------|--------|
| Role is archived | ❌ Block with error: "Cannot restore assignment while role is archived" |
| User no longer in workspace | ❌ Block with error: "User is no longer a workspace member" |
| User already has this role (re-assigned) | ❌ Block with error: "User already has this role assigned" |

**Cascade Restoration** (optional, for v2):

- When restoring a circle, optionally offer to restore its roles
- When restoring a role, optionally offer to restore assignments
- Not required for v1 - manual restoration is acceptable

---

## Phase 5: UI Components

### 5.1 Version History UI

**Goal**: Display version history for org chart entities.

#### Components Needed

- [ ] `VersionHistoryPanel.svelte` - Display version history list
- [ ] `VersionHistoryItem.svelte` - Display single version entry
- [ ] `RestoreVersionButton.svelte` - Restore previous version
- [ ] Add version history to RoleDetailPanel
- [ ] Add version history to CircleDetailPanel

#### Features

- [ ] Show who, when, what changed
- [ ] Highlight changes (before/after diff)
- [ ] Restore button for each version
- [ ] Filter by date range
- [ ] Filter by user

---

### 5.2 Soft Delete UI

**Goal**: Handle archived entities in UI.

#### Components Updates

- [ ] Add "Show archived" toggle to role lists
- [ ] Add "Restore" action to archived items
- [ ] Visual distinction for archived items (opacity, strikethrough?)
- [ ] Archive confirmation dialogs

---

## Phase 6: Testing & Validation

### 6.1 Schema Tests

- [ ] Test soft delete cascade behavior
- [ ] Test version history capture
- [ ] Test role template auto-creation
- [ ] Test Circle Lead enforcement

### 6.2 Integration Tests

- [ ] Test archive/restore workflows
- [ ] Test version history queries
- [ ] Test core role auto-creation
- [ ] Test scope field updates

### 6.3 Performance Tests

- [ ] Test version history queries with large datasets
- [ ] Test soft delete filtering performance
- [ ] Test cascade query performance

---

## Phase 7: Documentation

### 7.1 Update Essentials Document

- [ ] Update essentials.md with final schema details
- [ ] Document query patterns
- [ ] Document cascade rules
- [ ] Document version history structure

### 7.2 Developer Documentation

- [ ] Document soft delete patterns
- [ ] Document version history capture
- [ ] Document restoration workflows
- [ ] Document migration scripts

---

## Implementation Priority

### Phase 0: Foundation (Do First)

1. ⏳ Root circle creation on workspace creation
2. ⏳ Default category setup on workspace creation

### Phase 1: Schema (Critical - Blocking)

3. ⏳ Soft delete fields + indexes on all org tables
4. ⏳ Version history schema (discriminated unions)
5. ⏳ Role templates schema (nullable workspaceId)
6. ⏳ Circle items schema (categories + items)
7. ⏳ Scope field on userCircleRoles
8. ⏳ Workspace org settings

### Phase 2: Business Logic (High Priority)

9. ⏳ Soft delete cascade logic
10. ⏳ Version history capture (triggers)
11. ⏳ Circle Lead enforcement
12. ⏳ Query updates (exclude archived by default)

### Phase 3-5: UI & Polish (Medium Priority)

13. ⏳ Version history UI
14. ⏳ Soft delete UI (show archived toggle)
15. ⏳ Restoration workflows
16. ⏳ Migration scripts for existing data

---

## Resolved Questions

All key decisions have been made:

| Question                      | Decision                                                                  |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Root Circle**               | Created on workspace creation, can rename but not archive/delete          |
| **Version History Storage**   | Discriminated unions per entity type (type-safe, no `v.any()`)            |
| **System Templates**          | Use `v.optional(v.id('workspaces'))` - undefined = system, ID = workspace |
| **Cascade: Circle archived**  | Archive all roles in circle, keep members active                          |
| **Cascade: Role archived**    | Archive all user assignments to that role                                 |
| **Circle Lead Enforcement**   | Block deletion if `isRequired = true`, allow empty role (no fillers)      |
| **List Queries**              | Exclude archived by default, add `includeArchived` param                  |
| **Version History Retention** | Keep forever initially, add configurable retention later                  |
| **Circle Items**              | Customizable categories with draggable DB items, vectorized for AI/RAG    |

---

## Next Steps

1. ✅ **Plan reviewed and approved**
2. **Start Phase 0**: Root circle creation on workspace creation
3. **Start Phase 1**: Schema foundation (soft delete fields + indexes)
4. **Test incrementally** after each phase

---

**Status**: ✅ In Progress  
**Linear Parent Ticket**: [SYOS-613](https://linear.app/younghumanclub/issue/SYOS-613)
**Project**: Core Foundation

### Subtasks (Linear)

| Phase     | Ticket                                                       | Title                               | Estimate |
| --------- | ------------------------------------------------------------ | ----------------------------------- | -------- |
| Schema    | [SYOS-614](https://linear.app/younghumanclub/issue/SYOS-614) | Soft Delete Fields + Indexes        | S        |
| Schema    | [SYOS-615](https://linear.app/younghumanclub/issue/SYOS-615) | Version History Table               | M        |
| Schema    | [SYOS-616](https://linear.app/younghumanclub/issue/SYOS-616) | Role Templates + Workspace Settings | S        |
| Schema    | [SYOS-617](https://linear.app/younghumanclub/issue/SYOS-617) | Circle Item Categories + Items      | S        |
| Business  | [SYOS-618](https://linear.app/younghumanclub/issue/SYOS-618) | Root Circle Creation & Protection   | M        |
| Business  | [SYOS-619](https://linear.app/younghumanclub/issue/SYOS-619) | Soft Delete Cascade                 | M        |
| Business  | [SYOS-620](https://linear.app/younghumanclub/issue/SYOS-620) | Version History Capture             | L        |
| API       | [SYOS-621](https://linear.app/younghumanclub/issue/SYOS-621) | Query Updates (Exclude Archived)    | S        |
| API       | [SYOS-622](https://linear.app/younghumanclub/issue/SYOS-622) | Restore Mutations with Validation   | M        |
| Migration | [SYOS-623](https://linear.app/younghumanclub/issue/SYOS-623) | Backfill Existing Data              | L        |

**Blockers**: None - all questions resolved, validation complete
