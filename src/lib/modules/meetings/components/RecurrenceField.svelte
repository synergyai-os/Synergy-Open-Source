<script lang="ts">
	/**
	 * RecurrenceField - Meeting recurrence configuration field
	 * Handles frequency, interval, days of week selection, and preview
	 */

	import { Text, FormInput, FormSelect, ToggleGroup } from '$lib/components/atoms';
	import { toggleGroupRootRecipe, toggleGroupItemRecipe } from '$lib/design-system/recipes';
	import { ToggleSwitch } from '$lib/components/molecules';
	import InfoCard from '$lib/components/molecules/InfoCard.svelte';
	import UpcomingMeetingsPreview from './UpcomingMeetingsPreview.svelte';
	import { DAY_NAMES, RECURRENCE_FREQUENCY_OPTIONS } from '../utils';

	interface Props {
		enabled: boolean;
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek: string[];
		upcomingMeetings: Date[];
		weeklyScheduleMessage: string | null;
		dailyScheduleMessage: string | null;
		onEnabledChange: (enabled: boolean) => void;
		onFrequencyChange: (frequency: 'daily' | 'weekly' | 'monthly') => void;
		onIntervalChange: (interval: number) => void;
		onDaysOfWeekChange: (days: string[]) => void;
		class?: string;
	}

	let {
		enabled,
		frequency,
		interval,
		daysOfWeek,
		upcomingMeetings,
		weeklyScheduleMessage,
		dailyScheduleMessage,
		onEnabledChange,
		onFrequencyChange,
		onIntervalChange,
		onDaysOfWeekChange,
		class: className = ''
	}: Props = $props();

	// Local state for bindings (FormInput/FormSelect need bindable)
	let localInterval = $state(String(interval));
	let localFrequency = $state(frequency);
	let localDaysOfWeek = $state(daysOfWeek);
	// Weekly selected day (single selection) - derived from localDaysOfWeek
	const weeklySelectedDay = $derived(localDaysOfWeek[0] || '');

	// Sync local state with props
	$effect(() => {
		localInterval = String(interval);
		localFrequency = frequency;
		localDaysOfWeek = daysOfWeek;
	});

	// Sync local state changes back to parent
	$effect(() => {
		const numInterval = Number(localInterval);
		if (!isNaN(numInterval) && numInterval !== interval) {
			onIntervalChange(numInterval);
		}
	});
	$effect(() => {
		if (localFrequency !== frequency) {
			onFrequencyChange(localFrequency);
		}
	});
	$effect(() => {
		if (JSON.stringify(localDaysOfWeek) !== JSON.stringify(daysOfWeek)) {
			onDaysOfWeekChange(localDaysOfWeek);
		}
	});
</script>

<div class="flex flex-col gap-form {className}">
	<div class="flex items-center gap-fieldGroup">
		<ToggleSwitch checked={enabled} onChange={onEnabledChange} />
		<Text variant="body" size="sm" color="default" as="span" class="font-medium">
			Repeat this meeting
		</Text>
	</div>

	{#if enabled}
		<!--
			Recurrence Section
			- Left border uses border-l-2 (2px) for visual emphasis
			- WORKAROUND: No semantic token for border width - see missing-styles.md
			- Padding-left uses semantic token var(--spacing-form-sectionGap) for indentation
		-->
		<div
			class="flex flex-col gap-form-sectionGap border-l-2 border-accent-primary"
			style="padding-left: var(--spacing-form-sectionGap);"
		>
			<!-- Frequency -->
			<div class="flex items-center gap-fieldGroup">
				<Text variant="body" size="sm" color="secondary" as="span">Every</Text>
				<FormInput type="number" bind:value={localInterval} min="1" max="99" class="w-input-xs" />
				<!--
					FormSelect without label - inline with other elements
					- WORKAROUND: [&>div]:gap-0 removes FormSelect wrapper gap when no label
					- See missing-styles.md if this becomes a common pattern
				-->
				<FormSelect
					bind:value={localFrequency}
					options={RECURRENCE_FREQUENCY_OPTIONS}
					class="flex-1 [&>div]:gap-0"
				/>
			</div>

			<!-- Days of Week (for weekly and daily) -->
			{#if localFrequency === 'weekly' || localFrequency === 'daily'}
				<div class="flex flex-col gap-fieldGroup">
					<Text variant="body" size="sm" color="secondary" as="span" class="block">On</Text>
					<div class="flex flex-wrap items-center gap-fieldGroup">
						{#if localFrequency === 'weekly'}
							<ToggleGroup.Root
								type="single"
								value={weeklySelectedDay}
								onValueChange={(value) => {
									if (value !== null && value !== undefined) {
										localDaysOfWeek = [value];
									}
								}}
								class={[toggleGroupRootRecipe(), 'flex', 'flex-wrap', 'gap-fieldGroup']}
							>
								{#each DAY_NAMES as day, index (index)}
									<ToggleGroup.Item value={index.toString()} class={toggleGroupItemRecipe()}>
										{day}
									</ToggleGroup.Item>
								{/each}
							</ToggleGroup.Root>
						{:else}
							<ToggleGroup.Root
								type="multiple"
								bind:value={localDaysOfWeek}
								class={[toggleGroupRootRecipe(), 'flex', 'flex-wrap', 'gap-fieldGroup']}
							>
								{#each DAY_NAMES as day, index (index)}
									<ToggleGroup.Item value={index.toString()} class={toggleGroupItemRecipe()}>
										{day}
									</ToggleGroup.Item>
								{/each}
							</ToggleGroup.Root>
						{/if}
					</div>

					<!-- Schedule Helper Messages -->
					{#if localFrequency === 'weekly' && weeklyScheduleMessage}
						<InfoCard icon="💡" message={weeklyScheduleMessage} class="mt-fieldGroup" />
					{:else if localFrequency === 'daily' && dailyScheduleMessage}
						<InfoCard icon="💡" message={dailyScheduleMessage} class="mt-fieldGroup" />
					{/if}
				</div>
			{/if}

			<!-- Upcoming Meetings Preview -->
			<UpcomingMeetingsPreview dates={upcomingMeetings} />

			<!-- Info message -->
			<InfoCard
				icon="ℹ️"
				message="The recurrence has no end: the next {upcomingMeetings.length} meetings
				are shown to preview the pattern. Additional ones will appear as they occur."
			/>
		</div>
	{/if}
</div>
