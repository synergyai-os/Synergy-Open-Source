/**
 * Script to seed org chart test data
 *
 * Creates a nested hierarchy:
 * - Root Circle: "Active Platforms"
 *   - Level 1: 3 sub-circles (Guidelines API, Platform Infrastructure, Developer Experience)
 *     - Level 2: 2-3 sub-sub-circles per Level 1 circle
 *
 * Each circle gets 3-10 roles.
 *
 * Usage:
 * 1. Get deploy key from Convex dashboard (Settings → Deploy Key)
 * 2. Run: CONVEX_DEPLOY_KEY=your_key npx tsx scripts/seed-org-chart.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local if it exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, 'utf-8');
	envContent.split('\n').forEach((line) => {
		const match = line.match(/^([^=]+)=(.*)$/);
		if (match && !match[1].startsWith('#')) {
			const key = match[1].trim();
			const value = match[2].trim();
			if (!process.env[key]) {
				process.env[key] = value;
			}
		}
	});
}

const CONVEX_URL =
	process.env.CONVEX_URL ||
	process.env.PUBLIC_CONVEX_URL ||
	'https://blissful-lynx-970.convex.cloud';
const DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!DEPLOY_KEY) {
	console.error('❌ Error: CONVEX_DEPLOY_KEY environment variable not set');
	console.error('');
	console.error('Get your deploy key from: https://dashboard.convex.dev');
	console.error('Then run: CONVEX_DEPLOY_KEY="your_key" npx tsx scripts/seed-org-chart.ts');
	process.exit(1);
}

// Target workspace
const ORG_ID = 'mx7ecpdw61qbsfj3488xaxtd7x7veq2w' as Id<'workspaces'>;

async function main() {
	const client = new ConvexHttpClient(CONVEX_URL);
	client.setAdminAuth(DEPLOY_KEY);

	console.log('🌱 Seeding org chart test data...');
	console.log(`   Organization ID: ${ORG_ID}`);
	console.log('');

	try {
		const result = await client.mutation(internal.seedOrgChart.seedTestDataInternal, {
			workspaceId: ORG_ID
		});

		console.log('');
		console.log('✅ Success! Org chart test data created:');
		console.log(`   - Root circle ID: ${result.rootCircleId}`);
		console.log(`   - Level 1 circles: ${result.level1CircleIds.length}`);
		console.log(`   - Total circles: ${result.totalCircles}`);
		console.log('');
		console.log('🎉 Refresh your browser to see the nested org chart!');
	} catch (error) {
		console.error('❌ Error seeding data:', error);
		if (error instanceof Error) {
			console.error('   Message:', error.message);
			console.error('   Stack:', error.stack);
		}
		// Try to extract more details from Convex error
		if (error && typeof error === 'object' && 'data' in error) {
			console.error('   Error data:', JSON.stringify(error.data, null, 2));
		}
		process.exit(1);
	}
}

main();
