/**
 * Test Readwise API Integration
 *
 * This action fetches sample data from Readwise API to understand the actual
 * data structure before designing our schema.
 *
 * Usage: Call this from Convex dashboard or via a test route to see the raw API response
 */

'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Test fetching highlights from Readwise API
 * Returns raw API response so we can analyze the structure
 */
export const fetchTestHighlights = action({
	args: {
		// Optional: limit number of results for testing
		limit: v.optional(v.number()),
		// Optional: page size for pagination testing
		pageSize: v.optional(v.number()),
		// Optional: API key for direct testing (for use in dashboard)
		// If not provided, will try to get from user settings (requires auth)
		apiKey: v.optional(v.string()),
		// Optional: sessionId for authenticated requests (required if apiKey not provided)
		sessionId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		let decryptedKey: string;

		// If API key provided directly, use it (for testing in dashboard)
		if (args.apiKey) {
			decryptedKey = args.apiKey;
		} else {
			// Otherwise, get from user settings (requires authentication)
			if (!args.sessionId) {
				throw createError(
					ErrorCodes.AUTH_REQUIRED,
					'Either apiKey or sessionId must be provided. For testing in dashboard, provide apiKey parameter directly.'
				);
			}
			const { userId } = await ctx.runQuery(
				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal,
				{
					sessionId: args.sessionId
				}
			);

			// Get encrypted keys
			const encryptedKeys = await ctx.runQuery(internal.settings.getEncryptedKeysInternal, {
				userId
			});
			if (!encryptedKeys?.readwiseApiKey) {
				throw createError(
					ErrorCodes.EXTERNAL_API_KEY_MISSING,
					'Readwise API key not found. Please add it in Settings first.'
				);
			}

			// Decrypt the API key
			decryptedKey = await ctx.runAction(internal.infrastructure.crypto.decryptApiKey, {
				encryptedApiKey: encryptedKeys.readwiseApiKey
			});
		}

		try {
			// Fetch highlights from Readwise API
			// Documentation: https://readwise.io/api_deets
			const pageSize = args.pageSize || 10; // Default to 10 for testing
			const url = `https://readwise.io/api/v2/highlights/?page_size=${pageSize}`;

			console.log(`[testReadwiseApi] Fetching highlights from Readwise API...`);
			console.log(`[testReadwiseApi] URL: ${url}`);

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Token ${decryptedKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw createError(
					ErrorCodes.EXTERNAL_SERVICE_FAILURE,
					`Readwise API error: ${response.status} ${response.statusText}\n${errorText}`
				);
			}

			const data = await response.json();

			// Log structure for analysis
			console.log(`[testReadwiseApi] Response status: ${response.status}`);
			console.log(`[testReadwiseApi] Response keys: ${Object.keys(data).join(', ')}`);
			console.log(`[testReadwiseApi] Number of results: ${data.results?.length || 0}`);

			// Log first result structure if available
			if (data.results && data.results.length > 0) {
				const firstResult = data.results[0];
				console.log(`[testReadwiseApi] First result keys: ${Object.keys(firstResult).join(', ')}`);
				console.log(`[testReadwiseApi] First result sample:`, JSON.stringify(firstResult, null, 2));
			}

			// Return structured data for analysis
			return {
				success: true,
				status: response.status,
				responseKeys: Object.keys(data),
				resultsCount: data.results?.length || 0,
				pagination: {
					next: data.next || null,
					previous: data.previous || null,
					count: data.count || 0
				},
				// Return first few results for inspection (limit if requested)
				sampleResults: args.limit ? data.results?.slice(0, args.limit) || [] : data.results || [],
				// Return full response for deep inspection
				fullResponse: data
			};
		} catch (error) {
			console.error(`[testReadwiseApi] Error:`, error);
			throw createError(
				ErrorCodes.EXTERNAL_SERVICE_FAILURE,
				`Failed to fetch Readwise highlights: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});

/**
 * Test fetching books from Readwise API
 * Books represent the sources of highlights
 */
export const fetchTestBooks = action({
	args: {
		limit: v.optional(v.number()),
		// Optional: API key for direct testing (for use in dashboard)
		// If not provided, will try to get from user settings (requires auth)
		apiKey: v.optional(v.string()),
		// Optional: sessionId for authenticated requests (required if apiKey not provided)
		sessionId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		let decryptedKey: string;

		// If API key provided directly, use it (for testing in dashboard)
		if (args.apiKey) {
			decryptedKey = args.apiKey;
		} else {
			// Otherwise, get from user settings (requires authentication)
			if (!args.sessionId) {
				throw createError(
					ErrorCodes.AUTH_REQUIRED,
					'Either apiKey or sessionId must be provided. For testing in dashboard, provide apiKey parameter directly.'
				);
			}
			const { userId } = await ctx.runQuery(
				internal.infrastructure.sessionValidation.validateSessionAndGetUserIdInternal,
				{
					sessionId: args.sessionId
				}
			);

			const encryptedKeys = await ctx.runQuery(internal.settings.getEncryptedKeysInternal, {
				userId
			});
			if (!encryptedKeys?.readwiseApiKey) {
				throw createError(
					ErrorCodes.EXTERNAL_API_KEY_MISSING,
					'Readwise API key not found. Please add it in Settings first.'
				);
			}

			decryptedKey = await ctx.runAction(internal.infrastructure.crypto.decryptApiKey, {
				encryptedApiKey: encryptedKeys.readwiseApiKey
			});
		}

		try {
			// Fetch books from Readwise API
			const url = `https://readwise.io/api/v2/books/`;

			console.log(`[testReadwiseApi] Fetching books from Readwise API...`);

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Token ${decryptedKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw createError(
					ErrorCodes.EXTERNAL_SERVICE_FAILURE,
					`Readwise API error: ${response.status} ${response.statusText}\n${errorText}`
				);
			}

			const data = await response.json();

			// Log structure
			console.log(`[testReadwiseApi] Books response keys: ${Object.keys(data).join(', ')}`);
			console.log(`[testReadwiseApi] Number of books: ${data.results?.length || 0}`);

			if (data.results && data.results.length > 0) {
				const firstBook = data.results[0];
				console.log(`[testReadwiseApi] First book keys: ${Object.keys(firstBook).join(', ')}`);
				console.log(`[testReadwiseApi] First book sample:`, JSON.stringify(firstBook, null, 2));
			}

			return {
				success: true,
				status: response.status,
				responseKeys: Object.keys(data),
				resultsCount: data.results?.length || 0,
				sampleResults: args.limit ? data.results?.slice(0, args.limit) || [] : data.results || [],
				fullResponse: data
			};
		} catch (error) {
			console.error(`[testReadwiseApi] Error fetching books:`, error);
			throw createError(
				ErrorCodes.EXTERNAL_SERVICE_FAILURE,
				`Failed to fetch Readwise books: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});
