<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Separator from './Separator.svelte';

	const { Story } = defineMeta({
		component: Separator.Root,
		title: 'Design System/Atoms/Separator',
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['horizontal', 'vertical']
			}
		}
	});
</script>

<Story name="Horizontal" args={{ orientation: 'horizontal' }}>
	{#snippet template(args)}
		<div class="flex flex-col gap-4">
			<p>Content above</p>
			<Separator.Root {...args} />
			<p>Content below</p>
		</div>
	{/snippet}
</Story>

<Story name="Vertical" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<div class="flex h-32 items-center gap-4">
			<p>Content left</p>
			<Separator.Root {...args} />
			<p>Content right</p>
		</div>
	{/snippet}
</Story>

<Story name="In Menu">
	{#snippet template(_args)}
		<div class="flex w-64 flex-col gap-2 rounded-md border border-base bg-surface p-2">
			<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Profile</button>
			<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Settings</button>
			<Separator.Root orientation="horizontal" />
			<button class="px-2 py-1 text-left text-primary hover:bg-hover-solid">Logout</button>
		</div>
	{/snippet}
</Story>

<Story name="Between Sections">
	{#snippet template(_args)}
		<div class="flex flex-col gap-4">
			<div>
				<h3 class="mb-2 text-lg font-semibold text-primary">Section 1</h3>
				<p class="text-secondary">Content for section 1</p>
			</div>
			<Separator.Root orientation="horizontal" />
			<div>
				<h3 class="mb-2 text-lg font-semibold text-primary">Section 2</h3>
				<p class="text-secondary">Content for section 2</p>
			</div>
		</div>
	{/snippet}
</Story>
