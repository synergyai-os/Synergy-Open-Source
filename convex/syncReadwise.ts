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
  args: {},
  handler: async (ctx) => {
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

    // Run sync
    return await ctx.runAction(internal.syncReadwise.syncReadwiseHighlightsInternal, {
      userId,
      apiKey: decryptedKey,
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
  },
  handler: async (ctx, args) => {
    const { userId, apiKey } = args;

    // Get last sync timestamp for incremental sync
    const userSettings = await ctx.runQuery(internal.settings.getUserSettingsForSync, {
      userId,
    });
    const lastSyncAt = userSettings?.lastReadwiseSyncAt;
    const updatedAfter = lastSyncAt
      ? new Date(lastSyncAt).toISOString()
      : undefined;

    console.log(`[syncReadwise] Starting sync for user ${userId}`);
    console.log(`[syncReadwise] Last sync: ${lastSyncAt ? new Date(lastSyncAt).toISOString() : "never"}`);

    // Step 1: Fetch all books/sources (paginated)
    console.log(`[syncReadwise] Fetching books...`);
    const allSources = await fetchAllBooks(ctx, apiKey, updatedAfter);
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
    console.log(`[syncReadwise] Fetching highlights...`);
    const allHighlights = await fetchAllHighlights(ctx, apiKey, updatedAfter);
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
  updatedAfter?: string
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
 */
async function fetchAllHighlights(
  ctx: any,
  apiKey: string,
  updatedAfter?: string
): Promise<any[]> {
  const allHighlights: any[] = [];
  let pageCursor: string | undefined = undefined;
  let pageCount = 0;

  while (true) {
    pageCount++;
    console.log(`[syncReadwise] Fetching highlights page ${pageCount}...`);

    const response = await ctx.runAction(internal.readwiseApi.fetchHighlights, {
      apiKey,
      pageCursor,
      updatedAfter,
    });

    allHighlights.push(...response.results);
    pageCursor = response.next || undefined;

    if (!pageCursor || response.results.length === 0) {
      break;
    }

    // Rate limit: 20 requests/minute for highlights endpoint
    // Wait 3 seconds between requests to stay under limit
    if (pageCursor) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  return allHighlights;
}

