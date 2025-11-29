<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ThemeToggle from './ThemeToggle.svelte';

	const { Story } = defineMeta({
		component: ThemeToggle,
		title: 'Design System/Molecules/ThemeToggle',
		tags: ['autodocs'],
		argTypes: {
			showLabel: {
				control: { type: 'boolean' },
				description: 'Show text label alongside icon'
			}
		}
	});
</script>

<Story name="Icon Only" args={{ showLabel: false }}>
	{#snippet template(args)}
		<ThemeToggle {...args} />
	{/snippet}
</Story>

<Story name="With Label" args={{ showLabel: true }}>
	{#snippet template(args)}
		<ThemeToggle {...args} />
	{/snippet}
</Story>
