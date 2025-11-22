#!/usr/bin/env tsx
/**
 * Convert CSS custom properties to DTCG format
 *
 * Extracts all tokens from src/app.css and converts to DTCG-compliant JSON
 * Following DTCG 1.0.0 specification: https://design-tokens.github.io/community-group/format/
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Token {
	name: string;
	value: string;
	description?: string;
	category:
		| 'spacing'
		| 'color'
		| 'typography'
		| 'shadow'
		| 'borderRadius'
		| 'transition'
		| 'zIndex'
		| 'size'
		| 'other';
}

interface DTCGToken {
	$value: string;
	$description?: string;
}

type DTCGStructure = {
	$schema: string;
	[key: string]: any;
};

// Map CSS token names to DTCG types and categories
function categorizeToken(name: string): { category: Token['category']; dtcgType: string } {
	if (name.startsWith('--spacing-')) {
		return { category: 'spacing', dtcgType: 'dimension' };
	}
	if (name.startsWith('--color-')) {
		return { category: 'color', dtcgType: 'color' };
	}
	if (name.startsWith('--font-size-') || name.startsWith('--text-')) {
		return { category: 'typography', dtcgType: 'dimension' };
	}
	if (name.startsWith('--font-weight-')) {
		return { category: 'typography', dtcgType: 'fontWeight' };
	}
	if (name.startsWith('--line-height-') || name.startsWith('--letter-spacing-')) {
		return { category: 'typography', dtcgType: 'dimension' };
	}
	if (name.startsWith('--shadow-')) {
		return { category: 'shadow', dtcgType: 'shadow' };
	}
	if (name.startsWith('--border-radius-')) {
		return { category: 'borderRadius', dtcgType: 'dimension' };
	}
	if (name.startsWith('--transition-')) {
		return { category: 'transition', dtcgType: 'other' };
	}
	if (name.startsWith('--z-index-')) {
		return { category: 'zIndex', dtcgType: 'number' };
	}
	if (
		name.startsWith('--size-') ||
		name.startsWith('--max-width-') ||
		name.startsWith('--min-width-') ||
		name.startsWith('--width-')
	) {
		return { category: 'size', dtcgType: 'dimension' };
	}
	return { category: 'other', dtcgType: 'other' };
}

// Parse CSS file and extract tokens
function extractTokens(cssContent: string): Token[] {
	const tokens: Token[] = [];
	const lines = cssContent.split('\n');

	let currentComment = '';
	let inThemeBlock = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Track if we're in @theme block
		if (trimmed.includes('@theme')) {
			inThemeBlock = true;
			continue;
		}

		// Track multi-line comments
		if (trimmed.startsWith('/*') && !trimmed.includes('*/')) {
			currentComment = trimmed.replace(/\/\*/, '').trim();
			continue;
		}

		// Extract token definition: --token-name: value; /* comment */
		const tokenMatch = line.match(/^\s*--([a-z0-9-]+):\s*(.+?);/);
		if (tokenMatch && inThemeBlock) {
			const [, name, value] = tokenMatch;
			const fullName = `--${name}`;

			// Clean value (remove inline comments, handle var() references, trim)
			let cleanValue = value.split('/*')[0].trim();

			// Extract description from inline comment or previous comment
			const inlineCommentMatch = line.match(/\/\*\s*(.+?)\s*\*\//);
			const description = inlineCommentMatch ? inlineCommentMatch[1] : currentComment || undefined;

			const { category } = categorizeToken(fullName);

			tokens.push({
				name: fullName,
				value: cleanValue,
				description: description || undefined,
				category
			});

			// Reset comment after token extraction
			if (inlineCommentMatch) {
				currentComment = '';
			}
		}

		// Reset comment if we hit a non-comment, non-token line
		if (
			!trimmed.includes('--') &&
			!trimmed.startsWith('/*') &&
			!trimmed.includes('*/') &&
			trimmed.length > 0
		) {
			currentComment = '';
		}
	}

	return tokens;
}

// Build nested object structure from token path
function setNestedValue(obj: any, path: string[], value: DTCGToken) {
	let current = obj;
	for (let i = 0; i < path.length - 1; i++) {
		if (!current[path[i]]) {
			current[path[i]] = {};
		}
		current = current[path[i]];
	}
	current[path[path.length - 1]] = value;
}

// Build object with $type first (ensures proper key order)
function buildGroupWithType(type: string, tokens: Token[], namePrefix: string): any {
	// Build tokens first
	const tokensObj: any = {};
	tokens.forEach((token) => {
		const path = token.name.replace(namePrefix, '').split('-');
		const tokenObj: DTCGToken = {
			$value: token.value,
			...(token.description && { $description: token.description })
		};
		setNestedValue(tokensObj, path, tokenObj);
	});

	// Return object with $type first, then tokens
	return { $type: type, ...tokensObj };
}

// Convert tokens to DTCG structure
function convertToDTCG(tokens: Token[]): DTCGStructure {
	const dtcg: DTCGStructure = {
		$schema: 'https://design-tokens.github.io/community-group/format/1.0.0/schema.json'
	};

	// Group tokens by category
	const byCategory: Record<string, Token[]> = {};
	tokens.forEach((token) => {
		if (!byCategory[token.category]) {
			byCategory[token.category] = [];
		}
		byCategory[token.category].push(token);
	});

	// Spacing tokens
	if (byCategory.spacing && byCategory.spacing.length > 0) {
		dtcg.spacing = buildGroupWithType('dimension', byCategory.spacing, '--spacing-');
	}

	// Color tokens
	if (byCategory.color && byCategory.color.length > 0) {
		dtcg.color = buildGroupWithType('color', byCategory.color, '--color-');
	}

	// Typography tokens
	const typographyTokens = tokens.filter((t) => t.category === 'typography');
	if (typographyTokens.length > 0) {
		dtcg.typography = {};

		// Font sizes
		const fontSizes = typographyTokens.filter(
			(t) => t.name.startsWith('--font-size-') || t.name.startsWith('--text-')
		);
		if (fontSizes.length > 0) {
			dtcg.typography.fontSize = {};
			dtcg.typography.fontSize.$type = 'dimension';
			fontSizes.forEach((token) => {
				const name = token.name
					.replace('--font-size-', '')
					.replace('--text-', '')
					.replace(/-/g, '');
				dtcg.typography.fontSize[name] = {
					$value: token.value,
					...(token.description && { $description: token.description })
				};
			});
		}

		// Font weights
		const fontWeights = typographyTokens.filter((t) => t.name.startsWith('--font-weight-'));
		if (fontWeights.length > 0) {
			dtcg.typography.fontWeight = {};
			dtcg.typography.fontWeight.$type = 'fontWeight';
			fontWeights.forEach((token) => {
				const name = token.name.replace('--font-weight-', '').replace(/-/g, '');
				dtcg.typography.fontWeight[name] = {
					$value: token.value,
					...(token.description && { $description: token.description })
				};
			});
		}

		// Line height
		const lineHeights = typographyTokens.filter((t) => t.name.startsWith('--line-height-'));
		if (lineHeights.length > 0) {
			dtcg.typography.lineHeight = {};
			dtcg.typography.lineHeight.$type = 'number';
			lineHeights.forEach((token) => {
				const name = token.name.replace('--line-height-', '').replace(/-/g, '');
				dtcg.typography.lineHeight[name] = {
					$value: token.value,
					...(token.description && { $description: token.description })
				};
			});
		}

		// Letter spacing
		const letterSpacing = typographyTokens.filter((t) => t.name.startsWith('--letter-spacing-'));
		if (letterSpacing.length > 0) {
			dtcg.typography.letterSpacing = {};
			dtcg.typography.letterSpacing.$type = 'dimension';
			letterSpacing.forEach((token) => {
				const name = token.name.replace('--letter-spacing-', '').replace(/-/g, '');
				dtcg.typography.letterSpacing[name] = {
					$value: token.value,
					...(token.description && { $description: token.description })
				};
			});
		}
	}

	// Shadow tokens
	if (byCategory.shadow && byCategory.shadow.length > 0) {
		dtcg.shadow = { $type: 'shadow' };
		byCategory.shadow.forEach((token) => {
			const name = token.name.replace('--shadow-', '').replace(/-/g, '');
			dtcg.shadow[name] = {
				$value: token.value,
				...(token.description && { $description: token.description })
			};
		});
	}

	// Border radius tokens
	if (byCategory.borderRadius && byCategory.borderRadius.length > 0) {
		dtcg.borderRadius = buildGroupWithType(
			'dimension',
			byCategory.borderRadius,
			'--border-radius-'
		);
	}

	// Size tokens (dimensions) - handle special naming
	if (byCategory.size && byCategory.size.length > 0) {
		dtcg.size = { $type: 'dimension' };
		byCategory.size.forEach((token) => {
			const name = token.name
				.replace('--size-', '')
				.replace('--max-width-', 'maxWidth')
				.replace('--min-width-', 'minWidth')
				.replace('--width-', 'width')
				.replace(/-/g, '');
			dtcg.size[name] = {
				$value: token.value,
				...(token.description && { $description: token.description })
			};
		});
	}

	// Transition tokens
	if (byCategory.transition && byCategory.transition.length > 0) {
		dtcg.transition = { $type: 'other' };
		byCategory.transition.forEach((token) => {
			const name = token.name.replace('--transition-', '').replace(/-/g, '');
			dtcg.transition[name] = {
				$value: token.value,
				...(token.description && { $description: token.description })
			};
		});
	}

	// Z-index tokens
	if (byCategory.zIndex && byCategory.zIndex.length > 0) {
		dtcg.zIndex = { $type: 'number' };
		byCategory.zIndex.forEach((token) => {
			const name = token.name.replace('--z-index-', '').replace(/-/g, '');
			dtcg.zIndex[name] = {
				$value: token.value,
				...(token.description && { $description: token.description })
			};
		});
	}

	return dtcg;
}

// Main execution
const cssPath = join(process.cwd(), 'src', 'app.css');
const cssContent = readFileSync(cssPath, 'utf-8');

console.log('Extracting tokens from CSS...');
const tokens = extractTokens(cssContent);
console.log(`Found ${tokens.length} tokens`);

console.log('Converting to DTCG format...');
const dtcg = convertToDTCG(tokens);

const outputPath = join(process.cwd(), 'design-system.json');
writeFileSync(outputPath, JSON.stringify(dtcg, null, '\t'));

console.log(`✅ DTCG format written to ${outputPath}`);
console.log(`\nToken breakdown:`);
console.log(`- Spacing: ${tokens.filter((t) => t.category === 'spacing').length}`);
console.log(`- Color: ${tokens.filter((t) => t.category === 'color').length}`);
console.log(`- Typography: ${tokens.filter((t) => t.category === 'typography').length}`);
console.log(`- Shadow: ${tokens.filter((t) => t.category === 'shadow').length}`);
console.log(`- Border Radius: ${tokens.filter((t) => t.category === 'borderRadius').length}`);
console.log(`- Size: ${tokens.filter((t) => t.category === 'size').length}`);
console.log(`- Transition: ${tokens.filter((t) => t.category === 'transition').length}`);
console.log(`- Z-Index: ${tokens.filter((t) => t.category === 'zIndex').length}`);
console.log(`- Other: ${tokens.filter((t) => t.category === 'other').length}`);
