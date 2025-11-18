<script lang="ts">
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import ActionMenu from '$lib/components/ui/ActionMenu.svelte';

	type Props = {
		title: string;
		count?: number;
		onEdit?: () => void;
		onAdd?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void }>;
	};

	let { title, count, onEdit, onAdd, menuItems = [] }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
	<h4 class="text-sm font-semibold text-primary">
		{title}
		{#if count !== undefined}
			<span class="ml-1 text-xs font-normal text-tertiary">({count})</span>
		{/if}
	</h4>
	<div class="flex items-center gap-1">
		{#if onEdit}
			{#snippet editIcon()}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			{/snippet}
			<IconButton icon={editIcon} onclick={onEdit} ariaLabel="Edit {title}" />
		{/if}
		{#if onAdd}
			{#snippet addIcon()}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
					/>
				</svg>
			{/snippet}
			<IconButton icon={addIcon} onclick={onAdd} ariaLabel="Add to {title}" />
		{/if}
		{#if menuItems.length > 0}
			<ActionMenu items={menuItems} />
		{/if}
	</div>
</div>
