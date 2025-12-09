<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LoginBox from './LoginBox.svelte';

	const { Story } = defineMeta({
		component: LoginBox,
		title: 'Design System/Organisms/LoginBox',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default']
			},
			linkingFlow: {
				control: { type: 'boolean' }
			},
			isSubmitting: {
				control: { type: 'boolean' }
			},
			isRateLimited: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ email: '', password: '', redirectTarget: '/auth/redirect' }}>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>

<Story
	name="With Prefilled Email"
	args={{ email: 'user@example.com', password: '', redirectTarget: '/auth/redirect' }}
>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>

<Story
	name="Submitting"
	args={{ email: '', password: '', isSubmitting: true, redirectTarget: '/auth/redirect' }}
>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>

<Story
	name="Error State"
	args={{
		email: 'user@example.com',
		password: '',
		errorMessage: 'Invalid email or password. Please try again.',
		showCreateAccountLink: true,
		redirectTarget: '/auth/redirect'
	}}
>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>

<Story
	name="Rate Limited"
	args={{
		email: 'user@example.com',
		password: '',
		isRateLimited: true,
		rateLimitRetryAfter: 45,
		redirectTarget: '/auth/redirect'
	}}
>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>

<Story
	name="Account Linking Flow"
	args={{
		email: 'user@example.com',
		password: '',
		linkingFlow: true,
		redirectTarget: '/auth/redirect'
	}}
>
	{#snippet template(args)}
		<LoginBox {...args} />
	{/snippet}
</Story>
