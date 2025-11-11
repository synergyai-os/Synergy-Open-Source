import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

	kit: {
		adapter: adapter({
			includeFiles: ['marketing-docs/**', 'dev-docs/**']
		}),
		alias: {
			$convex: './convex'
		},
		paths: {
			relative: false // Required for PostHog session replay to work correctly
		}
	}
};

export default config;
