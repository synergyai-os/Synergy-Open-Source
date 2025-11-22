<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormTextarea from './FormTextarea.svelte';

	const { Story } = defineMeta({
		component: FormTextarea,
		title: 'Design System/Atoms/FormTextarea',
		tags: ['autodocs'],
		argTypes: {
			label: {
				control: { type: 'text' }
			},
			placeholder: {
				control: { type: 'text' }
			},
			required: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			},
			rows: {
				control: { type: 'number' }
			}
		}
	});
</script>

<Story name="Default" args={{ label: 'Description', placeholder: 'Enter description...', rows: 4 }}>
	{#snippet template(args)}
		<FormTextarea {...args} />
	{/snippet}
</Story>

<Story name="With Label" args={{ label: 'Comments', placeholder: 'Add your comments...', rows: 6 }}>
	{#snippet template(args)}
		<FormTextarea {...args} />
	{/snippet}
</Story>

<Story
	name="Required"
	args={{ label: 'Message', placeholder: 'Enter your message...', required: true, rows: 4 }}
>
	{#snippet template(args)}
		<FormTextarea {...args} />
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{ label: 'Notes', placeholder: 'This field is disabled', disabled: true, rows: 4 }}
>
	{#snippet template(args)}
		<FormTextarea {...args} />
	{/snippet}
</Story>

<Story name="Without Label" args={{ placeholder: 'Type here...', rows: 4 }}>
	{#snippet template(args)}
		<FormTextarea {...args} />
	{/snippet}
</Story>
