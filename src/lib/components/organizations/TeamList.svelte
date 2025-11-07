<script lang="ts">
  import type { TeamInvite, TeamSummary } from '$lib/composables/useOrganizations.svelte';

  let {
    teams = [] as TeamSummary[],
    teamInvites = [] as TeamInvite[],
    activeTeamId = null as string | null,
    sidebarCollapsed = false,
    isMobile = false,
    onSelectTeam,
    onCreateTeam,
    onJoinTeam,
    onAcceptInvite,
    onDeclineInvite
  }: {
    teams?: TeamSummary[];
    teamInvites?: TeamInvite[];
    activeTeamId?: string | null;
    sidebarCollapsed?: boolean;
    isMobile?: boolean;
    onSelectTeam?: (teamId: string | null) => void;
    onCreateTeam?: () => void;
    onJoinTeam?: () => void;
    onAcceptInvite?: (code: string) => void;
    onDeclineInvite?: (inviteId: string) => void;
  } = $props();

  const showLabels = $derived(() => !sidebarCollapsed || isMobile);

  function handleSelect(teamId: string | null) {
    onSelectTeam?.(teamId);
  }
</script>

<section class="mt-4">
  {#if showLabels()}
    <div class="px-section py-section flex items-center justify-between">
      <p class="text-label font-medium text-sidebar-tertiary uppercase tracking-wider">Teams</p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-md text-sidebar-secondary hover:text-sidebar-primary hover:bg-sidebar-hover-solid"
          aria-label="Join team"
          onclick={() => onJoinTeam?.()}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-md text-sidebar-secondary hover:text-sidebar-primary hover:bg-sidebar-hover-solid"
          aria-label="Create team"
          onclick={() => onCreateTeam?.()}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H12" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <div class="space-y-0.5">
    <button
      type="button"
      class={`w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md transition-all duration-150 text-sm ${
        activeTeamId === null
          ? 'bg-sidebar-hover-solid text-sidebar-primary'
          : 'text-sidebar-secondary hover:text-sidebar-primary hover:bg-sidebar-hover'
      } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
      onclick={() => handleSelect(null)}
      aria-pressed={activeTeamId === null}
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
      </svg>
      {#if showLabels()}
        <span class="font-normal flex-1 min-w-0">All teams</span>
      {/if}
    </button>

    {#each teams as team (team.teamId)}
      <button
        type="button"
        class={`w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md transition-all duration-150 text-sm ${
          team.teamId === activeTeamId
            ? 'bg-sidebar-hover-solid text-sidebar-primary'
            : 'text-sidebar-secondary hover:text-sidebar-primary hover:bg-sidebar-hover'
        } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
        onclick={() => handleSelect(team.teamId)}
        aria-pressed={team.teamId === activeTeamId}
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M13 20v-2a3 3 0 015.356-1.857M9 20v-2a3 3 0 015.356-1.857M4 20h5v-2a3 3 0 00-5.356-1.857M9 8a4 4 0 11-8 0 4 4 0 018 0zm10 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {#if showLabels()}
          <span class="font-normal flex-1 min-w-0 truncate">{team.name}</span>
          <span class="text-label text-sidebar-tertiary">{team.memberCount}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if showLabels() && teams.length === 0 && !teamInvites?.length}
    <p class="text-label text-sidebar-tertiary px-section py-section">No teams yet. Create your first team.</p>
  {/if}

  {#if teamInvites?.length}
    <div class="mt-3 space-y-1.5">
      <p class="px-section py-section text-label text-sidebar-tertiary uppercase tracking-wider">Pending invites</p>
          {#each teamInvites as invite (invite.inviteId)}
        <div class="px-section py-section bg-sidebar-hover rounded-md text-sm text-sidebar-secondary">
          <div class="flex items-center justify-between gap-icon">
            <span class="font-medium text-sidebar-primary">{invite.teamName}</span>
            <span class="text-label text-sidebar-tertiary">{invite.role}</span>
          </div>
          <p class="text-label text-sidebar-tertiary mt-1">Invited by {invite.invitedBy}</p>
          <div class="flex gap-1 mt-2">
            <button
              type="button"
              class="px-2.5 py-1 rounded-md bg-accent-primary text-on-solid text-xs font-medium"
              onclick={() => onAcceptInvite?.(invite.code)}
            >
              Accept
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md border border-sidebar text-xs font-medium text-sidebar-secondary hover:text-sidebar-primary"
              onclick={() => onDeclineInvite?.(invite.inviteId)}
            >
              Decline
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

