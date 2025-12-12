<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Text from './Text.svelte';

	const { Story } = defineMeta({
		component: Text,
		title: 'Design System/Atoms/Text',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['body', 'label', 'caption']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'base', 'lg']
			},
			as: {
				control: { type: 'select' },
				options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
			}
		}
	});
</script>

<Story name="Body" args={{ variant: 'body', size: 'base' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size}>Regular body text</Text>
	{/snippet}
</Story>

<Story name="Label" args={{ variant: 'label', size: 'sm' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size}>Label text</Text>
	{/snippet}
</Story>

<Story name="Caption" args={{ variant: 'caption', size: 'sm' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size}>Caption text</Text>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: 'body', size: 'sm' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size}>Small text</Text>
	{/snippet}
</Story>

<Story name="Large" args={{ variant: 'body', size: 'lg' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size}>Large text</Text>
	{/snippet}
</Story>

<Story name="As Span" args={{ variant: 'body', size: 'base', as: 'span' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size} as={args.as}>Text as span element</Text>
	{/snippet}
</Story>

<Story name="As Div" args={{ variant: 'body', size: 'base', as: 'div' }}>
	{#snippet template(args)}
		<Text variant={args.variant} size={args.size} as={args.as}>Text as div element</Text>
	{/snippet}
</Story>
