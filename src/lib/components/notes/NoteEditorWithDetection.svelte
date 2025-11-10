<script lang="ts">
	import { browser } from '$app/environment';
	import type { EditorView } from 'prosemirror-view';
	import NoteEditor from './NoteEditor.svelte';
	import AIContentDetector from './AIContentDetector.svelte';

	type Props = {
		content?: string;
		title?: string;
		placeholder?: string;
		onContentChange?: (content: string, markdown: string) => void;
		onTitleChange?: (title: string) => void;
		onAIFlagged?: () => void;
		onEscape?: () => void; // Called when ESC is pressed in title or editor
		readonly?: boolean;
		showToolbar?: boolean;
		isAIGenerated?: boolean;
		enableAIDetection?: boolean; // Setting to enable/disable feature
		autoFocus?: boolean; // Control whether to auto-focus title on mount
		compact?: boolean; // Compact mode for modals
	};

	let {
		content = '',
		title = '',
		placeholder = 'Start typing...',
		onContentChange,
		onTitleChange,
		onAIFlagged,
		onEscape,
		readonly = false,
		showToolbar = true,
		isAIGenerated = false,
		enableAIDetection = true,
		autoFocus = false,
		compact = false
	}: Props = $props();

	let showAIDetector = $state(false);
	let detectorPosition = $state<{ x: number; y: number } | undefined>(undefined);
	let editorRef: any = $state(null);

	function handlePaste(text: string, view: any) {
		if (!browser) return;

		// Only show detector if enabled and text is substantial
		if (!enableAIDetection || text.length < 100 || isAIGenerated) {
			return;
		}

		// Get cursor position for menu placement
		const { from } = view.state.selection;
		const coords = view.coordsAtPos(from);

		detectorPosition = {
			x: coords.left,
			y: coords.bottom + 5
		};

		showAIDetector = true;
	}

	function handleAIConfirm() {
		showAIDetector = false;
		onAIFlagged?.();
	}

	function handleAIDismiss() {
		showAIDetector = false;
	}

	// Expose method to focus title (for Enter key activation)
	export function focusTitle() {
		editorRef?.focusTitle();
	}
</script>

<div class="relative w-full {compact ? '' : 'h-full'}">
	{#if browser}
		<NoteEditor
			bind:this={editorRef}
			{content}
			{title}
			{placeholder}
			{onContentChange}
			{onTitleChange}
			onPaste={handlePaste}
			{onEscape}
			{readonly}
			{showToolbar}
			{isAIGenerated}
			{autoFocus}
			{compact}
		/>

		<AIContentDetector
			visible={showAIDetector}
			position={detectorPosition}
			onConfirm={handleAIConfirm}
			onDismiss={handleAIDismiss}
		/>
	{:else}
		<!-- SSR placeholder -->
		<div
			class="h-full min-h-[200px] w-full rounded-input border border-base bg-input px-input-x py-input-y text-tertiary"
		>
			{placeholder}
		</div>
	{/if}
</div>
