<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Icon, Text } from '$lib/components/atoms';

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
</script>

<!-- New workspace -->
<DropdownMenu.Item
	class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle {className}"
	textValue="New workspace"
	onSelect={() => {
		onCreateWorkspace?.();
		onClose?.();
	}}
>
	<div class="flex items-center gap-header">
		<Icon type="add" size="sm" class="text-brand" />
		<Text variant="body" size="sm" color="default" as="span">New workspace</Text>
	</div>
</DropdownMenu.Item>

<!-- Create organization -->
<DropdownMenu.Item
	class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle {className}"
	textValue="Create organization"
	onSelect={() => {
		onCreateOrganization?.();
		onClose?.();
	}}
>
	<div class="flex items-center gap-header">
		<Text variant="body" size="base" as="span" class="leading-none text-brand">✦</Text>
		<Text variant="body" size="sm" color="default" as="span">Create organization</Text>
	</div>
</DropdownMenu.Item>

<!-- Join organization -->
<DropdownMenu.Item
	class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle {className}"
	textValue="Join organization"
	onSelect={() => {
		onJoinOrganization?.();
		onClose?.();
	}}
>
	<div class="flex items-center gap-header">
		<Icon type="add" size="sm" class="text-secondary" />
		<Text variant="body" size="sm" color="default" as="span">Join organization</Text>
	</div>
</DropdownMenu.Item>
