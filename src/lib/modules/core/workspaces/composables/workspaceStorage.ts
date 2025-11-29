/**
 * Organization Storage Utilities
 *
 * Pure utility functions for localStorage operations related to workspaces.
 * These functions handle account-specific storage keys and JSON serialization.
 *
 * Extracted from useWorkspaces.svelte.ts for testability and maintainability.
 */

import type { WorkspaceSummary } from './useWorkspaces.svelte';

const STORAGE_KEY_PREFIX = 'activeWorkspaceId';
const STORAGE_DETAILS_KEY_PREFIX = 'activeOrganizationDetails';

/**
 * Get account-specific storage key for active workspace ID
 *
 * @param userId - User ID for account-specific storage (undefined for anonymous)
 * @returns Storage key string
 */
export function getStorageKey(userId: string | undefined): string {
	return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

/**
 * Get account-specific storage key for workspace details
 *
 * @param userId - User ID for account-specific storage (undefined for anonymous)
 * @returns Storage key string
 */
export function getStorageDetailsKey(userId: string | undefined): string {
	return userId ? `${STORAGE_DETAILS_KEY_PREFIX}_${userId}` : STORAGE_DETAILS_KEY_PREFIX;
}

/**
 * Get stored active workspace ID from localStorage
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
 * Load cached workspace details from localStorage
 *
 * @param storageDetailsKey - Storage key (from getStorageDetailsKey)
 * @returns WorkspaceSummary or null if not found/invalid
 */
export function loadCachedOrg(storageDetailsKey: string): WorkspaceSummary | null {
	if (typeof window === 'undefined' || !window.localStorage) {
		return null;
	}

	try {
		const stored = window.localStorage.getItem(storageDetailsKey);
		if (!stored) {
			return null;
		}
		return JSON.parse(stored) as WorkspaceSummary;
	} catch (e) {
		console.warn('Failed to parse cached workspace details', e);
		return null;
	}
}

/**
 * Save active workspace ID and details to localStorage
 *
 * Always saves the workspace ID. Only saves details if org is provided.
 *
 * @param storageKey - Storage key for workspace ID (from getStorageKey)
 * @param storageDetailsKey - Storage key for workspace details (from getStorageDetailsKey)
 * @param orgId - Organization ID to save
 * @param org - Organization details to save (optional)
 */
export function saveCachedOrg(
	storageKey: string,
	storageDetailsKey: string,
	orgId: string,
	org: WorkspaceSummary | null
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
 * Remove cached workspace data from localStorage
 *
 * @param storageKey - Storage key for workspace ID (from getStorageKey)
 * @param storageDetailsKey - Storage key for workspace details (from getStorageDetailsKey)
 */
export function removeCachedOrg(storageKey: string, storageDetailsKey: string): void {
	if (typeof window === 'undefined' || !window.localStorage) {
		return;
	}

	window.localStorage.removeItem(storageKey);
	window.localStorage.removeItem(storageDetailsKey);
}
