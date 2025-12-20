<script lang="ts">
	/**
	 * PeopleSelector Organism
	 *
	 * Unified person selection component with six modes:
	 * - workspace-all: All workspace members
	 * - circle-members: Specific circle only
	 * - circle-aware: All workspace, show circle badges
	 * - role-fillers: Show roles with current fillers
	 * - task-assignee: Person-only, no placeholders
	 * - document-owner: Person-only, no placeholders
	 *
	 * Pattern: TagSelector-inspired with Combobox + optimistic updates
	 * Design: Avatar + Text + Badge atoms, semantic tokens only
	 *
	 * @see dev-docs/investigation-people-selector.md
	 */

	import { browser } from '$app/environment';
	import { tick } from 'svelte';
	import { Combobox } from 'bits-ui';
	import { SvelteSet } from 'svelte/reactivity';
	import { useConvexClient } from 'convex-svelte';
	import { usePersonSelector } from '$lib/composables/usePersonSelector.svelte';
	import Avatar from '$lib/components/atoms/Avatar.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import { api, type Id } from '$lib/convex';
	import type { PersonSelectorMode } from '$lib/types/people-selector';

	type Props = {
		// Required
		mode: PersonSelectorMode;
		workspaceId: Id<'workspaces'>;
		sessionId: string;

		// Mode-specific
		circleId?: Id<'circles'>; // Required for: circle-members, circle-aware, role-fillers

		// Selection
		selectedPersonIds: Id<'people'>[]; // Bindable - current selection
		onSelect?: (personIds: Id<'people'>[]) => void;

		// Optional behavior
		multiple?: boolean; // Allow multiple selection (default: false)
		excludePersonIds?: Id<'people'>[]; // Exclude these from options
		allowCreate?: boolean; // Show "Add New" option (default: true)
		placeholder?: string; // Input placeholder text
		triggerStyle?: 'default' | 'external'; // 'default' = renders button, 'external' = parent controls open

		// Optional refs
		inputRef?: HTMLElement | null; // Bindable - for keyboard focus management
		open?: boolean; // Bindable - combobox open state
		anchorElement?: HTMLElement | null; // Required for triggerStyle='external' - the trigger button to anchor to
	};

	let {
		mode,
		workspaceId,
		sessionId,
		circleId,
		selectedPersonIds = $bindable([]),
		onSelect,
		multiple = false,
		excludePersonIds = [],
		allowCreate = true,
		placeholder = 'Select person...',
		triggerStyle = 'default',
		inputRef = $bindable(null),
		open: externalOpen = $bindable(undefined),
		anchorElement = null
	}: Props = $props();

	// Set default onSelect
	if (!onSelect) onSelect = () => {};

	// Use composable for state management
	const selector = usePersonSelector({
		mode: () => mode,
		workspaceId: () => workspaceId,
		sessionId: () => sessionId,
		circleId: () => circleId,
		excludePersonIds: () => excludePersonIds
	});

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Internal combobox open state
	let comboboxOpenInternal = $state(false);

	// Derived value for reading - use external if provided, otherwise internal
	const comboboxOpen = $derived(externalOpen !== undefined ? externalOpen : comboboxOpenInternal);

	// Function to update combobox open state
	function setComboboxOpen(value: boolean) {
		if (externalOpen !== undefined) {
			externalOpen = value;
		} else {
			comboboxOpenInternal = value;
		}
	}

	// Handle open state changes from Bits UI
	function handleOpenChange(newOpen: boolean) {
		if (externalOpen !== undefined && externalOpen !== newOpen) {
			externalOpen = newOpen;
		}
	}

	// External → Internal: When external state changes, update internal
	$effect(() => {
		if (externalOpen !== undefined) {
			const externalValue = externalOpen;
			if (externalValue !== comboboxOpenInternal) {
				comboboxOpenInternal = externalValue;
			}
		}
	});

	// Selected persons set for fast lookup
	const selectedSet = $derived(new SvelteSet(selectedPersonIds));

	// Get selected person options for display
	const selectedOptions = $derived(() => {
		return selectedPersonIds
			.map((id) => selector.options.find((opt) => opt.personId === id))
			.filter((opt): opt is NonNullable<typeof opt> => opt !== undefined);
	});

	// Get available options (not selected)
	const availableOptions = $derived(() => {
		return selector.options.filter((opt) => !opt.personId || !selectedSet.has(opt.personId));
	});

	// Handle person selection toggle
	function handlePersonToggle(personId: Id<'people'>) {
		if (multiple) {
			if (selectedPersonIds.includes(personId)) {
				selectedPersonIds = selectedPersonIds.filter((id) => id !== personId);
			} else {
				selectedPersonIds = [...selectedPersonIds, personId];
			}
		} else {
			// Single select: replace selection
			selectedPersonIds = [personId];
			setComboboxOpen(false);
		}

		onSelect?.(selectedPersonIds);
	}

	// Handle input focus
	function handleInputFocus() {
		setComboboxOpen(true);
	}

	// Handle Enter key in input - create person if no matches
	function handleInputKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === 'Return') {
			event.preventDefault();
			event.stopPropagation();
			if (allowCreate && selector.canCreateNew && selector.searchValue.trim().length > 0) {
				handleCreatePersonClick();
			}
		}
	}

	// Add New dialog state
	let showAddNewDialog = $state(false);
	let addNewStep = $state<'choice' | 'email'>('choice');
	let addNewName = $state('');
	let addNewEmail = $state('');
	let addNewLoading = $state(false);
	let addNewError = $state<string | null>(null);

	// Handle "Add New" click
	function handleCreatePersonClick() {
		addNewName = selector.searchValue.trim();
		addNewEmail = '';
		addNewError = null;
		addNewStep = 'choice';
		showAddNewDialog = true;
	}

	// Handle create placeholder
	async function handleCreatePlaceholder() {
		if (!convexClient) {
			addNewError = 'Convex client not available';
			return;
		}

		addNewLoading = true;
		addNewError = null;

		try {
			const personId = await convexClient.mutation(api.core.people.mutations.createPlaceholder, {
				sessionId,
				workspaceId,
				displayName: addNewName,
				workspaceRole: 'member'
			});

			// Add to selectedPersonIds optimistically
			selectedPersonIds = [...selectedPersonIds, personId];
			onSelect?.(selectedPersonIds);

			showAddNewDialog = false;
			selector.clearSearch();
		} catch (error) {
			addNewError = error instanceof Error ? error.message : 'Failed to create placeholder';
		} finally {
			addNewLoading = false;
		}
	}

	// Handle send invite (show email step)
	function handleSendInviteClick() {
		addNewStep = 'email';
		addNewEmail = '';
		addNewError = null;
	}

	// Handle send invite submission
	async function handleSendInviteSubmit() {
		if (!addNewEmail || !addNewEmail.trim()) {
			addNewError = 'Email is required';
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(addNewEmail.trim())) {
			addNewError = 'Please enter a valid email address';
			return;
		}

		addNewLoading = true;
		addNewError = null;

		try {
			// TODO: Check for duplicate email
			// const existing = await ctx.query(api.core.people.queries.findPersonByEmailAndWorkspace, {
			//   workspaceId,
			//   email: addNewEmail.trim()
			// });
			// if (existing) {
			//   addNewError = 'A person with this email already exists';
			//   return;
			// }

			// TODO: Call mutation to send invite
			// const personId = await ctx.mutation(api.features.invites.mutations.createWorkspaceInvite, {
			//   sessionId,
			//   workspaceId,
			//   email: addNewEmail.trim(),
			//   role: 'member'
			// });

			console.log('Sending invite to:', addNewEmail);
			await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

			// TODO: Add to selectedPersonIds optimistically
			// selectedPersonIds = [...selectedPersonIds, personId];
			// onSelect?.(selectedPersonIds);

			showAddNewDialog = false;
			selector.clearSearch();
		} catch (error) {
			addNewError = error instanceof Error ? error.message : 'Failed to send invitation';
		} finally {
			addNewLoading = false;
		}
	}

	// Handle dialog cancel
	function handleAddNewCancel() {
		if (addNewStep === 'email') {
			// Go back to choice step
			addNewStep = 'choice';
			addNewEmail = '';
			addNewError = null;
		} else {
			// Close dialog
			showAddNewDialog = false;
		}
	}

	// Input element reference for auto-focus
	let comboboxInputRef = $state<HTMLInputElement | null>(null);

	function tryFocusComboboxInput(): boolean {
		// Try bound ref first (best case)
		let inputToFocus = comboboxInputRef;

		// Fallback: query for input if ref isn't bound yet (Portal timing)
		if (!inputToFocus) {
			inputToFocus = document.querySelector(
				'input[aria-label="Person selector input"]'
			) as HTMLInputElement | null;
		}

		if (!inputToFocus) return false;

		inputToFocus.focus();
		inputToFocus.select();
		return true;
	}

	// Focus input after open; uses tick + a few RAF retries to handle Portal/animation timing
	async function focusComboboxInputSoon() {
		if (!browser) return;
		await tick();

		let attempts = 0;
		const maxAttempts = 6;

		const step = () => {
			if (tryFocusComboboxInput()) return;
			attempts += 1;
			if (attempts < maxAttempts) requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	}

	// Handle auto-focus when combobox content opens (Bits UI fires after animations complete)
	function handleOpenChangeComplete(isOpen: boolean) {
		if (!isOpen) return;
		void focusComboboxInputSoon();
	}

	// Extra safety: if open is controlled externally or events don't fire, focus whenever it opens
	$effect(() => {
		if (!browser) return;
		if (!comboboxOpenInternal) return;
		void focusComboboxInputSoon();
	});

	// Calculate initials from name
	function getInitials(name?: string): string {
		if (!name) return '?';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Get badge variant from badge type
	function getBadgeVariant(badgeType?: string): 'default' | 'primary' | 'success' | 'warning' {
		switch (badgeType) {
			case 'circle-member':
				return 'success';
			case 'workspace-member':
				return 'default';
			case 'placeholder':
				return 'warning';
			case 'invited':
				return 'primary';
			default:
				return 'default';
		}
	}

	// Get badge label
	function getBadgeLabel(badgeType?: string): string {
		switch (badgeType) {
			case 'circle-member':
				return 'Circle Member';
			case 'workspace-member':
				return 'Workspace';
			case 'placeholder':
				return 'Placeholder';
			case 'invited':
				return 'Invited';
			default:
				return '';
		}
	}
</script>

<div class={triggerStyle === 'external' ? 'contents' : 'relative'}>
	{#snippet comboboxChildren()}
		<!-- Selected People Display (pills) -->
		{#if selectedOptions().length > 0 && multiple}
			<div class="mb-header gap-fieldGroup flex flex-wrap">
				{#each selectedOptions() as person (person.id)}
					<button
						type="button"
						class="bg-subtle px-badge-md py-badge-md text-primary text-label gap-fieldGroup inline-flex items-center rounded transition-opacity hover:opacity-80"
						onclick={() => person.personId && handlePersonToggle(person.personId)}
						aria-label={`Remove ${person.displayName}`}
					>
						<Avatar initials={getInitials(person.avatarName)} size="xxs" />
						<span>{person.displayName}</span>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Trigger Button (hidden when triggerStyle='external') -->
		{#if triggerStyle !== 'external'}
			<div class="relative" bind:this={inputRef}>
				{#if selectedOptions().length === 0}
					<button
						type="button"
						class="border-base py-stack-item hover:bg-hover bg-base text-secondary hover:text-primary gap-fieldGroup px-input flex w-full items-center rounded-md border text-left text-sm transition-colors"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setComboboxOpen(true);
						}}
						aria-label={placeholder}
					>
						<!-- Person icon -->
						<svg
							class="size-icon-sm flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						<span>{placeholder}</span>
					</button>
				{:else if !multiple}
					<!-- Single select: show selected person -->
					<button
						type="button"
						class="border-base py-stack-item hover:bg-hover bg-base text-primary gap-fieldGroup px-input flex w-full items-center rounded-md border text-left text-sm transition-colors"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setComboboxOpen(true);
						}}
						aria-label={selectedOptions()[0]?.displayName}
					>
						<Avatar initials={getInitials(selectedOptions()[0]?.avatarName)} size="xs" />
						<div class="flex flex-1 flex-col">
							<span class="text-primary text-sm font-medium"
								>{selectedOptions()[0]?.displayName}</span
							>
							{#if selectedOptions()[0]?.email}
								<span class="text-tertiary text-label">{selectedOptions()[0]?.email}</span>
							{/if}
						</div>
					</button>
				{/if}
			</div>
		{/if}

		<!-- Note: In external mode, parent must provide anchorElement prop -->

		<Combobox.Portal>
			<Combobox.Content
				class="border-base bg-elevated py-inset-xs z-50 overflow-y-auto rounded-md border shadow-lg"
				style="max-height: 320px; min-width: 280px;"
				side="bottom"
				align="start"
				sideOffset={4}
				customAnchor={triggerStyle === 'external' ? anchorElement : inputRef}
			>
				<!-- Input field inside dropdown -->
				<div
					class="border-base px-input py-stack-item relative border-b"
					style="margin-bottom: 4px;"
				>
					<Combobox.Input
						bind:ref={comboboxInputRef}
						defaultValue={selector.searchValue}
						oninput={(e) => {
							selector.searchValue = e.currentTarget.value;
							setComboboxOpen(true);
						}}
						onkeydown={handleInputKeyDown}
						onfocus={handleInputFocus}
						{placeholder}
						class="border-base focus:ring-accent-primary bg-base text-primary focus:border-accent-primary px-input py-input w-full rounded-md border pr-8 text-sm outline-none focus:ring-2"
						aria-label="Person selector input"
					/>
				</div>

				<!-- Loading State -->
				{#if selector.isLoading}
					<div class="py-stack-item text-tertiary px-input text-center text-sm">Loading...</div>
				{:else if selector.error}
					<!-- Error State -->
					<div class="py-stack-item text-error px-input text-center text-sm">
						{selector.error}
					</div>
				{:else}
					<!-- Selected Section -->
					{#if selectedOptions().length > 0 && multiple}
						<div class="py-stack-item px-input">
							<p class="text-label text-tertiary mb-1 font-medium tracking-wider uppercase">
								Selected
							</p>
							<div class="space-y-0.5">
								{#each selectedOptions() as person (person.id)}
									<button
										type="button"
										class="py-stack-item hover:bg-hover focus:bg-hover text-primary gap-fieldGroup px-input flex w-full cursor-pointer items-center text-left text-sm outline-none"
										onclick={() => person.personId && handlePersonToggle(person.personId)}
										aria-label={`Deselect ${person.displayName}`}
									>
										<svg
											class="text-accent-primary size-icon-sm flex-shrink-0"
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
										<Avatar initials={getInitials(person.avatarName)} size="xs" />
										<div class="flex flex-1 flex-col">
											<span class="text-primary text-sm font-medium">{person.displayName}</span>
											{#if person.email}
												<span class="text-tertiary text-label">{person.email}</span>
											{/if}
										</div>
										{#if person.badge}
											<Badge variant={getBadgeVariant(person.badge)} size="sm">
												{getBadgeLabel(person.badge)}
											</Badge>
										{/if}
									</button>
								{/each}
							</div>
						</div>
						{#if availableOptions().length > 0}
							<div class="border-subtle my-stack-divider border-t"></div>
						{/if}
					{/if}

					<!-- Available People -->
					{#if availableOptions().length > 0}
						<div class="py-stack-item px-input">
							<p class="text-label text-tertiary mb-1 font-medium tracking-wider uppercase">
								Available
							</p>
							{#each availableOptions() as person (person.id)}
								<button
									type="button"
									class="py-stack-item hover:bg-hover focus:bg-hover text-primary gap-fieldGroup px-input flex w-full cursor-pointer items-center text-left text-sm outline-none"
									onclick={() => person.personId && handlePersonToggle(person.personId)}
									aria-label={`Select ${person.displayName}`}
								>
									<div class="size-icon-sm flex-shrink-0"></div>
									<Avatar initials={getInitials(person.avatarName)} size="xs" />
									<div class="flex flex-1 flex-col">
										<span class="text-primary text-sm font-medium">{person.displayName}</span>
										{#if person.email}
											<span class="text-tertiary text-label">{person.email}</span>
										{/if}
									</div>
									{#if person.badge}
										<Badge variant={getBadgeVariant(person.badge)} size="sm">
											{getBadgeLabel(person.badge)}
										</Badge>
									{/if}
								</button>
							{/each}
						</div>
					{:else if selector.searchValue.trim().length > 0}
						<!-- No matches -->
						<div class="py-stack-item text-tertiary px-input text-center text-sm">
							No people match "{selector.searchValue}"
						</div>
					{/if}

					<!-- Create New Option -->
					{#if allowCreate && selector.canCreateNew && selector.searchValue.trim().length > 0}
						{#if availableOptions().length > 0 || selectedOptions().length > 0}
							<div class="border-subtle my-stack-divider border-t"></div>
						{/if}
						<div class="border-base border-t pt-1">
							<button
								type="button"
								class="py-stack-item hover:bg-hover focus:bg-hover text-primary gap-fieldGroup px-input flex w-full cursor-pointer items-center text-left text-sm outline-none"
								onclick={handleCreatePersonClick}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === 'Return') {
										e.preventDefault();
										handleCreatePersonClick();
									}
								}}
								aria-label={`Add new person: ${selector.searchValue.trim()}`}
							>
								<svg
									class="text-secondary size-icon-sm flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								<span class="flex-1">Add new: '{selector.searchValue.trim()}'</span>
							</button>
						</div>
					{/if}

					<!-- Empty state -->
					{#if availableOptions().length === 0 && selectedOptions().length === 0 && !selector.canCreateNew && !selector.searchValue.trim()}
						<div class="py-stack-item text-tertiary px-input text-center text-sm">
							No people available
						</div>
					{/if}
				{/if}
			</Combobox.Content>
		</Combobox.Portal>
	{/snippet}

	{#if multiple}
		<Combobox.Root
			type="multiple"
			bind:value={selectedPersonIds}
			bind:open={comboboxOpenInternal}
			onOpenChange={handleOpenChange}
			onOpenChangeComplete={handleOpenChangeComplete}
			onValueChange={(values) => {
				// In multiple mode, Bits UI emits an array of values (or undefined when cleared)
				const next = Array.isArray(values) ? (values as Id<'people'>[]) : [];
				selectedPersonIds = next;
				onSelect?.(selectedPersonIds);
			}}
		>
			{@render comboboxChildren()}
		</Combobox.Root>
	{:else}
		<Combobox.Root
			type="single"
			value={selectedPersonIds[0] ?? undefined}
			bind:open={comboboxOpenInternal}
			onOpenChange={handleOpenChange}
			onOpenChangeComplete={handleOpenChangeComplete}
			onValueChange={(value) => {
				if (value) {
					selectedPersonIds = [value as Id<'people'>];
					setComboboxOpen(false);
				} else {
					selectedPersonIds = [];
				}
				onSelect?.(selectedPersonIds);
			}}
		>
			{@render comboboxChildren()}
		</Combobox.Root>
	{/if}
</div>

<!-- Add New Person Dialog -->
<StandardDialog
	bind:open={showAddNewDialog}
	title={addNewStep === 'choice' ? `Add "${addNewName}"` : 'Enter Email Address'}
	description={addNewStep === 'choice'
		? 'Choose how to add this person:'
		: 'Provide an email address to send an invitation.'}
	size="sm"
	onclose={() => {
		addNewStep = 'choice';
		addNewError = null;
	}}
>
	{#if addNewStep === 'choice'}
		<!-- Choice Step: Placeholder vs Invite -->
		<div class="gap-fieldGroup flex flex-col">
			<!-- Create Placeholder Option -->
			<button
				type="button"
				class="border-base hover:bg-hover px-input py-input flex flex-col gap-1 rounded-md border text-left transition-colors"
				onclick={handleCreatePlaceholder}
				disabled={addNewLoading}
			>
				<div class="text-primary gap-fieldGroup flex items-center text-sm font-medium">
					<span class="text-2xl">📧</span>
					<span>Create Placeholder</span>
				</div>
				<p class="text-tertiary text-label">
					Name-only entry for planning. Can be converted to a real user later.
				</p>
			</button>

			<!-- Send Invitation Option -->
			<button
				type="button"
				class="border-base hover:bg-hover px-input py-input flex flex-col gap-1 rounded-md border text-left transition-colors"
				onclick={handleSendInviteClick}
				disabled={addNewLoading}
			>
				<div class="text-primary gap-fieldGroup flex items-center text-sm font-medium">
					<span class="text-2xl">✉️</span>
					<span>Send Invitation</span>
				</div>
				<p class="text-tertiary text-label">
					Requires email address. Person will receive invite to join workspace.
				</p>
			</button>

			{#if addNewError}
				<div class="text-error text-label mt-2 text-center">
					{addNewError}
				</div>
			{/if}
		</div>
	{:else if addNewStep === 'email'}
		<!-- Email Input Step -->
		<div class="gap-fieldGroup flex flex-col">
			<div class="flex flex-col gap-1">
				<label for="add-new-email" class="text-label text-secondary font-medium">
					Email Address
				</label>
				<input
					id="add-new-email"
					type="email"
					bind:value={addNewEmail}
					placeholder="person@example.com"
					class="border-base focus:ring-accent-primary bg-base text-primary focus:border-accent-primary px-input py-input w-full rounded-md border text-sm outline-none focus:ring-2"
					disabled={addNewLoading}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleSendInviteSubmit();
						}
					}}
				/>
			</div>

			{#if addNewError}
				<div class="text-error text-label text-center">
					{addNewError}
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="gap-fieldGroup flex justify-end">
				<button
					type="button"
					class="border-base hover:bg-hover text-secondary px-button py-button rounded-md border text-sm transition-colors"
					onclick={handleAddNewCancel}
					disabled={addNewLoading}
				>
					Back
				</button>
				<button
					type="button"
					class="bg-accent-primary hover:bg-accent-hover text-inverse px-button py-button rounded-md text-sm font-medium transition-colors disabled:opacity-50"
					onclick={handleSendInviteSubmit}
					disabled={addNewLoading || !addNewEmail.trim()}
				>
					{addNewLoading ? 'Sending...' : 'Send Invitation'}
				</button>
			</div>
		</div>
	{/if}
</StandardDialog>
