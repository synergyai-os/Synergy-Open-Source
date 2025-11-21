# Cursor Commands - Optimization Summary

**Purpose**: Summary of command optimizations and **maintenance guide** for AI agents.

**⚠️ CRITICAL**: **AI agents MUST read this file before modifying any `.cursor/commands/*.md` file**

**How this works:**

- This file documents the optimization strategy and results
- AI agents see this via `.cursor/rules/way-of-working.mdc` (always loaded)
- When modifying commands, agents check this file first to prevent regression

---

## 📊 Optimization Results

| Command              | Before    | After      | Change     | Status                                                            |
| -------------------- | --------- | ---------- | ---------- | ----------------------------------------------------------------- |
| `/start`             | 368 lines | ~490 lines | +122 lines | ✅ Reference code check added (SYOS-409)                          |
| `/go`                | New       | ~280 lines | N/A        | ✅ New command - Pattern-first implementation workflow (SYOS-409) |
| `/start-new-project` | 755 lines | 594 lines  | -21% (161) | ✅ Optimized                                                      |
| `/save`              | 898 lines | 272 lines  | -70% (626) | ✅ Optimized                                                      |
| `/root-cause`        | 65 lines  | 239 lines  | +174 lines | ✅ Enhanced with "slow = fast" methodology                        |
| `/pr`                | New       | 366 lines  | N/A        | ✅ New command - PR creation workflow                             |
| `/pr-close`          | New       | 415 lines  | N/A        | ✅ New command - Post-merge cleanup workflow                      |
| `/linear`            | 373 lines | 450 lines  | +77 lines  | ✅ Enhanced with Label Selection Guide                            |
| `/linear-subtickets` | 1 line    | 180 lines  | +179 lines | ✅ Enhanced with complete workflow guide                          |
| `/branch`            | 1 line    | 205 lines  | +204 lines | ✅ New command - Branch creation workflow                         |
| `/manager`           | New       | 450 lines  | N/A        | ✅ New command - Manager/mentor role guide                        |
| `/design-manager`    | New       | ~670 lines | N/A        | ✅ New command - Design system manager (inherits /manager)        |
| `/test-manual`       | 1 line    | 45 lines   | +44 lines  | ✅ Enhanced - Concise manual test instructions                    |
| `/task-template`     | New       | 382 lines  | N/A        | ✅ New command - Pre-coding analysis workflow                     |

**Net Change**: +570 lines total

- Removed: 384 lines (626 from `/save` - 174 to `/root-cause` - 122 to `/start`)
- Added: 954 lines (77 to `/linear` + 179 to `/linear-subtickets` + 204 to `/branch` + 450 to `/manager` + 44 to `/test-manual`)

---

## 🎯 Optimization Strategy

### Key Principle: Remove Duplication, Add References

**Before:**

- Commands duplicated Linear constants and workflows
- Same information in multiple places
- Harder to maintain (update in multiple files)

**After:**

- Single source of truth: `/start` command (Linear constants & workflow)
- Commands reference `/start` instead of duplicating
- Easier to maintain (update once in `/start`)
- Ticket writing format extracted to `ticket-writing-format.md` (referenced, not duplicated)

---

## 📋 Changes Made

### `/start` Command

**Current State:**

- **Single source of truth** for Linear constants and workflow
- All Linear constants inline (LINEAR_TEAM_ID, RANDY_USER_ID, ESTIMATES, LINEAR_LABELS)
- Complete ticket creation workflow
- Subticket creation workflow
- Ticket writing format extracted to `ticket-writing-format.md` (referenced)

**Result:** Self-contained Linear workflow (368 lines) - constants always available for speed

---

### `/start-new-project` Command

**Removed:**

- Hardcoded Linear constants block (~48 lines)
- Detailed ticket management rules (~113 lines)
  - AI responsibilities
  - User responsibilities
  - Update workflow examples
  - Labeling rules

**Added:**

- Quick reference (team ID, user ID, estimate mapping)
- References to `/linear` command for complete details
- Prerequisites updated to include `/linear` command

**Result:** 21% reduction, focused on project workflow

---

### `/save` Command

**Removed:**

- Commit message format template (~400 lines) → Extracted to `dev-docs/2-areas/development/commit-message-format.md`
- All commit message examples (~200 lines) → Moved to `commit-message-format.md`
- Teaching notes and anti-patterns (~26 lines) → Moved to `commit-message-format.md`
- Ticket creation workflow → Moved to `/start` command
- **Commit step** → Removed entirely (saves locally only, no git operations)

**Added:**

- Local save workflow (no commit) - saves time/tokens
- Simplified workflow focused on pattern updates only

**Result:** 70% reduction (898 → 272 lines), local save only (no commit)

---

### `/root-cause` Command

**Enhanced** with systematic investigation methodology (65 → 239 lines)

**Added:**

- **Decision tree**: Known pattern (fast path) vs unknown issue (systematic investigation)
- **Path B: Systematic Investigation** - 5-step methodology for unknown issues:
  1. Understand what SHOULD happen (trace expected flow)
  2. Break into 2-5 investigation steps
  3. Identify potential root causes (read code, check formats)
  4. Validate root cause (95%+ confidence required)
  5. Implement and verify
- **Red flags**: When NOT to rush (vague errors, multiple causes, "obvious" fixes that failed)
- **Real example**: Session persistence bug investigation (good vs bad approaches)
- **Time savings**: Documents how methodical approach (20 min) beats random fixes (2+ hours)

**Why enhancement justified:**

- Commands only loaded when invoked (not in every chat)
- Prevents wasted time on wrong fixes (saved 2+ hours in actual debugging session)
- Codifies "slow = fast" principle from successful debugging patterns
- Complements existing pattern index workflow with guidance for new issues

**Result:** Comprehensive debugging workflow for both known and unknown issues

---

## ✅ Benefits

1. **Single Source of Truth**: Linear constants/workflows in `/start` command only
2. **Speed**: Constants always available in `/start` (loaded first) - no need to load separate command
3. **Easier Maintenance**: Update Linear info once in `/start`, not in multiple files
4. **Clearer Structure**: Commands focus on their specific workflows
5. **Better Discoverability**: References guide users to complete information
6. **Reduced Context**: Less duplication = less to read

---

## 📚 Command Organization

### Universal Commands (Always Available)

- **`/start`** - Onboarding + ticket creation + reference code loading (~490 lines)
- **`/go`** - Pattern-first implementation workflow (~280 lines)
- **`/root-cause`** - Debug workflow (239 lines)
- **`/manager`** - Manager/mentor role guide (450 lines)
- **`/design-manager`** - Design system manager (inherits /manager, ~670 lines)
- **`/test-manual`** - Generate concise manual test instructions (45 lines)

### Project Workflow Commands

- **`/start-new-project`** - New project setup (594 lines)
- **`/task-template`** - Generate pre-coding analysis documents (382 lines)
- **`/save`** - Local knowledge capture, no commit (272 lines)
- **`/branch`** - Branch creation workflow (205 lines)
- **`/pr`** - PR creation workflow (366 lines)
- **`/pr-close`** - Post-merge cleanup workflow (415 lines)

### Documentation (Referenced by Commands)

- **`commit-message-format.md`** - Commit message format with examples (406 lines)
- **`ticket-writing-format.md`** - Linear ticket writing format template

### Linear Workflow Commands

- **`/linear`** - Complete Linear workflow reference (450 lines)
- **`/linear-subtickets`** - Subtask creation workflow (180 lines)

---

## 🔍 Best Practices Applied

1. **Commands can be long** - Only loaded when invoked (not in every chat)
2. **Remove duplication** - Reference other commands/docs instead
3. **Keep focused** - Each command does one thing well
4. **Add references** - Guide users to complete information
5. **Maintain single source** - Update info once, reference everywhere

---

## 🛠️ Maintenance Guide for AI Agents

**Before modifying any `.cursor/commands/*.md` file:**

### Step 1: Check Current State

1. Read `.cursor/commands/README.md` (this file) - Understand optimization strategy
2. Check `.cursor/rules/README.md` - Understand rules vs commands distinction
3. Review target command - Understand current structure

### Step 2: Evaluate Need for Optimization

**Red flags (command needs optimization):**

- Command exceeds ~300 lines
- Duplicates content from other commands/docs
- Contains examples/templates that could be extracted
- Same constants/workflows appear in multiple commands

**If red flags present → Proceed to Step 3**

**If no red flags → Make minimal changes, update this README if structure changes**

### Step 3: Optimize (If Needed)

**Extraction Strategy:**

1. **Identify extractable content:**
   - Examples/templates → Extract to `dev-docs/2-areas/development/[topic].md`
   - Constants/workflows → Extract to single source command (e.g., `/linear`)
   - Detailed workflows → Extract to separate doc, reference from command

2. **Create extraction:**
   - Create new doc file in appropriate location
   - Move content with proper formatting
   - Add clear purpose and "See" references

3. **Update command:**
   - Remove extracted content
   - Add reference: "See `path/to/doc.md` for complete format/examples"
   - Keep workflow steps concise
   - Update line count in this README

4. **Update this README:**
   - Add entry to "Optimization Results" table
   - Document what was extracted and where
   - Update "Command Organization" section if needed

### Step 4: Verify

- [ ] Command is focused and concise (< 300 lines ideal)
- [ ] No duplication with other commands/docs
- [ ] References point to correct locations
- [ ] This README updated with changes
- [ ] `.cursor/rules/way-of-working.mdc` updated if needed

---

## 📋 Optimization Checklist

**When optimizing a command:**

- [ ] Read `.cursor/commands/README.md` first
- [ ] Read `.cursor/rules/README.md` for rules vs commands guidance
- [ ] Identify extractable content (examples, constants, workflows)
- [ ] Create extraction file in appropriate location
- [ ] Update command with references
- [ ] Update this README with optimization details
- [ ] Verify no duplication remains
- [ ] Test that references work correctly

---

## 📖 Related Documentation

- **Rules**: `.cursor/rules/README.md` - Rules optimization guide
- **Linear Constants**: `.cursor/commands/start.md` - Single source of truth (all constants & workflow)
- **Ticket Format**: `dev-docs/2-areas/development/ticket-writing-format.md` - Ticket writing template
- **Rules**: `.cursor/rules/working-with-linear.mdc` - Critical Linear rules

---

---

## 🔧 Recent Enhancements

### `/linear` Command (2025-11-18)

**Added**: Label Selection Guide section

- Decision tree for choosing Type labels (`feature` vs `tech-debt` vs `bug` vs `risk`)
- Common mistakes and validation questions
- Prevents incorrect labeling (e.g., refactoring as `feature`)

**Why**: Prevents analytics errors from incorrect label selection

---

### `/linear-subtickets` Command (2025-11-18)

**Enhanced**: Complete workflow guide (was 1 line, now 180 lines)

- Label selection guidance (inherit type from parent)
- Parent linking requirements (title, description, `parentId`)
- **Project linking requirement** (subtasks don't inherit project from parent)
- Parallel vs sequential analysis methodology
- Verification checklist (project linking, parent linking)
- Example workflow

**Why**: Prevents mistakes like incorrect labels, missing parent links, missing project links, unclear dependencies

**Critical Lesson Learned (2025-01-XX)**: Subtasks **DO NOT** automatically inherit project from parent. Must explicitly link subtasks to project using `mcp_Linear_update_issue()` with `projectId` after creation.

---

### `/branch` Command (2025-01-XX)

**Created**: Complete branch creation workflow (was 1 line, now 205 lines)

- Linear ticket ID requirement (critical rule)
- Branch naming convention: `feature/SYOS-XXX-description`
- Workflow: checkout main → pull → create branch
- Common mistakes and fixes
- References to git-workflow.md for complete details

**Why**: Ensures consistent branch creation with Linear integration, prevents missing ticket IDs, enforces naming conventions

---

### `/linear` Command (2025-01-XX)

**Enhanced**: Project linking workflow and verification

- **Explicit project linking**: Always verify tickets are linked to project after creation
- **Verification step**: Check ticket has `projectId` field set correctly
- **Update workflow**: Use `mcp_Linear_update_issue()` with `projectId` if ticket not linked during creation

**Why**: Prevents tickets from being created without project link (discovered during Teams → Circles migration project)

**Critical Lesson Learned (2025-01-XX)**: Even when `projectId` is provided in `create_issue()`, tickets may not be linked. Always verify and update if needed.

---

### `/validate` Command (2025-11-19)

**Enhanced**: Added modularity validation checklist (mandatory check)

- **Modularity Validation**: Quick checks for feature flags, loose coupling, module boundaries
- **Reference**: Links to `system-architecture.md` modularity section (no duplication)
- **Violation Handling**: Document in ticket, mark as needs work (don't mark as done)
- **Summary Comment**: Non-technical summary (2-3 sentences) explaining value

**Why**: Ensures modularity principles are followed before marking tickets complete, preventing architectural debt

**Previous Enhancement** (2025-01-XX): Added requirement for brief summary comment (2-3 sentences max)

---

---

### `/manager` Command (2025-02-13)

**Created**: Manager/mentor role guide (new, 450 lines)

- **Role Separation**: Manager guides, user executes - clear boundaries
- **Manager Responsibilities**: Check state, analyze dependencies, update tickets, provide recommendations
- **Workflow Patterns**: How to handle "done", "what's next", "check X", ticket updates
- **Analysis Patterns**: Parallel vs sequential, gap identification, state checking
- **Communication Style**: Concise, dense, actionable
- **Project-Agnostic**: Works with any ticket system (references `/start` for ticket system details)
- **Example Scenarios**: Generic examples applicable to any project

**Why**: Captures successful collaboration pattern where AI acts as manager/mentor (not executor), enabling efficient parallel work and clear progress tracking

**Key Principle**: Manager guides, user executes - clear role separation prevents confusion and enables efficient collaboration

**Optimization** (2025-02-13):

- Made project-agnostic (removed project-specific ticket IDs)
- References `/start` for ticket system details (no duplication)
- Generic examples that work for any project
- Follows best practices: references over duplication, focused scope

---

---

### `/test-manual` Command (2025-02-13)

**Enhanced**: Concise manual test instruction generator (was 1 line, now 45 lines)

- **Format**: Concrete steps with localhost links (`http://127.0.0.1:5173/path`)
- **Structure**: Title → URL → Numbered steps → Expected results
- **Guidelines**: Maximum 10 steps, critical paths only, no fluff
- **Example**: Card clickable variant test (6 steps, direct links)

**Why**: Provides actionable test instructions without verbose explanations, saves time during manual validation

---

### `/go` Command (2025-11-20)

**Created**: Pattern-first implementation workflow (new, ~280 lines)

- **Pattern-First Principle**: Always check patterns (`dev-docs/2-areas/patterns/INDEX.md`) before implementing ⭐
- **Reference Code Integration**: Uses reference projects loaded during `/start` session
- **Context7 Integration**: Uses Context7 when <95% confident about approach
- **Workflow**: Check patterns → Check reference code → Use Context7 (if needed) → Implement
- **Adaptation Guidance**: Adapt reference code to our codebase (don't copy verbatim)
- **Documentation**: Documents what patterns/references were used

**Why**: Ensures AI uses existing patterns and working examples instead of reinventing solutions, improves code quality and consistency

**Integration**: Works with `/start` command - Reference code loaded in `/start` is available during `/go` implementation

---

### `/start` Command (2025-11-20)

**Enhanced**: Reference code check added (368 → ~490 lines, +122 lines)

- **Reference Code Check**: Checks `ai-docs/reference/` for relevant projects after ticket status update
- **Matching Logic**: Matches ticket keywords to project READMEs
- **Documentation**: Documents reference projects found in investigation findings
- **Integration**: Reference code available for `/go` command during implementation

**Why**: Enables AI to reference working code examples, reducing "AI code slop" and improving implementation quality

**See**: SYOS-409 - Integrate Reference Code System into `/start` and `/go` commands

---

### `/task-template` Command (2025-11-20)

**Created**: Pre-coding analysis document generator (new, 382 lines)

- **Purpose**: Generate detailed technical analysis before implementation
- **Structure**: 8-section template (Title, Problem, Approaches, Recommendation, Current State, Requirements, Success Criteria, Checklist)
- **Key Feature**: Forces AI to consider 2-3 approaches before recommending one
- **Integration**: Works with `/start` → `/task-template` → `/go` workflow
- **File Output**: Saves to `ai-docs/tasks/[ticket-id]-[slug].md`

**Why**: Prevents rushing to first solution, documents decision process, improves code quality by forcing pre-coding analysis

---

## 🔀 Manual Multitasking

**Purpose**: Document manual multitasking workflow (Brandon's approach) to complement `/manager` command.

**When to Use Manual Multitasking**:

- ✅ **Quick tasks** (< 30 min) - Faster to open new chat than coordinate via `/manager`
- ✅ **Independent work** - No dependencies, can work in parallel without coordination
- ✅ **Exploratory work** - Testing approaches, investigating options
- ✅ **Simple fixes** - One-file changes, straightforward implementations

**When to Use `/manager` Command**:

- ✅ **Complex coordination** - Multiple tickets with dependencies
- ✅ **Sequential work** - One ticket blocks another
- ✅ **Parallel execution** - Need to coordinate multiple agents
- ✅ **State checking** - Need to verify what's done, what's next
- ✅ **Gap identification** - Need to find missing tickets or uncovered work

**Manual Multitasking Workflow**:

1. **Open new chat** (`Cmd+T` or `Cmd+N`)
2. **Start work** with `/start SYOS-XXX` (each chat has its own ticket)
3. **Work independently** - No coordination needed
4. **Complete work** - Each chat handles its own ticket

**Keyboard Shortcuts**:

- `Cmd+T` - New chat tab (macOS)
- `Cmd+N` - New chat window (macOS)
- `Ctrl+T` - New chat tab (Windows/Linux)
- `Ctrl+N` - New chat window (Windows/Linux)

**Example Workflow**:

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

**See**: `/manager` command for automated coordination workflow

---

## 🎨 Design Manager Command

**Purpose**: Specialized manager for design system work - Product Design expertise with deep Design Systems knowledge.

**Created**: 2025-11-21 (New, ~670 lines)

**Inherits from**: `/manager` - Core workflow patterns (role boundaries, coordination, state checking)

**Adds**: Design-specific expertise:

- **Design System Context** - Auto-loads SynergyOS design docs (design-tokens.md, component-architecture.md, design-principles.md)
- **4-Layer Architecture** - Tokens → Utilities → Atoms → Molecules/Organisms
- **Atomic Design Structure** - Component classification (atoms/molecules/organisms)
- **Component Classification Decision Tree** - Where to place components
- **Design Decision Framework** - Token usage, composition patterns, accessibility
- **Context7 Integration** - Validate against Material UI, Chakra UI, Radix UI, Bits UI
- **Design Quality Checklist** - Token usage, accessibility (WCAG 2.1 AA), cascade testing
- **Design-Specific Workflows** - Component classification, token validation, cascade testing, accessibility audit

**When to Use**:

- ✅ **Design System Work** - Tokens, components, utilities
- ✅ **UI/UX Decisions** - Layout, spacing, colors, typography
- ✅ **Component Architecture** - Atoms, molecules, organisms
- ✅ **Accessibility** - WCAG, ARIA, keyboard nav, focus states
- ✅ **Design Token Audits** - Hardcoded values → tokens migration
- ✅ **Component Refactoring** - Button misuse → specialized components
- ✅ **Cascade Validation** - Token changes propagate automatically?
- ✅ **Dark Mode** - Automatic light/dark mode switching
- ✅ **Mobile Responsive** - Breakpoints, container padding

**When NOT to Use** (use `/manager` instead):

- ❌ Backend work (Convex functions, database schema)
- ❌ DevOps (CI/CD, deployment, testing)
- ❌ General project coordination
- ❌ Non-design technical work

**Key Features**:

- **Design-Specific Language** - Tokens, atoms, molecules, accessibility (not variables, files, modules)
- **Context7 Validation** - Industry standards from Material UI, Chakra UI, Radix UI
- **Accessibility First** - WCAG 2.1 AA compliance mandatory
- **Cascade Testing** - Token changes must propagate automatically
- **Quality Gates** - Token usage, accessibility, cascade, documentation

**Why This Command**:

- Design decisions affect entire app (one wrong token creates cascading issues)
- Fresh context problem - Generic `/manager` lacks design expertise
- Quality insurance - Catches design mistakes before they ship
- Specialized domain - Tokens, atomic design, Bits UI, accessibility require expertise

**Integration with Existing Commands**:

- **Inherits** - `/manager` core patterns (workflow coordination, state checking)
- **References** - Design docs (design-tokens.md, component-architecture.md)
- **Uses** - Context7 for design library validation
- **Outputs** - Design-specific recommendations and quality checks

**Example Workflow**:

```
User: "Done with SYOS-422 (Extract Design System Patterns)"

Design Manager:
1. Check component classification (TagSelector → Atom)
2. Validate token usage (semantic tokens ✅)
3. Check accessibility (ARIA labels ✅)
4. Run cascade test (token changes propagate ✅)
5. Validate with Context7 (Material UI patterns ✅)

✅ SYOS-422 acknowledged

Next: Run cascade test, then start SYOS-423
```

**See**: SYOS-422 - First ticket managed by `/design-manager`

---

**Last Updated**: 2025-11-21  
**Purpose**: Document command optimizations and best practices  
**Latest Change**: Added `/design-manager` command for design system work (SYOS-422)
