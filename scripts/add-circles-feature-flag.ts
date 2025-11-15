/**
 * Add circles_ui_beta feature flag
 *
 * Usage: npx tsx scripts/add-circles-feature-flag.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load CONVEX_URL from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

let CONVEX_URL: string | undefined;

try {
	const envContent = readFileSync(envPath, 'utf-8');
	const match = envContent.match(/PUBLIC_CONVEX_URL=(.+)/);
	if (match) {
		CONVEX_URL = match[1].trim();
	}
} catch (_error) {
	console.error('❌ Could not read .env.local file');
}

if (!CONVEX_URL) {
	console.error('❌ CONVEX_URL not found in .env.local');
	console.error('   Expected: PUBLIC_CONVEX_URL=https://...');
	process.exit(1);
}

async function main() {
	console.log('🚀 Adding circles_ui_beta feature flag...\n');

	const client = new ConvexHttpClient(CONVEX_URL);

	try {
		// Create feature flag (without allowedUserIds - add manually in dashboard)
		await client.mutation(api.featureFlags.upsertFlag, {
			flag: 'circles_ui_beta',
			enabled: true
		});

		console.log('✅ Feature flag created successfully');
		console.log('   Flag: circles_ui_beta');
		console.log('   Enabled: true');
		console.log('\n📝 Next step: Add your user ID to allowedUserIds in Convex dashboard');
		console.log('   1. Open: https://dashboard.convex.dev');
		console.log('   2. Go to Data → featureFlags');
		console.log('   3. Edit the circles_ui_beta flag');
		console.log('   4. Add your user ID to allowedUserIds array');
		console.log('   Your user ID: c7c555a2-895a-48b6-ae24-d4147d44b1d5');
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}

	process.exit(0);
}

main();
