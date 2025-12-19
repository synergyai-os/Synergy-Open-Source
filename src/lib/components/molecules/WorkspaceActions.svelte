<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Icon, Text } from '$lib/components/atoms';
	import { dropdownMenuItemRecipe } from '$lib/design-system/recipes';

	type Props = {
		onCreateWorkspace?: () => void;
		onCreateOrganization?: () => void;
		onJoinOrganization?: () => void;
		onClose?: () => void;
		class?: string;
	};

	let {
		onCreateWorkspace,
		onCreateOrganization,
		onJoinOrganization,
		onClose,
		class: className = ''
	}: Props = $props();

	// Apply dropdown menu item recipe
	const menuItemClasses = $derived([dropdownMenuItemRecipe(), className]);
</script>

<!-- New workspace -->
<DropdownMenu.Item
	class={menuItemClasses}
	textValue="New workspace"
	onSelect={() => {
		onCreateWorkspace?.();
		onClose?.();
	}}
>
	<div class="gap-header flex items-center">
		<Icon type="add" size="sm" color="primary" />
		<Text variant="body" size="sm" color="default" as="span">New workspace</Text>
	</div>
</DropdownMenu.Item>

<!-- Create workspace -->
<DropdownMenu.Item
	class={menuItemClasses}
	textValue="Create workspace"
	onSelect={() => {
		onCreateOrganization?.();
		onClose?.();
	}}
>
	<div class="gap-header flex items-center">
		<Text variant="body" size="base" as="span" class="text-brand leading-none">✦</Text>
		<Text variant="body" size="sm" color="default" as="span">Create workspace</Text>
	</div>
</DropdownMenu.Item>

<!-- Join workspace -->
<DropdownMenu.Item
	class={menuItemClasses}
	textValue="Join workspace"
	onSelect={() => {
		onJoinOrganization?.();
		onClose?.();
	}}
>
	<div class="gap-header flex items-center">
		<Icon type="add" size="sm" color="secondary" />
		<Text variant="body" size="sm" color="default" as="span">Join workspace</Text>
	</div>
</DropdownMenu.Item>
