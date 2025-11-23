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

<Story name="Default" args={{ initials: 'JD', size: 'md' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Small" args={{ initials: 'AB', size: 'sm' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Large" args={{ initials: 'CD', size: 'lg' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Single Initial" args={{ initials: 'R', size: 'md' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} size={args.size} color={args.color} />
	{/snippet}
</Story>

<Story name="Custom Color" args={{ initials: 'JD', size: 'md', color: 'var(--color-accent-primary)' }}>
	{#snippet template(args)}
		<Avatar initials={args.initials} size={args.size} color={args.color} />
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
