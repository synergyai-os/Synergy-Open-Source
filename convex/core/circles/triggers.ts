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
 * Register trigger for assignments table
 */
triggers.register('assignments', async (ctx, change) => {
	await recordVersionHistory(ctx, 'assignment', change);
});

/**
 * Register trigger for circleMembers table
 */
triggers.register('circleMembers', async (ctx, change) => {
	await recordVersionHistory(ctx, 'circleMember', change);
});

// SYOS-790: Legacy triggers removed - data deleted, now using customFieldDefinitions
// circleItemCategories and circleItems tables are deprecated

export default triggers;
