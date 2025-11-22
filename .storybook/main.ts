import type { StorybookConfig } from '@storybook/sveltekit';
import remarkGfm from 'remark-gfm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
	stories: [
		'../src/**/*.stories.@(js|jsx|ts|tsx|svelte)',
		'../src/**/*.mdx', // Include MDX docs from src directory (includes src/stories/)
		// Exclude empty story files (components commented out, no actual stories)
		'!../src/lib/modules/meetings/components/CreateMeetingModal.stories.svelte',
		'!../src/lib/modules/meetings/components/AgendaItemView.stories.svelte',
		'!../src/lib/modules/meetings/components/AttendeeSelector.stories.svelte',
		'!../src/lib/modules/meetings/components/DecisionsList.stories.svelte',
		'!../src/lib/modules/meetings/components/SecretarySelector.stories.svelte',
		'!../src/lib/modules/meetings/components/SecretaryConfirmationDialog.stories.svelte'
	],
	addons: [
		'@storybook/addon-svelte-csf',
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm]
					}
				}
			}
		}
		// Note: @storybook/addon-essentials and @storybook/addon-a11y not available for Storybook 10.0.8 yet
		// Will add back when packages are available or use alternative approach
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	staticDirs: ['../static'], // Serve static files (logo, etc.)
	async viteFinal(config) {
		// Option B: Mock composables directly - bypasses Convex entirely
		const mockConvexPath = path.resolve(__dirname, './mocks/convex.ts');
		const mockConvexSveltePath = path.resolve(__dirname, './mocks/convex-svelte.ts');
		const mockAppEnvPath = path.resolve(__dirname, './mocks/app-environment.ts');
		const mockUseActionItemsPath = path.resolve(__dirname, './mocks/useActionItems.svelte.ts');
		const mockUseActionItemsFormPath = path.resolve(
			__dirname,
			'./mocks/useActionItemsForm.svelte.ts'
		);

		if (config.resolve) {
			// Option B: Mock composables directly
			// Use OBJECT format and place mocks LAST to override SvelteKit defaults
			const existingAliases = Array.isArray(config.resolve.alias)
				? config.resolve.alias.reduce(
						(acc, { find, replacement }) => ({
							...acc,
							[typeof find === 'string' ? find : find.toString()]: replacement
						}),
						{} as Record<string, string>
					)
				: config.resolve.alias || {};

			// Override with mocks - object keys later in spread override earlier ones
			config.resolve.alias = {
				...existingAliases,
				// CRITICAL: Mock composables - components import these
				'$lib/modules/meetings/composables/useActionItems.svelte': mockUseActionItemsPath,
				'$lib/modules/meetings/composables/useActionItemsForm.svelte': mockUseActionItemsFormPath,
				// Mock Convex
				'$lib/convex': mockConvexPath,
				'$convex/_generated/api': mockConvexPath,
				'$convex/_generated/dataModel': mockConvexPath,
				'$convex/_generated': mockConvexPath,
				$convex: mockConvexPath,
				'convex-svelte': mockConvexSveltePath,
				'$app/environment': mockAppEnvPath
			};

			// Debug: Log final aliases to verify they're applied
			console.log(
				'[Storybook] Final Vite aliases:',
				config.resolve.alias ? Object.keys(config.resolve.alias) : []
			);
		}

		// Add convex directory to fs.allow to prevent "outside allow list" errors
		if (config.server) {
			config.server.fs = config.server.fs || {};
			config.server.fs.allow = [
				...(config.server.fs.allow || []),
				path.resolve(__dirname, '../convex')
			];
		}

		return config;
	}
};

export default config;
