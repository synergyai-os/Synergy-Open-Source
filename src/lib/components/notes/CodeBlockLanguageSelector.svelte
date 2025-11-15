<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EditorView } from 'prosemirror-view';
	import { SUPPORTED_LANGUAGES, setCodeBlockLanguage } from '$lib/utils/prosemirror-codeblock';

	type Props = {
		editorView: EditorView | null;
	};

	let { editorView }: Props = $props();

	let showSelector = $state(false);
	let position = $state<{ top: number; left: number } | null>(null);
	let currentPos = $state<number | null>(null);
	let currentLanguage = $state<string | null>(null);
	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	const filteredLanguages = $derived(
		searchQuery
			? SUPPORTED_LANGUAGES.filter((lang) =>
					lang.label.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: SUPPORTED_LANGUAGES
	);

	function handleLanguageChange(event: CustomEvent) {
		const { pos, currentLanguage: lang } = event.detail;
		currentPos = pos;
		currentLanguage = lang;

		// Get position of the badge
		if (editorView) {
			const coords = editorView.coordsAtPos(pos);
			position = {
				top: coords.bottom + 5,
				left: coords.left
			};
		}

		showSelector = true;
		searchQuery = '';
		// Focus input after selector shows
		setTimeout(() => {
			searchInput?.focus();
		}, 0);
	}

	function selectLanguage(language: string) {
		if (editorView && currentPos !== null) {
			setCodeBlockLanguage(editorView, currentPos, language);
		}
		close();
	}

	function close() {
		showSelector = false;
		position = null;
		currentPos = null;
		searchQuery = '';
	}

	function handleClickOutside(event: MouseEvent) {
		if (showSelector && !(event.target as HTMLElement).closest('.code-language-selector')) {
			close();
		}
	}

	onMount(() => {
		if (!editorView) return;

		const editorDom = editorView.dom;
		editorDom.addEventListener('codeblock-language-change', handleLanguageChange as EventListener);
		document.addEventListener('click', handleClickOutside);

		return () => {
			editorDom.removeEventListener(
				'codeblock-language-change',
				handleLanguageChange as EventListener
			);
			document.removeEventListener('click', handleClickOutside);
		};
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});
</script>

{#if showSelector && position}
	<div
		class="code-language-selector fixed z-50 max-h-[300px] min-w-[200px] overflow-y-auto rounded-md border border-base bg-elevated shadow-lg"
		style="top: {position.top}px; left: {position.left}px;"
	>
		<div class="border-b border-base p-2">
			<input
				type="text"
				bind:value={searchQuery}
				bind:this={searchInput}
				placeholder="Search languages..."
				class="w-full rounded-md border border-base bg-base px-2 py-1 text-sm text-primary placeholder:text-tertiary focus:ring-1 focus:ring-accent-primary focus:outline-none"
			/>
		</div>
		<div class="py-1">
			{#each filteredLanguages as lang (lang.value)}
				<button
					type="button"
					class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-hover-solid {lang.value ===
					currentLanguage
						? 'bg-hover-solid'
						: ''}"
					onclick={() => selectLanguage(lang.value)}
				>
					<span class="flex-1 text-primary">{lang.label}</span>
					{#if lang.value === currentLanguage}
						<span class="text-accent-primary">✓</span>
					{/if}
				</button>
			{/each}
			{#if filteredLanguages.length === 0}
				<div class="px-3 py-2 text-sm text-tertiary">No languages found</div>
			{/if}
		</div>
	</div>
{/if}
