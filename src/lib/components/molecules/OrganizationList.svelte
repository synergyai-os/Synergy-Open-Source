<script lang="ts">
	import OrganizationItem from './OrganizationItem.svelte';

	type Organization = {
		organizationId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
	};

	type Props = {
		organizations: Organization[];
		activeOrganizationId?: string | null;
		onSelect?: (organizationId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let {
		organizations,
		activeOrganizationId = null,
		onSelect,
		onClose,
		class: className = ''
	}: Props = $props();
</script>

{#each organizations as organization (organization.organizationId)}
	<OrganizationItem
		{organization}
		isActive={organization.organizationId === activeOrganizationId}
		{onSelect}
		{onClose}
		class={className}
	/>
{/each}

