import type { Preview } from '@storybook/svelte';

// Import global styles (includes design tokens)
import '../src/app.css';

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
