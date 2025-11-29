<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DateInput from './DateInput.svelte';
	import { today, getLocalTimeZone } from '@internationalized/date';

	const { Story } = defineMeta({
		component: DateInput,
		title: 'Design System/Molecules/DateInput',
		tags: ['autodocs'],
		argTypes: {
			required: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ id: 'date-input-default' }}>
	{#snippet template(args)}
		<div class="p-8">
			<DateInput {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Initial Value"
	args={{ id: 'date-input-value', value: today(getLocalTimeZone()) }}
>
	{#snippet template(args)}
		<div class="p-8">
			<DateInput {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Required" args={{ id: 'date-input-required', required: true }}>
	{#snippet template(args)}
		<div class="p-8">
			<DateInput {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ id: 'date-input-disabled', disabled: true }}>
	{#snippet template(args)}
		<div class="p-8">
			<DateInput {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Min/Max Date"
	args={{
		id: 'date-input-minmax',
		minValue: today(getLocalTimeZone()),
		maxValue: today(getLocalTimeZone()).add({ days: 30 })
	}}
>
	{#snippet template(args)}
		<div class="p-8">
			<DateInput {...args} />
		</div>
	{/snippet}
</Story>
