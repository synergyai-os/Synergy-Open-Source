# linear-subtickets

**Purpose**: Create subtasks for a parent Linear ticket with proper linking, labels, and dependency analysis.

---

## 🎯 Workflow

1. **Analyze Parent Ticket**
   - Read parent ticket to understand context
   - Identify parent's labels (especially Type label)
   - Understand parent's dependencies

2. **Determine Subtask Labels**
   - **Type Label**: Usually inherit from parent (same type)
     - Exception: If subtask is different type (rare), use appropriate type
   - **Scope Labels**: Based on subtask work (frontend, backend, etc.)

3. **Create Subtasks**
   - Link to parent via `parentId`
   - Use correct labels (validate against parent)
   - Set appropriate estimates
   - Include parent reference in title: `[SYOS-XXX] Subtask Title`

4. **Analyze Dependencies**
   - Determine parallel vs sequential work
   - Document in each subtask's "Dependencies" section

---

## 📋 Required Fields Checklist

**Before creating each subtask:**

- [ ] Parent ticket ID identified and verified
- [ ] Type label determined (usually inherit from parent)
- [ ] Scope labels determined (based on subtask work)
- [ ] Estimate set (numeric: 0-5)
- [ ] Title includes parent reference: `[SYOS-XXX] Subtask Title`
- [ ] Description includes: `**Parent**: SYOS-XXX - [Parent Title]`
- [ ] `parentId` set in `mcp_Linear_create_issue()` call
- [ ] Dependencies analyzed (parallel vs sequential)

---

## 🏷️ Label Selection for Subtasks

### Type Label (Usually Inherit from Parent)

**Default Rule**: Subtasks inherit parent's Type label

**Examples:**

- Parent: `tech-debt` → Subtask: `tech-debt` ✅
- Parent: `feature` → Subtask: `feature` ✅
- Parent: `bug` → Subtask: `bug` ✅

**Exception**: Only use different type if subtask is genuinely different

- Example: Parent `feature` has subtask for "Write tests" → Use `tech-debt` ✅
- But this is rare - usually subtasks match parent type

**Validation**: Ask "Does this subtask match the parent's type?" If yes, inherit. If no, justify exception.

### Scope Labels (Based on Subtask Work)

- **`frontend`**: Svelte components, composables, UI code
- **`backend`**: Convex functions, server-side logic
- **`ui`**: Design system, styling, visual changes
- **`devops`**: CI/CD, deployment, infrastructure
- **`auth`**: Authentication, authorization
- **`workspace`**: Organization/team management
- **`analytics`**: PostHog, tracking, metrics
- **`security`**: Security fixes, vulnerabilities

**Can have multiple scope labels** (e.g., `frontend` + `ui`)

---

## 🔗 Parent Linking

**Required in every subtask:**

1. **Title Format**: `[SYOS-XXX] Subtask Title`
   - Example: `[SYOS-255] Write Characterization Tests`

2. **Description Header**: `**Parent**: SYOS-XXX - [Parent Title]`
   - Example: `**Parent**: SYOS-255 - Refactor useOrganizations Composable`

3. **API Call**: `parentId: 'parent-ticket-id'`
   - Get parent ID from parent ticket creation response
   - Example: `parentId: '7c9a1bc5-4970-4614-936b-a7d8a814b16e'`

**Verification**: After creating subtask, verify linking:

- Check subtask has `parentId` field set
- Check title includes `[SYOS-XXX]` prefix
- Check description includes parent reference

---

## ⚡ Parallel vs Sequential Analysis

### Can Work in Parallel ✅

**When:**

- Different files/modules (no shared code)
- Independent functionality
- No dependencies between subtasks
- Clear technical boundaries

**Example:**

- Subtask 1: Write tests (tests/ directory)
- Subtask 2: Extract utilities (src/lib/utils/)
- Subtask 3: Write E2E tests (e2e/ directory)
- ✅ All can run in parallel - different files, no conflicts

**Documentation Format:**

```markdown
## Dependencies

**Requires**: None (can start immediately)

**Blocks**: [What waits for this]

**Parallel**: ✅ **CAN work in parallel with SYOS-XXX** - [Why parallel]
```

### Must Be Sequential ❌

**When:**

- Subtask B depends on Subtask A's output
- Shared files that would cause conflicts
- Subtask B uses code from Subtask A
- Clear dependency chain

**Example:**

- Subtask 1: Extract storage utilities
- Subtask 2: Extract state management (uses storage utilities)
- Subtask 3: Extract mutations (uses state management)
- ❌ Must be sequential - each depends on previous

**Documentation Format:**

```markdown
## Dependencies

**Requires**: SYOS-XXX (Previous Subtask) - [Why needed]

**Blocks**: SYOS-XXX (Next Subtask) - [What waits for this]

**Parallel**: ❌ **MUST be sequential** - [Why sequential]
```

---

## 📝 Example Workflow

```typescript
// 1. Get parent ticket
const parentTicket = await mcp_Linear_get_issue({ id: 'SYOS-255' });

// 2. Determine labels (inherit type from parent, determine scope)
const parentLabels = parentTicket.labels;
const typeLabel = parentLabels.find((l) => l.name === 'tech-debt'); // Inherit from parent
const scopeLabel = LINEAR_LABELS.frontend; // Based on subtask work

// 3. Create subtask
const subtask = await mcp_Linear_create_issue({
	team: 'SYOS',
	title: `[SYOS-255] Write Characterization Tests`,
	description: `
**Parent**: SYOS-255 - ${parentTicket.title}

## Context
...
  `,
	projectId: projectId,
	assigneeId: RANDY_USER_ID,
	state: 'Todo',
	estimate: ESTIMATES.m,
	labels: [typeLabel.id, scopeLabel], // Inherit type, add scope
	parentId: parentTicket.id // ✅ Link to parent
});

// 4. Verify linking
const createdSubtask = await mcp_Linear_get_issue({ id: subtask.id });
console.log('Parent ID:', createdSubtask.parentId); // Should match parentTicket.id
```

---

## ✅ Validation Checklist

**After creating subtasks:**

- [ ] All subtasks have parent reference in title (`[SYOS-XXX]`)
- [ ] All subtasks have `parentId` set correctly
- [ ] Type labels match parent (or justified exception)
- [ ] Scope labels appropriate for each subtask
- [ ] Dependencies documented (parallel vs sequential)
- [ ] Estimates set appropriately
- [ ] All required fields present

---

## 📚 References

- **Parent Command**: `/linear` - Complete Linear workflow reference
- **Label Guide**: See `/linear` command - Label Selection Guide section
- **Ticket Format**: `dev-docs/2-areas/development/ticket-writing-format.md`

---

**Last Updated**: 2025-11-18  
**Purpose**: Guide for creating properly linked and labeled subtasks
