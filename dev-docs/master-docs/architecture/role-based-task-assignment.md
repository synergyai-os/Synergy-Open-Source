# Role-Based Task Assignment Design

**Version**: 1.0  
**Status**: Draft  
**Last Updated**: 2025-12-20  
**Ticket**: SYOS-1031  
**Related**: architecture.md, governance-design.md

---

## 1. Executive Summary

### Problem

Tasks can only be assigned to specific people. This doesn't model role-based accountability where "whoever fills the AI Engineer role" should handle certain work.

### Proposed Solution

Enable task assignment to either:
- **A person** (current: "Randy, do this")
- **A role** (new: "AI Engineer role, do this")

When assigned to a role, all role fillers see the task. Any filler can claim and complete it.

### Key Finding

**Schema already partially supports this.** The `tasks` table has:
- `assigneeType`: `'user'` | `'role'`
- `assigneeUserId` / `assigneeRoleId` fields

**Critical Issue**: `assigneeUserId` violates XDOM-01 (must use `personId`). See SYOS-1033.

### Impact

| Area | Change Level |
|------|--------------|
| Schema | Minor (add fields, fix violation) |
| Queries | Moderate (resolve role→people) |
| UI | New component (PersonOrRoleSelector) |
| Invariants | 4 new invariants |

---

## 2. User Stories

### Story 1: Role-Based Task Creation

**As a** Circle Lead  
**I want to** assign a task to the "AI Engineer" role  
**So that** any of the 3 people filling that role can pick it up

**Acceptance:**
- I can select either a person OR a role when creating a task
- If I select "AI Engineer" role, all 3 fillers see the task
- Task shows "Assigned to: AI Engineer (role)" with badge

### Story 2: My Tasks Include Role Tasks

**As a** person filling the "AI Engineer" role  
**I want to** see tasks assigned to my roles  
**So that** I know what role-based work needs attention

**Acceptance:**
- Task list shows: personal tasks + role tasks I can claim
- Role tasks have distinct badge ("AI Engineer")
- Filter options: All / Personal / Role-based

### Story 3: Claim a Role Task

**As a** person filling a shared role  
**I want to** claim a role task  
**So that** others know I'm handling it

**Acceptance:**
- "Claim" button on unclaimed role tasks
- Claimed task shows "Claimed by Alice"
- Other fillers still see it (can complete if needed)
- Claiming is optional (can complete without claiming)

### Story 4: Role Task Completion

**As a** person filling a role  
**I want to** complete a role-assigned task  
**So that** it's marked done for everyone

**Acceptance:**
- When I complete, task disappears from all fillers' lists
- Completion history shows WHO completed (me), not just role
- Task can be completed by any filler, claimed or not

### Story 5: Role Membership Changes

**As a** Circle Lead  
**I want** task lists to update when I change role membership  
**So that** people see current relevant tasks

**Acceptance:**
- Add Alice to role → she sees role's pending tasks
- Remove Bob from role → he stops seeing those tasks
- In-progress/claimed tasks stay assigned (don't disappear)

### Story 6: Empty Role Tasks

**As a** Circle Lead  
**I want to** assign tasks to roles with no fillers  
**So that** work is ready when someone fills the role

**Acceptance:**
- Can assign task to empty role
- Task shows "Assigned to: Secretary (0 people)"
- Circle Lead sees orphaned tasks in special view
- When role filled, filler immediately sees task

---

## 3. BDD Scenarios

### Scenario 1: Create Role-Assigned Task

```gherkin
Given I am a Circle Lead in "Product Circle"
And "AI Engineer" role has 3 fillers: Randy, Alice, Bob
When I create task "Optimize model inference"
And I assign it to "AI Engineer" role
Then the task appears in Randy's task list
And the task appears in Alice's task list
And the task appears in Bob's task list
And the task shows badge "AI Engineer"
```

### Scenario 2: Claim Role Task

```gherkin
Given task "Optimize model" is assigned to "AI Engineer" role
And Randy, Alice, Bob fill that role
And task is unclaimed
When Alice clicks "Claim"
Then task shows "Claimed by Alice Chen"
And Randy still sees the task (with claimed indicator)
And Bob still sees the task (with claimed indicator)
```

### Scenario 3: Complete Role Task

```gherkin
Given task "Optimize model" is claimed by Alice
And Randy, Alice, Bob fill "AI Engineer" role
When Alice marks the task complete
Then task disappears from Randy's list
And task disappears from Bob's list
And task disappears from Alice's list
And completion history shows "Completed by Alice Chen"
```

### Scenario 4: Complete Unclaimed Role Task

```gherkin
Given task "Quick fix" is assigned to "Dev" role
And task is NOT claimed
And Randy fills "Dev" role
When Randy marks the task complete
Then task is completed
And completion shows "Completed by Randy"
And no "claimed by" is recorded
```

### Scenario 5: Role Membership Added

```gherkin
Given task "Document API" is assigned to "Tech Writer" role
And Alice fills "Tech Writer" role
And Bob does NOT fill "Tech Writer" role
When Circle Lead assigns Bob to "Tech Writer" role
Then Bob immediately sees task "Document API"
And task shows "Assigned to: Tech Writer (2 people)"
```

### Scenario 6: Role Membership Removed

```gherkin
Given task "Review PR" is assigned to "Dev Lead" role
And Randy and Alice fill "Dev Lead" role
When Circle Lead removes Randy from "Dev Lead" role
Then Randy no longer sees task "Review PR"
And Alice still sees it
And task shows "Assigned to: Dev Lead (1 person)"
```

### Scenario 7: Empty Role Task - Circle Lead View

```gherkin
Given "Secretary" role exists with 0 fillers
And Circle Lead creates task "Take notes"
And assigns it to "Secretary" role
Then task shows "Assigned to: Secretary (0 people)"
And Circle Lead sees task in "Unassigned Role Tasks" view
And no one else sees it in their task list
```

### Scenario 8: Filter Task Views

```gherkin
Given I am Randy
And I have 2 personal tasks
And I fill "Facilitator" role (3 tasks)
And I fill "AI Engineer" role (1 task)
When I view "All tasks"
Then I see 6 tasks
When I filter to "Personal only"
Then I see 2 tasks
When I filter to "Role tasks only"
Then I see 4 tasks
```

### Scenario 9: Role Deletion Prevention

```gherkin
Given "Tech Lead" role has uncompleted task "Finish migration"
When Circle Lead tries to delete "Tech Lead" role
Then system prevents deletion
And shows error "Cannot delete role with uncompleted tasks (1 task)"
And offers option to reassign tasks first
```

---

## 4. Schema Design

### 4.1 Current State (After SYOS-1033)

```typescript
// convex/features/tasks/tables.ts (after fix)
export const tasksTable = defineTable({
  workspaceId: v.id('workspaces'),
  
  // Assignment (person OR role)
  assigneeType: v.union(v.literal('person'), v.literal('role')),
  assigneePersonId: v.optional(v.id('people')),  // When type='person'
  assigneeRoleId: v.optional(v.id('circleRoles')),  // When type='role'
  
  // Existing fields...
  description: v.string(),
  status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),
  dueDate: v.optional(v.number()),
  
  // Context
  circleId: v.optional(v.id('circles')),
  meetingId: v.optional(v.id('meetings')),
  agendaItemId: v.optional(v.id('meetingAgendaItems')),
  projectId: v.optional(v.id('projects')),
  
  // External links
  linearTicketId: v.optional(v.string()),
  notionPageId: v.optional(v.string()),
  
  // Audit
  createdAt: v.number(),
  createdByPersonId: v.id('people'),
  updatedAt: v.optional(v.number()),
})
```

### 4.2 New Fields (This Feature)

```typescript
// ADD to tasksTable
{
  // Claimed pattern (role tasks only)
  claimedByPersonId: v.optional(v.id('people')),
  claimedAt: v.optional(v.number()),
  
  // Completion audit
  completedByPersonId: v.optional(v.id('people')),
  completedAt: v.optional(v.number()),
}
```

### 4.3 New Index

```typescript
// ADD to tasksTable
.index('by_assignee_role', ['assigneeRoleId'])
```

### 4.4 Schema Invariants

| Field | Invariant |
|-------|-----------|
| `claimedByPersonId` | Only set when `assigneeType = 'role'` |
| `claimedAt` | Set iff `claimedByPersonId` is set |
| `completedByPersonId` | Set iff `status = 'done'` |
| `completedAt` | Set iff `status = 'done'` |

---

## 5. Query Strategy

### 5.1 "My Tasks" Query (Updated)

```typescript
export async function listMyTasks(
  ctx: QueryCtx, 
  personId: Id<'people'>
): Promise<Task[]> {
  // 1. Get roles I fill
  const myAssignments = await ctx.db
    .query('assignments')
    .withIndex('by_person', (q) => q.eq('personId', personId))
    .filter((q) => q.eq(q.field('status'), 'active'))
    .collect();
  const myRoleIds = myAssignments.map(a => a.roleId);
  
  // 2. Get tasks assigned to ME directly
  const personalTasks = await ctx.db
    .query('tasks')
    .withIndex('by_assignee_person', (q) => q.eq('assigneePersonId', personId))
    .collect();
  
  // 3. Get tasks assigned to MY ROLES
  const roleTasks: Task[] = [];
  for (const roleId of myRoleIds) {
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_assignee_role', (q) => q.eq('assigneeRoleId', roleId))
      .collect();
    roleTasks.push(...tasks);
  }
  
  // 4. Combine and dedupe
  const allTasks = [...personalTasks, ...roleTasks];
  return dedupeById(allTasks);
}
```

### 5.2 Filter Support

```typescript
type TaskFilter = 'all' | 'personal' | 'role';

export async function listMyTasksFiltered(
  ctx: QueryCtx,
  personId: Id<'people'>,
  filter: TaskFilter
): Promise<Task[]> {
  switch (filter) {
    case 'personal':
      return ctx.db.query('tasks')
        .withIndex('by_assignee_person', q => q.eq('assigneePersonId', personId))
        .collect();
    case 'role':
      // Get role tasks only (see above pattern)
      return getRoleTasks(ctx, personId);
    case 'all':
    default:
      return listMyTasks(ctx, personId);
  }
}
```

### 5.3 Circle Lead: Orphaned Role Tasks

```typescript
export async function listOrphanedRoleTasks(
  ctx: QueryCtx,
  circleId: Id<'circles'>
): Promise<Task[]> {
  // Get all roles in circle
  const roles = await ctx.db.query('circleRoles')
    .withIndex('by_circle', q => q.eq('circleId', circleId))
    .collect();
  
  const orphanedTasks: Task[] = [];
  
  for (const role of roles) {
    // Check if role has any active fillers
    const fillers = await ctx.db.query('assignments')
      .withIndex('by_role', q => q.eq('roleId', role._id))
      .filter(q => q.eq(q.field('status'), 'active'))
      .collect();
    
    if (fillers.length === 0) {
      // Role has no fillers - get its tasks
      const tasks = await ctx.db.query('tasks')
        .withIndex('by_assignee_role', q => q.eq('assigneeRoleId', role._id))
        .filter(q => q.neq(q.field('status'), 'done'))
        .collect();
      orphanedTasks.push(...tasks);
    }
  }
  
  return orphanedTasks;
}
```

### 5.4 Performance Considerations

| Query | Index Used | Complexity |
|-------|------------|------------|
| Personal tasks | `by_assignee_person` | O(1) lookup |
| Role tasks | `by_assignee_role` + `by_person` | O(roles) lookups |
| Orphaned tasks | `by_circle` + `by_role` | O(roles in circle) |

**Optimization Note**: For users with many roles, consider caching role IDs or denormalizing.

---

## 6. Completion Logic

### 6.1 State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                      TASK LIFECYCLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────┐     ┌─────────────┐     ┌──────┐                │
│   │ todo │ ──► │ in-progress │ ──► │ done │                │
│   └──────┘     └─────────────┘     └──────┘                │
│       │              │                 │                    │
│       │              │                 ▼                    │
│       │              │         completedByPersonId set      │
│       │              │         completedAt set              │
│       │              │                                      │
│       └──────────────┴─── Any filler can complete ──────────│
│                                                              │
│   ROLE TASKS ONLY:                                          │
│   ┌───────────┐                                             │
│   │ unclaimed │ ──► claimedByPersonId set                   │
│   └───────────┘     claimedAt set                           │
│        │                                                     │
│        └── Claiming is OPTIONAL (can complete without)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Completion Rules

| Rule | Description |
|------|-------------|
| **Person task** | Only assignee can complete |
| **Role task (unclaimed)** | Any role filler can complete |
| **Role task (claimed)** | Any role filler can complete (claim is advisory) |
| **Completion audit** | Always records `completedByPersonId` + `completedAt` |

### 6.3 Claim Rules

| Rule | Description |
|------|-------------|
| **Who can claim** | Only active fillers of the assigned role |
| **Claim effect** | Visual indicator only; doesn't lock task |
| **Unclaim** | Claimant can unclaim; task returns to pool |
| **Override** | Anyone can complete even if claimed by another |

### 6.4 Implementation

```typescript
export async function claimTask(
  ctx: MutationCtx,
  taskId: Id<'tasks'>,
  personId: Id<'people'>
): Promise<void> {
  const task = await requireTask(ctx, taskId);
  
  // Validate: must be role-assigned
  if (task.assigneeType !== 'role') {
    throw createError(ErrorCodes.VALIDATION_INVALID_OPERATION, 
      'Can only claim role-assigned tasks');
  }
  
  // Validate: person must fill the role
  const isAssigned = await isAssignedToRole(ctx, personId, task.assigneeRoleId!);
  if (!isAssigned) {
    throw createError(ErrorCodes.AUTHZ_NOT_ROLE_FILLER,
      'You do not fill this role');
  }
  
  await ctx.db.patch(taskId, {
    claimedByPersonId: personId,
    claimedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function completeTask(
  ctx: MutationCtx,
  taskId: Id<'tasks'>,
  personId: Id<'people'>
): Promise<void> {
  const task = await requireTask(ctx, taskId);
  
  // Validate: person can complete
  await validateCanComplete(ctx, task, personId);
  
  await ctx.db.patch(taskId, {
    status: 'done',
    completedByPersonId: personId,
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

async function validateCanComplete(
  ctx: QueryCtx,
  task: Task,
  personId: Id<'people'>
): Promise<void> {
  if (task.assigneeType === 'person') {
    // Person task: must be the assignee
    if (task.assigneePersonId !== personId) {
      throw createError(ErrorCodes.AUTHZ_NOT_TASK_ASSIGNEE,
        'Only the assignee can complete this task');
    }
  } else {
    // Role task: must fill the role
    const isAssigned = await isAssignedToRole(ctx, personId, task.assigneeRoleId!);
    if (!isAssigned) {
      throw createError(ErrorCodes.AUTHZ_NOT_ROLE_FILLER,
        'You do not fill this role');
    }
  }
}
```

---

## 7. Role Deletion Guard

### 7.1 Rule

**Cannot delete/archive a role if it has uncompleted tasks assigned.**

### 7.2 Implementation

```typescript
// In convex/core/roles/rules.ts

export async function validateRoleDeletion(
  ctx: QueryCtx,
  roleId: Id<'circleRoles'>
): Promise<void> {
  // Check for uncompleted tasks
  const pendingTasks = await ctx.db
    .query('tasks')
    .withIndex('by_assignee_role', q => q.eq('assigneeRoleId', roleId))
    .filter(q => q.neq(q.field('status'), 'done'))
    .collect();
  
  if (pendingTasks.length > 0) {
    throw createError(
      ErrorCodes.VALIDATION_ROLE_HAS_TASKS,
      `Cannot delete role with ${pendingTasks.length} uncompleted task(s). Reassign or complete tasks first.`
    );
  }
}
```

### 7.3 UI Guidance

When deletion blocked, offer:
1. View tasks assigned to this role
2. Reassign tasks to another role/person
3. Complete remaining tasks

---

## 8. UI/UX Requirements

### 8.1 PersonOrRoleSelector Component

**Purpose**: Select either a person OR a role as assignee.

**API**:
```typescript
type AssigneeValue = 
  | { type: 'person'; personId: Id<'people'> }
  | { type: 'role'; roleId: Id<'circleRoles'> };

interface PersonOrRoleSelectorProps {
  workspaceId: Id<'workspaces'>;
  circleId?: Id<'circles'>;  // Filter roles to this circle
  value: AssigneeValue | null;
  onChange: (value: AssigneeValue) => void;
  placeholder?: string;
}
```

**Display**:
| Item Type | Visual |
|-----------|--------|
| Person | Avatar + Name |
| Role | Role icon + Name + "(N people)" |

**Behavior**:
- Searchable dropdown
- Groups: "People" section, "Roles" section
- Roles show filler count

### 8.2 Task List Item

**Badge Display**:
| State | Badge |
|-------|-------|
| Personal task | None (or "Personal" if filtered) |
| Role task (unclaimed) | Role name badge |
| Role task (claimed by me) | Role name + "Claimed by you" |
| Role task (claimed by other) | Role name + "Claimed by Alice" |

### 8.3 Filter Controls

```
[All Tasks ▼] [Personal] [Role-based]
```

---

## 9. Invariants

### 9.1 New Invariants

| ID | Invariant | Severity |
|----|-----------|----------|
| **TASK-05** | If `assigneeType = 'role'`, `assigneeRoleId` must exist in `circleRoles` | critical |
| **TASK-06** | If `assigneeType = 'person'`, `assigneePersonId` must exist in `people` | critical |
| **TASK-07** | Role task can only be completed by someone filling that role | critical |
| **TASK-08** | Completed tasks (`status = 'done'`) must have `completedByPersonId` and `completedAt` set | critical |
| **TASK-09** | `claimedByPersonId` only valid when `assigneeType = 'role'` | warning |

### 9.2 Add to INVARIANTS.md

```markdown
## Tasks (TASK-*)

| ID | Invariant | Severity | Enforcement |
|----|-----------|----------|-------------|
| TASK-05 | Role assignee exists | critical | Mutation validation |
| TASK-06 | Person assignee exists | critical | Mutation validation |
| TASK-07 | Role task completion by filler | critical | Mutation validation |
| TASK-08 | Completion audit fields set | critical | Mutation validation |
| TASK-09 | Claim only on role tasks | warning | Mutation validation |
```

---

## 10. Design Decisions

### D1: Empty Role Visibility

**Decision**: Circle Lead sees orphaned role tasks.

**Rationale**: Someone needs visibility into work that has no owner. Circle Lead is accountable for circle operations.

**Implementation**: "Unassigned Role Tasks" query/view for Circle Leads.

### D2: Claim Pattern

**Decision**: Lightweight "claimed by" field (advisory, not locking).

**Rationale**: 
- Full subtask system too complex for our scope
- Binary complete/incomplete is too rigid for shared work
- "Claimed by" signals intent without blocking others

**Trade-off**: Less formal than subtask claiming, but simpler.

### D3: Role Deletion Guard

**Decision**: Prevent deletion if uncompleted tasks exist.

**Rationale**: Deleting role would orphan tasks. Force explicit reassignment.

**Alternative considered**: Cascade delete tasks — rejected (data loss).

### D4: Multi-Role Assignment

**Decision**: NOT in scope. Single assignee only.

**Rationale**: Complexity not justified. Can add later if needed.

### D5: Task Display

**Decision**: Unified list with badges + filter options.

**Rationale**: Users want one place to see all their work, with ability to focus when needed.

---

## 11. Migration Plan

### Step 1: SYOS-1033 (Prerequisite)

Fix `assigneeUserId` → `assigneePersonId`. **Must complete first.**

### Step 2: Schema Addition

Add new fields to `tasks` table:
- `claimedByPersonId`
- `claimedAt`
- `completedByPersonId`
- `completedAt`

Add index: `by_assignee_role`

**Migration**: Zero users = just add fields. No data migration needed.

### Step 3: Query Updates

Update `listMyTasks` to resolve role assignments.

### Step 4: Mutation Updates

- Update `completeTask` to set audit fields
- Add `claimTask` / `unclaimTask` mutations
- Add role deletion guard

### Step 5: UI Components

- Create `PersonOrRoleSelector`
- Update task list display
- Add filters

---

## 12. Implementation Tickets (Do Not Create Yet)

Pending human approval of this design.

### Phase 1: Schema & Core (Blocked by SYOS-1033)

1. **Add completion audit fields** — `completedByPersonId`, `completedAt`
2. **Add claimed fields** — `claimedByPersonId`, `claimedAt`
3. **Add index** — `by_assignee_role`
4. **Update completion mutation** — Set audit fields

### Phase 2: Query Logic

5. **Update listMyTasks** — Resolve role→people
6. **Add filter support** — all/personal/role
7. **Add orphaned tasks query** — Circle Lead view
8. **Add claim/unclaim mutations**

### Phase 3: Guards & Validation

9. **Add role deletion guard** — Check for pending tasks
10. **Add invariants** — TASK-05 through TASK-09
11. **Add invariant checks** — In admin/invariants

### Phase 4: UI

12. **Create PersonOrRoleSelector** — New component
13. **Update task list** — Badges, claimed indicator
14. **Add filter controls** — All/Personal/Role

---

## 13. Open Questions

### Resolved

| Question | Resolution |
|----------|------------|
| Empty role visibility | Circle Lead sees orphaned tasks |
| Partial completion | Claimed pattern (advisory) |
| Role deletion | Prevent if uncompleted tasks |
| Multi-role | Not in scope |
| Display | Unified + badges + filters |

### Deferred

| Question | Status |
|----------|--------|
| Should projects/outcomes follow same pattern? | Yes, but implement in tasks first, then copy |
| Performance at scale (many roles per person) | Monitor; optimize if needed |
| Notification when role task appears | Future feature |

---

## 14. References

- [architecture.md](architecture.md) — Core domains, identity architecture
- [governance-design.md](governance-design.md) — Role model, circle types
- `convex/features/tasks/` — Current implementation
- `convex/core/assignments/` — Role membership queries
- SYOS-1031 — This design ticket
- SYOS-1033 — Prerequisite fix (userId → personId)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial design based on investigation |