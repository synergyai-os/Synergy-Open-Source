<script lang="ts">
	import { DropdownMenu, ScrollArea } from 'bits-ui';
	import { WorkspaceSelector } from '$lib/components/molecules';
	import AccountInfo from '$lib/components/molecules/AccountInfo.svelte';
	import AccountActions from '$lib/components/molecules/AccountActions.svelte';
	import OrganizationList from '$lib/components/molecules/OrganizationList.svelte';
	import WorkspaceActions from '$lib/components/molecules/WorkspaceActions.svelte';
	import LinkedAccountGroup from '$lib/components/molecules/LinkedAccountGroup.svelte';
	import InvitesList from '$lib/components/molecules/InvitesList.svelte';
	import AccountMenu from '$lib/components/molecules/AccountMenu.svelte';
	import { Text } from '$lib/components/atoms';
	import type {
		OrganizationInvite,
		OrganizationSummary
	} from '../composables/useOrganizations.svelte';

	type Variant = 'sidebar' | 'topbar';

	type LinkedAccount = {
		userId: string;
		email: string | null;
		name: string | null;
		firstName: string | null;
		lastName: string | null;
		organizations?: Array<{
			organizationId: string;
			name: string;
			initials?: string;
			slug?: string;
			role: 'owner' | 'admin' | 'member';
		}>;
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

	// Generate 2-letter initials from org name (e.g., "Synergy OS" → "SY", "Test" → "TE")
	function getOrgInitials(name: string | undefined): string {
		if (!name) return '—';
		// Take first 2 characters, uppercase
		return name.slice(0, 2).toUpperCase();
	}

	const triggerInitials = $derived(
		activeOrganization?.initials ?? getOrgInitials(activeOrganization?.name)
	);
	const triggerOrgName = $derived(activeOrganization?.name ?? 'Select workspace');

	// Current account's organizations (formatted for OrganizationList)
	const currentAccountOrganizations = $derived(
		(Array.isArray(organizations) ? organizations : [])
			.filter((org) => org && org.organizationId)
			.map((org) => ({
				organizationId: org.organizationId,
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

	function handleSelect(organizationId: string | null) {
		onSelectOrganization?.(organizationId);
	}

	function handleClose() {
		mainMenuOpen = false;
	}
</script>

<DropdownMenu.Root bind:open={mainMenuOpen}>
	<DropdownMenu.Trigger
		type="button"
		class={`flex items-center ${showLabels ? 'gap-button px-2 py-[0.375rem]' : 'p-2'} group hover:bg-component-sidebar-itemHover w-full cursor-pointer rounded-button text-left transition-colors duration-200`}
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
			class="border-base organization-switcher-menu relative min-w-[180px] overflow-hidden rounded-modal border bg-surface shadow-md"
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
				class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
				aria-hidden="true"
			></div>
			<!-- Scroll container - only shows scrollbar when content exceeds max height -->
			<ScrollArea.Root type="auto" scrollHideDelay={400}>
				<ScrollArea.Viewport
					bind:ref={viewportRef}
					class="relative py-inset-xs"
					style="max-height: 70vh;"
				>
					<!-- Account Info Section -->
					<AccountInfo {accountName} {accountEmail} />

					<!-- Settings and Invite Actions -->
					<AccountActions {onSettings} {onInviteMembers} onClose={handleClose} />

					<!-- Separator -->
					<DropdownMenu.Separator class="border-base my-stack-divider border-t" />

					<!-- Current Account Section Header -->
					<div class="flex items-center justify-between px-input py-stack-header">
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
						organizations={currentAccountOrganizations}
						{activeOrganizationId}
						onSelect={(orgId) => handleSelect(orgId)}
						onClose={handleClose}
					/>

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
						class="mx-1 cursor-pointer rounded-button px-input py-stack-item transition-all duration-200 outline-none hover:bg-subtle focus:bg-subtle"
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
						invites={organizationInvites}
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
						class="bg-tertiary relative flex-1 rounded-avatar"
						style="opacity: var(--opacity-50);"
					/>
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* WORKAROUND: Portal dropdown z-index fix - see missing-styles.md */
	/* Ensures dropdown menu appears above fixed sidebar (z-index 50) */
	:global([data-dropdown-menu-content]) {
		z-index: var(--zIndex-max) !important;
	}

	/* Add left margin to organization switcher menu for breathing room */
	:global(.organization-switcher-menu) {
		margin-left: var(--spacing-2) !important;
	}
</style>
