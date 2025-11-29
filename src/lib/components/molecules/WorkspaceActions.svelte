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
		<Icon type="add" size="sm" color="primary" />
		<Text variant="body" size="sm" color="default" as="span">New workspace</Text>
	</div>
</DropdownMenu.Item>

<!-- Create workspace -->
<DropdownMenu.Item
	class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle {className}"
	textValue="Create workspace"
	onSelect={() => {
		onCreateOrganization?.();
		onClose?.();
	}}
>
	<div class="flex items-center gap-header">
		<Text variant="body" size="base" as="span" class="leading-none text-brand">✦</Text>
		<Text variant="body" size="sm" color="default" as="span">Create workspace</Text>
	</div>
</DropdownMenu.Item>

<!-- Join workspace -->
<DropdownMenu.Item
	class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle {className}"
	textValue="Join workspace"
	onSelect={() => {
		onJoinOrganization?.();
		onClose?.();
	}}
>
	<div class="flex items-center gap-header">
		<Icon type="add" size="sm" color="secondary" />
		<Text variant="body" size="sm" color="default" as="span">Join workspace</Text>
	</div>
</DropdownMenu.Item>
