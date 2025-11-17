/**
 * Update circles_ui_beta feature flag to add allowedUserIds or allowedDomains
 *
 * Usage: npx tsx scripts/update-circles-feature-flag.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
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
	console.log('🚀 Updating circles_ui_beta feature flag...\n');

	const client = new ConvexHttpClient(CONVEX_URL);

	try {
		// Option 1: Add your userId to allowedUserIds
		// Replace with your actual userId from browser console debug output
		const userId = 'jx7b6gcvkmpsppm7sqzst8s3q57v898d'; // randy@synergyai.nl

		await client.mutation(api.featureFlags.upsertFlag, {
			flag: 'circles_ui_beta',
			enabled: true,
			allowedUserIds: [userId as Id<'users'>]
		});

		console.log('✅ Feature flag updated successfully');
		console.log('   Flag: circles_ui_beta');
		console.log('   Enabled: true');
		console.log(`   allowedUserIds: [${userId}]`);
		console.log('\n📝 Alternative: Use allowedDomains instead');
		console.log('   Change allowedUserIds to:');
		console.log('   allowedDomains: ["@synergyai.nl"]');
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}

	process.exit(0);
}

main();
