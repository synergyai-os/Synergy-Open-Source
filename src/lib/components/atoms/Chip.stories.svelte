<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Chip from './Chip.svelte';

	const { Story } = defineMeta({
		component: Chip,
		title: 'Design System/Atoms/Chip',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'primary']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default', label: 'Filter Chip' }}>
	{#snippet template(args)}
		<Chip {...args} />
	{/snippet}
</Story>

<Story name="Primary" args={{ variant: 'primary', label: 'Primary Chip' }}>
	{#snippet template(args)}
		<Chip {...args} />
	{/snippet}
</Story>

<Story name="WithDelete" args={{ variant: 'default', label: 'Removable Chip', onDelete: () => {} }}>
	{#snippet template(args)}
		<Chip {...args} />
	{/snippet}
</Story>
