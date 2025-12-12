<script lang="ts">
	import { Combobox } from 'bits-ui';
	import type { Id } from '$lib/convex';
	import { useAttendeeSelection, type Attendee } from '../composables/useAttendeeSelection.svelte';
	import { Text, Icon, Badge, Button } from '$lib/components/atoms';
	import AttendeeChip from './AttendeeChip.svelte';
	import {
		comboboxInputRecipe,
		comboboxContentRecipe,
		comboboxViewportRecipe,
		comboboxItemRecipe
	} from '$lib/design-system/recipes';

	type Props = {
		selectedAttendees: Attendee[];
		onAttendeesChange: (attendees: Attendee[]) => void;
		workspaceId: Id<'workspaces'>;
		sessionId: string;
	};

	let {
		selectedAttendees = $bindable([]),
		onAttendeesChange,
		workspaceId,
		sessionId
	}: Props = $props();

	// Use composable for all data and logic
	const attendeeSelection = useAttendeeSelection({
		workspaceId: () => workspaceId,
		sessionId: () => sessionId,
		selectedAttendees: () => selectedAttendees,
		onAttendeesChange
	});

	let inputRef: HTMLElement | null = $state(null);

	// eslint-disable-next-line svelte/prefer-writable-derived
	let localSearchValue = $state(attendeeSelection.searchValue);

	// eslint-disable-next-line svelte/prefer-writable-derived
	let localOpen = $state(attendeeSelection.comboboxOpen);

	// Sync localOpen with composable when it changes externally
	$effect(() => {
		localOpen = attendeeSelection.comboboxOpen;
	});

	// Sync localOpen changes back to composable
	$effect(() => {
		if (localOpen !== attendeeSelection.comboboxOpen) {
			attendeeSelection.setComboboxOpen(localOpen);
		}
	});

	// Sync localSearchValue with composable when it changes externally
	$effect(() => {
		localSearchValue = attendeeSelection.searchValue;
	});

	// Prepare combobox items and selected values for Bits UI
	const comboboxItems = $derived(
		attendeeSelection.filteredAttendees.map((a) => ({
			value: `${a.type}:${a.id}`,
			label: a.name
		}))
	);
	const selectedValues = $derived(selectedAttendees.map((a) => `${a.type}:${a.id}`));
</script>

<div class="gap-fieldGroup flex flex-col">
	<Text variant="body" size="sm" color="default" as="div" class="font-medium"
		>Attendees (optional)</Text
	>

	<!-- Selected attendees chips -->
	{#if selectedAttendees.length > 0}
		<div class="gap-fieldGroup flex flex-wrap items-center">
			{#each selectedAttendees as attendee (attendee.type + attendee.id)}
				<AttendeeChip
					{attendee}
					onRemove={attendeeSelection.removeAttendee}
					getTypeLabel={attendeeSelection.getTypeLabel}
				/>
			{/each}
			<!-- Add more button -->
			<!-- Match AttendeeChip height: use sm size (matches chip py-button-sm) with px-button override -->
			<!-- Smaller text (text-xs = 12px) while keeping button size perfect -->
			<Button
				variant="outline"
				size="sm"
				class="px-button text-xs font-normal"
				onclick={(e) => {
					e?.preventDefault();
					e?.stopPropagation();
					localOpen = true;
				}}
				ariaLabel="Add more attendees"
			>
				<Icon type="add" size="sm" />
				<span>Add</span>
			</Button>
		</div>
	{/if}

	<!-- Combobox -->
	<div class="relative">
		<Combobox.Root
			type="multiple"
			bind:open={localOpen}
			items={comboboxItems}
			value={selectedValues}
			onValueChange={(values) => {
				// Find the attendee that was toggled by comparing old and new values
				const newValues = (values as string[]) || [];
				const addedValue = newValues.find((v) => !selectedValues.includes(v));
				const removedValue = selectedValues.find((v) => !newValues.includes(v));

				if (addedValue) {
					// Find attendee and add it
					const [type, id] = addedValue.split(':');
					const attendee = attendeeSelection.filteredAttendees.find(
						(a) => a.type === type && a.id === id
					);
					if (attendee) {
						attendeeSelection.toggleAttendee(attendee);
					}
				} else if (removedValue) {
					// Find attendee and remove it
					const [type, id] = removedValue.split(':');
					const attendee = attendeeSelection.filteredAttendees.find(
						(a) => a.type === type && a.id === id
					);
					if (attendee) {
						attendeeSelection.toggleAttendee(attendee);
					}
				}
				// Keep dropdown open for multi-select - Bits UI should do this automatically
				// but we ensure it stays open
				if (!localOpen) {
					localOpen = true;
				}
			}}
		>
			<!-- Always show input field (like Combobox atom) - allows typing -->
			<div class="relative flex items-center" bind:this={inputRef}>
				<input
					type="text"
					bind:value={localSearchValue}
					oninput={(e) => {
						const newValue = e.currentTarget.value;
						localSearchValue = newValue;
						attendeeSelection.setSearchValue(newValue);
						if (!localOpen) {
							localOpen = true;
						}
					}}
					onclick={() => {
						if (!localOpen) {
							localOpen = true;
						}
					}}
					onfocus={() => {
						if (!localOpen) {
							localOpen = true;
						}
					}}
					placeholder="Search users or circles..."
					class={comboboxInputRecipe()}
					aria-label="Search attendees"
					role="combobox"
					aria-expanded={localOpen}
					aria-controls="attendee-combobox-content"
				/>
				<Combobox.Trigger
					class="absolute flex-shrink-0"
					style="inset-inline-end: var(--spacing-input-x);"
					aria-label="Toggle dropdown"
				>
					<Icon type="chevron-down" size="sm" color="tertiary" />
				</Combobox.Trigger>
			</div>

			<Combobox.Portal>
				<Combobox.Content
					class={comboboxContentRecipe()}
					side="bottom"
					align="start"
					sideOffset={4}
					customAnchor={inputRef}
				>
					<!-- Gradient overlay (matches Combobox atom) -->
					<div
						class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
						aria-hidden="true"
					></div>
					<div class="relative">
						<!-- Scrollable viewport with max-height (14rem = ~224px, shows ~4-5 items) -->
						<Combobox.Viewport
							class={comboboxViewportRecipe()}
							style="max-height: 14rem; overflow-y: auto;"
						>
							<!-- Selected attendees section -->
							{#if selectedAttendees.length > 0}
								<div class="px-inset-sm py-stack-item">
									<Text
										variant="label"
										color="tertiary"
										as="p"
										class="mb-fieldGroup font-medium tracking-wider uppercase"
									>
										Selected
									</Text>
									<div class="gap-fieldGroup flex flex-col">
										{#each selectedAttendees as attendee (attendee.type + attendee.id)}
											{@const attendeeValue = `${attendee.type}:${attendee.id}`}
											<Combobox.Item
												value={attendeeValue}
												label={attendee.name}
												class={comboboxItemRecipe()}
											>
												{#snippet children({ selected: _selected })}
													<Icon type="check" size="sm" color="primary" />
													<Icon type={attendee.type} size="sm" color="secondary" />
													<span class="flex-1">{attendee.name}</span>
													<Badge variant="primary" size="sm">
														{attendeeSelection.getTypeLabel(attendee.type)}
													</Badge>
												{/snippet}
											</Combobox.Item>
										{/each}
									</div>
								</div>
								{#if attendeeSelection.filteredAttendees.some((a) => !attendeeSelection.isSelected(a))}
									<div class="my-stack-divider bg-base h-px"></div>
								{/if}
							{/if}

							<!-- Available attendees -->
							{@const unselectedAttendees = attendeeSelection.filteredAttendees.filter(
								(a) => !attendeeSelection.isSelected(a)
							)}
							{#if unselectedAttendees.length > 0}
								<div class="px-inset-sm py-stack-item">
									<Text
										variant="label"
										color="tertiary"
										as="p"
										class="mb-fieldGroup font-medium tracking-wider uppercase"
									>
										Available
									</Text>
									<div class="gap-fieldGroup flex flex-col">
										{#each unselectedAttendees as attendee (attendee.type + attendee.id)}
											{@const attendeeValue = `${attendee.type}:${attendee.id}`}
											<Combobox.Item
												value={attendeeValue}
												label={attendee.name}
												class={comboboxItemRecipe()}
											>
												{#snippet children({ selected: _selected })}
													<Icon type={attendee.type} size="sm" color="secondary" />
													<span class="flex-1">{attendee.name}</span>
													{#if attendee.email}
														<Text variant="label" color="tertiary" as="span">{attendee.email}</Text>
													{/if}
													<Badge variant="primary" size="sm">
														{attendeeSelection.getTypeLabel(attendee.type)}
													</Badge>
												{/snippet}
											</Combobox.Item>
										{/each}
									</div>
								</div>
							{:else if attendeeSelection.searchValue.trim().length > 0}
								<Text
									variant="body"
									size="sm"
									color="tertiary"
									as="div"
									class="px-inset-sm py-stack-item"
								>
									No results found
								</Text>
							{/if}
						</Combobox.Viewport>
					</div>
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox.Root>
	</div>

	{#if selectedAttendees.length === 0}
		<Text variant="label" color="tertiary" as="p">No attendees selected - add users or circles</Text
		>
	{/if}
</div>
