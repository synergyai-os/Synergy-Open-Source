# root-cause

**Purpose**: Find and apply documented solutions fast.

---

## Workflow

### 1. Load Pattern Index
- Open `dev-docs/patterns/INDEX.md` (200 lines)
- Scan symptom tables (🔴 Critical, 🟡 Important, 🟢 Reference)

### 2. Jump to Solution
- Click line number link (e.g., `svelte-reactivity.md#L10`)
- Read compressed pattern: Symptom → Root Cause → Fix

### 3. Assess Confidence
- **95%+ confident**: Apply fix immediately
- **<95% confident**: Research + report findings
  - State confidence % and what's unclear
  - Use Context7 for latest docs if pattern involves libraries

### 4. Apply or Report
- **Confident**: Implement fix as documented
- **Uncertain**: Document what you found, ask for guidance

---

## Search Strategy

1. **Symptom match**: Scan INDEX.md tables by severity
2. **Technology**: Svelte → svelte-reactivity.md, Convex → convex-integration.md
3. **Keywords**: Grep domain files for error messages/terms
4. **Related patterns**: Follow `Related: #L[number]` links

---

## Confidence Checklist

✅ **Apply fix if**:
- Exact symptom match in index
- Root cause clearly explained
- Fix validated with Context7 (for library patterns)
- No ambiguity in solution

❌ **Research + report if**:
- Symptom similar but not exact
- Multiple possible causes
- Library-specific and not validated
- Solution unclear or missing context

---

## Quick Reference

- **Svelte 5 patterns**: `patterns/svelte-reactivity.md`
- **Convex patterns**: `patterns/convex-integration.md`
- **UI/UX patterns**: `patterns/ui-patterns.md`
- **Analytics**: `patterns/analytics.md`
