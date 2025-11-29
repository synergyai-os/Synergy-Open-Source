<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		component: Button,
		title: 'Design System/Atoms/IconButton',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['ghost', 'solid', 'primary', 'secondary', 'outline']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			},
			disabled: {
				control: { type: 'boolean' }
			},
			ariaLabel: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Ghost" args={{ variant: 'ghost', ariaLabel: 'Add item', size: 'md' }}>
	{#snippet template(args)}
		<Button
			variant={args.variant}
			size={args.size}
			iconOnly
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
		>
			{#snippet children()}
				<Icon type="add" size={args.size} />
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Solid" args={{ variant: 'solid', ariaLabel: 'Delete item', size: 'md' }}>
	{#snippet template(args)}
		<Button
			variant={args.variant}
			size={args.size}
			iconOnly
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
		>
			{#snippet children()}
				<Icon type="close" size={args.size} />
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{ variant: 'ghost', disabled: true, ariaLabel: 'Disabled button', size: 'md' }}
>
	{#snippet template(args)}
		<Button
			variant={args.variant}
			size={args.size}
			iconOnly
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
		>
			{#snippet children()}
				<Icon type="add" size={args.size} />
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Group" args={{ variant: 'ghost', ariaLabel: 'Actions', size: 'md' }}>
	{#snippet template(_args)}
		<div class="flex gap-2">
			<Button variant="ghost" iconOnly ariaLabel="Edit" size="md">
				{#snippet children()}
					<Icon type="edit" size="md" />
				{/snippet}
			</Button>
			<Button variant="ghost" iconOnly ariaLabel="Delete" size="md">
				{#snippet children()}
					<Icon type="delete" size="md" />
				{/snippet}
			</Button>
			<Button variant="ghost" iconOnly ariaLabel="Share" size="md">
				{#snippet children()}
					<Icon type="share" size="md" />
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="All Variants" args={{ size: 'md', ariaLabel: 'Action' }}>
	{#snippet template(_args)}
		<div class="flex items-center gap-4">
			<Button variant="ghost" iconOnly ariaLabel="Ghost" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
			<Button variant="solid" iconOnly ariaLabel="Solid" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
			<Button variant="primary" iconOnly ariaLabel="Primary" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
			<Button variant="secondary" iconOnly ariaLabel="Secondary" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
			<Button variant="outline" iconOnly ariaLabel="Outline" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Sizes" args={{ variant: 'ghost', ariaLabel: 'Action' }}>
	{#snippet template(_args)}
		<div class="flex items-center gap-4">
			<Button variant={_args.variant} iconOnly ariaLabel="Small" size="sm">
				{#snippet children()}
					<Icon type="add" size="sm" />
				{/snippet}
			</Button>
			<Button variant={_args.variant} iconOnly ariaLabel="Medium" size="md">
				{#snippet children()}
					<Icon type="add" size="md" />
				{/snippet}
			</Button>
			<Button variant={_args.variant} iconOnly ariaLabel="Large" size="lg">
				{#snippet children()}
					<Icon type="add" size="lg" />
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>
