/**
 * Tests for orgChartStyling utilities
 */

import { describe, it, expect } from 'vitest';
import { getRoleStrokeWidth, getCircleStrokeWidth } from './orgChartStyling';

describe('getRoleStrokeWidth', () => {
	describe('selected state', () => {
		it('calculates proportional width for medium radius', () => {
			const result = getRoleStrokeWidth(50, 'selected');
			expect(result).toBeGreaterThan(0);
			expect(result).toBeLessThanOrEqual(3); // Max bound
		});

		it('clamps to minimum bound', () => {
			const result = getRoleStrokeWidth(5, 'selected');
			expect(result).toBe(1); // Min bound for selected
		});

		it('clamps to maximum bound', () => {
			const result = getRoleStrokeWidth(100, 'selected');
			expect(result).toBe(3); // Max bound for selected
		});

		it('scales proportionally within bounds', () => {
			const small = getRoleStrokeWidth(20, 'selected');
			const large = getRoleStrokeWidth(30, 'selected');
			expect(large).toBeGreaterThan(small);
		});
	});

	describe('hover state', () => {
		it('uses smaller multiplier than selected', () => {
			const radius = 50;
			const selected = getRoleStrokeWidth(radius, 'selected');
			const hover = getRoleStrokeWidth(radius, 'hover');
			expect(hover).toBeLessThan(selected);
		});

		it('clamps to minimum bound', () => {
			const result = getRoleStrokeWidth(5, 'hover');
			expect(result).toBe(0.8); // Min bound for hover
		});

		it('clamps to maximum bound', () => {
			const result = getRoleStrokeWidth(100, 'hover');
			expect(result).toBe(2); // Max bound for hover
		});
	});

	describe('default state', () => {
		it('uses smallest multiplier', () => {
			const radius = 50;
			const selected = getRoleStrokeWidth(radius, 'selected');
			const hover = getRoleStrokeWidth(radius, 'hover');
			const defaultWidth = getRoleStrokeWidth(radius, 'default');

			expect(defaultWidth).toBeLessThan(hover);
			expect(defaultWidth).toBeLessThan(selected);
		});

		it('clamps to minimum bound', () => {
			const result = getRoleStrokeWidth(5, 'default');
			expect(result).toBe(0.5); // Min bound for default
		});

		it('clamps to maximum bound', () => {
			const result = getRoleStrokeWidth(100, 'default');
			expect(result).toBe(1.5); // Max bound for default
		});
	});

	describe('proportional scaling', () => {
		it('maintains relative proportions across states', () => {
			const radius = 40;
			const selected = getRoleStrokeWidth(radius, 'selected');
			const hover = getRoleStrokeWidth(radius, 'hover');
			const defaultWidth = getRoleStrokeWidth(radius, 'default');

			// Verify hierarchy: selected > hover > default
			expect(selected).toBeGreaterThan(hover);
			expect(hover).toBeGreaterThan(defaultWidth);
		});

		it('scales with radius within bounds', () => {
			const small = getRoleStrokeWidth(25, 'hover');
			const medium = getRoleStrokeWidth(35, 'hover');
			const large = getRoleStrokeWidth(45, 'hover');

			expect(medium).toBeGreaterThan(small);
			expect(large).toBeGreaterThanOrEqual(medium); // May hit max bound
		});
	});
});

describe('getCircleStrokeWidth', () => {
	describe('active state', () => {
		it('calculates proportional width for medium radius', () => {
			const result = getCircleStrokeWidth(100, 'active');
			expect(result).toBeGreaterThan(0);
			expect(result).toBeLessThanOrEqual(4); // Max bound
		});

		it('clamps to minimum bound', () => {
			const result = getCircleStrokeWidth(10, 'active');
			expect(result).toBe(1.5); // Min bound for active
		});

		it('clamps to maximum bound', () => {
			const result = getCircleStrokeWidth(500, 'active');
			expect(result).toBe(4); // Max bound for active
		});

		it('scales proportionally within bounds', () => {
			const small = getCircleStrokeWidth(80, 'active');
			const large = getCircleStrokeWidth(120, 'active');
			expect(large).toBeGreaterThan(small);
		});
	});

	describe('hover state', () => {
		it('uses smaller multiplier than active', () => {
			const radius = 100;
			const active = getCircleStrokeWidth(radius, 'active');
			const hover = getCircleStrokeWidth(radius, 'hover');
			expect(hover).toBeLessThan(active);
		});

		it('clamps to minimum bound', () => {
			const result = getCircleStrokeWidth(10, 'hover');
			expect(result).toBe(1); // Min bound for hover
		});

		it('clamps to maximum bound', () => {
			const result = getCircleStrokeWidth(500, 'hover');
			expect(result).toBe(3); // Max bound for hover
		});
	});

	describe('hasChildren state', () => {
		it('uses smaller multiplier than hover', () => {
			const radius = 100;
			const hover = getCircleStrokeWidth(radius, 'hover');
			const hasChildren = getCircleStrokeWidth(radius, 'hasChildren');
			expect(hasChildren).toBeLessThan(hover);
		});

		it('clamps to minimum bound', () => {
			const result = getCircleStrokeWidth(10, 'hasChildren');
			expect(result).toBe(0.8); // Min bound for hasChildren
		});

		it('clamps to maximum bound', () => {
			const result = getCircleStrokeWidth(500, 'hasChildren');
			expect(result).toBe(2); // Max bound for hasChildren
		});
	});

	describe('none state', () => {
		it('returns 0 for all radii', () => {
			expect(getCircleStrokeWidth(10, 'none')).toBe(0);
			expect(getCircleStrokeWidth(100, 'none')).toBe(0);
			expect(getCircleStrokeWidth(500, 'none')).toBe(0);
		});
	});

	describe('proportional scaling', () => {
		it('maintains relative proportions across states', () => {
			const radius = 120;
			const active = getCircleStrokeWidth(radius, 'active');
			const hover = getCircleStrokeWidth(radius, 'hover');
			const hasChildren = getCircleStrokeWidth(radius, 'hasChildren');

			// Verify hierarchy: active > hover > hasChildren > none
			expect(active).toBeGreaterThan(hover);
			expect(hover).toBeGreaterThan(hasChildren);
			expect(hasChildren).toBeGreaterThan(0);
		});

		it('scales with radius within bounds', () => {
			const small = getCircleStrokeWidth(60, 'active');
			const medium = getCircleStrokeWidth(100, 'active');
			const large = getCircleStrokeWidth(140, 'active');

			expect(medium).toBeGreaterThan(small);
			expect(large).toBeGreaterThanOrEqual(medium); // May hit max bound
		});
	});

	describe('boundary conditions', () => {
		it('handles very small radii', () => {
			const result = getCircleStrokeWidth(1, 'active');
			expect(result).toBe(1.5); // Should clamp to min
		});

		it('handles very large radii', () => {
			const result = getCircleStrokeWidth(1000, 'active');
			expect(result).toBe(4); // Should clamp to max
		});

		it('handles zero radius', () => {
			const result = getCircleStrokeWidth(0, 'hover');
			expect(result).toBe(1); // Should clamp to min
		});
	});
});
