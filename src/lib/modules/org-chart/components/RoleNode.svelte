<script lang="ts">
	/**
	 * RoleNode Component - Isolated role rendering for Storybook
	 *
	 * Extracted from OrgChart.svelte for isolated design/testing.
	 * Use this component in Storybook to design/test role interactions.
	 *
	 * See: src/lib/modules/org-chart/COLOR_STRATEGY.md for color system docs
	 */
	import {
		getRoleFillColor,
		getRoleTextColor,
		getRoleStrokeColor
	} from '$lib/utils/orgChartTransform';
	import type { RoleNode, CircleHierarchyNode } from '$lib/utils/orgChartTransform';

	let {
		role,
		circleNode,
		zoomLevel = 1.0,
		showLabel = true,
		isSelected = false,
		onClick = () => {}
	}: {
		role: RoleNode;
		circleNode: CircleHierarchyNode;
		zoomLevel?: number;
		showLabel?: boolean;
		isSelected?: boolean;
		onClick?: (event: MouseEvent) => void;
	} = $props();

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
	<!-- Role circle - solid primary fill, clearly distinct from container circles -->
	<circle
		cx="0"
		cy="0"
		r={role.r}
		fill={getRoleFillColor()}
		fill-opacity="1"
		stroke={getRoleStrokeColor()}
		stroke-width={isSelected ? 2.5 : 1}
		stroke-opacity={isSelected ? 1 : 0.3}
		style="pointer-events: all;"
	/>

	<!-- Role name label - white text on primary background -->
	{#if shouldShowLabel}
		<text
			x="0"
			y="0"
			text-anchor="middle"
			dominant-baseline="middle"
			class="role-label pointer-events-none font-medium select-none"
			fill={getRoleTextColor()}
			fill-opacity="1"
			font-size={fontSize}
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
		stroke: var(--color-component-orgChart-role-stroke);
		stroke-width: 2.5;
		stroke-opacity: 1;
		outline: 2px solid var(--color-component-orgChart-role-stroke);
		outline-offset: 2px;
	}

	.role-circle-group circle {
		transition:
			stroke-width 0.2s ease,
			stroke-opacity 0.2s ease,
			filter 0.2s ease,
			transform 0.2s ease;
	}

	.role-circle-group:hover circle {
		filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
		stroke-width: 1.5;
		stroke-opacity: 0.5;
	}
</style>
