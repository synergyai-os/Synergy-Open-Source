<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView } from 'prosemirror-view';
	import { EditorState, Transaction } from 'prosemirror-state';
	import {
		createEditorState,
		exportEditorJSON,
		isEditorEmpty
	} from '$lib/utils/prosemirror-setup';
	import NoteEditorToolbar from './NoteEditorToolbar.svelte';

	type Props = {
		content?: string; // ProseMirror JSON string
		title?: string;
		placeholder?: string;
		onContentChange?: (content: string, markdown: string) => void;
		onTitleChange?: (title: string) => void;
		onPaste?: (text: string, view: EditorView) => void;
		readonly?: boolean;
		showToolbar?: boolean;
		isAIGenerated?: boolean;
		autoFocus?: boolean; // Control whether to auto-focus title on mount
		compact?: boolean; // Compact mode for modals (no h-full, no flex-1)
	};

	let {
		content = '',
		title = '',
		placeholder = 'Start typing...',
		onContentChange,
		onTitleChange,
		onPaste,
		readonly = false,
		showToolbar = true,
		isAIGenerated = false,
		autoFocus = false,
		compact = false
	}: Props = $props();

	let editorElement: HTMLDivElement;
	let titleElement: HTMLInputElement;
	let editorView: EditorView | null = null;
	let editorState = $state<EditorState | null>(null);
	let localTitle = $state(title);
	let isEmpty = $state(true);

	// Update local title when prop changes
	$effect(() => {
		localTitle = title;
	});

	// Handle title changes with debouncing
	let titleDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
	function handleTitleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		localTitle = target.value;

		if (titleDebounceTimeout) {
			clearTimeout(titleDebounceTimeout);
		}

		titleDebounceTimeout = setTimeout(() => {
			onTitleChange?.(localTitle);
		}, 500);
	}

	// Handle ESC key in title input to blur and allow global shortcuts
	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			const target = e.target as HTMLInputElement;
			target.blur();
			e.preventDefault();
		}
	}

	// Handle content changes with debouncing
	let contentDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
	function handleEditorChange(state: EditorState) {
		editorState = state;
		isEmpty = isEditorEmpty(state);

		if (contentDebounceTimeout) {
			clearTimeout(contentDebounceTimeout);
		}

		contentDebounceTimeout = setTimeout(() => {
			const json = exportEditorJSON(state);
			// TODO: Generate markdown from ProseMirror doc
			const markdown = ''; // Placeholder for now
			onContentChange?.(json, markdown);
		}, 500);
	}

	// Initialize editor
	onMount(() => {
		if (!editorElement) return;

		const state = createEditorState(content || undefined, onPaste);
		editorState = state;
		isEmpty = isEditorEmpty(state);

		editorView = new EditorView(editorElement, {
			state,
			editable: () => !readonly,
			dispatchTransaction(transaction: Transaction) {
				if (!editorView) return;
				const newState = editorView.state.apply(transaction);
				editorView.updateState(newState);
				handleEditorChange(newState);
			},
		});

		// Only focus title on mount if autoFocus is true
		if (autoFocus) {
			titleElement?.focus();
		}

		return () => {
			editorView?.destroy();
			if (titleDebounceTimeout) clearTimeout(titleDebounceTimeout);
			if (contentDebounceTimeout) clearTimeout(contentDebounceTimeout);
		};
	});

	onDestroy(() => {
		editorView?.destroy();
		if (titleDebounceTimeout) clearTimeout(titleDebounceTimeout);
		if (contentDebounceTimeout) clearTimeout(contentDebounceTimeout);
	});

	// Expose editor view for toolbar commands
	export function getEditorView() {
		return editorView;
	}

	// Expose method to focus title (for Enter key activation)
	export function focusTitle() {
		titleElement?.focus();
	}
</script>

<div class="flex flex-col {compact ? '' : 'h-full'} bg-surface text-surface-primary {compact ? '' : 'overflow-hidden'}">
	<!-- AI Generated Badge -->
	{#if isAIGenerated}
		<div class="px-content-padding py-section bg-warning-subtle border-b border-divider">
			<div class="flex items-center gap-icon text-sm text-warning-primary">
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
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<span class="font-medium">AI-Generated Content</span>
			</div>
		</div>
	{/if}

	<!-- Toolbar -->
	{#if showToolbar && editorView}
		<NoteEditorToolbar {editorView} {editorState} />
	{/if}

	<!-- Scrollable Editor Content -->
	<div class="{compact ? '' : 'flex-1 overflow-y-auto'}">
		<div class="max-w-full px-6 py-4">
			<!-- Title Input -->
			<input
				bind:this={titleElement}
				type="text"
				value={localTitle}
				oninput={handleTitleInput}
				onkeydown={handleTitleKeydown}
				placeholder="Issue title"
				disabled={readonly}
				class="w-full text-base font-normal bg-transparent border-none outline-none text-primary placeholder:text-tertiary mb-2 focus:placeholder:text-secondary transition-colors"
			/>

			<!-- ProseMirror Editor with Placeholder Overlay -->
			<div class="relative">
				<div
					bind:this={editorElement}
					class="prose prose-sm prose-neutral dark:prose-invert max-w-none min-h-[60px] max-h-[200px] overflow-y-auto text-secondary"
				></div>
				{#if isEmpty}
					<div class="absolute top-0 left-0 text-sm text-tertiary pointer-events-none">
						{placeholder}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* ProseMirror styling */
	:global(.ProseMirror) {
		outline: none;
		min-height: 400px;
	}

	:global(.ProseMirror p) {
		margin: 1em 0;
	}

	:global(.ProseMirror h1) {
		font-size: 2em;
		font-weight: 700;
		margin: 1em 0 0.5em;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5em;
		font-weight: 600;
		margin: 1em 0 0.5em;
	}

	:global(.ProseMirror h3) {
		font-size: 1.25em;
		font-weight: 600;
		margin: 1em 0 0.5em;
	}

	:global(.ProseMirror ul),
	:global(.ProseMirror ol) {
		padding-left: 1.5em;
		margin: 1em 0;
	}

	:global(.ProseMirror li) {
		margin: 0.5em 0;
	}

	:global(.ProseMirror code) {
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		font-size: 0.9em;
	}

	:global(.dark .ProseMirror code) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	:global(.ProseMirror strong) {
		font-weight: 700;
	}

	:global(.ProseMirror em) {
		font-style: italic;
	}

	:global(.ProseMirror blockquote) {
		border-left: 3px solid currentColor;
		padding-left: 1em;
		margin-left: 0;
		opacity: 0.7;
	}

	/* Ensure empty paragraphs maintain layout */
	:global(.ProseMirror p) {
		min-height: 1.25rem;
	}
</style>

