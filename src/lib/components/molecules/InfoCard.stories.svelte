<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InfoCard from './InfoCard.svelte';

	const { Story } = defineMeta({
		component: InfoCard,
		title: 'Design System/Molecules/InfoCard',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['info', 'warning', 'success']
			},
			icon: {
				control: { type: 'text' }
			},
			message: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story
	name="Info"
	args={{
		variant: 'info',
		icon: 'ℹ️',
		message:
			'This is an informational message. Use this variant for helpful tips and general information.'
	}}
>
	{#snippet template(args)}
		<InfoCard {...args} />
	{/snippet}
</Story>

<Story
	name="Warning"
	args={{
		variant: 'warning',
		icon: '⚠️',
		message:
			'This is a warning message. Use this variant to alert users about potential issues or important considerations.'
	}}
>
	{#snippet template(args)}
		<InfoCard {...args} />
	{/snippet}
</Story>

<Story
	name="Success"
	args={{
		variant: 'success',
		icon: '✅',
		message:
			'This is a success message. Use this variant to confirm successful actions or positive outcomes.'
	}}
>
	{#snippet template(args)}
		<InfoCard {...args} />
	{/snippet}
</Story>

<Story
	name="With Custom Icon"
	args={{
		variant: 'info',
		icon: '💡',
		message: 'Your meeting will repeat every Saturday, starting Nov 29.'
	}}
>
	{#snippet template(args)}
		<InfoCard {...args} />
	{/snippet}
</Story>

<Story
	name="Long Message"
	args={{
		variant: 'info',
		icon: 'ℹ️',
		message:
			'This is a longer informational message that demonstrates how the InfoCard component handles text wrapping and maintains proper spacing and readability even with extended content.'
	}}
>
	{#snippet template(args)}
		<InfoCard {...args} />
	{/snippet}
</Story>
