<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		component: Icon,
		title: 'Design System/Atoms/Icon',
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: [
					'add',
					'calendar',
					'chevron-right',
					'circles',
					'close',
					'dashboard',
					'delete',
					'download',
					'edit',
					'flashcards',
					'inbox',
					'lightbulb',
					'members',
					'payment',
					'share',
					'study',
					'tags'
				]
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg', 'xl']
			}
		}
	});
</script>

<Story name="Default" args={{ type: 'add', size: 'md' }}>
	{#snippet template(args)}
		<Icon type={args.type} size={args.size} />
	{/snippet}
</Story>

<Story name="Small" args={{ type: 'add', size: 'sm' }}>
	{#snippet template(args)}
		<Icon type={args.type} size={args.size} />
	{/snippet}
</Story>

<Story name="Medium" args={{ type: 'add', size: 'md' }}>
	{#snippet template(args)}
		<Icon type={args.type} size={args.size} />
	{/snippet}
</Story>

<Story name="Large" args={{ type: 'add', size: 'lg' }}>
	{#snippet template(args)}
		<Icon type={args.type} size={args.size} />
	{/snippet}
</Story>

<Story name="Extra Large" args={{ type: 'add', size: 'xl' }}>
	{#snippet template(args)}
		<Icon type={args.type} size={args.size} />
	{/snippet}
</Story>

<Story name="Sizes" args={{ type: 'add' }}>
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<div class="flex flex-col items-center gap-2">
				<Icon type={args.type} size="sm" />
				<span class="text-secondary text-xs">Small</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type={args.type} size="md" />
				<span class="text-secondary text-xs">Medium</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type={args.type} size="lg" />
				<span class="text-secondary text-xs">Large</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type={args.type} size="xl" />
				<span class="text-secondary text-xs">Extra Large</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Actions">
	{#snippet template(_args)}
		<div class="flex flex-wrap items-center gap-6">
			<div class="flex flex-col items-center gap-2">
				<Icon type="add" size="md" />
				<span class="text-secondary text-xs">Add</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="edit" size="md" />
				<span class="text-secondary text-xs">Edit</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="delete" size="md" />
				<span class="text-secondary text-xs">Delete</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="close" size="md" />
				<span class="text-secondary text-xs">Close</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="download" size="md" />
				<span class="text-secondary text-xs">Download</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="share" size="md" />
				<span class="text-secondary text-xs">Share</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Navigation">
	{#snippet template(_args)}
		<div class="flex flex-wrap items-center gap-6">
			<div class="flex flex-col items-center gap-2">
				<Icon type="chevron-right" size="md" />
				<span class="text-secondary text-xs">Chevron Right</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Content & Features">
	{#snippet template(_args)}
		<div class="flex flex-wrap items-center gap-6">
			<div class="flex flex-col items-center gap-2">
				<Icon type="inbox" size="md" />
				<span class="text-secondary text-xs">Inbox</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="flashcards" size="md" />
				<span class="text-secondary text-xs">Flashcards</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="study" size="md" />
				<span class="text-secondary text-xs">Study</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="tags" size="md" />
				<span class="text-secondary text-xs">Tags</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="circles" size="md" />
				<span class="text-secondary text-xs">Circles</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="members" size="md" />
				<span class="text-secondary text-xs">Members</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="dashboard" size="md" />
				<span class="text-secondary text-xs">Dashboard</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="calendar" size="md" />
				<span class="text-secondary text-xs">Calendar</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="lightbulb" size="md" />
				<span class="text-secondary text-xs">Lightbulb</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="payment" size="md" />
				<span class="text-secondary text-xs">Payment</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="All Icons">
	{#snippet template(_args)}
		<div class="grid grid-cols-4 gap-6">
			<div class="flex flex-col items-center gap-2">
				<Icon type="add" size="md" />
				<span class="text-secondary text-xs">add</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="calendar" size="md" />
				<span class="text-secondary text-xs">calendar</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="chevron-right" size="md" />
				<span class="text-secondary text-xs">chevron-right</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="circles" size="md" />
				<span class="text-secondary text-xs">circles</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="close" size="md" />
				<span class="text-secondary text-xs">close</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="dashboard" size="md" />
				<span class="text-secondary text-xs">dashboard</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="delete" size="md" />
				<span class="text-secondary text-xs">delete</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="download" size="md" />
				<span class="text-secondary text-xs">download</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="edit" size="md" />
				<span class="text-secondary text-xs">edit</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="flashcards" size="md" />
				<span class="text-secondary text-xs">flashcards</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="inbox" size="md" />
				<span class="text-secondary text-xs">inbox</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="lightbulb" size="md" />
				<span class="text-secondary text-xs">lightbulb</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="members" size="md" />
				<span class="text-secondary text-xs">members</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="payment" size="md" />
				<span class="text-secondary text-xs">payment</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="share" size="md" />
				<span class="text-secondary text-xs">share</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="study" size="md" />
				<span class="text-secondary text-xs">study</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Icon type="tags" size="md" />
				<span class="text-secondary text-xs">tags</span>
			</div>
		</div>
	{/snippet}
</Story>
