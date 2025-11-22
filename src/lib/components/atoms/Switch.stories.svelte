<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Switch from './Switch.svelte';
	import * as Label from './Label.svelte';

	const { Story } = defineMeta({
		component: Switch.Root,
		title: 'Design System/Atoms/Switch',
		tags: ['autodocs'],
		argTypes: {
			checked: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ checked: false }}>
	{#snippet template(args)}
		<Switch.Root
			{...args}
			class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
				? 'bg-accent-primary'
				: 'bg-toggle-off'}"
		>
			<Switch.Thumb
				class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
			/>
		</Switch.Root>
	{/snippet}
</Story>

<Story name="Checked" args={{ checked: true }}>
	{#snippet template(args)}
		<Switch.Root
			{...args}
			class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
				? 'bg-accent-primary'
				: 'bg-toggle-off'}"
		>
			<Switch.Thumb
				class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
			/>
		</Switch.Root>
	{/snippet}
</Story>

<Story name="With Label" args={{ checked: false }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Switch.Root
				{...args}
				class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
					? 'bg-accent-primary'
					: 'bg-toggle-off'}"
			>
				<Switch.Thumb
					class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
				/>
			</Switch.Root>
			<Label.Root>Enable notifications</Label.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ checked: false, disabled: true }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Switch.Root
				{...args}
				class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
					? 'bg-accent-primary'
					: 'bg-toggle-off'}"
			>
				<Switch.Thumb
					class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
				/>
			</Switch.Root>
			<Label.Root>Disabled switch</Label.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled Checked" args={{ checked: true, disabled: true }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Switch.Root
				{...args}
				class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-none {args.checked
					? 'bg-accent-primary'
					: 'bg-toggle-off'}"
			>
				<Switch.Thumb
					class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-elevated shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
				/>
			</Switch.Root>
			<Label.Root>Disabled checked</Label.Root>
		</div>
	{/snippet}
</Story>
