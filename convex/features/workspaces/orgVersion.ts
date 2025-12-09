import type { Doc } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { captureCreate } from '../../orgVersionHistory';

export async function createCircleVersionRecord(ctx: MutationCtx, circle: Doc<'circles'> | null) {
	if (circle) {
		await captureCreate(ctx, 'circle', circle);
	}
}
