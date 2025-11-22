<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SplitButton from './SplitButton.svelte';

	const { Story } = defineMeta({
		component: SplitButton,
		title: 'Design System/Atoms/SplitButton',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['primary', 'secondary']
			}
		}
	});
</script>

<Story name="Primary" args={{ primaryLabel: 'Save', variant: 'primary' }}>
	{#snippet template(args)}
		<SplitButton
			{...args}
			primaryOnclick={() => console.log('Primary clicked')}
			dropdownItems={[
				{ label: 'Save as Draft', onclick: () => console.log('Save as Draft') },
				{ label: 'Save and Publish', onclick: () => console.log('Save and Publish') },
				{ label: 'Save Template', onclick: () => console.log('Save Template') }
			]}
		/>
	{/snippet}
</Story>

<Story name="Secondary" args={{ primaryLabel: 'Export', variant: 'secondary' }}>
	{#snippet template(args)}
		<SplitButton
			{...args}
			primaryOnclick={() => console.log('Export clicked')}
			dropdownItems={[
				{ label: 'Export as PDF', onclick: () => console.log('Export as PDF') },
				{ label: 'Export as CSV', onclick: () => console.log('Export as CSV') },
				{ label: 'Export as JSON', onclick: () => console.log('Export as JSON') }
			]}
		/>
	{/snippet}
</Story>

<Story name="Single Option" args={{ primaryLabel: 'Create', variant: 'primary' }}>
	{#snippet template(args)}
		<SplitButton
			{...args}
			primaryOnclick={() => console.log('Create clicked')}
			dropdownItems={[
				{ label: 'Create from Template', onclick: () => console.log('Create from Template') }
			]}
		/>
	{/snippet}
</Story>
