import type { StorybookConfig } from '@storybook/sveltekit';
import remarkGfm from 'remark-gfm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
	stories: [
		'../src/**/*.stories.@(js|jsx|ts|tsx|svelte)',
		'../src/**/*.mdx', // Include MDX docs from src directory (includes src/stories/)
		// Exclude empty story files (components commented out, no actual stories)
		'!../src/lib/modules/meetings/components/CreateMeetingModal.stories.svelte',
		'!../src/lib/modules/meetings/components/AgendaItemView.stories.svelte',
		'!../src/lib/modules/meetings/components/AttendeeSelector.stories.svelte',
		'!../src/lib/modules/meetings/components/DecisionsList.stories.svelte',
		'!../src/lib/modules/meetings/components/SecretarySelector.stories.svelte',
		'!../src/lib/modules/meetings/components/SecretaryConfirmationDialog.stories.svelte'
	],
	managerHead: (head) => `
		${head}
		<style>
			/* Dynamic iframe sizing - iframe height adjusts to component content + 24px */
			/* Note: JavaScript will override these - CSS is just initial cleanup */
			.docs-story div[style*="height: 100px"],
			.docs-story div[style*="height:100px"] {
				/* JavaScript will set specific height, so this is just fallback */
			}
		</style>
		<script>
			// Track which iframes we've set up observers for
			const observedWrappers = new WeakSet();
			
			// Store target heights for each wrapper
			const wrapperHeights = new WeakMap();
			
			// Function to resize a specific iframe wrapper - with MutationObserver to prevent resets
			function resizeIframeWrapper(wrapper, iframe, height) {
				if (wrapper && iframe) {
					const newHeight = height + 'px';
					wrapperHeights.set(wrapper, height);
					
					// Remove any existing height declaration and add new one
					let currentStyle = wrapper.getAttribute('style') || '';
					currentStyle = currentStyle
						.replace(/height\s*:\s*[\d.]+px\s*!important;?/gi, '')
						.replace(/height\s*:\s*[\d.]+px;?/gi, '')
						.trim();
					
					// Add new height with !important to override Storybook
					const newStyle = currentStyle 
						? (currentStyle.endsWith(';') ? currentStyle : currentStyle + ';') + ' height: ' + newHeight + ' !important;'
						: 'height: ' + newHeight + ' !important;';
					
					// Set via multiple methods to ensure it sticks
					wrapper.setAttribute('style', newStyle);
					wrapper.style.setProperty('height', newHeight, 'important');
					wrapper.style.height = newHeight;
					
					// Set iframe height
					iframe.style.height = newHeight;
					iframe.style.minHeight = newHeight;
					
					// Set up MutationObserver to watch for Storybook resetting the height
					if (!observedWrappers.has(wrapper)) {
						observedWrappers.add(wrapper);
						
						const observer = new MutationObserver(() => {
							const targetHeight = wrapperHeights.get(wrapper);
							if (!targetHeight) return;
							
							const currentHeight = wrapper.style.height;
							const styleAttr = wrapper.getAttribute('style') || '';
							const heightMatch = styleAttr.match(/height:\s*([\d.]+)px/);
							const attrHeight = heightMatch ? heightMatch[1] + 'px' : null;
							
							// If Storybook reset it to 100px/60px or removed our height, restore it
							if (currentHeight === '100px' || currentHeight === '60px' || 
							    (attrHeight && (attrHeight === '100px' || attrHeight === '60px')) ||
							    (!currentHeight && styleAttr.includes('width: 100%') && !styleAttr.includes('!important'))) {
								
								// Restore our height immediately
								const restoreHeight = targetHeight + 'px';
								let restoreStyle = wrapper.getAttribute('style') || '';
								restoreStyle = restoreStyle
									.replace(/height\s*:\s*[\d.]+px\s*!important;?/gi, '')
									.replace(/height\s*:\s*[\d.]+px;?/gi, '')
									.trim();
								restoreStyle = restoreStyle 
									? (restoreStyle.endsWith(';') ? restoreStyle : restoreStyle + ';') + ' height: ' + restoreHeight + ' !important;'
									: 'height: ' + restoreHeight + ' !important;';
								
								wrapper.setAttribute('style', restoreStyle);
								wrapper.style.setProperty('height', restoreHeight, 'important');
								wrapper.style.height = restoreHeight;
								iframe.style.height = restoreHeight;
								
								console.log('[Storybook Manager] Prevented height reset, restored to:', targetHeight, 'px');
							}
						});
						
						observer.observe(wrapper, {
							attributes: true,
							attributeFilter: ['style'],
							attributeOldValue: false
						});
						
						console.log('[Storybook Manager] Set up MutationObserver for wrapper, target height:', height, 'px');
					}
					
					console.log('[Storybook Manager] Resized iframe wrapper to:', height, 'px');
				}
			}
			
			// Listen for height messages from iframe content and resize accordingly
			window.addEventListener('message', (event) => {
				if (event.data && event.data.type === 'storybook-iframe-resize') {
					// Find the iframe that sent the message
					document.querySelectorAll('.docs-story iframe').forEach((iframe) => {
						try {
							if (iframe.contentWindow === event.source) {
								// Try multiple selector patterns to find the wrapper
								const wrapper = iframe.parentElement ||
									iframe.closest('div[style*="width: 100%"]') ||
									iframe.closest('.docs-story > div > div > div > div > div > div') ||
									iframe.closest('.docs-story > div');
								
								if (wrapper) {
									// Height already includes 24px from iframe measurement
									const newHeight = event.data.height;
									resizeIframeWrapper(wrapper, iframe, newHeight);
								}
							}
						} catch (e) {
							console.warn('[Storybook Manager] Error resizing iframe:', e);
						}
					});
				}
			});
			
			// Fallback: Try direct measurement if postMessage doesn't work
			function resizeIframesFallback() {
				document.querySelectorAll('.docs-story iframe').forEach((iframe) => {
					// Try multiple selector patterns to find the wrapper
					const wrapper = iframe.parentElement ||
						iframe.closest('div[style*="width: 100%"]') ||
						iframe.closest('.docs-story > div > div > div > div > div > div') ||
						iframe.closest('.docs-story > div');
					
					if (!wrapper) return;
					
					// Check if wrapper has default 100px height or no height set
					const currentHeight = wrapper.style.height || wrapper.getAttribute('style')?.match(/height:\s*(\d+px)/)?.[1];
					if (currentHeight === '100px' || !currentHeight || currentHeight === '60px') {
						const tryMeasureIframe = () => {
							try {
								const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
								if (iframeDoc && iframeDoc.body) {
									// Wait a bit for Svelte to hydrate
									setTimeout(() => {
										// Try multiple selectors to find content
										const contentWrapper = iframeDoc.querySelector('[data-storybook-wrapper="true"]') ||
											iframeDoc.querySelector('#storybook-root > div') ||
											iframeDoc.querySelector('#root > div') ||
											iframeDoc.querySelector('body > div:first-child') ||
											iframeDoc.body;
										
										if (contentWrapper) {
											const contentHeight = Math.max(
												contentWrapper.scrollHeight,
												contentWrapper.offsetHeight,
												contentWrapper.getBoundingClientRect().height,
												iframeDoc.body.scrollHeight,
												iframeDoc.documentElement.scrollHeight
											);
											
											// Only resize if content is taller than current height
											if (contentHeight > 0) {
												const newHeight = contentHeight + 24;
												resizeIframeWrapper(wrapper, iframe, newHeight);
												console.log('[Storybook Manager] Fallback resize to:', newHeight, 'px');
											}
										}
									}, 300);
								}
							} catch (e) {
								// Cross-origin or other error - skip this iframe
								console.warn('[Storybook Manager] Cannot access iframe content:', e.message);
							}
						};
						
						// Try immediately if iframe is already loaded
						if (iframe.complete && iframe.contentDocument) {
							tryMeasureIframe();
						} else {
							// Wait for iframe to load
							iframe.addEventListener('load', tryMeasureIframe, { once: true });
						}
					}
				});
			}
			
			// Run fallback on page load and continuously check for new iframes
			const runFallback = () => {
				resizeIframesFallback();
				// Keep checking periodically for new iframes and to catch resets
				setTimeout(runFallback, 300);
			};
			
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', () => {
					setTimeout(runFallback, 200);
				});
			} else {
				setTimeout(runFallback, 200);
			}
			
			// Watch for new iframes being added to the DOM
			const setupManagerObserver = () => {
				if (document.body && document.body instanceof Node) {
					const observer = new MutationObserver(() => {
						// Debounce to avoid too many calls
						clearTimeout(window._storybookResizeTimeout);
						window._storybookResizeTimeout = setTimeout(() => {
							resizeIframesFallback();
						}, 100);
					});
					observer.observe(document.body, { 
						childList: true, 
						subtree: true,
						attributes: true,
						attributeFilter: ['style']
					});
					
					console.log('[Storybook Manager] Set up DOM observer for new iframes');
				} else {
					setTimeout(setupManagerObserver, 50);
				}
			};
			
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', setupManagerObserver);
			} else {
				setupManagerObserver();
			}
		</script>
	`,
	addons: [
		'@storybook/addon-svelte-csf',
		'@storybook/addon-themes',
		// Note: @storybook/addon-essentials and @storybook/addon-a11y not available for Storybook 10.0.8 yet
		// Will add back when packages are available or use alternative approach
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm]
					}
				}
			}
		},
		'@chromatic-com/storybook'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	staticDirs: ['../static'], // Serve static files (logo, etc.)
	async viteFinal(config) {
		// Option B: Mock composables directly - bypasses Convex entirely
		const mockConvexPath = path.resolve(__dirname, './mocks/convex.ts');
		const mockConvexSveltePath = path.resolve(__dirname, './mocks/convex-svelte.ts');
		const mockAppEnvPath = path.resolve(__dirname, './mocks/app-environment.ts');
		const mockUseActionItemsPath = path.resolve(__dirname, './mocks/useActionItems.svelte.ts');
		const mockUseActionItemsFormPath = path.resolve(
			__dirname,
			'./mocks/useActionItemsForm.svelte.ts'
		);

		if (config.resolve) {
			// Option B: Mock composables directly
			// Use OBJECT format and place mocks LAST to override SvelteKit defaults
			const existingAliases = Array.isArray(config.resolve.alias)
				? config.resolve.alias.reduce(
						(acc, { find, replacement }) => ({
							...acc,
							[typeof find === 'string' ? find : find.toString()]: replacement
						}),
						{} as Record<string, string>
					)
				: config.resolve.alias || {};

			// Override with mocks - object keys later in spread override earlier ones
			config.resolve.alias = {
				...existingAliases,
				// CRITICAL: Mock composables - components import these
				'$lib/modules/meetings/composables/useActionItems.svelte': mockUseActionItemsPath,
				'$lib/modules/meetings/composables/useActionItemsForm.svelte': mockUseActionItemsFormPath,
				// Mock Convex
				'$lib/convex': mockConvexPath,
				'$convex/_generated/api': mockConvexPath,
				'$convex/_generated/dataModel': mockConvexPath,
				'$convex/_generated': mockConvexPath,
				$convex: mockConvexPath,
				'convex-svelte': mockConvexSveltePath,
				'$app/environment': mockAppEnvPath
			};

			// Debug: Log final aliases to verify they're applied
			console.log(
				'[Storybook] Final Vite aliases:',
				config.resolve.alias ? Object.keys(config.resolve.alias) : []
			);
		}

		// Add convex directory to fs.allow to prevent "outside allow list" errors
		if (config.server) {
			config.server.fs = config.server.fs || {};
			config.server.fs.allow = [
				...(config.server.fs.allow || []),
				path.resolve(__dirname, '../convex')
			];
		}

		return config;
	}
};

export default config;
