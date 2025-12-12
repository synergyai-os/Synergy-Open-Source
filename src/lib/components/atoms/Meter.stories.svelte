<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Meter from './Meter.svelte';

	const { Story } = defineMeta({
		component: Meter.Root,
		title: 'Design System/Atoms/Meter',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 },
				description: 'Current value (0-100)'
			},
			min: {
				control: { type: 'number' },
				description: 'Minimum value'
			},
			max: {
				control: { type: 'number' },
				description: 'Maximum value'
			}
		}
	});
</script>

<Story name="Default" args={{ value: 50, min: 0, max: 100 }}>
	{#snippet template(args)}
		<Meter.Root {...args} class="bg-base h-4 w-full overflow-hidden rounded-full">
			<div
				class="bg-accent-primary h-full rounded-full transition-all duration-300"
				style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
			></div>
		</Meter.Root>
	{/snippet}
</Story>

<Story name="Low" args={{ value: 25, min: 0, max: 100 }}>
	{#snippet template(args)}
		<Meter.Root {...args} class="bg-base h-4 w-full overflow-hidden rounded-full">
			<div
				class="bg-accent-primary h-full rounded-full transition-all duration-300"
				style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
			></div>
		</Meter.Root>
	{/snippet}
</Story>

<Story name="High" args={{ value: 75, min: 0, max: 100 }}>
	{#snippet template(args)}
		<Meter.Root {...args} class="bg-base h-4 w-full overflow-hidden rounded-full">
			<div
				class="bg-accent-primary h-full rounded-full transition-all duration-300"
				style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
			></div>
		</Meter.Root>
	{/snippet}
</Story>

<Story name="Full" args={{ value: 100, min: 0, max: 100 }}>
	{#snippet template(args)}
		<Meter.Root {...args} class="bg-base h-4 w-full overflow-hidden rounded-full">
			<div
				class="bg-accent-primary h-full rounded-full transition-all duration-300"
				style="width: {((args.value - args.min) / (args.max - args.min)) * 100}%"
			></div>
		</Meter.Root>
	{/snippet}
</Story>
