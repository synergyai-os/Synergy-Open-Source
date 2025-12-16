/**
 * Lead detection tests
 */

import { describe, expect, test } from 'vitest';
import { isLeadTemplate } from './detection';

describe('isLeadTemplate', () => {
	test('returns true when template is circle_lead', () => {
		expect(isLeadTemplate({ roleType: 'circle_lead' })).toBe(true);
	});

	test('returns false when template is structural', () => {
		expect(isLeadTemplate({ roleType: 'structural' })).toBe(false);
	});

	test('returns false when template is custom', () => {
		expect(isLeadTemplate({ roleType: 'custom' })).toBe(false);
	});

	test('returns false when template is undefined', () => {
		expect(isLeadTemplate(undefined)).toBe(false);
	});

	test('returns false when template is null', () => {
		expect(isLeadTemplate(null)).toBe(false);
	});
});
