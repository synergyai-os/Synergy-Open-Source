# Local CI Testing Guide

Run CI checks locally before pushing to GitHub.

## ✅ Quick Start (Recommended)

**Run all CI checks locally:**

```bash
npm run ci:local
```

**This runs:**

1. ✓ Type check (`npm run check`)
2. ✓ Lint (`npm run lint`) - Checks formatting (Prettier) + code quality (ESLint)
3. ✓ Build (`npm run build`)

**Matches:** `.github/workflows/quality-gates.yml` steps 39-48

---

## 🔧 Alternative: Shell Script

You can also use the shell script directly:

```bash
./scripts/test-locally.sh
```

**Note:** The npm script is preferred as it auto-syncs with CI. The shell script requires manual updates when CI changes.

---

## 🔍 Individual Commands

Run specific checks:

```bash
# Type check only (shows warnings, doesn't fail yet)
npm run check

# Lint only (MUST pass - blocks CI)
npm run lint

# Build only (MUST pass - blocks CI)
npm run build

# All three (same as npm run ci:local)
npm run check && npm run lint && npm run build
```

---

## 🚨 Important Notes

### 1. Secret Scanning (TruffleHog)

**Not run locally** - Only in CI (step 34-37 in workflow)

**Why:** TruffleHog scans entire git history, not just working directory.  
**Local alternative:** Don't commit API keys/secrets in `.env` files

### 2. Type Check Warnings

**Expected:** 66 TypeScript errors in test files (SYOS-72)  
**CI behavior:** Type check has `continue-on-error: true` so it doesn't block

### 3. Lint vs Build

- **Lint** checks code style (Prettier + ESLint)
- **Build** checks if code compiles (TypeScript + Vite)

**Both must pass for CI to succeed** ✅

---

## 🔄 Keeping in Sync

**When CI workflow changes:**

1. Update `.github/workflows/quality-gates.yml`
2. Update `ci:local` script in `package.json` to match
3. _Optionally_ update `scripts/test-locally.sh` (if you use it)
4. Update this doc

**Example:** If we add E2E tests to CI:

```json
"ci:local": "npm run check && npm run lint && npm run build && npm run test:e2e"
```

**Why npm scripts are better:**

- ✅ One source of truth (`package.json`)
- ✅ Platform-independent (works on Windows/Mac/Linux)
- ✅ Easier to maintain
- ✅ Standard Node.js convention

---

## 🛠️ Advanced: Run Full Pre-commit Checks

```bash
# Everything that runs before commit
npm run precommit
```

**This includes:**

- SessionID usage check
- Lint
- Unit tests (server)
- Integration tests

**Takes longer** but catches more issues.

---

## 📋 Quick Reference

| Command             | What it does                        | CI Step      |
| ------------------- | ----------------------------------- | ------------ |
| `npm run ci:local`  | All CI quality checks               | Steps 39-48  |
| `npm run format`    | Auto-fix formatting (Prettier)      | (local only) |
| `npm run check`     | TypeScript check (warns only)       | Step 39-41   |
| `npm run lint`      | Prettier + ESLint (fails on error)  | Step 43-45   |
| `npm run build`     | Build verification (fails on error) | Step 47-52   |
| `npm run precommit` | All pre-commit checks + tests       | (local only) |

**Note**: Formatting is auto-fixed by pre-commit hooks (husky + lint-staged) before commit, so you rarely need to run `npm run format` manually.

---

## ❓ FAQ

**Q: Do I need to run this before every commit?**  
A: No, but run before pushing to avoid CI failures.

**Q: Can I skip `npm run check`?**  
A: Yes, it's not blocking CI yet (SYOS-72 will enable it).

**Q: What if lint fails locally but I can't fix it?**  
A: Run `npm run format` to auto-fix Prettier issues, then check ESLint errors manually. **Note**: Pre-commit hooks auto-format staged files, so formatting issues are usually caught before commit.

**Q: Does this run the same exact checks as CI?**  
A: Almost - excludes TruffleHog secret scanning (git history scan).

---

## 🚀 Workflow

**Before pushing:**

```bash
# 1. Run CI checks locally
npm run ci:local

# 2. If all pass, push
git push

# 3. CI runs same checks on GitHub
# 4. PR gets green checkmark ✅
```

**After CI changes:**

- Update `ci:local` script in package.json
- Run `npm run ci:local` to verify
