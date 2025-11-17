<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type {
		OrganizationInvite,
		OrganizationSummary,
		TeamInvite
	} from '$lib/composables/useOrganizations.svelte';

	type Variant = 'sidebar' | 'topbar';

	type OrganizationInfo = {
		organizationId: string;
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
		organizations?: OrganizationInfo[];
	};

	let {
		organizations = [] as OrganizationSummary[],
		activeOrganizationId = null as string | null,
		activeOrganization = null as OrganizationSummary | null,
		organizationInvites = [] as OrganizationInvite[],
		teamInvites = [] as TeamInvite[],
		accountEmail = 'user@example.com',
		accountName = 'Personal workspace',
		linkedAccounts = [] as LinkedAccount[],
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
		onSwitchWorkspace: _onSwitchWorkspace,
		onCreateWorkspace,
		onAddAccount,
		onSwitchAccount,
		onLogout,
		onLogoutAccount,
		onCreateWorkspaceForAccount,
		onJoinWorkspaceForAccount
	}: {
		organizations?: OrganizationSummary[];
		activeOrganizationId?: string | null;
		activeOrganization?: OrganizationSummary | null;
		organizationInvites?: OrganizationInvite[];
		teamInvites?: TeamInvite[];
		accountEmail?: string;
		accountName?: string;
		linkedAccounts?: LinkedAccount[];
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
		onCreateWorkspaceForAccount?: (targetUserId: string) => void;
		onJoinWorkspaceForAccount?: (targetUserId: string) => void;
		onAddAccount?: () => void;
		onSwitchAccount?: (targetUserId: string, redirectTo?: string) => void;
		onLogout?: () => void;
		onLogoutAccount?: (targetUserId: string) => void;
	} = $props();

	// TODO: Re-enable when needed for conditional rendering
	// const _hasOrganizations = $derived(() => organizations.length > 0);
	const showLabels = $derived(() => variant === 'topbar' || !sidebarCollapsed);

	// Show skeleton when loading with no cached data
	const showSkeleton = $derived(() => isLoading && !activeOrganization && activeOrganizationId);

	const triggerInitials = $derived(() => activeOrganization?.initials ?? '—');
	const triggerTitle = $derived(() => activeOrganization?.name ?? 'Select workspace');
	const triggerSubtitle = $derived(() =>
		activeOrganization?.role === 'owner'
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

	function handleSwitchAccount(targetUserId: string, redirectTo?: string) {
		onSwitchAccount?.(targetUserId, redirectTo);
	}

	function handleLogout() {
		onLogout?.();
	}

	// State for nested account menus
	let accountMenuOpen = $state(false);
	const linkedAccountMenuOpen = $state<Record<string, boolean>>({});

	// Combined list of all organizations (current account + linked accounts)
	// This allows CMD+1-9 shortcuts to work across all accounts
	type CombinedOrganization = {
		organizationId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
		accountUserId?: string; // If from linked account, this is the userId
		isFromLinkedAccount: boolean;
	};

	// Current account's organizations
	const currentAccountOrganizations = $derived((): CombinedOrganization[] => {
		const orgsList = Array.isArray(organizations) ? organizations : [];
		return orgsList
			.filter((org) => org && org.organizationId)
			.map((org) => ({
				organizationId: org.organizationId,
				name: org.name,
				initials: org.initials,
				role: org.role,
				isFromLinkedAccount: false
			}));
	});

	// Linked accounts with their organizations (for grouped display)
	const linkedAccountsWithOrgs = $derived(() => {
		const linkedAccountsList = Array.isArray(linkedAccounts) ? linkedAccounts : [];
		return linkedAccountsList.filter(
			(account) =>
				account?.organizations &&
				Array.isArray(account.organizations) &&
				account.organizations.length > 0
		);
	});
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
			class="z-50 max-h-[600px] min-w-[280px] overflow-y-auto rounded-md border border-base bg-elevated py-1 shadow-lg"
			side="bottom"
			align={variant === 'topbar' ? 'center' : 'start'}
			sideOffset={6}
		>
			<!-- Top Actions: Settings, Invite, Dark Mode -->
			<div class="px-3 py-2">
				<p class="truncate text-sm font-medium text-primary">{accountName}</p>
				<p class="truncate text-xs text-secondary">{accountEmail}</p>
			</div>

			<div class="flex items-center gap-1 px-2 py-1">
				<button
					type="button"
					class="flex-1 rounded px-2 py-1.5 text-xs text-primary hover:bg-hover-solid"
					onclick={handleSettings}
				>
					⚙️ Settings
				</button>
				<button
					type="button"
					class="flex-1 rounded px-2 py-1.5 text-xs text-primary hover:bg-hover-solid"
					onclick={handleInviteMembers}
				>
					➕ Invite members
				</button>
			</div>

			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<!-- Current Account Section -->
			<div class="flex items-center justify-between px-3 py-1">
				<p class="truncate text-xs font-semibold tracking-wide text-tertiary uppercase">
					{accountEmail}
				</p>
				<!-- Current Account menu (logout, create workspace) -->
				<DropdownMenu.Root open={accountMenuOpen} onOpenChange={(open) => (accountMenuOpen = open)}>
					<DropdownMenu.Trigger
						type="button"
						class="flex h-5 w-5 items-center justify-center rounded text-tertiary transition-colors hover:bg-hover-solid hover:text-primary"
						onclick={(e) => {
							e.stopPropagation(); // Prevent parent menu from closing
						}}
					>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
							/>
						</svg>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content
							class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-1 shadow-lg"
							side="right"
							align="start"
							sideOffset={4}
							onInteractOutside={(e) => {
								e.stopPropagation(); // Prevent parent menu from closing
							}}
						>
							<DropdownMenu.Item
								class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Create workspace"
								onSelect={() => {
									accountMenuOpen = false;
									handleCreateWorkspace();
								}}
							>
								<div class="flex items-center gap-2">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4v16m8-8H4"
										/>
									</svg>
									<span>Create workspace</span>
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Join workspace"
								onSelect={() => {
									accountMenuOpen = false;
									onJoinOrganization?.();
								}}
							>
								<div class="flex items-center gap-2">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
										/>
									</svg>
									<span>Join workspace</span>
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="text-danger cursor-pointer px-menu-item py-1.5 text-sm outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Log out"
								onSelect={() => {
									accountMenuOpen = false;
									handleLogout();
								}}
							>
								<div class="flex items-center gap-2">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
									</svg>
									<span>Log out</span>
								</div>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>

			<!-- Current Account Organizations -->
			{#each currentAccountOrganizations() as organization (organization.organizationId)}
				<DropdownMenu.Item
					class={`flex cursor-pointer items-center justify-between px-menu-item py-1.5 text-sm outline-none hover:bg-hover-solid focus:bg-hover-solid ${
						organization.organizationId === activeOrganizationId ? '' : 'text-primary'
					}`}
					textValue={organization.name}
					onSelect={() => handleSelect(organization.organizationId)}
				>
					<div class="flex min-w-0 flex-1 items-center gap-2">
						<div
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-sidebar-hover text-xs font-semibold"
						>
							{organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
						</div>
						<div class="flex min-w-0 flex-col">
							<span class="truncate text-sm font-medium">{organization.name}</span>
							<span class="truncate text-xs text-tertiary capitalize">{organization.role}</span>
						</div>
					</div>
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
				</DropdownMenu.Item>
			{/each}

			<!-- Linked Accounts Sections -->
			{#each linkedAccountsWithOrgs() as account (account.userId)}
				<DropdownMenu.Separator class="my-1 border-t border-base" />

				<div class="flex items-center justify-between px-3 py-1">
					<p class="truncate text-xs font-semibold tracking-wide text-tertiary uppercase">
						{account.email ?? account.name ?? 'Linked account'}
					</p>
				</div>

				<!-- Linked Account Organizations -->
				{#each account.organizations as organization (`${organization.organizationId}-${account.userId}`)}
					<DropdownMenu.Item
						class="flex cursor-pointer items-center justify-between px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue={organization.name}
						onSelect={() => {
							// Switch to linked account and navigate to organization
							handleSwitchAccount(account.userId, `/inbox?org=${organization.organizationId}`);
						}}
					>
						<div class="flex min-w-0 flex-1 items-center gap-2">
							<div
								class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-sidebar-hover text-xs font-semibold"
							>
								{organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
							</div>
							<div class="flex min-w-0 flex-col">
								<span class="truncate text-sm font-medium">{organization.name}</span>
								<span class="truncate text-xs text-tertiary capitalize">{organization.role}</span>
							</div>
						</div>
						<!-- No checkmark for linked account workspaces - clicking switches accounts -->
					</DropdownMenu.Item>
				{/each}
			{/each}

			<!-- Actions Section -->
			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<!-- New workspace button -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-1.5 text-sm text-accent-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="New workspace"
				onSelect={handleCreateWorkspace}
			>
				<div class="flex items-center gap-2">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					<span>New workspace</span>
				</div>
			</DropdownMenu.Item>

			<!-- Account Management Section (for accounts without shown organizations above) -->
			{#if linkedAccounts.length > linkedAccountsWithOrgs().length}
				<DropdownMenu.Separator class="my-1 border-t border-base" />
				{#each linkedAccounts as account (account.userId)}
					{#if !linkedAccountsWithOrgs().some((a) => a.userId === account.userId)}
						<div class="flex items-center justify-between px-3 py-1">
							<p class="truncate text-xs font-semibold tracking-wide text-tertiary uppercase">
								{account.email ?? account.name ?? 'Linked account'}
							</p>
							<!-- Account menu (logout, create workspace) -->
							<DropdownMenu.Root
								open={linkedAccountMenuOpen[account.userId] ?? false}
								onOpenChange={(open) => (linkedAccountMenuOpen[account.userId] = open)}
							>
								<DropdownMenu.Trigger
									type="button"
									class="flex h-5 w-5 items-center justify-center rounded text-tertiary transition-colors hover:bg-hover-solid hover:text-primary"
									onclick={(e) => {
										e.stopPropagation(); // Prevent parent menu from closing
									}}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
										/>
									</svg>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
									<DropdownMenu.Content
										class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-1 shadow-lg"
										side="right"
										align="start"
										sideOffset={4}
										onInteractOutside={(e) => {
											e.stopPropagation(); // Prevent parent menu from closing
										}}
									>
										<DropdownMenu.Item
											class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Create workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onCreateWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-2">
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 4v16m8-8H4"
													/>
												</svg>
												<span>Create workspace</span>
											</div>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Join workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onJoinWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-2">
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
													/>
												</svg>
												<span>Join workspace</span>
											</div>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="text-danger cursor-pointer px-menu-item py-1.5 text-sm outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Log out"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onLogoutAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-2">
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
												<span>Log out</span>
											</div>
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>
					{/if}
				{/each}
			{/if}

			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<!-- Create/Join organization -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Create organization"
				onSelect={handleCreateOrganization}
			>
				<div class="flex items-center gap-2">
					<span class="text-base leading-none">✦</span>
					<span>Create organization</span>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Join organization"
				onSelect={handleJoinOrganization}
			>
				<div class="flex items-center gap-2">
					<span class="text-base leading-none">➕</span>
					<span>Join organization</span>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-1 border-t border-base" />

			<!-- Add account -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-1.5 text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Add account"
				onSelect={handleAddAccount}
			>
				Add an account…
			</DropdownMenu.Item>

			<!-- Organization Invites -->
			{#if organizationInvites.length > 0}
				<DropdownMenu.Separator class="my-1 border-t border-base" />
				<div class="px-menu-item py-1">
					<p class="text-xs font-semibold tracking-wide text-tertiary uppercase">
						Organization invites
					</p>
				</div>
				{#each organizationInvites as invite (invite.inviteId)}
					<div class="px-menu-item py-2">
						<div class="flex items-start gap-2">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary"
							>
								{invite.organizationName.slice(0, 2).toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-2">
									<span class="truncate text-sm font-medium text-primary"
										>{invite.organizationName}</span
									>
									<span class="text-xs text-tertiary">{invite.role}</span>
								</div>
								<p class="truncate text-xs text-secondary">Invited by {invite.invitedBy}</p>
								<div class="mt-2 flex gap-1">
									<button
										type="button"
										class="text-on-solid hover:bg-accent-primary-hover rounded-md bg-accent-primary px-2.5 py-1 text-xs font-medium"
										onclick={() => handleAcceptOrganizationInvite(invite.code)}
									>
										Accept
									</button>
									<button
										type="button"
										class="rounded-md border border-base px-2.5 py-1 text-xs font-medium text-secondary hover:bg-hover-solid hover:text-primary"
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

			<!-- Team Invites -->
			{#if teamInvites.length > 0}
				<DropdownMenu.Separator class="my-1 border-t border-base" />
				<div class="px-menu-item py-1">
					<p class="text-xs font-semibold tracking-wide text-tertiary uppercase">Team invites</p>
				</div>
				{#each teamInvites as invite (invite.inviteId)}
					<div class="px-menu-item py-2">
						<div class="flex items-start gap-2">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sidebar-hover text-xs font-semibold text-sidebar-primary"
							>
								{invite.teamName.slice(0, 2).toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-2">
									<span class="truncate text-sm font-medium text-primary">{invite.teamName}</span>
									<span class="truncate text-xs text-tertiary">{invite.organizationName}</span>
								</div>
								<p class="truncate text-xs text-secondary">Invited by {invite.invitedBy}</p>
								<div class="mt-2 flex gap-1">
									<button
										type="button"
										class="text-on-solid hover:bg-accent-primary-hover rounded-md bg-accent-primary px-2.5 py-1 text-xs font-medium"
										onclick={() => handleAcceptTeamInvite(invite.code)}
									>
										Join team
									</button>
									<button
										type="button"
										class="rounded-md border border-base px-2.5 py-1 text-xs font-medium text-secondary hover:bg-hover-solid hover:text-primary"
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
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
