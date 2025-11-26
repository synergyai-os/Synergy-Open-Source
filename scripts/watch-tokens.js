#!/usr/bin/env node
/**
 * Watch mode for design tokens
 *
 * Automatically rebuilds tokens when design-system.json changes
 *
 * Usage:
 *   npm run tokens:watch
 */

import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const DESIGN_SYSTEM_JSON = path.join(PROJECT_ROOT, 'design-tokens-base.json');

let buildTimeout = null;

/**
 * Build tokens with debouncing (wait 300ms after last change)
 */
async function buildTokens() {
	if (buildTimeout) {
		clearTimeout(buildTimeout);
	}

	buildTimeout = setTimeout(async () => {
		console.log('🔄 Token file changed, rebuilding...');
		try {
			await execAsync('npm run tokens:build', { cwd: PROJECT_ROOT });
			console.log('✅ Tokens rebuilt successfully!\n');
		} catch (error) {
			console.error('❌ Build failed:', error.message);
		}
	}, 300);
}

// Watch design-system.json for changes
console.log('👀 Watching design-system.json for changes...');
console.log('📁 File:', DESIGN_SYSTEM_JSON);
console.log('💡 Press Ctrl+C to stop\n');

watch(DESIGN_SYSTEM_JSON, { persistent: true }, (eventType) => {
	if (eventType === 'change') {
		buildTokens();
	}
});

// Initial build
console.log('🔨 Running initial build...');
buildTokens();
