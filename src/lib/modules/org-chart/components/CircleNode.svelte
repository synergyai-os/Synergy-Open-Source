<script lang="ts">
	/**
	 * CircleNode Component - Isolated circle rendering for Storybook
	 *
	 * Extracted from OrgChart.svelte for isolated design/testing.
	 * Use this component in Storybook to design/test circle interactions.
	 *
	 * See: src/lib/modules/org-chart/COLOR_STRATEGY.md for color system docs
	 */
	import {
		getCircleColor,
		getCircleStrokeColor,
		getCircleLabelColor,
		getCircleLabelStrokeColor
	} from '$lib/utils/orgChartTransform';
	import type { CircleHierarchyNode } from '$lib/utils/orgChartTransform';

	let {
		node,
		isSelected = false,
		isHovered = false,
		zoomLevel = 1.0,
		onClick = () => {},
		onMouseEnter = () => {},
		onMouseLeave = () => {}
	}: {
		node: CircleHierarchyNode;
		isSelected?: boolean;
		isHovered?: boolean;
		zoomLevel?: number;
		onClick?: (event: MouseEvent) => void;
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
	} = $props();

	const hasChildren = node.children && node.children.length > 0;
	// Single color for all depths - hierarchy shown through nesting/size
	const circleFill = getCircleColor();
	// Stroke color based on state
	const circleStroke = isSelected
		? getCircleStrokeColor('active')
		: isHovered
			? getCircleStrokeColor('hover')
			: getCircleStrokeColor('default');

	// Determine if circle name should be visible
	function shouldShowCircleName(): boolean {
		const isRootLevel = node.depth === 0;
		if (isRootLevel) {
			return true;
		}

		const renderedRadius = node.r * zoomLevel;
		const isLargeEnough = renderedRadius > 40;
		const isZoomedIn = zoomLevel > 1.1;

		return isLargeEnough || isZoomedIn;
	}

	// Truncate text to fit within circle radius
	function truncateText(text: string, maxWidth: number, fontSize: number): string {
		const charWidth = fontSize * 0.6;
		const maxChars = Math.floor(maxWidth / charWidth);
		if (text.length <= maxChars) return text;
		return text.slice(0, Math.max(1, maxChars - 3)) + '...';
	}

	const showCircleName = shouldShowCircleName();
	const baseFontSize = Math.max(10, Math.min(node.r / 4, 14));
	const depthMultiplier = Math.max(0.5, 3 - node.depth * 0.5);
	const fontSize = Math.max(6, Math.min(baseFontSize * depthMultiplier, 42));
	const maxTextWidth = node.r * 1.8;
	const truncatedName = truncateText(node.data.name, maxTextWidth, fontSize);
</script>

<g
	class="circle-group cursor-pointer"
	role="button"
	tabindex="0"
	onclick={onClick}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onClick(e as unknown as MouseEvent);
		}
	}}
	style="pointer-events: all;"
>
	<!-- Circle - light fill for all depths, stroke indicates state -->
	<circle
		cx="0"
		cy="0"
		r={node.r}
		fill={circleFill}
		fill-opacity={hasChildren ? 0.7 : 0.85}
		stroke={circleStroke}
		stroke-width={isSelected ? 3 : isHovered ? 2 : hasChildren ? 1.5 : 0}
		stroke-opacity={isSelected ? 1 : isHovered ? 0.8 : hasChildren ? 0.5 : 0}
		stroke-dasharray={isHovered && !isSelected ? '6 3' : 'none'}
		style="pointer-events: all;"
	/>

	<!-- Circle name label -->
	{#if showCircleName}
		<text
			x="0"
			y="0"
			text-anchor="middle"
			dominant-baseline="middle"
			class="circle-name-label pointer-events-none font-bold select-none"
			fill="var(--color-component-orgChart-label-text)"
			fill-opacity="1"
			stroke="var(--color-component-orgChart-label-stroke)"
			stroke-width="0.5"
			stroke-opacity="0.8"
			style="text-shadow: 0 2px 4px rgba(0,0,0,0.9);"
			font-size={fontSize}
		>
			{truncatedName}
		</text>
	{/if}
</g>

<style>
	.circle-group:focus {
		outline: none;
	}

	.circle-group:focus-visible circle {
		stroke: var(--color-component-orgChart-circle-strokeActive);
		stroke-width: 3;
		stroke-dasharray: none;
		outline: 2px solid var(--color-component-orgChart-circle-strokeActive);
		outline-offset: 4px;
	}

	.circle-group circle {
		transition:
			stroke-width 0.2s ease,
			stroke-opacity 0.2s ease,
			stroke-dasharray 0.2s ease,
			filter 0.2s ease;
	}

	.circle-group:hover circle {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
	}
</style>
