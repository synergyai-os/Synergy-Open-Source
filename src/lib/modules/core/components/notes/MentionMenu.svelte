<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EditorView } from 'prosemirror-view';
	import {
		mentionPluginKey,
		insertMention,
		type MentionItem
	} from '$lib/utils/prosemirror-mentions';

	type Props = {
		editorView: EditorView | null;
	};

	let { editorView }: Props = $props();

	let active = $state(false);
	let items = $state<MentionItem[]>([]);
	let selectedIndex = $state(0);
	let position = $state<{ top: number; left: number } | null>(null);
	let range = $state<{ from: number; to: number } | null>(null);

	function updateMenu() {
		if (!editorView) return;

		const state = mentionPluginKey.getState(editorView.state);
		if (!state) return;

		active = state.active;
		items = state.items;
		range = state.range;

		if (state.active && state.range) {
			// Get position for menu
			const coords = editorView.coordsAtPos(state.range.from);
			position = {
				top: coords.bottom + 5,
				left: coords.left
			};
			selectedIndex = 0;
		} else {
			position = null;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!active || items.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % items.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + items.length) % items.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (items[selectedIndex] && range && editorView) {
				insertMention(editorView, items[selectedIndex], range);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			if (editorView) {
				editorView.dispatch(
					editorView.state.tr.setMeta(mentionPluginKey, {
						active: false,
						range: null,
						query: '',
						items: []
					})
				);
			}
		}
	}

	function handleItemClick(item: MentionItem) {
		if (range && editorView) {
			insertMention(editorView, item, range);
		}
	}

	onMount(() => {
		if (!editorView) return;

		// Update menu on state changes
		const updateInterval = setInterval(updateMenu, 100);

		// Handle keyboard navigation
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			clearInterval(updateInterval);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
	});
</script>

{#if active && position && items.length > 0}
	<div
		class="border-base py-badge rounded-button bg-elevated shadow-card fixed z-50 max-h-[320px] min-w-[280px] overflow-y-auto border"
		style="top: {position.top}px; left: {position.left}px;"
	>
		{#each items as item, index (item.id)}
			<button
				type="button"
				class="text-small hover:bg-hover-solid px-input-x py-input-y flex w-full items-center gap-2 text-left transition-colors {index ===
				selectedIndex
					? 'bg-hover-solid'
					: ''}"
				onclick={() => handleItemClick(item)}
			>
				{#if item.icon}
					<span class="text-body">{item.icon}</span>
				{/if}
				<div class="flex-1">
					<div class="text-primary font-medium">{item.label}</div>
					{#if item.description}
						<div class="text-label text-tertiary">{item.description}</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>
{/if}
