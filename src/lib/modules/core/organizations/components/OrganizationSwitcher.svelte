<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type {
		OrganizationInvite,
		OrganizationSummary
	} from '../composables/useOrganizations.svelte';

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
		accountEmail = 'user@example.com',
		accountName = 'user@example.com',
		linkedAccounts = [] as LinkedAccount[],
		variant = 'sidebar' as Variant,
		sidebarCollapsed = false,
		isLoading = false,
		onSelectOrganization,
		onCreateOrganization,
		onJoinOrganization,
		onAcceptOrganizationInvite,
		onDeclineOrganizationInvite,
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

	function handleLogoutAccount(targetUserId: string) {
		onLogoutAccount?.(targetUserId);
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
		const filtered = orgsList
			.filter((org) => org && org.organizationId)
			.map((org) => ({
				organizationId: org.organizationId,
				name: org.name,
				initials: org.initials,
				role: org.role,
				isFromLinkedAccount: false
			}));

		console.log('🔍 [OrganizationSwitcher] Current account organizations:', {
			organizationsPropType: typeof organizations,
			organizationsIsArray: Array.isArray(organizations),
			orgsListLength: orgsList.length,
			filteredLength: filtered.length,
			organizations: orgsList.map((o) => ({ id: o?.organizationId, name: o?.name }))
		});

		return filtered;
	});

	// Linked accounts with their organizations (for grouped display)
	const linkedAccountsWithOrgs = $derived(() => {
		const linkedAccountsList = Array.isArray(linkedAccounts) ? linkedAccounts : [];
		const filtered = linkedAccountsList.filter(
			(account) =>
				account?.organizations &&
				Array.isArray(account.organizations) &&
				account.organizations.length > 0
		);

		console.log('🔍 [OrganizationSwitcher] Linked accounts with orgs:', {
			linkedAccountsType: typeof linkedAccounts,
			linkedAccountsIsArray: Array.isArray(linkedAccounts),
			linkedAccountsListLength: linkedAccountsList.length,
			filteredLength: filtered.length,
			accounts: linkedAccountsList.map((a) => ({
				userId: a?.userId,
				email: a?.email,
				orgCount: a?.organizations?.length ?? 0,
				hasOrgs: !!(
					a?.organizations &&
					Array.isArray(a.organizations) &&
					a.organizations.length > 0
				)
			}))
		});

		return filtered;
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		type="button"
		class={`flex items-center ${showLabels() ? 'gap-icon-wide px-nav-item py-nav-item' : 'p-button-icon'} group w-full rounded-button text-left transition-colors hover:bg-sidebar-hover-solid`}
	>
		<div
			class={`flex items-center ${showLabels() ? 'min-w-0 flex-1 gap-icon-wide' : ''} transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}
		>
			<div
				class={`flex flex-shrink-0 items-center justify-center rounded-button text-label font-semibold shadow-sm ${
					variant === 'topbar'
						? 'text-on-solid size-avatar-sm bg-accent-primary'
						: 'size-avatar-sm bg-sidebar-hover text-sidebar-primary'
				}`}
			>
				{triggerInitials()}
			</div>
			{#if showLabels()}
				<div class="flex min-w-0 flex-col gap-form-field-gap">
					{#if showSkeleton()}
						<!-- Skeleton loading state -->
						<div class="h-3.5 w-28 animate-pulse rounded bg-sidebar-hover"></div>
						<div class="h-2.5 w-16 animate-pulse rounded bg-sidebar-hover"></div>
					{:else}
						<span class="truncate text-small font-medium text-sidebar-primary">
							{triggerTitle()}
						</span>
						<span class="truncate text-label text-sidebar-tertiary">
							{triggerSubtitle()}
						</span>
					{/if}
				</div>
			{/if}
			<svg
				class={`ml-auto icon-sm flex-shrink-0 text-sidebar-secondary transition-transform duration-200 ${
					showLabels() ? 'group-hover:text-sidebar-primary' : ''
				}`}
				style="width: 16px; height: 16px;"
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
			class="z-50 max-h-[600px] min-w-[280px] overflow-y-auto rounded-button border border-base bg-elevated py-badge shadow-card"
			side="bottom"
			align={variant === 'topbar' ? 'center' : 'start'}
			sideOffset={6}
		>
			<!-- Top Actions: Settings, Invite, Dark Mode -->
			<div class="px-menu-item py-form-field-gap">
				<p class="truncate text-small font-medium text-primary">{accountName}</p>
				<p class="truncate text-label text-secondary">{accountEmail}</p>
			</div>

			<div class="flex items-center gap-form-field-gap px-form-field-gap py-form-field-gap">
				<button
					type="button"
					class="flex-1 rounded-button px-nav-item py-nav-item text-label text-primary hover:bg-hover-solid"
					onclick={handleSettings}
				>
					⚙️ Settings
				</button>
				<button
					type="button"
					class="flex-1 rounded-button px-nav-item py-nav-item text-label text-primary hover:bg-hover-solid"
					onclick={handleInviteMembers}
				>
					➕ Invite members
				</button>
			</div>

			<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />

			<!-- Current Account Section -->
			<div class="flex items-center justify-between px-menu-item py-form-field-gap">
				<p class="truncate text-label font-semibold tracking-wide text-tertiary uppercase">
					{accountEmail}
				</p>
				<!-- Current Account menu (logout, create workspace) -->
				<DropdownMenu.Root open={accountMenuOpen} onOpenChange={(open) => (accountMenuOpen = open)}>
					<DropdownMenu.Trigger
						type="button"
						class="flex size-icon-md items-center justify-center rounded-button text-tertiary transition-colors hover:bg-hover-solid hover:text-primary"
						onclick={(e) => {
							e.stopPropagation(); // Prevent parent menu from closing
						}}
					>
						<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
							class="z-50 min-w-[180px] rounded-button border border-base bg-elevated py-badge shadow-card"
							side="right"
							align="start"
							sideOffset={4}
							onInteractOutside={(e) => {
								e.stopPropagation(); // Prevent parent menu from closing
							}}
						>
							<DropdownMenu.Item
								class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Create workspace"
								onSelect={() => {
									accountMenuOpen = false;
									handleCreateWorkspace();
								}}
							>
								<div class="flex items-center gap-icon">
									<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Join workspace"
								onSelect={() => {
									accountMenuOpen = false;
									onJoinOrganization?.();
								}}
							>
								<div class="flex items-center gap-icon">
									<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								class="text-danger cursor-pointer px-menu-item py-menu-item text-small outline-none hover:bg-hover-solid focus:bg-hover-solid"
								textValue="Log out"
								onSelect={() => {
									accountMenuOpen = false;
									handleLogout();
								}}
							>
								<div class="flex items-center gap-icon">
									<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					class={`flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-small outline-none hover:bg-hover-solid focus:bg-hover-solid ${
						organization.organizationId === activeOrganizationId ? '' : 'text-primary'
					}`}
					textValue={organization.name}
					onSelect={() => handleSelect(organization.organizationId)}
				>
					<div class="flex min-w-0 flex-1 items-center gap-icon">
						<div
							class="flex size-avatar-sm flex-shrink-0 items-center justify-center rounded-button bg-sidebar-hover text-label font-semibold"
						>
							{organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
						</div>
						<div class="flex min-w-0 flex-col">
							<span class="truncate text-small font-medium">{organization.name}</span>
							<span class="truncate text-label text-tertiary capitalize">{organization.role}</span>
						</div>
					</div>
					{#if organization.organizationId === activeOrganizationId}
						<svg
							class="icon-sm flex-shrink-0 text-accent-primary"
							style="width: 16px; height: 16px;"
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
				<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />

				<div class="flex items-center justify-between px-menu-item py-form-field-gap">
					<p class="truncate text-label font-semibold tracking-wide text-tertiary uppercase">
						{account.email ?? account.name ?? 'Linked account'}
					</p>
					<!-- Linked Account menu (logout, create workspace) -->
					<DropdownMenu.Root
						open={linkedAccountMenuOpen[account.userId] ?? false}
						onOpenChange={(open) => (linkedAccountMenuOpen[account.userId] = open)}
					>
						<DropdownMenu.Trigger
							type="button"
							class="flex size-icon-md items-center justify-center rounded-button text-tertiary transition-colors hover:bg-hover-solid hover:text-primary"
							onclick={(e) => {
								e.stopPropagation(); // Prevent parent menu from closing
							}}
						>
							<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								class="z-50 min-w-[180px] rounded-button border border-base bg-elevated py-badge shadow-card"
								side="right"
								align="start"
								sideOffset={4}
								onInteractOutside={(e) => {
									e.stopPropagation(); // Prevent parent menu from closing
								}}
							>
								<DropdownMenu.Item
									class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
									textValue="Create workspace"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										onCreateWorkspaceForAccount?.(account.userId);
									}}
								>
									<div class="flex items-center gap-icon">
										<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
									class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
									textValue="Join workspace"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										onJoinWorkspaceForAccount?.(account.userId);
									}}
								>
									<div class="flex items-center gap-icon">
										<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />
								<DropdownMenu.Item
									class="text-destructive cursor-pointer px-menu-item py-menu-item text-small outline-none hover:bg-hover-solid focus:bg-hover-solid"
									textValue="Log out"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										handleLogoutAccount(account.userId);
									}}
								>
									<div class="flex items-center gap-icon">
										<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

				<!-- Linked Account Organizations -->
				{#each account.organizations as organization (`${organization.organizationId}-${account.userId}`)}
					<DropdownMenu.Item
						class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue={organization.name}
						onSelect={() => {
							// Switch to linked account and navigate to organization
							handleSwitchAccount(account.userId, `/inbox?org=${organization.organizationId}`);
						}}
					>
						<div class="flex min-w-0 flex-1 items-center gap-icon">
							<div
								class="flex size-avatar-sm flex-shrink-0 items-center justify-center rounded-button bg-sidebar-hover text-label font-semibold"
							>
								{organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
							</div>
							<div class="flex min-w-0 flex-col">
								<span class="truncate text-small font-medium">{organization.name}</span>
								<span class="truncate text-label text-tertiary capitalize">{organization.role}</span
								>
							</div>
						</div>
						<!-- No checkmark for linked account workspaces - clicking switches accounts -->
					</DropdownMenu.Item>
				{/each}
			{/each}

			<!-- Actions Section -->
			<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />

			<!-- New workspace button -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-menu-item text-small text-accent-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="New workspace"
				onSelect={handleCreateWorkspace}
			>
				<div class="flex items-center gap-icon">
									<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />
				{#each linkedAccounts as account (account.userId)}
					{#if !linkedAccountsWithOrgs().some((a) => a.userId === account.userId)}
						<div class="flex items-center justify-between px-menu-item py-form-field-gap">
							<p class="truncate text-label font-semibold tracking-wide text-tertiary uppercase">
								{account.email ?? account.name ?? 'Linked account'}
							</p>
							<!-- Account menu (logout, create workspace) -->
							<DropdownMenu.Root
								open={linkedAccountMenuOpen[account.userId] ?? false}
								onOpenChange={(open) => (linkedAccountMenuOpen[account.userId] = open)}
							>
								<DropdownMenu.Trigger
									type="button"
									class="flex size-icon-md items-center justify-center rounded-button text-tertiary transition-colors hover:bg-hover-solid hover:text-primary"
									onclick={(e) => {
										e.stopPropagation(); // Prevent parent menu from closing
									}}
								>
									<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
										class="z-50 min-w-[180px] rounded-button border border-base bg-elevated py-badge shadow-card"
										side="right"
										align="start"
										sideOffset={4}
										onInteractOutside={(e) => {
											e.stopPropagation(); // Prevent parent menu from closing
										}}
									>
										<DropdownMenu.Item
											class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Create workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onCreateWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-icon">
												<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
											class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Join workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onJoinWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-icon">
												<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
											class="text-danger cursor-pointer px-menu-item py-menu-item text-small outline-none hover:bg-hover-solid focus:bg-hover-solid"
											textValue="Log out"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onLogoutAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-icon">
												<svg class="icon-sm" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

			<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />

			<!-- Create/Join organization -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Create organization"
				onSelect={handleCreateOrganization}
			>
				<div class="flex items-center gap-icon">
					<span class="text-body leading-none">✦</span>
					<span>Create organization</span>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Join organization"
				onSelect={handleJoinOrganization}
			>
				<div class="flex items-center gap-icon">
					<span class="text-body leading-none">➕</span>
					<span>Join organization</span>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />

			<!-- Add account -->
			<DropdownMenu.Item
				class="cursor-pointer px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
				textValue="Add account"
				onSelect={handleAddAccount}
			>
				Add an account…
			</DropdownMenu.Item>

			<!-- Organization Invites -->
			{#if organizationInvites.length > 0}
				<DropdownMenu.Separator class="my-form-field-gap border-t border-base" />
				<div class="px-menu-item py-menu-item">
					<p class="text-label font-semibold tracking-wide text-tertiary uppercase">
						Organization invites
					</p>
				</div>
				{#each organizationInvites as invite (invite.inviteId)}
					<div class="px-menu-item py-form-field-gap">
						<div class="flex items-start gap-icon">
							<div
								class="flex size-avatar-sm flex-shrink-0 items-center justify-center rounded-button bg-sidebar-hover text-label font-semibold text-sidebar-primary"
							>
								{invite.organizationName.slice(0, 2).toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-icon">
									<span class="truncate text-small font-medium text-primary"
										>{invite.organizationName}</span
									>
									<span class="text-label text-tertiary">{invite.role}</span>
								</div>
								<p class="truncate text-label text-secondary">Invited by {invite.invitedBy}</p>
								<div class="mt-form-field-gap flex gap-form-field-gap">
									<button
										type="button"
										class="text-on-solid hover:bg-accent-primary-hover rounded-button bg-accent-primary px-menu-item py-menu-item text-label font-medium"
										onclick={() => handleAcceptOrganizationInvite(invite.code)}
									>
										Accept
									</button>
									<button
										type="button"
										class="rounded-button border border-base px-menu-item py-menu-item text-label font-medium text-secondary hover:bg-hover-solid hover:text-primary"
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
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
