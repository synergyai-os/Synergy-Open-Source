#!/usr/bin/env node
/**
 * Generate Storybook Token Documentation
 *
 * Reads design-tokens-base.json and design-tokens-semantic.json
 * Generates MDX documentation files with visual previews using Storybook Doc Blocks
 *
 * Usage:
 *   node scripts/generate-storybook-docs.js
 *   npm run tokens:storybook
 *
 * Output:
 *   - src/stories/tokens/Colors.mdx
 *   - src/stories/tokens/Typography.mdx
 *   - src/stories/tokens/Spacing.mdx
 *   - src/stories/tokens/Shadows.mdx
 *   - src/stories/tokens/BorderRadius.mdx
 *   - src/stories/tokens/Animation.mdx
 *   - src/stories/tokens/Overview.mdx
 *   - src/stories/TokenReference.mdx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_TOKENS_PATH = path.join(__dirname, '..', 'design-tokens-base.json');
const SEMANTIC_TOKENS_PATH = path.join(__dirname, '..', 'design-tokens-semantic.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'stories', 'tokens');
const TOKEN_REF_PATH = path.join(__dirname, '..', 'src', 'stories', 'TokenReference.mdx');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Load JSON file
 */
function loadJSON(filepath) {
	if (!fs.existsSync(filepath)) {
		console.warn(`⚠️  File not found: ${filepath}`);
		return null;
	}
	return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

/**
 * Flatten nested token object into flat key-value pairs
 */
function flattenTokens(obj, prefix = '', result = {}) {
	for (const key in obj) {
		if (key.startsWith('$')) continue; // Skip meta keys

		const value = obj[key];
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (value && typeof value === 'object' && value.$value !== undefined) {
			result[newKey] = {
				value: value.$value,
				description: value.$description || '',
				type: value.$type || ''
			};
		} else if (typeof value === 'object') {
			flattenTokens(value, newKey, result);
		}
	}
	return result;
}

/**
 * Convert rem to pixels for display
 */
function remToPx(value) {
	if (typeof value !== 'string') return '';
	const match = value.match(/^([\d.]+)rem$/);
	if (match) {
		return `${parseFloat(match[1]) * 16}px`;
	}
	return '';
}

/**
 * Escape curly braces for MDX (prevents JSX interpretation)
 */
function escapeMdx(value) {
	if (typeof value !== 'string') return String(value);
	return value.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

/**
 * Generate Colors.mdx
 */
function generateColorsMdx(baseTokens, semanticTokens) {
	const colors = baseTokens.color || {};

	let mdx = `import { Meta, ColorPalette, ColorItem } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Colors" />

# Color Tokens

Visual reference for all color tokens in the SynergyOS design system.

**Color Space**: OKLCH (Oklch lightness, chroma, hue) for perceptual uniformity and wide gamut support.

---

## Brand Colors

Primary and secondary brand colors - the identity of SynergyOS.

<ColorPalette>
`;

	// Brand colors
	if (colors.brand) {
		const brandColors = {};
		for (const [name, token] of Object.entries(colors.brand)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				brandColors[name] = token.$value;
			}
		}
		mdx += `  <ColorItem
    title="Brand Colors"
    subtitle="Primary: Deep Teal | Secondary: Warm Amber"
    colors={${JSON.stringify(brandColors, null, 2).replace(/\n/g, '\n    ')}}
  />
`;
	}

	mdx += `</ColorPalette>

---

## Neutral Scale

11-step gray scale with subtle cool undertone. Used for text, backgrounds, and borders.

<ColorPalette>
`;

	// Neutral colors - split into light and dark
	if (colors.neutral) {
		const lightNeutrals = {};
		const darkNeutrals = {};

		for (const [name, token] of Object.entries(colors.neutral)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				const numVal = parseInt(name) || 0;
				if (numVal <= 400) {
					lightNeutrals[`neutral-${name}`] = token.$value;
				} else {
					darkNeutrals[`neutral-${name}`] = token.$value;
				}
			}
		}

		mdx += `  <ColorItem
    title="Light Neutrals (0-400)"
    subtitle="Backgrounds, surfaces, and light borders"
    colors={${JSON.stringify(lightNeutrals, null, 2).replace(/\n/g, '\n    ')}}
  />
  <ColorItem
    title="Dark Neutrals (500-1000)"
    subtitle="Text, dark backgrounds, and borders"
    colors={${JSON.stringify(darkNeutrals, null, 2).replace(/\n/g, '\n    ')}}
  />
`;
	}

	mdx += `</ColorPalette>

---

## Status Colors

Semantic colors for feedback and state communication.

<ColorPalette>
`;

	// Status colors
	if (colors.status) {
		// Group by status type
		const statusGroups = { error: {}, warning: {}, success: {}, info: {} };

		for (const [name, token] of Object.entries(colors.status)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				if (name.startsWith('error')) {
					statusGroups.error[name] = token.$value;
				} else if (name.startsWith('warning')) {
					statusGroups.warning[name] = token.$value;
				} else if (name.startsWith('success')) {
					statusGroups.success[name] = token.$value;
				} else if (name.startsWith('info')) {
					statusGroups.info[name] = token.$value;
				}
			}
		}

		for (const [group, colors] of Object.entries(statusGroups)) {
			if (Object.keys(colors).length > 0) {
				const title = group.charAt(0).toUpperCase() + group.slice(1);
				mdx += `  <ColorItem
    title="${title}"
    subtitle="${title} states and feedback"
    colors={${JSON.stringify(colors, null, 2).replace(/\n/g, '\n    ')}}
  />
`;
			}
		}
	}

	mdx += `</ColorPalette>

---

## Accent Palette

Decorative colors for creative freedom - tags, categories, highlights.

<ColorPalette>
`;

	// Accent colors
	if (colors.accent) {
		const accentColors = {};
		for (const [name, token] of Object.entries(colors.accent)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				accentColors[name] = token.$value;
			}
		}
		mdx += `  <ColorItem
    title="Accent Palette"
    subtitle="Coral, Purple, Blue, Teal, Lime, Gold"
    colors={${JSON.stringify(accentColors, null, 2).replace(/\n/g, '\n    ')}}
  />
`;
	}

	mdx += `</ColorPalette>

---

## Syntax Colors

Code syntax highlighting colors for code blocks.

<ColorPalette>
`;

	// Syntax colors
	if (colors.syntax) {
		const syntaxColors = {};
		for (const [name, token] of Object.entries(colors.syntax)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				syntaxColors[name] = token.$value;
			}
		}
		mdx += `  <ColorItem
    title="Syntax Highlighting"
    subtitle="Code editor colors"
    colors={${JSON.stringify(syntaxColors, null, 2).replace(/\n/g, '\n    ')}}
  />
`;
	}

	mdx += `</ColorPalette>

---

## Usage

### CSS Variables

All colors are available as CSS variables:

\`\`\`css
/* Base colors */
--color-brand-primary: oklch(55% 0.15 195);
--color-neutral-900: oklch(20% 0.02 264);

/* Use in components */
.button {
  background-color: var(--color-brand-primary);
  color: var(--color-neutral-0);
}
\`\`\`

### Utility Classes

Use semantic utility classes for automatic dark mode support:

\`\`\`svelte
<!-- ✅ CORRECT: Semantic tokens -->
<div class="bg-accent-primary text-inverse">Primary CTA</div>
<div class="bg-surface text-primary">Card content</div>

<!-- ❌ WRONG: Hardcoded values -->
<div style="background: oklch(55% 0.15 195)">Don't do this</div>
\`\`\`

---

**Source**: \`design-tokens-base.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate Typography.mdx
 */
function generateTypographyMdx(baseTokens) {
	const typography = baseTokens.typography || {};

	// Extract token values for CSS generation
	const getTokenValue = (category, name) => {
		const token = typography[category]?.[name];
		return token?.$value || '';
	};

	const getFontFamily = (name) => {
		return getTokenValue('fontFamily', name) || "'Plus Jakarta Sans', system-ui, sans-serif";
	};

	// Build CSS with CSS variables and fallback values
	let cssStyles = `<style>
	{\`
    .hero {
      background: linear-gradient(135deg, oklch(20% 0.02 264) 0%, oklch(13% 0.015 264) 100%);
      border-radius: var(--borderRadius-xl, 1rem);
      padding: var(--spacing-12, 3rem);
      margin-bottom: var(--spacing-12, 3rem);
      border: 1px solid oklch(37% 0.03 264);
    }
    
    .hero-title {
      font-family: var(--typography-fontFamily-heading, ${getFontFamily('heading')}) !important;
      font-size: var(--typography-fontSize-5xl, ${getTokenValue('fontSize', '5xl')}) !important;
      font-weight: var(--typography-fontWeight-bold, ${getTokenValue('fontWeight', 'bold')}) !important;
      color: oklch(100% 0 0);
      margin: 0 0 var(--spacing-2, 0.5rem) 0;
      letter-spacing: var(--typography-letterSpacing-tight, ${getTokenValue('letterSpacing', 'tight')}) !important;
      line-height: var(--typography-lineHeight-tight, ${getTokenValue('lineHeight', 'tight')}) !important;
    }
    
    .hero-subtitle {
      font-family: var(--typography-fontFamily-sans, ${getFontFamily('sans')}) !important;
      font-size: var(--typography-fontSize-lg, ${getTokenValue('fontSize', 'lg')}) !important;
      color: oklch(70% 0.015 264);
      margin: 0 0 var(--spacing-8, 2rem) 0;
      line-height: var(--typography-lineHeight-relaxed, ${getTokenValue('lineHeight', 'relaxed')}) !important;
    }
    
    .showcase-section {
      background: oklch(20% 0.02 264);
      border: 1px solid oklch(37% 0.03 264);
      border-radius: var(--borderRadius-lg, 0.75rem);
      padding: var(--spacing-8, 2rem);
    }
    
    .showcase-title {
      font-family: var(--typography-fontFamily-heading, ${getFontFamily('heading')}) !important;
      font-size: var(--typography-fontSize-xl, ${getTokenValue('fontSize', 'xl')}) !important;
      font-weight: var(--typography-fontWeight-semibold, ${getTokenValue('fontWeight', 'semibold')}) !important;
      color: oklch(100% 0 0);
      margin: 0 0 var(--spacing-6, 1.5rem) 0;
      letter-spacing: var(--typography-letterSpacing-tight, ${getTokenValue('letterSpacing', 'tight')}) !important;
    }
    
    .type-scale {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6, 1.5rem);
    }
    
    .type-sample {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-6, 1.5rem);
      padding: var(--spacing-4, 1rem);
      background: oklch(13% 0.015 264);
      border-radius: var(--borderRadius-md, 0.5rem);
      border: 1px solid oklch(37% 0.03 264);
    }
    
    .type-sample-label {
      font-family: var(--typography-fontFamily-mono, ${getFontFamily('mono')}) !important;
      font-size: var(--typography-fontSize-xs, ${getTokenValue('fontSize', 'xs')}) !important;
      color: oklch(55% 0.02 264);
      min-width: 120px;
      flex-shrink: 0;
    }
    
    .type-sample-text {
      flex: 1;
      color: oklch(100% 0 0);
      margin: 0;
    }`;

	// Generate type classes for each font size
	const sizeOrder = ['7xl', '6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs', '2xs'];
	const sizeConfigs = {
		'7xl': { weight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' },
		'6xl': { weight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' },
		'5xl': { weight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' },
		'4xl': { weight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' },
		'3xl': { weight: 'semibold', lineHeight: 'tight', letterSpacing: 'tight' },
		'2xl': { weight: 'semibold', lineHeight: 'snug' },
		'xl': { weight: 'medium', lineHeight: 'snug' },
		'lg': { weight: 'regular', lineHeight: 'relaxed' },
		'base': { weight: 'regular', lineHeight: 'normal' },
		'sm': { weight: 'regular', lineHeight: 'normal' },
		'xs': { weight: 'regular', lineHeight: 'normal' },
		'2xs': { weight: 'regular', lineHeight: 'normal' }
	};

	for (const size of sizeOrder) {
		const config = sizeConfigs[size];
		const fontSize = getTokenValue('fontSize', size);
		const fontWeight = getTokenValue('fontWeight', config.weight);
		const lineHeight = getTokenValue('lineHeight', config.lineHeight);
		const letterSpacing = config.letterSpacing ? getTokenValue('letterSpacing', config.letterSpacing) : getTokenValue('letterSpacing', 'normal');
		const fontFamily = (size === 'xl' || size === 'lg' || size === 'base' || size === 'sm' || size === 'xs' || size === '2xs') 
			? getFontFamily('sans') 
			: getFontFamily('heading');

		cssStyles += `
    .type-${size} {
      font-family: var(--typography-fontFamily-${size === 'xl' || size === 'lg' || size === 'base' || size === 'sm' || size === 'xs' || size === '2xs' ? 'sans' : 'heading'}, ${fontFamily}) !important;
      font-size: var(--typography-fontSize-${size}, ${fontSize}) !important;
      font-weight: var(--typography-fontWeight-${config.weight}, ${fontWeight}) !important;
      line-height: var(--typography-lineHeight-${config.lineHeight}, ${lineHeight}) !important;
      ${config.letterSpacing ? `letter-spacing: var(--typography-letterSpacing-${config.letterSpacing}, ${letterSpacing}) !important;` : ''}
    }`;
	}

	// Weight showcase styles
	cssStyles += `
    
    .weight-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-4, 1rem);
    }
    
    .weight-sample {
      background: oklch(13% 0.015 264);
      border: 1px solid oklch(37% 0.03 264);
      border-radius: var(--borderRadius-md, 0.5rem);
      padding: var(--spacing-5, 1.25rem);
    }
    
    .weight-label {
      font-family: var(--typography-fontFamily-mono, ${getFontFamily('mono')}) !important;
      font-size: var(--typography-fontSize-xs, ${getTokenValue('fontSize', 'xs')}) !important;
      color: oklch(55% 0.02 264);
      margin: 0 0 var(--spacing-2, 0.5rem) 0;
    }
    
    .weight-text {
      font-family: var(--typography-fontFamily-sans, ${getFontFamily('sans')}) !important;
      font-size: var(--typography-fontSize-xl, ${getTokenValue('fontSize', 'xl')}) !important;
      color: oklch(100% 0 0);
      margin: 0;
    }`;

	// Weight classes
	const weightOrder = ['thin', 'extralight', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
	for (const weight of weightOrder) {
		const weightValue = getTokenValue('fontWeight', weight);
		cssStyles += `
    .weight-${weight} { font-weight: var(--typography-fontWeight-${weight}, ${weightValue}) !important; }`;
	}

	// Font family card styles
	cssStyles += `
    
    .font-family-card {
      background: oklch(13% 0.015 264);
      border: 1px solid oklch(37% 0.03 264);
      border-radius: var(--borderRadius-lg, 0.75rem);
      padding: var(--spacing-6, 1.5rem);
      margin-bottom: var(--spacing-6, 1.5rem);
    }
    
    .font-family-name {
      font-family: var(--typography-fontFamily-heading, ${getFontFamily('heading')}) !important;
      font-size: var(--typography-fontSize-lg, ${getTokenValue('fontSize', 'lg')}) !important;
      font-weight: var(--typography-fontWeight-semibold, ${getTokenValue('fontWeight', 'semibold')}) !important;
      color: oklch(100% 0 0);
      margin: 0 0 var(--spacing-2, 0.5rem) 0;
    }
    
    .font-family-stack {
      display: inline-block;
      font-family: var(--typography-fontFamily-mono, ${getFontFamily('mono')}) !important;
      font-size: var(--typography-fontSize-sm, ${getTokenValue('fontSize', 'sm')}) !important;
      color: oklch(65% 0.12 195);
      background: oklch(20% 0.02 264);
      padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
      border-radius: var(--borderRadius-sm, 0.25rem);
      margin: 0 0 var(--spacing-4, 1rem) 0;
    }
    
    .font-family-desc {
      font-family: var(--typography-fontFamily-sans, ${getFontFamily('sans')}) !important;
      font-size: var(--typography-fontSize-base, ${getTokenValue('fontSize', 'base')}) !important;
      color: oklch(70% 0.015 264);
      margin: 0 0 var(--spacing-4, 1rem) 0;
      line-height: var(--typography-lineHeight-relaxed, ${getTokenValue('lineHeight', 'relaxed')}) !important;
    }
    
    .token-table {
      width: 100%;
      border-collapse: collapse;
      margin: var(--spacing-6, 1.5rem) 0;
    }
    
    .token-table th {
      font-family: var(--typography-fontFamily-heading, ${getFontFamily('heading')}) !important;
      font-size: var(--typography-fontSize-sm, ${getTokenValue('fontSize', 'sm')}) !important;
      font-weight: var(--typography-fontWeight-semibold, ${getTokenValue('fontWeight', 'semibold')}) !important;
      color: oklch(100% 0 0);
      text-align: left;
      padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
      border-bottom: 1px solid oklch(37% 0.03 264);
      background: oklch(13% 0.015 264);
    }
    
    .token-table td {
      font-family: var(--typography-fontFamily-sans, ${getFontFamily('sans')}) !important;
      font-size: var(--typography-fontSize-sm, ${getTokenValue('fontSize', 'sm')}) !important;
      color: oklch(85% 0.01 264);
      padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
      border-bottom: 1px solid oklch(27% 0.025 264);
    }
    
    .token-table code {
      font-family: var(--typography-fontFamily-mono, ${getFontFamily('mono')}) !important;
      font-size: var(--typography-fontSize-xs, ${getTokenValue('fontSize', 'xs')}) !important;
      background: oklch(13% 0.015 264);
      padding: var(--spacing-0\.5, 0.125rem) var(--spacing-1\.5, 0.375rem);
      border-radius: var(--borderRadius-sm, 0.25rem);
      color: oklch(65% 0.12 195);
    }
    
    .section-title {
      font-family: var(--typography-fontFamily-heading, ${getFontFamily('heading')}) !important;
      font-size: var(--typography-fontSize-2xl, ${getTokenValue('fontSize', '2xl')}) !important;
      font-weight: var(--typography-fontWeight-bold, ${getTokenValue('fontWeight', 'bold')}) !important;
      color: oklch(100% 0 0);
      margin: var(--spacing-12, 3rem) 0 var(--spacing-6, 1.5rem) 0;
      letter-spacing: var(--typography-letterSpacing-tight, ${getTokenValue('letterSpacing', 'tight')}) !important;
    }
    
    .section-subtitle {
      font-family: var(--typography-fontFamily-sans, ${getFontFamily('sans')}) !important;
      font-size: var(--typography-fontSize-base, ${getTokenValue('fontSize', 'base')}) !important;
      color: oklch(70% 0.015 264);
      margin: 0 0 var(--spacing-8, 2rem) 0;
      line-height: var(--typography-lineHeight-relaxed, ${getTokenValue('lineHeight', 'relaxed')}) !important;
    }
  \`}
</style>

`;

	let mdx = `import { Meta, Typeset } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Typography" />

${cssStyles}

<div className="hero">
	<h1 className="hero-title">Typography System</h1>
	<p className="hero-subtitle">
		A comprehensive type scale with semantic tokens. All typography uses CSS variables that cascade from base tokens.
	</p>
</div>

## 📐 Type Scale Overview

<div className="showcase-section">
	<h3 className="showcase-title">Font Sizes</h3>
	<div className="type-scale">`;

	// Generate type scale samples
	const sortedSizes = Object.entries(typography.fontSize || {})
			.filter(([k]) => !k.startsWith('$'))
			.sort((a, b) => {
				const aIdx = sizeOrder.indexOf(a[0]);
				const bIdx = sizeOrder.indexOf(b[0]);
				if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0]);
				if (aIdx === -1) return 1;
				if (bIdx === -1) return -1;
			return bIdx - aIdx; // Reverse order (largest first)
		});

	const sizeLabels = {
		'7xl': 'Display Heading',
		'6xl': 'Hero Heading',
		'5xl': 'Large Heading',
		'4xl': 'Page Heading',
		'3xl': 'Section Heading',
		'2xl': 'Subsection Heading',
		'xl': 'Small Heading',
		'lg': 'Large body text for emphasis and important content',
		'base': 'Default body text for paragraphs and general content',
		'sm': 'Secondary text, buttons, and helper content',
		'xs': 'Small labels, badges, and captions',
		'2xs': 'Tiny labels and legal text'
	};

		for (const [name, token] of sortedSizes) {
			if (token.$value) {
				const px = remToPx(token.$value);
			const label = sizeLabels[name] || name;
			mdx += `
		<div className="type-sample">
			<span className="type-sample-label">${name} (${px})</span>
			<p className="type-sample-text type-${name}">
				${label}
			</p>
		</div>`;
		}
	}

	mdx += `
	</div>
</div>

---

## 💪 Font Weights

<div className="showcase-section">
	<h3 className="showcase-title">Weight Scale</h3>
	<div className="weight-showcase">`;

	// Generate weight samples
	const sortedWeights = Object.entries(typography.fontWeight || {})
			.filter(([k]) => !k.startsWith('$'))
			.sort((a, b) => {
				const aIdx = weightOrder.indexOf(a[0]);
				const bIdx = weightOrder.indexOf(b[0]);
				return aIdx - bIdx;
			});

	const weightLabels = {
		'thin': 'Thin (100)',
		'extralight': 'Extra Light (200)',
		'light': 'Light (300)',
		'regular': 'Regular (400)',
		'medium': 'Medium (500)',
		'semibold': 'Semibold (600)',
		'bold': 'Bold (700)',
		'extrabold': 'Extra Bold (800)',
		'black': 'Black (900)'
	};

		for (const [name, token] of sortedWeights) {
		if (token.$value) {
			const label = weightLabels[name] || name;
			mdx += `
		<div className="weight-sample">
			<p className="weight-label">${label}</p>
			<p className="weight-text weight-${name}">
				The quick brown fox
			</p>
		</div>`;
		}
	}

	mdx += `
	</div>
</div>

---

## 🔤 Font Families

`;

	// Font families
	if (typography.fontFamily) {
		for (const [name, token] of Object.entries(typography.fontFamily)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				const desc = token.$description || '';
				const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
				mdx += `<div className="font-family-card">
	<h3 className="font-family-name">${capitalizedName}${name === 'heading' ? '' : name === 'sans' ? ' (Primary)' : ''}</h3>
	<code className="font-family-stack">var(--typography-fontFamily-${name})</code>
	<p className="font-family-desc">
		${desc}
	</p>
	<Typeset
		fontFamily="${token.$value}"
		fontSizes={['0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem']}
		fontWeight={name === 'heading' ? 600 : 400}
		sampleText="The quick brown fox jumps over the lazy dog. 0123456789"
	/>
</div>

`;
			}
		}
	}

	mdx += `---

<h2 className="section-title">📊 Token Reference</h2>
<p className="section-subtitle">
	Complete reference for all typography tokens. All values use CSS variables that reference base tokens.
</p>

## Font Size Scale

Based on a modular scale with \`1rem\` (16px) as the base.

<table className="token-table">
	<thead>
		<tr>
			<th>Token</th>
			<th>Value</th>
			<th>Pixels</th>
			<th>Usage</th>
		</tr>
	</thead>
	<tbody>`;

	// Font sizes table
	for (const [name, token] of sortedSizes.reverse()) {
		if (token.$value) {
			const px = remToPx(token.$value);
			const desc = token.$description || '';
	mdx += `
		<tr>
			<td><code>--typography-fontSize-${name}</code></td>
			<td>${token.$value}</td>
			<td>${px}</td>
			<td>${desc}</td>
		</tr>`;
		}
	}

	mdx += `
	</tbody>
</table>

---

## Font Weights

<table className="token-table">
	<thead>
		<tr>
			<th>Token</th>
			<th>Value</th>
			<th>Usage</th>
		</tr>
	</thead>
	<tbody>`;

	// Font weights table
	for (const [name, token] of sortedWeights) {
		if (token.$value) {
			const desc = token.$description || '';
			mdx += `
		<tr>
			<td><code>--typography-fontWeight-${name}</code></td>
			<td>${token.$value}</td>
			<td>${desc}</td>
		</tr>`;
		}
	}

	mdx += `
	</tbody>
</table>

---

## Line Heights

<table className="token-table">
	<thead>
		<tr>
			<th>Token</th>
			<th>Value</th>
			<th>Usage</th>
		</tr>
	</thead>
	<tbody>`;

	// Line heights table
	if (typography.lineHeight) {
		for (const [name, token] of Object.entries(typography.lineHeight)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				const desc = token.$description || '';
				mdx += `
		<tr>
			<td><code>--typography-lineHeight-${name}</code></td>
			<td>${token.$value}</td>
			<td>${desc}</td>
		</tr>`;
			}
		}
	}

	mdx += `
	</tbody>
</table>

---

## Letter Spacing

<table className="token-table">
	<thead>
		<tr>
			<th>Token</th>
			<th>Value</th>
			<th>Usage</th>
		</tr>
	</thead>
	<tbody>`;

	// Letter spacing table
	if (typography.letterSpacing) {
		for (const [name, token] of Object.entries(typography.letterSpacing)) {
			if (name.startsWith('$')) continue;
			if (token.$value) {
				const desc = token.$description || '';
				mdx += `
		<tr>
			<td><code>--typography-letterSpacing-${name}</code></td>
			<td>${token.$value}</td>
			<td>${desc}</td>
		</tr>`;
			}
		}
	}

	mdx += `
	</tbody>
</table>

---

**Source**: \`design-tokens-base.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate Spacing.mdx
 */
function generateSpacingMdx(baseTokens, semanticTokens) {
	const spacing = baseTokens.spacing || {};

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Spacing" />

# Spacing Tokens

Visual reference for all spacing tokens in the SynergyOS design system.

**Base Unit**: 4px (0.25rem) - All spacing follows a consistent 4px grid.

---

## Reference Table

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
`;

	// Generate spacing entries
	const spacingEntries = Object.entries(spacing)
		.filter(([k]) => !k.startsWith('$'))
		.sort((a, b) => {
			const aNum = parseFloat(a[0]) || 0;
			const bNum = parseFloat(b[0]) || 0;
			return aNum - bNum;
		});

	for (const [name, token] of spacingEntries) {
		if (!token.$value) continue;
		const px = remToPx(token.$value) || token.$value;
		const desc = token.$description || '';
		mdx += `| \`--spacing-${name}\` | ${token.$value} | ${px} | ${desc} |\n`;
	}

	// Semantic spacing
	const semanticSpacing = semanticTokens?.spacing || {};
	if (Object.keys(semanticSpacing).length > 0) {
		mdx += `
---

## Semantic Spacing

Component-specific spacing that references the base scale.

| Token | References | Usage |
|-------|------------|-------|
`;

		const flatSemantic = flattenTokens(semanticSpacing);
		for (const [path, token] of Object.entries(flatSemantic)) {
			const value = escapeMdx(
				typeof token.value === 'string' ? token.value : JSON.stringify(token.value)
			);
			const desc = token.description || '';
			mdx += `| \`--spacing-${path.replace(/\./g, '-')}\` | ${value} | ${desc} |\n`;
		}
	}

	mdx += `
---

## Usage

### Utility Classes

\`\`\`svelte
<!-- Padding -->
<div class="px-button-x py-button-y">Button padding</div>
<div class="p-card-padding">Card padding</div>

<!-- Gap -->
<div class="flex gap-section">Section gap</div>

<!-- Page layout -->
<main class="px-page-x py-page-y">Page content</main>
\`\`\`

---

**Source**: \`design-tokens-base.json\`, \`design-tokens-semantic.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate Shadows.mdx
 */
function generateShadowsMdx(baseTokens, semanticTokens) {
	const shadows = baseTokens.shadow || {};

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Shadows" />

# Shadow Tokens

Visual reference for all shadow (elevation) tokens in the SynergyOS design system.

---

## Reference Table

| Token | Value | Usage |
|-------|-------|-------|
`;

	for (const [name, token] of Object.entries(shadows)) {
		if (name.startsWith('$')) continue;
		if (!token.$value) continue;
		const desc = token.$description || '';
		// Escape the shadow value for markdown table
		const escapedValue = token.$value.replace(/\|/g, '\\|');
		mdx += `| \`--shadow-${name}\` | \`${escapedValue}\` | ${desc} |\n`;
	}

	// Semantic shadows
	const semanticShadows = semanticTokens?.shadow || {};
	if (Object.keys(semanticShadows).length > 0) {
		mdx += `
---

## Semantic Shadows

Component-specific shadows with light/dark mode support.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
`;

		for (const [name, token] of Object.entries(semanticShadows)) {
			if (name.startsWith('$')) continue;
			if (!token.$value) continue;
			const desc = token.$description || '';
			const lightVal = typeof token.$value === 'object' ? token.$value.light : token.$value;
			const darkVal = typeof token.$value === 'object' ? token.$value.dark : token.$value;
			mdx += `| \`--shadow-${name}\` | \`${lightVal}\` | \`${darkVal}\` | ${desc} |\n`;
		}
	}

	mdx += `
---

## Usage

\`\`\`svelte
<!-- Utility classes -->
<div class="shadow-card">Card with shadow</div>
<div class="shadow-modal">Modal overlay</div>

<!-- CSS variable -->
<div style="box-shadow: var(--shadow-card)">Custom element</div>
\`\`\`

---

**Source**: \`design-tokens-base.json\`, \`design-tokens-semantic.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate BorderRadius.mdx
 */
function generateBorderRadiusMdx(baseTokens, semanticTokens) {
	const radii = baseTokens.borderRadius || {};

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Border Radius" />

# Border Radius Tokens

Visual reference for all border radius tokens in the SynergyOS design system.

---

## Reference Table

| Token | Value | Usage |
|-------|-------|-------|
`;

	for (const [name, token] of Object.entries(radii)) {
		if (name.startsWith('$')) continue;
		if (!token.$value) continue;
		const desc = token.$description || '';
		mdx += `| \`--borderRadius-${name}\` | ${token.$value} | ${desc} |\n`;
	}

	// Semantic border radius
	const semanticRadius = semanticTokens?.borderRadius || {};
	if (Object.keys(semanticRadius).length > 0) {
		mdx += `
---

## Semantic Border Radius

Component-specific radius values.

| Token | References | Usage |
|-------|------------|-------|
`;

		for (const [name, token] of Object.entries(semanticRadius)) {
			if (name.startsWith('$')) continue;
			if (!token.$value) continue;
			const desc = token.$description || '';
			mdx += `| \`--borderRadius-${name}\` | ${escapeMdx(token.$value)} | ${desc} |\n`;
		}
	}

	mdx += `
---

## Usage

\`\`\`svelte
<!-- Utility classes -->
<button class="rounded-button">Button</button>
<div class="rounded-card">Card</div>
<span class="rounded-badge">Badge</span>

<!-- CSS variable -->
<div style="border-radius: var(--borderRadius-lg)">Custom element</div>
\`\`\`

---

**Source**: \`design-tokens-base.json\`, \`design-tokens-semantic.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate Animation.mdx
 */
function generateAnimationMdx(baseTokens) {
	const animation = baseTokens.animation || {};

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Animation" />

# Animation Tokens

Visual reference for all animation tokens in the SynergyOS design system.

---

## Duration Reference

| Token | Value | Usage |
|-------|-------|-------|
`;

	// Duration tokens
	const durations = animation.duration || {};
	for (const [name, token] of Object.entries(durations)) {
		if (name.startsWith('$')) continue;
		if (!token.$value) continue;
		const desc = token.$description || '';
		mdx += `| \`--animation-duration-${name}\` | ${token.$value} | ${desc} |\n`;
	}

	mdx += `
---

## Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
`;

	// Easing tokens
	const easings = animation.easing || {};
	for (const [name, token] of Object.entries(easings)) {
		if (name.startsWith('$')) continue;
		if (!token.$value) continue;
		const desc = token.$description || '';
		mdx += `| \`--animation-easing-${name}\` | \`${token.$value}\` | ${desc} |\n`;
	}

	mdx += `
---

## Usage

\`\`\`css
/* Transition shorthand */
.button {
  transition: all var(--animation-duration-normal) var(--animation-easing-inOut);
}

/* Hover animation */
.card:hover {
  transform: translateY(-2px);
  transition: transform var(--animation-duration-fast) var(--animation-easing-out);
}

/* Modal entrance */
.modal {
  animation: fadeIn var(--animation-duration-slow) var(--animation-easing-out);
}
\`\`\`

---

**Source**: \`design-tokens-base.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate Overview.mdx
 */
function generateOverviewMdx(baseTokens, semanticTokens) {
	// Count tokens
	const baseFlat = flattenTokens(baseTokens);
	const semanticFlat = semanticTokens ? flattenTokens(semanticTokens) : {};
	const baseCount = Object.keys(baseFlat).length;
	const semanticCount = Object.keys(semanticFlat).length;
	const totalCount = baseCount + semanticCount;

	const categories = Object.keys(baseTokens).filter((k) => !k.startsWith('$'));

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Design System/Tokens/Overview" />

# Design Tokens

Visual reference for all design tokens in SynergyOS.

**Token System**: ${totalCount} design tokens (${baseCount} base tokens, ${semanticCount} semantic tokens) across ${categories.length} categories.

---

## 🔄 Token Cascade

Understanding how tokens flow from base → semantic → utility:

### Three-Layer Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  BASE TOKENS (Foundation)                                   │
│  Hardcoded values: oklch(...), 0.5rem, 1rem                │
│  Example: color.brand.primary = "oklch(55% 0.15 195)"      │
└──────────────────────┬──────────────────────────────────────┘
                       │ References
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  SEMANTIC TOKENS (Component-specific)                       │
│  Reference base tokens: {color.brand.primary}              │
│  Example: color.interactive.primary = "{color.brand...}"   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Generates
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  UTILITY CLASSES (CSS classes)                              │
│  Generated from semantic tokens                             │
│  Example: bg-accent-primary → var(--color-interactive...)  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Cascade Benefits

**Change once, update everywhere:**

1. Update base token: \`color.brand.primary = "oklch(60% 0.18 250)"\` (blue)
2. All semantic tokens update automatically
3. All components using semantic tokens update
4. **No component code changes needed** ✅

---

## 📚 Token Categories

| Category | Base Tokens | Description |
|----------|-------------|-------------|
| **[Colors](./Colors)** | ${Object.keys(flattenTokens(baseTokens.color || {})).length} | Brand, neutral, status, accent colors |
| **[Typography](./Typography)** | ${Object.keys(flattenTokens(baseTokens.typography || {})).length} | Font families, sizes, weights, line heights |
| **[Spacing](./Spacing)** | ${Object.keys(flattenTokens(baseTokens.spacing || {})).length} | Margin, padding, gap values |
| **[Shadows](./Shadows)** | ${Object.keys(flattenTokens(baseTokens.shadow || {})).length} | Elevation and depth |
| **[Border Radius](./BorderRadius)** | ${Object.keys(flattenTokens(baseTokens.borderRadius || {})).length} | Corner rounding |
| **[Animation](./Animation)** | ${Object.keys(flattenTokens(baseTokens.animation || {})).length} | Duration and easing |

---

## 🎯 Usage Rules

**ALWAYS use tokens, NEVER hardcoded values:**

❌ **WRONG**: \`class="px-4 py-2 bg-blue-600"\`  
✅ **CORRECT**: \`class="px-button-x py-button-y bg-accent-primary"\`

**Why?** Tokens cascade automatically. Change once, updates everywhere.

### Automated Enforcement

- ✅ **ESLint Rule**: Blocks arbitrary values like \`min-h-[2.75rem]\`, \`p-[12px]\`
- ✅ **Pre-commit Hook**: Prevents committing hardcoded Tailwind values
- ✅ **CI Validation**: GitHub Actions runs \`npm run lint\` - PRs blocked if violations detected

---

## 📖 Documentation

- **Design Principles**: \`dev-docs/master-docs/design-system.md\`
- **Complete Token Reference**: See [Token Reference](../TokenReference)

---

**Source**: \`design-tokens-base.json\`, \`design-tokens-semantic.json\`  
**Last Generated**: ${new Date().toISOString()}
`;

	return mdx;
}

/**
 * Generate TokenReference.mdx (comprehensive reference table)
 */
function generateTokenReferenceMdx(baseTokens, semanticTokens) {
	const now = new Date().toISOString();
	const baseFlat = flattenTokens(baseTokens);
	const semanticFlat = semanticTokens ? flattenTokens(semanticTokens) : {};
	const totalCount = Object.keys(baseFlat).length + Object.keys(semanticFlat).length;

	let mdx = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Docs/Token Reference" />

# Token Reference

Complete reference for all design tokens in the SynergyOS design system.

**Last Generated**: ${now}  
**Total Tokens**: ${totalCount}  
**Sources**: \`design-tokens-base.json\`, \`design-tokens-semantic.json\`

---

## Quick Links

- [Colors](#-colors)
- [Typography](#-typography)
- [Spacing](#-spacing)
- [Shadows](#-shadows)
- [Border Radius](#-border-radius)
- [Z-Index](#-z-index)
- [Breakpoints](#-breakpoints)
- [Opacity](#-opacity)

---

## 🎨 Colors

### Brand Colors

| Token | Value | Description |
|-------|-------|-------------|
`;

	// Brand colors
	const brandColors = flattenTokens(baseTokens.color?.brand || {});
	for (const [path, token] of Object.entries(brandColors)) {
		mdx += `| \`--color-brand-${path}\` | \`${token.value}\` | ${token.description} |\n`;
	}

	mdx += `
### Neutral Colors

| Token | Value | Description |
|-------|-------|-------------|
`;

	// Neutral colors
	const neutralColors = flattenTokens(baseTokens.color?.neutral || {});
	for (const [path, token] of Object.entries(neutralColors)) {
		mdx += `| \`--color-neutral-${path}\` | \`${token.value}\` | ${token.description} |\n`;
	}

	mdx += `
### Status Colors

| Token | Value | Description |
|-------|-------|-------------|
`;

	// Status colors
	const statusColors = flattenTokens(baseTokens.color?.status || {});
	for (const [path, token] of Object.entries(statusColors)) {
		mdx += `| \`--color-status-${path}\` | \`${token.value}\` | ${token.description} |\n`;
	}

	mdx += `
### Accent Colors

| Token | Value | Description |
|-------|-------|-------------|
`;

	// Accent colors
	const accentColors = flattenTokens(baseTokens.color?.accent || {});
	for (const [path, token] of Object.entries(accentColors)) {
		mdx += `| \`--color-accent-${path}\` | \`${token.value}\` | ${token.description} |\n`;
	}

	mdx += `
---

## 📝 Typography

### Font Families

| Token | Value | Description |
|-------|-------|-------------|
`;

	const fontFamilies = flattenTokens(baseTokens.typography?.fontFamily || {});
	for (const [path, token] of Object.entries(fontFamilies)) {
		mdx += `| \`--typography-fontFamily-${path}\` | \`${token.value}\` | ${token.description} |\n`;
	}

	mdx += `
### Font Sizes

| Token | Value | Pixels | Description |
|-------|-------|--------|-------------|
`;

	const fontSizes = flattenTokens(baseTokens.typography?.fontSize || {});
	for (const [path, token] of Object.entries(fontSizes)) {
		const px = remToPx(token.value);
		mdx += `| \`--typography-fontSize-${path}\` | ${token.value} | ${px} | ${token.description} |\n`;
	}

	mdx += `
### Font Weights

| Token | Value | Description |
|-------|-------|-------------|
`;

	const fontWeights = flattenTokens(baseTokens.typography?.fontWeight || {});
	for (const [path, token] of Object.entries(fontWeights)) {
		mdx += `| \`--typography-fontWeight-${path}\` | ${token.value} | ${token.description} |\n`;
	}

	mdx += `
---

## 📏 Spacing

| Token | Value | Pixels | Description |
|-------|-------|--------|-------------|
`;

	const spacing = flattenTokens(baseTokens.spacing || {});
	for (const [path, token] of Object.entries(spacing)) {
		const px = remToPx(token.value) || token.value;
		mdx += `| \`--spacing-${path}\` | ${token.value} | ${px} | ${token.description} |\n`;
	}

	mdx += `
---

## 🌑 Shadows

| Token | Value | Description |
|-------|-------|-------------|
`;

	const shadows = flattenTokens(baseTokens.shadow || {});
	for (const [path, token] of Object.entries(shadows)) {
		const escapedValue = String(token.value).replace(/\|/g, '\\|');
		mdx += `| \`--shadow-${path}\` | \`${escapedValue}\` | ${token.description} |\n`;
	}

	mdx += `
---

## 📐 Border Radius

| Token | Value | Description |
|-------|-------|-------------|
`;

	const radii = flattenTokens(baseTokens.borderRadius || {});
	for (const [path, token] of Object.entries(radii)) {
		mdx += `| \`--borderRadius-${path}\` | ${token.value} | ${token.description} |\n`;
	}

	mdx += `
---

## 📚 Z-Index

| Token | Value | Description |
|-------|-------|-------------|
`;

	const zIndex = flattenTokens(baseTokens.zIndex || {});
	for (const [path, token] of Object.entries(zIndex)) {
		mdx += `| \`--zIndex-${path}\` | ${token.value} | ${token.description} |\n`;
	}

	mdx += `
---

## 📱 Breakpoints

| Token | Value | Description |
|-------|-------|-------------|
`;

	const breakpoints = flattenTokens(baseTokens.breakpoints || {});
	for (const [path, token] of Object.entries(breakpoints)) {
		mdx += `| \`--breakpoint-${path}\` | ${token.value} | ${token.description} |\n`;
	}

	mdx += `
---

## 👻 Opacity

| Token | Value | Description |
|-------|-------|-------------|
`;

	const opacity = flattenTokens(baseTokens.opacity || {});
	for (const [path, token] of Object.entries(opacity)) {
		mdx += `| \`--opacity-${path}\` | ${token.value} | ${token.description} |\n`;
	}

	mdx += `

---

**Last Updated**: ${now}

*This file is auto-generated. To modify tokens, edit \`design-tokens-base.json\` and run: \`npm run tokens:storybook\`*
`;

	return mdx;
}

/**
 * Main function
 */
function main() {
	console.log('🎨 Generating Storybook Token Documentation\n');
	console.log('='.repeat(50));

	// Load token files
	console.log('\n📖 Loading token files...');
	const baseTokens = loadJSON(BASE_TOKENS_PATH);
	const semanticTokens = loadJSON(SEMANTIC_TOKENS_PATH);

	if (!baseTokens) {
		console.error('❌ Failed to load base tokens');
		process.exit(1);
	}
	console.log('   ✅ Base tokens loaded');
	console.log(
		`   ${semanticTokens ? '✅' : '⚠️ '} Semantic tokens ${semanticTokens ? 'loaded' : 'not found (optional)'}`
	);

	// Generate MDX files
	console.log('\n📝 Generating MDX documentation...\n');

	const files = [
		{ name: 'Colors.mdx', content: generateColorsMdx(baseTokens, semanticTokens) },
		{ name: 'Typography.mdx', content: generateTypographyMdx(baseTokens) },
		{ name: 'Spacing.mdx', content: generateSpacingMdx(baseTokens, semanticTokens) },
		{ name: 'Shadows.mdx', content: generateShadowsMdx(baseTokens, semanticTokens) },
		{ name: 'BorderRadius.mdx', content: generateBorderRadiusMdx(baseTokens, semanticTokens) },
		{ name: 'Animation.mdx', content: generateAnimationMdx(baseTokens) },
		{ name: 'Overview.mdx', content: generateOverviewMdx(baseTokens, semanticTokens) }
	];

	for (const file of files) {
		const filepath = path.join(OUTPUT_DIR, file.name);
		fs.writeFileSync(filepath, file.content, 'utf-8');
		console.log(`   ✅ ${file.name}`);
	}

	// Generate TokenReference.mdx in stories root
	const tokenRefContent = generateTokenReferenceMdx(baseTokens, semanticTokens);
	fs.writeFileSync(TOKEN_REF_PATH, tokenRefContent, 'utf-8');
	console.log('   ✅ TokenReference.mdx');

	// Summary
	const baseFlat = flattenTokens(baseTokens);
	const semanticFlat = semanticTokens ? flattenTokens(semanticTokens) : {};

	console.log('\n' + '='.repeat(50));
	console.log('🎉 Documentation generation complete!\n');
	console.log('📊 Summary:');
	console.log(`   - Base tokens: ${Object.keys(baseFlat).length}`);
	console.log(`   - Semantic tokens: ${Object.keys(semanticFlat).length}`);
	console.log(
		`   - Total tokens: ${Object.keys(baseFlat).length + Object.keys(semanticFlat).length}`
	);
	console.log(`   - Files generated: ${files.length + 1}`);
	console.log('\n📁 Output:');
	console.log(`   - ${OUTPUT_DIR}/`);
	for (const file of files) {
		console.log(`     └── ${file.name}`);
	}
	console.log(`   - ${TOKEN_REF_PATH}`);
	console.log('\n💡 Next steps:');
	console.log('   1. Run Storybook: npm run storybook');
	console.log('   2. Navigate to "Design System / Tokens" in sidebar');
}

// Run
try {
	main();
} catch (error) {
	console.error('\n❌ Error:', error.message);
	console.error(error.stack);
	process.exit(1);
}
