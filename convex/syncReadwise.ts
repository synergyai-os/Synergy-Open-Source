/**
 * Readwise Sync Orchestration
 * 
 * Main sync function to fetch data from Readwise API and populate Axon database.
 * Handles normalization, duplicate prevention, and incremental sync.
 */

"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import * as readwiseApi from "./readwiseApi";
import { parseAuthorString } from "./readwiseUtils";

/**
 * Main sync function - fetches all Readwise data and populates database
 * Public action - called from UI
 */
export const syncReadwiseHighlights = action({
  args: {
    // Time-based import
    dateRange: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d"),
      v.literal("180d"),
      v.literal("365d"),
      v.literal("all")
    )),
    // Custom date range
    customStartDate: v.optional(v.string()), // ISO 8601 date string
    customEndDate: v.optional(v.string()), // ISO 8601 date string
    // Quantity-based import
    quantity: v.optional(v.union(
      v.literal(50),
      v.literal(100),
      v.literal(250),
      v.literal(500),
      v.literal(1000)
    )),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.runQuery(internal.settings.getUserId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get encrypted Readwise API key
    const encryptedKeys = await ctx.runQuery(internal.settings.getEncryptedKeysInternal);
    if (!encryptedKeys?.readwiseApiKey) {
      throw new Error("Readwise API key not found. Please add it in Settings first.");
    }

    // Decrypt the API key
    const decryptedKey = await ctx.runAction(
      internal.cryptoActions.decryptApiKey,
      { encryptedApiKey: encryptedKeys.readwiseApiKey }
    );

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
    } else if (args.dateRange && args.dateRange !== "all") {
      // Preset date range
      const dayMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "180d": 180,
        "365d": 365,
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
      limit,
    });
  },
});

/**
 * Internal sync action - does the actual work
 */
export const syncReadwiseHighlightsInternal = internalAction({
  args: {
    userId: v.id("users"),
    apiKey: v.string(),
    updatedAfter: v.optional(v.string()), // ISO 8601 date string (overrides lastSyncAt if provided)
    updatedBefore: v.optional(v.string()), // ISO 8601 date string (for custom date ranges)
    limit: v.optional(v.number()), // Maximum number of highlights to import (for quantity-based)
  },
  handler: async (ctx, args) => {
    const { userId, apiKey, updatedAfter: dateFilter, limit } = args;

    // Get last sync timestamp for incremental sync
    // BUT: Skip incremental sync if quantity-based (limit provided) or custom date range provided
    let updatedAfter: string | undefined = dateFilter;
    if (!updatedAfter && !limit && !args.updatedBefore) {
      // Only use incremental sync if no date filters or limit are provided
      const userSettings = await ctx.runQuery(internal.settings.getUserSettingsForSync, {
        userId,
      });
      const lastSyncAt = userSettings?.lastReadwiseSyncAt;
      updatedAfter = lastSyncAt ? new Date(lastSyncAt).toISOString() : undefined;
    }

    console.log(`[syncReadwise] Starting sync for user ${userId}`);
    if (limit) {
      console.log(`[syncReadwise] Quantity-based import: ${limit} highlights (no date filter)`);
    } else {
      console.log(`[syncReadwise] Date filter: ${updatedAfter ? new Date(updatedAfter).toISOString() : "all time"}`);
      if (args.updatedBefore) {
        console.log(`[syncReadwise] Date filter before: ${new Date(args.updatedBefore).toISOString()}`);
      }
    }

    // Step 1: Fetch all books/sources (paginated)
    // For quantity-based imports, don't filter books by date (we'll filter highlights later)
    const booksUpdatedAfter = limit ? undefined : updatedAfter;
    const booksUpdatedBefore = limit ? undefined : args.updatedBefore;
    
    console.log(`[syncReadwise] Fetching books...`);
    const allSources = await fetchAllBooks(ctx, apiKey, booksUpdatedAfter, booksUpdatedBefore);
    console.log(`[syncReadwise] Fetched ${allSources.length} sources`);

    // Step 2: Normalize and insert/update authors and sources
    console.log(`[syncReadwise] Normalizing authors and sources...`);
    const sourceIdMap = new Map<number, string>(); // Readwise source ID -> Convex source ID

    for (const source of allSources) {
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
          authorName: authorNames[0],
        }
      );

      // Create or update source
      const sourceId = await ctx.runMutation(internal.syncReadwiseMutations.findOrCreateSource, {
        userId,
        primaryAuthorId,
        readwiseSource: source,
      });

      sourceIdMap.set(source.id, sourceId);

      // Create or find additional authors and link them
      for (let i = 1; i < authorNames.length; i++) {
        const authorId = await ctx.runMutation(
          internal.syncReadwiseMutations.findOrCreateAuthor,
          {
            userId,
            authorName: authorNames[i],
          }
        );

        // Link additional author to source
        await ctx.runMutation(internal.syncReadwiseMutations.linkAuthorToSource, {
          sourceId,
          authorId,
        });
      }

      // Create or assign tags from source tags
      for (const tag of source.tags || []) {
        const tagId = await ctx.runMutation(internal.syncReadwiseMutations.findOrCreateTag, {
          userId,
          tagName: tag.name,
          externalId: tag.id,
        });

        // Link tag to source
        await ctx.runMutation(internal.syncReadwiseMutations.linkTagToSource, {
          sourceId,
          tagId,
        });
      }
    }

    // Step 3: Fetch all highlights (paginated)
    // For quantity-based imports, don't filter highlights by date (we'll use limit instead)
    const highlightsUpdatedAfter = limit ? undefined : updatedAfter;
    const highlightsUpdatedBefore = limit ? undefined : args.updatedBefore;
    
    console.log(`[syncReadwise] Fetching highlights...`);
    const allHighlights = await fetchAllHighlights(
      ctx,
      apiKey,
      highlightsUpdatedAfter,
      highlightsUpdatedBefore,
      limit
    );
    console.log(`[syncReadwise] Fetched ${allHighlights.length} highlights`);

    // Step 4: Insert/update highlights and create inbox items
    console.log(`[syncReadwise] Processing highlights...`);
    let processedCount = 0;
    let errorCount = 0;

    for (const highlight of allHighlights) {
      try {
        // Find source ID
        const sourceId = sourceIdMap.get(highlight.book_id);
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
            sourceId,
            readwiseHighlight: highlight,
          }
        );

        // Create or update inbox item
        await ctx.runMutation(internal.syncReadwiseMutations.findOrCreateInboxItem, {
          userId,
          highlightId,
        });

        processedCount++;
      } catch (error) {
        console.error(
          `[syncReadwise] Error processing highlight ${highlight.id}:`,
          error
        );
        errorCount++;
      }
    }

    // Step 5: Update last sync timestamp
    await ctx.runMutation(internal.syncReadwiseMutations.updateLastSyncTime, {
      userId,
    });

    console.log(
      `[syncReadwise] Sync complete: ${processedCount} highlights processed, ${errorCount} errors`
    );

    return {
      success: true,
      sourcesCount: allSources.length,
      highlightsCount: processedCount,
      errorsCount: errorCount,
    };
  },
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

    const response = await ctx.runAction(internal.readwiseApi.fetchBooks, {
      apiKey,
      pageCursor,
      updatedAfter,
      updatedBefore,
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

    const response = await ctx.runAction(internal.readwiseApi.fetchHighlights, {
      apiKey,
      pageCursor,
      updatedAfter,
      updatedBefore,
    });

    // Add results
    const remaining = limit ? limit - allHighlights.length : response.results.length;
    const toAdd = response.results.slice(0, remaining);
    allHighlights.push(...toAdd);

    // Stop if we've reached the limit or no more pages
    if ((limit && allHighlights.length >= limit) || !response.next || response.results.length === 0) {
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

