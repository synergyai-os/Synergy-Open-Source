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

<Story name="Ghost" args={{ variant: 'ghost', ariaLabel: 'Add item', size: 'md' }} let:args>
	<Button
		variant={args.variant}
		size={args.size}
		iconOnly
		ariaLabel={args.ariaLabel}
		disabled={args.disabled}
	>
		<Icon type="add" size={args.size} />
	</Button>
</Story>

<Story name="Solid" args={{ variant: 'solid', ariaLabel: 'Delete item', size: 'md' }} let:args>
	<Button
		variant={args.variant}
		size={args.size}
		iconOnly
		ariaLabel={args.ariaLabel}
		disabled={args.disabled}
	>
		<Icon type="close" size={args.size} />
	</Button>
</Story>

<Story
	name="Disabled"
	args={{ variant: 'ghost', disabled: true, ariaLabel: 'Disabled button', size: 'md' }}
	let:args
>
	<Button
		variant={args.variant}
		size={args.size}
		iconOnly
		ariaLabel={args.ariaLabel}
		disabled={args.disabled}
	>
		<Icon type="add" size={args.size} />
	</Button>
</Story>

<Story name="Group">
	<div class="flex gap-button">
		<Button variant="ghost" iconOnly ariaLabel="Edit" size="md">
			<Icon type="edit" size="md" />
		</Button>
		<Button variant="ghost" iconOnly ariaLabel="Delete" size="md">
			<Icon type="delete" size="md" />
		</Button>
		<Button variant="ghost" iconOnly ariaLabel="Share" size="md">
			<Icon type="share" size="md" />
		</Button>
	</div>
</Story>

<Story name="All Variants" args={{ size: 'md' }} let:args>
	<div class="flex items-center gap-button">
		<Button variant="ghost" iconOnly ariaLabel="Ghost" size={args.size}>
			<Icon type="add" size={args.size} />
		</Button>
		<Button variant="solid" iconOnly ariaLabel="Solid" size={args.size}>
			<Icon type="add" size={args.size} />
		</Button>
		<Button variant="primary" iconOnly ariaLabel="Primary" size={args.size}>
			<Icon type="add" size={args.size} />
		</Button>
		<Button variant="secondary" iconOnly ariaLabel="Secondary" size={args.size}>
			<Icon type="add" size={args.size} />
		</Button>
		<Button variant="outline" iconOnly ariaLabel="Outline" size={args.size}>
			<Icon type="add" size={args.size} />
		</Button>
	</div>
</Story>

<Story name="Sizes" args={{ variant: 'ghost' }} let:args>
	<div class="flex items-center gap-button">
		<Button variant={args.variant} iconOnly ariaLabel="Small" size="sm">
			<Icon type="add" size="sm" />
		</Button>
		<Button variant={args.variant} iconOnly ariaLabel="Medium" size="md">
			<Icon type="add" size="md" />
		</Button>
		<Button variant={args.variant} iconOnly ariaLabel="Large" size="lg">
			<Icon type="add" size="lg" />
		</Button>
	</div>
</Story>
