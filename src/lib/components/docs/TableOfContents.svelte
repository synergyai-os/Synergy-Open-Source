<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { spring } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';
	
	type Props = {
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { headings = [] }: Props = $props();
	
	let activeId = $state('');
	let isOpen = $state(false); // Default to closed
	let isHovering = $state(false);
	let isManuallyNavigating = $state(false);
	
	// Spring physics for smooth, organic animations
	let panelScale = spring(1, { stiffness: 0.3, damping: 0.8 });
	let panelOpacity = spring(1, { stiffness: 0.2, damping: 0.9 });
	
	// React to hover state with spring physics
	$effect(() => {
		if (isHovering && !isOpen) {
			panelScale.set(1.02);
			panelOpacity.set(1);
		} else {
			panelScale.set(1);
			panelOpacity.set(isOpen ? 1 : 0.95);
		}
	});
	
	// Reset active ID when headings change (new page)
	$effect(() => {
		if (headings.length > 0) {
			console.log('[TOC] Headings extracted:', headings.map(h => ({ id: h.id, text: h.text.substring(0, 30) })));
			activeId = headings[0]?.id || '';
			isManuallyNavigating = false; // Reset manual navigation flag on new page
		}
	});
	
	// Scroll tracking for active heading
	$effect(() => {
		if (!browser || headings.length === 0) return;
		
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Only update if intersecting AND not manually navigating
					if (entry.isIntersecting && !isManuallyNavigating) {
						console.log('[TOC] IntersectionObserver update:', entry.target.id);
						activeId = entry.target.id;
					} else if (entry.isIntersecting && isManuallyNavigating) {
						console.log('[TOC] IntersectionObserver ignored (manual nav):', entry.target.id);
					}
				});
			},
			{ rootMargin: '-100px 0px -66%' }
		);
		
		// Observe all headings
		const headingElements = document.querySelectorAll('.docs-article h1, .docs-article h2, .docs-article h3, .docs-article h4');
		headingElements.forEach((el) => {
			if (el.id) observer.observe(el);
		});
		
		return () => {
			headingElements.forEach((el) => observer.unobserve(el));
		};
	});
	
	function toggle() {
		isOpen = !isOpen;
	}
	
	// Update active ID when TOC link is clicked
	function handleTocClick(id: string, text: string) {
		console.log('[TOC] Clicked:', { id, text, currentActive: activeId });
		activeId = id;
		isManuallyNavigating = true;
		console.log('[TOC] New active (manual):', activeId);
		
		// Resume auto-tracking after scroll completes
		setTimeout(() => {
			isManuallyNavigating = false;
			console.log('[TOC] Resumed auto-tracking');
		}, 1000);
	}
	
	// Show full content when: open OR (closed + hovering)
	const shouldShowContent = $derived(isOpen || (!isOpen && isHovering));
</script>

{#if headings.length > 0}
	<aside 
		class="toc-panel"
		class:open={isOpen}
		class:collapsed={!isOpen}
		style="transform: scale({$panelScale}); opacity: {$panelOpacity};"
		onmouseenter={() => isHovering = true}
		onmouseleave={() => isHovering = false}
	>
		{#if shouldShowContent}
			<nav class="toc" in:fly={{ x: -20, duration: 300, delay: 100 }} out:fade={{ duration: 200 }}>
				<div class="toc-header-row">
					<h4 class="toc-header">On This Page</h4>
					<button 
						type="button"
						class="toc-toggle"
						onclick={toggle}
						aria-label={isOpen ? 'Close table of contents' : 'Open table of contents'}
					>
						{#if isOpen}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 6L8 10L4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{:else}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>
				</div>
				
				<ul class="toc-list">
					{#each headings as heading, i}
						<li 
							class="toc-item level-{heading.level}"
							in:fly={{ y: 10, duration: 300, delay: 150 + (i * 30) }}
						>
							<a
								href="#{heading.id}"
								class="toc-link"
								class:active={activeId === heading.id}
								onclick={() => handleTocClick(heading.id, heading.text)}
							>
								{heading.text}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{:else}
			<!-- Collapsed state: mini outline stripes with staggered entrance -->
			<button 
				type="button"
				class="toc-collapsed-outline"
				onclick={toggle}
				aria-label="Open table of contents"
			>
				{#each headings.slice(0, 8) as heading, i}
					<div 
						class="toc-stripe level-{heading.level}"
						class:active={activeId === heading.id}
						style="animation-delay: {i * 40}ms;"
						in:fly={{ x: 10, duration: 400, delay: i * 40 }}
					></div>
				{/each}
			</button>
		{/if}
	</aside>
{/if}

<style>
	/* Floating TOC Panel - functional, subtle */
	.toc-panel {
		position: fixed;
		left: 280px;
		top: calc(6rem + 100px);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		transition: all 0.25s ease-out;
		z-index: 10;
	}
	
	/* Open state: full width with generous padding */
	.toc-panel.open {
		width: 260px;
		padding: calc(var(--spacing-content-padding) * 1.5);
		top: 3rem;
		background: var(--color-bg-elevated);
		backdrop-filter: blur(8px);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
	}
	
	/* Collapsed state: generous spacing for luxury feel */
	.toc-panel.collapsed {
		width: 48px;
		height: auto;
		padding: calc(var(--spacing-content-padding) * 1.5) calc(var(--spacing-content-padding) * 0.5);
		background: transparent;
		border: none;
		box-shadow: none;
	}
	
	/* Collapsed + hovering: expand with subtle glass and generous padding */
	.toc-panel.collapsed:hover {
		width: 260px;
		height: auto;
		padding: calc(var(--spacing-content-padding) * 1.5);
		top: 3rem;
		background: var(--color-bg-elevated);
		backdrop-filter: blur(8px);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		transition: all 0.25s ease-out;
	}
	
	/* Collapsed outline stripes - generous spacing for luxury */
	.toc-collapsed-outline {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 10px;
		padding: 0;
		width: 100%;
		height: auto;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: gap 0.2s ease-out;
	}
	
	.toc-collapsed-outline:hover {
		background: transparent;
	}
	
	/* Individual stripe - functional hierarchy */
	.toc-stripe {
		height: 3px;
		background: var(--color-text-tertiary);
		border-radius: 2px;
		transition: all 0.2s ease-out;
		opacity: 0.4;
	}
	
	/* Width based on heading level - luxurious hierarchy with breathing room (40% smaller) */
	.toc-stripe.level-1 {
		width: 22px;
		height: 3.5px;
		opacity: 0.5;
	}
	
	.toc-stripe.level-2 {
		width: 19px;
		opacity: 0.45;
	}
	
	.toc-stripe.level-3 {
		width: 14px;
		opacity: 0.4;
	}
	
	.toc-stripe.level-4 {
		width: 11px;
		height: 2.5px;
		opacity: 0.35;
	}
	
	/* Active stripe - clear indication with subtle pulse */
	.toc-stripe.active {
		background: var(--color-accent-primary);
		opacity: 1;
		height: 3.5px;
		animation: pulse 2s ease-in-out infinite;
	}
	
	/* Hover - subtle feedback with micro-scale */
	.toc-collapsed-outline:hover .toc-stripe {
		opacity: 0.6;
		transform: scaleX(1.05);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	
	.toc-collapsed-outline:hover .toc-stripe.active {
		opacity: 1;
		transform: scaleX(1.08);
	}
	
	/* Premium keyframe animations */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.85;
		}
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	/* Staggered entrance animation */
	.toc-stripe {
		animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}
	
	.toc {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.toc-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-border-base);
	}
	
	.toc-header {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-primary);
		margin: 0;
		opacity: 0.9;
	}
	
	.toc-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: var(--color-text-tertiary);
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0.7;
	}
	
	.toc-toggle:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-secondary);
		opacity: 1;
	}
	
	.toc-list {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		max-height: calc(100vh - 200px);
		overflow-y: auto;
		padding-right: 0.25rem;
	}
	
	.toc-item {
		list-style: none;
	}
	
	.toc-link {
		display: block;
		font-size: 0.8125rem;
		line-height: 1.6;
		font-weight: 400;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-left: 2px solid transparent;
		padding: 0.375rem 0.75rem 0.375rem 0.875rem;
		transition: all 0.15s ease;
		border-radius: 0.25rem;
		opacity: 0.75;
	}
	
	.toc-link:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-hover);
		border-left-color: transparent;
		opacity: 1;
	}
	
	.toc-link.active {
		color: var(--color-accent-primary);
		border-left-color: var(--color-accent-primary);
		font-weight: 500;
		background: transparent;
		opacity: 1;
	}
	
	/* Indent levels - subtle hierarchy */
	.level-2 .toc-link {
		padding-left: 0.875rem;
		font-size: 0.8125rem;
	}
	
	.level-3 .toc-link {
		padding-left: 1.5rem;
		font-size: 0.8125rem;
		opacity: 0.75;
	}
	
	.level-4 .toc-link {
		padding-left: 2rem;
		font-size: 0.8125rem;
		opacity: 0.7;
	}
	
	/* Hide on small screens */
	@media (max-width: 1280px) {
		.toc-panel {
			display: none;
		}
	}
</style>

