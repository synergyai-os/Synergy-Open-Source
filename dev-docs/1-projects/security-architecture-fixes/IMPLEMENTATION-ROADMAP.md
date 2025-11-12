# Security & Architecture Fixes - Implementation Roadmap

**Created**: 2025-11-12  
**Status**: 🔴 Critical - Start Immediately  
**Estimated Time**: 4 weeks  
**Owner**: Engineering Team

---

## 📊 Overview

This roadmap addresses 10 critical and important issues identified in the security audit of our multi-account authentication system.

**Priority Distribution**:
- 🔴 **Critical**: 2 issues (security vulnerabilities)
- 🟡 **Important**: 4 issues (architecture & documentation)
- 🟢 **Minor**: 4 issues (optimization & polish)

---

## 🗓️ Phase 1: Security Fixes (Week 1)

**Goal**: Eliminate critical security vulnerabilities before any production deployment.

### 1.1 Replace XOR with Web Crypto API ⏰ 2 days

**Issue**: `sessionStorage.ts` uses XOR "encryption" which provides zero security.

**Spec**: [01-web-crypto-implementation.md](./01-web-crypto-implementation.md)

**Files to Modify**:
- `src/lib/client/sessionStorage.ts` (complete rewrite of crypto functions)
- Add new: `src/lib/client/crypto.ts` (Web Crypto wrapper)
- Update: `src/lib/composables/useAuthSession.svelte.ts` (async crypto calls)

**Testing**:
- Unit tests for encryption/decryption
- E2E tests for session persistence
- Performance benchmarks (Web Crypto vs XOR)

**Acceptance Criteria**:
- [ ] All session data encrypted with AES-256-GCM
- [ ] PBKDF2 key derivation (100k iterations)
- [ ] IV randomness verified
- [ ] Backward compatibility (migrate existing sessions)
- [ ] No performance degradation (< 5ms overhead)

---

### 1.2 Add BFS Depth Limits ⏰ 1 day

**Issue**: Unbounded graph traversal in `linkExists()` allows DoS attacks.

**Spec**: [02-bfs-limits-implementation.md](./02-bfs-limits-implementation.md)

**Files to Modify**:
- `convex/users.ts` (add depth/account limits to BFS)
- `convex/schema.ts` (add validation to accountLinks)

**Testing**:
- Unit tests with circular links (A→B→C→A)
- Performance tests with 100 linked accounts
- Error handling tests (max depth exceeded)

**Acceptance Criteria**:
- [ ] MAX_LINK_DEPTH = 3 (hardcoded)
- [ ] MAX_TOTAL_ACCOUNTS = 10 (hardcoded)
- [ ] Clear error messages when limits exceeded
- [ ] Performance: O(1) for direct links, O(N) capped at 10
- [ ] Existing links unaffected (backward compatible)

---

### 1.3 Add Rate Limiting ⏰ 1 day

**Issue**: No rate limiting on `/auth/switch` endpoint.

**Spec**: [03-rate-limiting-implementation.md](./03-rate-limiting-implementation.md)

**Files to Modify**:
- Add new: `src/lib/server/middleware/rateLimit.ts`
- Update: `src/routes/auth/switch/+server.ts`
- Update: `src/routes/auth/login/+server.ts`
- Update: `src/routes/auth/register/+server.ts`

**Testing**:
- Load tests (100 requests/second)
- E2E tests (verify 429 responses)
- Redis integration tests (if using distributed rate limiting)

**Acceptance Criteria**:
- [ ] 10 account switches per minute per IP
- [ ] 5 login attempts per minute per IP
- [ ] 3 registration attempts per minute per IP
- [ ] Rate limit headers (X-RateLimit-*)
- [ ] Graceful degradation (in-memory fallback)

---

**Phase 1 Deliverables**:
- ✅ All critical security vulnerabilities fixed
- ✅ 100% test coverage for security-critical code
- ✅ Performance benchmarks documented
- ✅ Migration guide for existing users

---

## 🏗️ Phase 2: Architecture Refactor (Week 2)

**Goal**: Improve maintainability and scalability of auth system.

### 2.1 Refactor `session.ts` ⏰ 3 days

**Issue**: 324-line file mixes cookie management, encoding, establishment, and refresh.

**Spec**: [04-session-refactor.md](./04-session-refactor.md)

**New Structure**:
```
src/lib/server/auth/
├─ crypto.ts (unchanged)
├─ cookies/
│  ├─ encoding.ts      // encode/decode session cookies
│  ├─ management.ts    // set/delete cookies
│  └─ constants.ts     // cookie names, options
├─ sessions/
│  ├─ establishment.ts // establishSession
│  ├─ resolution.ts    // resolveRequestSession
│  └─ refresh.ts       // token refresh logic
└─ workos/
   ├─ client.ts        // WorkOS API wrapper
   ├─ authentication.ts // password auth
   └─ sessions.ts       // refresh/revoke
```

**Testing**:
- Unit tests for each module (80%+ coverage)
- Integration tests for session lifecycle
- Refactoring validation (no behavior changes)

**Acceptance Criteria**:
- [ ] No file > 150 lines
- [ ] Each module has single responsibility
- [ ] All existing tests pass (no regressions)
- [ ] Import paths updated across codebase
- [ ] JSDoc comments for all public functions

---

### 2.2 Optimize Convex Session Validation ⏰ 2 days

**Issue**: Missing index + inefficient query pattern + no caching.

**Spec**: [05-convex-optimization.md](./05-convex-optimization.md)

**Changes**:
1. Add index to `authSessions` table
2. Pass `sessionId` explicitly to `validateSession()`
3. Implement in-memory cache (Convex Durable Objects)
4. Update all 87 function calls

**Testing**:
- Load tests (1000 queries/second)
- Cache hit rate monitoring
- Database query profiling

**Acceptance Criteria**:
- [ ] Query time < 10ms (from ~50ms)
- [ ] Cache hit rate > 90% after warmup
- [ ] All 87 functions updated
- [ ] Zero downtime migration (deploy strategy)

---

### 2.3 Implement Audit Logging ⏰ 2 days

**Issue**: No audit trail for sensitive operations (account linking, switching).

**Spec**: [06-audit-logging.md](./06-audit-logging.md)

**New Schema**:
```typescript
auditLog: defineTable({
  userId: v.id('users'),
  action: v.string(),
  metadata: v.any(),
  ipAddress: v.string(),
  userAgent: v.string(),
  timestamp: v.number()
}).index('by_user_time', ['userId', 'timestamp'])
```

**Events to Log**:
- `account_linked`, `account_unlinked`
- `account_switched`
- `session_created`, `session_revoked`
- `login_failed`, `registration_failed`

**Testing**:
- Verify all events logged
- Query performance tests
- Retention policy tests (auto-delete after 90 days)

**Acceptance Criteria**:
- [ ] All sensitive operations logged
- [ ] Query API for audit reports
- [ ] 90-day retention (configurable)
- [ ] Export to CSV for compliance
- [ ] GDPR-compliant (user can request their logs)

---

**Phase 2 Deliverables**:
- ✅ Clean, maintainable codebase
- ✅ 10x faster session validation
- ✅ SOC 2 audit trail ready
- ✅ Architecture docs updated

---

## 📚 Phase 3: Documentation (Week 3)

**Goal**: Bring all documentation up to date with actual implementation.

### 3.1 Update Architecture Docs ⏰ 2 days

**Spec**: [07-documentation-updates.md](./07-documentation-updates.md)

**Files to Update**:
- `workos-convex-auth-architecture.md` (remove stale sections)
- `multi-session-architecture.md` (add security notes)
- `workos-headless-auth-security.md` (update with Phase 1 fixes)

**Changes**:
- Remove all "TODO", "⏳ Pending", "🟡 In Progress" markers
- Update status to "✅ Complete"
- Add "Last Validated" dates
- Update cookie names in all examples
- Remove references to deleted functions

**Acceptance Criteria**:
- [ ] No stale content (validation script passes)
- [ ] All code examples run without errors
- [ ] Mermaid diagrams render correctly
- [ ] Cross-references validated

---

### 3.2 Add Missing Mermaid Diagrams ⏰ 2 days

**Spec**: [08-mermaid-diagrams.md](./08-mermaid-diagrams.md)

**New Diagrams**:

1. **Account Linking Flow** (sequence diagram)
2. **Account Switching Flow** (sequence diagram)
3. **Multi-Session State** (ERD)
4. **BFS Traversal** (graph diagram)

**Files to Update**:
- `multi-session-architecture.md` (add diagrams 1-4)
- `workos-convex-auth-architecture.md` (update existing diagram)

**Acceptance Criteria**:
- [ ] All diagrams render in GitHub
- [ ] Diagrams match actual implementation
- [ ] Diagrams exported as PNG for presentations

---

### 3.3 Document Test Strategy ⏰ 1 day

**Spec**: [09-test-strategy.md](./09-test-strategy.md)

**New Document**: `dev-docs/2-areas/testing-strategy.md`

**Contents**:
- Unit test strategy (Vitest)
- Integration test strategy (Playwright)
- E2E test strategy (auth flows)
- Coverage targets (80% unit, 90% E2E for auth)
- CI/CD integration
- Performance benchmarks

**Acceptance Criteria**:
- [ ] Coverage targets documented
- [ ] Test commands in README
- [ ] CI pipeline configured
- [ ] Pre-commit hooks enabled

---

**Phase 3 Deliverables**:
- ✅ Documentation 100% accurate
- ✅ Compliance-ready diagrams
- ✅ Clear testing guidelines
- ✅ Onboarding guide for new developers

---

## ⚡ Phase 4: Optimization (Week 4)

**Goal**: Polish and optimize for production scale.

### 4.1 Implement Session Caching ⏰ 2 days

**Spec**: [10-session-caching.md](./10-session-caching.md)

**Approach**: Use Convex in-memory cache for hot sessions

**Acceptance Criteria**:
- [ ] Cache hit rate > 90%
- [ ] TTL = 5 minutes (configurable)
- [ ] Automatic cache invalidation on logout
- [ ] Metrics dashboard (cache hits/misses)

---

### 4.2 Optimize Session Refresh ⏰ 1 day

**Spec**: [11-session-refresh-optimization.md](./11-session-refresh-optimization.md)

**Current**: Refresh at 1 minute before expiry (too late)  
**New**: Sliding window (refresh at 50% of TTL)

**Acceptance Criteria**:
- [ ] Smooth token rotation
- [ ] No user-visible "refresh" delays
- [ ] Configurable refresh threshold

---

### 4.3 Add Health Checks ⏰ 1 day

**Spec**: [12-health-checks.md](./12-health-checks.md)

**New Endpoints**:
- `/health` (basic)
- `/health/detailed` (with component status)

**Acceptance Criteria**:
- [ ] Monitors WorkOS connectivity
- [ ] Monitors Convex connectivity
- [ ] Reports active session count
- [ ] Integrates with monitoring (Datadog, etc.)

---

### 4.4 Circuit Breaker for WorkOS ⏰ 1 day

**Spec**: [13-circuit-breaker.md](./13-circuit-breaker.md)

**Approach**: Graceful degradation when WorkOS is down

**Acceptance Criteria**:
- [ ] Automatic retry with exponential backoff
- [ ] Circuit opens after 5 consecutive failures
- [ ] Resets after 30 seconds
- [ ] Alerts on circuit open

---

**Phase 4 Deliverables**:
- ✅ 10x performance improvement
- ✅ Resilient to external service failures
- ✅ Production monitoring ready
- ✅ Zero-downtime deployments

---

## 📈 Success Metrics

### Security
- ✅ Zero critical vulnerabilities (from 2)
- ✅ SOC 2 audit trail complete
- ✅ OWASP Top 10 compliance

### Performance
- ✅ Session validation < 10ms (from ~50ms)
- ✅ Account switching < 200ms (from ~500ms)
- ✅ 99.9% uptime for auth endpoints

### Quality
- ✅ 80%+ unit test coverage
- ✅ 90%+ E2E coverage for auth flows
- ✅ Zero documentation debt
- ✅ All files < 200 lines

### Maintainability
- ✅ Clear separation of concerns
- ✅ New developer onboarding < 1 day
- ✅ Bug fix time < 2 hours (avg)

---

## 🚦 Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-12 | Use Web Crypto API over library | Native browser API, no dependencies |
| 2025-11-12 | BFS depth limit = 3 | Matches Slack's implementation |
| 2025-11-12 | In-memory cache over Redis | Simpler, Convex supports it natively |
| 2025-11-12 | 90-day audit log retention | Balance compliance vs storage costs |

---

## 🔗 Related Documents

- [Security Audit Report](../SECURITY-AUDIT-2025-11-12.md)
- [Architecture Overview](../../2-areas/architecture.md)
- [WorkOS Auth Architecture](../../2-areas/workos-convex-auth-architecture.md)
- [Multi-Session Architecture](../../2-areas/multi-session-architecture.md)
- [Patterns Index](../../2-areas/patterns/INDEX.md)

---

**Next Steps**: Review this roadmap with the team, then proceed to Phase 1.1.

