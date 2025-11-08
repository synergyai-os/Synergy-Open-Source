<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	
	type Props = {
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { headings = [] }: Props = $props();
	
	let activeId = $state('');
	let isOpen = $state(true);
	let isHovering = $state(false);
	let isManuallyNavigating = $state(false);
	
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
	
	// Show when visible: open OR (closed + hovering)
	const shouldShow = $derived(isOpen || (!isOpen && isHovering));
</script>

{#if headings.length > 0}
	<aside 
		class="toc-panel"
		class:open={isOpen}
		class:visible={shouldShow}
		onmouseenter={() => isHovering = true}
		onmouseleave={() => isHovering = false}
	>
		<nav class="toc">
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
				{#each headings as heading}
					<li class="toc-item level-{heading.level}">
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
	</aside>
{/if}

<style>
	/* Floating TOC Panel (Linear-style) - in left margin */
	.toc-panel {
		position: fixed;
		left: 280px;
		top: 3rem;
		width: 260px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		padding: 1.125rem;
		/* Start visible, then hide/show with .visible class */
		opacity: 1;
		pointer-events: auto;
		transition: opacity 0.2s ease, transform 0.2s ease;
		z-index: 10;
		box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
	}
	
	.toc-panel:not(.visible) {
		opacity: 0;
		pointer-events: none;
	}
	
	.toc-panel.open {
		transform: translateX(0);
	}
	
	.toc-panel:not(.open) {
		transform: translateX(-20px);
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
		padding-bottom: 0.875rem;
		margin-bottom: 0.25rem;
		border-bottom: 1px solid var(--color-border-base);
		opacity: 0.9;
	}
	
	.toc-header {
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-tertiary);
		margin: 0;
		opacity: 0.85;
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
		color: var(--color-text-tertiary);
		text-decoration: none;
		border-left: 2px solid transparent;
		padding: 0.375rem 0.75rem 0.375rem 0.875rem;
		transition: all 0.15s ease;
		border-radius: 0.25rem;
		opacity: 0.85;
	}
	
	.toc-link:hover {
		color: var(--color-text-secondary);
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

