/**
 * Create WorkOS Worker Users for Parallel E2E Testing
 *
 * Creates 5 pre-verified worker users in WorkOS for parallel test execution.
 * Each worker gets a unique user to avoid session conflicts.
 *
 * Usage: tsx scripts/create-worker-users.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local for WORKOS_API_KEY
function loadEnvLocal(): string | undefined {
	try {
		const envPath = resolve(process.cwd(), '.env.local');
		const envContent = readFileSync(envPath, 'utf-8');
		const match = envContent.match(/WORKOS_API_KEY\s*=\s*(.+)/);
		return match ? match[1].trim() : undefined;
	} catch {
		return undefined;
	}
}

const WORKOS_API_KEY = loadEnvLocal();

if (!WORKOS_API_KEY) {
	console.error('❌ WORKOS_API_KEY not found in .env.local');
	console.error('💡 Make sure WORKOS_API_KEY is set in your .env.local file');
	process.exit(1);
}

// Generate strong random password
function generatePassword(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
	const length = 24;
	let password = '';
	for (let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

interface WorkerUser {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

async function createWorkerUser(worker: WorkerUser): Promise<boolean> {
	console.log(`\n🔄 Creating ${worker.email}...`);

	try {
		const response = await fetch('https://api.workos.com/user_management/users', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${WORKOS_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: worker.email,
				password: worker.password,
				first_name: worker.firstName,
				last_name: worker.lastName,
				email_verified: true
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error(`❌ Failed to create ${worker.email}:`, error);
			return false;
		}

		const data = await response.json();
		console.log(`✅ Created ${worker.email} (ID: ${data.id})`);
		return true;
	} catch (error) {
		console.error(`❌ Error creating ${worker.email}:`, error);
		return false;
	}
}

async function main() {
	console.log('🚀 Creating WorkOS Worker Users for Parallel E2E Testing\n');
	console.log('This will create 5 users:');
	console.log('  - randy+worker-0@synergyai.nl');
	console.log('  - randy+worker-1@synergyai.nl');
	console.log('  - randy+worker-2@synergyai.nl');
	console.log('  - randy+worker-3@synergyai.nl');
	console.log('  - randy+worker-4@synergyai.nl');
	console.log('\n📝 Passwords will be output at the end for .env.test\n');

	// Generate workers with random passwords
	const workers: WorkerUser[] = [];
	for (let i = 0; i < 5; i++) {
		workers.push({
			email: `randy+worker-${i}@synergyai.nl`,
			password: generatePassword(),
			firstName: 'Worker',
			lastName: `${i}`
		});
	}

	// Create all workers
	const results = await Promise.all(workers.map(createWorkerUser));

	// Check if all succeeded
	const allSucceeded = results.every((r) => r);

	if (allSucceeded) {
		console.log('\n✅ All 5 worker users created successfully!\n');
		console.log('📋 Add these to your .env.test file:\n');
		console.log('# Worker Pool Users (for parallel execution)');
		workers.forEach((worker, i) => {
			console.log(`WORKER_${i}_EMAIL=${worker.email}`);
			console.log(`WORKER_${i}_PASSWORD=${worker.password}`);
			console.log('');
		});
		console.log('\n🎉 Phase 2.1 (SYOS-193) Complete!');
	} else {
		console.error('\n❌ Some users failed to create. Check errors above.');
		process.exit(1);
	}
}

main().catch(console.error);
