import type { Doc, Id } from '../_generated/dataModel';
import type { Ctx, FlagEvaluationInput, FlagEvaluationResult } from './types';
import { getUserRolloutBucket, hasTargetingRules } from './utils';
import { listWorkspacesForUser } from '../../core/people/queries';

async function userHasWorkspaceAccess(
	ctx: Ctx,
	userId: Id<'users'>,
	allowedWorkspaceIds: Id<'workspaces'>[] | undefined
): Promise<boolean> {
	if (!allowedWorkspaceIds?.length) return false;

	const userWorkspaceIds = await listWorkspacesForUser(ctx, userId);
	return allowedWorkspaceIds.some((orgId) => userWorkspaceIds.includes(orgId));
}

function isDomainAllowed(user: Doc<'users'> | null, allowedDomains: string[] | undefined): boolean {
	if (!user?.email || !allowedDomains?.length) return false;
	const emailDomain = user.email.split('@')[1];
	return allowedDomains.some(
		(domain) => domain.replace('@', '').toLowerCase() === emailDomain.toLowerCase()
	);
}

function checkRollout(
	userId: Id<'users'>,
	flagName: string,
	rolloutPercentage: number | undefined
): boolean {
	if (rolloutPercentage === undefined) return false;
	const bucket = getUserRolloutBucket(userId, flagName);
	return bucket < rolloutPercentage;
}

export async function evaluateFlag(input: FlagEvaluationInput, ctx: Ctx): Promise<boolean> {
	const { flagConfig, userContext, flagName } = input;
	const { userId, user } = userContext;

	if (!flagConfig.enabled || !user) return false;

	if (flagConfig.allowedUserIds?.includes(userId)) return true;
	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) return true;
	if (isDomainAllowed(user, flagConfig.allowedDomains)) return true;
	if (checkRollout(userId, flagName, flagConfig.rolloutPercentage)) return true;

	return !hasTargetingRules(flagConfig) ? false : false;
}

export async function evaluateFlagWithReason(
	input: FlagEvaluationInput,
	ctx: Ctx
): Promise<FlagEvaluationResult> {
	const { flagConfig, userContext, flagName } = input;
	const { userId, user } = userContext;

	if (!flagConfig.enabled) return disabled(flagConfig, 'Flag is disabled globally');
	if (!user) return disabled(flagConfig, 'User not found');

	if (flagConfig.allowedUserIds?.includes(userId)) {
		return success('User ID explicitly allowed');
	}

	if (await userHasWorkspaceAccess(ctx, userId, flagConfig.allowedWorkspaceIds)) {
		return success('Organization membership match');
	}

	if (isDomainAllowed(user, flagConfig.allowedDomains)) {
		const domain = user.email?.split('@')[1];
		return success(`Domain match (${domain ? '@' + domain : 'unknown'})`);
	}

	if (flagConfig.rolloutPercentage !== undefined) {
		const bucket = getUserRolloutBucket(userId, flagName);
		const result = bucket < flagConfig.rolloutPercentage;
		return {
			result,
			reason: `${flagConfig.rolloutPercentage}% rollout (bucket ${bucket})`
		};
	}

	if (!hasTargetingRules(flagConfig)) {
		return disabled(flagConfig, 'No targeting rules configured');
	}

	return disabled(flagConfig, 'Targeting rules exist but user does not match');
}

function disabled(flagConfig: Doc<'featureFlags'>, reason: string): FlagEvaluationResult {
	return {
		result: false,
		reason: reason || (flagConfig.enabled ? 'Not matched' : 'Flag disabled')
	};
}

function success(reason: string): FlagEvaluationResult {
	return { result: true, reason };
}
