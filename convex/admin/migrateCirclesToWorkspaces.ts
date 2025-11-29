/**
 * Migration: Update circles and meetings tables from organizationId to workspaceId
 *
 * This migration updates all circles and meetings documents that still have `organizationId`
 * to use `workspaceId` instead, matching the updated schema.
 * Also adds missing `meetingType` field to meetings that don't have it.
 *
 * Run with: npx convex run admin/migrateCirclesToWorkspaces:migrate
 */

import { internalMutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

/**
 * Migrate all circles and meetings from organizationId to workspaceId
 * This is a one-time migration after the organizations → workspaces refactoring
 */
export const migrate = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: organizationId → workspaceId');
		console.log('  Tables: circles, meetings\n');

		// ============================================================================
		// CREATE ID MAPPING: organization IDs → workspace IDs
		// ============================================================================
		// Initialize mapping first (will be populated during organization migration)
		const idMapping = new Map<string, Id<'workspaces'>>();

		// ============================================================================
		// STEP 1: MIGRATE ORGANIZATIONS → WORKSPACES (if needed)
		// ============================================================================
		console.log('🔍 Step 1: Migrating organizations → workspaces...');
		const existingWorkspaces = await ctx.db.query('workspaces').collect();

		if (existingWorkspaces.length === 0) {
			console.log('No workspaces found, attempting to migrate from organizations table...');

			try {
				// Try to query the old organizations table
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const oldOrganizations = await (ctx.db.query as any)('organizations').collect();

				if (oldOrganizations && oldOrganizations.length > 0) {
					console.log(`Found ${oldOrganizations.length} organizations to migrate`);

					for (const oldOrg of oldOrganizations) {
						const orgDoc = oldOrg as unknown as {
							_id: string;
							name: string;
							slug: string;
							createdAt: number;
							updatedAt: number;
							plan: string;
							branding?: unknown;
						};

						const orgIdStr = orgDoc._id;

						try {
							// Insert new workspace (Convex will auto-generate ID)
							const workspaceId = await ctx.db.insert('workspaces', {
								name: orgDoc.name,
								slug: orgDoc.slug,
								createdAt: orgDoc.createdAt,
								updatedAt: orgDoc.updatedAt,
								plan: orgDoc.plan,
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								branding: orgDoc.branding as any
							});

							// Store mapping: old org ID → new workspace ID
							idMapping.set(orgIdStr, workspaceId);

							console.log(
								`✅ Migrated organization ${orgDoc.name} (${orgIdStr}) → workspace ${workspaceId}`
							);
						} catch (error) {
							console.error(`❌ Error migrating organization ${orgDoc._id}:`, error);
						}
					}
				} else {
					console.log('No old organizations table found or it is empty');
				}
			} catch (error) {
				console.log('⚠️  Could not query organizations table (may not exist):', error);
			}
		} else {
			console.log(`Found ${existingWorkspaces.length} existing workspaces`);
			// Try to rebuild mapping by matching old organizations with existing workspaces
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const oldOrganizations = await (ctx.db.query as any)('organizations').collect();
				if (oldOrganizations && oldOrganizations.length > 0) {
					console.log(
						`Found ${oldOrganizations.length} old organizations to match with workspaces`
					);
					// Create a lookup map by slug (most reliable identifier)
					const workspaceBySlug = new Map<string, Id<'workspaces'>>();
					for (const workspace of existingWorkspaces) {
						workspaceBySlug.set(workspace.slug, workspace._id);
					}

					// Match old organizations to workspaces by slug
					for (const oldOrg of oldOrganizations) {
						const orgDoc = oldOrg as unknown as {
							_id: string;
							slug: string;
							name: string;
						};
						const workspaceId = workspaceBySlug.get(orgDoc.slug);
						if (workspaceId) {
							idMapping.set(orgDoc._id, workspaceId);
							console.log(
								`✅ Matched organization ${orgDoc.name} (${orgDoc._id}) → workspace ${workspaceId}`
							);
						} else {
							console.log(
								`⚠️  Could not match organization ${orgDoc.name} (${orgDoc._id}) - slug "${orgDoc.slug}" not found in workspaces`
							);
						}
					}
				} else {
					console.log(
						'No old organizations table found - building mapping from workspace IDs only'
					);
					// Fallback: just map workspace IDs to themselves
					for (const workspace of existingWorkspaces) {
						idMapping.set(workspace._id, workspace._id);
					}
				}
			} catch (error) {
				console.log('⚠️  Could not query organizations table (may not exist):', error);
				// Fallback: just map workspace IDs to themselves
				for (const workspace of existingWorkspaces) {
					idMapping.set(workspace._id, workspace._id);
				}
			}
		}

		// ============================================================================
		// STEP 2: BUILD FINAL ID MAPPING
		// ============================================================================
		console.log(`\n✅ Built mapping for ${idMapping.size} organization→workspace IDs\n`);

		// ============================================================================
		// MIGRATE CIRCLES
		// ============================================================================
		console.log('📦 Migrating circles...');
		const allCircles = await ctx.db.query('circles').collect();

		let circlesMigrated = 0;
		let circlesSkipped = 0;
		let circlesErrors = 0;

		for (const circle of allCircles) {
			const circleDoc = circle as unknown as {
				_id: Id<'circles'>;
				organizationId?: string; // Temporarily a string in schema
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = circleDoc.workspaceId ? String(circleDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsMigration = circleDoc.organizationId || hasOldOrgIdAsWorkspaceId;

			if (!needsMigration && circleDoc.workspaceId) {
				// Already has valid workspaceId, skip
				circlesSkipped++;
				continue;
			}

			if (!circleDoc.organizationId && !hasOldOrgIdAsWorkspaceId) {
				console.error(`❌ Circle ${circleDoc._id}: Missing both organizationId and workspaceId`);
				circlesErrors++;
				continue;
			}

			try {
				// Determine which org ID to use for migration
				const orgIdToMigrate = circleDoc.organizationId || workspaceIdStr;
				if (!orgIdToMigrate) {
					circlesErrors++;
					continue;
				}

				// Find the corresponding workspace ID using our mapping
				const newWorkspaceId = idMapping.get(orgIdToMigrate);
				if (!newWorkspaceId) {
					console.error(
						`❌ Circle ${circleDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
					);
					circlesErrors++;
					continue;
				}

				// Verify the workspace exists
				const workspace = await ctx.db.get(newWorkspaceId);
				if (!workspace) {
					console.error(
						`❌ Circle ${circleDoc._id}: workspaceId ${newWorkspaceId} not found in workspaces`
					);
					circlesErrors++;
					continue;
				}

				// Use replace() to update the document, removing organizationId and updating workspaceId
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = circleDoc as Record<string, unknown>;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(circleDoc._id, { ...rest, workspaceId: newWorkspaceId });

				circlesMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating circle ${circleDoc._id}:`, error);
				circlesErrors++;
			}
		}

		// ============================================================================
		// MIGRATE MEETINGS
		// ============================================================================
		console.log('\n📅 Migrating meetings...');
		const allMeetings = await ctx.db.query('meetings').collect();

		let meetingsMigrated = 0;
		let meetingsSkipped = 0;
		let meetingsErrors = 0;

		for (const meeting of allMeetings) {
			const meetingDoc = meeting as unknown as {
				_id: Id<'meetings'>;
				organizationId?: string; // Temporarily a string in schema
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				meetingType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = meetingDoc.workspaceId ? String(meetingDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = meetingDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsMeetingType = !meetingDoc.meetingType;

			if (!needsWorkspaceId && !needsMeetingType) {
				meetingsSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = meetingDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				// Migrate organizationId → workspaceId
				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = meetingDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						meetingsErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Meeting ${meetingDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						meetingsErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				// Add missing meetingType (default to 'general')
				if (needsMeetingType) {
					updatedDoc.meetingType = 'general';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(meetingDoc._id, updatedDoc);
				meetingsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating meeting ${meetingDoc._id}:`, error);
				meetingsErrors++;
			}
		}

		// ============================================================================
		// MIGRATE FEATURE FLAGS
		// ============================================================================
		console.log('\n🚩 Migrating feature flags...');
		const allFeatureFlags = await ctx.db.query('featureFlags').collect();

		let flagsMigrated = 0;
		let flagsSkipped = 0;
		let flagsErrors = 0;

		for (const flag of allFeatureFlags) {
			const flagDoc = flag as unknown as {
				_id: Id<'featureFlags'>;
				flag: string;
				allowedOrganizationIds?: string[];
				allowedWorkspaceIds?: (Id<'workspaces'> | string)[];
			};

			// Collect all organization IDs that need migration
			const orgIdsToMigrate: string[] = [];

			// Case 1: Check for allowedOrganizationIds field
			if (flagDoc.allowedOrganizationIds && flagDoc.allowedOrganizationIds.length > 0) {
				orgIdsToMigrate.push(...flagDoc.allowedOrganizationIds);
			}

			// Case 2: Check if allowedWorkspaceIds contains old organization IDs
			// Old org IDs are opaque Convex IDs (like "mx7...") that exist in our mapping
			// New workspace IDs start with "s57..." (or other prefixes for workspaces table)
			if (flagDoc.allowedWorkspaceIds && flagDoc.allowedWorkspaceIds.length > 0) {
				for (const wsId of flagDoc.allowedWorkspaceIds) {
					if (typeof wsId === 'string') {
						// Check if this ID is an old organization ID by seeing if it's in our mapping
						// OR if it starts with "organizations_" (legacy format check)
						if (idMapping.has(wsId) || wsId.startsWith('organizations_')) {
							// Only add if it's actually in the mapping (is an old org ID)
							if (idMapping.has(wsId)) {
								orgIdsToMigrate.push(wsId);
							}
						}
					}
				}
			}

			// Skip if no organization IDs to migrate
			if (orgIdsToMigrate.length === 0) {
				flagsSkipped++;
				continue;
			}

			try {
				// Convert organization IDs to workspace IDs using mapping
				const existingWorkspaceIds = new Set<string>();

				// First, preserve any workspace IDs that are NOT old organization IDs
				// (i.e., they're not in the mapping, so they're already valid workspace IDs)
				if (flagDoc.allowedWorkspaceIds) {
					for (const wsId of flagDoc.allowedWorkspaceIds) {
						if (typeof wsId === 'string') {
							// If this ID is NOT in the mapping, it's already a valid workspace ID → keep it
							// If it IS in the mapping, it's an old org ID → we'll migrate it below
							if (!idMapping.has(wsId) && !wsId.startsWith('organizations_')) {
								existingWorkspaceIds.add(wsId);
							}
						}
					}
				}

				// Now migrate organization IDs to workspace IDs
				for (const orgId of orgIdsToMigrate) {
					const workspaceId = idMapping.get(orgId);
					if (!workspaceId) {
						console.error(
							`❌ Feature flag "${flagDoc.flag}" (${flagDoc._id}): organizationId ${orgId} not found in mapping`
						);
						flagsErrors++;
						continue;
					}
					existingWorkspaceIds.add(workspaceId);
				}

				if (existingWorkspaceIds.size === 0) {
					console.error(
						`❌ Feature flag "${flagDoc.flag}" (${flagDoc._id}): No valid workspace IDs after migration`
					);
					flagsErrors++;
					continue;
				}

				// Convert Set to array
				const finalWorkspaceIds = Array.from(existingWorkspaceIds) as Id<'workspaces'>[];

				// Use replace() to update the document
				const { allowedOrganizationIds: _allowedOrganizationIds, ...rest } = flagDoc as Record<
					string,
					unknown
				>;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(flagDoc._id, {
					...rest,
					allowedWorkspaceIds: finalWorkspaceIds
				});

				console.log(
					`✅ Migrated feature flag "${flagDoc.flag}": ${orgIdsToMigrate.length} org IDs → ${finalWorkspaceIds.length} workspace IDs`
				);
				flagsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating feature flag "${flagDoc.flag}" (${flagDoc._id}):`, error);
				flagsErrors++;
			}
		}

		// ============================================================================
		// MIGRATE MEETING TEMPLATES
		// ============================================================================
		console.log('\n📋 Migrating meeting templates...');
		const allMeetingTemplates = await ctx.db.query('meetingTemplates').collect();

		let templatesMigrated = 0;
		let templatesSkipped = 0;
		let templatesErrors = 0;

		for (const template of allMeetingTemplates) {
			const templateDoc = template as unknown as {
				_id: Id<'meetingTemplates'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = templateDoc.workspaceId ? String(templateDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsMigration = templateDoc.organizationId || hasOldOrgIdAsWorkspaceId;

			if (!needsMigration && templateDoc.workspaceId) {
				// Already has valid workspaceId, skip
				templatesSkipped++;
				continue;
			}

			if (!templateDoc.organizationId && !hasOldOrgIdAsWorkspaceId) {
				console.error(
					`❌ Meeting template ${templateDoc._id}: Missing both organizationId and workspaceId`
				);
				templatesErrors++;
				continue;
			}

			try {
				// Determine which org ID to use for migration
				const orgIdToMigrate = templateDoc.organizationId || workspaceIdStr;
				if (!orgIdToMigrate) {
					templatesErrors++;
					continue;
				}

				const newWorkspaceId = idMapping.get(orgIdToMigrate);
				if (!newWorkspaceId) {
					console.error(
						`❌ Meeting template ${templateDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
					);
					templatesErrors++;
					continue;
				}

				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = templateDoc as Record<string, unknown>;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(templateDoc._id, { ...rest, workspaceId: newWorkspaceId });

				templatesMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating meeting template ${templateDoc._id}:`, error);
				templatesErrors++;
			}
		}

		// ============================================================================
		// MIGRATE INBOX ITEMS
		// ============================================================================
		console.log('\n📥 Migrating inbox items...');
		const allInboxItems = await ctx.db.query('inboxItems').collect();

		let inboxItemsMigrated = 0;
		let inboxItemsSkipped = 0;
		let inboxItemsErrors = 0;

		for (const item of allInboxItems) {
			const itemDoc = item as unknown as {
				_id: Id<'inboxItems'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				ownershipType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = itemDoc.workspaceId ? String(itemDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = itemDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsOwnershipType =
				itemDoc.ownershipType === 'organization' || itemDoc.ownershipType === 'org';

			if (!needsWorkspaceId && !needsOwnershipType) {
				inboxItemsSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = itemDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				// Migrate organizationId → workspaceId
				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = itemDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						inboxItemsErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Inbox item ${itemDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						inboxItemsErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				// Migrate ownershipType: "organization" → "workspace"
				if (needsOwnershipType) {
					updatedDoc.ownershipType = 'workspace';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(itemDoc._id, updatedDoc);
				inboxItemsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating inbox item ${itemDoc._id}:`, error);
				inboxItemsErrors++;
			}
		}

		// ============================================================================
		// MIGRATE SOURCES, HIGHLIGHTS, TAGS, FLASHCARDS
		// ============================================================================
		console.log('\n📚 Migrating sources, highlights, tags, and flashcards...');

		// Sources
		const allSources = await ctx.db.query('sources').collect();
		let sourcesMigrated = 0;
		let sourcesSkipped = 0;
		let sourcesErrors = 0;

		for (const source of allSources) {
			const sourceDoc = source as unknown as {
				_id: Id<'sources'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				ownershipType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = sourceDoc.workspaceId ? String(sourceDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = sourceDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsOwnershipType =
				sourceDoc.ownershipType === 'organization' || sourceDoc.ownershipType === 'org';

			if (!needsWorkspaceId && !needsOwnershipType) {
				sourcesSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = sourceDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = sourceDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						sourcesErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Source ${sourceDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						sourcesErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				if (needsOwnershipType) {
					updatedDoc.ownershipType = 'workspace';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(sourceDoc._id, updatedDoc);
				sourcesMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating source ${sourceDoc._id}:`, error);
				sourcesErrors++;
			}
		}

		// Highlights
		const allHighlights = await ctx.db.query('highlights').collect();
		let highlightsMigrated = 0;
		let highlightsSkipped = 0;
		let highlightsErrors = 0;

		for (const highlight of allHighlights) {
			const highlightDoc = highlight as unknown as {
				_id: Id<'highlights'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				ownershipType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = highlightDoc.workspaceId ? String(highlightDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = highlightDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsOwnershipType =
				highlightDoc.ownershipType === 'organization' || highlightDoc.ownershipType === 'org';

			if (!needsWorkspaceId && !needsOwnershipType) {
				highlightsSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = highlightDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = highlightDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						highlightsErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Highlight ${highlightDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						highlightsErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				if (needsOwnershipType) {
					updatedDoc.ownershipType = 'workspace';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(highlightDoc._id, updatedDoc);
				highlightsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating highlight ${highlightDoc._id}:`, error);
				highlightsErrors++;
			}
		}

		// Tags
		const allTags = await ctx.db.query('tags').collect();
		let tagsMigrated = 0;
		let tagsSkipped = 0;
		let tagsErrors = 0;

		for (const tag of allTags) {
			const tagDoc = tag as unknown as {
				_id: Id<'tags'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				ownershipType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = tagDoc.workspaceId ? String(tagDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = tagDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsOwnershipType =
				tagDoc.ownershipType === 'organization' || tagDoc.ownershipType === 'org';

			if (!needsWorkspaceId && !needsOwnershipType) {
				tagsSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = tagDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = tagDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						tagsErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Tag ${tagDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						tagsErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				if (needsOwnershipType) {
					updatedDoc.ownershipType = 'workspace';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(tagDoc._id, updatedDoc);
				tagsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating tag ${tagDoc._id}:`, error);
				tagsErrors++;
			}
		}

		// Flashcards
		const allFlashcards = await ctx.db.query('flashcards').collect();
		let flashcardsMigrated = 0;
		let flashcardsSkipped = 0;
		let flashcardsErrors = 0;

		for (const flashcard of allFlashcards) {
			const flashcardDoc = flashcard as unknown as {
				_id: Id<'flashcards'>;
				organizationId?: string;
				workspaceId?: Id<'workspaces'> | string; // May be old org ID
				ownershipType?: string;
			};

			// Check if workspaceId is actually an old organization ID (exists in mapping)
			const workspaceIdStr = flashcardDoc.workspaceId ? String(flashcardDoc.workspaceId) : null;
			const hasOldOrgIdAsWorkspaceId = workspaceIdStr && idMapping.has(workspaceIdStr);
			const needsWorkspaceId = flashcardDoc.organizationId || hasOldOrgIdAsWorkspaceId;
			const needsOwnershipType =
				flashcardDoc.ownershipType === 'organization' || flashcardDoc.ownershipType === 'org';

			if (!needsWorkspaceId && !needsOwnershipType) {
				flashcardsSkipped++;
				continue;
			}

			try {
				// Use replace() to update the document
				const {
					organizationId: _organizationId,
					workspaceId: _oldWorkspaceId,
					...rest
				} = flashcardDoc as Record<string, unknown>;
				const updatedDoc: Record<string, unknown> = { ...rest };

				if (needsWorkspaceId) {
					// Determine which org ID to use for migration
					const orgIdToMigrate = flashcardDoc.organizationId || workspaceIdStr;
					if (!orgIdToMigrate) {
						flashcardsErrors++;
						continue;
					}

					const newWorkspaceId = idMapping.get(orgIdToMigrate);
					if (!newWorkspaceId) {
						console.error(
							`❌ Flashcard ${flashcardDoc._id}: organizationId ${orgIdToMigrate} not found in mapping`
						);
						flashcardsErrors++;
						continue;
					}
					updatedDoc.workspaceId = newWorkspaceId;
				}

				if (needsOwnershipType) {
					updatedDoc.ownershipType = 'workspace';
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (ctx.db.replace as any)(flashcardDoc._id, updatedDoc);
				flashcardsMigrated++;
			} catch (error) {
				console.error(`❌ Error migrating flashcard ${flashcardDoc._id}:`, error);
				flashcardsErrors++;
			}
		}

		// ============================================================================
		// MIGRATE MEMBERSHIPS (organizationMembers → workspaceMembers)
		// ============================================================================
		console.log('\n👥 Migrating workspace memberships...');

		// Try to query the old organizationMembers table
		// Note: This will fail if the table doesn't exist, which is fine
		let membershipsMigrated = 0;
		let membershipsSkipped = 0;
		let membershipsErrors = 0;

		try {
			// Query all existing workspaceMembers to check what's already migrated
			const existingMemberships = await ctx.db.query('workspaceMembers').collect();
			const existingMembershipKeys = new Set(
				existingMemberships.map((m) => `${m.workspaceId}_${m.userId}`)
			);

			// Try to query old organizationMembers table
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const oldMemberships = await (ctx.db.query as any)('organizationMembers').collect();

			if (oldMemberships && oldMemberships.length > 0) {
				console.log(`Found ${oldMemberships.length} old membership records to migrate`);

				for (const oldMembership of oldMemberships) {
					const oldMembershipDoc = oldMembership as unknown as {
						_id: string;
						organizationId: string;
						userId: Id<'users'>;
						role: 'owner' | 'admin' | 'member';
						joinedAt: number;
					};

					// Map organizationId → workspaceId
					const workspaceId = idMapping.get(oldMembershipDoc.organizationId);
					if (!workspaceId) {
						console.error(
							`❌ Membership ${oldMembershipDoc._id}: organizationId ${oldMembershipDoc.organizationId} not found in mapping`
						);
						membershipsErrors++;
						continue;
					}

					// Check if this membership already exists
					const membershipKey = `${workspaceId}_${oldMembershipDoc.userId}`;
					if (existingMembershipKeys.has(membershipKey)) {
						membershipsSkipped++;
						continue;
					}

					try {
						// Insert new membership record
						await ctx.db.insert('workspaceMembers', {
							workspaceId: workspaceId,
							userId: oldMembershipDoc.userId,
							role: oldMembershipDoc.role,
							joinedAt: oldMembershipDoc.joinedAt
						});

						membershipsMigrated++;
					} catch (error) {
						console.error(`❌ Error migrating membership ${oldMembershipDoc._id}:`, error);
						membershipsErrors++;
					}
				}
			} else {
				console.log('No old organizationMembers table found or it is empty');
				membershipsSkipped = oldMemberships?.length || 0;
			}
		} catch (error) {
			// Table doesn't exist or can't be queried - this is expected if migration already happened
			console.log('⚠️  Could not query organizationMembers table (may not exist):', error);
			membershipsSkipped = 0;
		}

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n📊 Migration Summary:');
		console.log('\n  Circles:');
		console.log(`    ✅ Migrated: ${circlesMigrated}`);
		console.log(`    ⏭️  Skipped: ${circlesSkipped}`);
		console.log(`    ❌ Errors: ${circlesErrors}`);
		console.log(`    📦 Total: ${allCircles.length}`);
		console.log('\n  Meetings:');
		console.log(`    ✅ Migrated: ${meetingsMigrated}`);
		console.log(`    ⏭️  Skipped: ${meetingsSkipped}`);
		console.log(`    ❌ Errors: ${meetingsErrors}`);
		console.log(`    📦 Total: ${allMeetings.length}`);
		console.log('\n  Feature Flags:');
		console.log(`    ✅ Migrated: ${flagsMigrated}`);
		console.log(`    ⏭️  Skipped: ${flagsSkipped}`);
		console.log(`    ❌ Errors: ${flagsErrors}`);
		console.log(`    📦 Total: ${allFeatureFlags.length}`);
		console.log('\n  Meeting Templates:');
		console.log(`    ✅ Migrated: ${templatesMigrated}`);
		console.log(`    ⏭️  Skipped: ${templatesSkipped}`);
		console.log(`    ❌ Errors: ${templatesErrors}`);
		console.log(`    📦 Total: ${allMeetingTemplates.length}`);
		console.log('\n  Inbox Items:');
		console.log(`    ✅ Migrated: ${inboxItemsMigrated}`);
		console.log(`    ⏭️  Skipped: ${inboxItemsSkipped}`);
		console.log(`    ❌ Errors: ${inboxItemsErrors}`);
		console.log(`    📦 Total: ${allInboxItems.length}`);
		console.log('\n  Sources:');
		console.log(`    ✅ Migrated: ${sourcesMigrated}`);
		console.log(`    ⏭️  Skipped: ${sourcesSkipped}`);
		console.log(`    ❌ Errors: ${sourcesErrors}`);
		console.log(`    📦 Total: ${allSources.length}`);
		console.log('\n  Highlights:');
		console.log(`    ✅ Migrated: ${highlightsMigrated}`);
		console.log(`    ⏭️  Skipped: ${highlightsSkipped}`);
		console.log(`    ❌ Errors: ${highlightsErrors}`);
		console.log(`    📦 Total: ${allHighlights.length}`);
		console.log('\n  Tags:');
		console.log(`    ✅ Migrated: ${tagsMigrated}`);
		console.log(`    ⏭️  Skipped: ${tagsSkipped}`);
		console.log(`    ❌ Errors: ${tagsErrors}`);
		console.log(`    📦 Total: ${allTags.length}`);
		console.log('\n  Flashcards:');
		console.log(`    ✅ Migrated: ${flashcardsMigrated}`);
		console.log(`    ⏭️  Skipped: ${flashcardsSkipped}`);
		console.log(`    ❌ Errors: ${flashcardsErrors}`);
		console.log(`    📦 Total: ${allFlashcards.length}`);
		console.log('\n  Workspace Memberships:');
		console.log(`    ✅ Migrated: ${membershipsMigrated}`);
		console.log(`    ⏭️  Skipped: ${membershipsSkipped}`);
		console.log(`    ❌ Errors: ${membershipsErrors}`);

		const totalErrors =
			circlesErrors +
			meetingsErrors +
			flagsErrors +
			templatesErrors +
			inboxItemsErrors +
			sourcesErrors +
			highlightsErrors +
			tagsErrors +
			flashcardsErrors +
			membershipsErrors;
		const success = totalErrors === 0;

		if (!success) {
			console.error(`\n⚠️  Migration completed with ${totalErrors} error(s)`);
		} else {
			console.log('\n✅ Migration completed successfully!');
		}

		return {
			success,
			circles: {
				migrated: circlesMigrated,
				skipped: circlesSkipped,
				errors: circlesErrors,
				total: allCircles.length
			},
			meetings: {
				migrated: meetingsMigrated,
				skipped: meetingsSkipped,
				errors: meetingsErrors,
				total: allMeetings.length
			},
			featureFlags: {
				migrated: flagsMigrated,
				skipped: flagsSkipped,
				errors: flagsErrors,
				total: allFeatureFlags.length
			},
			meetingTemplates: {
				migrated: templatesMigrated,
				skipped: templatesSkipped,
				errors: templatesErrors,
				total: allMeetingTemplates.length
			},
			inboxItems: {
				migrated: inboxItemsMigrated,
				skipped: inboxItemsSkipped,
				errors: inboxItemsErrors,
				total: allInboxItems.length
			},
			sources: {
				migrated: sourcesMigrated,
				skipped: sourcesSkipped,
				errors: sourcesErrors,
				total: allSources.length
			},
			highlights: {
				migrated: highlightsMigrated,
				skipped: highlightsSkipped,
				errors: highlightsErrors,
				total: allHighlights.length
			},
			tags: {
				migrated: tagsMigrated,
				skipped: tagsSkipped,
				errors: tagsErrors,
				total: allTags.length
			},
			flashcards: {
				migrated: flashcardsMigrated,
				skipped: flashcardsSkipped,
				errors: flashcardsErrors,
				total: allFlashcards.length
			},
			memberships: {
				migrated: membershipsMigrated,
				skipped: membershipsSkipped,
				errors: membershipsErrors
			}
		};
	}
});
