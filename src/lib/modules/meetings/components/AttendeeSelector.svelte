<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import type { Id } from '$lib/convex';

	type Attendee = {
		type: 'user' | 'circle';
		id: Id<'users'> | Id<'circles'>;
		name: string;
		email?: string; // For users
	};

	type Props = {
		selectedAttendees: Attendee[];
		onAttendeesChange: (attendees: Attendee[]) => void;
		organizationId: Id<'organizations'>;
		sessionId: string;
	};

	let {
		selectedAttendees = $bindable([]),
		onAttendeesChange,
		organizationId,
		sessionId
	}: Props = $props();

	// Queries for users and circles
	const usersQuery =
		browser && organizationId && sessionId
			? useQuery(api.organizations.getMembers, () => ({
					organizationId,
					sessionId
				}))
			: null;

	const circlesQuery =
		browser && organizationId && sessionId
			? useQuery(api.circles.list, () => ({
					organizationId,
					sessionId
				}))
			: null;

	// Combine all available attendees
	const availableAttendees = $derived.by(() => {
		const attendees: Attendee[] = [];

		// Add users
		const users = usersQuery?.data ?? [];
		for (const user of users) {
			attendees.push({
				type: 'user',
				id: user.userId as Id<'users'>,
				name: user.name || user.email || 'Unknown',
				email: user.email
			});
		}

		// Add circles
		const circles = circlesQuery?.data ?? [];
		for (const circle of circles) {
			attendees.push({
				type: 'circle',
				id: circle.circleId as Id<'circles'>,
				name: circle.name
			});
		}

		return attendees;
	});

	// Search state
	let searchValue = $state('');
	let comboboxOpen = $state(false);

	// Filter attendees based on search
	const filteredAttendees = $derived(() => {
		const attendees = availableAttendees;
		if (!searchValue || searchValue.trim().length === 0) {
			return attendees;
		}

		const searchLower = searchValue.toLowerCase().trim();
		return attendees.filter((attendee) => {
			const nameMatch = attendee.name.toLowerCase().includes(searchLower);
			const emailMatch = attendee.email?.toLowerCase().includes(searchLower);
			return nameMatch || emailMatch;
		});
	});

	// Check if attendee is selected
	function isSelected(attendee: Attendee): boolean {
		return selectedAttendees.some(
			(selected) => selected.type === attendee.type && selected.id === attendee.id
		);
	}

	// Toggle attendee selection
	function toggleAttendee(attendee: Attendee) {
		const isCurrentlySelected = isSelected(attendee);
		if (isCurrentlySelected) {
			selectedAttendees = selectedAttendees.filter(
				(selected) => !(selected.type === attendee.type && selected.id === attendee.id)
			);
		} else {
			selectedAttendees = [...selectedAttendees, attendee];
		}
		onAttendeesChange(selectedAttendees);
	}

	// Remove attendee
	function removeAttendee(attendee: Attendee) {
		selectedAttendees = selectedAttendees.filter(
			(selected) => !(selected.type === attendee.type && selected.id === attendee.id)
		);
		onAttendeesChange(selectedAttendees);
	}

	// Get type badge label
	function getTypeLabel(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'User';
			case 'circle':
				return 'Circle';
		}
	}

	// Get type badge color class
	function getTypeBadgeClass(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'bg-accent-primary/10 text-accent-primary';
			case 'circle':
				return 'bg-accent-primary/10 text-accent-primary';
		}
	}

	// Get icon for type
	function getTypeIcon(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
			case 'circle':
				return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
		}
	}

	let inputRef: HTMLElement | null = $state(null);
</script>

<div class="flex flex-col gap-icon">
	<div class="text-body-sm block font-medium text-text-primary">Attendees (optional)</div>

	<!-- Selected attendees chips -->
	{#if selectedAttendees.length > 0}
		<div class="flex flex-wrap items-center gap-icon">
			{#each selectedAttendees as attendee (attendee.type + attendee.id)}
				<div
					class="text-body-sm inline-flex items-center gap-icon rounded-button border border-border-base bg-surface px-badge py-badge"
				>
					<svg
						class="icon-sm text-text-secondary"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={getTypeIcon(attendee.type)}
						/>
					</svg>
					<span class="text-text-primary">{attendee.name}</span>
					<span
						class="px-badge-sm py-badge-sm rounded-badge text-label {getTypeBadgeClass(
							attendee.type
						)}"
					>
						{getTypeLabel(attendee.type)}
					</span>
					<button
						type="button"
						onclick={() => removeAttendee(attendee)}
						class="ml-spacing-icon-gap-sm p-control-button-padding-sm rounded-button text-text-tertiary transition-colors hover:text-text-primary"
						aria-label={`Remove ${attendee.name}`}
					>
						<svg class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/each}
			<!-- Add more button -->
			<button
				type="button"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					comboboxOpen = true;
				}}
				class="text-body-sm hover:bg-surface-hover inline-flex items-center gap-icon rounded-button border border-border-base bg-surface px-badge py-badge text-text-secondary transition-colors hover:text-text-primary"
				aria-label="Add more attendees"
			>
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				<span>Add</span>
			</button>
		</div>
	{/if}

	<!-- Combobox -->
	<div class="relative">
		<Combobox.Root
			type="multiple"
			bind:open={comboboxOpen}
			onValueChange={() => {
				// Handled by toggleAttendee
			}}
		>
			{#if selectedAttendees.length === 0}
				<!-- Empty state: trigger button -->
				<div class="relative" bind:this={inputRef}>
					<button
						type="button"
						onclick={() => (comboboxOpen = true)}
						class="text-body-sm hover:bg-surface-hover flex w-full items-center gap-icon rounded-input border border-border-base bg-surface px-input-x py-input-y text-left text-text-secondary transition-colors hover:text-text-primary"
						aria-label="Add attendees"
					>
						<svg
							class="icon-sm flex-shrink-0"
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
						<span>Add attendees</span>
					</button>
				</div>
			{:else}
				<!-- Anchor element when attendees exist (for positioning dropdown) -->
				<div class="relative" bind:this={inputRef} aria-hidden="true"></div>
			{/if}

			<Combobox.Portal>
				<Combobox.Content
					class="max-h-combobox-lg min-w-combobox-md py-menu-item-sm z-50 overflow-y-auto rounded-button border border-base bg-elevated shadow-card"
					side="bottom"
					align="start"
					sideOffset={4}
					customAnchor={inputRef}
				>
					<!-- Search input -->
					<div class="mb-spacing-text-gap relative border-b border-base px-menu-item py-menu-item">
						<Combobox.Input
							defaultValue={searchValue}
							oninput={(e) => {
								searchValue = e.currentTarget.value;
								comboboxOpen = true;
							}}
							placeholder="Search users or circles..."
							class="text-body-sm w-full rounded-input border border-base bg-base px-menu-item py-menu-item text-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							aria-label="Attendee search"
						/>
					</div>

					<!-- Selected attendees section -->
					{#if selectedAttendees.length > 0}
						<div class="py-menu-item-sm px-menu-item">
							<p
								class="mb-spacing-text-gap text-label font-medium tracking-wider text-tertiary uppercase"
							>
								Selected
							</p>
							<div class="gap-menu-item-sm flex flex-col">
								{#each selectedAttendees as attendee (attendee.type + attendee.id)}
									<button
										type="button"
										class="py-menu-item-sm text-body-sm flex w-full cursor-pointer items-center gap-icon px-menu-item text-left text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
										onclick={() => toggleAttendee(attendee)}
										aria-label={`Toggle ${attendee.name}`}
									>
										<svg
											class="icon-sm flex-shrink-0 text-accent-primary"
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
										<svg
											class="icon-sm text-text-secondary"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={getTypeIcon(attendee.type)}
											/>
										</svg>
										<span class="flex-1">{attendee.name}</span>
										<span
											class="px-badge-sm py-badge-sm rounded-badge text-label {getTypeBadgeClass(
												attendee.type
											)}"
										>
											{getTypeLabel(attendee.type)}
										</span>
									</button>
								{/each}
							</div>
						</div>
						{#if filteredAttendees().some((a) => !isSelected(a))}
							<div class="my-menu-item-sm h-px bg-base"></div>
						{/if}
					{/if}

					<!-- Available attendees -->
					{@const unselectedAttendees = filteredAttendees().filter((a) => !isSelected(a))}
					{#if unselectedAttendees.length > 0}
						<div class="py-menu-item-sm px-menu-item">
							<p
								class="mb-spacing-text-gap text-label font-medium tracking-wider text-tertiary uppercase"
							>
								Available
							</p>
							<div class="gap-menu-item-sm flex flex-col">
								{#each unselectedAttendees as attendee (attendee.type + attendee.id)}
									<button
										type="button"
										class="py-menu-item-sm text-body-sm flex w-full cursor-pointer items-center gap-icon px-menu-item text-left text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
										onclick={() => toggleAttendee(attendee)}
										aria-label={`Select ${attendee.name}`}
									>
										<div class="icon-sm flex-shrink-0"></div>
										<svg
											class="icon-sm text-text-secondary"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={getTypeIcon(attendee.type)}
											/>
										</svg>
										<span class="flex-1">{attendee.name}</span>
										{#if attendee.email}
											<span class="text-label text-text-tertiary">{attendee.email}</span>
										{/if}
										<span
											class="px-badge-sm py-badge-sm rounded-badge text-label {getTypeBadgeClass(
												attendee.type
											)}"
										>
											{getTypeLabel(attendee.type)}
										</span>
									</button>
								{/each}
							</div>
						</div>
					{:else if searchValue.trim().length > 0}
						<div class="py-menu-item-sm text-body-sm px-menu-item text-text-tertiary">
							No results found
						</div>
					{/if}
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox.Root>
	</div>

	{#if selectedAttendees.length === 0}
		<p class="text-label text-text-tertiary">No attendees selected - add users or circles</p>
	{/if}
</div>
