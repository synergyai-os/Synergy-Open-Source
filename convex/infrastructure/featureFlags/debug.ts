import type { Ctx, FeatureFlagDoc, UserContext } from './types';
import { evaluateFlagWithReason } from './targeting';
import { hasTargetingRules } from './utils';

export async function buildDebugInfo(
	ctx: Ctx,
	flag: string,
	flagConfig: FeatureFlagDoc,
	userContext: UserContext
): Promise<{
	flag: string;
	userId: string;
	userEmail?: string;
	flagExists: boolean;
	flagConfig?: Record<string, unknown>;
	hasTargetingRules?: boolean;
	result: boolean;
	reason: string;
}> {
	const { result, reason } = await evaluateFlagWithReason(
		{ flagConfig, userContext, flagName: flag },
		ctx
	);

	return {
		flag,
		userId: userContext.userId,
		userEmail: userContext.user?.email ?? undefined,
		flagExists: true,
		flagConfig: {
			enabled: flagConfig.enabled,
			allowedUserIds: flagConfig.allowedUserIds,
			allowedWorkspaceIds: flagConfig.allowedWorkspaceIds,
			allowedDomains: flagConfig.allowedDomains,
			rolloutPercentage: flagConfig.rolloutPercentage
		},
		hasTargetingRules: hasTargetingRules(flagConfig),
		result,
		reason: reason ?? ''
	};
}

export function buildMissingFlagDebug(flag: string, userContext: UserContext) {
	return {
		flag,
		userId: userContext.userId,
		userEmail: userContext.user?.email ?? undefined,
		flagExists: false,
		result: false,
		reason: 'Flag does not exist'
	};
}
