# Edit Circle & Operating Modes - Implementation Specification

**Status**: 📋 Ready for Implementation  
**Last Updated**: 2025-12-04  
**BDD Specs**: `ai-docs/tasks/edit-circle-feature.md`, `ai-docs/tasks/organizational-operating-modes.md`

---

## 1. Executive Summary

### What We're Building

Two complementary systems for editing organizational structure:

1. **Quick Edit Mode**: Direct inline editing with auto-save for users with Org Designer role
2. **Proposal Mode**: Governance-based change management through meetings (available to everyone)
3. **Operating Modes**: Circle types that affect decision-making and permissions

### Success Criteria (Measurable)

| Criteria                 | Measurement                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| Quick edit works         | User with permission can edit circle/role field, click away, change persists |
| Quick edit blocked       | User without permission sees read-only fields with tooltip explanation       |
| Proposal created         | Any user can create proposal, sees it in draft status                        |
| Proposal in meeting      | Proposal appears in governance meeting agenda                                |
| Proposal approved        | Approved proposal auto-applies changes to circle/role                        |
| Operating modes work     | Circle type affects who can quick edit (hierarchy vs empowered)              |
| Version history captured | All changes (quick edit and proposal) appear in version history              |

### Prerequisites (Already Exist)

- ✅ `Org Designer` RBAC role (in database)
- ✅ `org-chart.edit.quick` permission (in database)
- ✅ RBAC permission checking system (`convex/rbac/permissions.ts`)
- ✅ Version history capture (`convex/core/history`)
- ✅ Meetings system with `recorderId` field
- ✅ Circle items system (`circleItems`, `circleItemCategories`)

---

## 2. Schema Changes

### 2.1 New Field: `workspaceOrgSettings.allowQuickChanges`

**File**: `convex/schema.ts` (modify existing table)

```typescript
// Workspace Org Settings - Workspace-level configuration for org chart behavior
workspaceOrgSettings: defineTable({
    workspaceId: v.id('workspaces'),
    // Circle Lead enforcement
    requireCircleLeadRole: v.boolean(), // Default: true
    // Core role template IDs for this workspace
    coreRoleTemplateIds: v.array(v.id('roleTemplates')),
    // NEW: Quick edit mode control
    allowQuickChanges: v.boolean(), // Default: false (proposals required)
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number()
}).index('by_workspace', ['workspaceId']),
```

**Default Value**: `false` (all changes require proposals by default)

---

### 2.2 New Fields: `circles.circleType` and `circles.decisionModel`

**File**: `convex/schema.ts` (modify existing table)

```typescript
// Circles - work workspace units (not people grouping)
circles: defineTable({
    workspaceId: v.id('workspaces'),
    name: v.string(),
    slug: v.string(),
    purpose: v.optional(v.string()),
    parentCircleId: v.optional(v.id('circles')),
    status: v.union(v.literal('draft'), v.literal('active')),
    // NEW: Operating mode fields
    circleType: v.optional(v.union(
        v.literal('hierarchy'),      // Traditional: manager decides
        v.literal('empowered_team'), // Agile: team consensus
        v.literal('guild'),          // Coordination only, no authority
        v.literal('hybrid')          // Mixed: depends on decision type
    )), // Default: 'hierarchy' (null = hierarchy for backward compat)
    decisionModel: v.optional(v.union(
        v.literal('manager_decides'),    // Single approver (manager/lead)
        v.literal('team_consensus'),     // All members must agree
        v.literal('consent'),            // No valid objections (IDM)
        v.literal('coordination_only')   // Guild: must approve in home circle
    )), // Default: 'manager_decides' (null = manager_decides for backward compat)
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id('users')),
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id('users'))
})
    .index('by_workspace', ['workspaceId'])
    .index('by_parent', ['parentCircleId'])
    .index('by_slug', ['workspaceId', 'slug'])
    .index('by_workspace_archived', ['workspaceId', 'archivedAt'])
    .index('by_workspace_status', ['workspaceId', 'status', 'archivedAt']),
```

**Default Values**:

- `circleType`: `null` → treated as `'hierarchy'`
- `decisionModel`: `null` → treated as `'manager_decides'`

---

### 2.3 New Table: `circleProposals`

**File**: `convex/schema.ts` (add new table)

```typescript
// Circle Proposals - Suggested changes to circles or roles
circleProposals: defineTable({
    workspaceId: v.id('workspaces'),
    // Target entity (circle or role)
    entityType: v.union(v.literal('circle'), v.literal('role')),
    entityId: v.string(), // Circle ID or Role ID as string
    // For circle proposals, also store circleId for efficient queries
    circleId: v.optional(v.id('circles')),
    // Proposal content
    title: v.string(), // Short summary of the change
    description: v.string(), // Justification/context for the change
    // Status workflow
    status: v.union(
        v.literal('draft'),       // Created, not yet submitted
        v.literal('submitted'),   // Submitted, waiting for meeting
        v.literal('in_meeting'),  // Being discussed in governance meeting
        v.literal('objections'),  // Has unresolved objections
        v.literal('integrated'),  // Objections integrated, ready for approval
        v.literal('approved'),    // Approved, changes applied
        v.literal('rejected'),    // Rejected, no changes applied
        v.literal('withdrawn')    // Creator withdrew the proposal
    ),
    // Meeting integration
    meetingId: v.optional(v.id('meetings')), // Linked governance meeting
    agendaItemId: v.optional(v.id('meetingAgendaItems')), // Agenda item in meeting
    // Version history integration
    versionHistoryEntryId: v.optional(v.id('orgVersionHistory')), // Link to applied change
    // Metadata
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
    submittedAt: v.optional(v.number()), // When submitted to meeting
    processedAt: v.optional(v.number()), // When approved/rejected
    processedBy: v.optional(v.id('users')) // Who made final decision
})
    .index('by_workspace', ['workspaceId'])
    .index('by_entity', ['entityType', 'entityId'])
    .index('by_circle', ['circleId'])
    .index('by_meeting', ['meetingId'])
    .index('by_status', ['workspaceId', 'status'])
    .index('by_creator', ['createdBy'])
    .index('by_workspace_status', ['workspaceId', 'status', 'createdAt']),
```

---

### 2.4 New Table: `proposalEvolutions`

Stores the actual changes proposed (before/after snapshots).

```typescript
// Proposal Evolutions - The actual changes in a proposal
proposalEvolutions: defineTable({
    proposalId: v.id('circleProposals'),
    // What's changing
    fieldPath: v.string(), // e.g., "name", "purpose", "items.domains.0"
    fieldLabel: v.string(), // Human-readable: "Circle Name", "Domain #1"
    // Before/after values (JSON stringified for flexibility)
    beforeValue: v.optional(v.string()), // null for additions
    afterValue: v.optional(v.string()), // null for deletions
    // Change type
    changeType: v.union(
        v.literal('add'),    // Adding new item
        v.literal('update'), // Modifying existing
        v.literal('remove')  // Removing item
    ),
    // Ordering
    order: v.number(), // Display order in proposal
    // Timestamps
    createdAt: v.number()
})
    .index('by_proposal', ['proposalId'])
    .index('by_proposal_order', ['proposalId', 'order']),
```

---

### 2.5 New Table: `proposalAttachments`

```typescript
// Proposal Attachments - Files attached to proposals
proposalAttachments: defineTable({
    proposalId: v.id('circleProposals'),
    fileId: v.id('_storage'), // Convex file storage
    fileName: v.string(),
    fileType: v.string(), // MIME type
    fileSize: v.number(), // Bytes
    uploadedBy: v.id('users'),
    uploadedAt: v.number()
})
    .index('by_proposal', ['proposalId']),
```

---

### 2.6 New Table: `proposalObjections`

```typescript
// Proposal Objections - Concerns raised during IDM process
proposalObjections: defineTable({
    proposalId: v.id('circleProposals'),
    // Who raised the objection
    raisedBy: v.id('users'),
    // Objection content
    objectionText: v.string(), // The concern being raised
    // Validation (recorder determines if objection is valid)
    isValid: v.optional(v.boolean()), // null = not yet validated
    validationNote: v.optional(v.string()), // Why valid/invalid
    validatedBy: v.optional(v.id('users')), // Recorder who validated
    validatedAt: v.optional(v.number()),
    // Resolution
    isIntegrated: v.boolean(), // Has been integrated into proposal
    integrationNote: v.optional(v.string()), // How it was integrated
    integratedAt: v.optional(v.number()),
    // Timestamps
    createdAt: v.number()
})
    .index('by_proposal', ['proposalId'])
    .index('by_raiser', ['raisedBy'])
    .index('by_proposal_valid', ['proposalId', 'isValid']),
```

---

## 3. Proposal State Machine

### 3.1 State Diagram (ASCII)

```
                                    ┌─────────────┐
                                    │  withdrawn  │
                                    └─────────────┘
                                          ▲
                                          │ withdraw()
                                          │
┌─────────┐   submit()   ┌───────────┐   │   startProcessing()   ┌─────────────┐
│  draft  │─────────────▶│ submitted │───┼──────────────────────▶│ in_meeting  │
└─────────┘              └───────────┘   │                       └─────────────┘
     │                        │          │                             │
     │ delete()               │          │                             │
     ▼                        │          │                             │
  [deleted]                   │          │                    ┌────────┴────────┐
                              │          │                    │                 │
                              │          │           raiseObjection()    noObjections()
                              │          │                    │                 │
                              │          │                    ▼                 │
                              │          │            ┌─────────────┐           │
                              │          │            │ objections  │           │
                              │          │            └─────────────┘           │
                              │          │                    │                 │
                              │          │          integrateAll()              │
                              │          │                    │                 │
                              │          │                    ▼                 │
                              │          │            ┌─────────────┐           │
                              │          │            │ integrated  │           │
                              │          │            └─────────────┘           │
                              │          │                    │                 │
                              │          │                    └────────┬────────┘
                              │          │                             │
                              │          │                    ┌────────┴────────┐
                              │          │                    │                 │
                              │          │               approve()          reject()
                              │          │                    │                 │
                              │          │                    ▼                 ▼
                              │          │            ┌─────────────┐   ┌─────────────┐
                              │          │            │  approved   │   │  rejected   │
                              │          │            └─────────────┘   └─────────────┘
                              │          │                    │
                              │          │                    │ [auto-apply changes]
                              │          │                    ▼
                              │          │              [changes applied to
                              │          │               circle/role entity]
                              │          │
                              └──────────┘
```

### 3.2 State Definitions

| State        | Description                    | Allowed Actions                                 |
| ------------ | ------------------------------ | ----------------------------------------------- |
| `draft`      | Created but not submitted      | edit, delete, submit, withdraw                  |
| `submitted`  | Waiting for governance meeting | withdraw, startProcessing                       |
| `in_meeting` | Being discussed in meeting     | raiseObjection, noObjections, reject            |
| `objections` | Has unresolved objections      | integrateObjection, invalidateObjection, reject |
| `integrated` | All objections resolved        | approve, reject                                 |
| `approved`   | Approved, changes applied      | (terminal state)                                |
| `rejected`   | Rejected, no changes           | (terminal state)                                |
| `withdrawn`  | Creator withdrew               | (terminal state)                                |

### 3.3 State Transition Rules

```typescript
const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
	draft: ['submitted', 'withdrawn'],
	submitted: ['in_meeting', 'withdrawn'],
	in_meeting: ['objections', 'integrated', 'rejected'],
	objections: ['integrated', 'rejected'],
	integrated: ['approved', 'rejected'],
	approved: [], // Terminal
	rejected: [], // Terminal
	withdrawn: [] // Terminal
};
```

### 3.4 Auto-Apply on Approval

When proposal status changes to `approved`:

1. Read all `proposalEvolutions` for this proposal
2. Apply each evolution to the target entity (circle or role)
3. Capture version history with `proposalId` reference
4. Update proposal with `versionHistoryEntryId`

---

## 4. API Contracts

### 4.1 Quick Edit APIs

#### `circles.quickUpdate`

```typescript
export const quickUpdate = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		updates: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			circleType: v.optional(
				v.union(
					v.literal('hierarchy'),
					v.literal('empowered_team'),
					v.literal('guild'),
					v.literal('hybrid')
				)
			),
			decisionModel: v.optional(
				v.union(
					v.literal('manager_decides'),
					v.literal('team_consensus'),
					v.literal('consent'),
					v.literal('coordination_only')
				)
			)
		})
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get circle and workspace
		const circle = await ctx.db.get(args.circleId);
		if (!circle) throw new Error('Circle not found');

		// 3. Check quick edit permission (RBAC + workspace setting + circle type)
		await requireQuickEditPermission(ctx, userId, circle);

		// 4. Capture before state
		const beforeDoc = { ...circle };

		// 5. Apply updates
		await ctx.db.patch(args.circleId, {
			...args.updates,
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// 6. Capture version history
		const afterDoc = await ctx.db.get(args.circleId);
		await captureUpdate(ctx, 'circle', beforeDoc, afterDoc);

		return { success: true };
	}
});
```

**Authorization Logic** (`requireQuickEditPermission`):

```typescript
async function requireQuickEditPermission(
	ctx: MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<void> {
	// 1. Check workspace setting
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		throw new Error('Quick edits disabled. Use "Edit circle" to create a proposal.');
	}

	// 2. Check RBAC permission
	const hasPermission = await checkPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId,
		circleId: circle._id
	});

	if (!hasPermission) {
		throw new Error('Quick edits require Org Designer role.');
	}

	// 3. Check circle type restrictions
	const circleType = circle.circleType ?? 'hierarchy';

	switch (circleType) {
		case 'hierarchy':
			// Only manager/circle lead can edit
			const isManager = await hasCircleRole(ctx, userId, circle._id, ['Circle Lead', 'Manager']);
			if (!isManager) {
				throw new Error('Only Circle Lead can make changes in hierarchical circles.');
			}
			break;
		case 'empowered_team':
			// Any circle member can edit
			const isMember = await isCircleMember(ctx, userId, circle._id);
			if (!isMember) {
				throw new Error('Only circle members can make changes in empowered teams.');
			}
			break;
		case 'guild':
			// Guilds are coordination only - no quick edits
			throw new Error('Guilds are coordination-only. Create a proposal in your home circle.');
		case 'hybrid':
			// Default to member check
			const isHybridMember = await isCircleMember(ctx, userId, circle._id);
			if (!isHybridMember) {
				throw new Error('Only circle members can make changes.');
			}
			break;
	}
}
```

#### `circleItems.quickUpdate`

```typescript
export const quickUpdate = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get circle item and its circle
		const item = await ctx.db.get(args.circleItemId);
		if (!item) throw new Error('Circle item not found');

		const circle = await getCircleForItem(ctx, item);

		// 3. Check quick edit permission
		await requireQuickEditPermission(ctx, userId, circle);

		// 4. Capture before state
		const beforeDoc = { ...item };

		// 5. Apply update
		await ctx.db.patch(args.circleItemId, {
			content: args.content,
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// 6. Capture version history
		const afterDoc = await ctx.db.get(args.circleItemId);
		await captureUpdate(ctx, 'circleItem', beforeDoc, afterDoc);

		return { success: true };
	}
});
```

---

### 4.2 Proposal CRUD APIs

#### `proposals.create`

```typescript
export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		title: v.string(),
		description: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Verify workspace membership (any member can create proposals)
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// 3. Verify entity exists
		if (args.entityType === 'circle') {
			const circle = await ctx.db.get(args.entityId as Id<'circles'>);
			if (!circle) throw new Error('Circle not found');
		} else {
			const role = await ctx.db.get(args.entityId as Id<'circleRoles'>);
			if (!role) throw new Error('Role not found');
		}

		// 4. Create proposal
		const proposalId = await ctx.db.insert('circleProposals', {
			workspaceId: args.workspaceId,
			entityType: args.entityType,
			entityId: args.entityId,
			circleId: args.entityType === 'circle' ? (args.entityId as Id<'circles'>) : undefined,
			title: args.title,
			description: args.description,
			status: 'draft',
			createdBy: userId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});

		return { proposalId };
	}
});
```

#### `proposals.addEvolution`

```typescript
export const addEvolution = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		fieldPath: v.string(),
		fieldLabel: v.string(),
		beforeValue: v.optional(v.string()),
		afterValue: v.optional(v.string()),
		changeType: v.union(v.literal('add'), v.literal('update'), v.literal('remove'))
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get proposal and verify ownership + draft status
		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		const person = await getPersonByUserAndWorkspace(ctx, userId, proposal.workspaceId);
		if (proposal.createdByPersonId !== person._id)
			throw new Error('Only proposal creator can edit');
		if (proposal.status !== 'draft') throw new Error('Can only edit draft proposals');

		// 3. Get current max order
		const existingEvolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();
		const maxOrder = existingEvolutions.reduce((max, e) => Math.max(max, e.order), -1);

		// 4. Create evolution
		const evolutionId = await ctx.db.insert('proposalEvolutions', {
			proposalId: args.proposalId,
			fieldPath: args.fieldPath,
			fieldLabel: args.fieldLabel,
			beforeValue: args.beforeValue,
			afterValue: args.afterValue,
			changeType: args.changeType,
			order: maxOrder + 1,
			createdAt: Date.now()
		});

		// 5. Update proposal timestamp
		await ctx.db.patch(args.proposalId, { updatedAt: Date.now() });

		return { evolutionId };
	}
});
```

#### `proposals.submit`

```typescript
export const submit = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get proposal and verify
		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		const person = await getPersonByUserAndWorkspace(ctx, userId, proposal.workspaceId);
		if (proposal.createdByPersonId !== person._id)
			throw new Error('Only proposal creator can submit');
		if (proposal.status !== 'draft') throw new Error('Can only submit draft proposals');

		// 3. Verify meeting exists and is governance type
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw new Error('Meeting not found');

		// 4. Create agenda item in meeting
		const agendaItemId = await ctx.db.insert('meetingAgendaItems', {
			meetingId: args.meetingId,
			type: 'proposal',
			title: proposal.title,
			description: proposal.description,
			proposalId: args.proposalId,
			addedBy: userId,
			addedAt: Date.now(),
			order: await getNextAgendaOrder(ctx, args.meetingId),
			status: 'pending'
		});

		// 5. Update proposal status
		await ctx.db.patch(args.proposalId, {
			status: 'submitted',
			meetingId: args.meetingId,
			agendaItemId,
			submittedAt: Date.now(),
			updatedAt: Date.now()
		});

		return { success: true, agendaItemId };
	}
});
```

#### `proposals.startProcessing`

Called by recorder when agenda item becomes active.

```typescript
export const startProcessing = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.status !== 'submitted') {
			throw new Error('Proposal must be submitted to start processing');
		}

		// Verify user is recorder of the meeting
		const meeting = await ctx.db.get(proposal.meetingId!);
		if (meeting?.recorderId !== userId) {
			throw new Error('Only meeting recorder can process proposals');
		}

		await ctx.db.patch(args.proposalId, {
			status: 'in_meeting',
			updatedAt: Date.now()
		});

		return { success: true };
	}
});
```

---

### 4.3 Objection APIs

#### `proposals.raiseObjection`

```typescript
export const raiseObjection = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		objectionText: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.status !== 'in_meeting') {
			throw new Error('Can only raise objections during meeting processing');
		}

		// Verify user is circle member
		const circle = await getCircleForProposal(ctx, proposal);
		const isMember = await isCircleMember(ctx, userId, circle._id);
		if (!isMember) throw new Error('Only circle members can raise objections');

		// Create objection
		const objectionId = await ctx.db.insert('proposalObjections', {
			proposalId: args.proposalId,
			raisedBy: userId,
			objectionText: args.objectionText,
			isIntegrated: false,
			createdAt: Date.now()
		});

		// Update proposal status
		await ctx.db.patch(args.proposalId, {
			status: 'objections',
			updatedAt: Date.now()
		});

		return { objectionId };
	}
});
```

#### `proposals.validateObjection`

```typescript
export const validateObjection = mutation({
	args: {
		sessionId: v.string(),
		objectionId: v.id('proposalObjections'),
		isValid: v.boolean(),
		validationNote: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const objection = await ctx.db.get(args.objectionId);
		if (!objection) throw new Error('Objection not found');

		const proposal = await ctx.db.get(objection.proposalId);
		if (!proposal) throw new Error('Proposal not found');

		// Verify user is recorder
		const meeting = await ctx.db.get(proposal.meetingId!);
		if (meeting?.recorderId !== userId) {
			throw new Error('Only meeting recorder can validate objections');
		}

		await ctx.db.patch(args.objectionId, {
			isValid: args.isValid,
			validationNote: args.validationNote,
			validatedBy: userId,
			validatedAt: Date.now()
		});

		return { success: true };
	}
});
```

#### `proposals.integrateObjection`

```typescript
export const integrateObjection = mutation({
	args: {
		sessionId: v.string(),
		objectionId: v.id('proposalObjections'),
		integrationNote: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const objection = await ctx.db.get(args.objectionId);
		if (!objection) throw new Error('Objection not found');
		if (objection.isValid !== true) {
			throw new Error('Can only integrate valid objections');
		}

		const proposal = await ctx.db.get(objection.proposalId);
		if (!proposal) throw new Error('Proposal not found');

		// Verify user is recorder
		const meeting = await ctx.db.get(proposal.meetingId!);
		if (meeting?.recorderId !== userId) {
			throw new Error('Only meeting recorder can integrate objections');
		}

		await ctx.db.patch(args.objectionId, {
			isIntegrated: true,
			integrationNote: args.integrationNote,
			integratedAt: Date.now()
		});

		// Check if all valid objections are integrated
		const remainingObjections = await ctx.db
			.query('proposalObjections')
			.withIndex('by_proposal', (q) => q.eq('proposalId', proposal._id))
			.filter((q) => q.and(q.eq(q.field('isValid'), true), q.eq(q.field('isIntegrated'), false)))
			.first();

		if (!remainingObjections) {
			// All objections integrated - move to integrated status
			await ctx.db.patch(proposal._id, {
				status: 'integrated',
				updatedAt: Date.now()
			});
		}

		return { success: true };
	}
});
```

---

### 4.4 Approval APIs

#### `proposals.approve`

```typescript
export const approve = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');

		// Can approve from in_meeting (no objections) or integrated (objections resolved)
		if (proposal.status !== 'in_meeting' && proposal.status !== 'integrated') {
			throw new Error('Proposal not ready for approval');
		}

		// Verify user is recorder or has approval authority
		const meeting = await ctx.db.get(proposal.meetingId!);
		const circle = await getCircleForProposal(ctx, proposal);
		const canApprove = await checkApprovalAuthority(ctx, userId, circle, meeting);
		if (!canApprove) {
			throw new Error('No approval authority for this proposal');
		}

		// Apply changes
		const versionHistoryEntryId = await applyProposalChanges(ctx, proposal, userId);

		// Update proposal status
		await ctx.db.patch(args.proposalId, {
			status: 'approved',
			processedAt: Date.now(),
			processedBy: userId,
			versionHistoryEntryId,
			updatedAt: Date.now()
		});

		return { success: true, versionHistoryEntryId };
	}
});
```

#### `applyProposalChanges` (Internal Helper)

```typescript
async function applyProposalChanges(
	ctx: MutationCtx,
	proposal: Doc<'circleProposals'>,
	userId: Id<'users'>
): Promise<Id<'orgVersionHistory'>> {
	// 1. Get all evolutions
	const evolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal_order', (q) => q.eq('proposalId', proposal._id))
		.collect();

	// 2. Get target entity
	let entityDoc: any;
	let entityType: 'circle' | 'circleRole';

	if (proposal.entityType === 'circle') {
		entityDoc = await ctx.db.get(proposal.entityId as Id<'circles'>);
		entityType = 'circle';
	} else {
		entityDoc = await ctx.db.get(proposal.entityId as Id<'circleRoles'>);
		entityType = 'circleRole';
	}

	const beforeDoc = { ...entityDoc };

	// 3. Apply each evolution
	const updates: any = {};
	for (const evolution of evolutions) {
		if (evolution.afterValue !== null && evolution.afterValue !== undefined) {
			// Parse field path (e.g., "name" or nested "items.domains.0")
			const value = JSON.parse(evolution.afterValue);

			// For simple fields, apply directly
			if (!evolution.fieldPath.includes('.')) {
				updates[evolution.fieldPath] = value;
			}
			// For complex paths, would need recursive logic (future enhancement)
		}
	}

	// 4. Apply updates
	if (Object.keys(updates).length > 0) {
		if (proposal.entityType === 'circle') {
			await ctx.db.patch(proposal.entityId as Id<'circles'>, {
				...updates,
				updatedAt: Date.now(),
				updatedBy: userId
			});
		} else {
			await ctx.db.patch(proposal.entityId as Id<'circleRoles'>, {
				...updates,
				updatedAt: Date.now(),
				updatedBy: userId
			});
		}
	}

	// 5. Capture version history
	const afterDoc =
		proposal.entityType === 'circle'
			? await ctx.db.get(proposal.entityId as Id<'circles'>)
			: await ctx.db.get(proposal.entityId as Id<'circleRoles'>);

	// Manually insert version history with proposal reference
	const versionHistoryEntryId = await ctx.db.insert('orgVersionHistory', {
		entityType,
		workspaceId: proposal.workspaceId,
		entityId: proposal.entityId as any,
		changeType: 'update',
		changedBy: userId,
		changedAt: Date.now(),
		changeDescription: `Approved proposal: ${proposal.title}`,
		before: extractEntityFields(entityType, beforeDoc),
		after: extractEntityFields(entityType, afterDoc)
	});

	return versionHistoryEntryId;
}
```

---

### 4.5 Query APIs

#### `proposals.list`

```typescript
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		status: v.optional(
			v.union(
				v.literal('draft'),
				v.literal('submitted'),
				v.literal('in_meeting'),
				v.literal('objections'),
				v.literal('integrated'),
				v.literal('approved'),
				v.literal('rejected'),
				v.literal('withdrawn')
			)
		),
		circleId: v.optional(v.id('circles')),
		createdBy: v.optional(v.id('users')),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		let query = ctx.db
			.query('circleProposals')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId));

		let proposals = await query.collect();

		// Apply filters
		if (args.status) {
			proposals = proposals.filter((p) => p.status === args.status);
		}
		if (args.circleId) {
			proposals = proposals.filter((p) => p.circleId === args.circleId);
		}
		if (args.createdBy) {
			proposals = proposals.filter((p) => p.createdBy === args.createdBy);
		}

		// Sort by creation date, newest first
		proposals.sort((a, b) => b.createdAt - a.createdAt);

		// Apply limit
		if (args.limit) {
			proposals = proposals.slice(0, args.limit);
		}

		return proposals;
	}
});
```

#### `proposals.get`

```typescript
export const get = query({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) return null;

		await ensureWorkspaceMembership(ctx, proposal.workspaceId, userId);

		// Get evolutions
		const evolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal_order', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get objections
		const objections = await ctx.db
			.query('proposalObjections')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get attachments
		const attachments = await ctx.db
			.query('proposalAttachments')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get creator info (person)
		const creator = await ctx.db.get(proposal.createdByPersonId);

		return {
			...proposal,
			evolutions,
			objections,
			attachments,
			creator: creator
				? { id: creator._id, name: creator.displayName ?? '', email: creator.email }
				: null
		};
	}
});
```

---

## 5. RBAC Adaptation Logic

### 5.1 Permission Check Algorithm

```typescript
/**
 * Check if user can perform quick edits on a circle
 *
 * Requirements (ALL must be true):
 * 1. Workspace setting: allowQuickChanges = true
 * 2. RBAC permission: org-chart.edit.quick
 * 3. Circle type allows it:
 *    - hierarchy: user must be Circle Lead or Manager role
 *    - empowered_team: user must be circle member
 *    - guild: NEVER (coordination only)
 *    - hybrid: user must be circle member
 */
async function canQuickEdit(
	ctx: QueryCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<{ allowed: boolean; reason?: string }> {
	// 1. Check workspace setting
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		return {
			allowed: false,
			reason: 'Quick edits disabled. Use "Edit circle" to create a proposal.'
		};
	}

	// 2. Check RBAC permission
	const hasPermission = await checkPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId
	});

	if (!hasPermission) {
		return {
			allowed: false,
			reason: 'Quick edits require Org Designer role.'
		};
	}

	// 3. Check circle type
	const circleType = circle.circleType ?? 'hierarchy';

	switch (circleType) {
		case 'hierarchy': {
			const isManager = await hasCircleRole(ctx, userId, circle._id, ['Circle Lead', 'Manager']);
			if (!isManager) {
				return {
					allowed: false,
					reason: 'Only Circle Lead can make changes in hierarchical circles.'
				};
			}
			break;
		}
		case 'empowered_team': {
			const isMember = await isCircleMember(ctx, userId, circle._id);
			if (!isMember) {
				return {
					allowed: false,
					reason: 'Only circle members can make changes in empowered teams.'
				};
			}
			break;
		}
		case 'guild':
			return {
				allowed: false,
				reason: 'Guilds are coordination-only. Create a proposal in your home circle.'
			};
		case 'hybrid': {
			const isMember = await isCircleMember(ctx, userId, circle._id);
			if (!isMember) {
				return {
					allowed: false,
					reason: 'Only circle members can make changes.'
				};
			}
			break;
		}
	}

	return { allowed: true };
}
```

### 5.2 Proposal Approval Authority

```typescript
/**
 * Check if user has authority to approve proposals based on circle's decision model
 */
async function checkApprovalAuthority(
	ctx: QueryCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>,
	meeting: Doc<'meetings'> | null
): Promise<boolean> {
	const decisionModel = circle.decisionModel ?? 'manager_decides';

	switch (decisionModel) {
		case 'manager_decides':
			// Only Circle Lead/Manager can approve
			return await hasCircleRole(ctx, userId, circle._id, ['Circle Lead', 'Manager']);

		case 'team_consensus':
			// Meeting recorder can approve after consensus reached
			// (UI handles collecting all votes)
			return meeting?.recorderId === userId;

		case 'consent':
			// Meeting recorder can approve when no valid objections
			return meeting?.recorderId === userId;

		case 'coordination_only':
			// Guild - proposals must be approved in home circle
			// This should be handled differently (redirect to home circle)
			return false;

		default:
			return false;
	}
}
```

---

## 6. Edge Cases & Error Handling

### 6.1 Concurrent Edit Detection

**Scenario**: User A and User B edit the same field simultaneously.

**Behavior**: Last write wins (Convex default).

**Enhancement** (optional):

```typescript
// In quickUpdate mutation
const currentDoc = await ctx.db.get(args.circleId);
if (currentDoc.updatedAt > args.lastKnownUpdatedAt) {
	throw new Error('Circle was modified by another user. Please refresh and try again.');
}
```

**UI Handling**: Show toast notification if update succeeds but version differs.

### 6.2 Circle Archived During Proposal Processing

**Scenario**: Circle is archived while a proposal is in `in_meeting` status.

**Behavior**:

```typescript
// In proposals.approve mutation
const circle = await ctx.db.get(proposal.circleId);
if (!circle || circle.archivedAt) {
	throw new Error('Cannot approve proposal: target circle has been archived.');
}

// Auto-withdraw proposal
await ctx.db.patch(args.proposalId, {
	status: 'withdrawn',
	updatedAt: Date.now()
});
```

### 6.3 Meeting Cancelled with Pending Proposals

**Scenario**: Governance meeting is cancelled while proposals are attached.

**Behavior**:

```typescript
// In meetings.cancel mutation
const attachedProposals = await ctx.db
	.query('circleProposals')
	.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
	.filter((q) =>
		q.or(
			q.eq(q.field('status'), 'submitted'),
			q.eq(q.field('status'), 'in_meeting'),
			q.eq(q.field('status'), 'objections')
		)
	)
	.collect();

// Revert proposals to draft status
for (const proposal of attachedProposals) {
	await ctx.db.patch(proposal._id, {
		status: 'draft',
		meetingId: undefined,
		agendaItemId: undefined,
		submittedAt: undefined,
		updatedAt: Date.now()
	});
}
```

### 6.4 User Permission Revoked Mid-Edit

**Scenario**: User starts editing, permission is revoked, they try to save.

**Behavior**: Permission check on save will fail with clear error message.

```typescript
// Error thrown in requireQuickEditPermission
throw new Error('Your Org Designer role was revoked. Changes not saved.');
```

### 6.5 Proposal Creator Leaves Workspace

**Scenario**: User creates proposal in draft, then leaves workspace.

**Behavior**: Proposal remains in draft. Other users with workspace access can see it but cannot edit (only creator can edit drafts).

**Option**: Allow workspace admin to withdraw orphaned proposals.

### 6.6 All Objections Invalid

**Scenario**: All raised objections are marked invalid by recorder.

**Behavior**: Proposal moves directly to approval-ready state.

```typescript
// After validateObjection marks objection as invalid
const validObjections = await ctx.db
	.query('proposalObjections')
	.withIndex('by_proposal_valid', (q) => q.eq('proposalId', proposal._id).eq('isValid', true))
	.first();

if (!validObjections) {
	// No valid objections - can proceed to approval
	// Status stays at 'in_meeting' (shortcut to approval)
}
```

### 6.7 Objection Timeout

**Scenario**: Objection round runs indefinitely because not everyone votes.

**Behavior**: Recorder can proceed after reasonable time. UI shows who hasn't voted.

**Implementation**: Track `votedAt` per member, show "Waiting for: [names]" in UI.

---

## 7. UI Components Needed

### 7.1 Quick Edit Components

| Component               | Purpose                       | Location                                |
| ----------------------- | ----------------------------- | --------------------------------------- |
| `InlineEditText`        | Click-to-edit text field      | `src/lib/components/ui/`                |
| `EditPermissionTooltip` | Shows why editing is disabled | `src/lib/components/ui/`                |
| `QuickEditIndicator`    | Shows "auto-saving" status    | `src/lib/modules/org-chart/components/` |

### 7.2 Proposal Components

| Component               | Purpose                    | Location                                          |
| ----------------------- | -------------------------- | ------------------------------------------------- |
| `ProposalForm`          | Create/edit proposal       | `src/lib/modules/org-chart/components/proposals/` |
| `ProposalEvolutionList` | Show proposed changes      | `src/lib/modules/org-chart/components/proposals/` |
| `ProposalStatusBadge`   | Show proposal status       | `src/lib/modules/org-chart/components/proposals/` |
| `ProposalCard`          | List item in proposal list | `src/lib/modules/org-chart/components/proposals/` |
| `ProposalDetailPanel`   | Full proposal view         | `src/lib/modules/org-chart/components/proposals/` |

### 7.3 IDM Components

| Component              | Purpose                       | Location                               |
| ---------------------- | ----------------------------- | -------------------------------------- |
| `ObjectionForm`        | Raise an objection            | `src/lib/modules/meetings/components/` |
| `ObjectionList`        | Show all objections           | `src/lib/modules/meetings/components/` |
| `ObjectionCard`        | Single objection with actions | `src/lib/modules/meetings/components/` |
| `ObjectionRoundStatus` | Who voted, who's pending      | `src/lib/modules/meetings/components/` |

### 7.4 Operating Mode Components

| Component               | Purpose                         | Location                                |
| ----------------------- | ------------------------------- | --------------------------------------- |
| `CircleTypeSelector`    | Dropdown to set circle type     | `src/lib/modules/org-chart/components/` |
| `DecisionModelSelector` | Dropdown to set decision model  | `src/lib/modules/org-chart/components/` |
| `CircleTypeBadge`       | Visual indicator of circle type | `src/lib/modules/org-chart/components/` |

---

## 8. Implementation Phases

### Phase 1: Foundation (2-3 days)

**Goal**: Schema changes + basic infrastructure

**Tasks**:

1. Add `allowQuickChanges` to `workspaceOrgSettings` schema
2. Add `circleType`, `decisionModel` to `circles` schema
3. Create `circleProposals` table
4. Create `proposalEvolutions` table
5. Create `proposalAttachments` table
6. Create `proposalObjections` table
7. Push schema to Convex
8. Create helper functions (`canQuickEdit`, `checkApprovalAuthority`)

**Validation**:

- [ ] Schema compiles without errors
- [ ] Tables appear in Convex dashboard
- [ ] Default values work correctly

---

### Phase 2: Quick Edit Mode (3-4 days)

**Goal**: Inline editing for users with permission

**Tasks**:

1. Implement `circles.quickUpdate` mutation
2. Implement `circleItems.quickUpdate` mutation
3. Implement `circleRoles.quickUpdate` mutation
4. Create `requireQuickEditPermission` function
5. Create `InlineEditText` UI component
6. Create `EditPermissionTooltip` component
7. Integrate into `CircleDetailPanel`
8. Integrate into `RoleCard`
9. Add workspace settings UI for `allowQuickChanges`

**Validation**:

- [ ] User with permission can click and edit circle name
- [ ] User without permission sees read-only field with tooltip
- [ ] Changes persist after refresh
- [ ] Version history captured

---

### Phase 3: Operating Modes (2-3 days)

**Goal**: Circle types affect quick edit permissions

**Tasks**:

1. Implement `canQuickEdit` circle type logic
2. Create `CircleTypeSelector` component
3. Create `DecisionModelSelector` component
4. Create `CircleTypeBadge` component
5. Add operating mode to circle detail view
6. Update quick edit to respect circle type

**Validation**:

- [ ] Hierarchical circle: only Circle Lead can quick edit
- [ ] Empowered team: any member can quick edit
- [ ] Guild: no quick edit, shows tooltip
- [ ] Circle type badge displays correctly

---

### Phase 4: Proposal System (4-5 days)

**Goal**: Create and manage proposals

**Tasks**:

1. Implement `proposals.create` mutation
2. Implement `proposals.addEvolution` mutation
3. Implement `proposals.submit` mutation
4. Implement `proposals.withdraw` mutation
5. Implement `proposals.list` query
6. Implement `proposals.get` query
7. Create `ProposalForm` component
8. Create `ProposalCard` component
9. Create `ProposalDetailPanel` component
10. Create "Edit Circle" button that opens proposal form
11. Add proposal list to circle detail view

**Validation**:

- [ ] Any user can create a proposal
- [ ] Proposal shows in list with correct status
- [ ] Proposal can be submitted to meeting
- [ ] Proposal appears in meeting agenda

---

### Phase 5: IDM & Approval (3-4 days)

**Goal**: Process proposals in meetings with objection handling

**Tasks**:

1. Implement `proposals.startProcessing` mutation
2. Implement `proposals.raiseObjection` mutation
3. Implement `proposals.validateObjection` mutation
4. Implement `proposals.integrateObjection` mutation
5. Implement `proposals.approve` mutation
6. Implement `proposals.reject` mutation
7. Implement `applyProposalChanges` helper
8. Create `ObjectionForm` component
9. Create `ObjectionCard` component
10. Create `ObjectionRoundStatus` component
11. Integrate into meeting flow

**Validation**:

- [ ] Recorder can start processing proposal
- [ ] Circle members can raise objections
- [ ] Recorder can validate/invalidate objections
- [ ] Integrated objections update proposal
- [ ] Approved proposal applies changes to circle
- [ ] Version history shows approval with proposal reference

---

## 9. Validation Strategy

### Per-Phase Testing

**Phase 1**:

- Run `npx convex dev` - schema should compile
- Check Convex dashboard for new tables

**Phase 2**:

- Manual test: Login as user with Org Designer role
- Manual test: Click circle name, edit, click away
- Check version history table for new entry

**Phase 3**:

- Manual test: Create circle with type "empowered_team"
- Manual test: Verify different user can edit
- Manual test: Create guild, verify no edit allowed

**Phase 4**:

- Manual test: Create proposal as regular user
- Manual test: Add evolutions to proposal
- Manual test: Submit to governance meeting

**Phase 5**:

- Manual test: Process proposal in meeting
- Manual test: Raise and integrate objection
- Manual test: Approve and verify changes applied

### E2E Test Scenarios (Future)

```typescript
test('quick edit - happy path', async () => {
	// Setup: User with Org Designer role, workspace with allowQuickChanges
	// Action: Edit circle name inline
	// Assert: Name updated, version history captured
});

test('quick edit - permission denied', async () => {
	// Setup: User without Org Designer role
	// Action: Attempt to edit
	// Assert: Field is read-only, tooltip shown
});

test('proposal - full workflow', async () => {
	// Setup: Create proposal, submit to meeting
	// Action: Process in meeting, approve
	// Assert: Changes applied to circle
});

test('proposal - with objections', async () => {
	// Setup: Create proposal, submit, raise objection
	// Action: Validate, integrate, approve
	// Assert: Changes applied, objection recorded
});
```

---

## 10. Rough Estimates

| Phase                    | Effort   | Dependencies |
| ------------------------ | -------- | ------------ |
| Phase 1: Foundation      | 2-3 days | None         |
| Phase 2: Quick Edit      | 3-4 days | Phase 1      |
| Phase 3: Operating Modes | 2-3 days | Phase 2      |
| Phase 4: Proposals       | 4-5 days | Phase 1      |
| Phase 5: IDM             | 3-4 days | Phase 4      |

**Total: 14-19 days**

**Risk Factors**:

- UI complexity (inline editing can be tricky)
- Meeting integration complexity
- Edge cases discovered during implementation

**Recommended Buffer**: +20% → **17-23 days**

---

## 11. References

- BDD Spec: `ai-docs/tasks/edit-circle-feature.md`
- Operating Modes Spec: `ai-docs/tasks/organizational-operating-modes.md`
- Existing RBAC: `convex/rbac/permissions.ts`
- Version History: `convex/core/history`
- Meetings: `convex/meetings.ts`
- Current Schema: `convex/schema.ts`
