/**
 * Version History Triggers for Org Chart Entities
 *
 * Automatically captures version history for all org chart mutations using
 * convex-helpers triggers pattern.
 *
 * CURRENT IMPLEMENTATION:
 * Triggers are registered but not active. We call history recording functions explicitly
 * from mutations (see core/history) for explicit control and easier debugging.
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
import type { DataModel } from '../../_generated/dataModel';
import { recordVersionHistory } from '../history';

const triggers = new Triggers<DataModel>();

/**
 * Register trigger for circles table
 */
triggers.register('circles', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circle', change);
});

/**
 * Register trigger for circleRoles table
 */
triggers.register('circleRoles', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circleRole', change);
});

/**
 * Register trigger for userCircleRoles table
 */
triggers.register('userCircleRoles', async (ctx, change) => {
	await recordVersionHistory(ctx, 'userCircleRole', change);
});

/**
 * Register trigger for circleMembers table
 */
triggers.register('circleMembers', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circleMember', change);
});

/**
 * Register trigger for circleItemCategories table
 */
triggers.register('circleItemCategories', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circleItemCategory', change);
});

/**
 * Register trigger for circleItems table
 */
triggers.register('circleItems', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circleItem', change);
});

export default triggers;
