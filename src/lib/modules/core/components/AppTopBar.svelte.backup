<script lang="ts">
	import OrganizationSwitcher from '$lib/modules/core/organizations/components/OrganizationSwitcher.svelte';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

	let {
		organizations,
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
		organizations: OrganizationsModuleAPI | undefined;
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
	const organizationInvites = $derived(() => {
		if (!organizations) return [];
		return organizations.organizationInvites ?? [];
	});
	const organizationSummaries = $derived(() => {
		if (!organizations) return [];
		return organizations.organizations ?? [];
	});
	const activeOrganizationId = $derived(() => {
		if (!organizations) return null;
		return organizations.activeOrganizationId ?? null;
	});

	if (!onSidebarToggle) {
		onSidebarToggle = () => {};
	}
</script>

{#if isMobile}
	<header
		class="flex items-center justify-between gap-2 border-b border-subtle bg-surface"
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
			<OrganizationSwitcher
				organizations={organizationSummaries()}
				activeOrganizationId={activeOrganizationId()}
				organizationInvites={organizationInvites()}
				{accountName}
				{accountEmail}
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
		class="flex items-center justify-between gap-2 border-b border-subtle bg-surface"
		style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
	>
		<div class="flex items-center gap-2">
			<span class="text-label text-tertiary">
				📁 TEST TEST {workspaceName}
			</span>
		</div>
	</header>
{/if}
