<script lang="ts">
	import { getContext } from 'svelte';
	import WorkspaceSwitcher from '$lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

	type OrganizationInfo = {
		workspaceId: string;
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
		workspaces?: OrganizationInfo[];
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
		workspaceName = 'SynergyOS',
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
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228, svelte-reactivity.md#L910 for full pattern documentation
	const workspaceInvites = $derived(() => {
		if (!workspaces) return [];
		return workspaces.workspaceInvites ?? [];
	});
	const organizationSummaries = $derived(() => {
		if (!workspaces) {
			console.log('🔍 [SidebarHeader] No workspaces context');
			return [];
		}
		const orgs = workspaces.workspaces ?? [];
		console.log('🔍 [SidebarHeader] Organization summaries:', {
			hasOrganizations: !!workspaces,
			orgsLength: orgs.length,
			orgs: orgs.map((o) => ({ id: o?.workspaceId, name: o?.name }))
		});
		return orgs;
	});
	const activeWorkspaceId = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspaceId ?? null;
	});
	const activeWorkspace = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspace ?? null;
	});
	const isLoading = $derived(() => {
		if (!workspaces) return false;
		return workspaces.isLoading ?? false;
	});
</script>

<!-- Sticky Header - Compact, no border, aligned with nav items -->
<div
	class="bg-sidebar sticky top-0 z-10 flex flex-shrink-0 items-center justify-between gap-2"
	style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
>
	{#if !sidebarCollapsed || (isMobile && !sidebarCollapsed) || (isHovered && !isMobile)}
		<!-- Workspace Menu with Logo and Name - Takes remaining space -->
		<div class="min-w-0 flex-1">
			<WorkspaceSwitcher
				workspaces={organizationSummaries()}
				activeWorkspaceId={activeWorkspaceId()}
				activeWorkspace={activeWorkspace()}
				workspaceInvites={workspaceInvites()}
				{accountEmail}
				accountName={workspaceName}
				{linkedAccounts}
				{sidebarCollapsed}
				variant="sidebar"
				isLoading={isLoading()}
				onSelectOrganization={(workspaceId) => workspaces?.setActiveWorkspace(workspaceId)}
				onCreateOrganization={() => workspaces?.openModal('createWorkspace')}
				onJoinOrganization={() => workspaces?.openModal('joinOrganization')}
				onAcceptOrganizationInvite={(code) => workspaces?.acceptOrganizationInvite(code)}
				onDeclineOrganizationInvite={(inviteId) => workspaces?.declineOrganizationInvite(inviteId)}
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
				class="rounded-button p-1.5 text-secondary transition-all duration-200 hover:bg-subtle hover:text-primary"
				aria-label="Search"
			>
				<svg
					class="size-icon-sm"
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
				class="rounded-button p-1.5 text-secondary transition-all duration-200 hover:bg-subtle hover:text-primary"
				aria-label="Edit"
			>
				<svg
					class="size-icon-sm"
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
