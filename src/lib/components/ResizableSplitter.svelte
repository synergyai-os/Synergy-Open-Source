<script lang="ts">
	type Props = {
		initialWidth: number;
		minWidth: number;
		maxWidth: number;
		onWidthChange: (width: number) => void;
		onClose?: () => void;
		children: import('svelte').Snippet;
	};

	let { initialWidth, minWidth, maxWidth, onWidthChange, onClose, children }: Props = $props();

	let isDragging = $state(false);
	let currentWidth = $state(initialWidth);
	let panelElement: HTMLDivElement;
	let startX = 0;
	let startWidth = 0;

	function startDrag(e: MouseEvent) {
		if (!panelElement) return;

		isDragging = true;
		startX = e.clientX;
		startWidth = currentWidth;
		e.preventDefault();
		e.stopPropagation();

		// Add global cursor style during drag
		if (typeof document !== 'undefined') {
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		}

		function onMouseMove(e: MouseEvent) {
			if (!isDragging) return;

			const deltaX = e.clientX - startX;
			const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
			currentWidth = newWidth;
			onWidthChange(newWidth);
		}

		function onMouseUp() {
			isDragging = false;
			if (typeof document !== 'undefined') {
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
			}

			// If dragged to minimum width, trigger close callback
			if (currentWidth === minWidth && onClose) {
				onClose();
			}

			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	// Style binding for the resizable panel
	const style = $derived(`width: ${currentWidth}px; flex-shrink: 0;`);
</script>

<!-- Resizable panel wrapper -->
<div bind:this={panelElement} class="resizable-panel" style={style}>
	{@render children()}
	<!-- Resize handle -->
	<button
		type="button"
		class="resize-handle"
		class:active={isDragging}
		onmousedown={startDrag}
		aria-label="Resize panel width"
	></button>
</div>

<style>
	.resizable-panel {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.resize-handle {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: 16px;
		cursor: col-resize;
		background: transparent;
		border: none;
		padding: 0;
		z-index: 50;
		/* Position handle to straddle the border - shift right by 8px */
		transform: translateX(8px);
	}

	.resize-handle::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 8px;
		width: 3px;
		/* Transparent by default - only shows on hover/drag */
		background: transparent;
	}

	.resize-handle:hover::after {
		/* Show blue accent color on hover */
		background: var(--color-accent-primary, oklch(55.4% 0.218 251.813));
	}

	.resize-handle.active::after {
		/* Show blue accent color when dragging */
		background: var(--color-accent-primary, oklch(55.4% 0.218 251.813));
	}
</style>

