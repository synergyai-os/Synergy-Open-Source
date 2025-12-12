import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const circleProposalsTable = defineTable({
	workspaceId: v.id('workspaces'),
	entityType: v.union(v.literal('circle'), v.literal('role')),
	entityId: v.string(),
	circleId: v.optional(v.id('circles')),
	title: v.string(),
	description: v.string(),
	status: v.union(
		v.literal('draft'),
		v.literal('submitted'),
		v.literal('in_meeting'),
		v.literal('objections'),
		v.literal('integrated'),
		v.literal('approved'),
		v.literal('rejected'),
		v.literal('withdrawn')
	),
	meetingId: v.optional(v.id('meetings')),
	agendaItemId: v.optional(v.id('meetingAgendaItems')),
	versionHistoryEntryId: v.optional(v.id('orgVersionHistory')),
	createdByPersonId: v.id('people'),
	createdAt: v.number(),
	updatedAt: v.number(),
	submittedAt: v.optional(v.number()),
	processedAt: v.optional(v.number()),
	processedByPersonId: v.optional(v.id('people'))
})
	.index('by_workspace', ['workspaceId'])
	.index('by_entity', ['entityType', 'entityId'])
	.index('by_circle', ['circleId'])
	.index('by_meeting', ['meetingId'])
	.index('by_agendaItem', ['agendaItemId'])
	.index('by_status', ['workspaceId', 'status'])
	.index('by_creatorPerson', ['createdByPersonId'])
	.index('by_workspace_status', ['workspaceId', 'status', 'createdAt']);

export const proposalEvolutionsTable = defineTable({
	proposalId: v.id('circleProposals'),
	fieldPath: v.string(),
	fieldLabel: v.string(),
	beforeValue: v.optional(v.string()),
	afterValue: v.optional(v.string()),
	changeType: v.union(v.literal('add'), v.literal('update'), v.literal('remove')),
	order: v.number(),
	createdAt: v.number()
})
	.index('by_proposal', ['proposalId'])
	.index('by_proposal_order', ['proposalId', 'order']);

export const proposalAttachmentsTable = defineTable({
	proposalId: v.id('circleProposals'),
	fileId: v.id('_storage'),
	fileName: v.string(),
	fileType: v.string(),
	fileSize: v.number(),
	uploadedByPersonId: v.id('people'),
	uploadedAt: v.number()
}).index('by_proposal', ['proposalId']);

export const proposalObjectionsTable = defineTable({
	proposalId: v.id('circleProposals'),
	raisedByPersonId: v.id('people'),
	objectionText: v.string(),
	isValid: v.optional(v.boolean()),
	validationNote: v.optional(v.string()),
	validatedByPersonId: v.optional(v.id('people')),
	validatedAt: v.optional(v.number()),
	isIntegrated: v.boolean(),
	integrationNote: v.optional(v.string()),
	integratedAt: v.optional(v.number()),
	createdAt: v.number()
})
	.index('by_proposal', ['proposalId'])
	.index('by_raiserPerson', ['raisedByPersonId'])
	.index('by_proposal_valid', ['proposalId', 'isValid']);
