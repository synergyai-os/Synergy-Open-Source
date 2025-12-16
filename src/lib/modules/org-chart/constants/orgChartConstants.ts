/**
 * OrgChart visual and behavioral constants
 *
 * SVG Exception: These pixel values are required for D3 calculations
 * and SVG rendering. See design-system.md Section 6.7.
 *
 * All magic numbers from OrgChart component and utilities are extracted here
 * per Architecture Principle #20: "No hardcoded magic values – use constants or config"
 */
export const ORG_CHART = {
	// Role sizing
	MAX_ROLE_DIAMETER: 250, // Never exceed this diameter (125px radius)
	MAX_ROLE_TO_CIRCLE_RATIO: 0.65, // Roles cap at 65% of parent circle diameter

	// Zoom behavior
	ZOOM_SCALE_MIN: 0.5,
	ZOOM_SCALE_MAX: 4,
	ZOOM_SCALE_BY_FACTOR: 1.2, // Zoom in/out step multiplier
	ZOOM_INITIAL_LEVEL: 1.0,

	// Animation
	ANIMATION_DURATION_MS: 500,

	// Layout & Padding
	BOUNDS_PADDING: 10, // Padding for bounds calculation
	ZOOM_PADDING: 40, // Padding for zoom-to-node (20px top + 20px bottom)
	PACK_PADDING: 3, // D3 pack layout padding

	// Typography - Role labels
	ROLE_FONT_SIZE_RATIO: 0.22, // Font size proportional to role radius
	ROLE_LINE_HEIGHT_RATIO: 1.25, // Line height multiplier for role labels
	ROLE_LABEL_WIDTH_RATIO: 1.6, // Label width multiplier (80% of diameter)
	ROLE_CHAR_WIDTH_RATIO: 0.55, // Character width estimate ratio

	// Typography - Circle labels
	CIRCLE_FONT_SIZE_MIN: 10, // Minimum font size (px)
	CIRCLE_FONT_SIZE_MAX: 32, // Maximum font size (px)
	CIRCLE_FONT_SIZE_BASE_MIN: 12, // Base minimum before multipliers
	CIRCLE_FONT_SIZE_BASE_MAX: 20, // Base maximum before multipliers
	CIRCLE_FONT_SIZE_RADIUS_RATIO: 5, // Font size = radius / this ratio
	CIRCLE_LABEL_WIDTH_RATIO: 1.6, // Label width multiplier
	CIRCLE_LABEL_WIDTH_MAX: 300, // Maximum label width (px)
	CIRCLE_LINE_HEIGHT_RATIO: 1.3, // Line height multiplier
	CIRCLE_LABEL_HEIGHT_OFFSET: 0.5, // Additional height offset multiplier

	// Typography - Name length adjustments
	CIRCLE_NAME_LENGTH_THRESHOLD_MEDIUM: 20, // Characters before size reduction
	CIRCLE_NAME_LENGTH_THRESHOLD_LONG: 30, // Characters before additional reduction
	CIRCLE_NAME_LENGTH_REDUCTION_MEDIUM: 0.85, // Size multiplier for medium names
	CIRCLE_NAME_LENGTH_REDUCTION_LONG: 0.9, // Size multiplier for long names

	// Typography - Depth adjustments
	CIRCLE_DEPTH_MULTIPLIER_MIN: 0.7, // Minimum depth multiplier
	CIRCLE_DEPTH_MULTIPLIER_BASE: 2.0, // Base depth multiplier
	CIRCLE_DEPTH_MULTIPLIER_STEP: 0.3, // Depth step reduction
	CIRCLE_LABEL_Y_OFFSET_RATIO: 0.3, // Y offset for circles with children

	// Visibility thresholds - Roles
	ROLE_VISIBILITY_MIN_RADIUS: 30, // Minimum circle radius to show roles
	ROLE_LABEL_VISIBILITY_MIN_RADIUS: 20, // Minimum rendered radius to show role label
	ROLE_OPACITY_MIN_SIZE: 8, // Minimum rendered radius for opacity calculation
	ROLE_OPACITY_MAX_SIZE: 25, // Maximum rendered radius for full opacity
	ROLE_OPACITY_MIN: 0.3, // Minimum opacity value
	ROLE_OPACITY_MAX: 1.0, // Maximum opacity value

	// Visibility thresholds - Circles
	CIRCLE_LABEL_MIN_RENDERED_RADIUS: 50, // Minimum rendered radius to show circle label
	CIRCLE_LABEL_LARGE_RENDERED_RADIUS: 100, // Large circle threshold
	CIRCLE_LABEL_ZOOMED_RENDERED_RADIUS: 60, // Minimum radius when zoomed in
	CIRCLE_CHILD_VISIBILITY_MIN_RENDERED_RADIUS: 80, // Minimum rendered radius for visible children
	CIRCLE_ZOOM_THRESHOLD: 1.5, // Zoom level threshold for visibility adjustments
	CIRCLE_CHILDREN_RATIO_THRESHOLD: 1.5, // Children size ratio threshold

	// Opacity values - Circles
	CIRCLE_FILL_OPACITY_WITH_CHILDREN: 0.7,
	CIRCLE_FILL_OPACITY_WITHOUT_CHILDREN: 0.85,
	CIRCLE_STROKE_OPACITY_ACTIVE: 1,
	CIRCLE_STROKE_OPACITY_HOVER: 0.8,
	CIRCLE_STROKE_OPACITY_HAS_CHILDREN: 0.5,
	CIRCLE_STROKE_OPACITY_DEFAULT: 0,

	// Opacity values - Roles
	ROLE_FILL_OPACITY_HOVER_BOOST: 0.3, // Additional opacity on hover
	ROLE_STROKE_OPACITY_HOVER_MULTIPLIER: 0.8, // Stroke opacity multiplier on hover
	ROLE_STROKE_OPACITY_DEFAULT_MULTIPLIER: 0.5, // Stroke opacity multiplier default

	// Stroke styling
	STROKE_DASHARRAY_HOVER: '6 3', // Dash pattern for hover state

	// Pack layout
	PACK_MAX_PASSES: 2, // Maximum passes for phantom calculation
	PACK_RADIUS_RATIO: 2.0, // Circle to role radius ratio
	PACK_PHANTOM_MARGIN_PX: 2, // Phantom margin in pixels

	// Truncation
	TEXT_TRUNCATION_ELLIPSIS_LENGTH: 3, // Characters to reserve for ellipsis
	MAX_LINES_CIRCLE_NAME: 2, // Maximum lines for circle name display
	MAX_LINES_ROLE_LABEL: 2 // Maximum lines for role label display
} as const;

export type OrgChartConfig = typeof ORG_CHART;
