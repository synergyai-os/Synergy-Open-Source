/**
 * Migration Script: Migrate Agenda Item Status from Boolean to Enum
 *
 * Migrates all existing agenda items from isProcessed boolean to status enum.
 *
 * Migration logic:
 * - isProcessed = true → status = 'processed'
 * - isProcessed = false → status = 'todo'
 * - isProcessed = null/undefined → status = 'todo'
 *
 * Run: npx convex run scripts/migrations/migrate-agenda-status.ts
 */

import { internalMutation } from '../convex/_generated/server';

export default internalMutation(async ({ db }) => {
	console.log('Starting agenda item status migration...');

	// Get all agenda items
	const allAgendaItems = await db.query('meetingAgendaItems').collect();

	console.log(`Found ${allAgendaItems.length} agenda items to migrate`);

	let migratedCount = 0;
	let skippedCount = 0;

	for (const item of allAgendaItems) {
		// Check if already has status field (already migrated)
		if ('status' in item) {
			skippedCount++;
			continue;
		}

		// Determine status based on isProcessed
		const status = (item as any).isProcessed === true ? 'processed' : 'todo';

		// Update item with status
		await db.patch(item._id, {
			status: status as 'todo' | 'processed' | 'rejected'
		});

		migratedCount++;

		if (migratedCount % 100 === 0) {
			console.log(`Migrated ${migratedCount} items...`);
		}
	}

	console.log(`Migration complete!`);
	console.log(`- Migrated: ${migratedCount}`);
	console.log(`- Skipped (already migrated): ${skippedCount}`);
	console.log(`- Total: ${allAgendaItems.length}`);

	return {
		success: true,
		migratedCount,
		skippedCount,
		totalCount: allAgendaItems.length
	};
});
