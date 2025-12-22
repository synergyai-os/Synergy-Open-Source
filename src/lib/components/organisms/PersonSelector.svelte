<script lang="ts">
	/**
	 * PersonSelector Organism
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
	import { SvelteSet } from 'svelte/reactivity';
	import { usePersonSelector } from '$lib/composables/usePersonSelector.svelte';
	import { Combobox } from '$lib/components/molecules';
	import Avatar from '$lib/components/atoms/Avatar.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import {
		comboboxContentRecipe,
		comboboxItemRecipe,
		comboboxViewportRecipe
	} from '$lib/design-system/recipes';
	import { comboboxInputRecipe } from '$lib/design-system/recipes';
	import PersonSelectorAddNewDialog from '$lib/components/molecules/PersonSelectorAddNewDialog.svelte';
	import type { Id } from '$lib/convex';
	import type { PersonSelectorGrouping, PersonSelectorMode } from '$lib/types/person-selector';

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
		pinnedPersonIds?: Id<'people'>[]; // Display-only pinned section (e.g. "Assigned")
		pinnedSectionLabel?: string; // Label for pinned section (default: "Pinned")
		onPinnedPersonClick?: (personId: Id<'people'>) => void; // Optional action when clicking a pinned person
		allowCreate?: boolean; // Show "Add New" option (default: true)
		placeholder?: string; // Input placeholder text
		triggerStyle?: 'default' | 'external'; // 'default' = renders button, 'external' = parent controls open
		grouping?: PersonSelectorGrouping; // Optional grouping strategy (default: auto)

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
		pinnedPersonIds = [],
		pinnedSectionLabel = 'Pinned',
		onPinnedPersonClick,
		allowCreate = true,
		placeholder = 'Select person...',
		triggerStyle = 'default',
		grouping = 'auto',
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
		circleId: () => circleId
	});

	// Internal combobox open state
	let comboboxOpenInternal = $state(false);

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

	// Excluded set for fast lookup (view-level filtering; composable should return full data)
	const excludedSet = $derived(new SvelteSet(excludePersonIds));

	// Pinned set for fast lookup (also filtered out of available list to prevent duplicates)
	const pinnedSet = $derived(new SvelteSet(pinnedPersonIds));

	// Get selected person options for display
	const selectedOptions = $derived.by(() => {
		return selectedPersonIds
			.map((id) => selector.allOptions.find((opt) => opt.personId === id))
			.filter((opt): opt is NonNullable<typeof opt> => opt !== undefined);
	});

	// Pinned options (display-only)
	const pinnedOptions = $derived.by(() => {
		if (pinnedPersonIds.length === 0) return [];

		// Preserve pinned order as provided by the caller
		return pinnedPersonIds
			.map((id) => selector.allOptions.find((opt) => opt.personId === id))
			.filter((opt): opt is NonNullable<typeof opt> => opt !== undefined);
	});

	// Pinned options filtered by search (so pinned respects combobox search, too)
	const filteredPinnedOptions = $derived.by(() => {
		const q = selector.searchValue.trim().toLowerCase();
		if (!q) return pinnedOptions;
		return pinnedOptions.filter((opt) => opt.searchableText.toLowerCase().includes(q));
	});

	// Get available options (not selected)
	const availableOptions = $derived.by(() => {
		return selector.options.filter((opt) => {
			// Keep unselectable options (role-fillers mode may include role-only entries)
			if (!opt.personId) return true;
			// Hide items already selected, excluded, or pinned
			if (selectedSet.has(opt.personId)) return false;
			if (excludedSet.has(opt.personId)) return false;
			if (pinnedSet.has(opt.personId)) return false;
			return true;
		});
	});

	// Grouping: circle membership sections (default on for circle-aware)
	const isCircleMembershipGroupingEnabled = $derived.by(() => {
		if (grouping === 'off') return false;
		// Only meaningful for circle-aware right now (options carry circleMembership only in that mode).
		if (mode !== 'circle-aware') return false;
		if (grouping === 'circle-membership') return true;
		// grouping === 'auto'
		return true;
	});

	const availableInCircle = $derived.by(() => {
		if (!isCircleMembershipGroupingEnabled) return [];
		return availableOptions.filter((opt) => opt.circleMembership === 'in-circle');
	});

	const availableOutsideCircle = $derived.by(() => {
		if (!isCircleMembershipGroupingEnabled) return [];
		return availableOptions.filter((opt) => opt.circleMembership !== 'in-circle');
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

	// Bits UI prefers `bind:value` for value state. In single-select mode we bridge between
	// the combobox's string value and our array-based `selectedPersonIds` API via function binding.
	function getSingleValue(): string {
		return selectedPersonIds[0] ?? '';
	}

	function setSingleValue(newValue: string) {
		// Special-case: "pinned:" values are action items (unassign), not real selections.
		// Never write them into `selectedPersonIds`.
		if (newValue.startsWith('pinned:')) {
			selectedPersonIds = [];
			return;
		}
		if (newValue) {
			selectedPersonIds = [newValue as Id<'people'>];
		} else {
			selectedPersonIds = [];
		}
	}

	// Handle input focus
	function handleInputFocus() {
		setComboboxOpen(true);
	}

	// Handle Enter key in input - create person if no matches
	function handleInputKeyDown(event: KeyboardEvent) {
		// Make Cmd/Ctrl + A behave like a normal input (select all text), not "select all options"
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
			event.preventDefault();
			event.stopPropagation();
			const input = event.currentTarget as HTMLInputElement | null;
			input?.select();
			return;
		}

		// Ensure Backspace/Delete edits the input when there's text or a selection,
		// instead of triggering combobox-level behaviors (e.g. removing selected items).
		if (event.key === 'Backspace' || event.key === 'Delete') {
			const input = event.currentTarget as HTMLInputElement | null;
			const hasValue = (input?.value?.length ?? 0) > 0;
			const selectionStart = input?.selectionStart;
			const selectionEnd = input?.selectionEnd;
			const hasSelection =
				selectionStart !== null &&
				selectionEnd !== null &&
				selectionStart !== undefined &&
				selectionEnd !== undefined &&
				selectionStart !== selectionEnd;

			if (hasValue || hasSelection) {
				event.stopPropagation();
			}
		}

		// Enter should select the highlighted item (Bits UI default).
		// Only intercept Enter to create when there are truly no matches anywhere.
		if (event.key === 'Enter' || event.key === 'Return') {
			const q = selector.searchValue.trim();
			if (!q) return;

			const hasMatches = availableOptions.length > 0 || filteredPinnedOptions.length > 0;
			if (allowCreate && selector.canCreateNew && !hasMatches) {
				event.preventDefault();
				event.stopPropagation();
				handleCreatePersonClick();
			}
		}
	}

	// Add New dialog state (kept minimal; dialog manages its own workflow)
	const addDialog = $state({
		open: false,
		defaultDisplayName: ''
	});

	// Handle "Add New" click
	function handleCreatePersonClick() {
		addDialog.defaultDisplayName = selector.searchValue.trim();
		addDialog.open = true;
	}

	// Input element reference for auto-focus
	let comboboxInputRef = $state<HTMLInputElement | null>(null);
	const comboboxContentId = `person-selector-content-${Math.random().toString(36).slice(2, 9)}`;

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
		{#if selectedOptions.length > 0 && multiple}
			<div class="mb-header gap-fieldGroup flex flex-wrap">
				{#each selectedOptions as person (person.id)}
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
				{#if selectedOptions.length === 0}
					<Combobox.Trigger
						class="border-base py-stack-item hover:bg-hover bg-base text-secondary hover:text-primary gap-fieldGroup px-input flex w-full items-center rounded-md border text-left text-sm transition-colors"
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
					</Combobox.Trigger>
				{:else if !multiple}
					<!-- Single select: show selected person -->
					<Combobox.Trigger
						class="border-base py-stack-item hover:bg-hover bg-base text-primary gap-fieldGroup px-input flex w-full items-center rounded-md border text-left text-sm transition-colors"
						aria-label={selectedOptions[0]?.displayName}
					>
						<Avatar initials={getInitials(selectedOptions[0]?.avatarName)} size="xs" />
						<div class="flex flex-1 flex-col">
							<span class="text-primary text-sm font-medium">{selectedOptions[0]?.displayName}</span
							>
							{#if selectedOptions[0]?.email}
								<span class="text-tertiary text-label">{selectedOptions[0]?.email}</span>
							{/if}
						</div>
					</Combobox.Trigger>
				{/if}
			</div>
		{/if}

		<!-- Note: In external mode, parent must provide anchorElement prop -->

		<Combobox.Portal>
			<Combobox.Content
				id={comboboxContentId}
				class={comboboxContentRecipe()}
				side="bottom"
				align="start"
				sideOffset={4}
				customAnchor={triggerStyle === 'external' ? anchorElement : inputRef}
			>
				<!-- Gradient overlay (matches Combobox atom) -->
				<div
					class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[var(--gradient-overlay-from)] via-[var(--gradient-overlay-via)] to-transparent"
					aria-hidden="true"
				></div>
				<div class="relative">
					<!-- Input field inside dropdown -->
					<div
						class="border-base px-input py-stack-item relative border-b"
						style="margin-bottom: 4px;"
					>
						<Combobox.Input
							type="text"
							bind:ref={comboboxInputRef}
							value={selector.searchValue}
							oninput={(e) => {
								selector.searchValue = (e.currentTarget as HTMLInputElement).value;
								setComboboxOpen(true);
							}}
							onkeydown={handleInputKeyDown}
							onfocus={handleInputFocus}
							{placeholder}
							class={comboboxInputRecipe()}
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
						<Combobox.Viewport
							class={comboboxViewportRecipe()}
							style="max-height: var(--spacing-56); overflow-y: auto;"
						>
							<!-- Pinned Section (display-only; e.g. "Assigned") -->
							{#if filteredPinnedOptions.length > 0}
								<div class="py-stack-item px-input">
									<p class="text-label text-tertiary mb-1 font-medium tracking-wider uppercase">
										{pinnedSectionLabel}
									</p>
									<div class="space-y-0.5">
										{#each filteredPinnedOptions as person (person.id)}
											{@const isClickable = !!onPinnedPersonClick && !!person.personId}
											{#if person.personId}
												<Combobox.Item
													value={`pinned:${person.personId}`}
													label={person.displayName}
													disabled={!isClickable}
													class={comboboxItemRecipe()}
												>
													{#snippet children({ selected: _selected, highlighted: _highlighted })}
														{#if isClickable}
															<svg
																class="text-secondary size-icon-sm flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																aria-hidden="true"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
														{:else}
															<svg
																class="text-accent-primary size-icon-sm flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																aria-hidden="true"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														{/if}
														<Avatar initials={getInitials(person.avatarName)} size="xs" />
														<div class="flex flex-1 flex-col">
															<span class="text-primary text-sm font-medium"
																>{person.displayName}</span
															>
															{#if person.email}
																<span class="text-tertiary text-label">{person.email}</span>
															{/if}
														</div>
														{#if person.badge}
															<Badge variant={getBadgeVariant(person.badge)} size="sm">
																{getBadgeLabel(person.badge)}
															</Badge>
														{/if}
													{/snippet}
												</Combobox.Item>
											{/if}
										{/each}
									</div>
								</div>
								{#if selectedOptions.length > 0 || availableOptions.length > 0}
									<div class="border-subtle my-stack-divider border-t"></div>
								{/if}
							{/if}

							<!-- Selected Section -->
							{#if selectedOptions.length > 0 && multiple}
								<div class="py-stack-item px-input">
									<p class="text-label text-tertiary mb-1 font-medium tracking-wider uppercase">
										Selected
									</p>
									<div class="space-y-0.5">
										{#each selectedOptions as person (person.id)}
											{#if person.personId}
												<Combobox.Item
													value={person.personId}
													label={person.displayName}
													class={comboboxItemRecipe()}
												>
													{#snippet children({ selected: _selected })}
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
															<span class="text-primary text-sm font-medium"
																>{person.displayName}</span
															>
															{#if person.email}
																<span class="text-tertiary text-label">{person.email}</span>
															{/if}
														</div>
														{#if person.badge}
															<Badge variant={getBadgeVariant(person.badge)} size="sm">
																{getBadgeLabel(person.badge)}
															</Badge>
														{/if}
													{/snippet}
												</Combobox.Item>
											{/if}
										{/each}
									</div>
								</div>
								{#if availableOptions.length > 0}
									<div class="border-subtle my-stack-divider border-t"></div>
								{/if}
							{/if}

							<!-- Available People -->
							{#if availableOptions.length > 0}
								<div class="py-stack-item px-input">
									<p class="text-label text-tertiary mb-1 font-medium tracking-wider uppercase">
										Available
									</p>
									{#if isCircleMembershipGroupingEnabled}
										{#if availableInCircle.length > 0}
											<p
												class="text-label text-tertiary mt-2 mb-1 font-medium tracking-wider uppercase"
											>
												In this circle
											</p>
											{#each availableInCircle as person (person.id)}
												{#if person.personId}
													<Combobox.Item
														value={person.personId}
														label={person.displayName}
														class={comboboxItemRecipe()}
													>
														{#snippet children({ selected: _selected })}
															<div class="size-icon-sm flex-shrink-0"></div>
															<Avatar initials={getInitials(person.avatarName)} size="xs" />
															<div class="flex flex-1 flex-col">
																<span class="text-primary text-sm font-medium"
																	>{person.displayName}</span
																>
																{#if person.email}
																	<span class="text-tertiary text-label">{person.email}</span>
																{/if}
															</div>
															{#if person.badge}
																<Badge variant={getBadgeVariant(person.badge)} size="sm">
																	{getBadgeLabel(person.badge)}
																</Badge>
															{/if}
														{/snippet}
													</Combobox.Item>
												{/if}
											{/each}
										{/if}

										{#if availableOutsideCircle.length > 0}
											{#if availableInCircle.length > 0}
												<div class="border-subtle my-stack-divider border-t"></div>
											{/if}
											<p
												class="text-label text-tertiary mt-2 mb-1 font-medium tracking-wider uppercase"
											>
												Outside this circle
											</p>
											{#each availableOutsideCircle as person (person.id)}
												{#if person.personId}
													<Combobox.Item
														value={person.personId}
														label={person.displayName}
														class={comboboxItemRecipe()}
													>
														{#snippet children({ selected: _selected })}
															<div class="size-icon-sm flex-shrink-0"></div>
															<Avatar initials={getInitials(person.avatarName)} size="xs" />
															<div class="flex flex-1 flex-col">
																<span class="text-primary text-sm font-medium"
																	>{person.displayName}</span
																>
																{#if person.email}
																	<span class="text-tertiary text-label">{person.email}</span>
																{/if}
															</div>
															{#if person.badge}
																<Badge variant={getBadgeVariant(person.badge)} size="sm">
																	{getBadgeLabel(person.badge)}
																</Badge>
															{/if}
														{/snippet}
													</Combobox.Item>
												{/if}
											{/each}
										{/if}
									{:else}
										{#each availableOptions as person (person.id)}
											{#if person.personId}
												<Combobox.Item
													value={person.personId}
													label={person.displayName}
													class={comboboxItemRecipe()}
												>
													{#snippet children({ selected: _selected })}
														<div class="size-icon-sm flex-shrink-0"></div>
														<Avatar initials={getInitials(person.avatarName)} size="xs" />
														<div class="flex flex-1 flex-col">
															<span class="text-primary text-sm font-medium"
																>{person.displayName}</span
															>
															{#if person.email}
																<span class="text-tertiary text-label">{person.email}</span>
															{/if}
														</div>
														{#if person.badge}
															<Badge variant={getBadgeVariant(person.badge)} size="sm">
																{getBadgeLabel(person.badge)}
															</Badge>
														{/if}
													{/snippet}
												</Combobox.Item>
											{/if}
										{/each}
									{/if}
								</div>
							{:else if selector.searchValue.trim().length > 0}
								<!-- No matches -->
								<div class="py-stack-item text-tertiary px-input text-center text-sm">
									No people match "{selector.searchValue}"
								</div>
							{/if}

							<!-- Create New Option -->
							{#if allowCreate && selector.canCreateNew && selector.searchValue.trim().length > 0}
								{#if availableOptions.length > 0 || selectedOptions.length > 0}
									<div class="border-subtle my-stack-divider border-t"></div>
								{/if}
								<div class="border-base border-t pt-1">
									<button
										type="button"
										class={comboboxItemRecipe()}
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
							{#if availableOptions.length === 0 && selectedOptions.length === 0 && !selector.canCreateNew && !selector.searchValue.trim()}
								<div class="py-stack-item text-tertiary px-input text-center text-sm">
									No people available
								</div>
							{/if}
						</Combobox.Viewport>
					{/if}
				</div>
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
			items={availableOptions
				.filter((p) => p.personId)
				.map((p) => ({ value: p.personId as Id<'people'>, label: p.displayName }))}
			onValueChange={(values) => {
				// In multiple mode, Bits UI emits an array of values (or undefined when cleared)
				const next = Array.isArray(values) ? (values as Id<'people'>[]) : [];
				selectedPersonIds = next;
				// Avoid passing `$state` proxies across the boundary; always pass a fresh array
				onSelect?.([...next]);
			}}
		>
			{@render comboboxChildren()}
		</Combobox.Root>
	{:else}
		<Combobox.Root
			type="single"
			bind:value={getSingleValue, setSingleValue}
			bind:open={comboboxOpenInternal}
			onOpenChange={handleOpenChange}
			onOpenChangeComplete={handleOpenChangeComplete}
			items={[
				...filteredPinnedOptions
					.filter((p) => p.personId)
					.map((p) => ({ value: `pinned:${p.personId as Id<'people'>}`, label: p.displayName })),
				...availableOptions
					.filter((p) => p.personId)
					.map((p) => ({ value: p.personId as Id<'people'>, label: p.displayName }))
			]}
			onValueChange={(value) => {
				// Pinned action items: unassign (do not close; do not emit onSelect)
				if (typeof value === 'string' && value.startsWith('pinned:')) {
					const personId = value.slice('pinned:'.length) as Id<'people'>;
					onPinnedPersonClick?.(personId);
					// Keep search so user can quickly reassign; keep open.
					setComboboxOpen(true);
					return;
				}
				// Single-select semantics:
				// - Only emit `onSelect` when we have an actual selection (truthy value)
				// - Avoid passing `$state` proxies across the boundary; always pass a fresh array
				if (value) {
					const next = [value as Id<'people'>];
					setComboboxOpen(false);
					onSelect?.(next);
				} else {
					// Clearing selection should not be treated as "selected"
					selectedPersonIds = [];
				}
			}}
		>
			{@render comboboxChildren()}
		</Combobox.Root>
	{/if}
</div>

<PersonSelectorAddNewDialog
	bind:open={addDialog.open}
	{sessionId}
	{workspaceId}
	circleId={mode === 'circle-members' ? circleId : undefined}
	defaultDisplayName={addDialog.defaultDisplayName}
	workspaceRole="member"
	onCreated={(personId) => {
		// Optimistically update selection.
		// In single-select mode, replace the selection (avoids re-submitting the previous selection).
		// In multi-select mode, add it if it's not already selected.
		if (multiple) {
			selectedPersonIds = selectedPersonIds.includes(personId)
				? selectedPersonIds
				: [...selectedPersonIds, personId];
		} else {
			selectedPersonIds = [personId];
			setComboboxOpen(false);
		}
		// Avoid passing `$state` proxies across the boundary; always pass a fresh array
		onSelect?.([personId]);
		selector.clearSearch();
	}}
/>
