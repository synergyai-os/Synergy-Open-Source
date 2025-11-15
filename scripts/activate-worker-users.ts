/**
 * Activate Worker Users in WorkOS
 *
 * This script activates "Inactive" worker users by performing a test authentication.
 * In WorkOS, users become "Active" after their first successful authentication.
 *
 * Usage: tsx scripts/activate-worker-users.ts
 *
 * Prerequisites:
 * - Workers must be created (run create-worker-users.ts first)
 * - WORKER_*_PASSWORD environment variables must be set (from .env.test)
 * - WORKOS_CLIENT_ID must be set in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local for WORKOS_CLIENT_ID and WORKOS_API_KEY (used as client_secret)
function loadEnvLocal(): { clientId?: string; apiKey?: string } {
	try {
		const envPath = resolve(process.cwd(), '.env.local');
		const envContent = readFileSync(envPath, 'utf-8');
		const clientIdMatch = envContent.match(/WORKOS_CLIENT_ID\s*=\s*(.+)/);
		const apiKeyMatch = envContent.match(/WORKOS_API_KEY\s*=\s*(.+)/);
		return {
			clientId: clientIdMatch ? clientIdMatch[1].trim() : undefined,
			apiKey: apiKeyMatch ? apiKeyMatch[1].trim() : undefined
		};
	} catch {
		return {};
	}
}

const { clientId, apiKey } = loadEnvLocal();

if (!clientId) {
	console.error('❌ WORKOS_CLIENT_ID not found in .env.local');
	process.exit(1);
}

if (!apiKey) {
	console.error('❌ WORKOS_API_KEY not found in .env.local');
	process.exit(1);
}

interface ActivationResult {
	email: string;
	success: boolean;
	error?: string;
}

/**
 * Activate a worker by authenticating them
 */
async function activateWorker(email: string, password: string): Promise<ActivationResult> {
	console.log(`🔄 Activating ${email}...`);

	try {
		const response = await fetch('https://api.workos.com/user_management/authenticate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: apiKey,
				email,
				password,
				grant_type: 'password'
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.log(`❌ Failed to activate ${email}`);
			return {
				email,
				success: false,
				error: `HTTP ${response.status}: ${errorText}`
			};
		}

		const data = await response.json();
		if (data.access_token) {
			console.log(`✅ Activated ${email}`);
			return {
				email,
				success: true
			};
		} else {
			console.log(`❌ Failed to activate ${email} - no access token returned`);
			return {
				email,
				success: false,
				error: 'No access token in response'
			};
		}
	} catch (error) {
		console.log(`❌ Error activating ${email}`);
		return {
			email,
			success: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

async function main() {
	console.log('🚀 Activating WorkOS Worker Users\n');
	console.log('This will activate workers by performing test authentication.\n');

	// Load passwords from environment
	const workers: Array<{ email: string; password: string }> = [];
	for (let i = 0; i < 5; i++) {
		const email = `randy+worker-${i}@synergyai.nl`;
		const password = process.env[`WORKER_${i}_PASSWORD`];

		if (!password) {
			console.error(`❌ WORKER_${i}_PASSWORD not found in environment`);
			console.error('💡 Load from .env.test: export $(cat .env.test | grep WORKER | xargs)');
			process.exit(1);
		}

		workers.push({ email, password });
	}

	console.log(`🔍 Found credentials for ${workers.length} workers\n`);
	console.log('Workers:');
	workers.forEach((w) => console.log(`  - ${w.email}`));
	console.log('');

	// Activate all workers
	console.log('🔄 Activating workers...\n');
	const results = await Promise.all(
		workers.map((worker) => activateWorker(worker.email, worker.password))
	);

	// Summary
	console.log('\n📊 Activation Summary:\n');
	const successCount = results.filter((r) => r.success).length;
	const failCount = results.filter((r) => !r.success).length;

	results.forEach((result) => {
		if (!result.success) {
			console.log(`❌ ${result.email}`);
			if (result.error) {
				console.log(`   ${result.error}`);
			}
		}
	});

	console.log(`\n✅ Activated: ${successCount}/${results.length}`);
	console.log(`❌ Failed: ${failCount}/${results.length}`);

	if (successCount === results.length) {
		console.log('\n🎉 All workers activated successfully!');
		console.log('💡 Workers should now show as "Active" in WorkOS dashboard.');
		console.log('✅ Ready for CI/E2E tests!');
	} else if (successCount > 0) {
		console.log('\n⚠️  Some workers were activated, but some failed.');
		console.log('💡 Check errors above and verify credentials.');
	} else {
		console.log('\n❌ No workers were activated.');
		console.log('💡 Verify:');
		console.log('   1. Workers exist in WorkOS (run create-worker-users.ts)');
		console.log('   2. Passwords in environment match WorkOS');
		console.log('   3. WORKOS_CLIENT_ID is correct');
	}
}

main().catch(console.error);
