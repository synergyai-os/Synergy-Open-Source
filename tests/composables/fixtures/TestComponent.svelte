<!--
  Test Component Wrapper for useWorkspaces Composable
  
  This component wraps the useWorkspaces composable so it can be tested
  in a browser environment using vitest-browser-svelte
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { setupConvex } from 'convex-svelte';
	import { useWorkspaces } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type {
		UseOrganizations,
		WorkspaceSummary,
		WorkspaceInvite
	} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

	// Setup Convex client for testing (required by convex-svelte)
	if (browser) {
		setupConvex('https://mock-convex-url.convex.cloud');
	}

	let {
		userId: userIdProp = () => undefined,
		sessionId: sessionIdProp = () => undefined,
		orgFromUrl: orgFromUrlProp = () => null,
		initialOrganizations = [],
		initialOrganizationInvites = []
	}: {
		userId?: () => string | undefined;
		sessionId?: () => string | undefined;
		orgFromUrl?: () => string | null;
		initialOrganizations?: WorkspaceSummary[];
		initialOrganizationInvites?: WorkspaceInvite[];
	} = $props();

	// Create reactive wrappers that call the prop functions
	// This ensures Svelte tracks prop changes correctly
	const userId = () => userIdProp();
	const sessionId = () => sessionIdProp();
	const orgFromUrl = () => orgFromUrlProp();

	const orgs = useWorkspaces({
		userId,
		sessionId,
		orgFromUrl,
		initialOrganizations,
		initialOrganizationInvites
	});

	// Expose composable instance for testing via getter
	export function getComposableInstance(): UseOrganizations {
		return orgs;
	}
</script>

<!-- Empty component - we're just testing the composable, not rendering UI -->
<div data-testid="test-component">Test Component</div>
