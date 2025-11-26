<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Tooltip from './Tooltip.svelte';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		component: Tooltip.Root,
		title: 'Design System/Atoms/Tooltip',
		tags: ['autodocs'],
		argTypes: {
			open: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<Tooltip.Root {...args}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Hover me</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content
						class="z-50 rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
					>
						This is a tooltip
						<Tooltip.Arrow class="fill-elevated" />
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/snippet}
</Story>

<Story name="Top" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<div class="flex h-64 items-end justify-center">
				<Tooltip.Root {...args}>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props}>Tooltip on top</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content
							side="top"
							class="z-50 rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
						>
							Tooltip appears above
							<Tooltip.Arrow class="fill-elevated" />
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>
	{/snippet}
</Story>

<Story name="Right" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<div class="flex h-64 items-center justify-start">
				<Tooltip.Root {...args}>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props}>Tooltip on right</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content
							side="right"
							class="z-50 rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
						>
							Tooltip appears to the right
							<Tooltip.Arrow class="fill-elevated" />
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>
	{/snippet}
</Story>

<Story name="Bottom" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<div class="flex h-64 items-start justify-center">
				<Tooltip.Root {...args}>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props}>Tooltip on bottom</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content
							side="bottom"
							class="z-50 rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
						>
							Tooltip appears below
							<Tooltip.Arrow class="fill-elevated" />
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>
	{/snippet}
</Story>

<Story name="Left" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<div class="flex h-64 items-center justify-end">
				<Tooltip.Root {...args}>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props}>Tooltip on left</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content
							side="left"
							class="z-50 rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
						>
							Tooltip appears to the left
							<Tooltip.Arrow class="fill-elevated" />
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>
	{/snippet}
</Story>

<Story name="LongContent" args={{ open: true }}>
	{#snippet template(args)}
		<Tooltip.Provider>
			<Tooltip.Root {...args}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Hover for long tooltip</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content
						class="z-50 max-w-xs rounded-button border border-base bg-elevated px-2 py-1 text-button text-primary shadow-card"
					>
						This is a longer tooltip message that demonstrates how the tooltip handles multiple
						lines of content gracefully.
						<Tooltip.Arrow class="fill-elevated" />
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/snippet}
</Story>
