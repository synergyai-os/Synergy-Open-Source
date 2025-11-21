# AI Development Workflow

> **Date**: November 20th, 2025  
> **Purpose**: Document current AI development workflow using Cursor commands  
> **Status**: Active workflow

---

## 🎯 Overview

This document describes the current AI development workflow used for SynergyOS development. The workflow is designed to maximize efficiency, ensure quality, and maintain proper tracking through Linear tickets.

**Key Principle**: AI agents work on isolated tasks with clear boundaries, proper validation, and knowledge capture.

---

## 📋 Main Development Workflow

### Standard Flow

```
/start + Linear Ticket → Understand Task → User Confirms → [/task-template] → /go → Execute → /test-manual → /validate → /save
```

**Note**: `/task-template` is optional - use for complex features requiring architectural decisions.

### Step-by-Step Process

#### 1. **Start Work** (`/start` + Linear Ticket)

**Purpose**: Onboard AI agent and understand the task

**What happens**:
- AI checks for Linear ticket ID (SYOS-XXX format)
- If no ticket → Creates new ticket (with project, assignee, labels, estimate)
- If ticket exists → Updates status to "In Progress"
- AI checks for relevant reference code projects (`ai-docs/reference/`)
- AI loads reference project if relevant to ticket
- AI reads ticket description to understand scope
- AI investigates codebase, checks patterns, validates architecture

**Reference Code Integration**:

The reference code system enables AI to use working code examples when implementing features, reducing "AI code slop" and improving implementation quality.

**How it works**:

1. **Matching**: AI matches ticket keywords to reference project READMEs in `ai-docs/reference/`
2. **Loading**: If match found → AI loads reference project README and key implementation files
3. **Documentation**: AI documents reference project in investigation findings: "Found reference project: [name] - [what it demonstrates]"
4. **Availability**: Reference code available for `/go` implementation phase

**Reference Code Adaptation**:

- AI adapts reference patterns to our codebase (doesn't copy verbatim)
- Uses our design tokens, composables, Convex patterns
- Documents what was adapted: "Adapted from reference project: [name] - [what was adapted]"

**Example**:

```
Ticket: "Add image uploads to chat"
AI: Finds "vercel-ai-sdk-chat" reference project → Loads README → 
    Documents: "Found reference project: vercel-ai-sdk-chat - demonstrates image uploads with Vercel AI SDK"
    → Reference code available during /go implementation
```

**User action**: Provide ticket ID or say "create new ticket"

**Result**: AI understands the task correctly, reference code loaded if available

**See**: `ai-docs/reference/README.md` - Reference code system documentation

---

#### 2. **User Confirmation**

**Purpose**: Ensure AI understands scope before implementation

**What happens**:
- AI presents investigation findings
- AI scopes work (what's in/out)
- AI creates implementation plan
- AI validates architecture (modularity principles)
- User reviews and confirms (or asks clarifying questions)

**User action**: Confirm or ask clarifying questions

**Result**: Clear understanding of what will be built

---

#### 2a. **Task Template** (`/task-template`) - Optional

**Purpose**: Generate detailed pre-coding technical analysis documents. Forces AI to think through multiple approaches before coding.

**When to use**: Complex features requiring architectural decisions, multiple implementation approaches possible, need to document thinking process.

**When to skip**: Simple bug fixes, straightforward features, clear single approach.

**What happens**:

- AI generates task document with 8 sections:
  1. Title & Goal
  2. Problem Analysis
  3. Approach Options (2-3 different ways) ⭐ **MANDATORY**
  4. Recommendation (which approach is best and why)
  5. Current State (dependencies, existing code)
  6. Technical Requirements
  7. Success Criteria
  8. Implementation Checklist
- AI saves document to `ai-docs/tasks/[ticket-id]-[slug].md`
- AI presents document to user for review

**Key Principle**: **Think First** - Don't jump to implementation. Analyze approaches, document decisions.

**Benefits**:

- ✅ Better code quality (AI thinks through approaches)
- ✅ Fewer rewrites (best approach chosen upfront)
- ✅ Better documentation (task documents capture thinking)
- ✅ Forces consideration of trade-offs

**Workflow Integration**:

- **Standard**: `/start` → Investigation → User Confirms → `/go` → Execute
- **With Template**: `/start` → Investigation → User Confirms → `/task-template` → Review → `/go` → Execute

**User action**: Review task document, confirm approach or ask questions

**Result**: Detailed technical analysis document ready, approach chosen

**See**: `.cursor/commands/task-template.md` - Complete task template command documentation

---

#### 3. **Execute** (`/go`)

**Purpose**: AI implements the solution using pattern-first approach

**What happens**:
- AI checks patterns first (`dev-docs/2-areas/patterns/INDEX.md`) ⭐ **MANDATORY**
- AI checks reference code (if loaded during `/start`) - Adapts working examples to our codebase
- AI uses Context7 for library documentation (if <95% confident)
- AI implements solution following coding standards
- AI follows 95% confidence rule (if <95%, uses Context7 then implements)

**Key Principle**: **Pattern-first** - Always check patterns before implementing

**Reference Code Integration**:
- If reference project was loaded during `/start`, AI uses it during implementation
- AI adapts reference patterns (doesn't copy verbatim)
- AI documents what was adapted from reference

**User action**: Wait for implementation

**Result**: Code changes implemented using patterns and reference code

---

#### 4. **Manual Testing** (`/test-manual`)

**Purpose**: Generate concise manual test instructions

**When to use**: When manual testing is needed

**What happens**:
- AI analyzes current ticket to understand what was implemented
- AI generates numbered test steps with localhost links
- AI focuses on critical paths only (max 10 steps)
- Format: Title → URL → Steps → Expected results

**User action**: Follow test instructions, report results

**Result**: Test instructions ready for manual validation

---

#### 5. **Validate** (`/validate`)

**Purpose**: Verify implementation meets ticket scope/criteria

**What happens**:
- AI validates functional requirements (works as specified)
- AI checks for regressions
- AI validates modularity (feature flags, loose coupling, module boundaries)
- If validation passes → Updates Linear ticket with summary
- If validation fails → Documents issues, doesn't mark as done

**Critical Rules**:
- ❌ **NEVER update ticket after finding problems and making edits** → Requires new validation round
- ❌ **NEVER create MD documents** → Keep feedback in ticket or chat comment

**User action**: Review validation results

**Result**: Ticket updated with validation status

---

#### 6. **Save Knowledge** (`/save`)

**Purpose**: Capture patterns and knowledge locally (no commit)

**When to use**: After validation passes, before commit

**What happens**:
- AI validates Linear ticket (project ID, assignee, estimate)
- AI analyzes session → Frames as user story + flow metrics
- AI searches existing patterns (`dev-docs/2-areas/patterns/INDEX.md`)
- AI updates domain files (svelte-reactivity.md, convex-integration.md, etc.)
- AI updates INDEX.md symptom table
- AI considers rule building (if mistake occurred) - See Iterative Rule Building below
- Files saved locally (no git commit)

**User action**: Review pattern updates, commit when ready

**Result**: Knowledge captured in patterns, ready for commit

---

#### 6a. **Iterative Rule Building** (During `/save`)

**Purpose**: Systematic process for building Cursor rules from AI mistakes. Prevents repeating mistakes and improves code quality over time.

**When it happens**: During `/save` phase, when AI made a mistake during implementation.

**Process**:

1. **Identify Mistake**: Capture what happened, why it happened, impact
2. **Decide: Rule or Pattern?**: Use decision tree (see below)
3. **Create/Update Rule**: If rule → Create `.cursor/rules/[topic].mdc` with format
4. **Document**: Record rule creation/update in `/save` workflow

**Rules vs Patterns Decision Tree**:

```
AI makes mistake
├─ Is it critical? (breaks functionality, security, CI)
│  ├─ Yes → Create rule (proactive prevention)
│  └─ No → Continue below
├─ Has it happened 2+ times?
│  ├─ Yes → Create rule (prevent repetition)
│  └─ No → Continue below
├─ Can it be prevented proactively? (constraint/validation)
│  ├─ Yes → Create rule
│  └─ No → Create pattern (reactive solution)
└─ Is solution complex? (needs examples, context)
   ├─ Yes → Create pattern
   └─ No → Create rule
```

**Rule Format**:

- Frontmatter: `alwaysApply: true` OR `globs` for scoping
- Purpose: One-line description
- Context: Why rule exists (mistake that triggered it)
- Problem: What/why/impact
- Bad Example: Shows the mistake
- Good Example: Shows correct approach
- Rules: NEVER/ALWAYS statements
- Validation: How to check before implementing

**When to use Rules**:

- ✅ Mistake happens **repeatedly** (2+ times)
- ✅ Mistake is **critical** (breaks functionality, security, CI)
- ✅ Mistake can be **prevented proactively** (constraint/validation)
- ✅ Rule can be **< 100 lines** (keep rules short)

**When to use Patterns**:

- ✅ One-time mistake (not repeated)
- ✅ Complex solution (needs examples, context)
- ✅ Domain-specific (Svelte reactivity, Convex integration)
- ✅ Solution is **reactive** (fix when problem occurs)

**Example**:

```
Mistake: Used `any` type, CI lint failed
Decision: Rule (critical, CI blocker, repeated mistake)
Action: Created `.cursor/rules/svelte-typescript-patterns.mdc` with "Never use `any` type" rule
Result: Rule prevents future mistakes proactively
```

**Benefits**:

- ✅ Fewer mistakes over time (rules prevent proactively)
- ✅ Better code quality (rules enforce best practices)
- ✅ Faster development (fewer corrections needed)

**See**: `.cursor/rules/BUILDING-RULES.md` - Complete rule building process documentation

---

## 🔀 Git Workflow

### Branch Creation (`/branch`)

**When**: When starting development work

**What happens**:
- AI checks for Linear ticket ID (required)
- AI checks current git state (uncommitted changes?)
- AI creates branch: `feature/SYOS-XXX-description` or `fix/SYOS-XXX-description`
- AI verifies branch naming convention

**Result**: Feature branch created with proper naming

---

### Pull Request (`/pr`)

**When**: When development work is complete

**What happens**:
- AI verifies branch status (on feature branch, not main)
- AI ensures changes are committed
- AI pushes branch to GitHub
- AI creates PR with template (`.github/pull_request_template.md`)
- AI updates PR description (what changed, why, checklist)
- AI verifies CI runs (quality gates)

**Result**: PR created, CI running

---

### Post-Merge Cleanup (`/pr-close`)

**When**: After PR is merged to main

**What happens**:
- AI verifies PR is merged (not just closed)
- AI checks for uncommitted changes
- AI switches to main branch
- AI pulls latest main
- AI verifies remote branch deletion (GitHub Actions auto-deletes)
- AI checks for extra commits (safety check)
- AI deletes local branch safely

**Result**: Local repository clean, ready for next work

---

## 📊 Scoping & Planning

### When Work is Too Big

**Problem**: Ticket scope is too large for single implementation

**Solution**: Break down into subtasks

---

### Create Subtasks (`/linear-subtickets`)

**When**: User forces subtask creation or work is too big

**What happens**:
- AI analyzes parent ticket
- AI determines subtask labels (inherit type from parent, determine scope)
- AI creates subtasks with proper linking:
  - `parentId` set correctly
  - `projectId` set correctly (CRITICAL - doesn't inherit from parent)
  - Title format: `[SYOS-XXX] Subtask Title`
  - Description includes parent reference
- AI analyzes dependencies (parallel vs sequential)
- AI verifies linking (parent + project)

**Result**: Subtasks created with proper linking and dependencies

---

### Create Ticket (`/linear`)

**When**: Need to create new ticket manually

**What happens**:
- AI gets/creates project (required)
- AI creates ticket with required fields:
  - Team: SYOS
  - Project ID (required)
  - Assignee: Randy (always)
  - Estimate: numeric (0-5)
  - Labels: Type (one) + Scope (one or more)
- AI verifies project linking (CRITICAL - tickets may not link during creation)
- AI updates ticket if project link missing

**Result**: Ticket created with proper fields and linking

---

## 🎯 Command Reference

### Core Workflow Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/start` | Onboard AI, understand task, load reference code | Beginning of work session |
| `/task-template` | Generate pre-coding analysis document | Complex features, architectural decisions (optional) |
| `/go` | Execute implementation (pattern-first) | After user confirmation (or after task template) |
| `/test-manual` | Generate test instructions | When manual testing needed |
| `/validate` | Verify implementation | After code changes complete |
| `/save` | Capture patterns locally, build rules | After validation passes |

### Git Workflow Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/branch` | Create feature branch | When starting development |
| `/pr` | Create pull request | When work is complete |
| `/pr-close` | Clean up after merge | After PR merged to main |

### Planning Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/linear` | Create/manage tickets | When creating tickets manually |
| `/linear-subtickets` | Create subtasks | When breaking down large tickets |

### Other Commands

**Legacy Commands** (may be removed):
- Some commands exist but are not actively used
- Review periodically and remove if obsolete

**Useful Commands**:
- `/root-cause` - Debug workflow (systematic investigation)
- `/manager` - Manager/mentor role guide (parallel work coordination)

---

## 🔀 Multitasking Options

**Purpose**: Choose between manual multitasking and automated coordination (`/manager` command).

### Manual Multitasking (Brandon's Approach)

**When to use**: Quick tasks, independent work, exploratory work, simple fixes.

**Workflow**:

1. **Open new chat** (`Cmd+T` or `Cmd+N`)
2. **Start work** with `/start SYOS-XXX` (each chat has its own ticket)
3. **Work independently** - No coordination needed
4. **Complete work** - Each chat handles its own ticket

**Keyboard Shortcuts**:

- `Cmd+T` - New chat tab (macOS)
- `Cmd+N` - New chat window (macOS)
- `Ctrl+T` - New chat tab (Windows/Linux)
- `Ctrl+N` - New chat window (Windows/Linux)

**Example**:

```
Chat 1: /start SYOS-123 → Working on feature A
Chat 2: /start SYOS-124 → Working on feature B (independent)
Chat 3: /start SYOS-125 → Investigating bug C

All three chats work independently, no coordination needed.
```

**Benefits**:

- ✅ Faster for quick tasks (no coordination overhead)
- ✅ More flexibility (choose right approach per task)
- ✅ Less overhead (no manager coordination needed)
- ✅ Better for exploratory work (test approaches independently)

### Automated Coordination (`/manager` Command)

**When to use**: Complex coordination, sequential work, parallel execution, state checking, gap identification.

**Workflow**:

1. **Use `/manager` command** in one chat
2. **Manager coordinates** - Analyzes dependencies, recommends next steps
3. **User executes** - Works on tickets in separate chats
4. **Manager validates** - Checks completion, provides next steps

**Example**:

```
User: "Done with SYOS-123"
Manager: ✅ SYOS-123 acknowledged

Run SYOS-124, SYOS-125, and SYOS-126 in parallel (different files)

Then once all complete, run SYOS-127
```

**Benefits**:

- ✅ Handles complex dependencies
- ✅ Coordinates parallel execution
- ✅ Validates completion
- ✅ Identifies gaps and blockers

### Choosing the Right Approach

**Use Manual Multitasking when**:

- ✅ Task is quick (< 30 min)
- ✅ Work is independent (no dependencies)
- ✅ Exploratory/testing approaches
- ✅ Simple one-file fixes

**Use `/manager` Command when**:

- ✅ Multiple tickets with dependencies
- ✅ Sequential work (one blocks another)
- ✅ Need to coordinate parallel execution
- ✅ Need state checking or gap identification

**See**: `.cursor/commands/README.md` - Manual Multitasking section for complete details

---

## 🔄 Complete Workflow Example

### Scenario: Fix Bug in Inbox Module

**Step 1: Start**
```
User: "/start SYOS-123"
AI: Checks ticket → Updates to "In Progress" → Checks reference code → 
    Finds "vercel-ai-sdk-chat" project → Loads reference → Investigates → 
    Presents findings: "Found reference project: vercel-ai-sdk-chat - demonstrates image uploads"
```

**Step 2: Confirm**
```
User: "Yes, that's correct. Proceed."
AI: Creates implementation plan → Validates architecture → Waits for confirmation
```

**Step 2a: Task Template (Optional)**
```
User: "/task-template SYOS-123"
AI: Generates task document with 3 approach options:
    - Approach A: Direct Convex File Storage (Low complexity)
    - Approach B: Vercel Blob Storage + Convex Reference (Medium complexity)
    - Approach C: Base64 Inline Encoding (Low complexity, not recommended)
    → Recommends Approach B with reasoning
    → Saves to ai-docs/tasks/SYOS-123-image-uploads-chat.md
User: "Approach B looks good. Proceed."
```

**Step 3: Execute**
```
User: "/go"
AI: Checks patterns first (INDEX.md) → Checks reference code (vercel-ai-sdk-chat) → 
    Adapts image upload pattern → Implements fix → Reports completion
```

**Step 4: Test**
```
User: "/test-manual"
AI: Generates test steps:
  1. Navigate to http://127.0.0.1:5173/inbox
  2. Click inbox item → Should open detail view
  3. ...
```

**Step 5: Validate**
```
User: "/validate"
AI: Validates functionality → Checks modularity → Updates ticket with summary
```

**Step 6: Save**
```
User: "/save"
AI: Updates patterns → Considers rule building (no mistakes this session) → 
    Saves locally → Reports "Ready for review"
```

**Alternative: Rule Building Example**
```
User: "/save"
AI: Updates patterns → Identifies mistake: "Used `any` type, CI failed" →
    Decides: Rule (critical, CI blocker) → Creates `.cursor/rules/svelte-typescript-patterns.mdc` →
    Documents: "Created rule to prevent `any` type usage" →
    Saves locally → Reports "Ready for review"
```

**Step 7: Git**
```
User: "/branch" (if not already on branch)
User: git add . && git commit -m "fix: inbox bug [SYOS-123]"
User: "/pr"
AI: Creates PR → Verifies CI
```

**Step 8: After Merge**
```
User: "/pr-close"
AI: Cleans up local repository → Verifies deployment
```

---

## ⚠️ Critical Rules

### Linear Ticket Required

**🚨 HARD BLOCKER**: AI can ONLY work with Linear ticket ID present

**Before ANY work**:
- Check conversation for ticket ID (SYOS-XXX format)
- If missing → STOP and ask for ticket ID
- If user says "create new ticket" → Use `/start` to create ticket

**Why**: All work must be tracked in Linear for visibility and Flow Metrics

---

### Validation Rules

**NEVER update ticket after finding problems and making edits**:
- Finding problem → Making edits → Requires new validation round
- User must validate again after fixes

**NEVER create MD documents**:
- Keep feedback in ticket comments or chat
- Only create docs if explicitly requested

---

### Architecture Validation

**MANDATORY before implementation**:
- Check modularity principles (`system-architecture.md`)
- Validate feature flags (if new module)
- Check loose coupling (no cross-module dependencies)
- Verify module boundaries

**See**: `/start` command - Modularity Validation section

---

## 📚 Related Documentation

- **Commands**: `.cursor/commands/README.md` - Command optimization guide
- **Start Command**: `.cursor/commands/start.md` - Complete onboarding workflow
- **Go Command**: `.cursor/commands/go.md` - Pattern-first implementation workflow
- **Task Template**: `.cursor/commands/task-template.md` - Pre-coding analysis workflow
- **Linear Workflow**: `.cursor/commands/linear.md` - Ticket management reference
- **Git Workflow**: `dev-docs/2-areas/development/git-workflow.md` - Complete git guide
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Reference Code**: `ai-docs/reference/README.md` - Reference code system documentation
- **Rule Building**: `.cursor/rules/BUILDING-RULES.md` - Iterative rule building process

---

## 🎯 Key Principles

1. **Linear Ticket Required** - REFUSE to work without ticket ID
2. **Investigate First** - Understand before acting
3. **Confirm Before Building** - Scope, plan, validate architecture
4. **Think First** - Use task templates for complex features (consider approaches)
5. **Patterns First** - Check existing solutions before implementing
6. **Reference Code** - Use working examples, adapt to our codebase
7. **Validate Thoroughly** - Functional + modularity validation
8. **Capture Knowledge** - Update patterns and build rules after successful work
9. **Clean Git Workflow** - Branch → PR → Merge → Cleanup
10. **Prevent Mistakes** - Build rules iteratively from mistakes

---

**Last Updated**: November 20th, 2025  
**Status**: Active workflow  
**Improvements**: Reference code system, task templates, iterative rule building, multitasking documentation  
**Next Review**: Review quarterly for optimization opportunities

