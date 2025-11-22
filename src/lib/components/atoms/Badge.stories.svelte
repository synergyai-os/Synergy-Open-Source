<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		component: Badge,
		title: 'Design System/Atoms/Badge',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['system', 'custom', 'default']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<Badge {...args}>Badge</Badge>
	{/snippet}
</Story>

<Story name="System" args={{ variant: 'system' }}>
	{#snippet template(args)}
		<Badge {...args}>System Badge</Badge>
	{/snippet}
</Story>

<Story name="Custom" args={{ variant: 'custom' }}>
	{#snippet template(args)}
		<Badge {...args}>Custom Badge</Badge>
	{/snippet}
</Story>
