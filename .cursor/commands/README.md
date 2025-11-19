# Cursor Commands - Optimization Summary

**Purpose**: Summary of command optimizations and **maintenance guide** for AI agents.

**⚠️ CRITICAL**: **AI agents MUST read this file before modifying any `.cursor/commands/*.md` file**

**How this works:**

- This file documents the optimization strategy and results
- AI agents see this via `.cursor/rules/way-of-working.mdc` (always loaded)
- When modifying commands, agents check this file first to prevent regression

---

## 📊 Optimization Results

| Command              | Before    | After      | Change     | Status                                           |
| -------------------- | --------- | ---------- | ---------- | ------------------------------------------------ |
| `/start`             | 368 lines | ~450 lines | +82 lines  | ✅ Modularity validation added (mandatory check) |
| `/start-new-project` | 755 lines | 594 lines  | -21% (161) | ✅ Optimized                                     |
| `/save`              | 898 lines | 272 lines  | -70% (626) | ✅ Optimized                                     |
| `/root-cause`        | 65 lines  | 239 lines  | +174 lines | ✅ Enhanced with "slow = fast" methodology       |
| `/pr`                | New       | 366 lines  | N/A        | ✅ New command - PR creation workflow            |
| `/pr-close`          | New       | 415 lines  | N/A        | ✅ New command - Post-merge cleanup workflow     |
| `/linear`            | 373 lines | 450 lines  | +77 lines  | ✅ Enhanced with Label Selection Guide           |
| `/linear-subtickets` | 1 line    | 180 lines  | +179 lines | ✅ Enhanced with complete workflow guide         |
| `/branch`            | 1 line    | 205 lines  | +204 lines | ✅ New command - Branch creation workflow        |

**Net Change**: ~384 lines removed (626 from `/save` - 174 to `/root-cause` - 148 to `/start`) + 460 lines added (77 to `/linear` + 179 to `/linear-subtickets` + 204 to `/branch`)

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

- **`/start`** - Onboarding + ticket creation (288 lines)
- **`/root-cause`** - Debug workflow (65 lines)

### Project Workflow Commands

- **`/start-new-project`** - New project setup (594 lines)
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

**Last Updated**: 2025-11-19  
**Purpose**: Document command optimizations and best practices  
**Latest Change**: Enhanced `/validate` with modularity validation checklist (mandatory check)
