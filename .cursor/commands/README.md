# Cursor Commands - Optimization Summary

**Purpose**: Summary of command optimizations and **maintenance guide** for AI agents.

**⚠️ CRITICAL**: **AI agents MUST read this file before modifying any `.cursor/commands/*.md` file**

**How this works:**

- This file documents the optimization strategy and results
- AI agents see this via `.cursor/rules/way-of-working.mdc` (always loaded)
- When modifying commands, agents check this file first to prevent regression

---

## 📊 Optimization Results

| Command              | Before    | After     | Reduction       | Status                                       |
| -------------------- | --------- | --------- | --------------- | -------------------------------------------- |
| `/start`             | 220 lines | 368 lines | +148 lines      | ✅ Linear constants & workflow added         |
| `/start-new-project` | 755 lines | 594 lines | 21% (161 lines) | ✅ Optimized                                 |
| `/save`              | 898 lines | 272 lines | 70% (626 lines) | ✅ Optimized                                 |
| `/root-cause`        | 65 lines  | 65 lines  | 0%              | ✅ Already optimal                           |
| `/pr`                | New       | 366 lines | N/A             | ✅ New command - PR creation workflow        |
| `/pr-close`          | New       | 415 lines | N/A             | ✅ New command - Post-merge cleanup workflow |

**Total Reduction**: ~558 lines removed from `/save`, extracted to `commit-message-format.md` (406 lines)

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

**Status:** Already optimal (65 lines, focused workflow)

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
- **`/pr`** - PR creation workflow (366 lines)
- **`/pr-close`** - Post-merge cleanup workflow (415 lines)

### Documentation (Referenced by Commands)

- **`commit-message-format.md`** - Commit message format with examples (406 lines)
- **`ticket-writing-format.md`** - Linear ticket writing format template

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

**Last Updated**: 2025-11-13  
**Purpose**: Document command optimizations and best practices
