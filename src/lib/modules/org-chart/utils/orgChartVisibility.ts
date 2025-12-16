/**
 * OrgChart Visibility Utilities
 *
 * Pure functions for determining element visibility in the org chart.
 * Uses depth-relative visibility patterns (inspired by Holaspirit).
 * These functions have zero dependencies on Svelte reactivity.
 */

import type { CircleHierarchyNode, RoleNode } from './orgChartTransform';
import { isSyntheticRole, isRolesGroup } from './orgChartTransform';
import { ORG_CHART } from '../constants/orgChartConstants';

/**
 * Determine if roles should be visible for a circle
 *
 * Show ALL roles on load, hide when too small
 *
 * @param node - Circle hierarchy node
 * @returns true if roles should be shown
 */
export function shouldShowRoles(node: CircleHierarchyNode): boolean {
	// Show roles when:
	// 1. Circle is large enough to display roles
	// 2. Roles exist and are packed
	const isLargeEnough = node.r > ORG_CHART.ROLE_VISIBILITY_MIN_RADIUS;
	const hasPackedRoles = node.data.packedRoles && node.data.packedRoles.length > 0;

	return isLargeEnough && Boolean(hasPackedRoles);
}

/**
 * Determine if circle name should be visible
 *
 * Uses depth-relative visibility to avoid overlap (Holaspirit pattern)
 *
 * @param node - Circle hierarchy node
 * @param focusNode - Currently focused node (null if none)
 * @param currentZoomLevel - Current zoom level from D3 transform
 * @returns true if circle name should be shown
 */
export function shouldShowCircleName(
	node: CircleHierarchyNode,
	focusNode: CircleHierarchyNode | null,
	currentZoomLevel: number
): boolean {
	// Calculate rendered size (radius * zoom level)
	const renderedRadius = node.r * currentZoomLevel;

	// Minimum size threshold - don't show labels for tiny circles
	if (renderedRadius < ORG_CHART.CIRCLE_LABEL_MIN_RENDERED_RADIUS) {
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
				childNode.r * currentZoomLevel > ORG_CHART.CIRCLE_CHILD_VISIBILITY_MIN_RENDERED_RADIUS
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
		if (childrenRatio > ORG_CHART.CIRCLE_CHILDREN_RATIO_THRESHOLD) {
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
	if (renderedRadius > ORG_CHART.CIRCLE_LABEL_LARGE_RENDERED_RADIUS) {
		return true;
	}

	// Show if zoomed in enough that this depth is prominent
	const isZoomedIn = currentZoomLevel > ORG_CHART.CIRCLE_ZOOM_THRESHOLD;
	if (isZoomedIn && renderedRadius > ORG_CHART.CIRCLE_LABEL_ZOOMED_RENDERED_RADIUS) {
		return true;
	}

	return false;
}

/**
 * Determine if role label should be visible (based purely on rendered size)
 *
 * Holaspirit pattern: roles become readable when zoomed in close enough
 *
 * @param role - Role node with radius
 * @param currentZoomLevel - Current zoom level from D3 transform
 * @returns true if role label should be shown
 */
export function shouldShowRoleLabel(role: RoleNode, currentZoomLevel: number): boolean {
	// Calculate rendered size (radius * zoom level)
	const renderedRadius = role.r * currentZoomLevel;

	// Show label when role is large enough to be readable
	// This is independent of circle name visibility - roles show their own labels
	// when zoomed in close enough, regardless of what else is visible
	return renderedRadius >= ORG_CHART.ROLE_LABEL_VISIBILITY_MIN_RADIUS;
}

/**
 * Calculate role opacity based on rendered size (progressive disclosure)
 *
 * Holaspirit pattern: roles are low opacity when small, higher when larger
 *
 * @param role - Role node with radius
 * @param currentZoomLevel - Current zoom level from D3 transform
 * @returns Opacity value between 0.3 and 1.0
 */
export function getRoleOpacity(role: RoleNode, currentZoomLevel: number): number {
	const renderedRadius = role.r * currentZoomLevel;

	// Progressive opacity: min at minimum visible size, max at readable size
	const minSize = ORG_CHART.ROLE_OPACITY_MIN_SIZE;
	const maxSize = ORG_CHART.ROLE_OPACITY_MAX_SIZE;
	const minOpacity = ORG_CHART.ROLE_OPACITY_MIN;
	const maxOpacity = ORG_CHART.ROLE_OPACITY_MAX;

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
