<script lang="ts">
  import { DropdownMenu, Switch } from 'bits-ui';
  import type {
    OrganizationInvite,
    OrganizationSummary,
    TeamInvite
  } from '$lib/composables/useOrganizations.svelte';
  import { theme, isDark } from '$lib/stores/theme';

  type Variant = 'sidebar' | 'topbar';

  let {
    organizations = [] as OrganizationSummary[],
    activeOrganizationId = null as string | null,
    organizationInvites = [] as OrganizationInvite[],
    teamInvites = [] as TeamInvite[],
    accountEmail = 'user@example.com',
    accountName = 'Personal workspace',
    variant = 'sidebar' as Variant,
    sidebarCollapsed = false,
    onSelectOrganization,
    onCreateOrganization,
    onJoinOrganization,
    onAcceptOrganizationInvite,
    onDeclineOrganizationInvite,
    onAcceptTeamInvite,
    onDeclineTeamInvite,
    onSettings,
    onInviteMembers,
    onSwitchWorkspace,
    onCreateWorkspace,
    onAddAccount,
    onLogout
  }: {
    organizations?: OrganizationSummary[];
    activeOrganizationId?: string | null;
    organizationInvites?: OrganizationInvite[];
    teamInvites?: TeamInvite[];
    accountEmail?: string;
    accountName?: string;
    variant?: Variant;
    sidebarCollapsed?: boolean;
    onSelectOrganization?: (organizationId: string | null) => void;
    onCreateOrganization?: () => void;
    onJoinOrganization?: () => void;
    onAcceptOrganizationInvite?: (code: string) => void;
    onDeclineOrganizationInvite?: (inviteId: string) => void;
    onAcceptTeamInvite?: (code: string) => void;
    onDeclineTeamInvite?: (inviteId: string) => void;
    onSettings?: () => void;
    onInviteMembers?: () => void;
    onSwitchWorkspace?: () => void;
    onCreateWorkspace?: () => void;
    onAddAccount?: () => void;
    onLogout?: () => void;
  } = $props();

  const hasOrganizations = $derived(() => organizations.length > 0);
  const activeOrganization = $derived(() =>
    organizations.find((org) => org.organizationId === activeOrganizationId) ?? null
  );
  const showLabels = $derived(() => variant === 'topbar' || !sidebarCollapsed);
  const isPersonalActive = $derived(() => !activeOrganizationId);
  const triggerInitials = $derived(() =>
    isPersonalActive()
      ? (accountName.slice(0, 2) || 'PW').toUpperCase()
      : activeOrganization()?.initials ?? '—'
  );
  const triggerTitle = $derived(() =>
    isPersonalActive() ? accountName : activeOrganization()?.name ?? 'Select workspace'
  );
  const triggerSubtitle = $derived(() =>
    isPersonalActive()
      ? accountEmail
      : activeOrganization()?.role === 'owner'
        ? 'Owner'
        : activeOrganization()?.role === 'admin'
          ? 'Admin'
          : 'Member'
  );

  function handleSelect(organizationId: string | null) {
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

  function handleSettings() {
    onSettings?.();
  }

  function handleInviteMembers() {
    onInviteMembers?.();
  }

  function handleCreateWorkspace() {
    onCreateWorkspace?.();
  }

  function handleAddAccount() {
    onAddAccount?.();
  }

  function handleLogout() {
    onLogout?.();
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
        {triggerInitials()}
      </div>
      {#if showLabels()}
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-sm text-sidebar-primary truncate">
            {triggerTitle()}
          </span>
          <span class="text-label text-sidebar-tertiary truncate">
            {triggerSubtitle()}
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
      class="bg-elevated rounded-md shadow-lg border border-base min-w-[260px] py-1 z-50"
      side="bottom"
      align={variant === 'topbar' ? 'center' : 'start'}
      sideOffset={6}
    >
      <div class="px-menu-item py-menu-item">
        <p class="font-medium text-sm text-primary truncate">{accountName}</p>
        <p class="text-label text-secondary truncate">{accountEmail}</p>
      </div>

      <DropdownMenu.Separator class="my-1 border-t border-base" />

      <DropdownMenu.Item
        class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center justify-between"
        textValue="Settings"
        onSelect={handleSettings}
      >
        <span class="font-medium">Settings</span>
        <span class="text-label text-tertiary">G then S</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none"
        textValue="Invite members"
        onSelect={handleInviteMembers}
      >
        Invite and manage members
      </DropdownMenu.Item>

      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger
          class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center justify-between"
          textValue="Switch workspace"
        >
          <span class="font-medium">Switch workspace</span>
          <div class="flex items-center gap-1 text-label text-tertiary">
            <span>O then W</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </DropdownMenu.SubTrigger>

        <DropdownMenu.SubContent
          class="bg-elevated rounded-md shadow-lg border border-base min-w-[260px] py-1"
          sideOffset={8}
          alignOffset={-4}
        >
          <div class="px-menu-item py-menu-item">
            <p class="text-label text-tertiary uppercase tracking-wide text-xs">Workspaces</p>
          </div>

          <DropdownMenu.Item
            class={`px-menu-item py-menu-item text-sm flex items-center justify-between cursor-pointer focus:bg-hover-solid hover:bg-hover-solid outline-none ${
              isPersonalActive() ? 'bg-hover-subtle text-primary' : 'text-primary'
            }`}
            textValue="Personal workspace"
            onSelect={() => handleSelect(null)}
          >
            <div class="flex items-center gap-icon-wide min-w-0">
              <div class="w-7 h-7 rounded-md bg-sidebar-hover flex items-center justify-center text-xs font-semibold text-sidebar-primary shadow-sm flex-shrink-0">
                {(accountName.slice(0, 2) || 'PW').toUpperCase()}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-medium truncate">{accountName}</span>
                <span class="text-label text-tertiary truncate">Private workspace</span>
              </div>
            </div>
            {#if isPersonalActive()}
              <svg class="w-4 h-4 text-accent-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </DropdownMenu.Item>

          {#if hasOrganizations()}
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
          {:else}
            <div class="px-menu-item py-2 text-label text-secondary">
              You haven't joined any organizations yet.
            </div>
          {/if}

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

          <DropdownMenu.Item
            class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none"
            textValue="Create or join workspace"
            onSelect={handleCreateWorkspace}
          >
            Create or join a workspace…
          </DropdownMenu.Item>

          <DropdownMenu.Item
            class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none"
            textValue="Add account"
            onSelect={handleAddAccount}
          >
            Add an account…
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>

      <div class="px-menu-item py-menu-item">
        <div class="flex items-center justify-between gap-icon-wide min-w-0">
          <div class="flex items-center gap-icon">
            <span class="font-medium text-sm text-primary">{$isDark ? 'Dark mode' : 'Light mode'}</span>
            {#if $isDark}
              <svg
                class="w-4 h-4 text-secondary flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            {:else}
              <svg
                class="w-4 h-4 text-secondary flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            {/if}
          </div>
          <Switch.Root
            checked={$isDark}
            onCheckedChange={(checked) => theme.setTheme(checked ? 'dark' : 'light')}
            class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {$isDark ? 'bg-gray-900' : 'bg-gray-300'}"
          >
            <Switch.Thumb class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-4" />
          </Switch.Root>
        </div>
      </div>

      <DropdownMenu.Separator class="my-1 border-t border-base" />

      <DropdownMenu.Item
        class="px-menu-item py-menu-item text-sm text-sidebar-secondary hover:text-sidebar-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center justify-between"
        textValue="Log out"
        onSelect={handleLogout}
      >
        <span class="font-medium">Log out</span>
        <span class="text-label text-tertiary">⌥⇧Q</span>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
