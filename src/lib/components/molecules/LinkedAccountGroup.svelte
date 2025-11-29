<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Avatar, Text } from '$lib/components/atoms';
	import AccountMenu from './AccountMenu.svelte';

	type Organization = {
		workspaceId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
	};

	type LinkedAccount = {
		userId: string;
		email: string | null;
		name: string | null;
		workspaces?: Organization[];
	};

	type Props = {
		account: LinkedAccount;
		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void;
		onCreateWorkspace?: (targetUserId: string) => void;
		onJoinWorkspace?: (targetUserId: string) => void;
		onLogout?: (targetUserId: string) => void;
		onClose?: () => void;
		class?: string;
	};

	let {
		account,
		onSwitchAccount,
		onCreateWorkspace,
		onJoinWorkspace,
		onLogout,
		onClose,
		class: className = ''
	}: Props = $props();

	const workspaces = $derived(account.workspaces ?? []);
</script>

<DropdownMenu.Separator class="border-base my-stack-divider border-t" />

<div class="flex items-center justify-between px-input py-stack-header {className}">
	<Text
		variant="label"
		size="sm"
		color="tertiary"
		as="p"
		class="truncate font-semibold tracking-wide uppercase"
	>
		{account.email ?? account.name ?? 'Linked account'}
	</Text>
	<AccountMenu
		accountEmail={account.email ?? account.name ?? 'Linked account'}
		{onCreateWorkspace}
		{onJoinWorkspace}
		{onLogout}
		targetUserId={account.userId}
		{onClose}
	/>
</div>

{#if workspaces.length > 0}
	{#each workspaces as workspace (`${workspace.workspaceId}-${account.userId}`)}
		<DropdownMenu.Item
			class="mx-1 flex cursor-pointer items-center justify-between rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle"
			textValue={workspace.name}
			onSelect={() => {
				// Switch to linked account and navigate to workspace
				onSwitchAccount?.(account.userId, `/inbox?org=${workspace.workspaceId}`);
				onClose?.();
			}}
		>
			<div class="flex min-w-0 flex-1 items-center gap-header">
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
			<!-- No checkmark for linked account workspaces - clicking switches accounts -->
		</DropdownMenu.Item>
	{/each}
{/if}
