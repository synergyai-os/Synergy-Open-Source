<!-- eslint-disable synergyos/no-hardcoded-design-values -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	// TODO: Re-enable when EditorView is needed
	// import { EditorView } from 'prosemirror-view';

	type Props = {
		visible: boolean;
		position?: { x: number; y: number };
		onConfirm: () => void;
		onDismiss: () => void;
	};

	let { visible = false, position = { x: 0, y: 0 }, onConfirm, onDismiss }: Props = $props();

	// Calculate position to keep menu in viewport using spacing tokens
	function spacingValue(token: string, fallback: number) {
		if (typeof window === 'undefined') return fallback;
		const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
		const numeric = Number.parseFloat(raw);
		if (!Number.isFinite(numeric)) return fallback;
		return raw.endsWith('rem') ? numeric * 16 : numeric;
	}

	// eslint-disable-next-line synergyos/no-hardcoded-design-values
	const menuWidth = $derived(() => spacingValue('--spacing-52', 208));
	// eslint-disable-next-line synergyos/no-hardcoded-design-values
	const menuHeight = $derived(() => spacingValue('--spacing-24', 96));
	// eslint-disable-next-line synergyos/no-hardcoded-design-values
	const viewportPadding = $derived(() => spacingValue('--spacing-5', 20));
	const arrowOffset = $derived(() => spacingValue('--spacing-5', 20));
	const arrowLift = $derived(() => spacingValue('--spacing-2', 8));
	const adjustedX = $derived(() => {
		if (!position) return 0;
		const maxX = window.innerWidth - menuWidth() - viewportPadding();
		return Math.min(position.x, maxX);
	});

	const adjustedY = $derived(() => {
		if (!position) return 0;
		const maxY = window.innerHeight - menuHeight() - viewportPadding();
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
		class="border-base fixed z-50 rounded-button border bg-surface px-2 py-1 shadow-card"
		transition:fade={{ duration: 150 }}
		style="left: {adjustedX()}px; top: {adjustedY()}px; width: {menuWidth()}px;"
	>
		<p class="text-small mb-content-section text-secondary">Did you paste AI-generated content?</p>

		<div class="flex gap-2">
			<button
				type="button"
				onclick={onConfirm}
				class="text-small flex-1 rounded-button bg-interactive-primary px-button-x py-button-y font-medium text-inverse transition-colors hover:bg-interactive-primaryHover"
			>
				AI Generated
			</button>

			<button
				type="button"
				onclick={onDismiss}
				class="text-small flex-1 rounded-button bg-hover px-button-x py-button-y text-primary transition-colors hover:bg-active"
			>
				Close
			</button>
		</div>

		<!-- Arrow pointer -->
		<div
			class="icon-xs border-base absolute rotate-45 transform border-t border-l bg-surface"
			style="top: -{arrowLift()}px; left: {arrowOffset()}px;"
		></div>
	</div>
{/if}
