<!--
  Test Component Wrapper for Inbox Composables
  
  This component wraps inbox composables so they can be tested
  in a browser environment using vitest-browser-svelte
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { setupConvex } from 'convex-svelte';
	import { useInboxItems } from '$lib/modules/inbox/composables/useInboxItems.svelte';
	import { useSelectedItem } from '$lib/modules/inbox/composables/useSelectedItem.svelte';
	import { useInboxSync } from '$lib/modules/inbox/composables/useInboxSync.svelte';
	import { useKeyboardNavigation } from '$lib/modules/inbox/composables/useKeyboardNavigation.svelte';
	import type { UseInboxItemsReturn } from '$lib/modules/inbox/composables/useInboxItems.svelte';
	import type { UseSelectedItemReturn } from '$lib/modules/inbox/composables/useSelectedItem.svelte';
	import type { UseInboxSyncReturn } from '$lib/modules/inbox/composables/useInboxSync.svelte';
	import type { UseKeyboardNavigationReturn } from '$lib/modules/inbox/composables/useKeyboardNavigation.svelte';
	import type { ConvexClient, InboxApi } from '$lib/types/convex';

	// Setup Convex client for testing (required by convex-svelte)
	if (browser) {
		setupConvex('https://mock-convex-url.convex.cloud');
	}

	let {
		sessionId: sessionIdProp = () => undefined,
		activeWorkspaceId: activeOrganizationIdProp = () => null,
		activeCircleId: activeCircleIdProp = () => null,
		convexClient = null,
		inboxApi = null,
		filteredItems = () => [],
		selectedItemId = () => null,
		onSelectItem = () => {},
		onItemsReload = undefined,
		onClearSelection = undefined
	}: {
		sessionId?: () => string | undefined;
		activeWorkspaceId?: (() => string | null) | string | null;
		activeCircleId?: (() => string | null) | string | null;
		convexClient?: ConvexClient | null;
		inboxApi?: InboxApi | null;
		filteredItems?: () => Array<{ _id: string }>;
		selectedItemId?: () => string | null;
		onSelectItem?: (itemId: string) => void;
		onItemsReload?: () => Promise<void>;
		onClearSelection?: () => void;
	} = $props();

	// Create reactive wrappers that call the prop functions
	const sessionId = () => sessionIdProp();
	const activeWorkspaceId =
		typeof activeOrganizationIdProp === 'function'
			? activeOrganizationIdProp
			: () => activeOrganizationIdProp;
	const activeCircleId =
		typeof activeCircleIdProp === 'function' ? activeCircleIdProp : () => activeCircleIdProp;

	// Create composable instances
	const inboxItems = useInboxItems({
		sessionId,
		activeWorkspaceId,
		activeCircleId
	});

	const selectedItem = useSelectedItem(convexClient, inboxApi, sessionId);

	const inboxSync = useInboxSync(
		convexClient,
		inboxApi,
		sessionId,
		onItemsReload,
		onClearSelection
	);

	const keyboardNav = useKeyboardNavigation(filteredItems, selectedItemId, onSelectItem);

	// Expose composable instances for testing via getters
	export function getInboxItemsInstance(): UseInboxItemsReturn {
		return inboxItems;
	}

	export function getSelectedItemInstance(): UseSelectedItemReturn {
		return selectedItem;
	}

	export function getInboxSyncInstance(): UseInboxSyncReturn {
		return inboxSync;
	}

	export function getKeyboardNavigationInstance(): UseKeyboardNavigationReturn {
		return keyboardNav;
	}
</script>

<!-- Empty component - we're just testing the composables, not rendering UI -->
<div data-testid="inbox-test-component">Inbox Test Component</div>
