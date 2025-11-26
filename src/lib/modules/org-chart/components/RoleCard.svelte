<script lang="ts">
	import { Avatar, Button, Icon } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';

	type Props = {
		name: string;
		purpose?: string;
		fillerCount?: number;
		onClick: () => void;
		onEdit?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
	};

	let { name, purpose, fillerCount = 0, onClick, onEdit, menuItems = [] }: Props = $props();

	function getInitials(text: string): string {
		return text
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<button
	type="button"
	class="p-card flex w-full items-center gap-2 rounded-card bg-surface text-left transition-colors hover:bg-hover-solid"
	onclick={onClick}
>
	<Avatar initials={getInitials(name)} size="md" />
	<div class="min-w-0 flex-1">
		<p class="truncate text-button font-medium text-primary">{name}</p>
		{#if purpose}
			<p class="truncate text-label text-secondary">{purpose}</p>
		{:else}
			<p class="text-label text-tertiary">
				{fillerCount} filler{fillerCount !== 1 ? 's' : ''}
			</p>
		{/if}
	</div>
	{#if onEdit || menuItems.length > 0}
		<div class="flex items-center" style="gap: var(--spacing-1);" role="group">
			{#if onEdit}
				<Button
					variant="ghost"
					size="sm"
					iconOnly
					onclick={(e) => {
						e?.stopPropagation();
						onEdit();
					}}
					ariaLabel="Edit {name}"
				>
					{#snippet children()}
						<Icon type="edit" size="sm" />
					{/snippet}
				</Button>
			{/if}
			{#if menuItems.length > 0}
				<ActionMenu items={menuItems} />
			{/if}
		</div>
	{/if}
</button>
