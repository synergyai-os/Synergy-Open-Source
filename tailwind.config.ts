import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{svelte,ts,js,html}',
		// Exclude non-UI tooling and generated/test assets
		'!./scripts/**/*',
		'!./dev-docs/**/*',
		'!./tests/**/*',
		'!./e2e/**/*'
	]
} satisfies Config;
