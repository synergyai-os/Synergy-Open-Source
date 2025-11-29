/**
 * Migration Script: Set Default Recorders for Started Meetings
 *
 * Sets recorderId = createdBy for all meetings that have been started
 * but don't yet have a recorder assigned.
 *
 * Migration logic:
 * - If meeting has startedAt AND recorderId is null → set recorderId = createdBy
 * - If meeting not started → leave recorderId as null
 * - If meeting already has recorderId → skip
 *
 * Run: npx convex run scripts/migrations/set-default-recorders.ts
 */

import { internalMutation } from '../convex/_generated/server';

export default internalMutation(async ({ db }) => {
	console.log('Starting recorder migration...');

	// Get all meetings
	const allMeetings = await db.query('meetings').collect();

	console.log(`Found ${allMeetings.length} meetings to check`);

	let migratedCount = 0;
	let skippedCount = 0;

	for (const meeting of allMeetings) {
		// Skip if already has recorder
		if ('recorderId' in meeting && meeting.recorderId) {
			skippedCount++;
			continue;
		}

		// Skip if meeting not started
		if (!meeting.startedAt) {
			skippedCount++;
			continue;
		}

		// Set recorder to creator
		await db.patch(meeting._id, {
			recorderId: meeting.createdBy
		});

		migratedCount++;

		if (migratedCount % 50 === 0) {
			console.log(`Migrated ${migratedCount} meetings...`);
		}
	}

	console.log(`Migration complete!`);
	console.log(`- Migrated: ${migratedCount}`);
	console.log(`- Skipped: ${skippedCount}`);
	console.log(`- Total: ${allMeetings.length}`);

	return {
		success: true,
		migratedCount,
		skippedCount,
		totalCount: allMeetings.length
	};
});
