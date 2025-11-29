<script lang="ts">
	import { Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';

	type Props = {
		title: string;
		count?: number;
		onEdit?: () => void;
		onAdd?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void }>;
	};

	let { title, count, onEdit, onAdd, menuItems = [] }: Props = $props();
</script>

<div class="px-card py-nav-item flex items-center justify-between rounded-card bg-surface">
	<h4 class="text-button font-semibold text-primary">
		{title}
		{#if count !== undefined}
			<span class="ml-form-field-gap text-label font-normal text-tertiary">({count})</span>
		{/if}
	</h4>
	<div class="flex items-center" style="gap: var(--spacing-1);">
		{#if onEdit}
			<Button variant="ghost" size="sm" iconOnly onclick={onEdit} ariaLabel="Edit {title}">
				{#snippet children()}
					<Icon type="edit" size="sm" />
				{/snippet}
			</Button>
		{/if}
		{#if onAdd}
			<Button variant="ghost" size="sm" iconOnly onclick={onAdd} ariaLabel="Add to {title}">
				{#snippet children()}
					<Icon type="add" size="sm" />
				{/snippet}
			</Button>
		{/if}
		{#if menuItems.length > 0}
			<ActionMenu items={menuItems} />
		{/if}
	</div>
</div>
