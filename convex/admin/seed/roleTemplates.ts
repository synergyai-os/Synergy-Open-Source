/**
 * System Role Templates
 *
 * Creates the core role templates for each lead authority level.
 * These templates are workspace-agnostic (workspaceId = undefined) and serve
 * as blueprints for creating circle roles.
 *
 * Templates are grouped by lead authority:
 * - DECIDES: Circle Lead + Secretary
 * - FACILITATES: Coordinator + Facilitator + Secretary
 * - CONVENES: Steward
 *
 * DR-011: Governance fields (purpose, decisionRights) are stored directly
 * on the template and the resulting role schema, not in customFieldValues.
 *
 * SYOS-1070: Simplified from 10 templates (4 circle types) to 7 templates (3 lead authority levels)
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { LEAD_AUTHORITY, type LeadAuthority } from '../../core/circles/constants';

/**
 * System role template definition
 * DR-011: Uses defaultPurpose and defaultDecisionRights instead of defaultFieldValues
 */
interface RoleTemplateDefinition {
	name: string;
	roleType: 'circle_lead' | 'structural' | 'custom';
	defaultPurpose: string;
	defaultDecisionRights: string[];
	description: string;
	isCore: boolean;
	appliesTo: LeadAuthority;
}

/**
 * System role templates for Lead Authority model
 *
 * 7 templates total, grouped by lead authority level.
 * Each lead authority gets its own lead template with appropriate authority model.
 */
const SYSTEM_TEMPLATES: RoleTemplateDefinition[] = [
	// ═══════════════════════════════════════════════════════════════
	// DECIDES - Lead has full decision authority
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Circle Lead',
		roleType: 'circle_lead',
		appliesTo: LEAD_AUTHORITY.DECIDES,
		isCore: true,
		defaultPurpose: 'Lead this circle toward its purpose with full decision authority',
		defaultDecisionRights: [
			'Decide all matters within circle scope',
			'Assign roles within circle',
			'Remove roles from circle'
		],
		description:
			'Full authority lead role for circles where the lead decides. Can make decisions unilaterally within circle scope.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: LEAD_AUTHORITY.DECIDES,
		isCore: false,
		defaultPurpose: 'Maintain circle records and support governance integrity',
		defaultDecisionRights: ['Decide what to record in meeting notes'],
		description: 'Maintains records and schedules meetings for circles where lead decides.'
	},

	// ═══════════════════════════════════════════════════════════════
	// FACILITATES - Lead facilitates, team decides via consent
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Coordinator',
		roleType: 'circle_lead',
		appliesTo: LEAD_AUTHORITY.FACILITATES,
		isCore: true,
		defaultPurpose: 'Facilitate team decisions and break ties when consent cannot be reached',
		defaultDecisionRights: ['Break ties when consent fails', 'Coordinate circle activities'],
		description: 'Facilitative lead role for teams using consent-based decision making.'
	},
	{
		name: 'Facilitator',
		roleType: 'structural',
		appliesTo: LEAD_AUTHORITY.FACILITATES,
		isCore: false,
		defaultPurpose: 'Ensure governance and tactical meetings run effectively',
		defaultDecisionRights: ['Interpret governance when ambiguous'],
		description: 'Facilitates meetings and ensures consent process is followed.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: LEAD_AUTHORITY.FACILITATES,
		isCore: false,
		defaultPurpose: 'Maintain circle records and support governance integrity',
		defaultDecisionRights: ['Decide what to record in meeting notes'],
		description: 'Maintains records and schedules meetings for facilitated circles.'
	},

	// ═══════════════════════════════════════════════════════════════
	// CONVENES - Lead schedules only, advisory decisions
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Steward',
		roleType: 'circle_lead',
		appliesTo: LEAD_AUTHORITY.CONVENES,
		isCore: true,
		defaultPurpose: 'Convene and coordinate community activities',
		defaultDecisionRights: ['Schedule community meetings'],
		description:
			'Convening authority - coordinates activities and schedules gatherings. No decision authority.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: LEAD_AUTHORITY.CONVENES,
		isCore: false,
		defaultPurpose: 'Maintain circle records and support governance integrity',
		defaultDecisionRights: ['Decide what to record in meeting notes'],
		description: 'Maintains records and schedules meetings for convening circles.'
	}
];

/**
 * Create system role templates
 *
 * Idempotent - checks for existing templates before creating.
 * Templates are system-level (workspaceId = undefined, createdByPersonId = undefined).
 *
 * @returns Array of created template IDs and summary
 */
export async function createSystemRoleTemplates(ctx: MutationCtx): Promise<{
	templateIds: Id<'roleTemplates'>[];
	created: number;
	updated: number;
	skipped: number;
}> {
	const now = Date.now();
	const templateIds: Id<'roleTemplates'>[] = [];
	let created = 0;
	let updated = 0;
	let skipped = 0;

	console.log('📋 Creating system role templates...');

	// Get all system templates once (more efficient and avoids filter issues)
	const allSystemTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	for (const template of SYSTEM_TEMPLATES) {
		// Check if THIS SPECIFIC template already exists
		// Must match on name + roleType + appliesTo (not just roleType + appliesTo)
		// because multiple templates can share roleType + appliesTo (e.g., Facilitator and Secretary both structural for facilitates)
		const existing = allSystemTemplates.find(
			(t) =>
				t.name === template.name &&
				t.roleType === template.roleType &&
				t.appliesTo === template.appliesTo &&
				!t.archivedAt
		);

		if (existing) {
			// IMPORTANT:
			// Older databases may have templates created before DR-011 fields existed (or with empty defaults).
			// Our seed is idempotent, but it must also be self-healing: if an existing template is missing
			// or has incorrect governance defaults, patch it in-place so new circle roles inherit correctly.
			const needsUpdate =
				existing.defaultPurpose !== template.defaultPurpose ||
				(existing.defaultDecisionRights ?? []).join('\n') !==
					template.defaultDecisionRights.join('\n') ||
				existing.description !== template.description ||
				existing.isCore !== template.isCore ||
				existing.roleType !== template.roleType ||
				existing.appliesTo !== template.appliesTo;

			if (needsUpdate) {
				await ctx.db.patch(existing._id, {
					name: template.name,
					roleType: template.roleType,
					defaultPurpose: template.defaultPurpose,
					defaultDecisionRights: template.defaultDecisionRights,
					description: template.description,
					isCore: template.isCore,
					appliesTo: template.appliesTo,
					updatedAt: now,
					updatedByPersonId: undefined
				});
				console.log(
					`  🔧 Updated template: "${template.name}" (${template.roleType}, ${template.appliesTo})`
				);
				updated++;
			} else {
				console.log(
					`  ⏭️  Template "${template.name}" (${template.roleType}, ${template.appliesTo}) already exists, skipping...`
				);
				skipped++;
			}

			templateIds.push(existing._id);
			continue;
		}

		// Create system template (DR-011: governance fields in core schema)
		const templateId = await ctx.db.insert('roleTemplates', {
			workspaceId: undefined, // System-level template
			name: template.name,
			roleType: template.roleType,
			defaultPurpose: template.defaultPurpose,
			defaultDecisionRights: template.defaultDecisionRights,
			description: template.description,
			isCore: template.isCore,
			appliesTo: template.appliesTo,
			createdAt: now,
			createdByPersonId: undefined, // System template - no creator
			updatedAt: now,
			updatedByPersonId: undefined
		});

		console.log(
			`  ✅ Created template: ${template.name} (${template.roleType}, ${template.appliesTo})`
		);
		templateIds.push(templateId);
		created++;

		// Add newly created template to our cache to avoid duplicates in same run
		const newTemplate = await ctx.db.get(templateId);
		if (newTemplate) {
			allSystemTemplates.push(newTemplate);
		}
	}

	console.log(
		`📋 Role templates ready: ${created} created, ${updated} updated, ${skipped} already existed (${SYSTEM_TEMPLATES.length} total)\n`
	);

	return { templateIds, created, updated, skipped };
}
