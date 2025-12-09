import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { getTaskWithMeetingAccess } from './access';
import { ensureValidAssignee } from './lifecycle';
import type { TaskAssigneeType } from './types';

export type UpdateAssigneeArgs = {
	actionItemId: Id<'tasks'>;
	assigneeType: TaskAssigneeType;
	assigneeUserId?: Id<'users'>;
	assigneeRoleId?: Id<'circleRoles'>;
	userId: Id<'users'>;
};

export async function updateTaskAssignee(ctx: MutationCtx, args: UpdateAssigneeArgs) {
	ensureValidAssignee(args.assigneeType, args.assigneeUserId, args.assigneeRoleId);

	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId);

	await ctx.db.patch(args.actionItemId, {
		assigneeType: args.assigneeType,
		assigneeUserId: args.assigneeUserId,
		assigneeRoleId: args.assigneeRoleId,
		updatedAt: Date.now()
	});

	return { success: true };
}
