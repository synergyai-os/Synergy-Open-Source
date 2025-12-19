import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { findPersonByUserAndWorkspace } from '../people/queries';
import { hasWorkspaceRole } from '../../infrastructure/rbac/permissions';
import { runActivationValidation } from './rules';

/**
 * Activate workspace (design → active phase)
 *
 * Validates workspace meets all activation requirements before transitioning.
 * Once activated, workspace cannot revert to design phase (one-way transition).
 *
 * Authorization: Requires org_designer or workspace_admin RBAC role
 *
 * Validation checks (re-run in mutation for security):
 * - ORG-01: Workspace has exactly one root circle
 * - ORG-10: Root circle type ≠ guild
 * - GOV-01: Every circle has role with roleType: 'circle_lead'
 * - GOV-02: Every role has a purpose (customFieldValue)
 * - GOV-03: Every role has ≥1 decision_right (customFieldValue)
 *
 * @see SYOS-997: Activation validation query and mutation
 * @throws {Error} If user lacks authorization or validation fails
 */
export const activate = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		// Auth check: verify user has access and required RBAC role
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
		if (!person || person.status !== 'active') {
			throw new Error('AUTHZ_NOT_WORKSPACE_MEMBER: You do not have access to this workspace');
		}

		// Check RBAC: must be org_designer or workspace_admin
		const hasOrgDesigner = await hasWorkspaceRole(ctx, person._id, 'org_designer');
		const hasWorkspaceAdmin = await hasWorkspaceRole(ctx, person._id, 'workspace_admin');
		if (!hasOrgDesigner && !hasWorkspaceAdmin) {
			throw new Error(
				'AUTHZ_INSUFFICIENT_RBAC: Only org_designer or workspace_admin can activate workspace'
			);
		}

		// Get workspace
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace || workspace.archivedAt) {
			throw new Error('WORKSPACE_NOT_FOUND: Workspace not found');
		}

		// Check if already active
		if (workspace.phase === 'active') {
			throw new Error('WORKSPACE_ALREADY_ACTIVE: Workspace is already active');
		}

		// Re-run all validation checks (don't trust client) - SYOS-1006: Use shared rules
		const issues = await runActivationValidation(ctx, args.workspaceId, workspace.slug);

		// If any issues, throw with list
		if (issues.length > 0) {
			const issueList = issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
			throw new Error(
				`WORKSPACE_ACTIVATION_FAILED: Workspace has ${issues.length} blocking issue(s): ${issueList}`
			);
		}

		// All checks passed - transition to active
		await ctx.db.patch(args.workspaceId, {
			phase: 'active',
			updatedAt: Date.now()
		});

		return { success: true };
	}
});
