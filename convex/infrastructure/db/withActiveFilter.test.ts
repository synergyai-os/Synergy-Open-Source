import { describe, expect, test, vi } from 'vitest';
import { withActiveFilter } from './withActiveFilter';

describe('withActiveFilter', () => {
	test('returns active results when includeArchived is false', async () => {
		const active = vi.fn().mockResolvedValue(['active']);
		const all = vi.fn().mockResolvedValue(['all']);

		const result = await withActiveFilter({ includeArchived: false, active, all });

		expect(result).toEqual(['active']);
		expect(active).toHaveBeenCalledOnce();
		expect(all).not.toHaveBeenCalled();
	});

	test('returns all results when includeArchived is true', async () => {
		const active = vi.fn().mockResolvedValue(['active']);
		const all = vi.fn().mockResolvedValue(['all']);

		const result = await withActiveFilter({ includeArchived: true, active, all });

		expect(result).toEqual(['all']);
		expect(all).toHaveBeenCalledOnce();
		expect(active).not.toHaveBeenCalled();
	});

	test('defaults to active when includeArchived is undefined', async () => {
		const active = vi.fn().mockResolvedValue(['active']);
		const all = vi.fn().mockResolvedValue(['all']);

		const result = await withActiveFilter({ includeArchived: undefined, active, all });

		expect(result).toEqual(['active']);
		expect(active).toHaveBeenCalledOnce();
		expect(all).not.toHaveBeenCalled();
	});
});
