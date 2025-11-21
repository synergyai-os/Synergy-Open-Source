<script lang="ts">
	import { Avatar } from '$lib/components/atoms';
	import { IconButton } from '$lib/components/atoms';
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
	class="p-card flex w-full items-center gap-icon rounded-card bg-surface text-left transition-colors hover:bg-hover-solid"
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
		<div class="gap-control-item flex items-center" role="group">
			{#if onEdit}
				{#snippet editIcon()}
					<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				{/snippet}
				<IconButton
					icon={editIcon}
					onclick={(e) => {
						e?.stopPropagation();
						onEdit();
					}}
					ariaLabel="Edit {name}"
				/>
			{/if}
			{#if menuItems.length > 0}
				<ActionMenu items={menuItems} />
			{/if}
		</div>
	{/if}
</button>
