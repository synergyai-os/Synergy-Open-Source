<script lang="ts">
	type Props = {
		initialWidth: number;
		minWidth: number;
		maxWidth: number;
		onWidthChange: (width: number) => void;
		onClose?: () => void;
		showHandle?: boolean; // Control when handle is visible
		shouldAnimateOpen?: boolean; // Whether to animate from 0 when opening
		children: import('svelte').Snippet;
	};

	let { initialWidth, minWidth, maxWidth, onWidthChange, onClose, showHandle = true, shouldAnimateOpen = false, children }: Props = $props();

	// Collapse threshold - how many pixels past minWidth before collapsing
	const COLLAPSE_THRESHOLD = 40; // pixels past minWidth to trigger collapse

	let isDragging = $state(false);
	let currentWidth = $state(initialWidth); // Always start at initialWidth - will animate if needed
	let panelElement: HTMLDivElement;
	let startX = 0;
	let startWidth = 0;
	let isCollapsing = $state(false);
	let animationFrameId: number | null = null;
	let hasStartedOpening = $state(false); // Track if we've started the opening animation

	// Smoothly animate when opening from collapsed or when initialWidth changes significantly
	// IMPORTANT: This effect must NOT interfere with drag operations
	$effect(() => {
		// CRITICAL: Always check isDragging first - never modify currentWidth during drag
		if (isDragging) return;
		
		// Also skip if there's an active animation frame (could be from collapse animation)
		if (animationFrameId !== null) return;
		
		// When shouldAnimateOpen becomes true, we need to animate from 0 to initialWidth
		if (shouldAnimateOpen && !hasStartedOpening && initialWidth > 0) {
			hasStartedOpening = true;
			// Reset to 0 to start animation
			currentWidth = 0;
			// Opening from collapsed - animate from 0 to initialWidth
			const startTime = performance.now();
			const duration = 200; // Fast but smooth
			
			function animate(currentTime: number) {
				// Double-check we're not dragging during animation
				if (isDragging) {
					animationFrameId = null;
					return;
				}
				
				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / duration, 1);
				
				// Ease out cubic for smooth deceleration
				const easeProgress = 1 - Math.pow(1 - progress, 3);
				
				currentWidth = 0 + (initialWidth - 0) * easeProgress;
				
				if (progress < 1) {
					animationFrameId = requestAnimationFrame(animate);
				} else {
					animationFrameId = null;
					currentWidth = initialWidth; // Ensure exact width
					onWidthChange(initialWidth);
				}
			}
			
			// Cancel any existing animation
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
			animationFrameId = requestAnimationFrame(animate);
		} else if (!shouldAnimateOpen) {
			// Reset the opening flag when not animating open
			if (hasStartedOpening) {
				hasStartedOpening = false;
			}
			// Only update width if it's a significant change (not just user adjustments)
			if (initialWidth !== currentWidth && initialWidth > 0) {
				// Width change while open - only update if not dragging and change is significant
				// Don't update during drag - let drag handle its own width updates
				const startWidth = currentWidth;
				const targetWidth = initialWidth;
				const widthDiff = Math.abs(targetWidth - startWidth);
				
				// Only animate if it's a significant change (not just small user adjustments)
				if (widthDiff > 50) {
					const startTime = performance.now();
					const duration = 200;
					
					function animate(currentTime: number) {
						// Double-check we're not dragging during animation
						if (isDragging) {
							animationFrameId = null;
							return;
						}
						
						const elapsed = currentTime - startTime;
						const progress = Math.min(elapsed / duration, 1);
						
						const easeProgress = 1 - Math.pow(1 - progress, 3);
						currentWidth = startWidth + (targetWidth - startWidth) * easeProgress;
						
						if (progress < 1) {
							animationFrameId = requestAnimationFrame(animate);
						} else {
							animationFrameId = null;
							currentWidth = targetWidth;
							onWidthChange(targetWidth);
						}
					}
					
					if (animationFrameId !== null) {
						cancelAnimationFrame(animationFrameId);
					}
					animationFrameId = requestAnimationFrame(animate);
				} else if (Math.abs(initialWidth - currentWidth) < 10) {
					// Small difference, just sync it
					currentWidth = initialWidth;
					onWidthChange(initialWidth);
				}
			}
		}
	});

	// Smooth animation for collapse
	function animateCollapse(targetWidth: number, finalWidth: number) {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
		}

		const startTime = performance.now();
		const duration = 200; // ms for smooth collapse animation

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Ease out cubic for smooth deceleration
			const easeProgress = 1 - Math.pow(1 - progress, 3);
			
			currentWidth = targetWidth + (finalWidth - targetWidth) * easeProgress;
			
			// Only update parent width if we're not collapsing (preserve original width when collapsing)
			if (finalWidth > 0) {
				onWidthChange(currentWidth);
			}

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(animate);
			} else {
				animationFrameId = null;
				if (finalWidth <= 0 && onClose) {
					// Don't update width to 0 - preserve the original width
					// Call onClose immediately - let parent handle smooth state transition
					onClose();
				} else if (finalWidth > 0) {
					// Final update for non-collapse animations
					onWidthChange(finalWidth);
				}
			}
		}

		animationFrameId = requestAnimationFrame(animate);
	}

	function startDrag(e: MouseEvent) {
		if (!panelElement) return;

		// CRITICAL: Cancel any ongoing animation FIRST before setting isDragging
		// This prevents the $effect from interfering with drag
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}

		// NOW set dragging state - this will prevent $effect from running
		isDragging = true;
		isCollapsing = false;
		startX = e.clientX;
		startWidth = currentWidth; // Capture current width at drag start
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
			const newWidth = startWidth + deltaX;

			// If dragging left past minimum width, stop at minWidth visually
			if (newWidth < minWidth) {
				// Always keep visual width at minimum - don't show any movement past this
				currentWidth = minWidth;
				
				// Track how far past minimum they've dragged
				const collapseDistance = minWidth - newWidth;
				
				// If past threshold, SNAP and collapse immediately
				if (collapseDistance >= COLLAPSE_THRESHOLD && !isCollapsing) {
					isCollapsing = true;
					// Immediately start collapse animation - don't wait for mouse release
					// Stop dragging and start collapse
					isDragging = false;
					if (typeof document !== 'undefined') {
						document.body.style.cursor = '';
						document.body.style.userSelect = '';
					}
					// Remove event listeners
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
					// Start collapse animation
					animateCollapse(minWidth, 0);
					return; // Exit early - collapse has started
				}
			} else {
				// Normal resizing within bounds
				isCollapsing = false;
				currentWidth = Math.min(maxWidth, newWidth);
				// Update parent width for normal resizing
				onWidthChange(currentWidth);
			}
		}

		function onMouseUp(e: MouseEvent) {
			// If already collapsing, don't do anything (collapse was triggered during drag)
			if (isCollapsing) {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				return;
			}

			isDragging = false;
			if (typeof document !== 'undefined') {
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
			}

			// On release, if not already collapsed, just ensure width is valid
			const finalDeltaX = e.clientX - startX;
			const finalNewWidth = startWidth + finalDeltaX;
			
			if (finalNewWidth < minWidth) {
				// User dragged past minWidth but not far enough to trigger snap - ensure at minWidth
				currentWidth = minWidth;
				onWidthChange(minWidth);
			} else {
				// Already at valid width, just ensure it's clamped
				currentWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth));
				onWidthChange(currentWidth);
			}

			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	// Style binding for the resizable panel with transition
	const style = $derived(`width: ${currentWidth}px; flex-shrink: 0; transition: ${isDragging || animationFrameId !== null ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'};`);
</script>

<!-- Resizable panel wrapper -->
<div bind:this={panelElement} class="resizable-panel" style={style}>
	{@render children()}
	<!-- Resize handle - only show when showHandle is true or when dragging -->
	{#if showHandle || isDragging}
		<button
			type="button"
			class="resize-handle"
			class:active={isDragging}
			onmousedown={startDrag}
			aria-label="Resize panel width"
		></button>
	{/if}
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
		width: 24px; /* Increased from 16px for easier access - more forgiving touch area */
		cursor: col-resize;
		background: transparent;
		border: none;
		padding: 0;
		z-index: 50;
		/* Position handle to straddle the border - shift right by 12px to center on border */
		transform: translateX(12px);
	}

	.resize-handle::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 12px; /* Centered in the 24px handle */
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

