import { hierarchy as d3Hierarchy, pack as d3Pack, type HierarchyNode } from 'd3-hierarchy';
import type { Id } from '$lib/convex';
import type { CircleHierarchyNode, CircleNode } from './orgChartTransform';
import {
	calculateCircleValue,
	isRolesGroup,
	isSyntheticPhantom,
	isSyntheticRole,
	isSyntheticRoot,
	transformToHierarchy
} from './orgChartTransform';
import { ORG_CHART } from '../constants/orgChartConstants';

type PhantomPlanByCircleId = Record<
	string,
	{
		phantomValue: number;
	}
>;

const SHOULD_LOG_DIAGNOSTICS = false;

function injectPhantomsIntoTree(
	node: CircleNode,
	planByCircleId: PhantomPlanByCircleId
): CircleNode {
	const cloned: CircleNode = {
		...node,
		children: node.children
			? node.children.map((child) => injectPhantomsIntoTree(child, planByCircleId))
			: undefined
	};
	const planned = planByCircleId[String(cloned.circleId)];
	if (planned) {
		const phantomNode: CircleNode = {
			circleId: `__phantom__${String(cloned.circleId)}__0` as Id<'circles'>,
			workspaceId: cloned.workspaceId,
			name: '__phantom__',
			slug: `phantom-${String(cloned.circleId)}`,
			parentCircleId: cloned.circleId,
			memberCount: 0,
			roleCount: 0,
			createdAt: cloned.createdAt,
			_syntheticValue: planned.phantomValue
		};
		cloned.children = [...(cloned.children ?? []), phantomNode];
	}
	return cloned;
}

function buildRootHierarchyWithPhantoms(
	circles: CircleNode[],
	planByCircleId: PhantomPlanByCircleId
): HierarchyNode<CircleNode> {
	const baseRoot = transformToHierarchy(circles);
	if (Object.keys(planByCircleId).length === 0) {
		return baseRoot;
	}

	// Important: transformToHierarchy already built the tree. To add new children we rebuild hierarchy
	// from a cloned data tree with phantoms injected so D3 hierarchy nodes are consistent.
	const injectedRootData = injectPhantomsIntoTree(baseRoot.data, planByCircleId);
	return d3Hierarchy(injectedRootData);
}

function computePackedRoot(
	circles: CircleNode[],
	width: number,
	height: number,
	planByCircleId: PhantomPlanByCircleId
): CircleHierarchyNode {
	const root = buildRootHierarchyWithPhantoms(circles, planByCircleId);

	root.sum(function (this: HierarchyNode<CircleNode>, d: CircleNode) {
		return calculateCircleValue(d, this);
	});

	root.sort((a, b) => {
		const aValue = a.value ?? 0;
		const bValue = b.value ?? 0;
		return bValue - aValue;
	});

	const pack = d3Pack<CircleNode>().size([width, height]).padding(ORG_CHART.PACK_PADDING);
	return pack(root) as unknown as CircleHierarchyNode;
}

function median(numbers: number[]): number | null {
	if (numbers.length === 0) return null;
	const sorted = [...numbers].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function estimatePackScaleFromRoleLeaves(packedRoot: CircleHierarchyNode): number | null {
	// For leaf nodes when pack.radius is null, r is proportional to sqrt(value) up to global scale.
	const samples: number[] = [];
	for (const n of packedRoot.descendants() as CircleHierarchyNode[]) {
		if (!isSyntheticRole(n.data.circleId)) continue;
		const v = n.value ?? 0;
		if (v <= 0 || !Number.isFinite(v) || !Number.isFinite(n.r) || n.r <= 0) continue;
		samples.push(n.r / Math.sqrt(v));
	}
	return median(samples);
}

function computeMaxRoleRadiusByParentCircleId(
	packedRoot: CircleHierarchyNode
): Record<string, number> {
	const maxByCircleId: Record<string, number> = {};
	for (const n of packedRoot.descendants() as CircleHierarchyNode[]) {
		if (!isSyntheticRole(n.data.circleId)) continue;

		const parent = n.parent as CircleHierarchyNode | null;
		if (!parent) continue;

		// Roles are nested: circle -> roles_group -> role, but keep backward compatibility just in case.
		let circleNode: CircleHierarchyNode | null = parent;
		if (isRolesGroup(parent.data.circleId) && parent.parent) {
			circleNode = parent.parent as CircleHierarchyNode;
		}

		if (!circleNode || isSyntheticRoot(circleNode.data.circleId)) continue;
		const key = String(circleNode.data.circleId);
		const current = maxByCircleId[key] ?? 0;
		if (n.r > current) maxByCircleId[key] = n.r;
	}
	return maxByCircleId;
}

function computeMaxRoleRadiusInSubtreeByCircleId(
	packedRoot: CircleHierarchyNode
): Record<string, number> {
	const maxByCircleId: Record<string, number> = {};
	for (const n of packedRoot.descendants() as CircleHierarchyNode[]) {
		if (!isSyntheticRole(n.data.circleId)) continue;

		let current = n.parent as CircleHierarchyNode | null;
		while (current) {
			if (
				!isSyntheticRoot(current.data.circleId) &&
				!isRolesGroup(current.data.circleId) &&
				!isSyntheticRole(current.data.circleId) &&
				!isSyntheticPhantom(current.data.circleId)
			) {
				const key = String(current.data.circleId);
				const existing = maxByCircleId[key] ?? 0;
				if (n.r > existing) maxByCircleId[key] = n.r;
			}
			current = current.parent as CircleHierarchyNode | null;
		}
	}
	return maxByCircleId;
}

function computePhantomPlan(
	packedRoot: CircleHierarchyNode,
	roleMaxByParentCircleId: Record<string, number>,
	roleMaxInSubtreeByCircleId: Record<string, number>,
	radiusRatio: number,
	phantomMarginPx: number
): PhantomPlanByCircleId {
	const scale = estimatePackScaleFromRoleLeaves(packedRoot);
	if (!scale) return {};

	const plan: PhantomPlanByCircleId = {};

	for (const n of packedRoot.descendants() as CircleHierarchyNode[]) {
		if (isSyntheticRoot(n.data.circleId)) continue;
		if (isRolesGroup(n.data.circleId)) continue;
		if (isSyntheticRole(n.data.circleId)) continue;
		if (isSyntheticPhantom(n.data.circleId)) continue;

		const parent = n.parent as CircleHierarchyNode | null;
		if (!parent || isSyntheticRoot(parent.data.circleId)) continue;

		const parentCircleId = String(parent.data.circleId);
		const maxRoleRadiusInParent = roleMaxByParentCircleId[parentCircleId] ?? 0;
		const maxRoleRadiusInSubtree = roleMaxInSubtreeByCircleId[String(n.data.circleId)] ?? 0;
		const targetRadius = Math.max(
			maxRoleRadiusInParent * radiusRatio,
			maxRoleRadiusInSubtree * radiusRatio
		);
		if (targetRadius <= 0) continue;
		if (n.r >= targetRadius) continue;

		const phantomRadius = Math.max(1, targetRadius - phantomMarginPx);
		const phantomValue = (phantomRadius / scale) ** 2;

		plan[String(n.data.circleId)] = { phantomValue };
	}

	return plan;
}

/**
 * Computes packed nodes for the org chart using D3 pack, while enforcing that child circles
 * appear larger than sibling roles by inflating circle enclosures using invisible phantom leaf nodes.
 */
export function getPackedOrgChartNodes(
	circles: CircleNode[],
	width: number,
	height: number,
	options?: {
		maxPasses?: number;
		circleToRoleRadiusRatio?: number;
		phantomMarginPx?: number;
	}
): CircleHierarchyNode[] {
	const maxPasses = options?.maxPasses ?? ORG_CHART.PACK_MAX_PASSES;
	const radiusRatio = options?.circleToRoleRadiusRatio ?? ORG_CHART.PACK_RADIUS_RATIO;
	const phantomMarginPx = options?.phantomMarginPx ?? ORG_CHART.PACK_PHANTOM_MARGIN_PX;

	let planByCircleId: PhantomPlanByCircleId = {};
	let packedRoot = computePackedRoot(circles, width, height, planByCircleId);

	for (let i = 0; i < maxPasses; i++) {
		const roleMaxByParentCircleId = computeMaxRoleRadiusByParentCircleId(packedRoot);
		const roleMaxInSubtreeByCircleId = computeMaxRoleRadiusInSubtreeByCircleId(packedRoot);
		const nextPlan = computePhantomPlan(
			packedRoot,
			roleMaxByParentCircleId,
			roleMaxInSubtreeByCircleId,
			radiusRatio,
			phantomMarginPx
		);

		if (SHOULD_LOG_DIAGNOSTICS) {
			console.table(
				(packedRoot.descendants() as CircleHierarchyNode[]).map((n) => ({
					id: String(n.data.circleId).slice(0, 20),
					name: String(n.data.name ?? '-').slice(0, 12),
					depth: n.depth,
					value: n.value,
					r: Math.round(n.r),
					isPhantom: isSyntheticPhantom(n.data.circleId),
					isRole: isSyntheticRole(n.data.circleId),
					parent: String(n.parent?.data.name ?? 'ROOT').slice(0, 10)
				}))
			);
		}

		// If the plan didn't change, we converged.
		const nextKeys = Object.keys(nextPlan);
		const currentKeys = Object.keys(planByCircleId);
		const unchanged =
			nextKeys.length === currentKeys.length &&
			nextKeys.every((k) => planByCircleId[k]?.phantomValue === nextPlan[k]?.phantomValue);

		if (nextKeys.length === 0 || unchanged) break;

		planByCircleId = nextPlan;
		packedRoot = computePackedRoot(circles, width, height, planByCircleId);
	}

	return packedRoot.descendants() as CircleHierarchyNode[];
}
