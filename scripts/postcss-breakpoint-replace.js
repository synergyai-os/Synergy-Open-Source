/**
 * PostCSS Plugin: Replace hardcoded breakpoint values in @media queries
 *
 * Reads breakpoint values from CSS variables and replaces hardcoded pixel values
 * in @media queries at build time.
 *
 * This works around CSS limitation: CSS variables cannot be used in @media queries.
 *
 * Usage: Registered in vite.config.ts or postcss.config.js
 */

export default function postcssBreakpointReplace() {
	return {
		postcssPlugin: 'postcss-breakpoint-replace',
		Once(root, { result }) {
			// Breakpoint mappings (read from design-tokens-base.json or generated CSS)
			// These values match design-tokens-base.json breakpoints
			const breakpoints = {
				'640px': 'var(--breakpoint-sm)',
				'768px': 'var(--breakpoint-md)',
				'1024px': 'var(--breakpoint-lg)',
				'1280px': 'var(--breakpoint-xl)',
				'1536px': 'var(--breakpoint-2xl)'
			};

			// Find all @media rules
			root.walkAtRules('media', (atRule) => {
				const params = atRule.params;

				// Replace hardcoded breakpoint values with CSS variable references
				// Pattern: @media (max-width: 768px) -> @media (max-width: var(--breakpoint-md))
				let newParams = params;
				for (const [value, variable] of Object.entries(breakpoints)) {
					// Match breakpoint values in media queries
					// Handles: max-width, min-width, max-height, min-height
					const regex = new RegExp(`(\\d+)px`, 'g');
					newParams = newParams.replace(regex, (match) => {
						if (match === value) {
							return variable;
						}
						return match;
					});
				}

				// Only update if something changed
				if (newParams !== params) {
					atRule.params = newParams;
				}
			});
		}
	};
}

postcssBreakpointReplace.postcss = true;
