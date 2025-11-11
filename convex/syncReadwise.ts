/**
 * Readwise Sync Orchestration
 *
 * Main sync function to fetch data from Readwise API and populate Axon database.
 * Handles normalization, duplicate prevention, and incremental sync.
 */

'use node';

import { action, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { getAuthUserId } from './auth';
import * as readwiseApi from './readwiseApi';
import { parseAuthorString } from './readwiseUtils';

/**
 * Main sync function - fetches all Readwise data and populates database
 * Public action - called from UI
 */
export const syncReadwiseHighlights = action({
	args: {
		// Time-based import
		dateRange: v.optional(
			v.union(
				v.literal('7d'),
				v.literal('30d'),
				v.literal('90d'),
				v.literal('180d'),
				v.literal('365d'),
				v.literal('all')
			)
		),
		// Custom date range
		customStartDate: v.optional(v.string()), // ISO 8601 date string
		customEndDate: v.optional(v.string()), // ISO 8601 date string
		// Quantity-based import
		quantity: v.optional(
			v.union(
				v.literal(5),
				v.literal(10),
				v.literal(25),
				v.literal(50),
				v.literal(100),
				v.literal(250),
				v.literal(500),
				v.literal(1000)
			)
		)
	},
	handler: async (ctx, args) => {
		const userId = await ctx.runQuery(internal.settings.getUserId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get encrypted Readwise API key
		const encryptedKeys = await ctx.runQuery(internal.settings.getEncryptedKeysInternal);
		if (!encryptedKeys?.readwiseApiKey) {
			throw new Error('Readwise API key not found. Please add it in Settings first.');
		}

		// Decrypt the API key
		const decryptedKey = await ctx.runAction(internal.cryptoActions.decryptApiKey, {
			encryptedApiKey: encryptedKeys.readwiseApiKey
		});

		// Calculate date filter based on options
		let updatedAfter: string | undefined;
		let updatedBefore: string | undefined;
		let limit: number | undefined;

		// Priority: custom date range > quantity > date range
		if (args.customStartDate && args.customEndDate) {
			// Custom date range
			updatedAfter = new Date(args.customStartDate).toISOString();
			const endDate = new Date(args.customEndDate);
			endDate.setHours(23, 59, 59, 999); // End of day
			updatedBefore = endDate.toISOString();
		} else if (args.quantity) {
			// Quantity-based: no date filter, but limit the number of highlights
			limit = args.quantity;
		} else if (args.dateRange && args.dateRange !== 'all') {
			// Preset date range
			const dayMap: Record<string, number> = {
				'7d': 7,
				'30d': 30,
				'90d': 90,
				'180d': 180,
				'365d': 365
			};
			const days = dayMap[args.dateRange];
			if (days) {
				const date = new Date();
				date.setDate(date.getDate() - days);
				updatedAfter = date.toISOString();
			}
		}

		// Run sync
		return await ctx.runAction(internal.syncReadwise.syncReadwiseHighlightsInternal, {
			userId,
			apiKey: decryptedKey,
			updatedAfter,
			updatedBefore,
			limit
		});
	}
});

/**
 * Internal sync action - does the actual work
 */
export const syncReadwiseHighlightsInternal = internalAction({
	args: {
		userId: v.id('users'),
		apiKey: v.string(),
		updatedAfter: v.optional(v.string()), // ISO 8601 date string (overrides lastSyncAt if provided)
		updatedBefore: v.optional(v.string()), // ISO 8601 date string (for custom date ranges)
		limit: v.optional(v.number()) // Maximum number of highlights to import (for quantity-based)
	},
	handler: async (ctx, args) => {
		const { userId, apiKey, updatedAfter: dateFilter, limit } = args;

		try {
			// Get last sync timestamp for incremental sync
			// BUT: Skip incremental sync if quantity-based (limit provided) or custom date range provided
			let updatedAfter: string | undefined = dateFilter;
			if (!updatedAfter && !limit && !args.updatedBefore) {
				// Only use incremental sync if no date filters or limit are provided
				const userSettings = await ctx.runQuery(internal.settings.getUserSettingsForSync, {
					userId
				});
				const lastSyncAt = userSettings?.lastReadwiseSyncAt;
				updatedAfter = lastSyncAt ? new Date(lastSyncAt).toISOString() : undefined;
			}

			console.log(`[syncReadwise] Starting sync for user ${userId}`);
			if (limit) {
				console.log(`[syncReadwise] Quantity-based import: ${limit} highlights (no date filter)`);
			} else {
				console.log(
					`[syncReadwise] Date filter: ${updatedAfter ? new Date(updatedAfter).toISOString() : 'all time'}`
				);
				if (args.updatedBefore) {
					console.log(
						`[syncReadwise] Date filter before: ${new Date(args.updatedBefore).toISOString()}`
					);
				}
			}

			// Initialize progress tracking
			await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
				userId,
				step: 'Fetching highlights...',
				current: 0,
				total: limit || undefined,
				message: 'Connecting to Readwise...'
			});

			// NEW FLOW: Start with highlights first (newest first)
			// Step 1: Fetch highlights and identify which ones need importing
			console.log(`[syncReadwise] Fetching highlights first (newest first)...`);
			const highlightsUpdatedAfter = limit ? undefined : updatedAfter;
			const highlightsUpdatedBefore = limit ? undefined : args.updatedBefore;

			let processedCount = 0;
			let newCount = 0;
			let skippedCount = 0;
			let errorCount = 0;

			let pageCursor: string | undefined = undefined;
			let pageCount = 0;
			let totalChecked = 0;
			const neededBookIds = new Set<number>(); // Track book_ids we need to fetch
			const highlightsToProcess: any[] = []; // Track highlights that need importing

			// Fetch highlights and check which ones need importing
			while (true) {
				// If we've reached the limit of new items for quantity-based import, stop
				if (limit && newCount >= limit) {
					console.log(`[syncReadwise] Reached target of ${limit} new highlights`);
					break;
				}

				// Fetch next page of highlights
				pageCount++;
				console.log(`[syncReadwise] Fetching highlights page ${pageCount}...`);

				if (limit && newCount < limit) {
					await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
						userId,
						step: 'Fetching highlights...',
						current: newCount,
						total: limit,
						message: `Checking highlights... Found ${newCount} new of ${limit} needed`
					});
				}

				const response: any = await ctx.runAction(internal.readwiseApi.fetchHighlights, {
					apiKey,
					pageCursor,
					updatedAfter: highlightsUpdatedAfter,
					updatedBefore: highlightsUpdatedBefore
				});

				if (!response.results || response.results.length === 0) {
					console.log(`[syncReadwise] No more highlights available`);
					break;
				}

				// Sort highlights by updated field (newest first) to ensure consistent ordering
				// The API doesn't guarantee order, so we explicitly sort to always get the newest highlights first
				const sortedHighlights = [...response.results].sort((a, b) => {
					const dateA = new Date(a.updated || a.highlighted_at || 0).getTime();
					const dateB = new Date(b.updated || b.highlighted_at || 0).getTime();
					return dateB - dateA; // Descending order (newest first)
				});

				// Log first and last highlight timestamps for verification
				if (sortedHighlights.length > 0) {
					const first = sortedHighlights[0];
					const last = sortedHighlights[sortedHighlights.length - 1];
					console.log(
						`[syncReadwise] Page ${pageCount} sorted: First highlight updated=${first.updated}, Last highlight updated=${last.updated}`
					);
				}

				// Check each highlight to see if it needs importing
				for (const highlight of sortedHighlights) {
					totalChecked++;

					// Update progress every 10 highlights or on last
					if (
						totalChecked % 10 === 0 ||
						(!response.next && highlight === sortedHighlights[sortedHighlights.length - 1])
					) {
						await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
							userId,
							step: 'Checking highlights...',
							current: newCount,
							total: limit || undefined,
							message: limit
								? `Checking highlight ${totalChecked}... Found ${newCount} new of ${limit} needed`
								: `Checking highlight ${totalChecked}...`
						});
					}

					try {
						// Check if highlight already exists (by externalId)
						const highlightExists = await ctx.runQuery(
							internal.syncReadwiseMutations.checkHighlightExists,
							{
								userId,
								externalId: String(highlight.id)
							}
						);

						// For quantity-based imports, also check if inbox item exists
						let needsImport = !highlightExists;
						if (limit && highlightExists) {
							// If highlight exists, check if it has an inbox item
							// We need to get the highlightId first to check inbox item
							const existingHighlightId = await ctx.runQuery(
								internal.syncReadwiseMutations.getHighlightIdByExternalId,
								{
									userId,
									externalId: String(highlight.id)
								}
							);

							if (existingHighlightId) {
								const inboxItemExists = await ctx.runQuery(
									internal.syncReadwiseMutations.checkInboxItemExists,
									{
										userId,
										highlightId: existingHighlightId
									}
								);

								needsImport = !inboxItemExists;
							}
						}

						if (!needsImport) {
							skippedCount++;
							continue; // Skip already-imported highlights
						}

						// This highlight needs importing - track it and its book_id
						highlightsToProcess.push(highlight);
						neededBookIds.add(highlight.book_id);
						newCount++;

						// For quantity-based imports, stop if we've reached the limit
						if (limit && newCount >= limit) {
							console.log(`[syncReadwise] Found ${newCount} highlights to import`);
							break; // Break out of highlight loop
						}
					} catch (error) {
						console.error(`[syncReadwise] Error checking highlight ${highlight.id}:`, error);
						errorCount++;
					}
				}

				// If we've reached the limit, break out of pagination loop
				if (limit && newCount >= limit) {
					break;
				}

				// If no more pages, stop
				if (!response.next) {
					console.log(`[syncReadwise] No more pages available`);
					break;
				}

				pageCursor = response.next;

				// Rate limit: 20 requests/minute for highlights endpoint
				// Wait 3 seconds between requests to stay under limit
				if (pageCursor) {
					await new Promise((resolve) => setTimeout(resolve, 3000));
				}
			}

			console.log(
				`[syncReadwise] Found ${highlightsToProcess.length} highlights to import from ${neededBookIds.size} unique sources`
			);

			// Step 2: Fetch and process only the sources we need
			const sourceIdMap = new Map<number, string>(); // Readwise source ID -> Convex source ID

			if (neededBookIds.size > 0) {
				await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
					userId,
					step: 'Fetching sources...',
					current: 0,
					total: neededBookIds.size,
					message: `Fetching ${neededBookIds.size} sources...`
				});

				console.log(`[syncReadwise] Fetching sources for ${neededBookIds.size} unique books...`);

				// Fetch all books and filter to only those we need
				const booksUpdatedAfter = limit ? undefined : updatedAfter;
				const booksUpdatedBefore = limit ? undefined : args.updatedBefore;
				const allSources = await fetchAllBooks(ctx, apiKey, booksUpdatedAfter, booksUpdatedBefore);

				// Filter to only sources we need
				const neededSources = allSources.filter((source) => neededBookIds.has(source.id));
				console.log(
					`[syncReadwise] Found ${neededSources.length} of ${neededBookIds.size} needed sources`
				);

				await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
					userId,
					step: 'Processing sources...',
					current: 0,
					total: neededSources.length,
					message: `Processing ${neededSources.length} sources...`
				});

				// Process only the sources we need
				let sourceIndex = 0;
				for (const source of neededSources) {
					sourceIndex++;
					if (sourceIndex % 10 === 0 || sourceIndex === neededSources.length) {
						// Update progress every 10 sources or on last
						await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
							userId,
							step: 'Processing sources...',
							current: sourceIndex,
							total: neededSources.length,
							message: `Processing source ${sourceIndex} of ${neededSources.length}...`
						});
					}

					// Check if source already exists
					const existingSourceId = await ctx.runQuery(
						internal.syncReadwiseMutations.getSourceIdByBookId,
						{
							userId,
							bookId: String(source.id)
						}
					);

					if (existingSourceId) {
						sourceIdMap.set(source.id, existingSourceId);
						continue; // Source already exists, skip processing
					}

					// Parse and normalize authors
					const authorNames = parseAuthorString(source.author);
					if (authorNames.length === 0) {
						console.warn(`[syncReadwise] Source ${source.id} has no author, skipping...`);
						continue;
					}

					// Create or find primary author (first one)
					const primaryAuthorId = await ctx.runMutation(
						internal.syncReadwiseMutations.findOrCreateAuthor,
						{
							userId,
							authorName: authorNames[0]
						}
					);

					// Create or update source
					const sourceId = await ctx.runMutation(
						internal.syncReadwiseMutations.findOrCreateSource,
						{
							userId,
							primaryAuthorId,
							readwiseSource: source
						}
					);

					sourceIdMap.set(source.id, sourceId);

					// Create or find additional authors and link them
					for (let i = 1; i < authorNames.length; i++) {
						const authorId = await ctx.runMutation(
							internal.syncReadwiseMutations.findOrCreateAuthor,
							{
								userId,
								authorName: authorNames[i]
							}
						);

						// Link additional author to source
						await ctx.runMutation(internal.syncReadwiseMutations.linkAuthorToSource, {
							sourceId,
							authorId
						});
					}

					// Create or assign tags from source tags
					for (const tag of source.tags || []) {
						const tagId = await ctx.runMutation(internal.syncReadwiseMutations.findOrCreateTag, {
							userId,
							tagName: tag.name,
							externalId: tag.id
						});

						// Link tag to source
						await ctx.runMutation(internal.syncReadwiseMutations.linkTagToSource, {
							sourceId,
							tagId
						});
					}
				}
			}

			// Step 3: Process the highlights we identified as needing import
			console.log(`[syncReadwise] Processing ${highlightsToProcess.length} highlights...`);

			await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
				userId,
				step: 'Importing highlights...',
				current: 0,
				total: highlightsToProcess.length,
				message: `Importing ${highlightsToProcess.length} highlights...`
			});

			let highlightIndex = 0;
			for (const highlight of highlightsToProcess) {
				highlightIndex++;

				// Update progress every 10 highlights or on last
				if (highlightIndex % 10 === 0 || highlightIndex === highlightsToProcess.length) {
					await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
						userId,
						step: 'Importing highlights...',
						current: highlightIndex,
						total: highlightsToProcess.length,
						message: `Importing highlight ${highlightIndex} of ${highlightsToProcess.length}...`
					});
				}

				try {
					// Get source ID (should exist from Step 2)
					let sourceId: string | null = sourceIdMap.get(highlight.book_id) || null;

					// If source doesn't exist in map, check if it exists in database
					if (!sourceId) {
						sourceId = await ctx.runQuery(internal.syncReadwiseMutations.getSourceIdByBookId, {
							userId,
							bookId: String(highlight.book_id)
						});
					}

					if (!sourceId) {
						console.warn(
							`[syncReadwise] Highlight ${highlight.id} references unknown source ${highlight.book_id}, skipping...`
						);
						errorCount++;
						continue;
					}

					// Create or update highlight
					const highlightId = await ctx.runMutation(
						internal.syncReadwiseMutations.findOrCreateHighlight,
						{
							userId,
							sourceId: sourceId as any, // Type assertion needed for Id conversion
							readwiseHighlight: highlight
						}
					);

					// Create inbox item (we already checked it doesn't exist)
					await ctx.runMutation(internal.syncReadwiseMutations.findOrCreateInboxItem, {
						userId,
						highlightId
					});

					processedCount++;
				} catch (error) {
					console.error(`[syncReadwise] Error processing highlight ${highlight.id}:`, error);
					errorCount++;
				}
			}

			console.log(
				`[syncReadwise] Processed ${processedCount} highlights, ${newCount} new, ${skippedCount} skipped, ${errorCount} errors`
			);

			// Step 5: Update last sync timestamp
			await ctx.runMutation(internal.syncReadwiseMutations.updateLastSyncTime, {
				userId
			});

			console.log(
				`[syncReadwise] Sync complete: ${processedCount} highlights processed, ${newCount} new, ${skippedCount} skipped, ${errorCount} errors`
			);

			// Clear progress tracking on completion
			await ctx.runMutation(internal.syncReadwiseMutations.clearSyncProgress, {
				userId
			});

			return {
				success: true,
				sourcesCount: neededBookIds.size,
				highlightsCount: processedCount,
				newCount,
				skippedCount,
				errorsCount: errorCount
			};
		} catch (error) {
			// Clear progress on error
			try {
				await ctx.runMutation(internal.syncReadwiseMutations.clearSyncProgress, {
					userId
				});
			} catch (clearError) {
				console.error(`[syncReadwise] Error clearing progress:`, clearError);
			}

			console.error(`[syncReadwise] Sync failed:`, error);
			throw error;
		}
	}
});

/**
 * Helper: Fetch all books with pagination
 */
async function fetchAllBooks(
	ctx: any,
	apiKey: string,
	updatedAfter?: string,
	updatedBefore?: string
): Promise<any[]> {
	const allBooks: any[] = [];
	let pageCursor: string | undefined = undefined;
	let pageCount = 0;

	while (true) {
		pageCount++;
		console.log(`[syncReadwise] Fetching books page ${pageCount}...`);

		const response: any = await ctx.runAction(internal.readwiseApi.fetchBooks, {
			apiKey,
			pageCursor,
			updatedAfter,
			updatedBefore
		});

		allBooks.push(...response.results);
		pageCursor = response.next || undefined;

		if (!pageCursor || response.results.length === 0) {
			break;
		}

		// Rate limit: 20 requests/minute for books endpoint
		// Wait 3 seconds between requests to stay under limit
		if (pageCursor) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	return allBooks;
}

/**
 * Helper: Fetch all highlights with pagination
 * Supports date range filtering and quantity limiting
 */
async function fetchAllHighlights(
	ctx: any,
	apiKey: string,
	updatedAfter?: string,
	updatedBefore?: string,
	limit?: number
): Promise<any[]> {
	const allHighlights: any[] = [];
	let pageCursor: string | undefined = undefined;
	let pageCount = 0;

	while (true) {
		// Stop if we've reached the quantity limit
		if (limit && allHighlights.length >= limit) {
			// Take only up to the limit
			return allHighlights.slice(0, limit);
		}

		pageCount++;
		console.log(`[syncReadwise] Fetching highlights page ${pageCount}...`);

		const response: any = await ctx.runAction(internal.readwiseApi.fetchHighlights, {
			apiKey,
			pageCursor,
			updatedAfter,
			updatedBefore
		});

		// Add results
		const remaining = limit ? limit - allHighlights.length : response.results.length;
		const toAdd = response.results.slice(0, remaining);
		allHighlights.push(...toAdd);

		// Stop if we've reached the limit or no more pages
		if (
			(limit && allHighlights.length >= limit) ||
			!response.next ||
			response.results.length === 0
		) {
			break;
		}

		pageCursor = response.next || undefined;

		// Rate limit: 20 requests/minute for highlights endpoint
		// Wait 3 seconds between requests to stay under limit
		if (pageCursor) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	return allHighlights;
}
