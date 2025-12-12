import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { viteBreakpointReplace } from './scripts/vite-breakpoint-replace.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createStripFileLinePlugin = () => ({
	postcssPlugin: 'strip-file-line-selectors',
	Once(root) {
		root.walkRules((rule) => {
			if (/\[file\\:lines?\]/.test(rule.selector)) {
				rule.remove();
			}
		});
	}
});
createStripFileLinePlugin.postcss = true;

const stripFileLineSelectorsPlugin = (): Plugin => {
	const scrub = (code: string) =>
		code
			.replace(/\.\[file\\:lines?\]\{file:lines?;?\}/g, '')
			.replace(/,\s*\.\[file\\:lines?\]/g, '')
			.replace(/\.\[file\\:lines?\]\s*,/g, '');

	return {
		name: 'strip-file-line-selectors',
		enforce: 'post',
		transform(code, id) {
			// Tailwind CSS v4 sometimes runs CSS modules with query params (e.g. ?direct/?inline)
			if (!/\.css($|\?)/.test(id)) return null;
			const cleaned = scrub(code);
			return cleaned === code ? null : { code: cleaned, map: null };
		},
		generateBundle(_, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (fileName.endsWith('.css') && chunk.type === 'asset') {
					const content = chunk.source.toString();
					const cleaned = scrub(content);

					if (cleaned !== content) {
						chunk.source = cleaned;
						console.log(`[strip-file-line-selectors] Cleaned ${fileName}`);
					}
				}
			}
		}
	};
};

export default defineConfig({
	plugins: [
		viteBreakpointReplace() as Plugin, // Replace hardcoded breakpoints in @media queries with token values
		tailwindcss(),
		{
			name: 'redirect-markdown',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Redirect .md URLs to clean URLs (for documentation system)
					if (req.url?.endsWith('.md')) {
						const cleanUrl = req.url.replace(/\.md$/, '');
						res.writeHead(301, { Location: cleanUrl });
						res.end();
						return;
					}
					next();
				});
			}
		},
		stripFileLineSelectorsPlugin(),
		sveltekit()
	],
	server: {
		host: '127.0.0.1', // Use 127.0.0.1 for WorkOS compatibility (not localhost)
		port: 5173,
		strictPort: true, // Fail if port is busy (so you know to kill other processes)
		fs: {
			// Allow Vite to serve files from the convex directory
			allow: ['..']
		}
	},
	// Configure error overlay to stay visible longer
	// Note: Error overlay is controlled by SvelteKit, but we can configure Vite's error handling
	clearScreen: false, // Keep error messages visible in terminal
	resolve: {
		alias: {
			// SvelteKit aliases for Vitest support
			$convex: path.resolve(__dirname, './convex'),
			$tests: path.resolve(__dirname, './tests')
		}
	},
	css: {
		postcss: {
			plugins: [createStripFileLinePlugin()]
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}', 'tests/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: [
						'src/**/*.{test,spec}.{js,ts}', // ✅ Colocated composable tests
						'src/**/__tests__/**/*.{test,spec}.{js,ts}', // ✅ Module test suites
						'tests/**/*.{test,spec}.{js,ts}', // ✅ Centralized tests
						'convex/**/*.test.ts' // ✅ Convex unit tests
					],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'tests/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./vitest-setup-server.ts']
				}
			}
		]
	}
});
