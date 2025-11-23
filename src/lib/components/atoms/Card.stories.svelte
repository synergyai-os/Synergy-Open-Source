<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card from './Card.svelte';

	const { Story } = defineMeta({
		component: Card,
		title: 'Design System/Atoms/Card',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'elevated', 'outlined', 'noPadding']
			},
			clickable: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<Card variant={args.variant} clickable={args.clickable}>Card content with default styling</Card>
	{/snippet}
</Story>

<Story name="Elevated" args={{ variant: 'elevated' }}>
	{#snippet template(args)}
		<Card variant={args.variant} clickable={args.clickable}>Card content with elevated shadow</Card>
	{/snippet}
</Story>

<Story name="Outlined" args={{ variant: 'outlined' }}>
	{#snippet template(args)}
		<Card variant={args.variant} clickable={args.clickable}>Card content with outlined border</Card>
	{/snippet}
</Story>

<Story name="Clickable" args={{ variant: 'elevated', clickable: true }}>
	{#snippet template(args)}
		<Card variant={args.variant} clickable={args.clickable}>Clickable card with hover effect</Card>
	{/snippet}
</Story>

<Story name="NoPadding" args={{ variant: 'noPadding' }}>
	{#snippet template(args)}
		<Card variant={args.variant} clickable={args.clickable}
			>Card without padding for composition</Card
		>
	{/snippet}
</Story>
