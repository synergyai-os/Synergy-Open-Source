<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Heading from './Heading.svelte';

	const { Story } = defineMeta({
		component: Heading,
		title: 'Design System/Atoms/Heading',
		tags: ['autodocs'],
		argTypes: {
			level: {
				control: { type: 'select' },
				options: [1, 2, 3, 4, 5, 6]
			}
		}
	});
</script>

<Story name="Level 1" args={{ level: 1 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Page Title</Heading>
	{/snippet}
</Story>

<Story name="Level 2" args={{ level: 2 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Section Title</Heading>
	{/snippet}
</Story>

<Story name="Level 3" args={{ level: 3 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Subsection Title</Heading>
	{/snippet}
</Story>

<Story name="Level 4" args={{ level: 4 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Level 4 Heading</Heading>
	{/snippet}
</Story>

<Story name="Level 5" args={{ level: 5 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Level 5 Heading</Heading>
	{/snippet}
</Story>

<Story name="Level 6" args={{ level: 6 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Level 6 Heading</Heading>
	{/snippet}
</Story>
