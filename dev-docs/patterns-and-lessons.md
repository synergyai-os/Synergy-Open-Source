# ⚠️ MOVED: Patterns & Lessons Learned

**This file has been restructured for better AI performance.**

---

## 🎯 New Location

**Use this instead**: [patterns/INDEX.md](patterns/INDEX.md)

The patterns have been reorganized into a tiered system for faster AI lookup and better maintainability:

1. **[patterns/INDEX.md](patterns/INDEX.md)** - Start here (fast symptom lookup)
2. **[patterns/svelte-reactivity.md](patterns/svelte-reactivity.md)** - Svelte 5 patterns
3. **[patterns/convex-integration.md](patterns/convex-integration.md)** - Convex patterns
4. **[patterns/ui-patterns.md](patterns/ui-patterns.md)** - UI/UX patterns
5. **[patterns/analytics.md](patterns/analytics.md)** - PostHog patterns

---

## Why the Change?

**Old** (3,224 lines):

- ❌ AI scans entire file for each lookup
- ❌ High maintenance (4+ updates per pattern)
- ❌ Slow search

**New** (tiered, ~200 lines per file):

- ✅ AI loads INDEX → jumps to line number
- ✅ 80% smaller context
- ✅ Validated with Context7
- ✅ Severity-based (🔴 Critical, 🟡 Important, 🟢 Reference)

---

## Quick Examples

### Finding a Pattern (Old Way)

1. Open patterns-and-lessons.md (3,224 lines)
2. Scroll through Quick Diagnostic table
3. Click anchor link
4. Scroll to pattern (line 800+)
5. Read verbose format

### Finding a Pattern (New Way)

1. Open patterns/INDEX.md (200 lines)
2. Scan symptom table
3. Click line number link (e.g., svelte-reactivity.md#L10)
4. Read compressed fix immediately

---

## For `/root-cause` Command

**Old**: Search 3,224 lines  
**New**: Search INDEX.md → jump to exact line

## For `/save` Command

**Old**: Add to end, update 3 indexes, update Quick Diagnostic  
**New**: Add to domain file with line number, update INDEX.md

---

## All Patterns Migrated ✅

All 30 critical patterns have been:

- ✅ Validated with Context7 (Svelte 5, Convex docs)
- ✅ Compressed (70% size reduction)
- ✅ Categorized by severity
- ✅ Indexed by symptom, technology, and line number

**Legacy file** (if needed): [patterns-and-lessons-LEGACY.md](patterns-and-lessons-LEGACY.md)

---

**Start using the new structure**: [patterns/INDEX.md](patterns/INDEX.md)

---

## 📚 Documentation Organization Pattern

**Date**: 2025-11-12  
**Pattern**: PARA-based documentation organization

### What We Learned

When organizing documentation at scale, use **PARA principles**:

- **2-areas/**: Group by **domain** (product, architecture, design, development)
- **3-resources/**: Group by **purpose** (testing, deployment, guides, setup)
- **1-projects/**: Keep root clean - all files in project folders
- **Consolidate duplicates**: One source of truth per topic

### Key Principles

1. **Domain grouping** (2-areas): Related files together (auth architecture files in `architecture/auth/`)
2. **Purpose grouping** (3-resources): Quick lookup by use case (all testing docs in `testing/`)
3. **Clean roots**: Only README.md at root level, everything else in folders
4. **Update references**: Always update cross-references when moving files

### Benefits

- ✅ Easier navigation (related files grouped)
- ✅ Clearer ownership (domains obvious)
- ✅ Scalable (easy to add new files)
- ✅ PARA-aligned (Areas = ongoing, Resources = reference)

**See**: [2-areas/README.md](2-areas/README.md) and [3-resources/README.md](3-resources/README.md) for structure

---

## 🎨 Specialized Manager Pattern

**Date**: 2025-11-21  
**Pattern**: Domain-specific manager commands that inherit core patterns but add specialized expertise

### What We Learned

When managing complex domain work (design systems, architecture, security), **generic coordination isn't enough**. Need domain expertise built-in.

**Problem**: Generic `/manager` command:
- ✅ Knows workflows, dependencies, coordination
- ❌ Lacks domain expertise (design tokens, accessibility, Context7 validation)
- ❌ Fresh context problem (new chat = no design knowledge)
- ❌ Risk of quality issues (wrong token usage, missing ARIA labels)

**Solution**: Create specialized managers that inherit core patterns:

### Pattern Implementation

**Base Manager** (`.cursor/commands/manager.md`):
- Role boundaries (guide, not execute)
- Workflow coordination (sequential → parallel)
- State checking, gap identification
- Communication style (concise, actionable)

**Specialized Manager** (`.cursor/commands/design-manager.md`):
```markdown
# design-manager

**Inherits from**: `/manager` - See that command for core workflow patterns

**Adds**: Design system expertise
- Design system context (auto-loads design-tokens.md, component-architecture.md)
- Component classification decision tree (atoms/molecules/organisms)
- Context7 integration (Material UI, Chakra UI, Radix UI validation)
- Accessibility checklist (WCAG 2.1 AA compliance)
- Cascade testing (token changes propagate?)
- Design quality gates
```

### Key Principles

1. **Inherit, don't duplicate** - Reference base manager for core patterns
2. **Add domain expertise** - Load domain docs, validation tools, quality gates
3. **Use Context7** - Validate against industry standards (not guesses)
4. **Clear separation** - Design work → design manager, other work → base manager

### Benefits

- ✅ **Quality insurance** - Domain expertise catches mistakes before shipping
- ✅ **Fresh context** - New chats have domain knowledge built-in
- ✅ **Reduced duplication** - Inherit core patterns, add only domain-specific
- ✅ **Clear boundaries** - Use right tool for right job

### When to Create Specialized Manager

**Create when:**
- ✅ Domain requires deep expertise (design, security, architecture)
- ✅ Fresh context problem exists (new chat loses critical knowledge)
- ✅ Quality risks are high (one mistake cascades)
- ✅ Industry standards exist (can validate with Context7)

**Don't create when:**
- ❌ Generic coordination sufficient
- ❌ Domain knowledge easily loadable from tickets
- ❌ No quality risk

### Examples

**Design Manager** (`.cursor/commands/design-manager.md`):
- Domain: Design systems, UI/UX, accessibility
- Expertise: Design tokens, atomic design, WCAG, Bits UI
- Validation: Context7 (Material UI, Chakra UI)
- Quality gates: Token usage, accessibility, cascade testing

**Future candidates:**
- **Architecture Manager** - Multi-tenancy, modularity, feature flags
- **Security Manager** - RBAC, auth, data privacy, SOC 2 compliance
- **Performance Manager** - Query optimization, bundle size, caching

**See**: `.cursor/commands/design-manager.md` - Complete implementation (670 lines)

---

## 🔗 Linear Project Linking Pattern

**Date**: 2025-11-21  
**Pattern**: Always verify ticket project linking after creation (doesn't happen automatically)

### What We Learned

**Problem**: Linear API doesn't reliably link tickets to projects during creation, even when `project` parameter is provided.

**Symptom**: Tickets created but don't appear in project view, making them hard to track.

**Root cause**: `mcp_Linear_create_issue()` accepts `project` parameter but linking may fail silently.

### Solution

**Always verify and update:**

```typescript
// 1. Create ticket with project parameter
const ticket = await mcp_Linear_create_issue({
	team: 'SYOS',
	title: 'My Ticket',
	project: projectId, // ✅ Provide project ID
	// ... other fields
});

// 2. CRITICAL: Verify project linking
const createdTicket = await mcp_Linear_get_issue({ id: ticket.id });

// 3. Update if missing (this is required!)
if (!createdTicket.projectId || createdTicket.projectId !== projectId) {
	await mcp_Linear_update_issue({
		id: ticket.id,
		project: projectId // ✅ Explicitly link
	});
}
```

### Key Principles

1. **Never assume linking worked** - Always verify with `get_issue()`
2. **Update if missing** - Use `update_issue()` with `project` parameter
3. **Apply to subtasks too** - Subtasks don't inherit project from parent (must link explicitly)

### Why This Matters

- **Tracking**: Tickets without project links are invisible in project views
- **Coordination**: Can't see work scope or progress
- **Dependencies**: Can't analyze parallel/sequential work

### Documentation Updates

- ✅ Added to `.cursor/commands/create-tasks.md` - Unified ticket/subtask creation with project linking verification workflow
- ✅ Project linking verification (subtasks don't inherit project from parent - critical)

**See**: `.cursor/commands/create-tasks.md` - Unified Linear workflow with verification

---

## 📝 Command Organization Best Practices

**Date**: 2025-11-21  
**Pattern**: How to organize and maintain Cursor commands for AI agents

### What We Learned

**Commands are only loaded when invoked** (not in every chat), so:

1. **Commands can be comprehensive** - 450-670 lines acceptable if well-organized
2. **Inheritance reduces duplication** - Reference other commands instead of duplicating
3. **Document in README.md** - Track command purpose, size, status in `.cursor/commands/README.md`
4. **Clear purpose** - Each command does one thing well

### Command Types

**Universal Commands** (always available):
- `/start` - Onboarding + ticket creation (~490 lines)
- `/go` - Pattern-first implementation (~280 lines)
- `/manager` - Generic coordination (~450 lines)
- `/design-manager` - Design system coordination (~670 lines)

**Specialized Commands** (load as needed):
- `/linear` - Linear workflow reference (~460 lines)
- `/linear-subtickets` - Subtask creation workflow (~180 lines)
- `/save` - Pattern capture workflow
- `/root-cause` - Debug workflow (~240 lines)

### Best Practices

1. **Inherit core patterns** - Reference other commands for common workflows
2. **Add domain expertise** - Focus on specialized knowledge
3. **Document optimizations** - Update README.md with purpose, size, changes
4. **Use references** - Point to docs instead of duplicating content

### Benefits

- ✅ **Reduced duplication** - Single source of truth
- ✅ **Easier maintenance** - Update once, reference everywhere
- ✅ **Clear structure** - Each command has clear purpose
- ✅ **Scalable** - Can add new specialized commands without bloat

**See**: `.cursor/commands/README.md` - Complete optimization guide

---

## 🔒 Branch Safety Gates Pattern ✅ **IMPLEMENTED**

**Date**: 2025-01-21  
**Status**: Fully implemented in SYOS-430  
**Pattern**: Explicit user confirmation required before any branch operations (never assume "yes")

### What We Learned

**Problem**: AI commands can have comprehensive verification steps but still proceed without explicit user confirmation, violating safety gate principles.

**Real-World Example**:
- `/branch` command enhanced with verification (checks state, preserves work, verifies after)
- **Gap identified**: AI proceeded with branch creation without showing summary or asking confirmation
- User had no control over which option was chosen (commit to branch vs stash vs abort)

### Solution ✅ **IMPLEMENTED**

**Always follow this sequence**:

1. **Check Current State** (MANDATORY):
   - Current branch: `git branch --show-current`
   - Uncommitted changes: `git status --short`
   - Unpushed commits: `git log origin/branch..HEAD`

2. **Show Summary** (MANDATORY):
   - What branch you're on
   - What changes exist (list files)
   - What will happen (step-by-step)
   - Example: "You're on main with uncommitted changes to branch.md. I'll create feature/design-system-v1-completed and move these changes there."

3. **Present Options** (if uncommitted changes exist):
   - Option A: Commit changes to new branch (recommended)
   - Option B: Stash changes, create clean branch, then apply
   - Option C: Abort operation

4. **Require Explicit Confirmation** (MANDATORY):
   - Show: "Proceed with Option A? (yes/no)"
   - Wait for user response
   - Never proceed without explicit "yes"
   - Never assume user wants to proceed

### Key Principles

1. **Never assume "yes"** - Always wait for explicit user confirmation
2. **Show before doing** - User must understand what will happen
3. **Present options** - User chooses, not AI
4. **Multiple safety layers** - Git hooks + AI gates + explicit confirmation

### Why This Matters

- **Trust**: User maintains control over destructive operations
- **Safety**: Prevents accidental work loss
- **Transparency**: User understands what's happening
- **Compliance**: Follows safety gate principles

### Implementation ✅ **COMPLETE**

**Files Modified**:
- ✅ `.cursor/commands/branch.md` - Added Step 1.5: Show Summary and Require Explicit Confirmation
- ✅ `.cursor/commands/start.md` - Added branch verification before onboarding
- ✅ `.cursor/commands/go.md` - Added branch verification before implementation
- ✅ `.cursor/commands/pr-close.md` - Added confirmation before branch deletion

**Files Created**:
- ✅ `dev-docs/2-areas/patterns/branch-safety.md` - Complete pattern document
- ✅ `scripts/git-hooks/pre-checkout` - Blocks branch switch with uncommitted changes
- ✅ `scripts/git-hooks/pre-push` - Validates branch naming conventions
- ✅ `scripts/install-git-hooks.sh` - Hook installation script

**Pattern Document**: See `dev-docs/2-areas/patterns/branch-safety.md` for complete implementation details

**Ticket**: SYOS-430 - Prevent Accidental Branch Switching & Work Loss - Safety Gates (Status: In Review)

---

## 🧪 Real-World Testing Pattern

**Date**: 2025-01-XX  
**Pattern**: Test commands in real scenarios to identify gaps between design and implementation

### What We Learned

**Problem**: Commands can be well-designed on paper but still miss critical safety gates when used in real scenarios.

**Example**:
- `/branch` command had comprehensive verification steps designed
- Real-world test revealed missing explicit confirmation step
- Gap identified: AI proceeded without user confirmation

### Solution

**Always test commands in real scenarios**:

1. **Use command in real situation** - Don't just review design
2. **Document what happened** - Capture actual behavior
3. **Identify gaps** - Compare actual vs intended behavior
4. **Update task plan** - Prioritize fixes based on real-world experience
5. **Update patterns** - Document lessons learned

### Key Principles

1. **Test before considering complete** - Real usage reveals gaps
2. **Document actual behavior** - What happened vs what should happen
3. **Prioritize based on experience** - Real-world gaps > theoretical improvements
4. **Update patterns** - Share lessons learned

### Why This Matters

- **Quality**: Real-world testing catches design gaps
- **Safety**: Identifies missing safety gates
- **Trust**: Commands work as intended in practice
- **Learning**: Patterns improve based on experience

### Documentation Updates

- ✅ Added to `ai-docs/tasks/SYOS-XXX-branch-safety-gates.md` - Real-world experience section
- ✅ Pattern documented - Testing reveals gaps

**See**: `ai-docs/tasks/SYOS-XXX-branch-safety-gates.md` - Real-world test results and gap analysis

---

## 🔄 Temporarily Disable CI Tools During Active Migrations Pattern

**Date**: 2025-11-23  
**Pattern**: Strategically disable CI tools that consume limited resources (review credits, API quotas) during active migrations with many expected changes

### What We Learned

**Problem**: CI tools like Chromatic (visual regression testing) consume review credits for every visual change detected. During active design system migrations, many visual changes are intentional and expected, wasting credits on reviewing intentional updates rather than catching regressions.

**Example**:
- Chromatic visual regression testing setup complete (SYOS-531)
- Design system migration in progress (95% complete, many visual changes expected)
- Running Chromatic on every PR would consume review credits on intentional design system updates
- Credits are limited (open-source tier: 5000 snapshots/month)

**Solution**: Temporarily disable CI workflow, keep local testing available, create reminder ticket to re-enable

### Pattern Implementation

**1. Disable CI Workflow** (comment out, don't delete):

```yaml
# ⏸️ TEMPORARILY DISABLED: Chromatic Visual Testing
# 
# Reason: Design system migration in progress - many expected visual changes
# Would waste review credits on intentional design system updates
# 
# Re-enable when:
# - Design system migration complete
# - Baseline established (all components using new tokens)
# - Ready to catch regressions going forward
# 
# See: SYOS-539 (Re-enable Chromatic Visual Regression Testing)
#
# Local testing still available: npm run chromatic

# name: Chromatic Visual Testing
# on:
#   pull_request:
#     branches: [main]
# ...
```

**2. Keep Local Testing Available**:

- Don't remove configuration files (`chromatic.config.json`, scripts)
- Keep local testing command working (`npm run chromatic`)
- Allows manual testing when needed

**3. Create Reminder Ticket**:

- HIGH PRIORITY ticket to re-enable when migration complete
- Include checklist: verify stability, review baseline, re-enable workflow
- Reference ticket ID in commented workflow file

### Key Principles

1. **Preserve resources** - Don't waste limited credits/quota on expected changes
2. **Keep tooling ready** - Configuration files remain, local testing works
3. **Document clearly** - Comment explains why disabled, when to re-enable, ticket reference
3. **Create reminder** - HIGH PRIORITY ticket ensures re-enablement isn't forgotten
4. **Strategic timing** - Disable during active migration, re-enable when stable

### When to Apply

**Disable when**:
- ✅ Active migration with many expected changes (design system, refactoring, etc.)
- ✅ CI tool consumes limited resources (review credits, API quotas, build minutes)
- ✅ Expected changes would waste resources (intentional updates, not regressions)
- ✅ Local testing still available for manual verification

**Re-enable when**:
- ✅ Migration complete (baseline established)
- ✅ No major visual changes expected
- ✅ Ready to catch regressions going forward
- ✅ Resources available for ongoing testing

### Why This Matters

- **Resource efficiency**: Preserves limited credits/quota for actual regressions
- **Strategic timing**: Disable during noise, enable when signal matters
- **Tooling continuity**: Configuration remains, easy to re-enable
- **Documentation**: Clear reason and reminder ticket prevent forgetting

### Documentation Updates

- ✅ Added to `.github/workflows/chromatic.yml` - Commented workflow with ticket reference
- ✅ Created SYOS-539 - HIGH PRIORITY reminder ticket with re-enablement checklist
- ✅ Pattern documented - Strategic CI tool management during migrations

**See**: `.github/workflows/chromatic.yml` - Disabled workflow with clear documentation  
**See**: SYOS-539 - Re-enable Chromatic Visual Regression Testing (reminder ticket)

---

**Last Updated**: 2025-11-23
