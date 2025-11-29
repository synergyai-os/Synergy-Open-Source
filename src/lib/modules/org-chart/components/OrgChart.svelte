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
	import { pack as d3Pack, type HierarchyNode } from 'd3-hierarchy';
	import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
	import { select } from 'd3-selection';
	import { interpolateZoom } from 'd3-interpolate';
	import { transition } from 'd3-transition';
	import {
		transformToHierarchy,
		calculateCircleValue,
		getCircleColor,
		isSyntheticRoot,
		isSyntheticRole,
		isRolesGroup,
		type CircleNode,
		type CircleHierarchyNode,
		type RoleNode
	} from '$lib/utils/orgChartTransform';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';

	let {
		orgChart,
		width = 1000,
		height = 800
	}: {
		orgChart: UseOrgChart;
		width?: number;
		height?: number;
	} = $props();

	let svgElement: SVGSVGElement | undefined = $state();
	let gElement: SVGGElement | undefined = $state();

	// Current zoom state for smooth transitions
	let currentView: [number, number, number] = $state([0, 0, width]);
	let focusNode: CircleHierarchyNode | null = $state(null);
	let currentZoomLevel = $state(1.0); // Track zoom level from D3 transform

	// Reactive calculation of pack layout using $derived (Svelte 5 pattern)
	const packedNodes = $derived.by(() => {
		const circles = orgChart.circles;
		if (circles.length === 0) {
			return [];
		}

		// Transform to hierarchy
		const root = transformToHierarchy(circles);

		// Calculate values for each node (affects circle size)
		root.sum(function (this: HierarchyNode<CircleNode>, d: CircleNode) {
			return calculateCircleValue(d, this);
		});

		// Sort by descending value for better layout
		root.sort((a, b) => {
			const aValue = a.value ?? 0;
			const bValue = b.value ?? 0;
			return bValue - aValue;
		});

		// Create pack layout with padding for better nesting visibility
		const pack = d3Pack<CircleNode>().size([width, height]).padding(3);

		// Calculate positions
		const packedRoot = pack(root);

		// Extract all nodes (including root and synthetic roles)
		const nodes = packedRoot.descendants() as CircleHierarchyNode[];

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

					// Debug logging to verify role radius after packing
					console.log(
						`📍 Role "${roleData.name}" in "${circleNode.data.name}" (depth ${circleNode.depth}): r=${node.r.toFixed(2)}, value=${node.value?.toFixed(2) ?? 'N/A'}`
					);

					// Initialize packedRoles array if it doesn't exist
					if (!(circleNode.data as CircleNode).packedRoles) {
						(circleNode.data as CircleNode).packedRoles = [];
					}

					// Add role position to circle's packedRoles
					(circleNode.data as CircleNode).packedRoles!.push({
						roleId: roleData.roleId,
						name: roleData.name,
						x: relativeX,
						y: relativeY,
						r: node.r
					});
				}
			}
			return node;
		});

		return nodesWithRoles;
	});

	// Calculate bounds of all visible nodes to fit entire chart
	function calculateBounds(nodes: CircleHierarchyNode[]): [number, number, number] {
		if (nodes.length === 0) {
			return [0, 0, width];
		}

		// Find min/max x and y accounting for radius and roles
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		for (const node of nodes) {
			const r = node.r ?? 0;

			// Account for circle bounds
			minX = Math.min(minX, node.x - r);
			maxX = Math.max(maxX, node.x + r);
			minY = Math.min(minY, node.y - r);
			maxY = Math.max(maxY, node.y + r);

			// Account for roles packed within this circle
			if (node.data.packedRoles) {
				for (const role of node.data.packedRoles) {
					// Role position is relative to circle center, so add circle position
					const roleX = node.x + role.x;
					const roleY = node.y + role.y;
					const roleR = role.r ?? 0;

					minX = Math.min(minX, roleX - roleR);
					maxX = Math.max(maxX, roleX + roleR);
					minY = Math.min(minY, roleY - roleR);
					maxY = Math.max(maxY, roleY + roleR);
				}
			}
		}

		// Add minimal padding: 10px on all sides
		const padding = 10;
		const boundsWidth = maxX - minX + padding * 2;
		const boundsHeight = maxY - minY + padding * 2;

		// Calculate center point
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

		// Calculate view width to fit bounds (accounting for aspect ratio)
		const aspectRatio = width / height;
		const boundsAspectRatio = boundsWidth / boundsHeight;

		let viewWidth: number;
		if (boundsAspectRatio > aspectRatio) {
			// Bounds are wider - fit to width
			viewWidth = boundsWidth;
		} else {
			// Bounds are taller - fit to height (scale width accordingly)
			viewWidth = boundsHeight * aspectRatio;
		}

		return [centerX, centerY, viewWidth];
	}

	// Filter out synthetic root, synthetic roles, and roles group nodes, sort by depth (parents first, children last)
	const visibleNodes = $derived(
		packedNodes
			.filter(
				(node) =>
					!isSyntheticRoot(node.data.circleId) &&
					!isSyntheticRole(node.data.circleId) &&
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

	// Initialize focus node and view when nodes are first available
	$effect(() => {
		if (visibleNodes.length > 0 && !focusNode) {
			const rootNode = packedNodes[0];
			if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
				// Calculate bounds of all visible nodes to fit entire chart
				// Use visibleNodes which already filters out synthetic nodes
				currentView = calculateBounds(visibleNodes as CircleHierarchyNode[]);
				focusNode = rootNode as CircleHierarchyNode;
				// Initialize zoom level to show labels
				currentZoomLevel = 1.0;
			}
		}
	});

	// Determine if roles should be visible for a circle
	// Show ALL roles on load, hide when too small
	function shouldShowRoles(node: CircleHierarchyNode): boolean {
		// Show roles when:
		// 1. Circle is large enough to display roles
		// 2. Roles exist and are packed
		const isLargeEnough = node.r > 30; // Minimum threshold for role circles
		const hasPackedRoles = node.data.packedRoles && node.data.packedRoles.length > 0;

		return isLargeEnough && Boolean(hasPackedRoles);
	}

	// Truncate text to fit within circle radius
	function truncateText(text: string, maxWidth: number, fontSize: number): string {
		// Estimate character width (rough: fontSize * 0.6 for average character)
		const charWidth = fontSize * 0.6;
		const maxChars = Math.floor(maxWidth / charWidth);

		if (text.length <= maxChars) return text;
		return text.slice(0, Math.max(1, maxChars - 3)) + '...';
	}

	// Determine if circle name should be visible
	// Show labels for all circles that meet size requirements (accounting for zoom)
	function shouldShowCircleName(node: CircleHierarchyNode): boolean {
		// Always show root level circles (highest level)
		const isRootLevel = node.depth === 0;
		if (isRootLevel) {
			return true;
		}

		// Calculate rendered size (radius * zoom level)
		const renderedRadius = node.r * currentZoomLevel;

		// Show if rendered size is large enough to display readable label
		// Minimum readable size: 40px rendered radius = ~10px font size
		const isLargeEnough = renderedRadius > 40;

		// Show if zoomed in enough (zoom level > 1.1)
		const isZoomedIn = currentZoomLevel > 1.1;

		// Show if focused (for context when zooming into specific circle)
		const isFocused = focusNode?.data.circleId === node.data.circleId;

		// Show if parent/child of focused (Observable pattern)
		const isRelatedToFocused =
			focusNode &&
			(node === focusNode ||
				(focusNode.parent !== null && node === focusNode.parent) ||
				(focusNode.parent !== null && node.parent === focusNode));

		return isLargeEnough || isZoomedIn || isFocused || Boolean(isRelatedToFocused);
	}

	// Determine if role label should be visible (accounting for zoom and circle name priority)
	function shouldShowRoleLabel(role: RoleNode, circleNode: CircleHierarchyNode): boolean {
		// Calculate rendered size (radius * zoom level)
		const renderedRadius = role.r * currentZoomLevel;

		// Hide if rendered size is too small (minimum readable: 12px rendered = ~6px font)
		if (renderedRadius < 12) {
			return false;
		}

		// Hide role labels when circle name is visible (prioritize circle name)
		// Only show role labels if circle name is NOT visible
		const circleNameVisible = shouldShowCircleName(circleNode);
		if (circleNameVisible) {
			return false;
		}

		return true;
	}

	// D3 Zoom behavior for trackpad/mouse wheel
	let zoomBehavior: ReturnType<typeof d3Zoom<SVGSVGElement, unknown>> | null = null;

	// Smooth zoom to a specific node using interpolateZoom
	function _zoomToNode(node: CircleHierarchyNode, duration = 500) {
		if (!svgElement || !gElement) return;

		const targetView: [number, number, number] = [node.x, node.y, node.r * 2];
		const interpolator = interpolateZoom(currentView as [number, number, number], targetView);
		const t = transition()
			.duration(duration)
			.ease((t) => t * (2 - t)); // easeOutQuad

		t.tween('zoom', () => {
			return (t: number) => {
				const view = interpolator(t);
				currentView = view;
				const k = width / view[2];

				// Update zoom level for label visibility
				currentZoomLevel = k;

				// Update transform
				if (gElement) {
					select(gElement).attr(
						'transform',
						`translate(${width / 2},${height / 2}) scale(${k}) translate(${-view[0]},${-view[1]})`
					);
				}
			};
		});

		// Update focus node (triggers reactive label visibility and role visibility)
		focusNode = node;
		orgChart.selectCircle(node.data.circleId);
	}

	onMount(() => {
		if (!svgElement || !gElement) return;

		// Create D3 zoom behavior
		zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 4])
			.on('zoom', (event) => {
				// Apply transform to group element
				if (gElement) {
					const transform = event.transform;
					select(gElement).attr('transform', transform.toString());
					// Update zoom level for label visibility
					currentZoomLevel = transform.k;
					orgChart.setZoom(transform.k);
					orgChart.setPan({ x: transform.x, y: transform.y });
				}
			});

		// Apply zoom to SVG
		select(svgElement).call(zoomBehavior);

		// Initial zoom to fit entire chart (synchronous, no setTimeout)
		// Use visibleNodes which already has roles extracted and filtered
		if (visibleNodes.length > 0) {
			const root = packedNodes[0];
			if (root && !isSyntheticRoot(root.data.circleId)) {
				// Calculate bounds of all visible nodes to fit entire chart
				if (visibleNodes.length > 0) {
					currentView = calculateBounds(visibleNodes as CircleHierarchyNode[]);
					focusNode = root as CircleHierarchyNode;
					currentZoomLevel = 1.0;
				} else {
					// Fallback to root node if no visible nodes
					const rootNode = root as CircleHierarchyNode;
					currentView = [rootNode.x, rootNode.y, rootNode.r * 2];
					focusNode = rootNode;
					currentZoomLevel = 1.0;
				}

				// Apply initial transform
				if (gElement) {
					const k = width / currentView[2];
					const initialTransform = zoomIdentity
						.translate(width / 2, height / 2)
						.scale(k)
						.translate(-currentView[0], -currentView[1]);

					select(gElement).attr('transform', initialTransform.toString());
					// Sync D3 zoom state (use transform method correctly)
					if (zoomBehavior) {
						select(svgElement).call(zoomBehavior.transform, initialTransform);
					}
				}
			}
		}

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
		if (isSyntheticRole(node.data.circleId)) {
			const syntheticId = String(node.data.circleId);
			const roleId = syntheticId.replace('__role__', '') as Id<'circleRoles'>;
			orgChart.selectRole(roleId, 'chart');
			return;
		}

		// Open circle detail panel - no auto-zoom, user controls zoom manually
		orgChart.selectCircle(node.data.circleId);
	}

	function handleCircleMouseEnter(node: CircleHierarchyNode) {
		orgChart.setHover(node.data.circleId);
	}

	function handleCircleMouseLeave() {
		orgChart.setHover(null);
	}

	function handleRoleClick(event: MouseEvent, role: RoleNode) {
		event.stopPropagation();
		orgChart.selectRole(role.roleId, 'chart');
	}

	// Zoom controls
	function handleZoomIn() {
		if (svgElement && zoomBehavior) {
			const selection = select(svgElement);
			// Let D3 zoom handle the transform update (will trigger zoom event)
			selection.call(zoomBehavior.scaleBy, 1.2);
		}
	}

	function handleZoomOut() {
		if (svgElement && zoomBehavior) {
			const selection = select(svgElement);
			// Let D3 zoom handle the transform update (will trigger zoom event)
			selection.call(zoomBehavior.scaleBy, 1 / 1.2);
		}
	}

	function handleResetView() {
		// Reset zoom and pan to initial view (fit entire chart)
		if (visibleNodes.length > 0 && svgElement && gElement) {
			const bounds = calculateBounds(visibleNodes as CircleHierarchyNode[]);
			currentView = bounds;
			currentZoomLevel = 1.0;

			const k = width / bounds[2];
			const resetTransform = zoomIdentity
				.translate(width / 2, height / 2)
				.scale(k)
				.translate(-bounds[0], -bounds[1]);

			select(gElement).attr('transform', resetTransform.toString());
			if (zoomBehavior) {
				select(svgElement).call(zoomBehavior.transform, resetTransform);
			}
		} else if (svgElement && zoomBehavior) {
			// Fallback: just reset to identity
			select(svgElement).call(zoomBehavior.transform, zoomIdentity);
		}
		orgChart.resetView();
	}

	// Handle background click - close any open panels
	function handleBackgroundClick() {
		// Close circle and role panels
		orgChart.selectCircle(null);
		orgChart.selectRole(null, null);
	}
</script>

<div class="border-base relative h-full w-full overflow-hidden rounded-card border bg-surface">
	<!-- Zoom Controls -->
	<div
		class="bg-elevated/95 shadow-card-hover absolute top-4 right-4 z-10 flex flex-col gap-2 rounded-card backdrop-blur-sm"
		style="padding: var(--spacing-3);"
	>
		<button
			class="hover:bg-hover-solid flex size-icon-xl items-center justify-center rounded-button text-secondary transition-all hover:scale-110 hover:text-primary active:scale-95"
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
			class="hover:bg-hover-solid flex size-icon-xl items-center justify-center rounded-button text-secondary transition-all hover:scale-110 hover:text-primary active:scale-95"
			onclick={handleZoomOut}
			aria-label="Zoom out"
		>
			<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
			</svg>
		</button>
		<div class="bg-border-base my-1 h-px"></div>
		<button
			class="hover:bg-hover-solid flex size-icon-xl items-center justify-center rounded-button text-secondary transition-all hover:scale-110 hover:text-primary active:scale-95"
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
		class="h-full w-full cursor-move"
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
				{@const isSelected = orgChart.selectedCircleId === node.data.circleId}
				{@const isHovered = orgChart.hoveredCircleId === node.data.circleId}
				{@const hasChildren = node.children && node.children.length > 0}
				{@const color = getCircleColor(node.depth)}
				{@const showRoles = shouldShowRoles(node)}

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
					<!-- Circle -->
					<circle
						cx="0"
						cy="0"
						r={node.r}
						fill={color}
						fill-opacity={isSelected ? 0.9 : isHovered ? 0.8 : hasChildren ? 0.5 : 0.6}
						stroke={isSelected
							? 'var(--color-accent-primary)'
							: isHovered
								? color
								: hasChildren
									? color
									: 'none'}
						stroke-width={isSelected ? 3 : isHovered ? 2 : hasChildren ? 2 : 0}
						stroke-opacity={isSelected ? 1 : isHovered ? 0.8 : hasChildren ? 0.5 : 0}
						style="pointer-events: all;"
					/>

					<!-- Role circles (packed alongside child circles by D3 pack layout) -->
					{#if showRoles && node.data.packedRoles}
						{@const fontSize = Math.max(10, Math.min(node.r / 4, 14))}
						{@const nameAreaHeight = fontSize + 8}
						{@const nameAreaTop = -fontSize / 2 - 4}
						<!-- Define mask that excludes the center area where circle name is -->
						<defs>
							<mask id="mask-{node.data.circleId}">
								<!-- White = visible, Black = hidden -->
								<!-- Show entire circle -->
								<circle cx="0" cy="0" r={node.r} fill="white" />
								<!-- Hide center area where circle name is -->
								<rect
									x={-node.r * 2}
									y={nameAreaTop}
									width={node.r * 4}
									height={nameAreaHeight}
									fill="black"
								/>
							</mask>
							<!-- Also keep circle clipPath for boundary -->
							<clipPath id="clip-{node.data.circleId}">
								<circle cx="0" cy="0" r={node.r} />
							</clipPath>
						</defs>
						<!-- Group with mask and clipPath to ensure roles stay inside circle and never cover name -->
						<g clip-path="url(#clip-{node.data.circleId})" mask="url(#mask-{node.data.circleId})">
							{#each node.data.packedRoles as role (role.roleId)}
								{@const roleLabelVisible = shouldShowRoleLabel(role, node)}
								<g
									transform="translate({role.x},{role.y})"
									class="role-circle-group cursor-pointer"
									role="button"
									tabindex="0"
									onclick={(e) => {
										e.stopPropagation();
										handleRoleClick(e, role);
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.stopPropagation();
											handleRoleClick(e as unknown as MouseEvent, role);
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
									<!-- Role name label (only if large enough and circle name not visible) -->
									{#if roleLabelVisible}
										{@const fontSize = Math.max(6, Math.min(role.r / 2, 10))}
										{@const maxTextWidth = role.r * 1.6}
										{@const truncatedName = truncateText(role.name, maxTextWidth, fontSize)}
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
							{/each}
						</g>
					{/if}
				</g>
			{/each}

			<!-- Second pass: Render circle names on top (sorted by depth descending so root appears on top) -->
			{#each visibleNodes.slice().sort((a, b) => b.depth - a.depth) as node (node.data.circleId)}
				{@const showCircleName = shouldShowCircleName(node)}
				{@const baseFontSize = Math.max(10, Math.min(node.r / 4, 14))}
				{@const depthMultiplier = Math.max(0.5, 3 - node.depth * 0.5)}
				{@const fontSize = Math.max(6, Math.min(baseFontSize * depthMultiplier, 42))}
				{@const maxTextWidth = node.r * 1.8}
				{@const truncatedName = truncateText(node.data.name, maxTextWidth, fontSize)}
				{#if showCircleName}
					<g transform="translate({node.x},{node.y})">
						<text
							x="0"
							y="0"
							text-anchor="middle"
							dominant-baseline="middle"
							class="circle-name-label pointer-events-none font-bold select-none"
							fill="var(--color-orgChart-label-text)"
							fill-opacity="1"
							stroke="var(--color-orgChart-label-stroke)"
							stroke-width="0.5"
							stroke-opacity="0.8"
							style="text-shadow: 0 2px 4px rgba(0,0,0,0.9);"
							font-size={fontSize}
						>
							{truncatedName}
						</text>
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
					class="mx-auto mb-4 size-icon-xl text-secondary"
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
				<p class="mt-1 text-label text-tertiary">Create circles to see the org chart</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.circle-group:focus {
		outline: none;
	}

	.circle-group:focus-visible circle {
		stroke: var(--color-accent-primary);
		stroke-width: 3;
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 4px;
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
		stroke-width: 2;
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
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
		stroke-width: 2;
		stroke-opacity: 0.8;
	}
</style>
