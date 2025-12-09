<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		component: Button,
		title: 'Design System/Atoms/Button',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['primary', 'secondary', 'outline', 'ghost', 'solid']
			},
			size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
			disabled: { control: { type: 'boolean' } },
			iconOnly: { control: { type: 'boolean' } },
			iconType: {
				control: { type: 'select' },
				options: [
					'add',
					'calendar',
					'chevron-right',
					'circles',
					'close',
					'dashboard',
					'delete',
					'download',
					'edit',
					'flashcards',
					'inbox',
					'lightbulb',
					'members',
					'payment',
					'share',
					'study',
					'tags'
				]
			},
			iconPosition: {
				control: { type: 'select' },
				options: ['left', 'right'],
				if: { arg: 'iconType', exists: true },
				description: 'Icon position relative to text (ignored when iconOnly is true)'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		variant: 'primary',
		size: 'md',
		disabled: false,
		iconOnly: false,
		iconType: 'add',
		iconPosition: 'left'
	}}
	let:args
>
	<Button
		variant={args.variant}
		size={args.size}
		disabled={args.disabled}
		iconOnly={args.iconOnly}
		ariaLabel={args.iconOnly ? 'Icon button' : undefined}
	>
		{#if args.iconType && args.iconOnly}
			<Icon
				type={args.iconType}
				size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'}
			/>
		{:else if args.iconType}
			<span class="flex items-center gap-button">
				{#if args.iconPosition !== 'right'}
					<Icon
						type={args.iconType}
						size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'}
					/>
				{/if}
				<span>Button</span>
				{#if args.iconPosition === 'right'}
					<Icon
						type={args.iconType}
						size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'}
					/>
				{/if}
			</span>
		{:else}
			Button
		{/if}
	</Button>
</Story>
