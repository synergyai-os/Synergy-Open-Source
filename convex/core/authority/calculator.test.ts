/**
 * Authority Calculator Tests
 *
 * Unit tests for authority calculation functions.
 * These tests verify the pure function behavior without database dependencies.
 *
 * SYOS-692: Tests for extracted authority calculator
 * SYOS-1070: Updated for leadAuthority model (simplified from circleType)
 */

import { describe, test, expect } from 'vitest';
import {
	getAuthorityLevel,
	calculateAuthorityLevel,
	hasDirectApprovalAuthority,
	requiresConsentProcess,
	hasConveningAuthority
} from './calculator';
import type { LeadAuthority } from './types';

describe('getAuthorityLevel', () => {
	test('returns decides for decides', () => {
		expect(getAuthorityLevel('decides')).toBe('decides');
	});

	test('returns facilitates for facilitates', () => {
		expect(getAuthorityLevel('facilitates')).toBe('facilitates');
	});

	test('returns convenes for convenes', () => {
		expect(getAuthorityLevel('convenes')).toBe('convenes');
	});

	test('defaults null to decides', () => {
		expect(getAuthorityLevel(null)).toBe('decides');
	});

	test('defaults undefined to decides', () => {
		expect(getAuthorityLevel(undefined)).toBe('decides');
	});
});

describe('calculateAuthorityLevel (deprecated alias)', () => {
	test('works as alias for getAuthorityLevel', () => {
		expect(calculateAuthorityLevel('decides')).toBe('decides');
		expect(calculateAuthorityLevel('facilitates')).toBe('facilitates');
		expect(calculateAuthorityLevel('convenes')).toBe('convenes');
		expect(calculateAuthorityLevel(null)).toBe('decides');
	});
});

describe('hasDirectApprovalAuthority', () => {
	test('returns true for decides', () => {
		expect(hasDirectApprovalAuthority('decides')).toBe(true);
	});

	test('returns false for facilitates', () => {
		expect(hasDirectApprovalAuthority('facilitates')).toBe(false);
	});

	test('returns false for convenes', () => {
		expect(hasDirectApprovalAuthority('convenes')).toBe(false);
	});

	test('defaults null to true (decides)', () => {
		expect(hasDirectApprovalAuthority(null)).toBe(true);
	});
});

describe('requiresConsentProcess', () => {
	test('returns true for facilitates', () => {
		expect(requiresConsentProcess('facilitates')).toBe(true);
	});

	test('returns false for decides', () => {
		expect(requiresConsentProcess('decides')).toBe(false);
	});

	test('returns false for convenes', () => {
		expect(requiresConsentProcess('convenes')).toBe(false);
	});

	test('defaults null to false (decides)', () => {
		expect(requiresConsentProcess(null)).toBe(false);
	});
});

describe('hasConveningAuthority', () => {
	test('returns true for convenes', () => {
		expect(hasConveningAuthority('convenes')).toBe(true);
	});

	test('returns false for decides', () => {
		expect(hasConveningAuthority('decides')).toBe(false);
	});

	test('returns false for facilitates', () => {
		expect(hasConveningAuthority('facilitates')).toBe(false);
	});

	test('defaults null to false (decides)', () => {
		expect(hasConveningAuthority(null)).toBe(false);
	});
});

describe('Authority Level Consistency', () => {
	test('all lead authority values are valid authority levels', () => {
		const leadAuthorityValues: LeadAuthority[] = ['decides', 'facilitates', 'convenes'];
		const validLevels = ['decides', 'facilitates', 'convenes'];

		for (const leadAuthority of leadAuthorityValues) {
			const level = getAuthorityLevel(leadAuthority);
			expect(validLevels).toContain(level);
		}
	});

	test('identity: leadAuthority IS the authority level', () => {
		const leadAuthorityValues: LeadAuthority[] = ['decides', 'facilitates', 'convenes'];

		for (const leadAuthority of leadAuthorityValues) {
			// Key insight: leadAuthority and authority level are now the same value
			expect(getAuthorityLevel(leadAuthority)).toBe(leadAuthority);
		}
	});

	test('mutually exclusive helper functions', () => {
		const leadAuthorityValues: LeadAuthority[] = ['decides', 'facilitates', 'convenes'];

		for (const leadAuthority of leadAuthorityValues) {
			const hasDirect = hasDirectApprovalAuthority(leadAuthority);
			const requiresConsent = requiresConsentProcess(leadAuthority);
			const hasConvening = hasConveningAuthority(leadAuthority);

			// Exactly one should be true
			const trueCount = [hasDirect, requiresConsent, hasConvening].filter(Boolean).length;
			expect(trueCount).toBe(1);
		}
	});
});
