export {
	listWorkspaces,
	findBySlug,
	findById,
	getAliasBySlug,
	getActivationIssues
} from './queries';
export {
	createWorkspace,
	recordOrganizationSwitch,
	updateSlug,
	updateDisplayNames
} from './lifecycle';
export { activate } from './mutations';
export { removeOrganizationMember, listMembers, addMemberDirect } from './members';
export { runActivationValidation } from './rules';
export type { ValidationRule, ValidationContext } from './rules';
// SYOS-814 migration verification utilities moved to admin/migrations/SYOS-814-*.ts
// SYOS-866: Removed re-exports from features/invites and features/workspaceBranding
// These violated layer dependency principle #5. Use api.features.invites.* and api.features.workspaceBranding.* instead.
