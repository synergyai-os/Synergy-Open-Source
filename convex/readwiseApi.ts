/**
 * Readwise API Client
 *
 * Handles fetching data from Readwise API (highlights and books/sources).
 * Supports pagination and handles rate limiting.
 *
 * Documentation: https://readwise.io/api_deets
 */

'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from './infrastructure/errors/codes';
import type {
	ReadwiseHighlight,
	ReadwiseSource,
	ReadwisePaginatedResponse
} from '../src/lib/types/readwise';

/**
 * Fetch highlights from Readwise API with pagination support
 */
export const fetchHighlights = internalAction({
	args: {
		apiKey: v.string(),
		pageCursor: v.optional(v.string()), // URL to next page, or undefined for first page
		updatedAfter: v.optional(v.string()), // ISO 8601 date string
		updatedBefore: v.optional(v.string()), // ISO 8601 date string (for date ranges)
		pageSize: v.optional(v.number()) // Default 20, max 1000
	},
	handler: async (ctx, args): Promise<ReadwisePaginatedResponse<ReadwiseHighlight>> => {
		let url: string;

		if (args.pageCursor) {
			// Use provided cursor URL
			url = args.pageCursor;
		} else {
			// Build initial URL
			const baseUrl = 'https://readwise.io/api/v2/highlights/';
			const params = new URLSearchParams();

			if (args.updatedAfter) {
				params.append('updated__gt', args.updatedAfter);
			}

			if (args.updatedBefore) {
				params.append('updated__lt', args.updatedBefore);
			}

			const pageSize = args.pageSize || 1000; // Default to 1000 (max allowed)
			params.append('page_size', pageSize.toString());

			url = `${baseUrl}?${params.toString()}`;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Token ${args.apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 429) {
				// Rate limited
				const retryAfter = response.headers.get('Retry-After');
				const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
				throw createError(
					ErrorCodes.EXTERNAL_SERVICE_FAILURE,
					`Rate limit exceeded. Please wait ${retrySeconds} seconds before retrying.`
				);
			}

			const errorText = await response.text();
			let errorMessage = `Readwise API error: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.detail || errorJson.message || errorMessage;
			} catch {
				// Use raw error text if not JSON
				if (errorText) {
					errorMessage = `${errorMessage}\n${errorText}`;
				}
			}

			throw createError(ErrorCodes.EXTERNAL_SERVICE_FAILURE, errorMessage);
		}

		const data: ReadwisePaginatedResponse<ReadwiseHighlight> = await response.json();
		return data;
	}
});

/**
 * Fetch books/sources from Readwise API with pagination support
 */
export const fetchBooks = internalAction({
	args: {
		apiKey: v.string(),
		pageCursor: v.optional(v.string()), // URL to next page, or undefined for first page
		updatedAfter: v.optional(v.string()), // ISO 8601 date string
		updatedBefore: v.optional(v.string()) // ISO 8601 date string (for date ranges)
	},
	handler: async (ctx, args): Promise<ReadwisePaginatedResponse<ReadwiseSource>> => {
		let url: string;

		if (args.pageCursor) {
			// Use provided cursor URL
			url = args.pageCursor;
		} else {
			// Build initial URL
			const baseUrl = 'https://readwise.io/api/v2/books/';
			const params = new URLSearchParams();

			if (args.updatedAfter) {
				params.append('updated__gt', args.updatedAfter);
			}

			if (args.updatedBefore) {
				params.append('updated__lt', args.updatedBefore);
			}

			url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Token ${args.apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 429) {
				// Rate limited
				const retryAfter = response.headers.get('Retry-After');
				const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
				throw createError(
					ErrorCodes.EXTERNAL_SERVICE_FAILURE,
					`Rate limit exceeded. Please wait ${retrySeconds} seconds before retrying.`
				);
			}

			const errorText = await response.text();
			let errorMessage = `Readwise API error: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.detail || errorJson.message || errorMessage;
			} catch {
				// Use raw error text if not JSON
				if (errorText) {
					errorMessage = `${errorMessage}\n${errorText}`;
				}
			}

			throw createError(ErrorCodes.EXTERNAL_SERVICE_FAILURE, errorMessage);
		}

		const data: ReadwisePaginatedResponse<ReadwiseSource> = await response.json();
		return data;
	}
});
