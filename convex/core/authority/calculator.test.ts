/**
 * Authority Calculator Tests
 *
 * Unit tests for authority calculation functions.
 * These tests verify the pure function behavior without database dependencies.
 *
 * SYOS-692: Tests for extracted authority calculator
 */

import { describe, test, expect } from 'vitest';
import {
	calculateAuthorityLevel,
	hasDirectApprovalAuthority,
	requiresConsentProcess,
	hasConveningAuthority
} from './calculator';
import type { CircleType } from './types';

describe('calculateAuthorityLevel', () => {
	test('maps hierarchy to authority', () => {
		expect(calculateAuthorityLevel('hierarchy')).toBe('authority');
	});

	test('maps empowered_team to facilitative', () => {
		expect(calculateAuthorityLevel('empowered_team')).toBe('facilitative');
	});

	test('maps guild to convening', () => {
		expect(calculateAuthorityLevel('guild')).toBe('convening');
	});

	test('maps hybrid to authority', () => {
		expect(calculateAuthorityLevel('hybrid')).toBe('authority');
	});

	test('defaults null to hierarchy (authority)', () => {
		expect(calculateAuthorityLevel(null)).toBe('authority');
	});

	test('defaults undefined to hierarchy (authority)', () => {
		expect(calculateAuthorityLevel(undefined)).toBe('authority');
	});
});

describe('hasDirectApprovalAuthority', () => {
	test('returns true for hierarchy', () => {
		expect(hasDirectApprovalAuthority('hierarchy')).toBe(true);
	});

	test('returns true for hybrid', () => {
		expect(hasDirectApprovalAuthority('hybrid')).toBe(true);
	});

	test('returns false for empowered_team', () => {
		expect(hasDirectApprovalAuthority('empowered_team')).toBe(false);
	});

	test('returns false for guild', () => {
		expect(hasDirectApprovalAuthority('guild')).toBe(false);
	});

	test('defaults null to true (hierarchy)', () => {
		expect(hasDirectApprovalAuthority(null)).toBe(true);
	});
});

describe('requiresConsentProcess', () => {
	test('returns true for empowered_team', () => {
		expect(requiresConsentProcess('empowered_team')).toBe(true);
	});

	test('returns false for hierarchy', () => {
		expect(requiresConsentProcess('hierarchy')).toBe(false);
	});

	test('returns false for hybrid', () => {
		expect(requiresConsentProcess('hybrid')).toBe(false);
	});

	test('returns false for guild', () => {
		expect(requiresConsentProcess('guild')).toBe(false);
	});

	test('defaults null to false (hierarchy)', () => {
		expect(requiresConsentProcess(null)).toBe(false);
	});
});

describe('hasConveningAuthority', () => {
	test('returns true for guild', () => {
		expect(hasConveningAuthority('guild')).toBe(true);
	});

	test('returns false for hierarchy', () => {
		expect(hasConveningAuthority('hierarchy')).toBe(false);
	});

	test('returns false for empowered_team', () => {
		expect(hasConveningAuthority('empowered_team')).toBe(false);
	});

	test('returns false for hybrid', () => {
		expect(hasConveningAuthority('hybrid')).toBe(false);
	});

	test('defaults null to false (hierarchy)', () => {
		expect(hasConveningAuthority(null)).toBe(false);
	});
});

describe('Authority Level Consistency', () => {
	test('all circle types map to valid authority levels', () => {
		const circleTypes: CircleType[] = ['hierarchy', 'empowered_team', 'guild', 'hybrid'];
		const validLevels = ['authority', 'facilitative', 'convening'];

		for (const circleType of circleTypes) {
			const level = calculateAuthorityLevel(circleType);
			expect(validLevels).toContain(level);
		}
	});

	test('mutually exclusive helper functions', () => {
		const circleTypes: CircleType[] = ['hierarchy', 'empowered_team', 'guild', 'hybrid'];

		for (const circleType of circleTypes) {
			const hasDirect = hasDirectApprovalAuthority(circleType);
			const requiresConsent = requiresConsentProcess(circleType);
			const hasConvening = hasConveningAuthority(circleType);

			// Exactly one should be true
			const trueCount = [hasDirect, requiresConsent, hasConvening].filter(Boolean).length;
			expect(trueCount).toBe(1);
		}
	});
});
