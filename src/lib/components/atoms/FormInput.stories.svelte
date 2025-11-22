<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormInput from './FormInput.svelte';

	const { Story } = defineMeta({
		component: FormInput,
		title: 'Design System/Atoms/FormInput',
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['text', 'email', 'password', 'url']
			},
			required: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ label: 'Input Label', placeholder: 'Enter text...', type: 'text' }}>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>

<Story
	name="Required"
	args={{ label: 'Required Input', placeholder: 'Required field', type: 'text', required: true }}
>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{ label: 'Disabled Input', placeholder: 'Cannot edit', type: 'text', disabled: true }}
>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>

<Story
	name="Email"
	args={{ label: 'Email Address', placeholder: 'email@example.com', type: 'email' }}
>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>

<Story
	name="Password"
	args={{ label: 'Password', placeholder: 'Enter password', type: 'password' }}
>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>

<Story name="WithoutLabel" args={{ placeholder: 'No label', type: 'text' }}>
	{#snippet template(args)}
		<FormInput {...args} />
	{/snippet}
</Story>
