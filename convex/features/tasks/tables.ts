import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const tasksTable = defineTable({
	workspaceId: v.id('workspaces'),
	meetingId: v.optional(v.id('meetings')),
	agendaItemId: v.optional(v.id('meetingAgendaItems')),
	projectId: v.optional(v.id('projects')),
	circleId: v.optional(v.id('circles')),
	assigneeType: v.union(v.literal('user'), v.literal('role')),
	assigneeUserId: v.optional(v.id('users')),
	assigneeRoleId: v.optional(v.id('circleRoles')),
	description: v.string(),
	dueDate: v.optional(v.number()),
	status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),
	linearTicketId: v.optional(v.string()),
	notionPageId: v.optional(v.string()),
	createdAt: v.number(),
	createdBy: v.id('users'),
	updatedAt: v.optional(v.number())
})
	.index('by_workspace', ['workspaceId'])
	.index('by_meeting', ['meetingId'])
	.index('by_agenda_item', ['agendaItemId'])
	.index('by_project', ['projectId'])
	.index('by_assignee_user', ['assigneeUserId']);
