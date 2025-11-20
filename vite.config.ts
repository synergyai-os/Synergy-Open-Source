import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
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
	resolve: {
		alias: {
			// SvelteKit aliases for Vitest support
			$convex: path.resolve(__dirname, './convex'),
			$tests: path.resolve(__dirname, './tests')
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
