<script lang="ts">
	import { Button, Heading, Icon } from '$lib/components/atoms';
	import { SplitButton } from '$lib/components/molecules';
	import { ActionMenu } from '$lib/components/molecules';
	import { panelDetailHeaderRecipe } from '$lib/design-system/recipes';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';

	type Props = {
		roleName: string;
		canEdit?: boolean;
		editReason?: string;
		onNameChange?: (name: string) => Promise<void>;
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
		canEdit = false,
		editReason,
		onNameChange,
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
	- Styling: Recipe handles background (bg-surface) and padding
-->
<header class={headerClasses} style="height: 2.5rem;">
	<div class="gap-button flex items-center">
		{#if showBackButton && onBack}
			<Button variant="ghost" size="md" iconOnly onclick={onBack} ariaLabel="Go back">
				<Icon type="chevron-left" size="md" />
			</Button>
		{/if}
		{#if canEdit && onNameChange}
			<InlineEditText
				value={roleName}
				onSave={onNameChange}
				placeholder="Role name"
				size="md"
				className="font-medium"
			/>
		{:else if editReason && onNameChange}
			<EditPermissionTooltip reason={editReason}>
				<Heading level={3} color="primary">
					{roleName}
				</Heading>
			</EditPermissionTooltip>
		{:else}
			<Heading level={3} color="primary">
				{roleName}
			</Heading>
		{/if}
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
			<Button variant="outline" size="md" onclick={onEdit}>Edit role</Button>
		{/if}
		{#if headerMenuItems.length > 0}
			<ActionMenu items={headerMenuItems} />
		{/if}
		<Button variant="ghost" size="md" iconOnly onclick={onClose} ariaLabel="Close panel">
			<Icon type="close" size="md" />
		</Button>
	</div>
</header>
