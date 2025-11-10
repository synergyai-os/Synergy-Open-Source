# ADR 001: Store Workspace Context in Session Cookie

**Status**: ✅ Accepted  
**Date**: 2025-11-10  
**Deciders**: Randy Hereman, Claude

---

## Context

We need to store which workspace the user is currently viewing (Personal vs Organization). This context must:
- Persist across page refreshes
- Be accessible server-side (for query filtering)
- Be fast to read/write
- Support multiple workspaces per user

---

## Decision

Store active workspace context in the **session cookie** (`wos-user`).

```typescript
// Cookie structure
{
  "userId": "user_123",
  "workosId": "user_workos_abc",
  "email": "randy@synergyai.nl",
  "firstName": "Randy",
  "lastName": "Hereman",
  "activeWorkspace": {
    "type": "personal" | "organization",
    "id": null | "org_synergyai"
  }
}
```

---

## Alternatives Considered

### Option A: LocalStorage (Client-side only)
**Pros:**
- Easy to implement
- Fast client-side access

**Cons:**
- ❌ Not accessible server-side
- ❌ Can't filter queries in `+page.server.ts`
- ❌ Requires client-side redirect for workspace filtering

### Option B: Separate Cookie
**Pros:**
- Clean separation of concerns

**Cons:**
- ❌ More cookies to manage
- ❌ Risk of sync issues between cookies
- ❌ More complex cookie deletion on logout

### Option C: Database Field on User
**Pros:**
- Persistent across devices

**Cons:**
- ❌ Slower (database query on every request)
- ❌ Doesn't persist across accounts (multi-account switching)
- ❌ Not useful for "last workspace" if user uses different devices

### Option D: Session Cookie (CHOSEN) ✅
**Pros:**
- ✅ Accessible server-side
- ✅ Fast (no database query)
- ✅ Persists across page refreshes
- ✅ Automatically cleared on logout
- ✅ Supports multi-account (each session has own workspace)

**Cons:**
- Per-device (not shared across devices)
- But this is actually a feature! (Different workspace on phone vs laptop is fine)

---

## Implementation Details

### Session Structure
```typescript
// src/app.d.ts
interface Locals {
  auth: {
    user?: {
      userId: string;
      workosId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      activeWorkspace?: {
        type: 'personal' | 'organization';
        id: string | null; // null for personal, org ID for organization
      };
    } | null;
    sessionId?: string;
  };
}
```

### Setting Workspace
```typescript
// src/routes/api/workspace/switch/+server.ts
export const POST: RequestHandler = async ({ cookies, request }) => {
  const { workspaceType, workspaceId } = await request.json();
  
  // Update cookie
  const userData = JSON.parse(cookies.get('wos-user'));
  userData.activeWorkspace = { type: workspaceType, id: workspaceId };
  
  cookies.set('wos-user', JSON.stringify(userData), cookieOptions);
  
  return json({ success: true });
};
```

### Reading Workspace
```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const userDataCookie = event.cookies.get('wos-user');
  
  if (userDataCookie) {
    const userData = JSON.parse(userDataCookie);
    event.locals.auth.user = userData;
    
    // Default to personal if not set
    if (!userData.activeWorkspace) {
      userData.activeWorkspace = { type: 'personal', id: null };
    }
  }
  
  return resolve(event);
};
```

### Filtering Queries
```typescript
// src/routes/(authenticated)/inbox/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const { type, id } = locals.auth.user.activeWorkspace;
  
  // Filter by active workspace
  const items = await convex.query(api.inbox.listInboxItems, {
    userId: locals.auth.user.userId,
    organizationId: type === 'personal' ? null : id
  });
  
  return { items };
};
```

---

## Consequences

### Positive
- Fast workspace switching (no database writes)
- Server-side filtering works out of the box
- Clean logout (cookies auto-deleted)
- Multi-account ready (each account has own session)

### Negative
- Workspace context is per-device/browser
  - User on phone sees different workspace than laptop
  - **Mitigation**: This is actually fine for most use cases
- Cookie size increases slightly (negligible)

### Neutral
- Need to handle cookie sync when switching accounts
- Need to default to "personal" when not set

---

## References

- [HTTP-only Cookie Best Practices](https://owasp.org/www-community/HttpOnly)
- [SvelteKit Session Management](https://kit.svelte.dev/docs/hooks#server-hooks-handle)
- Related: [ADR 003: Session Strategy](./003-session-strategy.md)

---

**Last Updated**: 2025-11-10

