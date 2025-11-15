<script lang="ts">
	import type { PageData } from './$types';
	import { sanitizeHtml } from '$lib/utils/htmlSanitize';

	let { data }: { data: PageData } = $props();

	// Parse ProseMirror JSON to extract title and markdown
	// Note: data.note may be null, and TypeScript needs type narrowing for NoteWithDetails
	import type { NoteWithDetails } from '$lib/types/convex';
	const note = data.note as NoteWithDetails | null;
	let title = $derived(note?.title || 'Untitled Note');
	let markdown = $derived(note?.contentMarkdown || '');
	let sanitizedMarkdown = $derived(sanitizeHtml(markdown));
	let createdAt = $derived(note?.createdAt ? new Date(note.createdAt).toLocaleDateString() : '');
</script>

<svelte:head>
	<title>{title} | Dev Docs</title>
</svelte:head>

<div class="note-page">
	<header class="note-header">
		<h1>{title}</h1>
		{#if createdAt}
			<p class="text-secondary">Created: {createdAt}</p>
		{/if}
		{#if note?.isAIGenerated}
			<span class="ai-badge">AI Generated</span>
		{/if}
	</header>

	<article class="note-content">
		{@html sanitizedMarkdown}
	</article>
</div>

<style>
	.note-page {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--spacing-content);
	}

	.note-header {
		margin-bottom: var(--spacing-section);
		padding-bottom: var(--spacing-content);
		border-bottom: 1px solid var(--color-border);
	}

	.note-header h1 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text-primary);
	}

	.text-secondary {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.ai-badge {
		display: inline-block;
		margin-top: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--color-accent);
		color: white;
		border-radius: 4px;
		font-size: var(--font-size-sm);
	}

	.note-content {
		line-height: 1.6;
		color: var(--color-text-primary);
	}

	.note-content :global(h2) {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.note-content :global(h3) {
		margin-top: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
	}

	.note-content :global(p) {
		margin-bottom: var(--spacing-md);
	}

	.note-content :global(code) {
		background-color: var(--color-surface);
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
	}

	.note-content :global(pre) {
		background-color: var(--color-surface);
		padding: var(--spacing-md);
		border-radius: 6px;
		overflow-x: auto;
		margin-bottom: var(--spacing-md);
	}
</style>
