/**
 * Backfill Role Governance Fields from Role Templates (DR-011)
 *
 * Fixes existing circleRoles created from roleTemplates where governance fields
 * (purpose, decisionRights) are missing or empty due to older seed/template versions.
 *
 * Safe to run multiple times (idempotent).
 */

import { internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';

export const backfillRoleGovernanceFieldsFromTemplates = internalMutation({
	args: {
		onlySystemTemplates: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const onlySystemTemplates = args.onlySystemTemplates ?? true;
		const now = Date.now();

		const templates = onlySystemTemplates
			? await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect()
			: await ctx.db
					.query('roleTemplates')
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect();

		let checked = 0;
		let patched = 0;

		for (const template of templates) {
			// Skip templates that don't have defaults (defensive; older DBs may have partial records).
			const defaultPurpose =
				typeof (template as { defaultPurpose?: unknown }).defaultPurpose === 'string'
					? ((template as { defaultPurpose: string }).defaultPurpose ?? '')
					: '';
			const defaultDecisionRights = Array.isArray(
				(template as { defaultDecisionRights?: unknown }).defaultDecisionRights
			)
				? ((template as { defaultDecisionRights: string[] }).defaultDecisionRights ?? [])
				: [];

			if (!defaultPurpose.trim() || defaultDecisionRights.length === 0) {
				continue;
			}

			const roles = await ctx.db
				.query('circleRoles')
				.withIndex('by_template', (q) => q.eq('templateId', template._id as Id<'roleTemplates'>))
				.filter((q) => q.eq(q.field('archivedAt'), undefined))
				.collect();

			for (const role of roles) {
				checked++;

				const rolePurpose = typeof role.purpose === 'string' ? role.purpose : '';
				const roleDecisionRights = Array.isArray(role.decisionRights) ? role.decisionRights : [];

				const needsPatch =
					!rolePurpose.trim() ||
					roleDecisionRights.length === 0 ||
					roleDecisionRights.every((r) => !r);

				if (!needsPatch) continue;

				await ctx.db.patch(role._id, {
					purpose: defaultPurpose.trim(),
					decisionRights: defaultDecisionRights.map((r) => r.trim()).filter(Boolean),
					updatedAt: now,
					updatedByPersonId: undefined
				});
				patched++;
			}
		}

		return { success: true, templatesCount: templates.length, checked, patched };
	}
});
