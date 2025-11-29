#!/usr/bin/env node
/**
 * Design Token Validation Script
 *
 * Validates that components use semantic design tokens instead of hardcoded Tailwind classes.
 * Run: npm run validate:tokens or node scripts/validate-design-tokens.js [file|directory]
 *
 * What it checks:
 * 1. Hardcoded spacing (mb-4, gap-2, p-3, etc.) - should use semantic tokens (mb-header, gap-form, etc.)
 * 2. Hardcoded colors (text-gray-500, bg-blue-100, etc.) - should use semantic tokens (text-secondary, bg-subtle, etc.)
 * 3. Hardcoded sizes (h-5, w-5, etc.) - should use semantic tokens (size-icon-md, etc.)
 *
 * What it allows:
 * - Layout primitives: flex, grid, items-center, justify-center, etc.
 * - Positioning: relative, absolute, fixed, inset-0, etc.
 * - Text alignment: text-center, text-right, text-left
 * - Overflow: overflow-hidden, overflow-auto, etc.
 * - Sizing constraints: min-h-screen, max-w-md, w-full, etc.
 * - Semantic tokens: bg-subtle, text-brand, gap-form, mb-header, etc.
 * - Typography utilities: text-sm, text-xs, text-base, etc. (generated from design tokens)
 * - Font weights: font-normal, font-medium, font-semibold, font-bold (layout primitives)
 * - Opacity values: opacity-50, disabled:opacity-50 (acceptable for disabled states)
 * - Z-index: z-10, z-50 (layout/layering concern, not design token)
 * - rounded-full: Exception for avatar circles (SYOS-585)
 * - Inline oklch colors (for gradients) with brand hue (195)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns that indicate hardcoded Tailwind (NOT allowed)
const HARDCODED_PATTERNS = [
	// Hardcoded spacing (numeric values)
	/\b(m|p|gap|space|inset)-\d+(\.\d+)?\b/g, // m-4, p-2, gap-3, space-x-4
	/\b(mt|mb|ml|mr|mx|my)-\d+(\.\d+)?\b/g, // mt-4, mb-2, etc.
	/\b(pt|pb|pl|pr|px|py)-\d+(\.\d+)?\b/g, // pt-4, pb-2, etc.
	/\b(top|bottom|left|right)-\d+(\.\d+)?\b/g, // top-4, bottom-2 (not inset)

	// Hardcoded sizes (numeric values)
	/\b(h|w|size)-\d+(\.\d+)?\b/g, // h-5, w-5, size-4
	/\b(min-h|max-h|min-w|max-w)-\d+(\.\d+)?\b/g, // min-h-4, max-w-2 (but allow min-h-screen, max-w-md)

	// Hardcoded colors (color-scale values)
	/\b(text|bg|border|ring|fill|stroke)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g,

	// Hardcoded font weights (except medium and semibold which we allow for now)
	// Note: font-normal, font-medium, font-semibold, font-bold are allowed (see ALLOWED_PATTERNS)
	/\bfont-(thin|extralight|light|extrabold|black)\b/g,

	// Hardcoded leading/tracking (numeric values only - semantic tokens like leading-tight are allowed)
	/\b(leading|tracking)-\d+\b/g,

	// Hardcoded rounded values (numeric)
	// Note: rounded-full is allowed for avatars (see ALLOWED_PATTERNS)
	/\brounded-(sm|md|lg|xl|2xl|3xl|none)\b/g,

	// Hardcoded shadow values
	/\bshadow-(sm|md|lg|xl|2xl|inner|none)\b/g
];

// Patterns that are ALLOWED (layout, positioning, semantic tokens)
const ALLOWED_PATTERNS = [
	// Layout primitives
	/\b(flex|grid|block|inline|inline-flex|inline-block|hidden)\b/,
	/\b(flex-row|flex-col|flex-wrap|flex-nowrap)\b/,
	/\b(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline)\b/,
	/\b(grow|shrink|basis)-\d*\b/,
	/\bflex-shrink-0\b/,

	// Positioning
	/\b(relative|absolute|fixed|sticky|static)\b/,
	/\binset-0\b/,
	/\b(top|bottom|left|right)-(0|auto|full)\b/,

	// Text alignment
	/\btext-(left|center|right|justify)\b/,

	// Overflow
	/\boverflow-(hidden|auto|scroll|visible|clip)\b/,
	/\boverflow-(x|y)-(hidden|auto|scroll|visible)\b/,

	// Sizing constraints (non-numeric)
	/\b(min-h|max-h)-(screen|full|fit|min|max)\b/,
	/\b(min-w|max-w)-(screen|full|fit|min|max|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|prose|0)\b/,
	/\b(h|w)-(full|screen|auto|fit|min|max)\b/,

	// Pointer events
	/\bpointer-events-(none|auto)\b/,

	// Font weights (layout primitives - standard Tailwind weights)
	/\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/,

	// Text decoration
	/\b(underline|line-through|no-underline)\b/,
	/\bhover:underline\b/,

	// Typography utilities (generated from design tokens)
	/\btext-(2xs|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/,

	// Opacity values (acceptable for disabled states and visual effects)
	/\b(disabled:)?opacity-\d+\b/,

	// Avatar circle exception (SYOS-585)
	/\brounded-full\b/,

	// Z-index (layout/layering concern, not design token)
	/\bz-\d+\b/,

	// Semantic color tokens (these are generated from our tokens)
	/\b(text|bg|border)-(primary|secondary|tertiary|muted|disabled|inverse|brand|link|success|warning|error|info)\b/,
	/\b(text|bg|border)-(base|subtle|surface|elevated|hover|active|focus)\b/,
	/\bbg-(interactive|status|component|hover)-\w+\b/,
	/\bborder-(default|strong|subtle|error|focus)\b/,

	// Semantic spacing tokens (these are generated from our tokens)
	/\b(px|py|p)-(button|input|page|card)\b/,
	/\b(gap|mb|mt)-(header|alert|form|card|section|content|fieldGroup|button)\b/,
	/\bcard-padding\b/,
	/\bsize-icon-(sm|md|lg)\b/,

	// Semantic radius tokens
	/\brounded-(input|button|card|modal|badge|avatar)\b/,

	// Typography utilities (design token utilities)
	/\b(leading|tracking)-(none|tight|snug|normal|relaxed|loose|extra|tighter|wider|widest|body|heading1|heading2|heading3|heading4|label|caption|code)\b/,

	// Inline oklch with brand hue (195) for gradients
	/oklch\([^)]*195[^)]*\)/,

	// Radial/linear gradients (page-level effects)
	/\bbg-radial-\[/,
	/\bbg-linear-\[/,
	/\bfrom-\[/,
	/\bvia-\[/,
	/\bto-\[/,
	/\bto-transparent\b/,
	/\bvia-transparent\b/
];

// Files/directories to skip
const SKIP_PATTERNS = [
	/node_modules/,
	/\.svelte-kit/,
	/build/,
	/dist/,
	/\.git/,
	/stories\//,
	/\.stories\./, // Skip Storybook story files
	/\.test\./,
	/\.spec\./
];

function extractClasses(content) {
	const classPatterns = [
		/class="([^"]+)"/g,
		/class='([^']+)'/g,
		/class=\{([^}]+)\}/g,
		/class:\s*`([^`]+)`/g
	];

	const classes = [];
	for (const pattern of classPatterns) {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			classes.push({
				full: match[0],
				classes: match[1],
				index: match.index
			});
		}
	}
	return classes;
}

function getLineNumber(content, index) {
	return content.substring(0, index).split('\n').length;
}

function isAllowed(className) {
	for (const pattern of ALLOWED_PATTERNS) {
		if (pattern.test(className)) {
			return true;
		}
	}
	return false;
}

function findViolations(content, filePath) {
	const violations = [];
	const classMatches = extractClasses(content);

	for (const match of classMatches) {
		const classString = match.classes;
		const classList = classString.split(/\s+/).filter(Boolean);

		for (const cls of classList) {
			// Skip if it's an allowed pattern
			if (isAllowed(cls)) continue;

			// Check against hardcoded patterns
			for (const pattern of HARDCODED_PATTERNS) {
				pattern.lastIndex = 0; // Reset regex state
				if (pattern.test(cls)) {
					const lineNumber = getLineNumber(content, match.index);
					violations.push({
						file: filePath,
						line: lineNumber,
						class: cls,
						context: match.full.substring(0, 80) + (match.full.length > 80 ? '...' : '')
					});
					break;
				}
			}
		}
	}

	return violations;
}

async function validateFile(filePath) {
	// Skip non-relevant files
	if (SKIP_PATTERNS.some((pattern) => pattern.test(filePath))) {
		return [];
	}

	// Only check Svelte and TypeScript files
	if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts')) {
		return [];
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	return findViolations(content, filePath);
}

async function validateDirectory(dirPath) {
	const files = await glob(`${dirPath}/**/*.{svelte,ts}`, {
		ignore: ['**/node_modules/**', '**/.svelte-kit/**', '**/build/**', '**/dist/**']
	});

	const allViolations = [];
	for (const file of files) {
		const violations = await validateFile(file);
		allViolations.push(...violations);
	}

	return allViolations;
}

async function main() {
	const args = process.argv.slice(2);
	let targetPath = args[0] || 'src';

	// Resolve path
	if (!path.isAbsolute(targetPath)) {
		targetPath = path.resolve(process.cwd(), targetPath);
	}

	console.log('🔍 Design Token Validation\n');
	console.log(`Checking: ${targetPath}\n`);

	let violations = [];

	const stat = fs.statSync(targetPath);
	if (stat.isDirectory()) {
		violations = await validateDirectory(targetPath);
	} else {
		violations = await validateFile(targetPath);
	}

	if (violations.length === 0) {
		console.log('✅ No hardcoded Tailwind classes found!');
		console.log('   All classes use semantic design tokens or allowed layout primitives.\n');
		process.exit(0);
	} else {
		console.log(`❌ Found ${violations.length} hardcoded Tailwind class(es):\n`);

		// Group by file
		const byFile = {};
		for (const v of violations) {
			if (!byFile[v.file]) byFile[v.file] = [];
			byFile[v.file].push(v);
		}

		for (const [file, fileViolations] of Object.entries(byFile)) {
			const relativePath = path.relative(process.cwd(), file);
			console.log(`📁 ${relativePath}`);
			for (const v of fileViolations) {
				console.log(`   Line ${v.line}: "${v.class}"`);
				console.log(`   └─ ${v.context}`);
			}
			console.log('');
		}

		console.log('💡 To fix:');
		console.log('   - Replace hardcoded spacing (gap-2) with semantic tokens (gap-fieldGroup)');
		console.log(
			'   - Replace hardcoded colors (text-gray-500) with semantic tokens (text-secondary)'
		);
		console.log('   - Replace hardcoded sizes (h-5) with semantic tokens (size-icon-md)');
		console.log('   - See design-tokens-semantic.json for available tokens\n');

		process.exit(1);
	}
}

main().catch(console.error);
