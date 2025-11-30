<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Progress from './Progress.svelte';

	const { Story } = defineMeta({
		component: Progress.Root,
		title: 'Design System/Atoms/Progress',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 },
				description: 'Progress value (0-100)'
			}
		}
	});
</script>

<Story name="Default" args={{ value: 50 }}>
	{#snippet template(args)}
		<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
			<div
				class="h-full rounded-full bg-accent-primary transition-all duration-300"
				style="width: {args.value}%"
			></div>
		</Progress.Root>
	{/snippet}
</Story>

<Story name="Low" args={{ value: 25 }}>
	{#snippet template(args)}
		<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
			<div
				class="h-full rounded-full bg-accent-primary transition-all duration-300"
				style="width: {args.value}%"
			></div>
		</Progress.Root>
	{/snippet}
</Story>

<Story name="High" args={{ value: 75 }}>
	{#snippet template(args)}
		<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
			<div
				class="h-full rounded-full bg-accent-primary transition-all duration-300"
				style="width: {args.value}%"
			></div>
		</Progress.Root>
	{/snippet}
</Story>

<Story name="Complete" args={{ value: 100 }}>
	{#snippet template(args)}
		<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
			<div
				class="h-full rounded-full bg-accent-primary transition-all duration-300"
				style="width: {args.value}%"
			></div>
		</Progress.Root>
	{/snippet}
</Story>

<Story name="Indeterminate" args={{ value: null }}>
	{#snippet template(args)}
		<Progress.Root {...args} class="h-2 w-full overflow-hidden rounded-full bg-base">
			<div
				class="h-full w-full animate-pulse rounded-full bg-accent-primary"
				style="animation: progress-indeterminate 1.5s ease-in-out infinite;"
			></div>
		</Progress.Root>
	{/snippet}
</Story>
