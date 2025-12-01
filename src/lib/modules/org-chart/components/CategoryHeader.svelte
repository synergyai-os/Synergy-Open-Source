<script lang="ts">
	import { Button, Icon, Text } from '$lib/components/atoms';
	import { ActionMenu } from '$lib/components/molecules';
	import {
		categoryHeaderRecipe,
		type CategoryHeaderVariantProps
	} from '$lib/design-system/recipes';

	type Props = CategoryHeaderVariantProps & {
		title: string;
		count?: number;
		onEdit?: () => void;
		onAdd?: () => void;
		menuItems?: Array<{ label: string; onclick: () => void }>;
		class?: string;
	};

	let {
		variant = 'default',
		title,
		count,
		onEdit,
		onAdd,
		menuItems = [],
		class: className = ''
	}: Props = $props();

	const containerClasses = $derived([categoryHeaderRecipe({ variant }), className]);
</script>

<div class={containerClasses}>
	<div class="flex items-center gap-fieldGroup">
		<Text variant="label" size="md" color="primary" weight="semibold" as="h4">
			{title}
		</Text>
		{#if count !== undefined}
			<Text variant="label" size="sm" color="tertiary" weight="normal" as="span">
				({count})
			</Text>
		{/if}
	</div>
	<div class="flex items-center gap-fieldGroup">
		{#if onEdit}
			<Button variant="ghost" size="sm" iconOnly onclick={onEdit} ariaLabel="Edit {title}">
				<Icon type="edit" size="sm" />
			</Button>
		{/if}
		{#if onAdd}
			<Button variant="ghost" size="sm" iconOnly onclick={onAdd} ariaLabel="Add to {title}">
				<Icon type="add" size="sm" />
			</Button>
		{/if}
		{#if menuItems.length > 0}
			<ActionMenu items={menuItems} />
		{/if}
	</div>
</div>
