/**
 * Fix Broken Style Attributes in Svelte Files
 *
 * Purpose: Fix syntax errors where style="..." was inserted inside class="..." attributes
 *
 * Broken patterns:
 * 1. class="... style="padding: var(--spacing-2);" ..." → Split into separate attributes
 * 2. class="style="padding: var(--spacing-3);"" → Split into class="" and style="..."
 * 3. class="... gastyle="..." → Fix missing space, split attributes
 *
 * Usage:
 *   node scripts/fix-broken-style-attributes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

/**
 * Fix broken style attributes in a file
 */
function fixFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf-8');
	let originalContent = content;
	let modified = false;

	// Pattern 1: class="... style="..." ..." (style inside class)
	// Match: class="before style="value" after"
	const pattern1 = /class="([^"]*?)\s+style="([^"]+)"([^"]*?)"/g;
	content = content.replace(pattern1, (match, before, styleValue, after) => {
		modified = true;
		const beforeClean = before.trim();
		const afterClean = after.trim();
		const classValue = beforeClean + (afterClean ? ' ' + afterClean : '');
		return `class="${classValue}" style="${styleValue}"`;
	});

	// Pattern 2: class="style="..."" (style is the only thing in class)
	const pattern2 = /class="style="([^"]+)""/g;
	content = content.replace(pattern2, (match, styleValue) => {
		modified = true;
		return `class="" style="${styleValue}"`;
	});

	// Pattern 2b: class="style="..." ..." (style at start, followed by other classes)
	const pattern2b = /class="style="([^"]+)"\s+([^"]+)"/g;
	content = content.replace(pattern2b, (match, styleValue, otherClasses) => {
		modified = true;
		return `class="${otherClasses.trim()}" style="${styleValue}"`;
	});

	// Pattern 3: class="... gastyle="..." (missing space before style)
	const pattern3 = /class="([^"]*?)\s*gastyle="([^"]+)"/g;
	content = content.replace(pattern3, (match, before, styleValue) => {
		modified = true;
		return `class="${before.trim()}" style="${styleValue}"`;
	});

	// Pattern 4: Multiple style attributes in same class
	// e.g., class="... style="..." ... style="...""
	const pattern4 = /class="([^"]*?)\s+style="([^"]+)"\s+([^"]*?)\s+style="([^"]+)"/g;
	content = content.replace(pattern4, (match, before, style1, middle, style2) => {
		modified = true;
		// Merge styles
		const mergedStyle = `${style1}; ${style2}`;
		const classValue = `${before.trim()} ${middle.trim()}`.trim();
		return `class="${classValue}" style="${mergedStyle}"`;
	});

	// Pattern 5: class="..." with style="..." followed by broken conditional
	// This is a multi-line pattern, handle carefully
	const lines = content.split('\n');
	const fixedLines = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
		const nextNextLine = i + 2 < lines.length ? lines[i + 2] : '';

		// Check for broken pattern: class="..." followed by style="..." followed by conditional
		if (
			line.includes('class="') &&
			line.includes('"') &&
			!line.includes('style=') &&
			nextLine.includes('style="') &&
			nextLine.includes(';"') &&
			(nextNextLine.includes('{') || nextNextLine.includes('?'))
		) {
			// Extract class value
			const classMatch = line.match(/class="([^"]+)"/);
			if (classMatch) {
				const classValue = classMatch[1];
				const styleMatch = nextLine.match(/style="([^"]+)"/);
				if (styleMatch) {
					const styleValue = styleMatch[1];
					// Check if next lines contain conditional that should be in class
					let conditionalLines = [];
					let j = i + 2;
					while (j < lines.length && (lines[j].includes('?') || lines[j].includes(':'))) {
						conditionalLines.push(lines[j]);
						j++;
					}
					if (conditionalLines.length > 0) {
						// Reconstruct: class="... {conditional}" style="..."
						const conditional = conditionalLines
							.map((l) => l.trim())
							.join(' ')
							.replace(/^\s*\{/, '')
							.replace(/\}\s*$/, '')
							.trim();
						const newClass = `class="${classValue} {${conditional}}"`;
						const newStyle = `style="${styleValue}"`;

						// Replace lines
						const indent = line.match(/^(\s*)/)?.[1] || '';
						fixedLines.push(`${indent}${newClass}`);
						fixedLines.push(`${indent}${newStyle}`);
						i = j; // Skip processed lines
						modified = true;
						continue;
					}
				}
			}
		}

		fixedLines.push(line);
		i++;
	}

	if (modified && fixedLines.length !== lines.length) {
		content = fixedLines.join('\n');
	}

	if (content !== originalContent) {
		fs.writeFileSync(filePath, content, 'utf-8');
		return true;
	}

	return false;
}

/**
 * Main function
 */
async function main() {
	console.log('🔍 Finding Svelte files with broken style attributes...\n');

	// Find all .svelte files
	const files = await glob('**/*.svelte', {
		cwd: SRC_DIR,
		absolute: true
	});

	console.log(`📁 Found ${files.length} Svelte files\n`);

	let fixedCount = 0;
	const fixedFiles = [];

	for (const file of files) {
		try {
			if (fixFile(file)) {
				fixedCount++;
				fixedFiles.push(path.relative(PROJECT_ROOT, file));
			}
		} catch (error) {
			console.error(`❌ Error fixing ${file}:`, error.message);
		}
	}

	console.log(`\n🎉 Fixed ${fixedCount} files\n`);

	if (fixedFiles.length > 0) {
		console.log('📋 Fixed files:');
		fixedFiles.forEach((file) => console.log(`   - ${file}`));
	}

	console.log('\n⚠️  Next steps:');
	console.log('   1. Run: npm run lint');
	console.log('   2. Verify no syntax errors');
	console.log('   3. Test affected components');
}

// Run script
try {
	main();
} catch (error) {
	console.error('\n❌ Error:', error.message);
	process.exit(1);
}
