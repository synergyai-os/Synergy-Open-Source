<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccountInfo from './AccountInfo.svelte';

	const { Story } = defineMeta({
		component: AccountInfo,
		title: 'Design System/Molecules/AccountInfo',
		tags: ['autodocs'],
		argTypes: {
			accountName: {
				control: { type: 'text' },
				description: 'Display name of the account'
			},
			accountEmail: {
				control: { type: 'text' },
				description: 'Email address of the account'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		accountName: 'Randy Hereman',
		accountEmail: 'randy@synergyai.nl'
	}}
>
	{#snippet template(args)}
		<AccountInfo {...args} />
	{/snippet}
</Story>

<Story
	name="Long Name"
	args={{
		accountName: 'Very Long Account Name That Might Truncate',
		accountEmail: 'verylongemailaddress@example.com'
	}}
>
	{#snippet template(args)}
		<AccountInfo {...args} />
	{/snippet}
</Story>
