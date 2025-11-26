<script lang="ts">
	/**
	 * RoleNode Component - Isolated role rendering for Storybook
	 * 
	 * Extracted from OrgChart.svelte for isolated design/testing.
	 * Use this component in Storybook to design/test role interactions.
	 */
	import { getCircleColor } from '$lib/utils/orgChartTransform';
	import type { RoleNode, CircleHierarchyNode } from '$lib/utils/orgChartTransform';

	let {
		role,
		circleNode,
		zoomLevel = 1.0,
		showLabel = true,
		onClick = () => {}
	}: {
		role: RoleNode;
		circleNode: CircleHierarchyNode;
		zoomLevel?: number;
		showLabel?: boolean;
		onClick?: (event: MouseEvent) => void;
	} = $props();

	const color = getCircleColor(circleNode.depth);

	// Truncate text to fit within circle radius
	function truncateText(text: string, maxWidth: number, fontSize: number): string {
		const charWidth = fontSize * 0.6;
		const maxChars = Math.floor(maxWidth / charWidth);
		if (text.length <= maxChars) return text;
		return text.slice(0, Math.max(1, maxChars - 3)) + '...';
	}

	const renderedRadius = role.r * zoomLevel;
	const shouldShowLabel = showLabel && renderedRadius >= 12;

	const fontSize = Math.max(6, Math.min(role.r / 2, 10));
	const maxTextWidth = role.r * 1.6;
	const truncatedName = truncateText(role.name, maxTextWidth, fontSize);
</script>

<g
	class="role-circle-group cursor-pointer"
	role="button"
	tabindex="0"
	onclick={(e) => {
		e.stopPropagation();
		onClick(e);
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.stopPropagation();
			onClick(e as unknown as MouseEvent);
		}
	}}
	style="pointer-events: all;"
>
	<!-- Role circle -->
	<circle
		cx="0"
		cy="0"
		r={role.r}
		fill="white"
		fill-opacity="0.9"
		stroke={color}
		stroke-width="1"
		stroke-opacity="0.6"
		style="pointer-events: all;"
	/>
	
	<!-- Role name label -->
	{#if shouldShowLabel}
		<text
			x="0"
			y="0"
			text-anchor="middle"
			dominant-baseline="middle"
			class="role-label pointer-events-none select-none"
			fill="black"
			fill-opacity="0.85"
			font-size={fontSize}
			style="text-shadow: 0 0 2px rgba(255,255,255,0.8);"
		>
			{truncatedName}
		</text>
	{/if}
</g>

<style>
	.role-circle-group:focus {
		outline: none;
	}

	.role-circle-group:focus-visible circle {
		stroke: var(--color-accent-primary);
		stroke-width: 2;
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	.role-circle-group circle {
		transition:
			stroke-width 0.2s ease,
			stroke-opacity 0.2s ease,
			filter 0.2s ease;
	}

	.role-circle-group:hover circle {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		stroke-width: 2;
		stroke-opacity: 0.8;
	}
</style>

