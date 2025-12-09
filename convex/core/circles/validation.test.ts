import { describe, test, expect } from 'vitest';
import { validateCircleName, validateCircleNameUpdate } from './validation';

describe('validateCircleName', () => {
	test('rejects undefined or null', () => {
		expect(validateCircleName(undefined)).toBe('Circle name is required');
		expect(validateCircleName(null)).toBe('Circle name is required');
	});

	test('rejects empty or whitespace-only strings', () => {
		expect(validateCircleName('')).toBe('Circle name cannot be empty');
		expect(validateCircleName('   ')).toBe('Circle name cannot be empty');
	});

	test('allows trimmed non-empty strings', () => {
		expect(validateCircleName('Engineering')).toBeNull();
		expect(validateCircleName('  Product  ')).toBeNull();
	});
});

describe('validateCircleNameUpdate', () => {
	test('allows undefined to indicate no change', () => {
		expect(validateCircleNameUpdate(undefined)).toBeNull();
	});

	test('rejects empty or whitespace-only strings', () => {
		expect(validateCircleNameUpdate('')).toBe('Circle name cannot be empty');
		expect(validateCircleNameUpdate('   ')).toBe('Circle name cannot be empty');
	});

	test('allows trimmed non-empty strings', () => {
		expect(validateCircleNameUpdate('Engineering')).toBeNull();
		expect(validateCircleNameUpdate('  Product  ')).toBeNull();
	});
});
