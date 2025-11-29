/**
 * Organization URL Sync Composable
 *
 * Extracted from useWorkspaces for testability and maintainability.
 * Handles URL parameter processing (?org=, ?create=workspace, ?join=workspace),
 * router integration, and modal triggers from URL.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import { untrack } from 'svelte';
import { replaceState } from '$app/navigation';

export interface UseOrganizationUrlSyncOptions {
	setActiveWorkspace: (workspaceId: string | null) => void; // State composable function
	openModal: (key: 'createWorkspace' | 'joinOrganization') => void; // Modal opener function
	activeWorkspaceId: () => string | null; // Reactive function to get current active org ID (for tracking)
	workspaces: () => Array<{ workspaceId: string }>; // Reactive function to get workspaces list (for validation)
}

/**
 * Module-level tracking for URL param processing (pattern #L700 - plain variable, not $state)
 * Prevents infinite loops when URL param triggers state update that triggers URL cleanup
 */
let lastProcessedOrgParam: string | null = null;

/**
 * URL Sync Composable
 *
 * Processes URL parameters and triggers workspace switching or modal opening.
 * Uses untrack pattern (#L700) to prevent infinite loops and try-catch guard (#L730)
 * for router initialization.
 */
export function useWorkspaceUrlSync(options: UseOrganizationUrlSyncOptions): void {
	const { setActiveWorkspace, openModal, activeWorkspaceId, workspaces } = options;

	$effect(() => {
		if (!browser) return;

		// Skip URL param processing if account switching is active
		// Account switching takes precedence - it will handle org switching after account switch completes
		// Check sessionStorage synchronously (set before page reload, cleared after account switch completes)
		const switchingData = sessionStorage.getItem('switchingAccount');
		if (switchingData) {
			console.debug('⏭️ Skipping URL param processing (account switching active)');
			return;
		}

		// Check for modal trigger URL parameters
		const urlParams = new SvelteURLSearchParams(window.location.search);
		const createParam = urlParams.get('create');
		const joinParam = urlParams.get('join');

		if (createParam === 'workspace') {
			openModal('createWorkspace');
			// Clean up URL param
			urlParams.delete('create');
			const newUrl =
				window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
			try {
				replaceState(newUrl, {});
			} catch (_e) {
				// Router not ready on initial load - URL will persist but won't cause reprocessing
				console.debug('Router not ready, deferring URL cleanup');
			}
		} else if (joinParam === 'workspace') {
			openModal('joinOrganization');
			// Clean up URL param
			urlParams.delete('join');
			const newUrl =
				window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
			try {
				replaceState(newUrl, {});
			} catch (_e) {
				// Router not ready on initial load - URL will persist but won't cause reprocessing
				console.debug('Router not ready, deferring URL cleanup');
			}
		}

		// Priority 1: URL parameter (from account/workspace switching)
		// Read directly from window.location.search to avoid race condition with $page.url
		// $page.url updates asynchronously after replaceState(), but window.location.search updates synchronously
		const urlOrgParam = urlParams.get('org');
		const currentActiveOrgId = activeWorkspaceId(); // Get current active org ID reactively
		const orgsList = workspaces(); // Get workspaces list for validation

		// Skip if URL param was already processed (pattern #L700 - untrack prevents reactive dependency)
		// Only skip if there's actually a URL param that matches both tracking vars
		// Don't skip when all are null - we need to run validation to set default org
		if (
			untrack(
				() =>
					urlOrgParam !== null &&
					urlOrgParam === lastProcessedOrgParam &&
					urlOrgParam === currentActiveOrgId
			)
		) {
			console.debug(
				'⏭️ Skipping URL param processing (already processed):',
				`urlParam=${urlOrgParam}`,
				`currentOrg=${currentActiveOrgId}`
			);
			return;
		}

		// Check if org was changed manually (not from URL) - detect BEFORE processing URL param
		// This prevents URL param from overriding manual org switches
		if (
			urlOrgParam &&
			lastProcessedOrgParam &&
			urlOrgParam === lastProcessedOrgParam &&
			currentActiveOrgId !== urlOrgParam
		) {
			// Org was changed manually (not from URL) - clean up URL param and reset tracking
			console.debug(
				'🔄 Organization changed manually, cleaning up URL param:',
				`urlParam=${urlOrgParam}`,
				`currentOrg=${currentActiveOrgId}`
			);
			// Clean up URL param to prevent reprocessing
			try {
				const urlParams = new SvelteURLSearchParams(window.location.search);
				urlParams.delete('org');
				const newUrl =
					window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
				replaceState(newUrl, {});
			} catch (_e) {
				console.debug('Router not ready, deferring URL cleanup');
			}
			// Reset tracking
			untrack(() => {
				lastProcessedOrgParam = null;
			});
			return; // Don't process URL param - manual switch takes precedence
		}

		if (urlOrgParam && urlOrgParam !== currentActiveOrgId) {
			// Validate org ID exists in workspaces list before setting
			// This prevents crashes when invalid IDs are passed via URL
			const orgExists = orgsList.some((org) => org.workspaceId === urlOrgParam);

			if (!orgExists) {
				console.warn(
					'⚠️ Invalid workspace ID in URL param, ignoring:',
					urlOrgParam,
					'Available orgs:',
					orgsList.map((o) => o.workspaceId)
				);

				// Clean up invalid URL param
				try {
					const urlParams = new SvelteURLSearchParams(window.location.search);
					urlParams.delete('org');
					const newUrl =
						window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
					replaceState(newUrl, {});
				} catch (_e) {
					console.debug('Router not ready, deferring URL cleanup');
				}

				// Update tracking to prevent reprocessing
				untrack(() => {
					lastProcessedOrgParam = urlOrgParam;
				});

				return; // Don't set invalid org, let validation handle default
			}

			console.log(
				'🔗 Setting workspace from URL param:',
				`${urlOrgParam} (current: ${currentActiveOrgId})`
			);

			// Update tracking without triggering re-run (pattern #L700)
			untrack(() => {
				lastProcessedOrgParam = urlOrgParam;
			});

			setActiveWorkspace(urlOrgParam);

			// Clean up URL param immediately (inbox pattern - prevents reprocessing)
			// Guard for initial page load when router isn't initialized yet (pattern #L730)
			try {
				const urlParams = new SvelteURLSearchParams(window.location.search);
				urlParams.delete('org');
				const newUrl =
					window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
				replaceState(newUrl, {});
			} catch (_e) {
				// Router not ready on initial load - URL will persist but won't cause reprocessing
				// because lastProcessedOrgParam tracking prevents the effect from running again
				console.debug('Router not ready, deferring URL cleanup');
			}

			return; // Stop here, let validation handle the rest
		}

		// Reset tracking if URL param removed
		if (!urlOrgParam && lastProcessedOrgParam) {
			console.debug(
				'🔄 URL param removed, resetting tracking:',
				`was=${lastProcessedOrgParam}`,
				`currentOrg=${currentActiveOrgId}`
			);
			untrack(() => {
				lastProcessedOrgParam = null;
			});
		}

		// Validation logic is handled by useWorkspaceState composable
		// URL param handling above sets the org, and validation runs in the state composable
	});
}
