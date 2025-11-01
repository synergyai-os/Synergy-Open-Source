/**
 * API Key Validation Utilities
 * 
 * Validates API keys before storing them to ensure they work correctly.
 * Uses Convex actions to make HTTP requests to external APIs.
 */

"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validate a Claude API key by making a minimal API request
 * Internal action - called from update mutations
 */
export const validateClaudeApiKey = internalAction({
	args: {
		apiKey: v.string(),
	},
	handler: async (ctx, args) => {
		try {
			// Make a minimal API call to validate the key
			// Using messages.create with minimal content
			const response = await fetch("https://api.anthropic.com/v1/messages", {
				method: "POST",
				headers: {
					"x-api-key": args.apiKey,
					"anthropic-version": "2023-06-01",
					"content-type": "application/json",
				},
				body: JSON.stringify({
					model: "claude-3-haiku-20240307", // Use the cheapest model for validation
					max_tokens: 10, // Minimal token count for validation
					messages: [
						{
							role: "user",
							content: "test",
						},
					],
				}),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				let errorMessage = `Claude API validation failed: ${response.status} ${response.statusText}`;
				try {
					const errorJson = JSON.parse(errorBody);
					errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
				} catch {
					// If parsing fails, use the raw error body or default message
					if (errorBody) {
						errorMessage = errorBody.length > 100 ? errorBody.substring(0, 100) + '...' : errorBody;
					}
				}
				return {
					valid: false,
					error: errorMessage,
				};
			}

			return { valid: true };
		} catch (error) {
			// Return validation error details
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error validating Claude API key";
			return {
				valid: false,
				error: errorMessage,
			};
		}
	},
});

/**
 * Validate a Readwise API key by checking the auth endpoint
 * Internal action - called from update mutations
 */
export const validateReadwiseApiKey = internalAction({
	args: {
		apiKey: v.string(),
	},
	handler: async (ctx, args) => {
		try {
			// Readwise provides a dedicated auth validation endpoint
			const response = await fetch("https://readwise.io/api/v2/auth/", {
				method: "GET",
				headers: {
					Authorization: `Token ${args.apiKey}`,
				},
			});

			// 204 No Content means the token is valid
			if (response.status === 204) {
				return { valid: true };
			}

			// Any other status means invalid
			const errorBody = await response.text();
			let errorMessage = `Readwise API validation failed: ${response.status} ${response.statusText}`;
			if (errorBody) {
				errorMessage = errorBody.length > 100 ? errorBody.substring(0, 100) + '...' : errorBody;
			}
			return {
				valid: false,
				error: errorMessage,
			};
		} catch (error) {
			// Return validation error details
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error validating Readwise API key";
			return {
				valid: false,
				error: errorMessage,
			};
		}
	},
});

