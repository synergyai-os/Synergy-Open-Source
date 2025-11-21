<script lang="ts">
	import { getContext } from 'svelte';
	import OrganizationSwitcher from '$lib/modules/core/organizations/components/OrganizationSwitcher.svelte';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

	type OrganizationInfo = {
		organizationId: string;
		name: string;
		initials?: string;
		slug?: string;
		role: 'owner' | 'admin' | 'member';
	} & Record<string, unknown>;

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
		onCreateWorkspaceForAccount?: (targetUserId: string) => void;
		onJoinWorkspaceForAccount?: (targetUserId: string) => void;
		onAddAccount?: () => void;
		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void;
		onLogout?: () => void;
		onLogoutAccount?: (targetUserId: string) => void;
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
		onCreateWorkspaceForAccount,
		onJoinWorkspaceForAccount,
		onAddAccount,
		onSwitchAccount,
		onLogout,
		onLogoutAccount,
		onSearch,
		onEdit,
		isMobile = false,
		sidebarCollapsed = false,
		isHovered = false
	}: Props = $props();
	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228, svelte-reactivity.md#L910 for full pattern documentation
	const organizationInvites = $derived(() => {
		if (!organizations) return [];
		return organizations.organizationInvites ?? [];
	});
	const organizationSummaries = $derived(() => {
		if (!organizations) {
			console.log('🔍 [SidebarHeader] No organizations context');
			return [];
		}
		const orgs = organizations.organizations ?? [];
		console.log('🔍 [SidebarHeader] Organization summaries:', {
			hasOrganizations: !!organizations,
			orgsLength: orgs.length,
			orgs: orgs.map((o) => ({ id: o?.organizationId, name: o?.name }))
		});
		return orgs;
	});
	const activeOrganizationId = $derived(() => {
		if (!organizations) return null;
		return organizations.activeOrganizationId ?? null;
	});
	const activeOrganization = $derived(() => {
		if (!organizations) return null;
		return organizations.activeOrganization ?? null;
	});
	const isLoading = $derived(() => {
		if (!organizations) return false;
		return organizations.isLoading ?? false;
	});
</script>

<!-- Sticky Header -->
<div
	class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between gap-icon border-b border-sidebar bg-sidebar px-header py-system-header"
>
	{#if !sidebarCollapsed || (isMobile && !sidebarCollapsed) || (isHovered && !isMobile)}
		<!-- Workspace Menu with Logo and Name - Takes remaining space -->
		<div class="min-w-0 flex-1">
			<OrganizationSwitcher
				organizations={organizationSummaries()}
				activeOrganizationId={activeOrganizationId()}
				activeOrganization={activeOrganization()}
				organizationInvites={organizationInvites()}
				{accountEmail}
				accountName={workspaceName}
				{linkedAccounts}
				{sidebarCollapsed}
				variant="sidebar"
				isLoading={isLoading()}
				onSelectOrganization={(organizationId) =>
					organizations?.setActiveOrganization(organizationId)}
				onCreateOrganization={() => organizations?.openModal('createOrganization')}
				onJoinOrganization={() => organizations?.openModal('joinOrganization')}
				onAcceptOrganizationInvite={(code) => organizations?.acceptOrganizationInvite(code)}
				onDeclineOrganizationInvite={(inviteId) =>
					organizations?.declineOrganizationInvite(inviteId)}
				onSettings={() => onSettings?.()}
				onInviteMembers={() => onInviteMembers?.()}
				onSwitchWorkspace={() => onSwitchWorkspace?.()}
				onCreateWorkspace={() => onCreateWorkspace?.()}
				onCreateWorkspaceForAccount={(targetUserId) => onCreateWorkspaceForAccount?.(targetUserId)}
				onJoinWorkspaceForAccount={(targetUserId) => onJoinWorkspaceForAccount?.(targetUserId)}
				onAddAccount={() => onAddAccount?.()}
				onSwitchAccount={(targetUserId, redirectTo) => onSwitchAccount?.(targetUserId, redirectTo)}
				onLogout={() => onLogout?.()}
				onLogoutAccount={(targetUserId) => onLogoutAccount?.(targetUserId)}
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
