<script lang="ts">
	import { getContext } from 'svelte';
	import WorkspaceSwitcher from '$lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte';
	import { Icon, FormInput } from '$lib/components/atoms';
	import { StandardDialog } from '$lib/components/organisms';
	import { sidebarHeaderRecipe, sidebarIconButtonRecipe } from '$lib/design-system/recipes';
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
		onCreateWorkspace: _onCreateWorkspace,
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
			return [];
		}
		return workspaces.workspaces ?? [];
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

	// Apply recipes for styling
	const headerClasses = $derived(sidebarHeaderRecipe());
	const iconButtonClasses = $derived(sidebarIconButtonRecipe({ size: 'md' }));

	// Create workspace dialog state
	let showCreateWorkspaceDialog = $state(false);
	let newWorkspaceName = $state('');

	const handleCreateWorkspace = async () => {
		if (!workspaces || !newWorkspaceName.trim()) return;
		try {
			await workspaces.createWorkspace({ name: newWorkspaceName.trim() });
			showCreateWorkspaceDialog = false;
			newWorkspaceName = '';
		} catch (_error) {
			// Error handling is done in the mutation handler (toast shown)
			// Keep dialog open so user can retry
		}
	};
</script>

<!--
	Sticky Header - Compact, no border, aligned with nav items
	
	WORKAROUND: Inline padding since no semantic token exists for sidebar-header-padding yet
	Using --spacing-2 (8px) to match original design and keep compact sidebar aesthetic
	TODO: Add semantic token (e.g., spacing.sidebar.header) when expanding token system
-->
<div
	class={headerClasses}
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
				onCreateOrganization={() => {
					showCreateWorkspaceDialog = true;
				}}
				onCreateWorkspace={() => {
					showCreateWorkspaceDialog = true;
				}}
				onJoinOrganization={() => {
					// TODO: Implement join workspace dialog
				}}
				onAcceptOrganizationInvite={(code) => workspaces?.acceptOrganizationInvite(code)}
				onDeclineOrganizationInvite={(inviteId) => workspaces?.declineOrganizationInvite(inviteId)}
				onSettings={() => onSettings?.()}
				onInviteMembers={() => onInviteMembers?.()}
				onSwitchWorkspace={() => onSwitchWorkspace?.()}
				onCreateWorkspaceForAccount={(targetUserId) => onCreateWorkspaceForAccount?.(targetUserId)}
				onJoinWorkspaceForAccount={(targetUserId) => onJoinWorkspaceForAccount?.(targetUserId)}
				onAddAccount={() => onAddAccount?.()}
				onSwitchAccount={(targetUserId, redirectTo) => onSwitchAccount?.(targetUserId, redirectTo)}
				onLogout={() => onLogout?.()}
				onLogoutAccount={(targetUserId) => onLogoutAccount?.(targetUserId)}
			/>
		</div>

		<!-- Action Icons (Search and Edit) - Always on the right -->
		<div class="gap-fieldGroup flex flex-shrink-0 items-center">
			<button
				type="button"
				onclick={() => onSearch?.()}
				class={iconButtonClasses}
				aria-label="Search"
			>
				<Icon type="search" size="sm" color="secondary" />
			</button>
			<button type="button" onclick={() => onEdit?.()} class={iconButtonClasses} aria-label="Edit">
				<Icon type="edit" size="sm" color="secondary" />
			</button>
		</div>
	{/if}
</div>

<!-- Create Workspace Dialog -->
<StandardDialog
	bind:open={showCreateWorkspaceDialog}
	title="Create workspace"
	description="Spin up a new workspace for another company or product team."
	submitLabel="Create"
	loading={workspaces?.loading.createWorkspace ?? false}
	onsubmit={handleCreateWorkspace}
	onclose={() => {
		newWorkspaceName = '';
	}}
>
	<div class="gap-form flex flex-col">
		<FormInput
			label="Organization name"
			bind:value={newWorkspaceName}
			placeholder="e.g. SynergyOS Labs"
			required
			min="2"
		/>
	</div>
</StandardDialog>
