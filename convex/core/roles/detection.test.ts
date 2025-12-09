/**
 * Lead detection tests
 */

import { describe, expect, test } from 'vitest';
import { isLeadTemplate } from './detection';

describe('isLeadTemplate', () => {
	test('returns true when template is required', () => {
		expect(isLeadTemplate({ isRequired: true })).toBe(true);
	});

	test('returns false when template is not required', () => {
		expect(isLeadTemplate({ isRequired: false })).toBe(false);
	});

	test('returns false when template is undefined', () => {
		expect(isLeadTemplate(undefined)).toBe(false);
	});

	test('returns false when template is null', () => {
		expect(isLeadTemplate(null)).toBe(false);
	});
});
