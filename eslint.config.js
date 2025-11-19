import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import noCrossModuleImports from './eslint-rules/no-cross-module-imports.js';

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
			'dev-docs/**',
			'marketing-docs/**',
			'ai-content-blog/**'
		]
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			synergyos: {
				rules: {
					'no-cross-module-imports': noCrossModuleImports
				}
			}
		},
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
			'synergyos/no-cross-module-imports': 'error'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
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
			'@typescript-eslint/no-unused-vars': 'warn'
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
		// Relax rules for usePermissions (Convex API types are complex)
		files: ['src/lib/composables/usePermissions.svelte.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
);
