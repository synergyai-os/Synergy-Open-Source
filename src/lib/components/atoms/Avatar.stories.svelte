<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Avatar from './Avatar.svelte';

	const { Story } = defineMeta({
		component: Avatar,
		title: 'Design System/Atoms/Avatar',
		tags: ['autodocs'],
		argTypes: {
			initials: {
				control: { type: 'text' }
			},
			variant: {
				control: { type: 'select' },
				options: ['default', 'brand']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			},
			color: {
				control: { type: 'color' }
			}
		}
	});
</script>

<Story name="Default" args={{ initials: 'JD', variant: 'default', size: 'md' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Brand Variant" args={{ initials: 'JD', variant: 'brand', size: 'md' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} />
	{/snippet}
</Story>

<Story name="Small" args={{ initials: 'AB', variant: 'default', size: 'sm' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Large" args={{ initials: 'CD', variant: 'default', size: 'lg' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Single Initial" args={{ initials: 'R', variant: 'default', size: 'md' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Custom Color" args={{ initials: 'JD', variant: 'default', size: 'md', color: 'var(--color-interactive-primary)' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} variant={args.variant} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Group" args={{ initials: 'JD', size: 'md' }}>
	{#snippet template(_args)}
		<div class="flex -space-x-2">
			<Avatar initials="JD" size="md" />
			<Avatar initials="AB" size="md" />
			<Avatar initials="CD" size="md" />
			<Avatar initials="EF" size="md" />
		</div>
	{/snippet}
</Story>
