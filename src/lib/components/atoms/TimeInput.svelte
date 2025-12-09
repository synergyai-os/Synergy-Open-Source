<script lang="ts">
	import type { Time } from '@internationalized/date';
	import * as TimeField from '$lib/components/molecules/TimeField.svelte';
	import { timeInputRecipe } from '$lib/design-system/recipes';

	type Props = {
		id?: string;
		value?: Time | null;
		required?: boolean;
		disabled?: boolean;
		minValue?: Time;
		maxValue?: Time;
		granularity?: 'hour' | 'minute' | 'second';
		class?: string;
	};

	let {
		id,
		value = $bindable(null as Time | null),
		required = false,
		disabled = false,
		minValue,
		maxValue,
		granularity = 'minute',
		class: customClass = ''
	}: Props = $props();

	const inputClasses = $derived([timeInputRecipe(), customClass]);
</script>

<TimeField.Root {value} {required} {disabled} {minValue} {maxValue} {granularity}>
	<TimeField.Input {id} class={inputClasses}>
		{#snippet children({ segments })}
			{#each segments as { part, value: segmentValue } (part)}
				<TimeField.Segment {part}>
					{segmentValue}
				</TimeField.Segment>
			{/each}
		{/snippet}
	</TimeField.Input>
</TimeField.Root>
