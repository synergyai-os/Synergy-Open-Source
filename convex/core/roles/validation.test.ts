/**
 * Role validation tests
 */

import { describe, expect, test } from 'vitest';
import { hasDuplicateRoleName, normalizeRoleName } from './validation';

const roles = [
	{ _id: '1', name: 'Lead' },
	{ _id: '2', name: 'Member' }
];

describe('normalizeRoleName', () => {
	test('trims and lowercases', () => {
		expect(normalizeRoleName('  Lead ')).toBe('lead');
	});
});

describe('hasDuplicateRoleName', () => {
	test('detects duplicates case-insensitively', () => {
		expect(hasDuplicateRoleName('lead', roles)).toBe(true);
		expect(hasDuplicateRoleName('LEAD', roles)).toBe(true);
	});

	test('returns false when no duplicate exists', () => {
		expect(hasDuplicateRoleName('Facilitator', roles)).toBe(false);
	});

	test('ignores current role id', () => {
		expect(hasDuplicateRoleName('Lead', roles, '1')).toBe(false);
	});

	test('trims candidate before comparison', () => {
		expect(hasDuplicateRoleName('  member  ', roles)).toBe(true);
	});
});

