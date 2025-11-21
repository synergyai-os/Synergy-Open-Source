/**
 * Confidentiality configuration
 *
 * Centralized list of confidential client names and their sanitized replacements.
 * Add new client names here - both check and sanitize scripts use this config.
 *
 * To add a new client:
 * 1. Add to CONFIDENTIAL_NAMES array
 * 2. Add mapping to SANITIZATION_MAP (confidential name → sanitized placeholder)
 */

// Client names to check (case-insensitive matching)
export const CONFIDENTIAL_NAMES = ['Saprolab', 'ZDHC'];

// Sanitization mapping (confidential → sanitized)
export const SANITIZATION_MAP: Record<string, string> = {
	Saprolab: 'Agency Partner',
	ZDHC: 'Client',
	saprolab: 'agency-partner',
	zdhc: 'client'
};

/**
 * Get all confidential names as array (for bash scripts)
 */
export function getConfidentialNames(): string[] {
	return CONFIDENTIAL_NAMES;
}
