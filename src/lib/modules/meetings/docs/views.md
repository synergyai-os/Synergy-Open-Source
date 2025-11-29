# Meetings Module - Views

## Pages (Routes)

### Meetings List Page

**Route**: `/meetings`  
**File**: `src/routes/(authenticated)/meetings/+page.svelte`

**Purpose**: Main entry point for viewing and managing meetings

**Features**:

- Lists meetings organized by time:
  - Today's meetings (highlighted)
  - This week's meetings
  - Future meetings
  - Closed meetings
- Tab navigation: "My Meetings" and "Reports"
- Create meeting button (opens modal)
- Filter by circle (optional)

**Components Used**:

- `MeetingCard` - Displays meeting details in list
- `TodayMeetingCard` - Special card for today's meetings
- `CreateMeetingModal` - Modal for creating new meetings
- `UpcomingMeetingsPreview` - Preview component (if used)

**Data Sources**:

- `useMeetings` composable - Provides reactive meetings list
- Feature flag check: `meetings-module` (organization-based)

---

### Meeting Session Page

**Route**: `/meetings/[id]`  
**File**: `src/routes/(authenticated)/meetings/[id]/+page.svelte`

**Purpose**: Real-time collaborative meeting session

**Features**:

- Real-time meeting state updates
- Step navigation (Check-in, Agenda, Closing)
- Timer display (elapsed time since start)
- Secretary controls (start, advance steps, close)
- Agenda item management:
  - Add agenda items
  - View active agenda item
  - Take notes on agenda items
  - Mark items as processed
  - Create action items and decisions from agenda items
- Presence tracking (who's active in meeting)
- Secretary change workflow (request/approve)

**Layout**:

- Header: Meeting title, secretary selector, timer, start/close buttons
- Sidebar: Agenda items list (split into "To Process" and "Processed")
- Main content: Step-specific content
  - Check-in: Attendance list with presence indicators
  - Agenda: Active agenda item view with notes, action items, decisions
  - Closing: Meeting summary

**Components Used**:

- `AgendaItemView` - Main view for processing agenda items
- `SecretarySelector` - Select/change meeting secretary
- `SecretaryConfirmationDialog` - Approve/deny secretary change requests
- `ActionItemsList` - List of action items (within AgendaItemView)
- `DecisionsList` - List of decisions (within AgendaItemView)

**Data Sources**:

- `useMeetingSession` composable - Provides meeting state and actions
- `useMeetingPresence` composable - Provides presence tracking
- Real-time queries for agenda items, action items, decisions

**States**:

- Not started: Waiting for secretary to start
- In progress: Active meeting with step navigation
- Closed: Meeting ended, shows summary

---

## Components (View-Level)

### MeetingCard

**File**: `src/lib/modules/meetings/components/MeetingCard.svelte`

**Purpose**: Display meeting information in list view

**Shows**:

- Meeting title
- Meeting type badge
- Start time and duration
- Circle name (if circle-based)
- Attendee count
- Action buttons (start, view, etc.)

**Used In**:

- Meetings list page

---

### TodayMeetingCard

**File**: `src/lib/modules/meetings/components/TodayMeetingCard.svelte`

**Purpose**: Special card for today's meetings with emphasis

**Shows**:

- Same as MeetingCard but with highlighted styling
- Quick start button
- Time until meeting starts

**Used In**:

- Meetings list page (today section)

---

### CreateMeetingModal

**File**: `src/lib/modules/meetings/components/CreateMeetingModal.svelte`

**Purpose**: Modal form for creating new meetings

**Fields**:

- Title
- Meeting type (required)
- Start time and duration
- Circle selection (optional)
- Template selection (optional)
- Recurrence settings (optional)
- Visibility (public/circle/private)
- Attendee selection (users, roles, circles)

**Components Used**:

- `AttendeeSelector` - Select meeting attendees
- `RecurrenceField` - Configure recurrence
- `SecretarySelector` - Select meeting secretary/facilitator

**Used In**:

- Meetings list page (triggered by "Add meeting" button)

---

### AgendaItemView

**File**: `src/lib/modules/meetings/components/AgendaItemView.svelte`

**Purpose**: Main view for processing an agenda item during meeting

**Shows**:

- Agenda item title
- Notes editor (markdown)
- Action items list (create, view, edit)
- Decisions list (create, view, edit)
- "Mark as Processed" button (secretary only)

**Components Used**:

- `ActionItemsList` - Display and manage action items
- `DecisionsList` - Display and manage decisions

**Used In**:

- Meeting session page (agenda step)

---

### ActionItemsList

**File**: `src/lib/modules/meetings/components/ActionItemsList.svelte`

**Purpose**: Display and manage action items for an agenda item

**Shows**:

- List of action items with:
  - Description
  - Assignee (user or role)
  - Status (todo/in-progress/done)
  - Due date (if set)
- Create action item form
- Edit/delete actions

**Used In**:

- AgendaItemView component

---

### DecisionsList

**File**: `src/lib/modules/meetings/components/DecisionsList.svelte`

**Purpose**: Display and manage decisions for an agenda item

**Shows**:

- List of decisions with:
  - Title
  - Description (markdown)
  - Decided timestamp
- Create decision form
- Edit/delete actions

**Used In**:

- AgendaItemView component

---

### SecretarySelector

**File**: `src/lib/modules/meetings/components/SecretarySelector.svelte`

**Purpose**: Select or change meeting secretary/facilitator

**Features**:

- Shows current secretary name
- Dropdown to select new secretary (from attendees)
- Triggers secretary change request workflow

**Used In**:

- Meeting session page (header)
- CreateMeetingModal

---

### SecretaryConfirmationDialog

**File**: `src/lib/modules/meetings/components/SecretaryConfirmationDialog.svelte`

**Purpose**: Dialog for current secretary to approve/deny change requests

**Shows**:

- Request details (who requested, who they want as secretary)
- Approve/Deny buttons

**Used In**:

- Meeting session page (appears when request is pending)

---

### AttendeeSelector

**File**: `src/lib/modules/meetings/components/AttendeeSelector.svelte`

**Purpose**: Select meeting attendees (users, roles, or circles)

**Features**:

- Multi-select interface
- Supports polymorphic attendees:
  - Individual users
  - Circle roles (anyone filling role)
  - Entire circles
- Shows selected attendees as chips

**Used In**:

- CreateMeetingModal

---

### AttendeeChip

**File**: `src/lib/modules/meetings/components/AttendeeChip.svelte`

**Purpose**: Display a single attendee (user, role, or circle)

**Shows**:

- Attendee name
- Type indicator (user/role/circle)
- Remove button (if editable)

**Used In**:

- AttendeeSelector
- Meeting session page (attendance list)

---

### RecurrenceField

**File**: `src/lib/modules/meetings/components/RecurrenceField.svelte`

**Purpose**: Configure meeting recurrence settings

**Fields**:

- Frequency (daily/weekly/monthly)
- Interval (every N days/weeks/months)
- Days of week (for weekly)
- End date (optional)

**Used In**:

- CreateMeetingModal

---

### UpcomingMeetingsPreview

**File**: `src/lib/modules/meetings/components/UpcomingMeetingsPreview.svelte`

**Purpose**: Preview component for upcoming meetings (if used in dashboard or elsewhere)

**Shows**:

- List of upcoming meetings
- Quick access to start/view meetings

**Used In**:

- Potentially dashboard or other pages (if implemented)

---

## View Patterns

### Real-Time Updates

- All meeting session views use Convex real-time queries
- Changes propagate instantly to all participants
- Presence tracking updates every 30 seconds

### Secretary Controls

- Only secretary can perform certain actions:
  - Start meeting
  - Advance steps
  - Close meeting
  - Switch active agenda item
- UI disables controls for non-secretary users
- Clear visual indicators of secretary status

### Step-Based Navigation

- Meeting progresses through predefined steps
- Step navigation tabs visible only when meeting is started
- Each step has distinct UI and functionality

### Agenda Processing Flow

- Agenda items split into "To Process" and "Processed"
- Secretary selects active item from "To Process" list
- Active item shows full view with notes, action items, decisions
- Marking as processed moves item to "Processed" section
- Auto-selects next unprocessed item when current is processed
