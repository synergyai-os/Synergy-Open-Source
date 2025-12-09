---
description: Run naming convention audit and compare against baseline
---

# Audit Naming Conventions

## Steps

1. Run the naming linter:
```bash
npm run audit:naming
```

2. Read the current baseline from `docs/audit/naming-baseline.md`

3. Compare results:
   - **Regressions**: New violations not in baseline → Report as errors
   - **Progress**: Violations in baseline now fixed → Report as wins
   - **Unchanged**: Same violations → Note count

4. Output format:
```
## Naming Audit Results

**Total**: X violations (baseline: Y)
**Trend**: ↑ increased / ↓ decreased / → unchanged

### Regressions (new violations)
- file:line functionName → violation_type

### Progress (fixed since baseline)
- functionName (was: violation_type)

### Remaining P1 (from baseline)
- [ ] deleteRole → archiveRole
- [ ] listMyDrafts → myListDrafts
```

5. If regressions found, suggest fixes based on architecture.md naming conventions.

## When to Use

- Before committing changes to `convex/`
- Weekly audit check
- After refactoring sessions