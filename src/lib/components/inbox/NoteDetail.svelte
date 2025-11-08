<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import NoteEditorWithDetection from '../notes/NoteEditorWithDetection.svelte';
	import { useNote } from '$lib/composables/useNote.svelte';

	type Props = {
		inboxItem: any; // Note inbox item
		onClose?: () => void;
	};

	let { inboxItem, onClose }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;
	const note = useNote(convexClient);

	// Load note data - runs whenever inboxItem changes
	$effect(() => {
		if (inboxItem && inboxItem.type === 'note' && inboxItem._id) {
			// Clear previous note state first
			note.clear();
			// Load new note
			note.loadNote(inboxItem._id, inboxItem);
		}
	});

	function handleTitleChange(newTitle: string) {
		note.updateNote({ title: newTitle });
	}

	function handleContentChange(newContent: string, markdown: string) {
		note.updateNote({ content: newContent, contentMarkdown: markdown });
	}

	function handleAIFlagged() {
		note.markAsAIGenerated();
	}

	async function handleExportToBlog() {
		// Generate slug from title
		const slug =
			inboxItem.title
				?.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '') || 'untitled';

		const success = await note.markForBlogExport(slug);
		if (success) {
			alert('Note marked for blog export!');
		}
	}

	const saveStatus = $derived(() => {
		if (note.isSaving) return 'Saving...';
		if (note.lastSaved) {
			const seconds = Math.floor((Date.now() - note.lastSaved) / 1000);
			if (seconds < 60) return 'Saved just now';
			if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
			return `Saved ${Math.floor(seconds / 3600)}h ago`;
		}
		return 'Not saved';
	});
</script>

<div class="flex flex-col h-full">
	<!-- Header - Matches ReadwiseDetail pattern -->
	<div
		class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header h-system-header flex items-center justify-between flex-shrink-0"
	>
		<!-- Left: Title + Save Status -->
		<div class="flex items-center gap-icon">
			<button
				type="button"
				class="flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
				onclick={onClose}
				aria-label="Back to inbox"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span class="text-sm">Back</span>
			</button>
			<h2 class="text-sm font-normal text-secondary">
				{inboxItem.title || 'Untitled Note'}
			</h2>
			<span class="text-label text-tertiary">
				{saveStatus()}
			</span>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-icon">
			<!-- Export to Blog Button -->
			<button
				type="button"
				onclick={handleExportToBlog}
				class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors text-sm font-medium"
			>
				Export to Blog
			</button>
		</div>
	</div>

	<!-- Note Editor -->
	<div class="flex-1 overflow-hidden">
		<NoteEditorWithDetection
			content={inboxItem.content}
			title={inboxItem.title}
			onContentChange={handleContentChange}
			onTitleChange={handleTitleChange}
			onAIFlagged={handleAIFlagged}
			isAIGenerated={inboxItem.isAIGenerated}
			enableAIDetection={true}
		/>
	</div>

	<!-- Footer with metadata -->
	<div class="px-inbox-container py-system-header border-t border-base">
		<div class="flex items-center justify-between text-label text-tertiary">
			<div class="flex items-center gap-2">
				<span>
					Created {new Date(inboxItem.createdAt).toLocaleDateString()}
				</span>
				{#if inboxItem.updatedAt}
					<span>
						• Updated {new Date(inboxItem.updatedAt).toLocaleDateString()}
					</span>
				{/if}
			</div>

			{#if inboxItem.blogCategory === 'BLOG'}
				<span class="px-badge py-badge bg-accent-primary text-white rounded text-label font-medium">
					BLOG
				</span>
			{/if}
		</div>
	</div>
</div>

