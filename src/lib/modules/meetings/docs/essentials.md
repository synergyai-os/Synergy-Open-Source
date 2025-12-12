# Meetings Module - Essentials

> **Note**: This document describes the **current data model** as implemented in the schema. All documented fields, relationships, and entities exist in the database schema.

## User Types

- **System Admin** - Global administrator with full system access
  - Can manage all users, workspaces, and system settings
  - Has access across all workspaces
  - Can create and modify system-level configurations

- **Workspace Admin** - Administrator for a specific workspace
  - Can manage workspace settings, members, and permissions
  - Can create and edit meeting templates for their workspace
  - Has full access within their workspace scope

- **Workspace User** - Standard member of a workspace
  - Can create and participate in meetings
  - Can create agenda items and tasks
  - Access is limited to their workspace and assigned circles
  - Permissions are controlled via RBAC

## Glossary

| Term                      | Definition                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agenda Item**           | A collaborative agenda item within a meeting, with title, order, optional notes, and status (todo, processed, rejected). Active state is separate UI state, not a status.                          |
| **Attendee**              | A user who has joined a meeting. Created when a user joins a meeting (either by invitation or by joining a public meeting).                                                                        |
| **Circle**                | A work unit within a workspace, organized hierarchically. All circles descend from the root circle.                                                                                                |
| **Circle Role**           | An organizational role within a circle (e.g., "Circle Lead", "Facilitator"). Belongs to a specific circle.                                                                                         |
| **Sub-circle**            | A circle created within another circle. All circles except the root circle are sub-circles with a parent circle.                                                                                   |
| **Inbox Item**            | App-wide entity for items in a user's inbox. Used by meetings when users are invited. Appears in the inbox interface.                                                                              |
| **Meeting**               | A scheduled meeting with recurrence support, privacy controls, and real-time session state. Always requires a meeting template.                                                                    |
| **Meeting Invitation**    | An invitation to a meeting. Can invite specific users or entire circles. Creates inbox items for invited users.                                                                                    |
| **Notification**          | App-wide entity for notifications shown in the notification bell feature. Used by meetings when meetings start (5 minutes prior and when meeting starts).                                          |
| **Meeting Template**      | A reusable meeting structure with predefined steps. Workspace-level, can be created by users with RBAC permissions. Acts as the meeting type/category.                                             |
| **Meeting Template Step** | An ordered step that defines template structure (check-in, agenda, metrics, projects, closing, custom). Created by System Admin.                                                                   |
| **Project**               | A lightweight wrapper around external project management tools (Linear, Notion, Asana, etc.). Separate entity from tasks.                                                                          |
| **Recorder**              | The user who controls the meeting screen view and can perform meeting control actions (advance steps, close meeting, switch active agenda item). Controls what all participants see synchronously. |
| **Task**                  | A task created in the Projects module, can exist standalone or be linked to meetings/projects. Always an individual task (no `type` field).                                                        |
| **Workspace**             | A workspace that users belong to. Contains circles, meetings, and templates.                                                                                                                       |

## Data Entities

### Core Entities (from Core Module)

- **Users** - System users (from Core module)
- **Workspaces** - Workspaces users belong to (from Core module)
- **Circles** - Work workspace units, hierarchical structure
  - A workspace always starts with a root circle (has `parentCircleId = null`)
  - Within the root circle, users create sub-circles
  - All circles except the root circle are sub-circles with a parent circle (`parentCircleId` is set)
  - Sub-circles can be nested infinitely deep (sub-circles can have their own sub-circles)
- **Circle Members** - Many-to-many relationship between users and circles
- **Circle Roles** - Organizational roles within circles (e.g., "Circle Lead", "Facilitator")
  - Belong to a specific circle (`circleId`)
  - Examples: "Circle Lead", "Dev Lead", "Facilitator"
- **User Circle Roles** - Many-to-many assignments of users to circle roles
  - Users can fill multiple roles across different circles
  - Roles can have multiple users filling them

- **Inbox Items** - App-wide entity for items in a user's inbox (from Core module)
  - Used by meetings: Created when a user is invited to a meeting (directly or via circle membership)
  - Appears in the inbox interface
  - Distinct from notifications (which appear in the notification bell)
  - See Core module for full definition and other use cases

- **Notifications** - App-wide entity for notifications shown in the notification bell feature (from Core module)
  - Used by meetings: Created when a meeting starts (5 minutes prior to start time and when meeting actually starts)
  - Appears in the notification bell interface
  - Distinct from inbox items (which appear in the inbox)
  - See Core module for full definition and other use cases

### Meeting Entities

- **Meetings** - Scheduled meetings with recurrence support
  - Has organizer (createdBy), required meeting template, optional circle
  - Supports ad-hoc meetings (no circle) and circle-based meetings
  - Privacy controls: `public` (visible and accessible to all workspace members), `private` (only visible and accessible to invited users)
  - Can be linked to a circle (optional)
  - Real-time session state: `startedAt`, `currentStep`, `closedAt`, `recorderId`, `activeAgendaItemId`
  - **Recorder**: The user who controls the meeting screen view and meeting flow
    - Defaults to the person who starts the meeting
    - Can be changed by any attendee selecting themselves or another user (no confirmation required - trust-based)
    - If no recorder assigned: Pop-up prompts users to assign a recorder
    - Always required: There is always a recorder in a meeting (meeting continues even if recorder leaves)
    - Controls synchronized screen view: all participants see the same active agenda item
    - Controls meeting actions: advance steps, close meeting, switch active agenda item
  - Recurrence: daily, weekly, monthly with optional end date
  - **Recurrence Instances**: Recurring meetings have two types of instances
    - **Computed Instances** (for display): Future occurrences are computed client-side from recurrence pattern
      - Used for displaying upcoming meetings in lists
      - Synthetic IDs for UI purposes only
      - Not stored in database until started
    - **Started Instances** (real DB records): When a recurring meeting instance is started, it becomes a real meeting record
      - Has its own unique meeting ID
      - Linked to parent via `parentMeetingId` (points to original recurring meeting - to be added to schema)
      - Each instance maintains its own agenda items, attendees, and session state
      - Enables querying "all instances of this recurring meeting series": `WHERE parentMeetingId = originalMeetingId`
    - **Editing Recurring Meetings**: Previous started instances remain unchanged, future computed instances align with updated meeting configuration

- **Meeting Invitations** - Pre-meeting invitations to join a meeting
  - Created when meeting is created or updated
  - Can invite specific users or entire circles
  - **Purpose**: Determines who receives inbox items and who can access private meetings
  - **Dynamic Resolution**: When a circle is invited, all users in that circle receive inbox items (via Core module)
  - **Circle Membership**: If a user is part of a circle (even after the meeting is set), they are considered 'invited' to the meeting
  - Invitations exist before the meeting starts - they define who CAN join, not who HAS joined

- **Meeting Attendees** - Users who have actually joined a meeting (post-meeting start)
  - Simple relation between user and meeting
  - Created when a user joins a meeting (after meeting starts)
  - **Distinction from Invitations**: Invitations are pre-meeting (who CAN join), Attendees are post-join (who HAS joined)
  - **Private meetings**: Only users who were invited (directly or via circle membership) can join (become attendees)
  - **Public meetings**: All workspace members can join (become attendees)

- **Meeting Agenda Items** - Real-time collaborative agenda items
  - Has title, order, optional markdown notes, status field
  - Created by any participant (`createdBy`), can be edited by any attendee
  - **Status**: Enum field with values `todo`, `processed`, `rejected` (status enum to be implemented in schema)
    - `todo`: Default state when created, can be edited and become active
    - `processed`: Item was completed during meeting
    - `rejected`: Item was explicitly rejected during meeting
    - **Note**: `in-progress` is NOT a status - it's a UI state (which item is currently displayed)
  - **Status Transitions**:
    - During meeting: Items can move between states flexibly (`processed` → `todo`, `rejected` → `todo`, etc.)
    - Items in any status (`todo`, `processed`, `rejected`) can become active and be edited
    - After meeting closes: Status is locked forever (no changes allowed)
  - **Active Item**: The recorder controls which agenda item is active (`activeAgendaItemId` on meeting)
    - Active item = the one displayed in center stage (all items visible in sidebar, one in center)
    - Active is UI state, independent of status - any status can be active
    - When recorder marks active item as `processed` or `rejected`: Item becomes inactive, recorder selects new active item
    - All participants see the same active agenda item synchronously
    - Recorder can switch the active item, and all screens update in real-time
    - Only the recorder can switch the active agenda item (controls meeting screen view)
    - If active item is deleted: `activeAgendaItemId` becomes null, UI shows "select item" / "add item" / "go to next step" options
  - **Deletion**: Items can be deleted if status is `todo` (not yet processed/rejected)
  - **After Meeting Closes**:
    - Report is generated (emailed to attendees + invited users, appears in reports UI)
    - Reports are dynamically generated on-demand (not stored - see Reports section)
    - `processed` items appear in "Processed" section of report
    - `rejected` items appear in "Rejected" section of report
    - Items with status `todo`: Return to creator's control, available for import into future meetings
    - **Import Logic**: Items stay linked to original meeting (not copied)
      - Import query: `WHERE createdBy = userId AND meeting.closedAt IS NOT NULL AND status = 'todo'`
      - Import availability: Currently shows in all meetings (future: smart matching by `circleId` + `templateId` when available)
      - Import UI: Small icon button with circle indicator showing count of available items
      - If creator leaves workspace: Items become orphaned (future: auto-delete or reassign business rule)

- **Meeting Presence** - Real-time tracking of who's actively in the meeting
  - Tracks users currently viewing/participating in the meeting session
  - Uses heartbeat mechanism (updates every 30 seconds)
  - Purpose: Show active participants, enable presence-aware features
  - Separate from attendees: Presence is ephemeral (who's here now), Attendees is persistent (who joined)

- **Meeting Templates** - User-created reusable meeting structures
  - Workspace-level templates (created by users with RBAC permissions)
  - Acts as both the meeting structure and the meeting type/category
  - Can be created and edited by users with appropriate RBAC access
  - Built by selecting and ordering system-defined template steps
  - Used to create meetings with predefined structure and steps
  - Default templates (Governance, Weekly Tactical, etc.) seeded on workspace creation but may be edited and adjusted by users with access rights
  - **Required**: Meetings always require a meeting template

- **Meeting Template Steps** - System-defined steps that define template structure
  - Step types are system-defined: examples are `check-in`, `agenda`, `metrics`, `projects`, `closing`, `custom`
  - Created by System Admin (step types are built into the system)
  - Users can enable/configure functionalities within steps, but the step types themselves are system-defined
  - When building a template, users select steps and order them
  - Steps are ordered by the user when creating/editing a template
  - Meeting flow follows the step order from beginning to end
  - Has title, optional description, order index, optional timebox (minutes)
  - Belongs to a template via `templateId`

### Entities from Projects Module (Used in Meetings)

- **Projects** - Lightweight project wrappers around external project management tools
  - See [Projects Module - Projects](../../projects/README.md#projects) for full definition
  - Links to external tools (Linear, Notion, Asana, Jira, etc.)
  - Tasks can optionally link to projects via `projectId`
  - Projects are separate entities from tasks (tasks are individual tasks, projects are project containers)

- **Tasks** - Tasks defined in Projects module, can exist standalone or be linked to meetings/projects
  - See [Projects Module - Tasks](../../projects/README.md#tasks) for full definition
  - **No `type` field**: Tasks are always individual tasks (not projects themselves)
  - **Clarification**: The old schema had a `type` field (`'next-step'` or `'project'`), but this is removed because:
    - Tasks are always individual tasks (`next-step` conceptually, but no field stored)
    - Projects are separate entities that tasks link to via `projectId`
  - **Creation Contexts**:
    - Standalone: Created independently for task management (no `meetingId` or `agendaItemId`)
    - In Meetings: Created during meetings, linked to `meetingId` and `agendaItemId` for traceability
  - All other properties (assignment, status, sync) managed by Projects module

## Relationships

### Users & Circles

- Users ↔ Circles: Many-to-many via `circleMembers` (users can belong to multiple circles)
- Circles: Self-referential hierarchy via `parentCircleId` (parent/child relationships)
  - Root circle: The initial circle created with the workspace (has no parent, `parentCircleId` is null)
  - Sub-circles: All other circles are sub-circles created within the root circle or within other sub-circles
  - Sub-circles can be nested infinitely deep (sub-circles can have their own sub-circles)
- Circle → Circle Roles: One-to-many (roles belong to a specific circle via `circleId`)
- Users ↔ Circle Roles: Many-to-many via `userCircleRoles`
  - Users can fill multiple roles (across different circles)
  - Roles can have multiple users filling them

### Meetings

- Meeting → Workspace: Many-to-one (required)
- Meeting → Creator: Many-to-one (user via `createdBy`)
- Meeting → Recorder: Many-to-one (user via `recorderId`, defaults to person who starts meeting)
- Meeting → Circle: Many-to-one (optional, null = ad-hoc meeting)
- Meeting → Template: Many-to-one (required, via `templateId`)
- Meeting → Parent Meeting: Many-to-one (optional, via `parentMeetingId` - for recurring meeting instances)
  - Links started instances to their recurring meeting series (the original recurring meeting)
  - Enables querying all instances of a recurring meeting: `WHERE parentMeetingId = meetingId`
  - Only set when a recurring meeting instance is started (becomes real DB record)
- Meeting → Active Agenda Item: One-to-one (optional, via `activeAgendaItemId`)
  - **Note**: This tracks which agenda item is CURRENTLY ACTIVE (UI state, not status)
  - One meeting can have many agenda items total, but only ONE is active at a time (or none)
  - The active agenda item is controlled by the recorder for synchronized screen view
  - If active item is deleted: `activeAgendaItemId` becomes null

### Meeting Invitations

- Meeting ↔ Invitations: One-to-many via `meetingInvitations`
- Invitation → User: Many-to-one (when inviting a specific user)
- Invitation → Circle: Many-to-one (when inviting an entire circle)
- **Key Distinction**: Invitations define who CAN join (pre-meeting), Attendees are who HAS joined (post-meeting start)

### Inbox Items & Notifications (from Core Module)

- Meeting → Inbox Items: One-to-many (created when users are invited via Core module)
- Inbox Item → User: Many-to-one (required, from Core module)
- Inbox Item → Meeting: Many-to-one (optional, when created by meetings)
- **Meeting Usage**: Created when a user is invited to a meeting (directly or via circle membership)
- **Display**: Appears in inbox interface (Core module functionality)

- Meeting → Notifications: One-to-many (created when meeting starts via Core module)
- Notification → User: Many-to-one (required, from Core module)
- Notification → Meeting: Many-to-one (optional, when created by meetings)
- **Meeting Usage**: Created 5 minutes prior to meeting start time and when meeting actually starts
- **Display**: Appears in notification bell interface (Core module functionality)

### Meeting Attendees

- Meeting ↔ Attendees: One-to-many via `meetingAttendees`
- Attendee → User: Many-to-one (required, attendees are always users)
- Created when a user joins a meeting (either by invitation or by joining a public meeting)

### Meeting Structure

- Meeting → Agenda Items: One-to-many via `meetingAgendaItems`
  - One meeting can have many agenda items (zero or more, unlimited)
  - Any attendee can create multiple agenda items
- Meeting → Tasks: One-to-many (optional, via `meetingId` on tasks - tasks can also exist standalone)
- Meeting → Presence: One-to-many via `meetingPresence` (real-time tracking of active participants)

### Agenda Items & Related Entities

- Agenda Item → Tasks: One-to-many (via `agendaItemId` on tasks when created in meetings)

### Tasks (from Projects Module)

- Task → Meeting: Many-to-one (optional, via `meetingId` when created in meetings)
- Task → Agenda Item: Many-to-one (optional, via `agendaItemId` when created in meetings)
- Task → Project: Many-to-one (optional, via `projectId`)
- Task → Workspace: Many-to-one (required, via `workspaceId`)
- See [Projects Module](../../projects/README.md) for full entity definition

### Templates & Template Steps

- Meeting Template → Template Steps: One-to-many via `meetingTemplateSteps`
- Template Step → Template: Many-to-one (via `templateId`, required)
- Meeting Template → Workspace: Many-to-one (required)
- Meeting → Template: Many-to-one (required, via `templateId`)
- **Template Creation**: Users with RBAC permissions can create and edit templates by selecting and ordering system-defined steps
- **Step Types**: Step types are system-defined (created by System Admin), but users can enable/configure functionalities within steps
- **Template Usage**: Template steps guide meeting structure (not copied directly to meetings)
- **Default Templates**: System seeds default templates (Governance, Weekly Tactical) on workspace creation

## Constraints & Edge Cases

### Foreign Key Constraints

- **Recorder leaves workspace**: `recorderId` remains set (historical record). If recorder is needed and user is gone, another attendee can assign themselves as recorder.
- **Active agenda item deleted**: `activeAgendaItemId` becomes null. UI shows empty state with options to "select item", "add item", or "go to next step".
- **Meeting deleted**: Uses soft delete (`deletedAt` timestamp). Linked agenda items are soft-deleted with meeting. Tasks and projects remain (not deleted).

### State Management

- **Recurring meeting edits**: Previous instances remain unchanged, future instances align with updated meeting configuration.
- **Agenda item status**: Status (`todo`, `processed`, `rejected`) is independent of active state. Any status can be active. When active item is marked `processed` or `rejected`, it becomes inactive and recorder selects new active item.

### Data Retention

- **Meeting deletion**: Soft delete only (`deletedAt` field - to be added to schema). Data retained for historical reference and reporting.
- **Workspace deletion**: All meetings and related data deleted (cascade delete).

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
