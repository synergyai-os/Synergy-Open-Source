# AI Development Workflow Patterns

**Purpose**: Patterns for creating effective AI development workflows and commands.

---

## #L10: Task-Specific Templates Prevent "AI Code Slop" [🟡 IMPORTANT]

**Symptom**: AI creates sloppy code, doesn't follow systematic workflows, reinvents solutions instead of using existing patterns  
**Root Cause**: Generic workflows don't provide task-specific instructions, AI jumps to implementation without proper investigation  
**Fix**:

```markdown
# ❌ WRONG: Generic workflow for all tasks
/start SYOS-XXX
/go
# AI implements immediately, may create sloppy code

# ✅ CORRECT: Task-specific templates with systematic workflows
/bug-fix SYOS-XXX      # Reproduce → Trace → Fix → Test
/code-cleanup SYOS-XXX # Identify → Verify → Remove → Test
/code-review SYOS-XXX  # Review → Validate → Suggest
/task-template SYOS-XXX # Think → Analyze → Recommend → Implement
```

**Template Structure**:

Each task-specific template should include:

1. **Purpose** - What the template does
2. **When to Use** - When to use this template vs others
3. **Workflow (MANDATORY)** - Step-by-step process (reproduce → trace → fix → test)
4. **Critical Rules** - What to NEVER do, what to ALWAYS do
5. **Examples** - Complete workflow examples
6. **Related Documentation** - Links to patterns, rules, other commands

**Why**: Task-specific templates provide systematic workflows tailored to each task type, preventing AI from jumping to implementation and ensuring consistent, high-quality work.

**Apply when**: Creating new Cursor commands or improving AI development workflow  
**Related**: #L20 (Command Structure Pattern), `.cursor/rules/BUILDING-RULES.md` (Rule building process)

---

## #L50: Command Structure Pattern [🟢 REFERENCE]

**Symptom**: Commands lack structure, inconsistent format, hard to follow  
**Root Cause**: No standard structure for Cursor commands  
**Fix**:

```markdown
# [command-name]

**Purpose**: One-line description of what the command does.

---

## When to Use

**Use `/[command]` when:**
- Specific condition 1
- Specific condition 2
- Specific condition 3

**Workflow**: `/command SYOS-XXX` → Step 1 → Step 2 → Step 3

---

## Command Usage

```
/command [SYOS-XXX] or [description]
```

**Examples:**
- `/command SYOS-123` - Use from Linear ticket
- `/command Description of task` - Use from description

---

## Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Step 1** ⭐ **CRITICAL**
2. **Step 2**
3. **Step 3**
...

---

## ⚠️ Critical Rules

### Rule 1

**ALWAYS do X**:
- ✅ **CORRECT**: Example
- ❌ **WRONG**: Anti-pattern

**Why**: Explanation

### Rule 2

**NEVER do Y**:
- ❌ **WRONG**: Anti-pattern
- ✅ **CORRECT**: Pattern

**Why**: Explanation

---

## Complete Workflow Example

### Scenario: [Example Name]

**Step 1: [Action]**
```
AI: [What AI does]
AI: [Result]
```

**Step 2: [Action]**
```
AI: [What AI does]
AI: [Result]
```

...

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Rules**: `.cursor/rules/BUILDING-RULES.md` - Rule building process
- **Other Commands**: `.cursor/commands/README.md` - Command reference

---

## 🎯 Key Principles

1. **Principle 1** - Explanation ⭐
2. **Principle 2** - Explanation
3. **Principle 3** - Explanation

---

**Last Updated**: 2025-11-20  
**Purpose**: Standard structure for Cursor commands  
**Status**: Active pattern
```

**Why**: Consistent structure makes commands easier to follow, understand, and maintain. Standard format helps AI agents know what to expect.

**Apply when**: Creating new Cursor commands or updating existing ones  
**Related**: #L10 (Task-Specific Templates), `.cursor/commands/README.md` (Command optimization guide)

---

## #L200: Documentation Organization - CORE vs ARCHIVE Pattern [🟡 IMPORTANT]

**Symptom**: AI agents waste tokens loading outdated docs, reference outdated features (e.g., "teams" docs when app has 0 teams), developers struggle to find current documentation, root directory cluttered with 20+ markdown files  
**Root Cause**: No separation between active (CORE) and historical (ARCHIVE) documentation. AI agents can't distinguish current vs outdated docs, leading to confusion and token waste  
**Fix**:

```markdown
# ❌ WRONG: All docs mixed together
dev-docs/
  product-vision-and-plan.md  # Historical
  product-vision-2.0.md        # Current
  teams.md                     # Feature doesn't exist
  SYOS-123-summary.md         # Completed ticket
  architecture.md              # Current
  future-vision.md             # Historical assessment
# AI loads all files, wastes tokens, gets confused

# ✅ CORRECT: CORE vs ARCHIVE separation
dev-docs/
  CORE-DOCS.md                # Documents what's CORE
  2-areas/
    product/
      product-principles.md    # CORE
    architecture/
      system-architecture.md   # CORE
  4-archive/
    historical/
      product-vision-and-plan.md  # ARCHIVE
      future-vision.md            # ARCHIVE
    outdated-features/
      teams.md                     # ARCHIVE
    tickets/
      SYOS-123-summary.md         # ARCHIVE
.cursorignore                  # Hides archive from AI
```

**Implementation Steps**:

1. **Define CORE Documentation** (`dev-docs/CORE-DOCS.md`):
   - List ~50 essential docs organized by category
   - Criteria: Currently referenced, current/active, essential for development, maintained
   - Categories: Essential, Design, Patterns, Development, Architecture, Resources, Commands, Marketing, AI Docs

2. **Create Archive Structure** (`dev-docs/4-archive/`):
   - `tickets/` - Completed ticket docs
   - `audit-reports/` - Completed audits (keep latest only)
   - `historical/` - Historical vision/strategy
   - `outdated-features/` - Docs for features not in app
   - `old-workflows/` - Superseded workflows
   - `design-system/` - Redundant design docs
   - `architecture/` - Historical architecture docs
   - `tasks/` - Completed task documents

3. **Create `.cursorignore`**:
   ```
   # Archive - Historical/outdated docs hidden from AI
   dev-docs/4-archive/
   ```

4. **Move Files**:
   - Root-level files → archive (except README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, design-system-test.json)
   - Outdated dev-docs → archive (historical assessments, old audits)
   - Preserve file names (or rename if needed)

5. **Update Documentation**:
   - Update `dev-docs/README.md` with CORE vs ARCHIVE distinction
   - Document `.cursorignore` usage

**Why**: Clear separation prevents AI confusion, reduces token waste, and makes current documentation easy to find. Archive hidden from AI but still accessible to humans for historical reference.

**Apply when**: 
- Project has 100+ markdown files
- Outdated docs mixed with current docs
- AI agents reference outdated features
- Root directory cluttered with documentation files

**Related**: #L10 (Task-Specific Templates), `dev-docs/CORE-DOCS.md` (CORE documentation list)

---

**Last Updated**: 2025-11-21  
**Pattern Count**: 3  
**Format Version**: 2.0

