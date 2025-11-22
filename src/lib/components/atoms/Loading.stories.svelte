<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Loading from './Loading.svelte';

	const { Story } = defineMeta({
		component: Loading,
		title: 'Design System/Atoms/Loading',
		tags: ['autodocs'],
		argTypes: {
			message: {
				control: { type: 'text' }
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			},
			fullHeight: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ message: 'Loading...', size: 'md', fullHeight: false }}>
	{#snippet template(args)}
		<Loading {...args} />
	{/snippet}
</Story>

<Story name="Small" args={{ message: 'Loading...', size: 'sm', fullHeight: false }}>
	{#snippet template(args)}
		<Loading {...args} />
	{/snippet}
</Story>

<Story name="Large" args={{ message: 'Loading...', size: 'lg', fullHeight: false }}>
	{#snippet template(args)}
		<Loading {...args} />
	{/snippet}
</Story>

<Story name="Custom Message" args={{ message: 'Fetching data...', size: 'md', fullHeight: false }}>
	{#snippet template(args)}
		<Loading {...args} />
	{/snippet}
</Story>

<Story name="Full Height" args={{ message: 'Loading...', size: 'md', fullHeight: true }}>
	{#snippet template(args)}
		<div class="h-64">
			<Loading {...args} />
		</div>
	{/snippet}
</Story>

<Story name="No Message" args={{ message: '', size: 'md', fullHeight: false }}>
	{#snippet template(args)}
		<Loading {...args} />
	{/snippet}
</Story>
