import { hierarchy as d3Hierarchy, pack as d3Pack, type HierarchyNode } from 'd3-hierarchy';
import type { Id } from '$lib/convex';
import type { HierarchyNode as D3HierarchyNode } from 'd3-hierarchy';

/**
 * Role data with packed positions (relative to parent circle center)
 */
export type RoleNode = {
	roleId: Id<'circleRoles'>;
	name: string;
	x: number; // Position relative to parent circle center (0,0)
	y: number;
	r: number; // Radius of role circle
};

/**
 * Circle data from Convex with nested structure
 */
export type CircleNode = {
	circleId: Id<'circles'>;
	organizationId: Id<'organizations'>;
	name: string;
	slug: string;
	purpose?: string;
	parentCircleId?: Id<'circles'>;
	parentName?: string | null;
	memberCount: number;
	roleCount?: number; // Number of roles in this circle
	roles?: Array<{ roleId: Id<'circleRoles'>; name: string }>; // Raw roles from backend
	packedRoles?: RoleNode[]; // Packed role positions (calculated after main layout)
	createdAt: number;
	updatedAt?: number;
	archivedAt?: number;
	children?: CircleNode[];
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
			organizationId: '' as Id<'organizations'>,
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
		console.log(
			`🗺️ Circle "${circle.name}" (${circle.circleId}) → parent: ${circle.parentCircleId || 'NONE'}`
		);
	});

	// Find root circles (no parent)
	const rootCircles = circles.filter((c) => !c.parentCircleId);
	console.log(
		`🌱 Found ${rootCircles.length} root circles:`,
		rootCircles.map((c) => c.name)
	);

	// Build children map (includes both child circles AND roles as synthetic circles)
	const childrenMap = new Map<Id<'circles'>, CircleNode[]>();
	circles.forEach((circle) => {
		if (circle.parentCircleId) {
			const parent = circle.parentCircleId;
			if (!childrenMap.has(parent)) {
				childrenMap.set(parent, []);
			}
			childrenMap.get(parent)!.push(circle);
			console.log(`👶 "${circle.name}" is child of parent ID: ${parent}`);
		}
	});

	// Add roles as synthetic circle nodes (so they pack alongside child circles)
	circles.forEach((circle) => {
		if (circle.roles && circle.roles.length > 0) {
			if (!childrenMap.has(circle.circleId)) {
				childrenMap.set(circle.circleId, []);
			}
			// Create synthetic circle nodes for roles
			const roleCircles: CircleNode[] = circle.roles.map((role) => ({
				circleId: `__role__${role.roleId}` as Id<'circles'>, // Synthetic ID
				organizationId: circle.organizationId,
				name: role.name,
				slug: `role-${role.roleId}`,
				parentCircleId: circle.circleId,
				memberCount: 0,
				roleCount: 0,
				createdAt: circle.createdAt,
				// Store original role data for later extraction
				roles: [{ roleId: role.roleId, name: role.name }]
			}));
			childrenMap.get(circle.circleId)!.push(...roleCircles);
			console.log(`🎭 Added ${roleCircles.length} roles as synthetic circles to "${circle.name}"`);
		}
	});

	console.log(
		`📊 Children map:`,
		Array.from(childrenMap.entries()).map(([parentId, children]) => ({
			parentId,
			childrenNames: children.map((c) => c.name)
		}))
	);

	// Recursive function to build hierarchy
	function buildHierarchy(circle: CircleNode): CircleNode {
		const children = childrenMap.get(circle.circleId);
		if (children) {
			return {
				...circle,
				children: children.map(buildHierarchy)
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
	const syntheticRoot: CircleNode = {
		circleId: '__root__' as Id<'circles'>,
		organizationId: circles[0].organizationId,
		name: 'Organization',
		slug: 'root',
		memberCount: circles.reduce((sum, c) => sum + c.memberCount, 0),
		createdAt: Date.now(),
		children: rootCircles.map(buildHierarchy)
	};

	return d3Hierarchy(syntheticRoot);
}

/**
 * Calculate circle size based on depth, member count, and role count
 * Holaspirit-style: Children are 50% smaller than parents
 * Uses logarithmic scale for better visualization of varying team sizes
 * Synthetic role nodes get a small fixed size
 */
export function calculateCircleValue(
	circle: CircleNode,
	node?: D3HierarchyNode<CircleNode>
): number {
	// Synthetic role nodes get a small fixed size (smaller than regular circles)
	if (isSyntheticRole(circle.circleId)) {
		return 15; // Small fixed size for role circles
	}

	// Base size for root level circles
	const baseSize = 100;

	// Member count contribution (logarithmic)
	const memberSize = circle.memberCount > 0 ? Math.log2(circle.memberCount + 1) * 20 : 0;

	// Role count contribution (if available)
	const roleCount = (circle as CircleNode & { roleCount?: number }).roleCount ?? 0;
	const roleSize = roleCount > 0 ? Math.log2(roleCount + 1) * 15 : 0;

	// Calculate base value (before depth reduction)
	const baseValue = baseSize + memberSize + roleSize;

	// Children are 50% smaller than their parent
	// Depth 0 (root): 100% size
	// Depth 1: 50% size
	// Depth 2: 25% size
	// Depth 3: 12.5% size, etc.
	const depth = node?.depth ?? 0;
	const sizeMultiplier = Math.pow(0.5, depth);

	// Minimum size ensures visibility (at least 20px radius)
	const finalValue = Math.max(baseValue * sizeMultiplier, 20);

	return finalValue;
}

/**
 * Get color for circle based on depth level
 */
export function getCircleColor(depth: number): string {
	const colors = [
		'hsl(210, 70%, 60%)', // Level 0 (root) - blue
		'hsl(140, 60%, 55%)', // Level 1 - green
		'hsl(30, 80%, 60%)', // Level 2 - orange
		'hsl(280, 60%, 65%)', // Level 3 - purple
		'hsl(0, 70%, 60%)' // Level 4+ - red
	];
	return colors[Math.min(depth, colors.length - 1)];
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
	roles: Array<{ roleId: Id<'circleRoles'>; name: string }>,
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
