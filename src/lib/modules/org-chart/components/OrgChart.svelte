<!-- eslint-disable synergyos/no-hardcoded-design-values -->
<script lang="ts">
	/**
	 * OrgChart Component - D3 Hierarchy Visualization
	 *
	 * ⚠️ DESIGN SYSTEM EXCEPTION:
	 * This component uses explicit pixel values for SVG text rendering and D3 calculations.
	 * This is an acceptable exception per design system guidelines (see design-tokens.md).
	 *
	 * Rationale:
	 * - SVG text positioning requires precise pixel values
	 * - D3 scale transformations use pixel values for coordinate space
	 * - CSS variables don't reliably size SVG text elements
	 *
	 * Related: SYOS-520 (Component Audit), SYOS-514 (Recipe System POC), SYOS-522 (Document SVG Exception)
	 */
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {
		getCircleColor,
		getCircleStrokeColor,
		getRoleFillColor,
		getRoleTextColor,
		getRoleStrokeColor,
		isSyntheticRoot,
		isSyntheticRole,
		isSyntheticPhantom,
		isRolesGroup,
		extractRoleIdFromSynthetic,
		type CircleNode,
		type CircleHierarchyNode,
		type RoleNode
	} from '../utils/orgChartTransform';
	import { getPackedOrgChartNodes } from '../utils/orgChartPackLayout';
	import {
		calculateBounds,
		getRoleLabelParams,
		getCircleLabelParams
	} from '../utils/orgChartLayout';
	import {
		shouldShowRoles,
		shouldShowCircleName,
		shouldShowRoleLabel,
		getRoleOpacity
	} from '../utils/orgChartVisibility';
	import { getRoleStrokeWidth, getCircleStrokeWidth } from '../utils/orgChartStyling';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useOrgChartZoom } from '../composables/useOrgChartZoom.svelte';
	import CircleContextMenu from './CircleContextMenu.svelte';
	import RoleContextMenu from './RoleContextMenu.svelte';
	import { Badge } from '$lib/components/atoms';
	import { ORG_CHART } from '../constants/orgChartConstants';

	let {
		orgChart,
		width = 1000,
		height = 800,
		workspaceId,
		workspaceSlug
	}: {
		orgChart: UseOrgChart;
		width?: number;
		height?: number;
		workspaceId?: Id<'workspaces'>;
		workspaceSlug?: string;
	} = $props();

	let svgElement: SVGSVGElement | undefined = $state();
	let gElement: SVGGElement | undefined = $state();

	// Role hover state (local to chart, not exposed to composable)
	let hoveredRoleId: Id<'circleRoles'> | null = $state(null);

	// Reactive calculation of pack layout using $derived (Svelte 5 pattern)
	const packedNodes = $derived.by(() => {
		try {
			const circles = orgChart.circles;
			if (circles.length === 0) {
				return [];
			}

			// Compute packed nodes (with hierarchy enforcement via phantom leaves)
			const nodes = getPackedOrgChartNodes(circles, width, height);

			// Extract role positions from synthetic role nodes and attach to parent circles
			const nodesWithRoles: CircleHierarchyNode[] = nodes.map((node) => {
				// If this is a synthetic role node, extract its position relative to the actual circle
				if (isSyntheticRole(node.data.circleId) && node.parent) {
					const parentNode = node.parent as CircleHierarchyNode;
					const roleData = node.data.roles?.[0]; // Get original role data
					if (roleData && node.r && node.r > 0) {
						// If parent is a roles group, get the circle (group's parent) for relative positioning
						// Otherwise, use immediate parent (backward compatibility)
						let circleNode: CircleHierarchyNode;
						if (isRolesGroup(parentNode.data.circleId) && parentNode.parent) {
							circleNode = parentNode.parent as CircleHierarchyNode;
						} else {
							circleNode = parentNode;
						}

						// Calculate position relative to circle center (not group center)
						const relativeX = node.x - circleNode.x;
						const relativeY = node.y - circleNode.y;

						// Initialize packedRoles array if it doesn't exist
						if (!(circleNode.data as CircleNode).packedRoles) {
							(circleNode.data as CircleNode).packedRoles = [];
						}

						// Proportional role sizing: Cap roles at percentage of parent circle diameter
						// This ensures roles remain visible inside small sub-circles while respecting absolute maximum
						const parentCircleDiameter = circleNode.r * 2;
						const proportionalMaxDiameter =
							parentCircleDiameter * ORG_CHART.MAX_ROLE_TO_CIRCLE_RATIO;
						const maxRoleDiameter = Math.min(ORG_CHART.MAX_ROLE_DIAMETER, proportionalMaxDiameter);
						const cappedRadius = Math.min(node.r, maxRoleDiameter / 2);

						// Add role position to circle's packedRoles
						(circleNode.data as CircleNode).packedRoles!.push({
							roleId: roleData.roleId,
							name: roleData.name,
							x: relativeX,
							y: relativeY,
							r: cappedRadius
						});
					}
				}
				return node;
			});

			return nodesWithRoles;
		} catch (error) {
			console.error('[OrgChart] Failed to calculate pack layout:', error);
			return []; // Graceful fallback - shows empty state
		}
	});

	// Filter out synthetic root, synthetic roles, and roles group nodes, sort by depth (parents first, children last)
	const visibleNodes = $derived(
		packedNodes
			.filter(
				(node) =>
					!isSyntheticRoot(node.data.circleId) &&
					!isSyntheticRole(node.data.circleId) &&
					!isSyntheticPhantom(node.data.circleId) &&
					!isRolesGroup(node.data.circleId)
			)
			.sort((a, b) => {
				// Sort by depth ascending (parents first), then by value descending (larger first)
				if (a.depth !== b.depth) {
					return a.depth - b.depth;
				}
				const aValue = a.value ?? 0;
				const bValue = b.value ?? 0;
				return bValue - aValue;
			})
	);

	// Initialize zoom composable (after visibleNodes is defined)
	const zoom = useOrgChartZoom(
		() => svgElement,
		() => gElement,
		() => visibleNodes,
		() => width,
		() => height,
		orgChart
	);

	// Initialize focus node and view when nodes are first available
	// Set root circle as focus (visual active state) but don't open panel
	$effect(() => {
		if (visibleNodes.length > 0 && !zoom.focusNode) {
			// Find the root circle (depth 0, first visible node)
			const rootNode = visibleNodes.find((node) => node.depth === 0);
			if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
				// Calculate bounds of all visible nodes to fit entire chart
				// Use visibleNodes which already filters out synthetic nodes
				zoom.setCurrentView(calculateBounds(visibleNodes as CircleHierarchyNode[], width, height));
				zoom.setFocusNode(rootNode as CircleHierarchyNode);
				// Initialize zoom level to show labels
				zoom.setCurrentZoomLevel(ORG_CHART.ZOOM_INITIAL_LEVEL);
				// Don't call selectCircle() - panel should not auto-open on initial load
			}
		}
	});

	onMount(() => {
		if (!svgElement || !gElement) return;

		// Initialize zoom behavior via composable
		zoom.initializeZoom();

		// Handle window resize
		const resizeObserver = new ResizeObserver(() => {
			if (svgElement) {
				const rect = svgElement.getBoundingClientRect();
				width = rect.width;
				height = rect.height;
			}
		});
		resizeObserver.observe(svgElement);

		onDestroy(() => {
			resizeObserver.disconnect();
		});
	});

	function handleCircleClick(event: MouseEvent, node: CircleHierarchyNode) {
		event.stopPropagation();

		// Handle synthetic role circles - extract role ID and open role panel
		const roleId = extractRoleIdFromSynthetic(node.data.circleId);
		if (roleId) {
			orgChart.selectRole(roleId, 'chart');
			return;
		}

		// Check if this circle is already active
		const isActive = zoom.focusNode?.data.circleId === node.data.circleId;

		if (isActive) {
			// Click on active circle → open modal
			orgChart.selectCircle(node.data.circleId);
		} else {
			// Click on non-active circle → make it active and zoom to it
			if (node.depth === 0) {
				zoom.zoomToRoot();
			} else {
				zoom.zoomToNode(node);
			}
		}
	}

	function handleCircleMouseEnter(node: CircleHierarchyNode) {
		orgChart.setHover(node.data.circleId);
	}

	function handleCircleMouseLeave() {
		orgChart.setHover(null);
	}

	function handleRoleClick(
		event: MouseEvent,
		role: RoleNode,
		parentCircleNode: CircleHierarchyNode
	) {
		event.stopPropagation();

		// Check if parent circle is active
		const isParentActive = zoom.focusNode?.data.circleId === parentCircleNode.data.circleId;

		if (isParentActive) {
			// Role is in active circle → open role modal
			orgChart.selectRole(role.roleId, 'chart');
		} else {
			// Role is in non-active circle → make parent active and zoom to it
			if (parentCircleNode.depth === 0) {
				zoom.zoomToRoot();
			} else {
				zoom.zoomToNode(parentCircleNode);
			}
		}
	}

	// Zoom controls
	function handleZoomIn() {
		zoom.zoomIn();
	}

	function handleZoomOut() {
		zoom.zoomOut();
	}

	function handleResetView() {
		// Reset zoom and pan to initial view (fit entire chart) - use smooth zoom
		zoom.zoomToRoot();
		orgChart.resetView();
	}

	// Handle background click - zoom view to show active circle
	function handleBackgroundClick() {
		// Zoom view to show the active circle
		if (zoom.focusNode) {
			if (zoom.focusNode.depth === 0) {
				zoom.zoomToRoot();
			} else {
				zoom.zoomToNode(zoom.focusNode);
			}
		} else {
			// No active circle, zoom to root
			zoom.zoomToRoot();
		}
	}
</script>

<div class="bg-surface relative h-full w-full overflow-hidden">
	<!-- Zoom Controls -->
	<div
		class="bg-elevated/95 shadow-card-hover gap-button rounded-card inset-md absolute top-4 right-4 z-10 flex flex-col backdrop-blur-sm"
	>
		<button
			class="hover:bg-hover-solid size-icon-xl rounded-button text-secondary hover:text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
			onclick={handleZoomIn}
			aria-label="Zoom in"
		>
			<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				/>
			</svg>
		</button>
		<button
			class="hover:bg-hover-solid size-icon-xl rounded-button text-secondary hover:text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
			onclick={handleZoomOut}
			aria-label="Zoom out"
		>
			<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
			</svg>
		</button>
		<div class="bg-border-base my-1 h-px"></div>
		<button
			class="hover:bg-hover-solid size-icon-xl rounded-button text-secondary hover:text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
			onclick={handleResetView}
			aria-label="Reset view"
		>
			<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
		</button>
	</div>

	<!-- SVG Container -->
	<svg
		bind:this={svgElement}
		class="h-full w-full cursor-move touch-none"
		viewBox="0 0 {width} {height}"
		preserveAspectRatio="xMidYMid meet"
		role="button"
		tabindex="0"
		onclick={handleBackgroundClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				handleBackgroundClick();
			}
		}}
		aria-label="Organizational chart - click to zoom out"
	>
		<!-- Background -->
		<rect {width} {height} fill="transparent" />

		<!-- Transform group for zoom/pan -->
		<g bind:this={gElement} class="circles">
			<!-- First pass: Render circles and roles (without names) -->
			{#each visibleNodes as node (node.data.circleId)}
				{@const isFocused = zoom.focusNode?.data.circleId === node.data.circleId}
				{@const isSelected = orgChart.selectedCircleId === node.data.circleId}
				{@const isActive = isFocused || isSelected}
				{@const isHovered = orgChart.hoveredCircleId === node.data.circleId}
				{@const hasChildren = node.children && node.children.length > 0}
				{@const circleFill = getCircleColor()}
				{@const circleStroke = isActive
					? getCircleStrokeColor('active')
					: isHovered
						? getCircleStrokeColor('hover')
						: getCircleStrokeColor('default')}
				{@const showRoles = shouldShowRoles(node)}
				{@const circleStrokeState = isActive
					? 'active'
					: isHovered
						? 'hover'
						: hasChildren
							? 'hasChildren'
							: 'none'}

				<!-- Group positioned at node's x,y (D3 pack layout pattern) -->
				<g
					class="circle-group cursor-pointer"
					role="button"
					tabindex="0"
					transform="translate({node.x},{node.y})"
					onclick={(e) => handleCircleClick(e, node)}
					onmouseenter={() => handleCircleMouseEnter(node)}
					onmouseleave={handleCircleMouseLeave}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							handleCircleClick(e as unknown as MouseEvent, node);
						}
					}}
					style="pointer-events: all;"
				>
					<!-- Circle - light fill for all depths, stroke indicates state -->
					<!-- Stroke-width scales proportionally with radius for visual consistency -->
					<circle
						cx="0"
						cy="0"
						r={node.r}
						fill={circleFill}
						fill-opacity={hasChildren
							? ORG_CHART.CIRCLE_FILL_OPACITY_WITH_CHILDREN
							: ORG_CHART.CIRCLE_FILL_OPACITY_WITHOUT_CHILDREN}
						stroke={circleStroke}
						stroke-width={getCircleStrokeWidth(node.r, circleStrokeState)}
						stroke-opacity={isActive
							? ORG_CHART.CIRCLE_STROKE_OPACITY_ACTIVE
							: isHovered
								? ORG_CHART.CIRCLE_STROKE_OPACITY_HOVER
								: hasChildren
									? ORG_CHART.CIRCLE_STROKE_OPACITY_HAS_CHILDREN
									: ORG_CHART.CIRCLE_STROKE_OPACITY_DEFAULT}
						stroke-dasharray={isHovered && !isActive ? ORG_CHART.STROKE_DASHARRAY_HOVER : 'none'}
						style="pointer-events: all;"
					/>

					<!-- Role circles (packed alongside child circles by D3 pack layout) -->
					{#if showRoles && node.data.packedRoles}
						<!-- ClipPath to keep roles inside circle boundary -->
						<defs>
							<clipPath id="clip-{node.data.circleId}">
								<circle cx="0" cy="0" r={node.r} />
							</clipPath>
						</defs>
						<!-- Group with clipPath to ensure roles stay inside circle -->
						<g clip-path="url(#clip-{node.data.circleId})">
							{#each node.data.packedRoles as role (role.roleId)}
								{@const roleLabelVisible = shouldShowRoleLabel(role, zoom.currentZoomLevel)}
								{@const roleOpacity = getRoleOpacity(role, zoom.currentZoomLevel)}
								{@const isRoleSelected = orgChart.selectedRoleId === role.roleId}
								{@const isRoleHovered = hoveredRoleId === role.roleId}
								{@const roleState = isRoleSelected
									? 'selected'
									: isRoleHovered
										? 'hover'
										: 'default'}
								<g
									transform="translate({role.x},{role.y})"
									class="role-circle-group cursor-pointer"
									role="button"
									tabindex="0"
									onclick={(e) => {
										e.stopPropagation();
										handleRoleClick(e, role, node);
									}}
									onmouseenter={() => {
										hoveredRoleId = role.roleId;
									}}
									onmouseleave={() => {
										hoveredRoleId = null;
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.stopPropagation();
											handleRoleClick(e as unknown as MouseEvent, role, node);
										}
									}}
									style="pointer-events: all;"
								>
									<!-- Role circle - progressive opacity based on zoom/size (Holaspirit pattern) -->
									<!-- Stroke-width scales proportionally with radius for visual consistency -->
									<circle
										cx="0"
										cy="0"
										r={role.r}
										fill={getRoleFillColor()}
										fill-opacity={isRoleSelected
											? ORG_CHART.ROLE_OPACITY_MAX
											: isRoleHovered
												? Math.min(
														ORG_CHART.ROLE_OPACITY_MAX,
														roleOpacity + ORG_CHART.ROLE_FILL_OPACITY_HOVER_BOOST
													)
												: roleOpacity}
										stroke={getRoleStrokeColor()}
										stroke-width={getRoleStrokeWidth(role.r, roleState)}
										stroke-opacity={isRoleSelected
											? ORG_CHART.ROLE_OPACITY_MAX
											: isRoleHovered
												? Math.min(
														ORG_CHART.ROLE_OPACITY_MAX,
														roleOpacity * ORG_CHART.ROLE_STROKE_OPACITY_HOVER_MULTIPLIER
													)
												: roleOpacity * ORG_CHART.ROLE_STROKE_OPACITY_DEFAULT_MULTIPLIER}
										style="pointer-events: all;"
									/>
									<!-- Role name label with badge - using foreignObject for HTML/CSS support -->
									{#if roleLabelVisible}
										{@const labelParams = getRoleLabelParams(role)}
										{@const lineCount = labelParams.lines.length}
										{@const totalHeight = (lineCount - 1) * labelParams.lineHeight}
										{@const labelHeight = totalHeight + labelParams.fontSize}
										{@const labelWidth = role.r * ORG_CHART.ROLE_LABEL_WIDTH_RATIO}
										{@const hasStatus = role.status === 'draft' || role.isHiring}
										{@const status =
											role.status === 'draft' ? 'draft' : role.isHiring ? 'hiring' : undefined}
										{@const badgeVariant = status === 'hiring' ? 'warning' : 'default'}
										{@const badgeLabel = status === 'hiring' ? 'Hiring' : 'Draft'}
										<foreignObject
											x={-labelWidth / 2}
											y={-labelHeight / 2}
											width={labelWidth}
											height={labelHeight}
											class="pointer-events-none overflow-visible"
										>
											<div
												xmlns="http://www.w3.org/1999/xhtml"
												class="gap-fieldGroup flex h-full w-full flex-col items-center justify-center"
											>
												<!-- Role name lines -->
												{#each labelParams.lines as line, i (i)}
													<span
														class="role-label text-center font-sans font-medium select-none"
														style="
															font-size: {labelParams.fontSize}px;
															color: {getRoleTextColor()};
															text-shadow: 
																0 0 3px var(--color-component-orgChart-circle-fill),
																0 0 6px var(--color-component-orgChart-circle-fill),
																0 1px 2px rgba(0,0,0,0.3);
															line-height: {labelParams.lineHeight}px;
														"
													>
														{line}
													</span>
												{/each}
												<!-- Status badge -->
												{#if hasStatus}
													<Badge variant={badgeVariant} size="md">{badgeLabel}</Badge>
												{/if}
											</div>
										</foreignObject>
									{/if}
								</g>
							{/each}
						</g>
					{/if}

					<!-- Context Menu Overlay: foreignObject with transparent div for right-click -->
					{#if browser && workspaceId && workspaceSlug && !isSyntheticRole(node.data.circleId)}
						{@const circleDiameter = node.r * 2}
						<foreignObject
							x={-node.r}
							y={-node.r}
							width={circleDiameter}
							height={circleDiameter}
							class="pointer-events-all"
							style="overflow: visible;"
						>
							<div xmlns="http://www.w3.org/1999/xhtml" class="h-full w-full">
								<CircleContextMenu
									circleId={node.data.circleId}
									circleName={node.data.name}
									{workspaceId}
									{workspaceSlug}
									onLeftClick={(e) => {
										// Forward left-click to circle's click handler
										handleCircleClick(e, node);
									}}
									onRoleCreated={() => {
										// Refresh org chart data - circles query will auto-refresh
									}}
									onCircleCreated={() => {
										// Refresh org chart data - circles query will auto-refresh
									}}
								/>
							</div>
						</foreignObject>
					{/if}

					<!-- Role Context Menus: Render AFTER circle context menu so they appear on top -->
					{#if browser && showRoles && node.data.packedRoles}
						{#each node.data.packedRoles as role (role.roleId)}
							{@const roleDiameter = role.r * 2}
							<!-- Context Menu Overlay for Role: foreignObject positioned at role location -->
							<!-- Positioned relative to circle center (already in circle's group transform) -->
							<g transform="translate({role.x},{role.y})">
								<foreignObject
									x={-role.r}
									y={-role.r}
									width={roleDiameter}
									height={roleDiameter}
									class="pointer-events-all"
									style="overflow: visible;"
								>
									<div xmlns="http://www.w3.org/1999/xhtml" class="h-full w-full">
										<RoleContextMenu
											roleId={role.roleId}
											roleName={role.name}
											workspaceId={node.data.workspaceId}
											onLeftClick={(e) => {
												// Forward left-click to role's click handler
												e.stopPropagation();
												handleRoleClick(e, role, node);
											}}
										/>
									</div>
								</foreignObject>
							</g>
						{/each}
					{/if}
				</g>
			{/each}

			<!-- Second pass: Render circle names on top (sorted by depth descending so root appears on top) -->
			{#each visibleNodes.slice().sort((a, b) => b.depth - a.depth) as node (node.data.circleId)}
				{@const showCircleName = shouldShowCircleName(node, zoom.focusNode, zoom.currentZoomLevel)}
				{@const labelParams = getCircleLabelParams(node, zoom.currentZoomLevel, width)}
				{#if showCircleName}
					<!-- Position at circle center + yOffset (moves label up for circles with children) -->
					<g transform="translate({node.x},{node.y + labelParams.yOffset})">
						<!-- foreignObject allows HTML text with full CSS/design system support -->
						<!-- Semantic zoom: label dimensions adapt to current zoom level -->
						<!-- yOffset positions label toward top to avoid child overlap -->
						<foreignObject
							x={-labelParams.labelWidth / 2}
							y={-labelParams.labelHeight / 2}
							width={labelParams.labelWidth}
							height={labelParams.labelHeight}
							class="pointer-events-none overflow-visible"
						>
							<div
								xmlns="http://www.w3.org/1999/xhtml"
								class="flex h-full w-full flex-col items-center justify-center"
							>
								<!-- Smart word wrap: render each line separately -->
								{#each labelParams.displayLines as line, i (i)}
									<span
										class="circle-label text-center font-sans font-semibold select-none"
										style="
											font-size: {labelParams.fontSize}px;
											color: var(--color-component-orgChart-label-text);
											text-shadow: 
												0 0 3px var(--color-component-orgChart-circle-fill),
												0 0 6px var(--color-component-orgChart-circle-fill),
												0 1px 2px rgba(0,0,0,0.3);
											line-height: 1.3;
										"
									>
										{line}
									</span>
								{/each}
							</div>
						</foreignObject>
					</g>
				{/if}
			{/each}
		</g>
	</svg>

	<!-- Empty State -->
	{#if visibleNodes.length === 0}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				<svg
					class="size-icon-xl text-secondary mb-header mx-auto"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<p class="text-button text-secondary">No circles to display</p>
				<p class="text-label text-tertiary mt-fieldGroup">Create circles to see the org chart</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Remove focus outline from SVG container - prevents blue border around org chart */
	svg:focus {
		outline: none;
	}

	svg:focus-visible {
		outline: none;
	}

	.circle-group:focus {
		outline: none;
	}

	.circle-group:focus-visible circle {
		stroke: var(--color-accent-primary);
		/* stroke-width handled by inline proportional calculation */
		outline: none;
	}

	/* Smooth transitions for all interactions */
	.circle-group circle {
		transition:
			stroke-width 0.2s ease,
			stroke-opacity 0.2s ease,
			filter 0.2s ease;
	}

	.circle-group:hover circle {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
	}

	.role-circle-group:focus {
		outline: none;
	}

	.role-circle-group:focus-visible circle {
		stroke: var(--color-accent-primary);
		/* stroke-width handled by inline proportional calculation */
		outline: none;
	}

	/* Smooth transitions for role interactions */
	.role-circle-group circle {
		transition:
			stroke-width 0.2s ease,
			stroke-opacity 0.2s ease,
			filter 0.2s ease;
	}

	.role-circle-group:hover circle {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		/* stroke-width handled by inline proportional calculation */
		/* stroke-opacity handled by inline calculation */
	}
</style>
