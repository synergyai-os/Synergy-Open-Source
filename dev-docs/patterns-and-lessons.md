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
