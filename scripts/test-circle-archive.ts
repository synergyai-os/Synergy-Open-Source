/**
 * Quick test script to verify circle archive sets archivedBy and updatedBy
 * 
 * Usage: npx tsx scripts/test-circle-archive.ts
 * 
 * Prerequisites:
 * 1. Run `npx convex dev` in another terminal
 * 2. Have a valid sessionId (you can get one from Convex dashboard)
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

const CONVEX_URL = process.env.CONVEX_URL || 'http://localhost:3000';

async function testCircleArchive() {
	const client = new ConvexHttpClient(CONVEX_URL);
	
	// You'll need to replace these with actual values from your dev environment
	const sessionId = process.env.TEST_SESSION_ID || 'YOUR_SESSION_ID_HERE';
	const workspaceId = process.env.TEST_WORKSPACE_ID || 'YOUR_WORKSPACE_ID_HERE';
	
	if (sessionId === 'YOUR_SESSION_ID_HERE' || workspaceId === 'YOUR_WORKSPACE_ID_HERE') {
		console.error('❌ Please set TEST_SESSION_ID and TEST_WORKSPACE_ID environment variables');
		console.log('\nTo get these values:');
		console.log('1. Open Convex Dashboard → Data → authSessions (get sessionId)');
		console.log('2. Open Convex Dashboard → Data → workspaces (get workspaceId)');
		console.log('\nThen run:');
		console.log('TEST_SESSION_ID=xxx TEST_WORKSPACE_ID=yyy npx tsx scripts/test-circle-archive.ts');
		process.exit(1);
	}

	console.log('🧪 Testing circle archive with archivedBy and updatedBy...\n');

	try {
		// Step 1: Create a circle
		console.log('1️⃣ Creating test circle...');
		const createResult = await client.mutation(api.circles.create, {
			sessionId,
			workspaceId,
			name: `Test Circle ${Date.now()}`,
			purpose: 'Testing archive functionality'
		});
		console.log('✅ Circle created:', createResult.circleId);

		// Step 2: Archive the circle
		console.log('\n2️⃣ Archiving circle...');
		const archiveResult = await client.mutation(api.circles.archive, {
			sessionId,
			circleId: createResult.circleId
		});
		console.log('✅ Archive mutation completed:', archiveResult);

		// Step 3: Query the circle directly to verify fields
		console.log('\n3️⃣ Verifying archivedBy and updatedBy fields...');
		const circle = await client.query(api.circles.get, {
			sessionId,
			circleId: createResult.circleId
		});

		console.log('\n📊 Circle data:');
		console.log('  - archivedAt:', circle.archivedAt ? new Date(circle.archivedAt).toISOString() : '❌ NOT SET');
		console.log('  - archivedBy:', circle.archivedBy || '❌ NOT SET (check DB directly)');
		console.log('  - updatedBy:', circle.updatedBy || '❌ NOT SET (check DB directly)');

		// Note: archivedBy and updatedBy might not be in the query response
		// Check Convex Dashboard → Data → circles table to verify these fields
		console.log('\n💡 Note: archivedBy and updatedBy may not be in query response.');
		console.log('   Check Convex Dashboard → Data → circles table to verify these fields are set.');

		if (circle.archivedAt) {
			console.log('\n✅ Test completed! Circle was archived successfully.');
			console.log('   Verify archivedBy and updatedBy in Convex Dashboard.');
		} else {
			console.log('\n❌ Test failed! archivedAt was not set.');
			process.exit(1);
		}
	} catch (error) {
		console.error('\n❌ Test failed with error:', error);
		process.exit(1);
	}
}

testCircleArchive();

