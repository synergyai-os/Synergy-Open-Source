<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Combobox from './Combobox.svelte';

	// Sample options for testing
	const fruitOptions = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'date', label: 'Date' },
		{ value: 'elderberry', label: 'Elderberry' }
	];

	const manyOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
		{ value: 'option4', label: 'Option 4' },
		{ value: 'option5', label: 'Option 5' },
		{ value: 'option6', label: 'Option 6' },
		{ value: 'option7', label: 'Option 7' },
		{ value: 'option8', label: 'Option 8' },
		{ value: 'option9', label: 'Option 9' },
		{ value: 'option10', label: 'Option 10' },
		{ value: 'option11', label: 'Option 11' },
		{ value: 'option12', label: 'Option 12' },
		{ value: 'option13', label: 'Option 13' },
		{ value: 'option14', label: 'Option 14' },
		{ value: 'option15', label: 'Option 15' }
	];

	const { Story } = defineMeta({
		component: Combobox,
		title: 'Design System/Atoms/Combobox',
		tags: ['autodocs'],
		argTypes: {
			label: {
				control: { type: 'text' },
				description: 'Label text displayed above the combobox'
			},
			placeholder: {
				control: { type: 'text' },
				description: 'Placeholder text shown when no value is selected'
			},
			required: {
				control: { type: 'boolean' },
				description: 'Whether the field is required (shows asterisk)'
			},
			disabled: {
				control: { type: 'boolean' },
				description: 'Whether the combobox is disabled'
			},
			allowDeselect: {
				control: { type: 'boolean' },
				description: 'Whether users can deselect a selected option'
			},
			showLabel: {
				control: { type: 'boolean' },
				description: 'Whether to show the label (variant: with or without label)'
			},
			options: {
				control: { type: 'object' },
				description: 'Array of option objects with value, label, and optional disabled property'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		label: 'Select a fruit',
		placeholder: 'Search fruits...',
		options: fruitOptions,
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="With Label"
	args={{
		label: 'Favorite Fruit',
		placeholder: 'Choose a fruit',
		options: fruitOptions,
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Without Label"
	args={{
		placeholder: 'Select an option',
		options: fruitOptions,
		showLabel: false
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Required"
	args={{
		label: 'Required Field',
		placeholder: 'Please select an option',
		options: fruitOptions,
		required: true,
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{
		label: 'Disabled Combobox',
		placeholder: 'Cannot select',
		options: fruitOptions,
		disabled: true,
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="With Preselected Value"
	args={{
		label: 'Selected Fruit',
		placeholder: 'Search fruits...',
		options: fruitOptions,
		value: 'banana',
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Allow Deselect"
	args={{
		label: 'Select Fruit (can deselect)',
		placeholder: 'Search fruits...',
		options: fruitOptions,
		allowDeselect: true,
		value: 'apple',
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Many Options (Scrollable)"
	args={{
		label: 'Select Option',
		placeholder: 'Search options...',
		options: manyOptions,
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="With Disabled Options"
	args={{
		label: 'Select Option',
		placeholder: 'Some options disabled',
		options: [
			{ value: 'enabled1', label: 'Enabled Option 1' },
			{ value: 'disabled1', label: 'Disabled Option 1', disabled: true },
			{ value: 'enabled2', label: 'Enabled Option 2' },
			{ value: 'disabled2', label: 'Disabled Option 2', disabled: true },
			{ value: 'enabled3', label: 'Enabled Option 3' }
		],
		showLabel: true
	}}
>
	{#snippet template(args)}
		<Combobox {...args} />
	{/snippet}
</Story>

<Story
	name="Search/Filter Demo"
	args={{
		label: 'Search Fruits',
		placeholder: 'Type to search...',
		options: [
			{ value: 'apple', label: 'Apple' },
			{ value: 'apricot', label: 'Apricot' },
			{ value: 'avocado', label: 'Avocado' },
			{ value: 'banana', label: 'Banana' },
			{ value: 'blueberry', label: 'Blueberry' },
			{ value: 'cherry', label: 'Cherry' },
			{ value: 'coconut', label: 'Coconut' },
			{ value: 'date', label: 'Date' },
			{ value: 'dragonfruit', label: 'Dragonfruit' },
			{ value: 'elderberry', label: 'Elderberry' },
			{ value: 'fig', label: 'Fig' },
			{ value: 'grape', label: 'Grape' },
			{ value: 'grapefruit', label: 'Grapefruit' },
			{ value: 'kiwi', label: 'Kiwi' },
			{ value: 'lemon', label: 'Lemon' },
			{ value: 'lime', label: 'Lime' },
			{ value: 'mango', label: 'Mango' },
			{ value: 'orange', label: 'Orange' },
			{ value: 'papaya', label: 'Papaya' },
			{ value: 'peach', label: 'Peach' },
			{ value: 'pear', label: 'Pear' },
			{ value: 'pineapple', label: 'Pineapple' },
			{ value: 'plum', label: 'Plum' },
			{ value: 'raspberry', label: 'Raspberry' },
			{ value: 'strawberry', label: 'Strawberry' },
			{ value: 'watermelon', label: 'Watermelon' }
		],
		showLabel: true
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<Combobox {...args} />
			<p class="text-secondary mt-4 text-sm">
				💡 Try typing "berry" or "apple" to see the search/filter functionality in action!
			</p>
		</div>
	{/snippet}
</Story>
