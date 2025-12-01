<script lang="ts">
	import { Button, Heading, Icon } from '$lib/components/atoms';
	import { SplitButton } from '$lib/components/molecules';
	import { ActionMenu } from '$lib/components/molecules';
	import { panelDetailHeaderRecipe } from '$lib/design-system/recipes';

	type Props = {
		circleName: string;
		onClose: () => void;
		onEdit?: () => void;
		addMenuItems?: Array<{ label: string; onclick: () => void }>;
		headerMenuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		class?: string;
	};

	let {
		circleName,
		onClose,
		onEdit,
		addMenuItems = [],
		headerMenuItems = [],
		class: className = ''
	}: Props = $props();

	const headerClasses = $derived([panelDetailHeaderRecipe(), className]);
</script>

<!--
	Panel Detail Header
	- Height: 2.5rem (40px) - Standard panel header height for consistent vertical rhythm
	- Padding: Uses panelDetailHeaderRecipe (px-panelDetailHeader = 16px horizontal, py-panelDetailHeader = 36px vertical)
	- Styling: Recipe handles border, background, and padding
-->
<header class={headerClasses} style="height: 2.5rem;">
	<Heading level={3} color="primary">
		{circleName}
	</Heading>
	<div class="flex items-center gap-button">
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
			<Button variant="outline" size="md" onclick={onEdit}>
				{#snippet children()}
					Edit circle
				{/snippet}
			</Button>
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
