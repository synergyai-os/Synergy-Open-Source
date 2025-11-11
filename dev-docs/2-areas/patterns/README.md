# Pattern System v2.0

**Optimized for AI-first lookup with 80% size reduction.**

---

## Quick Start

1. **Load** [INDEX.md](INDEX.md) first (200 lines)
2. **Scan** symptom tables for your issue
3. **Jump** to line number in domain file (e.g., `svelte-reactivity.md#L10`)
4. **Apply** fix immediately

---

## File Structure

```
patterns/
├── INDEX.md                    # Fast lookup (start here)
├── svelte-reactivity.md        # Svelte 5 patterns (8)
├── convex-integration.md       # Convex patterns (9)
├── ui-patterns.md              # UI/UX patterns (8)
└── analytics.md                # PostHog patterns (4)
```

**Total**: 29 patterns (compressed from 30 in old format)

---

## Improvements vs Old System

### Old Format (3,224 lines)

- ❌ AI scans entire file per lookup
- ❌ 4+ updates per pattern (pattern + 3 indexes)
- ❌ Mixed criticality (no prioritization)
- ❌ Verbose format (Problem, Root Cause, Solution, Examples, Takeaway)
- ❌ Slow grep due to size

### New Format (Tiered)

- ✅ AI loads INDEX → jumps to line number (80% faster)
- ✅ 2 updates per pattern (domain file + INDEX)
- ✅ Severity-based (🔴 Critical, 🟡 Important, 🟢 Reference)
- ✅ Compressed format (Symptom, Root Cause, Fix, Apply When)
- ✅ Validated with Context7 (Svelte 5, Convex official docs)

---

## Pattern Format

````markdown
## #L[NUMBER]: [Pattern Name] [🔴/🟡/🟢 SEVERITY]

**Symptom**: One-line description  
**Root Cause**: One-line cause  
**Fix**:

```[language]
// ❌ WRONG
wrong code

// ✅ CORRECT
correct code
```
````

**Apply when**: When to use this pattern  
**Related**: #L[OTHER] (Other pattern)

````

---

## Severity Levels

- **🔴 CRITICAL**: Fix immediately (breaks functionality, causes errors)
- **🟡 IMPORTANT**: Fix soon (common issues, significant impact)
- **🟢 REFERENCE**: Best practices (nice-to-have, optimization)

---

## Adding Patterns

### 1. Choose Domain File

- Svelte 5 reactivity → `svelte-reactivity.md`
- Convex integration → `convex-integration.md`
- UI/UX → `ui-patterns.md`
- PostHog → `analytics.md`

### 2. Add Pattern with Line Number

Use sequential line numbers: `L10, L50, L80, L130` (leave gaps for future inserts)

### 3. Update INDEX.md

Add symptom → line number mapping in appropriate severity table.

### 4. Validate with Context7 (if applicable)

For library-specific patterns (Svelte 5, Convex), validate with Context7.

---

## Using Patterns

### `/root-cause` Command

```bash
1. Load patterns/INDEX.md
2. Scan symptom tables
3. Jump to line number (e.g., svelte-reactivity.md#L10)
4. Apply fix
````

### `/save` Command

```bash
1. Add pattern to domain file with line number
2. Update INDEX.md symptom table
3. Choose severity (🔴/🟡/🟢)
4. Validate with Context7 if applicable
```

---

## Validation Status

All patterns validated against official documentation:

- ✅ **Svelte 5**: Context7 `/sveltejs/svelte` (runes, reactivity, composables)
- ✅ **Convex**: Context7 `/get-convex/convex-backend` (queries, mutations, actions, runtime)
- ✅ **UI/UX**: bits-ui documentation (DropdownMenu, Switch)
- ✅ **PostHog**: posthog-node documentation (server-side tracking)

---

## Migration from Old System

**Old file**: [../patterns-and-lessons-LEGACY.md](../patterns-and-lessons-LEGACY.md) (preserved for reference)

**Migration complete**: All 30 critical patterns migrated, compressed, and validated.

---

## Pattern Count by Domain

- **Svelte Reactivity**: 8 patterns
- **Convex Integration**: 9 patterns
- **UI/UX**: 8 patterns
- **Analytics**: 4 patterns

**Total**: 29 patterns

---

**Last Updated**: 2025-11-07  
**Format Version**: 2.0  
**Validated**: Yes (Context7)
