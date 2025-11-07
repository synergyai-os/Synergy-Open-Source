<script lang="ts">
  import { DropdownMenu } from 'bits-ui';
  import type {
    OrganizationInvite,
    OrganizationSummary,
    TeamInvite
  } from '$lib/composables/useOrganizations.svelte';

  type Variant = 'sidebar' | 'topbar';

  let {
    organizations = [] as OrganizationSummary[],
    activeOrganizationId = null as string | null,
    organizationInvites = [] as OrganizationInvite[],
    teamInvites = [] as TeamInvite[],
    variant = 'sidebar' as Variant,
    onSelectOrganization,
    onCreateOrganization,
    onJoinOrganization,
    onAcceptOrganizationInvite,
    onDeclineOrganizationInvite,
    onAcceptTeamInvite,
    onDeclineTeamInvite,
    sidebarCollapsed = false
  }: {
    organizations?: OrganizationSummary[];
    activeOrganizationId?: string | null;
    organizationInvites?: OrganizationInvite[];
    teamInvites?: TeamInvite[];
    variant?: Variant;
    onSelectOrganization?: (organizationId: string) => void;
    onCreateOrganization?: () => void;
    onJoinOrganization?: () => void;
    onAcceptOrganizationInvite?: (code: string) => void;
    onDeclineOrganizationInvite?: (inviteId: string) => void;
    onAcceptTeamInvite?: (code: string) => void;
    onDeclineTeamInvite?: (inviteId: string) => void;
    sidebarCollapsed?: boolean;
  } = $props();

  const activeOrganization = $derived(() =>
    organizations.find((org) => org.organizationId === activeOrganizationId) ?? organizations[0] ?? null
  );

  const showLabels = $derived(() => variant === 'topbar' || !sidebarCollapsed);

  function handleSelect(organizationId: string) {
    onSelectOrganization?.(organizationId);
  }

  function handleCreateOrganization() {
    onCreateOrganization?.();
  }

  function handleJoinOrganization() {
    onJoinOrganization?.();
  }

  function handleAcceptOrganizationInvite(code: string) {
    onAcceptOrganizationInvite?.(code);
  }

  function handleDeclineOrganizationInvite(inviteId: string) {
    onDeclineOrganizationInvite?.(inviteId);
  }

  function handleAcceptTeamInvite(code: string) {
    onAcceptTeamInvite?.(code);
  }

  function handleDeclineTeamInvite(inviteId: string) {
    onDeclineTeamInvite?.(inviteId);
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    type="button"
    class={`flex items-center ${showLabels() ? 'gap-icon-wide px-nav-item py-nav-item' : 'p-2'} rounded-md hover:bg-sidebar-hover-solid transition-colors w-full text-left group`}
  >
    <div class={`flex items-center ${showLabels() ? 'gap-icon-wide flex-1 min-w-0' : ''}`}>
      <div
        class={`rounded-md flex items-center justify-center flex-shrink-0 text-xs font-semibold shadow-sm ${
          variant === 'topbar'
            ? 'w-8 h-8 bg-accent-primary text-on-solid'
            : 'w-7 h-7 bg-sidebar-hover text-sidebar-primary'
        }`}
      >
        {activeOrganization()?.initials ?? '—'}
      </div>
      {#if showLabels()}
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-sm text-sidebar-primary truncate">
            {activeOrganization()?.name ?? 'Select organization'}
          </span>
          <span class="text-label text-sidebar-tertiary truncate">
            {activeOrganization()?.role === 'owner'
              ? 'Owner'
              : activeOrganization()?.role === 'admin'
                ? 'Admin'
                : 'Member'}
          </span>
        </div>
      {/if}
      <svg
        class={`w-3.5 h-3.5 text-sidebar-secondary flex-shrink-0 transition-transform duration-200 ml-auto ${
          showLabels() ? 'group-hover:text-sidebar-primary' : ''
        }`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </DropdownMenu.Trigger>

  <DropdownMenu.Portal>
    <DropdownMenu.Content
      class="bg-elevated rounded-md shadow-lg border border-base min-w-[220px] py-1 z-50"
      side="bottom"
      align={variant === 'topbar' ? 'center' : 'start'}
      sideOffset={6}
    >
      <div class="px-menu-item py-menu-item">
        <p class="text-label text-tertiary uppercase tracking-wide text-xs">Your organizations</p>
      </div>

      {#each organizations as organization (organization.organizationId)}
        <DropdownMenu.Item
          class={`px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none rounded-none ${
            organization.organizationId === activeOrganizationId ? 'bg-hover-subtle text-primary' : ''
          }`}
          textValue={organization.name}
          onSelect={() => handleSelect(organization.organizationId)}
        >
          <div class="flex items-center gap-icon-wide min-w-0">
            <div class="w-7 h-7 rounded-md bg-sidebar-hover flex items-center justify-center text-xs font-semibold text-sidebar-primary shadow-sm flex-shrink-0">
              {organization.initials}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-medium truncate">{organization.name}</span>
              <span class="text-label text-tertiary truncate capitalize">{organization.role}</span>
            </div>
          </div>
          {#if organization.organizationId === activeOrganizationId}
            <svg class="w-4 h-4 text-accent-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </DropdownMenu.Item>
      {/each}

      {#if organizationInvites.length}
        <DropdownMenu.Separator class="my-1 border-t border-base" />
        <div class="px-menu-item py-menu-item">
          <p class="text-label text-tertiary uppercase tracking-wide text-xs">Organization invites</p>
        </div>
        {#each organizationInvites as invite (invite.inviteId)}
          <div class="px-menu-item py-menu-item">
            <div class="flex items-start gap-icon-wide">
              <div class="w-7 h-7 rounded-md bg-sidebar-hover flex items-center justify-center text-xs font-semibold text-sidebar-primary shadow-sm flex-shrink-0">
                {invite.organizationName.slice(0, 2).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-icon">
                  <span class="font-medium text-sm text-primary truncate">{invite.organizationName}</span>
                  <span class="text-label text-tertiary">{invite.role}</span>
                </div>
                <p class="text-label text-secondary truncate">Invited by {invite.invitedBy}</p>
                <div class="flex gap-1 mt-2">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md bg-accent-primary text-on-solid text-xs font-medium"
                    onclick={() => handleAcceptOrganizationInvite(invite.code)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md border border-base text-xs font-medium text-secondary hover:text-primary"
                  onclick={() => handleDeclineOrganizationInvite(invite.inviteId)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}

      {#if teamInvites.length}
        <DropdownMenu.Separator class="my-1 border-t border-base" />
        <div class="px-menu-item py-menu-item">
          <p class="text-label text-tertiary uppercase tracking-wide text-xs">Team invites</p>
        </div>
        {#each teamInvites as invite (invite.inviteId)}
          <div class="px-menu-item py-menu-item">
            <div class="flex items-start gap-icon-wide">
              <div class="w-7 h-7 rounded-md bg-sidebar-hover flex items-center justify-center text-xs font-semibold text-sidebar-primary shadow-sm flex-shrink-0">
                {invite.teamName.slice(0, 2).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-icon">
                  <span class="font-medium text-sm text-primary truncate">{invite.teamName}</span>
                  <span class="text-label text-tertiary truncate">{invite.organizationName}</span>
                </div>
                <p class="text-label text-secondary truncate">Invited by {invite.invitedBy}</p>
                <div class="flex gap-1 mt-2">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md bg-accent-primary text-on-solid text-xs font-medium"
                    onclick={() => handleAcceptTeamInvite(invite.code)}
                  >
                    Join team
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md border border-base text-xs font-medium text-secondary hover:text-primary"
                  onclick={() => handleDeclineTeamInvite(invite.inviteId)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}

      <DropdownMenu.Separator class="my-1 border-t border-base" />

      <DropdownMenu.Item
        class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none"
        textValue="Create organization"
        onSelect={handleCreateOrganization}
      >
        <div class="flex items-center gap-icon-wide">
          <span class="text-lg leading-none">✦</span>
          <span class="font-medium">Create organization</span>
        </div>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none"
        textValue="Join organization"
        onSelect={handleJoinOrganization}
      >
        <div class="flex items-center gap-icon-wide">
          <span class="text-lg leading-none">➕</span>
          <span class="font-medium">Join organization</span>
        </div>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

