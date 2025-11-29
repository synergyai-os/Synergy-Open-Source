<script lang="ts">
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
</script>

{#each workspaces as workspace (workspace.workspaceId)}
	<OrganizationItem
		{workspace}
		isActive={workspace.workspaceId === activeWorkspaceId}
		{onSelect}
		{onClose}
		class={className}
	/>
{/each}
