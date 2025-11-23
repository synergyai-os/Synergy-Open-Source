<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		component: Button,
		title: 'Design System/Atoms/Button',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['primary', 'secondary', 'outline']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Primary" args={{ variant: 'primary', size: 'md' }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Button</Button>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: 'secondary', size: 'md' }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Button</Button>
	{/snippet}
</Story>

<Story name="Outline" args={{ variant: 'outline', size: 'md' }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Button</Button>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: 'primary', size: 'sm' }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Small Button</Button>
	{/snippet}
</Story>

<Story name="Large" args={{ variant: 'primary', size: 'lg' }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Large Button</Button>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: 'primary', size: 'md', disabled: true }}>
	{#snippet template(args)}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>Disabled Button</Button
		>
	{/snippet}
</Story>
