# create-tasks

**Purpose**: Unified command to create Linear tickets or subtasks. Intelligently decides whether to create a new ticket or add subtasks to an existing ticket, then executes the creation.

**See**:

- `.cursor/commands/start.md` - Linear constants (single source of truth)
- `dev-docs/2-areas/development/ticket-writing-format.md` - Ticket format template
- `dev-docs/2-areas/development/approach-option-detection.md` - Approach option detection & confirmation logic

---

## 🎯 Decision Tree: New Ticket vs Subtasks

### Step 1: Analyze User Intent

**Check conversation context for:**

1. **Parent Ticket ID** (SYOS-XXX format)
   - If found → Likely creating subtasks
   - If not found → Likely creating new ticket

2. **User Explicit Intent**
   - "create subtasks for SYOS-123" → Subtasks
   - "create new ticket" → New ticket
   - "break down SYOS-123" → Subtasks
   - "add tasks to SYOS-123" → Subtasks

3. **Context Clues**
   - User mentions "parent ticket" → Subtasks
   - User mentions "project" → New ticket
   - User mentions "epic" or "break down" → Subtasks

### Step 2: Decision Logic

```javascript
IF user provides parent ticket ID (SYOS-XXX):
  → Create subtasks (unless user explicitly says "new ticket")

ELSE IF user says "create new ticket" or "new task":
  → Create new ticket

ELSE IF no ticket ID and no explicit intent:
  → ASK user: "Create new ticket or add subtasks to existing ticket?"
```

---

## 📋 Workflow: Create New Ticket

### Step 0: Detect and Confirm Approach Options (If Applicable)

**CRITICAL**: If working from a task template document (e.g., `ai-docs/tasks/SYOS-XXX-*.md`) that contains multiple approach options, MUST confirm selection before proceeding.

**Workflow:**

1. **Detect approach options** in task document (check for `## Approach Options` or `### Approach A:` patterns)
2. **Parse options** from document (title, pros, cons for each option)
3. **Check user intent** (explicit selection like "option A" vs. none)
4. **If user specified** → Use selected option, continue to Step 1
5. **If user didn't specify** → Recommend best option with 2-sentence reasoning, ask for confirmation
6. **Confirm selection** before proceeding to ticket creation

**See**: `dev-docs/2-areas/development/approach-option-detection.md` - Complete implementation guide (parsing logic, recommendation algorithm, confirmation format)

**Why this matters**: Prevents AI from silently picking an option without user awareness, reduces anxiety, ensures user understands the decision before ticket creation.

**Example:**

```javascript
User: "/create-tasks - Working from meetings-separation-of-concerns-refactoring.md"

AI: [Detects 3 approach options]
AI: "📋 Found 3 approach options in task document:
**Approach A**: Incremental Refactoring
**Approach B**: Batch Refactoring
**Approach C**: Pattern Extraction + Incremental Application

💡 **Recommendation**: A - Incremental Refactoring
Low risk: Each PR is small, easy to review. Fast feedback: Can validate approach early.

Proceed with A? (yes/no, or specify A/B/C)"

User: "yes"
AI: [Uses Approach A → Continues to Step 1]
```

---

### Step 1: Gather Requirements

**Ask user for:**

1. **Project** (REQUIRED unless user says "no project"):

   ```bash
   Which project should this ticket belong to?
   (Say "no project" to skip, or provide project name)
   ```

   - If "no project" → Continue without project
   - If project name → Proceed to Step 2 (get/create + confirm)
   - If no response → STOP (project ID required)

2. **Ticket Details**:
   - Title (required)
   - Description (use ticket writing format)
   - Type label (feature/bug/tech-debt/risk)
   - Scope labels (backend/frontend/ui/etc.)
   - Estimate (xs/s/m/l/xl → convert to numeric)

### Step 2: Get/Create Project + Confirm

**CRITICAL**: Always confirm project selection before proceeding. Wrong project = wasted time fixing tickets.

```typescript
// Linear Constants (from /start command)
const LINEAR_TEAM_NAME = 'SYOS';
const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5';
const LINEAR_LABELS = {
	/* See /start command */
};
const ESTIMATES = {
	/* See /start command */
};

// 1. Check if project exists
const projects = await mcp_Linear_list_projects({ team: LINEAR_TEAM_NAME });
let project = projects.find((p) => p.name === projectName);

// 2. If not found, search for similar names
if (!project) {
	const similarProjects = projects.filter(
		(p) =>
			p.name.toLowerCase().includes(projectName.toLowerCase()) ||
			projectName.toLowerCase().includes(p.name.toLowerCase())
	);

	if (similarProjects.length > 0) {
		// Show similar projects and ask for confirmation
		console.log(`Found similar projects: ${similarProjects.map((p) => p.name).join(', ')}`);
		// ASK USER: "Did you mean one of these? Or create new project?"
	}
}

// 3. Create if missing (only after user confirms)
if (!project) {
	// ASK USER FOR CONFIRMATION:
	// "Project '${projectName}' not found. Create new project? (yes/no)"
	// If yes → Create
	// If no → Ask user to provide correct project name or search
}

// 4. CONFIRM PROJECT SELECTION BEFORE PROCEEDING
// Show user:
// "✅ Selected project: ${project.name} (ID: ${project.id})"
// "Is this correct? (yes/no)"
//
// If yes → Continue to Step 3
// If no → Ask user:
//   - "Provide correct project name"
//   - "Or search for project: [search term]"
//   - Then repeat Step 2

const projectId = project.id; // ✅ Use ID, not name
```

### Step 3: Create Ticket

```typescript
const ticket = await mcp_Linear_create_issue({
	team: LINEAR_TEAM_NAME,
	title: '[Descriptive Title]',
	description: '...', // See ticket-writing-format.md
	project: projectId, // ✅ Required (or null if "no project")
	assignee: RANDY_USER_ID, // ✅ ALWAYS Randy
	state: 'Todo',
	estimate: ESTIMATES.s, // ✅ Required (numeric: 0-5)
	labels: [
		LINEAR_LABELS.feature, // ✅ Type (required, one)
		LINEAR_LABELS.backend // ✅ Scope (required, one or more)
	]
});
```

### Step 4: Verify Project Linking

**CRITICAL**: Tickets may not link to project during creation. Always verify:

```typescript
const createdTicket = await mcp_Linear_get_issue({ id: ticket.id });

// Verify project linking
if (!createdTicket.projectId || createdTicket.projectId !== projectId) {
	await mcp_Linear_update_issue({
		id: ticket.id,
		project: projectId // Explicitly link to project
	});
}
```

### Step 5: Auto-Detect and Create Subtasks (If Applicable)

**CRITICAL**: If ticket description contains "Subtasks (Priority Order)" section with clear phases, automatically break into subtasks.

**Detection Logic:**

```typescript
const ticketDescription = ticket.description;

// Check for subtask structure in description
const hasSubtasksSection =
	ticketDescription.includes('## Subtasks') ||
	ticketDescription.includes('## Subtasks (Priority Order)');

if (hasSubtasksSection) {
	// Parse subtasks from description
	const subtasks = parseSubtasksFromDescription(ticketDescription);

	if (subtasks.length > 0) {
		// ASK USER FOR CONFIRMATION:
		// "Found ${subtasks.length} subtasks in ticket description. Create them now? (yes/no)"
		//
		// If yes → Proceed to Step 6 (Create Subtasks)
		// If no → Skip subtask creation, ticket is complete
	}
}
```

**Parse Subtasks from Description:**

```typescript
function parseSubtasksFromDescription(description: string): SubtaskData[] {
	const subtasks: SubtaskData[] = [];

	// Pattern: Look for priority sections
	// ## Subtasks (Priority Order)
	// **🔴 URGENT (Ship First)**
	// - TICKET-1: [Title] (URGENT) - [Why urgent]
	// - TICKET-2: [Title] (URGENT) - [Why urgent]
	// **🟠 HIGH (Ship Week 1)**
	// - TICKET-3: [Title] (HIGH) - [Impact]

	const urgentSection = description.match(/🔴 URGENT.*?\n((?:- .*?\n)+)/s);
	const highSection = description.match(/🟠 HIGH.*?\n((?:- .*?\n)+)/s);
	const mediumSection = description.match(/🟡 MEDIUM.*?\n((?:- .*?\n)+)/s);

	// Parse each section
	if (urgentSection) {
		const items = parseSubtaskItems(urgentSection[1], 'URGENT');
		subtasks.push(...items);
	}
	if (highSection) {
		const items = parseSubtaskItems(highSection[1], 'HIGH');
		subtasks.push(...items);
	}
	if (mediumSection) {
		const items = parseSubtaskItems(mediumSection[1], 'MEDIUM');
		subtasks.push(...items);
	}

	return subtasks;
}

function parseSubtaskItems(sectionText: string, priority: string): SubtaskData[] {
	// Pattern: "- TICKET-1: [Title] (URGENT) - [Why urgent]"
	// Or: "- [Title] - [Description]"
	const lines = sectionText.split('\n').filter((line) => line.trim().startsWith('-'));

	return lines
		.map((line) => {
			const match = line.match(
				/^- (?:TICKET-\d+: )?(.+?)(?: \((URGENT|HIGH|MEDIUM)\))?(?: - (.+))?$/
			);
			if (match) {
				return {
					title: match[1].trim(),
					priority: match[2] || priority,
					description: match[3] || '',
					estimate: estimateFromPriority(match[2] || priority)
				};
			}
			return null;
		})
		.filter(Boolean);
}
```

**If subtasks detected → Proceed to Step 6 (Create Subtasks workflow)**

**If no subtasks detected → Continue to Step 6 (Update Task Template)**

### Step 6: Update Task Template Filename (MANDATORY)

**CRITICAL**: If working from task template, MUST update filename with actual Linear ticket ID.

**Detection:**

```typescript
// Check for task template files in context
const taskTemplateFiles = [
	'ai-docs/tasks/SYOS-XXX-*.md'
	// Check open files, recently viewed files, or conversation context
];

// Pattern: ai-docs/tasks/SYOS-XXX-[slug].md
const taskTemplatePattern = /ai-docs\/tasks\/SYOS-XXX-.*\.md/;

// Find task template file
const currentFile = findTaskTemplateFile(); // From context or file system
const isTaskTemplate = currentFile && taskTemplatePattern.test(currentFile);
```

**Update Workflow:**

```typescript
if (isTaskTemplate) {
	const ticketId = ticket.identifier; // e.g., 'SYOS-430'
	const newFilename = currentFile.replace('SYOS-XXX', ticketId);
	// Example: ai-docs/tasks/SYOS-XXX-branch-safety-gates.md
	//       → ai-docs/tasks/SYOS-430-branch-safety-gates.md

	// 1. Rename file
	await renameFile(currentFile, newFilename);

	// 2. Update file content to include Linear ticket link
	const fileContent = await readFile(newFilename);
	const updatedContent = fileContent.replace(
		/# .*?\n/,
		`# [Title]\n\n**Linear Ticket**: [${ticketId}](https://linear.app/younghumanclub/issue/${ticketId})\n\n`
	);
	await writeFile(newFilename, updatedContent);

	console.log(`✅ Updated task template: ${newFilename}`);
}
```

**Why this matters**: Makes it easy to find task documents by ticket ID, maintains clear link between Linear tickets and task analysis documents.

---

## 📋 Workflow: Create Subtasks

### Step 1: Get Parent Ticket

```typescript
const parentTicket = await mcp_Linear_get_issue({ id: 'SYOS-XXX' });

// Verify parent exists
if (!parentTicket) {
	throw new Error(`Parent ticket SYOS-XXX not found`);
}
```

### Step 2: Analyze Parent Ticket

**Extract from parent:**

- **Type Label**: Inherit from parent (usually same type)
- **Project ID**: Get from parent ticket (CRITICAL - subtasks need project)
- **Dependencies**: Understand parent's dependencies
- **Description**: Check for subtask structure (if creating from parent description)

### Step 3: Determine Subtask Details

**If subtasks come from parent ticket description:**

- Parse subtasks from "Subtasks (Priority Order)" section (see Step 5 above)
- Use parsed titles, priorities, descriptions

**If subtasks come from user request:**

- Ask user for subtask details
- For each subtask, determine:
  1. **Title**: `[SYOS-XXX] Subtask Title`
  2. **Description**: Include `**Parent**: SYOS-XXX - [Parent Title]`
  3. **Type Label**: Usually inherit from parent
  4. **Scope Labels**: Based on subtask work (frontend, backend, etc.)
  5. **Estimate**: Appropriate for subtask size
  6. **Dependencies**: Parallel vs sequential (analyze)

### Step 4: Get Project ID + Confirm

**CRITICAL**: Subtasks don't inherit project from parent. Must get explicitly AND confirm.

```typescript
// Option 1: Get from parent ticket
let projectId = parentTicket.projectId;

// Option 2: If parent has no project, get from project lookup
if (!projectId) {
	const projects = await mcp_Linear_list_projects({ team: LINEAR_TEAM_NAME });
	// ASK USER: "Parent ticket has no project. Which project should subtasks belong to?"
	// Get project name → Find/create → Confirm
}

// Option 3: If parent has project, confirm it's correct
if (projectId) {
	const parentProject = await mcp_Linear_get_project({ id: projectId });
	// ASK USER FOR CONFIRMATION:
	// "✅ Parent ticket project: ${parentProject.name} (ID: ${projectId})"
	// "Use this project for subtasks? (yes/no)"
	//
	// If yes → Use parent's project
	// If no → Ask user for different project name → Find/create → Confirm
}
```

### Step 5: Create Subtasks

```typescript
for (const subtaskData of subtasks) {
	const subtask = await mcp_Linear_create_issue({
		team: LINEAR_TEAM_NAME,
		title: `[SYOS-XXX] ${subtaskData.title}`,
		description: `
**Parent**: SYOS-XXX - ${parentTicket.title}

${subtaskData.description}
    `,
		project: projectId, // ✅ CRITICAL - Set explicitly
		assignee: RANDY_USER_ID, // ✅ ALWAYS Randy
		state: 'Todo',
		estimate: subtaskData.estimate,
		labels: [
			parentTypeLabel, // ✅ Inherit type from parent
			...subtaskData.scopeLabels // ✅ Add scope labels
		],
		parentId: parentTicket.id // ✅ Link to parent
	});

	// Verify linking (CRITICAL)
	const createdSubtask = await mcp_Linear_get_issue({ id: subtask.id });

	// Verify parent link
	if (!createdSubtask.parentId || createdSubtask.parentId !== parentTicket.id) {
		throw new Error('Parent link failed - subtask not linked to parent');
	}

	// Verify project link (CRITICAL - subtasks don't inherit project)
	if (!createdSubtask.projectId || createdSubtask.projectId !== projectId) {
		await mcp_Linear_update_issue({
			id: subtask.id,
			project: projectId // Explicitly link to project
		});
	}
}
```

### Step 6: Analyze Dependencies

**For each subtask, document:**

- **Parallel Work**: ✅ Can work in parallel with other subtasks
- **Sequential Work**: ❌ Must wait for previous subtask

**Documentation Format:**

```markdown
## Dependencies

**Requires**: SYOS-XXX (Previous Subtask) - [Why needed]

**Blocks**: SYOS-XXX (Next Subtask) - [What waits for this]

**Parallel**: ✅ **CAN work in parallel with SYOS-XXX** - [Why parallel]
```

---

## 🏷️ Label Selection Guide

### Type Labels (REQUIRED - Pick ONE)

**Decision Tree:**

```bash
Is it new user-facing functionality?
  YES → `feature`
  NO → Is something broken?
    YES → `bug`
    NO → Is it security/performance risk?
      YES → `risk`
      NO → `tech-debt` (refactoring, testing, code quality)
```

**For Subtasks**: Usually inherit from parent (same type)

**See**: `.cursor/commands/start.md` - Linear constants and label selection guide

### Scope Labels (REQUIRED - Pick ONE or MORE)

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

## 📝 Ticket Writing Format

**See**: `dev-docs/2-areas/development/ticket-writing-format.md` for complete template

**Required Structure:**

```markdown
## Context

[1-2 sentences: Why this work matters]

## Problem

[Root causes - what's broken or missing]

## Goals

**Outcome**: [What success looks like]
**User Impact**: [How users benefit]

## Technical Scope

**What to build:**

- [Specific module 1] - [What it does]

## Subtasks (Priority Order)

**🔴 URGENT (Ship First)**

- SYOS-XXX: [Title]

## Success Criteria

- [Testable criterion 1] ✅
```

---

## ✅ Validation Checklist

### After Creating New Ticket

- [ ] **Approach option confirmed** (if task document contains multiple options) - User explicitly selected or confirmed recommendation
- [ ] Project ID set correctly (or "no project" confirmed)
- [ ] Assignee set to Randy (`RANDY_USER_ID`)
- [ ] Estimate set (numeric: 0-5)
- [ ] Type label set (one required)
- [ ] Scope labels set (one or more required)
- [ ] Project linking verified (check `projectId` field)
- [ ] Ticket appears in project view (if project set)
- [ ] **Task template filename updated** (MANDATORY if working from task template)
- [ ] **Subtasks auto-created** (if ticket description contains subtask structure)

### After Creating Subtasks

- [ ] All subtasks have parent reference in title (`[SYOS-XXX]`)
- [ ] All subtasks have `parentId` set correctly
- [ ] **All subtasks have `projectId` set correctly** (CRITICAL - verify each one)
- [ ] All subtasks appear in project view (verify in Linear UI)
- [ ] Type labels match parent (or justified exception)
- [ ] Scope labels appropriate for each subtask
- [ ] Dependencies documented (parallel vs sequential)
- [ ] Estimates set appropriately

---

## 🚨 Critical Rules

### Project Linking (CRITICAL)

**New Tickets:**

- Always verify `projectId` is set after creation
- Update with `mcp_Linear_update_issue()` if missing

**Subtasks:**

- **DO NOT inherit project from parent** - Must set explicitly
- Always verify `projectId` is set after creation
- Update with `mcp_Linear_update_issue()` if missing

### Parent Linking (Subtasks Only)

- Always set `parentId` in `create_issue()` call
- Verify `parentId` is set after creation
- Include parent reference in title: `[SYOS-XXX] Subtask Title`
- Include parent reference in description: `**Parent**: SYOS-XXX - [Title]`

### Assignee (Always)

- **ALWAYS** set to Randy (`RANDY_USER_ID`)
- Verify after creation
- Update if missing

### Estimates (Always Numeric)

- Use numeric values: `0-5` (not labels like "m", "s")
- Convert labels: `xs=1, s=2, m=3, l=4, xl=5`
- Default to `2` (s) if cannot determine

---

## 📚 References

- **Linear Constants**: `.cursor/commands/start.md` - Single source of truth (constants, label selection guide)
- **Ticket Format**: `dev-docs/2-areas/development/ticket-writing-format.md` - Template

---

## 🎯 Example Workflows

### Example 1: Create New Ticket (With Project Confirmation)

```bash
User: "/create-tasks - I want to add image uploads to chat"

AI: "Which project should this ticket belong to?"
User: "Chat Features"

AI: [Searches for "Chat Features" project]
AI: "Found project: 'Chat Features' (ID: abc-123)
Is this correct? (yes/no)"

User: "yes"

AI: [Creates ticket → Verifies project linking → Checks for subtasks]
AI: "✅ Created SYOS-430 - Add image uploads to chat"
```

### Example 2: Create New Ticket (With Approach Option Confirmation)

```bash
User: "/create-tasks - Working from ai-docs/tasks/meetings-separation-of-concerns-refactoring.md"

AI: [Detects 3 approach options in document]
AI: "📋 Found 3 approach options in task document:

**Approach A**: Incremental Refactoring (One Component at a Time)
**Approach B**: Batch Refactoring (All Components at Once)
**Approach C**: Pattern Extraction + Incremental Application

💡 **Recommendation**: A - Incremental Refactoring

Low risk: Each PR is small (~200-500 line changes), easy to review, easy to rollback. Fast feedback: Can validate approach with ActionItemsList first, adjust if needed.

Proceed with A? (yes/no, or specify A/B/C)"

User: "yes"

AI: [Uses Approach A → Continues to project selection]
AI: "Which project should this ticket belong to?"
User: "Meetings Module"

AI: [Creates ticket with Approach A details → Verifies project linking]
AI: "✅ Created SYOS-450 - Refactor Meetings Module Components: Separation of Concerns (Approach A)"
```

### Example 3: Create New Ticket (User Specifies Different Option)

```bash
User: "/create-tasks - Working from ai-docs/tasks/meetings-separation-of-concerns-refactoring.md - use option B"

AI: [Detects 3 approach options, user specified "option B"]
AI: "✅ Using B: Batch Refactoring (All Components at Once)"

AI: [Uses Approach B → Continues to project selection]
AI: "Which project should this ticket belong to?"
User: "Meetings Module"

AI: [Creates ticket with Approach B details → Verifies project linking]
AI: "✅ Created SYOS-451 - Refactor Meetings Module Components: Separation of Concerns (Approach B)"
```

### Example 4: Create New Ticket (Wrong Project Detected)

```bash
User: "/create-tasks - I want to add image uploads to chat"

AI: "Which project should this ticket belong to?"
User: "Chat"

AI: [Searches for "Chat" project]
AI: "Found similar projects:
- Chat Features (ID: abc-123)
- Chat Integration (ID: def-456)
Did you mean one of these? Or create new project 'Chat'?"

User: "Chat Features"

AI: "✅ Selected project: Chat Features (ID: abc-123)
Is this correct? (yes/no)"

User: "yes"

AI: [Creates ticket → Verifies project linking]
AI: "✅ Created SYOS-430 - Add image uploads to chat"
```

### Example 5: Create Subtasks (From Parent Description)

```bash
User: "/create-tasks - Create ticket SYOS-438"

AI: [Creates ticket SYOS-438 with description containing "Subtasks (Priority Order)" section]

AI: [Detects subtasks in description]
AI: "Found 3 subtasks in ticket description:
- Phase 1: Backend storage (URGENT)
- Phase 2: Frontend upload UI (HIGH)
- Phase 3: Image preview component (MEDIUM)
Create them now? (yes/no)"

User: "yes"

AI: [Gets parent ticket → Confirms project → Creates subtasks]
AI: "✅ Created 3 subtasks:
- SYOS-439: [SYOS-438] Phase 1: Backend storage
- SYOS-440: [SYOS-438] Phase 2: Frontend upload UI
- SYOS-441: [SYOS-438] Phase 3: Image preview component"
```

### Example 6: Create Subtasks (Manual Request)

```
User: "/create-tasks - Break down SYOS-430 into subtasks"

AI: [Gets parent ticket SYOS-430 → Analyzes → Gets project]
AI: "✅ Parent ticket project: Chat Features (ID: abc-123)
Use this project for subtasks? (yes/no)"

User: "yes"

AI: [Creates subtasks → Verifies linking]
AI: "✅ Created 3 subtasks:
- SYOS-431: [SYOS-430] Backend storage
- SYOS-432: [SYOS-430] Frontend upload UI
- SYOS-433: [SYOS-430] Image preview component"
```

### Example 7: Task Template Filename Update

```
User: "/create-tasks - Working from ai-docs/tasks/SYOS-XXX-integrate-svelte-mcp-validation.md"

AI: [Creates ticket SYOS-442 → Updates task template filename]
AI: "✅ Created SYOS-442 - Integrate Svelte MCP Validation
✅ Updated task template: ai-docs/tasks/SYOS-442-integrate-svelte-mcp-validation.md"
```

---

**Last Updated**: 2025-11-22  
**Purpose**: Unified command for creating Linear tickets or subtasks  
**Key Features**:

- Intelligently decides new ticket vs subtasks, then executes creation
- **Approach option confirmation** (if task document has multiple options) - Recommends and confirms before proceeding
- **Project confirmation** before proceeding (prevents wrong project selection)
- **Auto-detects subtasks** from ticket description (creates subtasks automatically)
- **Task template filename update** (mandatory when working from task template)
