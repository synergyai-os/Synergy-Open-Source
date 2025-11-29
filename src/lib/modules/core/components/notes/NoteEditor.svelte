<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy, untrack } from 'svelte';
	import { EditorView } from 'prosemirror-view';
	import type { EditorState, Transaction } from 'prosemirror-state';
	import { createEditorState, exportEditorJSON, isEditorEmpty } from '$lib/utils/prosemirror-setup';
	import { createMentionPlugin, type MentionItem } from '$lib/utils/prosemirror-mentions';
	import {
		createCodeBlockPlugin,
		createSyntaxHighlightPlugin
	} from '$lib/utils/prosemirror-codeblock';
	import { createEmojiPlugin } from './prosemirror/emoji-plugin';
	import NoteEditorToolbar from './NoteEditorToolbar.svelte';
	import MentionMenu from './MentionMenu.svelte';
	import EmojiMenu from './prosemirror/EmojiMenu.svelte';
	import CodeBlockLanguageSelector from './CodeBlockLanguageSelector.svelte';

	type Props = {
		content?: string; // ProseMirror JSON string
		title?: string;
		placeholder?: string;
		onContentChange?: (content: string, markdown: string) => void;
		onTitleChange?: (title: string) => void;
		onPaste?: (text: string, view: EditorView) => void;
		onEscape?: () => void; // Called when ESC is pressed in title or editor (after blur)
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
		onEscape,
		readonly = false,
		showToolbar = true,
		isAIGenerated = false,
		autoFocus = false,
		compact = false
	}: Props = $props();

	let editorElement: HTMLDivElement;
	let titleElement: HTMLInputElement;
	let editorView = $state<EditorView | null>(null);
	let editorState = $state<EditorState | null>(null);
	// Use writable $derived instead of $state + $effect (Svelte 5 best practice)
	// localTitle can be written to directly, and resets to title when prop changes
	let localTitle = $derived(title);
	let isEmpty = $state(true);
	let isFocused = $state(false);

	// Mention items (can be customized later)
	const mentionItems: MentionItem[] = [
		{ id: 'randy', label: 'Randy', icon: '👤', description: 'Mention Randy' },
		{ id: 'project', label: 'project', icon: '📁', description: 'Reference a project' },
		{ id: 'todo', label: 'todo', icon: '✅', description: 'Add a todo item' },
		{ id: 'note', label: 'note', icon: '📝', description: 'Link to a note' },
		{ id: 'date', label: 'date', icon: '📅', description: 'Insert date' }
	];

	const mentionPlugin = createMentionPlugin(mentionItems);
	const emojiPlugin = createEmojiPlugin();
	const syntaxHighlightPlugin = createSyntaxHighlightPlugin();
	const codeBlockPlugin = createCodeBlockPlugin();

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
			e.stopPropagation(); // Prevent modal from closing

			// Notify parent (modal) to refocus itself
			onEscape?.();
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

		const state = createEditorState(
			content || undefined,
			onPaste,
			onEscape,
			mentionPlugin,
			syntaxHighlightPlugin,
			codeBlockPlugin,
			emojiPlugin
		);
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
			handleDOMEvents: {
				focus: () => {
					untrack(() => {
						isFocused = true;
					});
					return false;
				},
				blur: () => {
					untrack(() => {
						isFocused = false;
					});
					return false;
				}
			}
		});

		// Only focus title on mount if autoFocus is true
		// Use setTimeout to ensure it happens after any modal animations/other focus events
		if (autoFocus) {
			setTimeout(() => {
				titleElement?.focus();
			}, 100);
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

<div
	class="flex flex-col {compact ? '' : 'h-full'} text-surface-primary {compact
		? ''
		: 'overflow-hidden'}"
>
	<!-- AI Generated Badge -->
	{#if isAIGenerated}
		<div class="bg-warning-subtle border-divider px-content-padding border-b py-1">
			<div class="text-warning-primary text-small flex items-center gap-2">
				<svg
					class="icon-sm"
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
	<div class={compact ? '' : 'flex-1 overflow-y-auto'}>
		<div class="px-inbox-container pt-content-section pb-content-padding max-w-full">
			<!-- Title Input -->
			<input
				bind:this={titleElement}
				type="text"
				value={localTitle}
				oninput={handleTitleInput}
				onkeydown={handleTitleKeydown}
				placeholder="Note title"
				disabled={readonly}
				class="mb-content-section text-h3 w-full border-none bg-transparent p-0 font-semibold text-primary transition-colors outline-none placeholder:text-tertiary focus:placeholder:text-tertiary"
			/>

			<!-- ProseMirror Editor with Placeholder Overlay -->
			<div class="relative">
				<div
					bind:this={editorElement}
					class="prose prose-sm prose-neutral dark:prose-invert prose-p:my-0 prose-p:leading-relaxed min-h-[60px] max-w-none text-secondary {compact
						? 'max-h-[60vh] overflow-y-auto'
						: ''}"
				></div>
				{#if isEmpty && !isFocused}
					<div class="text-small pointer-events-none absolute top-0 left-0 text-tertiary">
						{placeholder}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Plugin Menus - only render client-side when editor is ready -->
	{#if browser && editorView}
		<MentionMenu {editorView} />
		<EmojiMenu {editorView} />
		<CodeBlockLanguageSelector {editorView} />
	{/if}
</div>

<style>
	/* ProseMirror styling */
	:global(.ProseMirror) {
		outline: none;
		min-height: 400px;
		padding: 0;
		white-space: pre-wrap;
	}

	:global(.ProseMirror p) {
		margin: 1em 0;
	}

	/* Ensure first paragraph aligns with title */
	:global(.ProseMirror > p:first-child) {
		margin-top: 0;
	}

	:global(.ProseMirror > *:first-child) {
		margin-top: 0;
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

	/* Regular bullet lists - exclude task lists */
	:global(.ProseMirror ul:not(.task-list)) {
		list-style-type: disc;
	}

	/* Ordered lists */
	:global(.ProseMirror ol) {
		list-style-type: decimal;
	}

	/* List items - default styling */
	:global(.ProseMirror li) {
		margin: 0.1em 0;
	}

	/* Regular list items - ensure markers are visible */
	:global(.ProseMirror ul:not(.task-list) > li) {
		display: list-item;
		list-style-type: disc;
	}

	:global(.ProseMirror ol > li) {
		display: list-item;
		list-style-type: decimal;
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

	/* Task list styling */
	:global(.ProseMirror ul.task-list) {
		list-style: none;
		padding-left: 0;
		margin: 1em 0;
	}

	:global(.ProseMirror .task-item) {
		display: flex;
		align-items: flex-start;
		gap: 0.5em;
		margin: 0.1em 0;
	}

	:global(.ProseMirror .task-item-checkbox) {
		margin-top: 0.3em;
		cursor: pointer;
		flex-shrink: 0;
		/* Prevent checkbox from affecting text selection */
		pointer-events: auto;
	}

	:global(.ProseMirror .task-item-content) {
		flex: 1;
		min-width: 0; /* Allows text to wrap properly */
		/* Text is editable, clicks go to ProseMirror */
		cursor: text;
	}

	:global(.ProseMirror .task-item-content p) {
		display: inline;
		margin: 0;
	}

	/* Ensure empty paragraphs maintain layout */
	:global(.ProseMirror p) {
		min-height: 1.25rem;
	}

	/* Code block styling using design tokens */
	:global(.ProseMirror pre) {
		position: relative;
		background-color: var(--color-code-bg);
		border: 1px solid var(--color-border-base);
		border-radius: 6px;
		padding: 32px 12px 12px 12px;
		margin: 16px 0;
		overflow-x: auto;
		font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
		font-size: 13px;
		line-height: 1.6;
		color: var(--color-code-text);
	}

	:global(.ProseMirror pre code) {
		background: none;
		padding: 0;
		border: none;
		font-size: inherit;
		color: inherit;
	}

	/* Syntax highlighting colors using design tokens */
	:global(.ProseMirror .hljs-keyword),
	:global(.ProseMirror .hljs-selector-tag),
	:global(.ProseMirror .hljs-doctag),
	:global(.ProseMirror .hljs-name),
	:global(.ProseMirror .hljs-strong) {
		color: var(--color-code-keyword);
		font-weight: bold;
	}

	:global(.ProseMirror .hljs-string),
	:global(.ProseMirror .hljs-attribute),
	:global(.ProseMirror .hljs-literal),
	:global(.ProseMirror .hljs-template-tag),
	:global(.ProseMirror .hljs-template-variable),
	:global(.ProseMirror .hljs-type) {
		color: var(--color-code-string);
	}

	:global(.ProseMirror .hljs-number),
	:global(.ProseMirror .hljs-meta) {
		color: var(--color-code-number);
	}

	:global(.ProseMirror .hljs-comment),
	:global(.ProseMirror .hljs-quote) {
		color: var(--color-code-comment);
		font-style: italic;
	}

	:global(.ProseMirror .hljs-function),
	:global(.ProseMirror .hljs-class),
	:global(.ProseMirror .hljs-title),
	:global(.ProseMirror .hljs-section),
	:global(.ProseMirror .hljs-title.class_) {
		color: var(--color-code-function);
	}

	:global(.ProseMirror .hljs-variable),
	:global(.ProseMirror .hljs-attr) {
		color: var(--color-code-variable);
	}

	:global(.ProseMirror .hljs-tag) {
		color: var(--color-code-tag);
	}

	:global(.ProseMirror .hljs-regexp),
	:global(.ProseMirror .hljs-link) {
		color: var(--color-code-string);
	}

	/* Language badge using design tokens */
	:global(.code-block-language-badge) {
		position: absolute;
		top: 6px;
		right: 8px;
		padding: 2px 8px;
		background-color: var(--color-code-badge-bg);
		border: 1px solid var(--color-border-base);
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		text-transform: uppercase;
		color: var(--color-code-badge-text);
		cursor: pointer;
		transition: all 0.2s;
		user-select: none;
		z-index: 1;
	}

	:global(.code-block-language-badge:hover) {
		background-color: var(--color-bg-hover-solid);
		color: var(--color-text-primary);
	}

	/* Mention query highlighting */
	:global(.mention-query) {
		background-color: rgba(99, 102, 241, 0.1);
		border-radius: 3px;
		padding: 0 2px;
	}
</style>
