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
				options: ['default', 'primary', 'success', 'warning', 'error']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<Badge variant={args.variant}>Default</Badge>
	{/snippet}
</Story>

<Story name="Primary" args={{ variant: 'primary' }}>
	{#snippet template(args)}
		<Badge variant={args.variant}>Primary</Badge>
	{/snippet}
</Story>

<Story name="Success" args={{ variant: 'success' }}>
	{#snippet template(args)}
		<Badge variant={args.variant}>Success</Badge>
	{/snippet}
</Story>

<Story name="Warning" args={{ variant: 'warning' }}>
	{#snippet template(args)}
		<Badge variant={args.variant}>Warning</Badge>
	{/snippet}
</Story>

<Story name="Error" args={{ variant: 'error' }}>
	{#snippet template(args)}
		<Badge variant={args.variant}>Error</Badge>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: 'default', size: 'sm' }}>
	{#snippet template(args)}
		<Badge variant={args.variant} size={args.size}>Small</Badge>
	{/snippet}
</Story>

<Story name="Large" args={{ variant: 'default', size: 'lg' }}>
	{#snippet template(args)}
		<Badge variant={args.variant} size={args.size}>Large</Badge>
	{/snippet}
</Story>
