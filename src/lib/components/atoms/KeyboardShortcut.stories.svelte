<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import KeyboardShortcut from './KeyboardShortcut.svelte';

	const { Story } = defineMeta({
		component: KeyboardShortcut,
		title: 'Design System/Atoms/KeyboardShortcut',
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['sm', 'md']
			}
		}
	});
</script>

<Story name="SingleKey" args={{ keys: 'C', size: 'sm' }}>
	{#snippet template(args)}
		<KeyboardShortcut keys={args.keys} size={args.size} />
	{/snippet}
</Story>

<Story name="CommandK" args={{ keys: ['Cmd', 'K'], size: 'sm' }}>
	{#snippet template(args)}
		<KeyboardShortcut keys={args.keys} size={args.size} />
	{/snippet}
</Story>

<Story name="ShiftEnter" args={{ keys: ['Shift', 'Enter'], size: 'sm' }}>
	{#snippet template(args)}
		<KeyboardShortcut keys={args.keys} size={args.size} />
	{/snippet}
</Story>

<Story name="CommandShiftN" args={{ keys: ['Cmd', 'Shift', 'N'], size: 'sm' }}>
	{#snippet template(args)}
		<KeyboardShortcut keys={args.keys} size={args.size} />
	{/snippet}
</Story>

<Story name="MediumSize" args={{ keys: ['Cmd', 'K'], size: 'md' }}>
	{#snippet template(args)}
		<KeyboardShortcut keys={args.keys} size={args.size} />
	{/snippet}
</Story>
