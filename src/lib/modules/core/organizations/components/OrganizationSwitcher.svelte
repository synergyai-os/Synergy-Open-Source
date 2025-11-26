<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { WorkspaceSelector } from '$lib/components/molecules';
	import { Text, Button, Icon, Avatar } from '$lib/components/atoms';
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
	const showLabels = $derived(variant === 'topbar' || !sidebarCollapsed);

	// Show skeleton when loading with no cached data
	const showSkeleton = $derived(isLoading && !activeOrganization && activeOrganizationId);

	// Controlled open state for main dropdown
	let mainMenuOpen = $state(false);

	const triggerInitials = $derived(activeOrganization?.initials ?? '—');
	const triggerOrgName = $derived(activeOrganization?.name ?? 'Select workspace');
	const triggerUsername = $derived(accountName);

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

	// Current account's organizations
	type CombinedOrganization = {
		organizationId: string;
		name: string;
		initials?: string;
		role: 'owner' | 'admin' | 'member';
		isFromLinkedAccount: boolean;
	};

	const currentAccountOrganizations = $derived.by((): CombinedOrganization[] => {
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
	const linkedAccountsWithOrgs = $derived.by(() => {
		const linkedAccountsList = Array.isArray(linkedAccounts) ? linkedAccounts : [];
		return linkedAccountsList.filter(
			(account) =>
				account?.organizations &&
				Array.isArray(account.organizations) &&
				account.organizations.length > 0
		);
	});

	// State for nested account menus
	const linkedAccountMenuOpen = $state<Record<string, boolean>>({});
</script>

<DropdownMenu.Root bind:open={mainMenuOpen}>
	<DropdownMenu.Trigger
		type="button"
		class={`flex items-center ${showLabels ? 'gap-header px-input py-input' : 'p-button-icon'} group hover:bg-component-sidebar-itemHover w-full cursor-pointer rounded-button text-left transition-colors`}
	>
		<WorkspaceSelector
			initials={triggerInitials}
			username={triggerUsername}
			orgName={triggerOrgName}
			{showLabels}
			{isLoading}
			{variant}
		/>
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal to="body">
		<DropdownMenu.Content
			class="border-base py-menu-item min-w-[180px] rounded-button border bg-elevated shadow-card"
			side="bottom"
			align="start"
			sideOffset={4}
		>
			<!-- Account Info Section -->
			<div class="px-menu-item py-form-field-gap">
				<Text variant="body" size="sm" color="default" as="p" class="truncate font-medium">
					{accountName}
				</Text>
				<Text variant="label" size="sm" color="secondary" as="p" class="truncate">
					{accountEmail}
				</Text>
			</div>

			<!-- Settings and Invite Actions -->
			<div class="px-menu-item py-form-field-gap flex items-center gap-fieldGroup">
				<DropdownMenu.Item
					class="hover:bg-hover-solid focus:bg-hover-solid px-menu-item py-menu-item flex-1 cursor-pointer rounded-button text-left text-primary transition-colors outline-none"
					textValue="Settings"
					onSelect={() => {
						handleSettings();
						mainMenuOpen = false;
					}}
				>
					<Text variant="body" size="sm" color="default" as="span">⚙️ Settings</Text>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="hover:bg-hover-solid focus:bg-hover-solid px-menu-item py-menu-item flex-1 cursor-pointer rounded-button text-left text-primary transition-colors outline-none"
					textValue="Invite members"
					onSelect={() => {
						handleInviteMembers();
						mainMenuOpen = false;
					}}
				>
					<Text variant="body" size="sm" color="default" as="span">➕ Invite members</Text>
				</DropdownMenu.Item>
			</div>

			<!-- Separator -->
			<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />

			<!-- Current Account Section Header -->
			<div class="px-menu-item py-form-field-gap flex items-center justify-between">
				<Text
					variant="label"
					size="sm"
					color="tertiary"
					as="p"
					class="truncate font-semibold tracking-wide uppercase"
				>
					{accountEmail}
				</Text>
			</div>

			<!-- Current Account Organizations -->
			{#each currentAccountOrganizations as organization (organization.organizationId)}
				<DropdownMenu.Item
					class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between outline-none"
					textValue={organization.name}
					onSelect={() => {
						handleSelect(organization.organizationId);
						mainMenuOpen = false;
					}}
				>
					<div class="flex min-w-0 flex-1 items-center gap-fieldGroup">
						<Avatar
							initials={organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
							size="sm"
							variant="default"
							class="flex-shrink-0"
							style="background-color: var(--color-component-sidebar-itemHover);"
						/>
						<div class="flex min-w-0 flex-col">
							<Text variant="body" size="sm" color="default" as="span" class="truncate font-medium">
								{organization.name}
							</Text>
							<Text
								variant="label"
								size="sm"
								color="tertiary"
								as="span"
								class="truncate capitalize"
							>
								{organization.role}
							</Text>
						</div>
					</div>
					{#if organization.organizationId === activeOrganizationId}
						<!-- WORKAROUND: checkmark icon missing from registry - see missing-styles.md -->
						<svg
							class="icon-sm flex-shrink-0 text-brand"
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

			<!-- Actions Section -->
			<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />

			<!-- New workspace -->
			<DropdownMenu.Item
				class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
				textValue="New workspace"
				onSelect={() => {
					handleCreateWorkspace();
					mainMenuOpen = false;
				}}
			>
				<div class="flex items-center gap-fieldGroup">
					<Icon type="add" size="sm" />
					<Text variant="body" size="sm" color="brand" as="span">New workspace</Text>
				</div>
			</DropdownMenu.Item>

			<!-- Create/Join organization -->
			<DropdownMenu.Item
				class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
				textValue="Create organization"
				onSelect={() => {
					handleCreateOrganization();
					mainMenuOpen = false;
				}}
			>
				<div class="flex items-center gap-fieldGroup">
					<Text variant="body" size="base" as="span" class="leading-none">✦</Text>
					<Text variant="body" size="sm" color="default" as="span">Create organization</Text>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
				textValue="Join organization"
				onSelect={() => {
					handleJoinOrganization();
					mainMenuOpen = false;
				}}
			>
				<div class="flex items-center gap-fieldGroup">
					<Text variant="body" size="base" as="span" class="leading-none">➕</Text>
					<Text variant="body" size="sm" color="default" as="span">Join organization</Text>
				</div>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />

			<!-- Add account -->
			<DropdownMenu.Item
				class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
				textValue="Add account"
				onSelect={() => {
					handleAddAccount();
					mainMenuOpen = false;
				}}
			>
				<Text variant="body" size="sm" color="default" as="span">Add an account…</Text>
			</DropdownMenu.Item>

			<!-- Linked Accounts Sections -->
			{#each linkedAccountsWithOrgs as account (account.userId)}
				<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />

				<div class="px-menu-item py-form-field-gap flex items-center justify-between">
					<Text
						variant="label"
						size="sm"
						color="tertiary"
						as="p"
						class="truncate font-semibold tracking-wide uppercase"
					>
						{account.email ?? account.name ?? 'Linked account'}
					</Text>
					<!-- Linked Account menu (logout, create workspace) -->
					<DropdownMenu.Root
						open={linkedAccountMenuOpen[account.userId] ?? false}
						onOpenChange={(open) => (linkedAccountMenuOpen[account.userId] = open)}
					>
						<DropdownMenu.Trigger
							type="button"
							class="hover:bg-hover-solid flex size-icon-md items-center justify-center rounded-button text-tertiary transition-colors hover:text-primary"
							onclick={(e) => {
								e.stopPropagation(); // Prevent parent menu from closing
							}}
						>
							<!-- WORKAROUND: more-options icon missing from registry - see missing-styles.md -->
							<svg
								class="icon-sm"
								style="width: 16px; height: 16px;"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
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
								class="border-base py-badge min-w-[180px] rounded-button border bg-elevated shadow-card"
								style="z-index: var(--zIndex-popover);"
								side="right"
								align="start"
								sideOffset={4}
								onInteractOutside={(e) => {
									e.stopPropagation(); // Prevent parent menu from closing
								}}
							>
								<DropdownMenu.Item
									class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
									textValue="Create workspace"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										onCreateWorkspaceForAccount?.(account.userId);
									}}
								>
									<div class="flex items-center gap-fieldGroup">
										<Icon type="add" size="sm" />
										<Text variant="body" size="sm" color="default" as="span">Create workspace</Text>
									</div>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
									textValue="Join workspace"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										onJoinWorkspaceForAccount?.(account.userId);
									}}
								>
									<div class="flex items-center gap-fieldGroup">
										<!-- WORKAROUND: user-plus icon missing from registry - see missing-styles.md -->
										<svg
											class="icon-sm"
											style="width: 16px; height: 16px;"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
											/>
										</svg>
										<Text variant="body" size="sm" color="default" as="span">Join workspace</Text>
									</div>
								</DropdownMenu.Item>
								<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />
								<DropdownMenu.Item
									class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
									textValue="Log out"
									onSelect={() => {
										linkedAccountMenuOpen[account.userId] = false;
										handleLogoutAccount(account.userId);
									}}
								>
									<div class="flex items-center gap-fieldGroup">
										<!-- WORKAROUND: logout icon missing from registry - see missing-styles.md -->
										<svg
											class="icon-sm"
											style="width: 16px; height: 16px;"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
											/>
										</svg>
										<Text variant="body" size="sm" color="error" as="span">Log out</Text>
									</div>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				</div>

				<!-- Linked Account Organizations -->
				{#each account.organizations as organization (`${organization.organizationId}-${account.userId}`)}
					<DropdownMenu.Item
						class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between outline-none"
						textValue={organization.name}
						onSelect={() => {
							// Switch to linked account and navigate to organization
							handleSwitchAccount(account.userId, `/inbox?org=${organization.organizationId}`);
							mainMenuOpen = false;
						}}
					>
						<div class="flex min-w-0 flex-1 items-center gap-fieldGroup">
							<Avatar
								initials={organization.initials ?? organization.name.slice(0, 2).toUpperCase()}
								size="sm"
								variant="default"
								class="flex-shrink-0"
								style="background-color: var(--color-component-sidebar-itemHover);"
							/>
							<div class="flex min-w-0 flex-col">
								<Text
									variant="body"
									size="sm"
									color="default"
									as="span"
									class="truncate font-medium"
								>
									{organization.name}
								</Text>
								<Text
									variant="label"
									size="sm"
									color="tertiary"
									as="span"
									class="truncate capitalize"
								>
									{organization.role}
								</Text>
							</div>
						</div>
						<!-- No checkmark for linked account workspaces - clicking switches accounts -->
					</DropdownMenu.Item>
				{/each}
			{/each}

			<!-- Account Management Section (for accounts without shown organizations above) -->
			{#if linkedAccounts.length > linkedAccountsWithOrgs.length}
				<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />
				{#each linkedAccounts as account (account.userId)}
					{#if !linkedAccountsWithOrgs.some((a) => a.userId === account.userId)}
						<div class="px-menu-item py-form-field-gap flex items-center justify-between">
							<Text
								variant="label"
								size="sm"
								color="tertiary"
								as="p"
								class="truncate font-semibold tracking-wide uppercase"
							>
								{account.email ?? account.name ?? 'Linked account'}
							</Text>
							<!-- Account menu (logout, create workspace) -->
							<DropdownMenu.Root
								open={linkedAccountMenuOpen[account.userId] ?? false}
								onOpenChange={(open) => (linkedAccountMenuOpen[account.userId] = open)}
							>
								<DropdownMenu.Trigger
									type="button"
									class="hover:bg-hover-solid flex size-icon-md items-center justify-center rounded-button text-tertiary transition-colors hover:text-primary"
									onclick={(e) => {
										e.stopPropagation(); // Prevent parent menu from closing
									}}
								>
									<!-- WORKAROUND: more-options icon missing from registry - see missing-styles.md -->
									<svg
										class="icon-sm"
										style="width: 16px; height: 16px;"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
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
										class="border-base py-badge min-w-[180px] rounded-button border bg-elevated shadow-card"
										style="z-index: var(--zIndex-popover);"
										side="right"
										align="start"
										sideOffset={4}
										onInteractOutside={(e) => {
											e.stopPropagation(); // Prevent parent menu from closing
										}}
									>
										<DropdownMenu.Item
											class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
											textValue="Create workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onCreateWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-fieldGroup">
												<Icon type="add" size="sm" />
												<Text variant="body" size="sm" color="default" as="span">
													Create workspace
												</Text>
											</div>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
											textValue="Join workspace"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onJoinWorkspaceForAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-fieldGroup">
												<!-- WORKAROUND: user-plus icon missing from registry - see missing-styles.md -->
												<svg
													class="icon-sm"
													style="width: 16px; height: 16px;"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
													/>
												</svg>
												<Text variant="body" size="sm" color="default" as="span">
													Join workspace
												</Text>
											</div>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="px-menu-item py-menu-item hover:bg-hover-solid focus:bg-hover-solid cursor-pointer outline-none"
											textValue="Log out"
											onSelect={() => {
												linkedAccountMenuOpen[account.userId] = false;
												onLogoutAccount?.(account.userId);
											}}
										>
											<div class="flex items-center gap-fieldGroup">
												<!-- WORKAROUND: logout icon missing from registry - see missing-styles.md -->
												<svg
													class="icon-sm"
													style="width: 16px; height: 16px;"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
												<Text variant="body" size="sm" color="error" as="span">Log out</Text>
											</div>
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>
					{/if}
				{/each}
			{/if}

			<!-- Organization Invites -->
			{#if organizationInvites.length > 0}
				<DropdownMenu.Separator class="my-form-field-gap border-base border-t" />
				<div class="px-menu-item py-menu-item">
					<Text
						variant="label"
						size="sm"
						color="tertiary"
						as="p"
						class="font-semibold tracking-wide uppercase"
					>
						Organization invites
					</Text>
				</div>
				{#each organizationInvites as invite (invite.inviteId)}
					<div class="px-menu-item py-form-field-gap">
						<div class="flex items-start gap-fieldGroup">
							<Avatar
								initials={invite.organizationName.slice(0, 2).toUpperCase()}
								size="sm"
								variant="default"
								class="flex-shrink-0"
								style="background-color: var(--color-component-sidebar-itemHover); color: var(--color-component-sidebar-primary);"
							/>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-fieldGroup">
									<Text
										variant="body"
										size="sm"
										color="default"
										as="span"
										class="truncate font-medium"
									>
										{invite.organizationName}
									</Text>
									<Text variant="label" size="sm" color="tertiary" as="span">
										{invite.role}
									</Text>
								</div>
								<Text variant="label" size="sm" color="secondary" as="p" class="truncate">
									Invited by {invite.invitedBy}
								</Text>
								<div class="mt-form-field-gap flex gap-fieldGroup">
									<Button
										variant="solid"
										size="sm"
										onclick={() => {
											handleAcceptOrganizationInvite(invite.code);
											mainMenuOpen = false;
										}}
									>
										Accept
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											handleDeclineOrganizationInvite(invite.inviteId);
											mainMenuOpen = false;
										}}
									>
										Decline
									</Button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* WORKAROUND: Portal dropdown z-index fix - see missing-styles.md */
	/* Ensures dropdown menu appears above fixed sidebar (z-index 50) */
	:global([data-dropdown-menu-content]) {
		z-index: var(--zIndex-max) !important;
	}
</style>
