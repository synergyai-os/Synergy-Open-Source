/**
 * Lead helpers tests
 */

import { describe, expect, test } from 'vitest';
import { countLeadRoles, isLeadRequiredForCircleType } from './lead';

describe('countLeadRoles', () => {
	test('counts lead roles based on template isRequired', () => {
		const roles = [
			{ templateId: 'lead-template' },
			{ templateId: 'non-lead-template' },
			{ templateId: undefined },
			{ templateId: 'missing-template' }
		];

		const templateMap = new Map<string, { isRequired?: boolean | null }>([
			['lead-template', { isRequired: true }],
			['non-lead-template', { isRequired: false }]
		]);

		const result = countLeadRoles(roles, (templateId) => templateMap.get(templateId));
		expect(result).toBe(1);
	});
});

describe('isLeadRequiredForCircleType', () => {
	test('uses defaults when overrides are absent', () => {
		expect(isLeadRequiredForCircleType('hierarchy')).toBe(true);
		expect(isLeadRequiredForCircleType('empowered_team')).toBe(false);
		expect(isLeadRequiredForCircleType('guild')).toBe(false);
		expect(isLeadRequiredForCircleType('hybrid')).toBe(true);
	});

	test('defaults circle type to hierarchy', () => {
		expect(isLeadRequiredForCircleType(undefined)).toBe(true);
		expect(isLeadRequiredForCircleType(null)).toBe(true);
	});

	test('respects override map when provided', () => {
		const override = { hierarchy: false, guild: true };

		expect(isLeadRequiredForCircleType('hierarchy', override)).toBe(false);
		expect(isLeadRequiredForCircleType('guild', override)).toBe(true);
		// Non-overridden types fall back to defaults
		expect(isLeadRequiredForCircleType('empowered_team', override)).toBe(false);
	});
});

