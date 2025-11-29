# Meetings Module - Business Logic

This document describes the business logic and workflows for the Meetings module.

## Meeting Lifecycle

1. **Scheduled** - Meeting created with start time, duration, attendees
2. **Started** - Person who starts the meeting becomes the recorder (`startedAt` set, `currentStep` initialized, `recorderId` set)
3. **In Progress** - Meeting moves through steps as defined by template or default flow
4. **Closed** - Recorder closes meeting (`closedAt` set)

## Meeting Control & Recorder Role

### Recorder Responsibilities

The **Recorder** is the user who controls the meeting screen view and meeting flow. Every meeting has one recorder.

**Recorder Controls**:

- **Synchronized Screen View**: Controls which agenda item is active (`activeAgendaItemId`)
  - All participants see the same active agenda item in real-time
  - When recorder switches agenda items, all screens update synchronously
  - Only the recorder can switch the active agenda item
- **Meeting Flow**: Advance steps through the meeting template
- **Meeting Closure**: Close the meeting when complete
- **Agenda Item Status**: Mark agenda items as `processed` or `rejected`
  - When recorder marks active item as `processed` or `rejected`, item becomes inactive
  - Recorder then selects new active item

**Recorder Does NOT Control**:

- **Agenda Item Creation/Editing**: All attendees can create and edit agenda items
  - This is collaborative - anyone can add items or modify existing ones
  - Recorder only controls which item is currently displayed/active

### Recorder Assignment

- **Default**: Person who starts the meeting becomes the recorder (`recorderId` set when `startedAt` is set)
- **Change**: Any attendee can change the recorder to themselves or another user (no confirmation required)
  - Trust-based system - unlikely someone would abuse this
  - No approval workflow to keep process fast and simple
- **If no recorder assigned**: Pop-up prompts users to assign a recorder
- **Always required**: There is always a recorder in a meeting (meeting continues even if recorder leaves)
- **Recorder leaves workspace**: `recorderId` remains set (historical record). If recorder is needed and user is gone, another attendee can assign themselves as recorder.
- **Future**: Facilitator role may be added later (separate from recorder)

### Synchronized View

- `activeAgendaItemId` is stored on the meeting entity (server-side, not local state)
- When recorder changes `activeAgendaItemId`, all participants' screens update via real-time queries
- This ensures everyone sees the same agenda item simultaneously during the meeting
- Active state is independent of status - any status (`todo`, `processed`, `rejected`) can be active
- However, marking an active item as `processed` or `rejected` automatically makes it inactive (business rule)

## Agenda Items

- Any participant can add agenda items during the meeting
- Agenda items have optional markdown notes for taking notes
- **Status**: Enum field with values `todo`, `processed`, `rejected`
  - `todo`: Default state when created, can be edited and become active
  - `processed`: Item was completed during meeting
  - `rejected`: Item was explicitly rejected during meeting
  - **Note**: `in-progress` is NOT a status - it's a UI state (which item is currently displayed)

### Status Transitions

- **During meeting**: Items can move between states flexibly (`processed` → `todo`, `rejected` → `todo`, etc.)
- Items in any status (`todo`, `processed`, `rejected`) can become active and be edited
- **After meeting closes**: Status is locked forever (no changes allowed)

### Active Item (Synchronized View)

- Recorder controls which agenda item is active (`activeAgendaItemId` on meeting)
- Active item = the one displayed in center stage (all items visible in sidebar, one in center)
- Active is UI state, independent of status - any status can be active
- **Business Rule**: When recorder marks active item as `processed` or `rejected`, item becomes inactive and recorder selects new active item
- All participants see the same active agenda item synchronously
- Only the recorder can switch the active agenda item
- If active item is deleted: `activeAgendaItemId` becomes null, UI shows "select item" / "add item" / "go to next step" options

### Deletion

- Items can be deleted if status is `todo` (not yet processed/rejected)
- Processed/rejected items cannot be deleted (historical record)

### After Meeting Closes

- **Report Generation**: Report is generated (emailed to attendees + invited users, appears in reports UI)
  - Reports are dynamically generated on-demand (not stored - see Reports section)
  - `processed` items appear in "Processed" section of report
  - `rejected` items appear in "Rejected" section of report
- **Import Logic**: Items with status `todo` return to creator's control
  - Items stay linked to original meeting (not copied)
  - Import query: `WHERE createdBy = userId AND meeting.closedAt IS NOT NULL AND status = 'todo'`
  - Import availability: Currently shows in all meetings (future: smart matching by `circleId` + `templateId` when available)
  - Import UI: Small icon button with circle indicator showing count of available items
  - If creator leaves workspace: Items become orphaned (future: auto-delete or reassign business rule)

## Action Items

- Created from agenda items during meeting
- Always type: `next-step` (individual tasks, not projects)
- Can optionally link to projects (see Projects module for project management)
- Can be assigned to specific users or roles (polymorphic assignment)
- Status workflow: `todo` → `in-progress` → `done`
- **Bi-directional Sync**: Status syncs with external project management tools (Linear, Notion, etc.)
- Optional due dates and circle association
- **External Tool Integration**: Action items can sync to external tools individually or via project link

## Access Control & Circle Membership

### Meeting Access Rules

- **Public meetings**: All workspace members can see and join
- **Private meetings**: Only invited users can see and join
- **Circle-linked meetings**: If a meeting has a `circleId`, users in that circle are considered invited
  - This applies to both private and public meetings
  - Users who join a circle after a meeting is created automatically become invited
  - Circle membership is dynamic - if you're in the circle, you're invited

### Invitation vs Attendee

- **Invitations** (pre-meeting): Define who CAN join the meeting
  - Created when meeting is created or updated
  - Can invite specific users or entire circles
  - Creates inbox items for invited users
- **Attendees** (post-meeting start): Track who HAS joined the meeting
  - Created when a user actually joins the meeting (after meeting starts)
  - Separate from invitations - you can be invited but not attend
  - **Private meetings**: Only users who were invited (directly or via circle membership) can join (become attendees)
  - **Public meetings**: All workspace members can join (become attendees)

## Reports

- **Report Generation**: Reports are generated when meeting closes
  - Emailed to all attendees and invited users (including those who didn't attend)
  - **Storage Strategy**: Reports are dynamically generated on-demand (not stored as separate entity)
  - **Rationale**:
    - Reports are views of meeting data, not separate entities
    - Storing would create data duplication and sync issues
    - Reports can be regenerated if meeting data changes
    - Email is the delivery mechanism, not storage
  - **Report Content**: Includes `processed` items in "Processed" section, `rejected` items in "Rejected" section
  - **Implementation**: Query meetings with `closedAt IS NOT NULL` and generate report views on-demand
  - **Future Consideration**: Add `meetingReports` table only if needed for:
    - Scheduled reports (weekly summaries)
    - Custom report formats per workspace
    - Report versioning/history
    - Reports that persist even if meeting is deleted

## Recurrence

- Supports daily, weekly, monthly recurrence
- Weekly recurrence can specify days of week (e.g., Mon/Wed/Fri)
- Optional end date for recurring meetings

### Recurrence Instances

Recurring meetings have two types of instances:

- **Computed Instances** (for display): Future occurrences are computed client-side from recurrence pattern
  - Used for displaying upcoming meetings in lists
  - Synthetic IDs for UI purposes only (`${meeting._id}_${currentTime}`)
  - Not stored in database until started
- **Started Instances** (real DB records): When a recurring meeting instance is started, it becomes a real meeting record
  - Has its own unique meeting ID
  - Linked to parent via `parentMeetingId` (points to original recurring meeting)
  - Each instance maintains its own agenda items, attendees, and session state
  - Enables querying all instances: `WHERE parentMeetingId = originalMeetingId`

### Editing Recurring Meetings

- Previous started instances remain unchanged
- Future computed instances align with updated meeting configuration
- When editing a recurring meeting, only the template meeting record is updated
