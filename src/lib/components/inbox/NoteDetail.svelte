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

	// Load note data
	$effect(() => {
		if (inboxItem && inboxItem.type === 'note') {
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

<div class="flex flex-col h-full bg-surface">
	<!-- Header with actions -->
	<div
		class="flex items-center justify-between px-content-padding py-header border-b border-divider bg-surface"
	>
		<div class="flex items-center gap-section">
			<h3 class="text-sm font-medium text-surface-primary">
				{inboxItem.title || 'Untitled Note'}
			</h3>
			<span class="text-label text-surface-tertiary">
				{saveStatus()}
			</span>
		</div>

		<div class="flex items-center gap-toolbar-item">
			<!-- Export to Blog Button -->
			<button
				type="button"
				onclick={handleExportToBlog}
				class="px-button py-button-small bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
			>
				Export to Blog
			</button>

			<!-- Close Button -->
			{#if onClose}
				<button
					type="button"
					onclick={onClose}
					class="p-toolbar-button rounded hover:bg-hover transition-colors"
					aria-label="Close"
				>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
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
	<div class="px-content-padding py-section border-t border-divider bg-surface-subtle">
		<div class="flex items-center justify-between text-label text-surface-tertiary">
			<div class="flex items-center gap-section">
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
				<span class="px-badge py-badge bg-primary text-white rounded text-label font-medium">
					BLOG
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.px-content-padding {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}

	.py-content-padding {
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
	}

	.py-header {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
	}

	.py-section {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
	}

	.gap-section {
		gap: 1rem;
	}

	.gap-toolbar-item {
		gap: 0.5rem;
	}

	.px-button {
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.py-button-small {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.p-toolbar-button {
		padding: 0.5rem;
	}

	.px-badge {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}

	.py-badge {
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
	}

	.bg-surface {
		background-color: var(--color-bg-surface);
	}

	.bg-surface-subtle {
		background-color: var(--color-bg-surface-subtle);
	}

	.border-divider {
		border-color: var(--color-border-divider);
	}

	.text-surface-primary {
		color: var(--color-text-surface-primary);
	}

	.text-surface-tertiary {
		color: var(--color-text-surface-tertiary);
	}

	.bg-primary {
		background-color: var(--color-bg-primary);
	}

	.bg-primary-hover {
		background-color: var(--color-bg-primary-hover);
	}

	.bg-hover {
		background-color: var(--color-sidebar-hover);
	}
</style>

