/**
 * System Role Templates
 *
 * Creates the 4 core role templates defined in governance-design.md §6.3.
 * These templates are workspace-agnostic (workspaceId = undefined) and serve
 * as blueprints for creating circle roles.
 *
 * Templates:
 * - Circle Lead (circle_lead, required for hierarchy/empowered_team/hybrid)
 * - Steward (circle_lead, required for guilds)
 * - Facilitator (structural, optional)
 * - Secretary (structural, optional)
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { CIRCLE_TYPES, type CircleType } from '../../core/circles/constants';

/**
 * System role template definition
 */
interface RoleTemplateDefinition {
	name: string;
	roleType: 'circle_lead' | 'structural' | 'custom';
	defaultFieldValues: Array<{ systemKey: string; values: string[] }>;
	description: string;
	isCore: boolean;
	appliesTo: CircleType;
}

/**
 * System role templates per governance-design.md §6.3
 *
 * 10 templates total, grouped by circle type.
 * Each circle type gets its own lead template with appropriate authority model.
 */
const SYSTEM_TEMPLATES: RoleTemplateDefinition[] = [
	// ═══════════════════════════════════════════════════════════════
	// HIERARCHY - Traditional command structure
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Circle Lead',
		roleType: 'circle_lead',
		appliesTo: CIRCLE_TYPES.HIERARCHY,
		isCore: true,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Lead this circle toward its purpose with full decision authority']
			},
			{
				systemKey: 'decision_right',
				values: [
					'Decide all matters within circle scope',
					'Assign roles within circle',
					'Remove roles from circle'
				]
			},
			{
				systemKey: 'accountability',
				values: ['Coordinate work across roles', 'Represent circle in parent circle']
			}
		],
		description:
			'Full authority lead role for hierarchical circles with traditional command structure.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.HIERARCHY,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Maintain circle records and support governance integrity']
			},
			{
				systemKey: 'decision_right',
				values: ['Decide what to record in meeting notes']
			},
			{
				systemKey: 'accountability',
				values: [
					'Record meeting outputs',
					'Maintain governance records',
					'Interpret governance records'
				]
			}
		],
		description: 'Maintains records and schedules meetings for hierarchical circles.'
	},

	// ═══════════════════════════════════════════════════════════════
	// EMPOWERED_TEAM - Consent-based, lead facilitates
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Circle Lead',
		roleType: 'circle_lead',
		appliesTo: CIRCLE_TYPES.EMPOWERED_TEAM,
		isCore: true,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Facilitate team decisions and break ties when consent cannot be reached']
			},
			{
				systemKey: 'decision_right',
				values: ['Break ties when consent fails', 'Assign roles within circle']
			},
			{
				systemKey: 'accountability',
				values: ['Facilitate governance meetings', 'Coordinate work across roles']
			}
		],
		description: 'Facilitative lead role for empowered teams using consent-based decision making.'
	},
	{
		name: 'Facilitator',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.EMPOWERED_TEAM,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Ensure governance and tactical meetings run effectively']
			},
			{ systemKey: 'decision_right', values: ['Interpret governance when ambiguous'] },
			{
				systemKey: 'accountability',
				values: ['Facilitate circle meetings', 'Resolve process disputes']
			}
		],
		description: 'Facilitates meetings and ensures process is followed for empowered teams.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.EMPOWERED_TEAM,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Maintain circle records and support governance integrity']
			},
			{
				systemKey: 'decision_right',
				values: ['Decide what to record in meeting notes']
			},
			{
				systemKey: 'accountability',
				values: [
					'Record meeting outputs',
					'Maintain governance records',
					'Interpret governance records'
				]
			}
		],
		description: 'Maintains records and schedules meetings for empowered teams.'
	},

	// ═══════════════════════════════════════════════════════════════
	// GUILD - Advisory, cross-cutting community of practice
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Steward',
		roleType: 'circle_lead',
		appliesTo: CIRCLE_TYPES.GUILD,
		isCore: true,
		defaultFieldValues: [
			{ systemKey: 'purpose', values: ['Convene and coordinate guild activities'] },
			{ systemKey: 'decision_right', values: ['Schedule guild meetings'] },
			{
				systemKey: 'accountability',
				values: ['Maintain guild communication channels', 'Coordinate cross-team knowledge sharing']
			}
		],
		description: 'Convening authority for guilds - coordinates activities across circles.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.GUILD,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Maintain circle records and support governance integrity']
			},
			{
				systemKey: 'decision_right',
				values: ['Decide what to record in meeting notes']
			},
			{
				systemKey: 'accountability',
				values: [
					'Record meeting outputs',
					'Maintain governance records',
					'Interpret governance records'
				]
			}
		],
		description: 'Maintains records and schedules meetings for guilds.'
	},

	// ═══════════════════════════════════════════════════════════════
	// HYBRID - Full authority but uses consent process
	// ═══════════════════════════════════════════════════════════════
	{
		name: 'Circle Lead',
		roleType: 'circle_lead',
		appliesTo: CIRCLE_TYPES.HYBRID,
		isCore: true,
		defaultFieldValues: [
			{ systemKey: 'purpose', values: ['Lead using consent-based decision making'] },
			{
				systemKey: 'decision_right',
				values: [
					'Decide all matters within circle scope using consent or directive',
					'Choose decision mode per topic',
					'Assign roles within circle'
				]
			},
			{
				systemKey: 'accountability',
				values: ['Coordinate work across roles', 'Facilitate governance meetings']
			}
		],
		description: 'Full authority lead role that uses consent process - flexible decision making.'
	},
	{
		name: 'Facilitator',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.HYBRID,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Ensure governance and tactical meetings run effectively']
			},
			{ systemKey: 'decision_right', values: ['Interpret governance when ambiguous'] },
			{
				systemKey: 'accountability',
				values: ['Facilitate circle meetings', 'Resolve process disputes']
			}
		],
		description: 'Facilitates meetings and ensures process is followed for hybrid circles.'
	},
	{
		name: 'Secretary',
		roleType: 'structural',
		appliesTo: CIRCLE_TYPES.HYBRID,
		isCore: false,
		defaultFieldValues: [
			{
				systemKey: 'purpose',
				values: ['Maintain circle records and support governance integrity']
			},
			{
				systemKey: 'decision_right',
				values: ['Decide what to record in meeting notes']
			},
			{
				systemKey: 'accountability',
				values: [
					'Record meeting outputs',
					'Maintain governance records',
					'Interpret governance records'
				]
			}
		],
		description: 'Maintains records and schedules meetings for hybrid circles.'
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
export async function createSystemRoleTemplates(
	ctx: MutationCtx
): Promise<{ templateIds: Id<'roleTemplates'>[]; created: number; skipped: number }> {
	const now = Date.now();
	const templateIds: Id<'roleTemplates'>[] = [];
	let created = 0;
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
		// because multiple templates can share roleType + appliesTo (e.g., Facilitator and Secretary both structural for empowered_team)
		const existing = allSystemTemplates.find(
			(t) =>
				t.name === template.name &&
				t.roleType === template.roleType &&
				t.appliesTo === template.appliesTo &&
				!t.archivedAt
		);

		if (existing) {
			console.log(
				`  ⏭️  Template "${template.name}" (${template.roleType}, ${template.appliesTo}) already exists, skipping...`
			);
			templateIds.push(existing._id);
			skipped++;
			continue;
		}

		// Create system template
		const templateId = await ctx.db.insert('roleTemplates', {
			workspaceId: undefined, // System-level template
			name: template.name,
			roleType: template.roleType,
			defaultFieldValues: template.defaultFieldValues,
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
		`📋 Role templates ready: ${created} created, ${skipped} already existed (${SYSTEM_TEMPLATES.length} total)\n`
	);

	return { templateIds, created, skipped };
}
