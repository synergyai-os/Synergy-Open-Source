/**
 * OrgChart Layout Utilities
 *
 * Pure functions for layout calculations in the org chart visualization.
 * These functions have zero dependencies on Svelte reactivity and can be
 * unit tested independently.
 */

import type { CircleHierarchyNode, RoleNode } from './orgChartTransform';
import { ORG_CHART } from '../constants/orgChartConstants';

/**
 * Calculate bounds of all visible nodes to fit entire chart
 *
 * @param nodes - Array of circle hierarchy nodes
 * @returns [centerX, centerY, viewWidth] - View parameters for zoom
 */
export function calculateBounds(
	nodes: CircleHierarchyNode[],
	width: number,
	height: number
): [number, number, number] {
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

	// Add minimal padding on all sides
	const padding = ORG_CHART.BOUNDS_PADDING;
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

/**
 * Split text into lines with word-aware breaking
 *
 * @param text - Text to split
 * @param maxChars - Maximum characters per line
 * @param maxLines - Maximum number of lines
 * @returns Array of text lines (truncated with ellipsis if needed)
 */
export function splitIntoLines(text: string, maxChars: number, maxLines: number): string[] {
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
				lines.push(word.slice(0, maxChars - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '…');
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
			lines.push(currentLine.slice(0, maxChars - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '…');
		} else {
			lines.push(currentLine);
		}
	} else if (currentLine && lines.length === maxLines) {
		// Truncate last line if there's more text
		const lastLine = lines[lines.length - 1];
		if (lastLine && !lastLine.endsWith('…')) {
			lines[lines.length - 1] =
				lastLine.slice(0, maxChars - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '…';
		}
	}

	return lines.length > 0 ? lines : [text.slice(0, maxChars)];
}

/**
 * Process circle name for display: smart word wrap + truncation
 *
 * @param name - Circle name to process
 * @param maxCharsPerLine - Maximum characters per line
 * @returns Object with lines array and truncation flag
 */
export function processCircleName(
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
		// If we already have max lines, we need to truncate
		if (lines.length >= ORG_CHART.MAX_LINES_CIRCLE_NAME) {
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
				currentLine =
					word.slice(0, maxCharsPerLine - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '...';
				wasTruncated = true;
			} else {
				// Second line: truncate word
				lines.push(
					word.slice(0, maxCharsPerLine - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '...'
				);
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
	if (currentLine && lines.length < ORG_CHART.MAX_LINES_CIRCLE_NAME) {
		// Check if we need to truncate the last line
		if (currentLine.length > maxCharsPerLine) {
			lines.push(
				currentLine.slice(0, maxCharsPerLine - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '...'
			);
			wasTruncated = true;
		} else {
			lines.push(currentLine);
		}
	} else if (currentLine && lines.length >= ORG_CHART.MAX_LINES_CIRCLE_NAME) {
		// We have leftover text that doesn't fit
		wasTruncated = true;
		// Add ellipsis to last line if not already there
		if (lines[1] && !lines[1].endsWith('...')) {
			const lastLine = lines[1];
			if (lastLine.length > maxCharsPerLine - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) {
				lines[1] =
					lastLine.slice(0, maxCharsPerLine - ORG_CHART.TEXT_TRUNCATION_ELLIPSIS_LENGTH) + '...';
			} else {
				lines[1] = lastLine + '...';
			}
		}
	}

	return { lines, wasTruncated };
}

/**
 * Calculate role label parameters with proportional scaling and multi-line support
 *
 * @param role - Role node with radius and name
 * @returns Object with fontSize, lineHeight, and text lines
 */
export function getRoleLabelParams(role: RoleNode): {
	fontSize: number;
	lineHeight: number;
	lines: string[];
} {
	// Font size proportional to role radius (SVG units)
	// Ratio allows max lines with comfortable spacing
	const fontSize = role.r * ORG_CHART.ROLE_FONT_SIZE_RATIO;
	const lineHeight = fontSize * ORG_CHART.ROLE_LINE_HEIGHT_RATIO;

	// Max text width: ratio * radius = 80% of diameter (10% padding each side)
	const maxTextWidth = role.r * ORG_CHART.ROLE_LABEL_WIDTH_RATIO;
	const charWidth = fontSize * ORG_CHART.ROLE_CHAR_WIDTH_RATIO;
	const maxCharsPerLine = Math.floor(maxTextWidth / charWidth);

	// Split name into lines (max lines)
	const lines = splitIntoLines(role.name, maxCharsPerLine, ORG_CHART.MAX_LINES_ROLE_LABEL);

	return { fontSize, lineHeight, lines };
}

/**
 * Calculate circle label parameters based on rendered size (semantic zoom)
 *
 * @param node - Circle hierarchy node
 * @param currentZoomLevel - Current zoom level from D3 transform
 * @param width - SVG width (for aspect ratio calculation)
 * @returns Object with fontSize, dimensions, yOffset, and display lines
 */
export function getCircleLabelParams(
	node: CircleHierarchyNode,
	currentZoomLevel: number,
	_width: number
): {
	fontSize: number;
	labelWidth: number;
	labelHeight: number;
	yOffset: number;
	displayLines: string[];
} {
	const name = node.data.name;

	// Use RENDERED radius for semantic zoom behavior
	const renderedRadius = node.r * currentZoomLevel;

	// Base visual font size scales with rendered radius
	// Larger circles = larger text, but capped for readability
	let baseVisualFontSize = Math.max(
		ORG_CHART.CIRCLE_FONT_SIZE_BASE_MIN,
		Math.min(
			renderedRadius / ORG_CHART.CIRCLE_FONT_SIZE_RADIUS_RATIO,
			ORG_CHART.CIRCLE_FONT_SIZE_BASE_MAX
		)
	);

	// LONG NAME ADJUSTMENT: Slightly smaller font for long names
	if (name.length > ORG_CHART.CIRCLE_NAME_LENGTH_THRESHOLD_MEDIUM) {
		baseVisualFontSize *= ORG_CHART.CIRCLE_NAME_LENGTH_REDUCTION_MEDIUM;
	}
	if (name.length > ORG_CHART.CIRCLE_NAME_LENGTH_THRESHOLD_LONG) {
		baseVisualFontSize *= ORG_CHART.CIRCLE_NAME_LENGTH_REDUCTION_LONG; // Additional reduction for very long names
	}

	// Depth multiplier: root circles get slightly larger text
	const depthMultiplier = Math.max(
		ORG_CHART.CIRCLE_DEPTH_MULTIPLIER_MIN,
		ORG_CHART.CIRCLE_DEPTH_MULTIPLIER_BASE - node.depth * ORG_CHART.CIRCLE_DEPTH_MULTIPLIER_STEP
	);

	// Final visual font size with MIN and MAX caps
	const visualFontSize = Math.max(
		ORG_CHART.CIRCLE_FONT_SIZE_MIN,
		Math.min(baseVisualFontSize * depthMultiplier, ORG_CHART.CIRCLE_FONT_SIZE_MAX)
	);

	// Convert to SVG space (counter-scale)
	const svgFontSize = visualFontSize / currentZoomLevel;

	// Label dimensions based on rendered size, converted to SVG space
	const visualLabelWidth = Math.min(
		renderedRadius * ORG_CHART.CIRCLE_LABEL_WIDTH_RATIO,
		ORG_CHART.CIRCLE_LABEL_WIDTH_MAX
	);
	const svgLabelWidth = visualLabelWidth / currentZoomLevel;

	// Calculate max characters per line based on visual width and font size
	const visualCharWidth = visualFontSize * ORG_CHART.ROLE_CHAR_WIDTH_RATIO;
	const maxCharsPerLine = Math.floor(visualLabelWidth / visualCharWidth);

	// Process the name for display (smart word wrap + truncation)
	const { lines: displayLines } = processCircleName(name, maxCharsPerLine);

	// Adjust label height based on number of lines
	const lineCount = displayLines.length;
	const svgLabelHeight =
		svgFontSize *
		(ORG_CHART.CIRCLE_LINE_HEIGHT_RATIO * lineCount + ORG_CHART.CIRCLE_LABEL_HEIGHT_OFFSET);

	// Position label toward TOP of circle if it has children (to avoid overlap)
	const hasChildren = node.children && node.children.length > 0;
	const yOffset = hasChildren ? -node.r * ORG_CHART.CIRCLE_LABEL_Y_OFFSET_RATIO : 0;

	return {
		fontSize: svgFontSize,
		labelWidth: svgLabelWidth,
		labelHeight: svgLabelHeight,
		yOffset,
		displayLines
	};
}
