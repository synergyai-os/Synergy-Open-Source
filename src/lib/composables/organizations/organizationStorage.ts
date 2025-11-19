/**
 * Organization Storage Utilities
 *
 * Pure utility functions for localStorage operations related to organizations.
 * These functions handle account-specific storage keys and JSON serialization.
 *
 * Extracted from useOrganizations.svelte.ts for testability and maintainability.
 */

import type { OrganizationSummary } from '../useOrganizations.svelte';

const STORAGE_KEY_PREFIX = 'activeOrganizationId';
const STORAGE_DETAILS_KEY_PREFIX = 'activeOrganizationDetails';

/**
 * Get account-specific storage key for active organization ID
 *
 * @param userId - User ID for account-specific storage (undefined for anonymous)
 * @returns Storage key string
 */
export function getStorageKey(userId: string | undefined): string {
	return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

/**
 * Get account-specific storage key for organization details
 *
 * @param userId - User ID for account-specific storage (undefined for anonymous)
 * @returns Storage key string
 */
export function getStorageDetailsKey(userId: string | undefined): string {
	return userId ? `${STORAGE_DETAILS_KEY_PREFIX}_${userId}` : STORAGE_DETAILS_KEY_PREFIX;
}

/**
 * Get stored active organization ID from localStorage
 *
 * Filters out legacy `__personal__` sentinel value (migration cleanup).
 *
 * @param storageKey - Storage key (from getStorageKey)
 * @returns Organization ID or null if not found/invalid
 */
export function getStoredActiveId(storageKey: string): string | null {
	if (typeof window === 'undefined' || !window.localStorage) {
		return null;
	}

	const stored = window.localStorage.getItem(storageKey);
	// Filter out old PERSONAL_SENTINEL value from localStorage (migration cleanup)
	return stored && stored !== '__personal__' ? stored : null;
}

/**
 * Load cached organization details from localStorage
 *
 * @param storageDetailsKey - Storage key (from getStorageDetailsKey)
 * @returns OrganizationSummary or null if not found/invalid
 */
export function loadCachedOrg(storageDetailsKey: string): OrganizationSummary | null {
	if (typeof window === 'undefined' || !window.localStorage) {
		return null;
	}

	try {
		const stored = window.localStorage.getItem(storageDetailsKey);
		if (!stored) {
			return null;
		}
		return JSON.parse(stored) as OrganizationSummary;
	} catch (e) {
		console.warn('Failed to parse cached organization details', e);
		return null;
	}
}

/**
 * Save active organization ID and details to localStorage
 *
 * Always saves the organization ID. Only saves details if org is provided.
 *
 * @param storageKey - Storage key for organization ID (from getStorageKey)
 * @param storageDetailsKey - Storage key for organization details (from getStorageDetailsKey)
 * @param orgId - Organization ID to save
 * @param org - Organization details to save (optional)
 */
export function saveCachedOrg(
	storageKey: string,
	storageDetailsKey: string,
	orgId: string,
	org: OrganizationSummary | null
): void {
	if (typeof window === 'undefined' || !window.localStorage) {
		return;
	}

	window.localStorage.setItem(storageKey, orgId);
	if (org) {
		window.localStorage.setItem(storageDetailsKey, JSON.stringify(org));
	}
}

/**
 * Remove cached organization data from localStorage
 *
 * @param storageKey - Storage key for organization ID (from getStorageKey)
 * @param storageDetailsKey - Storage key for organization details (from getStorageDetailsKey)
 */
export function removeCachedOrg(storageKey: string, storageDetailsKey: string): void {
	if (typeof window === 'undefined' || !window.localStorage) {
		return;
	}

	window.localStorage.removeItem(storageKey);
	window.localStorage.removeItem(storageDetailsKey);
}
