<!-- eslint-disable svelte/prefer-writable-derived -->
<script lang="ts">
	/* eslint-disable svelte/prefer-writable-derived */
	import type { CalendarDate } from '@internationalized/date';
	import {
		CalendarDate as CalendarDateClass,
		today,
		getLocalTimeZone
	} from '@internationalized/date';
	import * as DateField from './DateField.svelte';
	import * as DatePicker from './DatePicker.svelte';
	import {
		dateInputRecipe,
		dateInputContainerRecipe,
		datePickerContentRecipe,
		datePickerHeaderRecipe,
		datePickerNavButtonRecipe,
		datePickerHeadingRecipe,
		datePickerGridHeadRecipe,
		datePickerGridRowRecipe,
		datePickerHeadCellRecipe,
		datePickerGridBodyRecipe,
		datePickerCellRecipe,
		datePickerDayRecipe
	} from '$lib/design-system/recipes';
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
	let displayValue = $state(value || today(getLocalTimeZone()));

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
	let calendarValue = $state(value || today(getLocalTimeZone()));

	// Sync calendar value when value changes
	$effect(() => {
		calendarValue = value || today(getLocalTimeZone());
	});
</script>

<div class={dateInputContainerRecipe()} style="width: var(--spacing-32);">
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
		<!-- Calendar icon button to open DatePicker - positioned inside input on the right -->
		<!-- Layout primitives: top-1/2 and -translate-y-1/2 for vertical centering (allowed positioning utilities) -->
		<DatePicker.Trigger
			class="rounded-button px-button py-button text-secondary hover:text-primary focus:text-primary absolute top-1/2 flex flex-shrink-0 -translate-y-1/2 items-center justify-center transition-all duration-200 focus:outline-none"
			style="inset-inline-end: var(--spacing-px);"
			{disabled}
			aria-label="Open calendar"
		>
			<Icon type="calendar" size="sm" />
		</DatePicker.Trigger>

		<DatePicker.Portal>
			<DatePicker.Content class={datePickerContentRecipe()}>
				<!--
					Calendar Background Gradient
					- Uses brand hue (195) at 5% opacity for subtle depth
					- Matches combobox/dropdown aesthetic but more subtle for calendar surface
					- Radial gradient positioned at top center for natural light feel
				-->
				<div
					class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
					aria-hidden="true"
				></div>
				<div
					class="relative"
					style="padding-top: var(--spacing-1); padding-bottom: var(--spacing-2); padding-inline: var(--spacing-1);"
				>
					<DatePicker.Calendar>
						{#snippet children({ months, weekdays })}
							<DatePicker.Header class={datePickerHeaderRecipe()}>
								<DatePicker.PrevButton class={datePickerNavButtonRecipe()}>←</DatePicker.PrevButton>
								<DatePicker.Heading class={datePickerHeadingRecipe()} />
								<DatePicker.NextButton class={datePickerNavButtonRecipe()}>→</DatePicker.NextButton>
							</DatePicker.Header>
							{#each months as month (month.value)}
								<DatePicker.Grid>
									<DatePicker.GridHead class={datePickerGridHeadRecipe()}>
										<DatePicker.GridRow class={datePickerGridRowRecipe()}>
											{#each weekdays as day (day)}
												<DatePicker.HeadCell class={datePickerHeadCellRecipe()}>
													{day}
												</DatePicker.HeadCell>
											{/each}
										</DatePicker.GridRow>
									</DatePicker.GridHead>
									<DatePicker.GridBody class={datePickerGridBodyRecipe()}>
										{#each month.weeks as weekDates, weekIndex (weekIndex)}
											<DatePicker.GridRow class={datePickerGridRowRecipe()}>
												{#each weekDates as date, dateIndex (`${weekIndex}-${date?.toString?.() ?? dateIndex}`)}
													<DatePicker.Cell
														{date}
														month={month.value}
														class={datePickerCellRecipe()}
													>
														<DatePicker.Day
															class={datePickerDayRecipe()}
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
				</div>
			</DatePicker.Content>
		</DatePicker.Portal>
	</DatePicker.Root>
</div>
