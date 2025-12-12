import { createError, ErrorCodes } from '../errors/codes';

export function ensureValidRolloutPercentage(percentage: number): void {
	if (percentage < 0 || percentage > 100) {
		throw createError(
			ErrorCodes.FEATURE_FLAG_INVALID_PERCENTAGE,
			'Percentage must be between 0 and 100'
		);
	}
}
