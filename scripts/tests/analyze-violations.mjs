import fs from 'fs';
import { glob } from 'glob';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Load mapping
const mapping = JSON.parse(fs.readFileSync(join(__dirname, 'utility-mapping.json'), 'utf-8'));

// Find all violations
const docFiles = glob
	.sync('dev-docs/**/*.md', { cwd: ROOT_DIR })
	.filter((f) => !f.includes('4-archive'));

const violations = [];

for (const docFile of docFiles) {
	const filePath = join(ROOT_DIR, docFile);
	const content = fs.readFileSync(filePath, 'utf-8');

	// Extract utilities using same logic as validate-docs.ts
	const utilityPatterns = [
		/class=["'`]([\w\s-]+)["'`]/g,
		/`([\w-]+)`/g,
		/['"](px|py|rounded|bg|text|font|gap|border|opacity|transition)-[\w-]+['"]/g
	];

	const foundUtilities = new Set();
	for (const pattern of utilityPatterns) {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			const matchText = match[1] || match[0];
			const classes = matchText.split(/\s+/);
			for (const cls of classes) {
				if (
					/^(px|py|rounded|bg|text|font|gap|border|opacity|transition|p|m|inline-flex|items-center|justify-center)-/.test(
						cls
					)
				) {
					if (cls.length > 3 && !cls.endsWith('-')) {
						foundUtilities.add(cls);
					}
				}
			}
		}
	}

	// Check each utility
	for (const utility of foundUtilities) {
		if (mapping.mappings[utility]) {
			// Find context
			const lines = content.split('\n');
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.includes(utility)) {
					// Categorize context
					let context = 'unknown';
					if (
						line.includes(`class="${utility}`) ||
						line.includes(`class='${utility}`) ||
						line.includes('class=`${utility}`')
					) {
						context = 'class-attribute';
					} else if (line.includes(`'${utility}'`) || line.includes(`"${utility}"`)) {
						context = 'string-literal';
					} else if (line.includes(`\`${utility}\``)) {
						context = 'inline-code';
					} else if (line.includes('<!--') && line.includes('-->')) {
						context = 'html-comment';
					} else if (
						line.trim().startsWith(utility) ||
						line.includes(` ${utility} `) ||
						line.includes(` ${utility}.`) ||
						line.includes(` ${utility},`)
					) {
						context = 'plain-text';
					} else if (line.includes('```')) {
						context = 'code-block';
					}

					violations.push({
						file: docFile,
						line: i + 1,
						utility,
						context,
						lineContent: line.trim()
					});
					break; // Only count once per file
				}
			}
		}
	}
}

// Categorize violations
const byContext = {};
const byUtility = {};
const byFile = {};

for (const violation of violations) {
	// By context
	if (!byContext[violation.context]) {
		byContext[violation.context] = [];
	}
	byContext[violation.context].push(violation);

	// By utility
	if (!byUtility[violation.utility]) {
		byUtility[violation.utility] = [];
	}
	byUtility[violation.utility].push(violation);

	// By file
	if (!byFile[violation.file]) {
		byFile[violation.file] = [];
	}
	byFile[violation.file].push(violation);
}

// Output analysis
console.log('=== BUG CATALOG ===\n');
console.log(`Total violations: ${violations.length}\n`);

console.log('=== BY CONTEXT ===');
for (const [context, items] of Object.entries(byContext).sort(
	(a, b) => b[1].length - a[1].length
)) {
	console.log(`\n${context}: ${items.length} violations`);
	console.log(`  Utilities: ${[...new Set(items.map((i) => i.utility))].join(', ')}`);
	console.log(
		`  Sample: ${items[0].file}:${items[0].line} - ${items[0].lineContent.substring(0, 60)}...`
	);
}

console.log('\n=== BY UTILITY ===');
for (const [utility, items] of Object.entries(byUtility).sort(
	(a, b) => b[1].length - a[1].length
)) {
	console.log(`\n${utility}: ${items.length} violations`);
	console.log(`  Contexts: ${[...new Set(items.map((i) => i.context))].join(', ')}`);
	console.log(
		`  Files: ${[...new Set(items.map((i) => i.file))].slice(0, 3).join(', ')}${items.length > 3 ? '...' : ''}`
	);
}

console.log('\n=== BY FILE ===');
for (const [file, items] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
	console.log(`\n${file}: ${items.length} violations`);
	console.log(`  Utilities: ${[...new Set(items.map((i) => i.utility))].join(', ')}`);
}

// Write detailed catalog
const catalog = {
	summary: {
		total: violations.length,
		byContext: Object.fromEntries(Object.entries(byContext).map(([k, v]) => [k, v.length])),
		byUtility: Object.fromEntries(Object.entries(byUtility).map(([k, v]) => [k, v.length])),
		byFile: Object.fromEntries(Object.entries(byFile).map(([k, v]) => [k, v.length]))
	},
	violations: violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
};

fs.writeFileSync(join(__dirname, 'violations-catalog.json'), JSON.stringify(catalog, null, 2));
console.log('\n=== DETAILED CATALOG SAVED ===');
console.log('Saved to: scripts/tests/violations-catalog.json');
