import { defineSchema } from 'convex/server';

// Notes reuse inboxItems (no separate notes table).
import {
	customFieldDefinitionsTable,
	customFieldValuesTable
} from './features/customFields/tables';
import { circleMembersTable, circleRolesTable, circlesTable } from './core/circles/tables';
import { orgVersionHistoryTable } from './core/history/schema';
import {
	circleProposalsTable,
	proposalAttachmentsTable,
	proposalEvolutionsTable,
	proposalObjectionsTable
} from './core/proposals/tables';
import { assignmentsTable } from './core/assignments/tables';
import { roleTemplatesTable } from './core/roles/tables';
import { accountLinksTable, userSettingsTable, usersTable } from './core/users/tables';
import {
	authLoginStateTable,
	authSessionsTable,
	verificationCodesTable
} from './infrastructure/auth/tables';
import { doc404ErrorsTable, featureFlagsTable, waitlistTable } from './infrastructure/tables';
import {
	meetingAgendaItemsTable,
	meetingAttendeesTable,
	meetingInvitationsTable,
	meetingPresenceTable,
	meetingTemplateStepsTable,
	meetingTemplatesTable,
	meetingsTable
} from './features/meetings/tables';
import { inboxItemsTable } from './features/inbox/tables';
import {
	authorsTable,
	highlightsTable,
	sourceAuthorsTable,
	sourcesTable,
	syncProgressTable
} from './features/readwise/tables';
import {
	flashcardReviewsTable,
	flashcardTagsTable,
	flashcardsTable,
	userAlgorithmSettingsTable
} from './features/flashcards/tables';
import { projectsTable } from './features/projects/tables';
import { highlightTagsTable, sourceTagsTable, tagsTable } from './features/tags/tables';
import { tasksTable } from './features/tasks/tables';
import {
	workspacesTable,
	workspaceAliasesTable,
	workspaceOrgSettingsTable,
	workspaceSettingsTable
} from './core/workspaces/tables';
import { workspaceInvitesTable } from './features/invites/tables';
import { onboardingProgressTable } from './features/onboarding/tables';
import { peopleTable } from './core/people/tables';
import {
	rbacAuditLogTable,
	rbacPermissionsTable,
	resourceGuestsTable,
	rbacRolePermissionsTable,
	rbacRolesTable,
	systemRolesTable,
	workspaceRolesTable
} from './infrastructure/rbac/tables';

// TEMPORARY: Disable schema validation during ID migration
const schema = defineSchema(
	{
		authLoginState: authLoginStateTable,
		authSessions: authSessionsTable,
		users: usersTable,
		accountLinks: accountLinksTable,
		workspaces: workspacesTable,
		workspaceAliases: workspaceAliasesTable,
		people: peopleTable,

		circles: circlesTable,
		circleMembers: circleMembersTable,
		circleRoles: circleRolesTable,
		assignments: assignmentsTable,
		roleTemplates: roleTemplatesTable,
		customFieldDefinitions: customFieldDefinitionsTable,
		customFieldValues: customFieldValuesTable,
		orgVersionHistory: orgVersionHistoryTable,
		meetings: meetingsTable,
		meetingAttendees: meetingAttendeesTable,
		meetingInvitations: meetingInvitationsTable,
		meetingAgendaItems: meetingAgendaItemsTable,
		meetingPresence: meetingPresenceTable,
		circleProposals: circleProposalsTable,
		proposalEvolutions: proposalEvolutionsTable,
		proposalAttachments: proposalAttachmentsTable,
		proposalObjections: proposalObjectionsTable,
		meetingTemplates: meetingTemplatesTable,
		meetingTemplateSteps: meetingTemplateStepsTable,
		projects: projectsTable,
		tasks: tasksTable,
		workspaceInvites: workspaceInvitesTable,
		onboardingProgress: onboardingProgressTable,
		userSettings: userSettingsTable,
		workspaceSettings: workspaceSettingsTable,
		workspaceOrgSettings: workspaceOrgSettingsTable,
		authors: authorsTable,
		sources: sourcesTable,
		sourceAuthors: sourceAuthorsTable,
		highlights: highlightsTable,
		inboxItems: inboxItemsTable,
		tags: tagsTable,
		sourceTags: sourceTagsTable,
		highlightTags: highlightTagsTable,
		syncProgress: syncProgressTable,
		flashcards: flashcardsTable,
		flashcardReviews: flashcardReviewsTable,
		userAlgorithmSettings: userAlgorithmSettingsTable,
		flashcardTags: flashcardTagsTable,
		featureFlags: featureFlagsTable,
		waitlist: waitlistTable,
		rbacRoles: rbacRolesTable,
		rbacPermissions: rbacPermissionsTable,
		rbacRolePermissions: rbacRolePermissionsTable,
		systemRoles: systemRolesTable,
		workspaceRoles: workspaceRolesTable,
		resourceGuests: resourceGuestsTable,
		rbacAuditLog: rbacAuditLogTable,
		verificationCodes: verificationCodesTable,
		doc404Errors: doc404ErrorsTable
	},
	{
		schemaValidation: false
	}
);

export default schema;
