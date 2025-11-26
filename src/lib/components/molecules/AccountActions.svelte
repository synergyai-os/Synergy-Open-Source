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
		class="w-full cursor-pointer rounded-button px-input py-stack-item text-left text-primary transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle"
		textValue="Settings"
		onSelect={() => {
			onSettings?.();
			onClose?.();
		}}
	>
		<Text variant="body" size="sm" color="default" as="span">⚙️ Settings</Text>
	</DropdownMenu.Item>
	<DropdownMenu.Item
		class="w-full cursor-pointer rounded-button px-input py-stack-item text-left text-primary transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle"
		textValue="Invite members"
		onSelect={() => {
			onInviteMembers?.();
			onClose?.();
		}}
	>
		<Text variant="body" size="sm" color="default" as="span">➕ Invite members</Text>
	</DropdownMenu.Item>
</div>
