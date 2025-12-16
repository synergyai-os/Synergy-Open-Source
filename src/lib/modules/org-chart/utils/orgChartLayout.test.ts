/**
 * Tests for orgChartLayout utilities
 */

import { describe, it, expect } from 'vitest';
import {
	calculateBounds,
	splitIntoLines,
	processCircleName,
	getRoleLabelParams,
	getCircleLabelParams
} from './orgChartLayout';
import type { CircleHierarchyNode, RoleNode } from './orgChartTransform';

describe('calculateBounds', () => {
	it('returns default view for empty nodes', () => {
		const result = calculateBounds([], 1000, 800);
		expect(result).toEqual([0, 0, 1000]);
	});

	it('calculates bounds for single node', () => {
		const nodes = [
			{
				x: 500,
				y: 400,
				r: 100,
				data: { circleId: 'test', name: 'Test', packedRoles: [] }
			}
		] as CircleHierarchyNode[];

		const [centerX, centerY, viewWidth] = calculateBounds(nodes, 1000, 800);

		expect(centerX).toBe(500);
		expect(centerY).toBe(400);
		expect(viewWidth).toBeGreaterThan(0);
	});

	it('accounts for role positions in bounds calculation', () => {
		const nodes = [
			{
				x: 500,
				y: 400,
				r: 100,
				data: {
					circleId: 'test',
					name: 'Test',
					packedRoles: [{ roleId: 'role1', name: 'Role 1', x: 50, y: 50, r: 20 }]
				}
			}
		] as CircleHierarchyNode[];

		const result = calculateBounds(nodes, 1000, 800);
		expect(result).toBeDefined();
		expect(result[0]).toBeCloseTo(500, 1); // centerX
		expect(result[1]).toBeCloseTo(400, 1); // centerY
	});

	it('handles aspect ratio correctly for wide bounds', () => {
		const nodes = [
			{ x: 0, y: 400, r: 50, data: { circleId: '1', name: 'Left', packedRoles: [] } },
			{ x: 1000, y: 400, r: 50, data: { circleId: '2', name: 'Right', packedRoles: [] } }
		] as CircleHierarchyNode[];

		const [centerX, centerY, viewWidth] = calculateBounds(nodes, 1000, 800);

		expect(centerX).toBeCloseTo(500, 1);
		expect(centerY).toBeCloseTo(400, 1);
		expect(viewWidth).toBeGreaterThan(1000); // Wide bounds
	});

	it('handles aspect ratio correctly for tall bounds', () => {
		const nodes = [
			{ x: 500, y: 0, r: 50, data: { circleId: '1', name: 'Top', packedRoles: [] } },
			{ x: 500, y: 800, r: 50, data: { circleId: '2', name: 'Bottom', packedRoles: [] } }
		] as CircleHierarchyNode[];

		const [centerX, centerY, viewWidth] = calculateBounds(nodes, 1000, 800);

		expect(centerX).toBeCloseTo(500, 1);
		expect(centerY).toBeCloseTo(400, 1);
		expect(viewWidth).toBeGreaterThan(0);
	});
});

describe('splitIntoLines', () => {
	it('returns single line for short text', () => {
		const result = splitIntoLines('Short', 20, 2);
		expect(result).toEqual(['Short']);
	});

	it('splits text by words at max chars', () => {
		const result = splitIntoLines('This is a long text', 10, 2);
		expect(result.length).toBeGreaterThan(1);
		expect(result.every((line) => line.length <= 11)).toBe(true); // Allow ellipsis
	});

	it('truncates with ellipsis when exceeding max lines', () => {
		const result = splitIntoLines('One Two Three Four Five Six Seven', 10, 2);
		expect(result.length).toBeLessThanOrEqual(2);
		expect(result.some((line) => line.includes('…'))).toBe(true);
	});

	it('handles single very long word', () => {
		const result = splitIntoLines('Supercalifragilisticexpialidocious', 15, 2);
		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result[0].length).toBeLessThanOrEqual(16); // Truncated with ellipsis
	});

	it('respects maxLines limit', () => {
		const result = splitIntoLines('Word '.repeat(20), 10, 3);
		expect(result.length).toBeLessThanOrEqual(3);
	});

	it('handles empty string', () => {
		const result = splitIntoLines('', 20, 2);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe('');
	});

	it('preserves single word that fits', () => {
		const result = splitIntoLines('Word', 10, 2);
		expect(result).toEqual(['Word']);
	});
});

describe('processCircleName', () => {
	it('returns single line for short names', () => {
		const result = processCircleName('Short', 20);
		expect(result).toEqual({
			lines: ['Short'],
			wasTruncated: false
		});
	});

	it('wraps long names to multiple lines', () => {
		const result = processCircleName('Engineering Department', 15);
		expect(result.lines.length).toBeGreaterThan(1);
		expect(result.lines.length).toBeLessThanOrEqual(2);
	});

	it('truncates names exceeding 2 lines', () => {
		const result = processCircleName('This is a very long circle name that cannot fit', 15);
		expect(result.lines.length).toBe(2);
		expect(result.wasTruncated).toBe(true);
		expect(result.lines[1]).toContain('...');
	});

	it('handles single very long word', () => {
		const result = processCircleName('Supercalifragilisticexpialidocious', 15);
		expect(result.lines.length).toBe(1);
		expect(result.wasTruncated).toBe(true);
		expect(result.lines[0]).toContain('...');
	});

	it('preserves short multi-word names', () => {
		const result = processCircleName('Engineering', 20);
		expect(result).toEqual({
			lines: ['Engineering'],
			wasTruncated: false
		});
	});

	it('truncates when words overflow 2 lines', () => {
		const result = processCircleName('One Two Three Four Five Six', 10);
		expect(result.lines.length).toBe(2);
		expect(result.wasTruncated).toBe(true);
	});
});

describe('getRoleLabelParams', () => {
	it('calculates font size proportional to radius', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Test Role',
			x: 0,
			y: 0,
			r: 50
		};

		const result = getRoleLabelParams(role);

		expect(result.fontSize).toBeCloseTo(50 * 0.22, 2);
		expect(result.lineHeight).toBeCloseTo(result.fontSize * 1.25, 2);
	});

	it('splits long role names into lines', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'Very Long Role Name That Should Wrap',
			x: 0,
			y: 0,
			r: 30
		};

		const result = getRoleLabelParams(role);

		expect(result.lines.length).toBeGreaterThan(1);
		expect(result.lines.length).toBeLessThanOrEqual(2);
	});

	it('handles short role names', () => {
		const role: RoleNode = {
			roleId: 'test',
			name: 'CEO',
			x: 0,
			y: 0,
			r: 40
		};

		const result = getRoleLabelParams(role);

		expect(result.lines).toEqual(['CEO']);
	});

	it('scales correctly for different radii', () => {
		const smallRole: RoleNode = {
			roleId: 'small',
			name: 'Role',
			x: 0,
			y: 0,
			r: 20
		};

		const largeRole: RoleNode = {
			roleId: 'large',
			name: 'Role',
			x: 0,
			y: 0,
			r: 80
		};

		const smallResult = getRoleLabelParams(smallRole);
		const largeResult = getRoleLabelParams(largeRole);

		expect(largeResult.fontSize).toBeGreaterThan(smallResult.fontSize);
		expect(largeResult.lineHeight).toBeGreaterThan(smallResult.lineHeight);
	});
});

describe('getCircleLabelParams', () => {
	it('calculates label params for root circle', () => {
		const node: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 200,
			depth: 0,
			data: {
				circleId: 'root',
				name: 'Root Circle',
				packedRoles: []
			}
		};

		const result = getCircleLabelParams(node, 1.0, 1000);

		expect(result.fontSize).toBeGreaterThan(0);
		expect(result.labelWidth).toBeGreaterThan(0);
		expect(result.labelHeight).toBeGreaterThan(0);
		expect(result.displayLines).toContain('Root Circle');
	});

	it('adjusts font size for long names', () => {
		const shortName: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			data: {
				circleId: 'short',
				name: 'Short',
				packedRoles: []
			}
		};

		const longName: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			data: {
				circleId: 'long',
				name: 'Very Long Circle Name That Should Be Smaller',
				packedRoles: []
			}
		};

		const shortResult = getCircleLabelParams(shortName, 1.0, 1000);
		const longResult = getCircleLabelParams(longName, 1.0, 1000);

		// Long names get slightly smaller font
		expect(longResult.fontSize).toBeLessThanOrEqual(shortResult.fontSize);
	});

	it('applies depth multiplier correctly', () => {
		const rootNode: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			data: { circleId: 'root', name: 'Root', packedRoles: [] }
		};

		const childNode: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 2,
			data: { circleId: 'child', name: 'Child', packedRoles: [] }
		};

		const rootResult = getCircleLabelParams(rootNode, 1.0, 1000);
		const childResult = getCircleLabelParams(childNode, 1.0, 1000);

		// Root circles get larger text
		expect(rootResult.fontSize).toBeGreaterThan(childResult.fontSize);
	});

	it('positions label higher when node has children', () => {
		const withChildren: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			children: [{} as CircleHierarchyNode],
			data: { circleId: 'parent', name: 'Parent', packedRoles: [] }
		};

		const withoutChildren: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			data: { circleId: 'leaf', name: 'Leaf', packedRoles: [] }
		};

		const withResult = getCircleLabelParams(withChildren, 1.0, 1000);
		const withoutResult = getCircleLabelParams(withoutChildren, 1.0, 1000);

		expect(withResult.yOffset).toBeLessThan(withoutResult.yOffset);
	});

	it('scales with zoom level', () => {
		const node: CircleHierarchyNode = {
			x: 500,
			y: 400,
			r: 100,
			depth: 0,
			data: { circleId: 'test', name: 'Test', packedRoles: [] }
		};

		const zoom1 = getCircleLabelParams(node, 1.0, 1000);
		const zoom2 = getCircleLabelParams(node, 2.0, 1000);

		// Higher zoom = rendered radius is larger, but SVG font size should be smaller
		// (counter-scaling for semantic zoom)
		expect(zoom2.fontSize).toBeLessThan(zoom1.fontSize);
	});
});
