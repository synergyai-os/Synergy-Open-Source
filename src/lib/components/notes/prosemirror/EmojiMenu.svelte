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
	let range = $state<{ from: number; to: number } | null>(null);

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
		if (!state) {
			return;
		}

		if (state.active) {
			isVisible = true;
			query = state.query;
			selectedIndex = 0; // Reset selection on query change
			
			// Store range for emoji insertion
			range = { from: state.from, to: state.to };
			
			// Calculate coords
			const domCoords = editorView.coordsAtPos(state.from);
			coords = {
				left: domCoords.left,
				top: domCoords.bottom + 5
			};
		} else {
			isVisible = false;
			coords = null;
			range = null;
		}
	}

	function selectEmoji(emoji: string) {
		if (editorView && range) {
			insertEmoji(editorView, emoji, range.from, range.to);
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
		role="listbox"
		aria-label="Emoji picker"
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
					role="option"
					aria-selected={i === selectedIndex}
				>
					<span class="emoji" aria-hidden="true">{emoji}</span>
					<span class="keywords">{keywords[0]}</span>
				</button>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.emoji-menu {
		position: fixed;
		z-index: 10000;
		
		/* Solid backdrop - no transparency */
		background: rgb(255, 255, 255);
		backdrop-filter: blur(8px);
		
		/* Strong border for visual separation */
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 8px;
		
		/* Layered shadow for depth */
		box-shadow: 
			0 0 0 1px rgba(0, 0, 0, 0.04),
			0 4px 6px -1px rgba(0, 0, 0, 0.08),
			0 10px 15px -3px rgba(0, 0, 0, 0.10),
			0 20px 25px -5px rgba(0, 0, 0, 0.08);
		
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 280px;
		width: 220px;
		padding: 4px 0;
		animation: slideIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
	}
	
	/* Scrollbar styling */
	.emoji-menu::-webkit-scrollbar {
		width: 6px;
	}
	
	.emoji-menu::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.emoji-menu::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.15);
		border-radius: 3px;
	}
	
	.emoji-menu::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.25);
	}
	
	:global(.dark) .emoji-menu::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
	}
	
	:global(.dark) .emoji-menu::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.25);
	}
	
	/* Dark mode support */
	:global(.dark) .emoji-menu {
		background: rgb(30, 30, 30);
		border-color: rgba(255, 255, 255, 0.12);
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.08),
			0 4px 6px -1px rgba(0, 0, 0, 0.4),
			0 10px 15px -3px rgba(0, 0, 0, 0.5),
			0 20px 25px -5px rgba(0, 0, 0, 0.4);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.emoji-menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 10px;
		cursor: pointer;
		border: none;
		background: transparent;
		width: 100%;
		text-align: left;
		transition: all 0.1s cubic-bezier(0.16, 1, 0.3, 1);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		border-left: 2px solid transparent;
	}

	.emoji-menu-item:hover {
		background: rgba(0, 0, 0, 0.04);
	}

	.emoji-menu-item.selected {
		background: rgba(99, 102, 241, 0.08);
		border-left-color: rgb(99, 102, 241);
	}
	
	:global(.dark) .emoji-menu-item:hover {
		background: rgba(255, 255, 255, 0.06);
	}
	
	:global(.dark) .emoji-menu-item.selected {
		background: rgba(99, 102, 241, 0.15);
		border-left-color: rgb(129, 140, 248);
	}

	.emoji-menu-item.empty {
		color: var(--color-text-tertiary);
		cursor: default;
		font-size: 13px;
		padding: 12px;
		text-align: center;
	}

	.emoji-menu-item.empty:hover {
		background: transparent;
	}

	.emoji {
		font-size: 18px;
		line-height: 1;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.keywords {
		font-size: 13px;
		line-height: 1.5;
		color: rgba(0, 0, 0, 0.65);
		font-weight: 400;
		letter-spacing: -0.005em;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.emoji-menu-item.selected .keywords {
		color: rgba(0, 0, 0, 0.9);
		font-weight: 500;
	}
	
	:global(.dark) .keywords {
		color: rgba(255, 255, 255, 0.65);
	}
	
	:global(.dark) .emoji-menu-item.selected .keywords {
		color: rgba(255, 255, 255, 0.95);
	}
</style>

