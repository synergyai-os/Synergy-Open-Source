<script lang="ts">
	import { Button, Icon } from '$lib/components/atoms';
	import { SplitButton } from '$lib/components/molecules';
	import { ActionMenu } from '$lib/components/molecules';

	type Props = {
		circleName: string;
		onClose: () => void;
		onEdit?: () => void;
		addMenuItems?: Array<{ label: string; onclick: () => void }>;
		headerMenuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
	};

	let { circleName, onClose, onEdit, addMenuItems = [], headerMenuItems = [] }: Props = $props();
</script>

<header
	class="h-system-header border-base px-inbox-container py-system-header flex flex-shrink-0 items-center justify-between border-b"
>
	<h2 class="text-h3 font-semibold text-primary">{circleName}</h2>
	<div class="flex items-center gap-2">
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
				class="px-card text-button hover:bg-hover-solid rounded-button border border-accent-primary bg-white py-input-y font-medium text-accent-primary transition-colors"
				onclick={onEdit}
			>
				Edit circle
			</button>
		{/if}
		{#if headerMenuItems.length > 0}
			<ActionMenu items={headerMenuItems} />
		{/if}
		<Button variant="ghost" size="md" iconOnly onclick={onClose} ariaLabel="Close panel">
			{#snippet children()}
				<Icon type="close" size="md" />
			{/snippet}
		</Button>
	</div>
</header>
