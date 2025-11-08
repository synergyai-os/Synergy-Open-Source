<script lang="ts">
	import { fade } from 'svelte/transition';
	import { EditorView } from 'prosemirror-view';

	type Props = {
		visible: boolean;
		position?: { x: number; y: number };
		onConfirm: () => void;
		onDismiss: () => void;
	};

	let { visible = false, position = { x: 0, y: 0 }, onConfirm, onDismiss }: Props = $props();

	// Calculate position to keep menu in viewport
	const menuWidth = 200;
	const menuHeight = 100;
	const adjustedX = $derived(() => {
		if (!position) return 0;
		const maxX = window.innerWidth - menuWidth - 20;
		return Math.min(position.x, maxX);
	});

	const adjustedY = $derived(() => {
		if (!position) return 0;
		const maxY = window.innerHeight - menuHeight - 20;
		return Math.min(position.y, maxY);
	});

	// Handle click outside to dismiss
	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-ai-detector-menu]')) {
			onDismiss();
		}
	}

	// Handle escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onDismiss();
		}
	}

	// Set up event listeners when visible
	$effect(() => {
		if (visible) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);

			return () => {
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

{#if visible}
	<div
		data-ai-detector-menu
		class="fixed z-50 bg-surface border border-divider rounded-md shadow-lg p-section"
		style="left: {adjustedX()}px; top: {adjustedY()}px; width: {menuWidth}px;"
		transition:fade={{ duration: 150 }}
	>
		<p class="text-sm text-surface-secondary mb-section">
			Did you paste AI-generated content?
		</p>

		<div class="flex gap-toolbar-item">
			<button
				type="button"
				onclick={onConfirm}
				class="flex-1 px-button py-button-small bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
			>
				AI Generated
			</button>

			<button
				type="button"
				onclick={onDismiss}
				class="flex-1 px-button py-button-small bg-surface-hover text-surface-primary rounded-md hover:bg-surface-hover-solid transition-colors text-sm"
			>
				Close
			</button>
		</div>

		<!-- Arrow pointer -->
		<div
			class="absolute w-3 h-3 bg-surface border-t border-l border-divider transform rotate-45"
			style="top: -7px; left: 20px;"
		></div>
	</div>
{/if}

<style>
	.gap-toolbar-item {
		gap: 0.5rem;
	}

	.px-button {
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.py-button-small {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.bg-surface {
		background-color: var(--color-bg-surface);
	}

	.border-divider {
		border-color: var(--color-border-divider);
	}

	.text-surface-primary {
		color: var(--color-text-surface-primary);
	}

	.text-surface-secondary {
		color: var(--color-text-surface-secondary);
	}

	.bg-surface-hover {
		background-color: var(--color-bg-surface-hover);
	}

	.bg-surface-hover-solid {
		background-color: var(--color-bg-surface-hover-solid);
	}

	.bg-primary {
		background-color: var(--color-bg-primary);
	}

	.bg-primary-hover {
		background-color: var(--color-bg-primary-hover);
	}
</style>

