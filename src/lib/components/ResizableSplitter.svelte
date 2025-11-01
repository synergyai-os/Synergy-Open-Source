<script lang="ts">
	type Props = {
		initialWidth: number;
		minWidth: number;
		maxWidth: number;
		onWidthChange: (width: number) => void;
		children: import('svelte').Snippet;
	};

	let { initialWidth, minWidth, maxWidth, onWidthChange, children }: Props = $props();

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
	}

	.resize-handle {
		position: absolute;
		top: 0;
		right: 0;
		width: 4px;
		height: 100%;
		cursor: col-resize;
		background: transparent;
		border: none;
		padding: 0;
		transition: background-color 0.2s;
		z-index: 10;
	}

	.resize-handle:hover {
		background: #3b82f6;
	}

	.resize-handle.active {
		background: #2563eb;
	}
</style>

