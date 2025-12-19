/**
 * Navigation Constants
 *
 * Shared constants for stacked navigation system across all modules.
 * Defines layer type mappings, URL encoding, and navigation limits.
 */

/**
 * Layer type to URL prefix mapping
 * Used for URL encoding of navigation stacks
 *
 * @example
 * 'circle' → 'c' → URL: ?nav=c:abc123
 * 'role' → 'r' → URL: ?nav=c:abc123,r:def456
 */
export const LAYER_TYPE_TO_PREFIX = {
	circle: 'c',
	role: 'r',
	document: 'd',
	meeting: 'm',
	person: 'p',
	proposal: 'pr',
	task: 't'
} as const;

/**
 * URL prefix to layer type mapping (reverse of LAYER_TYPE_TO_PREFIX)
 * Used for URL decoding of navigation stacks
 */
export const PREFIX_TO_LAYER_TYPE = {
	c: 'circle',
	r: 'role',
	d: 'document',
	m: 'meeting',
	p: 'person',
	pr: 'proposal',
	t: 'task'
} as const;

/**
 * Valid layer types (derived from LAYER_TYPE_TO_PREFIX keys)
 */
export type LayerType = keyof typeof LAYER_TYPE_TO_PREFIX;

/**
 * Valid URL prefixes (derived from PREFIX_TO_LAYER_TYPE keys)
 */
export type LayerPrefix = keyof typeof PREFIX_TO_LAYER_TYPE;

/**
 * URL query parameter name for navigation stack
 * @example ?nav=c:abc123,r:def456
 */
export const NAV_QUERY_PARAM = 'nav';

/**
 * Maximum depth of navigation stack
 * Prevents infinite nesting and performance issues
 */
export const MAX_STACK_DEPTH = 10;
