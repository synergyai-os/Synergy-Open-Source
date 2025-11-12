# Multi-Session Architecture (Slack/Notion Pattern)

## Overview

SynergyOS supports multiple concurrent user sessions (like Slack and Notion), allowing users to:
- Log in with multiple email accounts
- Switch between accounts without re-authentication
- Maintain independent sessions for each account
- Log out of individual accounts without affecting others

## How It Works

### Client-Side (LocalStorage)

All user sessions are stored in browser localStorage in an encrypted format:

```typescript
{
  "activeAccount": "userId-1",
  "sessions": {
    "userId-1": {
      sessionId: "...",
      csrfToken: "...",
      expiresAt: 1234567890,
      userEmail: "user1@example.com",
      userName: "User One"
    },
    "userId-2": {
      sessionId: "...",
      csrfToken: "...",
      expiresAt: 1234567890,
      userEmail: "user2@example.com",
      userName: "User Two"
    }
  }
}
```

**Security**:
- Sessions are encrypted with simple XOR encryption (prevents casual inspection)
- Encryption key is derived from browser fingerprint (user agent + screen dimensions)
- Sessions are automatically cleaned up when expired

### Server-Side (Convex)

Each session is stored independently in the `authSessions` table:
- One record per user session
- Sessions don't interfere with each other
- Each session has its own expiry and tokens

### Account Linking

Accounts are linked using the `accountLinks` table:
- Bidirectional links (A ↔ B)
- Links are verified when switching
- Transitive linking supported (if B links to A and C links to B, then A can access C via B)

## User Flows

### 1. Add Account

1. User clicks "Add Account" in workspace switcher
2. Redirected to `/login?linkAccount=1&redirect=/inbox`
3. User logs in or registers new account
4. Server creates bidirectional account link
5. Server creates session record for new account
6. Server establishes session for new account (auto-switch)
7. Client stores new session in localStorage
8. User is now on the new account, can switch back to previous

### 2. Switch Account

1. User selects account from workspace switcher
2. Client checks localStorage for session
3. If session exists and valid:
   - Client updates active account in localStorage
   - Client calls `/auth/switch` with target userId
   - Server validates accounts are linked
   - Server establishes session for target account
   - Client redirects to inbox
4. If session expired or missing:
   - Show error: "Please log in to this account first"

### 3. Logout

1. User clicks logout
2. Client removes current account from localStorage
3. Server invalidates session in Convex
4. Server revokes WorkOS session
5. If other sessions exist in localStorage:
   - Client switches to first available account
   - Redirect to `/inbox?switched=1`
6. If no other sessions:
   - Redirect to `/login`

## Implementation

### Key Files

- `src/lib/client/sessionStorage.ts` - Client-side session management
- `src/lib/composables/useAuthSession.svelte.ts` - Session composable
- `src/routes/auth/login/+server.ts` - Login with multi-session support
- `src/routes/auth/register/+server.ts` - Registration with account linking
- `src/routes/auth/switch/+server.ts` - Account switching
- `src/routes/logout/+server.ts` - Logout (only active account)
- `convex/authSessions.ts` - Session storage
- `convex/users.ts` - Account linking

### Client API

```typescript
import { useAuthSession } from '$lib/composables/useAuthSession.svelte';

const auth = useAuthSession();

// Check authentication
auth.isAuthenticated // boolean
auth.user // User object or null

// Get available accounts
auth.availableAccounts // Array of { userId, email, name }
auth.activeAccountId // Current account ID

// Switch accounts
await auth.switchAccount(targetUserId);

// Logout (only current account)
await auth.logout();
```

### Server-Side Session Management

Sessions are automatically managed:
- `hooks.server.ts` resolves sessions from cookies
- Session records are created when users log in
- Sessions are invalidated when users log out
- All session operations are logged for debugging

## Security Considerations

1. **localStorage Encryption**: Basic XOR encryption prevents casual inspection. For production, consider upgrading to WebCrypto API.

2. **CSRF Protection**: Each session has its own CSRF token stored in localStorage and validated on every sensitive operation.

3. **Session Expiry**: Sessions expire independently. Expired sessions are automatically removed from localStorage.

4. **Account Linking**: Only explicitly linked accounts can be switched. Server validates links on every switch.

5. **Token Storage**: Actual WorkOS tokens (access/refresh) are encrypted and stored server-side only. Client never has access to tokens.

## Benefits

- **No re-login**: Users don't need to re-authenticate when switching accounts
- **Independent sessions**: Each account has its own expiry and state
- **Familiar UX**: Matches Slack/Notion patterns users already know
- **Logout flexibility**: Can log out of one account without affecting others
- **Multi-device support**: Works across browsers (each device has its own localStorage)

## Limitations

1. **Browser-specific**: Sessions are stored per-browser. Switching to a different browser requires new logins.

2. **No cross-device sync**: Adding an account on one device doesn't automatically add it on another.

3. **LocalStorage size**: Browsers limit localStorage to ~5-10MB. In practice, this supports hundreds of accounts.

4. **Simple encryption**: XOR encryption is not cryptographically secure. Suitable for preventing casual inspection only.

## Future Enhancements

1. Upgrade to WebCrypto API for stronger client-side encryption
2. Add server-side session sync (optional, for cross-device session sharing)
3. Add UI for viewing/revoking sessions per account
4. Add session activity timeline (last used, location, etc.)

