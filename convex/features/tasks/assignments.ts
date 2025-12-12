import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { calculateAuthority, getAuthorityContext } from '../../core/authority';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
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

	const { task, meeting } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId);
	const workspaceId = meeting?.workspaceId ?? task.workspaceId;
	const person = await getPersonByUserAndWorkspace(ctx, args.userId, workspaceId);

	const circleId = task.circleId ?? meeting?.circleId;
	if (circleId) {
		const authorityContext = await getAuthorityContext(ctx, { personId: person._id, circleId });
		const authority = calculateAuthority(authorityContext);
		if (!authority.canAssignRoles) {
			throw createError(ErrorCodes.AUTHZ_NOT_CIRCLE_LEAD, 'Insufficient authority to assign');
		}
	}

	await ctx.db.patch(args.actionItemId, {
		assigneeType: args.assigneeType,
		assigneeUserId: args.assigneeUserId,
		assigneeRoleId: args.assigneeRoleId,
		updatedAt: Date.now()
	});

	return { success: true };
}
