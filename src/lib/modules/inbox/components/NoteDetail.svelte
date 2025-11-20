<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import NoteEditorWithDetection from '$lib/components/notes/NoteEditorWithDetection.svelte';
	import { useNote } from '$lib/modules/inbox/composables/useNote.svelte';
	import { api } from '$lib/convex';
	import type { InboxItemWithDetails } from '$lib/types/convex';
	import type NoteEditorWithDetectionComponent from '$lib/components/notes/NoteEditorWithDetection.svelte';
	import type { Id } from '$lib/convex';

	type Props = {
		inboxItem: InboxItemWithDetails & { type: 'note' }; // Note inbox item
		onClose?: () => void;
	};

	let { inboxItem, onClose }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = () => $page.data.sessionId;
	const note = useNote(convexClient, getSessionId);

	let editorRef: NoteEditorWithDetectionComponent | null = $state(null);
	let editMode = $state(false);

	// Handle Enter key to activate edit mode
	$effect(() => {
		if (!browser) return;

		function handleKeyDown(event: KeyboardEvent) {
			// Only handle Enter when not already in edit mode
			if (editMode) return;

			// Check if any input is focused
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				(activeElement instanceof HTMLElement && activeElement.isContentEditable);

			if (isInputFocused) return;

			// Handle Enter key to enter edit mode
			if (event.key === 'Enter') {
				// Check if emoji menu or other popup menus are active
				const emojiMenuActive = document.querySelector('.emoji-menu') !== null;
				if (emojiMenuActive) return; // Let the emoji menu handle Enter

				event.preventDefault();
				editMode = true;
				// Focus the editor title after a tick
				setTimeout(() => {
					editorRef?.focusTitle();
				}, 0);
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Track when user leaves edit mode (ESC key already handled by NoteEditor)
	$effect(() => {
		if (!browser || !editMode) return;

		function handleFocusOut() {
			// Small delay to check if focus moved to another input in the editor
			setTimeout(() => {
				const activeElement = document.activeElement;
				const isInputFocused =
					activeElement?.tagName === 'INPUT' ||
					activeElement?.tagName === 'TEXTAREA' ||
					(activeElement instanceof HTMLElement && activeElement.isContentEditable);

				if (!isInputFocused) {
					editMode = false;
				}
			}, 100);
		}

		document.addEventListener('focusout', handleFocusOut);

		return () => {
			document.removeEventListener('focusout', handleFocusOut);
		};
	});

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

	async function handleExportToDocs() {
		if (!convexClient || !inboxItem._id) return;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			const result = await convexClient.mutation(api.notes.exportToDevDocs, {
				sessionId,
				noteId: inboxItem._id as Id<'inboxItems'>
			});

			if (result?.slug) {
				// Open the exported note in a new tab
				window.open(`/dev-docs/notes/${result.slug}`, '_blank');
			}
		} catch (error) {
			console.error('Failed to export to docs:', error);
		}
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

<div class="flex h-full flex-col">
	<!-- Header - Matches ReadwiseDetail pattern -->
	<div
		class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between border-b border-base bg-surface px-inbox-header py-system-header"
	>
		<!-- Left: Title + Save Status -->
		<div class="flex items-center gap-icon">
			<button
				type="button"
				class="flex items-center gap-icon rounded-md px-nav-item py-nav-item text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
				onclick={onClose}
				aria-label="Back to inbox"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<!-- Export to Docs Button -->
			<button
				type="button"
				onclick={handleExportToDocs}
				class="bg-primary rounded-md border border-base px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-hover-solid"
			>
				Export to Docs
			</button>

			<!-- Export to Blog Button -->
			<button
				type="button"
				onclick={handleExportToBlog}
				class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			>
				Export to Blog
			</button>
		</div>
	</div>

	<!-- Note Editor -->
	<div class="flex-1 overflow-y-auto">
		<NoteEditorWithDetection
			bind:this={editorRef}
			content={inboxItem.content}
			title={inboxItem.title}
			onContentChange={handleContentChange}
			onTitleChange={handleTitleChange}
			onAIFlagged={handleAIFlagged}
			isAIGenerated={inboxItem.isAIGenerated}
			enableAIDetection={true}
			autoFocus={false}
		/>
	</div>

	<!-- Footer with metadata -->
	<div class="border-t border-base px-inbox-container py-system-header">
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
				<span class="rounded bg-accent-primary px-badge py-badge text-label font-medium text-white">
					BLOG
				</span>
			{/if}
		</div>
	</div>
</div>
