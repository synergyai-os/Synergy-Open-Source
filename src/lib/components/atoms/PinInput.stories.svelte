<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PinInput from './PinInput.svelte';

	const { Story } = defineMeta({
		component: PinInput,
		title: 'Design System/Atoms/PinInput',
		tags: ['autodocs'],
		argTypes: {
			label: {
				control: { type: 'text' }
			},
			error: {
				control: { type: 'text' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ label: 'Verification Code' }}>
	{#snippet template(args)}
		<PinInput {...args} />
	{/snippet}
</Story>

<Story name="With Label" args={{ label: 'Enter 6-digit code' }}>
	{#snippet template(args)}
		<PinInput {...args} />
	{/snippet}
</Story>

<Story
	name="With Error"
	args={{ label: 'Verification Code', error: 'Invalid code. Please try again.' }}
>
	{#snippet template(args)}
		<PinInput {...args} />
	{/snippet}
</Story>

<Story name="Disabled" args={{ label: 'Verification Code', disabled: true }}>
	{#snippet template(args)}
		<PinInput {...args} />
	{/snippet}
</Story>

<Story name="Without Label" args={{}}>
	{#snippet template(args)}
		<PinInput {...args} />
	{/snippet}
</Story>
