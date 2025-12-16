/**
 * Tests for orgChartVisibility utilities
 */

import { describe, it, expect } from 'vitest';
import {
	shouldShowRoles,
	shouldShowCircleName,
	shouldShowRoleLabel,
	getRoleOpacity
} from './orgChartVisibility';
import type { CircleHierarchyNode, RoleNode } from './orgChartTransform';

describe('shouldShowRoles', () => {
	it('shows roles when circle is large enough', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 50, // > 30 threshold
			depth: 0,
			data: {
				circleId: 'test',
				name: 'Test',
				packedRoles: [{ roleId: 'role1', name: 'Role 1', x: 0, y: 0, r: 10 }]
			}
		};

		expect(shouldShowRoles(node)).toBe(true);
	});

	it('hides roles when circle is too small', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 20, // < 30 threshold
			depth: 0,
			data: {
				circleId: 'test',
				name: 'Test',
				packedRoles: [{ roleId: 'role1', name: 'Role 1', x: 0, y: 0, r: 5 }]
			}
		};

		expect(shouldShowRoles(node)).toBe(false);
	});

	it('hides roles when no packed roles exist', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 50,
			depth: 0,
			data: {
				circleId: 'test',
				name: 'Test',
				packedRoles: []
			}
		};

		expect(shouldShowRoles(node)).toBe(false);
	});

	it('hides roles when packedRoles is undefined', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 50,
			depth: 0,
			data: {
				circleId: 'test',
				name: 'Test'
			}
		};

		expect(shouldShowRoles(node)).toBe(false);
	});
});

describe('shouldShowCircleName', () => {
	it('hides name when rendered radius is too small', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 30, // 30 * 1.0 = 30 < 50 threshold
			depth: 0,
			data: { circleId: 'test', name: 'Test', packedRoles: [] }
		};

		expect(shouldShowCircleName(node, null, 1.0)).toBe(false);
	});

	it('shows name for focused circle regardless of size', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 30,
			depth: 0,
			data: { circleId: 'test', name: 'Test', packedRoles: [] }
		};

		expect(shouldShowCircleName(node, node, 1.0)).toBe(false); // Still too small even when focused
	});

	it('shows name for large circles', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 150, // 150 * 1.0 = 150 > 100 threshold
			depth: 0,
			data: { circleId: 'test', name: 'Test', packedRoles: [] }
		};

		expect(shouldShowCircleName(node, null, 1.0)).toBe(true);
	});

	it('hides parent name when children are prominent', () => {
		const childNode: CircleHierarchyNode = {
			x: 100,
			y: 100,
			r: 60,
			depth: 1,
			data: { circleId: 'child', name: 'Child', packedRoles: [] }
		};

		const parentNode: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 100,
			depth: 0,
			children: [childNode],
			data: { circleId: 'parent', name: 'Parent', packedRoles: [] }
		};

		// Children rendered size (60 * 1.0) / parent rendered size (100 * 1.0) = 0.6
		// This is < 1.5 threshold, so doesn't hide due to children
		// But parent radius (100) is NOT > 100, and zoom (1.0) is NOT > 1.5
		// So name should be hidden
		expect(shouldShowCircleName(parentNode, null, 1.0)).toBe(false);
	});

	it('shows name when zoomed in enough', () => {
		const node: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 40, // 40 * 2.0 = 80 > 60 threshold when zoomed
			depth: 0,
			data: { circleId: 'test', name: 'Test', packedRoles: [] }
		};

		expect(shouldShowCircleName(node, null, 2.0)).toBe(true); // Zoomed in > 1.5
	});

	it('shows focused circle even with prominent children', () => {
		const childNode: CircleHierarchyNode = {
			x: 100,
			y: 100,
			r: 80, // Large child
			depth: 1,
			data: { circleId: 'child', name: 'Child', packedRoles: [] }
		};

		const parentNode: CircleHierarchyNode = {
			x: 0,
			y: 0,
			r: 50, // Parent rendered = 50, child rendered = 80
			depth: 0,
			children: [childNode],
			data: { circleId: 'parent', name: 'Parent', packedRoles: [] }
		};

		// childrenRatio = 80 / 50 = 1.6 > 1.5, so would hide unless focused
		expect(shouldShowCircleName(parentNode, parentNode, 1.0)).toBe(true);
	});
});

describe('shouldShowRoleLabel', () => {
	it('shows label when rendered radius is large enough', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 25 // 25 * 1.0 = 25 >= 20 threshold
		};

		expect(shouldShowRoleLabel(role, 1.0)).toBe(true);
	});

	it('hides label when rendered radius is too small', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 15 // 15 * 1.0 = 15 < 20 threshold
		};

		expect(shouldShowRoleLabel(role, 1.0)).toBe(false);
	});

	it('shows label when zoomed in enough', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 12 // 12 * 2.0 = 24 >= 20 threshold
		};

		expect(shouldShowRoleLabel(role, 2.0)).toBe(true);
	});

	it('handles boundary condition exactly at threshold', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 20 // Exactly at threshold
		};

		expect(shouldShowRoleLabel(role, 1.0)).toBe(true);
	});
});

describe('getRoleOpacity', () => {
	it('returns minimum opacity for very small roles', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 5 // 5 * 1.0 = 5 < 8 (minSize)
		};

		expect(getRoleOpacity(role, 1.0)).toBe(0.3);
	});

	it('returns maximum opacity for large roles', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 30 // 30 * 1.0 = 30 > 25 (maxSize)
		};

		expect(getRoleOpacity(role, 1.0)).toBe(1.0);
	});

	it('interpolates opacity for medium-sized roles', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 16.5 // 16.5 * 1.0 = 16.5 (midpoint between 8 and 25)
		};

		const opacity = getRoleOpacity(role, 1.0);
		expect(opacity).toBeGreaterThan(0.3);
		expect(opacity).toBeLessThan(1.0);
		expect(opacity).toBeCloseTo(0.65, 1); // Midpoint of 0.3 and 1.0
	});

	it('scales with zoom level', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 10 // 10 * 2.0 = 20 (medium size when zoomed)
		};

		const opacity = getRoleOpacity(role, 2.0);
		expect(opacity).toBeGreaterThan(0.3);
		expect(opacity).toBeLessThan(1.0);
	});

	it('handles boundary conditions at minSize', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 8 // Exactly at minSize
		};

		expect(getRoleOpacity(role, 1.0)).toBe(0.3);
	});

	it('handles boundary conditions at maxSize', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 25 // Exactly at maxSize
		};

		expect(getRoleOpacity(role, 1.0)).toBe(1.0);
	});
});
