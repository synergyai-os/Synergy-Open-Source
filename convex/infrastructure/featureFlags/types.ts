import type { Doc, Id } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';

export type Ctx = QueryCtx | MutationCtx;

export type FeatureFlagDoc = Doc<'featureFlags'>;

export interface UserContext {
	userId: Id<'users'>;
	user: Doc<'users'> | null;
}

export interface FlagEvaluationInput {
	flagConfig: FeatureFlagDoc;
	userContext: UserContext;
	flagName: string;
}

export interface FlagEvaluationResult {
	result: boolean;
	reason?: string;
}

export interface ImpactBreakdown {
	byDomain: number;
	byRollout: number;
	byUserIds: number;
	byOrgIds: number;
}

export interface ImpactEntry {
	flag: string;
	enabled: boolean;
	estimatedAffected: number;
	breakdown: ImpactBreakdown;
}
