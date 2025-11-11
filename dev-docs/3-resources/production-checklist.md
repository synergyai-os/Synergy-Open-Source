# Production Checklist

This document tracks items that need to be addressed before deploying to production. Items are categorized by priority.

## 🔴 CRITICAL - Must Fix Before Production

### Security

#### API Key Encryption & Client Security

**Status**: ✅ Fully Implemented  
**Priority**: **CRITICAL** - **COMPLETED**  
**Issue**: API keys (Claude, Readwise) must be encrypted in storage and NEVER exposed to the client.

**Risk**:

- If database is compromised, all user API keys are exposed
- Client-side exposure through browser dev tools, network requests, or UI
- Violates security best practices for sensitive credentials

**Fix Required**:

- Implement AES-256 encryption for API keys before storing
- Use Convex environment variable for encryption key
- **NEVER send keys to client (not even encrypted)**
- Only send boolean flags indicating if keys exist
- Decrypt keys server-side only when needed for API calls
- Remove any client-side decryption capabilities

**Files Updated**:

- `convex/cryptoActions.ts` - AES-256-GCM encryption functions
- `convex/settings.ts` - Encryption on save, boolean flags in queries
- `src/routes/settings/+page.svelte` - Removed all client-side decryption, removed eye icon

**✅ Completed**:

- Created `convex/cryptoActions.ts` with AES-256-GCM encryption function
- Updated `updateClaudeApiKey` and `updateReadwiseApiKey` actions to encrypt before storing
- **`getUserSettings` query returns boolean flags only (`hasClaudeKey`, `hasReadwiseKey`) - NEVER returns actual keys**
- Removed `decryptApiKey` action entirely (no client-side decryption)
- Removed eye icon that could reveal keys
- Input fields always use `type="password"` (no toggle to show/hide)
- Keys are encrypted at rest in database
- Keys are NEVER sent to client (not even encrypted)
- Uses Convex environment variable `API_KEY_ENCRYPTION_KEY` (64 hex chars)

**⚠️ Action Required**:

- Set encryption key: `npx convex env set API_KEY_ENCRYPTION_KEY $(openssl rand -hex 32)`
- Generate key with: `openssl rand -hex 32`

---

### Code Quality

#### Type Safety

**Status**: ✅ Implemented (with runtime safety)  
**Priority**: **CRITICAL** - **COMPLETED**  
**Issue**: Using `any` types throughout the settings page component.

**Risk**:

- Runtime errors that TypeScript could catch
- Harder to maintain and refactor
- Missing IntelliSense support

**Fix Required**:

- Import proper types from `convex-svelte` (`UseQueryReturn`, `UseMutationReturn`)
- Import types from generated API (`api` from `_generated/api`)
- Add proper types for all state variables and function parameters
- Remove all `any` type annotations

**Files to Update**:

- `src/routes/settings/+page.svelte` - Replace `any` with proper types

**✅ Completed**:

- Added proper TypeScript types for Convex hooks
- Created `UseQueryReturn` and `UseMutationReturn` type definitions
- Added `UserSettings` type for decrypted settings
- Used `useConvexClient().mutation()` pattern (proper from docs)
- Runtime checks for API availability
- Note: Some `any` types remain for runtime flexibility until Convex generates full API types, but core types are properly defined

**Example**:

```typescript
import type { UseQueryReturn, UseMutationReturn } from 'convex-svelte';
import type { api } from '$lib/convex';
```

---

## 🟡 RECOMMENDED - Should Fix Soon

### Security Enhancements

#### API Key Validation

**Status**: ✅ Implemented  
**Priority**: **RECOMMENDED** - **COMPLETED**  
**Issue**: Validate API keys before saving to ensure they work correctly.

**Benefits**:

- Better UX - users know immediately if key is invalid
- Prevents storing invalid keys
- Catches typos early

**✅ Completed**:

- Created `convex/validateApiKeys.ts` with validation actions
- `validateClaudeApiKey` - Tests Claude API with minimal request
- `validateReadwiseApiKey` - Tests Readwise auth endpoint
- Validation runs before encryption/saving in `updateClaudeApiKey` and `updateReadwiseApiKey` actions
- Clear, user-friendly error messages (technical details stripped)
- Visual feedback: spinner during validation, checkmark for success, X for failure
- Temporary success checkmark (3 seconds) then replaced with delete icon

---

#### Rate Limiting

**Status**: ⏳ Not Implemented  
**Priority**: Recommended  
**Issue**: No rate limiting on API key update mutations.

**Benefits**:

- Prevents abuse (rapid updates, DoS attempts)
- Protects backend resources

**Implementation**:

- Add rate limiting to `updateClaudeApiKey` and `updateReadwiseApiKey` mutations
- Use Convex's rate limiting features or implement custom logic
- Log suspicious patterns

---

### User Experience

#### Loading States

**Status**: ✅ Partially Implemented  
**Priority**: Recommended  
**Issue**: Visual indication during validation and initialization.

**✅ Completed**:

- Spinner icon during API key validation
- Success checkmark with temporary display (3 seconds)
- Error states with clear visual feedback

**⏳ Still Needed**:

- Loading state for initial page load (while fetching settings)
- Loading skeleton or spinner while `userSettings` is null/loading
- Disable inputs until data is loaded

---

#### Error Recovery

**Status**: ⏳ Not Implemented  
**Priority**: Recommended  
**Issue**: No retry mechanism for failed saves.

**Benefits**:

- Handles temporary network issues gracefully
- Better UX for users with unstable connections

**Implementation**:

- Add "Retry" button when save fails
- Automatic retry with exponential backoff (optional)
- Clear indication of retry status

---

## 🟢 NICE TO HAVE - Enhancements

### Additional Features

#### API Key Test Connection

**Status**: ⏳ Not Implemented  
**Priority**: Nice to Have  
**Issue**: No way to test if API key works after saving.

**Implementation**:

- Add "Test Connection" button next to each API key input
- Call a test endpoint (Claude/Readwise) with the key
- Show success/failure status

---

#### Audit Logging

**Status**: ⏳ Not Implemented  
**Priority**: Nice to Have  
**Issue**: No record of when API keys are updated.

**Benefits**:

- Security auditing
- Debugging user issues
- Compliance requirements

**Implementation**:

- Add audit log table in Convex schema
- Log all API key changes with timestamp and user ID
- Store only metadata (not the keys themselves)

---

#### API Key Rotation Support

**Status**: ⏳ Not Implemented  
**Priority**: Nice to Have  
**Issue**: No built-in support for rotating/expiring keys.

**Benefits**:

- Security best practice
- Compliance with some security policies

**Implementation**:

- Add expiration date field (optional)
- Show warning when key is expiring soon
- Support for multiple keys (active/backup)

---

### Performance

#### Telemetry/Logging

**Status**: ⏳ Not Implemented  
**Priority**: Nice to Have  
**Issue**: Limited visibility into save failures in production.

**Benefits**:

- Better debugging of production issues
- Track error patterns
- Monitor performance

**Implementation**:

- Add structured logging for save operations
- Log success/failure rates
- Include error details (sanitized, no sensitive data)

---

## ✅ COMPLETED

### Security

- ✅ Auto-save with 500ms debouncing (removed - now uses blur validation)
- ✅ Browser-only initialization (SSR-safe)
- ✅ Error handling with user feedback
- ✅ Null checks before mutation calls
- ✅ Timer cleanup on unmount
- ✅ Accessibility improvements (labels, ARIA)
- ✅ **API keys NEVER sent to client (not even encrypted)**
- ✅ **Removed all client-side decryption capabilities**
- ✅ **Eye icon removed - no way to reveal keys on client**
- ✅ **Delete/trash icon replaces eye icon for security**

### UX Improvements

- ✅ API key validation with real-time feedback
- ✅ Temporary success checkmark (3 seconds) after validation
- ✅ Delete icon appears when keys exist (replaces checkmark)
- ✅ User-friendly error messages (technical details stripped)
- ✅ Placeholder dots (`••••••••`) when key exists

---

## Notes

- **Last Updated**: 2025-01-XX (Security hardening - removed client-side key exposure)
- **Next Review**: Review monthly or before each major release
- **Tracking**: Check off items as they're completed

### Recent Security Hardening (2025-01-XX)

- **Critical**: Removed all client-side API key decryption
- **Critical**: API keys are now NEVER sent to client (not even encrypted)
- **Critical**: Removed eye icon - no way to reveal keys on client side
- **Improvement**: Replaced eye icon with delete/trash icon for better UX and security
- **Improvement**: Added temporary success checkmark (3 seconds) then delete icon appears

---

## Related Documentation

- `dev-docs/product-vision-and-plan.md` - Overall product plan
- `dev-docs/design-tokens.md` - Design system documentation
- `convex/settings.ts` - Settings mutations implementation
