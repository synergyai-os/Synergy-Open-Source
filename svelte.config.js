import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
	
	kit: {
		adapter: adapter({
			pages: 'www',
			assets: 'www',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		paths: {
			relative: false // Required for PostHog session replay to work correctly
		}
	}
};

export default config;
