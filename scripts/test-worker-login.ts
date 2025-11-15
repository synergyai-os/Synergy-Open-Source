/**
 * Test Worker User Authentication
 *
 * This script tests whether "Inactive" worker users can still authenticate.
 * In many auth systems, users show as "Inactive" until their first login,
 * but can still authenticate successfully.
 *
 * Usage: tsx scripts/test-worker-login.ts
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

interface TestResult {
	email: string;
	canAuthenticate: boolean;
	error?: string;
}

/**
 * Test if a worker can authenticate with WorkOS
 */
async function testWorkerAuthentication(email: string, password: string): Promise<TestResult> {
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
			return {
				email,
				canAuthenticate: false,
				error: `HTTP ${response.status}: ${errorText}`
			};
		}

		const data = await response.json();
		return {
			email,
			canAuthenticate: !!data.access_token
		};
	} catch (error) {
		return {
			email,
			canAuthenticate: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

async function main() {
	console.log('🧪 Testing Worker User Authentication\n');
	console.log('This will test if "Inactive" workers can still authenticate.\n');

	// Load passwords from environment
	const workers: Array<{ email: string; password: string }> = [];
	for (let i = 0; i < 5; i++) {
		const email = `randy+worker-${i}@synergyai.nl`;
		const password = process.env[`WORKER_${i}_PASSWORD`];

		if (!password) {
			console.error(`⚠️  WORKER_${i}_PASSWORD not found in environment`);
			console.error(`💡 Load from .env.test: export $(cat .env.test | grep WORKER | xargs)`);
			continue;
		}

		workers.push({ email, password });
	}

	if (workers.length === 0) {
		console.error('❌ No worker credentials found');
		process.exit(1);
	}

	console.log(`🔍 Testing authentication for ${workers.length} workers...\n`);

	// Test all workers
	const results = await Promise.all(
		workers.map((worker) => testWorkerAuthentication(worker.email, worker.password))
	);

	// Display results
	console.log('📊 Results:\n');
	let successCount = 0;
	let failCount = 0;

	for (const result of results) {
		if (result.canAuthenticate) {
			console.log(`✅ ${result.email} - CAN authenticate`);
			successCount++;
		} else {
			console.log(`❌ ${result.email} - CANNOT authenticate`);
			if (result.error) {
				console.log(`   Error: ${result.error}`);
			}
			failCount++;
		}
	}

	console.log(`\n📈 Summary: ${successCount} success, ${failCount} failed\n`);

	if (successCount === results.length) {
		console.log('✅ All workers can authenticate!');
		console.log('\n💡 Note: Workers may show as "Inactive" in WorkOS dashboard');
		console.log('   until they perform their first interactive login.');
		console.log('   However, they can still authenticate via password grant');
		console.log('   which is what E2E tests use.');
		console.log('\n✅ No action needed - workers are ready for CI!');
	} else if (successCount > 0) {
		console.log('⚠️  Some workers can authenticate, others cannot.');
		console.log('\n💡 For failed workers, verify passwords in .env.test match WorkOS.');
	} else {
		console.log('❌ No workers can authenticate.');
		console.log('\n💡 Possible causes:');
		console.log('   1. Passwords in .env.test are incorrect');
		console.log('   2. Users were not created successfully in WorkOS');
		console.log('   3. WORKOS_CLIENT_ID is incorrect');
		console.log('\n🔧 Try running: tsx scripts/create-worker-users.ts');
	}
}

main().catch(console.error);
