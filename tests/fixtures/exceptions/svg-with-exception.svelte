<!-- Test fixture: SVG with SYOS-522 exception (acceptable) -->
<!-- Expected: Should skip (has exception comment) -->

<script lang="ts">
	/**
	 * DESIGN SYSTEM EXCEPTION: SVG/D3 Visualization (SYOS-522)
	 *
	 * This component uses SVG with hardcoded pixel dimensions because:
	 * 1. CSS-based sizing (recipes/utility classes) unreliable for SVG in some browsers
	 * 2. Requires explicit HTML width/height attributes
	 * 3. Token mapping via JavaScript computed styles (where dynamic needed)
	 *
	 * Approved exception - see dev-docs/2-areas/design/design-tokens.md
	 */

	type Props = {
		size?: 'sm' | 'md' | 'lg';
	};

	let { size = 'md' }: Props = $props();
</script>

<svg width="16px" height="16px">
	<!-- ✅ Acceptable: Has SYOS-522 exception comment -->
	<circle cx="8" cy="8" r="6" />
</svg>

