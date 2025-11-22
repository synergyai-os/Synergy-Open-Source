<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as ToggleGroup from './ToggleGroup.svelte';

	const { Story } = defineMeta({
		component: ToggleGroup.Root,
		title: 'Design System/Atoms/ToggleGroup',
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['single', 'multiple']
			}
		}
	});
</script>

<Story name="Single" args={{ type: 'single', value: 'mon' }}>
	{#snippet template(args)}
		<ToggleGroup.Root {...args} class="inline-flex gap-icon">
			<ToggleGroup.Item value="mon" class="toggle-group-day">Mon</ToggleGroup.Item>
			<ToggleGroup.Item value="tue" class="toggle-group-day">Tue</ToggleGroup.Item>
			<ToggleGroup.Item value="wed" class="toggle-group-day">Wed</ToggleGroup.Item>
			<ToggleGroup.Item value="thu" class="toggle-group-day">Thu</ToggleGroup.Item>
			<ToggleGroup.Item value="fri" class="toggle-group-day">Fri</ToggleGroup.Item>
			<ToggleGroup.Item value="sat" class="toggle-group-day">Sat</ToggleGroup.Item>
			<ToggleGroup.Item value="sun" class="toggle-group-day">Sun</ToggleGroup.Item>
		</ToggleGroup.Root>
	{/snippet}
</Story>

<Story name="Multiple" args={{ type: 'multiple', value: ['mon', 'wed', 'fri'] }}>
	{#snippet template(args)}
		<ToggleGroup.Root {...args} class="inline-flex gap-icon">
			<ToggleGroup.Item value="mon" class="toggle-group-day">Mon</ToggleGroup.Item>
			<ToggleGroup.Item value="tue" class="toggle-group-day">Tue</ToggleGroup.Item>
			<ToggleGroup.Item value="wed" class="toggle-group-day">Wed</ToggleGroup.Item>
			<ToggleGroup.Item value="thu" class="toggle-group-day">Thu</ToggleGroup.Item>
			<ToggleGroup.Item value="fri" class="toggle-group-day">Fri</ToggleGroup.Item>
			<ToggleGroup.Item value="sat" class="toggle-group-day">Sat</ToggleGroup.Item>
			<ToggleGroup.Item value="sun" class="toggle-group-day">Sun</ToggleGroup.Item>
		</ToggleGroup.Root>
	{/snippet}
</Story>

<Story name="SizeOptions" args={{ type: 'single', value: 'sm' }}>
	{#snippet template(args)}
		<ToggleGroup.Root {...args} class="inline-flex gap-icon">
			<ToggleGroup.Item value="sm" class="toggle-group-day">SM</ToggleGroup.Item>
			<ToggleGroup.Item value="md" class="toggle-group-day">MD</ToggleGroup.Item>
			<ToggleGroup.Item value="lg" class="toggle-group-day">LG</ToggleGroup.Item>
			<ToggleGroup.Item value="xl" class="toggle-group-day">XL</ToggleGroup.Item>
		</ToggleGroup.Root>
	{/snippet}
</Story>

<Story name="ViewOptions" args={{ type: 'single', value: 'grid' }}>
	{#snippet template(args)}
		<ToggleGroup.Root {...args} class="inline-flex gap-icon">
			<ToggleGroup.Item value="grid" class="toggle-group-day">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-4 w-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
					/>
				</svg>
			</ToggleGroup.Item>
			<ToggleGroup.Item value="list" class="toggle-group-day">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-4 w-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	{/snippet}
</Story>
