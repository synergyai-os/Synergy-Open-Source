# CI/CD & Tooling Patterns

> **For AI**: Patterns for continuous integration, quality gates, and local testing workflows.

---

## #L10: Incremental CI Gate Enablement [🟢 REFERENCE]

**Context**: Enabling all CI quality gates at once can block development if there are existing errors  
**Strategy**: Enable gates incrementally, fixing critical issues first  

**Approach**:

```yaml
# .github/workflows/quality-gates.yml

# ✅ PHASE 1: Enable Lint & Build (fix breaking issues first)
- name: Lint
  run: npm run lint
  # Quality gate enabled - blocks PRs

- name: Build verification
  run: npm run build
  # Quality gate enabled - blocks PRs

# ⏸️ PHASE 2: Defer Type Check (fix in separate ticket)
- name: Type check
  run: npm run check
  continue-on-error: true # TODO: Enable after fixing errors (SYOS-72)
```

**Why**:
- ✅ Lint and build failures are typically easier to fix
- ✅ TypeScript errors can be numerous and require dedicated effort
- ✅ Prevents blocking all development while fixing type errors
- ✅ Progressive improvement vs. all-or-nothing

**Apply when**:
- Adding CI gates to existing project with technical debt
- Large number of TypeScript errors exist
- Need to balance quality improvements with velocity

**Related**: #L60 (ESLint for tests), #L110 (Local CI testing)

---

## #L60: ESLint Configuration for Test Files [🟡 IMPORTANT]

**Symptom**: ESLint errors in test files for intentional `any` types, blocking CI  
**Root Cause**: Test code needs more flexibility than production code  
**Fix**:

```javascript
// eslint.config.js

export default [
	// ... other configs
	{
		// Relax rules for test files
		files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', 'e2e/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off', // Test mocks often need `any`
			'@typescript-eslint/no-unused-vars': 'warn' // Downgrade to warning
		}
	},
	{
		// Relax rules for integration test helpers (Convex API types are complex)
		files: ['tests/convex/integration/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		// Relax rules for demo/test pages
		files: ['src/routes/settings/permissions-test/**/*.svelte'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn'
		}
	}
];
```

**Why**:
- Tests often need `any` for mocking external APIs
- Test code prioritizes readability over type safety
- Integration tests with complex library types (e.g., Convex, Playwright) benefit from relaxed rules
- Reduces noise, lets devs focus on real issues

**Anti-pattern**:

```javascript
// ❌ BAD: Disabling rules globally
rules: {
	'@typescript-eslint/no-explicit-any': 'off' // Affects production code!
}
```

**Apply when**:
- Adding ESLint to project with existing tests
- Working with complex external library types
- Test mocks require `any` types
- Demo pages intentionally show unsafe patterns

**Related**: #L10 (Incremental CI gates), convex-integration.md#L240 (Type definitions)

---

## #L110: Local CI Testing - npm Scripts > Shell Scripts [🟢 REFERENCE]

**Context**: Developers need to run CI checks locally before pushing  
**Best Practice**: Use npm scripts that mirror CI exactly  

**Pattern**:

```json
// package.json
{
	"scripts": {
		"ci:local": "npm run check && npm run lint && npm run build",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"lint": "prettier --check . && eslint .",
		"build": "vite build"
	}
}
```

**Usage**:

```bash
# ✅ Run full CI suite locally
npm run ci:local

# ✅ Individual checks
npm run check   # Type check
npm run lint    # Lint + format check
npm run build   # Build verification
```

**Why npm scripts > shell scripts**:
- ✅ Platform-independent (Windows/Mac/Linux)
- ✅ Single source of truth (`package.json`)
- ✅ Easier to maintain (one place to update)
- ✅ Standard Node.js convention
- ✅ Auto-syncs with CI when you update npm scripts

**Anti-pattern**:

```bash
# ❌ Shell script requires manual sync with CI
# scripts/test-locally.sh
#!/bin/bash
npm run check    # Might drift from CI over time
npm run lint
npm run build
```

**Sync with CI**:

```yaml
# .github/workflows/quality-gates.yml
- name: Type check
  run: npm run check  # ✅ Same command as local

- name: Lint
  run: npm run lint   # ✅ Same command as local

- name: Build
  run: npm run build  # ✅ Same command as local
```

**Documentation**:

Create `CI-LOCAL-TESTING.md`:

```markdown
# Local CI Testing Guide

## Quick Start
npm run ci:local

## Individual Commands
- `npm run check` - Type check
- `npm run lint` - Lint + format check
- `npm run build` - Build verification

## Keeping in Sync
When CI workflow changes, update the `ci:local` script in `package.json`.
```

**Apply when**:
- Setting up CI for the first time
- Developers frequently push failing commits
- Want to catch issues before CI runs
- Team needs consistent local validation

**Related**: #L10 (Incremental gates), #L160 (Secret scanning)

---

## #L160: Secret Scanning with TruffleHog [🟢 REFERENCE]

**Context**: Prevent accidental commits of API keys, tokens, and credentials  
**Tool**: [TruffleHog](https://github.com/trufflesecurity/trufflehog) by Truffle Security  

**Setup**:

```yaml
# .github/workflows/quality-gates.yml
- name: Secret Scan
  uses: trufflesecurity/trufflehog@main
  with:
    extra_args: --only-verified --fail
```

**Whitelist Safe Patterns**:

```
# .secretsignore

# Convex URLs (public, non-sensitive)
https://[a-z0-9-]+\.convex\.cloud

# Example/demo keys
EXAMPLE_API_KEY=sk-test-demo-12345
demo-key-12345

# Placeholder values
YOUR_API_KEY_HERE
<YOUR_KEY>
```

**Why**:
- ✅ Catches real secrets before they reach production
- ✅ `--only-verified` reduces false positives
- ✅ Runs on every PR, not just main branch
- ✅ `.secretsignore` handles legitimate patterns (e.g., public URLs)

**Common false positives**:
- Convex deployment URLs (public by design)
- Example/demo keys in documentation
- Test fixtures with fake credentials
- Placeholder values like `YOUR_API_KEY_HERE`

**Apply when**:
- Setting up CI/CD for the first time
- Project handles sensitive credentials
- Multiple developers committing code
- Preparing for security audits

**Related**: #L10 (Incremental gates), security best practices

---

## Format Version: 1.0

