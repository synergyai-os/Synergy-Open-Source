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

<Story
	name="Default"
	args={{ item: mockItem, selected: false, onClick: () => {} }}
	play={async ({ canvasElement, args }) => {
		// Verify card renders with correct content
		if (!canvasElement.textContent?.includes(args.item.title)) {
			throw new Error(`Card title "${args.item.title}" not found`);
		}
		if (!canvasElement.textContent?.includes(args.item.snippet)) {
			throw new Error(`Card snippet "${args.item.snippet}" not found`);
		}
		
		// Verify card is clickable
		const card = canvasElement.querySelector('[data-inbox-item-id]') || canvasElement.querySelector('button');
		if (!card) {
			throw new Error('Card element not found');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>

<Story
	name="Selected"
	args={{ item: mockItem, selected: true, onClick: () => {} }}
	play={async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-inbox-item-id]') || canvasElement.querySelector('button');
		
		// Verify selected state styling (card should have selected border)
		if (!card) {
			throw new Error('Card element not found');
		}
		if (!card.className.includes('border-2')) {
			throw new Error('Card missing border-2 class for selected state');
		}
		if (!card.className.includes('border-selected')) {
			throw new Error('Card missing border-selected class for selected state');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>

<Story
	name="Photo Note"
	args={{
		item: { ...mockItem, type: 'photo_note', title: 'Photo Note Title' },
		selected: false,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify photo note type renders correctly
		if (!canvasElement.textContent?.includes(args.item.title)) {
			throw new Error(`Photo note title "${args.item.title}" not found`);
		}
		if (!canvasElement.textContent?.includes('📷')) {
			throw new Error('Photo note icon (📷) not found');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>

<Story
	name="Manual Text"
	args={{
		item: { ...mockItem, type: 'manual_text', title: 'Manual Text Entry' },
		selected: false,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify manual text type renders correctly
		if (!canvasElement.textContent?.includes(args.item.title)) {
			throw new Error(`Manual text title "${args.item.title}" not found`);
		}
		if (!canvasElement.textContent?.includes('✍️')) {
			throw new Error('Manual text icon (✍️) not found');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>

<Story
	name="Note"
	args={{
		item: { ...mockItem, type: 'note', title: 'Quick Note' },
		selected: false,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify note type renders correctly
		if (!canvasElement.textContent?.includes(args.item.title)) {
			throw new Error(`Note title "${args.item.title}" not found`);
		}
		if (!canvasElement.textContent?.includes('📝')) {
			throw new Error('Note icon (📝) not found');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>

<Story
	name="No Date"
	args={{ item: { ...mockItem, createdAt: undefined }, selected: false, onClick: () => {} }}
	play={async ({ canvasElement, args }) => {
		// Verify card renders without date
		if (!canvasElement.textContent?.includes(args.item.title)) {
			throw new Error(`Card title "${args.item.title}" not found`);
		}
		// Date should not be present (no relative date text)
		const datePattern = /(ago|yesterday|today|minute|hour|day)/i;
		if (canvasElement.textContent?.match(datePattern)) {
			throw new Error('Card should not display date when createdAt is undefined');
		}
	}}
>
	{#snippet template(args)}
		<InboxCard item={args.item} selected={args.selected} onClick={args.onClick} />
	{/snippet}
</Story>
