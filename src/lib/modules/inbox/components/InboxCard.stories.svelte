<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InboxCard from './InboxCard.svelte';

	const { Story } = defineMeta({
		component: InboxCard,
		title: 'Modules/Inbox/InboxCard',
		tags: ['autodocs']
	});

	// Mock data for stories
	const mockItem = {
		_id: 'test-123',
		type: 'readwise_highlight',
		title: 'Example Highlight Title',
		snippet: 'This is a preview snippet of the highlight content that would appear in the inbox.',
		createdAt: Date.now() - 3600000 // 1 hour ago
	};
</script>

<Story name="Default" args={{ item: mockItem, selected: false, onClick: () => {} }}>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>

<Story name="Selected" args={{ item: mockItem, selected: true, onClick: () => {} }}>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>

<Story
	name="Photo Note"
	args={{
		item: { ...mockItem, type: 'photo_note', title: 'Photo Note Title' },
		selected: false,
		onClick: () => {}
	}}
>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>

<Story
	name="Manual Text"
	args={{
		item: { ...mockItem, type: 'manual_text', title: 'Manual Text Entry' },
		selected: false,
		onClick: () => {}
	}}
>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>

<Story
	name="Note"
	args={{
		item: { ...mockItem, type: 'note', title: 'Quick Note' },
		selected: false,
		onClick: () => {}
	}}
>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>

<Story
	name="No Date"
	args={{ item: { ...mockItem, createdAt: undefined }, selected: false, onClick: () => {} }}
>
	{#snippet template(args)}
		<InboxCard {...args} />
	{/snippet}
</Story>
