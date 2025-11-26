<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Avatar, Text } from '$lib/components/atoms';
	import AccountMenu from './AccountMenu.svelte';

	type Organization = {
		organizationId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
	};

	type LinkedAccount = {
		userId: string;
		email: string | null;
		name: string | null;
		organizations?: Organization[];
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

	const organizations = $derived(account.organizations ?? []);
</script>

<DropdownMenu.Separator class="my-stack-divider border-base border-t" />

<div class="px-input py-stack-header flex items-center justify-between {className}">
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
		onClose={onClose}
	/>
</div>

{#if organizations.length > 0}
	{#each organizations as organization (`${organization.organizationId}-${account.userId}`)}
		<DropdownMenu.Item
			class="mx-1 flex cursor-pointer items-center justify-between rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle"
			textValue={organization.name}
			onSelect={() => {
				// Switch to linked account and navigate to organization
				onSwitchAccount?.(account.userId, `/inbox?org=${organization.organizationId}`);
				onClose?.();
			}}
		>
			<div class="flex min-w-0 flex-1 items-center gap-header">
				<Avatar
					initials={organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
					size="sm"
					variant="default"
					class="flex-shrink-0"
				/>
				<div class="flex min-w-0 flex-col">
					<Text
						variant="body"
						size="sm"
						color="default"
						as="span"
						class="truncate font-medium"
					>
						{organization.name}
					</Text>
					<Text
						variant="label"
						size="sm"
						color="tertiary"
						as="span"
						class="truncate capitalize"
					>
						{organization.role}
					</Text>
				</div>
			</div>
			<!-- No checkmark for linked account workspaces - clicking switches accounts -->
		</DropdownMenu.Item>
	{/each}
{/if}

