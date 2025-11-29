# Meeting Stepper - Backend Design Document

## Overview

Add `meetingType` field to meetings table to enable reporting and analytics on meeting types.

---

## Schema Changes

### Current Schema (`meetings`meetings` table)

```typescript
meetings: defineTable({
  workspaceId: v.id('workspaces'),
  circleId: v.optional(v.id('circles')),
  title: v.string(),
  templateId: v.optional(v.id('meetingTemplates')), // Optional template reference
  startTime: v.number(),
  duration: v.number(),
  recurrence: v.optional(...),
  visibility: v.union(v.literal('public'), v.literal('circle'), v.literal('private')),
  startedAt: v.optional(v.number()),
  currentStep: v.optional(v.string()),
  closedAt: v.optional(v.number()),
  secretaryId: v.optional(v.id('users')),
  createdAt: v.number(),
  createdBy: v.id('users'),
  updatedAt: v.number()
})
```

### Updated Schema: Add `meetingType` field

```typescript
meetings: defineTable({
  workspaceId: v.id('workspaces'),
  circleId: v.optional(v.id('circles')),
  title: v.string(),
  templateId: v.optional(v.id('meetingTemplates')), // Still optional, linked to type
  meetingType: v.union(
    v.literal('standup'),
    v.literal('retrospective'),
    v.literal('planning'),
    v.literal('1-on-1'),
    v.literal('client'),
    v.literal('governance'),
    v.literal('weekly-tactical'),
    v.literal('general')
  ), // NEW: Required field for reporting
  startTime: v.number(),
  duration: v.number(),
  recurrence: v.optional(...),
  visibility: v.union(v.literal('public'), v.literal('circle'), v.literal('private')),
  startedAt: v.optional(v.number()),
  currentStep: v.optional(v.string()),
  closedAt: v.optional(v.number()),
  secretaryId: v.optional(v.id('users')),
  createdAt: v.number(),
  createdBy: v.id('users'),
  updatedAt: v.number()
})
.index('by_organization', ['workspaceId'])
.index('by_circle', ['circleId'])
.index('by_start_time', ['workspaceId', 'startTime'])
.index('by_meeting_type', ['workspaceId', 'meetingType']) // NEW: For reporting
```

---

## Mutation Changes

### `meetings.create` Mutation

**Current Args:**

```typescript
args: {
  sessionId: v.string(),
  workspaceId: v.id('workspaces'),
  circleId: v.optional(v.id('circles')),
  templateId: v.optional(v.id('meetingTemplates')),
  title: v.string(),
  startTime: v.number(),
  duration: v.number(),
  visibility: v.union(...),
  recurrence: v.optional(...)
}
```

**Updated Args:**

```typescript
args: {
  sessionId: v.string(),
  workspaceId: v.id('workspaces'),
  circleId: v.optional(v.id('circles')),
  templateId: v.optional(v.id('meetingTemplates')), // Still optional
  meetingType: v.union(
    v.literal('standup'),
    v.literal('retrospective'),
    v.literal('planning'),
    v.literal('1-on-1'),
    v.literal('client'),
    v.literal('governance'),
    v.literal('weekly-tactical'),
    v.literal('general')
  ), // NEW: Required field
  title: v.string(),
  startTime: v.number(),
  duration: v.number(),
  visibility: v.union(...),
  recurrence: v.optional(...)
}
```

**Handler Changes:**

```typescript
handler: async (ctx, args) => {
	// ... existing validation ...

	// Create meeting with meetingType
	const meetingId = await ctx.db.insert('meetings', {
		workspaceId: args.workspaceId,
		circleId: args.circleId,
		templateId: args.templateId,
		meetingType: args.meetingType, // NEW: Store meeting type
		title: args.title,
		startTime: args.startTime,
		duration: args.duration,
		visibility: args.visibility,
		recurrence: args.recurrence,
		createdAt: Date.now(),
		createdBy: userId,
		updatedAt: Date.now()
	});

	// ... rest of handler ...
};
```

### `meetings.update` Mutation

**Add `meetingType` to update args:**

```typescript
args: {
  // ... existing args ...
  meetingType: v.optional(v.union(...)) // Optional for updates
}
```

---

## Query Changes

### New Query: `meetings.listByType`

**Purpose:** Report meetings by type for analytics

**Args:**

```typescript
args: {
  sessionId: v.string(),
  workspaceId: v.id('workspaces'),
  meetingType: v.union(...), // Filter by type
  startDate: v.optional(v.number()), // Optional date range start
  endDate: v.optional(v.number()) // Optional date range end
}
```

**Handler:**

```typescript
handler: async (ctx, args) => {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

	let query = ctx.db
		.query('meetings')
		.withIndex('by_meeting_type', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('meetingType', args.meetingType)
		);

	// Filter by date range if provided
	const meetings = await query.collect();

	if (args.startDate || args.endDate) {
		return meetings.filter((m) => {
			if (args.startDate && m.startTime < args.startDate) return false;
			if (args.endDate && m.startTime > args.endDate) return false;
			return true;
		});
	}

	return meetings;
};
```

---

## Migration Strategy

### Since Not Live Yet: No Migration Needed

**Approach:**

- Add `meetingType` field to schema
- All new meetings will have `meetingType`
- No existing meetings to migrate

**If we need to handle test data:**

```typescript
// Optional: Migration script for test data
export const migrateTestMeetings = internalMutation({
	handler: async (ctx) => {
		const meetings = await ctx.db.query('meetings').collect();

		for (const meeting of meetings) {
			// Infer type from templateId if exists
			let inferredType: MeetingType = 'general';

			if (meeting.templateId) {
				const template = await ctx.db.get(meeting.templateId);
				if (template?.name === 'Governance') {
					inferredType = 'governance';
				} else if (template?.name === 'Weekly Tactical') {
					inferredType = 'weekly-tactical';
				}
			}

			await ctx.db.patch(meeting._id, {
				meetingType: inferredType
			});
		}
	}
});
```

---

## Type Definitions

### Frontend Type (matches backend)

```typescript
export type MeetingType =
	| 'standup'
	| 'retrospective'
	| 'planning'
	| '1-on-1'
	| 'client'
	| 'governance'
	| 'weekly-tactical'
	| 'general';
```

### Backend Validation

```typescript
const meetingTypeSchema = v.union(
	v.literal('standup'),
	v.literal('retrospective'),
	v.literal('planning'),
	v.literal('1-on-1'),
	v.literal('client'),
	v.literal('governance'),
	v.literal('weekly-tactical'),
	v.literal('general')
);
```

---

## Index Strategy

### New Index: `by_meeting_type`

**Purpose:** Enable fast queries for reporting

**Definition:**

```typescript
.index('by_meeting_type', ['workspaceId', 'meetingType'])
```

**Usage:**

- Filter meetings by type within workspace
- Analytics queries: "How many standups this month?"
- Reporting: "Meeting type distribution"

**Performance:**

- Compound index on `workspaceId` + `meetingType`
- Efficient for workspace-scoped queries
- Supports date range filtering on `startTime` (secondary filter)

---

## Validation Rules

### Meeting Type → Template Mapping

**Governance Type:**

- If `meetingType === 'governance'` and template exists → use template
- If `meetingType === 'governance'` and no template → still valid (meeting can exist without template)

**Weekly Tactical Type:**

- If `meetingType === 'weekly-tactical'` and template exists → use template
- If `meetingType === 'weekly-tactical'` and no template → still valid

**Other Types:**

- No template required
- `templateId` can be null

**Backend Validation:**

```typescript
// In meetings.create handler
if (args.meetingType === 'governance' || args.meetingType === 'weekly-tactical') {
	// Template is optional but recommended
	// If templateId provided, validate it exists
	if (args.templateId) {
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw new Error('Template not found');
		}
		// Optional: Validate template name matches type
		if (args.meetingType === 'governance' && template.name !== 'Governance') {
			// Warn but don't fail (user might have custom template)
		}
	}
}
```

---

## API Contract Updates

### Frontend API (`src/lib/modules/meetings/api.ts`)

**Update `Meeting` interface:**

```typescript
export interface Meeting {
	_id: Id<'meetings'> | string;
	originalMeetingId?: Id<'meetings'>;
	_creationTime: number;
	workspaceId: Id<'workspaces'> | string;
	circleId?: Id<'circles'> | string;
	templateId?: Id<'meetingTemplates'> | string;
	meetingType: MeetingType; // NEW: Required field
	title: string;
	startTime: number;
	duration: number;
	visibility: 'public' | 'circle' | 'private';
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
	attendeeCount?: number;
	createdAt: number;
	createdBy: Id<'users'> | string;
	updatedAt: number;
	closedAt?: number;
}
```

---

## Testing Strategy

### Unit Tests

**Test Cases:**

1. ✅ Create meeting with all types
2. ✅ Create meeting with governance type + template
3. ✅ Create meeting with governance type without template (should work)
4. ✅ Query meetings by type
5. ✅ Query meetings by type + date range
6. ✅ Update meeting type

### Integration Tests

**Test Cases:**

1. ✅ Full flow: Create meeting → Query by type → Verify results
2. ✅ Reporting: Count meetings by type in date range
3. ✅ Template mapping: Governance type with template vs without

---

## Rollback Plan

### If Issues Arise

**Option 1: Make field optional temporarily**

- Change schema to `v.optional(meetingTypeSchema)`
- Frontend can handle missing field
- Gradual rollout

**Option 2: Remove field**

- Drop index
- Remove field from schema
- Frontend falls back to inferring from templateId

**Note:** Since not live, rollback is simple schema revert.

---

## Success Criteria

- [ ] Schema updated with `meetingType` field
- [ ] Index created for reporting queries
- [ ] `meetings.create` mutation accepts `meetingType`
- [ ] `meetings.update` mutation accepts `meetingType`
- [ ] New query `meetings.listByType` works
- [ ] All tests pass
- [ ] Frontend API contract updated

---

## Next Steps

1. Update `convex/schema.ts` - Add `meetingType` field
2. Update `convex/meetings.ts` - Add `meetingType` to create/update mutations
3. Create `meetings.listByType` query
4. Add index to schema
5. Update frontend API contract
6. Write tests
7. Deploy
