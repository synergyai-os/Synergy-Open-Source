/**
 * Cleanup Legacy circleItems/circleItemCategories Data
 *
 * SYOS-790: Since we're pre-launch with no real users, we can safely delete
 * all legacy data instead of migrating it.
 *
 * This script:
 * 1. Deletes all circleItemCategories records
 * 2. Deletes all circleItems records
 *
 * After running this, XDOM-01 invariant will pass.
 */

import { internalMutation } from '../_generated/server';

/**
 * Delete all circleItemCategories records
 */
export const deleteAllCircleItemCategories = internalMutation({
	args: {},
	handler: async (ctx) => {
		const categories = await ctx.db.query('circleItemCategories').collect();
		let deleted = 0;

		for (const category of categories) {
			await ctx.db.delete(category._id);
			deleted++;
		}

		return {
			deleted,
			message: `Deleted ${deleted} circleItemCategories records`
		};
	}
});

/**
 * Delete all circleItems records
 */
export const deleteAllCircleItems = internalMutation({
	args: {},
	handler: async (ctx) => {
		const items = await ctx.db.query('circleItems').collect();
		let deleted = 0;

		for (const item of items) {
			await ctx.db.delete(item._id);
			deleted++;
		}

		return {
			deleted,
			message: `Deleted ${deleted} circleItems records`
		};
	}
});

/**
 * Run full cleanup - delete all legacy circle items data
 */
export const cleanupAll = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Delete categories first (no FK constraint, but cleaner)
		const categories = await ctx.db.query('circleItemCategories').collect();
		for (const category of categories) {
			await ctx.db.delete(category._id);
		}

		// Delete items
		const items = await ctx.db.query('circleItems').collect();
		for (const item of items) {
			await ctx.db.delete(item._id);
		}

		return {
			categoriesDeleted: categories.length,
			itemsDeleted: items.length,
			message: `Cleanup complete: ${categories.length} categories, ${items.length} items deleted`
		};
	}
});
