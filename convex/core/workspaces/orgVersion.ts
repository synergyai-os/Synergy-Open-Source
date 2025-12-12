import type { Doc } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory } from '../history';

export async function createCircleVersionRecord(ctx: MutationCtx, circle: Doc<'circles'> | null) {
	if (circle) {
		await recordCreateHistory(ctx, 'circle', circle);
	}
}
