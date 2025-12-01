<script lang="ts">
	import { Button, Heading, Icon } from '$lib/components/atoms';
	import { SplitButton } from '$lib/components/molecules';
	import { ActionMenu } from '$lib/components/molecules';
	import { panelDetailHeaderRecipe } from '$lib/design-system/recipes';

	type Props = {
		roleName: string;
		onClose: () => void;
		onEdit?: () => void;
		onBack?: () => void;
		showBackButton?: boolean;
		addMenuItems?: Array<{ label: string; onclick: () => void }>;
		headerMenuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
		class?: string;
	};

	let {
		roleName,
		onClose,
		onEdit,
		onBack,
		showBackButton = false,
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
	- Styling: Recipe handles border (border-b border-base), background (bg-surface), and padding
-->
<header class={headerClasses} style="height: 2.5rem;">
	<div class="flex items-center gap-button">
		{#if showBackButton && onBack}
			<Button variant="ghost" size="md" iconOnly onclick={onBack} ariaLabel="Go back">
				{#snippet children()}
					<Icon type="chevron-left" size="md" />
				{/snippet}
			</Button>
		{/if}
		<Heading level={3} color="primary">
			{roleName}
		</Heading>
	</div>
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
					Edit role
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
