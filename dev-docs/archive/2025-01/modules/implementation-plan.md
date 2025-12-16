# Meetings Module - Implementation Plan

> **Purpose**: This document outlines the implementation plan to align the codebase with the documented data model in `essentials.md` and `business-logic.md`.

## Files Modified

| File                                                                        | Purpose                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `convex/schema.ts`                                                          | Defines the database schema for all Convex tables. Contains table definitions, field types, and indexes for meetings, agenda items, and related entities.                                                                                 |
| `convex/meetingAgendaItems.ts`                                              | Backend mutations and queries for managing meeting agenda items. Handles updating notes, marking items with status (todo/processed/rejected), and enforcing business rules like status locking after meeting closes.                      |
| `convex/meetings.ts`                                                        | Backend mutations and queries for managing meetings. Handles CRUD operations, meeting session control (start/advance/close), recorder management, active agenda item synchronization, attendee management, and soft delete functionality. |
| `src/lib/modules/meetings/composables/useMeetingSession.svelte.ts`          | Svelte composable that provides reactive meeting session state and actions. Exposes meeting data, agenda items, timer, recorder state, and actions like starting meetings, advancing steps, and managing active agenda items.             |
| `src/routes/(authenticated)/meetings/[id]/+page.svelte`                     | Main meeting session page component. Displays meeting header, step navigation, agenda sidebar, and active agenda item view. Handles real-time synchronization of meeting state across all participants.                                   |
| `src/lib/modules/meetings/components/AgendaItemView.svelte`                 | Component for displaying and editing a single agenda item in full view. Shows item title, markdown notes editor, status badges, and action buttons for marking items as processed or rejected.                                            |
| `src/lib/modules/meetings/__tests__/meetingAgendaItems.integration.test.ts` | Integration tests for agenda item mutations. Tests status transitions, permission checks, and business rule enforcement like status locking after meeting closes.                                                                         |
| `scripts/migrations/migrate-agenda-status.ts`                               | One-time migration script to convert existing agenda items from boolean `isProcessed` field to enum `status` field. Can be run safely multiple times as it skips already migrated items.                                                  |
| `scripts/migrations/set-default-recorders.ts`                               | One-time migration script to set default recorder (`recorderId = createdBy`) for meetings that have been started but don't have a recorder assigned. Can be run safely multiple times.                                                    |
| `scripts/migrations/README.md`                                              | Documentation for migration scripts. Explains how to run migrations, what each script does, rollback procedures, and post-migration verification steps.                                                                                   |

## Overview

This plan covers migrating from the current implementation to the documented future state, including:

- Status enum migration (boolean → enum)
- Recorder and active agenda item functionality
- Recurrence instance linking
- Soft delete support
- Report generation

## Phase 1: Schema Updates

### 1.1 Add Missing Fields to `meetings` Table

**Fields to Add:**

```typescript
recorderId: v.optional(v.id('users')),
activeAgendaItemId: v.optional(v.id('meetingAgendaItems')),
parentMeetingId: v.optional(v.id('meetings')), // For recurring instances
deletedAt: v.optional(v.number()), // Soft delete
```

**Migration Steps:**

1. Add fields to schema with `v.optional()` (backward compatible)
2. Deploy schema changes
3. Fields will be `null` for existing meetings (acceptable default)

**Indexes to Add:**

```typescript
.index('by_recorder', ['recorderId']) // For querying meetings by recorder
.index('by_parent', ['parentMeetingId']) // For querying recurring instances
.index('by_deleted', ['deletedAt']) // For filtering soft-deleted meetings
```

### 1.2 Migrate Agenda Item Status (Boolean → Enum)

**Current State:**

- `isProcessed: v.optional(v.boolean())`

**Target State:**

- `status: v.union(v.literal('todo'), v.literal('processed'), v.literal('rejected'))`

**Migration Strategy:**

**Option A: Gradual Migration (Recommended)**

1. Add `status` field as optional alongside `isProcessed`
2. Migration script: Set `status` based on `isProcessed`:
   - `isProcessed = true` → `status = 'processed'`
   - `isProcessed = false` → `status = 'todo'`
   - `isProcessed = null` → `status = 'todo'`
3. Update all mutations/queries to use `status` field
4. Remove `isProcessed` field after all code migrated

**Option B: Big Bang Migration**

1. Create migration script to convert all existing data
2. Deploy schema change and code changes simultaneously
3. Higher risk but cleaner end state

**Recommendation**: Option A (gradual migration) - safer, allows rollback

**Migration Script:**

```typescript
// scripts/migrations/migrate-agenda-status.ts
// 1. Add status field to all existing agenda items
// 2. Set status based on isProcessed
// 3. Validate migration
```

## Phase 2: Backend Implementation

### 2.1 Recorder Functionality

**Mutations to Create/Update:**

1. **Set Recorder** (`setRecorder`)
   - Input: `meetingId`, `recorderId`, `sessionId`
   - Validation: User must be attendee
   - Action: Update `meetings.recorderId`
   - Real-time: All participants see update

2. **Start Meeting** (`startMeeting`) - Update existing
   - Set `recorderId = userId` when `startedAt` is set
   - Set `currentStep` to first template step

**Queries to Create/Update:**

1. **Get Meeting Session** - Add `recorderId` and `activeAgendaItemId` to response
2. **Check if User is Recorder** - Helper function for UI

### 2.2 Active Agenda Item Functionality

**Mutations to Create/Update:**

1. **Set Active Agenda Item** (`setActiveAgendaItem`)
   - Input: `meetingId`, `agendaItemId`, `sessionId`
   - Validation: User must be recorder
   - Action: Update `meetings.activeAgendaItemId`
   - Real-time: All participants see update

2. **Mark Agenda Item Processed/Rejected** (`markAgendaItemStatus`) - Update existing
   - Input: `agendaItemId`, `status` ('processed' | 'rejected'), `sessionId`
   - Validation: User must be recorder (or allow all attendees?)
   - Action:
     - Update `meetingAgendaItems.status`
     - If item is active, set `meetings.activeAgendaItemId = null`
   - Real-time: All participants see status change and active item cleared

**Business Logic:**

- When marking active item as `processed` or `rejected`, automatically clear `activeAgendaItemId`
- Recorder must select new active item

### 2.3 Status Enum Implementation

**Update Existing Mutations:**

1. **Create Agenda Item** (`createAgendaItem`)
   - Set `status = 'todo'` by default

2. **Mark Processed** (`markProcessed`) → Rename to `markStatus`
   - Accept `status: 'processed' | 'rejected'`
   - Update `status` field instead of `isProcessed`

3. **Update Agenda Item** (`updateAgendaItem`)
   - Allow status changes during meeting
   - Lock status after meeting closes (`closedAt IS NOT NULL`)

**Queries to Update:**

1. **Get Agenda Items** - Return `status` instead of `isProcessed`
2. **Filter by Status** - Support `WHERE status = 'todo'` queries

### 2.4 Recurrence Instance Linking

**When Starting Recurring Meeting Instance:**

1. **Check if instance is recurring** (`recurrence IS NOT NULL`)
2. **Check if this is first start** (`startedAt IS NULL`)
3. **If recurring and first start:**
   - Create new meeting record OR update existing with `parentMeetingId`
   - Decision needed: Create new record or update existing?

**Recommendation**: Create new meeting record when instance starts

- Original meeting = template/series definition
- Started instance = new record with `parentMeetingId` pointing to original
- Enables querying all instances: `WHERE parentMeetingId = originalMeetingId`

**Mutation: Start Recurring Instance**

```typescript
startRecurringInstance({
	originalMeetingId,
	instanceStartTime,
	sessionId
});
// Creates new meeting record with parentMeetingId
```

### 2.5 Soft Delete Implementation

**Update Delete Mutations:**

1. **Delete Meeting** → Rename to `softDeleteMeeting`
   - Set `deletedAt = Date.now()`
   - Soft delete linked agenda items
   - Keep tasks and projects (as documented)

2. **Delete Agenda Item** → Update validation
   - Only allow if `status = 'todo'`
   - Hard delete (no soft delete for agenda items)

**Update Queries:**

1. **List Meetings** - Filter out soft-deleted: `WHERE deletedAt IS NULL`
2. **Get Meeting** - Include soft-deleted check
3. **Admin Queries** - Option to include soft-deleted for recovery

### 2.6 Import Logic

**Query: Get Importable Agenda Items**

```typescript
getImportableAgendaItems({
	userId,
	sessionId
});
// Query: WHERE createdBy = userId
//        AND meeting.closedAt IS NOT NULL
//        AND status = 'todo'
//        AND meeting.deletedAt IS NULL
```

**Mutation: Import Agenda Item** (Future)

- Copy agenda item to new meeting
- Or link existing item to new meeting
- Decision needed: Copy vs Link

**Recommendation**: Link (keep reference to original meeting) - simpler, maintains traceability

## Phase 3: Frontend Implementation

### 3.1 Recorder UI Components

**Components to Create/Update:**

1. **RecorderSelector** (New)
   - Dropdown to select recorder from attendees
   - Show current recorder name
   - Update `recorderId` via mutation

2. **RecorderIndicator** (New)
   - Badge/indicator showing current recorder
   - Visual distinction for recorder

3. **Meeting Controls** - Update existing
   - Show "Advance Step", "Close Meeting" only for recorder
   - Disable for non-recorder users

### 3.2 Active Agenda Item UI

**Components to Update:**

1. **AgendaItemList** - Update
   - Highlight active item (center stage)
   - Show all items in sidebar
   - Only recorder can click to set active

2. **AgendaItemView** - Update
   - Show full view of active item
   - Real-time sync when recorder changes active item
   - Show "Mark as Processed" / "Mark as Rejected" buttons (recorder only)

3. **Meeting Session Page** - Update
   - Use `activeAgendaItemId` from meeting (not local state)
   - Real-time query for `activeAgendaItemId`
   - Auto-update when recorder changes

**State Management:**

- Remove local `activeItemId` state
- Use `meeting.activeAgendaItemId` from query
- Real-time updates via Convex queries

### 3.3 Status UI Updates

**Components to Update:**

1. **AgendaItemCard** - Update
   - Show status badge (`todo`, `processed`, `rejected`)
   - Remove `isProcessed` boolean logic

2. **Status Selector** - New or Update
   - Dropdown/buttons to change status
   - Only during meeting (locked after close)

3. **Agenda Item List** - Update
   - Group by status: "To Process" (todo), "Processed", "Rejected"
   - Filter/sort by status

### 3.4 Import UI

**Components to Create:**

1. **ImportableItemsButton** (New)
   - Small icon button with count badge
   - Shows number of importable items
   - Click opens import modal

2. **ImportItemsModal** (New)
   - List of importable agenda items
   - Checkboxes to select items
   - "Import Selected" button
   - Links items to current meeting

**Integration:**

- Show button in meeting session page (agenda step)
- Query importable items on mount
- Update count badge in real-time

### 3.5 Report UI

**Components to Create/Update:**

1. **MeetingReportView** (New)
   - Dynamically generate report from meeting data
   - Show "Processed" and "Rejected" sections
   - Generate on-demand (not stored)

2. **Reports List Page** - Update
   - Query meetings with `closedAt IS NOT NULL`
   - Generate report views on-demand
   - Link to meeting detail page

## Phase 4: Migration & Testing

### 4.1 Data Migration

**Migration Scripts:**

1. **Migrate Agenda Status**

   ```typescript
   // scripts/migrations/migrate-agenda-status.ts
   // - Read all meetingAgendaItems
   // - Set status based on isProcessed
   // - Validate migration
   ```

2. **Set Default Recorders**

   ```typescript
   // scripts/migrations/set-default-recorders.ts
   // - For meetings with startedAt, set recorderId = createdBy
   // - For meetings without startedAt, leave null
   ```

3. **Link Recurring Instances** (Future)
   ```typescript
   // scripts/migrations/link-recurring-instances.ts
   // - Find recurring meetings
   // - Link started instances via parentMeetingId
   ```

### 4.2 Testing Strategy

**Unit Tests:**

- Status enum transitions
- Recorder assignment logic
- Active item business rules
- Import query logic

**Integration Tests:**

- Start meeting → recorder set
- Mark active item processed → becomes inactive
- Recurring instance creation
- Soft delete behavior

**E2E Tests:**

- Recorder controls meeting flow
- Active item synchronization
- Status changes during meeting
- Import flow

### 4.3 Rollout Strategy

**Phase 1: Schema + Backend (Week 1)**

- Deploy schema changes
- Implement backend mutations/queries
- Run migration scripts
- Test backend APIs

**Phase 2: Frontend Core (Week 2)**

- Recorder UI
- Active agenda item UI
- Status enum UI
- Test core flows

**Phase 3: Advanced Features (Week 3)**

- Import functionality
- Report generation
- Recurrence instance linking
- Polish and edge cases

**Phase 4: Cleanup (Week 4)**

- Remove `isProcessed` field
- Remove old code paths
- Documentation updates
- Performance optimization

## Phase 5: Cleanup

### 5.1 Remove Deprecated Code

- Remove `isProcessed` field from schema
- Remove `markProcessed` mutation (use `markStatus`)
- Remove local `activeItemId` state from components
- Remove old status boolean logic

### 5.2 Documentation Updates

- Update API documentation
- Update component documentation
- Update user-facing docs
- Update architecture diagrams

## Risk Mitigation

### Risks

1. **Data Loss**: Migration scripts must be tested thoroughly
2. **Breaking Changes**: Gradual migration reduces risk
3. **Performance**: Real-time queries for active item need optimization
4. **User Confusion**: Clear UI indicators for recorder/active item

### Mitigation

1. **Backup**: Full database backup before migrations
2. **Feature Flags**: Use feature flags to roll out gradually
3. **Monitoring**: Monitor query performance and errors
4. **User Testing**: Beta test with small user group first

## Success Criteria

- [ ] All schema fields added and migrated
- [ ] Status enum fully implemented (no `isProcessed` references)
- [ ] Recorder functionality working end-to-end
- [ ] Active agenda item synchronized across all participants
- [ ] Import functionality working
- [ ] Reports generating correctly
- [ ] All tests passing
- [ ] No performance regressions
- [ ] Documentation updated

## Open Questions

1. **Recurring Instances**: Create new record or update existing when instance starts?
   - Recommendation: Create new record with `parentMeetingId`

2. **Import**: Copy items or link to original?
   - Recommendation: Link (keep reference)

3. **Status Changes**: Who can change status? Recorder only or all attendees?
   - Recommendation: All attendees (collaborative)

4. **Recorder Assignment**: Require confirmation or trust-based?
   - Documented: Trust-based (no confirmation)

## Next Steps

1. Review and approve this plan
2. Create Linear tickets for each phase
3. Set up feature flags
4. Begin Phase 1: Schema Updates
