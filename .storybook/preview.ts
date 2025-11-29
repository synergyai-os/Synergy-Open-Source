import type { Preview } from '@storybook/svelte';
import { withThemeByClassName } from '@storybook/addon-themes';

// Import global styles (includes design tokens)
// Updated to use modular architecture (SYOS-553)
import '../src/styles/app.css';

// Import Storybook-specific CSS overrides (fixes code block readability)
import './storybook-overrides.css';

// Measure iframe content height and communicate to parent
if (typeof window !== 'undefined') {
	// Function to measure the actual component wrapper and report height
	const measureAndReportHeight = () => {
		// Wait for next frame to ensure Svelte has rendered
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				// Try multiple selectors to find the content wrapper
				const wrapper =
					document.querySelector('[data-storybook-wrapper="true"]') ||
					document.querySelector('#storybook-root > div') ||
					document.querySelector('#root > div') ||
					document.querySelector('body > div:first-child');

				let contentHeight = 0;
				let source = 'unknown';

				if (wrapper) {
					// Measure the wrapper's actual rendered height
					contentHeight = Math.max(
						wrapper.scrollHeight,
						wrapper.offsetHeight,
						wrapper.getBoundingClientRect().height
					);
					source = wrapper.getAttribute('data-storybook-wrapper')
						? 'decorator'
						: 'fallback-element';
				} else {
					// Fallback: measure body/html
					const body = document.body;
					const html = document.documentElement;
					contentHeight = Math.max(
						body.scrollHeight,
						body.offsetHeight,
						html.clientHeight,
						html.scrollHeight,
						html.offsetHeight
					);
					source = 'body';
				}

				// Add 24px to the bottom as requested
				const totalHeight = contentHeight + 24;

				console.log(`[Storybook] Measured height from ${source}:`, contentHeight, 'px');
				console.log('[Storybook] Total height (with 24px bottom):', totalHeight, 'px');

				// Debug: log what elements we found
				if (!document.querySelector('[data-storybook-wrapper="true"]')) {
					console.log('[Storybook] Debug - Available elements:', {
						storybookRoot: !!document.querySelector('#storybook-root'),
						root: !!document.querySelector('#root'),
						bodyChildren: document.body?.children?.length || 0,
						firstBodyChild: document.body?.children?.[0]?.tagName || 'none'
					});
				}

				// Send height to parent (Storybook manager frame)
				if (window.parent && window.parent !== window) {
					window.parent.postMessage({ type: 'storybook-iframe-resize', height: totalHeight }, '*');
				}
			});
		});
	};

	// Measure on load and when content changes - retry multiple times
	let retryCount = 0;
	const maxRetries = 30; // Increased retries for Svelte hydration
	const tryMeasure = () => {
		// Always measure - we have fallbacks now
		measureAndReportHeight();

		// But keep retrying to catch when decorator appears (Svelte hydration can be slow)
		if (retryCount < maxRetries) {
			retryCount++;
			setTimeout(tryMeasure, 200);
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			// Wait for Svelte to hydrate, then start measuring
			setTimeout(() => {
				measureAndReportHeight();
				setTimeout(tryMeasure, 500);
			}, 500);
		});
	} else {
		// Already loaded, wait for Svelte hydration
		setTimeout(() => {
			measureAndReportHeight();
			setTimeout(tryMeasure, 500);
		}, 500);
	}

	// Also measure when content changes (e.g., dropdowns open, components update)
	// Wait for body to exist before setting up observer
	const setupObserver = () => {
		if (document.body && document.body instanceof Node) {
			const observer = new MutationObserver(() => {
				// Debounce measurements
				clearTimeout(window._storybookResizeTimeout);
				window._storybookResizeTimeout = setTimeout(measureAndReportHeight, 50);
			});
			observer.observe(document.body, { childList: true, subtree: true, attributes: true });
		} else {
			// Retry if body not ready yet
			setTimeout(setupObserver, 50);
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupObserver);
	} else {
		setupObserver();
	}

	// Measure on resize
	window.addEventListener('resize', () => {
		clearTimeout(window._storybookResizeTimeout);
		window._storybookResizeTimeout = setTimeout(measureAndReportHeight, 50);
	});
}

// Import decorators
import FullHeightDecorator from './FullHeightDecorator.svelte';

const preview: Preview = {
	decorators: [
		withThemeByClassName({
			themes: {
				light: 'light',
				dark: 'dark'
			},
			defaultTheme: 'light' // Start with light theme (switches when user clicks theme switcher)
		}),
		// Full-height wrapper ensures stories use full available space with breathing room
		() => ({
			Component: FullHeightDecorator
		})
	],
	globalTypes: {
		theme: {
			description: 'Global theme for components',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: [
					{ value: 'light', title: 'Light', icon: 'sun' },
					{ value: 'dark', title: 'Dark', icon: 'moon' }
				],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		theme: 'light' // Start with light theme by default
	},
	parameters: {
		layout: 'fullscreen', // Fullscreen layout - components render at actual size (not centered/small)
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
				// iframeHeight removed - using dynamic sizing based on content
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
