<script lang="ts">
	import { Button, Heading, Icon } from '$lib/components/atoms';
	import { SplitButton } from '$lib/components/molecules';
	import { ActionMenu } from '$lib/components/molecules';
	import { panelDetailHeaderRecipe } from '$lib/design-system/recipes';
	import type { Snippet } from 'svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';

	type Props = {
		// Required
		entityName: string;
		onClose: () => void;

		// Optional - editing
		canEdit?: boolean;
		editReason?: string;
		onEdit?: () => void;
		onNameChange?: (name: string) => Promise<void>;

		// Optional - navigation
		onBack?: () => void;
		showBackButton?: boolean;

		// Optional - menus
		addMenuItems?: Array<{ label: string; onclick: () => void }>;
		headerMenuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;

		// Optional - badges (use either titleBadges for circles or authorityBadge for roles)
		titleBadges?: Snippet;
		authorityBadge?: Snippet;

		class?: string;
	};

	let {
		entityName,
		onClose,
		canEdit = false,
		editReason,
		onEdit,
		onNameChange,
		onBack,
		showBackButton = false,
		addMenuItems = [],
		headerMenuItems = [],
		titleBadges,
		authorityBadge,
		class: className = ''
	}: Props = $props();

	const headerClasses = $derived([panelDetailHeaderRecipe(), className]);
</script>

<!--
	Panel Detail Header - Unified component for Circle and Role detail panels
	- Height: 2.5rem (40px) - Standard panel header height for consistent vertical rhythm
	- Padding: Uses panelDetailHeaderRecipe (px-panelDetailHeader = 16px horizontal, py-panelDetailHeader = 36px vertical)
	- Styling: Recipe handles background (bg-surface) and padding
	- Badge slots: Use titleBadges for circle type badges, authorityBadge for role authority badge
-->
<header class={headerClasses} style="height: 2.5rem;">
	<div class="gap-button flex items-center">
		{#if showBackButton && onBack}
			<Button variant="ghost" size="md" iconOnly onclick={onBack} ariaLabel="Go back">
				<Icon type="chevron-left" size="md" />
			</Button>
		{/if}
		<div class="gap-button flex items-center">
			{#if canEdit && onNameChange}
				<InlineEditText
					value={entityName}
					onSave={onNameChange}
					placeholder="Name"
					size="md"
					className="font-medium"
				/>
			{:else if editReason && onNameChange}
				<EditPermissionTooltip reason={editReason}>
					<Heading level={3} color="primary">
						{entityName}
					</Heading>
				</EditPermissionTooltip>
			{:else}
				<Heading level={3} color="primary">
					{entityName}
				</Heading>
			{/if}
			{@render titleBadges?.()}
			{@render authorityBadge?.()}
		</div>
	</div>
	<div class="gap-button flex items-center">
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
			<Button variant="outline" size="md" onclick={onEdit}>Edit</Button>
		{/if}
		{#if headerMenuItems.length > 0}
			<ActionMenu items={headerMenuItems} />
		{/if}
		<Button variant="ghost" size="md" iconOnly onclick={onClose} ariaLabel="Close panel">
			<Icon type="close" size="md" />
		</Button>
	</div>
</header>

