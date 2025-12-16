/**
 * Workspace Seeding Orchestration
 *
 * Orchestrates all workspace-level seeding that happens after the root circle
 * is created with a circle type. This includes:
 * - Custom field definitions (already seeded when circle type is set)
 * - Meeting templates (generic templates for any circle type)
 *
 * Called after root circle is created with type during onboarding step 3.
 *
 * Note: Custom field definitions are seeded separately via transformLeadRoleOnCircleTypeChange
 * because they're triggered by circle type change. This function handles the rest.
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { seedMeetingTemplates } from './meetingTemplates';

/**
 * Seed all workspace-level resources after root circle is created
 *
 * This is called after the root circle is created with a circle type during onboarding.
 * It seeds resources that are workspace-scoped and don't depend on circle type.
 *
 * Currently seeds:
 * - Meeting templates (generic templates usable by any circle)
 *
 * Future additions:
 * - Default policies
 * - Default metrics
 * - Other workspace-level defaults
 *
 * @param ctx - Mutation context
 * @param workspaceId - Workspace to seed
 * @param personId - Person creating the resources (workspace creator)
 * @returns Summary of seeded resources
 */
export async function seedWorkspaceResources(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<{
	meetingTemplates: { governanceId: Id<'meetingTemplates'>; tacticalId: Id<'meetingTemplates'> };
}> {
	// Seed meeting templates (generic, work for any circle type)
	const meetingTemplates = await seedMeetingTemplates(ctx, workspaceId, personId);

	return {
		meetingTemplates
	};
}
