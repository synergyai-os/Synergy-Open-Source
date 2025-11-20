<script lang="ts">
	import SplitButton from '$lib/components/ui/SplitButton.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import ActionMenu from '$lib/components/ui/ActionMenu.svelte';

	type Props = {
		roleName: string;
		onClose: () => void;
		onEdit?: () => void;
		addMenuItems?: Array<{ label: string; onclick: () => void }>;
		headerMenuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
	};

	let { roleName, onClose, onEdit, addMenuItems = [], headerMenuItems = [] }: Props = $props();
</script>

<header
	class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
>
	<h2 class="text-lg font-semibold text-primary">{roleName}</h2>
	<div class="flex items-center gap-icon">
		{#if addMenuItems.length > 0}
			<SplitButton
				primaryLabel="Add"
				primaryOnclick={() => {
					/* Default add action - use first menu item */
					if (addMenuItems.length > 0) {
						addMenuItems[0].onclick();
					}
				}}
				dropdownItems={addMenuItems}
			/>
		{/if}
		{#if onEdit}
			<button
				type="button"
				class="rounded-md border border-accent-primary bg-white px-4 py-2 text-sm font-medium text-accent-primary transition-colors hover:bg-hover-solid"
				onclick={onEdit}
			>
				Edit role
			</button>
		{/if}
		{#if headerMenuItems.length > 0}
			<ActionMenu items={headerMenuItems} />
		{/if}
		{#snippet closeIcon()}
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		{/snippet}
		<IconButton icon={closeIcon} onclick={onClose} ariaLabel="Close panel" />
	</div>
</header>
