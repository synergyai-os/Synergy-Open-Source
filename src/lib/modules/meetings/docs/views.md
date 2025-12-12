# Meetings Module - Views

## Pages (Routes)

### Meetings List Page

**Route**: `/meetings`  
**File**: `src/routes/(authenticated)/meetings/+page.svelte`

**Purpose**: Main entry point for viewing and managing meetings within a workspace

**Features**:

- Lists meetings organized by time (today, this week, future, closed)
- Create meeting button (requires meeting template selection)
- Filter by circle (optional - supports ad-hoc meetings without circle)
- Tab navigation: "My Meetings" and "Reports"

**Key Concepts** (from Essentials):

- Meetings belong to a workspace (required)
- Meetings require a meeting template (required)
- Meetings can be circle-based (optional) or ad-hoc
- Privacy: `public` (all workspace members) or `private` (invited users only)
- Circle membership: Users in a circle are automatically invited to circle-linked meetings

**Components Used**:

- `MeetingCard` - Displays meeting details
- `CreateMeetingModal` - Creates meetings with template selection

---

### Meeting Session Page

**Route**: `/meetings/[id]`  
**File**: `src/routes/(authenticated)/meetings/[id]/+page.svelte`

**Purpose**: Real-time collaborative meeting session

**Features**:

- Real-time meeting state updates (Convex queries)
- Step navigation (follows template step order)
- Timer display (elapsed time since start)
- Secretary/facilitator controls (start, advance steps, close)
- Agenda item management:
  - Add agenda items (any participant)
  - View active agenda item
  - Take notes (markdown)
  - Mark items as processed
  - Create tasks from agenda items (links to Projects module)
- Presence tracking (attendees active in meeting)
- Attendee management (users join to become attendees)

**Key Concepts** (from Essentials):

- Meeting steps follow template step order (system-defined step types)
- Agenda items have processing state (`isProcessed`)
- Tasks created from agenda items link to `meetingId` and `agendaItemId`
- Attendees: Users join meetings (invited users or public meeting access)
- Recurrence instances: Each instance has its own meeting ID and state

**Layout**:

- Header: Meeting title, secretary selector, timer, start/close buttons
- Sidebar: Agenda items list ("To Process" / "Processed")
- Main content: Step-specific content (check-in, agenda, closing, etc.)

**States**:

- Not started: Waiting for secretary to start
- In progress: Active meeting with step navigation
- Closed: Meeting ended, shows summary

---

### Meeting Templates Management Page

**Route**: `/meetings/templates` (or `/meetings/templates/[id]` for edit)  
**File**: `src/routes/(authenticated)/meetings/templates/+page.svelte` (to be created)

**Purpose**: Create and edit workspace-level meeting templates

**Features**:

- List workspace templates (default templates + user-created)
- Create new template (RBAC permission required)
- Edit existing template (RBAC permission required)
- Template builder:
  - Name and description
  - Select and order system-defined template steps
  - Configure step settings (title, description, timebox)
- Delete template (if not in use)

**Key Concepts** (from Essentials):

- Templates are workspace-level (created by users with RBAC permissions)
- Templates act as both meeting structure and meeting type/category
- Step types are system-defined (check-in, agenda, metrics, projects, closing, custom)
- Users select and order steps when creating/editing templates
- Default templates (Governance, Weekly Tactical) seeded on workspace creation
- Templates are required when creating meetings

**Components Used**:

- Template list/grid view
- Template form (create/edit)
- Step selector/orderer
- Step configuration form

---

### Meeting Reports Page

**Route**: `/meetings/reports` (or tab within `/meetings`)  
**File**: `src/routes/(authenticated)/meetings/reports/+page.svelte` (to be created)

**Purpose**: View reports and analytics for meetings

**Features**:

- List closed meetings with summaries
- Meeting analytics:
  - Meeting frequency and attendance
  - Agenda items processed
  - Tasks created from meetings
  - Meeting duration trends
- Filter by:
  - Date range
  - Circle
  - Template/meeting type
  - Secretary/facilitator
- Export reports (optional)

**Key Concepts** (from Essentials):

- Reports show historical meeting data (closed meetings)
- Tasks created from meetings link to `meetingId` and `agendaItemId`
- Recurrence instances: Each instance has its own meeting ID and can be reported separately

**Components Used**:

- Meeting summary cards
- Analytics charts/graphs
- Filter controls
- Export functionality

---

## Components (View-Level)

### CreateMeetingModal

**Purpose**: Modal form for creating new meetings

**Key Fields** (aligned with Essentials):

- Title
- Meeting template (required - workspace-level templates)
- Start time and duration
- Circle selection (optional - supports ad-hoc meetings)
- Recurrence settings (optional - daily/weekly/monthly)
- Privacy: `public` (workspace members) or `private` (invited only)
- Attendee selection: Users, circle roles, or entire circles
- Secretary/facilitator selection

**Key Concepts**:

- Templates are workspace-level (created by users with RBAC permissions)
- Circle invitations: Inviting a circle creates inbox items for all circle members
- Circle membership: Users who join a circle after meeting creation are automatically invited

---

### AgendaItemView

**Purpose**: Main view for processing an agenda item during meeting

**Shows**:

- Agenda item title and order
- Notes editor (markdown)
- Tasks list (created from agenda items, links to Projects module)
- "Mark as Processed" button (secretary only)

**Key Concepts**:

- Tasks are from Projects module (not separate "action items" entity)
- Tasks link to `meetingId` and `agendaItemId` when created in meetings
- Processing state: boolean flag (`isProcessed`)

---

### AttendeeSelector

**Purpose**: Select meeting invitations (users, circle roles, or circles)

**Features**:

- Multi-select interface
- Supports polymorphic invitations:
  - Individual users
  - Circle roles (anyone filling role)
  - Entire circles
- Creates inbox items for invited users (via Core module)

**Key Concepts**:

- Invitations create inbox items (Core module)
- Circle invitations: All circle members receive inbox items
- Circle membership: Users in circle are considered invited (even if joined after meeting creation)

---

## View Patterns

### Real-Time Updates

- All meeting session views use Convex real-time queries
- Changes propagate instantly to all participants
- Presence tracking updates periodically

### Template-Based Steps

- Meeting flow follows template step order
- Step types are system-defined (check-in, agenda, metrics, projects, closing, custom)
- Steps guide meeting structure (not copied directly to meetings)

### Secretary/Facilitator Controls

- Only secretary can perform certain actions (start, advance steps, close)
- UI disables controls for non-secretary users
- Clear visual indicators of secretary status

### Agenda Processing Flow

- Agenda items split into "To Process" and "Processed" by `isProcessed` flag
- Secretary selects active item from "To Process" list
- Active item shows full view with notes and tasks
- Marking as processed moves item to "Processed" section

### Access Control

- **Public meetings**: All workspace members can join (become attendees)
- **Private meetings**: Only invited users (directly or via circle membership) can join
- **Circle membership**: Users in a circle linked to meeting are considered invited
