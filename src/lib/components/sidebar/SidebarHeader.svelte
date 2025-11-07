<script lang="ts">
    import { getContext } from 'svelte';
    import OrganizationSwitcher from '../organizations/OrganizationSwitcher.svelte';
    import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	type Props = {
		workspaceName?: string;
		onSettings?: () => void;
		onLogout?: () => void;
		onSearch?: () => void;
		onEdit?: () => void;
		isMobile?: boolean;
		sidebarCollapsed?: boolean;
		isHovered?: boolean;
	};

	let {
		workspaceName = 'Axon',
		onSettings,
		onLogout,
		onSearch,
		onEdit,
		isMobile = false,
		sidebarCollapsed = false,
		isHovered = false
	}: Props = $props();
    const organizations = getContext<UseOrganizations | undefined>('organizations');

    const organizationInvites = $derived(() => organizations?.organizationInvites ?? []);
    const teamInvites = $derived(() => organizations?.teamInvites ?? []);
</script>

<!-- Sticky Header -->
<div class="sticky top-0 z-10 bg-sidebar border-b border-sidebar px-header py-system-header h-system-header flex items-center justify-between flex-shrink-0">
	<div class="flex items-center gap-icon">
			<!-- Workspace Menu with Logo and Name -->
            {#if !sidebarCollapsed || (isMobile && !sidebarCollapsed) || (isHovered && !isMobile)}
                <div class="flex-1 min-w-0">
                    {#if organizations}
                        <OrganizationSwitcher
                            organizations={organizations.organizations}
                            activeOrganizationId={organizations.activeOrganizationId}
                            organizationInvites={organizationInvites()}
                            teamInvites={teamInvites()}
                            onSelectOrganization={(organizationId) => organizations.setActiveOrganization(organizationId)}
                            onCreateOrganization={() => organizations.openModal('createOrganization')}
                            onJoinOrganization={() => organizations.openModal('joinOrganization')}
                            onAcceptOrganizationInvite={(inviteId) => organizations.acceptOrganizationInvite(inviteId)}
                            onDeclineOrganizationInvite={(inviteId) => organizations.declineOrganizationInvite(inviteId)}
                            onAcceptTeamInvite={(inviteId) => organizations.acceptTeamInvite(inviteId)}
                            onDeclineTeamInvite={(inviteId) => organizations.declineTeamInvite(inviteId)}
                            sidebarCollapsed={sidebarCollapsed}
                            variant="sidebar"
                        />
                    {:else}
                        <div class="flex items-center gap-icon-wide">
                            <div class="w-7 h-7 rounded-md bg-sidebar-hover flex items-center justify-center text-xs font-semibold text-sidebar-primary shadow-sm">
                                {workspaceName.slice(0, 2).toUpperCase()}
                            </div>
                            <span class="font-medium text-sm text-sidebar-primary truncate">{workspaceName}</span>
                        </div>
                    {/if}
                </div>

				<!-- Action Icons (Search and Edit) -->
				<div class="flex items-center gap-0.5">
					<button
						type="button"
						onclick={() => onSearch?.()}
						class="p-1.5 rounded hover:bg-sidebar-hover-solid transition-colors text-sidebar-secondary hover:text-sidebar-primary"
						aria-label="Search"
					>
						<svg
							class="w-4 h-4"
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
						class="p-1.5 rounded hover:bg-sidebar-hover-solid transition-colors text-sidebar-secondary hover:text-sidebar-primary"
						aria-label="Edit"
					>
						<svg
							class="w-4 h-4"
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
</div>

<style>
	/* Sticky positioning is handled by the sticky class */
</style>

