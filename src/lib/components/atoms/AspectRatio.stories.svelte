<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as AspectRatio from './AspectRatio.svelte';

	const { Story } = defineMeta({
		component: AspectRatio.Root,
		title: 'Design System/Atoms/AspectRatio',
		tags: ['autodocs'],
		argTypes: {
			ratio: {
				control: { type: 'number' },
				description: 'Aspect ratio (width/height)'
			}
		}
	});
</script>

<Story name="Ratio16x9" args={{ ratio: 16 / 9 }}>
	{#snippet template(args)}
		<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
			<img
				src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=450&fit=crop"
				alt="Example"
				class="h-full w-full object-cover"
			/>
		</AspectRatio.Root>
	{/snippet}
</Story>

<Story name="Ratio4x3" args={{ ratio: 4 / 3 }}>
	{#snippet template(args)}
		<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
			<img
				src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop"
				alt="Example"
				class="h-full w-full object-cover"
			/>
		</AspectRatio.Root>
	{/snippet}
</Story>

<Story name="Ratio1x1" args={{ ratio: 1 }}>
	{#snippet template(args)}
		<AspectRatio.Root {...args} class="max-w-[600px] overflow-hidden rounded-card bg-elevated">
			<img
				src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop"
				alt="Example"
				class="h-full w-full object-cover"
			/>
		</AspectRatio.Root>
	{/snippet}
</Story>

<Story name="Ratio21x9" args={{ ratio: 21 / 9 }}>
	{#snippet template(args)}
		<AspectRatio.Root {...args} class="max-w-[800px] overflow-hidden rounded-card bg-elevated">
			<img
				src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=840&h=360&fit=crop"
				alt="Example"
				class="h-full w-full object-cover"
			/>
		</AspectRatio.Root>
	{/snippet}
</Story>
