<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EditorView } from 'prosemirror-view';
	import { emojiPluginKey, insertEmoji } from './emoji-plugin';

	interface Props {
		editorView: EditorView | null;
	}

	let { editorView }: Props = $props();

	// Curated emoji list with keywords
	const EMOJIS = [
		{ emoji: '✅', keywords: ['check', 'done', 'yes', 'complete', 'tick'] },
		{ emoji: '❌', keywords: ['x', 'no', 'cross', 'wrong', 'error'] },
		{ emoji: '🎯', keywords: ['target', 'goal', 'dart', 'aim'] },
		{ emoji: '💡', keywords: ['bulb', 'idea', 'light', 'think'] },
		{ emoji: '🔥', keywords: ['fire', 'hot', 'flame', 'lit'] },
		{ emoji: '⚡', keywords: ['lightning', 'bolt', 'fast', 'energy'] },
		{ emoji: '🚀', keywords: ['rocket', 'launch', 'ship', 'space'] },
		{ emoji: '💪', keywords: ['muscle', 'strong', 'flex', 'power'] },
		{ emoji: '👍', keywords: ['thumbsup', 'like', 'good', 'yes', 'approve'] },
		{ emoji: '👎', keywords: ['thumbsdown', 'dislike', 'bad', 'no'] },
		{ emoji: '👀', keywords: ['eyes', 'look', 'watch', 'see'] },
		{ emoji: '🎉', keywords: ['party', 'celebrate', 'tada', 'confetti'] },
		{ emoji: '🎊', keywords: ['confetti', 'party', 'celebrate'] },
		{ emoji: '❤️', keywords: ['heart', 'love', 'red'] },
		{ emoji: '💚', keywords: ['green', 'heart', 'love'] },
		{ emoji: '💙', keywords: ['blue', 'heart', 'love'] },
		{ emoji: '⭐', keywords: ['star', 'favorite', 'fav'] },
		{ emoji: '✨', keywords: ['sparkles', 'shine', 'magic'] },
		{ emoji: '🔴', keywords: ['red', 'circle', 'dot'] },
		{ emoji: '🟡', keywords: ['yellow', 'circle', 'dot'] },
		{ emoji: '🟢', keywords: ['green', 'circle', 'dot'] },
		{ emoji: '⚠️', keywords: ['warning', 'caution', 'alert'] },
		{ emoji: '🛑', keywords: ['stop', 'halt', 'octagon'] },
		{ emoji: '📝', keywords: ['memo', 'note', 'write', 'document'] },
		{ emoji: '📚', keywords: ['books', 'library', 'read', 'study'] },
		{ emoji: '📊', keywords: ['chart', 'graph', 'data', 'stats'] },
		{ emoji: '🤖', keywords: ['robot', 'ai', 'bot', 'machine'] },
		{ emoji: '🧠', keywords: ['brain', 'think', 'smart', 'mind'] },
		{ emoji: '💻', keywords: ['laptop', 'computer', 'code', 'dev'] },
		{ emoji: '🔧', keywords: ['wrench', 'tool', 'fix', 'settings'] },
		{ emoji: '🐛', keywords: ['bug', 'insect', 'error'] },
		{ emoji: '🔒', keywords: ['lock', 'secure', 'private', 'locked'] },
		{ emoji: '🔓', keywords: ['unlock', 'open', 'unlocked'] },
		{ emoji: '⏰', keywords: ['clock', 'alarm', 'time'] },
		{ emoji: '⏱️', keywords: ['stopwatch', 'timer', 'time'] },
		{ emoji: '📅', keywords: ['calendar', 'date', 'schedule'] },
		{ emoji: '🎯', keywords: ['target', 'goal', 'focus'] },
		{ emoji: '📍', keywords: ['pin', 'location', 'place', 'marker'] },
		{ emoji: '🔗', keywords: ['link', 'chain', 'url', 'connect'] },
		{ emoji: '📎', keywords: ['paperclip', 'attachment', 'attach'] },
		{ emoji: '🗂️', keywords: ['folder', 'files', 'organize'] },
		{ emoji: '🗃️', keywords: ['archive', 'storage', 'box'] },
		{ emoji: '🔍', keywords: ['search', 'find', 'magnify', 'look'] },
		{ emoji: '🌟', keywords: ['star', 'glow', 'shine', 'glowing'] },
		{ emoji: '💬', keywords: ['chat', 'message', 'talk', 'speech'] },
		{ emoji: '💭', keywords: ['thought', 'think', 'bubble'] },
		{ emoji: '👤', keywords: ['user', 'person', 'profile'] },
		{ emoji: '👥', keywords: ['users', 'people', 'team', 'group'] },
		{ emoji: '🏆', keywords: ['trophy', 'winner', 'award', 'prize'] },
		{ emoji: '🎓', keywords: ['graduation', 'education', 'learn', 'student'] }
	];

	let isVisible = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let coords = $state<{ left: number; top: number } | null>(null);
	let menuElement: HTMLDivElement | null = $state(null);

	let filteredEmojis = $derived.by(() => {
		if (!query) return EMOJIS.slice(0, 10); // Show first 10 if no query
		
		const lowerQuery = query.toLowerCase();
		return EMOJIS.filter(({ keywords }) =>
			keywords.some(keyword => keyword.startsWith(lowerQuery))
		).slice(0, 10); // Limit to 10 results
	});

	// Update menu state from plugin (polling pattern - matches MentionMenu)
	function updateMenu() {
		if (!editorView) return;

		const state = emojiPluginKey.getState(editorView.state);
		if (!state) return;

		if (state.active) {
			isVisible = true;
			query = state.query;
			selectedIndex = 0; // Reset selection on query change
			
			// Calculate coords
			const domCoords = editorView.coordsAtPos(state.from);
			coords = {
				left: domCoords.left,
				top: domCoords.bottom + 5
			};
		} else {
			isVisible = false;
			coords = null;
		}
	}

	function selectEmoji(emoji: string) {
		if (editorView) {
			insertEmoji(editorView, emoji);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!isVisible) return;

		const items = filteredEmojis;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % items.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + items.length) % items.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (items[selectedIndex]) {
				selectEmoji(items[selectedIndex].emoji);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			if (editorView) {
				const tr = editorView.state.tr.setMeta('deactivateEmoji', true);
				editorView.dispatch(tr);
			}
		}
	}

	onMount(() => {
		if (!editorView) return;

		// Update menu on state changes (polling pattern - matches MentionMenu)
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

{#if isVisible && coords}
	<div
		bind:this={menuElement}
		class="emoji-menu"
		style:left="{coords.left}px"
		style:top="{coords.top}px"
	>
		{#if filteredEmojis.length === 0}
			<div class="emoji-menu-item empty">No emojis found</div>
		{:else}
			{#each filteredEmojis as { emoji, keywords }, i}
				<button
					type="button"
					class="emoji-menu-item"
					class:selected={i === selectedIndex}
					onclick={() => selectEmoji(emoji)}
					onmouseenter={() => (selectedIndex = i)}
				>
					<span class="emoji">{emoji}</span>
					<span class="keywords">{keywords[0]}</span>
				</button>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.emoji-menu {
		position: fixed;
		z-index: 9999;
		background: var(--color-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		overflow-y: auto;
		max-height: 300px;
		min-width: 200px;
	}

	.emoji-menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		border: none;
		background: transparent;
		width: 100%;
		text-align: left;
		transition: background-color 0.1s ease;
	}

	.emoji-menu-item:hover,
	.emoji-menu-item.selected {
		background: var(--color-hover-solid);
	}

	.emoji-menu-item.empty {
		color: var(--color-text-tertiary);
		cursor: default;
	}

	.emoji-menu-item.empty:hover {
		background: transparent;
	}

	.emoji {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.keywords {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>

