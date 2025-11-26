import type { Preview } from '@storybook/svelte';

// Import global styles (includes design tokens)
// Updated to use modular architecture (SYOS-553)
import '../src/styles/app.css';

// Import Storybook-specific CSS overrides (fixes code block readability)
import './storybook-overrides.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		},
		docs: {
			toc: true, // Table of contents in docs
			story: {
				inline: false // Disable inline rendering for SvelteKit compatibility
			}
		},
		options: {
			storySort: {
				order: [
					'Docs',
					['Docs', ['Introduction', 'Token Reference']],
					'Design System',
					['Design System', ['Overview', 'Atoms', 'Organisms']],
					['Design System/Atoms', ['*']],
					['Design System/Organisms', ['*']],
					'Modules',
					['Modules', ['*']],
					['Modules/Meetings', ['*']],
					['Modules/OrgChart', ['*']],
					['Modules/Inbox', ['*']],
					'*'
				]
			}
		}
	}
};

export default preview;
