export { listWorkspaces, findBySlug, findById, getAliasBySlug } from './queries';
export {
	createWorkspace,
	recordOrganizationSwitch,
	updateSlug,
	updateDisplayNames
} from './lifecycle';
export { removeOrganizationMember, listMembers, addMemberDirect } from './members';
// SYOS-814 migration verification utilities moved to admin/migrations/SYOS-814-*.ts
// SYOS-866: Removed re-exports from features/invites and features/workspaceBranding
// These violated layer dependency principle #5. Use api.features.invites.* and api.features.workspaceBranding.* instead.
