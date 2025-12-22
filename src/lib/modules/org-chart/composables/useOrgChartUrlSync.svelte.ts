import { browser } from '$app/environment';
import { page } from '$app/stores';
import { pushState, replaceState } from '$app/navigation';
import { get } from 'svelte/store';
import { untrack } from 'svelte';
import type { Id } from '$lib/convex/_generated/dataModel';
import type { UseOrgChart } from './useOrgChart.svelte';

/**
 * URL parameter names for org chart state
 */
const URL_PARAMS = {
	CIRCLE: 'circle',
	ROLE: 'role',
	EDIT: 'edit'
} as const;

/**
 * Parse edit parameter value (format: "circle:ID" or "role:ID")
 */
function parseEditParam(value: string | null): { type: 'circle' | 'role'; id: string } | null {
	if (!value) return null;
	const [type, id] = value.split(':');
	if ((type === 'circle' || type === 'role') && id) {
		return { type, id };
	}
	return null;
}

/**
 * Build URL with updated search params
 */
function buildUrl(
	baseUrl: URL,
	params: {
		circle?: string | null;
		role?: string | null;
		edit?: string | null;
	}
): URL {
	const url = new URL(baseUrl);

	// Update circle param
	if (params.circle !== undefined) {
		if (params.circle) {
			url.searchParams.set(URL_PARAMS.CIRCLE, params.circle);
		} else {
			url.searchParams.delete(URL_PARAMS.CIRCLE);
		}
	}

	// Update role param
	if (params.role !== undefined) {
		if (params.role) {
			url.searchParams.set(URL_PARAMS.ROLE, params.role);
		} else {
			url.searchParams.delete(URL_PARAMS.ROLE);
		}
	}

	// Update edit param
	if (params.edit !== undefined) {
		if (params.edit) {
			url.searchParams.set(URL_PARAMS.EDIT, params.edit);
		} else {
			url.searchParams.delete(URL_PARAMS.EDIT);
		}
	}

	return url;
}

/**
 * Composable for syncing org chart state with URL parameters
 *
 * Provides bidirectional sync:
 * - On mount: reads URL params and restores state
 * - On state change: updates URL to reflect current state
 * - On browser back/forward: restores state from URL
 *
 * URL structure:
 * - /w/{slug}/chart                        → Default view
 * - /w/{slug}/chart?circle=abc123          → Circle detail panel open
 * - /w/{slug}/chart?role=xyz789            → Role detail panel open
 * - /w/{slug}/chart?circle=abc&role=xyz    → Both panels (role from circle context)
 * - /w/{slug}/chart?edit=circle:abc123     → Edit circle panel
 * - /w/{slug}/chart?edit=role:xyz789       → Edit role panel
 *
 * @param orgChart - The org chart composable instance to sync with
 */
export function useOrgChartUrlSync(orgChart: UseOrgChart) {
	if (!browser) return;

	// Track whether we're currently syncing from URL to prevent loops
	let syncingFromUrl = false;

	// Track whether initial restore has been done
	let initialRestoreDone = false;

	// Track previous state to detect changes
	let prevCircleId: string | null = null;
	let prevRoleId: string | null = null;
	let prevEditLayer: string | null = null;

	/**
	 * Get current edit mode from navigation stack
	 */
	function getCurrentEditMode(): string | null {
		const currentLayer = orgChart.navigationStack.currentLayer;
		if (!currentLayer) return null;

		if (currentLayer.type === 'edit-circle') {
			return `circle:${currentLayer.id}`;
		}
		if (currentLayer.type === 'edit-role') {
			return `role:${currentLayer.id}`;
		}
		return null;
	}

	/**
	 * Restore state from URL parameters
	 * @param clearFirst - Whether to clear existing state before restoring (for popstate)
	 */
	function restoreFromUrl(clearFirst: boolean = false): void {
		const currentPage = get(page);
		const url = currentPage.url;

		const circleId = url.searchParams.get(URL_PARAMS.CIRCLE);
		const roleId = url.searchParams.get(URL_PARAMS.ROLE);
		const editParam = url.searchParams.get(URL_PARAMS.EDIT);
		const edit = parseEditParam(editParam);

		syncingFromUrl = true;

		// Clear existing state if requested (e.g., for browser back)
		if (clearFirst) {
			orgChart.navigationStack.clear();
			orgChart.selectCircle(null);
			orgChart.selectRole(null, null);
		}

		// Restore circle selection
		if (circleId) {
			orgChart.selectCircle(circleId as Id<'circles'>, { skipStackPush: false });
			prevCircleId = circleId;
		} else {
			prevCircleId = null;
		}

		// Restore role selection
		if (roleId) {
			// Determine source based on whether circle is also selected
			const source = circleId ? 'circle-panel' : 'chart';
			orgChart.selectRole(roleId as Id<'circleRoles'>, source, { skipStackPush: false });
			prevRoleId = roleId;
		} else {
			prevRoleId = null;
		}

		// Restore edit mode
		if (edit) {
			if (edit.type === 'circle') {
				orgChart.openEditCircle(edit.id as Id<'circles'>);
			} else if (edit.type === 'role') {
				orgChart.openEditRole(edit.id as Id<'circleRoles'>);
			}
			prevEditLayer = editParam;
		} else {
			prevEditLayer = null;
		}

		syncingFromUrl = false;
	}

	/**
	 * Update URL to reflect current state
	 * @param usePush - Whether to use pushState (adds history entry) or replaceState
	 */
	function updateUrl(usePush: boolean = true): void {
		if (syncingFromUrl) return;

		const currentPage = get(page);
		const currentCircleId = orgChart.selectedCircleId;
		const currentRoleId = orgChart.selectedRoleId;
		const currentEdit = getCurrentEditMode();

		// Build new URL
		const newUrl = buildUrl(currentPage.url, {
			circle: currentCircleId,
			role: currentRoleId,
			edit: currentEdit
		});

		// Only update if URL actually changed
		if (newUrl.href !== currentPage.url.href) {
			if (usePush) {
				pushState(newUrl.pathname + newUrl.search + newUrl.hash, {});
			} else {
				replaceState(newUrl.pathname + newUrl.search + newUrl.hash, {});
			}
		}
	}

	// Handle browser back/forward navigation (popstate)
	function handlePopstate(): void {
		// Small delay to let SvelteKit update $page store
		setTimeout(() => {
			restoreFromUrl(true);
		}, 0);
	}

	// Listen for popstate events (browser back/forward)
	window.addEventListener('popstate', handlePopstate);

	// Sync state TO URL using $effect
	$effect(() => {
		// Track these values to trigger effect when they change
		const circleId = orgChart.selectedCircleId;
		const roleId = orgChart.selectedRoleId;
		// Access currentLayer to track navigation stack changes
		const _currentLayer = orgChart.navigationStack.currentLayer;
		const editMode = getCurrentEditMode();

		// Skip if we're syncing from URL or haven't done initial restore yet
		if (syncingFromUrl || !initialRestoreDone) return;

		// Detect what changed to determine if we should push or replace
		const circleChanged = circleId !== prevCircleId;
		const roleChanged = roleId !== prevRoleId;
		const editChanged = editMode !== prevEditLayer;

		// Update previous state
		prevCircleId = circleId;
		prevRoleId = roleId;
		prevEditLayer = editMode;

		// Use pushState when opening panels (adds to history)
		// Use replaceState when clearing/closing (doesn't add to history)
		const isOpening =
			(circleChanged && circleId) || (roleChanged && roleId) || (editChanged && editMode);
		updateUrl(isOpening);
	});

	// Restore state from URL on mount (once data is loaded)
	$effect(() => {
		// Track loading state to trigger effect
		const isLoading = orgChart.isLoading;

		// Only run once when orgChart stops loading
		if (!isLoading && !initialRestoreDone) {
			// Use untrack to prevent reading reactive values that would cause re-runs
			untrack(() => {
				restoreFromUrl();
				initialRestoreDone = true;
			});
		}
	});

	// Cleanup on unmount
	$effect(() => {
		return () => {
			window.removeEventListener('popstate', handlePopstate);
		};
	});

	// Return API for manual control if needed
	return {
		/**
		 * Manually sync current state to URL
		 */
		syncToUrl: () => updateUrl(false),

		/**
		 * Manually restore state from URL
		 */
		syncFromUrl: () => restoreFromUrl(false)
	};
}
