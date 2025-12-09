/**
 * Style Dictionary Custom Transforms
 *
 * Transforms DTCG format tokens into Tailwind CSS 4 compatible output:
 * - @theme { } blocks for CSS custom properties
 * - @utility { } blocks for utility classes
 * - Semantic reference validation
 *
 * Usage: Registered in style-dictionary.config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Transform: tailwind/theme
 *
 * Outputs CSS custom properties in @theme { } block format.
 * Handles nested token paths (e.g., spacing.chart.container → --spacing-chart-container)
 *
 * Style Dictionary token structure:
 * - token.name: "spacing.chart.container"
 * - token.path: ["spacing", "chart", "container"]
 * - token.value: "1.5rem"
 * - token.original: { value: "...", description: "..." }
 */
function transformTailwindTheme(token) {
	// Convert token path to CSS custom property name
	// Example: spacing.chart.container → --spacing-chart-container
	const pathParts = token.path || token.name.split('.');
	// Special handling for breakpoints: remove 's' from "breakpoints" → "breakpoint"
	// breakpoints.sm → --breakpoint-sm (not --breakpoints-sm)
	if (pathParts[0] === 'breakpoints') {
		pathParts[0] = 'breakpoint';
	}
	const path = pathParts.join('-');
	const name = `--${path}`;

	// Check if this is a conditional token (has light/dark structure)
	const tokenValue = token.value;
	if (
		tokenValue &&
		typeof tokenValue === 'object' &&
		!Array.isArray(tokenValue) &&
		('light' in tokenValue || 'dark' in tokenValue)
	) {
		// This is a conditional token - handle separately
		return transformConditionalToken(token, name, pathParts);
	}

	// Get token value (handle var() references, arrays, DTCG references, etc.)
	// Check dtcgRef first to detect DTCG references before Style Dictionary resolves them
	// Note: prepare-tokens.js stores DTCG references in 'dtcgRef' property (not $value)
	const dtcgRef = token.original?.dtcgRef || token.dtcgRef;
	const tokenPath = pathParts.join('.');
	let value = token.value;

	// Handle semantic font tokens that should reference base fonts
	// fonts.heading → var(--fonts-sans), fonts.body → var(--fonts-sans), fonts.code → var(--fonts-mono)
	if (tokenPath === 'fonts.heading' || tokenPath === 'fonts.body') {
		value = 'var(--fonts-sans)';
	} else if (tokenPath === 'fonts.code') {
		value = 'var(--fonts-mono)';
	}
	// Handle opacity semantic tokens that should reference base opacity
	// opacity.disabled → var(--opacity-50), opacity.hover → var(--opacity-80), etc.
	else if (tokenPath === 'opacity.disabled') {
		value = 'var(--opacity-50)';
	} else if (tokenPath === 'opacity.hover') {
		value = 'var(--opacity-80)';
	} else if (tokenPath === 'opacity.backdrop') {
		value = 'var(--opacity-75)';
	} else if (tokenPath === 'opacity.loading') {
		value = 'var(--opacity-60)';
	} else if (
		dtcgRef &&
		typeof dtcgRef === 'string' &&
		dtcgRef.startsWith('{') &&
		dtcgRef.endsWith('}')
	) {
		// Handle DTCG reference syntax: {color.brand.primary} → var(--color-brand-primary)
		// This preserves the CSS variable cascade (changing brand.primary updates all references)
		const refPath = dtcgRef.slice(1, -1); // Remove { }
		const refParts = refPath.split('.');
		const refName = refParts.join('-');
		value = `var(--${refName})`;
	} else if (typeof value === 'string' && (value.startsWith('var(') || value.startsWith('oklch'))) {
		// Keep var() references and oklch colors as-is
		// value is already correct, no change needed
	} else if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
		// Handle DTCG reference syntax: {fonts.sans} → var(--fonts-sans)
		const refPath = value.slice(1, -1); // Remove { }
		const refParts = refPath.split('.');
		const refName = refParts.join('-');
		value = `var(--${refName})`;
	} else if (Array.isArray(value)) {
		// Handle font family arrays: ["Inter", "sans-serif"] → "Inter, sans-serif"
		value = value.join(', ');
	} else {
		// Ensure value is a string
		value = String(value);
	}

	// Get description if available
	const description =
		token.description ||
		(token.original && token.original.description) ||
		(token.original && token.original.$description) ||
		'';
	const comment = description ? ` /* ${description} */` : '';

	return `\t${name}: ${value};${comment}`;
}

/**
 * Transform: tailwind/utility
 *
 * Outputs utility classes in @utility { } block format.
 * Generates utilities based on token type and path patterns.
 */
function transformTailwindUtility(token) {
	const pathParts = token.path || token.name.split('.');
	const path = pathParts.join('-');
	const _name = path.replace(/^spacing-/, ''); // Remove spacing- prefix for utilities

	// Determine utility class name and CSS property based on token path
	let utilityName = '';
	let cssProperty = '';
	const cssValue = `var(--${path})`;

	// Spacing utilities
	if (path.startsWith('spacing-')) {
		const spacingName = path.replace('spacing-', '');

		// Skip base spacing tokens (0, 1, 2, etc.) - they're base scale, not utilities
		// Only generate utilities for semantic spacing tokens
		if (/^\d+$/.test(spacingName)) {
			// Base spacing token (e.g., spacing-0, spacing-1) - skip utility generation
			return null;
		}

		// Pattern matching for utility generation
		// Use regex to match -x or -y only when followed by end or dash (not xs, xl, etc.)
		if (/-x(?=$|-)/.test(spacingName)) {
			utilityName = `px-${spacingName.replace(/-x(?=$|-)/, '')}`;
			cssProperty = 'padding-inline';
		} else if (/-y(?=$|-)/.test(spacingName)) {
			utilityName = `py-${spacingName.replace(/-y(?=$|-)/, '')}`;
			cssProperty = 'padding-block';
		} else if (/-pr(?=$|-)/.test(spacingName)) {
			utilityName = `pr-${spacingName.replace(/-pr(?=$|-)/, '')}`;
			cssProperty = 'padding-right';
		} else if (spacingName.includes('iconRight')) {
			// Special case: input-iconRight → pr-input-iconRight
			utilityName = `pr-${spacingName}`;
			cssProperty = 'padding-right';
		} else if (spacingName.includes('sectionGap')) {
			// sectionGap tokens: form-sectionGap → gap-form-sectionGap, content-sectionGap → gap-content-sectionGap
			utilityName = `gap-${spacingName}`;
			cssProperty = 'gap';
		} else if (spacingName.includes('gap')) {
			utilityName = `gap-${spacingName.replace('-gap', '')}`;
			cssProperty = 'gap';
		} else if (spacingName.includes('-mb') || spacingName.endsWith('-mb')) {
			// Margin-bottom utility: header-mb → mb-header
			utilityName = `mb-${spacingName.replace('-mb', '')}`;
			cssProperty = 'margin-block-end';
		} else if (spacingName.includes('-mt') || spacingName.endsWith('-mt')) {
			// Margin-top utility: fieldGroup-mt → mt-fieldGroup
			utilityName = `mt-${spacingName.replace('-mt', '')}`;
			cssProperty = 'margin-block-start';
		} else if (spacingName.includes('-my') || spacingName.endsWith('-my')) {
			// Margin-block utility (top + bottom): stack-divider-my → my-stack-divider
			utilityName = `my-${spacingName.replace('-my', '')}`;
			cssProperty = 'margin-block';
		} else if (spacingName.startsWith('icon-')) {
			// Icon size utility: icon-sm, icon-md, icon-lg → size-icon-sm
			utilityName = `size-${spacingName}`;
			cssProperty = 'width'; // Will need height too - handled below
		} else {
			// Generic spacing utility - ensure valid name (starts with letter)
			// Prefix with 'p-' if it starts with a number or special character
			if (/^[0-9]/.test(spacingName)) {
				utilityName = `p-${spacingName}`;
			} else {
				utilityName = spacingName;
			}
			cssProperty = 'padding';
		}
	}
	// Color utilities
	else if (path.startsWith('color-')) {
		const colorName = path.replace('color-', '');

		// Semantic color tokens: text-*, bg-*, border-*, interactive-*
		// The prefix (text, bg, border) already indicates the CSS property
		// e.g., color.text.primary → --color-text-primary → utility: text-primary
		if (colorName.startsWith('text-')) {
			// text-primary, text-secondary, etc.
			utilityName = colorName; // Already has 'text-' prefix
			cssProperty = 'color';
		} else if (colorName.startsWith('bg-')) {
			// bg-base, bg-surface, bg-elevated, etc.
			utilityName = colorName; // Already has 'bg-' prefix
			cssProperty = 'background-color';
		} else if (colorName.startsWith('border-')) {
			// border-base, border-subtle, etc.
			utilityName = colorName; // Already has 'border-' prefix
			cssProperty = 'border-color';
		} else if (colorName.startsWith('interactive-')) {
			// interactive-primary, interactive-hover, etc.
			// Generate both bg- and text- utilities for interactive colors
			utilityName = `bg-${colorName}`;
			cssProperty = 'background-color';
		} else if (colorName.startsWith('accent-')) {
			// accent-coral, accent-purple, etc. - decorative colors
			// Generate bg- utility for accent colors
			utilityName = `bg-${colorName}`;
			cssProperty = 'background-color';
		} else if (colorName.startsWith('brand-')) {
			// brand-primary, brand-secondary - brand colors
			// Generate bg- utility for brand colors
			utilityName = `bg-${colorName}`;
			cssProperty = 'background-color';
		} else if (colorName.startsWith('status-')) {
			// status-error, status-success, etc.
			// Generate bg- utility for status colors
			utilityName = `bg-${colorName}`;
			cssProperty = 'background-color';
		} else if (colorName.startsWith('neutral-')) {
			// neutral-0, neutral-50, etc. - base scale (skip utility generation)
			return null;
		} else if (colorName.startsWith('syntax-')) {
			// syntax-keyword, syntax-string, etc. - code highlighting (skip utility generation)
			return null;
		} else {
			// Fallback: use colorName as utility, assume it's a text color
			utilityName = colorName;
			cssProperty = 'color';
		}
	}
	// Font family utilities
	else if (path.startsWith('fonts-')) {
		const fontName = path.replace('fonts-', '');
		// Generate semantic font utilities: font-heading, font-body, font-code
		utilityName = `font-${fontName}`;
		cssProperty = 'font-family';
	}
	// Typography utilities
	else if (path.startsWith('typography-') || path.startsWith('font-')) {
		const typoName = path.replace(/^(typography-|font-)/, '');

		// Map typography token types to correct CSS properties
		if (typoName.startsWith('fontFamily-') || typoName.includes('-fontFamily')) {
			utilityName = typoName.replace('-fontFamily', '').replace('fontFamily-', 'font-');
			// Ensure utility name starts with 'font-' for font family
			if (!utilityName.startsWith('font-')) {
				utilityName = `font-${utilityName}`;
			}
			cssProperty = 'font-family';
		} else if (typoName.startsWith('fontSize-') || typoName.includes('-fontSize')) {
			utilityName = typoName.replace('-fontSize', '').replace('fontSize-', 'text-');
			// Ensure utility name starts with 'text-' for font size
			if (!utilityName.startsWith('text-')) {
				utilityName = `text-${utilityName}`;
			}
			cssProperty = 'font-size';
		} else if (typoName.startsWith('fontWeight-') || typoName.includes('-fontWeight')) {
			utilityName = typoName.replace('-fontWeight', '').replace('fontWeight-', 'font-');
			// Ensure utility name starts with 'font-' for font weight
			if (!utilityName.startsWith('font-')) {
				utilityName = `font-${utilityName}`;
			}
			cssProperty = 'font-weight';
		} else if (typoName.startsWith('lineHeight-') || typoName.includes('-lineHeight')) {
			utilityName = typoName.replace('-lineHeight', '').replace('lineHeight-', 'leading-');
			// Ensure utility name starts with 'leading-' for line height
			if (!utilityName.startsWith('leading-')) {
				utilityName = `leading-${utilityName}`;
			}
			cssProperty = 'line-height';
		} else if (typoName.startsWith('letterSpacing-') || typoName.includes('-letterSpacing')) {
			utilityName = typoName.replace('-letterSpacing', '').replace('letterSpacing-', 'tracking-');
			// Ensure utility name starts with 'tracking-' for letter spacing
			if (!utilityName.startsWith('tracking-')) {
				utilityName = `tracking-${utilityName}`;
			}
			cssProperty = 'letter-spacing';
		} else {
			// Fallback: treat as font-size for backwards compatibility
			utilityName = typoName;
			cssProperty = 'font-size';
		}
	}
	// Border radius utilities
	else if (path.startsWith('border-radius-') || path.startsWith('borderRadius-')) {
		const radiusName = path.replace(/^border-radius?-/, '').replace(/^borderRadius-/, '');
		utilityName = `rounded-${radiusName}`;
		cssProperty = 'border-radius';
	}
	// Shadow utilities
	else if (path.startsWith('shadow-')) {
		const shadowName = path.replace('shadow-', '');
		utilityName = `shadow-${shadowName}`;
		cssProperty = 'box-shadow';
	}
	// Size utilities - generate width/height/max-width/max-height utilities
	// For size tokens, generate appropriate utilities based on token name pattern
	else if (path.startsWith('size-') || path.startsWith('sizing-')) {
		const sizeName = path.replace(/^(size|sizing)-/, '');

		// Handle semantic sizing tokens: sizing-dateInput-width → w-dateInput
		if (sizeName.includes('-width')) {
			const componentName = sizeName.replace('-width', '');
			utilityName = `w-${componentName}`;
			cssProperty = 'width';
		}
		// Generate max-width utilities for tokens starting with maxWidth
		else if (sizeName.startsWith('maxWidth')) {
			const maxWidthName = sizeName.replace('maxWidth', '');
			utilityName = `max-w-${maxWidthName.charAt(0).toLowerCase() + maxWidthName.slice(1)}`;
			cssProperty = 'max-width';
		}
		// Generate max-height utilities for tokens starting with maxHeight
		else if (sizeName.startsWith('maxHeight')) {
			const maxHeightName = sizeName.replace('maxHeight', '');
			utilityName = `max-h-${maxHeightName.charAt(0).toLowerCase() + maxHeightName.slice(1)}`;
			cssProperty = 'max-height';
		}
		// Generate min-width utilities for tokens starting with minWidth
		else if (sizeName.startsWith('minWidth')) {
			const minWidthName = sizeName.replace('minWidth', '');
			utilityName = `min-w-${minWidthName.charAt(0).toLowerCase() + minWidthName.slice(1)}`;
			cssProperty = 'min-width';
		}
		// Generate width utilities for all other size tokens
		else {
			utilityName = `w-${sizeName}`;
			cssProperty = 'width';
		}
	}
	// Opacity utilities
	else if (path.startsWith('opacity-')) {
		const opacityName = path.replace('opacity-', '');

		// Skip base opacity tokens (0, 5, 10, etc.) - they're base scale, not utilities
		// Only generate utilities for semantic opacity tokens
		if (/^\d+$/.test(opacityName)) {
			// Base opacity token (e.g., opacity-0, opacity-50) - skip utility generation
			return null;
		}

		// Generate semantic opacity utilities: opacity-disabled, opacity-hover, etc.
		utilityName = path; // Keep full 'opacity-disabled' (not just 'disabled')
		cssProperty = 'opacity';
	}

	// Skip if we couldn't determine utility
	if (!utilityName || !cssProperty) {
		return null;
	}

	// Special handling for icon sizes - need both width and height
	if (utilityName.startsWith('size-icon-')) {
		return `@utility ${utilityName} {\n\twidth: ${cssValue};\n\theight: ${cssValue};\n}`;
	}

	return `@utility ${utilityName} {\n\t${cssProperty}: ${cssValue};\n}`;
}

/**
 * Transform: validate/semantic-reference
 *
 * Validates that semantic tokens reference base tokens using var() syntax.
 * Throws error if semantic token has direct value instead of var() reference.
 */
function transformValidateSemanticReference(token) {
	const pathParts = token.path || token.name.split('.');

	// Only validate semantic tokens (not base tokens)
	const _isBaseToken = pathParts.length === 2; // e.g., spacing.0, color.primary
	const isSemanticToken = pathParts.length > 2; // e.g., spacing.chart.container

	if (!isSemanticToken) {
		return null; // Skip base tokens
	}

	const value = token.value;
	const valueStr = String(value);

	// Check if value is a var() reference
	const isVarReference = valueStr.startsWith('var(');

	// Allow exceptions for:
	// 1. Base tokens (already validated)
	// 2. Direct oklch colors (design decision)
	// 3. Direct dimension values that are intentional exceptions
	const isOklchColor = valueStr.startsWith('oklch');
	const isDirectDimension = /^\d+(\.\d+)?(rem|px|em|%)$/.test(valueStr);

	// Check description for intentional exceptions
	const description =
		token.description ||
		(token.original && token.original.description) ||
		(token.original && token.original.$description) ||
		'';
	const isIntentionalException = description.includes('INTENTIONAL EXCEPTION');

	if (!isVarReference && !isOklchColor && !isIntentionalException && isDirectDimension) {
		// This is a semantic token with direct value - should reference base token
		const tokenPath = pathParts.join('.');
		throw new Error(
			`Semantic token "${tokenPath}" has direct value "${value}" but should reference base token using var(--base-token) syntax. ` +
				`If this is intentional, add "INTENTIONAL EXCEPTION" to the description.`
		);
	}

	return null; // Validation transform doesn't output anything
}

/**
 * Transform conditional token (light/dark mode)
 *
 * Generates CSS with:
 * 1. Default value (light mode)
 * 2. @media (prefers-color-scheme: dark) block
 * 3. .light class override
 * 4. .dark class override
 *
 * Returns an object with isConditional flag so format function can handle it separately
 */
function transformConditionalToken(token, cssVarName, pathParts) {
	const tokenValue = token.value;
	const lightValue = tokenValue.light;
	const darkValue = tokenValue.dark;

	if (!lightValue || !darkValue) {
		throw new Error(
			`Conditional token "${token.name}" is missing light or dark value. Both required.`
		);
	}

	// Check for preserved DTCG references (dtcgRefConditional property added by prepare-tokens.js)
	// Style Dictionary resolves {color.brand.primary} to actual color values before transforms run,
	// so we need to check the preserved DTCG reference structure to generate var() references
	// Since Style Dictionary doesn't preserve custom properties, we read tokens.json directly
	let resolvedLight, resolvedDark;

	// Read original tokens.json to get dtcgRefConditional property
	// This is a workaround because Style Dictionary doesn't preserve custom properties
	let dtcgRefConditional = null;
	try {
		const tokensPath = path.join(__dirname, '../../tokens.json');

		if (fs.existsSync(tokensPath)) {
			const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
			// Navigate to token using pathParts
			let current = tokensData;
			for (const part of pathParts) {
				if (current && current[part]) {
					current = current[part];
				} else {
					current = null;
					break;
				}
			}
			if (current && current.dtcgRefConditional) {
				dtcgRefConditional = current.dtcgRefConditional;
			}
		}
	} catch {
		// If reading fails, fall back to resolved values
		// Silent fail - not critical if we can't read the file
	}

	if (dtcgRefConditional && dtcgRefConditional.light && dtcgRefConditional.dark) {
		// Check if preserved values are DTCG references (e.g., {color.brand.primary})
		const originalLight = dtcgRefConditional.light;
		const originalDark = dtcgRefConditional.dark;

		if (
			typeof originalLight === 'string' &&
			originalLight.startsWith('{') &&
			originalLight.endsWith('}') &&
			typeof originalDark === 'string' &&
			originalDark.startsWith('{') &&
			originalDark.endsWith('}')
		) {
			// Convert DTCG reference to CSS var() reference
			// {color.brand.primary} → var(--color-brand-primary)
			const lightRefPath = originalLight.slice(1, -1); // Remove { }
			const lightRefParts = lightRefPath.split('.');
			const lightRefName = lightRefParts.join('-');
			resolvedLight = `var(--${lightRefName})`;

			const darkRefPath = originalDark.slice(1, -1); // Remove { }
			const darkRefParts = darkRefPath.split('.');
			const darkRefName = darkRefParts.join('-');
			resolvedDark = `var(--${darkRefName})`;
		} else {
			// Not DTCG references, use resolved values
			resolvedLight = resolveConditionalValue(lightValue, pathParts);
			resolvedDark = resolveConditionalValue(darkValue, pathParts);
		}
	} else {
		// No preserved DTCG references, use resolved values
		resolvedLight = resolveConditionalValue(lightValue, pathParts);
		resolvedDark = resolveConditionalValue(darkValue, pathParts);
	}

	// Get description
	const description =
		token.description ||
		(token.original && token.original.description) ||
		(token.original && token.original.$description) ||
		'';
	const comment = description ? ` /* ${description} */` : '';

	// Generate CSS for conditional token
	// Format: Return object so format function can handle it separately
	return {
		isConditional: true,
		cssVarName,
		lightValue: resolvedLight,
		darkValue: resolvedDark,
		comment,
		// Generate CSS strings
		default: `\t${cssVarName}: ${resolvedLight};${comment}`,
		mediaQuery: `@media (prefers-color-scheme: dark) {\n\t:root {\n\t\t${cssVarName}: ${resolvedDark};\n\t}\n}`,
		lightClass: `.light {\n\t${cssVarName}: ${resolvedLight};\n}`,
		darkClass: `.dark {\n\t${cssVarName}: ${resolvedDark};\n}`
	};
}

/**
 * Resolve conditional value (handles DTCG references like {color.palette.gray.900})
 *
 * @param {string|object} value - Raw value (may contain DTCG reference or be conditional object)
 * @param {string[]} pathParts - Token path parts for context
 * @returns {string} - Resolved CSS value (var() reference or direct value)
 */
function resolveConditionalValue(value, pathParts) {
	// If value is an object (conditional token reference resolved by Style Dictionary),
	// convert to CSS variable reference based on the token path
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		// This happens when a conditional token references another conditional token
		// Style Dictionary resolves {color.text.tertiary} to the actual conditional object
		// We need to convert it back to a CSS variable reference
		const cssVarName = pathParts.join('-');
		return `var(--${cssVarName})`;
	}

	if (typeof value !== 'string') {
		return String(value);
	}

	// Handle DTCG reference syntax: {color.palette.gray.900} → var(--color-palette-gray-900)
	if (value.startsWith('{') && value.endsWith('}')) {
		const refPath = value.slice(1, -1); // Remove { }
		const refParts = refPath.split('.');
		const refName = refParts.join('-');
		return `var(--${refName})`;
	}

	// Handle var() references - keep as-is
	if (value.startsWith('var(')) {
		return value;
	}

	// Handle oklch colors - keep as-is
	if (value.startsWith('oklch')) {
		return value;
	}

	// Direct value - return as-is
	return value;
}

export {
	transformTailwindTheme,
	transformTailwindUtility,
	transformValidateSemanticReference,
	transformConditionalToken
};
