# Meetings Essentials Alignment Plan

**Goal**: Align codebase implementation with the vision defined in `src/lib/modules/meetings/docs/essentials.md`

**Status**: Planning Phase - No code changes yet

**Last Updated**: 2025-01-27

---

## Executive Summary

This plan aligns the Meetings module codebase with the vision documented in `essentials.md`. The essentials document defines the target state - this plan tracks the work needed to get there.

### Key Changes:

1. ✅ Remove `meetingDecisions` entity completely
2. ✅ Remove secretary/facilitator functionality
3. ⬜ **Merge Meeting Type = Meeting Template** (templates ARE the type, templates required)
4. ⬜ **Rename Action Items → Tasks** (from Projects module)
5. ⬜ Remove `project` type from tasks (always individual tasks)
6. ⬜ Add `projectId` optional field to tasks
7. ⬜ Make tasks work standalone OR in meetings
8. ⬜ **Refactor Meeting Attendees** (remove polymorphism, simple user-meeting relation)
9. ⬜ **Add Meeting Invitations entity** (can invite users or circles)
10. ⬜ **Update Privacy** (remove 'circle', only 'public' | 'private')
11. ⬜ **Clarify Template Steps** (system-defined, users select and order)

---

## Phase 1: Vision Decisions ✅ CLARIFIED

### 1.1 Decisions Entity ✅

- **Decision**: Remove `meetingDecisions` completely from codebase
- **Rationale**: Not part of current vision
- **Impact**: Remove schema, backend, frontend, tests

### 1.2 Secretary/Facilitator ✅

- **Decision**: Remove all secretary/facilitator functionality
- **Rationale**: Not important right now, simplifies vision
- **Impact**: Remove `secretaryId`, `secretaryChangeRequests`, related code

### 1.3 Meeting Type = Meeting Template ⬜ NEW

- **Decision**: Meeting Type and Meeting Template are the same concept
  - Templates ARE the meeting type/category
  - Templates are REQUIRED (not optional)
  - Remove separate `meetingType` enum field from meetings table
- **Rationale**: One concept, two names (UI vs system). Simplifies model.
- **Impact**:
  - Remove `meetingType` field from `meetings` table
  - Make `templateId` required (not optional)
  - Update all queries/mutations that reference `meetingType`
  - Update frontend to use templates for type selection
  - Migration: Map existing `meetingType` values to templates

### 1.4 Action Items → Tasks ⬜ NEW

- **Decision**: Rename "Action Items" to "Tasks" throughout codebase
  - Entity is from Projects module (not Meetings module)
  - Table name: `meetingActionItems` → `tasks` (or keep table name, rename in code)
- **Rationale**: Clearer naming, aligns with Projects module ownership
- **Impact**:
  - Rename files, functions, variables
  - Update documentation
  - Update API types/interfaces

### 1.5 Tasks Type Field ✅

- **Decision**: Tasks are always individual tasks (remove `project` type)
- **Rationale**: Projects are separate entities; tasks link to projects via `projectId`
- **Impact**: Schema change, backend mutations, frontend forms, tests

### 1.6 Tasks Ownership ✅

- **Decision**: Tasks are a Projects module entity (used by Meetings)
- **Rationale**: Tasks can exist standalone, not just in meetings
- **Documentation Updated**: Both `projects/README.md` and `meetings/docs/essentials.md`

### 1.7 Meeting Attendees Refactor ⬜ NEW

- **Decision**: Remove polymorphic attendee types
  - Attendees are simple user-meeting relations
  - No `attendeeType` field ('user' | 'role' | 'circle')
  - Attendees created when users JOIN meetings (not when invited)
- **Rationale**: Invitations handle user/circle invites; attendees are actual participants
- **Impact**:
  - Remove `attendeeType`, `circleRoleId`, `circleId` from `meetingAttendees` table
  - Keep only `userId` and `meetingId`
  - Update all attendee-related code

### 1.8 Meeting Invitations ⬜ NEW

- **Decision**: Add new `meetingInvitations` entity
  - Can invite specific users or entire circles
  - Creates inbox items for invited users
  - Dynamic: Users who join circles after meeting creation are considered invited
- **Rationale**: Separates invitation (who can join) from attendance (who joined)
- **Impact**:
  - Add new `meetingInvitations` table
  - Create invitation mutations/queries
  - Update meeting creation flow

### 1.9 Privacy Controls ⬜ NEW

- **Decision**: Remove 'circle' privacy option
  - Only `public` (all workspace members) and `private` (only invited)
  - Circle membership grants invitation status dynamically
- **Rationale**: Simpler model, circle membership handled via invitations
- **Impact**:
  - Update `visibility` field enum
  - Remove 'circle' option from UI
  - Update access control logic

### 1.10 Template Steps Clarification ✅

- **Decision**: Template steps are system-defined (created by System Admin)
  - Users select and order steps when building templates
  - Step types are built into the system
- **Rationale**: Step types are system-defined, users compose them
- **Documentation Updated**: `meetings/docs/essentials.md`

---

## Phase 2: Schema Changes

### 2.1 Remove Decisions Entity

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: None

#### Steps:

1. Remove `meetingDecisions` table from `convex/schema.ts`
2. Remove all indexes: `by_meeting`, `by_agenda_item`, `by_circle`
3. Verify no other tables reference `meetingDecisions`

#### Files to Modify:

- `convex/schema.ts` - Remove table definition

#### Files to Delete:

- `convex/meetingDecisions.ts`
- `src/lib/modules/meetings/composables/useDecisions.svelte.ts`
- `src/lib/modules/meetings/composables/useDecisionsForm.svelte.ts`
- `src/lib/modules/meetings/__tests__/meetingDecisions.integration.test.ts`

#### Verification:

```bash
grep -r "meetingDecisions" convex/
grep -r "useDecisions" src/lib/modules/meetings/
```

---

### 2.2 Remove Secretary/Facilitator Functionality

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: None

#### Steps:

1. Remove `secretaryId` field from `meetings` table
2. Remove `secretaryChangeRequests` table
3. Remove all related indexes

#### Schema Changes (`convex/schema.ts`):

```typescript
// REMOVE from meetings table:
secretaryId: v.optional(v.id('users'))

// REMOVE entire table:
secretaryChangeRequests: defineTable({...})
```

#### Files to Modify:

- `convex/schema.ts` - Remove fields and table
- `convex/meetings.ts` - Remove secretary mutations

#### Files to Delete:

- `src/lib/modules/meetings/components/SecretaryConfirmationDialog.svelte` (if exists)

#### Code to Remove from `convex/meetings.ts`:

- `requestSecretaryChange` mutation
- `approveSecretaryChange` mutation
- `denySecretaryChange` mutation
- Any `secretaryId` references in queries/mutations

#### Verification:

```bash
grep -r "secretaryId\|secretaryChange" convex/
grep -r "Secretary" src/lib/modules/meetings/
```

---

### 2.3 Merge Meeting Type = Meeting Template ⬜ NEW

**Priority**: Critical  
**Estimated Effort**: High  
**Blocking**: Blocks many other changes

#### Steps:

1. **Remove `meetingType` field from `meetings` table**:

   ```typescript
   // REMOVE:
   meetingType: v.union(
   	v.literal('standup'),
   	v.literal('retrospective')
   	// ... etc
   );
   ```

2. **Make `templateId` required**:

   ```typescript
   // CHANGE from:
   templateId: v.optional(v.id('meetingTemplates'));

   // TO:
   templateId: v.id('meetingTemplates'); // Required
   ```

3. **Remove `by_meeting_type` index**:

   ```typescript
   // REMOVE:
   .index('by_meeting_type', ['workspaceId', 'meetingType'])
   ```

4. **Update `meetingTemplates` table** (if needed):
   - Ensure templates can act as types/categories
   - May need to add fields to distinguish template types

#### Migration Strategy:

1. **Create templates for all existing meeting types**:
   - Query all unique `meetingType` values
   - Create default templates for each type (if they don't exist)
   - Map each meeting to appropriate template

2. **Migration script**:
   ```typescript
   // For each meeting:
   // 1. Find or create template matching meetingType
   // 2. Set templateId = template._id
   // 3. Remove meetingType field
   ```

#### Files to Modify:

- `convex/schema.ts` - Remove `meetingType`, make `templateId` required
- `convex/meetings.ts` - Update all mutations/queries
- `src/lib/modules/meetings/api.ts` - Remove `MeetingType` enum, update `Meeting` interface

#### Verification:

```bash
grep -r "meetingType" convex/
grep -r "MeetingType" src/lib/modules/meetings/
```

---

### 2.4 Update Privacy - Remove 'circle' Option ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: None

#### Steps:

1. **Update `visibility` field enum**:

   ```typescript
   // CHANGE from:
   visibility: v.union(v.literal('public'), v.literal('circle'), v.literal('private'));

   // TO:
   visibility: v.union(v.literal('public'), v.literal('private'));
   ```

2. **Migration**: Convert 'circle' visibility to 'private'
   - All meetings with `visibility: 'circle'` → `visibility: 'private'`
   - Circle membership handled via invitations

#### Files to Modify:

- `convex/schema.ts` - Update enum
- `convex/meetings.ts` - Update validation logic
- `src/lib/modules/meetings/api.ts` - Update type

#### Verification:

```bash
grep -r "visibility.*circle" convex/
grep -r "'circle'" src/lib/modules/meetings/
```

---

### 2.5 Add Meeting Invitations Entity ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: None

#### Steps:

1. **Add `meetingInvitations` table**:

   ```typescript
   meetingInvitations: defineTable({
   	meetingId: v.id('meetings'),

   	// Polymorphic invitation (exactly one must be set)
   	invitationType: v.union(
   		v.literal('user'), // Specific user
   		v.literal('circle') // Entire circle
   	),
   	userId: v.optional(v.id('users')),
   	circleId: v.optional(v.id('circles')),

   	createdAt: v.number(),
   	createdBy: v.id('users')
   })
   	.index('by_meeting', ['meetingId'])
   	.index('by_user', ['userId'])
   	.index('by_circle', ['circleId']);
   ```

2. **Note**: Circle membership grants invitation dynamically
   - Users in circles linked to meeting are considered invited
   - No need to create invitation records for all circle members

#### Files to Modify:

- `convex/schema.ts` - Add table

#### Files to Create:

- `convex/meetingInvitations.ts` - Mutations/queries

---

### 2.6 Refactor Meeting Attendees - Remove Polymorphism ⬜ NEW

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 2.5 complete

#### Steps:

1. **Simplify `meetingAttendees` table**:

   ```typescript
   // CHANGE from:
   meetingAttendees: defineTable({
   	meetingId: v.id('meetings'),
   	attendeeType: v.union(v.literal('user'), v.literal('role'), v.literal('circle')),
   	userId: v.optional(v.id('users')),
   	circleRoleId: v.optional(v.id('circleRoles')),
   	circleId: v.optional(v.id('circles')),
   	addedAt: v.number()
   });

   // TO:
   meetingAttendees: defineTable({
   	meetingId: v.id('meetings'),
   	userId: v.id('users'), // Required, always a user
   	joinedAt: v.number() // When user joined
   })
   	.index('by_meeting', ['meetingId'])
   	.index('by_user', ['userId'])
   	.index('by_meeting_user', ['meetingId', 'userId']); // For upserts
   ```

2. **Migration**:
   - Resolve polymorphic attendees to actual users
   - For 'role' attendees: Find all users filling that role, create attendee records
   - For 'circle' attendees: Find all circle members, create attendee records
   - Delete old polymorphic records

#### Files to Modify:

- `convex/schema.ts` - Simplify table
- `convex/meetings.ts` - Update `addAttendee` mutation (remove polymorphism)
- `convex/meetingPresence.ts` - Update `getExpectedAttendees` query

#### Verification:

```bash
grep -r "attendeeType\|circleRoleId" convex/
grep -r "AttendeeType" src/lib/modules/meetings/
```

---

### 2.7 Update Tasks Schema - Remove `project` Type

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Must complete before 2.8

#### Steps:

1. **Remove `type` field entirely** (always `'next-step'` implicitly):

```typescript
// IN convex/schema.ts

meetingActionItems: defineTable({
	meetingId: v.id('meetings'),
	agendaItemId: v.id('meetingAgendaItems')
	// ... other fields ...

	// REMOVE THIS LINE:
	// type: v.union(v.literal('next-step'), v.literal('project')),

	// ... rest of fields ...
});
```

#### Rationale:

- Tasks are always individual tasks (`next-step`)
- Projects are separate entities
- No need to store constant value

#### Files to Modify:

- `convex/schema.ts`

---

### 2.8 Update Tasks Schema - Add `projectId` & Make Optional Fields

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 2.7 complete

#### Steps:

1. **Add `projectId` field**:

```typescript
projectId: v.optional(v.id('projects'));
```

2. **Make `meetingId` optional**:

```typescript
meetingId: v.optional(v.id('meetings'));
```

3. **Make `agendaItemId` optional**:

```typescript
agendaItemId: v.optional(v.id('meetingAgendaItems'));
```

4. **Add `workspaceId` field** (required):

```typescript
workspaceId: v.id('workspaces');
```

5. **Update indexes**:

```typescript
.index('by_workspace', ['workspaceId'])
.index('by_project', ['projectId'])
// Keep existing: by_meeting, by_agenda_item, by_assignee_user
```

#### Final Schema:

```typescript
meetingActionItems: defineTable({
	workspaceId: v.id('workspaces'), // NEW - required
	meetingId: v.optional(v.id('meetings')), // CHANGED - now optional
	agendaItemId: v.optional(v.id('meetingAgendaItems')), // CHANGED - now optional
	circleId: v.optional(v.id('circles')),
	projectId: v.optional(v.id('projects')), // NEW - optional

	// Assignment (polymorphic)
	assigneeType: v.union(v.literal('user'), v.literal('role')),
	assigneeUserId: v.optional(v.id('users')),
	assigneeRoleId: v.optional(v.id('circleRoles')),

	// Details
	description: v.string(),
	dueDate: v.optional(v.number()),
	status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),

	// External sync (Phase 3)
	linearTicketId: v.optional(v.string()),
	notionPageId: v.optional(v.string()),

	// Metadata
	createdAt: v.number(),
	createdBy: v.id('users'),
	updatedAt: v.optional(v.number())
})
	.index('by_workspace', ['workspaceId']) // NEW
	.index('by_meeting', ['meetingId'])
	.index('by_agenda_item', ['agendaItemId'])
	.index('by_assignee_user', ['assigneeUserId'])
	.index('by_project', ['projectId']); // NEW
```

#### Validation Logic:

- `workspaceId` is always required
- If `meetingId` is provided, `agendaItemId` should be provided (meeting context)
- If `meetingId` is null, task is standalone
- `projectId` is always optional (can link later)

#### Files to Modify:

- `convex/schema.ts`

---

## Phase 3: Backend Changes

### 3.1 Remove Decisions Backend Code

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Requires 2.1 complete

#### Steps:

1. Delete `convex/meetingDecisions.ts` file
2. Remove imports/references in other files
3. Update API exports

#### Files to Delete:

- `convex/meetingDecisions.ts`

#### Files to Check for Imports:

- `convex/http.ts`
- `convex/_generated/api.d.ts` (auto-generated, will update)
- Any files importing `meetingDecisions`

#### Verification:

```bash
grep -r "meetingDecisions" convex/
```

---

### 3.2 Remove Secretary Backend Code

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 2.2 complete

#### Steps:

1. **Remove mutations from `convex/meetings.ts`**:
   - Delete `requestSecretaryChange` mutation
   - Delete `approveSecretaryChange` mutation
   - Delete `denySecretaryChange` mutation

2. **Remove `secretaryId` references**:
   - Search for all `secretaryId` in mutations/queries
   - Remove from create/update logic
   - Remove from query responses

#### Files to Modify:

- `convex/meetings.ts`

#### Verification:

```bash
grep -r "secretary\|Secretary" convex/meetings.ts
```

---

### 3.3 Update Meetings Backend - Merge Type = Template ⬜ NEW

**Priority**: Critical  
**Estimated Effort**: High  
**Blocking**: Requires 2.3 complete

#### Steps:

1. **Update `create` mutation** (`convex/meetings.ts`):

   ```typescript
   // REMOVE from args:
   meetingType: v.union(...)

   // CHANGE:
   templateId: v.optional(v.id('meetingTemplates'))
   // TO:
   templateId: v.id('meetingTemplates') // Required

   // REMOVE from insert:
   meetingType: args.meetingType
   ```

2. **Update `update` mutation**:

   ```typescript
   // REMOVE meetingType from args
   // Keep templateId (can be updated)
   ```

3. **Update `list` query**:

   ```typescript
   // REMOVE from args:
   meetingType: v.optional(...)

   // REMOVE filtering:
   if (args.meetingType) {
     items = items.filter((item) => item.meetingType === args.meetingType);
   }

   // ADD filtering by template:
   if (args.templateId) {
     items = items.filter((item) => item.templateId === args.templateId);
   }
   ```

4. **Update `get` query**:
   - Remove `meetingType` from response
   - Ensure `templateId` is always present

#### Files to Modify:

- `convex/meetings.ts`
  - `create` mutation
  - `update` mutation
  - `list` query
  - `get` query

---

### 3.4 Update Privacy Backend ⬜ NEW

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Requires 2.4 complete

#### Steps:

1. **Update validation** in `create`/`update` mutations:

   ```typescript
   // REMOVE 'circle' from allowed values
   // Only allow 'public' | 'private'
   ```

2. **Update access control logic**:
   - Remove circle-specific visibility checks
   - Use invitations for access control instead

#### Files to Modify:

- `convex/meetings.ts` - Update validation
- Any access control queries

---

### 3.5 Add Meeting Invitations Backend ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 2.5 complete

#### Steps:

1. **Create `convex/meetingInvitations.ts`**:

   ```typescript
   export const createInvitation = mutation({
   	args: {
   		sessionId: v.string(),
   		meetingId: v.id('meetings'),
   		invitationType: v.union(v.literal('user'), v.literal('circle')),
   		userId: v.optional(v.id('users')),
   		circleId: v.optional(v.id('circles'))
   	},
   	handler: async (ctx, args) => {
   		// Validate session
   		// Verify meeting exists
   		// Create invitation
   		// Create inbox items for users (if user) or circle members (if circle)
   	}
   });

   export const listInvitations = query({
   	args: {
   		sessionId: v.string(),
   		meetingId: v.id('meetings')
   	},
   	handler: async (ctx, args) => {
   		// Return all invitations for meeting
   	}
   });
   ```

2. **Update meeting creation**:
   - When creating meeting, create invitations for invited users/circles
   - Create inbox items for invited users

#### Files to Create:

- `convex/meetingInvitations.ts`

#### Files to Modify:

- `convex/meetings.ts` - Update `create` mutation to create invitations

---

### 3.6 Update Attendees Backend - Remove Polymorphism ⬜ NEW

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 2.6 complete

#### Steps:

1. **Update `addAttendee` mutation** (`convex/meetings.ts`):

   ```typescript
   // CHANGE from:
   export const addAttendee = mutation({
     args: {
       attendeeType: v.union(...),
       userId: v.optional(...),
       circleRoleId: v.optional(...),
       circleId: v.optional(...)
     }
   })

   // TO:
   export const addAttendee = mutation({
     args: {
       sessionId: v.string(),
       meetingId: v.id('meetings'),
       userId: v.id('users') // Required, always a user
     },
     handler: async (ctx, args) => {
       // Verify user can join (invited or public meeting)
       // Create attendee record
       // Return attendeeId
     }
   });
   ```

2. **Update `removeAttendee` mutation**:

   ```typescript
   // Simplify to just userId and meetingId
   ```

3. **Update `getExpectedAttendees` query** (`convex/meetingPresence.ts`):
   ```typescript
   // Remove polymorphic resolution logic
   // Just return actual attendees (users who joined)
   // Use invitations to determine who CAN join
   ```

#### Files to Modify:

- `convex/meetings.ts` - Update `addAttendee`, `removeAttendee`
- `convex/meetingPresence.ts` - Update `getExpectedAttendees`

---

### 3.7 Update Tasks Backend - Remove Type Field

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 2.7 complete

#### Steps:

1. **Update `create` mutation** (`convex/meetingActionItems.ts`):

   ```typescript
   // REMOVE from args:
   type: v.union(v.literal('next-step'), v.literal('project'));

   // REMOVE from insert:
   type: args.type;
   ```

2. **Update `update` mutation**:

   ```typescript
   // REMOVE from args:
   type: v.optional(v.union(v.literal('next-step'), v.literal('project')));

   // REMOVE from update logic:
   if (args.type !== undefined) updates.type = args.type;
   ```

3. **Update `list` query**:

   ```typescript
   // REMOVE from args:
   type: v.optional(v.union(v.literal('next-step'), v.literal('project')));

   // REMOVE filtering:
   if (args.type) {
   	items = items.filter((item) => item.type === args.type);
   }
   ```

#### Files to Modify:

- `convex/meetingActionItems.ts`
  - `create` mutation
  - `update` mutation
  - `list` query

---

### 3.8 Update Tasks Backend - Add Project Link

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 2.8 complete

#### Steps:

1. **Update `create` mutation**:

   ```typescript
   args: {
     // ... existing args ...
     projectId: v.optional(v.id('projects')), // ADD THIS
   }

   // In insert:
   projectId: args.projectId, // ADD THIS
   ```

2. **Update `update` mutation**:

   ```typescript
   args: {
     // ... existing args ...
     projectId: v.optional(v.id('projects')), // ADD THIS
   }

   // In updates object:
   if (args.projectId !== undefined) updates.projectId = args.projectId;
   ```

3. **Add query to list by project** (optional, for future):
   ```typescript
   export const listByProject = query({
   	args: {
   		sessionId: v.string(),
   		projectId: v.id('projects')
   	},
   	handler: async (ctx, args) => {
   		// Implementation
   	}
   });
   ```

#### Files to Modify:

- `convex/meetingActionItems.ts`

---

### 3.9 Update Tasks Backend - Make Meeting/Agenda Optional

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 2.8 complete

#### Steps:

1. **Update `create` mutation** - Make meeting/agenda optional, add workspace:

   ```typescript
   args: {
     sessionId: v.string(),
     workspaceId: v.id('workspaces'), // NEW - required
     meetingId: v.optional(v.id('meetings')), // CHANGED - optional
     agendaItemId: v.optional(v.id('meetingAgendaItems')), // CHANGED - optional
     // ... rest of args ...
   }
   ```

2. **Add validation logic**:

   ```typescript
   handler: async (ctx, args) => {
   	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

   	// Verify workspace access
   	await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

   	// If meeting provided, verify it belongs to workspace
   	if (args.meetingId) {
   		const meeting = await ctx.db.get(args.meetingId);
   		if (!meeting) throw new Error('Meeting not found');
   		if (meeting.workspaceId !== args.workspaceId) {
   			throw new Error('Meeting does not belong to this workspace');
   		}

   		// If meeting provided, agenda item should be provided
   		if (!args.agendaItemId) {
   			throw new Error('agendaItemId required when meetingId is provided');
   		}

   		// Verify agenda item belongs to meeting
   		const agendaItem = await ctx.db.get(args.agendaItemId);
   		if (!agendaItem || agendaItem.meetingId !== args.meetingId) {
   			throw new Error('Agenda item not found or does not belong to this meeting');
   		}
   	}

   	// Create task
   	const taskId = await ctx.db.insert('meetingActionItems', {
   		workspaceId: args.workspaceId,
   		meetingId: args.meetingId,
   		agendaItemId: args.agendaItemId
   		// ... rest of fields ...
   	});

   	return { taskId };
   };
   ```

3. **Add new query for standalone tasks**:

   ```typescript
   export const listByWorkspace = query({
   	args: {
   		sessionId: v.string(),
   		workspaceId: v.id('workspaces'),
   		includeLinkedToMeetings: v.optional(v.boolean())
   	},
   	handler: async (ctx, args) => {
   		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
   		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

   		const items = await ctx.db
   			.query('meetingActionItems')
   			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
   			.collect();

   		// Filter based on meeting link
   		if (!args.includeLinkedToMeetings) {
   			return items.filter((item) => !item.meetingId);
   		}

   		return items;
   	}
   });
   ```

#### Files to Modify:

- `convex/meetingActionItems.ts`
  - `create` mutation
  - Add `listByWorkspace` query

---

## Phase 4: Frontend Changes

### 4.1 Remove Decisions UI Components

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Requires 3.1 complete

#### Steps:

1. Delete decisions composables
2. Delete decisions components (if any)
3. Remove decisions UI from meeting views

#### Files to Delete:

- `src/lib/modules/meetings/composables/useDecisions.svelte.ts`
- `src/lib/modules/meetings/composables/useDecisionsForm.svelte.ts`
- Any components importing these composables

#### Files to Check:

- Meeting detail views
- Agenda item components

#### Verification:

```bash
grep -r "useDecisions\|DecisionsList" src/lib/modules/meetings/
```

---

### 4.2 Remove Secretary UI Components

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.2 complete

#### Steps:

1. Delete secretary confirmation dialog
2. Remove secretary UI from meeting views
3. Remove secretary selection from meeting forms

#### Files to Delete:

- `src/lib/modules/meetings/components/SecretaryConfirmationDialog.svelte`

#### Files to Modify:

- Meeting creation/edit forms (remove secretary selection)
- Meeting detail views (remove secretary display)
- Any components showing secretary info

#### Verification:

```bash
grep -r "secretary\|Secretary" src/lib/modules/meetings/components/
```

---

### 4.3 Update Meeting Forms - Template Required ⬜ NEW

**Priority**: Critical  
**Estimated Effort**: High  
**Blocking**: Requires 3.3 complete

#### Steps:

1. **Update meeting creation form**:
   - Remove `meetingType` dropdown/selection
   - Make template selection required (not optional)
   - Update validation

2. **Update meeting edit form**:
   - Remove `meetingType` field
   - Allow template change (with validation)

3. **Update meeting list/filters**:
   - Remove filter by `meetingType`
   - Add filter by template (if needed)

#### Files to Modify:

- `src/lib/modules/meetings/composables/useMeetingsForm.svelte.ts`
- Meeting creation/edit components
- Meeting list components

---

### 4.4 Update Privacy UI - Remove 'circle' Option ⬜ NEW

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Requires 3.4 complete

#### Steps:

1. **Update privacy selector**:
   - Remove 'circle' option from dropdown
   - Only show 'public' and 'private'

2. **Update help text**:
   - Clarify that circle membership grants invitation status

#### Files to Modify:

- Meeting creation/edit forms
- Privacy selector components

---

### 4.5 Add Meeting Invitations UI ⬜ NEW

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 3.5 complete

#### Steps:

1. **Update meeting creation form**:
   - Add invitation section
   - Allow inviting users or circles
   - Show invited users/circles list

2. **Create invitation components**:
   - `InvitationSelector.svelte` - Select users/circles to invite
   - `InvitationsList.svelte` - Show current invitations

3. **Update meeting detail view**:
   - Show invitations list
   - Allow adding/removing invitations

#### Files to Create:

- `src/lib/modules/meetings/components/InvitationSelector.svelte`
- `src/lib/modules/meetings/components/InvitationsList.svelte`
- `src/lib/modules/meetings/composables/useInvitations.svelte.ts`

#### Files to Modify:

- Meeting creation/edit forms
- Meeting detail views

---

### 4.6 Update Attendees UI - Remove Polymorphism ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.6 complete

#### Steps:

1. **Update attendee components**:
   - Remove attendee type selection
   - Show only actual attendees (users who joined)
   - Use invitations to show who can join

2. **Update attendee list**:
   - Remove type badges ('user' | 'role' | 'circle')
   - Show simple user list

#### Files to Modify:

- `src/lib/modules/meetings/components/AttendeeChip.svelte`
- `src/lib/modules/meetings/composables/useAttendeeSelection.svelte.ts`
- Attendee list components

---

### 4.7 Update Tasks Forms - Remove Type Toggle

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.7 complete

#### Steps:

1. **Update `useActionItemsForm.svelte.ts`**:

   ```typescript
   // REMOVE from state:
   type: 'next-step' as 'next-step' | 'project'

   // REMOVE from resetForm:
   state.type = 'next-step';

   // REMOVE from interface:
   get type(): 'next-step' | 'project';
   set type(value: 'next-step' | 'project');

   // UPDATE handleCreate - remove type parameter:
   await convexClient?.mutation(api.meetingActionItems.create, {
     // ... other params ...
     // REMOVE: type: state.type,
   });
   ```

2. **Update `ActionItemsList.svelte`**:

   ```svelte
   <!-- REMOVE type toggle UI -->
   <!-- REMOVE lines with: -->
   <!-- onclick={() => (form.type = form.type === 'next-step' ? 'project' : 'next-step')} -->
   <!-- {form.type === 'next-step' ? '⚡ Next Step' : '📦 Project'} -->

   <!-- REMOVE from display: -->
   <!-- {item.type === 'next-step' ? 'Next Step' : 'Project'} -->
   ```

#### Files to Modify:

- `src/lib/modules/meetings/composables/useActionItemsForm.svelte.ts`
- `src/lib/modules/meetings/components/ActionItemsList.svelte`

---

### 4.8 Update Tasks Forms - Add Project Selection

**Priority**: Medium  
**Estimated Effort**: High  
**Blocking**: Requires 3.8 complete

**NOTE**: This should be one of the last steps. Needs Projects module to exist first.

#### Steps:

1. **Add project selection to form state**:

   ```typescript
   // In useActionItemsForm.svelte.ts
   const state = $state({
   	// ... existing state ...
   	projectId: null as Id<'projects'> | null // NEW
   });
   ```

2. **Add project selector component** (future work):
   - Create `ProjectSelector.svelte` component
   - Fetch available projects for workspace
   - Allow selection or creation of project

3. **Update create/update mutations**:
   ```typescript
   await convexClient?.mutation(api.meetingActionItems.create, {
   	// ... existing params ...
   	projectId: state.projectId ?? undefined // NEW
   });
   ```

#### Files to Modify:

- `src/lib/modules/meetings/composables/useActionItemsForm.svelte.ts`
- `src/lib/modules/meetings/components/ActionItemsList.svelte`

#### Files to Create (future):

- `src/lib/modules/projects/components/ProjectSelector.svelte`
- `src/lib/modules/projects/composables/useProjects.svelte.ts`

#### Dependencies:

- ⚠️ Requires Projects module to be implemented first
- ⚠️ Requires `projects` table in schema
- ⚠️ Requires project queries/mutations

---

### 4.9 Rename Action Items → Tasks ⬜ NEW

**Priority**: Medium  
**Estimated Effort**: High  
**Blocking**: None (can be done incrementally)

#### Steps:

1. **Rename files**:
   - `useActionItemsForm.svelte.ts` → `useTasksForm.svelte.ts`
   - `ActionItemsList.svelte` → `TasksList.svelte`
   - `meetingActionItems.ts` → `tasks.ts` (or keep backend name)

2. **Update imports/references**:
   - Search and replace "actionItem" → "task"
   - Update component names
   - Update API calls

3. **Update UI labels**:
   - "Action Items" → "Tasks"
   - Update all user-facing text

#### Files to Rename:

- All action item related files

#### Files to Modify:

- All files importing action item components/composables

---

## Phase 5: Testing Updates

### 5.1 Remove Decisions Tests

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Requires 2.1, 3.1 complete

#### Steps:

1. Delete decisions integration tests

#### Files to Delete:

- `src/lib/modules/meetings/__tests__/meetingDecisions.integration.test.ts`

---

### 5.2 Update Meeting Tests - Template Required ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.3 complete

#### Steps:

1. **Update meeting creation tests**:
   - Remove `meetingType` from test data
   - Add required `templateId` to test data
   - Update assertions

2. **Add template creation helpers**:
   - Create test templates for each test
   - Ensure templates exist before creating meetings

#### Files to Modify:

- `src/lib/modules/meetings/__tests__/meetings.integration.test.ts`

---

### 5.3 Update Attendees Tests - Remove Polymorphism ⬜ NEW

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.6 complete

#### Steps:

1. **Update attendee tests**:
   - Remove tests for role/circle attendees
   - Update to only test user attendees
   - Test invitation flow separately

#### Files to Modify:

- `src/lib/modules/meetings/__tests__/meetings.integration.test.ts`

---

### 5.4 Update Tasks Tests - Remove Type Tests

**Priority**: High  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.7 complete

#### Steps:

1. **Remove type-related test cases** in `meetingActionItems.integration.test.ts`:
   - Remove tests with `type: 'project'`
   - Remove assertions checking `type` field
   - Update create/update calls to remove `type` parameter

#### Example Changes:

```typescript
// REMOVE test cases like:
test('create action item with project type', async () => {
	const result = await t.mutation(api.meetingActionItems.create, {
		// ...
		type: 'project' // REMOVE THIS
	});
	expect(result.type).toBe('project'); // REMOVE THIS ASSERTION
});
```

#### Files to Modify:

- `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts`

---

### 5.5 Add Project Link Tests

**Priority**: Medium  
**Estimated Effort**: Medium  
**Blocking**: Requires 3.8 complete, Projects schema exists

#### Steps:

1. **Add tests for `projectId` linking**:

   ```typescript
   test('create task with project link', async () => {
   	// Create test project first
   	const projectId = await createTestProject();

   	const result = await t.mutation(api.meetingActionItems.create, {
   		// ... existing params ...
   		projectId: projectId
   	});

   	expect(result.projectId).toBe(projectId);
   });

   test('update task project link', async () => {
   	// Test linking project after creation
   });

   test('query tasks by project', async () => {
   	// Test listByProject query
   });
   ```

#### Files to Modify:

- `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts`

---

### 5.6 Add Standalone Tasks Tests

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Requires 3.9 complete

#### Steps:

1. **Add tests for standalone tasks**:

   ```typescript
   test('create standalone task (no meeting)', async () => {
   	const result = await t.mutation(api.meetingActionItems.create, {
   		sessionId: testSession,
   		workspaceId: testWorkspace,
   		// NO meetingId or agendaItemId
   		assigneeType: 'user',
   		assigneeUserId: testUser,
   		description: 'Standalone task',
   		status: 'todo'
   	});

   	expect(result.taskId).toBeDefined();
   	expect(result.meetingId).toBeNull();
   	expect(result.agendaItemId).toBeNull();
   });

   test('require agendaItemId when meetingId provided', async () => {
   	// Should throw error if meetingId without agendaItemId
   });

   test('list standalone tasks for workspace', async () => {
   	// Test listByWorkspace query with filtering
   });
   ```

#### Files to Modify:

- `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts`

---

## Phase 6: Data Migration

### 6.1 Migration Script - Remove Decisions

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/remove-meeting-decisions.ts

   // 1. Export decisions data (if needed for backup)
   // 2. Delete all decisions records
   // 3. Verify deletion complete
   ```

2. **Backup strategy**:
   - Export all decisions to JSON file
   - Store in `backups/meeting-decisions-[timestamp].json`

#### Files to Create:

- `scripts/migrations/remove-meeting-decisions.ts`

---

### 6.2 Migration Script - Remove Secretary Data

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/remove-secretary-data.ts

   // 1. Remove secretaryId from all meetings
   // 2. Delete all secretary change requests
   // 3. Verify cleanup complete
   ```

#### Files to Create:

- `scripts/migrations/remove-secretary-data.ts`

---

### 6.3 Migration Script - Merge Meeting Type = Template ⬜ NEW

**Priority**: Critical  
**Estimated Effort**: High  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/merge-meeting-type-template.ts

   async function migrateMeetingTypes() {
   	// 1. Get all unique meetingType values
   	// 2. For each type, find or create a template
   	// 3. Update all meetings:
   	//    - Set templateId = template matching meetingType
   	//    - Remove meetingType field
   	// 4. Verify all meetings have templateId
   }
   ```

2. **Template creation strategy**:
   - Check if templates exist for each type
   - Create default templates if missing
   - Use existing templates if they match

#### Files to Create:

- `scripts/migrations/merge-meeting-type-template.ts`

---

### 6.4 Migration Script - Update Privacy ⬜ NEW

**Priority**: High  
**Estimated Effort**: Low  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/update-privacy.ts

   // Convert all 'circle' visibility to 'private'
   // Circle membership handled via invitations
   ```

#### Files to Create:

- `scripts/migrations/update-privacy.ts`

---

### 6.5 Migration Script - Refactor Attendees ⬜ NEW

**Priority**: High  
**Estimated Effort**: High  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/refactor-attendees.ts

   async function migrateAttendees() {
   	// 1. For each polymorphic attendee:
   	//    - If type='user': Keep as is
   	//    - If type='role': Find all users filling role, create attendee records
   	//    - If type='circle': Find all circle members, create attendee records
   	// 2. Delete old polymorphic records
   	// 3. Verify migration complete
   }
   ```

#### Files to Create:

- `scripts/migrations/refactor-attendees.ts`

---

### 6.6 Migration Script - Update Tasks

**Priority**: Critical  
**Estimated Effort**: High  
**Blocking**: Must run before deploying schema changes

#### Steps:

1. **Create migration script**:

   ```typescript
   // scripts/migrations/migrate-tasks-schema.ts

   async function migrateTasks() {
   	// 1. Add workspaceId to all tasks
   	//    - Derive from meetingId → meeting.workspaceId
   	// 2. Handle tasks with type='project'
   	//    - Option A: Delete them (if none exist)
   	//    - Option B: Convert to type='next-step' + set projectId=null
   	//    - Option C: Create projects and link via projectId
   	// 3. Remove type field from all records
   	// 4. Make meetingId/agendaItemId optional (already done in schema)
   	// 5. Verify migration complete
   }
   ```

2. **Migration logic for `type='project'` items**:
   - Query all tasks with `type='project'`
   - If count is 0: No migration needed
   - If count > 0: Decision needed (delete vs convert vs map to projects)

3. **Add `workspaceId` to all tasks**:

   ```typescript
   const tasks = await ctx.db.query('meetingActionItems').collect();

   for (const task of tasks) {
   	const meeting = await ctx.db.get(task.meetingId);
   	if (meeting) {
   		await ctx.db.patch(task._id, {
   			workspaceId: meeting.workspaceId
   		});
   	}
   }
   ```

#### Files to Create:

- `scripts/migrations/migrate-tasks-schema.ts`

#### Manual Steps Required:

1. **Before running migration**:
   - Query count of `type='project'` tasks
   - Decide on migration strategy
   - Backup all tasks data

2. **Run migration**:

   ```bash
   npm run migration:tasks
   ```

3. **Verify migration**:
   - Check all tasks have `workspaceId`
   - Check no tasks have `type` field
   - Check meeting/agenda links are preserved

---

## Phase 7: Documentation Updates

### 7.1 Update Architecture Docs ✅

**Priority**: Medium  
**Status**: ✅ Complete

#### Completed:

- ✅ Updated `src/lib/modules/meetings/docs/essentials.md`
- ✅ Updated `src/lib/modules/projects/README.md`
- ✅ Documented tasks as Projects module entity
- ✅ Documented meeting template steps as separate entity

---

### 7.2 Update Business Logic Docs

**Priority**: Medium  
**Estimated Effort**: Low

#### Steps:

1. Update `src/lib/modules/meetings/docs/business-logic.md`:
   - Remove decision-related workflows
   - Remove secretary-related workflows
   - Update tasks section (no type field)
   - Document standalone tasks workflow
   - Document template = type concept
   - Document invitations vs attendees

#### Files to Modify:

- `src/lib/modules/meetings/docs/business-logic.md`

---

### 7.3 Update API Documentation

**Priority**: Low  
**Estimated Effort**: Low

#### Steps:

1. Update `src/lib/modules/meetings/api.ts`:
   - Remove decisions types/interfaces (if any)
   - Remove `MeetingType` enum
   - Update `Meeting` interface (remove `meetingType`, make `templateId` required)
   - Update task types (no `type` field, add `projectId`)
   - Add `workspaceId` to task interface
   - Add invitation types/interfaces

#### Files to Modify:

- `src/lib/modules/meetings/api.ts`

---

## Phase 8: Deployment & Rollout

### 8.1 Pre-Deployment Checklist

- [ ] All migrations tested locally
- [ ] All tests passing
- [ ] Schema changes reviewed
- [ ] Backend changes reviewed
- [ ] Frontend changes reviewed
- [ ] Documentation updated
- [ ] Feature flag plan (if needed)

### 8.2 Deployment Steps

1. **Run migrations** (in order):

   ```bash
   npm run migration:backup-decisions
   npm run migration:remove-decisions
   npm run migration:backup-secretary
   npm run migration:remove-secretary
   npm run migration:backup-meetings
   npm run migration:merge-type-template
   npm run migration:update-privacy
   npm run migration:refactor-attendees
   npm run migration:backup-tasks
   npm run migration:tasks
   ```

2. **Deploy schema changes**:
   - Deploy `convex/schema.ts` changes
   - Verify Convex migration completes

3. **Deploy backend changes**:
   - Deploy updated `convex/*.ts` files
   - Verify functions deploy successfully

4. **Deploy frontend changes**:
   - Deploy updated frontend code
   - Verify no runtime errors

5. **Smoke test**:
   - Create meeting with template (required)
   - Create invitations (users/circles)
   - Join meeting (become attendee)
   - Create tasks in meeting
   - Create standalone task
   - Verify no decisions/secretary UI appears
   - Verify tasks work correctly

### 8.3 Rollback Plan

If issues occur:

1. **Schema rollback**:
   - Revert to previous schema version
   - Restore from backups if needed

2. **Code rollback**:
   - Revert backend/frontend deployments
   - Re-run previous migration state

3. **Data recovery**:
   - Restore from backup JSON files
   - Re-import data if needed

---

## Success Criteria

### Phase 2-3 (Schema & Backend)

- ✅ `meetingDecisions` table removed
- ✅ `secretaryChangeRequests` table removed
- ✅ `secretaryId` field removed from meetings
- ⬜ `meetingType` field removed from meetings
- ⬜ `templateId` required (not optional) on meetings
- ⬜ `meetingInvitations` table added
- ⬜ `meetingAttendees` simplified (no polymorphism)
- ⬜ Privacy enum updated (only 'public' | 'private')
- ✅ Tasks have `projectId` field
- ✅ Tasks have `workspaceId` field
- ✅ `meetingId` and `agendaItemId` are optional on tasks
- ✅ No `type` field on tasks

### Phase 4 (Frontend)

- ✅ No decisions UI visible
- ✅ No secretary UI visible
- ⬜ Template selection required (no meetingType dropdown)
- ⬜ Privacy selector only shows 'public' | 'private'
- ⬜ Invitations UI added
- ⬜ Attendees UI simplified (no types)
- ✅ Tasks form has no type toggle
- ✅ Tasks can be created in meetings
- ⬜ Tasks can link to projects (Phase 5)
- ⬜ Tasks can be created standalone

### Phase 5 (Testing)

- ✅ All decision tests removed
- ⬜ Meeting tests updated (template required)
- ⬜ Attendee tests updated (no polymorphism)
- ✅ No type-related tests
- ✅ Project link tests passing
- ✅ Standalone task tests passing

### Phase 6 (Migration)

- ✅ All decisions data backed up
- ✅ All secretary data backed up
- ⬜ Meeting type → template migration complete
- ⬜ Privacy migration complete ('circle' → 'private')
- ⬜ Attendees migration complete (polymorphic → simple)
- ✅ All tasks data backed up
- ✅ All tasks have `workspaceId`
- ✅ Migration verified and tested

---

## Open Questions

1. **Tasks with `type='project'`**:
   - How many exist in production?
   - Delete or convert to `next-step`?
   - Map to projects if Projects module exists?

2. **Projects Module Timeline**:
   - When will Projects module be built?
   - Can we add `projectId` field before Projects module exists?
   - Should we wait to implement project linking UI?

3. **Standalone Tasks UI**:
   - Where should standalone tasks UI live?
   - Dashboard? Separate page? Both?
   - Should it be part of this plan or separate phase?

4. **Migration Strategy**:
   - Run migrations in staging first?
   - Gradual rollout or all at once?
   - Feature flag for new behavior?

5. **Template Migration**:
   - How to handle meetings without templates?
   - Create default templates for each type?
   - What if template doesn't exist for a meeting type?

6. **Attendee Migration**:
   - How to handle existing role/circle attendees?
   - Create attendee records for all resolved users?
   - Or only create when they actually join?

---

## Timeline Estimate

- **Phase 2 (Schema)**: 3-4 days
- **Phase 3 (Backend)**: 4-5 days
- **Phase 4 (Frontend)**: 4-5 days
- **Phase 5 (Testing)**: 3-4 days
- **Phase 6 (Migration)**: 3-4 days
- **Phase 7 (Docs)**: 1 day

**Total**: ~3-4 weeks (including testing and migration)

---

## Related Documents

- [Meetings Module - Essentials](../../src/lib/modules/meetings/docs/essentials.md)
- [Projects Module - README](../../src/lib/modules/projects/README.md)
- [Meetings Module - Architecture Audit](../../src/lib/modules/meetings/docs/architecture_audit.md)

---

**Next Steps**:

1. Get user approval on open questions
2. Start with Phase 2.1 (Remove Decisions)
3. Create migration scripts
4. Test migrations in local environment
5. Execute phased rollout
