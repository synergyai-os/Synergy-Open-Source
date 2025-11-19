/**
 * Test Utilities for Mocking Browser APIs
 *
 * Mocks localStorage, window.location, and other browser APIs for composable tests
 */

import { vi } from 'vitest';

/**
 * Mock localStorage with account-specific storage support
 */
export function createMockLocalStorage(userId?: string): Storage {
	const storage: Record<string, string> = {};

	const getStorageKey = (key: string) => {
		return userId ? `${key}_${userId}` : key;
	};

	return {
		getItem: vi.fn((key: string) => {
			const fullKey = getStorageKey(key);
			return storage[fullKey] ?? null;
		}),
		setItem: vi.fn((key: string, value: string) => {
			const fullKey = getStorageKey(key);
			storage[fullKey] = value;
		}),
		removeItem: vi.fn((key: string) => {
			const fullKey = getStorageKey(key);
			delete storage[fullKey];
		}),
		clear: vi.fn(() => {
			Object.keys(storage).forEach((key) => {
				if (!userId || key.endsWith(`_${userId}`)) {
					delete storage[key];
				}
			});
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

/**
 * Setup browser mocks for a test
 *
 * Note: window.location cannot be redefined in browser tests.
 * Instead, we use history.pushState to change the URL for testing.
 */
export function setupBrowserMocks(
	options: {
		userId?: string;
		urlSearch?: string;
	} = {}
) {
	const { userId, urlSearch = '' } = options;

	// Mock localStorage
	const mockStorage = createMockLocalStorage(userId);
	Object.defineProperty(window, 'localStorage', {
		value: mockStorage,
		writable: true,
		configurable: true
	});

	// Set initial URL using history.pushState (doesn't require redefining location)
	// Use relative URL to avoid cross-origin issues
	if (urlSearch) {
		const path = window.location.pathname;
		const newUrl = `${path}${urlSearch.startsWith('?') ? urlSearch : `?${urlSearch}`}`;
		window.history.pushState({}, '', newUrl);
	}

	return {
		mockStorage
	};
}
