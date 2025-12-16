# Error Handling Improvements

**Date**: 2025-01-XX  
**Status**: Implemented

## Problem

The previous error handling system relied on complex regex patterns to extract user-friendly messages from error strings. This was:
- **Brittle**: Regex patterns could miss edge cases
- **Unreliable**: Technical details could leak to users
- **Hard to maintain**: New error formats required regex updates

Example of leaked technical details:
```
[CONVEX Q] [Request ID: ef3ca5b1ec82b4cb] Server Error ArgumentValidationError: Object is missing the required field `workspaceId`. Consider wrapping the field validator in `v.optional(..)` if this is expected...
```

## Solution

Created a structured error system that separates user-facing messages from technical details at the source.

### 1. Structured Error Function (`createError`)

**Location**: `convex/infrastructure/errors/codes.ts`

**Architecture Compliance**: Follows Principle #11 (functions only, no classes)

```typescript
export function createError(
  code: ErrorCode,
  userMessage: string,
  technicalDetails?: string
): Error {
  const serializedMessage = `SYNERGYOS_ERROR|${code}|${userMessage}|${technicalDetails}`;
  const error = new Error(serializedMessage);
  error.name = 'SynergyOSError';
  
  // Attach metadata as properties (for type safety and debugging)
  (error as any).code = code;
  (error as any).userMessage = userMessage;
  (error as any).technicalDetails = technicalDetails;
  
  // Auto-logs technical details to console/terminal
  console.error(`[${code}] ${userMessage}`, { code, userMessage, technicalDetails, stack });
  
  return error;
}
```

**Key Features**:
- **Separate concerns**: User message vs technical details
- **Auto-logging**: Technical details automatically logged when error is created
- **Serialization-safe**: Pipe-delimited format survives Convex boundary crossing
- **No regex needed**: Direct extraction of user message
- **Function-based**: Follows Principle #11 (zero classes)

### 2. Updated `createError()` Function

**Before**:
```typescript
export function createError(code: ErrorCode, message: string): Error {
  return new Error(`${code}: ${message}`);
}
```

**After**:
```typescript
export function createError(
  code: ErrorCode,
  userMessage: string,
  technicalDetails?: string
): Error {
  // Creates plain Error with structured message format
  // Follows Principle #11: functions only, no classes
  const serializedMessage = `SYNERGYOS_ERROR|${code}|${userMessage}|${technicalDetails}`;
  const error = new Error(serializedMessage);
  // ... attach metadata and auto-log
  return error;
}
```

**Benefits**:
- Backward compatible (third parameter is optional)
- Encourages writing user-friendly messages
- Optional technical details for debugging

### 3. Improved `parseConvexError()` Function

**Location**: `src/lib/utils/parseConvexError.ts`

**New Flow**:
1. **Check for SynergyOSError first**: Extract user message directly (no regex)
2. **Handle Convex validation errors**: Special parsing for `ArgumentValidationError`
3. **Fallback to regex**: Only for unexpected system errors

**Key Improvements**:
- **SynergyOSError detection**: Checks message format `SYNERGYOS_ERROR|...`
- **Direct extraction**: No regex needed for our errors
- **Better validation errors**: Converts "missing field `workspaceId`" → "Please provide workspace id."
- **Regex only as fallback**: Still handles unexpected Convex errors

## Usage Examples

### Creating Errors (Backend)

```typescript
// Simple usage (backward compatible)
throw createError(
  ErrorCodes.WORKSPACE_SLUG_RESERVED,
  "The name 'admin' is not available. Please choose a different workspace name."
);

// With technical details for debugging
throw createError(
  ErrorCodes.WORKSPACE_SLUG_RESERVED,
  "The name 'admin' is not available. Please choose a different workspace name.",
  `Slug 'admin' is in reserved list. Attempted by user ${userId} at ${timestamp}`
);
```

### Handling Errors (Frontend)

```typescript
try {
  await createWorkspace({ name: 'admin' });
} catch (error) {
  // parseConvexError automatically:
  // - Extracts user message for SynergyOSError
  // - Parses Convex validation errors
  // - Falls back to regex for system errors
  const userMessage = parseConvexError(error);
  setError(userMessage); // Clean message shown to user
  
  // Technical details already logged by SynergyOSError constructor
  // Full error still available in console for debugging
}
```

## Migration Notes

### Existing Code
- **No changes required**: `createError(code, message)` still works
- **Optional enhancement**: Add technical details parameter for better debugging

### Error Message Format
- **SynergyOSError**: `SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`
- **Legacy format**: Still supported via regex fallback
- **Convex errors**: Special handling for validation errors

## Benefits

1. **Reliability**: No regex dependency for our own errors
2. **User Experience**: Guaranteed clean messages in UI
3. **Developer Experience**: Technical details auto-logged
4. **Maintainability**: Clear separation of concerns
5. **Backward Compatible**: Existing code works without changes

## Future Improvements

- [ ] Add error code to UI for support tickets (optional)
- [ ] Create error message templates for common scenarios
- [ ] Add error analytics to track error patterns
- [ ] Consider i18n support for error messages

