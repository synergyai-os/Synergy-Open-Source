import type { Id } from '../../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../_generated/server';
import { recordUpdateHistory } from '../../history';
import { requireActivePerson } from '../../people/rules';

export async function isWorkspaceAdmin(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<boolean> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) return false;
	return person.workspaceRole === 'owner' || person.workspaceRole === 'admin';
}

/**
 * Returns the Lead role template (isRequired) for a workspace or system.
 */
export async function findLeadRoleTemplate(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Id<'roleTemplates'> | null> {
	const workspaceLeadTemplate = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('isRequired'), true).eq(q.field('archivedAt'), undefined))
		.first();

	if (workspaceLeadTemplate) {
		return workspaceLeadTemplate._id;
	}

	const systemLeadTemplate = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) => q.eq(q.field('isRequired'), true).eq(q.field('archivedAt'), undefined))
		.first();

	return systemLeadTemplate?._id ?? null;
}

/**
 * Propagate Lead template name/description updates to all active roles using it.
 */
export async function updateLeadRolesFromTemplate(
	ctx: MutationCtx,
	templateId: Id<'roleTemplates'>,
	personId: Id<'people'>
): Promise<void> {
	const template = await ctx.db.get(templateId);
	if (!template || !template.isRequired) {
		return;
	}

	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_template', (q) => q.eq('templateId', templateId))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	const now = Date.now();

	for (const role of roles) {
		const oldRole = { ...role };

		await ctx.db.patch(role._id, {
			name: template.name,
			purpose: template.description,
			updatedAt: now,
			updatedByPersonId: personId
		});

		const updatedRole = await ctx.db.get(role._id);
		if (updatedRole) {
			await recordUpdateHistory(ctx, 'circleRole', oldRole, updatedRole);
		}
	}
}
