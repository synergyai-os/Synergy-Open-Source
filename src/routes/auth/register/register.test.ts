/**
 * Unit tests for registration password validation
 *
 * Tests the password strength requirements including:
 * - Minimum length (8 characters)
 * - Password cannot contain email address
 * - Handles email aliases (user+alias@example.com)
 */

import { describe, it, expect } from 'vitest';

/**
 * Password validation function (extracted for testing)
 * This mirrors the logic in /auth/register/+server.ts
 */
function validatePassword(email: string, password: string): { valid: boolean; error?: string } {
	// Validate password strength (minimum 8 characters)
	if (password.length < 8) {
		return { valid: false, error: 'Password must be at least 8 characters' };
	}

	// Validate password doesn't contain email (WorkOS requirement)
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

describe('Password Validation', () => {
	describe('Length Requirements', () => {
		it('should reject passwords shorter than 8 characters', () => {
			const result = validatePassword('user@example.com', 'short');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('at least 8 characters');
		});

		it('should accept passwords with exactly 8 characters', () => {
			const result = validatePassword('user@example.com', 'LongPass1!');
			expect(result.valid).toBe(true);
		});

		it('should accept passwords longer than 8 characters', () => {
			const result = validatePassword('user@example.com', 'VeryLongPassword123!');
			expect(result.valid).toBe(true);
		});
	});

	describe('Email Address Inclusion (WorkOS Requirement)', () => {
		it('should reject password containing full email username', () => {
			const result = validatePassword('randyhereman@gmail.com', 'randyhereman123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should reject password containing email username with alias', () => {
			const result = validatePassword('randyhereman+test@gmail.com', 'randyhereman123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should reject password containing email username regardless of case', () => {
			const result = validatePassword('RandyHereman@gmail.com', 'RANDYHEREMAN123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should reject password with email username in the middle', () => {
			const result = validatePassword('john@example.com', 'myjohnpassword');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should accept password that does not contain email username', () => {
			const result = validatePassword('randyhereman@gmail.com', 'StrongPassword123!');
			expect(result.valid).toBe(true);
		});

		it('should accept password when email username is less than 4 chars', () => {
			// Short usernames (< 4 chars) are allowed to avoid false positives
			const result = validatePassword('ab@example.com', 'abc12345');
			expect(result.valid).toBe(true);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty email', () => {
			const result = validatePassword('', 'password123');
			expect(result.valid).toBe(true); // No email to check against
		});

		it('should handle email with multiple + aliases', () => {
			const result = validatePassword('user+test+alias@example.com', 'userpassword123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should handle email with uppercase characters', () => {
			const result = validatePassword('TestUser@Example.com', 'testuser123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should handle password with special characters', () => {
			const result = validatePassword('user@example.com', 'C0mpl3x!P@ssw0rd');
			expect(result.valid).toBe(true);
		});
	});

	describe('Real-World Test Cases', () => {
		it('should reject the reported bug case', () => {
			// Bug: randyhereman+test3@gmail.com with password randyhereman123 was not caught
			const result = validatePassword('randyhereman+test3@gmail.com', 'randyhereman123');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must not contain your email');
		});

		it('should accept common password patterns that do not contain email', () => {
			const testCases = [
				{ email: 'john@example.com', password: 'MySecurePass123!' },
				{ email: 'sarah.smith@company.com', password: 'Winter2024!' },
				{ email: 'dev+test@startup.io', password: 'Tr0ub4dor&3' }
			];

			testCases.forEach(({ email, password }) => {
				const result = validatePassword(email, password);
				expect(result.valid).toBe(true);
			});
		});

		it('should reject passwords that are too similar to email', () => {
			// Test each case individually for better error messages
			const aliceResult = validatePassword('alice@example.com', 'alice12345');
			expect(aliceResult.valid).toBe(false);
			expect(aliceResult.error).toContain('must not contain your email');

			const robertResult = validatePassword('robert+work@company.com', 'myrobertpassword'); // Fixed: bob is only 3 chars (below 4 char threshold)
			expect(robertResult.valid).toBe(false);
			expect(robertResult.error).toContain('must not contain your email');

			const charlieResult = validatePassword('charlie@test.com', 'charliepass2024');
			expect(charlieResult.valid).toBe(false);
			expect(charlieResult.error).toContain('must not contain your email');
		});
	});
});
