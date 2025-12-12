<script lang="ts">
	import type { CalendarDate, Time } from '@internationalized/date';
	import { DateInput } from '$lib/components/molecules';
	import { TimeInput, DurationInput, Text } from '$lib/components/atoms';

	type Props = {
		id?: string;
		date?: CalendarDate | null;
		time?: Time | null;
		duration?: number;
		required?: boolean;
		disabled?: boolean;
		dateMinValue?: CalendarDate;
		dateMaxValue?: CalendarDate;
		timeMinValue?: Time;
		timeMaxValue?: Time;
		durationMin?: number;
		durationMax?: number;
		dateError?: string | null;
		timeError?: string | null;
		durationError?: string | null;
		class?: string;
	};

	let {
		id,
		date = $bindable(null as CalendarDate | null),
		time = $bindable(null as Time | null),
		duration = $bindable(60),
		required = false,
		disabled = false,
		dateMinValue,
		dateMaxValue,
		timeMinValue,
		timeMaxValue,
		durationMin = 5,
		durationMax = 480,
		dateError = null,
		timeError = null,
		durationError = null,
		class: customClass = ''
	}: Props = $props();

	// Generate IDs for each input
	const dateId = `${id || 'datetime'}-date`;
	const timeId = `${id || 'datetime'}-time`;
	const durationId = `${id || 'datetime'}-duration`;
</script>

<div class="gap-fieldGroup flex flex-col {customClass}">
	<!-- Natural language format: "On [date] at [time] for [duration] minutes" -->
	<div class="gap-fieldGroup grid grid-cols-[auto_2fr_auto_1.5fr_auto_1fr_auto] items-center">
		<!-- "On" label -->
		<Text variant="body" size="sm" color="secondary" as="span">On</Text>

		<!-- Date input (wider - needs more space) -->
		<DateInput
			id={dateId}
			bind:value={date}
			{required}
			{disabled}
			minValue={dateMinValue}
			maxValue={dateMaxValue}
		/>

		<!-- "at" label -->
		<Text variant="body" size="sm" color="secondary" as="span">at</Text>

		<!-- Time input (medium width) -->
		<TimeInput
			id={timeId}
			bind:value={time}
			{required}
			{disabled}
			minValue={timeMinValue}
			maxValue={timeMaxValue}
		/>

		<!-- "for" label -->
		<Text variant="body" size="sm" color="secondary" as="span">for</Text>

		<!-- Duration input with inline "minutes" label (compact) -->
		<div class="gap-fieldGroup col-span-1 flex items-center">
			<DurationInput
				id={durationId}
				bind:value={duration}
				{required}
				{disabled}
				min={durationMin}
				max={durationMax}
			/>
			<Text variant="body" size="sm" color="secondary" as="span">minutes</Text>
		</div>
	</div>

	<!-- Error messages below (if any) -->
	{#if dateError || timeError || durationError}
		<div class="gap-fieldGroup flex flex-col">
			{#if dateError}
				<Text variant="label" color="error" as="div">{dateError}</Text>
			{/if}
			{#if timeError}
				<Text variant="label" color="error" as="div">{timeError}</Text>
			{/if}
			{#if durationError}
				<Text variant="label" color="error" as="div">{durationError}</Text>
			{/if}
		</div>
	{/if}
</div>
