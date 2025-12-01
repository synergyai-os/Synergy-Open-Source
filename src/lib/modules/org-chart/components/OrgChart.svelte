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
		getCircleStrokeColor,
		getRoleFillColor,
		getRoleTextColor,
		getRoleStrokeColor,
		getCircleLabelColor,
		getCircleLabelStrokeColor,
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

	// Role hover state (local to chart, not exposed to composable)
	let hoveredRoleId: Id<'circleRoles'> | null = $state(null);

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
	// Set root circle as focus (visual active state) but don't open panel
	$effect(() => {
		if (visibleNodes.length > 0 && !focusNode) {
			// Find the root circle (depth 0, first visible node)
			const rootNode = visibleNodes.find((node) => node.depth === 0);
			if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
				// Calculate bounds of all visible nodes to fit entire chart
				// Use visibleNodes which already filters out synthetic nodes
				currentView = calculateBounds(visibleNodes as CircleHierarchyNode[]);
				focusNode = rootNode as CircleHierarchyNode;
				// Initialize zoom level to show labels
				currentZoomLevel = 1.0;
				// Don't call selectCircle() - panel should not auto-open on initial load
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

	// Truncate text to fit within available width
	// Uses rendered size (zoom-aware) for semantic zoom behavior
	function truncateText(text: string, maxWidth: number, fontSize: number): string {
		// Estimate character width (rough: fontSize * 0.6 for average character)
		const charWidth = fontSize * 0.6;
		const maxChars = Math.floor(maxWidth / charWidth);

		if (text.length <= maxChars) return text;
		if (maxChars <= 3) return text.slice(0, Math.max(1, maxChars));
		return text.slice(0, maxChars - 3) + '...';
	}

	// Calculate role label parameters with PROPORTIONAL scaling and multi-line support
	// Font size is a fixed ratio of circle radius - scales perfectly with zoom
	function getRoleLabelParams(role: RoleNode): {
		fontSize: number;
		lineHeight: number;
		lines: string[];
	} {
		// Font size proportional to role radius (SVG units)
		// 0.22 ratio allows 2 lines with comfortable spacing
		const fontSize = role.r * 0.22;
		const lineHeight = fontSize * 1.25;

		// Max text width: 1.6x radius = 80% of diameter (10% padding each side)
		const maxTextWidth = role.r * 1.6;
		const charWidth = fontSize * 0.55;
		const maxCharsPerLine = Math.floor(maxTextWidth / charWidth);

		// Split name into lines (max 2 lines)
		const lines = splitIntoLines(role.name, maxCharsPerLine, 2);

		return { fontSize, lineHeight, lines };
	}

	// Split text into lines with word-aware breaking
	function splitIntoLines(text: string, maxChars: number, maxLines: number): string[] {
		// If it fits on one line, return as-is
		if (text.length <= maxChars) {
			return [text];
		}

		const words = text.split(/\s+/);
		const lines: string[] = [];
		let currentLine = '';

		for (const word of words) {
			if (lines.length >= maxLines) break;

			const testLine = currentLine ? `${currentLine} ${word}` : word;

			if (testLine.length <= maxChars) {
				currentLine = testLine;
			} else if (currentLine === '') {
				// Single word too long - truncate it
				if (lines.length === maxLines - 1) {
					// Last line: truncate with ellipsis
					lines.push(word.slice(0, maxChars - 1) + '…');
					currentLine = '';
					break;
				} else {
					// Not last line: truncate and continue
					lines.push(word.slice(0, maxChars));
					currentLine = '';
				}
			} else {
				// Push current line, start new with this word
				lines.push(currentLine);
				currentLine = word;
			}
		}

		// Add remaining text
		if (currentLine && lines.length < maxLines) {
			if (currentLine.length > maxChars) {
				lines.push(currentLine.slice(0, maxChars - 1) + '…');
			} else {
				lines.push(currentLine);
			}
		} else if (currentLine && lines.length === maxLines) {
			// Truncate last line if there's more text
			const lastLine = lines[lines.length - 1];
			if (lastLine && !lastLine.endsWith('…')) {
				lines[lines.length - 1] = lastLine.slice(0, maxChars - 1) + '…';
			}
		}

		return lines.length > 0 ? lines : [text.slice(0, maxChars)];
	}

	// Process circle name for display: smart word wrap + truncation
	// Returns array of lines (max 2) with proper word breaks
	function processCircleName(
		name: string,
		maxCharsPerLine: number
	): { lines: string[]; wasTruncated: boolean } {
		// Short names fit on one line
		if (name.length <= maxCharsPerLine) {
			return { lines: [name], wasTruncated: false };
		}

		const words = name.split(/\s+/);
		const lines: string[] = [];
		let currentLine = '';
		let wasTruncated = false;

		for (const word of words) {
			// If we already have 2 lines, we need to truncate
			if (lines.length >= 2) {
				wasTruncated = true;
				break;
			}

			const testLine = currentLine ? `${currentLine} ${word}` : word;

			if (testLine.length <= maxCharsPerLine) {
				// Word fits on current line
				currentLine = testLine;
			} else if (currentLine === '') {
				// Word itself is too long - truncate it
				if (lines.length === 0) {
					// First line: truncate word
					currentLine = word.slice(0, maxCharsPerLine - 3) + '...';
					wasTruncated = true;
				} else {
					// Second line: truncate word
					lines.push(word.slice(0, maxCharsPerLine - 3) + '...');
					wasTruncated = true;
					currentLine = '';
					break;
				}
			} else {
				// Start new line with this word
				lines.push(currentLine);
				currentLine = word;
			}
		}

		// Don't forget the last line
		if (currentLine && lines.length < 2) {
			// Check if we need to truncate the last line
			if (currentLine.length > maxCharsPerLine) {
				lines.push(currentLine.slice(0, maxCharsPerLine - 3) + '...');
				wasTruncated = true;
			} else {
				lines.push(currentLine);
			}
		} else if (currentLine && lines.length >= 2) {
			// We have leftover text that doesn't fit
			wasTruncated = true;
			// Add ellipsis to last line if not already there
			if (lines[1] && !lines[1].endsWith('...')) {
				const lastLine = lines[1];
				if (lastLine.length > maxCharsPerLine - 3) {
					lines[1] = lastLine.slice(0, maxCharsPerLine - 3) + '...';
				} else {
					lines[1] = lastLine + '...';
				}
			}
		}

		return { lines, wasTruncated };
	}

	// Calculate circle label parameters based on RENDERED size (semantic zoom)
	// As zoom increases, we show the name at appropriate visual size
	function getCircleLabelParams(node: CircleHierarchyNode): {
		fontSize: number;
		labelWidth: number;
		labelHeight: number;
		yOffset: number;
		displayLines: string[]; // Processed text lines for display
	} {
		const name = node.data.name;

		// Use RENDERED radius for semantic zoom behavior
		const renderedRadius = node.r * currentZoomLevel;

		// Base visual font size scales with rendered radius
		// Larger circles = larger text, but capped for readability
		let baseVisualFontSize = Math.max(12, Math.min(renderedRadius / 5, 20));

		// LONG NAME ADJUSTMENT: Slightly smaller font for names > 20 chars
		if (name.length > 20) {
			baseVisualFontSize *= 0.85;
		}
		if (name.length > 30) {
			baseVisualFontSize *= 0.9; // Additional reduction for very long names
		}

		// Depth multiplier: root circles get slightly larger text
		const depthMultiplier = Math.max(0.7, 2.0 - node.depth * 0.3);

		// Final visual font size with MIN and MAX caps
		const visualFontSize = Math.max(10, Math.min(baseVisualFontSize * depthMultiplier, 32));

		// Convert to SVG space (counter-scale)
		const svgFontSize = visualFontSize / currentZoomLevel;

		// Label dimensions based on rendered size, converted to SVG space
		const visualLabelWidth = Math.min(renderedRadius * 1.6, 300);
		const svgLabelWidth = visualLabelWidth / currentZoomLevel;

		// Calculate max characters per line based on visual width and font size
		const visualCharWidth = visualFontSize * 0.55;
		const maxCharsPerLine = Math.floor(visualLabelWidth / visualCharWidth);

		// Process the name for display (smart word wrap + truncation)
		const { lines: displayLines } = processCircleName(name, maxCharsPerLine);

		// Adjust label height based on number of lines
		const lineCount = displayLines.length;
		const svgLabelHeight = svgFontSize * (1.3 * lineCount + 0.5);

		// Position label toward TOP of circle if it has children (to avoid overlap)
		const hasChildren = node.children && node.children.length > 0;
		const yOffset = hasChildren ? -node.r * 0.3 : 0;

		return {
			fontSize: svgFontSize,
			labelWidth: svgLabelWidth,
			labelHeight: svgLabelHeight,
			yOffset,
			displayLines
		};
	}

	// Determine if circle name should be visible
	// Uses depth-relative visibility to avoid overlap (Holaspirit pattern)
	function shouldShowCircleName(node: CircleHierarchyNode): boolean {
		// Calculate rendered size (radius * zoom level)
		const renderedRadius = node.r * currentZoomLevel;

		// Minimum size threshold - don't show labels for tiny circles
		if (renderedRadius < 50) {
			return false;
		}

		// Check if this circle has visible children
		const hasVisibleChildren =
			node.children &&
			node.children.some((child) => {
				const childNode = child as CircleHierarchyNode;
				// Child is visible if it's not synthetic and has meaningful size
				return (
					!isSyntheticRole(childNode.data.circleId) &&
					!isRolesGroup(childNode.data.circleId) &&
					childNode.r * currentZoomLevel > 80
				);
			});

		// DEPTH-RELATIVE VISIBILITY (Holaspirit pattern):
		// Hide parent labels when children are prominent
		// This prevents overlap between parent name and child circles
		if (hasVisibleChildren) {
			// Check if children are taking up significant visual space
			const childrenRenderedSize = node.children!.reduce((sum, child) => {
				const childNode = child as CircleHierarchyNode;
				if (!isSyntheticRole(childNode.data.circleId) && !isRolesGroup(childNode.data.circleId)) {
					return sum + childNode.r * currentZoomLevel;
				}
				return sum;
			}, 0);

			// If children occupy significant space relative to parent, hide parent label
			const childrenRatio = childrenRenderedSize / renderedRadius;
			if (childrenRatio > 1.5) {
				// Only show if this is the focused circle (user explicitly selected it)
				const isFocused = focusNode?.data.circleId === node.data.circleId;
				return isFocused;
			}
		}

		// Show if focused (user explicitly selected this circle)
		const isFocused = focusNode?.data.circleId === node.data.circleId;
		if (isFocused) {
			return true;
		}

		// Show if it's a relatively large circle
		if (renderedRadius > 100) {
			return true;
		}

		// Show if zoomed in enough that this depth is prominent
		const isZoomedIn = currentZoomLevel > 1.5;
		if (isZoomedIn && renderedRadius > 60) {
			return true;
		}

		return false;
	}

	// Determine if role label should be visible (based purely on rendered size)
	// Holaspirit pattern: roles become readable when zoomed in close enough
	function shouldShowRoleLabel(role: RoleNode, _circleNode: CircleHierarchyNode): boolean {
		// Calculate rendered size (radius * zoom level)
		const renderedRadius = role.r * currentZoomLevel;

		// Show label when role is large enough to be readable (minimum: 20px rendered radius)
		// This is independent of circle name visibility - roles show their own labels
		// when zoomed in close enough, regardless of what else is visible
		return renderedRadius >= 20;
	}

	// Calculate role opacity based on rendered size (progressive disclosure)
	// Holaspirit pattern: roles are low opacity when small, higher when larger
	function getRoleOpacity(role: RoleNode): number {
		const renderedRadius = role.r * currentZoomLevel;

		// Progressive opacity: 0.3 at minimum visible size, 1.0 at readable size
		// Minimum visible: 8px rendered → opacity 0.3
		// Readable size: 25px rendered → opacity 1.0
		const minSize = 8;
		const maxSize = 25;
		const minOpacity = 0.3;
		const maxOpacity = 1.0;

		if (renderedRadius <= minSize) {
			return minOpacity;
		}
		if (renderedRadius >= maxSize) {
			return maxOpacity;
		}

		// Linear interpolation between min and max
		const t = (renderedRadius - minSize) / (maxSize - minSize);
		return minOpacity + t * (maxOpacity - minOpacity);
	}

	// ============================================================================
	// PROPORTIONAL STROKE-WIDTH CALCULATIONS
	// ============================================================================
	// SVG stroke-width is in SVG coordinate space, not screen pixels.
	// For visual consistency, stroke-width should scale proportionally with radius.
	// Smaller circles get thinner strokes, larger circles get thicker strokes.

	/**
	 * Calculate proportional stroke-width for role circles
	 * Uses radius as base, with min/max bounds for readability
	 */
	function getRoleStrokeWidth(radius: number, state: 'selected' | 'hover' | 'default'): number {
		// State multipliers - selected gets thickest, hover gets medium, default is subtle
		const multipliers = {
			selected: 0.08,
			hover: 0.06,
			default: 0.04
		};

		const multiplier = multipliers[state];
		const baseWidth = radius * multiplier;

		// Clamp to reasonable bounds (in SVG coordinate space)
		const minMax = {
			selected: { min: 1, max: 3 },
			hover: { min: 0.8, max: 2 },
			default: { min: 0.5, max: 1.5 }
		};

		const { min, max } = minMax[state];
		return Math.max(min, Math.min(baseWidth, max));
	}

	/**
	 * Calculate proportional stroke-width for circle containers
	 * Uses radius as base, scaled by state (active/hover/default)
	 */
	function getCircleStrokeWidth(
		radius: number,
		state: 'active' | 'hover' | 'hasChildren' | 'none'
	): number {
		// State multipliers - active/hover states get thicker strokes
		const multipliers = {
			active: 0.025,
			hover: 0.02,
			hasChildren: 0.015,
			none: 0
		};

		const multiplier = multipliers[state];
		if (multiplier === 0) return 0;

		const baseWidth = radius * multiplier;

		// Clamp to reasonable bounds
		const minMax = {
			active: { min: 1.5, max: 4 },
			hover: { min: 1, max: 3 },
			hasChildren: { min: 0.8, max: 2 },
			none: { min: 0, max: 0 }
		};

		const { min, max } = minMax[state];
		return Math.max(min, Math.min(baseWidth, max));
	}

	// D3 Zoom behavior for trackpad/mouse wheel
	let zoomBehavior: ReturnType<typeof d3Zoom<SVGSVGElement, unknown>> | null = null;

	// Smooth zoom to a specific node using interpolateZoom
	function zoomToNode(node: CircleHierarchyNode, duration = 500) {
		if (!svgElement || !gElement || !zoomBehavior) return;

		// Calculate viewWidth to fit circle with padding in BOTH dimensions
		// This ensures the full circle is visible with 20px padding on all sides
		const diameter = node.r * 2;
		const padding = 40; // 20px top + 20px bottom (or left + right)
		const maxRenderedDiameter = Math.min(width, height) - padding;
		const viewWidth = (width * diameter) / maxRenderedDiameter;

		const targetView: [number, number, number] = [node.x, node.y, viewWidth];
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

				// Calculate transform
				const transform = zoomIdentity
					.translate(width / 2, height / 2)
					.scale(k)
					.translate(-view[0], -view[1]);

				// Update transform on group element
				if (gElement) {
					select(gElement).attr('transform', transform.toString());
				}

				// Sync D3 zoom behavior state
				if (svgElement && zoomBehavior) {
					select(svgElement).call(zoomBehavior.transform, transform);
				}
			};
		});

		// Update focus node (triggers reactive label visibility and role visibility)
		// Don't call selectCircle() to avoid opening the modal - focusNode handles visual active state
		focusNode = node;
	}

	// Zoom out to show full chart (root view)
	function zoomToRoot(duration = 500) {
		if (!svgElement || !gElement || !zoomBehavior || visibleNodes.length === 0) return;

		const bounds = calculateBounds(visibleNodes as CircleHierarchyNode[]);
		const targetView: [number, number, number] = bounds;
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

				// Calculate transform
				const transform = zoomIdentity
					.translate(width / 2, height / 2)
					.scale(k)
					.translate(-view[0], -view[1]);

				// Update transform on group element
				if (gElement) {
					select(gElement).attr('transform', transform.toString());
				}

				// Sync D3 zoom behavior state
				if (svgElement && zoomBehavior) {
					select(svgElement).call(zoomBehavior.transform, transform);
				}
			};
		});

		// Find root circle and set as focus
		const rootNode = visibleNodes.find((node) => node.depth === 0);
		if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
			focusNode = rootNode as CircleHierarchyNode;
			// Don't call selectCircle() to avoid opening the modal
		}
	}

	// Find parent circle node for a given circle
	function findParentCircleNode(node: CircleHierarchyNode): CircleHierarchyNode | null {
		if (!node.parent) return null;

		// Navigate up the hierarchy to find the actual circle (skip synthetic nodes)
		let parent = node.parent as CircleHierarchyNode;
		while (parent) {
			if (
				!isSyntheticRoot(parent.data.circleId) &&
				!isSyntheticRole(parent.data.circleId) &&
				!isRolesGroup(parent.data.circleId)
			) {
				return parent;
			}
			parent = parent.parent as CircleHierarchyNode | null;
		}

		// If no parent circle found, return root
		const rootNode = visibleNodes.find((n) => n.depth === 0);
		return rootNode && !isSyntheticRoot(rootNode.data.circleId)
			? (rootNode as CircleHierarchyNode)
			: null;
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
		// Prevent browser zoom takeover when reaching scale limits (Option 1 from D3 docs)
		select(svgElement)
			.call(zoomBehavior)
			.on('wheel', (event) => event.preventDefault());

		// Initial zoom to fit entire chart (synchronous, no setTimeout)
		// Use visibleNodes which already has roles extracted and filtered
		if (visibleNodes.length > 0) {
			// Find the root circle (depth 0, first visible node)
			const rootNode = visibleNodes.find((node) => node.depth === 0);
			if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
				// Calculate bounds of all visible nodes to fit entire chart
				currentView = calculateBounds(visibleNodes as CircleHierarchyNode[]);
				focusNode = rootNode as CircleHierarchyNode;
				currentZoomLevel = 1.0;

				// Don't call selectCircle() - panel should not auto-open on initial load
				// focusNode is set for visual active state only

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

		// Check if this circle is already active
		const isActive = focusNode?.data.circleId === node.data.circleId;

		if (isActive) {
			// Click on active circle → open modal
			orgChart.selectCircle(node.data.circleId);
		} else {
			// Click on non-active circle → make it active and zoom to it
			if (node.depth === 0) {
				zoomToRoot();
			} else {
				zoomToNode(node);
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
		const isParentActive = focusNode?.data.circleId === parentCircleNode.data.circleId;

		if (isParentActive) {
			// Role is in active circle → open role modal
			orgChart.selectRole(role.roleId, 'chart');
		} else {
			// Role is in non-active circle → make parent active and zoom to it
			if (parentCircleNode.depth === 0) {
				zoomToRoot();
			} else {
				zoomToNode(parentCircleNode);
			}
		}
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
		// Reset zoom and pan to initial view (fit entire chart) - use smooth zoom
		zoomToRoot();
		orgChart.resetView();
	}

	// Handle background click - zoom view to show active circle
	function handleBackgroundClick() {
		// Zoom view to show the active circle
		if (focusNode) {
			if (focusNode.depth === 0) {
				zoomToRoot();
			} else {
				zoomToNode(focusNode);
			}
		} else {
			// No active circle, zoom to root
			zoomToRoot();
		}
	}
</script>

<div class="relative h-full w-full overflow-hidden bg-surface">
	<!-- Zoom Controls -->
	<div
		class="bg-elevated/95 shadow-card-hover absolute top-4 right-4 z-10 flex flex-col gap-button rounded-card inset-md backdrop-blur-sm"
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
				{@const isFocused = focusNode?.data.circleId === node.data.circleId}
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
						fill-opacity={hasChildren ? 0.7 : 0.85}
						stroke={circleStroke}
						stroke-width={getCircleStrokeWidth(node.r, circleStrokeState)}
						stroke-opacity={isActive ? 1 : isHovered ? 0.8 : hasChildren ? 0.5 : 0}
						stroke-dasharray={isHovered && !isActive ? '6 3' : 'none'}
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
								{@const roleLabelVisible = shouldShowRoleLabel(role, node)}
								{@const roleOpacity = getRoleOpacity(role)}
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
											? 1
											: isRoleHovered
												? Math.min(1, roleOpacity + 0.3)
												: roleOpacity}
										stroke={getRoleStrokeColor()}
										stroke-width={getRoleStrokeWidth(role.r, roleState)}
										stroke-opacity={isRoleSelected
											? 1
											: isRoleHovered
												? Math.min(1, roleOpacity * 0.8)
												: roleOpacity * 0.5}
										style="pointer-events: all;"
									/>
									<!-- Role name label - multi-line with proper padding -->
									{#if roleLabelVisible}
										{@const labelParams = getRoleLabelParams(role)}
										{@const lineCount = labelParams.lines.length}
										{@const totalHeight = (lineCount - 1) * labelParams.lineHeight}
										{@const startY = -totalHeight / 2}
										<text
											x="0"
											y={startY}
											text-anchor="middle"
											dominant-baseline="middle"
											class="role-label pointer-events-none select-none"
											style="font-family: var(--typography-fontFamily-sans); font-weight: 500; paint-order: stroke fill;"
											fill={getRoleTextColor()}
											font-size={labelParams.fontSize}
										>
											{#each labelParams.lines as line, i}
												<tspan x="0" dy={i === 0 ? 0 : labelParams.lineHeight}>{line}</tspan>
											{/each}
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
				{@const labelParams = getCircleLabelParams(node)}
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
								{#each labelParams.displayLines as line, i}
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
					class="mx-auto size-icon-xl text-secondary mb-header"
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
