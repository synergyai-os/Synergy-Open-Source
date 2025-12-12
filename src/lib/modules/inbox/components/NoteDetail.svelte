<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { getContext } from 'svelte';
	import { useNote } from '$lib/modules/inbox/composables/useNote.svelte';
	import { api } from '$lib/convex';
	import type { InboxItemWithDetails } from '$lib/types/convex';
	import type { Id } from '$lib/convex';
	import { Button } from '$lib/components/atoms';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import { invariant } from '$lib/utils/invariant';

	type Props = {
		inboxItem: InboxItemWithDetails & { type: 'note' }; // Note inbox item
		onClose?: () => void;
	};

	let { inboxItem, onClose }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = () => $page.data.sessionId;
	const note = useNote(convexClient, getSessionId);

	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const NoteEditorWithDetection = coreAPI?.NoteEditorWithDetection;

	type NoteEditorWithDetectionComponent = InstanceType<
		NonNullable<CoreModuleAPI['NoteEditorWithDetection']>
	>;

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
		note.updateNoteAIFlag();
	}

	async function handleExportToDocs() {
		if (!convexClient || !inboxItem._id) return;

		try {
			const sessionId = getSessionId();
			invariant(sessionId, 'Session ID is required');

			const result = await convexClient.mutation(api.features.notes.index.updateNoteDevDocsExport, {
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

		const success = await note.updateNoteExport(slug);
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
		class="h-system-header border-base py-system-header bg-surface sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
		style="padding-inline: var(--spacing-4);"
	>
		<!-- Left: Title + Save Status -->
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={onClose} ariaLabel="Back to inbox">
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span class="text-small">Back</span>
			</Button>
			<h2 class="text-small text-secondary font-normal">
				{inboxItem.title || 'Untitled Note'}
			</h2>
			<span class="text-label text-tertiary">
				{saveStatus()}
			</span>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-2">
			<!-- Export to Docs Button -->
			<Button variant="outline" onclick={handleExportToDocs}>Export to Docs</Button>

			<!-- Export to Blog Button -->
			<Button variant="primary" onclick={handleExportToBlog}>Export to Blog</Button>
		</div>
	</div>

	<!-- Note Editor -->
	<div class="flex-1 overflow-y-auto">
		{#if NoteEditorWithDetection}
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
		{:else}
			<p class="text-small text-secondary">Note editor unavailable</p>
		{/if}
	</div>

	<!-- Footer with metadata -->
	<div class="border-base px-inbox-container py-system-header border-t">
		<div class="text-label text-tertiary flex items-center justify-between">
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
				<span
					class="rounded-chip px-badge py-badge bg-accent-primary text-label text-primary font-medium"
				>
					BLOG
				</span>
			{/if}
		</div>
	</div>
</div>
