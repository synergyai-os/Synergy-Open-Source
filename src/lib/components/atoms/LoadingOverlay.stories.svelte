<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LoadingOverlay from './LoadingOverlay.svelte';

	const { Story } = defineMeta({
		component: LoadingOverlay,
		title: 'Design System/Atoms/LoadingOverlay',
		tags: ['autodocs'],
		argTypes: {
			show: {
				control: { type: 'boolean' }
			},
			flow: {
				control: { type: 'select' },
				options: [
					'account-registration',
					'account-linking',
					'workspace-creation',
					'workspace-switching',
					'workspace-joining',
					'onboarding',
					'custom'
				]
			},
			title: {
				control: { type: 'text' }
			},
			subtitle: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Default" args={{ show: true, flow: 'custom', title: 'Loading...', subtitle: '' }}>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>

<Story
	name="Account Registration"
	args={{ show: true, flow: 'account-registration', subtitle: 'John Doe' }}
>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>

<Story
	name="Workspace Creation"
	args={{ show: true, flow: 'workspace-creation', subtitle: 'My Workspace' }}
>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>

<Story
	name="Workspace Switching"
	args={{ show: true, flow: 'workspace-switching', subtitle: 'workspace' }}
>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>

<Story
	name="Custom Flow"
	args={{
		show: true,
		flow: 'custom',
		title: 'Processing...',
		subtitle: '',
		customStages: ['Step 1', 'Step 2', 'Step 3']
	}}
>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>

<Story name="Hidden" args={{ show: false, flow: 'custom', title: 'Loading...', subtitle: '' }}>
	{#snippet template(args)}
		<LoadingOverlay {...args} />
	{/snippet}
</Story>
