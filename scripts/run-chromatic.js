#!/usr/bin/env node
/**
 * Run Chromatic with environment variables from .env.local
 *
 * This script reads .env.local (same format Vite uses) and sets
 * CHROMATIC_PROJECT_TOKEN before running Chromatic CLI.
 *
 * Usage: node scripts/run-chromatic.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const envLocalPath = resolve(rootDir, '.env.local');

// Read .env.local if it exists
let envVars = {};
try {
	const envContent = readFileSync(envLocalPath, 'utf-8');
	envContent.split('\n').forEach((line) => {
		line = line.trim();
		// Skip comments and empty lines
		if (!line || line.startsWith('#')) return;

		const [key, ...valueParts] = line.split('=');
		if (key && valueParts.length > 0) {
			// Remove quotes if present
			const value = valueParts.join('=').replace(/^["']|["']$/g, '');
			envVars[key.trim()] = value.trim();
		}
	});
} catch (error) {
	// .env.local doesn't exist, that's okay
	if (error.code !== 'ENOENT') {
		console.warn(`Warning: Could not read .env.local: ${error.message}`);
	}
}

// Set CHROMATIC_PROJECT_TOKEN from .env.local if found
if (envVars.CHROMATIC_PROJECT_TOKEN) {
	process.env.CHROMATIC_PROJECT_TOKEN = envVars.CHROMATIC_PROJECT_TOKEN;
} else {
	console.error('Error: CHROMATIC_PROJECT_TOKEN not found in .env.local');
	console.error('Please add CHROMATIC_PROJECT_TOKEN=chpt_your_token to .env.local');
	process.exit(1);
}

// Run Chromatic CLI
const chromaticProcess = spawn('npx', ['chromatic'], {
	stdio: 'inherit',
	shell: true,
	cwd: rootDir,
	env: {
		...process.env,
		CHROMATIC_PROJECT_TOKEN: process.env.CHROMATIC_PROJECT_TOKEN
	}
});

chromaticProcess.on('close', (code) => {
	process.exit(code || 0);
});
