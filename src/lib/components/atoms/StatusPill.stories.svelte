<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusPill from './StatusPill.svelte';

	const { Story } = defineMeta({
		component: StatusPill,
		title: 'Design System/Atoms/StatusPill',
		tags: ['autodocs'],
		argTypes: {
			status: {
				control: { type: 'select' },
				options: ['backlog', 'todo', 'in_progress', 'done', 'cancelled']
			},
			readonly: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Backlog" args={{ status: 'backlog', readonly: false }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="Todo" args={{ status: 'todo', readonly: false }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="InProgress" args={{ status: 'in_progress', readonly: false }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="Done" args={{ status: 'done', readonly: false }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="Cancelled" args={{ status: 'cancelled', readonly: false }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="Readonly" args={{ status: 'in_progress', readonly: true }}>
	{#snippet template(args)}
		<StatusPill {...args} />
	{/snippet}
</Story>

<Story name="AllStatuses" args={{}}>
	{#snippet template(args)}
		<div class="flex flex-col gap-2">
			<StatusPill status="backlog" />
			<StatusPill status="todo" />
			<StatusPill status="in_progress" />
			<StatusPill status="done" />
			<StatusPill status="cancelled" />
		</div>
	{/snippet}
</Story>
