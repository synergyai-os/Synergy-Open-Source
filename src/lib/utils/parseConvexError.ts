/**
 * Convex Error Parsing Utilities
 *
 * Extracts user-friendly error messages from Convex errors.
 *
 * For SynergyOS custom errors: Uses structured format to extract user message directly
 * For Convex/system errors: Parses and cleans technical details
 *
 * Architecture Note: Server-side errors use structured format (created via createError function)
 * which separates user-facing messages from technical details. This eliminates regex dependency
 * for our own errors while still handling Convex validation errors gracefully.
 */

/**
 * Check if error is a SynergyOS structured error
 *
 * SynergyOS errors use format: `SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`
 * This survives serialization across Convex boundaries.
 * 
 * Note: Convex may wrap our errors with prefixes like:
 * "[CONVEX M] [Request ID: ...] Server Error Uncaught SynergyOSError: SYNERGYOS_ERROR|..."
 * So we check if the message contains (not starts with) the structured format.
 */
function isSynergyOSError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	const message = error.message || error.toString();
	// Check if message contains our structured format (may be wrapped by Convex)
	return message.includes('SYNERGYOS_ERROR|');
}

/**
 * Extract user message from SynergyOS structured error
 *
 * Format: `SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`
 * 
 * Handles cases where Convex wraps the error with prefixes:
 * "[CONVEX M] ... SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS"
 */
function extractSynergyOSUserMessage(error: Error): string {
	const message = error.message || error.toString();
	
	// Find the structured format within the message (may be wrapped by Convex)
	const structuredStart = message.indexOf('SYNERGYOS_ERROR|');
	if (structuredStart === -1) {
		// Fallback if format not found
		return message;
	}
	
	// Extract the structured part: "SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS"
	const structuredPart = message.substring(structuredStart);
	const parts = structuredPart.split('|');
	
	// Format: SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS
	// parts[0] = "SYNERGYOS_ERROR"
	// parts[1] = CODE
	// parts[2] = USER_MESSAGE (what we want)
	// parts[3+] = TECHNICAL_DETAILS (may contain | characters)
	if (parts.length >= 3) {
		return parts[2]; // USER_MESSAGE is third part
	}
	
	// Fallback if format is unexpected
	return message;
}

/**
 * Extract error code from error message
 *
 * Supports both formats:
 * - SynergyOSError: `SYNERGYOS_ERROR|CODE|...`
 * - Legacy format: `ERR_CODE: message` (per architecture.md #33)
 *
 * @param error - Error object or string
 * @returns Error code if found, null otherwise
 */
export function extractErrorCode(error: unknown): string | null {
	if (!(error instanceof Error)) return null;
	const rawMessage = error.message || String(error);

	// Check for SynergyOS structured error format first
	if (isSynergyOSError(error)) {
		// Find the structured format within the message (may be wrapped by Convex)
		const structuredStart = rawMessage.indexOf('SYNERGYOS_ERROR|');
		if (structuredStart !== -1) {
			const structuredPart = rawMessage.substring(structuredStart);
			const parts = structuredPart.split('|');
			if (parts.length >= 2) {
				return parts[1]; // CODE is second part
			}
		}
	}

	// Fallback to legacy format matching
	const match =
		rawMessage.match(
			/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*([A-Z_]+):/i
		) || rawMessage.match(/^([A-Z_]+):/);
	return match ? match[1] : null;
}

/**
 * Parse Convex ArgumentValidationError into user-friendly message
 *
 * Handles errors like: "Object is missing the required field `workspaceId`..."
 */
function parseConvexValidationError(rawMessage: string): string {
	// Pattern: "Object is missing the required field `fieldName`"
	const missingFieldMatch = rawMessage.match(/missing the required field `([^`]+)`/i);
	if (missingFieldMatch) {
		const fieldName = missingFieldMatch[1];
		// Convert camelCase to readable format
		const readableField = fieldName
			.replace(/([A-Z])/g, ' $1')
			.toLowerCase()
			.trim();
		return `Please provide ${readableField}.`;
	}

	// Pattern: "Invalid format" or similar validation messages
	if (rawMessage.includes('Invalid') || rawMessage.includes('invalid')) {
		return 'Invalid input. Please check your input and try again.';
	}

	// Generic validation error
	return 'Invalid input provided. Please check your input and try again.';
}

/**
 * Extract user-friendly error message from a Convex error
 *
 * **For SynergyOS structured errors**: Extracts user message directly (no regex needed)
 * **For Convex/system errors**: Parses and cleans technical details
 *
 * **Note:** Error codes are preserved in the original error object for logging.
 * Use `extractErrorCode()` if you need the code for structured error reporting.
 *
 * @param error - Error object or string
 * @returns Clean, user-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await createWorkspace({ name: 'test' });
 * } catch (error) {
 *   console.error('Full error:', error); // Includes code for debugging
 *   const message = parseConvexError(error);
 *   // Returns: "The name 'test' is not available. Please choose a different workspace name."
 * }
 * ```
 */
export function parseConvexError(error: unknown): string {
	// Handle SynergyOS structured errors first (our custom errors)
	if (error instanceof Error && isSynergyOSError(error)) {
		const userMessage = extractSynergyOSUserMessage(error);
		// Technical details are already logged by createError() function
		return userMessage || 'An error occurred. Please try again.';
	}

	// Get error message for Convex/system errors
	let rawMessage: string;
	if (error instanceof Error) {
		rawMessage = error.message || error.toString();

		// Check for Convex validation errors (ArgumentValidationError)
		if (
			error.name === 'ArgumentValidationError' ||
			rawMessage.includes('missing the required field')
		) {
			return parseConvexValidationError(rawMessage);
		}

		// Debug: Log raw error in development to help diagnose parsing issues
		// @ts-expect-error - import.meta.env is available in SvelteKit/Vite context
		if (import.meta.env.DEV && rawMessage.includes(' at ')) {
			console.debug('[parseConvexError] Raw error message contains stack trace:', {
				message: error.message,
				toString: error.toString(),
				stack: error.stack?.substring(0, 200)
			});
		}
	} else {
		rawMessage = String(error);
	}

	// Remove Convex prefixes and technical details for system errors
	// Process in order: prefixes → code → stack traces → file paths → cleanup
	// Normalize whitespace first (handle newlines, tabs, etc.)
	let cleanMessage = rawMessage
		.replace(/\r\n/g, ' ') // Windows line endings
		.replace(/\n/g, ' ') // Unix line endings
		.replace(/\t/g, ' ') // Tabs
		.replace(/\s+/g, ' ') // Multiple spaces → single space
		.trim();

	// Now process the normalized message
	cleanMessage = cleanMessage
		// Step 1: Remove Convex error prefix: "[CONVEX M(...)] [Request ID: ...] Server Error Uncaught Error:"
		.replace(/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i, '')
		// Step 2: Remove error code prefix: "ERROR_CODE: message" -> "message"
		// Match error code format per architecture.md #33: uppercase letters/underscores + colon
		.replace(/^[A-Z_]+:\s*/, '')
		// Step 3: Remove "Called by client" and everything after it
		.replace(/\s*Called by client.*$/i, '')
		// Step 4: Remove stack traces - multiple patterns (order matters!)
		// Pattern 1: "at functionName at functionName2 at functionName3" (space-separated, to end)
		// This is the most common format: "at createError at ensureSlugNotReserved at createWorkspaceFlow"
		.replace(/\s+at\s+[\w.]+(\s+at\s+[\w.]+)*.*$/i, '')
		// Pattern 2: "at functionName (file.ts:123:4)" (with file paths)
		.replace(/\s+at\s+[\w.]+\s*\([^)]*\)/g, '')
		// Pattern 3: Standalone "at functionName" (fallback for single function)
		.replace(/\s+at\s+[\w.]+$/i, '')
		// Step 5: Remove file paths in parentheses: "(../convex/file.ts:123:4)" or "(file.ts:123:4)"
		.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '')
		.replace(/\([^)]+\.ts:\d+:\d+\)/g, '')
		// Step 6: Remove any remaining file path patterns
		.replace(/\([^)]*\/[^)]*\)/g, '')
		.trim();

	// Clean up multiple spaces and trailing punctuation issues
	cleanMessage = cleanMessage
		.replace(/\s+/g, ' ') // Multiple spaces → single space
		.replace(/\.\s*\./g, '.') // Double periods → single period
		.replace(/\s+\./g, '.') // Space before period → period
		.trim();

	// If we ended up with nothing or just whitespace, provide a fallback
	if (!cleanMessage) {
		return 'An error occurred. Please try again.';
	}

	return cleanMessage;
}
