# Password Validation Unit Tests

## Overview

Comprehensive unit tests for registration password validation to ensure WorkOS password requirements are enforced correctly.

## Location

`src/routes/auth/register/register.test.ts`

## Coverage

### Test Suites

1. **Length Requirements** (3 tests)
   - Reject passwords < 8 characters
   - Accept passwords = 8 characters
   - Accept passwords > 8 characters

2. **Email Address Inclusion** (6 tests)
   - Reject password containing full email username
   - Reject password with email username + alias (`user+alias@example.com`)
   - Reject password regardless of case sensitivity
   - Reject password with email username in the middle
   - Accept password that doesn't contain email username
   - Accept password when email username < 4 chars (threshold for false positives)

3. **Edge Cases** (4 tests)
   - Handle empty email
   - Handle email with multiple + aliases
   - Handle email with uppercase characters
   - Handle password with special characters

4. **Real-World Test Cases** (3 tests)
   - **Bug Fix**: Reject `randyhereman+test3@gmail.com` with password `randyhereman123`
   - Accept common password patterns that don't contain email
   - Reject passwords too similar to email

## Key Test Cases

### Critical Bug Case (Fixed)

```typescript
// Bug: randyhereman+test3@gmail.com with password randyhereman123 was not caught
const result = validatePassword('randyhereman+test3@gmail.com', 'randyhereman123');
expect(result.valid).toBe(false);
expect(result.error).toContain('must not contain your email');
```

### Email Alias Handling

```typescript
// Strips + aliases before checking
const result = validatePassword('user+test+alias@example.com', 'userpassword123');
expect(result.valid).toBe(false); // ✅ Correctly rejects
```

### False Positive Prevention

```typescript
// Short usernames (< 4 chars) are allowed to avoid false positives
const result = validatePassword('ab@example.com', 'abc12345');
expect(result.valid).toBe(true); // ✅ Correctly accepts
```

## Running Tests

### Run password validation tests only:

```bash
npm run test:unit -- src/routes/auth/register/register.test.ts
```

### Run all server unit tests:

```bash
npm run test:unit:server
```

### Run full CI suite:

```bash
npm run ci:local
```

## Integration with CI

- ✅ Included in `npm run test:unit:server`
- ✅ Included in `npm run ci:local`
- ✅ Runs automatically before commits (via `npm run precommit`)

## Validation Logic

The validation function is extracted from `/auth/register/+server.ts` and duplicated in the test file for unit testing:

```typescript
function validatePassword(email: string, password: string): { valid: boolean; error?: string } {
	// 1. Check length (minimum 8 characters)
	if (password.length < 8) {
		return { valid: false, error: 'Password must be at least 8 characters' };
	}

	// 2. Check email inclusion
	// Strip + aliases (e.g., "user+alias@example.com" -> "user")
	const emailLocalPart = email.split('@')[0].split('+')[0].toLowerCase();
	const passwordLower = password.toLowerCase();

	// Check if password contains email username (minimum 4 chars to avoid false positives)
	if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
		return {
			valid: false,
			error: 'Password must not contain your email address. Please choose a different password.'
		};
	}

	return { valid: true };
}
```

## WorkOS Requirements

These tests ensure compliance with WorkOS User Management API password requirements:

1. **Minimum Length**: 8 characters
2. **Email Exclusion**: Password cannot contain the user's email address (local part before @)
3. **Case Insensitive**: Check is performed on lowercase versions of both strings
4. **Alias Handling**: Email aliases (user+alias@example.com) are stripped before validation

## Related Files

- **Backend Validation**: `src/routes/auth/register/+server.ts` (lines 38-50)
- **Frontend Validation**: `src/routes/register/+page.svelte` (lines 59-67)
- **Unit Tests**: `src/routes/auth/register/register.test.ts`
- **E2E Tests**: `e2e/auth-registration.test.ts`

## Bug Report

**Issue**: Password containing email was not caught during registration

**Example**:

- Email: `randyhereman+test3@gmail.com`
- Password: `randyhereman123`
- Expected: ❌ Rejected (password contains "randyhereman")
- Actual (before fix): ✅ Accepted (alias `+test3` was not stripped)

**Root Cause**: Validation was checking `randyhereman+test3` instead of `randyhereman`

**Fix**: Strip `+alias` part before validation:

```typescript
const emailLocalPart = email.split('@')[0].split('+')[0].toLowerCase();
```

## Test Results

```
✓ Password Validation > Length Requirements > should reject passwords shorter than 8 characters
✓ Password Validation > Length Requirements > should accept passwords with exactly 8 characters
✓ Password Validation > Length Requirements > should accept passwords longer than 8 characters
✓ Password Validation > Email Address Inclusion > should reject password containing full email username
✓ Password Validation > Email Address Inclusion > should reject password containing email username with alias
✓ Password Validation > Email Address Inclusion > should reject password containing email username regardless of case
✓ Password Validation > Email Address Inclusion > should reject password with email username in the middle
✓ Password Validation > Email Address Inclusion > should accept password that does not contain email username
✓ Password Validation > Email Address Inclusion > should accept password when email username is less than 4 chars
✓ Password Validation > Edge Cases > should handle empty email
✓ Password Validation > Edge Cases > should handle email with multiple + aliases
✓ Password Validation > Edge Cases > should handle email with uppercase characters
✓ Password Validation > Edge Cases > should handle password with special characters
✓ Password Validation > Real-World Test Cases > should reject the reported bug case
✓ Password Validation > Real-World Test Cases > should accept common password patterns that do not contain email
✓ Password Validation > Real-World Test Cases > should reject passwords that are too similar to email

Test Files  1 passed (1)
     Tests  16 passed (16)
```

---

**Last Updated**: 2025-11-13  
**Status**: ✅ All tests passing  
**Coverage**: 16 unit tests covering all validation requirements
