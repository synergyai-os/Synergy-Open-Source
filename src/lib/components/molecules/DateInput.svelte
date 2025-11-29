<script lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import {
		CalendarDate as CalendarDateClass,
		today,
		getLocalTimeZone
	} from '@internationalized/date';
	import * as DateField from './DateField.svelte';
	import * as DatePicker from './DatePicker.svelte';
	import { dateInputRecipe } from '$lib/design-system/recipes';
	import Icon from '../atoms/Icon.svelte';
	import { DEFAULT_LOCALE } from '$lib/utils/locale';

	type Props = {
		id?: string;
		value?: CalendarDate | null;
		required?: boolean;
		disabled?: boolean;
		minValue?: CalendarDate;
		maxValue?: CalendarDate;
		class?: string;
	};

	let {
		id,
		value = $bindable(null as CalendarDate | null),
		required = false,
		disabled = false,
		minValue,
		maxValue,
		class: customClass = ''
	}: Props = $props();

	const inputClasses = $derived([dateInputRecipe(), customClass]);

	// Use a non-null value for DateField (it needs a value, not placeholder)
	// When value is null, use today's date as the display value
	let displayValue = $state.raw(value || today(getLocalTimeZone()));

	// Sync displayValue when value changes
	$effect(() => {
		displayValue = value || today(getLocalTimeZone());
	});

	// Sync value back when displayValue changes (user types in the field)
	$effect(() => {
		if (displayValue && displayValue !== value) {
			value = displayValue;
		}
	});

	// Track if date picker popup is open
	let isOpen = $state(false);

	// Calendar value for the DatePicker (synced with main value)
	let calendarValue = $state.raw(value || today(getLocalTimeZone()));

	// Sync calendar value when value changes
	$effect(() => {
		calendarValue = value || today(getLocalTimeZone());
	});
</script>

<div class="relative flex items-center gap-2">
	<DateField.Root
		bind:value={displayValue}
		{required}
		{disabled}
		{minValue}
		{maxValue}
		locale={DEFAULT_LOCALE}
	>
		<DateField.Input {id} class={inputClasses}>
			{#snippet children({ segments })}
				{#each segments as { part, value: segmentValue } (part)}
					<DateField.Segment {part}>
						{segmentValue}
					</DateField.Segment>
				{/each}
			{/snippet}
		</DateField.Input>
	</DateField.Root>

	<!-- DatePicker with Trigger and Popup -->
	<DatePicker.Root bind:open={isOpen} bind:value={calendarValue} locale={DEFAULT_LOCALE}>
		<!-- Calendar icon button to open DatePicker -->
		<DatePicker.Trigger
			class="hover:bg-surface-hover flex items-center justify-center rounded-button p-2 transition-colors"
			{disabled}
			aria-label="Open calendar"
		>
			<Icon type="calendar" size="sm" />
		</DatePicker.Trigger>

		<DatePicker.Portal>
			<DatePicker.Content>
				<DatePicker.Calendar>
						{#snippet children({ months, weekdays })}
							<DatePicker.Header>
								<DatePicker.PrevButton>←</DatePicker.PrevButton>
								<DatePicker.Heading />
								<DatePicker.NextButton>→</DatePicker.NextButton>
							</DatePicker.Header>
							{#each months as month (month.value)}
								<DatePicker.Grid>
									<DatePicker.GridHead>
										<DatePicker.GridRow>
											{#each weekdays as day (day)}
												<DatePicker.HeadCell>
													{day}
												</DatePicker.HeadCell>
											{/each}
										</DatePicker.GridRow>
									</DatePicker.GridHead>
									<DatePicker.GridBody>
										{#each month.weeks as weekDates (weekDates[0]?.toString() || '')}
											<DatePicker.GridRow>
												{#each weekDates as date (date.toString())}
													<DatePicker.Cell {date} month={month.value}>
														<DatePicker.Day
															onclick={() => {
																if (date instanceof CalendarDateClass) {
																	const selectedDate = date as CalendarDate;
																	value = selectedDate;
																	displayValue = selectedDate;
																	calendarValue = selectedDate;
																	isOpen = false;
																}
															}}
														/>
													</DatePicker.Cell>
												{/each}
											</DatePicker.GridRow>
										{/each}
									</DatePicker.GridBody>
								</DatePicker.Grid>
							{/each}
						{/snippet}
				</DatePicker.Calendar>
			</DatePicker.Content>
		</DatePicker.Portal>
	</DatePicker.Root>
</div>
