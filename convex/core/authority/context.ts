import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requireActivePerson } from '../people/rules';
import { isLeadTemplate } from '../roles/detection';
import { getPolicy } from './policies';
import type { Assignment, AuthorityContext, CirclePolicy, CircleType } from './types';

type Ctx = QueryCtx | MutationCtx;

const DEFAULT_CIRCLE_TYPE: CircleType = 'hierarchy';

export async function getAuthorityContext(
	ctx: Ctx,
	args: { personId: Id<'people'>; circleId: Id<'circles'> }
): Promise<AuthorityContext> {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const person = await requireActivePerson(ctx, args.personId);
	if (person.workspaceId !== circle.workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is not in this workspace');
	}
	return buildContextFromPersonCircleRoles(ctx, {
		personId: person._id,
		circleId: args.circleId,
		circle
	});
}

export async function getAuthorityContextFromAssignments(
	ctx: Ctx,
	args: { personId: Id<'people'>; circleId: Id<'circles'>; workspaceId?: Id<'workspaces'> }
): Promise<AuthorityContext> {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const circleType = (circle.circleType ?? DEFAULT_CIRCLE_TYPE) as CircleType;
	const policy = getPolicy(circleType);

	const person = await requireActivePerson(ctx, args.personId);
	const workspaceId = args.workspaceId ?? circle.workspaceId;
	if (person.workspaceId !== workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is not in this workspace');
	}

	const activeAssignments = await ctx.db
		.query('assignments')
		.withIndex('by_circle_person', (q) =>
			q.eq('circleId', args.circleId).eq('personId', args.personId)
		)
		.filter((q) => q.eq(q.field('status'), 'active'))
		.collect();

	const roles = await Promise.all(
		activeAssignments.map((assignment) => ctx.db.get(assignment.roleId))
	);
	const assignments: Assignment[] = [];

	for (let i = 0; i < activeAssignments.length; i++) {
		const role = roles[i];
		if (!role || role.archivedAt) continue;

		const template = role.templateId ? await ctx.db.get(role.templateId) : null;
		const roleType = mapRoleType({
			roleName: role.name,
			isLead: isLeadTemplate(template),
			isCoreTemplate: template?.isCore ?? false,
			policy
		});

		assignments.push({
			personId: args.personId,
			circleId: args.circleId,
			roleId: role._id,
			roleName: role.name,
			roleType
		});
	}

	return {
		personId: args.personId,
		circleId: args.circleId,
		circleType,
		assignments
	};
}

async function buildContextFromPersonCircleRoles(
	ctx: Ctx,
	args: {
		personId: Id<'people'>;
		circleId: Id<'circles'>;
		circle: Doc<'circles'>;
	}
): Promise<AuthorityContext> {
	const circleType = (args.circle.circleType ?? DEFAULT_CIRCLE_TYPE) as CircleType;
	const policy = getPolicy(circleType);

	const userCircleRoles = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_person_archived', (q) =>
			q.eq('personId', args.personId).eq('archivedAt', undefined)
		)
		.collect();

	const circleRoles = await Promise.all(userCircleRoles.map((ur) => ctx.db.get(ur.circleRoleId)));

	const templateIds: Id<'roleTemplates'>[] = [];
	for (const role of circleRoles) {
		if (role?.templateId && !templateIds.includes(role.templateId)) {
			templateIds.push(role.templateId);
		}
	}

	const templates = await Promise.all(
		templateIds.map(async (templateId) => ({
			templateId,
			template: await ctx.db.get(templateId)
		}))
	);

	const templateMap: Record<string, { isCore?: boolean | null } | null> = {};
	for (const { templateId, template } of templates) {
		templateMap[templateId] = template ?? null;
	}

	const assignments: Assignment[] = [];

	for (let i = 0; i < userCircleRoles.length; i++) {
		const role = circleRoles[i];
		if (!role || role.circleId !== args.circleId || role.archivedAt) continue;

		const template = role.templateId ? templateMap[role.templateId] : null;
		const roleType = mapRoleType({
			roleName: role.name,
			isLead: isLeadTemplate(template),
			isCoreTemplate: template?.isCore ?? false,
			policy
		});

		assignments.push({
			personId: args.personId,
			circleId: args.circleId,
			roleId: role._id,
			roleName: role.name,
			roleType
		});
	}

	return {
		personId: args.personId,
		circleId: args.circleId,
		circleType,
		assignments
	};
}

function mapRoleType(input: {
	roleName: string;
	isLead: boolean;
	isCoreTemplate: boolean;
	policy: CirclePolicy;
}): Assignment['roleType'] {
	if (input.isLead || input.roleName === input.policy.leadLabel) return 'lead';
	if (input.isCoreTemplate || input.policy.coreRoles.includes(input.roleName)) return 'core';
	return 'custom';
}
