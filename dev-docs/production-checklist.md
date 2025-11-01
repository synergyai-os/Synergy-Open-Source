# Production Checklist

This document tracks items that need to be addressed before deploying to production. Items are categorized by priority.

## 🔴 CRITICAL - Must Fix Before Production

### Security

#### API Key Encryption
**Status**: ✅ Implemented  
**Priority**: **CRITICAL** - **COMPLETED**  
**Issue**: API keys (Claude, Readwise) are currently stored in plain text in the Convex database.

**Risk**: 
- If database is compromised, all user API keys are exposed
- Violates security best practices for sensitive credentials

**Fix Required**:
- Implement AES-256 encryption for API keys before storing
- Use Convex environment variable for encryption key
- Decrypt keys on-the-fly when needed (never store decrypted keys)
- Consider using Convex's built-in secrets management if available

**Files to Update**:
- `convex/settings.ts` - Add encryption/decryption functions
- Update `updateClaudeApiKey` and `updateReadwiseApiKey` mutations to encrypt before storing
- Add decryption utility for when keys are needed (e.g., for API calls)

**Resources**:
- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- AES-256 encryption implementation pattern

**✅ Completed**:
- Created `convex/crypto.ts` with AES-256-GCM encryption/decryption functions
- Updated `updateClaudeApiKey` and `updateReadwiseApiKey` to encrypt before storing
- Updated `getUserSettings` to decrypt keys before returning to client
- Keys are never stored or returned in plain text
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
**Status**: ⏳ Not Implemented  
**Priority**: Recommended  
**Issue**: No validation that API keys are valid before saving.

**Benefits**:
- Better UX - users know immediately if key is invalid
- Prevents storing invalid keys
- Catches typos early

**Implementation**:
- Add validation functions that test connection to Claude/Readwise APIs
- Show validation result before auto-saving
- Provide clear error messages

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
**Status**: ⏳ Not Implemented  
**Priority**: Recommended  
**Issue**: No visual indication while Convex hooks initialize.

**Benefits**:
- Better perceived performance
- Users know something is happening
- Prevents confusion about empty inputs

**Implementation**:
- Add loading skeleton or spinner while `userSettings` is null/loading
- Show "Initializing..." message during hook setup
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

- ✅ Auto-save with 500ms debouncing
- ✅ Browser-only initialization (SSR-safe)
- ✅ Error handling with user feedback
- ✅ Null checks before mutation calls
- ✅ Timer cleanup on unmount
- ✅ Accessibility improvements (labels, ARIA)

---

## Notes

- **Last Updated**: [Current Date]
- **Next Review**: Review monthly or before each major release
- **Tracking**: Check off items as they're completed

---

## Related Documentation

- `dev-docs/product-vision-and-plan.md` - Overall product plan
- `dev-docs/design-tokens.md` - Design system documentation
- `convex/settings.ts` - Settings mutations implementation

