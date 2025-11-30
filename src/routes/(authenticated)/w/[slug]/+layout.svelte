<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { setContext } from 'svelte';
	import { useWorkspaces } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type {
		WorkspaceSummary,
		WorkspaceInvite
	} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

	let { children, data } = $props();

	// Get workspace from server-side data (resolved by +layout.server.ts)
	const workspaceFromRoute = $derived(data.workspace as WorkspaceSummary | null);
	const workspaceSlug = $derived(data.workspaceSlug as string | null);

	// Reactively get slug from URL params (updates on navigation)
	const urlSlug = $derived($page.params.slug as string | undefined);

	// Initialize workspaces composable with server-side preloaded data
	// The workspace from route will be synced via URL sync composable
	const workspaces = useWorkspaces({
		userId: () => data.user?.userId,
		sessionId: () => data.sessionId,
		orgFromUrl: () => null, // Path-based routing, no query params
		// Server-side preloaded data for instant workspace menu rendering
		initialOrganizations: data.workspaces as unknown as WorkspaceSummary[],
		initialOrganizationInvites: data.workspaceInvites as unknown as WorkspaceInvite[]
	});

	// Sync workspace from route to active workspace
	// This ensures the workspace from the URL slug is set as active
	// Reacts to both data changes (server-side) and URL param changes (client-side navigation)
	$effect(() => {
		if (!browser) return;
		if (!workspaces) return;

		// Use workspace from route data if available (server-side loaded)
		if (workspaceFromRoute) {
			// Only set if different from current active workspace
			if (workspaces.activeWorkspaceId !== workspaceFromRoute.workspaceId) {
				console.log('🔄 [LAYOUT] Syncing workspace from route data:', {
					slug: workspaceSlug,
					workspaceId: workspaceFromRoute.workspaceId,
					workspaceName: workspaceFromRoute.name
				});
				workspaces.setActiveWorkspace(workspaceFromRoute.workspaceId);
			}
		} else if (urlSlug && workspaces.workspaces) {
			// Fallback: find workspace by slug from URL if route data not available yet
			const workspaceBySlug = workspaces.workspaces.find((w) => w.slug === urlSlug);
			if (workspaceBySlug && workspaces.activeWorkspaceId !== workspaceBySlug.workspaceId) {
				console.log('🔄 [LAYOUT] Syncing workspace from URL slug:', {
					slug: urlSlug,
					workspaceId: workspaceBySlug.workspaceId,
					workspaceName: workspaceBySlug.name
				});
				workspaces.setActiveWorkspace(workspaceBySlug.workspaceId);
			}
		}
	});

	setContext('workspaces', workspaces);

	// Reactive page title based on active workspace and current route
	const activeWorkspace = $derived(workspaces?.activeWorkspace);
	const currentPath = $derived($page.url.pathname);

	// Extract page name from path (e.g., /w/purposepilot/inbox -> "Inbox")
	const pageName = $derived.by(() => {
		const pathParts = currentPath.split('/').filter(Boolean);
		if (pathParts.length >= 3 && pathParts[0] === 'w') {
			const page = pathParts[2];
			// Capitalize first letter
			return page.charAt(0).toUpperCase() + page.slice(1);
		}
		return null;
	});

	const pageTitle = $derived.by(() => {
		const parts: string[] = [];
		if (pageName) {
			parts.push(pageName);
		}
		if (activeWorkspace) {
			parts.push(activeWorkspace.name);
		}
		parts.push('SynergyOS');
		return parts.join(' - ');
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{@render children()}
