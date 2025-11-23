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

	// Get token value (handle var() references, arrays, DTCG references, etc.)
	// Check original $value first to detect DTCG references before Style Dictionary resolves them
	const originalValue = token.original?.$value;
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
		typeof originalValue === 'string' &&
		originalValue.startsWith('{') &&
		originalValue.endsWith('}')
	) {
		// Handle DTCG reference syntax: {fonts.sans} → var(--fonts-sans)
		// Style Dictionary may have resolved the reference, but we want to keep it as var() for cascade
		const refPath = originalValue.slice(1, -1); // Remove { }
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
		if (spacingName.includes('-x')) {
			utilityName = `px-${spacingName.replace('-x', '')}`;
			cssProperty = 'padding-inline';
		} else if (spacingName.includes('-y')) {
			utilityName = `py-${spacingName.replace('-y', '')}`;
			cssProperty = 'padding-block';
		} else if (spacingName.includes('gap')) {
			utilityName = `gap-${spacingName.replace('-gap', '')}`;
			cssProperty = 'gap';
		} else if (
			spacingName.includes('margin') ||
			spacingName.startsWith('mt-') ||
			spacingName.startsWith('mb-')
		) {
			utilityName = spacingName.replace('spacing-', '');
			cssProperty = 'margin-top'; // Default, can be refined
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

		if (colorName.includes('text')) {
			utilityName = `text-${colorName.replace('-text', '')}`;
			cssProperty = 'color';
		} else if (colorName.includes('bg')) {
			utilityName = `bg-${colorName.replace('-bg', '')}`;
			cssProperty = 'background-color';
		} else if (colorName.includes('border')) {
			utilityName = `border-${colorName.replace('-border', '')}`;
			cssProperty = 'border-color';
		} else {
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

		if (typoName.includes('size')) {
			utilityName = `text-${typoName.replace('-size', '')}`;
			cssProperty = 'font-size';
		} else if (typoName.includes('weight')) {
			utilityName = `font-${typoName.replace('-weight', '')}`;
			cssProperty = 'font-weight';
		} else {
			utilityName = typoName;
			cssProperty = 'font-size';
		}
	}
	// Border radius utilities
	else if (path.startsWith('border-radius-')) {
		const radiusName = path.replace('border-radius-', '');
		utilityName = `rounded-${radiusName}`;
		cssProperty = 'border-radius';
	}
	// Shadow utilities
	else if (path.startsWith('shadow-')) {
		const shadowName = path.replace('shadow-', '');
		utilityName = `shadow-${shadowName}`;
		cssProperty = 'box-shadow';
	}
	// Size utilities - generate width utilities (w- prefix)
	// For size tokens, generate both width and height utilities
	// Note: This function returns one utility per call, so we generate width utilities
	// Height utilities can be generated separately if needed
	else if (path.startsWith('size-')) {
		const sizeName = path.replace('size-', '');
		utilityName = `w-${sizeName}`;
		cssProperty = 'width';
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

export { transformTailwindTheme, transformTailwindUtility, transformValidateSemanticReference };
