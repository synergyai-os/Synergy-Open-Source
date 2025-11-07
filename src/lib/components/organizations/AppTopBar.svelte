<script lang="ts">
  import OrganizationSwitcher from './OrganizationSwitcher.svelte';
  import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

  let {
    organizations,
    isMobile = false,
    sidebarCollapsed = false,
    onSidebarToggle
  }: {
    organizations: UseOrganizations | undefined;
    isMobile?: boolean;
    sidebarCollapsed?: boolean;
    onSidebarToggle?: () => void;
  } = $props();

  const organizationInvites = $derived(() => organizations?.organizationInvites ?? []);
  const teamInvites = $derived(() => organizations?.teamInvites ?? []);

  if (!onSidebarToggle) {
    onSidebarToggle = () => {};
  }
</script>

{#if isMobile}
  <header class="bg-surface border-b border-base px-inbox-container py-system-header h-system-header flex items-center justify-between gap-icon">
    <button
      type="button"
      class="w-9 h-9 rounded-md flex items-center justify-center bg-sidebar hover:bg-sidebar-hover text-sidebar-primary"
      onclick={() => onSidebarToggle?.()}
      aria-label={sidebarCollapsed ? 'Open navigation' : 'Close navigation'}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sidebarCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'} />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <OrganizationSwitcher
        organizations={organizations?.organizations ?? []}
        activeOrganizationId={organizations?.activeOrganizationId ?? null}
        organizationInvites={organizationInvites()}
        teamInvites={teamInvites()}
        onSelectOrganization={(organizationId) => organizations?.setActiveOrganization(organizationId)}
        onCreateOrganization={() => organizations?.openModal('createOrganization')}
        onJoinOrganization={() => organizations?.openModal('joinOrganization')}
        onAcceptOrganizationInvite={(code) => organizations?.acceptOrganizationInvite(code)}
        onDeclineOrganizationInvite={(inviteId) => organizations?.declineOrganizationInvite(inviteId)}
        onAcceptTeamInvite={(code) => organizations?.acceptTeamInvite(code)}
        onDeclineTeamInvite={(inviteId) => organizations?.declineTeamInvite(inviteId)}
        variant="topbar"
      />
    </div>

    <div class="w-9 h-9" aria-hidden="true"></div>
  </header>
{/if}

