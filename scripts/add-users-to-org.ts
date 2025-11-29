/**
 * Script to add existing users to a test workspace
 *
 * Usage:
 * 1. Get admin key from Convex dashboard (Settings → Deploy Key)
 * 2. Run: CONVEX_DEPLOY_KEY=your_key npx tsx scripts/add-users-to-org.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

const CONVEX_URL = process.env.CONVEX_URL || 'https://amiable-cardinal-574.convex.cloud';
const DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!DEPLOY_KEY) {
	console.error('❌ Error: CONVEX_DEPLOY_KEY environment variable not set');
	console.error('');
	console.error('Get your deploy key from: https://dashboard.convex.dev');
	console.error('Then run: CONVEX_DEPLOY_KEY=your_key npx tsx scripts/add-users-to-org.ts');
	process.exit(1);
}

// Target workspace
const ORG_ID = 'mx7ecpdw61qbsfj3488xaxtd7x7veq2w' as Id<'workspaces'>;

// Users to add
const USER_IDS = [
	'jx78zpy6tv6zjk82tyexkv4w8h7v8779',
	'jx71ndzmj66g1n0rmevevdx00n7v8pda',
	'jx76wpp08yzf2x8gnqd2redf757v9fxe',
	'jx7fpwkmw308dey1r517zcrzy97v9cde'
] as Id<'users'>[];

async function addUsersToOrg() {
	console.log('🚀 Adding users to workspace...\n');
	console.log(`Organization ID: ${ORG_ID}`);
	console.log(`Users to add: ${USER_IDS.length}\n`);

	// Create client with admin key for internal mutations
	const client = new ConvexHttpClient(CONVEX_URL);
	client.setAdminAuth(DEPLOY_KEY);

	for (const userId of USER_IDS) {
		try {
			console.log(`Adding user ${userId}...`);

			// Use internal mutation to directly create org membership
			await client.mutation(internal.workspaces.addMemberDirect, {
				workspaceId: ORG_ID,
				userId: userId,
				role: 'member'
			});

			console.log(`✅ Successfully added user ${userId}\n`);
		} catch (error) {
			console.error(`❌ Failed to add user ${userId}:`, error);
			console.error('');
		}
	}

	console.log('✨ Done!');
	process.exit(0);
}

addUsersToOrg().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
