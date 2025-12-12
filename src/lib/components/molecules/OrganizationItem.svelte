<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Avatar, Text } from '$lib/components/atoms';
	import { organizationItemRecipe } from '$lib/design-system/recipes';

	type Props = {
		workspace: {
			workspaceId: string;
			name: string;
			initials?: string;
			role: 'owner' | 'admin' | 'member';
		};
		isActive?: boolean;
		onSelect?: (workspaceId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let { workspace, isActive = false, onSelect, onClose, class: className = '' }: Props = $props();

	const classes = $derived([organizationItemRecipe({ active: isActive }), className]);
</script>

<DropdownMenu.Item
	class={classes}
	textValue={workspace.name}
	onSelect={() => {
		onSelect?.(workspace.workspaceId);
		onClose?.();
	}}
>
	<div class="gap-header flex min-w-0 flex-1 items-center">
		<Avatar
			initials={workspace.initials ?? workspace.name.slice(0, 2).toUpperCase()}
			size="sm"
			variant="default"
			class="flex-shrink-0"
		/>
		<div class="flex min-w-0 flex-col">
			<Text variant="body" size="sm" color="default" as="span" class="truncate font-medium">
				{workspace.name}
			</Text>
			<Text variant="label" size="sm" color="tertiary" as="span" class="truncate capitalize">
				{workspace.role}
			</Text>
		</div>
	</div>
	{#if isActive}
		<!-- WORKAROUND: checkmark icon missing from registry - see missing-styles.md -->
		<svg
			class="icon-sm text-brand flex-shrink-0"
			style="width: 16px; height: 16px;"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	{/if}
</DropdownMenu.Item>
