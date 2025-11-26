/**
 * Vite Plugin: Ensure @media queries use breakpoint token values
 *
 * Reads breakpoint values from design-system.json and ensures all @media queries
 * use the correct token values. Since CSS doesn't support CSS variables in @media queries,
 * this plugin ensures hardcoded values match the token values at build time.
 *
 * If token values change, @media queries will automatically update to match.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function viteBreakpointReplace() {
	let breakpointMap = {};

	// Read breakpoint values from design-system.json
	try {
		const designSystemPath = join(__dirname, '../design-tokens-base.json');
		const designSystem = JSON.parse(readFileSync(designSystemPath, 'utf-8'));

		if (designSystem.breakpoints) {
			// Map old values to new token values
			// This ensures if tokens change, @media queries update automatically
			breakpointMap = {
				// Map common hardcoded values to token values
				640: designSystem.breakpoints.sm?.$value?.replace('px', '') || '640',
				768: designSystem.breakpoints.md?.$value?.replace('px', '') || '768',
				1024: designSystem.breakpoints.lg?.$value?.replace('px', '') || '1024',
				1280: designSystem.breakpoints.xl?.$value?.replace('px', '') || '1280',
				1536: designSystem.breakpoints['2xl']?.$value?.replace('px', '') || '1536'
			};
		}
	} catch (error) {
		console.warn('Failed to read breakpoint values from design-system.json:', error);
	}

	return {
		name: 'vite-breakpoint-replace',
		enforce: 'pre',
		transform(code, id) {
			// Only process CSS and Svelte files
			if (!id.match(/\.(css|svelte)$/)) {
				return null;
			}

			// Skip node_modules and generated files
			if (id.includes('node_modules') || id.includes('/styles/tokens/')) {
				return null;
			}

			let modified = false;
			let newCode = code;

			// Replace hardcoded breakpoint values in @media queries with token values
			// Pattern: @media (max-width: 768px) -> @media (max-width: [token-value]px)
			for (const [oldValue, newValue] of Object.entries(breakpointMap)) {
				if (oldValue === newValue) continue; // No change needed

				// Match @media queries with breakpoint values
				// Handles: max-width, min-width, max-height, min-height
				const regex = new RegExp(
					`(@media[^{]*\\((?:max-width|min-width|max-height|min-height)\\s*:\\s*)${oldValue}px`,
					'g'
				);

				newCode = newCode.replace(regex, (match) => {
					modified = true;
					return match.replace(`${oldValue}px`, `${newValue}px`);
				});
			}

			if (modified) {
				return {
					code: newCode,
					map: null
				};
			}

			return null;
		}
	};
}
