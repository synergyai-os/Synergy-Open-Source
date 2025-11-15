# E2E Authentication Testing Strategy

**Issue**: SYOS-185  
**Date**: 2025-11-15  
**Status**: ✅ Implemented

---

## Problem

E2E tests were failing with WorkOS SSO enforcement error:

```json
{
  "error": "sso_required",
  "email": "test@example.com",
  "error_description": "User must authenticate using one of the matching connections.",
  "connection_ids": ["conn_01K9KZHHQT3QQBBSZ4S2GAET7K"]
}
```

### Root Causes

1. **Test accounts linked to SSO**: Test users in WorkOS Dashboard were configured to require SSO connections
2. **Password auth blocked**: `auth.setup.ts` uses password authentication (`grant_type: 'password'`)
3. **WorkOS enforcement**: WorkOS rejects password auth for SSO-enabled accounts

### Impact

- ❌ 8 E2E tests failing
- ❌ Cannot authenticate in test environment
- ❌ Blocks validation of authentication flows
- ❌ Blocks parent ticket SYOS-160 (session persistence)

---

## Solution: Non-SSO Test Account

**Implemented**: Option 3+ (Enhanced Non-SSO Test Account)

### Why This Solution?

1. **Speed**: ⚡ 30 minutes vs 1-2 hours for Test IdP setup
2. **Simplicity**: 🎯 No code changes, only environment variables
3. **Coverage**: ✅ Tests real WorkOS authentication (password flow is valid!)
4. **Risk**: 🛡️ Low risk, easy to pivot if needed
5. **Future-proof**: 🚀 Can add SSO tests later as separate suite

### Architecture Decision

**Password authentication IS a valid production flow**:
- Self-hosted deployments
- Solo users without organizations
- Early adopters before SSO setup
- Admin/emergency access accounts

**SSO testing can be separate**:
- Create dedicated `e2e/auth-sso.test.ts` suite
- Use WorkOS Test Identity Provider
- Test SSO-specific scenarios (connection routing, org selection, etc.)
- Keep password auth tests working independently

---

## Implementation Details

### Test User Configuration

**Location**: WorkOS Dashboard → User Management → Users

**Test User**:
```
Email: e2e-test@synergyos-testing.com
Password: [Stored in password manager]
Email Verified: ✅ Yes (critical - skip email verification)
Organization: None (or non-SSO org)
SSO Connections: None (critical - must not be linked)
```

**Why this domain?**:
- Not linked to any SSO connections
- Not a real user domain (avoids conflicts)
- Clear naming convention for test accounts

### Environment Variables

**`.env.test`** (local only, gitignored):
```bash
TEST_USER_EMAIL=e2e-test@synergyos-testing.com
TEST_USER_PASSWORD=<secure-password>
E2E_TEST_MODE=true
```

**GitHub Secrets** (for CI, when enabled):
```bash
TEST_USER_EMAIL=e2e-test@synergyos-testing.com
TEST_USER_PASSWORD=<secure-password>
```

### Authentication Flow

```
Test → /auth/login → WorkOS Password Auth → Session → user.json
```

**Code path**:
1. `e2e/auth.setup.ts` → Reads TEST_USER_EMAIL/PASSWORD from `.env.test`
2. `POST /auth/login` → Calls `authenticateWithPassword()`
3. `src/lib/server/auth/workos.ts` → WorkOS API `grant_type: 'password'`
4. WorkOS validates → Returns access_token, refresh_token, user
5. `establishSession()` → Creates Convex session
6. Playwright saves → `e2e/.auth/user.json`

**No SSO enforcement** because test user is not linked to SSO connections.

---

## Testing

### Local Testing

```bash
# 1. Clean auth state
rm -rf e2e/.auth/user.json

# 2. Test authentication
npx playwright test e2e/auth.setup.ts

# Expected output:
# ✅ Authentication successful
# ✅ Session verified
# 💾 Saved auth state to e2e/.auth/user.json

# 3. Run full test suite
npm run test:e2e
```

### CI Testing (When Enabled)

**Current Status**: E2E tests commented out in `.github/workflows/quality-gates.yml` (lines 87-109)

**To enable**:
1. Add `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` to GitHub Secrets
2. Uncomment E2E test job in `quality-gates.yml`
3. Add Convex and WorkOS environment variables to CI
4. Run test pipeline

---

## Future: SSO Testing

When SSO testing is needed, create a separate test suite:

### Option 1: WorkOS Test Identity Provider

**Setup**:
1. Configure Test IdP in WorkOS Dashboard
2. Create test organization with `example.com` domain
3. Link organization to Test IdP connection
4. Create SSO-specific test user

**Test Suite**: `e2e/auth-sso.test.ts`

**Test Scenarios**:
- SSO login flow with Test IdP
- Organization selection
- Connection routing
- SSO enforcement validation
- Multi-org scenarios

**Documentation**: [WorkOS Test SSO Docs](https://workos.com/docs/sso/test-sso/testing-with-the-test-identity-provider)

### Option 2: Mock SSO Flow

**Setup**:
1. Create mock SSO endpoint in test mode
2. Bypass WorkOS SSO enforcement
3. Return synthetic auth response

**Why skip this**: Doesn't test real SSO flow, creates maintenance burden.

---

## Success Metrics

- ✅ **Test account created**: Non-SSO user in WorkOS
- ✅ **Authentication works**: `auth.setup.ts` completes successfully
- ✅ **Session persists**: `user.json` created with valid cookies
- ✅ **Tests pass**: All 8 previously failing tests now pass
- ✅ **No SSO errors**: No "sso_required" errors in test output
- ✅ **Documentation updated**: Clear setup instructions in `e2e/README.md`

---

## Maintenance

### Rotating Test Credentials

**When to rotate**:
- Security policy (e.g., every 90 days)
- Credential leak or exposure
- WorkOS user deletion/recreation

**How to rotate**:
1. Generate new password in WorkOS Dashboard
2. Update password manager
3. Update `.env.test` locally
4. Update GitHub Secrets (if CI enabled)
5. Notify team members

### Test User Lifecycle

**Monitor**:
- User still exists in WorkOS
- Email still verified
- No SSO connections linked
- Password still valid

**If user deleted**: Follow "Test User Setup" in `e2e/README.md` to recreate.

---

## Related Documentation

- **E2E README**: `e2e/README.md` - User-facing setup guide
- **Auth Architecture**: `dev-docs/2-areas/architecture/auth/workos-convex-auth-architecture.md`
- **WorkOS Integration**: `src/lib/server/auth/workos.ts` - Password authentication
- **Session Management**: `src/lib/server/auth/session.ts` - Session establishment
- **Playwright Config**: `playwright.config.ts` - Test projects and setup

---

## Troubleshooting

### "sso_required" Error Returns

**Symptom**: Test user suddenly fails with SSO enforcement.

**Causes**:
1. Test user was linked to an SSO-enabled organization
2. WorkOS organization settings changed
3. Email domain was linked to SSO connection

**Solution**:
1. Check WorkOS Dashboard → User Management → find test user
2. Check "Organizations" tab → ensure no SSO orgs linked
3. If linked: Remove from organization or create new test user
4. Update `.env.test` with new credentials

### Authentication Timing Out

**Symptom**: `auth.setup.ts` times out waiting for login.

**Causes**:
1. Dev server not running
2. WorkOS API slow/down
3. Network issues

**Solution**:
1. Verify dev server: `curl http://localhost:5173`
2. Check WorkOS status: https://status.workos.com
3. Increase timeout in `auth.setup.ts` (currently 15s)

### Session Not Persisting

**Symptom**: Tests fail with "not authenticated" after `auth.setup.ts` succeeds.

**Causes**:
1. Cookie settings incorrect
2. Session TTL expired
3. Convex session not created

**Solution**:
1. Check `e2e/.auth/user.json` exists and has cookies
2. Check Convex Dashboard → Data → authSessions table
3. Verify session expiry: Should be 30 days from creation
4. Re-run `auth.setup.ts` to create fresh session

---

## Decision Log

### Why Not Use SSO Test IdP?

**Considered**: WorkOS Test Identity Provider (Option 1 from SYOS-185)

**Decided Against** (for now):
- ⏰ Time: 1-2 hours setup vs 30 minutes
- 🔧 Complexity: Requires WorkOS Dashboard configuration
- 📚 Maintenance: More moving parts to maintain
- 🎯 Coverage: Password auth is valid production flow

**Can Add Later**: SSO testing as separate suite when needed.

### Why Not Mock WorkOS?

**Considered**: Bypass WorkOS in test mode (Option 2 from SYOS-185)

**Decided Against**:
- ❌ Doesn't test real authentication
- ❌ Creates maintenance burden (mocks diverge from reality)
- ❌ False confidence (tests pass but prod could fail)
- ❌ More code to maintain

### Why Not Keep SSO Test User?

**Considered**: Fix existing test user's SSO configuration

**Decided Against**:
- ❌ Requires unlinking from SSO (affects other tests)
- ❌ Risk of re-linking (fragile setup)
- ❌ Doesn't teach us about SSO testing (hides the problem)

---

## References

- **Issue**: [SYOS-185](https://linear.app/younghumanclub/issue/SYOS-185)
- **Parent Issue**: [SYOS-160](https://linear.app/younghumanclub/issue/SYOS-160)
- **WorkOS Docs**: https://workos.com/docs/user-management/authenticate-users/password-auth
- **Playwright Auth**: https://playwright.dev/docs/auth
- **WorkOS Test SSO**: https://workos.com/docs/sso/test-sso/testing-with-the-test-identity-provider

---

**Last Updated**: 2025-11-15  
**Next Review**: When implementing SSO testing (separate ticket)

