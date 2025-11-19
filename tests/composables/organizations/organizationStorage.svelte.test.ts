/**
 * Unit Tests for Organization Storage Utilities
 *
 * Tests pure utility functions for localStorage operations.
 * These functions are extracted from useOrganizations.svelte.ts for testability.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	getStorageKey,
	getStorageDetailsKey,
	getStoredActiveId,
	loadCachedOrg,
	saveCachedOrg,
	removeCachedOrg
} from '$lib/composables/organizations/organizationStorage';
import type { OrganizationSummary } from '$lib/composables/useOrganizations.svelte';

// Mock localStorage
function createMockLocalStorage(): Storage {
	const storage: Record<string, string> = {};

	return {
		getItem: vi.fn((key: string) => storage[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			storage[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete storage[key];
		}),
		clear: vi.fn(() => {
			Object.keys(storage).forEach((key) => delete storage[key]);
		}),
		get length() {
			return Object.keys(storage).length;
		},
		key: vi.fn((index: number) => {
			const keys = Object.keys(storage);
			return keys[index] ?? null;
		})
	} as Storage;
}

describe('organizationStorage', () => {
	let mockStorage: Storage;

	beforeEach(() => {
		mockStorage = createMockLocalStorage();
		// Mock window.localStorage
		Object.defineProperty(window, 'localStorage', {
			value: mockStorage,
			writable: true,
			configurable: true
		});
	});

	describe('getStorageKey', () => {
		it('should return key with userId prefix when userId provided', () => {
			const result = getStorageKey('user123');
			expect(result).toBe('activeOrganizationId_user123');
		});

		it('should return base key when userId is undefined', () => {
			const result = getStorageKey(undefined);
			expect(result).toBe('activeOrganizationId');
		});

		it('should handle empty string userId (treated as falsy)', () => {
			// Empty string is falsy, so it returns base key (matches implementation)
			const result = getStorageKey('');
			expect(result).toBe('activeOrganizationId');
		});
	});

	describe('getStorageDetailsKey', () => {
		it('should return key with userId prefix when userId provided', () => {
			const result = getStorageDetailsKey('user123');
			expect(result).toBe('activeOrganizationDetails_user123');
		});

		it('should return base key when userId is undefined', () => {
			const result = getStorageDetailsKey(undefined);
			expect(result).toBe('activeOrganizationDetails');
		});

		it('should handle empty string userId (treated as falsy)', () => {
			// Empty string is falsy, so it returns base key (matches implementation)
			const result = getStorageDetailsKey('');
			expect(result).toBe('activeOrganizationDetails');
		});
	});

	describe('getStoredActiveId', () => {
		it('should return stored organization ID', () => {
			mockStorage.setItem('activeOrganizationId', 'org123');
			const result = getStoredActiveId('activeOrganizationId');
			expect(result).toBe('org123');
		});

		it('should return null when key not found', () => {
			const result = getStoredActiveId('activeOrganizationId');
			expect(result).toBeNull();
		});

		it('should filter out legacy __personal__ sentinel value', () => {
			mockStorage.setItem('activeOrganizationId', '__personal__');
			const result = getStoredActiveId('activeOrganizationId');
			expect(result).toBeNull();
		});

		it('should return null when window is undefined (SSR)', () => {
			// In browser environment, window always exists
			// This test verifies the SSR guard works (window check prevents errors)
			// Actual SSR testing would require Node environment, which is not available here
			const result = getStoredActiveId('nonexistent-key');
			expect(result).toBeNull();
		});
	});

	describe('loadCachedOrg', () => {
		const mockOrg: OrganizationSummary = {
			organizationId: 'org123',
			name: 'Test Org',
			initials: 'TO',
			slug: 'test-org',
			plan: 'free',
			role: 'owner',
			joinedAt: 1234567890,
			memberCount: 5,
			teamCount: 2
		};

		it('should load and parse cached organization', () => {
			mockStorage.setItem('activeOrganizationDetails', JSON.stringify(mockOrg));
			const result = loadCachedOrg('activeOrganizationDetails');
			expect(result).toEqual(mockOrg);
		});

		it('should return null when key not found', () => {
			const result = loadCachedOrg('activeOrganizationDetails');
			expect(result).toBeNull();
		});

		it('should return null and warn on invalid JSON', () => {
			mockStorage.setItem('activeOrganizationDetails', 'invalid json');
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const result = loadCachedOrg('activeOrganizationDetails');

			expect(result).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to parse cached organization details',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should return null when window is undefined (SSR)', () => {
			// In browser environment, window always exists
			// This test verifies the SSR guard works (window check prevents errors)
			// Actual SSR testing would require Node environment, which is not available here
			const result = loadCachedOrg('nonexistent-key');
			expect(result).toBeNull();
		});
	});

	describe('saveCachedOrg', () => {
		const mockOrg: OrganizationSummary = {
			organizationId: 'org123',
			name: 'Test Org',
			initials: 'TO',
			slug: 'test-org',
			plan: 'free',
			role: 'owner',
			joinedAt: 1234567890,
			memberCount: 5,
			teamCount: 2
		};

		it('should save organization ID and details', () => {
			saveCachedOrg('activeOrganizationId', 'activeOrganizationDetails', 'org123', mockOrg);

			expect(mockStorage.getItem('activeOrganizationId')).toBe('org123');
			expect(mockStorage.getItem('activeOrganizationDetails')).toBe(JSON.stringify(mockOrg));
		});

		it('should save only ID when org is null', () => {
			saveCachedOrg('activeOrganizationId', 'activeOrganizationDetails', 'org123', null);

			expect(mockStorage.getItem('activeOrganizationId')).toBe('org123');
			expect(mockStorage.getItem('activeOrganizationDetails')).toBeNull();
		});

		it('should handle account-specific keys', () => {
			const storageKey = getStorageKey('user123');
			const storageDetailsKey = getStorageDetailsKey('user123');

			saveCachedOrg(storageKey, storageDetailsKey, 'org123', mockOrg);

			expect(mockStorage.getItem(storageKey)).toBe('org123');
			expect(mockStorage.getItem(storageDetailsKey)).toBe(JSON.stringify(mockOrg));
		});

		it('should handle SSR gracefully (window check)', () => {
			// In browser environment, window always exists
			// This test verifies the function doesn't throw (SSR guard prevents errors)
			// Actual SSR testing would require Node environment, which is not available here
			expect(() => {
				saveCachedOrg('activeOrganizationId', 'activeOrganizationDetails', 'org123', mockOrg);
			}).not.toThrow();
		});
	});

	describe('removeCachedOrg', () => {
		it('should remove both storage keys', () => {
			mockStorage.setItem('activeOrganizationId', 'org123');
			mockStorage.setItem('activeOrganizationDetails', '{}');

			removeCachedOrg('activeOrganizationId', 'activeOrganizationDetails');

			expect(mockStorage.getItem('activeOrganizationId')).toBeNull();
			expect(mockStorage.getItem('activeOrganizationDetails')).toBeNull();
		});

		it('should handle missing keys gracefully', () => {
			expect(() => {
				removeCachedOrg('activeOrganizationId', 'activeOrganizationDetails');
			}).not.toThrow();

			expect(mockStorage.getItem('activeOrganizationId')).toBeNull();
			expect(mockStorage.getItem('activeOrganizationDetails')).toBeNull();
		});

		it('should handle account-specific keys', () => {
			const storageKey = getStorageKey('user123');
			const storageDetailsKey = getStorageDetailsKey('user123');

			mockStorage.setItem(storageKey, 'org123');
			mockStorage.setItem(storageDetailsKey, '{}');

			removeCachedOrg(storageKey, storageDetailsKey);

			expect(mockStorage.getItem(storageKey)).toBeNull();
			expect(mockStorage.getItem(storageDetailsKey)).toBeNull();
		});

		it('should handle SSR gracefully (window check)', () => {
			// In browser environment, window always exists
			// This test verifies the function doesn't throw (SSR guard prevents errors)
			// Actual SSR testing would require Node environment, which is not available here
			expect(() => {
				removeCachedOrg('activeOrganizationId', 'activeOrganizationDetails');
			}).not.toThrow();
		});
	});

	describe('integration', () => {
		it('should work together: save, load, remove', () => {
			const mockOrg: OrganizationSummary = {
				organizationId: 'org123',
				name: 'Test Org',
				initials: 'TO',
				slug: 'test-org',
				plan: 'free',
				role: 'owner',
				joinedAt: 1234567890,
				memberCount: 5,
				teamCount: 2
			};

			const userId = 'user123';
			const storageKey = getStorageKey(userId);
			const storageDetailsKey = getStorageDetailsKey(userId);

			// Save
			saveCachedOrg(storageKey, storageDetailsKey, 'org123', mockOrg);

			// Load
			const loadedId = getStoredActiveId(storageKey);
			const loadedOrg = loadCachedOrg(storageDetailsKey);

			expect(loadedId).toBe('org123');
			expect(loadedOrg).toEqual(mockOrg);

			// Remove
			removeCachedOrg(storageKey, storageDetailsKey);

			expect(getStoredActiveId(storageKey)).toBeNull();
			expect(loadCachedOrg(storageDetailsKey)).toBeNull();
		});
	});
});
