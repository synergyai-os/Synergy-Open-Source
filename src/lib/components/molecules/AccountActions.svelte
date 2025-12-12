<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Text } from '$lib/components/atoms';

	type Props = {
		onSettings?: () => void;
		onInviteMembers?: () => void;
		onClose?: () => void;
		class?: string;
	};

	let { onSettings, onInviteMembers, onClose, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col px-1 {className}">
	<DropdownMenu.Item
		class="rounded-button px-input py-stack-item text-primary hover:bg-subtle focus:bg-subtle w-full cursor-pointer text-left transition-all duration-200 outline-none"
		textValue="Settings"
		onSelect={() => {
			onSettings?.();
			onClose?.();
		}}
	>
		<Text variant="body" size="sm" color="default" as="span">⚙️ Settings</Text>
	</DropdownMenu.Item>
	<DropdownMenu.Item
		class="rounded-button px-input py-stack-item text-primary hover:bg-subtle focus:bg-subtle w-full cursor-pointer text-left transition-all duration-200 outline-none"
		textValue="Invite members"
		onSelect={() => {
			onInviteMembers?.();
			onClose?.();
		}}
	>
		<Text variant="body" size="sm" color="default" as="span">➕ Invite members</Text>
	</DropdownMenu.Item>
</div>
