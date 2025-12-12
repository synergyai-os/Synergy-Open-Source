import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
// TEMPORARILY DISABLED: Plugin causes ESLint to hang - investigating performance issue
// import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import svelteConfig from './svelte.config.js';
import noCrossModuleImports from './eslint-rules/no-cross-module-imports.js';
import noFeatureComponentsInComponents from './eslint-rules/no-feature-components-in-components.js';
import noHardcodedDesignValues from './eslint-rules/no-hardcoded-design-values.js';
import noLegacyAuthPatterns from './eslint-rules/no-legacy-auth-patterns.js';
import noThrowNewError from './eslint-rules/no-throw-new-error.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		ignores: [
			'www/**',
			'ios/App/App/public/**',
			'convex/_generated/**',
			'.svelte-kit/**',
			'node_modules/**',
			'ai-docs/**',
			'dev-docs/**',
			'marketing-docs/**',
			'ai-content-blog/**',
			'storybook-static/**',
			'.storybook/**'
		]
	},
	{
		files: [
			'src/**/*.ts',
			'src/**/*.js',
			'src/**/*.svelte',
			'src/**/*.svelte.ts',
			'src/**/*.svelte.js'
		],
		rules: {
			'synergyos/no-throw-new-error': 'error'
		}
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			synergyos: {
				rules: {
					'no-cross-module-imports': noCrossModuleImports,
					'no-feature-components-in-components': noFeatureComponentsInComponents,
					'no-hardcoded-design-values': noHardcodedDesignValues,
					'no-legacy-auth-patterns': noLegacyAuthPatterns,
					'no-throw-new-error': noThrowNewError
				}
			}
			// TEMPORARILY DISABLED: Plugin causes ESLint to hang - investigating performance issue
			// ,'better-tailwindcss': eslintPluginBetterTailwindcss
		},
		// TEMPORARILY DISABLED: Plugin causes ESLint to hang
		// settings: {
		// 	'better-tailwindcss': {
		// 		// Tailwind CSS 4: path to the entry file of the CSS-based Tailwind config
		// 		entryPoint: 'src/app.css'
		// 	}
		// },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Enforce no explicit any types (except in test files and specific exclusions)
			'@typescript-eslint/no-explicit-any': 'error',
			// Ignore variables prefixed with underscore (common convention for intentionally unused vars)
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			// Enforce module boundaries - prevent cross-module imports
			// Modules should communicate via API contracts, not direct imports
			// See: dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
			'synergyos/no-cross-module-imports': 'error',
			// Enforce component workspace - prevent feature components in @components
			// Only atomic building blocks (atoms, molecules, organisms) belong in @components
			// Feature components belong in modules
			// See: dev-docs/2-areas/design/component-architecture.md
			'synergyos/no-feature-components-in-components': 'error',
			// Design System Governance: Block hardcoded design values
			// Enforces design token usage for dimensions, colors, opacity, spacing, typography
			// See: dev-docs/2-areas/design/design-tokens.md
			// See: .cursor/rules/design-tokens-enforcement.mdc
			'synergyos/no-hardcoded-design-values': 'error'
			// Design System Governance: Block hardcoded Tailwind values (e.g., min-h-[2.75rem])
			// Use design tokens instead (e.g., min-h-button)
			// See: dev-docs/2-areas/design/design-tokens.md
			// TEMPORARILY DISABLED: Plugin causes ESLint to hang - investigating performance issue
			// 'better-tailwindcss/no-restricted-classes': [
			// 	'error',
			// 	{
			// 		restrict: [
			// 			{
			// 				// Block arbitrary values like [2.75rem], [12px], [#fff]
			// 				// Pattern matches [value] but NOT variants like hover:[value]
			// 				pattern: '^\\[([^\\[\\]]*?)\\](?!:)',
			// 				message:
			// 					'Hardcoded Tailwind value detected. Use design tokens instead (e.g., min-h-[2.75rem] → min-h-button). See: dev-docs/2-areas/design/design-tokens.md'
			// 			}
			// 		]
			// 	}
			// ],
			// Enforce consistent class order (readability)
			// TEMPORARILY DISABLED: Plugin causes ESLint to hang
			// 'better-tailwindcss/sort-classes': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				// TEMPORARILY DISABLED: projectService causes ESLint to hang - investigating performance issue
				// projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			// Disabled: Rule doesn't recognize resolveRoute() wrapper function.
			// All navigation uses resolveRoute() from $lib/utils/navigation.ts which wraps SvelteKit's resolve().
			// This is a known limitation of the ESLint rule - it can't verify wrapper functions across module boundaries.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Allow @html in markdown rendering files - HTML is sanitized via sanitizeHtml() before rendering
		files: [
			'src/routes/dev-docs/notes/**/*.svelte',
			'src/routes/marketing-docs/**/*.svelte',
			'src/routes/dev-docs/**/*.svelte'
		],
		rules: {
			'svelte/no-at-html-tags': 'off'
		}
	},
	{
		// Relax rules for test files
		files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', 'e2e/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'synergyos/no-throw-new-error': 'off',
			// Allow hardcoded values in test files (ESLint allows it for test mocks)
			'better-tailwindcss/no-restricted-classes': 'off',
			'synergyos/no-hardcoded-design-values': 'off'
		}
	},
	{
		// Stories/docs/backups are allowed to use raw throws (storybook/testing fixtures)
		files: [
			'**/*.stories.*',
			'**/*.mdx',
			'**/*.backup',
			'**/__fixtures__/**/*',
			'**/fixtures/**/*',
			'**/__snapshots__/**/*'
		],
		rules: {
			'synergyos/no-throw-new-error': 'off'
		}
	},
	{
		// Backend/server and tooling: design tokens and Svelte rules do not apply
		files: [
			'convex/**/*.{ts,js}',
			'scripts/**/*.{ts,js}',
			'scripts/**/*.{mjs,cjs}',
			'scripts/**/*.{tsx,jsx}'
		],
		rules: {
			'synergyos/no-hardcoded-design-values': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'no-useless-escape': 'off',
			'synergyos/no-legacy-auth-patterns': 'error'
		}
	},
	{
		// Relax rules for permissions test page (intentional any types for demo)
		files: ['src/routes/settings/permissions-test/**/*.svelte'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn'
		}
	},
	{
		// Org-chart module: D3/SVG layout calculations use computed pixel values, not design tokens
		// These are mathematical layout values for circle packing, not CSS styling
		files: ['src/lib/modules/org-chart/**/*.{ts,js,svelte}', 'src/lib/utils/orgChartTransform.ts'],
		rules: {
			'synergyos/no-hardcoded-design-values': 'off'
		}
	},
	{
		// Relax rules for usePermissions (Convex API types are complex)
		files: ['src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
);
