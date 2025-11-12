<script lang="ts">
	import { getContext } from 'svelte';
	import OrganizationSwitcher from '../organizations/OrganizationSwitcher.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	type OrganizationInfo = {
		organizationId: string;
		name: string;
		initials?: string;
		slug?: string;
		role: 'owner' | 'admin' | 'member';
		[key: string]: any;
	};

	type LinkedAccount = {
		userId: string;
		email: string | null;
		name: string | null;
		firstName: string | null;
		lastName: string | null;
		organizations?: OrganizationInfo[];
	};

	type Props = {
		workspaceName?: string;
		accountEmail?: string;
		linkedAccounts?: LinkedAccount[];
		onSettings?: () => void;
		onInviteMembers?: () => void;
		onSwitchWorkspace?: () => void;
		onCreateWorkspace?: () => void;
		onAddAccount?: () => void;
		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void;
		onLogout?: () => void;
		onSearch?: () => void;
		onEdit?: () => void;
		isMobile?: boolean;
		sidebarCollapsed?: boolean;
		isHovered?: boolean;
	};

	let {
		workspaceName = 'Axon',
		accountEmail = 'user@example.com',
		linkedAccounts = [],
		onSettings,
		onInviteMembers,
		onSwitchWorkspace,
		onCreateWorkspace,
		onAddAccount,
		onSwitchAccount,
		onLogout,
		onSearch,
		onEdit,
		isMobile = false,
		sidebarCollapsed = false,
		isHovered = false
	}: Props = $props();
	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const organizationInvites = $derived(organizations?.organizationInvites ?? []);
	const teamInvites = $derived(organizations?.teamInvites ?? []);
	const organizationSummaries = $derived(organizations?.organizations ?? []);
	const activeOrganizationId = $derived(organizations?.activeOrganizationId ?? null);
	const activeOrganization = $derived(organizations?.activeOrganization ?? null);
	const isLoading = $derived(organizations?.isLoading ?? false);
</script>

<!-- Sticky Header -->
<div
	class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between gap-icon border-b border-sidebar bg-sidebar px-header py-system-header"
>
	{#if !sidebarCollapsed || (isMobile && !sidebarCollapsed) || (isHovered && !isMobile)}
		<!-- Workspace Menu with Logo and Name - Takes remaining space -->
		<div class="min-w-0 flex-1">
			<OrganizationSwitcher
				organizations={organizationSummaries}
				{activeOrganizationId}
				{activeOrganization}
				{organizationInvites}
				{teamInvites}
				{accountEmail}
				accountName={workspaceName}
				{linkedAccounts}
				{sidebarCollapsed}
				variant="sidebar"
				{isLoading}
				onSelectOrganization={(organizationId) =>
					organizations?.setActiveOrganization(organizationId)}
				onCreateOrganization={() => organizations?.openModal('createOrganization')}
				onJoinOrganization={() => organizations?.openModal('joinOrganization')}
				onAcceptOrganizationInvite={(code) => organizations?.acceptOrganizationInvite(code)}
				onDeclineOrganizationInvite={(inviteId) =>
					organizations?.declineOrganizationInvite(inviteId)}
				onAcceptTeamInvite={(code) => organizations?.acceptTeamInvite(code)}
				onDeclineTeamInvite={(inviteId) => organizations?.declineTeamInvite(inviteId)}
				onSettings={() => onSettings?.()}
				onInviteMembers={() => onInviteMembers?.()}
				onSwitchWorkspace={() => onSwitchWorkspace?.()}
				onCreateWorkspace={() => onCreateWorkspace?.()}
				onAddAccount={() => onAddAccount?.()}
				onSwitchAccount={(targetUserId, redirectTo) => onSwitchAccount?.(targetUserId, redirectTo)}
				onLogout={() => onLogout?.()}
			/>
		</div>

		<!-- Action Icons (Search and Edit) - Always on the right -->
		<div class="flex flex-shrink-0 items-center gap-0.5">
			<button
				type="button"
				onclick={() => onSearch?.()}
				class="rounded p-1.5 text-sidebar-secondary transition-colors hover:bg-sidebar-hover-solid hover:text-sidebar-primary"
				aria-label="Search"
			>
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</button>
			<button
				type="button"
				onclick={() => onEdit?.()}
				class="rounded p-1.5 text-sidebar-secondary transition-colors hover:bg-sidebar-hover-solid hover:text-sidebar-primary"
				aria-label="Edit"
			>
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	/* Sticky positioning is handled by the sticky class */
</style>
