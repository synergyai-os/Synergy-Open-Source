/**
 * Version History Triggers for Org Chart Entities
 *
 * Automatically captures version history for all org chart mutations using
 * convex-helpers triggers pattern.
 *
 * CURRENT IMPLEMENTATION:
 * Triggers are registered but not active. We call capture functions explicitly
 * from mutations (see orgVersionHistory.ts) for explicit control and easier debugging.
 *
 * FUTURE: To enable automatic triggers, refactor mutations to use customMutation:
 * ```typescript
 * import { customMutation, customCtx } from 'convex-helpers/server/customFunctions';
 * import { mutation as rawMutation } from './_generated/server';
 * import triggers from './orgChartTriggers';
 *
 * export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
 * ```
 *
 * Then all db.insert/patch/replace operations will automatically trigger version history capture.
 */

import { Triggers } from 'convex-helpers/server/triggers';
import type { DataModel } from './_generated/dataModel';
import { captureVersionHistory } from './orgVersionHistory';

const triggers = new Triggers<DataModel>();

/**
 * Register trigger for circles table
 */
triggers.register('circles', async (ctx, change) => {
	await captureVersionHistory(ctx, 'circle', change);
});

/**
 * Register trigger for circleRoles table
 */
triggers.register('circleRoles', async (ctx, change) => {
	await captureVersionHistory(ctx, 'circleRole', change);
});

/**
 * Register trigger for userCircleRoles table
 */
triggers.register('userCircleRoles', async (ctx, change) => {
	await captureVersionHistory(ctx, 'userCircleRole', change);
});

/**
 * Register trigger for circleMembers table
 */
triggers.register('circleMembers', async (ctx, change) => {
	await captureVersionHistory(ctx, 'circleMember', change);
});

/**
 * Register trigger for circleItemCategories table
 */
triggers.register('circleItemCategories', async (ctx, change) => {
	await captureVersionHistory(ctx, 'circleItemCategory', change);
});

/**
 * Register trigger for circleItems table
 */
triggers.register('circleItems', async (ctx, change) => {
	await captureVersionHistory(ctx, 'circleItem', change);
});

export default triggers;
