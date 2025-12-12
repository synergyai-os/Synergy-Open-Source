<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import OrganizationItem from './OrganizationItem.svelte';

	type Organization = {
		workspaceId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
	};

	type Props = {
		workspaces: Organization[];
		activeWorkspaceId?: string | null;
		onSelect?: (workspaceId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let {
		workspaces,
		activeWorkspaceId = null,
		onSelect,
		onClose,
		class: className = ''
	}: Props = $props();

	// Ensure unique keys for Svelte's keyed each
	const uniqueWorkspaces = $derived.by(() => {
		const seen = new SvelteSet<string>();
		return workspaces.filter((ws) => {
			if (seen.has(ws.workspaceId)) return false;
			seen.add(ws.workspaceId);
			return true;
		});
	});
</script>

{#each uniqueWorkspaces as workspace (workspace.workspaceId)}
	<OrganizationItem
		{workspace}
		isActive={workspace.workspaceId === activeWorkspaceId}
		{onSelect}
		{onClose}
		class={className}
	/>
{/each}
