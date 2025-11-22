<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Slider from './Slider.svelte';

	const { Story } = defineMeta({
		component: Slider.Root,
		title: 'Design System/Atoms/Slider',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'array' },
				description: 'Slider value(s)'
			},
			min: {
				control: { type: 'number' },
				description: 'Minimum value'
			},
			max: {
				control: { type: 'number' },
				description: 'Maximum value'
			},
			step: {
				control: { type: 'number' },
				description: 'Step value'
			}
		}
	});
</script>

<Story name="Default" args={{ value: [50], min: 0, max: 100, step: 1 }}>
	{#snippet template(args)}
		<Slider.Root
			{...args}
			type="single"
			class="relative flex w-full touch-none items-center select-none"
		>
			{#snippet children({ thumbItems })}
				<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
					<Slider.Range class="absolute h-full bg-accent-primary" />
				</span>
				{#each thumbItems as { index } (index)}
					<Slider.Thumb
						{index}
						class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					/>
				{/each}
			{/snippet}
		</Slider.Root>
	{/snippet}
</Story>

<Story name="Range" args={{ value: [25, 75], min: 0, max: 100, step: 1 }}>
	{#snippet template(args)}
		<Slider.Root
			{...args}
			type="multiple"
			class="relative flex w-full touch-none items-center select-none"
		>
			{#snippet children({ thumbItems })}
				<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
					<Slider.Range class="absolute h-full bg-accent-primary" />
				</span>
				{#each thumbItems as { index } (index)}
					<Slider.Thumb
						{index}
						class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					/>
				{/each}
			{/snippet}
		</Slider.Root>
	{/snippet}
</Story>

<Story name="With Ticks" args={{ value: [50], min: 0, max: 100, step: 10 }}>
	{#snippet template(args)}
		<Slider.Root
			{...args}
			type="single"
			class="relative flex w-full touch-none items-center select-none"
		>
			{#snippet children({ thumbItems, tickItems })}
				<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-base">
					<Slider.Range class="absolute h-full bg-accent-primary" />
				</span>
				{#each thumbItems as { index } (index)}
					<Slider.Thumb
						{index}
						class="ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-accent-primary bg-elevated transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					/>
				{/each}
				{#each tickItems as { index } (index)}
					<Slider.Tick
						{index}
						class="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base"
					/>
				{/each}
			{/snippet}
		</Slider.Root>
	{/snippet}
</Story>
