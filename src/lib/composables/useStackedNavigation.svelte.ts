/**
 * Stacked Navigation Composable
 *
 * Provides a high-level API for managing stacked panel navigation with:
 * - Navigation stack management (push, pop, jump)
 * - Edit protection (block navigation when dirty)
 * - Max depth enforcement
 * - Module-agnostic navigation callbacks
 * - URL synchronization (bidirectional)
 *
 * This composable wraps useNavigationStack with additional features like
 * edit protection and navigation callbacks, making it easier for modules
 * to integrate stacked navigation.
 */

import { useNavigationStack } from './useNavigationStack.svelte';
import type { NavigationLayer } from './useNavigationStack.svelte';
import {
	MAX_STACK_DEPTH,
	NAV_QUERY_PARAM,
	LAYER_TYPE_TO_PREFIX,
	PREFIX_TO_LAYER_TYPE,
	type LayerPrefix
} from '$lib/infrastructure/navigation/constants';
import { checkLayerAccess } from '$lib/infrastructure/navigation/accessChecks';
import { browser } from '$app/environment';
import { pushState, replaceState } from '$app/navigation';
import { getContext } from 'svelte';
import { SvelteURL } from 'svelte/reactivity';
import { invariant } from '$lib/utils/invariant';
import type { ConvexClient } from 'convex/browser';

/**
 * Context provided to onNavigate callback
 */
export interface NavigationContext {
	/** Type of navigation action that occurred */
	action: 'back' | 'jump' | 'close';
	/** Layers that were removed from the stack */
	poppedLayers: NavigationLayer[];
}

/**
 * Edit protection configuration
 */
export interface EditProtection {
	/** Returns true if edit mode is currently active */
	isActive: () => boolean;
	/** Returns true if there are unsaved changes */
	isDirty: () => boolean;
	/** Called when navigation is blocked due to unsaved changes */
	onBlock: () => void;
	/** Called to reset edit mode (e.g., when navigation succeeds) */
	onReset: () => void;
}

/**
 * Check if a string is a valid layer prefix
 */
function isValidPrefix(prefix: string): prefix is LayerPrefix {
	return prefix in PREFIX_TO_LAYER_TYPE;
}

/**
 * Parse navigation stack from URL query parameter
 *
 * @param navParam - Value of 'nav' query parameter
 * @returns Array of navigation layers (invalid segments are skipped)
 *
 * @example
 * parseNavParam('c:abc123.r:def456') → [
 *   { type: 'circle', id: 'abc123', name: 'Loading...', zIndex: 60 },
 *   { type: 'role', id: 'def456', name: 'Loading...', zIndex: 70 }
 * ]
 */
function parseNavParam(navParam: string): Omit<NavigationLayer, 'zIndex'>[] {
	if (!navParam) return [];

	return navParam
		.split('.')
		.map((segment) => {
			const colonIndex = segment.indexOf(':');
			if (colonIndex === -1) {
				console.warn(`[StackedNavigation] Invalid URL segment (missing colon): ${segment}`);
				return null;
			}

			const prefix = segment.slice(0, colonIndex);
			const id = segment.slice(colonIndex + 1);

			if (!isValidPrefix(prefix)) {
				console.warn(`[StackedNavigation] Invalid URL prefix: ${prefix}`);
				return null;
			}

			if (!id) {
				console.warn(`[StackedNavigation] Invalid URL segment (empty ID): ${segment}`);
				return null;
			}

			return {
				type: PREFIX_TO_LAYER_TYPE[prefix],
				id,
				name: 'Loading...' // Will be populated when panel loads
			};
		})
		.filter((layer): layer is Omit<NavigationLayer, 'zIndex'> => layer !== null);
}

/**
 * Serialize navigation stack to URL query parameter value
 *
 * @param stack - Current navigation stack
 * @returns URL-encoded navigation string
 *
 * @example
 * serializeStack([
 *   { type: 'circle', id: 'abc123', ... },
 *   { type: 'role', id: 'def456', ... }
 * ]) → 'c:abc123.r:def456'
 */
function serializeStack(stack: NavigationLayer[]): string {
	return stack
		.map((layer) => {
			const prefix = LAYER_TYPE_TO_PREFIX[layer.type as keyof typeof LAYER_TYPE_TO_PREFIX];
			if (!prefix) {
				console.warn(`[StackedNavigation] Unknown layer type for serialization: ${layer.type}`);
				return null;
			}
			return `${prefix}:${layer.id}`;
		})
		.filter((segment): segment is string => segment !== null)
		.join('.');
}

/**
 * Parameters for useStackedNavigation composable
 */
export interface UseStackedNavigationParams {
	/**
	 * Called when navigation occurs - module should sync its selection state
	 *
	 * @param target - The layer we're navigating to (null if closing all)
	 * @param context - Navigation context with action type and popped layers
	 *
	 * @example
	 * ```typescript
	 * onNavigate: (target, context) => {
	 *   if (target?.type === 'circle') {
	 *     orgChart.selectCircle(target.id, { skipStackPush: true });
	 *   } else if (target?.type === 'role') {
	 *     orgChart.selectRole(target.id, 'circle-panel', { skipStackPush: true });
	 *   } else {
	 *     orgChart.selectCircle(null);
	 *   }
	 * }
	 * ```
	 */
	onNavigate: (target: NavigationLayer | null, context: NavigationContext) => void;

	/**
	 * Optional edit protection configuration
	 * When provided, navigation will be blocked if edit mode is active and dirty
	 */
	editProtection?: EditProtection;

	/**
	 * Enable URL synchronization (default: false)
	 * When enabled, navigation state is reflected in URL and URL changes update navigation
	 */
	enableUrlSync?: boolean;

	/**
	 * Convex client instance for permission checks
	 * Required when enablePermissionChecks is true
	 */
	convex?: ConvexClient;

	/**
	 * Session ID for permission checks
	 * Required when enablePermissionChecks is true
	 */
	sessionId?: string;

	/**
	 * Enable permission checking (default: false)
	 * When enabled, navigation will validate access before loading layers
	 */
	enablePermissionChecks?: boolean;
}

/**
 * Return type for useStackedNavigation composable
 */
export interface UseStackedNavigationReturn {
	// Stack access
	/** Full navigation stack (reactive) */
	stack: NavigationLayer[];
	/** Current (topmost) layer or null if empty */
	currentLayer: NavigationLayer | null;
	/** Previous layer (one below current) or null */
	previousLayer: NavigationLayer | null;
	/** Current stack depth (number of layers) */
	depth: number;

	// Permission state
	/** Layer that was blocked due to permission check (null if none blocked) */
	blockedLayer: NavigationLayer | null;

	// Navigation actions
	/**
	 * Push a new layer onto the stack
	 * Returns false if max depth reached
	 */
	push: (layer: Omit<NavigationLayer, 'zIndex'>) => boolean;

	/**
	 * Replace current layer with a new one (useful for edit mode transitions)
	 * Example: 'circle' layer → 'edit-circle' layer
	 */
	pushAndReplace: (layer: Omit<NavigationLayer, 'zIndex'>) => boolean;

	/**
	 * Clear all layers from the stack.
	 * Useful when leaving a route that owns stacked-panel state (prevents "sticky" panels across pages).
	 */
	clear: () => void;

	// Navigation handlers (for StackedPanel props)
	/**
	 * Handle close action (ESC key or close button)
	 * - Checks edit protection
	 * - Pops current layer
	 * - Calls onNavigate with previous layer
	 */
	handleClose: () => void;

	/**
	 * Handle breadcrumb click action
	 * - Checks edit protection
	 * - Jumps to target layer
	 * - Calls onNavigate with target layer
	 */
	handleBreadcrumbClick: (index: number) => void;

	/**
	 * Clear blocked layer (called when user clicks "Go Back" on PermissionGate)
	 */
	clearBlockedLayer: () => void;

	// Helpers
	/**
	 * Check if a specific layer is topmost in the stack
	 * Useful for determining if a panel should respond to ESC key
	 */
	isTopmost: (layerType: string, entityId: string | null) => boolean;

	/**
	 * Check if a layer type exists anywhere in the stack
	 * Optionally check for specific entity ID
	 */
	isInStack: (layerType: string, entityId?: string) => boolean;

	/**
	 * Get the topmost layer of a specific type
	 * Returns null if no layer of that type exists
	 */
	getTopmostLayer: (layerType: string) => NavigationLayer | null;

	/**
	 * Get layer at specific index
	 * Returns null if index out of bounds
	 */
	getLayer: (index: number) => NavigationLayer | null;

	/**
	 * Update layer properties (e.g., name) after data loads
	 * Useful for updating 'Loading...' placeholders from URL navigation
	 */
	updateLayer: (index: number, updates: Partial<Omit<NavigationLayer, 'zIndex'>>) => void;
}

/**
 * Helper function to get stacked navigation from context
 * Used by modules that need access to the shared navigation instance
 *
 * @example
 * ```typescript
 * // In a composable or component
 * const navigation = getStackedNavigation();
 * const selectedCircleId = $derived(
 *   navigation.getTopmostLayer('circle')?.id as Id<'circles'> | null
 * );
 * ```
 */
export function getStackedNavigation(): UseStackedNavigationReturn {
	const navigation = getContext<UseStackedNavigationReturn>('stacked-navigation');
	invariant(
		navigation,
		'[getStackedNavigation] Navigation context not found. Make sure useStackedNavigation is initialized in a parent layout.'
	);
	return navigation;
}

/**
 * Composable for managing stacked panel navigation
 *
 * @example
 * ```typescript
 * const navigation = useStackedNavigation({
 *   onNavigate: (target, context) => {
 *     if (target?.type === 'circle') {
 *       orgChart.selectCircle(target.id, { skipStackPush: true });
 *     } else {
 *       orgChart.selectCircle(null);
 *     }
 *   },
 *   editProtection: {
 *     isActive: () => isEditMode,
 *     isDirty: () => editCircle.isDirty,
 *     onBlock: () => { showDiscardDialog = true; },
 *     onReset: () => {
 *       isEditMode = false;
 *       editCircle.reset();
 *     }
 *   }
 * });
 *
 * // Use in component
 * <StackedPanel
 *   isOpen={isOpen}
 *   navigationStack={navigation.stack}
 *   onClose={navigation.handleClose}
 *   onBreadcrumbClick={navigation.handleBreadcrumbClick}
 * />
 * ```
 */
export function useStackedNavigation(
	params: UseStackedNavigationParams
): UseStackedNavigationReturn {
	const {
		onNavigate,
		editProtection,
		enableUrlSync = false,
		convex,
		sessionId,
		enablePermissionChecks = false
	} = params;

	// Create underlying navigation stack
	const navStack = useNavigationStack();

	// Track if we're currently syncing from URL (prevent infinite loops)
	let isSyncingFromUrl = $state(false);

	// Track if initial URL has been loaded
	let initialUrlLoaded = $state(false);

	// Track blocked layer (for permission gate)
	let blockedLayer = $state<NavigationLayer | null>(null);

	/**
	 * Update URL to reflect current navigation stack
	 *
	 * @param action - 'push' adds new history entry, 'replace' updates current entry
	 */
	function updateUrl(action: 'push' | 'replace'): void {
		if (!browser || !enableUrlSync || isSyncingFromUrl) return;

		const navValue = serializeStack(navStack.stack);
		// Read from window.location (source of truth) to avoid clobbering other query params
		// that may have been written by other URL sync mechanisms.
		const currentUrl = new SvelteURL(window.location.href);

		if (navValue) {
			currentUrl.searchParams.set(NAV_QUERY_PARAM, navValue);
		} else {
			currentUrl.searchParams.delete(NAV_QUERY_PARAM);
		}

		const relativeUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

		// Use SvelteKit navigation helpers (required to keep router + $page in sync)
		if (action === 'push') {
			pushState(relativeUrl, {});
		} else {
			replaceState(relativeUrl, {});
		}
	}

	/**
	 * Sync internal stack to match URL (for browser back/forward)
	 *
	 * @param urlStack - Parsed stack from URL
	 */
	async function syncStackToUrl(urlStack: Omit<NavigationLayer, 'zIndex'>[]): Promise<void> {
		if (!enableUrlSync) return;

		isSyncingFromUrl = true;

		try {
			// Clear current stack
			navStack.clear();
			blockedLayer = null;

			// Validate permissions if enabled
			const { accessibleStack, blockedLayer: blocked } = await validateStackPermissions(urlStack);

			// Rebuild accessible stack
			for (const layer of accessibleStack) {
				navStack.push(layer);
			}

			// Set blocked layer if any
			if (blocked) {
				blockedLayer = { ...blocked, zIndex: navStack.depth * 10 + 60 };
			}

			// Notify module to sync selection state
			const targetLayer = navStack.currentLayer;
			onNavigate(targetLayer, {
				action: 'back',
				poppedLayers: []
			});
		} finally {
			isSyncingFromUrl = false;
		}
	}

	/**
	 * Validate stack permissions (eager check, lazy load)
	 * Returns accessible stack and first blocked layer (if any)
	 */
	async function validateStackPermissions(
		intendedStack: Omit<NavigationLayer, 'zIndex'>[]
	): Promise<{
		accessibleStack: Omit<NavigationLayer, 'zIndex'>[];
		blockedLayer: Omit<NavigationLayer, 'zIndex'> | null;
	}> {
		if (!enablePermissionChecks || !convex || !sessionId) {
			// Permission checks disabled, allow all layers
			return { accessibleStack: intendedStack, blockedLayer: null };
		}

		const accessibleStack: Omit<NavigationLayer, 'zIndex'>[] = [];
		let firstBlockedLayer: Omit<NavigationLayer, 'zIndex'> | null = null;

		// Check in order, stop at first block
		for (const layer of intendedStack) {
			const hasAccess = await checkLayerAccess(convex, layer.type, layer.id, sessionId);

			if (hasAccess) {
				accessibleStack.push(layer);
			} else {
				firstBlockedLayer = layer;
				break; // Don't check children of blocked layers
			}
		}

		return { accessibleStack, blockedLayer: firstBlockedLayer };
	}

	/**
	 * Initialize navigation stack from URL on first load
	 */
	async function initializeFromUrl(navParam: string): Promise<void> {
		if (!enableUrlSync || initialUrlLoaded) return;

		const urlStack = parseNavParam(navParam);
		if (urlStack.length === 0) return;

		isSyncingFromUrl = true;

		try {
			// Validate permissions if enabled
			const { accessibleStack, blockedLayer: blocked } = await validateStackPermissions(urlStack);

			// Build accessible stack
			for (const layer of accessibleStack) {
				navStack.push(layer);
			}

			// Set blocked layer if any
			if (blocked) {
				blockedLayer = { ...blocked, zIndex: navStack.depth * 10 + 60 };
			}

			// Notify module to sync selection state
			const targetLayer = navStack.currentLayer;
			if (targetLayer) {
				onNavigate(targetLayer, {
					action: 'back',
					poppedLayers: []
				});
			}

			initialUrlLoaded = true;
		} finally {
			isSyncingFromUrl = false;
		}
	}

	/**
	 * Check edit protection before navigation
	 * Returns true if navigation should be blocked
	 */
	function checkEditProtection(): boolean {
		if (!editProtection) return false;

		if (editProtection.isActive() && editProtection.isDirty()) {
			editProtection.onBlock();
			return true;
		}

		return false;
	}

	/**
	 * Reset edit mode if active
	 */
	function resetEditMode(): void {
		if (editProtection?.isActive()) {
			editProtection.onReset();
		}
	}

	/**
	 * Push a new layer onto the stack
	 * Enforces max depth limit
	 */
	function push(layer: Omit<NavigationLayer, 'zIndex'>): boolean {
		if (navStack.depth >= MAX_STACK_DEPTH) {
			console.warn(`[StackedNavigation] Max depth (${MAX_STACK_DEPTH}) reached. Push rejected.`);
			return false;
		}

		navStack.push(layer);

		// Sync URL (push creates new history entry)
		updateUrl('push');

		return true;
	}

	/**
	 * Replace current layer with a new one
	 * Useful for transitioning between view and edit modes
	 */
	function pushAndReplace(layer: Omit<NavigationLayer, 'zIndex'>): boolean {
		if (navStack.depth === 0) {
			// No layer to replace, just push
			return push(layer);
		}

		if (navStack.depth >= MAX_STACK_DEPTH) {
			console.warn(`[StackedNavigation] Max depth (${MAX_STACK_DEPTH}) reached. Push rejected.`);
			return false;
		}

		// Pop current layer and push new one (without URL update)
		navStack.pop();
		navStack.push(layer);

		// Sync URL once (replace doesn't create new history entry)
		updateUrl('replace');

		return true;
	}

	/**
	 * Clear the navigation stack and sync URL.
	 */
	function clear(): void {
		// Check edit protection
		if (checkEditProtection()) {
			return;
		}

		// Reset edit mode if active
		resetEditMode();

		const poppedLayers = navStack.stack.slice();
		navStack.clear();
		blockedLayer = null;

		// Sync URL (replace current entry)
		updateUrl('replace');

		// Notify module to sync selection state
		onNavigate(null, {
			action: 'close',
			poppedLayers
		});
	}

	/**
	 * Handle close action (ESC key or close button)
	 */
	function handleClose(): void {
		// Check edit protection
		if (checkEditProtection()) {
			return;
		}

		// Reset edit mode if active
		resetEditMode();

		// Get layers before popping
		const poppedLayer = navStack.currentLayer;
		const targetLayer = navStack.previousLayer;

		// Pop current layer
		navStack.pop();

		// Sync URL (pop replaces current entry to match browser back)
		updateUrl('replace');

		// Notify module to sync selection state
		onNavigate(targetLayer, {
			action: 'back',
			poppedLayers: poppedLayer ? [poppedLayer] : []
		});
	}

	/**
	 * Handle breadcrumb click action
	 */
	function handleBreadcrumbClick(index: number): void {
		// Check edit protection
		if (checkEditProtection()) {
			return;
		}

		// Reset edit mode if active
		resetEditMode();

		// Get target layer and layers that will be removed
		const targetLayer = navStack.getLayer(index);
		if (!targetLayer) return;

		const poppedLayers = navStack.stack.slice(index + 1);

		// Jump to target layer
		navStack.jumpTo(index);

		// Sync URL (jump replaces current entry)
		updateUrl('replace');

		// Notify module to sync selection state
		onNavigate(targetLayer, {
			action: 'jump',
			poppedLayers
		});
	}

	/**
	 * Check if a specific layer is topmost
	 */
	function isTopmost(layerType: string, entityId: string | null): boolean {
		const current = navStack.currentLayer;
		if (!current) return false;
		return current.type === layerType && current.id === entityId;
	}

	/**
	 * Check if a layer type exists in the stack
	 */
	function isInStack(layerType: string, entityId?: string): boolean {
		return navStack.stack.some(
			(layer) => layer.type === layerType && (entityId === undefined || layer.id === entityId)
		);
	}

	/**
	 * Get the topmost layer of a specific type
	 */
	function getTopmostLayer(layerType: string): NavigationLayer | null {
		// Search from end to start (topmost first)
		for (let i = navStack.stack.length - 1; i >= 0; i--) {
			if (navStack.stack[i].type === layerType) {
				return navStack.stack[i];
			}
		}
		return null;
	}

	/**
	 * Clear blocked layer (called when user clicks "Go Back" on PermissionGate)
	 */
	function clearBlockedLayer(): void {
		blockedLayer = null;
	}

	// Initialize from URL on first load and handle browser back/forward
	$effect(() => {
		if (!browser || !enableUrlSync) return;

		// Initialize from URL on first load
		if (!initialUrlLoaded && navStack.depth === 0) {
			const navParam = new SvelteURL(window.location.href).searchParams.get(NAV_QUERY_PARAM);
			if (navParam) {
				initializeFromUrl(navParam);
			}
		}

		// Handle browser back/forward (popstate event)
		const handlePopstate = () => {
			if (!enableUrlSync) return;

			const currentUrl = new SvelteURL(window.location.href);
			const navParam = currentUrl.searchParams.get(NAV_QUERY_PARAM);
			const urlStack = parseNavParam(navParam ?? '');

			// Sync internal stack to match URL
			syncStackToUrl(urlStack);
		};

		window.addEventListener('popstate', handlePopstate);

		return () => {
			window.removeEventListener('popstate', handlePopstate);
		};
	});

	return {
		// Stack access (reactive getters)
		get stack() {
			return navStack.stack;
		},
		get currentLayer() {
			return navStack.currentLayer;
		},
		get previousLayer() {
			return navStack.previousLayer;
		},
		get depth() {
			return navStack.depth;
		},

		// Permission state
		get blockedLayer() {
			return blockedLayer;
		},

		// Navigation actions
		push,
		pushAndReplace,
		clear,

		// Navigation handlers
		handleClose,
		handleBreadcrumbClick,
		clearBlockedLayer,

		// Helpers
		isTopmost,
		isInStack,
		getTopmostLayer,
		getLayer: navStack.getLayer,
		updateLayer: navStack.updateLayer
	};
}
