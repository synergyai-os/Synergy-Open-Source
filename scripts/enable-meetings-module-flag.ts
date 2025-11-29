/**
 * Enable meetings-module feature flag for specific workspace
 *
 * SYOS-226: Enable meetings module for org mx7ecpdw61qbsfj3488xaxtd7x7veq2w
 *
 * Usage: npx tsx scripts/enable-meetings-module-flag.ts
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
	console.log('🚀 Enabling meetings-module feature flag...\n');

	const client = new ConvexHttpClient(CONVEX_URL);

	try {
		// Target workspace ID from SYOS-226
		const targetOrgId = 'mx7ecpdw61qbsfj3488xaxtd7x7veq2w';

		// Enable feature flag for workspace
		await client.mutation(api.featureFlags.upsertFlag, {
			flag: 'meetings-module',
			enabled: true,
			allowedWorkspaceIds: [targetOrgId as Id<'workspaces'>]
		});

		console.log('✅ Feature flag enabled successfully');
		console.log('   Flag: meetings-module');
		console.log('   Enabled: true');
		console.log(`   allowedWorkspaceIds: [${targetOrgId}]`);
		console.log('\n📝 What this means:');
		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /meetings');
		console.log('   ✅ All users in org "mx7ecpdw61qbsfj3488xaxtd7x7veq2w" can access /dashboard');
		console.log('   ❌ Users in other orgs cannot access these routes');
		console.log('\n🔍 Debug flag status:');
		console.log('   npx convex run featureFlags:getFlag --flag meetings-module');
		console.log(
			'   npx convex run featureFlags:debugFlagEvaluation --flag meetings-module --sessionId <your-session-id>'
		);
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}

	process.exit(0);
}

main();
