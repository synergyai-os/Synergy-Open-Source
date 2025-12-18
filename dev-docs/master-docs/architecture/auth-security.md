# Authentication & Session Security Architecture

**Last Updated**: 2024-12-17  
**Status**: Production  
**Security Level**: Critical

---

## Overview

SynergyOS uses **WorkOS AuthKit** for authentication with a custom session management layer built on top. This document describes the security model and explains why user spoofing is not possible.

### Tech Stack

| Component | Technology |
|-----------|------------|
| Identity Provider | WorkOS User Management |
| Session Storage | Convex (authSessions table) |
| Session Cookies | HMAC-SHA256 signed cookies |
| Access Token Encryption | AES-256-GCM |
| CSRF Protection | Random tokens with hash verification |

---

## Security Model

### Defense in Depth

Authentication is validated at **multiple layers**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Request                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Cookie Signature Validation (SvelteKit)               │
│  ─────────────────────────────────────────────────────────────  │
│  • Cookie format: sessionId.signature                           │
│  • HMAC-SHA256 signature computed with SYOS_SESSION_SECRET      │
│  • Timing-safe comparison prevents timing attacks               │
│  • Invalid signature → rejected immediately                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: Session Existence Check (Convex)                      │
│  ─────────────────────────────────────────────────────────────  │
│  • Session must exist in authSessions table                     │
│  • Session must have isValid: true                              │
│  • Session must not be expired (expiresAt > now)                │
│  • Session must not be revoked (revokedAt check)                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: User ID Derivation (Server-side only)                 │
│  ─────────────────────────────────────────────────────────────  │
│  • userId is NEVER trusted from client                          │
│  • userId is derived from validated session record              │
│  • All Convex functions use sessionId parameter                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cookie Security

### Session Cookie (`syos_session`)

```typescript
// Format: sessionId.signature
// Example: abc123def456.hmac_signature_here

const sessionCookieOptions = {
  path: '/',
  httpOnly: true,      // ✅ Prevents JavaScript access
  secure: true,        // ✅ HTTPS only in production
  sameSite: 'lax',     // ✅ CSRF protection
  maxAge: 30 * 24 * 60 * 60  // 30 days
};
```

### CSRF Cookie (`syos_csrf`)

```typescript
const csrfCookieOptions = {
  path: '/',
  httpOnly: false,     // Readable by JS (needed for fetch headers)
  secure: true,        // HTTPS only in production
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60
};
```

---

## Cryptographic Operations

### Session ID Generation

```typescript
// 24 bytes = 192 bits of entropy
// Collision probability: ~1 in 2^96 (birthday paradox)
function generateSessionId(): string {
  return crypto.randomBytes(24).toString('base64url');
}
```

### Cookie Signing (HMAC-SHA256)

```typescript
// Key derivation from master secret
const HMAC_KEY = crypto.createHash('sha512')
  .update(`${SESSION_SECRET}:hmac`)
  .digest();

// Signing
function signValue(value: string): string {
  return crypto.createHmac('sha256', HMAC_KEY)
    .update(value)
    .digest('base64url');
}

// Verification with timing-safe comparison
function verifySignature(value: string, signature: string): boolean {
  const expected = signValue(value);
  const expectedBuffer = Buffer.from(expected);
  const givenBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== givenBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, givenBuffer);
}
```

### Access Token Encryption (AES-256-GCM)

WorkOS access and refresh tokens are encrypted at rest:

```typescript
// Key derivation
const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(`${SESSION_SECRET}:encryption`)
  .digest();

// Encryption with authenticated encryption (AES-GCM)
function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(12);  // GCM recommended IV length
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}
```

---

## Attack Resistance

### Attack: User Spoofing (Knowing username + userId)

**Result: BLOCKED**

Even if an attacker knows a user's username, email, and internal userId:

1. They cannot forge a valid cookie signature without `SYOS_SESSION_SECRET`
2. Session IDs are 192-bit random values (unguessable)
3. Even if they somehow created a cookie, the sessionId must exist in Convex

### Attack: Cookie Theft via XSS

**Result: MITIGATED**

- `httpOnly: true` prevents JavaScript from reading the session cookie
- XSS attacks cannot steal session cookies directly
- Additional mitigation: Content Security Policy headers (recommended)

### Attack: Cookie Theft via Network Interception

**Result: BLOCKED (Production)**

- `secure: true` ensures cookies only sent over HTTPS
- MITM attacks cannot intercept cookies on encrypted connections

### Attack: CSRF (Cross-Site Request Forgery)

**Result: MITIGATED**

- `sameSite: 'lax'` prevents cross-site cookie sending
- Separate CSRF token required for state-changing operations
- CSRF token is hashed in database (not stored plaintext)

### Attack: Timing Attacks

**Result: BLOCKED**

- `crypto.timingSafeEqual()` used for all signature comparisons
- Constant-time comparison prevents timing-based signature guessing

### Attack: Session Fixation

**Result: BLOCKED**

- New session ID generated on login
- Session ID rotated on token refresh
- Old sessions are invalidated

### Attack: Brute Force Session ID Guessing

**Result: IMPRACTICAL**

- 192 bits of entropy (24 random bytes)
- Even at 1 billion guesses/second: ~10^48 years to find valid session
- Rate limiting provides additional protection

---

## Session Lifecycle

### Creation (Login)

```
User → WorkOS Auth → SvelteKit Callback
                          │
                          ▼
                    ┌─────────────┐
                    │ Generate:   │
                    │ • sessionId │
                    │ • csrfToken │
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │ Store in    │
                    │ Convex:     │
                    │ authSessions│
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │ Set signed  │
                    │ cookie      │
                    └─────────────┘
```

### Validation (Each Request)

```
Request with cookie
        │
        ▼
┌───────────────────┐
│ Decode cookie     │──Invalid──→ Clear cookies, redirect to login
│ Verify signature  │
└───────────────────┘
        │ Valid
        ▼
┌───────────────────┐
│ Query Convex for  │──Not found──→ Clear cookies, redirect to login
│ session record    │
└───────────────────┘
        │ Found
        ▼
┌───────────────────┐
│ Check expiration  │──Expired──→ Invalidate, clear, redirect
│ Check revocation  │
└───────────────────┘
        │ Valid
        ▼
┌───────────────────┐
│ Check token       │──Near expiry──→ Refresh with WorkOS
│ refresh needed    │                  Generate new sessionId
└───────────────────┘
        │
        ▼
   Request proceeds
```

### Termination (Logout)

```
Logout request
      │
      ▼
┌─────────────────┐
│ Mark session    │
│ isValid: false  │
│ revokedAt: now  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Clear cookies   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Revoke WorkOS   │
│ session         │
└─────────────────┘
```

---

## Convex Integration

### Session Validation Pattern

All authenticated Convex functions use the `sessionId` pattern:

```typescript
// ✅ SECURE: sessionId-based authentication
export const myQuery = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    // userId is derived server-side from validated session
    const { userId, session } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // Now use userId safely - it's NOT from client input
    return await ctx.db.query('items')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
  }
});

// ❌ INSECURE: Never trust client-provided userId
export const badQuery = query({
  args: { userId: v.id('users') },  // WRONG!
  handler: async (ctx, args) => {
    // Attacker can pass any userId they want
  }
});
```

### WorkOS JWT Configuration

Convex is configured to validate WorkOS JWTs for the real-time connection:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      type: 'customJwt',
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
      applicationID: clientId
    }
  ]
} satisfies AuthConfig;
```

**Note**: This configuration allows Convex to validate WorkOS-issued JWTs. The session-based pattern (`sessionId` + `validateSessionAndGetUserId`) provides an additional layer of validation and enables server-side session management features like:
- Session revocation
- Session listing (see all active sessions)
- IP/User-Agent tracking
- Forced logout

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `SYOS_SESSION_SECRET` | Master secret for HMAC signing and AES encryption | ✅ Yes |
| `WORKOS_CLIENT_ID` | WorkOS application client ID | ✅ Yes |
| `WORKOS_API_KEY` | WorkOS API key for user management | ✅ Yes |
| `SYOS_SESSION_TTL_DAYS` | Session lifetime in days (default: 30) | No |

### Secret Requirements

`SYOS_SESSION_SECRET` should be:
- At least 32 characters
- Cryptographically random
- Unique per environment (dev/staging/prod)
- Never committed to version control

Generate with:
```bash
openssl rand -base64 48
```

---

## Security Checklist

| Control | Status | Implementation |
|---------|--------|----------------|
| Session cookie signed (HMAC-SHA256) | ✅ | `src/lib/infrastructure/auth/server/crypto.ts` |
| Timing-safe signature comparison | ✅ | `crypto.timingSafeEqual()` |
| HttpOnly session cookies | ✅ | `sessionCookieOptions.httpOnly = true` |
| Secure cookies (production) | ✅ | `sessionCookieOptions.secure = true` |
| SameSite=Lax | ✅ | Cookie options |
| Server-side session validation | ✅ | `validateSessionAndGetUserId()` |
| Session expiration | ✅ | `expiresAt` check in Convex |
| Session revocation | ✅ | `revokedAt` + `isValid` flags |
| Cryptographically random session IDs | ✅ | `crypto.randomBytes(24)` |
| Access tokens encrypted at rest | ✅ | AES-256-GCM |
| CSRF protection | ✅ | Separate CSRF token |
| Refresh token rotation | ✅ | New sessionId on refresh |

---

## Future Considerations

### WorkOS Audience Claim

Currently, WorkOS JWTs don't include an `aud` (audience) claim. When/if WorkOS adds this:

- Convex could validate the JWT directly
- Could eliminate the need for session table lookups on every request
- Would reduce latency for authentication

However, the current session-based approach provides benefits:
- Server-side session management
- Ability to revoke sessions instantly
- Session activity tracking
- Multi-device session management

### Potential Enhancements

1. **Session Fingerprinting**: Bind sessions to browser fingerprint for additional verification
2. **Anomaly Detection**: Flag sessions with unusual IP/location changes
3. **Session Limits**: Limit concurrent sessions per user
4. **Audit Logging**: Log all authentication events for compliance

---

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/infrastructure/auth/server/crypto.ts` | Cryptographic operations (signing, encryption) |
| `src/lib/infrastructure/auth/server/session.ts` | Session cookie management |
| `src/lib/infrastructure/auth/server/sessionStore.ts` | Convex session record operations |
| `convex/infrastructure/sessionValidation.ts` | Server-side session validation |
| `convex/infrastructure/authSessions.ts` | Session CRUD operations |
| `convex/auth.config.ts` | WorkOS JWT provider configuration |
| `src/hooks.server.ts` | SvelteKit request middleware |

---

## Related Documents

- [Architecture Overview](../architecture.md)
- [RBAC Architecture](../rbac/rbac-architecture.md)
- [Convex Integration Patterns](../../2-areas/patterns/convex-integration.md)
