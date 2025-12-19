<script lang="ts">
	import WorkspaceSwitcher from '$lib/infrastructure/workspaces/components/WorkspaceSwitcher.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { StandardDialog } from '$lib/components/organisms';
	import { FormInput } from '$lib/components/atoms';

	let {
		workspaces,
		isMobile = false,
		sidebarCollapsed = false,
		onSidebarToggle,
		accountName = 'Workspace',
		accountEmail = 'user@example.com',
		workspaceName = 'Private workspace',
		onSettings,
		onInviteMembers,
		onSwitchWorkspace,
		onCreateWorkspace,
		onAddAccount,
		onLogout
	}: {
		workspaces: WorkspacesModuleAPI | undefined;
		isMobile?: boolean;
		sidebarCollapsed?: boolean;
		onSidebarToggle?: () => void;
		accountName?: string;
		accountEmail?: string;
		workspaceName?: string;
		onSettings?: () => void;
		onInviteMembers?: () => void;
		onSwitchWorkspace?: () => void;
		onCreateWorkspace?: () => void;
		onAddAccount?: () => void;
		onLogout?: () => void;
	} = $props();

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const workspaceInvites = $derived(() => {
		if (!workspaces) return [];
		return workspaces.workspaceInvites ?? [];
	});
	const organizationSummaries = $derived(() => {
		if (!workspaces) return [];
		return workspaces.workspaces ?? [];
	});
	const activeWorkspaceId = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspaceId ?? null;
	});

	if (!onSidebarToggle) {
		onSidebarToggle = () => {};
	}

	// Create workspace dialog state
	let showCreateWorkspaceDialog = $state(false);
	let newWorkspaceName = $state('');

	const handleCreateWorkspace = async () => {
		if (!workspaces || !newWorkspaceName.trim()) return;
		try {
			await workspaces.createWorkspace({ name: newWorkspaceName.trim() });
			showCreateWorkspaceDialog = false;
			newWorkspaceName = '';
		} catch (error) {
			// Error handling is done in the mutation handler (toast shown)
			// Keep dialog open so user can retry
		}
	};
</script>

{#if isMobile}
	<header
		class="border-subtle bg-surface flex items-center justify-between gap-2 border-b"
		style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
	>
		<button
			type="button"
			class="bg-sidebar text-sidebar-primary hover:bg-sidebar-hover flex h-9 w-9 items-center justify-center rounded-md"
			onclick={() => onSidebarToggle?.()}
			aria-label={sidebarCollapsed ? 'Open navigation' : 'Close navigation'}
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={sidebarCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
				/>
			</svg>
		</button>

		<div class="min-w-0 flex-1">
			<WorkspaceSwitcher
				workspaces={organizationSummaries()}
				activeWorkspaceId={activeWorkspaceId()}
				workspaceInvites={workspaceInvites()}
				{accountName}
				{accountEmail}
				onSelectOrganization={(workspaceId) => workspaces?.setActiveWorkspace(workspaceId)}
				onCreateOrganization={() => {
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
				onCreateWorkspace={() => onCreateWorkspace?.()}
				onAddAccount={() => onAddAccount?.()}
				onLogout={() => onLogout?.()}
				variant="topbar"
			/>
		</div>

		<div class="h-9 w-9" aria-hidden="true"></div>
	</header>
{:else}
	<!-- Desktop: Show workspace indicator - compact header with subtle styling -->
	<header
		class="border-subtle bg-surface flex items-center justify-between gap-2 border-b"
		style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
	>
		<div class="flex items-center gap-2">
			<span class="text-label text-tertiary">
				📁 TEST TEST {workspaceName}
			</span>
		</div>
	</header>
{/if}

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
