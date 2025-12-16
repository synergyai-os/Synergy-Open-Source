import { hierarchy as d3Hierarchy, pack as d3Pack, type HierarchyNode } from 'd3-hierarchy';
import type { Id } from '$lib/convex';
import type { HierarchyNode as D3HierarchyNode } from 'd3-hierarchy';

/**
 * Role data with packed positions (relative to parent circle center)
 */
export type RoleNode = {
	roleId: Id<'circleRoles'>;
	name: string;
	status?: 'draft' | 'active'; // Role status
	isHiring?: boolean; // Open position flag
	x: number; // Position relative to parent circle center (0,0)
	y: number;
	r: number; // Radius of role circle
};

/**
 * Circle data from Convex with nested structure
 */
export type CircleNode = {
	circleId: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	name: string;
	slug: string;
	purpose?: string;
	parentCircleId?: Id<'circles'>;
	parentName?: string | null;
	memberCount: number;
	roleCount?: number; // Number of roles in this circle
	/**
	 * Optional explicit sizing value for synthetic leaf nodes (e.g. phantom leaves used for layout enforcement).
	 * Only respected by `calculateCircleValue` when the node is synthetic.
	 */
	_syntheticValue?: number;
	roles?: Array<{
		roleId: Id<'circleRoles'>;
		name: string;
		status?: 'draft' | 'active';
		isHiring?: boolean;
	}>; // Raw roles from backend
	packedRoles?: RoleNode[]; // Packed role positions (calculated after main layout)
	createdAt: number;
	updatedAt?: number;
	archivedAt?: number;
	children?: CircleNode[];
	_parentDepth?: number; // Store parent depth for synthetic role nodes (calculated during hierarchy building)
};

/**
 * D3 Hierarchy node with circle data
 */
export type CircleHierarchyNode = HierarchyNode<CircleNode> & {
	x: number;
	y: number;
	r: number;
};

/**
 * Transform flat Convex circles list into D3 hierarchy structure
 * Includes roles as synthetic circle nodes so they pack alongside child circles
 *
 * @param circles - Flat list of circles from Convex
 * @returns D3 hierarchy root node
 */
export function transformToHierarchy(circles: CircleNode[]): HierarchyNode<CircleNode> {
	if (circles.length === 0) {
		// Return empty hierarchy with synthetic root
		const syntheticRoot: CircleNode = {
			circleId: '' as Id<'circles'>,
			workspaceId: '' as Id<'workspaces'>,
			name: 'Organization',
			slug: 'root',
			memberCount: 0,
			createdAt: Date.now()
		};
		return d3Hierarchy(syntheticRoot);
	}

	// Build lookup map for fast parent resolution
	const circleMap = new Map<Id<'circles'>, CircleNode>();
	circles.forEach((circle) => {
		circleMap.set(circle.circleId, circle);
	});

	// Find root circles (no parent)
	const rootCircles = circles.filter((c) => !c.parentCircleId);

	// Build children map (includes both child circles AND roles as synthetic circles)
	const childrenMap = new Map<Id<'circles'>, CircleNode[]>();
	circles.forEach((circle) => {
		if (circle.parentCircleId) {
			const parent = circle.parentCircleId;
			if (!childrenMap.has(parent)) {
				childrenMap.set(parent, []);
			}
			childrenMap.get(parent)!.push(circle);
		}
	});

	// Add roles as synthetic circle nodes grouped together
	// Create a synthetic "roles group" node that contains all roles as children
	// This groups roles together instead of scattering them with child circles
	circles.forEach((circle) => {
		if (circle.roles && circle.roles.length > 0) {
			if (!childrenMap.has(circle.circleId)) {
				childrenMap.set(circle.circleId, []);
			}

			// Create synthetic circle nodes for individual roles
			const roleCircles: CircleNode[] = circle.roles.map((role) => ({
				circleId: `__role__${role.roleId}` as Id<'circles'>, // Synthetic ID
				workspaceId: circle.workspaceId,
				name: role.name,
				slug: `role-${role.roleId}`,
				parentCircleId: `__roles_group__${circle.circleId}` as Id<'circles'>, // Parent is roles group, not circle
				memberCount: 0,
				roleCount: 0,
				createdAt: circle.createdAt,
				// Store original role data for later extraction (including status/isHiring)
				roles: [
					{
						roleId: role.roleId,
						name: role.name,
						status: role.status,
						isHiring: role.isHiring
					}
				]
			}));

			// Create synthetic "roles group" node that contains all roles
			const rolesGroupNode: CircleNode = {
				circleId: `__roles_group__${circle.circleId}` as Id<'circles'>, // Synthetic grouping ID
				workspaceId: circle.workspaceId,
				name: 'Roles',
				slug: `roles-group-${circle.circleId}`,
				parentCircleId: circle.circleId, // Parent is the actual circle
				memberCount: 0,
				roleCount: circle.roles.length,
				createdAt: circle.createdAt
				// Don't set children here - buildHierarchy will get them from childrenMap
			};

			// Add roles group node to circle's children (alongside child circles)
			childrenMap.get(circle.circleId)!.push(rolesGroupNode);

			// Add roles group to childrenMap so buildHierarchy can find its children (roles)
			childrenMap.set(`__roles_group__${circle.circleId}` as Id<'circles'>, roleCircles);
		}
	});

	// Helper function to calculate depth of a circle by traversing parent chain
	function _calculateCircleDepth(circleId: Id<'circles'>): number {
		const circle = circleMap.get(circleId);
		if (!circle || !circle.parentCircleId) {
			return 0; // Root level
		}
		// Recursively calculate parent depth + 1
		return _calculateCircleDepth(circle.parentCircleId) + 1;
	}

	// Recursive function to build hierarchy
	function buildHierarchy(circle: CircleNode, depth: number = 0): CircleNode {
		const children = childrenMap.get(circle.circleId);
		if (children) {
			// Map children and set parent depth for synthetic role nodes
			const mappedChildren = children.map((child) => {
				if (isSyntheticRole(child.circleId)) {
					// Store parent depth in role node data
					// For roles in a roles group, use the group's parent depth (the actual circle)
					return {
						...child,
						_parentDepth: depth
					};
				}
				if (isRolesGroup(child.circleId)) {
					// Roles group node: build its children (roles) with same depth
					// Roles should have the same depth as the circle that contains the group
					const groupChildren = childrenMap.get(child.circleId);
					if (groupChildren) {
						const mappedGroupChildren = groupChildren.map((roleChild) => {
							if (isSyntheticRole(roleChild.circleId)) {
								return {
									...roleChild,
									_parentDepth: depth // Use circle's depth, not group's depth
								};
							}
							return roleChild;
						});
						return {
							...child,
							children: mappedGroupChildren
						};
					}
					return child;
				}
				// Recursively build hierarchy for regular circles
				return buildHierarchy(child, depth + 1);
			});
			return {
				...circle,
				children: mappedChildren
			};
		}
		return circle;
	}

	// If single root, use it
	if (rootCircles.length === 1) {
		const root = buildHierarchy(rootCircles[0]);
		return d3Hierarchy(root);
	}

	// Multiple roots: create synthetic parent
	// When building hierarchy for root circles, treat them as depth 0 (not depth 1)
	// This ensures roles in root circles get correct parent depth
	const syntheticRoot: CircleNode = {
		circleId: '__root__' as Id<'circles'>,
		workspaceId: circles[0].workspaceId,
		name: 'Organization',
		slug: 'root',
		memberCount: circles.reduce((sum, c) => sum + c.memberCount, 0),
		createdAt: Date.now(),
		children: rootCircles.map((rootCircle) => buildHierarchy(rootCircle, 0)) // Pass depth=0 explicitly
	};

	return d3Hierarchy(syntheticRoot);
}

/**
 * Circle-to-Role Size Ratio
 * Controls the minimum size advantage circles have over roles in their PARENT circle.
 * This ensures sub-circles (containers) are visibly larger than sibling roles (entities).
 *
 * Value interpretation (D3 pack layout: radius ∝ √value):
 * - 5.0 → circles compete with multiple roles (recommended for 2+ sibling roles)
 * - 2.25 → circles are ~1.5x larger than single role (insufficient for multiple roles)
 * - 9.0 → very pronounced difference
 *
 * Note: Must account for roles_group containing MULTIPLE roles (e.g., 2250 + 2250 = 4500)
 * With 5.0: sub-circle (11250) vs roles_group (4500) → √(11250/4500) = 1.58x radius
 */
export const MIN_CIRCLE_TO_ROLE_RATIO = 5.0;

/**
 * Calculate circle size based on depth, member count, and role count
 * Holaspirit-style: Children are 50% smaller than parents
 * Uses logarithmic scale for better visualization of varying team sizes
 * Synthetic role nodes scale with parent circle depth (deeper = smaller)
 */
export function calculateCircleValue(
	circle: CircleNode,
	node?: D3HierarchyNode<CircleNode>
): number {
	const shouldLog = false;
	if (shouldLog) {
		console.log('[calculateCircleValue START]', {
			circleId: String(circle.circleId).slice(0, 30),
			name: circle.name,
			isRolesGroup: isRolesGroup(circle.circleId),
			isSyntheticRole: isSyntheticRole(circle.circleId),
			isSyntheticPhantom: isSyntheticPhantom(circle.circleId),
			'circle.children': circle.children?.length ?? 'undefined',
			'circle.roleCount': circle.roleCount,
			nodeDepth: node?.depth
		});
	}

	// Roles group nodes are invisible containers - they should NOT contribute their own sizing value
	// Their size comes purely from the sum of children (the actual role nodes)
	// Returning 0 ensures D3 pack only uses the accumulated sum of child values
	// This prevents roles_group from inflating space and competing with sub-circles
	if (isRolesGroup(circle.circleId)) {
		if (shouldLog) {
			console.log('[calculateCircleValue] Returning 0 for roles_group:', circle.name);
		}
		return 0;
	}

	// Phantom leaf nodes are invisible layout helpers; they must be leaves and carry an explicit sizing value.
	if (isSyntheticPhantom(circle.circleId)) {
		return Math.max(0, circle._syntheticValue ?? 0);
	}

	// Synthetic role nodes scale with parent circle depth
	// Roles in top-level circles (depth 0) are largest
	// Roles in sub-circles (depth 1) are medium
	// Roles in sub-sub-circles (depth 2+) are smallest
	if (isSyntheticRole(circle.circleId)) {
		// Get parent depth from stored _parentDepth (set during hierarchy building)
		// Fallback to node.depth - 1 if _parentDepth not available
		let parentDepth = circle._parentDepth ?? Math.max(0, (node?.depth ?? 1) - 1);
		const originalParentDepth = parentDepth;
		let hasSyntheticRoot = false;

		// If there's a synthetic root (multiple root circles), adjust depth:
		// Synthetic root adds 1 to all depths, so subtract 1 to get actual circle depth
		// Check if we're under a synthetic root by checking if root is synthetic
		if (node) {
			let current = node.parent;
			while (current) {
				if (isSyntheticRoot(current.data.circleId)) {
					// We're under a synthetic root, adjust depth
					parentDepth = Math.max(0, parentDepth - 1);
					hasSyntheticRoot = true;
					break;
				}
				current = current.parent;
			}
		}

		// Base sizes: larger for higher hierarchy levels
		// D3 pack layout: radius ∝ √value, so for 1.5x radius we need 2.25x value
		// Roles are now nested: Circle → Roles Group → Role (extra constraint level)
		// Depth 0: Root circle roles (2250 → r ~1.5x bigger than before)
		// Depth 1: Sub-circle roles (500 → r ~35-40)
		// Depth 2: Sub-sub-circle roles (100 → r ~22-23)
		// Depth 3+: Deepest roles (35 → r ~17-18)
		const baseSizes = [2250, 500, 100, 35]; // depth 0, 1, 2, 3+
		const baseSize = baseSizes[Math.min(parentDepth, baseSizes.length - 1)];

		if (shouldLog) {
			console.log('[SYNTHETIC ROLE VALUE]', {
				circleId: String(circle.circleId).slice(0, 30),
				name: circle.name,
				'circle._parentDepth': circle._parentDepth,
				'node.depth': node?.depth,
				originalParentDepth,
				hasSyntheticRoot,
				adjustedParentDepth: parentDepth,
				baseSize,
				baseSizes
			});
		}

		return baseSize;
	}

	// Base size for root level circles
	const baseSize = 100;

	// Member count contribution (logarithmic)
	const memberSize = circle.memberCount > 0 ? Math.log2(circle.memberCount + 1) * 20 : 0;

	// Role count contribution (if available)
	const roleCount = (circle as CircleNode & { roleCount?: number }).roleCount ?? 0;
	const roleSize = roleCount > 0 ? Math.log2(roleCount + 1) * 15 : 0;

	// Calculate base value (before depth reduction and circle size boost)
	const baseValue = baseSize + memberSize + roleSize;

	// Children are 50% smaller than their parent
	// Depth 0 (root): 100% size
	// Depth 1: 50% size
	// Depth 2: 25% size
	// Depth 3: 12.5% size, etc.
	const depth = node?.depth ?? 0;
	const sizeMultiplier = Math.pow(0.5, depth);

	// Apply depth-based size reduction
	let finalValue = baseValue * sizeMultiplier;

	// Circle Size Boost: Ensure circles with children (roles or sub-circles) are larger than roles in PARENT circle
	// This guarantees visual hierarchy: sub-circles (containers) > sibling roles (entities)
	const hasChildren = circle.children && circle.children.length > 0;
	const hasRoles = (circle.roleCount ?? 0) > 0;

	if (shouldLog) {
		console.log('[Boost Check]', {
			circleId: String(circle.circleId).slice(0, 30),
			name: circle.name,
			hasChildren,
			hasRoles,
			wouldBoost: hasChildren || hasRoles,
			depth,
			baseValue,
			sizeMultiplier,
			valueBeforeBoost: finalValue
		});
	}

	if (hasChildren || hasRoles) {
		// Compare against role values in PARENT circle (depth - 1), not at this circle's depth
		// This ensures sub-circles are larger than their sibling roles in the parent
		// Example: depth-1 sub-circle compares against depth-0 roles (its siblings)
		const roleBaseSizes = [2250, 500, 100, 35]; // Same as role calculation
		const parentDepth = Math.max(0, depth - 1); // Parent's depth (0 for root circles)
		const parentRoleValue = roleBaseSizes[Math.min(parentDepth, roleBaseSizes.length - 1)];

		// Ensure circle is at least MIN_CIRCLE_TO_ROLE_RATIO times larger than parent's roles
		const minCircleValue = parentRoleValue * MIN_CIRCLE_TO_ROLE_RATIO;
		const valueBeforeBoost = finalValue;
		finalValue = Math.max(finalValue, minCircleValue);

		if (shouldLog) {
			console.log('[BOOST APPLIED]', {
				circleId: String(circle.circleId).slice(0, 30),
				name: circle.name,
				depth,
				parentDepth,
				parentRoleValue,
				minCircleValue,
				MIN_CIRCLE_TO_ROLE_RATIO,
				beforeBoost: valueBeforeBoost,
				afterBoost: finalValue,
				boostApplied: finalValue > valueBeforeBoost
			});
		}
	}

	// Minimum size ensures visibility (at least 20px radius)
	finalValue = Math.max(finalValue, 20);

	if (shouldLog) {
		console.log('[calculateCircleValue RESULT]', {
			circleId: String(circle.circleId).slice(0, 30),
			name: circle.name,
			finalValue
		});
	}

	return finalValue;
}

/**
 * ============================================================================
 * ORG CHART COLOR SYSTEM
 * ============================================================================
 *
 * Design Philosophy:
 * - CIRCLES are containers (teams, departments) → light, subtle, background-like
 * - ROLES are entities (positions, people) → solid, prominent, foreground-like
 *
 * Why single color for all circle depths?
 * - Scales to unlimited depth without running out of colors
 * - Hierarchy communicated through: nesting, size, stroke weight
 * - Avoids semantic confusion (no status colors misused for depth)
 *
 * Interactive States:
 * - Default: light fill, subtle stroke
 * - Hover (non-active): DASHED stroke, increased opacity
 * - Active/Selected: SOLID primary stroke
 *
 * See: src/lib/modules/org-chart/COLOR_STRATEGY.md for full documentation
 * ============================================================================
 */

/**
 * Get fill color for circles (containers)
 * Returns the same color for ALL depths - hierarchy shown through nesting/size
 */
export function getCircleColor(_depth?: number): string {
	// Single color for all depths - uses semantic token with light/dark mode support
	return 'var(--color-component-orgChart-circle-fill)';
}

/**
 * Get stroke color for circles based on state
 */
export function getCircleStrokeColor(state: 'default' | 'hover' | 'active'): string {
	switch (state) {
		case 'active':
			return 'var(--color-component-orgChart-circle-strokeActive)';
		case 'hover':
			return 'var(--color-component-orgChart-circle-strokeHover)';
		default:
			return 'var(--color-component-orgChart-circle-stroke)';
	}
}

/**
 * Get fill color for roles (entities)
 */
export function getRoleFillColor(state: 'default' | 'hover' = 'default'): string {
	return state === 'hover'
		? 'var(--color-component-orgChart-role-fillHover)'
		: 'var(--color-component-orgChart-role-fill)';
}

/**
 * Get text color for role labels
 */
export function getRoleTextColor(): string {
	return 'var(--color-component-orgChart-role-text)';
}

/**
 * Get stroke color for roles
 */
export function getRoleStrokeColor(): string {
	return 'var(--color-component-orgChart-role-stroke)';
}

/**
 * Get text color for circle labels
 */
export function getCircleLabelColor(): string {
	return 'var(--color-component-orgChart-label-text)';
}

/**
 * Get stroke color for circle labels (text outline for readability)
 */
export function getCircleLabelStrokeColor(): string {
	return 'var(--color-component-orgChart-label-stroke)';
}

/**
 * Pack roles as smaller circles inside a parent circle
 * Uses D3 pack layout scaled to fit inside parent circle radius
 *
 * @param roles - Array of roles to pack
 * @param parentRadius - Radius of the parent circle
 * @param padding - Padding between role circles (default: 3px)
 * @returns Array of RoleNode with calculated positions
 */
export function packRolesInsideCircle(
	roles: Array<{
		roleId: Id<'circleRoles'>;
		name: string;
		status?: 'draft' | 'active';
		isHiring?: boolean;
	}>,
	parentRadius: number,
	padding: number = 3
): RoleNode[] {
	if (roles.length === 0 || parentRadius < 20) {
		return [];
	}

	// Create hierarchy for roles (all siblings, no nesting)
	// Each role gets equal value for uniform sizing
	type RoleHierarchyData = {
		name: string;
		value?: number;
		children?: Array<{ name: string; value: number }>;
	};
	const roleHierarchy = d3Hierarchy<RoleHierarchyData>({
		name: 'roles',
		children: roles.map((r) => ({ name: r.name, value: 1 }))
	});

	// Calculate available space (leave margin for parent circle edge)
	// Use 85% of parent radius to ensure roles don't touch edge
	const availableRadius = parentRadius * 0.85;
	const packSize = availableRadius * 2;

	// Create mini pack layout for roles
	const rolePack = d3Pack<RoleHierarchyData>().size([packSize, packSize]).padding(padding);

	// Calculate positions - pack mutates the hierarchy and adds x, y, r properties
	const packedHierarchy = rolePack(roleHierarchy.sum((d) => d.value ?? 1));

	// Extract role nodes with positions relative to parent center (0,0)
	const roleNodes: RoleNode[] = [];
	const descendants = packedHierarchy.descendants();

	// Skip root (index 0), process children (roles)
	for (let i = 1; i < descendants.length; i++) {
		const node = descendants[i];
		const roleIndex = i - 1; // Adjust for root node

		// Type guard: check that node has required pack properties
		if (
			roleIndex < roles.length &&
			node.r !== undefined &&
			node.r > 0 &&
			node.x !== undefined &&
			node.y !== undefined
		) {
			// Calculate position relative to parent center (0,0)
			let x = node.x - packSize / 2;
			let y = node.y - packSize / 2;
			const r = node.r;

			// Validate bounds: ensure role stays within parent circle
			// Rule: distance from center + role radius + padding <= parent radius
			const distanceFromCenter = Math.sqrt(x ** 2 + y ** 2);
			const maxAllowedDistance = parentRadius - r - padding;

			if (distanceFromCenter > maxAllowedDistance && maxAllowedDistance > 0) {
				// Scale position to fit within bounds (maintain direction, reduce distance)
				const scale = maxAllowedDistance / distanceFromCenter;
				x *= scale;
				y *= scale;
			}

			roleNodes.push({
				roleId: roles[roleIndex].roleId,
				name: roles[roleIndex].name,
				status: roles[roleIndex].status,
				isHiring: roles[roleIndex].isHiring,
				x,
				y,
				r
			});
		}
	}

	return roleNodes;
}

/**
 * Check if circle is a synthetic root (created for multiple root circles)
 */
export function isSyntheticRoot(circleId: Id<'circles'>): boolean {
	return circleId === '__root__' || circleId === '';
}

/**
 * Check if a node is a synthetic role node (created for packing roles alongside circles)
 */
export function isSyntheticRole(circleId: Id<'circles'>): boolean {
	return String(circleId).startsWith('__role__');
}

/**
 * Extracts the actual roleId from a synthetic role circle ID.
 * Returns null if not a synthetic role.
 *
 * @example
 * extractRoleIdFromSynthetic('__role__abc123') // → 'abc123' as Id<'circleRoles'>
 * extractRoleIdFromSynthetic('real-circle-id') // → null
 */
export function extractRoleIdFromSynthetic(
	circleId: string | Id<'circles'>
): Id<'circleRoles'> | null {
	const idString = String(circleId);
	if (!isSyntheticRole(idString)) return null;
	return idString.replace('__role__', '') as Id<'circleRoles'>;
}

/**
 * Check if a node is a synthetic roles group node (contains roles as children)
 */
export function isRolesGroup(circleId: Id<'circles'>): boolean {
	return String(circleId).startsWith('__roles_group__');
}

/**
 * Check if a node is a synthetic phantom leaf node (used to enforce visual hierarchy in pack layout).
 */
export function isSyntheticPhantom(circleId: Id<'circles'>): boolean {
	return String(circleId).startsWith('__phantom__');
}
