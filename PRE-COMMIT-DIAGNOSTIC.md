# Pre-Commit Hook Diagnostic Report

**Generated**: 2025-01-27  
**Purpose**: Diagnose alignment issues between pre-commit hook, CI/CD, and package.json scripts

---

## Executive Summary

The pre-commit hook calls `validate-tokens.js --fail-on-deprecated`, but the script **does not support this flag**. This will cause the pre-commit hook to fail silently or with an error.

---

## Script Inventory

### ✅ Scripts Called by Pre-Commit Hook (All Exist)

| Pre-Commit Call                                        | Package.json Script | Status       | Notes                                           |
| ------------------------------------------------------ | ------------------- | ------------ | ----------------------------------------------- |
| `npm run check:confidentiality`                        | ✅ Line 42          | ✅ Exists    | Calls `./scripts/check-confidentiality.sh`      |
| `npm run lint`                                         | ✅ Line 20          | ✅ Exists    | Prettier + ESLint                               |
| Hardcoded Tailwind grep                                | N/A (inline)        | ✅ Works     | Inline shell script                             |
| `npm run recipes:validate`                             | ✅ Line 66          | ✅ Exists    | Calls `scripts/validate-recipes.js`             |
| `npm run tokens:build`                                 | ✅ Line 63          | ✅ Exists    | Builds tokens + Storybook docs                  |
| `npm run tokens:validate-semantic`                     | ✅ Line 59          | ✅ Exists    | Calls `scripts/validate-semantic-references.js` |
| `node scripts/validate-tokens.js --fail-on-deprecated` | ❌ **MISSING FLAG** | ❌ **FAILS** | Script doesn't support `--fail-on-deprecated`   |
| `npm run audit:quick`                                  | ✅ Line 46          | ✅ Exists    | Quick design system audit                       |
| `npm run validate:docs`                                | ✅ Line 73          | ✅ Exists    | Validates documentation utility names           |
| `npx lint-staged`                                      | ✅ Configured       | ✅ Works     | Formats staged files                            |

---

## Critical Issue: `--fail-on-deprecated` Flag Missing

### Problem

**Pre-commit hook (line 98)**:

```bash
node scripts/validate-tokens.js --fail-on-deprecated || {
    echo "❌ Deprecated tokens detected in codebase!"
    exit 1
}
```

**Actual script behavior** (`scripts/validate-tokens.js`):

- ✅ Detects deprecated tokens
- ✅ **Warns** about deprecated tokens (lines 494-526)
- ❌ **Does NOT fail** on deprecated tokens (exits 0 even if deprecated tokens found)
- ❌ **Does NOT support** `--fail-on-deprecated` flag

### Current Behavior

The script currently:

1. Detects deprecated tokens
2. Prints warnings
3. **Exits with code 0** (success) even if deprecated tokens are found
4. Only fails if **orphaned tokens** are found (line 541)

### Expected Behavior (from pre-commit hook)

The hook expects:

1. Script to detect deprecated tokens
2. Script to **fail** (exit 1) if deprecated tokens are found
3. Script to accept `--fail-on-deprecated` flag

---

## Pre-Commit vs CI/CD Comparison

### Checks in Pre-Commit BUT NOT in CI

| Check                                     | Pre-Commit    | CI/CD                           | Impact                                      |
| ----------------------------------------- | ------------- | ------------------------------- | ------------------------------------------- |
| Hardcoded Tailwind grep                   | ✅ Line 28-52 | ❌ Missing                      | Pre-commit catches hardcoded values locally |
| `audit:quick`                             | ✅ Line 136   | ❌ Missing (CI uses `audit:ci`) | Different audit modes                       |
| `validate-tokens.js --fail-on-deprecated` | ✅ Line 98    | ❌ Missing                      | CI doesn't check deprecated tokens          |

### Checks in CI BUT NOT in Pre-Commit

| Check                    | CI/CD         | Pre-Commit | Impact                                 |
| ------------------------ | ------------- | ---------- | -------------------------------------- |
| `ci:invariants`          | ✅ Line 35    | ❌ Missing | Critical invariants only checked in CI |
| `guard:auth`             | ✅ Line 41    | ❌ Missing | Auth guard only checked in CI          |
| Secret scan (TruffleHog) | ✅ Line 43-46 | ❌ Missing | Security scan only in CI               |
| `test:transforms`        | ✅ Line 56    | ❌ Missing | Transform tests only in CI             |
| `tokens:validate-dtcg`   | ✅ Line 85    | ❌ Missing | DTCG format validation only in CI      |
| `tokens:audit`           | ✅ Line 81    | ❌ Missing | Token audit only in CI                 |
| `tokens:report`          | ✅ Line 77    | ❌ Missing | Token usage report only in CI          |
| Build verification       | ✅ Line 138   | ❌ Missing | Build only checked in CI               |

### Checks in Both (Aligned)

| Check                      | Pre-Commit      | CI/CD          | Status     |
| -------------------------- | --------------- | -------------- | ---------- |
| `tokens:build`             | ✅ Line 70      | ✅ Line 53, 89 | ✅ Aligned |
| `tokens:validate-semantic` | ✅ Line 86      | ✅ Line 92     | ✅ Aligned |
| `recipes:validate`         | ✅ Line 59      | ✅ Line 62     | ✅ Aligned |
| `validate:docs`            | ✅ Line 147     | ✅ Line 59     | ✅ Aligned |
| `lint`                     | ✅ Line 19      | ✅ Line 65     | ✅ Aligned |
| Manual edit check          | ✅ Line 108-129 | ✅ Line 94-120 | ✅ Aligned |

---

## Alignment Issues Summary

### 🔴 Critical (Blocks Commits)

1. **`--fail-on-deprecated` flag missing**
   - **Impact**: Pre-commit hook will fail or behave unexpectedly
   - **Fix**: Add flag support to `scripts/validate-tokens.js` OR remove flag from pre-commit hook

### 🟡 Medium (Inconsistency)

2. **Different audit modes**
   - Pre-commit: `audit:quick`
   - CI: `audit:ci`
   - **Impact**: Different checks run locally vs CI

3. **Missing CI checks in pre-commit**
   - Auth guard, invariants, secret scan, transforms, DTCG validation
   - **Impact**: Issues caught late (in CI) rather than early (pre-commit)

4. **Missing pre-commit checks in CI**
   - Hardcoded Tailwind grep check
   - **Impact**: CI doesn't catch hardcoded values (relies on ESLint)

### 🟢 Low (Documentation)

5. **Undocumented checks**
   - Confidentiality check not mentioned in architecture.md
   - Doc validation not mentioned in architecture.md

---

## Recommended Fixes

### Priority 1: Fix `--fail-on-deprecated` Flag

**Option A**: Add flag support to `scripts/validate-tokens.js`

```javascript
// Add at top of script
const FAIL_ON_DEPRECATED = process.argv.includes('--fail-on-deprecated');

// Modify exit logic (around line 542)
if (orphanedTokens.length > 0) {
	process.exit(1);
} else {
	if (deprecatedUsage.length === 0) {
		console.log('\n✅ All tokens have corresponding utilities or are base tokens!\n');
		process.exit(0);
	} else {
		if (FAIL_ON_DEPRECATED) {
			console.log('\n❌ Deprecated tokens detected. Use --fail-on-deprecated to block commits.\n');
			process.exit(1);
		} else {
			console.log(
				'\n✅ No orphaned tokens found (but deprecated tokens are in use - see warnings above).\n'
			);
			process.exit(0);
		}
	}
}
```

**Option B**: Remove flag from pre-commit hook (if deprecated tokens shouldn't block commits yet)

```bash
# Change line 98 from:
node scripts/validate-tokens.js --fail-on-deprecated || {

# To:
node scripts/validate-tokens.js || {
```

### Priority 2: Align Audit Modes

Decide whether pre-commit should use:

- `audit:quick` (current) - faster, less comprehensive
- `audit:ci` (CI uses) - more comprehensive

### Priority 3: Add Missing Checks to Pre-Commit (Optional)

Consider adding to pre-commit:

- `npm run guard:auth` (quick auth check)
- `npm run test:transforms` (if fast enough)

---

## Testing the Fix

After implementing Priority 1 fix:

1. **Test with deprecated tokens present**:

   ```bash
   node scripts/validate-tokens.js --fail-on-deprecated
   # Should exit with code 1
   ```

2. **Test without flag**:

   ```bash
   node scripts/validate-tokens.js
   # Should exit with code 0 (warns but doesn't fail)
   ```

3. **Test pre-commit hook**:
   ```bash
   git add .
   git commit -m "test"
   # Should fail if deprecated tokens found (with flag)
   ```

---

## Questions for User

1. **Should deprecated tokens block commits?**
   - If yes: Implement `--fail-on-deprecated` flag (Option A)
   - If no: Remove flag from pre-commit hook (Option B)

2. **What specific error are you seeing?**
   - Is it: "Unknown flag --fail-on-deprecated"?
   - Or: Pre-commit passes but shouldn't?
   - Or: Pre-commit fails unexpectedly?

3. **Which checks should run in pre-commit vs CI?**
   - Should pre-commit be comprehensive (slower) or quick (faster)?
   - Should CI-only checks (invariants, auth guard) be added to pre-commit?

---

## Related Files

- `.husky/pre-commit` - Pre-commit hook (161 lines)
- `scripts/validate-tokens.js` - Token validation script (561 lines)
- `.github/workflows/quality-gates.yml` - CI/CD workflow (199 lines)
- `package.json` - Script definitions (193 lines)
- `dev-docs/master-docs/design-system.md` - Design system documentation
