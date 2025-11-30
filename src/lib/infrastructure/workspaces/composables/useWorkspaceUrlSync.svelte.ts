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
	workspaces: () => Array<{ workspaceId: string; slug: string }>; // Reactive function to get workspaces list (for validation)
}

/**
 * Module-level tracking for URL param processing (pattern #L700 - plain variable, not $state)
 * Prevents infinite loops when URL param triggers state update that triggers URL cleanup
 */
let lastProcessedOrgParam: string | null = null;
let lastProcessedSlug: string | null = null;

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

		// Priority 1: Path-based workspace routing (/w/:slug/)
		// Extract slug from URL path if on workspace-scoped route
		const pathname = window.location.pathname;
		const workspacePathMatch = pathname.match(/^\/w\/([^/]+)/);
		const urlSlug = workspacePathMatch ? workspacePathMatch[1] : null;

		// Priority 2: Legacy URL parameter (?org=) - for backward compatibility during migration
		// Read directly from window.location.search to avoid race condition with $page.url
		// $page.url updates asynchronously after replaceState(), but window.location.search updates synchronously
		const urlOrgParam = urlParams.get('org');
		const currentActiveOrgId = activeWorkspaceId(); // Get current active org ID reactively
		const orgsList = workspaces(); // Get workspaces list for validation

		// Handle path-based workspace routing (/w/:slug/)
		if (urlSlug) {
			// Find workspace by slug
			const workspaceBySlug = orgsList.find((org) => org.slug === urlSlug);

			// Skip if we just processed this slug (prevents loops)
			if (
				untrack(() => lastProcessedSlug) === urlSlug &&
				workspaceBySlug?.workspaceId === currentActiveOrgId
			) {
				return;
			}

			// Skip URL sync if workspace is currently switching (prevents override of manual switches)
			// If active workspace doesn't match URL slug, but workspace was just changed manually,
			// skip URL sync - let navigation effect handle it
			if (workspaceBySlug && workspaceBySlug.workspaceId !== currentActiveOrgId) {
				const currentWorkspace = orgsList.find((org) => org.workspaceId === currentActiveOrgId);
				// If current workspace exists and is different from URL slug, this might be a manual switch
				// Give navigation effect a chance to update the URL first
				if (currentWorkspace && currentWorkspace.slug !== urlSlug) {
					console.debug(
						'⏭️ Skipping URL sync - workspace switch in progress:',
						`URL slug: ${urlSlug}, Active workspace: ${currentWorkspace.slug} (${currentWorkspace.name})`
					);
					// Don't update lastProcessedSlug - let navigation effect handle it
					return; // Let navigation effect handle the URL update
				}
			}

			if (workspaceBySlug && workspaceBySlug.workspaceId !== currentActiveOrgId) {
				console.log(
					'🔗 Setting workspace from URL slug:',
					`${urlSlug} → ${workspaceBySlug.workspaceId} (current: ${currentActiveOrgId})`
				);
				untrack(() => {
					lastProcessedSlug = urlSlug;
				});
				setActiveWorkspace(workspaceBySlug.workspaceId);
				return; // Path-based routing takes precedence
			} else if (!workspaceBySlug) {
				console.warn(
					'⚠️ Invalid workspace slug in URL path, ignoring:',
					urlSlug,
					'Available slugs:',
					orgsList.map((o) => o.slug)
				);
				// Don't redirect here - let the route layout handle it
			}
		}

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
