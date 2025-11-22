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
		}
	}
};

export default preview;
