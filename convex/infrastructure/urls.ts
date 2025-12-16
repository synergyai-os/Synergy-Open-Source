import { createError, ErrorCodes } from './errors/codes';

/**
 * Get the public app URL from environment
 */
export function getPublicAppUrl(): string {
	const baseUrl = process.env.PUBLIC_APP_URL;
	if (!baseUrl) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'PUBLIC_APP_URL is not configured.');
	}
	return baseUrl;
}
