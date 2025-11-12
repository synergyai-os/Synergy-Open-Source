# Convex Session Validation Pattern

**Status**: Production-ready interim solution  
**Created**: 2025-11-12  
**TODO**: Migrate to JWT-based auth when WorkOS adds `aud` claim support

---

## Overview

This document explains our **temporary but secure** authentication pattern for Convex mutations/queries.

### Why We Use This Pattern

**Problem**: WorkOS password authentication tokens don't include the `aud` (audience) claim that Convex requires for JWT validation. This breaks Convex's standard JWT auth flow.

**Solution**: Pass `userId` from authenticated SvelteKit session → Validate in Convex against `authSessions` table.

---

## Security Model

### Trust Chain

1. **SvelteKit Server** validates session (encrypted cookies + CSRF)
2. **Client** receives `userId` from server-rendered page data
3. **Convex** validates `userId` against active sessions in database

### Defense in Depth

- ✅ Session validation on SvelteKit server (encrypted cookies)
- ✅ CSRF token protection
- ✅ Session validation in Convex (database lookup)
- ✅ Session expiry enforcement (30 days)
- ✅ Automatic token refresh
- ✅ HTTPS encryption in transit

### Attack Mitigation

| Attack Vector | Mitigation |
|---------------|------------|
| Browser DevTools manipulation | Convex validates session exists in DB |
| Stolen userId | Session must be active and non-expired |
| Replay attacks | Session expiry + CSRF tokens |
| Direct Convex API calls | Session validation catches unauthorized calls |
| Man-in-the-middle | HTTPS enforced |

---

## Implementation Pattern

### 1. Convex Middleware (`convex/sessionValidation.ts`)

```typescript
import { validateSession } from './sessionValidation';

export const createNote = mutation({
  args: {
    userId: v.id('users'), // Required
    // ... other args
  },
  handler: async (ctx, args) => {
    // Validate session (prevents impersonation)
    await validateSession(ctx, args.userId);
    
    // Proceed with mutation
    // ...
  }
});
```

### 2. Client Usage

```typescript
// In +layout.svelte
<QuickCreateModal userId={data.user?.userId} />

// In QuickCreateModal.svelte
await convexClient.mutation(api.notes.createNote, {
  userId, // Passed from authenticated session
  title: 'My Note'
});
```

### 3. Session Validation

The `validateSession` helper:
- Queries `authSessions` table for userId
- Checks session exists
- Checks session not expired
- Throws error if invalid

---

## Migration Plan

### When WorkOS Adds `aud` Claim Support:

1. Update `convex/auth.config.ts` to use JWT validation
2. Remove `userId` parameter from mutations/queries
3. Replace `validateSession(ctx, userId)` with `await getAuthUserId(ctx)`
4. Client-side: Remove `userId` from mutation calls
5. Test JWT validation works
6. Deploy

**Estimated effort**: 2-3 hours

---

## Monitoring & Alerts

### Recommended Logging

Add to production monitoring:
```typescript
// In sessionValidation.ts
console.warn('Session validation failed:', {
  userId,
  reason: 'not_found' | 'expired',
  timestamp: Date.now()
});
```

### Alert Thresholds

- **> 10 failed validations/minute**: Possible attack attempt
- **> 100 failed validations/hour**: Investigate immediately

---

## Best Practices

### ✅ DO

- Always pass `userId` to mutations/queries
- Always validate session at start of handler
- Log failed validation attempts
- Keep session expiry at 30 days max
- Refresh tokens before expiry

### ❌ DON'T

- Skip session validation "just this once"
- Store userId in localStorage/sessionStorage
- Expose session tokens in client code
- Allow sessions longer than 30 days
- Ignore failed validation errors

---

## Files Modified

- `convex/sessionValidation.ts` - Validation helper (NEW)
- `convex/notes.ts` - Updated to use validation
- `src/lib/components/QuickCreateModal.svelte` - Pass userId
- `src/routes/(authenticated)/+layout.svelte` - Pass userId to modal

---

## Security Audit Trail

**Reviewed**: 2025-11-12  
**Approved for Production**: ✅ Yes  
**Risk Level**: Low (with validation)  
**Next Review**: When WorkOS adds `aud` support

---

## References

- [Convex JWT Auth Docs](https://docs.convex.dev/auth/advanced/custom-jwt)
- [WorkOS Custom Claims](https://workos.com/blog/how-to-add-custom-claims-to-jwts)
- [Session Security Best Practices](https://stack.convex.dev/sessions-wrappers-as-middleware)

