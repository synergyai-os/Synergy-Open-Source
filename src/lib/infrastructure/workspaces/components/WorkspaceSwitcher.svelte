<script lang="ts">
	import { DropdownMenu, ScrollArea } from 'bits-ui';
	import { WorkspaceSelector } from '$lib/components/molecules';
	import AccountInfo from '$lib/components/molecules/AccountInfo.svelte';
	import AccountActions from '$lib/components/molecules/AccountActions.svelte';
	import OrganizationList from '$lib/components/molecules/OrganizationList.svelte';
	import WorkspaceActions from '$lib/components/molecules/WorkspaceActions.svelte';
	import LinkedAccountGroup from '$lib/components/molecules/LinkedAccountGroup.svelte';
	import InvitesList from '$lib/components/molecules/InvitesList.svelte';
	import { Text } from '$lib/components/atoms';
	import { dropdownMenuItemRecipe } from '$lib/design-system/recipes';
	import type { WorkspaceInvite, WorkspaceSummary } from '../composables/useWorkspaces.svelte';

	type Variant = 'sidebar' | 'topbar';

	type LinkedAccount = {
		userId: string;
		email: string | null;
		name: string | null;
		firstName: string | null;
		lastName: string | null;
		workspaces?: Array<{
			workspaceId: string;
			name: string;
			initials?: string;
			slug?: string;
			role: 'owner' | 'admin' | 'member';
		}>;
	};

	let {
		workspaces = [] as WorkspaceSummary[],
		activeWorkspaceId = null as string | null,
		activeWorkspace = null as WorkspaceSummary | null,
		workspaceInvites = [] as WorkspaceInvite[],
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
		workspaces?: WorkspaceSummary[];
		activeWorkspaceId?: string | null;
		activeWorkspace?: WorkspaceSummary | null;
		workspaceInvites?: WorkspaceInvite[];
		accountEmail?: string;
		accountName?: string;
		linkedAccounts?: LinkedAccount[];
		variant?: Variant;
		sidebarCollapsed?: boolean;
		isLoading?: boolean;
		onSelectOrganization?: (workspaceId: string | null) => void;
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

	const showLabels = $derived(variant === 'topbar' || !sidebarCollapsed);

	// Controlled open state for main dropdown
	let mainMenuOpen = $state(false);

	// Viewport ref for scroll reset
	let viewportRef = $state<HTMLDivElement | null>(null);

	// Reset scroll position to top when menu opens
	$effect(() => {
		if (mainMenuOpen && viewportRef) {
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				viewportRef!.scrollTop = 0;
			});
		}
	});

	// Apply dropdown menu item recipe
	const menuItemClasses = $derived(dropdownMenuItemRecipe());

	// Generate 2-letter initials from org name (e.g., "Synergy OS" → "SY", "Test" → "TE")
	function getOrgInitials(name: string | undefined): string {
		if (!name) return '—';
		// Take first 2 characters, uppercase
		return name.slice(0, 2).toUpperCase();
	}

	const triggerInitials = $derived(
		activeWorkspace?.initials ?? getOrgInitials(activeWorkspace?.name)
	);
	const triggerOrgName = $derived(activeWorkspace?.name ?? 'Select workspace');

	// Current account's workspaces (formatted for OrganizationList)
	const currentAccountOrganizations = $derived(
		(Array.isArray(workspaces) ? workspaces : [])
			.filter((org) => org && org.workspaceId)
			.map((org) => ({
				workspaceId: org.workspaceId,
				name: org.name,
				initials: org.initials,
				role: org.role,
				isFromLinkedAccount: false
			}))
	);

	// Linked accounts (filtered to valid accounts; LinkedAccountGroup handles empty orgs)
	const linkedAccountsWithOrgs = $derived(
		(Array.isArray(linkedAccounts) ? linkedAccounts : []).filter(
			(account) => account && account.userId
		)
	);

	function handleSelect(workspaceId: string | null) {
		onSelectOrganization?.(workspaceId);
	}

	function handleClose() {
		mainMenuOpen = false;
	}
</script>

<DropdownMenu.Root bind:open={mainMenuOpen}>
	<DropdownMenu.Trigger
		type="button"
		class={showLabels
			? 'gap-button rounded-button hover:bg-component-sidebar-itemHover flex w-full cursor-pointer items-center text-left transition-colors duration-200'
			: 'rounded-button hover:bg-component-sidebar-itemHover flex w-full cursor-pointer items-center text-left transition-colors duration-200'}
		style="padding-inline: var(--spacing-2); padding-block: calc(var(--spacing-2) * 0.75);"
	>
		<WorkspaceSelector
			initials={triggerInitials}
			orgName={triggerOrgName}
			{showLabels}
			{isLoading}
			{variant}
		/>
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal to="body">
		<DropdownMenu.Content
			class="border-base workspace-switcher-menu rounded-modal bg-surface relative min-w-[180px] overflow-hidden border shadow-md"
			side="bottom"
			align="start"
			sideOffset={4}
		>
			<!--
				Dropdown Background Gradient
				- Uses brand hue (195) at 5% opacity for subtle depth
				- Matches login page aesthetic but more subtle for smaller surface
				- Radial gradient positioned at top center for natural light feel
			-->
			<div
				class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[var(--gradient-overlay-from)] via-[var(--gradient-overlay-via)] to-transparent"
				aria-hidden="true"
			></div>
			<!-- Scroll container - only shows scrollbar when content exceeds max height -->
			<ScrollArea.Root type="auto" scrollHideDelay={400}>
				<ScrollArea.Viewport
					bind:ref={viewportRef}
					class="py-inset-xs relative"
					style="max-height: 70vh;"
				>
					<!-- Account Info Section -->
					<AccountInfo {accountName} {accountEmail} />

					<!-- Settings and Invite Actions -->
					<AccountActions {onSettings} {onInviteMembers} onClose={handleClose} />

					<!-- Separator -->
					<DropdownMenu.Separator class="border-base my-stack-divider border-t" />

					<!-- Current Account Section Header -->
					<div class="px-input py-stack-header flex items-center justify-between">
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
					<OrganizationList
						workspaces={currentAccountOrganizations}
						{activeWorkspaceId}
						onSelect={(orgId) => handleSelect(orgId)}
						onClose={handleClose}
					/>

					<!-- Logout Button (Current Account Only) -->
					{#if onLogout}
						<DropdownMenu.Item
							class={menuItemClasses}
							textValue="Log out"
							onSelect={() => {
								onLogout();
								handleClose();
							}}
						>
							<div class="gap-header flex items-center">
								<!-- WORKAROUND: logout icon missing from registry - see missing-styles.md -->
								<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					{/if}

					<!-- Actions Section -->
					<DropdownMenu.Separator class="border-base my-stack-divider border-t" />

					<WorkspaceActions
						{onCreateWorkspace}
						{onCreateOrganization}
						{onJoinOrganization}
						onClose={handleClose}
					/>

					<DropdownMenu.Separator class="border-base my-stack-divider border-t" />

					<!-- Add account -->
					<DropdownMenu.Item
						class={menuItemClasses}
						textValue="Add account"
						onSelect={() => {
							onAddAccount?.();
							mainMenuOpen = false;
						}}
					>
						<Text variant="body" size="sm" color="secondary" as="span">Add an account…</Text>
					</DropdownMenu.Item>

					<!-- Linked Accounts Sections -->
					{#each linkedAccountsWithOrgs as account (account.userId)}
						<LinkedAccountGroup
							{account}
							{onSwitchAccount}
							onCreateWorkspace={onCreateWorkspaceForAccount}
							onJoinWorkspace={onJoinWorkspaceForAccount}
							onLogout={onLogoutAccount}
							onClose={handleClose}
						/>
					{/each}

					<!-- Organization Invites -->
					<InvitesList
						invites={workspaceInvites}
						onAccept={onAcceptOrganizationInvite}
						onDecline={onDeclineOrganizationInvite}
						onClose={handleClose}
					/>
				</ScrollArea.Viewport>
				<!-- WORKAROUND: w-2 is scrollbar-specific width, no semantic token - see missing-styles.md -->
				<ScrollArea.Scrollbar
					orientation="vertical"
					class="flex touch-none p-px transition-opacity duration-200 select-none"
					style="width: 0.5rem;"
				>
					<ScrollArea.Thumb
						class="bg-tertiary rounded-avatar relative flex-1"
						style="opacity: var(--opacity-50);"
					/>
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/*
	 * WORKAROUND: Portal dropdown z-index fix
	 * Ensures dropdown menu appears above fixed sidebar (z-index 50)
	 * See: dev-docs/2-areas/patterns/missing-styles.md
	 */
	:global([data-dropdown-menu-content]) {
		z-index: var(--zIndex-max) !important;
	}

	/*
	 * Workspace switcher menu left margin for breathing room
	 * Uses --spacing-2 (8px) for compact design
	 */
	:global(.workspace-switcher-menu) {
		margin-left: var(--spacing-2) !important;
	}
</style>
