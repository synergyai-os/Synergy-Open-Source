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

- ✅ Added to `.cursor/commands/linear.md` - Project linking verification workflow
- ✅ Added to `.cursor/commands/linear-subtickets.md` - Subtask project linking (critical)

**See**: `.cursor/commands/linear.md` - Complete Linear workflow with verification

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
