<script lang="ts">
	import { DropdownMenu, Switch } from 'bits-ui';
	import type {
		OrganizationInvite,
		OrganizationSummary,
		TeamInvite
	} from '$lib/composables/useOrganizations.svelte';
	import { theme, isDark } from '$lib/stores/theme';
	import KeyboardShortcut from '$lib/components/ui/KeyboardShortcut.svelte';

	type Variant = 'sidebar' | 'topbar';

	let {
		organizations = [] as OrganizationSummary[],
		activeOrganizationId = null as string | null,
		activeOrganization = null as OrganizationSummary | null,
		organizationInvites = [] as OrganizationInvite[],
		teamInvites = [] as TeamInvite[],
		accountEmail = 'user@example.com',
		accountName = 'Personal workspace',
		variant = 'sidebar' as Variant,
		sidebarCollapsed = false,
		isLoading = false,
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
		activeOrganization?: OrganizationSummary | null;
		organizationInvites?: OrganizationInvite[];
		teamInvites?: TeamInvite[];
		accountEmail?: string;
		accountName?: string;
		variant?: Variant;
		sidebarCollapsed?: boolean;
		isLoading?: boolean;
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
	const showLabels = $derived(() => variant === 'topbar' || !sidebarCollapsed);
	const isPersonalActive = $derived(() => !activeOrganizationId);

	// Show skeleton when loading with no cached data
	const showSkeleton = $derived(() => isLoading && !activeOrganization && activeOrganizationId);

	const triggerInitials = $derived(() =>
		isPersonalActive()
			? (accountName.slice(0, 2) || 'PW').toUpperCase()
			: (activeOrganization?.initials ?? '—')
	);
	const triggerTitle = $derived(() =>
		isPersonalActive() ? accountName : (activeOrganization?.name ?? 'Select workspace')
	);
	const triggerSubtitle = $derived(() =>
		isPersonalActive()
			? accountEmail
			: activeOrganization?.role === 'owner'
				? 'Owner'
				: activeOrganization?.role === 'admin'
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
		class={`flex items-center ${showLabels() ? 'gap-icon-wide px-nav-item py-nav-item' : 'p-2'} group w-full rounded-md text-left transition-colors hover:bg-sidebar-hover-solid`}
	>
		<div
			class={`flex items-center ${showLabels() ? 'min-w-0 flex-1 gap-icon-wide' : ''} transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}
		>
			<div
				class={`flex flex-shrink-0 items-center justify-center rounded-md text-xs font-semibold shadow-sm ${
					variant === 'topbar'
						? 'text-on-solid h-8 w-8 bg-accent-primary'
						: 'h-7 w-7 bg-sidebar-hover text-sidebar-primary'
				}`}
			>
				{triggerInitials()}
			</div>
			{#if showLabels()}
				<div class="flex min-w-0 flex-col gap-1">
					{#if showSkeleton()}
						<!-- Skeleton loading state -->
						<div class="h-3.5 w-28 animate-pulse rounded bg-sidebar-hover"></div>
						<div class="h-2.5 w-16 animate-pulse rounded bg-sidebar-hover"></div>
					{:else}
						<span class="truncate text-sm font-medium text-sidebar-primary">
							{triggerTitle()}
						</span>
						<span class="truncate text-label text-sidebar-tertiary">
							{triggerSubtitle()}
						</span>
					{/if}
				</div>
			{/if}
			<svg
				class={`ml-auto h-3.5 w-3.5 flex-shrink-0 text-sidebar-secondary transition-transform duration-200 ${
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
			class="z-50 min-w-[260px] rounded-md border border-base bg-elevated py-1 shadow-lg"
			side="bottom"
			align={variant === 'topbar' ? 'center' : 'start'}
			sideOffset={6}
		>
			<div class="px-menu-item py-menu-item">
				<p class="truncate text-sm font-medium text-primary">{accountName}</p>
				<p class="truncate text-label text-secondary">{accountEmail}</p>
			</div>

			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<DropdownMenu.Item
				class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Settings"
				onSelect={handleSettings}
			>
				<span class="font-medium">Settings</span>
				<span class="text-label text-tertiary">G then S</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Invite members"
				onSelect={handleInviteMembers}
			>
				Invite and manage members
			</DropdownMenu.Item>

			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger
					class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
					textValue="Switch workspace"
				>
					<span class="font-medium">Switch workspace</span>
					<div class="flex items-center gap-1 text-label text-tertiary">
						<span>O then W</span>
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				</DropdownMenu.SubTrigger>

				<DropdownMenu.SubContent
					class="min-w-[260px] rounded-md border border-base bg-elevated py-1 shadow-lg"
					sideOffset={8}
					alignOffset={-4}
				>
					<div class="px-menu-item py-menu-item">
						<p class="text-xs text-label tracking-wide text-tertiary uppercase">Workspaces</p>
					</div>

					<DropdownMenu.Item
						class={`flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm outline-none hover:bg-hover-solid focus:bg-hover-solid ${
							isPersonalActive() ? 'bg-hover-subtle text-primary' : 'text-primary'
						}`}
						textValue="Personal workspace"
						onSelect={() => handleSelect(null)}
					>
						<div class="flex min-w-0 flex-1 items-center gap-icon-wide">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary shadow-sm"
							>
								{(accountName.slice(0, 2) || 'PW').toUpperCase()}
							</div>
							<div class="flex min-w-0 flex-col">
								<span class="truncate font-medium">{accountName}</span>
								<span class="truncate text-label text-tertiary">Private workspace</span>
							</div>
						</div>
						<div class="ml-auto flex items-center gap-icon">
							<KeyboardShortcut keys={['Meta', '1']} size="sm" />
							{#if isPersonalActive()}
								<svg
									class="h-4 w-4 flex-shrink-0 text-accent-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</div>
					</DropdownMenu.Item>

					{#if hasOrganizations()}
						{#each organizations as organization, index (organization.organizationId)}
							{@const shortcutNumber = index + 2}
							{@const showShortcut = shortcutNumber <= 9}
							<DropdownMenu.Item
								class={`flex cursor-pointer items-center justify-between rounded-none px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid ${
									organization.organizationId === activeOrganizationId
										? 'bg-hover-subtle text-primary'
										: ''
								}`}
								textValue={organization.name}
								onSelect={() => handleSelect(organization.organizationId)}
							>
								<div class="flex min-w-0 flex-1 items-center gap-icon-wide">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary shadow-sm"
									>
										{organization.initials}
									</div>
									<div class="flex min-w-0 flex-col">
										<span class="truncate font-medium">{organization.name}</span>
										<span class="truncate text-label text-tertiary capitalize"
											>{organization.role}</span
										>
									</div>
								</div>
								<div class="ml-auto flex items-center gap-icon">
									{#if showShortcut}
										<KeyboardShortcut keys={['Meta', shortcutNumber.toString()]} size="sm" />
									{/if}
									{#if organization.organizationId === activeOrganizationId}
										<svg
											class="h-4 w-4 flex-shrink-0 text-accent-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									{/if}
								</div>
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
							<p class="text-xs text-label tracking-wide text-tertiary uppercase">
								Organization invites
							</p>
						</div>
						{#each organizationInvites as invite (invite.inviteId)}
							<div class="px-menu-item py-menu-item">
								<div class="flex items-start gap-icon-wide">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary shadow-sm"
									>
										{invite.organizationName.slice(0, 2).toUpperCase()}
									</div>
									<div class="min-w-0 flex-1">
										<div class="flex items-center justify-between gap-icon">
											<span class="truncate text-sm font-medium text-primary"
												>{invite.organizationName}</span
											>
											<span class="text-label text-tertiary">{invite.role}</span>
										</div>
										<p class="truncate text-label text-secondary">Invited by {invite.invitedBy}</p>
										<div class="mt-2 flex gap-1">
											<button
												type="button"
												class="text-on-solid rounded-md bg-accent-primary px-2.5 py-1 text-xs font-medium"
												onclick={() => handleAcceptOrganizationInvite(invite.code)}
											>
												Accept
											</button>
											<button
												type="button"
												class="rounded-md border border-base px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary"
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
							<p class="text-xs text-label tracking-wide text-tertiary uppercase">Team invites</p>
						</div>
						{#each teamInvites as invite (invite.inviteId)}
							<div class="px-menu-item py-menu-item">
								<div class="flex items-start gap-icon-wide">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary shadow-sm"
									>
										{invite.teamName.slice(0, 2).toUpperCase()}
									</div>
									<div class="min-w-0 flex-1">
										<div class="flex items-center justify-between gap-icon">
											<span class="truncate text-sm font-medium text-primary"
												>{invite.teamName}</span
											>
											<span class="truncate text-label text-tertiary"
												>{invite.organizationName}</span
											>
										</div>
										<p class="truncate text-label text-secondary">Invited by {invite.invitedBy}</p>
										<div class="mt-2 flex gap-1">
											<button
												type="button"
												class="text-on-solid rounded-md bg-accent-primary px-2.5 py-1 text-xs font-medium"
												onclick={() => handleAcceptTeamInvite(invite.code)}
											>
												Join team
											</button>
											<button
												type="button"
												class="rounded-md border border-base px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary"
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
						class="cursor-pointer px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Create organization"
						onSelect={handleCreateOrganization}
					>
						<div class="flex items-center gap-icon-wide">
							<span class="text-lg leading-none">✦</span>
							<span class="font-medium">Create organization</span>
						</div>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="cursor-pointer px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Join organization"
						onSelect={handleJoinOrganization}
					>
						<div class="flex items-center gap-icon-wide">
							<span class="text-lg leading-none">➕</span>
							<span class="font-medium">Join organization</span>
						</div>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="cursor-pointer px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Create or join workspace"
						onSelect={handleCreateWorkspace}
					>
						Create or join a workspace…
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="cursor-pointer px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Add account"
						onSelect={handleAddAccount}
					>
						Add an account…
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>

			<div class="px-menu-item py-menu-item">
				<div class="flex min-w-0 items-center justify-between gap-icon-wide">
					<div class="flex items-center gap-icon">
						<span class="text-sm font-medium text-primary"
							>{$isDark ? 'Dark mode' : 'Light mode'}</span
						>
						{#if $isDark}
							<svg
								class="h-4 w-4 flex-shrink-0 text-secondary"
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
								class="h-4 w-4 flex-shrink-0 text-secondary"
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
						class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {$isDark
							? 'bg-gray-900'
							: 'bg-gray-300'}"
					>
						<Switch.Thumb
							class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
						/>
					</Switch.Root>
				</div>
			</div>

			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<DropdownMenu.Item
				class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-sidebar-secondary outline-none hover:bg-hover-solid hover:text-sidebar-primary focus:bg-hover-solid"
				textValue="Log out"
				onSelect={handleLogout}
			>
				<span class="font-medium">Log out</span>
				<span class="text-label text-tertiary">⌥⇧Q</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
