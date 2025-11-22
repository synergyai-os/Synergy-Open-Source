<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Label from './Label.svelte';

	const { Story } = defineMeta({
		component: Label.Root,
		title: 'Design System/Atoms/Label',
		tags: ['autodocs'],
		argTypes: {
			for: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default" args={{ for: 'input-1' }}>
	{#snippet template(args)}
		<Label.Root {...args}>Label text</Label.Root>
	{/snippet}
</Story>

<Story name="With Input" args={{ for: 'email-input' }}>
	{#snippet template(args)}
		<div class="flex flex-col gap-2">
			<Label.Root {...args}>Email Address</Label.Root>
			<input
				id="email-input"
				type="email"
				placeholder="Enter your email"
				class="rounded-input border border-base px-input-x py-input-y"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Required" args={{ for: 'required-input' }}>
	{#snippet template(args)}
		<div class="flex flex-col gap-2">
			<Label.Root {...args}>
				Password <span class="text-accent-primary">*</span>
			</Label.Root>
			<input
				id="required-input"
				type="password"
				placeholder="Enter password"
				class="rounded-input border border-base px-input-x py-input-y"
			/>
		</div>
	{/snippet}
</Story>
