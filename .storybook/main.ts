import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: [
		'../src/**/*.stories.@(js|jsx|ts|tsx|svelte)',
		'../src/**/*.mdx', // Include MDX docs from src directory
		'../.storybook/**/*.mdx' // Include MDX docs from .storybook directory
	],
	addons: [
		'@storybook/addon-svelte-csf',
		'@storybook/addon-docs' // Docs rendering (already installed)
		// Note: @storybook/addon-essentials and @storybook/addon-a11y not available for Storybook 10.0.8 yet
		// Will add back when packages are available or use alternative approach
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	},
	staticDirs: ['../static'] // Serve static files (logo, etc.)
};

export default config;
