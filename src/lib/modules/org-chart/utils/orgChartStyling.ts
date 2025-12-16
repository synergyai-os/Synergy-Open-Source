/**
 * OrgChart Styling Utilities
 *
 * Pure functions for calculating proportional stroke widths in the org chart.
 * SVG stroke-width is in SVG coordinate space, not screen pixels.
 * For visual consistency, stroke-width should scale proportionally with radius.
 */

/**
 * Calculate proportional stroke-width for role circles
 *
 * Uses radius as base, with min/max bounds for readability
 *
 * @param radius - Role circle radius
 * @param state - Visual state of the role circle
 * @returns Stroke width in SVG coordinate space
 */
export function getRoleStrokeWidth(
	radius: number,
	state: 'selected' | 'hover' | 'default'
): number {
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
 *
 * Uses radius as base, scaled by state (active/hover/default)
 *
 * @param radius - Circle radius
 * @param state - Visual state of the circle
 * @returns Stroke width in SVG coordinate space
 */
export function getCircleStrokeWidth(
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
