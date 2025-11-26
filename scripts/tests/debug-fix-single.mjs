import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Load mapping
const mapping = JSON.parse(fs.readFileSync(join(__dirname, 'utility-mapping.json'), 'utf-8'));

// Test on ONE file
const testFile = 'dev-docs/master-docs/design-system.md';
const filePath = join(ROOT_DIR, testFile);
let content = fs.readFileSync(filePath, 'utf-8');

console.log('=== DEBUGGING FIX SCRIPT ===\n');
console.log(`File: ${testFile}`);
console.log(`File size: ${content.length} chars`);
console.log(`Has px-button-x: ${content.includes('px-button-x')}`);
console.log(`Has px-button: ${content.includes('px-button')}`);

// Test ONE mapping
const oldUtil = 'px-button-x';
const newUtil = mapping.mappings[oldUtil];
console.log(`\nMapping: ${oldUtil} → ${newUtil}`);

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const escapedOld = escapeRegex(oldUtil);
let newContent = content;
let replacements = 0;

console.log('\n=== TESTING CODE BLOCK REGEX ===');
const codeBlockPattern = '(```[^\\n]*\\n)([\\s\\S]*?)(```)';
const codeBlockRegex = new RegExp(codeBlockPattern, 'g');
let matchCount = 0;

newContent = newContent.replace(codeBlockRegex, (match, prefix, blockContent, suffix) => {
	matchCount++;
	console.log(`\nCode block #${matchCount}:`);
	console.log(`  Prefix: "${prefix.substring(0, 20)}..."`);
	console.log(`  Content length: ${blockContent.length}`);
	console.log(`  Has ${oldUtil}: ${blockContent.includes(oldUtil)}`);
	console.log(`  Has ${newUtil}: ${blockContent.includes(newUtil)}`);
	
	const utilRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
	utilRegex.lastIndex = 0;
	const testResult = utilRegex.test(blockContent);
	console.log(`  Regex test: ${testResult}`);
	
	if (testResult) {
		utilRegex.lastIndex = 0;
		if (!blockContent.includes(newUtil)) {
			console.log(`  → REPLACING`);
			replacements++;
			const replaced = blockContent.replace(utilRegex, newUtil);
			return `${prefix}${replaced}${suffix}`;
		} else {
			console.log(`  → SKIPPING (already has ${newUtil})`);
		}
	} else {
		console.log(`  → SKIPPING (no match)`);
	}
	return match;
});

console.log(`\n=== RESULTS ===`);
console.log(`Code blocks matched: ${matchCount}`);
console.log(`Replacements made: ${replacements}`);
console.log(`Content changed: ${content !== newContent}`);

if (replacements > 0) {
	console.log(`\n=== VERIFICATION ===`);
	console.log(`Still has ${oldUtil}: ${newContent.includes(oldUtil)}`);
	console.log(`Now has ${newUtil}: ${newContent.includes(newUtil)}`);
	
	// Show first replacement
	const oldIndex = content.indexOf(oldUtil);
	const newIndex = newContent.indexOf(newUtil);
	if (oldIndex !== -1 && newIndex !== -1) {
		console.log(`\nOld context: ${content.substring(Math.max(0, oldIndex - 30), oldIndex + 50)}`);
		console.log(`New context: ${newContent.substring(Math.max(0, newIndex - 30), newIndex + 50)}`);
	}
}

