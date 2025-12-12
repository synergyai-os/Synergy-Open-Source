import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const meetingsTable = defineTable({
	workspaceId: v.id('workspaces'),
	circleId: v.optional(v.id('circles')),
	title: v.string(),
	templateId: v.id('meetingTemplates'),
	startTime: v.number(),
	duration: v.number(),
	recurrence: v.optional(
		v.object({
			frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
			interval: v.number(),
			daysOfWeek: v.optional(v.array(v.number())),
			endDate: v.optional(v.number())
		})
	),
	visibility: v.union(v.literal('public'), v.literal('private')),
	startedAt: v.optional(v.number()),
	currentStep: v.optional(v.string()),
	closedAt: v.optional(v.number()),
	recorderPersonId: v.optional(v.id('people')),
	activeAgendaItemId: v.optional(v.id('meetingAgendaItems')),
	parentMeetingId: v.optional(v.id('meetings')),
	deletedAt: v.optional(v.number()),
	canceledAt: v.optional(v.number()),
	createdAt: v.number(),
	createdByPersonId: v.id('people'),
	updatedAt: v.number()
})
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId'])
	.index('by_start_time', ['workspaceId', 'startTime'])
	.index('by_template', ['workspaceId', 'templateId'])
	.index('by_recorder_person', ['recorderPersonId'])
	.index('by_parent', ['parentMeetingId'])
	.index('by_deleted', ['deletedAt']);

export const meetingAttendeesTable = defineTable({
	meetingId: v.id('meetings'),
	personId: v.id('people'),
	joinedAt: v.number()
})
	.index('by_meeting', ['meetingId'])
	.index('by_person', ['personId'])
	.index('by_meeting_person', ['meetingId', 'personId']);

export const meetingInvitationsTable = defineTable({
	meetingId: v.id('meetings'),
	invitationType: v.union(v.literal('user'), v.literal('circle')),
	personId: v.optional(v.id('people')),
	circleId: v.optional(v.id('circles')),
	status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined')),
	respondedAt: v.optional(v.number()),
	lastSentAt: v.number(),
	createdAt: v.number(),
	createdByPersonId: v.id('people')
})
	.index('by_meeting', ['meetingId'])
	.index('by_person', ['personId'])
	.index('by_circle', ['circleId']);

export const meetingAgendaItemsTable = defineTable({
	meetingId: v.id('meetings'),
	title: v.string(),
	order: v.number(),
	notes: v.optional(v.string()),
	status: v.union(v.literal('todo'), v.literal('processed'), v.literal('rejected')),
	createdByPersonId: v.id('people'),
	createdAt: v.number()
})
	.index('by_meeting', ['meetingId'])
	.index('by_status', ['meetingId', 'status']);

export const meetingPresenceTable = defineTable({
	meetingId: v.id('meetings'),
	personId: v.id('people'),
	joinedAt: v.number(),
	lastSeenAt: v.number()
})
	.index('by_meeting', ['meetingId'])
	.index('by_meeting_lastSeen', ['meetingId', 'lastSeenAt'])
	.index('by_meeting_person', ['meetingId', 'personId']);

export const meetingTemplatesTable = defineTable({
	workspaceId: v.id('workspaces'),
	name: v.string(),
	description: v.optional(v.string()),
	createdAt: v.number(),
	createdByPersonId: v.id('people')
}).index('by_workspace', ['workspaceId']);

export const meetingTemplateStepsTable = defineTable({
	templateId: v.id('meetingTemplates'),
	stepType: v.union(
		v.literal('check-in'),
		v.literal('agenda'),
		v.literal('metrics'),
		v.literal('projects'),
		v.literal('closing'),
		v.literal('custom')
	),
	title: v.string(),
	description: v.optional(v.string()),
	orderIndex: v.number(),
	timebox: v.optional(v.number()),
	createdAt: v.number()
}).index('by_template', ['templateId']);
