# Test Automation for CI/CD Deployment Confidence

**Purpose**: Document all test flows required to deploy with confidence in CI/CD pipelines. This ensures fast feedback, prevents regressions, and enables rapid deployment.

**Goal**: Run the right tests at the right time to catch issues early without slowing down development.

---

## 🎯 Test Automation Strategy

### Core Principle

**Fast feedback loops**: Run fast tests first, slow tests later. Fail fast, fix fast.

### Test Pyramid for CI/CD

```
        /\
       /E2E\        ← Slow, comprehensive (pre-deploy)
      /------\
     /Integration\  ← Medium speed (pre-merge)
    /------------\
   /   Unit Tests  \ ← Fast, frequent (pre-commit)
  /----------------\
```

---

## 📋 Test Flows by Stage

### Stage 1: Pre-Commit (Local Development)

**Goal**: Catch obvious errors before committing  
**Speed**: < 30 seconds  
**Run**: Automatically on `git commit` (via husky) or manually

#### Tests to Run

1. **TypeScript Compilation**

   ```bash
   npx tsc --noEmit
   ```

   - Catches type errors immediately
   - Verifies API paths exist (after refactoring)
   - Fast: ~5 seconds

2. **Linting & Formatting**

   ```bash
   npm run lint
   ```

   - Code style consistency
   - Catches common errors
   - Fast: ~3 seconds

3. **Unit Tests (Fast)**

   ```bash
   npm run test:unit:server -- --run
   ```

   - Pure function tests
   - Business logic validation
   - Fast: ~10 seconds

#### What NOT to Run

- ❌ E2E tests (too slow)
- ❌ Full test suite (unnecessary)
- ❌ Build process (save for CI)

#### Exit Criteria

- ✅ TypeScript compiles
- ✅ Linting passes
- ✅ Fast unit tests pass

---

### Stage 2: Pull Request (Pre-Merge)

**Goal**: Ensure code quality before merging  
**Speed**: < 5 minutes  
**Run**: Automatically on PR creation/update

#### Tests to Run

1. **Full Type Check**

   ```bash
   npx tsc --noEmit
   npm run check
   ```

2. **All Unit Tests**

   ```bash
   npm run test:unit:server
   ```

   - All pure function tests
   - All utility function tests
   - All composable logic tests

3. **Integration Tests**

   ```bash
   npm run test:integration  # (to be created)
   ```

   - Convex API path verification
   - Data transformation tests
   - Mock external API calls

4. **Build Verification**

   ```bash
   npm run build
   ```

   - Ensures production build succeeds
   - Catches build-time errors
   - Verifies static assets

5. **E2E Smoke Tests** (Critical Paths Only)

   ```bash
   npm run test:e2e:smoke  # (to be created)
   ```

   - Login flow
   - Inbox page loads
   - Critical user workflows

#### What NOT to Run

- ❌ Full E2E suite (too slow for PR)
- ❌ Performance tests (save for staging)
- ❌ Visual regression tests (manual review)

#### Exit Criteria

- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Build succeeds
- ✅ Smoke tests pass

---

### Stage 3: Pre-Deploy (Staging/Production)

**Goal**: Comprehensive validation before deployment  
**Speed**: < 15 minutes  
**Run**: Before deploying to staging/production

#### Tests to Run

1. **Full Test Suite**

   ```bash
   npm test  # Runs unit + E2E
   ```

2. **Complete E2E Tests**

   ```bash
   npm run test:e2e
   ```

   - All user workflows
   - Critical paths
   - Integration scenarios

3. **API Path Verification** (After Refactoring)

   ```bash
   npm run test:api-paths  # (to be created)
   ```

   - Verifies refactored API paths
   - Ensures internal references work
   - TypeScript compile-time checks

4. **Convex Function Validation**

   ```bash
   npx convex dev --once
   ```

   - Verifies Convex functions deploy
   - Checks for runtime errors
   - Validates schema

5. **Production Build Test**

   ```bash
   npm run build
   npm run preview
   ```

   - Full production build
   - Preview server test
   - Asset optimization

#### Exit Criteria

- ✅ All tests pass
- ✅ Convex functions deploy
- ✅ Production build succeeds
- ✅ No critical errors

---

## 🔄 Test Flows by Scenario

### Scenario 1: Code Changes (Feature/Bug Fix)

**Trigger**: Any code change

**Flow**:

```
1. Pre-Commit (Local)
   ├─ TypeScript check
   ├─ Linting
   └─ Fast unit tests

2. Pull Request
   ├─ Full type check
   ├─ All unit tests
   ├─ Integration tests
   ├─ Build verification
   └─ E2E smoke tests

3. Pre-Deploy
   ├─ Full test suite
   ├─ Complete E2E tests
   └─ Production build
```

### Scenario 2: API Refactoring (Naming Changes)

**Trigger**: File renames, API path changes

**Flow**:

```
1. Pre-Commit
   ├─ TypeScript check (verifies API paths)
   └─ API path verification test

2. Pull Request
   ├─ All above tests
   ├─ API integration tests
   └─ Convex function validation

3. Pre-Deploy
   ├─ Full test suite
   └─ Manual API path verification
```

**Specific Tests**:

- `tests/convex/api-naming.test.ts` - Verifies new API paths
- TypeScript compile-time checks (catches missing paths)
- Convex dev validation (ensures functions deploy)

### Scenario 3: Database Schema Changes

**Trigger**: Convex schema modifications

**Flow**:

```
1. Pre-Commit
   ├─ TypeScript check
   └─ Schema validation

2. Pull Request
   ├─ All above tests
   ├─ Migration tests (if applicable)
   └─ Convex schema validation

3. Pre-Deploy
   ├─ Full test suite
   ├─ Data migration verification
   └─ Staging deployment test
```

### Scenario 4: External API Integration Changes

**Trigger**: Readwise API, Resend, etc.

**Flow**:

```
1. Pre-Commit
   ├─ TypeScript check
   └─ Mock API tests

2. Pull Request
   ├─ All above tests
   ├─ Integration tests (mocked)
   └─ API contract tests

3. Pre-Deploy
   ├─ Full test suite
   ├─ Staging API integration test
   └─ Manual API verification
```

---

## 🧪 Test Categories & Execution

### Unit Tests (Fast: < 30s)

**Location**: `tests/convex/`, `tests/lib/`  
**Run**: Pre-commit, PR, Pre-deploy

**Examples**:

- `readwiseUtils.test.ts` - Pure function tests
- `api-naming.test.ts` - API path verification
- Utility function tests

**Command**:

```bash
npm run test:unit:server
```

### Integration Tests (Medium: < 2min)

**Location**: `tests/integration/` (to be created)  
**Run**: PR, Pre-deploy

**Examples**:

- Convex API path integration
- Data transformation workflows
- Mock external API calls

**Command**:

```bash
npm run test:integration  # (to be created)
```

### E2E Tests (Slow: < 10min)

**Location**: `e2e/`  
**Run**: Pre-deploy (full), PR (smoke only)

**Examples**:

- `inbox-sync.test.ts` - Complete sync workflow
- `auth.setup.ts` - Authentication flow
- Critical user paths

**Commands**:

```bash
npm run test:e2e          # Full suite
npm run test:e2e:smoke    # Critical paths only (to be created)
```

---

## 🚀 CI/CD Pipeline Structure

### GitHub Actions / CI Pipeline

```yaml
# .github/workflows/ci.yml (example structure)

name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  # Fast feedback job (runs first)
  quick-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test:unit:server

  # Full test suite (runs after quick checks pass)
  test-suite:
    needs: quick-checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit:server
      - run: npm run test:integration
      - run: npm run build
      - run: npm run test:e2e:smoke

  # Pre-deploy validation (runs before deployment)
  pre-deploy:
    needs: test-suite
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test # Full suite
      - run: npx convex dev --once
      - run: npm run build
```

---

## 📝 Test Execution Commands

### Development (Local)

```bash
# Quick check before committing
npm run check && npm run lint && npm run test:unit:server

# Full local test
npm test

# E2E tests only
npm run test:e2e
```

### CI/CD (Automated)

```bash
# Pre-commit hook (fast)
npm run check && npm run lint && npm run test:unit:server -- --run

# Pull Request (medium)
npm run test:unit:server && npm run test:integration && npm run build && npm run test:e2e:smoke

# Pre-deploy (comprehensive)
npm test && npx convex dev --once && npm run build
```

---

## 🎯 Test Coverage by Feature

### Authentication

- [ ] Login flow (E2E)
- [ ] Session persistence (E2E)
- [ ] Logout flow (E2E)
- [ ] Auth state management (Unit)

### Inbox

- [ ] Inbox page loads (E2E)
- [ ] Item filtering (Unit)
- [ ] Item selection (E2E)
- [ ] Detail view display (E2E)

### Readwise Sync

- [ ] Sync configuration UI (E2E)
- [ ] Sync workflow (E2E)
- [ ] Progress tracking (Integration)
- [ ] Data transformation (Unit)
- [ ] Author parsing (Unit) ✅ (exists)

### Flashcards

- [ ] Flashcard generation (E2E)
- [ ] Flashcard review (E2E)
- [ ] Review algorithm (Unit)

### API Refactoring (After Naming Changes)

- [ ] API path verification (Unit) - **TO CREATE**
- [ ] Internal reference validation (Integration)
- [ ] TypeScript compile-time checks (Pre-commit)

---

## 🔍 Test Verification Checklist

### After Refactoring (API Naming Changes)

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] API paths exist in generated types
- [ ] Internal references updated correctly
- [ ] Convex functions deploy (`npx convex dev --once`)
- [ ] No runtime errors in console

### Before Deployment

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Production build succeeds
- [ ] Convex functions deploy
- [ ] No TypeScript errors
- [ ] No linting errors

---

## 📊 Test Performance Targets

| Test Type         | Target Time | Current | Status |
| ----------------- | ----------- | ------- | ------ |
| TypeScript Check  | < 5s        | ~5s     | ✅     |
| Linting           | < 3s        | ~3s     | ✅     |
| Unit Tests        | < 30s       | ~10s    | ✅     |
| Integration Tests | < 2min      | TBD     | ⏳     |
| E2E Smoke         | < 5min      | ~3min   | ✅     |
| Full E2E          | < 10min     | ~8min   | ✅     |
| Full CI Pipeline  | < 15min     | TBD     | ⏳     |

---

## 🛠️ Test Infrastructure Setup

### Required Test Files (To Create)

1. **API Path Verification Test**
   - `tests/convex/api-naming.test.ts`
   - Verifies refactored API paths exist
   - TypeScript compile-time validation

2. **Integration Test Suite**
   - `tests/integration/` directory
   - Convex API integration tests
   - Mock external API tests

3. **E2E Smoke Test Suite**
   - `e2e/smoke/` directory
   - Critical path tests only
   - Fast execution for PR checks

### Test Utilities (To Create)

1. **Mock Convex Client**
   - `tests/utils/mockConvexClient.ts`
   - Reusable mock for integration tests

2. **Test Data Fixtures**
   - `tests/fixtures/` directory
   - Reusable test data

---

## 🚨 Failure Handling

### Test Failure Actions

1. **Pre-Commit Failure**
   - Block commit
   - Show error message
   - Suggest fix

2. **PR Failure**
   - Block merge
   - Post comment with failure details
   - Link to test logs

3. **Pre-Deploy Failure**
   - Block deployment
   - Alert team
   - Require manual approval after fix

### Test Flakiness

- **Retry Strategy**: Retry failed E2E tests once
- **Flaky Test Tracking**: Mark tests that fail > 10% of time
- **Test Stability**: Prioritize fixing flaky tests

---

## 📈 Continuous Improvement

### Metrics to Track

- Test execution time
- Test failure rate
- Flaky test frequency
- CI/CD pipeline duration
- Time to deployment

### Regular Reviews

- Monthly test suite review
- Remove obsolete tests
- Add tests for new bugs
- Optimize slow tests

---

## 🎓 Quick Reference

### Before Committing

```bash
npm run check && npm run lint && npm run test:unit:server -- --run
```

### Before Creating PR

```bash
npm run test:unit:server && npm run build
```

### Before Deploying

```bash
npm test && npx convex dev --once && npm run build
```

### After Refactoring

```bash
# Verify API paths
npx tsc --noEmit
npm run test:api-paths  # (to be created)

# Verify Convex functions
npx convex dev --once
```

---

## 📚 Related Documents

- `dev-docs/testing-strategy.md` - Overall testing philosophy
- `dev-docs/testing-priorities.md` - What to test first
- `dev-docs/testing-quick-reference.md` - Quick test commands
- `dev-docs/patterns-and-lessons.md` - API naming conventions

---

## ✅ Next Steps

1. **Create API Path Verification Test**
   - `tests/convex/api-naming.test.ts`
   - Verify refactored paths work

2. **Set Up Pre-Commit Hooks**
   - Install husky
   - Add pre-commit script

3. **Create CI/CD Pipeline**
   - GitHub Actions workflow
   - Automated test execution

4. **Add Integration Test Suite**
   - Mock Convex client
   - Integration test structure

5. **Create E2E Smoke Tests**
   - Critical path tests only
   - Fast execution for PRs

---

**Last Updated**: 2025-01-28  
**Maintained By**: Development Team  
**Review Frequency**: Monthly
