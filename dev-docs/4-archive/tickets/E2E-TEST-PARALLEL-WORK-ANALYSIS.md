# E2E Test Parallel Work Analysis

## Test Setup Configuration

### Current Test Execution Model

**Playwright Configuration** (`playwright.config.ts`):

- `fullyParallel: true` - All test files run in parallel
- **Local**: 7 workers (CPU cores, `workers: undefined`)
- **CI**: 1 worker (sequential, `workers: process.env.CI ? 1 : undefined`)
- **Shared Auth State**: All tests use `e2e/.auth/user.json` from setup project
- **Single Dev Server**: One instance shared by all tests (`webServer.reuseExistingServer: !process.env.CI`)

**Environment Variables**:

- `E2E_TEST_MODE=true` set via npm script: `E2E_TEST_MODE=true playwright test`
- Passed to dev server via `webServer.env.E2E_TEST_MODE`
- **ISSUE**: SvelteKit reads from `$env/dynamic/private` which might not load `process.env` correctly

**Test Isolation**:

- ✅ **Auth State**: Shared but read-only (setup project creates it)
- ⚠️ **Rate Limiting**: Shared storage (tests might interfere)
- ⚠️ **Database**: Shared Convex database (tests might create conflicting data)
- ⚠️ **Dev Server**: Single instance (all tests share same server state)

## Issues Found in Test Configuration

### 1. E2E_TEST_MODE Not Loading Correctly

**Problem**: `src/routes/test/get-verification-code/+server.ts:19`

```typescript
const e2eTestMode = env.E2E_TEST_MODE || process.env.E2E_TEST_MODE;
```

**Root Cause**:

- `$env/dynamic/private` might not load environment variables from `webServer.env`
- Fallback to `process.env` might not work in SvelteKit server context
- Environment variable is set in `playwright.config.ts` webServer but SvelteKit might not see it

**Fix Needed**: Ensure `E2E_TEST_MODE` is properly loaded in SvelteKit server context

### 2. Password Reset Error Handling

**Problem**: Returns 500 instead of 400 for invalid tokens

**Root Cause** (`src/routes/auth/reset-password/+server.ts:42-77`):

- WorkOS errors might not match string checks (`includes('400')`, `includes('invalid')`)
- Generic catch-all returns 500 for unmatched errors
- Need to check WorkOS error structure/type

**Fix Needed**: Improve error parsing to catch WorkOS API errors correctly

### 3. CSRF Validation Bypass

**Problem**: Logout accepts requests without CSRF token (returns 200 instead of 400/403)

**Root Cause** (`src/routes/logout/+server.ts:45-52`):

- CSRF check happens AFTER session validation
- If session cookie is missing, early return happens before CSRF check
- Test uses `page.request.post()` which might auto-include CSRF header from cookies

**Fix Needed**: Ensure CSRF validation runs early, or test explicitly excludes CSRF token

### 4. Rate Limiting Test Interference

**Problem**: Rate limits trigger too early or are shared across endpoints

**Root Cause**:

- Rate limiting uses shared storage (likely Convex or in-memory)
- Tests run in parallel and might share rate limit buckets
- Need test isolation for rate limit storage

**Fix Needed**: Reset rate limits between tests or use isolated storage per test

## Parallel Work Analysis (Can 10-12 Agents Work Simultaneously?)

### File Conflict Matrix

| Ticket                          | Files Touched                                                                                    | Conflicts With              |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| **SYOS-150** (CSRF logout)      | `src/routes/logout/+server.ts`                                                                   | ⚠️ **SYOS-153** (same file) |
| **SYOS-151** (Password reset)   | `src/routes/auth/reset-password/+server.ts`                                                      | ✅ None                     |
| **SYOS-152** (Test helper)      | `src/routes/test/get-verification-code/+server.ts`, `playwright.config.ts`                       | ✅ None                     |
| **SYOS-153** (Multi-tab logout) | `src/routes/logout/+server.ts`                                                                   | ⚠️ **SYOS-150** (same file) |
| **SYOS-154** (Rate limiting)    | `src/lib/server/middleware/rateLimit.ts`, test files                                             | ✅ None (different files)   |
| **SYOS-156** (Quick Create)     | `src/lib/components/QuickCreateModal.svelte`, `src/lib/composables/useGlobalShortcuts.svelte.ts` | ✅ None                     |
| **SYOS-157** (Flashcards)       | Flashcard routes/components                                                                      | ✅ None                     |
| **SYOS-158** (Inbox/Settings)   | Inbox/settings routes/components                                                                 | ✅ None                     |

### Parallel Work Recommendations

#### ✅ **CAN WORK IN PARALLEL** (7 tickets):

1. **SYOS-151** - Password reset (isolated file)
2. **SYOS-152** - Test helper (isolated file + config)
3. **SYOS-154** - Rate limiting (isolated middleware)
4. **SYOS-156** - Quick Create (isolated components)
5. **SYOS-157** - Flashcards (isolated routes)
6. **SYOS-158** - Inbox/Settings (isolated routes)

#### ⚠️ **MUST COORDINATE** (2 tickets):

1. **SYOS-150** (CSRF logout) + **SYOS-153** (Multi-tab logout)
   - **Both touch**: `src/routes/logout/+server.ts`
   - **Solution**:
     - Option A: One agent works on both (they're related)
     - Option B: Split file into separate functions (CSRF validation vs multi-tab handling)
     - Option C: Work sequentially (SYOS-150 first, then SYOS-153)

### Recommended Parallel Work Strategy

**Phase 1 - Independent Work (6 agents)**:

- Agent 1: SYOS-151 (Password reset)
- Agent 2: SYOS-152 (Test helper) ⚠️ **Must complete first** (blocks registration tests)
- Agent 3: SYOS-154 (Rate limiting)
- Agent 4: SYOS-156 (Quick Create)
- Agent 5: SYOS-157 (Flashcards)
- Agent 6: SYOS-158 (Inbox/Settings)

**Phase 2 - Coordinated Work (1-2 agents)**:

- Agent 7: SYOS-150 + SYOS-153 (Logout fixes - same file, related functionality)
  - OR: Agent 7: SYOS-150, Agent 8: SYOS-153 (if file can be split)

## Test Configuration Fixes Needed

### 1. Fix E2E_TEST_MODE Loading

**File**: `src/routes/test/get-verification-code/+server.ts`

**Current**:

```typescript
const e2eTestMode = env.E2E_TEST_MODE || process.env.E2E_TEST_MODE;
```

**Fix Options**:

- Option A: Ensure `webServer.env` variables are accessible in SvelteKit
- Option B: Use `.env.test` file that SvelteKit can read
- Option C: Pass via different mechanism (query param, header, etc.)

### 2. Improve Password Reset Error Handling

**File**: `src/routes/auth/reset-password/+server.ts`

**Current**: Generic catch-all returns 500

**Fix**: Check WorkOS error structure and map to appropriate HTTP status codes

### 3. Fix CSRF Validation Order

**File**: `src/routes/logout/+server.ts`

**Current**: CSRF check after session validation

**Fix**: Move CSRF check before session validation, or ensure test doesn't auto-include CSRF token

### 4. Add Rate Limit Test Isolation

**File**: `src/lib/server/middleware/rateLimit.ts` + test files

**Fix**: Reset rate limits between tests or use isolated storage per test worker

## Summary

**Can 10-12 agents work in parallel?**

- ✅ **YES** - 6 tickets can work independently
- ⚠️ **PARTIALLY** - 2 tickets share same file (need coordination)
- **Recommendation**: 6-7 agents can work in parallel, with 1-2 agents coordinating on logout fixes

**Test Configuration Issues**:

1. E2E_TEST_MODE not loading correctly
2. Password reset error handling too generic
3. CSRF validation order/behavior
4. Rate limiting test isolation needed
