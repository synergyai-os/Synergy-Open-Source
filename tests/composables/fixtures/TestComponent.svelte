<!--
  Test Component Wrapper for useOrganizations Composable
  
  This component wraps the useOrganizations composable so it can be tested
  in a browser environment using vitest-browser-svelte
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { setupConvex } from 'convex-svelte';
	import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
	import type {
		UseOrganizations,
		OrganizationSummary,
		OrganizationInvite,
		TeamInvite,
		TeamSummary
	} from '$lib/composables/useOrganizations.svelte';

	// Setup Convex client for testing (required by convex-svelte)
	if (browser) {
		setupConvex('https://mock-convex-url.convex.cloud');
	}

	let {
		userId: userIdProp = () => undefined,
		sessionId: sessionIdProp = () => undefined,
		orgFromUrl: orgFromUrlProp = () => null,
		initialOrganizations = [],
		initialOrganizationInvites = [],
		initialTeamInvites = [],
		initialTeams = []
	}: {
		userId?: () => string | undefined;
		sessionId?: () => string | undefined;
		orgFromUrl?: () => string | null;
		initialOrganizations?: OrganizationSummary[];
		initialOrganizationInvites?: OrganizationInvite[];
		initialTeamInvites?: TeamInvite[];
		initialTeams?: TeamSummary[];
	} = $props();

	// Create reactive wrappers that call the prop functions
	// This ensures Svelte tracks prop changes correctly
	const userId = () => userIdProp();
	const sessionId = () => sessionIdProp();
	const orgFromUrl = () => orgFromUrlProp();

	const orgs = useOrganizations({
		userId,
		sessionId,
		orgFromUrl,
		initialOrganizations,
		initialOrganizationInvites,
		initialTeamInvites,
		initialTeams
	});

	// Expose composable instance for testing via getter
	export function getComposableInstance(): UseOrganizations {
		return orgs;
	}
</script>

<!-- Empty component - we're just testing the composable, not rendering UI -->
<div data-testid="test-component">Test Component</div>
